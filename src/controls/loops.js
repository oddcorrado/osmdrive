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
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick';

let sideTilt = 0
let accel = 0
let currentLook = 0
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
let Lstick
let scene
let inter = null
export function setJoystick(scn){
    Lstick = new VirtualJoystick(true)
    scene = scn
    VirtualJoystick.Canvas.style.opacity = '0'
    VirtualJoystick.Canvas.style.zIndex = '4'
    // VirtualJoystick.Canvas.style.zIndex = '-1'
    Lstick.setJoystickSensibility(5)
}

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
    if (blink === oldSelection){
        //score.newScore('GOOD_BLINKER', 50)
        score.newScore('blinker', true)
    } else {
        //score.newScore('WRONG_BLINKER', -50)
        score.newScore('blinker', false)
    }
    oldSelection = null
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

const jViewHandler = (touch) => {
    if (scene.activeCameras[0] && Lstick.pressed){
        if (inter) { clearInterval(inter); inter = null }
        currentLook = touch * 100
        scene.activeCameras[0].lockedTarget.x = currentLook
        viewdrag.style.marginLeft = `${85 + currentLook}%`
        if (80 < currentLook || currentLook < -80) {
            viewdiv.style.background = `linear-gradient(${currentLook < 0 ? 90 : 270}deg , #F3CC30 0%, #F3CC30 50%, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 100%)`
        } else {
            viewdiv.style.background = `linear-gradient(${currentLook < 0 ? 90 : 270}deg , #F3CC30 0%, rgba(243, 204, 48, 0) ${Math.abs(currentLook)/2}%, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 100%)` 
        }
    } else if (!Lstick.pressed && inter === null && currentLook != 0){
        jViewHandlerEnd()
    }
}

