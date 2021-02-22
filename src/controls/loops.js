import e_sound from '../enum/soundenum';
import e_ori from '../enum/orientation';
import {playAccel, playEngine, toggleSound} from '../sounds/carsound';
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick';
import { Vector3 } from '@babylonjs/core/Maths/math'
import {toggleCustomModes} from './menu'
import { roadCheckerExit } from '../checkers/roadChecker'
import gamepad from './gamepad'
import { recenterDisplay } from './recenterDisplay'
import { getWayDir } from '../ways/way'
import { driverPathBuild, driverGetSmootherTarget } from '../ways/logic/driver'
import { Quaternion } from '@babylonjs/core/Maths/math.vector'
import { geoSegmentGetProjection, geoAngleForInterpolation} from '../geofind/geosegment'
import { gpsCheck } from '../gps/plan'
import { vectorIntesection } from '../maths/geometry'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';

let sideTilt = 0
let accel = 0
let currentLook
let mouseAction = 'idle'
const unselectedOpacity = 0.9

let esp = true;

let frontTilt = -45;
let cameraOffset = null;
let currAlpha;
let camTilt = 0;

let nextdir = {up: false, down: false, right: false, left: false};
var currentCar = 'ford';
var switchCam = 'ford';

export function toggleEsp(){
    esp = !esp;
}

