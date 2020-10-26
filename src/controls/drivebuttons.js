import {buttonCreator, divCreator} from './menu.js'
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Camera } from '@babylonjs/core/Cameras/camera';

// buttonCretor({style}, {content})


export function buttonDriveCreator(style, content){
    var tmpBtn = document.createElement('div');
    var tmpImg = document.createElement('img');

    tmpImg.src = content.img;
    tmpImg.style.height = content.height;
    tmpBtn.setAttribute('style', style + `position: absolute;`);
    tmpBtn.id = content.id;
    tmpBtn.appendChild(tmpImg);
    return tmpBtn;
}


export default function createButtons (scene){
    var accel = buttonDriveCreator('z-index: 10; top: 73vh; right: 6vw; height:11rem;',{height: '8rem', id:'accelerator',img: '../images/gas2.svg'});
    var brake = buttonDriveCreator('z-index: 10; top: 84.5vh; right: 14vw; height:3.5rem;',{height: '4rem', id:'brake', img: '../images/brake2.svg'});
    var wheel = buttonDriveCreator('z-index: 0;top: 60vh; right: 78vw; height:12rem;', {height: '12rem', id: 'wheel', img: '../images/steerwheel2.svg'})
    var dashboard = buttonDriveCreator('z-index: 0; top: 82.2vh; right: 40vw; height: 8rem;', {height: '6rem', id: 'dash', img: '../images/dashboard2.png'});
    var left = buttonDriveCreator('opacity: 0.7; z-index: 10; top: 54vh; right: 14vw; height: 5rem;display: none;', {height: '6rem', id: 'left', img: '../images/left.svg'});
    var right = buttonDriveCreator('opacity: 0.7; z-index: 10; top: 54vh; right: 5vw; height: 5rem;display: none;', {height: '6rem', id: 'right', img: '../images/right.png'});
    var touchZone = divCreator('opacity: 0.7; z-index: 10; top: 55vh; right: 5vw; height: 5rem; width: 18.5vw; display: none;', {id: 'touchzone', text:''})
    var rev = buttonDriveCreator('z-index: 10;top: 90vh; right: 0.5vw; height:12rem; opacity: 0.7;', {height: '3rem', id: 'wheel', img: '../images/reverse.png'})

    var btnDivArray = [accel, brake, wheel, dashboard, left, right, touchZone, rev];

    btnDivArray.forEach(btn => {
        document.body.appendChild(btn);
    })

    accel.value = 0;
    brake.value = 0;

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