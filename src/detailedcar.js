import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import setupPhysics from './physics'
import { DefaultLoadingScreen } from '@babylonjs/core/Loading/loadingScreen';


export default function createDetailedCar (scene, camera, container) {
  return new SceneLoader.ImportMeshAsync('', "../mesh/Car/", "Chevrolet_Camaro_SS_High.obj", scene).then(function(newMesh) {
    var car = Mesh.MergeMeshes(newMesh['meshes'], true, true, null, false, true);
    car.name = 'detailedcar';
    car.position = new Vector3(-10, 4, -50);
    car.scalingDeterminant = 0.6;
    camera.parent = car;
    setupPhysics(scene, car);
    container.meshes.push(car);
    return car;
  })
}