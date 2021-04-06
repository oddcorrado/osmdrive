import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { Vector3 } from "@babylonjs/core/Maths/math"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { Scene } from "@babylonjs/core/scene"
import { Camera } from "@babylonjs/core/Cameras/camera"
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh"

export const createRetro = (scene: Scene, cameras: Camera) => {
    let mirror =  MeshBuilder.CreatePlane('plane', {height: 0.33, width: 0.885, sideOrientation: Mesh.FRONTSIDE})
    let text = new RenderTargetTexture('tex', 256, scene)
    let nameIgn = ['detector', 'detailedcar']
    mirror.parent = scene.activeCameras[0]
    mirror.rotation = new Vector3(0, 0, 0)
    mirror.position = new Vector3(0.01,0.464,1.58)
    text.activeCamera = cameras[2]
    
    scene.meshes.forEach((msh, i) =>{        
        if (msh && msh != mirror && !nameIgn.includes(msh.name) && msh.getClassName() != 'InstancedMesh'){
            text.renderList.push(msh)
        }
    })

    text.uScale = -1
    let mat = new StandardMaterial('mat', scene)
    mat.emissiveTexture = text
    mirror.material = mat
    
	scene.registerBeforeRender(() => {
        text.render()
    })
}