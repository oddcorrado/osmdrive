import { VirtualJoystick, JoystickAxis } from '@babylonjs/core/Misc/virtualJoystick'
import { Vector3 } from '@babylonjs/core/Maths/math'
//import {getCurrent} from './menu'
import { getWayDir } from '../ways/way'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import enumOri from '../enum/orientation'
import {toggleCustomModes} from './menu'
import { scene } from '..'
import { roadCheckerExit } from '../checkers/roadChecker'
import gamepad from './gamepad'
import { recenterDisplay } from './recenterDisplay'

// import  from './modes.js'

var accel = 0;
var btnAccel = 0;
let esp = true;
//var orientation = enumOri.LEFT;

let sideTilt = 0;
let sideSensi = 20;
let sideMaxTilt = 30;//todo

let frontMidAngle = 45;
let frontTilt = -45;
let frontSensi = 10;

var cameraOffset = null;
var currAlpha;
let camTilt = 0;

let mode = {lk: 'slide', dir: 'tilt', spd: 'slide', gear: 'front', global: 'mode2'};


function setupControls (scene){
    var interAccel;
    var interBrake;
    var dir = document.getElementById('dir');
    var spd = document.getElementById('spd');
    var lk  = document.getElementById('lk');
    var acc = document.getElementById('accelerator');
    var brake = document.getElementById('brake');
    var touchZone = document.getElementById('touchzone')
    var frontSensiDiv = document.getElementById('frontsensi');
    var sideSensiDiv = document.getElementById('sidesensi');
    var defmodes = document.getElementById('controlmode');
    var currentLook;
    var inter;

    touchZone.addEventListener('touchmove', function(e){
        if (inter)
            clearInterval(inter);
        var pos = touchZone.offsetLeft + (touchZone.offsetWidth / 2)
        currentLook = e.targetTouches[0].clientX - pos > 300 ? 300 : (e.targetTouches[0].clientX - pos < -300 ? -300 : e.targetTouches[0].clientX - pos) ;
        scene.activeCamera.lockedTarget.x = currentLook
    })

    touchZone.addEventListener('touchend', function(e){
        inter = setInterval( () =>  {
            scene.activeCamera.lockedTarget.x = currentLook;
            if (-3 < currentLook && currentLook < 3) {
                scene.activeCamera.lockedTarget.x = 0;
                clearInterval(inter);
            } else if (currentLook > 0)
                currentLook -= 3;
            else
                currentLook +=3;
        }, 3)
    })
    
    document.getElementById('ori').addEventListener('touchstart', function(){

        orientation = (orientation == enumOri.LEFT ? enumOri.RIGHT : enumOri.LEFT);//func called in loop
        ori.style.transform = ori.style.transform === 'rotateZ(180deg)' ? 'rotateZ(0)' : 'rotateZ(180deg)';
    })

    document.getElementById('setori').addEventListener('touchstart', function(){
        frontMidAngle = Math.abs(frontTilt);//func called in loop
    })

    document.getElementById('setcam').addEventListener('touchstart', function(){
         cameraOffset = currAlpha;//func called in loop
    })

    sideSensiDiv.innerHTML = sideSensi;
    frontSensiDiv.innerHTML = frontSensi;

    document.getElementById('frontinc').addEventListener('touchstart', function (){
        if (frontSensi <= 20)
            frontSensi = ++frontSensi;
        frontSensiDiv.innerHTML = frontSensi;//func called in loop
    })
    document.getElementById('frontdec').addEventListener('touchstart', function (){
        if (frontSensi >= 1)
            frontSensi = --frontSensi;
        frontSensiDiv.innerHTML = frontSensi;//func called in loop
    })
    document.getElementById('sideinc').addEventListener('touchstart', function (){
        if (sideSensi <= 20)
            sideSensi = ++sideSensi;
        sideSensiDiv.innerHTML = sideSensi;//func called in loop
    })
    document.getElementById('sidedec').addEventListener('touchstart', function (){
        if (sideSensi >= 1)
            sideSensi = --sideSensi;
        sideSensiDiv.innerHTML = sideSensi;//func called in loop
    })
  

    // /*defmodes.addEventListener('touchstart',function(){
    //     if (mode.global === 'slide'){
    //         defmodes.children[1].src = '../../images/rotate.svg';
    //         mode.global = 'tilt';
    //         Object.keys(mode).forEach(function(opt){
    //             if (opt != 'gear' && opt != 'global')
    //                 mode[opt] = "tilt" 
    //             });
    //         VirtualJoystick.Canvas.style.opacity = '0'
    //         arrows.style.display = 'none';
    //         touchZone.style.display = 'none';
    //     } else if (mode.global === 'tilt') {
    //         mode.global = 'mode1';
    //         defmodes.children[1].src = '../../images/mode1.svg';
    //         mode.lk = 'slide';
    //         arrows.style.display = 'block';
    //         touchZone.style.display = 'block';
    //         mode.dir = 'slide';
    //         mode.spd = 'tilt';
    //         VirtualJoystick.Canvas.style.opacity = '0';
    //     } else if (mode.global === 'mode1'){
    //         mode.global = 'mode2';
    //         defmodes.children[1].src = '../../images/mode2.svg';
    //         mode.lk = 'slide';
    //         [touchZone, arrows].forEach(elem => {
    //             elem.style.display = 'block';
    //             elem.style.right = "32rem";
    //         })
    //         mode.dir = 'tilt';
    //         VirtualJoystick.Canvas.style.opacity = '0.7';
    //         mode.spd = 'slide';
    //     } else if (mode.global === 'mode2'){
    //         mode.global = 'custom';
    //         defmodes.children[1].src = '../../images/custom.svg';
    //         [touchZone, arrows].forEach(elem => {
    //             elem.style.right = "1rem";
    //             elem.style.display = "none";
    //         })
    //         toggleCustomModes('block');
    //         VirtualJoystick.Canvas.style.opacity = '0.7';
    //     } else if (mode.global === 'custom'){
    //         mode.global = 'slide';
    //         toggleCustomModes('none');
    //         defmodes.children[1].src = '../../images/tilt.svg';
    //         Object.keys(mode).forEach(function(opt){
    //             if (opt != 'gear' && opt != 'global')
    //                 mode[opt] = "slide" 
    //         });
    //         VirtualJoystick.Canvas.style.opacity = '0.7'
    //         arrows.style.display = 'none';
    //         touchZone.style.display = 'none';
    //     } 
    //     acc.style.display = 'none';
    //     brake.style.display = 'none'; 
    //     console.log(mode);
    // })*/

    dir.addEventListener('click', function (){
        if (mode.dir === 'slide'){
            mode.dir = 'tilt';
        } else {
            mode.dir = 'slide';
        }//func called in loop
    })


    spd.addEventListener('click', function (){
        if (mode.spd === 'slide'){
            mode.spd = 'tilt';
            VirtualJoystick.Canvas.style.opacity = '0'
        } else if (mode.spd === 'tilt'){
            mode.spd = 'button';
            VirtualJoystick.Canvas.style.opacity = '0'
            acc.style.display = 'block'; 
            brake.style.display = 'block'; 
        } else {
            mode.spd = 'slide';
            VirtualJoystick.Canvas.style.opacity = '0.7'
            touchZone.style.display = 'none';
        }
        if (mode.lk === 'slide' && mode.spd != 'slide'){
            touchZone.style.display = 'block';
        }
        if (mode.spd != 'button'){
            acc.style.display = 'none';
            brake.style.display = 'none'; 
        }//func called in loop
    })

    lk.addEventListener('click', function (){
        if (mode.spd != 'slide') {
            if (mode.lk === 'tilt'){
                mode.lk = 'slide';
                touchZone.style.display = 'block';
            } else if (mode.lk === 'slide') {
                mode.lk = 'off';
                
            } else {
                mode.lk = 'tilt';  
            }
        } else {
            mode.lk = 'slide';
            touchZone.style.display = 'none';
        }
        if (mode.lk != 'slide') {
            touchZone.style.display = 'none';
        }//func called in loop
    })
    
    acc.addEventListener('touchstart', function(){
        acc.style.transform = 'rotate3d(1, 0, 0, 45deg)';
        clearInterval(interAccel);
        if (accel > 0.03)
            btnAccel = 0.5;
        else
            btnAccel = 0.02
        interAccel = setInterval(() => {
            btnAccel = btnAccel + 0.03;
        }, 500)
    })//func called in loop

    acc.addEventListener('touchend', function(){
        acc.style.transform = 'rotate3d(1, 0, 0, 0deg)';
        clearInterval(interAccel);

        btnAccel = -0.005;
    })//func called in loop

    brake.addEventListener('touchstart', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 45deg)';
        btnAccel = btnAccel - 0.05;
        interBrake = setInterval(() => {
            btnAccel = (btnAccel <= -1 ? -1 : btnAccel - 0.05);
        }, 500)
    })//func called in loop

    brake.addEventListener('touchend', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 0deg)';
        clearInterval(interBrake);
    })//func called in loop

}
