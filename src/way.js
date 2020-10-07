
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
    rootLanes = createRootLanes(rootPaths)

    // update the root lanes junctions
    // projectJunctions(rootLanes)

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

const rootJunctions = []
let rootPaths = []
let rootLanes = []
let rootLaneJunctions = []

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

// create the root lanes based on the paths
function createRootLanes(paths) {
    const up = new Vector3(0, 1, 0)
    const down = new Vector3(0, -1, 0)
    let nodeId = 0;

    const lanes = paths.map((path, pathIndex) => {
        const left = path.map((node, nodeIndex) => {
            const index = Math.max(nodeIndex, 1)
            const current = new Vector3(path[index].point.x, path[index].point.y, path[index].point.z)
            const prev = new Vector3(path[index - 1].point.x, path[index - 1].point.y, path[index - 1].point.z)
            const point = node.point.add(current.subtract(prev).cross(up).normalize().scale(2))
            if(node.junctionIndex !== -1) {
                rootLaneJunctions.push({
                    laneIndex: pathIndex,
                    nodeId,
                    isLeft: true,
                    junctionIndex: node.junctionIndex
                })
            }
            return ({
                point,
                nodeId,
                junctionIndex: node.junctionIndex
            })
        })
        nodeId++
        const right = path.map((node, nodeIndex) => {
            const index = Math.max(nodeIndex, 1)
            const current = new Vector3(path[index].point.x, path[index].point.y, path[index].point.z)
            const prev = new Vector3(path[index - 1].point.x, path[index - 1].point.y, path[index - 1].point.z)
            const point = node.point.add(current.subtract(prev).cross(down).normalize().scale(2))
            if(node.junctionIndex !== -1) {
                rootLaneJunctions.push({
                    laneIndex: pathIndex,
                    nodeId,
                    isLeft: false,
                    junctionIndex: node.junctionIndex
                })
            }
            return ({
                point,
                nodeId,
                junctionIndex: node.junctionIndex
            })
        })
        return ({left, right})
    })
    return lanes
}

function getNodeIndexInLane(laneIndex, isLeft, nodeId) {
    const path = rootLanes[laneIndex]
    const lane = isLeft ? path.left : path.right
    let node = null

    return lane.findIndex(n => n.nodeId === nodeId)
}

function getNodeInLane(laneIndex, isLeft, index) {
    const path = rootLanes[laneIndex]
    const lane = isLeft ? path.left : path.right
    let node = null

    return lane[index]
}

// DEBUG ME
function projectJunctions(lanes) {
    console.log("PROJECT", rootLaneJunctions)
    lanes.forEach((lane, laneIndex) => {
        lane.left.forEach((node) => {
            if(node.junctionIndex != -1) {
                const siblings = rootLaneJunctions.filter( j => 
                    j.junctionIndex === node.junctionIndex
                    && (!j.isLeft
                    || j.laneIndex !== laneIndex))
                console.log("PROJECT", node.junctionIndex, laneIndex, siblings)
                siblings.forEach(s => {
                    const index = getNodeIndexInLane(s.laneIndex, s.isLeft, s.nodeId)
                    if(index !== -1 && index < lanes[s.laneIndex].left.length - 1) {
                        console.log("PROJECT", s.laneIndex, s.isLeft, index)
                        const sNode = getNodeInLane(s.laneIndex, s.isLeft, index)
                        const sNodeN = getNodeInLane(s.laneIndex, s.isLeft, index + 1)

                        const u = new Vector3(sNodeN.point.x - sNode.point.x, sNodeN.point.y - sNode.point.y, sNodeN.point.z - sNode.point.z)
                        const v = new Vector3(node.point.x - sNode.point.x, node.point.y - node.point.y, node.point.z - node.point.z)

                        const dot = Vector3.Dot(u, v)

                        const tx = u.scale(Math.sqrt(Math.abs(dot)) / u.length())

                        const newVector = tx.add(new Vector3(sNode.point.x, sNode.point.y, sNode.point.w))
                        const newNode = {
                            point : { x: newVector.x, y: newVector.y, z: newVector.z },
                            nodeId : 33,
                            junctionIndex: node.junctionIndex
                        }

                        console.log("PROJECT", sNode, newNode, sNodeN)
                    }
                    
                })
            }
        })
    })
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

    rootPaths.forEach((path, i) => {
        console.log(path._curve)
        const curve = path.map(n => n.point)
        let li = Mesh.CreateLines('li', curve, globalScene)
        li.position.y = li.position.y + 0.1
        li.color = Color3.Red()
        path.forEach(node => {
            if(node.junctionIndex > 0) {
                let m = MeshBuilder.CreateSphere("sphere", {radius: 1}, globalScene)
                m.position = node.point
            }

        })
    })

    rootLanes.forEach((lane, i) => {
        const curveLeft = lane.left.map(n => n.point)
        const curveRight = lane.right.map(n => n.point)
        let liLeft = Mesh.CreateLines('li', curveLeft, globalScene)
        let liRight = Mesh.CreateLines('li', curveRight, globalScene)
        liLeft.position.y = liLeft.position.y + 0.1
        liRight.position.y = liRight.position.y + 0.1
        liLeft.color = Color3.Blue()
        liRight.color = Color3.Green()
        /* path.forEach(node => {
            if(node.junctionIndex > 0) {
                let m = MeshBuilder.CreateSphere("sphere", {radius: 1}, globalScene)
                m.position = node.point
            }
        }) */
    })
}