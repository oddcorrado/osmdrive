import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3} from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { feedbackDivCreator } from '../creators/buttoncreator';
import score from '../scoring/scoring'
import { Scene } from '@babylonjs/core/scene';
//import { CarBot } from '../npcs/carbotsIndependantDetector';
import { AssetContainer } from '@babylonjs/core/assetContainer';


// let trafficMesh: Mesh
// let carbots: CarBot[]
// let id = 0
// let container: AssetContainer

// export class TrafficLight {
//     traffic: Mesh
//     trig: Mesh
//     trigbot: Mesh
//     status: string

//     constructor(trafficMesh: Mesh, container: AssetContainer, x: number, y: number, ori: number, scene: Scene){
//         this.traffic = trafficMesh
//         this.trig = MeshBuilder.CreateBox('box', {width:0.5, height:0.5, depth: 0.3}, scene);     
//         this.trigbot = MeshBuilder.CreateBox('trig', {width:0.5, height:0.5, depth: 1}, scene); 

//         const rotSign = new Vector3(0, ori, 0)
//         const posSign = new Vector3(x, 0, y)
//         const trigRot = new Vector3(Math.PI/2, 0, y)
//         const trigBotPos = new Vector3(ori === -Math.PI/2 || ori === Math.PI ? x - 3.5 : x + 3.5, 0.5 , ori > 0 ? y - 3.5 : y + 3.5 )//ameliorer
//         const trigPos = new Vector3(ori >= Math.PI ? x - 3.5: x - 3.5, 0.5 , y + 3.5)//ameliorer

//         this.traffic.position = posSign
//         this.traffic.rotation = rotSign
//         this.trig.position = trigPos
//         this.trig.rotation = trigRot
//         this.trigbot.position = trigBotPos
//         this.trig.isVisible = false
//         this.createAction(scene)
//     }


//     createAction = (scene: Scene) => {
//     let inter: number
//     this.trig.actionManager = new ActionManager(scene);
//     this.trigbot.actionManager = new ActionManager(scene);
 
//     carbots.forEach(classbot => {
//        this.trigbot.actionManager.registerAction(
//           new ExecuteCodeAction(
//             {
//                 trigger: ActionManager.OnIntersectionEnterTrigger,
//                 parameter: {
//                    mesh: classbot.bot
//                 }
//             },
//               function (){
 
//                 classbot.detected = ['traffic', status[idx]]//push it
//                 inter = setInterval(() => {
//                    if (status[idx] === 'green'){
//                       classbot.detected = null
//                       clearInterval(inter)
//                    }
//                 }, 1000);
//              })
//           )   
//     })
//     (async () => { 
//         await new Promise (function(resolve) {
//         const interval = setInterval(container =>  {
//             if (container && container['meshes'].find(car => car.name == 'detailedcar')){
//                 resolve(container['meshes'].find(car => car.name == 'detailedcar'));
//                 clearInterval(interval);
//             }
//         }, 100, container)
//         }).then((car) =>
//         {
//         this.trig.actionManager.registerAction( 
//             new ExecuteCodeAction(
//                 {
//                     trigger: ActionManager.OnIntersectionExitTrigger,
//                     parameter: {
//                     mesh: car,
//                     usePreciseIntersection: true
//                     },
//                 },
//                 function(){
//                     if (this.status === 'red') 
//                     score.newScore('TRAFFIC_LIGHT_BAD', -100);
//                     if (this.status === 'green' || this.status === 'orange')
//                     score.newScore('TRAFFIC_LIGHT_GOOD', 50);
//                 })
//         )
//         }) 
//     })()     
// }

//     createLightRotation = (colors, type, idx) => {
//         var cols = {
//         red: new Color3(1, 0, 0),
//         none: new Color3(0, 0, 0),
//         green: new Color3(0, 1, 0),
//         orange: new Color3(1, 0.4, 0)
//         }
//         colors[type === 'red' ? 2 : 0].emissiveColor = cols[type];
    
//         setInterval(() => {
//         if (status === 'green'){
//             setColors(colors, [cols['none'], cols['orange'], cols['none']]);
//             status = 'orange'
//             setTimeout(() => {
//                 setColors(colors, [cols['none'], cols['none'], cols['red']]);
//                 status = 'red'
//             }, 2000)
//         } else if (status === 'red'){
//             setColors(colors, [cols['green'], cols['none'], cols['none']])
//             status = 'green'
//         }
//         }, 15000)
//     }
// }

// function setColors(colors, newcolor){
//    colors[0].emissiveColor = newcolor[0]
//    colors[1].emissiveColor = newcolor[1]
//    colors[2].emissiveColor = newcolor[2]
// }


// const loadTrafficLightModel = (scene: Scene): Promise<Mesh> => {
//     return SceneLoader.ImportMeshAsync('', "../mesh/DoubleTrafficLight/", "doubletraffic.obj", scene).then(function(newMesh) {
//     let msh = newMesh['meshes'] as Mesh[]
//     var lights = [];
//       var colors = [new StandardMaterial('green', scene), new StandardMaterial('orange', scene), new StandardMaterial('red', scene)]
//       var meshColor = ['green', 'orange', 'red']
//       var test;
//       var x = 0;
//       meshColor.forEach((color, colnb = 0) => {
//          test = newMesh.meshes.filter(msh => msh.name.includes(color))
//          lights.push(...test)
//          lights[x].material = colors[colnb];
//          lights[x+1].material = colors[colnb];
//          x+=2;
//       })
//       const traffic = Mesh.MergeMeshes(msh, true, false, undefined, false, true);
//       traffic.name = 'light'
//       traffic.scalingDeterminant = 0.8
      
//     //   createLightRotation(colors, type, idx)
//         return traffic
//     }) 
// }


// export const addTrafficLInstance = (mesh: Mesh, x: number, y: number, ori: Vector3) => {
//     let newmesh = mesh.createInstance('traffic' + id++)
//     newmesh.scalingDeterminant = 0.8
//     new CarBot(newmesh, x, y, ori, scene)
// }


// export const createTrafficLight = (container: AssetContainer, bots: CarBot, scene: Scene): Promise<Mesh>  => {
//    return (async () => {
//         trafficMesh = await loadTrafficLightModel(scene)
//         container = container
//         carbots = bots
//         trafficMesh.scalingDeterminant = 0.8
//         return trafficMesh
//    })()
// }