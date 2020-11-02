import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { Vector3 } from '@babylonjs/core/Maths/math'
//import {getCurrent} from './menu'
import { getWayDir } from '../way'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import enumOri from '../enum/orientation'

let speed= 0;
let angle = 0;
let steer = 0;
var accel = 0;
var btnAccel = 0;
let leftJoystick = null;
let rightJoystick = null;
let pace = 0;
let esp = false;
let dir = new Vector3(1, 0, 0);

let orientation = enumOri.LEFT;

let sideTilt = 0;
let sideSensi = 10;
let sideMaxTilt = 30;//todo

let frontMidAngle = 45;
let frontTilt = -45;
let frontSensi = 5;

let defCamTilt = 45;
let camTilt = 0;

let mode = {lk: 'slide', dir: 'slide', spd: 'slide', gear: 'front'};


export function toggleEsp(){
    esp = !esp;
}

function setup(scene) {
    leftJoystick = new VirtualJoystick(true)
    rightJoystick = new VirtualJoystick(false)
    VirtualJoystick.Canvas.style.opacity = '0.7';
    leftJoystick.setJoystickSensibility(4)
    rightJoystick.setJoystickSensibility(4)
}


function cameraloop(camera){
    var pos = document.getElementById('camerapos');
    let hostWindow = camera.getScene().getEngine().getHostWindow();
    hostWindow.addEventListener("deviceorientation", function (evt){
        camTilt = Math.abs(evt.alpha);
        sideTilt = evt.beta;
        frontTilt = evt.gamma;
       pos.innerText = `Alpha ${evt.alpha.toFixed(2)}, Beta ${evt.beta.toFixed(2)}, Gamma ${evt.gamma.toFixed(2)} ACCEL: ${accel.toFixed(2)}`;
    });   
}

export function setupControls (scene){
    var interAccel;
    var interBrake;
    var dir = document.getElementById('dir');
    var spd = document.getElementById('spd');
    var lk  = document.getElementById('lk');
    var left = document.getElementById('left');
    var right = document.getElementById('right');
    var acc = document.getElementById('accelerator');
    var brake = document.getElementById('brake');
    var touchZone = document.getElementById('touchzone')
    var frontSensiDiv = document.getElementById('frontsensi');
    var sideSensiDiv = document.getElementById('sidesensi');
    var sideInc =  document.getElementById('sideinc');
    var sideDec =  document.getElementById('sidedec');
    var frontInc =  document.getElementById('frontinc');
    var frontDec =  document.getElementById('frontdec');
    var ori = document.getElementById('ori');
    var setori = document.getElementById('setori');
    var setcam = document.getElementById('setcam');

    ori.addEventListener('touchstart', function(){
        orientation = (orientation == enumOri.LEFT ? enumOri.RIGHT : enumOri.LEFT);
        ori.style.transform = ori.style.transform === 'rotateZ(180deg)' ? 'rotateZ(0)' : 'rotateZ(180deg)';
    })

    setori.addEventListener('touchstart', function(){
        frontMidAngle = Math.abs(frontTilt);
    })

    setcam.addEventListener('touchstart', function(){
        defCamTilt = camTilt;
    })

    sideSensiDiv.innerHTML = sideSensi;
    frontSensiDiv.innerHTML = frontSensi;

    frontInc.addEventListener('touchstart', function (){
        if (frontSensi <= 20)
            frontSensi = ++frontSensi;
        frontSensiDiv.innerHTML = frontSensi;
    })
    frontDec.addEventListener('touchstart', function (){
        if (frontSensi >= 1)
            frontSensi = --frontSensi;
        frontSensiDiv.innerHTML = frontSensi;
    })
    sideInc.addEventListener('touchstart', function (){
        if (sideSensi <= 20)
            sideSensi = ++sideSensi;
        sideSensiDiv.innerHTML = sideSensi;
    })
    sideDec.addEventListener('touchstart', function (){
        if (sideSensi >= 1)
            sideSensi = --sideSensi;
        sideSensiDiv.innerHTML = sideSensi;
    })
  

    dir.addEventListener('click', function (){
        if (mode.dir === 'slide'){
            mode.dir = 'tilt';
        } else {
            mode.dir = 'slide';
        }
    })


    spd.addEventListener('click', function (){
        if (mode.spd === 'slide'){
            mode.spd = 'tilt';
            VirtualJoystick.Canvas.style.opacity = '0'
            acc.style.display = 'none';
            brake.style.display = 'none';
        } else if (mode.spd === 'tilt'){
            mode.spd = 'button';
            VirtualJoystick.Canvas.style.opacity = '0'
            acc.style.display = 'block'; 
            brake.style.display = 'block'; 
        } else {
            mode.spd = 'slide';
            VirtualJoystick.Canvas.style.opacity = '0.7'
            acc.style.display = 'none';
            brake.style.display = 'none'; 
            left.style.display = 'none';
            right.style.display = 'none';
            touchZone.style.display = 'none';
        }
        if (mode.lk === 'slide' && mode.spd != 'slide'){
            left.style.display = 'block';
            right.style.display = 'block';
            touchZone.style.display = 'block';
            scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
        }
    })

    lk.addEventListener('click', function (){
        if (mode.spd != 'slide') {
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
                scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
            }
        } else {
            mode.lk = 'slide';
            left.style.display = 'none';
            right.style.display = 'none';
            touchZone.style.display = 'none';
            scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
        }
    })
    
    acc.addEventListener('touchstart', function(){
        clearInterval(interAccel);
        if (accel > 0.03)
            btnAccel = 0.5;
        else
            btnAccel = 0.03
        interAccel = setInterval(() => {
            btnAccel = btnAccel + 0.03;
        }, 500)
    })

    acc.addEventListener('touchend', function(){
        clearInterval(interAccel);

        btnAccel = -0.005;
    })

    brake.addEventListener('touchstart', function(){
        btnAccel = btnAccel - 0.03;

        interBrake = setInterval(() => {
            btnAccel = (btnAccel <= -1 ? -1 : btnAccel - 0.03);
        }, 500)
    })

    brake.addEventListener('touchend', function(){
        clearInterval(interBrake);
    })


}

