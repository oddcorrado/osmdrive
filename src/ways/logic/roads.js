
import { ways } from '../../map'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Path3D } from '@babylonjs/core/Maths/math.path'
import textPanel from '../../textPanel'
import { ColorCurves } from '@babylonjs/core/Materials/colorCurves'
import { scene as globalScene } from '../../index'
import { vectorIntersection } from '../../maths/geometry'

let enableDebug = false

/*
    ****************
    WAYS
            2
            |
    2-------?------
            |
            |
    
    ****************
    JUNCTIONS


            j 


    
    ****************
    PATHS
            2
            |
    2-------j------
            |
            |

    ****************
    ROADS (AND LANES) with unqualified intersections (unqualifiedIntersections from junctions)
          |   |
          |   |
    --------u--------
          u   u
    --------u--------
          |   |
          |   |

    ****************
    qualified intersections built from unqualified intersections (theay are isolated)


          q   q 

          q   q


    ****************
    ROADS (AND LANES) with qualified intersections inserted
          |   |
          |   |
    ------q-u-q------
          u   u
    ------q-u-q------
          |   |
          |   |

    ****************
    ROADS (AND LANES) with qualified intersections and dummy nodes removed
          |   |
          |   |
    ------q---q------
          |   |
    ------q---q------
          |   |
          |   |

    ****************
    ROADS (AND LANES) with node connections set up
          |   |
          v   ^
    ----<-q-<-q------
          v   ^
    ------q->-q->----
          v   ^
          |   |
*/

export default function buildRoads() {
    // We start with ways, a way is built on nodes and indicates the number of lanes
    
    // Find the junctions nodes using geometry, we find out root junctions by comparing node positions
    // The result is stored in rootJunctions
    createJunctions(ways)

    // Create the paths with junctions marked
    // A path is a construct where junction node are explicitely marke
    // Junction index is a junction id based on index inthe junction array
    createPaths(ways)

    // Create the roads
    // A road is a construct that contains the explicit lanes and associated nodes
    // It also builds the unqualified intersections
    createRoadsAndUnqualifiedIntersections(paths)

    // extend temporarly the road ends
    // this is to make sure we do not miss qualified intersections when a way stops at a junctions
    extendRoads(roads)

    // nodeIndex "shorthands" inside the nodes are messed up due to node addition
    // recalculate them
    updateNodeIndexes()

    // Using the unqualified intersections create the qualified intersections
    // These contain the true intersections
    createQualifiedIntersectionNodes() 

    // Insert the qualified intersections inside the roads
    // These contain the true intersections
    insertQualifiedIntersectionsInRoads()

    // Remove the dummy nodes from roads (unqualified intersections and extension nodes)
    // These contain the true intersections
    removeDummyNodesInRoads()

    // nodeIndex "shorthands" inside the nodes are messed up due to node addition
    // recalculate them
    updateNodeIndexes()

    // connect the intersection nodes according to upwise values
    // each intersection node contains a next array of allowed nodes
    connectIntersectionNodes()
}

const junctions = []
let paths = []
let roads = []
// these are mostly node references inside the roads that help connect everything together
let unqualifiedIntersections = []
let qualifiedIntersections = []

// Creates an array of root junctions based on point distance
function createJunctions(ways) {
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
}

// create the paths with junctions marked
// junction index is a junction id based on index inthe junction array
function createPaths(ways) {
    const localPaths = ways.map(way => {
        const nodes = way.points.map(point => ({
            point: new Vector3(point.x, 0.1, point.y),
            junctionIndex: junctions.findIndex(junction => junction.subtract(new Vector3(point.x, 0.1, point.y)).length() < 0.1)
        }))
        return nodes
    })
    paths = localPaths
}

