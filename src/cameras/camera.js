import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3, Viewport } from '@babylonjs/core/Maths/math'

export default function createCamera(scene, canvas, mode = 0) {
    let camera;
    if (mode == 0){ //External
        camera = new DeviceOrientationCamera("DevOr_externalcamera", new Vector3(0, 6,-15), scene)
        camera.checkCollisions = true
        scene.activeCamera.lockedTarget = new Vector3(0, -6, 50)
   } else { //Internal
        camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 2.2, -1.7), scene)
        camera.lockedTarget =  new Vector3(0, -7, 50) 
   }
  
    return camera
}

export function createCameras(scene, canvas){
    //let camera1 = new FreeCamera("cam1", new Vector3(0, 3,0.1), scene)
    let camera1 = new FreeCamera("cam1", new Vector3(0, 3,0.4), scene)
    let camera2 = new FreeCamera("cam2", new Vector3(0, 3.4,-2), scene)
    let freecamera = new FreeCamera("cam2", new Vector3(0, 10, 0), scene)
    let camera3 = new FreeCamera("cam2", new Vector3(0, 3.4,-2), scene)
    let camera4 = new FreeCamera("cam2", new Vector3(0, 3.4,-2), scene)

    freecamera.attachControl(canvas, true)
    camera1.viewport = new Viewport(0,0, 1, 1)
    //camera2.viewport = new Viewport(0.372, 0.855, 0.255, 0.13)
    camera2.viewport = new Viewport(0.302, 0.748, 0.396, 0.25)
    // camera3.viewport = new Viewport(0.05, 0.75, 0.20, 0.15)
    // camera4.viewport = new Viewport(0.75, 0.75, 0.20, 0.15)
    
    camera2.rotation.x = Math.PI
    // camera3.rotation.y = -Math.PI/5*4
    // camera4.rotation.y = Math.PI/5*4
    scene.activeCameras.push(camera1)
    scene.activeCameras.push(camera2)
    // scene.activeCameras.push(camera3)
    // scene.activeCameras.push(camera4)

    return [camera1, freecamera]
}