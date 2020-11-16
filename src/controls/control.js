import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { Vector3 } from '@babylonjs/core/Maths/math'
//import {getCurrent} from './menu'
import { getWayDir } from '../ways/way'
import { DeviceOrientationCamera } from '@babylonjs/core/Cameras/deviceOrientationCamera'
import enumOri from '../enum/orientation'
import { scene } from '..'
// import  from './modes.js'

let speed = 0;
let angle = 0;
let steer = 0;
var accel = 0;
var btnAccel = 0;
let leftJoystick = null;
let rightJoystick = null;
let pace = 0;
let esp = true;
let dir = new Vector3(1, 0, 0);

let orientation = enumOri.LEFT;

let sideTilt = 0;
let sideSensi = 15;
let sideMaxTilt = 30;//todo

let frontMidAngle = 45;
let frontTilt = -45;
let frontSensi = 10;

var cameraOffset = null;
var currAlpha;
let camTilt = 0;

let mode = {lk: 'slide', dir: 'slide', spd: 'slide', gear: 'front', global: 'slide'};


export function toggleEsp(){
    esp = !esp;
}

function setup(scene) {
    leftJoystick = new VirtualJoystick(true)
    rightJoystick = new VirtualJoystick(false)
    VirtualJoystick.Canvas.style.opacity = '0.7';
    //VirtualJoystick.Canvas.style.display = 'none';//DEBUG
    leftJoystick.setJoystickSensibility(6)
    rightJoystick.setJoystickSensibility(6)
}


function cameraloop(camera){
    var pos = document.getElementById('camerapos');
    let hostWindow = camera.getScene().getEngine().getHostWindow();
    hostWindow.addEventListener("deviceorientation", function (evt){
        currAlpha = evt.alpha;
        if (cameraOffset === null) {
            cameraOffset = evt.alpha;
        }
        var alpha = evt.alpha - cameraOffset + 180;
        if (alpha<0){
            alpha += 360;
        }//else > 360 -= 180
        camTilt = evt.gamma > 0 ? alpha - 180 : alpha;
        sideTilt = evt.beta;
        frontTilt = evt.gamma > 0 ? -90 : evt.gamma;
       pos.innerText = `Alpha ${evt.alpha.toFixed(2)}, Beta ${evt.beta.toFixed(2)}, Gamma ${evt.gamma.toFixed(2)} ACCEL: ${accel.toFixed(2)}, ORIENTATION: ${camTilt}`;
    });   
}

