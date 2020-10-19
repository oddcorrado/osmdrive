
import { ways } from './map'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Path3D } from '@babylonjs/core/Maths/math.path'
import textPanel from './textPanel'
import { ColorCurves } from '@babylonjs/core/Materials/colorCurves'
import { scene as globalScene } from './index'
// import { Quaternion } from '@babylonjs/core/Maths/math'


var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}
function segmentIntersection(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
    if (isNaN(x)||isNaN(y)) {
        return false
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false}
        } else {
            if (!between(x1, x, x2)) {return false}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false}
        } else {
            if (!between(y1, y, y2)) {return false}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false}
        } else {
            if (!between(x3, x, x4)) {return false}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false}
        } else {
            if (!between(y3, y, y4)) {return false}
        }
    }
    return {x: x, y: y}
}

function vectorIntersection(v1, v2, u1, u2) {
    const x1 = v1.x
    const y1 = v1.z
    const x2 = v2.x
    const y2 = v2.z
    const x3 = u1.x
    const y3 = u1.z
    const x4 = u2.x
    const y4 = u2.z

    const inter = segmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4)
    if(!inter) { return null }

    return new Vector3(inter.x, v1.y, inter.y) // TODO user ratio for ys
}

// console.log("INTER", segment_intersection (-10, -10, 20, 20, -10, 10, 10, -10 ))

const paths = []

let enableDebug = false

export default function createWays(scene, planes) {
    const roadMat = new StandardMaterial("mat2", scene);
    roadMat.alpha = 1;
    roadMat.diffuseColor = new Color3(0.5, 0.5, 0.5)
    roadMat.specularColor = new Color3(0, 0, 0)
    roadMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
    roadMat.backFaceCulling = false
    const roadTexture = new Texture('./road.png', scene)
    roadTexture.vScale = 1
    roadTexture.uScale = 20
    roadMat.diffuseTexture = roadTexture

    // find the junctions
    createRootJunctions(ways)

    // create the root paths
    rootPaths = createRootPaths(ways)

    // create the lanes
    roads = createRoads(rootPaths)

    // update the root lanes junctions
    // projectJunctions(roads)
    roads = extendroads(roads)
    updateNodeIndexes()
    createAllIntersectionNodes() 
    // processInsertionNodes()

    // remove old junctions from root lanes

    ways.forEach(way => {
        const points = way.points.map( point => new Vector3(point.x, 0.1, point.y))
        const path3D = new Path3D(points);
        const normals = path3D.getNormals();
        const curve = path3D.getCurve();
        

        const left = curve.map ((p,i) => p.add(normals[i].scale(4)))
        const right = curve.map ((p,i) => p.subtract(normals[i].scale(4)))

        const pathLeft3D = new Path3D(left.concat())
        const pathRight3D = new Path3D(right.concat().reverse())

        pathLeft3D.type = 'left'
        pathRight3D.type = 'right'
        paths.push(pathLeft3D)
        paths.push(pathRight3D)
        
        // lines.push(MeshBuilder.CreateLines("ways", {points: curve}, scene))
        // lines.push(MeshBuilder.CreateLines("ways", {points: left}, scene))
        // lines.push(MeshBuilder.CreateLines("ways", {points: right}, scene))
        const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray: [right, left] },  scene )
        ribbon.material = roadMat
        textPanel(scene, way.name, curve[0].x, 10, curve[0].z, planes)
        // ribbon.receiveShadows = true;
    })
}


// ***** LOGICAL WAYS
// ***** TO MOVE IN A SEPARATE FILE

const rootJunctions = []
let rootPaths = []
let roads = []
let rootLaneJunctions = []
let intersectionNodes = []
let rootLaneProjections = []
const rootIntersections = []

// Creates an array of root junctions based on point distance
function createRootJunctions(ways) {
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
            if(rootJunctions.find(junction => close.subtract(junction).length() < 0.1 ) == null) {
                rootJunctions.push(close)
            }
        }
    })
}

// create the root path with junctions marked
// juunction index is a junction id based on index inthe junction array
function createRootPaths(ways) {
    const paths = ways.map(way => {
        const nodes = way.points.map(point => ({
            point: new Vector3(point.x, 0.1, point.y),
            junctionIndex: rootJunctions.findIndex(junction => junction.subtract(new Vector3(point.x, 0.1, point.y)).length() < 0.1)
        }))
        return nodes
    })
    return paths
}

