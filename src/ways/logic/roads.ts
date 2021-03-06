
import { ways } from '../../map'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { scene as globalScene } from '../../index'
import { vectorIntersection } from '../../maths/geometry'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { shadowMapPixelShader } from '@babylonjs/core/Shaders/shadowMap.fragment'
let enableDebug = false

// The node type we use in many structures
interface node {
    point: Vector3 // position
    junctionIndex: number // junction index/id if any
    roadIndex?: number // the road index in the mega roads struct
    laneIndex?: number // the lane index in the road in the mega roads struct
    nodeIndex?: number // the nod eindex in ane index in the road in the mega roads struct
    nodeId?: number // a unique node id
    upwise: boolean // driving direction, upwise => drive from 0 to N
    type?: string // used for intermediate nodes
    nexts?: node[] // where to go from this node
    connections?: node[] // connected nodes
    roadConnectionCount?: number // number of connected roads, used for markings mainly
}



// a simple node structure used at the beginning of the computaiton
interface pathNode {
    point: Vector3
    junctionIndex: number
}

// a simple path used at the beginning of the computaiton
type path = pathNode[]

interface road {
    lanes: lane[]
}

type lane = node[]

// FIXME: bad TS
// TODO: an insertion point ... cannot remember what it is for
interface insertionPoint {
    insertionSegments?: insertionSegment[]
    point?: Vector3
    junctionIndex: number
    junction?: junction
    nodes?: node[]
}

// TODO: an insertion segment ... cannot remember what it is for
interface insertionSegment {
    roadIndex: number
    laneIndex: number
    connections: node[]
    nodeIndexPrev: number
    nodeIndexNext: number
}

const junctions: Vector3[] = []
let paths: path[] = []
export let roads: road[] = []

// these are mostly node references inside the roads that help connect everything together in the end
const unqualifiedIntersections: insertionPoint[] = []
const qualifiedIntersections: insertionPoint[] = []



export default function buildRoads() {
    // We start with ways, a way is built on nodes and indicates the number of lanes
    /* WAYS (x represents a node), '|' and '-' are the 'lines' beween nodes, '.' is nothing
            2 lanes
    ........x........
    ........|........
    x-------x-------x 2 lanes
    .................
    .................
    */
    
    // Find the junctions nodes using geometry, we find out root junctions by comparing node positions
    // The result is stored in rootJunctions
    /* JUNCTIONS
       'j' is a junction node as we can find this node in both ways)
    .................
    .................
    ........j........ 
    .................
    .................
    */
    createJunctions(ways)

    // Create the paths with junctions marked
    // A path is a construct where junction node are explicitely marke
    // Junction index is a junction id based on index inthe junction array
    /* PATHS
       'x' represents a node, 'j' a jucntion node)
            2 lanes
    ........x........
    ........|........
    x-------j-------x 2 lanes
    .................
    .................
    */
    createPaths(ways)

    // Create the roads
    // A road is a construct that contains the explicit lanes and associated nodes
    // It also builds the unqualified intersections
    /* ROADS AND LANES AND UNQUALIFIED INTERSECTIONS
       we build those by orthogonal projections
       'u' is an unqualified intersection node, they are generated by the 'j' node 
    ......x...x......
    ......|...|......
    x-------u-------x
    ......u...u......
    x-------u-------x
    .................
    */
    createRoadsAndUnqualifiedIntersections(paths)

    // Extend temporarly the road ends
    // This is to make sure we do not miss qualified intersections when a way stops at a junctions, like in a 'T' intersection
    /* EXTENDED ROADS
       'e' represents an extension node
    ......x...x......
    ......|...|......
    x-------u-------x
    ......u...u......
    x-------u-------x
    ......e...e......
    */
    extendRoads(roads)

    // nodeIndex "shorthands" inside the nodes are messed up due to node addition
    // recalculate them
    updateNodeIndexes()

    // Using the unqualified intersections create the qualified intersections
    // These contain the true intersections
    /* QUALIFIED INTERSECTIONS
       'q' represents a qualified intesection built using all geometric intersections from unqualified nodes
       that is ['u','x'] segments intersections
    ......x...x......
    .................
    x.....q.u.q.....x
    ......u...u......
    x.....q.u.q.....x
    ......e...e......
    */
    createQualifiedIntersectionNodes() 

    // Insert the qualified intersections inside the roads
    // These contain the true intersections
    /* ROADS WITH QAULIFED INTERSECTIONS
       'q' represents a qualified intesection
    ......x...x......
    ......|...|......
    x-----q-u-q-----x
    ......u...u......
    x-----q-u-q-----x
    ......e...e......
    */
    insertQualifiedIntersectionsInRoads()

    // Remove the dummy nodes from roads (unqualified intersections and extension nodes)
    // These contain the true intersections
    /* ROADS WITH QAULIFED INTERSECTIONS
       'q' represents a qualified intesection
    ......x...x......
    ......|...|......
    x-----q---q-----x
    ......|...|......
    x-----q---q-----x
    .................
    */
    removeDummyNodesInRoads()

    // nodeIndex "shorthands" inside the nodes are messed up due to node addition
    // recalculate them
    updateNodeIndexes()

    // connect the intersection nodes according to upwise values
    // each intersection node contains a next array of allowed nodes
    /* ROADS WITH NEXTS
       '><^v' represents the allowed directions
    ......x...x......
    ......|...^......
    x----<q--<q-----x
    ......v...^......
    x-----q>--q>----x
    .................
    */
    connectIntersectionNodes()

    // Calulate for each node the number of road intersections
    // Used for markings
    calculateRoadIntersectionCounts()
}

