//import '@babylonjs/core/Loading/Plugins';
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { ways } from './map'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

var propsContainer;

var duplicate = function(container, x, y) {
    let entries = container.instantiateModelsToScene();

    for (var node of entries.rootNodes) {
        node.position.x += x;
        node.position.z += y;
    }
}

function createTree(scene, propsContainer) {
    new SceneLoader.LoadAssetContainer("../mesh/Tree/", "Tree.obj", scene, function(container){
    container.addAllToScene();
    
    ways.forEach(way => {

        for (var i = 1; i < way.points.length-1; i++){
            var posTab = getInterPos(way.points[i], way.points[i+1]);

            duplicate(container, posTab['xL'], posTab['yL'])
            duplicate(container, posTab['xR'], posTab['yR'])
        }
     })
     propsContainer = container;
     console.log(propsContainer);
   })
}


function getInterPos(curr, next){
    var xD = next.x - curr.x;
    var yD = next.y - curr.y;
    var dist = Math.sqrt(Math.pow(xD, 2) + Math.pow(yD, 2));
    var div = 10;
    var fract;
    //var fract = 20 / dist;

    //while (div < 100){//adapt to building algo
    fract = div/dist;
    if (xD/yD > 0.25 && xD/yD < 4)
        return {xR: (curr.x + xD * fract) + 5, yR: (curr.y + yD * fract) - 5, xL: (curr.x + xD * fract) - 5, yL: (curr.y + yD * fract) + 5}; 
    else if (xD/yD > -4 && xD/yD < -0.25 )
        return {xR: (curr.x + xD * fract) + 5, yR: (curr.y + yD * fract) + 5, xL: (curr.x + xD * fract) - 5, yL: (curr.y + yD * fract) - 5}; 
    else if (xD > yD)
        return {xR: (curr.x + xD * fract), yR: (curr.y + yD * fract) + 8, xL: (curr.x + xD * fract), yL: (curr.y + yD * fract) - 8}; 
    else
        return {xR: (curr.x + xD * fract) + 8, yR: (curr.y + yD * fract), xL: (curr.x + xD * fract) - 8, yL: (curr.y + yD * fract)};
        
    //}
}

export function disableTrees(){
console.log(
    propsContainer
)}

export default function dressMap(scene){
    createTree(scene, propsContainer);
}


/*
function treesDebug(){
    //debug 
    // var options = {
    //     diameterTop:2, 
    //     diameterBottom: 2, 
    //     height: 80, 
    //     tessellation: 10, 
    //     subdivisions: 1
    // }

    ways.forEach(way => {
        for (var i = 1; i < way.points.length-1; i++){
                var posTab = getInterPos(way.points[i], way.points[i+1]);
                
                for (var node of entries.rootNodes) {
                    console.log('done')
                    node.position = new Vector3(posTab['xL'], 1, posTab['yL']);
                    node.position = new Vector3(posTab['xR'], 1, posTab['yR']);
                }    
            entries.mesh[0].position = new Vector3(posTab['xL'], 1, posTab['yL']);
            entries.mesh[0].position = new Vector3(posTab['xR'], 1, posTab['yR']);            
            var Lcol = new MeshBuilder.CreateCylinder('test', options);
            var Rcol = new MeshBuilder.CreateCylinder('test', options);
            var color = new StandardMaterial("myMaterial", scene);
            color.diffuseColor = posTab.color;
            color.emissiveColor = posTab.color;
            Lcol.position = new Vector3(posTab['xL'], 1, posTab['yL']);
            Rcol.position = new Vector3(posTab['xR'], 1, posTab['yR']);
            Lcol.material = color;
            Rcol.material = color;
            //end debug
        }
    })
}*/