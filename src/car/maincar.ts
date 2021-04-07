import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Quaternion } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import {setStatus} from '../index'
import { AssetContainer } from '@babylonjs/core/assetContainer';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { Scene } from '@babylonjs/core/scene';

export default function createMainCar (scene: Scene, container: AssetContainer, cameras: Camera[]) {
    SceneLoader.ImportMeshAsync('', "../mesh/Cliofixed/", "test270deg.obj", scene).then(function(newMesh) {
    const msh = newMesh['meshes'] as Mesh[]
    var car = Mesh.MergeMeshes(msh, true, true, null, false, true)
    car.name = 'car'
    car.position = new Vector3(-198, 0, -280)
    car.scalingDeterminant = 0.6
    car.rotation = new Vector3(0,Math.PI/2,0)
    scene.activeCameras[0].parent = car
    cameras[2].parent = car
 //   scene.activeCameras[1].parent = car
    container.meshes.push(car)
    setStatus('car')
  })
}