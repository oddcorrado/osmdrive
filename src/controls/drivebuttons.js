import { Vector3 } from '@babylonjs/core/Maths/math';
import { Camera } from '@babylonjs/core/Cameras/camera';
import {buttonDriveCreator, divCreator} from '../creators/buttoncreator'

export default function createButtons (scene){
    var accel = buttonDriveCreator('z-index: 10; bottom: 2rem; right: 3.5vw; height:8rem; width: 8rem; display: none;',{style: 'height: 9rem; width: 9rem;', id:'accelerator',img: '../images/gas2.svg'});
    var brake = buttonDriveCreator('z-index: 10; bottom: 2rem; right: 14vw; height:6rem; width: 6rem;display: none;',{style: 'height: 6rem; width: 6rem;', id:'brake', img: '../images/brake2.svg'});
    var wheel = buttonDriveCreator('z-index: 0;bottom: 1rem; right: 78vw; height:12rem; width: 12rem;', {style: 'height: 12rem', id: 'wheel', img: '../images/steerwheel2.svg'})
    var dashboard = buttonDriveCreator('z-index: 0; bottom: -2rem; right: 40vw; height: 8rem; width: 12rem;', {style: 'height: 6rem;', id: 'dash', img: '../images/dashboard2.png'});
    var rev = buttonDriveCreator('z-index: 10;bottom: -8.5rem; right: 0.5vw; height:12rem; opacity: 0.7;', {style: 'height: 3rem', id: 'rev', img: '../images/reverse.png'})
    var left = buttonDriveCreator('opacity: 0.7; z-index: 10; top: 54vh; right: 14vw; height: 5rem;display: none;', {style: 'height: 6rem', id: 'left', img: '../images/left.svg'});
    var right = buttonDriveCreator('opacity: 0.7; z-index: 10; top: 54vh; right: 5vw; height: 5rem;display: none;', {style: 'height: 6rem', id: 'right', img: '../images/right.png'});
    var touchZone = divCreator('opacity: 0.7; z-index: 10; top: 55vh; right: 5vw; height: 5rem; width: 18.5vw; display: none;', {id: 'touchzone', text:''})
    var wheelZone = divCreator('opacity: 0.7; z-index: 10; top: 55vh; right: 75.5vw; height: 44vh; width: 24vw; display: block;', {id: 'wheelzone', text:''})
    var btnDivArray = [accel, brake, wheel, dashboard, left, right, touchZone, /*wheelZone*/, rev];

    btnDivArray.forEach(btn => {
        document.body.appendChild(btn);
    })

    // DeviceOrientationEvent.requestPermission()
    window.addEventListener("contextmenu", function(e) { e.preventDefault(); })//debug to deactivate right click menu ontouch
    
    accel.addEventListener('touchstart', function (){
        accel.style.transform = 'rotate3d(1, 0, 0, 45deg)';
     })

     accel.addEventListener('touchend', function (){
        accel.style.transform = 'rotate3d(1, 0, 0, 0deg)';
     })
    
     brake.addEventListener('touchstart', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 45deg)';
    })

    brake.addEventListener('touchend', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 0deg)';
    })

    wheelZone.addEventListener('touchmove', function(e){
        var posX = e.targetTouches[0].clientX - (wheelZone.offsetLeft + (wheelZone.offsetWidth / 2))
        var posY = e.targetTouches[0].clientY - (wheelZone.offsetTop + (wheelZone.offsetHeight / 2))
       // console.log(posX+posY);
        //console.log(pos, e.targetTouches[0])
        //scene.activeCamera.lockedTarget = new Vector3(e.targetTouches[0].clientX - pos, 6, 50);
    })

    touchZone.addEventListener('touchmove', function(e){
        var pos = touchZone.offsetLeft + (touchZone.offsetWidth / 2)

        scene.activeCamera.lockedTarget = new Vector3(e.targetTouches[0].clientX - pos, 6, 50);
    })

    touchZone.addEventListener('touchend', function(e){
        scene.activeCamera.lockedTarget = new Vector3(0, 6, 50);
    })

    rev.addEventListener('touchstart', function (){
        rev.style.opacity = rev.style.opacity === '1' ? '0.7' : '1';
    })
}