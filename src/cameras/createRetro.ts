import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { Vector3 } from "@babylonjs/core/Maths/math"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { Scene } from "@babylonjs/core/scene"
import { Camera } from "@babylonjs/core/Cameras/camera"

export const createRetro = (scene: Scene, cameras: Camera) => {
    let mirror =  MeshBuilder.CreatePlane('plane', {height: 0.33, width: 1.07, sideOrientation: Mesh.FRONTSIDE})
    let text = new RenderTargetTexture('tex', 512, scene)

    mirror.parent = scene.activeCameras[0]
    mirror.rotation = new Vector3(0, 0, 0)
    mirror.position = new Vector3(0,0.5,1.6)
    text.activeCamera = cameras[2]

    console.log(scene.meshes)
    scene.meshes.forEach((msh, i) =>{
       // if (msh != mirror && msh != InstancedMesh){text.renderList.push(msh)}
        if (i < 200){text.renderList.push(msh)}
    })
    console.log(text.renderList)

    text.uScale = -1
    let mat = new StandardMaterial('mat', scene)
    mat.emissiveTexture = text
    mirror.material = mat
    
	scene.registerBeforeRender(() => {
        text.render()
    })
}