import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin'
import { PhysicsEngineComponent } from '@babylonjs/core/Physics/physicsEngineComponent'
import { PhysicsEngine } from '@babylonjs/core/Physics/physicsEngine'
import { PhysicsImpostor} from '@babylonjs/core/Physics/physicsImpostor'
import CANNON  from 'cannon'
import { Vector3 } from '@babylonjs/core/Maths/math'

export default function setupPhysics(scene, ground, car) {
    var gravityVector = new Vector3(0,-0.81, 0)
    var physicsPlugin = new CannonJSPlugin(true, 10, CANNON)

    scene.enablePhysics(gravityVector, physicsPlugin)

    car.physicsImpostor = new PhysicsImpostor(car, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, scene)
}