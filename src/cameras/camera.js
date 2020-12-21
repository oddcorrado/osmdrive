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
      var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(-0.64, 3, -1.8), scene);
      camera.lockedTarget =  new Vector3(0, -7, 50);
      //clio
      // var camera = new DeviceOrientationCamera("DevOr_internalcamera", new Vector3(0, 1.8, 0), scene);
      //  camera.lockedTarget = new Vector3(0, -0.4, -7);
   }
    camera.angularSensibility = 10;
    camera.moveSensibility = 10;
    camera.attachControl(canvas, true);
  
    return camera
}

function createCameraSet(scene, name, position, target){
  var camera = new DeviceOrientationCamera(name, position, scene);

  camera.lockedTarget = target
  return;
}

export function createCameraGroup(scene){
  var cameras = {clio: [], mustang: []};

  cameras.mustang.push(createCameraSet(scene, 'mustangInternal', new Vector3(-0.64, 3, -1.8), new Vector3(0, -7, 50)))
  cameras.mustang.push(createCameraSet(scene, 'mustangExternal',new Vector3(0, 1.8, 0), new Vector3(0, 0, 50)))
  cameras.clio.push(createCameraSet(scene, 'mustangInternal', new Vector3(0, 1.8, 0), new Vector3(0, -0.4, -7)))
  cameras.clio.push(createCameraSet(scene, 'mustangExternal',new Vector3(0, 1.8, 0), new Vector3(0, 0, 50)))
}

