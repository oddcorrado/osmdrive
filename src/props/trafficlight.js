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
               feedbackDivCreator({text: 'Feu Réussi', img: '../../images/smile.svg', color: 'green'})
              else
               feedbackDivCreator({text: 'Feu non-respecté', img: '../../images/sad.svg', color: 'red'})
            clearSceneActionManager(scene)
            stopped = false;
           }
         )
      )
   })
}

var status = 'red'

function setColors(colors, newcolor){
   colors[0].emissiveColor = newcolor[0];
   colors[1].emissiveColor = newcolor[1];
   colors[2].emissiveColor = newcolor[2];
}

function createLightRotation(colors){
   var none = new Color3(0, 0, 0);
   var green = new Color3(0, 1, 0);
   var orange = new Color3(1, 0.4, 0);
   var red = new Color3(1, 0, 0);
   setInterval(() => {
      if (status === 'green'){
         setColors(colors, [none, orange, none]);
         status = 'orange';
         setTimeout(() => {
            setColors(colors, [none, none, red]);
            status = 'red';
         }, 2000)
      } else if (status === 'red'){
         setColors(colors, [green,none,none])
         status = 'green';
      }
   }, 20000)
}

export function spawnTrafficLight(container, scene, x, y) {
   var line = MeshBuilder.CreateBox('box', {width:1.5, height:3.8, depth: 0.3}, scene);      
   var trig = line.clone();
   var showLine = line.clone();
   const rotSign = new Vector3(0, -Math.PI/2, 0);
   const posSign = new Vector3(x, 0, y);
   const lineRot = new Vector3(Math.PI/2, Math.PI/10*4, y);
   const linePos = new Vector3(x, 1, y + 3);
   const showLinePos = new Vector3(x, -0.01, y + 3);
   const trigPos = new Vector3(x-5, 1, y+3);

   line.position = linePos;
   line.rotation = lineRot;
   trig.position = trigPos;
   trig.rotation = lineRot;
   trig.isVisible = false;
   line.isVisible = false;
   showLine.position = showLinePos;
   showLine.rotation = lineRot;

   return new SceneLoader.ImportMeshAsync('', "../mesh/TrafficLight/", "Traffic Light Low.obj", scene).then(function(newMesh) {
      console.log(newMesh)
      var lights = [];
      var colors = [new StandardMaterial('green', scene), new StandardMaterial('orange', scene), new StandardMaterial('red', scene)]
      colors[2].emissiveColor = new Color3(1,0,0);
      var meshColor = ['green', 'orange', 'red']
      meshColor.forEach((color, i = 0) => {
         lights.push(newMesh.meshes.find(msh => msh.name.includes(color)));
         lights[i].material = colors[i];
      })
      console.log(lights);
      // test.material = mat
      const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
      // console.log(sign);
      sign.name = 'light';
      sign.scalingDeterminant = 0.8;
      sign.position = posSign;
      sign.rotation = rotSign;
      createLightRotation(colors);
      createAction(scene, line, trig, container);
      return sign;
   })
}