function loop(car, scene) {
    var speedDiv = document.getElementById('speed');
    var steerWheel = document.getElementById('wheel');
    let vel = car.physicsImpostor.getLinearVelocity();

    speedDiv.innerText = `${((Math.abs(vel.x) + Math.abs(vel.z))*3.6).toFixed()}`;
    speedDiv.style.color = (3.6*(Math.abs(vel.x) + Math.abs(vel.z))) > 50 ? 'red' : '#56CCF2';

    if(pace++ > 20) {
        var tmpdir = dir
        pace = 0
        dir = getWayDir(car.position)
        if (!dir)
            dir = tmpdir;
    }

    if(new Vector3(vel.x, 0, vel.z).length() > 0.1) {
         angle = Math.atan2(vel.z, vel.x)
    }
    //Look
    if (mode.lk === 'tilt'){
        scene.activeCamera.lockedTarget = new Vector3(camTilt * 2 - defCamTilt * 2, 1.2, 50);
    }

    // Direction
    if (mode.dir === 'slide'){
        steer = leftJoystick.pressed ? leftJoystick.deltaPosition.x : steer * 0.80;
        steerWheel.style.transform = `rotateZ(${(leftJoystick.pressed ? leftJoystick.deltaPosition.x * 90 : 0)}deg)`;
        steerWheel.value = leftJoystick.deltaPosition.x * 90;//DONE
    } else if (mode.dir === 'tilt'){
        if (180 >= sideTilt && sideTilt >= 155) {
            steer = orientation * ((sideTilt - 180)/sideSensi);
            console.log(steer);
            steerWheel.style.transform = `rotateZ(${orientation * ((sideTilt-180)*2)}deg)`;
        } else if (-155 >= sideTilt && sideTilt >= -180) {
            steer = orientation * ((sideTilt+180)/sideSensi);
            steerWheel.style.transform = `rotateZ(${(sideTilt+180)*2}deg)`;
        } else if (-35 < sideTilt && sideTilt < 35 ) {
            steer = orientation * (sideTilt/sideSensi);
            steerWheel.style.transform = `rotateZ(${orientation * (sideTilt * 2)}deg)`;//define a max tilt
        }
    }

    //Speed
    if(mode.spd === 'button') {
        accel = btnAccel;//0
    } else if (mode.spd === 'slide'){
        if (rightJoystick.pressed) {
            accel = (rightJoystick.deltaPosition.y < 0 ? rightJoystick.deltaPosition.y / 10 : rightJoystick.deltaPosition.y / 20)
            scene.activeCamera.lockedTarget = new Vector3(rightJoystick.deltaPosition.x * 90, 1.2, 50);
        } else {
            accel = -0.001;
            scene.activeCamera.lockedTarget = new Vector3(0, 1.2, 50);
        }
        
    } else if(mode.spd === 'tilt') {        
        accel = (Math.abs(frontMidAngle)-Math.abs(frontTilt))/(frontSensi*frontMidAngle);
    } 

    //Gear
    if (mode.gear === 'front'){
         mode.gear = 'reverse';
    }

    speed = Math.max(0, Math.min(20, speed + accel))    
    angle += -steer * 0.025
    const dirAngle = Math.atan2(dir.z, dir.x)

     if(esp != false && (!leftJoystick.pressed /*|| sideTilt - 5 < */)  && Math.abs(dirAngle - angle) < 1) {//or accelerometer
        angle = dirAngle * 0.1 + angle * 0.9
    }
    const adjustSpeed = Math.max(0, speed - 2 * Math.abs(steer))//brakes when turning in strong turns. change (speed - [?]) value to make it more or less effective
    var newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
    car.physicsImpostor.setLinearVelocity(newVel)
    //car.physicsImpostor.setLinearVelocity(new Vector3(-1,0,-1))
    car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
}

export default {
    loop: (car, scene) => loop(car, scene),
    cameraloop: camera => cameraloop(camera),
    setup: scene => setup(scene)
}