function rootLaneJunctionInsert(node) {
    let junction = rootLaneJunctions.find(j => j.junctionIndex === node.junctionIndex)
    if( junction == null) {
        const junction = {
            junctionIndex: node.junctionIndex,
            nodes: [node]
        }
        rootLaneJunctions.push(junction)
    } else {
        junction.nodes.push(node)
    }
 }

// create the root lanes based on the paths
function createRoads(paths) {
    const up = new Vector3(0, 1, 0)
    const down = new Vector3(0, -1, 0)
    let nodeId = 0;

    const lanes = paths.map((path, roadIndex) => {
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
                junctionIndex: node.junctionIndex
            }
            if(node.junctionIndex !== -1) {
                rootLaneJunctionInsert(newNode)
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
                junctionIndex: node.junctionIndex
            }
            if(node.junctionIndex !== -1) {
                rootLaneJunctionInsert(newNode)
            }
            return newNode
        })
        return ({lanes: [left, right]})
    })
    return lanes
}

function extendSegment(n1, n2, scale) {
    const v = new Vector3(n2.point.x - n1.point.x, n2.point.y - n1.point.y, n2.point.z - n1.point.z)
    const newPoint = new Vector3(n2.point.x, n2.point.y, n2.point.z).add(v.normalize().scale(scale))

    return ({
        point: newPoint,
        nodeId: 556,
        junctionIndex: -1
    })
}

function extendLane(lane) {
    let node0 = extendSegment(lane[1], lane[0], 4)
    let nodeN = extendSegment(lane[lane.length - 2], lane[lane.length - 1], 4)

    lane.push(nodeN)
    lane.unshift(node0)

    return lane
}

function extendroads(lanes) {
    lanes.forEach(lane => {
        lane.lanes[0] = extendLane(lane.lanes[0])
        lane.lanes[1] = extendLane(lane.lanes[1])
    })
    return lanes
}


