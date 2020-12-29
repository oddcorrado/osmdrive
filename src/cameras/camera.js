import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createCamera(scene, canvas, mode = 0) {
    if (mode == 0){//External
        var camera = new DeviceOrientationCamera("DevOr_externalcamera", new Vector3(0, 6,-15), scene);
        camera.checkCollisions = true;
        scene.activeCamera.lockedTarget = new Vector3(0, -6, 50);
   } else { //internal
      //mustang
      var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 2.2, -1.7), scene);
      camera.lockedTarget =  new Vector3(0, -7, 50); 
   }
  
    return camera
}
