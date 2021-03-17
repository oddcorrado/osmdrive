import { Vector3 } from '@babylonjs/core/Maths/math';
import { Camera } from '@babylonjs/core/Cameras/camera';
import {divCreator, buttonDriveCreator} from '../creators/buttoncreator'
import {tapButtonCreator, dashboardCreator, viewZoneCreator, viewCreator, wheelCreator, wheelLockedCreator, blinkerCreator, speedButtonCreator, centralMirrorCreator} from '../creators/UIElementsCreator'

export default function createButtons (scene){
    var rev = buttonDriveCreator('z-index: 10;bottom: 0.5rem; right: 0.5rem; height:2rem; opacity: 0.7;', {style: 'height: 2rem;', id: 'rev', img: '../images/reverse.png'});
    document.body.insertAdjacentHTML('afterbegin', viewZoneCreator());
    //document.body.insertAdjacentHTML('afterbegin', wheelCreator());
    //document.body.insertAdjacentHTML('afterbegin', wheelLockedCreator());
    document.body.insertAdjacentHTML('afterbegin', tapButtonCreator());
    document.body.insertAdjacentHTML('afterbegin', blinkerCreator());
    document.body.insertAdjacentHTML('afterbegin', dashboardCreator());

    document.body.insertAdjacentHTML('afterbegin', speedButtonCreator());
    document.body.insertAdjacentHTML('afterbegin', viewCreator());
    document.body.insertAdjacentHTML('afterbegin', centralMirrorCreator());

    var speedDiv = document.getElementById('speeddiv');
        window.addEventListener("contextmenu", function(e) { e.preventDefault(); 
    })//debug to deactivate right click menu ontouch
}