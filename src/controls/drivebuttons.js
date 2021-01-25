import { Vector3 } from '@babylonjs/core/Maths/math';
import { Camera } from '@babylonjs/core/Cameras/camera';
import {tapButtonCreator, dashboardCreator, buttonDriveCreator, divCreator, viewZoneCreator, wheelCreator} from '../creators/buttoncreator'

export default function createButtons (scene){
    var accel = buttonDriveCreator('z-index: 10; bottom: 2rem; right: 3.5vw; height:8rem; width: 8rem; display: none;',{style: 'height: 9rem; width: 9rem;', id:'accelerator',img: '../images/gas2.svg'});
    var brake = buttonDriveCreator('z-index: 10; bottom: 2rem; right: 14vw; height:6rem; width: 6rem;display: none;',{style: 'height: 6rem; width: 6rem;', id:'brake', img: '../images/brake2.svg'});
    var wheel = buttonDriveCreator('z-index: 0;bottom: 4vh; left: -4vw; height:33vh; width: 33vw;display: none;', {style: 'height: 33vh; width: 33vw; ', id: 'wheel', img: '../images/steerwheel2.svg'})
    //var dashboard = buttonDriveCreator('z-index: 0; bottom: 0vh; right: 35vw; height: 25vh; width: 29vw;', {style: 'height: 25vh; width: 29vw;', id: 'dash', img: '../images/dashboard2.png'});
    var rev = buttonDriveCreator('z-index: 10;bottom: 0.5rem; right: 0.5rem; height:2rem; opacity: 0.7;', {style: 'height: 2rem;', id: 'rev', img: '../images/reverse.png'});
    document.body.insertAdjacentHTML('afterbegin', viewZoneCreator());
    document.body.insertAdjacentHTML('afterbegin', wheelCreator());
    document.body.insertAdjacentHTML('afterbegin', tapButtonCreator());
    document.body.insertAdjacentHTML('afterbegin', dashboardCreator());
    var speedDiv = document.getElementById('speeddiv');

    //var wheelZone = divCreator('opacity: 0.7; z-index: 15; top: 55vh; right: 75.5vw; height: 44vh; width: 24vw; display: block;', {id: 'wheelzone', text:''})
    var btnDivArray = [accel, brake, wheel, dashboard];

    btnDivArray.forEach(btn => {
        document.body.appendChild(btn);
    })

    // DeviceOrientationEvent.requestPermission()
        window.addEventListener("contextmenu", function(e) { e.preventDefault(); 
    })//debug to deactivate right click menu ontouch
    
   
    // wheelZone.addEventListener('touchmove', function(e){
    //     var posX = e.targetTouches[0].clientX - (wheelZone.offsetLeft + (wheelZone.offsetWidth / 2))
    //     var posY = e.targetTouches[0].clientY - (wheelZone.offsetTop + (wheelZone.offsetHeight / 2))
    //     console.log(posX + posY);
    //    // console.log(posX+posY);
    //     //console.log(pos, e.targetTouches[0])
    //     //scene.activeCamera.lockedTarget = new Vector3(e.targetTouches[0].clientX - pos, 6, 50);
    // })

    // rev.addEventListener('touchstart', function (){
    //     rev.style.opacity = rev.style.opacity === '1' ? '0.7' : '1';
    // })
}