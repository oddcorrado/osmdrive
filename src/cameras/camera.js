import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'
export default function createCamera(scene, canvas) {
   
    // This creates and positions a device orientation camera 	
    var camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 6, -14), scene);//vue externe
    //var camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 1.5, 0), scene);//vue interne

    // This targets the camera to scene origin
    camera.setTarget(new Vector3(0, 0, 50))
    camera.lockedTarget = new Vector3(0, -7, 50)//vue externe
    //camera.lockedTarget = new Vector3(0, -5, 70)//vue interne voiture
    // camera.angularSensibility = 10;
    // camera.moveSensibility = 10;

    camera.attachControl(canvas, true);
    // camera.checkCollisions = true;
    // camera.applyGravity = true;
    // camera.ellipsoid = new Vector3(1, 1, 1);

    // This attaches the camera to the canvas
    //camera.attachControl(canvas, true);// this camera doesnt need to move

    return camera
}

