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
let hide = false;
let orientation = enumOri.LEFT;

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


export function toggleEsp(){
    esp = !esp;
}

function toggleStick(curr, next){
    var stick = document.getElementById('falsestick');
    if (stick && stick.style.display == curr) {
        stick.style.display = next;
    }
}

function setup(scene) {
    //leftJoystick = new VirtualJoystick(true)
    rightJoystick = new VirtualJoystick(false, {color:'#56CCF2'})
    VirtualJoystick.Canvas.style.opacity = '0.7';
    rightJoystick.alwaysVisible = true;

    //leftJoystick.setJoystickSensibility(6)
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
        }else if (alpha> 360)
            alpha -= 360;
        camTilt = evt.gamma > 0 ? alpha - 180 : alpha;
        sideTilt = evt.beta;
        frontTilt = evt.gamma > 0 ? -90 : evt.gamma;
       pos.innerText = `Alpha ${evt.alpha.toFixed(2)}, Beta ${evt.beta.toFixed(2)}, Gamma ${evt.gamma.toFixed(2)} ACCEL: ${accel.toFixed(2)}, ORIENTATION: ${camTilt}`;
    });   
}

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
        scene.activeCamera.lockedTarget = new Vector3(currentLook, -7, 50);
    })

    touchZone.addEventListener('touchend', function(e){
        inter = setInterval( () =>  {
            scene.activeCamera.lockedTarget = new Vector3(currentLook, -7, 50);
            if (-3 < currentLook && currentLook < 3) {
                scene.activeCamera.lockedTarget = new Vector3(0, -7, 50);
                clearInterval(inter);
            } else if (currentLook > 0)
                currentLook -= 3;
            else
                currentLook +=3;
        }, 3)
    })
    
    document.getElementById('ori').addEventListener('touchstart', function(){
        orientation = (orientation == enumOri.LEFT ? enumOri.RIGHT : enumOri.LEFT);
        ori.style.transform = ori.style.transform === 'rotateZ(180deg)' ? 'rotateZ(0)' : 'rotateZ(180deg)';
    })

    document.getElementById('setori').addEventListener('touchstart', function(){
        frontMidAngle = Math.abs(frontTilt);
    })

    document.getElementById('setcam').addEventListener('touchstart', function(){
         cameraOffset = currAlpha;
    })

    sideSensiDiv.innerHTML = sideSensi;
    frontSensiDiv.innerHTML = frontSensi;

    document.getElementById('frontinc').addEventListener('touchstart', function (){
        if (frontSensi <= 20)
            frontSensi = ++frontSensi;
        frontSensiDiv.innerHTML = frontSensi;
    })
    document.getElementById('frontdec').addEventListener('touchstart', function (){
        if (frontSensi >= 1)
            frontSensi = --frontSensi;
        frontSensiDiv.innerHTML = frontSensi;
    })
    document.getElementById('sideinc').addEventListener('touchstart', function (){
        if (sideSensi <= 20)
            sideSensi = ++sideSensi;
        sideSensiDiv.innerHTML = sideSensi;
    })
    document.getElementById('sidedec').addEventListener('touchstart', function (){
        if (sideSensi >= 1)
            sideSensi = --sideSensi;
        sideSensiDiv.innerHTML = sideSensi;
    })
  

    /*defmodes.addEventListener('touchstart',function(){
        if (mode.global === 'slide'){
            defmodes.children[1].src = '../../images/rotate.svg';
            mode.global = 'tilt';
            Object.keys(mode).forEach(function(opt){
                if (opt != 'gear' && opt != 'global')
                    mode[opt] = "tilt" 
                });
            VirtualJoystick.Canvas.style.opacity = '0'
            arrows.style.display = 'none';
            touchZone.style.display = 'none';
        } else if (mode.global === 'tilt') {
            mode.global = 'mode1';
            defmodes.children[1].src = '../../images/mode1.svg';
            mode.lk = 'slide';
            arrows.style.display = 'block';
            touchZone.style.display = 'block';
            mode.dir = 'slide';
            mode.spd = 'tilt';
            VirtualJoystick.Canvas.style.opacity = '0';
        } else if (mode.global === 'mode1'){
            mode.global = 'mode2';
            defmodes.children[1].src = '../../images/mode2.svg';
            mode.lk = 'slide';
            [touchZone, arrows].forEach(elem => {
                elem.style.display = 'block';
                elem.style.right = "32rem";
            })
            mode.dir = 'tilt';
            VirtualJoystick.Canvas.style.opacity = '0.7';
            mode.spd = 'slide';
        } else if (mode.global === 'mode2'){
            mode.global = 'custom';
            defmodes.children[1].src = '../../images/custom.svg';
            [touchZone, arrows].forEach(elem => {
                elem.style.right = "1rem";
                elem.style.display = "none";
            })
            toggleCustomModes('block');
            VirtualJoystick.Canvas.style.opacity = '0.7';
        } else if (mode.global === 'custom'){
            mode.global = 'slide';
            toggleCustomModes('none');
            defmodes.children[1].src = '../../images/tilt.svg';
            Object.keys(mode).forEach(function(opt){
                if (opt != 'gear' && opt != 'global')
                    mode[opt] = "slide" 
            });
            VirtualJoystick.Canvas.style.opacity = '0.7'
            arrows.style.display = 'none';
            touchZone.style.display = 'none';
        } 
        acc.style.display = 'none';
        brake.style.display = 'none'; 
        console.log(mode);
    })*/

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
            touchZone.style.display = 'none';
        }
        if (mode.lk === 'slide' && mode.spd != 'slide'){
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
        }
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
    })

    acc.addEventListener('touchend', function(){
        acc.style.transform = 'rotate3d(1, 0, 0, 0deg)';
        clearInterval(interAccel);

        btnAccel = -0.005;
    })

    brake.addEventListener('touchstart', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 45deg)';
        btnAccel = btnAccel - 0.05;
        interBrake = setInterval(() => {
            btnAccel = (btnAccel <= -1 ? -1 : btnAccel - 0.05);
        }, 500)
    })

    brake.addEventListener('touchend', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 0deg)';
        clearInterval(interBrake);
    })


}


