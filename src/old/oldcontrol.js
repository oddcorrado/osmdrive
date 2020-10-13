import { KeyboardEventTypes} from '@babylonjs/core/Events/keyboardEvents'
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { getWayDir } from './way'

let speed= 0
let angle = 0
let rotSpeed = 0
let rotdir = 0
let steer = 0
let pedal = 0
let leftJoystick = null
let rightJoystick = null
let pace = 0
let dir = new Vector3(1, 0, 0)
let sideTilt = 90;
let frontTilt = 90;
let maxTilt = 30;


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
    VirtualJoystick.Canvas.style.opacity = '0';
   // rightJoystick = new VirtualJoystick(false)

    leftJoystick.setJoystickSensibility(4)
    //leftJoystick
    //rightJoystick.setJoystickSensibility(4)
}


function cameraloop(camera){
    let hostWindow = camera.getScene().getEngine().getHostWindow();
    hostWindow.addEventListener("deviceorientation", function (evt){
       sideTilt = evt.gamma;
       frontTilt
    });   
}

function loop(car) {
    var speedDiv = document.getElementById('speed');

    if(pace++ > 20) {
        pace = 0
        dir = getWayDir(car.position)
    }


    let vel = car.physicsImpostor.getLinearVelocity()
    speedDiv.innerText = `${(Math.abs(vel.x) + Math.abs(vel.z)).toFixed()} KM/H`;

    if(new Vector3(vel.x, 0, vel.z).length() > 0.1) {
         angle = Math.atan2(vel.z, vel.x)
    }

    // JOYSTICK
    if(true) {
       var accelpedal = document.getElementById('accelerator');
        var steerWheel = document.getElementById('wheel');
        var accel = accelpedal.value;//0
        //var accel = //accelero
        //steer = leftJoystick.pressed ? leftJoystick.deltaPosition.x : steer * 0.80//touch
        if (tilt < 60) {
            tilt = 60
        } else if (tilt > 120){
            tilt = 120;
        }
        steer = (tilt - 90)/maxTilt;

        speed = Math.max(0, Math.min(12, speed + accel))
        

        //steerWheel.style.transform = `rotateZ(${(leftJoystick.pressed ? leftJoystick.deltaPosition.x * 90 : 0)}deg)`;//touch
        //steerWheel.value = leftJoystick.deltaPosition.x * 90;//touch
        steerWheel.style.transform = `rotateZ(${((tilt-90)/maxTilt)*90}deg)`;//accelero
        steerWheel.value = (tilt - 90) / maxTilt;//accelero

        angle += -steer * 0.025

        const dirAngle = Math.atan2(dir.z, dir.x)
        if(!leftJoystick.pressed && Math.abs(dirAngle - angle) < 1) {
            angle = dirAngle * 0.1 + angle * 0.9
        }
    
        const adjustSpeed = Math.max(0, speed - 10 * Math.abs(steer))
       //const adjustSpeed = Math.max(0, speed)
        const newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
        car.physicsImpostor.setLinearVelocity(newVel)
        car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
    } 
    else if(true) {//OLD Joysticks function
        steer = leftJoystick.pressed ? leftJoystick.deltaPosition.x : steer * 0.95
        pedal = rightJoystick.pressed ? rightJoystick.deltaPosition.y : 0
    
    
        speed = Math.max(0, Math.min(12, speed + pedal))
        angle += -steer * 0.025

        const dirAngle = Math.atan2(dir.z, dir.x)
        if(!leftJoystick.pressed && Math.abs(dirAngle - angle) < 1) {
            angle = dirAngle * 0.1 + angle * 0.9
        }
    
        const adjustSpeed = Math.max(0, speed - 20 * Math.abs(steer))
        const newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
        car.physicsImpostor.setLinearVelocity(newVel)
        car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
    } else {
        // console.log('angle ' + angle + ' ' + speed)
        if(rotateL){ //p
            rotSpeed = Math.min(0.03, rotSpeed + 0.0005)
            rotdir = 1
            angle += rotSpeed
        }
        else if(rotateR){ //p
            rotSpeed =  Math.min(0.03, rotSpeed + 0.0005)
            rotdir = -1
            
        }
        else if(moveF){ //b
            speed += 0.1
        }
        else if(moveB){ //v
            speed = Math.max(0, speed - 0.5)
        }

    
        if(!rotateR && !rotateL) { rotSpeed = Math.max(0, rotSpeed - 0.0005) }    
        angle += rotSpeed * rotdir   


        const newVel = new Vector3(speed * Math.cos(angle), vel.y , speed * Math.sin(angle))
        car.physicsImpostor.setLinearVelocity(newVel)
        car.rotation = new Vector3(0, -angle + Math.PI * 0.5, 0)
    }
}

export default {
    loop: car => loop(car),
    cameraloop: camera => cameraloop(camera),
    setup: scene => setup(scene)
}