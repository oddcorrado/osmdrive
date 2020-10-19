import { KeyboardEventTypes} from '@babylonjs/core/Events/keyboardEvents'
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { Vector3 } from '@babylonjs/core/Maths/math'
//import {getCurrent} from './menu'
import { getWayDir } from './way'

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
let frontTilt = 90;
let esp = true;
let maxTilt = 30;
let mode = {dir: 'slide', spd: 'button', lk: 'tilt'};

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
       frontTilt = evt.alpha
    });   
}

export function changeOptions (){
    var dir = document.getElementById('dir');
    var spd = document.getElementById('spd');
    var lk  = document.getElementById('lk');

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
            document.getElementById('accelerator').style.display = 'none';
            document.getElementById('brake').style.display = 'none'; 
        } else if (mode.spd === 'slide'){
            mode.spd = 'tilt';
            document.getElementById('accelerator').style.display = 'none';
            document.getElementById('brake').style.display = 'none'; 
        } else {
            document.getElementById('accelerator').style.display = 'block'; 
            document.getElementById('brake').style.display = 'block'; 
            mode.spd = 'button';
        }
    })

    lk.addEventListener('click', function (){
        if (mode.lk === 'tilt'){
            mode.lk = 'slide';
        } else if (mode.lk === 'slide') {
            mode.lk = 'off';
        } else {
            mode.lk = 'tilt';
        }
    })    
}

function loop(car,scene) {
    var speedDiv = document.getElementById('speed');
    var accelpedal = document.getElementById('accelerator');
    var steerWheel = document.getElementById('wheel');
    var left = document.getElementById('left');
    var right = document.getElementById('right');
    let vel = car.physicsImpostor.getLinearVelocity();

    speedDiv.innerText = `${(Math.abs(vel.x) + Math.abs(vel.z)).toFixed()}`;
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
        var accel = frontTilt;
    }

    //Look
    if (mode.lk === 'slide'){
        //enable camera look around
        scene.activeCamera.lockedTarget = new Vector3(0, 0, 50)
        left.style.display = 'block';
        right.style.display = 'block';
    } else if (mode.lk === 'tilt') {
    //enable buttons to look right and left
        scene.activeCamera.lockedTarget = 0
        left.style.display = 'none';
        right.style.display = 'none';
    } else {
        scene.activeCamera.lockedTarget = new Vector3(0, 0, 50)
        left.style.display = 'none';
        right.style.display = 'none';
    }

    speed = Math.max(0, Math.min(12, speed + accel))    
    angle += -steer * 0.025
    const dirAngle = Math.atan2(dir.z, dir.x)

     if(esp != false && (!leftJoystick.pressed /*|| sideTilt - 5 < */)  && Math.abs(dirAngle - angle) < 1) {//or accelerometer
        angle = dirAngle * 0.1 + angle * 0.9
    }
    
    const adjustSpeed = Math.max(0, speed - 10 * Math.abs(steer))//brakes when turning in strong turns. change (speed - [?]) value to make it more or less effective
    const newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
    car.physicsImpostor.setLinearVelocity(newVel)
    car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
}

export default {
    loop: (car, scene) => loop(car, scene),
    cameraloop: camera => cameraloop(camera),
    setup: scene => setup(scene)
}