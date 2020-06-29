import { KeyboardEventTypes} from '@babylonjs/core/Events/keyboardEvents'
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { Vector3 } from '@babylonjs/core/Maths/math'

let speed= 0
let angle = 0
let rotSpeed = 0
let rotdir = 0
let steer = 0
let pedal = 0
let leftJoystick = null
let rightJoystick = null


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

    leftJoystick.setJoystickSensibility(4)
    rightJoystick.setJoystickSensibility(4)
}


function loop(car) {
    let vel = car.physicsImpostor.getLinearVelocity()
    if(new Vector3(vel.x, 0, vel.z).length() > 0.1) {
         angle = Math.atan2(vel.z, vel.x)
    }

    // JOYSTICK
    if(true) {
        steer = leftJoystick.pressed ? leftJoystick.deltaPosition.x : steer * 0.95
        pedal = rightJoystick.pressed ? rightJoystick.deltaPosition.y : 0
    
    
        speed = Math.max(0, Math.min(12, speed + pedal))
        angle += -steer * 0.025
    
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
    setup: scene => setup(scene)
}