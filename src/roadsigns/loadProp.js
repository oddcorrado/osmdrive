import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3, ToLinearSpace } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions'
import score from '../scoring/scoring'
import { getSpeed } from '../controls/loops'




export default function spawnStop(scene, x, y) {
   return new SceneLoader.ImportMeshAsync('', "../mesh/Props Tests/Buildings/", "Building01.obj", scene).then(function(newMesh) {
      // // const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true)
      // // sign.name = 'stop'
      // // sign.scalingDeterminant = 0.8
      // sign.position = posSign
      // sign.rotation = rotSign
      return sign
   })
}