export function setupControls (scene){
    var interAccel;
    var interBrake;
    var dir = document.getElementById('dir');
    var spd = document.getElementById('spd');
    var lk  = document.getElementById('lk');
    var acc = document.getElementById('accelerator');
    var brake = document.getElementById('brake');
    var touchZone = document.getElementById('touchzone')
    var arrows = document.getElementById('arrows');
    var frontSensiDiv = document.getElementById('frontsensi');
    var sideSensiDiv = document.getElementById('sidesensi');
    var sideInc =  document.getElementById('sideinc');
    var sideDec =  document.getElementById('sidedec');
    var frontInc =  document.getElementById('frontinc');
    var frontDec =  document.getElementById('frontdec');
    var ori = document.getElementById('ori');
    var setori = document.getElementById('setori');
    var setcam = document.getElementById('setcam');
    var defmodes = document.getElementById('controlmode');
    var currentLook;
    var inter;

    touchZone.addEventListener('touchmove', function(e){
        clearInterval(inter);
        var pos = touchZone.offsetLeft + (touchZone.offsetWidth / 2)
        currentLook = e.targetTouches[0].clientX - pos
       scene.activeCamera.lockedTarget = new Vector3(currentLook, 0, 50);
    })

    touchZone.addEventListener('touchend', function(e){
        inter = setInterval( () =>  {
            scene.activeCamera.lockedTarget = new Vector3(currentLook, 0, 50);
            if (-3 < currentLook && currentLook < 3) {
                scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
                clearInterval(inter);
            } else if (currentLook > 0)
                currentLook -= 3;
            else
                currentLook +=3;
        }, 3)
    })
    
    ori.addEventListener('touchstart', function(){
        orientation = (orientation == enumOri.LEFT ? enumOri.RIGHT : enumOri.LEFT);
        ori.style.transform = ori.style.transform === 'rotateZ(180deg)' ? 'rotateZ(0)' : 'rotateZ(180deg)';
    })

    setori.addEventListener('touchstart', function(){
        frontMidAngle = Math.abs(frontTilt);
    })

    setcam.addEventListener('touchstart', function(){
         cameraOffset = currAlpha;
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
  

    defmodes.addEventListener('touchstart',function(){
        if (mode.global === 'slide'){
            mode.global = 'mode1';
            Object.keys(mode).forEach(function(opt){
                if (opt != 'gear')
                    mode[opt] = "tilt" 
                });
            VirtualJoystick.Canvas.style.opacity = '0'
            arrows.style.display = 'none';
            touchZone.style.display = 'none';
        } else if (mode.global === 'tilt') {
            mode.global = 'mode1';
            mode.lk = 'slide';
            arrows.style.display = 'block';
            touchZone.style.display = 'block';
            mode.dir = 'slide';
            mode.spd = 'tilt';
            VirtualJoystick.Canvas.style.opacity = '0';
        } else if (mode.global === 'mode1'){
            mode.global = 'mode2';
            mode.lk = 'slide';
            [touchZone, arrows].forEach(elem => {
                elem.style.display = 'block';
                elem.style.right = "32rem";
            })
            mode.dir = 'tilt';
            VirtualJoystick.Canvas.style.opacity = '0.7';
            mode.spd = 'slide';
        } else if (mode.global === 'mode2'){
            [touchZone, arrows].forEach(elem => {
                elem.style.right = "1rem";
                elem.style.display = "none";
            })
            VirtualJoystick.Canvas.style.opacity = '0.7';
            mode.global = 'custom';
        } else if (mode.global === 'custom'){
            mode.global = 'slide'
            Object.keys(mode).forEach(function(opt){
                if (opt != 'gear')
                    mode[opt] = "slide" 
            });
            VirtualJoystick.Canvas.style.opacity = '0.7'
            arrows.style.display = 'none';
            touchZone.style.display = 'none';
        } 
        acc.style.display = 'none';
        brake.style.display = 'none'; 
        console.log(mode);
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
        } else if (mode.spd === 'tilt'){
            mode.spd = 'button';
            VirtualJoystick.Canvas.style.opacity = '0'
            acc.style.display = 'block'; 
            brake.style.display = 'block'; 
        } else {
            mode.spd = 'slide';
            VirtualJoystick.Canvas.style.opacity = '0.7'
            arrows.style.display = 'none';
            touchZone.style.display = 'none';
        }
        if (mode.lk === 'slide' && mode.spd != 'slide'){
            arrows.style.display = 'block';
            touchZone.style.display = 'block';
        }
        if (mode.spd != 'button'){
            acc.style.display = 'none';
            brake.style.display = 'none'; 
        }
    })

    lk.addEventListener('click', function (){
        if (mode.spd != 'slide') {
            if (mode.lk === 'tilt'){
                mode.lk = 'slide';
                arrows.style.display = 'block';
                touchZone.style.display = 'block';
            } else if (mode.lk === 'slide') {
                mode.lk = 'off';
                
            } else {
                mode.lk = 'tilt';  
            }
        } else {
            mode.lk = 'slide';
            arrows.style.display = 'none';
            touchZone.style.display = 'none';
        }
        if (mode.lk != 'slide') {
            arrows.style.display = 'none';
            touchZone.style.display = 'none';
        }
    })
    
    acc.addEventListener('touchstart', function(){
        clearInterval(interAccel);
        if (accel > 0.03)
            btnAccel = 0.5;
        else
            btnAccel = 0.02
        interAccel = setInterval(() => {
            btnAccel = btnAccel + 0.03;
        }, 500)
    })

    acc.addEventListener('touchend', function(){
        clearInterval(interAccel);

        btnAccel = -0.005;
    })

    brake.addEventListener('touchstart', function(){
        btnAccel = btnAccel - 0.05;

        interBrake = setInterval(() => {
            btnAccel = (btnAccel <= -1 ? -1 : btnAccel - 0.05);
        }, 500)
    })

    brake.addEventListener('touchend', function(){
        clearInterval(interBrake);
    })


}


function setSpeedWtinesses(vel, accel){
    var speedDiv = document.getElementById('speed');
    
    speedDiv.innerText = `${((Math.abs(vel.x) + Math.abs(vel.z))*3.6).toFixed()}`;
    speedDiv.style.color = (3.6*(Math.abs(vel.x) + Math.abs(vel.z))) > 50 ? 'red' : '#56CCF2';

    var divTab = document.getElementsByClassName('accelwit');
    var neutral = document.getElementById('neutral');
    for (let div of divTab){
        div.src = '../../images/Vclear.svg';
    }
    neutral.src = accel === 0 ? '../../images/greencircle.svg' : '../../images/circle.svg';
    
    if (accel>0.03)
        document.getElementById('maxf').src = '../../images/Vstrong.svg';    
    if (accel>0.02)
        document.getElementById('avgf').src = '../../images/Vstrong.svg';
    if (accel>0.015)
        document.getElementById('minf').src = '../../images/Vstrong.svg';
    if (-0.015 < accel && accel < 0.015)
        neutral.src = '../../images/greencircle.svg';
    if (accel<-0.015)
        document.getElementById('minb').src = '../../images/Vstrong.svg';
    if (accel<-0.03)
        document.getElementById('avgb').src = '../../images/Vstrong.svg';
    if (accel<-0.05)
        document.getElementById('maxb').src = '../../images/Vstrong.svg';
}

function isLookingAround(scene){
    if (-5 < scene.activeCamera.lockedTarget.x && scene.activeCamera.lockedTarget.x < 5)
        return false;
    else
        return true;
}

function loop(car, scene) {
    var steerWheel = document.getElementById('wheel');
    let vel = car.physicsImpostor.getLinearVelocity();

    setSpeedWtinesses(vel, accel)
    if (pace++ > 20) {
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
        scene.activeCamera.lockedTarget = new Vector3((camTilt-180) * -3, 0, 50);
    }

    // Direction
    if (mode.dir === 'slide'){
        steer = leftJoystick.pressed ? leftJoystick.deltaPosition.x * 1.4 : steer * 0.80;
        steerWheel.style.transform = `rotateZ(${(leftJoystick.pressed ? leftJoystick.deltaPosition.x * 90 : 0)}deg)`;
    } else if (mode.dir === 'tilt' && !isLookingAround(scene)){
        if (180 >= sideTilt && sideTilt >= 155) {
            steer = orientation * ((sideTilt - 180)/sideSensi);
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
            accel = (rightJoystick.deltaPosition.y < 0 ? rightJoystick.deltaPosition.y / 5 : rightJoystick.deltaPosition.y / 12)
            if (mode.global != 'mode2')
                scene.activeCamera.lockedTarget = new Vector3(rightJoystick.deltaPosition.x * 90, 1.2, 50);
        } else {
            accel = vel.x === 0 ? 0 : -0.001;
            if (mode.global != 'mode2')
                scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
        }
    } else if (mode.spd === 'tilt' && !isLookingAround(scene)) {
        var currentTilt = Math.abs(frontMidAngle)-Math.abs(frontTilt);
        if (currentTilt > 2 || currentTilt < -2) {
            if (currentTilt > 0){
                accel = (currentTilt)/((frontSensi*frontMidAngle));
            } else {
                accel = (currentTilt)/(((frontSensi/1.5)*frontMidAngle))
            }
        }
    } 

    //Gear
    if (mode.gear === 'front'){
        mode.gear = 'reverse';
    }
    //}
    speed = Math.max(0, Math.min(20, speed + accel))    
    angle += -steer * 0.025
    const dirAngle = Math.atan2(dir.z, dir.x)
    if (esp === true && ((mode.dir === 'slide' && !leftJoystick.pressed) || (mode.dir === 'tilt' && 0.15 >= steer && steer >= -0.15))  && Math.abs(dirAngle - angle) < 1) {//or accelerometer
        angle = dirAngle * 0.1 + angle * 0.9
    }
    const adjustSpeed = Math.max(0, speed - 2 * Math.abs(steer))//brakes when turning in strong turns. change (speed - [?]) value to make it more or less effective
    var newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
    car.physicsImpostor.setLinearVelocity(newVel)
    //car.physicsImpostor.setLinearVelocity(new Vector3(-1,0,-1))// marche arriere?
    car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
}

export default {
    loop: (car, scene) => loop(car, scene),
    cameraloop: camera => cameraloop(camera),
    setup: scene => setup(scene)
}