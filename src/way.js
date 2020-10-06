
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

    createRootJunctions(ways)
    rootPaths = createRootPaths(ways)
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

function createRootJunctions(ways) {
    const points = []
    ways.forEach(way => {
        way.points.forEach(point => points.push(new Vector3(point.x, 0.1, point.y)))
    })

    points.forEach ((point, i) => {
        const close = points.find((check, ii) => point.subtract(check).length() < 0.1 && i !== ii )
        if(close != null) {
            if(rootJunctions.find(junction => close.subtract(junction).length() < 0.1 ) == null) {
                rootJunctions.push(close)
            }
        }
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
//

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
}