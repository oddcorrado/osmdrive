import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Quaternion } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import physics from './physics'



export default function createMainCar (scene, camera, internalCamera, container) {
  new SceneLoader.ImportMeshAsync('', "../mesh/Arrow2/", "arrow.obj", scene).then(function(arrowScene) {
     new SceneLoader.ImportMeshAsync('', "../mesh/Mustang/", "mustang4.obj", scene).then(function(newMesh) {
      var  arrow = arrowScene.meshes[0] 
      arrow.name = 'arrow';
      // arrow.position = new Vector3(6, -0.2, -2);
      arrow.position = new Vector3(0, -0.3, 7);
      arrow.material.backFaceCulling = false;
      arrow.scalingDeterminant = 0.8;
      arrow.rotation = new Vector3(Math.PI/10,Math.PI,0);
      console.log('arrow', arrow)
      var car = Mesh.MergeMeshes([arrow, ...newMesh['meshes']], true, true, null, false, true);
      car.name = 'detailedcar';
      car.position = new Vector3(15, 1.5, -2);
      car.scalingDeterminant = 0.8;
      car.rotation = new Vector3(0,Math.PI/2,0);
      camera.parent = car;
      internalCamera.parent = car;
      //physics.setupPhysics(scene, car);
      container.meshes.push(car);
    })
  })
}