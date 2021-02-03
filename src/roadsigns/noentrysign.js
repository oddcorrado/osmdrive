
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import score from '../scoring/scoring'
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions'

async function createAction(scene, trig, container){
   trig.actionManager = new ActionManager(scene);
   return await new Promise (function(resolve){
      const interval = setInterval(() => {
         if (container && container['meshes'].find(car => car.name == 'detailedcar')){
            resolve(container['meshes'].find(car => car.name == 'detailedcar'));
            clearInterval(interval);
         }
      }, 100, container)
   }).then(car => {
      trig.actionManager.registerAction( 
         new ExecuteCodeAction(
            {
               trigger: ActionManager.OnIntersectionEnterTrigger,
               parameter: {
                  mesh: car,
                  usePreciseIntersection: true
               },
            },
            function(){
               score.newScore('NO_ENTRY', -100);
            })
      )
   })
}


export default function spawnNoeEntry(container, scene, x, y) {
    var mat = new StandardMaterial("matstop", scene);
    var trig = MeshBuilder.CreateBox('box', {width:1.5, height:1.5, depth: 0.3}, scene);      
    const rotSign = new Vector3(0, Math.PI, 0);
    const posSign = new Vector3(x, 0, y);
    const lineRot = new Vector3(Math.PI/2, 0, 0);
    const linePos = new Vector3(x - 2, 1, y);
 
    trig.position = linePos;
    trig.rotation = lineRot;
    trig.isVisible = false;
   
    return new SceneLoader.ImportMeshAsync('', "../mesh/Panels/Wrong/", "noentry.obj", scene).then(function(newMesh) {
       const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
       sign.name = 'stop';
       sign.scalingDeterminant = 1;
       sign.position = posSign;
       sign.rotation = rotSign;
       createAction(scene, trig, container);
       return sign;
    })
 }