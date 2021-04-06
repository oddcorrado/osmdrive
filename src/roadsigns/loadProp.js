import  '@babylonjs/loaders/OBJ'
import  '@babylonjs/loaders/glTF'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3, ToLinearSpace } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ActionManager, ExecuteCodeAction, DoNothingAction } from '@babylonjs/core/Actions'
import score from '../scoring/scoring'
import { getSpeed } from '../controls/loops'




export  function spawnPropObj(scene) {
   return new SceneLoader.ImportMeshAsync('', "../mesh/BikerRider/", "testYield.obj", scene).then(function(newMesh) {
      
   })
}


export  function spawnPropGltf(scene) {
   SceneLoader.ImportMesh("", "../mesh/BikeRider/", "test2.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
      console.log(newMeshes, particleSystems, skeletons, animationGroups)
      
   //  var hero = newMeshes[0];
   //  //Scale the model down        
   //  hero.scaling.scaleInPlace(0.1);
   //  //Lock camera on the character 
   //  camera1.target = hero;
   //  //Get the Samba animation Group
     const anim = scene.getAnimationGroupByName("Armature.002|Armature.002|Armature|mixamo.com|Layer0|Armature.0");
     console.log(anim)
   //  //Play the Samba animation  
     //sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
});
}