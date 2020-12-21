//import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin'
import {OimoJSPlugin} from '@babylonjs/core/Physics/Plugins/oimoJSPlugin'
import { PhysicsEngineComponent } from '@babylonjs/core/Physics/physicsEngineComponent'
import { PhysicsEngine } from '@babylonjs/core/Physics/physicsEngine'
import { PhysicsImpostor} from '@babylonjs/core/Physics/physicsImpostor'
// /import OIMO from '@babylonjs/core/Physics/Plugins/oimoJSPlugin'
import { Vector3 } from '@babylonjs/core/Maths/math'

function enablePhysics(scene){
    //scene.enablePhysics(undefined, new OimoJSPlugin());
    scene.enablePhysics(undefined, new OimoJSPlugin(200))
}


function setupPhysics(scene, ...args) {
    args.forEach(arg => {
        if (Array.isArray(arg)){
            arg.forEach( elem => {
                elem.physicsImpostor = new PhysicsImpostor(elem, PhysicsImpostor.BoxImpostor, { mass: 1000, restitution: 0, friction: 0 }, scene)
            })
        } else if (arg.id === 'ground1') {
            arg.physicsImpostor = new PhysicsImpostor(arg, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
        } else {
            arg.physicsImpostor = new PhysicsImpostor(arg, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9, friction: 0}, scene)
        }
            
    })
   }

   export default {
    enablePhysics: (scene) => enablePhysics(scene),
    setupPhysics: (scene, ...args) => setupPhysics(scene, ...args)
   }