import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createFreeCamera(scene, canvas){
    var freecamera = new FreeCamera("free_camera", new Vector3(0, 10, -30), scene);

    freecamera.position = new Vector3(22,20,-100);//debug traffic
    //freecamera.position = new Vector3(-200,20,-140);//debug stop
    freecamera.rotation = new Vector3(0, -Math.PI/2, 0)
    //freecamera.position = new Vector3(0,10,-0);//default pos car
    freecamera.attachControl(canvas, true);   
    return freecamera;
}
