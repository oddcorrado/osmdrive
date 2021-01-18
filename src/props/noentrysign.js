
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions'


export default function spawnNoeEntry(container, scene, x, y) {
    var mat = new StandardMaterial("matstop", scene);
    var line = MeshBuilder.CreateBox('box', {width:1.5, height:3.5, depth: 0.3}, scene);      
    const rotSign = new Vector3(0, Math.PI, 0);
    const posSign = new Vector3(x, 0, y);
    const lineRot = new Vector3(Math.PI/2, Math.PI/10*4, y);
    const linePos = new Vector3(x, 1, y + 3);
 
    mat.diffuseColor = new Color3(1, 1, 1);
    mat.emissiveColor = new Color3(1, 1, 1);
 
    line.position = linePos;
    line.rotation = lineRot;
    line.isVisible = false;
   
    return new SceneLoader.ImportMeshAsync('', "../mesh/Panels/Wrong/", "noentry.obj", scene).then(function(newMesh) {
       const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
       sign.name = 'stop';
       sign.scalingDeterminant = 0.8;
       sign.position = posSign;
       sign.rotation = rotSign;
       //createAction(scene, line, trig, container);
       return sign;
    })
 }