interface way {
    points: Vector3 []
}

// Creates an array of root junctions based on point distance
export function createJunctions(ways: way[]) {
    const points = []
    // gather all points
    ways.forEach(way => {
        way.points.forEach(point => points.push(new Vector3(point.x, 0.1, point.y)))
    })

    // for each point find if there are any close point
    // if found add it to the root junction list if not already there
    points.forEach ((point, i) => {
        const close = points.find((check, ii) => point.subtract(check).length() < 0.1 && i !== ii )
        if(close != null) {
            if(junctions.find(junction => close.subtract(junction).length() < 0.1 ) == null) {
                junctions.push(close)
            }
        }
    })

    return junctions
}

// create the paths with junctions marked
// junction index is a junction id based on index inthe junction array
export function createPaths(ways: way[]) {
    const localPaths: path[] = ways.map((way: way) => {
        const nodes: pathNode[] = way.points.map((point: Vector3) => ({
            point: new Vector3(point.x, 0.1, point.y),
            junctionIndex: junctions.findIndex(junction => junction.subtract(new Vector3(point.x, 0.1, point.y)).length() < 0.1)
        }))
        return nodes
    })
    paths = localPaths

    return paths
}

interface junction {
    junction: number
    nodes: node[]
}

function unqualifiedIntersectionInsert(node: node) {
    let junction  = unqualifiedIntersections.find(j => j.junctionIndex === node.junctionIndex)
    if( junction == null) {
        const junction = {
            junctionIndex: node.junctionIndex,
            nodes: [node]
        }
        unqualifiedIntersections.push(junction)
    } else {
        junction.nodes.push(node)
    }
 }

// create the root lanes based on the paths
function createRoadsAndUnqualifiedIntersections(paths: path[]) {
    const up = new Vector3(0, 1, 0)
    const down = new Vector3(0, -1, 0)
    let nodeId = 0;

    roads = paths.map((path: path, roadIndex: number) => {
        const left: node[] = path.map((node: pathNode, nodeIndex: number): node => {
            const index = Math.max(nodeIndex, 1)
            const current = new Vector3(path[index].point.x, path[index].point.y, path[index].point.z)
            const prev = new Vector3(path[index - 1].point.x, path[index - 1].point.y, path[index - 1].point.z)
            const point = node.point.add(current.subtract(prev).cross(up).normalize().scale(2))
            const newNode: node = {
                roadIndex,
                laneIndex: 0,
                point,
                nodeId,
                nodeIndex,
                upwise: false,
                junctionIndex: node.junctionIndex,
                type: node.junctionIndex > 0 ? 'junction:temp' : 'normal'
            }
            if(node.junctionIndex !== -1) {
                unqualifiedIntersectionInsert(newNode)
            }
            return newNode
        })
        nodeId++
        const right = path.map((node: pathNode, nodeIndex: number): node => {
            const index = Math.max(nodeIndex, 1)
            const current = new Vector3(path[index].point.x, path[index].point.y, path[index].point.z)
            const prev = new Vector3(path[index - 1].point.x, path[index - 1].point.y, path[index - 1].point.z)
            const point = node.point.add(current.subtract(prev).cross(down).normalize().scale(2))
            const newNode: node = {
                roadIndex,
                laneIndex: 1,
                point,
                nodeId,
                nodeIndex,
                upwise: true,
                junctionIndex: node.junctionIndex,
                type: node.junctionIndex > 0 ? 'junction:temp' : 'normal'
            }
            if(node.junctionIndex !== -1) {
                unqualifiedIntersectionInsert(newNode)
            }
            return newNode
        })
        return ({lanes: [left, right]})
    })
}

