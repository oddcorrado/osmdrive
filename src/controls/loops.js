import e_sound from '../enum/soundenum';
import {playAccel, playEngine, toggleSound} from '../sounds/carsound';
import { Vector3, Viewport } from '@babylonjs/core/Maths/math'
import { driverPathBuild, driverGetSmootherTarget } from '../ways/logic/driver'
import { Quaternion } from '@babylonjs/core/Maths/math.vector'
import { geoSegmentGetProjection, geoAngleForInterpolation} from '../geofind/geosegment'
import { gpsCheck, getNextTurn } from '../gps/plan'
import { vectorIntesection } from '../maths/geometry'
import score from '../scoring/scoring'
import {toggleBlinkerSound} from '../sounds/carsound'
import screenfull from 'screenfull'

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
var gameState = 'loop';
var switchCam = 'ford';
let blink = null


export function loopSelector(scene, mustang, gps){
    if (gameState === 'loop'){
         if (switchCam == 'ford') {
             switchCam = 'none'
            // scene.activeCamera.parent = mustang
            // scene.activeCamera[0].position = new Vector3(0, 3.4, 0.1)
             scene.activeCameras[0].lockedTarget = new Vector3(0, -3, 50)
         }
         mustangLoopTap(mustang, scene, gps)
     }
}

export function toggleEsp(){
    esp = !esp;
}

function checkBlinker(){
    //useless blinker
    if (blink === selection){
        score.newScore('GOOD_BLINKER', 50)
    } else {
        score.newScore('WRONG_BLINKER', -50)
    }
    lStopBlink()
    rStopBlink()
    toggleBlinkerSound(false)
}

var speedDiv;


function setSound(speed){
    if (speed <= 1){
        playEngine(e_sound.IDLE, 0.5)
    } else {
        playEngine(e_sound.LOW, speed/100)
    }   
}

function setSpeedWitness(speed){
    speedDiv = speedDiv ? speedDiv : document.getElementById('speed');
    speedDiv.innerText = `${(speed).toFixed()}`;
    setSound(speed);
}

function getCurrentTurn(){
    var turn = turn = nextdir.right ? 'R' : nextdir.left ? 'L' : null;

    return turn
}

let nodes = null
let selection = null // 'R' or 'L' or null
let nextJuction = null;
let oldjunct;
let approach;
let speed = 0
let startupDone = false
let prevAngle = 0
let prevTarget = new Vector3(0, 0, 0)
let fakeAcceleration = 0
let accelerationStep = 0
let brakeStep = 0
const fakeAccelerationStep = 0.001
const fakeAccelerationMax = 0.03
let fakeYaw = 0
const fakeYawStep = 0.001
const fakeYawMax = 0.05
let isTurning = false
//CURRENT LOOP HERE
let Tnodes = null

