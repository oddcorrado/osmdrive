import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3, ToLinearSpace } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions'
import score from '../scoring/scoring'
import { getSpeed } from '../controls/loops'




export default function spawnProp(scene, x, y) {
   return new SceneLoader.ImportMeshAsync('', "../mesh/Bike/", "bike.obj", scene).then(function(newMesh) {
   let prop = newMesh['meshes'][0]
      prop.position = new Vector3(0,0,0)
   })
}