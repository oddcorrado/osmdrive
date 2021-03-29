import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Scene } from '@babylonjs/core/scene'

//for now we load each at the same time, later we will load only the needed ones trough the creator of each panel who will ahve his own class
let loaded = 0
let toload: number
const load = async(name:string, scene:Scene):Promise<{pannel:Mesh, state:boolean}> => {
   return SceneLoader.ImportMeshAsync('', "../mesh/NewPanels/", `${name}.obj`, scene).then(function(newMesh) {
      let meshes = newMesh['meshes'] as Mesh[]
      let newpannel = Mesh.MergeMeshes(meshes, true, false, undefined, false, true);
      loaded++
      return {pannel: newpannel, state: loaded === toload?true:false}
   })
}

export default async function loadPanels(scene: Scene){
   return new Promise((resolve) => {
      let panelNames: string[] = ['110Limit', 'EndBikeLane', 'Zone30', 'EndInterdiction', 'LowBranches', 'NoTraffic', 'OneWay', 'Yield50', 'School', 'Slippery', 'PedestrianLane', 'LevelCrossing']
      let panels: Object = {}
      toload = panelNames.length
      panelNames.forEach(async(name, i=0) => {
               let pannelstate = await load(name, scene)
               panels[name] = pannelstate.pannel
               if (pannelstate.state){
                  resolve(panels)
               }
         })
      })
}