// extend a road segment (two nodes) by scale
// retruns a new node
function extendSegment(n1: node, n2: node, scale: number): node{
    const v = new Vector3(n2.point.x - n1.point.x, n2.point.y - n1.point.y, n2.point.z - n1.point.z)
    const newPoint = new Vector3(n2.point.x, n2.point.y, n2.point.z).add(v.normalize().scale(scale))

    return ({
        point: newPoint,
        nodeId: 556,
        junctionIndex: -1,
        type: 'normal:extension',
        upwise: n1.upwise
    })
}

// extends a lane on  
function extendLane(lane: lane): lane {
    let node0 = extendSegment(lane[1], lane[0], 4)
    let nodeN = extendSegment(lane[lane.length - 2], lane[lane.length - 1], 4)

    lane.push(nodeN)
    lane.unshift(node0)

    return lane
}

// FIXME: bad TS
function extendRoads(lanes) {
    lanes.forEach(lane => {
        lane.lanes[0] = extendLane(lane.lanes[0])
        lane.lanes[1] = extendLane(lane.lanes[1])
    })
    roads = lanes
}

// FIXME: bad TS
function getNodeInLane(roadIndex: number, laneIndex: number, index: number) {
    const road = roads[roadIndex]

    return road.lanes[laneIndex]
}

function laneUpdateNodeIndexes(roadIndex: number, laneIndex: number) {
    const lane: lane = roads[roadIndex].lanes[laneIndex]
    lane.forEach((node, nodeIndex) => {
        node.nodeIndex = nodeIndex
        node.laneIndex = laneIndex
        node.roadIndex = roadIndex
    })
}

function updateNodeIndexes() {
    roads.forEach((road, roadIndex) => {
        road.lanes.forEach((lane, laneIndex) => {
            lane.forEach((node: node, nodeIndex: number) => {
                node.nodeIndex = nodeIndex
                node.laneIndex = laneIndex
                node.roadIndex = roadIndex
            })
        })
    })
}

// IMPROVE ME !!!! NOT SURE THIS IS BULLET PROOF
function bestFit (point: Vector3,  roadIndex: number, laneIndex: number): number {
    const lane = roads[roadIndex].lanes[laneIndex]
    let d = 1000000
    let closest = -1

    for(let i = 0; i < lane.length; i++) {
        const v = point.subtract(lane[i].point)
        if(v.length() < d) {
            d = v.length()
            closest = i
        }
    }

    if(d < 0.0001) { return -1 }

    if(closest === 0) { return 1 }
    if(closest === lane.length - 1) { return lane.length - 2 }

    const p0 = point.subtract(lane[closest - 1].point)
    const p1 = point.subtract(lane[closest].point)

    const n0 = point.subtract(lane[closest].point)
    const n1 = point.subtract(lane[closest + 1].point)

    if(Vector3.Dot(p0, p1) < Vector3.Dot(n0, n1)) {
        return (closest)
    }

    return (closest + 1)
}

function insertQualifiedIntersectionsInRoads() {
    qualifiedIntersections.forEach((insertion, i) => {
        const insertedNodes = []
        insertion.insertionSegments.forEach(segment => {
            const node = {
                roadIndex: segment.roadIndex,
                laneIndex: segment.laneIndex,
                point: insertion.point,
                nodeId: 333,
                nodeIndex:-1,
                upwise: true,
                junctionIndex: insertion.junctionIndex,
                type: 'junction'
            }
            const lane = roads[segment.roadIndex].lanes[segment.laneIndex].concat()
            const insertionIndex = bestFit (node.point, segment.roadIndex, segment.laneIndex)
            if(insertionIndex > 0) {
                node.upwise = lane[insertionIndex - 1].upwise
                lane.splice(insertionIndex, 0, node)
                roads[segment.roadIndex].lanes[segment.laneIndex] = lane
                laneUpdateNodeIndexes(segment.roadIndex, segment.laneIndex)
                insertedNodes.push(node)
            }
        })

        insertedNodes.forEach(node => {
            node.connections = insertedNodes
        })
    })
}

