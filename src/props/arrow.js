import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3, ToLinearSpace } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions'
import score from '../scoring/scoring'
import { getSpeed } from '../controls/loops'

let arrow = null

export function createInstanceArrow(x, y){
   let newarrow = arrow.createInstance('arrow')
   newarrow.position = new Vector3(x, 0.2, y)

   return newarrow
}

export default function loadArrow(scene) {
   (async () => {
       arrow = await new SceneLoader.ImportMeshAsync('', "../mesh/BlueArrow/", "Arrow.obj", scene).then(function(newMesh) {
         let arrow = newMesh['meshes'][0]
            arrow.position = new Vector3(0,10,0)
            arrow.scalingDeterminant = 1
            arrow.isVisible = false
            let mat = new StandardMaterial('arrow', scene)
            mat.emissiveColor = new Color3(0,0,1)
            arrow.material = mat
            return arrow
         })
   })()
}

export const getArrow = () => arrow