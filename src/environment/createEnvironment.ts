import { Vector3, Vector2, Color3, Color4 } from "@babylonjs/core/Maths/math"
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Scene } from "@babylonjs/core/scene"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from "@babylonjs/core/Materials/Textures/texture"

const createCountry = (zone: Vector3[], scene: Scene, groundMat: StandardMaterial) => {
    if(zone){
        let ground = MeshBuilder.CreatePolygon("polygon", {shape: zone}, scene);
        ground.position.y += 0.1
        ground.material = groundMat
    }
}


const createSidewalk = (zone: Vector3[], scene: Scene, walkMat: StandardMaterial, sideMat: Color4[]) => {
    let roof: Vector3[]
    if (zone){
        roof = zone.map(x => new Vector3(x._x, x._y + 0.3, x._z))
       let sides = MeshBuilder.CreateRibbon("sidewalk", { pathArray: [zone, roof], closeArray: true, closePath:true, colors:sideMat, sideOrientation: 3 },  scene)
        //let full = [...roof, ...zone]
       let walk = MeshBuilder.CreatePolygon("polygon", {shape: zone}, scene)
       //let sides = MeshBuilder.CreatePolygon("polygon", {shape: full}, scene)
        walk.position.y += 0.4
        walk.material = walkMat
        //sides.material = sideMat
    }
}

export const createEnvironment = (scene: Scene, zones: Vector3[][]) => {
    let walkMat = new StandardMaterial("mat", scene)
    //walkMat.backFaceCulling = false
    let groundMat = walkMat.clone('ground')
    let sideMat = walkMat.clone('side')
    const walkTexture = new Texture('./textures/walk.jpg', scene)
    const groundTexture = new Texture('./textures/grass.jpg', scene)
  //  const sideTexture = new Texture('./textures/sidewalk.jpg', scene)
    groundTexture.vScale = 50
    groundTexture.uScale = 50
    walkTexture.vScale = 30
    walkTexture.uScale = 30
    walkMat.diffuseTexture = walkTexture
    groundMat.diffuseTexture = groundTexture
    sideMat.diffuseColor = new Color3(0.5, 0.52, 0.55)
    sideMat.emissiveColor = new Color3(0.5, 0.52, 0.55)
    let color: Color4[]
    for (let i = 0; i <= zones.length[1]*2; i++){
        color.push(new Color4(0.5, 0.52, 0.55, 0))
    }
        
    //sideMat.diffuseTexture = sideTexture
    for (let i = 0; i<= zones.length; i++){
        let type = Math.random() * 2 | 0
        console.log(type)
      if (type === 0 ){//country
        createSidewalk(zones[i], scene, walkMat, color)
    } else { 
        createCountry(zones[i], scene, groundMat)
        }   
    }
}