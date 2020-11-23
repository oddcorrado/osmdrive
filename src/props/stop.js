import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

export function spawnSign(scene, x, y) {
    const position = new Vector3(x, 0.1, y);
    const rotation = new Vector3(0, Math.PI/5*4, 0);
    const posbis = new Vector3(x, 0.1, y+3.2);
    const rotbis = new Vector3(Math.PI/2, -Math.PI/8, 0);
    return new SceneLoader.ImportMeshAsync('', "../mesh/Stop/", "StopSign.obj", scene).then(function(newMesh) {
        const sign = Mesh.MergeMeshes(newMesh['meshes'], true, true, null, false, true);
        sign.name = 'stop';
        sign.scalingDeterminant = 0.8;
        sign.position = position;
        sign.rotation = rotation;

//        const plane1 = MeshBuilder.CreatePlane('planestop', {width:1, height:8, size: 2}, scene);
        const box = MeshBuilder.CreateBox('box', {width:2, height:3.8, depth: 0.2}, scene);
        box.position = posbis;
      //  box.rotation = new Vector3(-2, 0, 0);
        box.rotation = rotbis;
        var mat = new StandardMaterial("matstop", scene);
        mat.diffuseColor = new Color3(1, 1, 1);
        mat.specularColor = new Color3(1, 1, 1);
        mat.emissiveColor = new Color3(1, 1, 1);
       // mat.ambientColor = new Color3(1, 1, 1);
        box.material = mat;

      //  plane1.rotation = new Vector3(0, 0, 90);
        return sign;
   })
}