function getNodeInRoad(roadIndex: number, laneIndex: number, nodeIndex: number): node {
    if(nodeIndex < 0) { return null }
    const lane = roads[roadIndex].lanes[laneIndex]
    if(nodeIndex >= lane.length) { return null }
    if(lane[nodeIndex] == null) { console.log(roadIndex, laneIndex, nodeIndex, lane) }
    return lane[nodeIndex]
}

// gets previous and next nodes from a given lane node
// make sure node index are clean before using this
function getPrevNext(node: node): {prev: node, next: node} {
    const prev = getNodeInRoad(node.roadIndex, node.laneIndex, node.nodeIndex - 1)
    const next = getNodeInRoad(node.roadIndex, node.laneIndex, node.nodeIndex + 1)
    return {prev, next}
}



function getInsertionSegment(a1: node, a2: node, b1: node, b2: node): insertionSegment {
    return ({
        roadIndex: a1.roadIndex,
        laneIndex: a1.laneIndex,
        connections: [a1, a2, b1, b2],
        nodeIndexPrev: Math.min(a1.nodeIndex, a2.nodeIndex),
        nodeIndexNext: Math.max(a1.nodeIndex, a2.nodeIndex)
    })
}

function addQualifiedIntersection(a1: node, a2: node, b1: node, b2: node) {
    const point = vectorIntersection(a1.point, a2.point, b1.point, b2.point)
    if(point != null) {
        qualifiedIntersections.push({
            insertionSegments: [
                getInsertionSegment(a1, a2, b1, b2),
                getInsertionSegment(b1, b2, a1, a2)
            ],
            point,
            junctionIndex: a1.junctionIndex,
        })
    }
}

function removeDummyNodesInRoads() {
    roads.forEach(road => {
        road.lanes = road.lanes.map (lane => {
            return lane.filter(node => node.type === 'junction' || node.type === 'normal')
        })
    })
}

function createQualifiedIntersectionsFromNode(node: node, otherNodes: node[]) {
    const { prev, next } = getPrevNext(node)

    if(prev == null || next == null) { console.error("bad node / prev, node, next", prev, node, next); return }
    otherNodes.forEach(other => {
        const { prev: oPrev, next: oNext } = getPrevNext(other)
        if (oPrev == null || oNext == null) { console.error("bad other / prev, other, next", oPrev, other, oNext); return }

        addQualifiedIntersection(node, prev, other, oNext)
        addQualifiedIntersection(node, next, other, oNext)
        addQualifiedIntersection(node, prev, other, oPrev)
        addQualifiedIntersection(node, next, other, oPrev)
    }) 
}

function createQualifiedIntersectionsFromUnqualifiedIntersection(unqualifiedIntersection: insertionPoint) {
    unqualifiedIntersection.nodes.forEach(node => {
        const otherNodes = unqualifiedIntersection.nodes.filter(n => n.nodeId !== node.nodeId)
        createQualifiedIntersectionsFromNode(node, otherNodes)
    })
}

function createQualifiedIntersectionNodes() {
    unqualifiedIntersections.forEach((unqualifiedIntersection) => {
        createQualifiedIntersectionsFromUnqualifiedIntersection(unqualifiedIntersection)
    })
}

function getNodeIndexInLane(roadIndex: number, laneIndex: number, nodeId: number): number {
    const road = roads[roadIndex]

    return road.lanes[laneIndex].findIndex(n => n.nodeId === nodeId)
}

function connectIntersectionNodes() {
    roads.forEach(road => {
        road.lanes.forEach(lane => {
            lane.forEach(node => {
                const nexts = []
                if(node.connections != null) {
                    
                    node.connections.forEach(cx => {
                        if(node.laneIndex === cx.laneIndex && node.roadIndex === cx.roadIndex) { return }
                        if(cx.upwise && cx.nodeIndex < roads[cx.roadIndex].lanes[cx.laneIndex].length - 1) {
                            nexts.push(roads[cx.roadIndex].lanes[cx.laneIndex][cx.nodeIndex + 1])
                        }
                        if(!cx.upwise && cx.nodeIndex > 0) {
                            nexts.push(roads[cx.roadIndex].lanes[cx.laneIndex][cx.nodeIndex - 1])
                        }
                    })

                }
                if(node.upwise && node.nodeIndex < roads[node.roadIndex].lanes[node.laneIndex].length - 1) {
                    nexts.push(roads[node.roadIndex].lanes[node.laneIndex][node.nodeIndex + 1])
                }
                if(!node.upwise && node.nodeIndex > 0) {
                    nexts.push(roads[node.roadIndex].lanes[node.laneIndex][node.nodeIndex - 1])
                }
                node.nexts = nexts
            })
        })
    })
}

