import  '@babylonjs/loaders/OBJ'
import {SceneLoader, ISceneLoaderProgressEvent} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3} from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { feedbackDivCreator } from '../creators/buttoncreator';
import score from '../scoring/scoring'
import { Scene } from '@babylonjs/core/scene';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

let lights = []

// export const loadTrafficLight = (scene: Scene): AbstractMesh => {
//    //var lights = [];
//    var colors = [new StandardMaterial('green', scene), new StandardMaterial('orange', scene), new StandardMaterial('red', scene)]
//    var meshColor = ['green', 'orange', 'red']
//    var test;
//    var x = 0;
   

//     /*new*/ SceneLoader.ImportMeshAsync('', "../mesh/DoubleTrafficLight/", "doubletraffic.obj", scene).then(function(newMesh) {
//       meshColor.forEach((color, colnb = 0) => {
//          test = newMesh.meshes.filter(msh => msh.name.includes(color))
//          lights.push(...test)
//          lights[x].material = colors[colnb];
//          lights[x+1].material = colors[colnb];
//          x+=2;
//       })

//       const traffic = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
//       traffic.name = 'light'
//       traffic.scalingDeterminant = 0.8
//       return traffic
//    })
// }


// export const addInstanceOfTrafficLight = (mesh: Mesh, scene: Scene, x: number, y: number, ori: number) => {
//   // status.push(type)
//    //let idx = id++
//    let line = MeshBuilder.CreateBox('box', {width:1.5, height:1.5, depth: 0.3}, scene);     
//    const rotSign = new Vector3(0, ori, 0)
//    const posSign = new Vector3(x, 0, y)
//    const lineRot = new Vector3(Math.PI/2, 0, y)
//    const linePos = new Vector3(ori >= Math.PI ? x - 3 : x + 2, 1, y + 3)
//    line.position = linePos
//    line.rotation = lineRot
//    line.isVisible = false

//    let newmesh = mesh.createInstance('newmesh')
//    newmesh.position = new Vector3(x, 0.1, y)
// }
