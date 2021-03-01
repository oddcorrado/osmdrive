import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function createFreeCamera(scene, canvas){
    var freecamera = new FreeCamera("free_camera", new Vector3(0, 10, -30), scene);

    freecamera.position = new Vector3(20,10,-1);//debug traffic light
    //freecamera.position = new Vector3(-86,10,-102);//debug stop
    //freecamera.position = new Vector3(0,10,-0);//default pos car
    freecamera.attachControl(canvas, true);   
    return freecamera;
}