function calculateRoadIntersectionCounts() {
    // JunctionIndexToExtraRoadCount
    const ji2erc = new Map<number, number>()

    // got through the path structure
    // for each pathNode check if a junction index is not at the edges of the path
    // if it is not increment its road count in the map
    // x-----j------x => cnt++
    // x-----x------j => do nothing
    paths.forEach((p: path) => {
        p.forEach((pn: pathNode, i: number) => {
            // check if pathNode is not at the edges of the path
            if(i > 0 && i < p.length - 1 && pn.junctionIndex !== -1) {
                let cnt = ji2erc.has(pn.junctionIndex) ? ji2erc.get(pn.junctionIndex) : 0
                ji2erc.set(pn.junctionIndex, cnt + 1)
            }
        })
    })

    // then for each node of the road :
    // if it is not a junction => road count is 2 
    // if it is a junction => road count is 2 plus the number of extra road counts
    roads.forEach(road => {
        road.lanes.forEach(lane => {
            lane.forEach(node => {
                if(node.junctionIndex === -1) {
                    node.roadConnectionCount = 2
                } else {
                    node.roadConnectionCount = ji2erc.has(node.junctionIndex)
                        ? ji2erc.get(node.junctionIndex) + 2
                        : 2
                }
            })
        })
    })
}

export function toggleDebugWays() {
    enableDebug = !enableDebug

    paths.forEach((path, i) => {
        const curve = path.map(n => n.point)
        let li = Mesh.CreateLines('li', curve, globalScene)
        li.position.y = li.position.y + 0.1
        li.color = Color3.Red()
        path.forEach(node => {
            if(node.junctionIndex > 0) {
               // let m = MeshBuilder.CreateSphere("sphere", {diameter: 0.4}, globalScene)
               //  m.position = node.point
            }

        })
    })

    // console.log(roads)
    roads.forEach((road, i) => {
        road.lanes.forEach((lane) => {
            const curve = lane.map(n => n.point)
            let li = Mesh.CreateLines('li', curve, globalScene)
            li.position.y = li.position.y + 0.1
            li.position.y = li.position.y + 0.1
            li.color = Color3.Random()
            lane.forEach((node, j) => {
                const size = node.upwise
                    ? 0.2 + j * 0.05
                    : 0.2 + Math.max(0, 1 - j * 0.05)
                /* if(node.type === "normal") {
                    let m = MeshBuilder.CreateBox("box", {size: 0.2}, globalScene)
                    m.position = node.point
                } */
                /* if(node.type === "junction")*/ {
                    const textureResolution = 512
                    const textureGround = new DynamicTexture("dynamic texture", {width:512, height:256}, globalScene, false)   
                    const textureContext = textureGround.getContext()
                    var materialGround = new StandardMaterial("Mat", globalScene)    				
                    materialGround.diffuseTexture = textureGround
                    
                    var font = "bold 100px monospace"
                    textureGround.drawText(`${node.roadConnectionCount}/${node.laneIndex}/${node.nodeIndex}`, 75, 135, font, "white", "blue", true, true)

                    const m = MeshBuilder.CreateBox("box", {size: 0.4}, globalScene)
                    m.position = node.point
                    m.material = materialGround
                    /* if(j > 0) {
                        const n = lane[j - 1]
                        const mm = MeshBuilder.CreateBox("box", {size: 0.1}, globalScene)
                        const v = n.point.subtract(node.point).normalize().scale(0.3)
                        mm.position = node.point.add(v)
                        mm.position.y = 0.2
                    } */
                    
                    node.nexts.forEach((n) => {
                        // console.log(node, n)
                        const mm = MeshBuilder.CreateBox("box", {size: 0.1}, globalScene)
                        const v = n.point.subtract(node.point).normalize()
                        mm.position = node.point.add(v)
                        mm.position.y = 0.2
                        
                    }) 
                }
                /* if(node.type === "junction:temp") {
                    let m = MeshBuilder.CreateBox("box", {size: 2}, globalScene)
                    m.position = node.point
                }
                if(node.type === "normal:extension") {
                    let m = MeshBuilder.CreateBox("box", {size: 3}, globalScene)
                    m.position = node.point
                } */
            })
        })
    })

    qualifiedIntersections.forEach(intersection => {
        // console.log(intersection)
        //let m = MeshBuilder.CreateBox("sphere", {size: 0.5}, globalScene)
        //m.position = intersection.point
    })
}
