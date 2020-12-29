import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createFreeCamera(scene, canvas){
    var freecamera = new FreeCamera("free_camera", new Vector3(0, 10, -30), scene);

    freecamera.position = new Vector3(-10,10,-30);
    // freecamera.angularSensibility = 3;
    // freecamera.moveSensibility = 3;
    freecamera.attachControl(canvas, true);   
    return freecamera;
}
