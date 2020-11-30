import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'

export default function createCar(scene) {
    var car = MeshBuilder.CreateBox('box', {height: 2, width: 2, depth: 4 }, scene)

    // Move the sphere upward 1/2 its height
    car.position.z = -20;
    car.position.x = -10;
    car.position.y = 3

    return car
}
