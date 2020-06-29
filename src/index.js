import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Path3D } from '@babylonjs/core/Maths/math.path'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin'
import { PhysicsEngineComponent } from '@babylonjs/core/Physics/physicsEngineComponent'
import { PhysicsEngine } from '@babylonjs/core/Physics/physicsEngine'
import { PhysicsImpostor} from '@babylonjs/core/Physics/physicsImpostor'
import CANNON  from 'cannon'
import { KeyboardEventTypes} from '@babylonjs/core/Events/keyboardEvents'
import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import textPanel from './textPanel'
import createBuildings from './building'
import createWays from './way'
import createSkybox from './skybox'
import createCamera from './camera'
import createLights from './light'
import createGround from './ground'

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

const planes = []

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas);
var scene = new Scene(engine);

const ground = createGround(scene)
let camera = createCamera(scene, canvas)
createWays(scene, planes)
createBuildings(scene)
createSkybox(scene)
createLights(scene)


// Create a grid material
var material = new StandardMaterial("grid", scene);

// PHYSICS
var gravityVector = new Vector3(0,-0.81, 0);
var physicsPlugin = new CannonJSPlugin(true, 10, CANNON);

scene.enablePhysics(gravityVector, physicsPlugin)

// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
var car = MeshBuilder.CreateBox('box', {height: 2, width: 2, depth: 4 }, scene)

// Move the sphere upward 1/2 its height
car.position.z = -20;
car.position.x = -10;
car.position.y = 3
car.physicsImpostor = new PhysicsImpostor(car, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0, friction: 0 }, scene);
ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, scene);

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
});

let speed= 0
let angle = 0
let rotSpeed = 0
let rotdir = 0

camera.parent = car

const leftJoystick = new VirtualJoystick(true)
const rightJoystick = new VirtualJoystick(false)

leftJoystick.setJoystickSensibility(4)
rightJoystick.setJoystickSensibility(4)

let steer = 0
let pedal = 0
// Render every frame
engine.runRenderLoop(() => {
    planes.forEach(p => p.rotation.y = p.rotation.y  + 0.01)
    scene.render()
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
});