function setupJoystick(){
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
var speedDiv;
var speedDivBg;
var interSpeed;


function setSound(speed){
    if (speed <= 1){
        playEngine(e_sound.IDLE, 0.5)
    } else {
        playEngine(e_sound.LOW, speed/100)
    }   
}

function setSpeedWitness(speed, stickY){
    speedDiv = speedDiv ? speedDiv : document.getElementById('speed');
    speedDiv.innerText = `${(speed).toFixed()}`;
    setSound(speed);
}

function loopSelector(scene, joints, sjoints, clio, mustang, gps){
   if (currentCar === 'ford'){
        if (switchCam == 'ford') {
            switchCam = 'none'
            scene.activeCamera.parent = mustang
            scene.activeCamera.position = new Vector3(0, 3.4, 0.1)
            scene.activeCamera.lockedTarget = new Vector3(0, -7, 50)
            //90
            // scene.activeCamera.position = new Vector3(0, 3.1, 0)
            // scene.activeCamera.lockedTarget = new Vector3(0, -7, 50)
        }
        mustangLoopTap(mustang, scene, gps)
    }
}


function getCurrentTurn(){
    var turn = turn = nextdir.right ? 'R' : nextdir.left ? 'L' : null;

    return turn
}

let recenter = false
let recenterStep = 'lift'
let projection = null
let nodes = null
let selection = null // 'R' or 'L' or null

var nextJuction = null;
var oldjunct;
var currentRot = 0;
var isTurning = false;
var speeding = false;
var breaking = false;
var hardcoreRail = true;

var approach;
let acceleration = 0
let speed = 0
let startupDone = false
let prevAngle = 0
let prevTarget = new Vector3(0, 0, 0)

var previousDebug = null
var fakeAcceleration = 0
const fakeAccelerationStep = 0.001
const fakeAccelerationMax = 0.03
var fakeYaw = 0
const fakeYawStep = 0.001
const fakeYawMax = 0.05

//CURRENT LOOP HERE
function mustangLoopTap (car, scene, gps) {
    //  var steerWheel = document.getElementById('wheel');
    document.getElementById('carpos').innerHTML = ` X: ${car.position.x.toFixed(2)}; Z: ${car.position.x.toFixed(2)}`;
    setSpeedWitness(speed*150, nextdir.up ? 1 : nextdir.down ? -1 : 0 );
    // *********************
    // CALCUL DU PATH
    // Attention dès qu'on atteint le virage bien penser à reset la selection sinon on tourne en rond....
    // si nodes est repassé on fait une conduit rail (c'est mieux) sinon on détermine le rail en focntion de la position
    selection = getCurrentTurn()
    const {nodes: builtNodes, selectionIndex} = driverPathBuild(car.position, nodes, selection) 
    if(builtNodes == null || builtNodes.length == 0) { return }
    nodes = builtNodes
    const {target , normalProjection, nodes: newNodes, slice } = driverGetSmootherTarget(car.position, prevTarget, nodes, 4 + 6 * speed)
    prevTarget = target
    if(slice && selectionIndex === 0) { resetWheel() }
    nodes = newNodes // FIXME   

    oldjunct = oldjunct ? oldjunct : nodes[0];
     if (nodes[1].type === 'junction' && oldjunct && oldjunct.junctionIndex != nodes[1].junctionIndex){
        nextJuction = nodes[1]
        oldjunct = nodes[1]
    } else if (nodes[0].type === 'junction'){
        nextJuction = null
    }
    approach = nextJuction ? Math.sqrt(Math.pow(car.position.x - nextJuction.point.x, 2) + Math.pow(car.position.z - nextJuction.point.z, 2)) : null

    if(startupDone == false && nodes != null) {
        car.position = nodes[0].point
        startupDone = true
    }

    if (nextdir.up === true){
        speed = Math.min(2, speed + 0.002)
        fakeAcceleration = Math.max(-fakeAccelerationMax, fakeAcceleration - fakeAccelerationStep)
    }

    if (nextdir.down === true) {
        speed = Math.max(0, speed - 0.004)
        fakeAcceleration =  Math.min(fakeAccelerationMax, fakeAcceleration + fakeAccelerationStep)
    }

    if(nextdir.down === false && nextdir.up === false) {
        fakeAcceleration *= 0.8
        //fakeAcceleration *= 0.8
    }

    if(speed > 0) {
        // const dir = nodes[1].point.subtract(nodes[0].point).normalize().scale(speed)
        const dir = target.subtract(car.position).normalize().scale(speed)
        // const proj = geoSegmentGetProjection(car.position, nodes[0].point, nodes[1].point)
        // car.position = proj.add(dir)
        car.position = car.position.add(dir)

        const to = -Math.atan2(dir.z, dir.x) + Math.PI/2
        const bestTo = geoAngleForInterpolation(prevAngle, to)
        const angle = prevAngle * 0.9 + bestTo * 0.1
        if(Math.abs(angle-prevAngle) > 0.001) {
            if(angle > prevAngle) { fakeYaw = Math.min(fakeYawMax, fakeYaw + fakeYawStep) }
            else { fakeYaw = Math.max(-fakeYawMax, fakeYaw - fakeYawStep) }
        } else {
            fakeYaw *= 0.95
        }
        gpsCheck(nodes, car, dir, gps, angle);
        prevAngle = angle
        car.rotationQuaternion = Quaternion.FromEulerAngles(fakeAcceleration, angle, fakeYaw)
    } else {
        fakeYaw *= 0.95
        car.rotationQuaternion = Quaternion.FromEulerAngles(fakeAcceleration, prevAngle, fakeYaw)
    }

    // var newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
    
    return
}

var up;
var down;
var left;
var right;
var wheel;
var center;
let touch;
let locked;

// function resetWheel(){
//     wheel.style.transform = 'rotateZ(0deg)';
//     nextdir.left = false;
//     nextdir.right = false;
//     approach = null;
//     center.style.display = 'none';
// }


function resetWheel () {
    wheelimg.style.transform = 'rotateZ(0deg)'
    nextdir.left = false
    nextdir.right = false
    approach = null
    touch = 0
    wheelimg.style.display = 'block'
    locked.style.display= 'none'
}


 function setupControls (scene){
    let touchZone = document.getElementById('view');
    let soundtoggle = document.getElementById('sound');
    let control = document.getElementById('control')
    let changecam = document.getElementById('changecam');
    up = document.getElementById('up');
    down = document.getElementById('down');
    left = document.getElementById('left');
    right = document.getElementById('right');
    wheel = document.getElementById('wheel');
    let wheelimg = document.getElementById('wheelimg');
    locked = document.getElementById('wheellocked');
    center = document.getElementById('center');
    let wheelzone = document.getElementById('wheelzone');
    let eye = document.getElementById('look-eye');
    var inter;
    let viewInter = null
    let viewX = 300

    const acceleratorPedal = () => {
        nextdir.up = true
        up.style.opacity = 1
       // up.style.transform = 'rotateX(45deg)'
       up.src = '../../images/accelpressed.svg'
        playAccel(true)
    }

    const acceleratorPedalEnd = () => {
        nextdir.up = false
        up.style.opacity = unselectedOpacity
        up.src = '../../images/accel.svg'
        playAccel(false)
    }

    const brakePedal = () => {
        if (speed > 0) {
            nextdir.down = true
            down.style.opacity = 1
            down.src = '../../images/brakepressed.svg'
        }
    }

    const brakePedalEnd = () => {
        nextdir.down = false
        down.style.opacity = unselectedOpacity
        down.style.transform = 'rotateX(0deg)'
        down.src = '../../images/brake.svg'
    }

    const viewCheck = (x) => {
        if (inter) { clearInterval(inter) }
                
        const pos = touchZone.offsetLeft + (touchZone.offsetWidth / 2)
        currentLook = x - pos > 300
                ? 300
                : (x - pos < -300 ? -300 : x - pos)
        
        scene.activeCamera.lockedTarget.x = currentLook
        
        let eyePos = (parseInt(eye.style.left) + currentLook)/12
        eye.style.left = `${eyePos > 9 ? 9 : eyePos < -9 ? -9 : eyePos}vw`
    }

    const viewCheckEnd = () =>  {
        inter = setInterval( () =>  {
            scene.activeCamera.lockedTarget.x = currentLook
            if (-11 < currentLook && currentLook < 11) {
                scene.activeCamera.lockedTarget.x = 0
                clearInterval(inter)
                currentLook = 0
                eye.style.left = '0vw'
            } else if (currentLook > 0) {
                currentLook -= 10
            } else {
                currentLook += 10
            }
            let eyePos = (parseInt(eye.style.left) + currentLook)/12
            eye.style.left = `${eyePos > 9 ? 9 : eyePos < -9 ? -9 : eyePos}vw`
        }, 16)
    }

    const wheelMove = (x) => {
        touch = x - (wheelzone.offsetLeft + wheelzone.offsetWidth / 2)
        touch = touch > 35 ? 40 : touch < -35 ? -40 : touch
        wheelimg.style.transform = `rotateZ(${touch}deg)`
        wheelimg.style.display = 'block'
        locked.style.display = 'none'
    }

    const wheelMoveEnd = () => {
        touch = touch > 35 ? 40 : touch < -35 ? -40 : 0
        if (touch === 40){
            nextdir.right = true
            nextdir.left = false
            wheelimg.style.display = 'none'
            locked.style.display = 'block'
            locked.style.transform = 'rotateY(0deg)'
            locked.style.left = '7vw'
        } else if (touch === -40){
            nextdir.right = false
            nextdir.left = true
            wheelimg.style.display = 'none'
            locked.style.display = 'block'
            locked.style.transform = 'rotateY(180deg)'
            locked.style.left = '4vw'
        } else {
            locked.style.display = 'none'
        }
        wheelimg.style.transform = `rotateZ(${touch}deg)`
    }

    const soundSwitch = () => {
        if (soundtoggle.src.includes('no')) {
            soundtoggle.src = '../../images/sound.svg'
        } else {
            soundtoggle.src = '../../images/nosound.svg'
        }
        toggleSound()
    }


    const controlSwitch = () => {
        keymode = keymode === 2 ? 1 : keymode+1
    }

    let lock = false
    const lockControls = () => {
        lock = scene.activeCamera.id === 'free_camera' ? true : false
    }

    window.addEventListener('mouseup', e => {
        switch(mouseAction) {
            case 'accelerator':
                acceleratorPedalEnd()
                break
            case 'brake':
                brakePedalEnd()
                break
            case 'view':
                viewCheckEnd()
                break
            case 'wheel':
                wheelMoveEnd()
                break
        }
        mouseAction = 'idle'
    })

    const kbView = (delta) => {
        if (delta === 0) {return}
        viewX = delta > 0 ? 300 : -300
        if(viewInter != null) { clearInterval(viewInter) }
        viewInter = setInterval( () =>  { viewX = Math.max(0, Math.min(delta > 0 ? 600 : -600, delta > 0 ? viewX + delta : viewX - delta)); viewCheck(viewX) }, 16)
    }
    
    let keyTab = [false, false, false]//space, left, right
    let keymode = 1

    const keyLookTurn = (elem) => {
        keyTab[elem] = true
        if (keyTab[0] === true){
            kbView(keyTab[1] === true ? -2 : keyTab[2] === true ? 2 : 0)
        } else {
            wheelMove(keyTab[1] ? -300 : keyTab[2] ? 300 : 0)
        }
    }

    const keyLookTurnEnd = (elem) => {
        keyTab[elem] = false
        wheelMoveEnd()
        if (!keyTab[0]) {if(viewInter != null) { clearInterval(viewInter); viewCheckEnd(); }}
    }

    document.addEventListener('keydown', (event) => {
        if (lock) {return}
       switch(event.key) {
           case 'ArrowUp' : acceleratorPedal(); break
           case 'ArrowDown' : brakePedal(); break
           
       }
       if (keymode === 1){
            switch(event.key) {
            case 'ArrowLeft' : wheelMove(-300); break
            case 'ArrowRight' : wheelMove(300); break
            case ' ': resetWheel(); break
            case 'Control' : kbView(-2); break
            case 'Alt' : kbView(2); break
            }
       } else if (keymode === 2){
        switch(event.key) {
            case ' ': keyLookTurn(0); break
            case 'ArrowLeft' : keyLookTurn(1); break
            case 'ArrowRight' : keyLookTurn(2); break
            case 'Escape' : resetWheel(); break
            }   
       }
    })
    

    document.addEventListener('keyup', (event) => {
        if (lock) {return}
        switch(event.key) {
            case 'ArrowUp' : acceleratorPedalEnd(); break
            case 'ArrowDown' : brakePedalEnd(); break
         
        }
        if (keymode === 1) {
            switch(event.key) {
                case 'ArrowLeft' : wheelMoveEnd(); break
                case 'ArrowRight' : wheelMoveEnd(); break
                case 'Control' : if(viewInter != null) { clearInterval(viewInter); viewCheckEnd(); } break
                case 'Alt' : if(viewInter != null) { clearInterval(viewInter); viewCheckEnd(); } break
            }
        } else if (keymode === 2){
            switch (event.key){
                case 'ArrowLeft' : keyLookTurnEnd(1); break
                case 'ArrowRight' : keyLookTurnEnd(2); break
                case ' ': keyLookTurnEnd(0); break
            }
        }
     })

    up.addEventListener('touchmove', () => acceleratorPedal())
    up.addEventListener('touchstart', () => acceleratorPedal())
    up.addEventListener('mousedown', () => {
        mouseAction = 'accelerator'
        acceleratorPedal() 
    })

    down.addEventListener('touchmove', () => brakePedal())
    down.addEventListener('touchstart', () => brakePedal())
    down.addEventListener('mousedown', () => { 
        mouseAction = 'brake'
        brakePedal()
    })

    touchZone.addEventListener('touchmove', (e) => viewCheck(e.targetTouches[0].clientX))
    touchZone.addEventListener('touchstart', (e) => viewCheck(e.targetTouches[0].clientX))
    touchZone.addEventListener('mousedown', (e) => {
        mouseAction = 'view'
        viewCheck(e.clientX)
    })
    touchZone.addEventListener('mousemove', (e) => {
        if(mouseAction === 'view') { viewCheck(e.clientX) }
    })

    up.addEventListener('touchend', () => acceleratorPedalEnd())

    down.addEventListener('touchend', () => brakePedalEnd())

    touchZone.addEventListener('touchend', () => viewCheckEnd())

    wheelzone.addEventListener('touchmove', e => wheelMove(e.targetTouches[0].clientX))
    wheelzone.addEventListener('mousedown', e => { 
        mouseAction = 'wheel'
        wheelMove(e.clientX )
    })

    wheelzone.addEventListener('mousemove', e => { if(mouseAction === 'wheel') { wheelMove(e.clientX) } })
    wheelzone.addEventListener('touchend', () => wheelMoveEnd())

    locked.addEventListener('touchmove', () => resetWheel())
    locked.addEventListener('click', () => resetWheel())

    soundtoggle.addEventListener('touchmove', () => soundSwitch())
    soundtoggle.addEventListener('click', () => soundSwitch())
    
    control.addEventListener('touchmove', () => controlSwitch())
    control.addEventListener('click', () => controlSwitch())

    changecam.addEventListener('touchmove', () => lockControls())
    changecam.addEventListener('click', () => lockControls())
}

  export default {
    cameraOrientationSetup: camera => cameraOrientationSetup(camera),
    setupJoystick: () => setupJoystick(),
    setupControls: scene => setupControls(scene),
    loopSelector: (scene, joints, sjoints, clio, mustang, gps) =>  loopSelector(scene, joints, sjoints, clio, mustang,gps),
  }

  export const getSpeed = () => speed
  export const getApproach = () => approach
  export const getLook = () => currentLook
  export const getCurrentSegment = () => nodes