function setSpeedWtinesses(vel, stickY){
    var speedDiv = document.getElementById('speed');
    
    speedDiv.innerText = `${((Math.abs(vel.x) + Math.abs(vel.z))*3.6).toFixed()}`;
    speedDiv.style.color = (3.6*(Math.abs(vel.x) + Math.abs(vel.z))) > 50 ? 'red' : '#56CCF2';

    var divTab = document.getElementsByClassName('accelwit');
    var neutral = document.getElementById('neutral');
    for (let div of divTab){
        div.src = '../../images/Vclear.svg';
    }
    
    if (rightJoystick.pressed){
        neutral.src = '../../images/circle.svg';
        if (stickY>0.80)
            document.getElementById('maxf').src = '../../images/Vstrong.svg';    
        if (stickY>0.40)
            document.getElementById('avgf').src = '../../images/Vstrong.svg';
        if (stickY>0)
            document.getElementById('minf').src = '../../images/Vstrong.svg';
        if (stickY<0)
            document.getElementById('minb').src = '../../images/Vstrong.svg';
        if (stickY<-0.4)
            document.getElementById('avgb').src = '../../images/Vstrong.svg';
        if (stickY<-0.8)
            document.getElementById('maxb').src = '../../images/Vstrong.svg';
    } else {
     neutral.src = '../../images/greencircle.svg';
    }

    }

function isLookingAround(scene){
    if(scene.activeCamera.lockedTarget){
        if (-5 < scene.activeCamera.lockedTarget.x && scene.activeCamera.lockedTarget.x < 5)
        return false;
    else
        return true;
    }
}

let recenter = false
let projection = null

