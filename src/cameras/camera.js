import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createCamera(scene, canvas, mode = 0) {
        //var camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(-10, 6, -14), scene);
    if (mode == 0){//External
        var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 3,10), scene);
        // camera.lockedTarget = new Vector3(0, 0, 0);

      //  camera.setTarget(new Vector3(0, 0, 50))
        camera.enableHorizontalDragging();
        camera.checkCollisions = true;
        scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
   } else { //internal
      //mustang
      var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 2.2, -1.7), scene);
      camera.lockedTarget =  new Vector3(0, -7, 50); 
   }
  
    return camera
}
