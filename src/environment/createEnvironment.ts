import { Vector3, Vector2, Color3, Color4 } from "@babylonjs/core/Maths/math"
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Scene } from "@babylonjs/core/scene"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from "@babylonjs/core/Materials/Textures/texture"
import {createTextureCollection} from '../textureCollection'
import {materialCreator} from '../building'
import { Material } from "@babylonjs/core/Materials/material"
import {setStatus} from '../index'

const fillAssetsCountry = (zone: Vector3[], scene: Scene) => {
    //spawn between 2 random points 3 times random number of trees
}

const createCountry = (zone: Vector3[], scene: Scene, groundMat: StandardMaterial) => {
    if(zone){
        let ground = MeshBuilder.CreatePolygon("polygon", {shape: zone}, scene);
        ground.position.y += 0.1
        ground.material = groundMat
        fillAssetsCountry(zone, scene)
    }
}

let offsetWalk = 5;
let i = 0
const spawnSingleRandomBuilding = (points: Vector3[], scene: Scene, collection: StandardMaterial[]) => {
    let floor: Vector3[] = []
    let top:Vector3[] = []
    let positions: number[] = []
    let keep: number[] = []
    let maxX: number = null
    let maxZ: number = null
    let max = points.length

    for (let i = 0; i < max; i++){positions.push(i)}
    if (i++ === 0){
        console.log(i, points)
        points.forEach(x => {
            let t = Mesh.CreateCylinder('s', 5, 1,  1,  5, scene)
            t.position = x
        })
    }

    for (let i = 0; i < 4; i++){
        keep.push(positions.splice(Math.random() * (max-i) | 0, 1).pop()) 
        maxX = maxX ? points[keep[i]].x > maxX ? points[keep[i]].x : maxX : points[keep[i]].x
        maxZ = maxZ ? points[keep[i]].z > maxZ ? points[keep[i]].z : maxZ : points[keep[i]].z
    }
    points.filter((point, i = 0) => {
        if (keep.includes(i)){
            let x = point.x < maxX ? point.x + offsetWalk : point.x - offsetWalk
            let z = point.z < maxZ ? point.z + offsetWalk : point.z - offsetWalk
            x = x === maxX ? point.x - offsetWalk : x
            z = z === maxZ ? point.z - offsetWalk : z
            floor.push(new Vector3(x, point.y, z))
            top.push(new Vector3(x, point.y + 20, z))
            return true;
        }
    })
    if ((floor[0].z === floor[1].z  && floor[2].z === floor[3].z && floor[3].z === floor[0].z) || (floor[0].x === floor[1].x && floor[2].x === floor[3].x && floor[3].x === floor[0].x)){
        console.log('WRONG BUILDING',points, maxX, maxZ, floor)
    } else {
        let building = MeshBuilder.CreateRibbon('newbuilding', {pathArray: [floor, top], closePath: true}, scene)
        building.material = collection[Math.random() * collection.length | 0]
    }
}

const spawnBuilding = (from: Vector3, to: Vector3, scene: Scene) => {
    //if (from.x + 10 < to.x && from.z + 10 < to.z){

        //let coord = [from, new Vector3(from.x + 10, from.y, from.z), new Vector3(from.x + 10, from.y, from.z - 10), new Vector3(from.x, from.y, from.z-10)]
        //let building = MeshBuilder.CreateRibbon('newbuilding', {pathArray: coord}, scene)
    //}
}

const citySpawner = (zone: Vector3[], scene: Scene, collection: StandardMaterial[]) => {
    spawnSingleRandomBuilding(zone, scene, collection)
}

const createSidewalk = (zone: Vector3[], scene: Scene, walkMat: StandardMaterial, collection: StandardMaterial[]) => {
    let roof: Vector3[]
    if (zone){
        roof = zone.map(x => new Vector3(x._x, x._y + 0.3, x._z))
       let sides = MeshBuilder.CreateRibbon("sidewalk", { pathArray: [zone, roof], closeArray: true, closePath:true, sideOrientation: 3 },  scene)
        //let full = [...roof, ...zone]
       let walk = MeshBuilder.CreatePolygon("polygon", {shape: zone}, scene)
       //let sides = MeshBuilder.CreatePolygon("polygon", {shape: full}, scene)
        walk.position.y += 0.4
        walk.material = walkMat
        //sides.material = sideMat
        citySpawner(zone, scene, collection)
    }
}

export const createEnvironment = (scene: Scene, zones: Vector3[][]) => {
    let walkMat = new StandardMaterial("mat", scene)
    //walkMat.backFaceCulling = false
    let groundMat = walkMat.clone('ground')
    let sideMat = walkMat.clone('side')
    const walkTexture = new Texture('./textures/walk.jpg', scene)
    const groundTexture = new Texture('./textures/grass.jpg', scene)
    walkTexture.onLoadObservable.add(() => {
        setStatus('walk')
    })
    groundTexture.onLoadObservable.add(() => {
        setStatus('ground')
    })
  //  const sideTexture = new Texture('./textures/sidewalk.jpg', scene)
    groundTexture.vScale = 50
    groundTexture.uScale = 50
    walkTexture.vScale = 30
    walkTexture.uScale = 30
    walkMat.diffuseTexture = walkTexture
    groundMat.diffuseTexture = groundTexture
    sideMat.diffuseColor = new Color3(0.5, 0.52, 0.55)
    sideMat.emissiveColor = new Color3(0.5, 0.52, 0.55)

    let collection: StandardMaterial[] = createTextureCollection(scene)
    //sideMat.diffuseTexture = sideTexture
    for (let i = 0; i<= zones.length; i++){
        let type = Math.random() * 2 | 0
        if (type === 0 ){//country
            createSidewalk(zones[i], scene, walkMat, collection)
        } else { 
            createCountry(zones[i], scene, groundMat)
        }   
    }
    setStatus('randomgen')
}