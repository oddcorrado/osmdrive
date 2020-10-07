
import { buildings } from './map'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import {createTextureCollection} from './textureCollection'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'

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

function createSquare(squa, scene){

    var customMesh = new Mesh("custom", scene);
    var vertexData = new VertexData();
    var mat = new StandardMaterial("mat", scene);
    var color = new Color3(1,0,0);
    var positions = [squa.botL.x, squa.botL.y, squa.botL.z, squa.botR.x, squa.botR.y, squa.botR.z, squa.topL.x, squa.topL.y, squa.topL.z, squa.topR.x, squa.topR.y, squa.topR.z]
    var indices = [0, 1, 2, 0, 2, 3, 0, 3, 1]

    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.applyToMesh(customMesh);
     
    mat.wireframe = true;
    mat.backFaceCulling = false;
    mat.disableLighting = false;
     
    customMesh.material = mat;
    customMesh.material.diffuseColor = color;
    customMesh.material.emissiveColor = color;
    return customMesh;
 }

function getGridFromSide(pointA, pointB, nbPoints, levels){
    var tmpPoints = [];

    if (nbPoints === 0) {
        for (var z = 0; z < levels; z++){
            tmpPoints.push({
                botL: new Vector3(pointA.x, z * 3, pointA.y),
                topL: new Vector3(pointA.x, (z + 1) * 3, pointA.y),
                botR: new Vector3(pointB.x, z * 3, pointB.y),
                topR: new Vector3(pointB.x, (z + 1) * 3, pointB.y)
            })
        }
    } else {
        for (var i = 0; i < nbPoints; i++) {
            for (var z = 0; z < levels; z++){
                    tmpPoints.push({
                        botL: new Vector3(((pointA.x - pointB.x) / nbPoints) * i + pointB.x, z * 3, ((pointA.y - pointB.y) / nbPoints) * i + pointB.y),
                        topL: new Vector3(((pointA.x - pointB.x) / nbPoints) * i + pointB.x, (z + 1) * 3, ((pointA.y - pointB.y) / nbPoints) * i + pointB.y),
                        botR: new Vector3(((pointA.x - pointB.x) / nbPoints) * (i + 1) + pointB.x, z * 3, ((pointA.y - pointB.y) / nbPoints) * (i + 1) + pointB.y),
                        topR: new Vector3(((pointA.x - pointB.x) / nbPoints) * (i + 1) + pointB.x, (z + 1) * 3, ((pointA.y - pointB.y) / nbPoints) * (i + 1) + pointB.y)
                    })
            }
        }
    }

    return tmpPoints;
}

export default function createBuildings(scene) {
    var mats = [[],[],[],[],[]];
    var textureCollection = createTextureCollection(scene);
    var grid = [];
    var tmpGrid;
    var gridMesh = [];

   textureCollection.forEach((txtrType, y = 0) => {
       txtrType.forEach((txtr, i = 0) => {
           mats[y].push(materialCreator(scene, `mat${y,i}`))
           mats[y][i].diffuseTexture = txtr.texture
       })
   }) 

   
   

    buildings.forEach((way, y = 0) => {
        var ln = way.points.length;
        for (var i = 0; i < ln; i++){
            var pointA = way.points[i];
            var pointB = (i === ln - 1 ? way.points[0] : way.points[i+1]);
            var numberOfPoints = (Math.round(Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointB.y - pointB.y, 2)) / 2));

            var newGrid = getGridFromSide(pointA, pointB, numberOfPoints, way.levels);
            tmpGrid = [...grid, ...newGrid];
            grid = tmpGrid;

            //debug wireframe
            if (y == 52){
                //Gives the number of grid in a wall + the size of the wall
                //console.log(numberOfPoints, Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointB.y - pointB.y, 2)))
                newGrid.forEach(sq => {
                    gridMesh.push(createSquare(sq, scene));
                })
            }
        }
       
      

        const floorPoints = way.points.map( point => new Vector3(point.x, 0.1, point.y))
        const roofPoints = way.points.map( point => new Vector3(point.x, way.levels * 3, point.y))
        const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [floorPoints, roofPoints] },  scene )      
        //const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [grid.bot, roofPoints] },  scene )
        /*
        ** each building is created wall by wall, each has a Vector that defines one angle.
        ** each is created by giving to CreateRibbon an array containing all Vectors of one building
        ** to create ribbon with the new grid system
        ** group grid points by type (floor/ground), do it as grid are loaded
        ** get how ribbon are created, and adapt grids to the CreateRibbon
        */
        //texture random selector
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

    gridMesh.visibility = 0;
    return gridMesh;
}