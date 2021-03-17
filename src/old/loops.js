    import e_sound from '../enum/soundenum';
import e_ori from '../enum/orientation';
import {playAccel, playEngine, toggleSound} from '../sounds/carsound';
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick';
import { Vector3 } from '@babylonjs/core/Maths/math'
import gamepad from './gamepad'
import { recenterDisplay } from './recenterDisplay'
import { driverPathBuild, driverGetSmootherTarget } from '../ways/logic/driver'
import { Quaternion } from '@babylonjs/core/Maths/math.vector'
import { geoSegmentGetProjection, geoAngleForInterpolation} from '../geofind/geosegment'
import { gpsCheck } from '../gps/plan'
import { vectorIntesection } from '../maths/geometry'
import { scoreDivCreator } from '../creators/buttoncreator';
import score from '../scoring/scoring'
import { rightViewCreator } from '../creators/UIElementsCreator';
import {toggleBlinkerSound} from '../sounds/carsound'

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


function loopSelector(scene, mustang, gps){
    if (gameState === 'loop'){
         if (switchCam == 'ford') {
             switchCam = 'none'
             scene.activeCamera.parent = mustang
             scene.activeCamera.position = new Vector3(0, 3.4, 0.1)
             scene.activeCamera.lockedTarget = new Vector3(0, -7, 50)
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

//CURRENT LOOP HERE
function mustangLoopTap (car, scene, gps) {
    //  var steerWheel = document.getElementById('wheel');
    document.getElementById('carpos').innerHTML = ` X: ${car.position.x.toFixed(2)}; Z: ${car.position.x.toFixed(2)}`;
    setSpeedWitness(speed*150);
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
    if(slice && selectionIndex === 0) { resetWheel(); checkBlinker()}
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
        gpsCheck(nodes, car, dir, gps, angle);
        prevAngle = angle
        car.rotationQuaternion = Quaternion.FromEulerAngles(fakeAcceleration, angle, fakeYaw)
    } else {
        fakeYaw *= 0.95
        //fakeAcceleration *= 0.5
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

    //let oW = viewdiv.offsetWidth/2//useful ?
    const viewHandler = (x) => {
        if (touchV){
            if (inter) { clearInterval(inter) }
            let oW = viewdiv.offsetWidth/2
            let touch = x - (viewdiv.offsetLeft + oW)
            currentLook = (touch > oW ? oW : touch < -oW ? -oW : touch)/oW * 100
            scene.activeCamera.lockedTarget.x = currentLook
            viewdrag.style.marginLeft = `${85 + currentLook}%`
        }
    }

    const viewHandlerEnd = () => {
        if (inter) { clearInterval(inter) }
        inter = setInterval(() => {
            if (-11 < currentLook && currentLook < 11 ){
                clearInterval(inter)
                scene.activeCamera.lockedTarget.x = currentLook = 0
                viewdrag.style.marginLeft = '85%'
            } else if (currentLook > 0){ currentLook -=10 }
              else {currentLook += 10}
                scene.activeCamera.lockedTarget.x = currentLook
                viewdrag.style.marginLeft = `${85 + currentLook}%`
            }, 20)
    }

    const toggleTouchV = (touch) => {
        touchV = touchV != touch ? touch : touchV
    }//all toggle on same func

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

    const acceleratorPedal = () => {
        nextdir.up = true
        up.src = '../../images/accelpress.svg'
        playAccel(true)
    }

    const acceleratorPedalEnd = () => {
        nextdir.up = false
        up.src = '../../images/accel.svg'
        playAccel(false)
    }

    const brakePedal = () => {
        if (speed > 0) {
            nextdir.down = true
            down.style.opacity = 1
            down.src = '../../images/brakepress.svg'
        }
    }

    const brakePedalEnd = () => {
        nextdir.down = false
        down.src = '../../images/brake.svg'
    }

   

    const wheelMove = (x) => {
        touch = x - (wheelzone.offsetLeft + wheelzone.offsetWidth / 2)
        touch = touch > 35 ? 40 : touch < -35 ? -40 : touch
        wheelimg.style.transform = `rotateZ(${touch}deg)`
        wheelimg.style.display = 'block'
        locked.style.display = 'none'
    }

    let touching = false

    const wheelMoveEnd = () => {
        touch = touch > 30 ? 40 : touch < -30 ? -40 : 0
        
        if (touch === 40){
            nextdir.right = true
            nextdir.left = false
            wheelimg.style.display = 'none'
            locked.style.display = 'block'
            locked.style.transform = 'rotateY(0deg)'
        } else if (touch === -40){
            nextdir.right = false
            nextdir.left = true
            wheelimg.style.display = 'none'
            locked.style.display = 'block'
            locked.style.transform = 'rotateY(180deg)'
        } else {
            locked.style.display = 'none'
        }
        wheelimg.style.transform = `rotateZ(0deg)`
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
    touchZone.addEventListener('touchend', () => viewCheckEnd())
    
    // leftView.addEventListener('touchmove', (e) => leftLook(e.targetTouches[0].clientX))
    // leftView.addEventListener('mousedown', (e) => {
    //     mouseAction = 'lview'
    //     leftLook(e.clientX)
    // })
    // leftView.addEventListener('mousemove', (e) => {
    //     if(mouseAction === 'lview'){leftLook(e.clientX)}
    // })

    // leftView.addEventListener('touchend', () => leftLookEnd())
    // leftView.addEventListener('mouseup', () => {
    //     leftLookEnd()
    // })

    // rightView.addEventListener('touchmove', (e) => rightLook(e.targetTouches[0].clientX))
    // rightView.addEventListener('mousedown', (e) => {
    //     mouseAction = 'rview'
    //     rightLook(e.clientX)
    // })
    // rightView.addEventListener('mousemove', (e) => {
    //     if (mouseAction === 'rview'){rightLook(e.clientX)} 
    // })

    // rightView.addEventListener('touchend', () => rightLookEnd())
    // rightView.addEventListener('mouseup', () => {
    //     rightLookEnd()
    // })

    up.addEventListener('touchend', () => acceleratorPedalEnd())
    down.addEventListener('touchend', () => brakePedalEnd())

    wheelzone.addEventListener('touchmove', e => wheelMove(e.targetTouches[0].clientX))
    wheelzone.addEventListener('mousedown', e => { 
        mouseAction = 'wheel'
        wheelMove(e.clientX)
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

    lblinker.addEventListener('touchmove', () => lToggleBlinking())
    lblinker.addEventListener('click', () => lToggleBlinking())
    
    rblinker.addEventListener('touchmove', () => rToggleBlinking())
    rblinker.addEventListener('click', () => rToggleBlinking())
    
    
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
  export const getAngle = () => prevAngle
  export const getSelection = () => selection
  export const setGameState = (state) => {gameState = state}