function unqualifiedIntersectionInsert(node) {
    let junction = unqualifiedIntersections.find(j => j.junctionIndex === node.junctionIndex)
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
function createRoadsAndUnqualifiedIntersections(paths) {
    const up = new Vector3(0, 1, 0)
    const down = new Vector3(0, -1, 0)
    let nodeId = 0;

    roads = paths.map((path, roadIndex) => {
        const left = path.map((node, nodeIndex) => {
            const index = Math.max(nodeIndex, 1)
            const current = new Vector3(path[index].point.x, path[index].point.y, path[index].point.z)
            const prev = new Vector3(path[index - 1].point.x, path[index - 1].point.y, path[index - 1].point.z)
            const point = node.point.add(current.subtract(prev).cross(up).normalize().scale(2))
            const newNode = {
                roadIndex,
                laneIndex: 0,
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
        nodeId++
        const right = path.map((node, nodeIndex) => {
            const index = Math.max(nodeIndex, 1)
            const current = new Vector3(path[index].point.x, path[index].point.y, path[index].point.z)
            const prev = new Vector3(path[index - 1].point.x, path[index - 1].point.y, path[index - 1].point.z)
            const point = node.point.add(current.subtract(prev).cross(down).normalize().scale(2))
            const newNode = {
                roadIndex,
                laneIndex: 1,
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
        return ({lanes: [left, right]})
    })
}

// extend a road segment (two nodes) by scale
// retruns a new node
function extendSegment(n1, n2, scale) {
    const v = new Vector3(n2.point.x - n1.point.x, n2.point.y - n1.point.y, n2.point.z - n1.point.z)
    const newPoint = new Vector3(n2.point.x, n2.point.y, n2.point.z).add(v.normalize().scale(scale))

    return ({
        point: newPoint,
        nodeId: 556,
        junctionIndex: -1,
        type: 'normal:extension'
    })
}

// extends a lane on  
function extendLane(lane) {
    let node0 = extendSegment(lane[1], lane[0], 4)
    let nodeN = extendSegment(lane[lane.length - 2], lane[lane.length - 1], 4)

    lane.push(nodeN)
    lane.unshift(node0)

    return lane
}

function extendRoads(lanes) {
    lanes.forEach(lane => {
        lane.lanes[0] = extendLane(lane.lanes[0])
        lane.lanes[1] = extendLane(lane.lanes[1])
    })
    roads = lanes
}

function getNodeInLane(roadIndex, laneIndex, index) {
    const road = roads[roadIndex]

    return road.lanes[laneIndex]
}

function laneUpdateNodeIndexes(roadIndex, laneIndex) {
    const lane = roads[roadIndex].lanes[laneIndex]
    lane.forEach((node, nodeIndex) => {
        node.nodeIndex = nodeIndex
        node.laneIndex = laneIndex
        node.roadIndex = roadIndex
    })
}

function updateNodeIndexes() {
    roads.forEach((road, roadIndex) => {
        road.lanes.forEach((lane, laneIndex) => {
            lane.forEach((node, nodeIndex) => {
                node.nodeIndex = nodeIndex
                node.laneIndex = laneIndex
                node.roadIndex = roadIndex
            })
        })
    })
}

// IMPROVE ME !!!! NOT SURE THIS IS BULLET PROOF
function bestFit (point,  roadIndex, laneIndex) {
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

function getNodeInRoad(roadIndex, laneIndex, nodeIndex) {
    if(nodeIndex < 0) { return null }
    const lane = roads[roadIndex].lanes[laneIndex]
    if(nodeIndex >= lane.length) { return null }
    if(lane[nodeIndex] == null) { console.log(roadIndex, laneIndex, nodeIndex, lane) }
    return lane[nodeIndex]
}

// gets previous and next nodes from a given lane node
// make sure node index are clean before using this
function getPrevNext(node) {
    const prev = getNodeInRoad(node.roadIndex, node.laneIndex, node.nodeIndex - 1)
    const next = getNodeInRoad(node.roadIndex, node.laneIndex, node.nodeIndex + 1)
    return {prev, next}
}

function getInsertionSegment(a1, a2, b1, b2) {
    return ({
        roadIndex: a1.roadIndex,
        laneIndex: a1.laneIndex,
        connections: [a1, a2, b1, b2],
        nodeIndexPrev: Math.min(a1.nodeIndex, a2.nodeIndex),
        nodeIndexNext: Math.max(a1.nodeIndex, a2.nodeIndex)
    })
}

function addQualifiedIntersection(a1, a2, b1, b2) {
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

function createQualifiedIntersectionsFromNode(node, otherNodes) {
    const { prev, next } = getPrevNext(node)

    if(prev == null || next == null) { console.error("bad node / prev, node, next", prev, node, ext); return }
    otherNodes.forEach(other => {
        const { prev: oPrev, next: oNext } = getPrevNext(other)
        if (oPrev == null || oNext == null) { console.error("bad other / prev, other, next", oPrev, other, oNext); return }

        addQualifiedIntersection(node, prev, other, oNext)
        addQualifiedIntersection(node, next, other, oNext)
        addQualifiedIntersection(node, prev, other, oPrev)
        addQualifiedIntersection(node, next, other, oPrev)
    }) 
}

function createQualifiedIntersectionsFromUnqualifiedIntersection(unqualifiedIntersection) {
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

function getNodeIndexInLane(roadIndex, laneIndex, nodeId) {
    const road = roads[roadIndex]

    return road.lanes[laneIndex].findIndex(n => n.nodeId === nodeId)
}

function connectIntersectionNodes() {
    roads.forEach(road => {
        road.lanes.forEach(lane => {
            lane.forEach(node => {
                if(node.connections != null) {
                    const nexts = []
                    node.connections.forEach(cx => {
                        if(node.laneIndex === cx.laneIndex && node.roadIndex === cx.roadIndex) { return }
                        if(cx.upwise && cx.nodeIndex > 0) {
                            nexts.push(roads[cx.roadIndex].lanes[cx.laneIndex][cx.nodeIndex - 1])
                        }
                        if(!cx.upwise && cx.nodeIndex < roads[cx.roadIndex].lanes[cx.laneIndex].length - 1) {
                            nexts.push(roads[cx.roadIndex].lanes[cx.laneIndex][cx.nodeIndex + 1])
                        }
                    })
                    if(node.upwise && node.nodeIndex > 0) {
                        nexts.push(roads[node.roadIndex].lanes[node.laneIndex][node.nodeIndex - 1])
                    }
                    if(!node.upwise && node.nodeIndex < roads[node.roadIndex].lanes[node.laneIndex].length - 1) {
                        nexts.push(roads[node.roadIndex].lanes[node.laneIndex][node.nodeIndex + 1])
                    }
                    node.nexts = nexts
                }
            })
        })
    })
    console.log("new roads", roads)
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

    console.log(roads)
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
                if(node.type === "junction") {
                    const m = MeshBuilder.CreateBox("box", {size: 0.4}, globalScene)
                    m.position = node.point

                    /* if(j > 0) {
                        const n = lane[j - 1]
                        const mm = MeshBuilder.CreateBox("box", {size: 0.1}, globalScene)
                        const v = n.point.subtract(node.point).normalize().scale(0.3)
                        mm.position = node.point.add(v)
                        mm.position.y = 0.2
                    } */
                    
                    node.nexts.forEach((n) => {
                        
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