const jViewHandlerEnd = () => {
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
let Tnodes = null
let stickView
let oldSelection
export function mustangLoopTap (car, scene, gps) {
    //  var steerWheel = document.getElementById('wheel');
   // selection = isTurning ? selection : getNextTurn()
    document.getElementById('carpos').innerHTML = ` X: ${car.position.x.toFixed(2)}; Z: ${car.position.x.toFixed(2)}`;
    setSpeedWitness(speed*150);
    jViewHandler(Lstick.deltaPosition.x)
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
        oldSelection = selection
    } else if (Tnodes[0].type === 'junction'){
        nextJuction = null
    }
    approach = nextJuction ? Math.sqrt(Math.pow(car.position.x - nextJuction.point.x, 2) + Math.pow(car.position.z - nextJuction.point.z, 2)) : null

    if(startupDone == false && nodes != null) {
        car.position = nodes[0].point
        startupDone = true
    }

    // if (brakeStep){
    //     speed = Math.max(0, speed - brakeStep)//0.004)
    //     fakeAcceleration =  Math.min(fakeAccelerationMax, fakeAcceleration + fakeAccelerationStep)
    // } else if (accelerationStep){
    //     speed = Math.min(1/3, speed + accelerationStep)// 0.002)
    //     fakeAcceleration = Math.max(-fakeAccelerationMax, fakeAcceleration - fakeAccelerationStep)
    // }
    
    if (brakeStep){
        speed = Math.max(0, speed - brakeStep)//0.004)
        fakeAcceleration =  Math.min(fakeAccelerationMax, fakeAcceleration + fakeAccelerationStep)
    } else if (accelerationStep){
        speed = Math.min(4/5, speed + accelerationStep)// 0.002)
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

const getFPS = () =>
    new Promise(resolve =>
    requestAnimationFrame(t1 =>
      requestAnimationFrame(t2 => resolve(1000 / (t2 - t1)))
    )
  )

  let accelDefault = 0.0001
  let brakeDefault = 0.0004
    let fps 
  const getPreciseFPS = () => {
    setTimeout(()=>{
        getFPS().then((fresh)=>{//adapt accel and brake ratio to refresh rate
            fps=fresh
            brakeDefault = fps > 30 ? 0.004 : 0.008
            accelDefault = fps > 30 ? 0.0001 : 0.0002
            getFPS().then((fresh)=>{//adapt accel and brake ratio to refresh rate
                console.log(fresh, fps)
                if (fresh > fps){
                    brakeDefault = fps > 30 ? 0.004 : 0.008
                    accelDefault = fps > 30 ? 0.0001 : 0.0002
                }
            })
        })
    }, 5000);
  }

 export function setupControls (scene){
   

    getPreciseFPS()
    let soundtoggle = document.getElementById('sound');
    //let control = document.getElementById('control')
    let fs = document.getElementById('fs')
    let changecam = document.getElementById('changecam');
    center = document.getElementById('center');
    let lblinker = document.getElementById('lblink');
    let rblinker = document.getElementById('rblink');
    // let aslide = document.getElementById('accelslide')
    // let bslide = document.getElementById('brakeslide')
    // let adiv = document.getElementById('acceldiv')
    // let bdiv = document.getElementById('brakediv')
    let accel =  document.getElementById('accel')
    let brake =  document.getElementById('brake')
    let viewdiv = document.getElementById('viewdiv')
    let viewdrag = document.getElementById('viewdrag')
    lblinkerimg = document.getElementById('lblinkimg')
    rblinkerimg = document.getElementById('rblinkimg')
    let body = document.getElementsByTagName('body')

    var inter;
    let viewInter = null
    let viewX = 300
    let mouseAction
    let interAccel

    body[0].addEventListener('touchstart', (e)=>{setViewDivPos(e.targetTouches[0].clientX, e.targetTouches[0].clientY)})
    body[0].addEventListener('touchend', ()=>{resetViewDivPos()})
   // middle[0].addEventListener('click', (e)=>{setViewDivPos(e.clientX-(viewdiv.offsetWidth/2), e.clientY-(viewdiv.offsetTop/2))})
    body[0].addEventListener('mouseup', ()=>{resetViewDivPos()})

    const setViewDivPos = (x,y) => {
        if (x < body[0].offsetWidth/2){
            x = x-(viewdiv.offsetWidth/2)
            y = y-(viewdiv.offsetTop/2)
            viewdiv.style.left = `${x}px`
            viewdiv.style.top = `${y}px`
        }
    }

    const resetViewDivPos = () => {
        viewdiv.style.top = `${body[0].offsetHeight/12*5}px`
        viewdiv.style.left = `${body[0].offsetWidth/11}px`
    }

    const hideSearch = () =>{
        let element = document.getElementsByTagName('body')
        element[0].requestFullscreen()
        //screenfull.request(document.getElementsByTagName('html')[0], {navigationUI: 'hide'})
    }

    const accelTimeoutHandler = () => {
        interAccel = accelDefault
        interAccel = setInterval(() => {
            accelerationStep += accelDefault
        }, 100)
    }

    const acceleratorPedal = () => {
        accelTimeoutHandler()
        brakeStep = 0
        accel.src = '../../images/accelpress.svg'
        playAccel(true)
    }

    const acceleratorPedalEnd = () => {
        clearInterval(interAccel)
        brakeStep = brakeDefault/35
        accelerationStep = 0
        accel.src = '../../images/accel.svg'
        playAccel(false)
    }

    const brakePedal = () => {
        if (speed > 0) {
            brakeStep = brakeDefault
            brake.src = '../../images/brakepress.svg'
        }
    }

    const brakePedalEnd = () => {
        brakeStep = brakeDefault/35
        brake.src = '../../images/brake.svg'
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

    // const toggleTouchA = (touch) => {
    //     touchA = touchA != touch ? touch : touchA
    // }

    const soundSwitch = () => {
        if (soundtoggle.src.includes('no')) {
            soundtoggle.src = '../../images/sound.svg'
        } else {
            soundtoggle.src = '../../images/nosound.svg'
        }
        toggleSound()
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


    // viewdrag.addEventListener('touchstart', () => {toggleTouchV(true)})
    // viewdrag.addEventListener('touchend', () => {toggleTouchV(false); viewHandlerEnd()})
    // viewdiv.addEventListener('touchmove', (e) => {viewHandler(e.targetTouches[0].clientX)})

    // viewdrag.addEventListener('mousedown', () => {toggleTouchV(true)})
    // viewdiv.addEventListener('mouseup', () => {toggleTouchV(false); viewHandlerEnd()})
    // viewdiv.addEventListener('mouseleave', () => {toggleTouchV(false); viewHandlerEnd()})
    // viewdiv.addEventListener('mousemove', (e) => {viewHandler(e.clientX)})

    // aslide.addEventListener('touchstart', () => {toggleTouchA(true)})
    // aslide.addEventListener('touchend', () => {toggleTouchA(false)})
    // adiv.addEventListener('touchmove', (e) => {accelHandler(e.targetTouches[0].clientY)})
    // aslide.addEventListener('mousedown', () => {toggleTouchA(true)})
    // aslide.addEventListener('mouseup', () => {toggleTouchA(false)})
    // adiv.addEventListener('mouseleave', () => {toggleTouchA(false)})
    // adiv.addEventListener('mousemove', (e) => {accelHandler(e.clientY)})

    // bslide.addEventListener('touchstart', () => {toggleTouchB(true)})
    // bslide.addEventListener('touchend', () => {toggleTouchB(false)})
    // bdiv.addEventListener('touchmove', (e) => {brakeHandler(e.targetTouches[0].clientY)})
    // bslide.addEventListener('mousedown', () => {toggleTouchB(true)})
    // bslide.addEventListener('mouseup', () => {toggleTouchB(false)})
    // bdiv.addEventListener('mouseleave', () => {toggleTouchB(false)})
    // bdiv.addEventListener('mousemove', (e) => {brakeHandler(e.clientY)})

    accel.addEventListener('touchstart', () =>  acceleratorPedal())
    accel.addEventListener('mousedown', () => acceleratorPedal())
    accel.addEventListener('touchend', () => acceleratorPedalEnd())
    accel.addEventListener('mouseup', () => acceleratorPedalEnd())

    brake.addEventListener('touchstart', () => brakePedal())
    brake.addEventListener('mousedown', () => brakePedal())
    brake.addEventListener('touchend', () => brakePedalEnd())
    brake.addEventListener('mouseup', () => brakePedalEnd())

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