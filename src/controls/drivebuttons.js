import { Vector3 } from '@babylonjs/core/Maths/math';
import { Camera } from '@babylonjs/core/Cameras/camera';
import {buttonDriveCreator, divCreator} from '../creators/buttoncreator'

export default function createButtons (scene){
    var accel = buttonDriveCreator('z-index: 10; bottom: 2rem; right: 3.5vw; height:8rem; width: 8rem; display: none;',{style: 'height: 9rem; width: 9rem;', id:'accelerator',img: '../images/gas2.svg'});
    var brake = buttonDriveCreator('z-index: 10; bottom: 2rem; right: 14vw; height:6rem; width: 6rem;display: none;',{style: 'height: 6rem; width: 6rem;', id:'brake', img: '../images/brake2.svg'});
    var wheel = buttonDriveCreator('z-index: 0;bottom: 1rem; left: 1rem; height:8rem; width: 8rem;', {style: 'height: 8rem; width: 8rem; ', id: 'wheel', img: '../images/steerwheel2.svg'})
    var dashboard = buttonDriveCreator('z-index: 0; bottom: 0rem; right: 20.2rem; height: 5.5rem; width: 6rem;', {style: 'height: 5.5rem;', id: 'dash', img: '../images/dashboard2.png'});
    var rev = buttonDriveCreator('z-index: 10;bottom: 0.5rem; right: 0.5rem; height:2rem; opacity: 0.7;', {style: 'height: 2rem', id: 'rev', img: '../images/reverse.png'})
    var arrows = buttonDriveCreator('opacity: 0.7; z-index: 10; bottom: 8rem; right: 1rem; height: 8rem;display: none;', {style: 'height: 8rem; width: 8rem;', id: 'arrows', img: '../images/arrows.svg'});
    var touchZone = divCreator('opacity: 0.7; z-index: 10; bottom: 10rem; right: 1rem; height: 4rem; width: 19vw; display: none', {id: 'touchzone', text:''})
    var wheelZone = divCreator('opacity: 0.7; z-index: 15; top: 55vh; right: 75.5vw; height: 44vh; width: 24vw; display: block;', {id: 'wheelzone', text:''})
    var btnDivArray = [accel, brake, wheel, dashboard, arrows, touchZone, /*wheelZone*/, rev];
    
    btnDivArray.forEach(btn => {
        document.body.appendChild(btn);
    })

    // DeviceOrientationEvent.requestPermission()
    window.addEventListener("contextmenu", function(e) { e.preventDefault(); 
    })//debug to deactivate right click menu ontouch
    
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
        console.log(posX + posY);
       // console.log(posX+posY);
        //console.log(pos, e.targetTouches[0])
        //scene.activeCamera.lockedTarget = new Vector3(e.targetTouches[0].clientX - pos, 6, 50);
    })

    rev.addEventListener('touchstart', function (){
        rev.style.opacity = rev.style.opacity === '1' ? '0.7' : '1';
    })
}