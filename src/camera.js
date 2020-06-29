import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createCamera(scene, canvas) {
    // This creates and positions a free camera (non-mesh)
    var camera = new FreeCamera("camera1", new Vector3(0, 1, 0), scene);

    // This creates and positions a device orientation camera 	
    // var camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 3, -5), scene);

    // This targets the camera to scene origin
    camera.setTarget(new Vector3(0, 0, 50))

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    return camera
}