export function mustangLoopTap (car, scene, gps) {
    //  var steerWheel = document.getElementById('wheel');
   // selection = isTurning ? selection : getNextTurn()
    document.getElementById('carpos').innerHTML = ` X: ${car.position.x.toFixed(2)}; Z: ${car.position.x.toFixed(2)}`;
    setSpeedWitness(speed*150);
    // *********************
    // CALCUL DU PATH
    // Attention dès qu'on atteint le virage bien penser à reset la selection sinon on tourne en rond....
    // si nodes est repassé on fait une conduit rail (c'est mieux) sinon on détermine le rail en focntion de la position
   //getCurrentTurn()
    
    const {nodes: builtNodes, selectionIndex} = driverPathBuild(car.position, Tnodes, selection) 
    if(builtNodes == null || builtNodes.length == 0) { return }
    Tnodes = builtNodes
    const {target , normalProjection, nodes: newNodes, slice } = driverGetSmootherTarget(car.position, prevTarget, Tnodes, 4 + 6 * speed)
    prevTarget = target
    if(slice && selectionIndex === 0) { resetWheel(); checkBlinker()}
    Tnodes = newNodes // FIXME   
    oldjunct = oldjunct ? oldjunct : Tnodes[0]
     if (Tnodes[1].type === 'junction' && oldjunct && oldjunct.junctionIndex != Tnodes[1].junctionIndex){
        nextJuction = Tnodes[1]
        oldjunct = Tnodes[1]
        selection = getNextTurn()
    } else if (Tnodes[0].type === 'junction'){
        nextJuction = null
    }
    approach = nextJuction ? Math.sqrt(Math.pow(car.position.x - nextJuction.point.x, 2) + Math.pow(car.position.z - nextJuction.point.z, 2)) : null

    if(startupDone == false && nodes != null) {
        car.position = nodes[0].point
        startupDone = true
    }

    if (brakeStep){
        speed = Math.max(0, speed - brakeStep)//0.004)
        fakeAcceleration =  Math.min(fakeAccelerationMax, fakeAcceleration + fakeAccelerationStep)
    } else if (accelerationStep){
        speed = Math.min(1/3, speed + accelerationStep)// 0.002)
        fakeAcceleration = Math.max(-fakeAccelerationMax, fakeAcceleration - fakeAccelerationStep)
    }
        
   if(0 === speed||speed >= 0.3) {
        fakeAcceleration *= 0.9
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
        gpsCheck(Tnodes, car, dir, gps, angle)
        prevAngle = angle
        car.rotationQuaternion = Quaternion.FromEulerAngles(fakeAcceleration, angle, fakeYaw)
    } else {
        fakeYaw *= 0.95
        car.rotationQuaternion = Quaternion.FromEulerAngles(fakeAcceleration, prevAngle, fakeYaw)
    }

    // var newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
    
    return
}

var center;
let touch;
let locked;
let lblinkerimg 
let rblinkerimg 
let interBlink = null  

let touchA = false
let touchB = false
let touchV = false

const lStopBlink = () => {
    clearInterval(interBlink)
    interBlink = null
    lblinkerimg.style.display = 'block'
    lblinkerimg.src = '../../images/blinkdef.svg'
    blink = null
}

const rStopBlink = () => {
    clearInterval(interBlink)
    interBlink = null
    rblinkerimg.style.display = 'block'
    rblinkerimg.src = '../../images/blinkdef.svg'
    blink = null
}

