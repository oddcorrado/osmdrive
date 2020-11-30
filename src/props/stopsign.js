import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3, ToLinearSpace } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions';
import { feedbackDivCreator } from '../creators/buttoncreator';



async function createAction(scene, mesh, container){
   var stopped = false;
   mesh.actionManager = new ActionManager(scene);
   return await new Promise (function(resolve) {
      const interval = setInterval(container =>  {
         if (container && container['meshes'].find(car => car.name == 'detailedcar')){
            resolve(container['meshes'].find(car => car.name == 'detailedcar'));
            clearInterval(interval);
         }
      }, 100, container)
   }).then((car) =>
   {
      mesh.actionManager.registerAction( 
         new ExecuteCodeAction(
            {
               trigger:
               ActionManager.OnIntersectionEnterTrigger,
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
                        }
                     )
                  )
               }
         )
      )
        
      mesh.actionManager.registerAction(
         new ExecuteCodeAction(
            {
               trigger:
               ActionManager.OnIntersectionExitTrigger,
               parameter: {
                  mesh: car,
                  usePreciseIntersection: true
               }
            },
           function(){
              if (stopped === true)
               feedbackDivCreator({text: 'Successful Stop', img: '../../images/smile.svg'})
              else
               feedbackDivCreator({text: 'Unsuccessful Stop', img: '../../images/sad.svg'})
               stopped = false 
           }
         )
      )
   }) 
}

export function spawnSign(container, scene, x, y) {
   const position = new Vector3(x, 0.1, y);
   const rotation = new Vector3(0, Math.PI/7*6, 0);
   const linePos = new Vector3(0, 0, -3.5);
   const lineRot = new Vector3(Math.PI/2, 0, 0);
   const trigPos = new Vector3(8, 0,-3.5);

   return new SceneLoader.ImportMeshAsync('', "../mesh/Stop/", "StopSign.obj", scene).then(function(newMesh) {
      var line = MeshBuilder.CreateBox('box', {width:1.5, height:4.6, depth: 0.3}, scene);
      var trig = line.clone();
      var mat = new StandardMaterial("matstop", scene);
      var bmat = mat.clone()
      line.position = linePos;
      line.rotation = lineRot;
      trig.rotation = lineRot;
      trig.position = trigPos; 
      trig.isVisible = false;
      mat.diffuseColor = new Color3(1, 1, 1);
      mat.emissiveColor = new Color3(1, 1, 1);
      bmat.diffuseColor = new Color3(0, 0, 0);
      bmat.emissiveColor = new Color3(0, 0, 0);
      line.material = mat;
      trig.material = bmat;
      trig.isVisible = false;
      newMesh['meshes'].push(line, trig);
      const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
      sign.name = 'stop';
      sign.scalingDeterminant = 0.8;
      sign.position = position;
      sign.rotation = rotation;
      createAction(scene, sign, container);
      return sign;
   })
}