import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3} from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { feedbackDivCreator } from '../creators/buttoncreator';
import {newScore} from '../scoring/scoring'

async function createAction(scene, line, container){
   line.actionManager = new ActionManager(scene);
   return await new Promise (function(resolve) {
      const interval = setInterval(container =>  {
         if (container && container['meshes'].find(car => car.name == 'detailedcar')){
            resolve(container['meshes'].find(car => car.name == 'detailedcar'));
            clearInterval(interval);
         }
      }, 100, container)
   }).then((car) =>
      {
      line.actionManager.registerAction( 
         new ExecuteCodeAction(
            {
               trigger: ActionManager.OnIntersectionExitTrigger,
               parameter: {
                  mesh: car,
                  usePreciseIntersection: true
               },
            },
             function(){
               if (status === 'red') 
                  newScore('SIGNALING_RED_LIGHT', -100);
               //   feedbackDivCreator({text: 'Feu Brulé', img: '../../images/sad.svg', color: 'red'})
               if (status === 'green' || status === 'orange')
                  newScore('SIGNALING_RED_LIGHT', 50);
                 // feedbackDivCreator({text: 'Feu Respecté', img: '../../images/smile.svg', color: 'green'})
            })
      )
   })
}

var status;

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

   colors[2].emissiveColor = red;
   status = 'red';
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
   }, 15000)
}

export function spawnTrafficLight(container, scene, x, y) {
   var line = MeshBuilder.CreateBox('box', {width:1.5, height:1.5, depth: 0.3}, scene);      
   const rotSign = new Vector3(0, -Math.PI/2, 0);
   const posSign = new Vector3(x, 0, y);
   const lineRot = new Vector3(Math.PI/2, Math.PI/10*4, y);
   const linePos = new Vector3(x, 1, y + 3);

   line.position = linePos;
   line.rotation = lineRot;
   line.isVisible = false;

   return new SceneLoader.ImportMeshAsync('', "../mesh/TrafficLight/", "Traffic Light Low.obj", scene).then(function(newMesh) {
      console.log(newMesh)
      var lights = [];
      var colors = [new StandardMaterial('green', scene), new StandardMaterial('orange', scene), new StandardMaterial('red', scene)]
      var meshColor = ['green', 'orange', 'red']

      meshColor.forEach((color, i = 0) => {
         lights.push(newMesh.meshes.find(msh => msh.name.includes(color)));
         lights[i].material = colors[i];
      })
      const traffic = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
      traffic.name = 'light';
      traffic.scalingDeterminant = 0.8;
      traffic.position = posSign;
      traffic.rotation = rotSign;
      createLightRotation(colors);
      createAction(scene, line, container);
      return traffic;
   })
}

