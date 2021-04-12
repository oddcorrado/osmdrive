
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import {setSpeedLimit} from '../scoring/speedScoring'
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions'

async function createAction(scene, trig, container, limit){
   trig.actionManager = new ActionManager(scene)
   let pannelDiv = document.getElementById('speedlimit')

   return await new Promise (function(resolve) {
      const interval = setInterval(container =>  {
         if (container && container['meshes'].find(car => car.name == 'car')){
            resolve(container['meshes'].find(car => car.name == 'car'))
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
            pannelDiv.src = '../../images/' + limit + '.svg'
            setSpeedLimit(parseInt(limit))
         })
      )
   })
}

export default function spawnSpeedSign(container, scene, speed, mesh, x, y, ori) {
    const rotSign = new Vector3(0, ori, 0);
    const posSign = new Vector3(x, 0, y);
    let trig = MeshBuilder.CreateBox('trigger', {width:0.5, height:0.3, depth: 0.5}, scene)
    const trigRot = new Vector3(0, ori, 0)
   const trigPos = Math.abs(ori)-(Math.PI/2) == 0 ? new Vector3(x+3, 1, y+3) : new Vector3(x-3, 1, y-3)
   //  const trigPos = new Vector3(x - 3, 1, y)

    trig.position = trigPos
    trig.rotation = trigRot
    trig.isVisible = false
      const sign = mesh.clone()
      sign.name = speed
      sign.id = 'sign'
      sign.scalingDeterminant = 1
      sign.position = posSign
      sign.rotation = rotSign
      createAction(scene, trig, container, speed)
}