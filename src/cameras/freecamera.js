import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createFreeCamera(scene, canvas){
    var freecamera = new FreeCamera("free_camera", new Vector3(-10, 10, -30), scene);

    freecamera.setTarget(Vector3.Zero());
    freecamera.position = new Vector3(-10,10,-30);
    freecamera.attachControl(canvas, true);   
    return freecamera;
}
