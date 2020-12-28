import e_sound from '../enum/soundenum';
import e_ori from '../enum/orientation';
import {playSound, toggleSound} from '../sounds/carsound';
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick';
import { Vector3 } from '@babylonjs/core/Maths/math'
import {toggleCustomModes} from './menu'
import { roadCheckerExit } from '../checkers/roadChecker'
import gamepad from './gamepad'
import { recenterDisplay } from './recenterDisplay'
import { getWayDir } from '../ways/way'
import { driverPathBuild } from '../ways/logic/driver'

let rightJoystick = null;
let sideTilt = 0;
let sideSensi = 50;
var steer = 0;
var steerWheel = document.getElementById('wheel');
var angle = 0;
var accel = 0;
var orientation = e_ori.RIGHT;

//mustang
//let recenter = false
//let recenterStep = 'lift'
//let projection = null
let speed = 0;
var btnAccel = 0;
let leftJoystick = null;
let pace = 0;
let esp = true;
let dir = new Vector3(1, 0, 0);
let hide = false;

//let sideSensi = 20;
let sideMaxTilt = 30;//todo

let frontMidAngle = 45;
let frontTilt = -45;
let frontSensi = 10;

var cameraOffset = null;
var currAlpha;
let camTilt = 0;

let mode = {lk: 'slide', dir: 'tilt', spd: 'slide', gear: 'front', global: 'mode2'};
let nextdir = {up: false, down: false, right: false, left: false};
var currentCar = 'ford';
var switchCam = 'ford';

export function toggleEsp(){
    esp = !esp;
}

function toggleStick(curr, next){
    var stick = document.getElementById('falsestick');
    if (stick && stick.style.display == curr) {
        stick.style.display = next;
    }
  }
  
function setupJoystick(){
    rightJoystick = new VirtualJoystick(false, {color:'#56CCF2'})
    VirtualJoystick.Canvas.style.opacity = '0.7';
    VirtualJoystick.Canvas.style.zIndex = '0';

    rightJoystick.setJoystickSensibility(6)
}

