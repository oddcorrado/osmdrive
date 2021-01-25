
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'

export default function spawnDefault(scene, type, x, y) {
    const rotSign = new Vector3(0, Math.PI, 0);
    const posSign = new Vector3(x, 0, y);
   
    return new SceneLoader.ImportMeshAsync('', `../mesh/Panels/${type}/`, `${type}.obj`, scene).then(function(newMesh) {
       const sign = Mesh.MergeMeshes(newMesh['meshes'], true, false, undefined, false, true);
       sign.name = type;
       sign.scalingDeterminant = 1;
       sign.position = posSign;
       sign.rotation = rotSign;
       return sign;
    })
 }