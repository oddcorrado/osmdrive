import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Quaternion } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import {setStatus} from '../index'

export default function createMainCar (scene, container) {
    new SceneLoader.ImportMeshAsync('', "../mesh/Cliofixed/", "test270deg.obj", scene).then(function(newMesh) {
    var car = Mesh.MergeMeshes(newMesh['meshes'], true, true, null, false, true)
    car.name = 'detailedcar'
    car.position = new Vector3(-200, 1.5, -280)
    car.scalingDeterminant = 0.6
    car.rotation = new Vector3(0,Math.PI/2,0)
    scene.activeCameras[0].parent = car
    scene.activeCameras[1].parent = car
    // scene.activeCameras[2].parent = car
    // scene.activeCameras[3].parent = car
    container.meshes.push(car)
    setStatus('car')
  })
}