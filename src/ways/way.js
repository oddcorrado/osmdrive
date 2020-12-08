
import { ways } from '../map'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Path3D } from '@babylonjs/core/Maths/math.path'
import textPanel from '../textPanel'
import { ColorCurves } from '@babylonjs/core/Materials/colorCurves'
import { scene as globalScene } from '../index'
import buildRoads, { roads } from './logic/roads'

import zoneGet from '../geofind/geozone'
import { geoSegmentsInit, getSegmentGetClosest } from '../geofind/geosegment'
import { checkerDebugSegment } from '../checkers/roadChecker'

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
    buildRoads()
    geoSegmentsInit(roads)

    // remove old junctions from root lanes

    ways.forEach(way => {
        const points = way.points.map( point => new Vector3(point.x, Math.random() * 0.01, point.y))//Math.random to avoid road sparkling
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


function distanceToCurve(position, path) {
    const pointOnCurve = path.getPointAt(path.getClosestPositionTo(position))

    return (position.subtract(pointOnCurve).length())
}

export function getWayDir(position, dir) {

    // console.log(position, getSegmentGetClosest(position))

    checkerDebugSegment(position)
    
    const closest = getSegmentGetClosest(position)

    // return closest != null ? closest.segment.start.subtract(closest.segment.end) : null
    if(closest == null || closest.projection.subtract(position).length() < 0.01) { return null }
    
    if(dir == null || dir.length() < 0.1) { return closest.segment.start.subtract(closest.segment.end)}

    const projectionAlongDirVel = closest.projection.add(dir.scale(0.3))
    const targetDir = projectionAlongDirVel.subtract(position)

    return targetDir
}