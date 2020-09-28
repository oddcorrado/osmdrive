import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

function getCar(){
  
}

export default function createDetailedCar (scene) {
  new SceneLoader.ImportMesh('', "../mesh/Car/", "Chevrolet_Camaro_SS_High.obj", scene,function (newMesh){
    console.log(newMesh)
    var newnew = Mesh.MergeMeshes(newMesh, true, true, function(test){
      console.log(test);
    });
  })
}
