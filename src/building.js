
import { buildings } from './map'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import {createTextureCollection} from './textureCollection'

function materialCreator(scene, name){
    const tmpMat = new StandardMaterial(name, scene);
    tmpMat.alpha = 1;
    tmpMat.diffuseColor = new Color3(1, 1, 1);
    tmpMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
    tmpMat.backFaceCulling = false
    return tmpMat;
}

function textureCreator(scene, source, uS, vS){
    const tmpTxtur = new Texture(source, scene)

    tmpTxtur.uScale = uS
    tmpTxtur.vScale = vS

    return tmpTxtur
}

export default function createBuildings(scene) {
    var mats = [[],[],[],[],[]];
    var textureCollection = createTextureCollection(scene);
  
    
    //get wall size before creating texture?
    //put random here?
   textureCollection.forEach((txtrType, y = 0) => {
       txtrType.forEach((txtr, i = 0) => {
           mats[y].push(materialCreator(scene, `mat${y,i}`))
           mats[y][i].diffuseTexture = txtr.texture
       })
   })
  
    

    buildings.forEach(way => {
        const floorPoints = way.points.map( point => new Vector3(point.x, 0.1, point.y))
        const roofPoints = way.points.map( point => new Vector3(point.x, way.levels * 3, point.y))

        const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [floorPoints, roofPoints] },  scene )

        ribbon.material = mats[0][0];
      
        if (way.levels > 12){
           ribbon.material = (mats[4][Math.random() * mats[4].length | 0]);
        } else if (way.levels >= 6){
            ribbon.material = (mats[3][Math.random() * mats[3].length | 0]);
        } else if (way.levels > 3){
            ribbon.material = (mats[2][Math.random() * mats[2].length | 0]);
        } else if (way.levels >= 2) {
            ribbon.material = (mats[1][Math.random() * mats[1].length | 0]);
        } else {
            ribbon.material = (mats[0][Math.random() * mats[0].length | 0]);
        }
    
    
    })
}//create floors and roofs