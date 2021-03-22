import { Vector3 } from '@babylonjs/core/Maths/math';
import { Camera } from '@babylonjs/core/Cameras/camera';
import {divCreator, buttonDriveCreator} from '../creators/buttoncreator'
import {tapButtonCreator, dashboardCreator, viewZoneCreator, viewCreator, wheelCreator, wheelLockedCreator, blinkerCreator, speedButtonCreator, centralMirrorCreator} from '../creators/UIElementsCreator'
import { Scene } from '@babylonjs/core/scene';

export default function createButtons (scene: Scene){
    tapButtonCreator()
    dashboardCreator()
    viewZoneCreator()
    viewCreator()
    blinkerCreator()
    //speedButtonCreator()
    centralMirrorCreator()
    //document.body.insertAdjacentHTML('afterbegin', wheelCreator());
    //document.body.insertAdjacentHTML('afterbegin', wheelLockedCreator());
    window.addEventListener("contextmenu", function(e: Event) { e.preventDefault(); 
    })//debug to deactivate right click menu ontouch
}