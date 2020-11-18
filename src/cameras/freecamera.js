import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createFreeCamera(scene, canvas){
    var freecamera = new FreeCamera("free_camera", new Vector3(0, 0, 0), scene);

    freecamera.setTarget(Vector3.Zero());
    freecamera.attachControl(canvas, true);   
    return freecamera;
}
