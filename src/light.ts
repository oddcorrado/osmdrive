import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { Scene } from '@babylonjs/core/scene'

export default function createLights(scene: Scene) {
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const hemiLight = new HemisphericLight("light1", new Vector3(0, 100, 0), scene)
    const dirLight = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, 0), scene)

    // Default intensity is 1. Let's dim the light a small amount
    hemiLight.intensity = 0
    hemiLight.diffuse = new Color3(0, 0, 0)
    hemiLight.specular = new Color3(0, 0, 0)
    hemiLight.groundColor = new Color3(0.2, 0.2, 1)
    dirLight.intensity = 1
    dirLight.diffuse = new Color3(1, 1, 1)
    dirLight.specular = new Color3(1, 1, 1)
}