import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin'
import { PhysicsEngineComponent } from '@babylonjs/core/Physics/physicsEngineComponent'
import { PhysicsEngine } from '@babylonjs/core/Physics/physicsEngine'
import { PhysicsImpostor} from '@babylonjs/core/Physics/physicsImpostor'
import CANNON  from 'cannon'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { Scene } from '@babylonjs/core/scene'
import { GroundMesh } from '@babylonjs/core/Meshes/groundMesh'

export default function setupPhysics(scene, ...args) {

    console.log(args, scene)
    var gravityVector = new Vector3(0,-0.81, 0)
    var physicsPlugin = new CannonJSPlugin(true, 10, CANNON)    
    scene.enablePhysics(gravityVector, physicsPlugin)

    args.forEach(arg => {
        console.log('arg', arg)
        if (Array.isArray(arg)){
            console.log('oui');
            arg.forEach( elem => {
                elem.physicsImpostor = new PhysicsImpostor(elem, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)
            })
        } else if (arg.id == 'ground1') {
            console.log('ground', arg);
            arg.physicsImpostor = new PhysicsImpostor(arg, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, scene)
        } else {
            arg.physicsImpostor = new PhysicsImpostor(arg, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)
        }
            
    })
    // bots.forEach( bot => {
    //     bot.physicsImpostor = new PhysicsImpostor(bot, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)
    // })
    // car.physicsImpostor = new PhysicsImpostor(car, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)
    // ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, scene)
}