import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createFreeCamera(scene, canvas){
    var freecamera = new FreeCamera("free_camera", new Vector3(0, 10, -30), scene);

    //freecamera.position = new Vector3(22,20,-100);//debug traffic
    freecamera.position = new Vector3(-200,10,-280);//default pos car
    freecamera.rotation = new Vector3(0, -Math.PI/2, 0)
    freecamera.attachControl(canvas, true);   
    return freecamera;
}
