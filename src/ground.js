import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { ShadowGeneratorSceneComponent } from '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { Mesh } from '@babylonjs/core/Meshes/mesh'

export default function createGround(scene) {
    // SHADOWS
    // const shadowGenerator = new ShadowGenerator(8192, dirLight)
    // shadowGenerator.usePoissonSampling = true

    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.alpha = 1;
    groundMat.diffuseColor = new Color3(1, 1, 1)
    groundMat.specularColor = new Color3(0, 0, 0)
    groundMat.emissiveColor = new Color3(0.2, 0.2, 0.2)
    const groundTexture = new Texture('./textures/ground2.jpeg', scene)
    groundTexture.vScale = 100
    groundTexture.uScale = 100
    groundMat.diffuseTexture = groundTexture
    groundMat.backFaceCulling = false;

    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = Mesh.CreateGround("ground1", 1000, 1000, 0, scene);

    // Affect a material
    ground.material = groundMat;

    // ground.receiveShadows = true;

    return ground
}