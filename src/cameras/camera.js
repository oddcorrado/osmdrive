import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createCamera(scene, canvas, mode = 0) {
   if (mode == 0){//External
    var camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 6, -14), scene);

    camera.setTarget(new Vector3(0, 0, 50))
   // camera.lockedTarget = new Vector3(0, -7, 50)
   } else { //internal
    var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 1.5, 0), scene);
    
    camera.setTarget(new Vector3(0, 0, 50))
   // camera.lockedTarget = new Vector3(0, -5, 70)
   }
    
    camera.angularSensibility = 10;
    camera.moveSensibility = 10;

    camera.attachControl(canvas, true);
    // camera.applyGravity = true;
     camera.ellipsoid = new Vector3(1, 1, 1);
    return camera
}

