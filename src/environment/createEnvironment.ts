import { Vector3, Vector2, Color3, Color4 } from "@babylonjs/core/Maths/math"
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Scene } from "@babylonjs/core/scene"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from "@babylonjs/core/Materials/Textures/texture"
import {setStatus} from '../index'


function textureCreator(scene: Scene, source:string, uS:number, vS:number){
    const tmpTxtur = new Texture(source, scene)

    tmpTxtur.uScale = uS
    tmpTxtur.vScale = vS

    return tmpTxtur
}

function fillCollection(scene: Scene){
    const textureCollection = [
        textureCreator(scene, '../textures/building/texture1.jpg', 10, 1),
        textureCreator(scene, '../textures/building/texture2.jpg', 10, 1),
        textureCreator(scene, '../textures/building/texture3.jpg', 10, 1),
        textureCreator(scene, '../textures/building/texture4.jpg', 10, 1) 
    ]    
    return textureCollection
}

export function materialCreator(scene, name){
    const tmpMat = new StandardMaterial(name, scene);
    tmpMat.alpha = 1;
    tmpMat.diffuseColor = new Color3(1, 1, 1);
    tmpMat.emissiveColor = new Color3(1, 1, 1);
    tmpMat.backFaceCulling = false
    return tmpMat;
}

export function createTextureCollection (scene) {
    let matTab = []
    let textureCollection = fillCollection(scene)
    textureCollection.forEach((texture, i = 0)  => {
        matTab.push(materialCreator(scene, `mat${i}`))
        matTab[i].diffuseTexture = textureCollection[i]
    })

    return matTab
}


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

let offsetWalk = 5
let i = 0
const spawnSingleRandomBuilding = (pointsRaw: Vector3[], scene: Scene, collection: StandardMaterial[]) => {
    let floor: Vector3[] = []
    let top:Vector3[] = []
    let positions: number[] = []
    let keep: number[] = []
    let maxX: number = null
    let maxZ: number = null
    let minX: number = null
    let minZ: number = null
    let points = pointsRaw.filter(vec => vec.x%1 === 0 && vec.y%1)
    let max = points.length

    for (let i = 0; i < max; i++){positions.push(i)}
    for (let i = 0; i < 4; i++){
        keep.push(positions.splice(Math.random() * (max-i) | 0, 1).pop()) 
        maxX = maxX ? points[keep[i]].x > maxX ? points[keep[i]].x : maxX : points[keep[i]].x
        maxZ = maxZ ? points[keep[i]].z > maxZ ? points[keep[i]].z : maxZ : points[keep[i]].z
        minX = minX ? points[keep[i]].x < minX ? points[keep[i]].x : minX : points[keep[i]].x
        minZ = minZ ? points[keep[i]].z < minZ ? points[keep[i]].z : minZ : points[keep[i]].z
    }
    points.filter((point, i = 0) => {
        if (keep.includes(i)){
            let x = point.x === maxX ? point.x - offsetWalk : point.x === minX ? point.x + offsetWalk : point.x
            let z = point.z === maxZ ? point.z - offsetWalk : point.z === minZ ? point.z + offsetWalk : point.z
            
            floor.push(new Vector3(x, point.y, z))
            top.push(new Vector3(x, point.y + 20, z))
            return true;
        }
    })

    let building = MeshBuilder.CreateRibbon('newbuilding', {pathArray: [floor, top], closePath: true}, scene)
    building.material = collection[Math.random() * collection.length | 0]
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