function resetWheel () {
    approach = null
    touch = 0
    selection = null
}


 export function setupControls (scene){
    let soundtoggle = document.getElementById('sound');
    //let control = document.getElementById('control')
    let fs = document.getElementById('fs')
    let changecam = document.getElementById('changecam');
    center = document.getElementById('center');
    let lblinker = document.getElementById('lblink');
    let rblinker = document.getElementById('rblink');
    lblinkerimg = document.getElementById('lblinkimg');
    rblinkerimg = document.getElementById('rblinkimg')
    var inter;
    let viewInter = null
    let viewX = 300
    let aslide = document.getElementById('accelslide')
    let bslide = document.getElementById('brakeslide')
    let adiv = document.getElementById('acceldiv')
    let bdiv = document.getElementById('brakediv')
    let viewdiv = document.getElementById('viewdiv')
    let viewdrag = document.getElementById('viewdrag')

    const hideSearch = () =>{
        screenfull.request(document.getElementsByTagName('body')[0], {navigationUI: 'hide'})
    }

    const viewHandler = (x) => {
        if (touchV && scene.activeCameras[0]){
            if (inter) { clearInterval(inter) }
            let oW = viewdiv.offsetWidth/2
            let touch = x - (viewdiv.offsetLeft + oW)
            currentLook = (touch > oW ? oW : touch < -oW ? -oW : touch)/oW * 100
            scene.activeCameras[0].lockedTarget.x = currentLook
            viewdrag.style.marginLeft = `${85 + currentLook}%`
            if (80 < currentLook || currentLook < -80) {
                viewdiv.style.background = `linear-gradient(${currentLook < 0 ? 90 : 270}deg , #F3CC30 0%, #F3CC30 50%, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 100%)`
            } else {
                viewdiv.style.background = `linear-gradient(${currentLook < 0 ? 90 : 270}deg , #F3CC30 0%, rgba(243, 204, 48, 0) ${Math.abs(currentLook)/2}%, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 100%)` 
            }
            
        }
    }

    const viewHandlerEnd = () => {
        if (currentLook){
            if (inter) { clearInterval(inter) }
            viewdiv.style.background = 'none'
            inter = setInterval(() => {
            if (-11 < currentLook && currentLook < 11 ){
                clearInterval(inter)
                scene.activeCameras[0].lockedTarget.x = currentLook = 0
                viewdrag.style.marginLeft = '85%'
            } else if (currentLook > 0){ currentLook -=10 }
              else {currentLook += 10}
                scene.activeCameras[0].lockedTarget.x = currentLook
                viewdrag.style.marginLeft = `${85 + currentLook}%`
            }, 20)
        }
    }

    const toggleTouchV = (touch) => {
        touchV = touchV != touch ? touch : touchV
    }//all toggle on same func

    

    const toggleTouchA = (touch) => {
        touchA = touchA != touch ? touch : touchA
    }

    const accelHandler = (x) => {
        if (touchA === true){
            const pos = (adiv.offsetTop + adiv.offsetHeight ) - x
            let perc = (pos / adiv.offsetHeight) * 100
            accelerationStep =  perc < 15 ? 0 : perc > 85 ? 0.002 : (perc / 100) * 0.002
            aslide.style.top = `${perc < 15 ? 70 : perc > 80 ? 5 : (85 - perc)}%`
            adiv.style.background = perc < 15 ? `linear-gradient(0deg , rgba(86, 241, 82, 0) 0%,  #56F152 15%, rgba(0,0,0,0) 15%, rgba(0,0,0,0) 100%)` : perc > 85 ? `rgba(86, 241, 82, 0.6)` : `linear-gradient(0deg , rgba(86, 241, 82, 0) 0%,  #56F152 ${perc}%, rgba(0,0,0,0) ${perc}%, rgba(0,0,0,0) ${100 - perc}%)`
        }
    }


    const toggleTouchB = (touch) => {
        touchB = touchB != touch ? touch : touchB
    }

    const brakeHandler = (x) => {
        if (touchB === true){
            const pos = (bdiv.offsetTop + bdiv.offsetHeight ) - x
            let perc = (pos / bdiv.offsetHeight) * 100
        
            brakeStep =  perc < 15 ? 0 : perc > 85 ? 0.004 : (perc / 100) * 0.004
            bslide.style.top = `${perc < 15 ? 70 : perc > 80 ? 5 : (85 - perc)}%`
            bdiv.style.background = perc < 15 ? `linear-gradient(0deg , rgba(255, 0, 0, 0) 0%, #FF0000 15%, rgba(0,0,0,0) 15%, rgba(0,0,0,0) 100%)` : perc > 85 ? `rgba(255, 0, 0, 0.6)` : `linear-gradient(0deg ,rgba(255, 0, 0, 0) 0%,  #FF0000 ${perc}%, rgba(0,0,0,0) ${perc}%, rgba(0,0,0,0) ${100 - perc}%)`
        }
    }
   
    let touching = false

    
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

    const lToggleBlinking = () => {
        if (blink === 'L') {
            toggleBlinkerSound(false)
           lStopBlink()
        } else if (blink === 'R' || !blink){
            if (!blink){toggleBlinkerSound(true)}
            clearInterval(interBlink)
            interBlink = null
            rblinkerimg.style.display = 'block'
            rblinkerimg.src = '../../images/blinkdef.svg'
            lblinkerimg.src = '../../images/blink.svg'
            interBlink = setInterval(() => {
                lblinkerimg.style.display = lblinkerimg.style.display === 'none' ? 'block' : 'none'
            }, 340)
            blink = 'L'
        }
    }

    const rToggleBlinking = () => {
        if (blink === 'R') {
           rStopBlink()
           toggleBlinkerSound(false)
        } else if (blink === 'L' || !blink){
           if (!blink){toggleBlinkerSound(true)}
            clearInterval(interBlink)
            interBlink = null
            lblinkerimg.style.display = 'block'
            lblinkerimg.src = '../../images/blinkdef.svg'

            rblinkerimg.style.display = 'none'
            rblinkerimg.src = '../../images/blink.svg'
            interBlink = setInterval(() => {
                rblinkerimg.style.display = rblinkerimg.style.display === 'none' ? 'block' : 'none'
            }, 340)
            blink = 'R'
        }
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
        if (gameState != 'loop') {return}
       switch(event.key) {
          
       }
       if (keymode === 1){
            switch(event.key) {
         
            }
       } else if (keymode === 2){
        switch(event.key) {
            case ' ': keyLookTurn(0); break
            case 'ArrowLeft' : keyLookTurn(1); break
            case 'ArrowRight' : keyLookTurn(2); break
            }   
       }
    })
    

    document.addEventListener('keyup', (event) => {
        if (gameState != 'loop') {return}
        switch(event.key) {
        
         
        }
        if (keymode === 1) {
            switch(event.key) {
                case 'ArrowLeft' : lToggleBlinking(); break
                case 'ArrowRight' : rToggleBlinking(); break
                case 'Control' : if(viewInter != null) {viewHandlerEnd() } break
                case 'Alt' : if(viewInter != null) { viewHandlerEnd()} break
            }
        } else if (keymode === 2){
            switch (event.key){
                case 'ArrowLeft' : keyLookTurnEnd(1); break
                case 'ArrowRight' : keyLookTurnEnd(2); break
                case ' ': keyLookTurnEnd(0); break
            }
        }
     })


    viewdrag.addEventListener('touchstart', () => {toggleTouchV(true)})
    viewdrag.addEventListener('touchend', () => {toggleTouchV(false); viewHandlerEnd()})
    viewdiv.addEventListener('touchmove', (e) => {viewHandler(e.targetTouches[0].clientX)})

    viewdrag.addEventListener('mousedown', () => {toggleTouchV(true)})
    viewdiv.addEventListener('mouseup', () => {toggleTouchV(false); viewHandlerEnd()})
    viewdiv.addEventListener('mouseleave', () => {toggleTouchV(false); viewHandlerEnd()})
    viewdiv.addEventListener('mousemove', (e) => {viewHandler(e.clientX)})

    aslide.addEventListener('touchstart', () => {toggleTouchA(true)})
    aslide.addEventListener('touchend', () => {toggleTouchA(false)})
    adiv.addEventListener('touchmove', (e) => {accelHandler(e.targetTouches[0].clientY)})
    aslide.addEventListener('mousedown', () => {toggleTouchA(true)})
    aslide.addEventListener('mouseup', () => {toggleTouchA(false)})
    adiv.addEventListener('mouseleave', () => {toggleTouchA(false)})
    adiv.addEventListener('mousemove', (e) => {accelHandler(e.clientY)})

    bslide.addEventListener('touchstart', () => {toggleTouchB(true)})
    bslide.addEventListener('touchend', () => {toggleTouchB(false)})
    bdiv.addEventListener('touchmove', (e) => {brakeHandler(e.targetTouches[0].clientY)})
    bslide.addEventListener('mousedown', () => {toggleTouchB(true)})
    bslide.addEventListener('mouseup', () => {toggleTouchB(false)})
    bdiv.addEventListener('mouseleave', () => {toggleTouchB(false)})
    bdiv.addEventListener('mousemove', (e) => {brakeHandler(e.clientY)})

    soundtoggle.addEventListener('touchmove', () => soundSwitch())
    soundtoggle.addEventListener('click', () => soundSwitch())
    
    // control.addEventListener('touchmove', () => controlSwitch())
    // control.addEventListener('click', () => controlSwitch())

    fs.addEventListener('touchmove', () => hideSearch())
    fs.addEventListener('click', () => hideSearch())

    lblinker.addEventListener('touchmove', () => lToggleBlinking())
    lblinker.addEventListener('click', () => lToggleBlinking())
    
    rblinker.addEventListener('touchmove', () => rToggleBlinking())
    rblinker.addEventListener('click', () => rToggleBlinking())
    
    
}

  export const getSpeed = () => speed
  export const getApproach = () => approach
  export const getLook = () => currentLook
  export const getCurrentSegment = () => nodes
  export const getAngle = () => prevAngle
  export const getSelection = () => selection
  export const setGameState = (state) => {gameState = state}