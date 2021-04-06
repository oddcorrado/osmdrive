import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3, Viewport, Matrix } from '@babylonjs/core/Maths/math'
import { Camera } from '@babylonjs/core/Cameras/camera';
import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { RenderTargetTexture } from '@babylonjs/core/Materials/Textures/renderTargetTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export const createCameras = (scene: Scene, canvas: HTMLElement) => {
    let camera1 = new FreeCamera("cam1", new Vector3(0, 3,0.4), scene)
    let camera2 = new FreeCamera("cam2", new Vector3(0, 3,-3), scene)
    let freecamera = new FreeCamera("freecam", new Vector3(0, 10, 0), scene)

    freecamera.attachControl(canvas, true)
    camera2.rotation.y = Math.PI
    scene.activeCameras.push(camera1)
    return [camera1, freecamera, camera2]
}