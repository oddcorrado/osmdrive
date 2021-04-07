import { Scene } from "@babylonjs/core/scene"
import { MaterialDefines } from "@babylonjs/core/Materials/materialDefines"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh"


/*
** Optimizations based on doc: https://doc.babylonjs.com/divingDeeper/scene/optimize_your_scene
** Add your material/mesh to the corresponding ignore array
**
*/

export const optimizeScene = (scene: Scene) => {
    console.log(scene)
    let matIgnore = ['traffic', 'blinker']
    let meshIgnoreMatrix = ['car','bot','retro', 'plane']
    let meshIgnoreBounding = ['car','bot','retro', 'detector', 'trigger']

    scene.materials.forEach(mat => {if (!matIgnore.includes(mat.name)){mat.freeze()}})
    scene.meshes.forEach(msh => {
        //optimization for all meshes
        msh.freezeWorldMatrix()
        msh.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY 
        //

        //optimization for mesh that we can ignore the matrix of (still ones)
        if (!meshIgnoreMatrix.includes(msh.name)){
            if (msh.getClassName() === 'Mesh'){
                let m = msh as Mesh
                // try{
                //   m.convertToUnIndexedMesh()
                // }catch (e){
                //     console.log('error on ',msh)
                // }
                
               // msh.updateIndices([])
            }
        } 
        //

        // optimization for meshes that don't need collision/picking
        if (!meshIgnoreBounding.includes(msh.name)){
            msh.doNotSyncBoundingInfo = true
        } else {
            msh.alwaysSelectAsActiveMesh = true
        }
        //
    })

   //global scene optimization
   console.log(scene.getAnimationRatio())
  // setTimeout(() => {scene.freezeActiveMeshes(); console.log('freezing')}, 10000)
   scene.autoClear = false // Color buffer
   scene.autoClearDepthAndStencil = false//depth and stencil
   scene.blockMaterialDirtyMechanism = true//material clearing
   //
   
   //scene.debugLayer.show()
}