import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import setupPhysics from './physics'



function createMainCar (scene, camera, internalCamera, container) {
  // return new SceneLoader.ImportMeshAsync('', "../mesh/Car/", "Chevrolet_Camaro_SS_High.obj", scene).then(function(newMesh) {
  //   var car = Mesh.MergeMeshes(newMesh['meshes'], true, true, null, false, true);
  //   car.name = 'detailedcar';
  //   car.position = new Vector3(-10, 4, -50);
  //   car.scalingDeterminant = 0.5;
  //   camera.parent = car;
  //   internalCamera.parent = car;
  //   setupPhysics(scene, car);
  //   container.meshes.push(car);
  //   return car;
  // })
    return new SceneLoader.ImportMeshAsync('', "../mesh/Mustang/", "mustang.obj", scene).then(function(newMesh) {
      var car = Mesh.MergeMeshes(newMesh['meshes'], true, true, null, false, true);
      car.name = 'detailedcar';
      car.position = new Vector3(-16, 0, -45);
      car.scalingDeterminant = 0.8;
      camera.parent = car;
      internalCamera.parent = car;
      setupPhysics(scene, car);
      container.meshes.push(car);
      return car;
    })//.then(console.log)
}

function getPos(car){
  //console.log(car.position);
}


export default {
  createMainCar: (scene, camera, internalCamera, container) => createMainCar(scene, camera, internalCamera, container),
  getPos: car => getPos(car)
}