function createIntersectionNodesFromNodeSegment(segment, otherSegments) {
    otherSegments.forEach(otherSegment => {
        const inter = vectorIntersecton(segment[0], segment[1], otherSegment[0], otherSegment[1])

        if(inter != null) {
            rootIntersections.push(inter)
        }
    })
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

function processInsertionNodes() {
    console.log(intersectionNodes)
    intersectionNodes.forEach(insertion => {
        console.log("******")
        console.log(insertion)
        insertion.insertionSegments.forEach(segment =>{
            const node = {
                roadIndex: segment.roadIndex,
                laneIndex: segment.laneIndex,
                point: insertion.point,
                nodeId: 333,
                nodeIndex:-1,
                upwise: true,
                junctionIndex: -2
            }
            console.log("******")
            console.log(roads[segment.roadIndex].lanes[segment.laneIndex])
            const lane = roads[segment.roadIndex].lanes[segment.laneIndex].concat()
            lane.splice(segment.nodeIndexPrev + 1, 0, node)
            console.log(lane)
            roads[segment.roadIndex].lanes[segment.laneIndex] = lane
            laneUpdateNodeIndexes(segment.roadIndex, segment.laneIndex)
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

function addIntersection(a1, a2, b1, b2) {
    const point = vectorIntersection(a1.point, a2.point, b1.point, b2.point)
    if(point != null) {
        intersectionNodes.push({
            insertionSegments: [
                getInsertionSegment(a1, a2, b1, b2),
                getInsertionSegment(b1, b2, a1, a2)
            ],
            point
        })
    }
}

function createIntersectionNodesFromNode(node, otherNodes) {
    const { prev, next } = getPrevNext(node)

    if(prev == null || next == null) { console.error("bad node / prev, node, next", prev, node, ext); return }
    otherNodes.forEach(other => {
        const { prev: oPrev, next: oNext } = getPrevNext(other)
        if (oPrev == null || oNext == null) { console.error("bad other / prev, other, next", oPrev, other, oNext); return }

        addIntersection(node, prev, other, oNext)
        addIntersection(node, next, other, oNext)
        addIntersection(node, prev, other, oPrev)
        addIntersection(node, next, other, oPrev)
    }) 
}

function createIntersectionNodesFromJunction(junction) {
    junction.nodes.forEach(node => {
        const otherNodes = junction.nodes.filter(n => n.nodeId !== node.nodeId)
        createIntersectionNodesFromNode(node, otherNodes)
    })
}

function createAllIntersectionNodes() {
    rootLaneJunctions.forEach((junction, junctionIndex) => {
        createIntersectionNodesFromJunction(junction)
    })
}

function getNodeIndexInLane(roadIndex, laneIndex, nodeId) {
    const road = roads[roadIndex]

    return road.lanes[laneIndex].findIndex(n => n.nodeId === nodeId)
}


//
function getInterPos(curr, next){
    var xD = next.x - curr.x;
    var yD = next.y - curr.y;
    var dist = Math.sqrt(Math.pow(xD, 2) + Math.pow(yD, 2));
    var fract = 20 / dist;
    
    var newp = (xD > yD ? {
        xR: (curr.x + xD * fract) + 8,
        yR: (curr.y + yD * fract),
        xL: (curr.x + xD * fract) - 8,
        yL: (curr.y + yD * fract)
    } : {
        xR: (curr.x + xD * fract),
        yR: (curr.y + yD * fract) + 8,
        xL: (curr.x + xD * fract),
        yL: (curr.y + yD * fract) - 8
    })
    return newp;
}

function getSideforTrees(ways){
    var options = {
        diameterTop:2, 
        diameterBottom: 2, 
        height: 80, 
        tessellation: 10, 
        subdivisions: 1
    }
    console.log(ways);
    var tmpway;
    ways.forEach(way => {
    for (var i = 1; i < way.points.length-1; i++){
            var currentP = way.points[i]
            var nextP = way.points[i+1]
            console.log(nextP);
            var posTab = getInterPos(currentP, nextP);
            //console.log(posTab);
           var Lcol = new MeshBuilder.CreateCylinder('test', options);
           var Rcol = new MeshBuilder.CreateCylinder('test', options);

            Lcol.position = new Vector3(posTab['xL'], 1, posTab['yL']);
            Rcol.position = new Vector3(posTab['xR'], 1, posTab['yR']);
        }
    })
}

function distanceToCurve(position, path) {
    const pointOnCurve = path.getPointAt(path.getClosestPositionTo(position))

    return (position.subtract(pointOnCurve).length())
}

export function getWayDir(position) {
    let first = 1000000000
    let second = 1000000000
    let third = 1000000000
    let index = -1

    paths.forEach((path, i) => {
        const d = distanceToCurve(position, path)
        if (d < first) {
            index = i
            third = second
            second = first
            first = d
        }
    })

    // if(third - first < 30) { index = - 1 }
    // console.log(third - first, first, second, third)
    if(index !== -1) {
        const path = paths[index]
        return path.getTangentAt(path.getClosestPositionTo(position), true)
    }

    return null
}

export function toggleDebugWays() {
    enableDebug = !enableDebug
console.log(roads)
    rootPaths.forEach((path, i) => {
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

    roads.forEach((road, i) => {
        road.lanes.forEach((lane) => {
            const curve = lane.map(n => n.point)
            let li = Mesh.CreateLines('li', curve, globalScene)
            li.position.y = li.position.y + 0.1
            li.position.y = li.position.y + 0.1
            li.color = Color3.Random()
            lane.forEach(node => {
                if(node.junctionIndex < 0) {
                    //let m = MeshBuilder.CreateBox("box", {size: 0.6}, globalScene)
                    //m.position = node.point
                } else {
                    //let m = MeshBuilder.CreateBox("box", {size: 0.2}, globalScene)
                    //m.position = node.point
                }
            })
        })
    })

    intersectionNodes.forEach(intersection => {
        console.log(intersection)
        let m = MeshBuilder.CreateBox("sphere", {size: 0.5}, globalScene)
        m.position = intersection.point
    })

    rootLaneProjections.forEach(node => {
       // let m = MeshBuilder.CreateSphere("sphere", {radius: 0.7}, globalScene)
       // m.position = node.point
    })
}