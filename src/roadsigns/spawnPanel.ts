import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Scene } from '@babylonjs/core/scene'


export default function spawnPanel(mesh: Mesh, pos: Vector3[]) {
      mesh.isVisible = true
      let panel=mesh.createInstance('newpanel')
      console.log('spawning', panel)
      panel.position = pos[0]
      panel.rotation = pos[1]
     // mesh.isVisible = false
}