import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3} from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

export default function createArrow(scene, container){
    new SceneLoader.ImportMeshAsync('', "../mesh/Arrow/", "arrow.obj", scene).then(function(arrowScene) {
        var arrow = arrowScene.meshes[0] 
        arrow.name = 'arrow';
        // arrow.position = new Vector3(6, -0.2, -2);
        //arrow.position = new Vector3(0, -0.3, 7);
        arrow.material.backFaceCulling = false;
        arrow.scalingDeterminant = 0.8;
      //  arrow.rotation = new Vector3(-Math.PI/10,0,0);
        container.meshes.push(arrow);
    })
}