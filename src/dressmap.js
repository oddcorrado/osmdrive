//import '@babylonjs/core/Loading/Plugins';
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3 } from '@babylonjs/core/Maths/math';

export default function dressMap(scene, container){
var i = 0;
var z = 0;

    SceneLoader.ImportMesh('', "../mesh/Tree/", "Tree.obj", scene, function (newMesh) {
        
    })

}