function cameraOrientationSetup(camera){
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

function setSpeedWitness(vel, stickY){
    var speedDiv = document.getElementById('speed');
    var speed = 3.6*(Math.abs(vel.x) + Math.abs(vel.z))
    speedDiv.innerText = `${(speed).toFixed()}`;
    speedDiv.style.color = speed > 50 ? 'red' : '#56CCF2';
  
    var divTab = document.getElementsByClassName('accelwit');
    var neutral = document.getElementById('neutral');
    for (let div of divTab){
        div.src = '../../images/Vclear.svg';
    }
  
    setSound(speed);
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

  function setSound(speed){
    if (speed <= 1) {
      playSound(e_sound.HIGH, 0.1);
    } else if (speed > 75){
      playSound(e_sound.HIGH, 1);
    } else if (speed > 60){
      playSound(e_sound.HIGH, 0.8);
    } else if (speed > 45){
      playSound(e_sound.HIGH, 0.6);
    } else if (speed > 30){
      playSound(e_sound.HIGH, 0.4);
    } else if (speed > 15) {
      playSound(e_sound.HIGH, 0.3);
    } else if (speed > 1){
      playSound(e_sound.HIGH, 0.2);
    }
}

function loopSelector(scene, joints, sjoints, clio, mustang){
   //console.log('joints', joints, 'sjoints',sjoints,'clio', clio, 'mustang',mustang);
  
    if (currentCar === 'clio'){
        if (switchCam === 'clio') {
            switchCam = 'none';
            scene.activeCamera.parent = clio;
            scene.activeCamera.position = new Vector3(0, 1.8, 0);
            scene.activeCamera.lockedTarget = new Vector3(0, -0.4, -7);
        }
        clioloop(joints, sjoints, clio);
    } else if (currentCar === 'ford'){
        if (switchCam == 'ford') {
            switchCam = 'none';
            scene.activeCamera.parent = mustang;
            scene.activeCamera.position = new Vector3(-0.64, 3, -1.8);
            scene.activeCamera.lockedTarget = new Vector3(0, -7, 50);
        }
        // mustangloop(mustang, scene);
        mustangLoopTap(mustang, scene);
    }
}

function clioloop(joints, sjoints, car){
  //special func for sidesensi
    let vel = car.physicsImpostor.getLinearVelocity();
    setSpeedWitness(vel, rightJoystick.deltaPosition.y)
    //STEER
    //if (!isLookingAround(scene) && vel.x != 0){
      if (180 >= Math.abs(sideTilt) && Math.abs(sideTilt) >= 155) {
          steer = orientation * ((Math.abs(sideTilt) - 180)/sideSensi);
          if(steerWheel)
            steerWheel.style.transform = `rotateZ(${orientation * ((Math.abs(sideTilt)-180)*2)}deg)`;
      } else if (-40 < sideTilt && sideTilt < 40 ) {
          steer = sideTilt/sideSensi * orientation; 
          //steer = orientation * (sideTilt/sideSensi);
          if(steerWheel)
          steerWheel.style.transform = `rotateZ(${orientation * (sideTilt * sideSensi)}deg)`;//define a max tilt
      }
      sjoints[0].setLimit(steer, steer);
      sjoints[1].setLimit(steer, steer);
      sjoints[2].setLimit(0, 0);
      sjoints[3].setLimit(0, 0);
  
  
  
    //SPEED
      if (rightJoystick.pressed) {
          toggleStick('block', 'none');
          accel = (rightJoystick.deltaPosition.y < 0 ? rightJoystick.deltaPosition.y * Math.PI/10 : rightJoystick.deltaPosition.y * -20 * Math.PI)
      } else {
          toggleStick('none', 'block');
      }
      joints[2].setMotor(accel);
      joints[3].setMotor(accel);
}
  


function isLookingAround(scene){
    if(scene.activeCamera.lockedTarget){
        if (-5 < scene.activeCamera.lockedTarget.x && scene.activeCamera.lockedTarget.x < 5)
        return false;
    else
        return true;
    }
}


function getCurrentTurn(){
    var turn = turn = nextdir.right ? 'R' : nextdir.left ? 'L' : null;

    return turn
}

let recenter = false
let recenterStep = 'lift'
let projection = null
let currentSegment = null
let selection = null // 'R' or 'L' or null
//debug
var nextJuction = null;
var oldjunct;
var approach;
var currentRot = 0;
var angle = 0;
var isTurning = false;
var speeding = false;
var breaking = false;
var hardcoreRail = true;
// setInterval(() => {
//     console.log('default logging',currentSegment)
// }, 5000);
// HERE

function mustangLoopTap (car, scene){
  //  var steerWheel = document.getElementById('wheel');
    document.getElementById('carpos').innerHTML = ` X: ${car.position.x.toFixed(2)}; Z: ${car.position.x.toFixed(2)}`;
    let vel = car.physicsImpostor.getLinearVelocity();
    //setSpeedWtinesses(vel, 1);


    // *********************
    // CALCUL DU PATH
    // Attention dès qu'on atteint le virage bien penser à reset la selection sinon on tourne en rond....
    // si currentSegment est repassé on fait une conduit rail (c'est mieux) sinon on détermine le rail en focntion de la position
    //console.log('approach' ,approach);
    selection = /*isTurning ? null :*/ getCurrentTurn();
    //console.log(selection);
    currentSegment = driverPathBuild(car.position, currentSegment, selection)    
    // ********************
    //console.log(currentSegment[0])
     if (currentSegment[1].type === 'junction' && oldjunct != currentSegment[1].junctionIndex){
        console.log('Next junction', currentSegment);
        nextJuction = currentSegment[1];
        oldjunct = currentSegment[1].junctionIndex;

    }
   // console.log(selection);
    if (nextJuction)
        approach = Math.sqrt(Math.pow(car.position.x - nextJuction.point.x, 2) + Math.pow(car.position.y - nextJuction.point.y, 2));

    if(recenter) {
        if(projection.subtract(car.position).length() < 0.1) {
            recenterDisplay(false)
            recenter = false
            projection = null
            return
        }
        
        const target = recenterStep === 'lift' ? new Vector3(car.position.x, 5, car.position.z)
            : (recenterStep === 'lower' ? 
                projection : new Vector3(projection.x, 5, projection.z))
        if(recenterStep === 'lift' && target.subtract(car.position).length() < 0.1) { recenterStep = 'move' }
        else if(recenterStep === 'move' && target.subtract(car.position).length() < 0.1) { recenterStep = 'lower' }

        const recenterScale = Math.max(target.subtract(car.position).length(), 1)
        const recenterVel = target.subtract(car.position).normalize().scale(recenterScale)

        car.physicsImpostor.setLinearVelocity(recenterVel)
        speed = 0
        return
    }

    projection = roadCheckerExit(car.position)
    if(projection != null) { 
        recenterStep = 'lift'
        recenterDisplay(true)
        recenter = true
        return
    }

    var tmpdir = dir
    dir = getWayDir(car.position, hardcoreRail ? vel : null)

    if (!dir)
        dir = tmpdir;

    let dirAngle = Math.atan2(dir.z, dir.x)

    if(Math.abs(dirAngle - angle) > Math.PI * 0.5) {
        dirAngle = Math.atan2(-dir.z, -dir.x) 
    }


    if (isTurning === false && approach > 5){
        angle =  hardcoreRail ? dirAngle : dirAngle * 0.1 + angle * 0.9;
    }

    if(isTurning || nextdir.right && approach <= 4){
        isTurning = true;
        if (currentRot < Math.PI/2) {
            currentRot += 0.02;
            angle -= 0.02;
            angle = angle >= 2*Math.PI ? 0 : angle;
        } else {
            toggleButtons([nextdir.up, false, false, false])
            isTurning = false;
            currentRot = 0;
        }
    } 
    //console.log(approach)
    // if (nextdir.left && (approach <= 1.5 || isTurning === true)){
    //     isTurning = true;
    //     if (currentRot < Math.PI/2) {//Change Math.PI/2 by the value of the angle of the next turn arcos() something
    //         currentRot += 0.01;
    //         angle += 0.01;
    //         angle = angle <= -2*Math.PI ? 0 : angle;
    //     } else {
    //        // currentSegment = nextJuction;
    //         isTurning = false;
    //         currentRot = 0;
    //         toggleButtons([nextdir.up, false, false, false])
    //     }
    // }


    if (nextdir.up === true){
        // if (speeding === true){//fake physics
        //     speeding = car.rotation.x <= -0.15 ? false : true
        //     car.rotation = new Vector3(car.rotation.x -= 0.005, angle, 0);
        // } else {
        //     car.rotation = new Vector3(car.rotation.x >= 0 ? 0 : car.rotation.x+=0.001, angle, 0);
        // }

        speed = speed > 10 ? 10 : speed+=0.03;
        car.physicsImpostor.setLinearVelocity(new Vector3(speed*Math.cos(angle), 0, speed*Math.sin(angle)));
    } else {
    
        car.physicsImpostor.setLinearVelocity(new Vector3(speed*Math.cos(angle), 0, speed*Math.sin(angle)));
        speed = speed <= 0 ? 0 : speed -= 0.01;
    }
    car.rotation = new Vector3(0, -angle + Math.PI/2, 0)

    if (nextdir.down === true){
        speed = speed <= 0 ? 0 : speed -= 0.1;
    }


    // var newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
   
    return
}

function mustangloop(car, scene) {
    var steerWheel = document.getElementById('wheel');
    let vel = car.physicsImpostor.getLinearVelocity();
    setSpeedWitness(vel, rightJoystick.deltaPosition.y);

    if (recenter) {
        if (projection.subtract(car.position).length() < 0.1) {
            recenterDisplay(false)
            recenter = false
            projection = null
            return
        }
        
        const target = recenterStep === 'lift' ? new Vector3(car.position.x, 5, car.position.z)
            : (recenterStep === 'lower' ? 
                projection : new Vector3(projection.x, 5, projection.z))
        if(recenterStep === 'lift' && target.subtract(car.position).length() < 0.1) { recenterStep = 'move' }
        else if(recenterStep === 'move' && target.subtract(car.position).length() < 0.1) { recenterStep = 'lower' }

        const recenterScale = Math.max(target.subtract(car.position).length(), 1)
        const recenterVel = target.subtract(car.position).normalize().scale(recenterScale)

        car.physicsImpostor.setLinearVelocity(recenterVel)
        speed = 0
        return
    }

    projection = roadCheckerExit(car.position)
    if(projection != null) { 
        recenterStep = 'lift'
        recenterDisplay(true)
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
            accel = (rightJoystick.deltaPosition.y < 0 ? rightJoystick.deltaPosition.y / 8 : rightJoystick.deltaPosition.y / 25)
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

var up;
var down;
var left;
var right;

function toggleButtons(tab){
    if (tab[0] === true){
        nextdir.up = true;
        up.style.opacity = 1;
    } else {
        nextdir.up = false;
        up.style.opacity = 0.7;
    }

    if (tab[1] === true){
        nextdir.down = true;
        down.style.opacity = 1;
    } else {
        nextdir.down = false;
        down.style.opacity = 0.7;
    }

    if (tab[2] === true){
        nextdir.left = true;
        left.style.opacity = 1;
    } else {
        nextdir.left = false;
        left.style.opacity = 0.7;
    }

    if (tab[3] === true){
        nextdir.right = true;
        right.style.opacity = 1;
    } else {
        nextdir.right = false;
        right.style.opacity = 0.7;
    }

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
    var carselector = document.getElementById('carselector');
    var soundtoggle = document.getElementById('sound');
    var tapbt = document.getElementById('tapbutton');
    var falseStick = document.getElementById('falsestick');
    up = document.getElementById('up');
    down = document.getElementById('down');
    left = document.getElementById('left');
    right = document.getElementById('right');
    var currentLook;
    var inter;

    up.addEventListener('click', function(){
        if (!isTurning) {
            speeding = true;
            nextdir.down = false;
            down.style.opacity = 0.7;
            nextdir.up = !nextdir.up;
            console.log(nextdir.up)
            up.style.opacity = (up.style.opacity == 1 ? 0.7 : 1);
        }
    })    

    down.addEventListener('click', function(){
        if (!isTurning) {
            breaking = true;
            nextdir.up = false;
            up.style.opacity = 0.7;
            nextdir.down = !nextdir.down;
            down.style.opacity = (down.style.opacity == 1 ? 0.7 : 1);
        }
    })    

    left.addEventListener('click', function(){
        if (!isTurning) {
            nextdir.right = false;
            right.style.opacity = 0.7;
            nextdir.left = !nextdir.left;
            left.style.opacity = left.style.opacity == 1 ? 0.7 : 1;
        }
    })    

    right.addEventListener('click', function(){
        if (!isTurning){
            nextdir.left = false;
            left.style.opacity = 0.7;
            nextdir.right = !nextdir.right;
            right.style.opacity = right.style.opacity == 1 ? 0.7 : 1;  
        }
    })    

    soundtoggle.addEventListener('touchstart', function (){
        if (soundtoggle.children[1].src.includes('no'))
            soundtoggle.children[1].src = '../../images/sound.svg';
        else
            soundtoggle.children[1].src = '../../images/nosound.svg';
        toggleSound();
    })

    carselector.addEventListener('touchstart', function (){
        if (currentCar === 'clio'){
            currentCar = 'ford';
            switchCam = 'ford';
            carselector.children[1].src = '../../images/ford.svg';
            tapbt.style.display = 'block';
            falseStick.style.display = 'none';
        } else if (currentCar === 'ford'){
            currentCar = 'clio';
            switchCam  = 'clio';
            carselector.children[1].src = '../../images/renault.svg';
            tapbt.style.display = 'none';
            falseStick.style.display = 'block';
        }
    })

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

        orientation = (orientation == e_ori.LEFT ? e_ori.RIGHT : e_ori.LEFT);
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

  export default {
    cameraOrientationSetup: camera => cameraOrientationSetup(camera),
    setupJoystick: () => setupJoystick(),
    clioloop: (joints, sjoints, car) => clioloop(joints, sjoints, car),
    mustangloop: (car, scene) => mustangloop(car, scene),
    setupControls: scene => setupControls(scene),
    loopSelector: (scene, joints, sjoints, clio, mustang) =>  loopSelector(scene, joints, sjoints, clio, mustang)
  }
