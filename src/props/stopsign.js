import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3, ToLinearSpace } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions';
import { feedbackDivCreator } from '../creators/buttoncreator';


function clearSceneActionManager(scene){
   if (scene.actionManager.actions)
      scene.actionManager.actions = [];
}

async function createAction(scene, line, trig, container){
   var stopped = false;
   line.actionManager = new ActionManager(scene);
   trig.actionManager = new ActionManager(scene);
   return await new Promise (function(resolve) {
      const interval = setInterval(container =>  {
         if (container && container['meshes'].find(car => car.name == 'detailedcar')){
            resolve(container['meshes'].find(car => car.name == 'detailedcar'));
            clearInterval(interval);
         }
      }, 100, container)
   }).then((car) =>
      {
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
               scene.actionManager.registerAction(
                  new ExecuteCodeAction (
                     {
                        trigger: ActionManager.OnEveryFrameTrigger,
                     }, 
                     function(){
                        var speed = car.physicsImpostor.getLinearVelocity()
                        if (speed.x === 0 && speed.z === 0){
                           stopped = true;
                           return;
                        }
                     })
                  )
               })
      )
      trig.actionManager.registerAction( 
         new ExecuteCodeAction(
            {
               trigger: ActionManager.OnIntersectionExitTrigger,
               parameter: {
                  mesh: car,
                  usePreciseIntersection: true
               },
            },
             function(){
               clearSceneActionManager(scene)
            })
      )
      line.actionManager.registerAction(
         new ExecuteCodeAction(
            {
               trigger: ActionManager.OnIntersectionEnterTrigger,
               parameter: {
                  mesh: car,
                  usePreciseIntersection: true
               }
            },
           function(){
              if (stopped === true)
               feedbackDivCreator({text: 'Successful Stop', img: '../../images/smile.svg', color: 'green'})
              else
               feedbackDivCreator({text: 'Unsuccessful Stop', img: '../../images/sad.svg', color: 'red'})
            clearSceneActionManager(scene)
            stopped = false;
           }
         )
      )
   })
}

export function spawnSign(container, scene, x, y) {
   var mat = new StandardMaterial("matstop", scene);
   var line = MeshBuilder.CreateBox('box', {width:1.5, height:3.8, depth: 0.3}, scene);      
   var trig = line.clone();
   var showLine = line.clone();
   const rotSign = new Vector3(0, Math.PI, 0);
   const posSign = new Vector3(x, 0, y);
   const lineRot = new Vector3(Math.PI/2, Math.PI/10*4, y);
   const linePos = new Vector3(x, 1, y + 3);
   const showLinePos = new Vector3(x, -0.01, y + 3);
   const trigPos = new Vector3(x-5, 1, y+3);

   mat.diffuseColor = new Color3(1, 1, 1);
   mat.emissiveColor = new Color3(1, 1, 1);
   showLine.material = mat;

   line.position = linePos;
   line.rotation = lineRot;
   trig.position = trigPos;
   trig.rotation = lineRot;
   trig.isVisible = false;
   line.isVisible = false;
   showLine.position = showLinePos;
   showLine.rotation = lineRot;
   return new SceneLoader.ImportMeshAsync('', "../mesh/Stop/", "StopSign.obj", scene).then(function(newMesh) {
      const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
      sign.name = 'stop';
      sign.scalingDeterminant = 0.8;
      sign.position = posSign;
      sign.rotation = rotSign;
      createAction(scene, line, trig, container);
      return sign;
   })
}