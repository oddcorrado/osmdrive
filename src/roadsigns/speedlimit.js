
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import {setSpeedLimit} from '../scoring/speedScoring'
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions'

let limit;

async function createAction(scene, trig, container){
   var stopped = false
   trig.actionManager = new ActionManager(scene)
   return await new Promise (function(resolve) {
      const interval = setInterval(container =>  {
         if (container && container['meshes'].find(car => car.name == 'detailedcar')){
            resolve(container['meshes'].find(car => car.name == 'detailedcar'))
            clearInterval(interval)
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
            setSpeedLimit(parseInt(limit))
         })
      )
   })
}

export default function spawnSpeedSign(container, scene, speedLimit, x, y, ori) {
    const rotSign = new Vector3(0, ori, 0);
    const posSign = new Vector3(x, 0, y);
    let trig = MeshBuilder.CreateBox('box', {width:1, height:1.5, depth: 0.3}, scene)
    const trigRot = new Vector3(Math.PI/2, ori/10*4, y)
    const trigPos = new Vector3(x - 3, 1, y)

    trig.position = trigPos
    trig.rotation = trigRot
    trig.isVisible = false
    return new SceneLoader.ImportMeshAsync('', `../mesh/Panels/${speedLimit}/`, `${speedLimit}.obj`, scene).then(function(newMesh) {
       const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
       sign.name = speedLimit
       limit = speedLimit
       sign.scalingDeterminant = 1
       sign.position = posSign
       sign.rotation = rotSign
       createAction(scene, trig, container)
       return sign;
    })
 }