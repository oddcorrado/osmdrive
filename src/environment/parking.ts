import { Scene } from "@babylonjs/core/scene"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Vector3, Color3 } from "@babylonjs/core/Maths/math"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { Texture } from "@babylonjs/core/Materials/Textures/texture"


export const createParking = (scene: Scene) => {
    let park = MeshBuilder.CreateBox('plane', {width: 3, height: 0.2, depth: 7}, scene)
    let mat = new StandardMaterial('matpark', scene)
    mat.emissiveColor = new Color3(0,0,0.4)
    park.position = new Vector3(301.8, 0.2, 300)
    park.material = mat
}