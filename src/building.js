
import { buildings } from './map'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import {createTextureCollection} from './textureCollection'
import { LinesMesh } from '@babylonjs/core/Meshes/linesMesh'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Material } from '@babylonjs/core/Materials/material'

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
  
    



   
   const floorPoints = buildings[0].points.map( point => new Vector3(point.x, 0.1, point.y))
   const roofPoints = buildings[0].points.map( point => new Vector3(point.x, buildings[0].levels * 3, point.y))

   const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [floorPoints, roofPoints] },  scene )
   console.log('', floorPoints);
   ribbon.material = (mats[3][Math.random() * mats[3].length | 0]);
  
   var options = {
    diameterTop:0.1, 
    diameterBottom: 0.1, 
    height: 40, 
    tessellation: 10, 
    subdivisions: 1,
    }

    var points = []; 

    var ln = buildings[0].points.length;
    console.log(ln);

    for (var i = 0; i < ln; i+=1){

       var pointA = buildings[0].points[i];
       var pointB = (i === ln - 1 ? buildings[0].points[0] : buildings[0].points[i+1]);
       var numberOfPoints = (Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointB.y - pointB.y, 2)) / 3 | 0);

        console.log(numberOfPoints);
        for (var z = 0; z <= numberOfPoints; z++) {
            var botL = new MeshBuilder.CreateSphere('sp', {}, scene);
            var topL = botL.clone();

            //getSquares

            console.log(new Vector3((pointA.x - pointB.x) / numberOfPoints * z + pointB.x, 0, (pointA.y - pointB.y) / numberOfPoints * z + pointB.y));
            botL.position = new Vector3((pointA.x - pointB.x) / numberOfPoints * z + pointB.x, 0, (pointA.y - pointB.y) / numberOfPoints * z + pointB.y);
            topL.position = new Vector3((pointA.x - pointB.x) / numberOfPoints * z + pointB.x, buildings[0].levels, (pointA.y - pointB.y) / numberOfPoints * z + pointB.y)
            points.push(
                        {botL: new Vector3((pointA.x - pointB.x) / numberOfPoints * z + pointB.x, 0, (pointA.y - pointB.y) / numberOfPoints * z + pointB.y)},
                        {topL: new Vector3((pointA.x - pointB.x) / numberOfPoints * z + pointB.x, 0/*height*/, (pointA.y - pointB.y) / numberOfPoints * z + pointB.y)},
                        {botR: new Vector3((pointA.x - pointB.x) / numberOfPoints * z + pointB.x, 0/*height*/, (pointA.y - pointB.y) / numberOfPoints * z + pointB.y)},
                        {topR: new Vector3((pointA.x - pointB.x) / numberOfPoints * z + pointB.x, 0/*height*/, (pointA.y - pointB.y) / numberOfPoints * z + pointB.y)}
            );
            console.log(points.pop());
          //  var Lcol = new MeshBuilder.CreateCylinder('test', options);
        }
    }
/*
    buildings[0].points.map(point => {
        var Lcol = new MeshBuilder.CreateCylinder('test', options);
        Lcol.position = new Vector3(point.x, 0, point.y);      
    })
*/
   
   
    buildings.forEach((way, i = 0) => {

        if (way.points.lenght < i){
        var point1 = new Vector3(way.points[i].x, 0, way.points[i+1].y);
        var point2 = new Vector3(way.points[i].x, 0, way.points[i+1].y);
        var line = MeshBuilder.CreateLines('lines', {points: [point1, point2]}, scene)
            line.material = new StandardMaterial("myMaterial", scene);
            line.material.diffuseColor = new Color3(1,0,0);
            line.material.emissiveColor = new Color3(1,0,0);
        }
    
        //test square buildings
        
        const floorPoints = way.points.map( point => new Vector3(point.x, 0.1, point.y))
        const roofPoints = way.points.map( point => new Vector3(point.x, way.levels * 3, point.y))

        const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [floorPoints, roofPoints] },  scene )
        console.log('floor', floorPoints);
      
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
}