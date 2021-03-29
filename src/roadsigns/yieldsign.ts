import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3, ToLinearSpace } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions'
import score from '../scoring/scoring'
import { getSpeed } from '../controls/loops'
import { Scene } from '@babylonjs/core/scene'
import { AssetContainer } from '@babylonjs/core/assetContainer'

function clearSceneActionManager(scene){
   if (scene.actionManager.actions)
      scene.actionManager.actions = []
}

async function createAction(scene: Scene, trig: Mesh, container:AssetContainer){
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
            const speed = getSpeed()
            score.newScore('YIELD', speed*150 >= 25 ? -50 : 50)
         })
      )
   })
}

export default function spawnYield(container, scene, x, y, ori) {
   let mat = new StandardMaterial("matstop", scene)
   let line = [MeshBuilder.CreateBox('line1', {width:1, height:1, depth: 0.3}, scene),
               MeshBuilder.CreateBox('line2', {width:1, height:1, depth: 0.3}, scene),
               MeshBuilder.CreateBox('line3', {width:1, height:1, depth: 0.3}, scene)]
   let trig = MeshBuilder.CreateBox('box', {width:1, height:1, depth: 0.3}, scene)
   //const rotSign = new Vector3(0, -Math.PI/2, 0)
   const rotSign = new Vector3(0, ori, 0)
   const posSign = new Vector3(x, 0, y)
   const lineRot = new Vector3(Math.PI/2, ori/10*2.3, y)
   const linePos = new Vector3(x - 1.8, -0.01, y + 1)
   const trigPos = new Vector3(x - 3, 1, y)

   mat.diffuseColor = new Color3(1, 1, 1)
   mat.emissiveColor = new Color3(1, 1, 1)

   
   line.forEach((box, i = 0) => {
      box.position = new Vector3(linePos.x - i*1.3,linePos.y,linePos.z)
      box.rotation = lineRot
      box.material = mat
   })
   trig.position = trigPos
   trig.rotation = lineRot
   trig.isVisible = false
   
   // return new SceneLoader.ImportMeshAsync('', "../mesh/Panels/Yield/", "signYield.obj", scene).then(function(newMesh) {
   return  SceneLoader.ImportMeshAsync('', "../mesh/NewPanels/", "YieldRev.obj", scene).then(function(newMesh) {
      let msh = newMesh['meshes'] as Mesh[]
      const sign = Mesh.MergeMeshes(msh, true, false, undefined, false, true)
      sign.name = 'yield'
      sign.id = 'sign'
      sign.scalingDeterminant = 0.8
      sign.position = posSign
      sign.rotation = rotSign
      createAction(scene, trig, container)
      return sign
   })
}