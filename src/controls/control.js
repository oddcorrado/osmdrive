import { KeyboardEventTypes} from '@babylonjs/core/Events/keyboardEvents'
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { Vector3 } from '@babylonjs/core/Maths/math'
//import {getCurrent} from './menu'
import { getWayDir } from '../way'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'

let speed= 0
let angle = 0
let rotSpeed = 0
let rotdir = 0
let steer = 0
var accel = 0
let leftJoystick = null
let rightJoystick = null
let pace = 0
let dir = new Vector3(1, 0, 0)
let sideTilt = 90;
let frontTilt = 0;
let esp = true;
let maxTilt = 30;
let mode = {dir: 'slide', spd: 'button', lk: 'tilt', gear: 'front'};

export function toggleEsp(){
    esp = !esp;
}

function setup(scene) {
    let moveF, moveB, rotateL, rotateR = false

    scene.onKeyboardObservable.add((kbInfo) => {
    // console.log(kbInfo.event.keyCode)
        switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
            if(kbInfo.event.key==='z'){
                moveF=true}
            if(kbInfo.event.key==='s'){
                moveB=true}
            if(kbInfo.event.key==='q'){
                rotateL=true}
            if(kbInfo.event.key==='d'){
                rotateR=true}
            break;
        case KeyboardEventTypes.KEYUP:   
            if(kbInfo.event.key==='z'){
                moveF=false
            }
            if(kbInfo.event.key==='q'){
                rotateL=false
            }
            if(kbInfo.event.key==='s'){
                moveB=false
            }
            if(kbInfo.event.key==='d'){
                rotateR=false
            }
            break;
        }
    })

    leftJoystick = new VirtualJoystick(true)
    rightJoystick = new VirtualJoystick(false)
    VirtualJoystick.Canvas.style.opacity = '0';
    leftJoystick.setJoystickSensibility(4)
    rightJoystick.setJoystickSensibility(4)
}


function cameraloop(camera){
    let hostWindow = camera.getScene().getEngine().getHostWindow();
    hostWindow.addEventListener("deviceorientation", function (evt){
       sideTilt = evt.gamma;
       frontTilt = evt.alpha;
    });   
}

export function changeOptions (scene){
    var dir = document.getElementById('dir');
    var spd = document.getElementById('spd');
    var lk  = document.getElementById('lk');
    var left = document.getElementById('left');
    var right = document.getElementById('right');
    var acc = document.getElementById('accelerator');
    var brake = document.getElementById('brake');
    var touchZone = document.getElementById('touchzone')

    dir.addEventListener('click', function (){
        if (mode.dir === 'slide'){
            mode.dir = 'tilt';
        } else {
            mode.dir = 'slide';
        }
    })


    spd.addEventListener('click', function (){
        if (mode.spd === 'button'){
            mode.spd = 'slide';
            acc.style.display = 'none';
            brake.style.display = 'none'; 
        } else if (mode.spd === 'slide'){
            mode.spd = 'tilt';
            acc.style.display = 'none';
            brake.style.display = 'none'; 
        } else {
            mode.spd = 'button';
            acc.style.display = 'block'; 
            brake.style.display = 'block'; 
        }
    })

    lk.addEventListener('click', function (){
        if (mode.lk === 'tilt'){
            mode.lk = 'slide';
            left.style.display = 'block';
            right.style.display = 'block';
            touchZone.style.display = 'block';
            scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
        } else if (mode.lk === 'slide') {
            mode.lk = 'off';
            left.style.display = 'none';
            right.style.display = 'none';
            touchZone.style.display = 'none';
            scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
        } else {
            mode.lk = 'tilt';  
            left.style.display = 'none';
            right.style.display = 'none';
            touchZone.style.display = 'none';
            scene.activeCamera.lockedTarget = null;
        }
    })    
}

function loop(car) {
    var speedDiv = document.getElementById('speed');
    var accelpedal = document.getElementById('accelerator');
    var steerWheel = document.getElementById('wheel');
    let vel = car.physicsImpostor.getLinearVelocity();

    speedDiv.innerText = `${((Math.abs(vel.x) + Math.abs(vel.z))*3.6).toFixed()}`;
    speedDiv.style.color = (3.6*(Math.abs(vel.x) + Math.abs(vel.z))) > 50 ? 'red' : '#56CCF2';

    if(pace++ > 20) {
        pace = 0
        dir = getWayDir(car.position)
    }
    
    if(new Vector3(vel.x, 0, vel.z).length() > 0.1) {
         angle = Math.atan2(vel.z, vel.x)
    }

    // Direction
    if (mode.dir === 'slide'){
        steer = leftJoystick.pressed ? leftJoystick.deltaPosition.x : steer * 0.80;
        steerWheel.style.transform = `rotateZ(${(leftJoystick.pressed ? leftJoystick.deltaPosition.x * 90 : 0)}deg)`;
        steerWheel.value = leftJoystick.deltaPosition.x * 90;
    } else if (mode.dir === 'tilt'){
        if (sideTilt < 60) {
            sideTilt = 60
        } else if (sideTilt > 120){
            sideTilt = 120;
        }
        steer = (sideTilt - 90)/maxTilt;
        steerWheel.style.transform = `rotateZ(${((sideTilt-90)/maxTilt)*90}deg)`;
        steerWheel.value = (sideTilt - 90) / maxTilt;
    }

    //Speed
    if(mode.spd === 'button') {
        VirtualJoystick.Canvas.style.opacity = '0'
        accel = accelpedal.value;//0
        speed = Math.max(0, Math.min(12, speed + accel));
    } else if (mode.spd === 'slide'){
        VirtualJoystick.Canvas.style.opacity = '0.7'
        accel = rightJoystick.pressed ? rightJoystick.deltaPosition.y : 0
    } else if(mode.spd === 'tilt') {
        VirtualJoystick.Canvas.style.opacity = '0'
        if (frontTilt < -10) {
            frontTilt = -10
        } else if (frontTilt > 10){
            frontTilt = 10;
        }
        var accel = frontTilt / 100;
    }

    //Gear
    if (mode.gear === 'front'){
         mode.gear = 'reverse';
    }

    speed = Math.max(0, Math.min(12, speed + accel))    
    angle += -steer * 0.025
    const dirAngle = Math.atan2(dir.z, dir.x)

     if(esp != false && (!leftJoystick.pressed /*|| sideTilt - 5 < */)  && Math.abs(dirAngle - angle) < 1) {//or accelerometer
        angle = dirAngle * 0.1 + angle * 0.9
    }
    
    const adjustSpeed = Math.max(0, speed - 10 * Math.abs(steer))//brakes when turning in strong turns. change (speed - [?]) value to make it more or less effective
    var newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
    car.physicsImpostor.setLinearVelocity(newVel)
    //car.physicsImpostor.setLinearVelocity(new Vector3(-1,0,-1))
    car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
}

export default {
    loop: (car) => loop(car),
    cameraloop: camera => cameraloop(camera),
    setup: scene => setup(scene)
}