function loop(car, scene) {
    var steerWheel = document.getElementById('wheel');
    let vel = car.physicsImpostor.getLinearVelocity();
    setSpeedWtinesses(vel, rightJoystick.deltaPosition.y);

    if(recenter) {
        if(projection.subtract(car.position).length() < 0.1) {
            recenter = false
            projection = null
            return
        }
        const recenterScale = Math.min(projection.subtract(car.position).length(), 10)
        const recenterVel = projection.subtract(car.position).normalize().scale(recenterScale)
        car.physicsImpostor.setLinearVelocity(recenterVel)
        speed = 0
        return
    }

    projection = roadCheckerExit(car.position)
    if(projection != null) { 
        recenter = true
        return
    }

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
       scene.activeCamera.lockedTarget = new Vector3((camTilt-180) * -3, 0, 50);//        scene.activeCamera.lockedTarget = new Vector3((camTilt-180) * -3, 0, 50);
    }

    // Direction
    if (mode.dir === 'slide'){
        steer = leftJoystick.pressed ? leftJoystick.deltaPosition.x * 1.4 : steer * 0.80;
        steerWheel.style.transform = `rotateZ(${(leftJoystick.pressed ? leftJoystick.deltaPosition.x * 90 : 0)}deg)`;
    } else if (mode.dir === 'tilt' && !isLookingAround(scene) && vel.x != 0){
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
    } else {
        steer = 0;
    }

    //Speed
    if(mode.spd === 'button') {
        accel = btnAccel;//0
    } else if (mode.spd === 'slide'){
        if (rightJoystick.pressed) {
            toggleStick('block', 'none');
            accel = (rightJoystick.deltaPosition.y < 0 ? rightJoystick.deltaPosition.y / 10 : rightJoystick.deltaPosition.y / 30)
            if (mode.global != 'mode2')
                scene.activeCamera.lockedTarget = new Vector3(rightJoystick.deltaPosition.x * 90, 1.2, 50);
        } else {
            accel = vel.x === 0 ? 0 : -0.001;
            toggleStick('none', 'block');
            if (mode.global != 'mode2')
                scene.activeCamera.lockedTarget = new Vector3(0, -11, 50);//                scene.activeCamera.lockedTarget = new Vector3(0, 0, 50);
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

    // gamepad overwrite
    const gp = gamepad()
    if(gp != null) {
        steer = Math.abs(gp.steer) > 0.1 ? gp.steer * 0.50 : 0
        steer = steer * Math.min(1, speed)
        steer = steer * Math.min(1, Math.max(0.25, Math.abs(2 - (speed / 8))))
        if(speed < 0.001) { steer = 0 }
        steerWheel.style.transform = `rotateZ(${steer * 90}deg)`
        accel = (gp.speed < 0 ? gp.speed / 10 : gp.speed / 30)
        if(Math.abs(gp.steer) > 0.1) {
            scene.activeCamera.lockedTarget = new Vector3(gp.steer * 20, 0, 50)
        } else {
            if(Math.abs(gp.speed) < 0.1) {
                scene.activeCamera.lockedTarget = new Vector3(gp.look * 100, 0, 50);
            } else {
                scene.activeCamera.lockedTarget = new Vector3(0, 0, 50)
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

    let dirAngle = Math.atan2(dir.z, dir.x)

    if(Math.abs(dirAngle - angle) > Math.PI * 0.5) { dirAngle = Math.atan2(-dir.z, -dir.x) }

    if (esp === true && ((mode.dir === 'slide' && !leftJoystick.pressed) || (mode.dir === 'tilt' && 0.15 >= steer && steer >= -0.15))  && Math.abs(dirAngle - angle) < 1) {//or accelerometer
        angle = dirAngle * 0.1 + angle * 0.9
    }
    const adjustSpeed = Math.max(0, speed - 2 * Math.abs(steer))//brakes when turning in strong turns. change (speed - [?]) value to make it more or less effective
    var newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))

    
    car.physicsImpostor.setLinearVelocity(newVel)
    
    //car.physicsImpostor.setLinearVelocity(new Vector3(-1,0,-1))// marche arriere?
    car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
    return
}

export default {
    loop: (car, scene) => loop(car, scene),
    cameraloop: camera => cameraloop(camera),
    setup: scene => setup(scene),
    setupControls: scene => setupControls(scene)
}