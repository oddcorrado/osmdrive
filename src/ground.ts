import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { ShadowGeneratorSceneComponent } from '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Scene } from '@babylonjs/core/scene'

export default function createGround(scene: Scene) {
    const groundMat: StandardMaterial = new StandardMaterial("groundMat", scene);
    const groundTexture:Texture = new Texture('./textures/ground2.jpeg', scene)
    const ground: Mesh = Mesh.CreateGround("ground1", 1000, 1000, 0, scene);

    groundMat.alpha = 1;
    groundMat.diffuseColor = new Color3(0.3, 0.3, 0.3)
    groundMat.emissiveColor = new Color3(0, 0, 0)

    // groundTexture.vScale = 100
    // groundTexture.uScale = 100
    // groundMat.diffuseTexture = groundTexture
    // groundMat.backFaceCulling = false;

    ground.material = groundMat;


    return ground
}