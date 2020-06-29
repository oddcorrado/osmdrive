
import { buildings } from './map'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'


export default function createBuildings(scene) {
    const buildingMat = new StandardMaterial("mat1", scene);
    buildingMat.alpha = 1;
    buildingMat.diffuseColor = new Color3(1, 1, 1);
    buildingMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
    buildingMat.backFaceCulling = false

    const buildingTexture = new Texture('./building.png', scene)
    buildingTexture.vScale = 3
    buildingTexture.uScale = 20
    buildingMat.diffuseTexture = buildingTexture

    buildings.forEach(way => {
        const floorPoints = way.points.map( point => new Vector3(point.x, 0.1, point.y))
        const roofPoints = way.points.map( point => new Vector3(point.x, way.levels * 3, point.y))
    
        // lines.push(MeshBuilder.CreateLines("floors", {points: floorPoints}, scene))
        // lines.push(MeshBuilder.CreateLines("roofs", {points: roofPoints}, scene))
        const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [floorPoints, roofPoints] },  scene )
        ribbon.material = buildingMat
        // shadowGenerator.getShadowMap().renderList.push(ribbon)
    
    })
}