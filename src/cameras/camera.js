import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createCamera(scene, canvas, mode = 0) {
        //var camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(-10, 6, -14), scene);
    if (mode == 0){//External
        var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 3,10), scene);
        camera.lockedTarget = new Vector3(0, 0, 0);

      //  camera.setTarget(new Vector3(0, 0, 50))
        camera.enableHorizontalDragging();
        camera.checkCollisions = true;
        scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
   } else { //internal
    //clio
      var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 1.8, 0), scene);
       camera.lockedTarget = new Vector3(0, -0.4, -7);
       //new settings
       camera.position = new Vector3(-0.64, 3, -1.8);
       camera.lockedTarget =  new Vector3(0, -7, 50);
    // //mustang
    //     var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(-0.64, 3, -1.8), scene);
    //    camera.lockedTarget = new Vector3(0, -7, 50);
    //old
        //  var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 1.5, -0.4), scene);
        //  camera.lockedTarget = new Vector3(0, 0, 50);
        console.log(camera);
   }
    camera.angularSensibility = 10;
    camera.moveSensibility = 10;
    camera.attachControl(canvas, true);
  
    return camera
}

