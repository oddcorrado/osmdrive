
import { ways } from '../map'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Path3D } from '@babylonjs/core/Maths/math.path'
import { ColorCurves } from '@babylonjs/core/Materials/colorCurves'
import { scene as globalScene } from '../index'
import buildRoads, { roads,markings } from './logic/roads'
import buildPavements from './logic/pavements'
//import buildPavements from '../old/oldPavements'

import zoneGet from '../geofind/geozone'
import { geoSegmentsInit, getSegmentGetClosest } from '../geofind/geosegment'
import { checkerDebugSegment } from '../checkers/roadChecker'
import {createEnvironment} from '../environment/createEnvironment.ts'

const paths = []

let enableDebug = false
//let pavements
export default function createWays(scene, planes) {
    const roadMat = new StandardMaterial("mat2", scene);
    roadMat.alpha = 1;
    roadMat.diffuseColor = new Color3(1, 1, 1)
    roadMat.specularColor = new Color3(1, 1, 1)
    roadMat.emissiveColor = new Color3(1, 1, 1);
    roadMat.backFaceCulling = false
    // const roadTexture = new Texture('./textures/road2.jpeg', scene)//road, road2
    // roadTexture.vScale = 1
    // roadTexture.uScale = 50
    // roadMat.diffuseTexture = roadTexture

    // find the junctions
    buildRoads()
    geoSegmentsInit(roads)
    let pavements = buildPavements()
    createEnvironment(scene, pavements)
    // remove old junctions from root lanes

    ways.forEach(way => {
        const points = way.points.map( point => new Vector3(point.x, Math.random() * (0.4, 0.1), point.y))//Math.random to avoid road sparkling
        const path3D = new Path3D(points);
        const normals = path3D.getNormals();
        const curve = path3D.getCurve();
        

        const left = curve.map ((p,i) => p.add(normals[i].scale(1)))
        const right = curve.map ((p,i) => p.subtract(normals[i].scale(1)))

        
        // const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray: [right, left] },  scene )
        // ribbon.material = roadMat
        // ribbon.receiveShadows = true;
    })

    const markMat = new StandardMaterial("mat2", scene);
    markMat.alpha = 1;
    markMat.emissiveColor = new Color3(1, 1, 1);
    markings.forEach((markRoad,mRIndex) =>{
        // markRoad is the road, it's an array of nodes
        markRoad.forEach((markNode,i) =>{
            // construct the white lane
            if(!markNode.isJunction){
                const plane = MeshBuilder.CreatePlane("plane", {height:1, width: 12});
                plane.position=markNode.point
                plane.rotation.x = Math.PI/2
                plane.material = markMat
                // define next point and get the angle of the line they form
                let nextPoint
                if(i<markRoad.length-1){
                    nextPoint = markRoad[i+1].point
                } else {
                    nextPoint = markRoad[i-1].point
                }
                const diff=markNode.point.subtract(nextPoint)
                const angle=Math.atan2(diff.z,diff.x)
                // give that angle to our marking lane
                plane.rotation.y = -angle
            }
            
        })
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

//export const getPavements = () => pavements