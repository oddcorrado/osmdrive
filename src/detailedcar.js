import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import physics from './physics'



export default function createMainCar (scene, camera, internalCamera, container) {
    console.log(scene, camera, internalCamera, container)
    return new SceneLoader.ImportMeshAsync('', "../mesh/Mustang/", "mustang.obj", scene).then(function(newMesh) {
      var car = Mesh.MergeMeshes(newMesh['meshes'], true, true, null, false, true);
      car.name = 'detailedcar';
      car.position = new Vector3(-16, 0, -45);
      car.scalingDeterminant = 0.8;
      camera.parent = car;
      internalCamera.parent = car;
      physics.setupPhysics(scene, car);
      container.meshes.push(car);
    })
}