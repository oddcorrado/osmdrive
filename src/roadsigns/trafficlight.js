import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3} from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { feedbackDivCreator } from '../creators/buttoncreator';
import score from '../scoring/scoring'

let status = []
let id = 0

async function createAction(scene, bots, line, container, idx){
   let inter
   line.actionManager = new ActionManager(scene);

   bots.forEach(classbot => {
      line.actionManager.registerAction(
         new ExecuteCodeAction(
           {
               trigger: ActionManager.OnIntersectionEnterTrigger,
               parameter: {
                  mesh: classbot.bot
               }
           },
             function (){
               classbot.detected = ['traffic', status[idx]]
               inter = setInterval(() => {
                  if (status[idx] === 'green'){
                     classbot.detected = null
                     clearInterval(inter)
                  }
               }, 1000);
            })
         )   
   })
   
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
               if (status[idx] === 'red') 
                  score.newScore('TRAFFIC_LIGHT_BAD', -100);
               if (status[idx] === 'green' || status[idx] === 'orange')
                  score.newScore('TRAFFIC_LIGHT_GOOD', 50);
            })
      )
   })   
}

function setColors(colors, newcolor){
   colors[0].emissiveColor = newcolor[0]
   colors[1].emissiveColor = newcolor[1]
   colors[2].emissiveColor = newcolor[2]
}

function createLightRotation(colors, type, idx){
   var cols = {
      red: new Color3(1, 0, 0),
      none: new Color3(0, 0, 0),
      green: new Color3(0, 1, 0),
      orange: new Color3(1, 0.4, 0)
   }
   colors[type === 'red' ? 2 : 0].emissiveColor = cols[type];
  
   setInterval(() => {
      if (status[idx] === 'green'){
         setColors(colors, [cols['none'], cols['orange'], cols['none']]);
         status[idx] = 'orange'
         setTimeout(() => {
            setColors(colors, [cols['none'], cols['none'], cols['red']]);
            status[idx] = 'red'
         }, 2000)
      } else if (status[idx] === 'red'){
         setColors(colors, [cols['green'], cols['none'], cols['none']])
         status[idx] = 'green'
      }
   }, 15000)
}

export function spawnTrafficLight(container, bots, scene, x, y, ori, type) {
   status.push(type)
   let idx = id++
   let line = MeshBuilder.CreateBox('box', {width:1.5, height:1.5, depth: 0.3}, scene);     
   //const rotSign = new Vector3(0, -Math.PI/2, 0)
   const rotSign = new Vector3(0, ori, 0)
   const posSign = new Vector3(x, 0, y)
   const lineRot = new Vector3(Math.PI/2, 0, y)
   //const linePos = new Vector3(x - 3, 1, y + 2)
   const linePos = new Vector3(ori >= Math.PI ? x - 3 : x + 2, 1, y + 3)
   var nb = 0
   line.position = linePos
   line.rotation = lineRot
   line.isVisible = false

   return new SceneLoader.ImportMeshAsync('', "../mesh/DoubleTrafficLight/", "doubletraffic.obj", scene).then(function(newMesh) {
      var lights = [];
      var colors = [new StandardMaterial('green', scene), new StandardMaterial('orange', scene), new StandardMaterial('red', scene)]
      var meshColor = ['green', 'orange', 'red']
      var test;
      var x = 0;
      meshColor.forEach((color, colnb = 0) => {
         test = newMesh.meshes.filter(msh => msh.name.includes(color))
         lights.push(...test)
         lights[x].material = colors[colnb];
         lights[x+1].material = colors[colnb];
         x+=2;
      })
      const traffic = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
      traffic.name = 'light'
      traffic.scalingDeterminant = 0.8
      traffic.position = posSign
      traffic.rotation = rotSign
      createLightRotation(colors, type, idx)
      createAction(scene, bots, line, container, idx)
      return traffic;
   })
}

