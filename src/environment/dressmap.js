//import '@babylonjs/core/Loading/Plugins'
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { ways } from '../map'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import spawnStop from '../roadsigns/stopsign'
import spawnNoEntry  from '../roadsigns/noentrysign'
import spawnSpeedSign from '../roadsigns/speedlimit'
import spawnYield from '../roadsigns/yieldsign'
import { spawnTrafficLight } from '../roadsigns/trafficlight.js'
import { ActionManager } from '@babylonjs/core/Actions'
import {setSounds} from '../sounds/carsound'
import {setStatus} from '../index'
import spawnProp from '../roadsigns/loadProp'
import loadArrow from '../props/arrow'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
//import {createCarBots, loadCarBots} from '../npcs/carbots'
import {createCarBots} from '../npcs/carbotsIndependantDetector'
//import {createCarBots} from '../npcs/carbotsSPS'
import preventCollision from '../npcs/preventCollisions'
import {createScriptTriggers} from '../npcs/scriptTrigger'

let propsContainer
let pavements

function getInterPos(curr, next){
    var xD = next.x - curr.x
    var yD = next.y - curr.y
    var dist = Math.sqrt(Math.pow(xD, 2) + Math.pow(yD, 2))
    var div = 10
    var fract
    //var fract = 20 / dist

    //while (div < 100){//adapt to building algo
    fract = div/dist
    if (xD/yD > 0.25 && xD/yD < 4)
        return {xR: (curr.x + xD * fract) + 5, yR: (curr.y + yD * fract) - 5, xL: (curr.x + xD * fract) - 5, yL: (curr.y + yD * fract) + 5} 
    else if (xD/yD > -4 && xD/yD < -0.25 )
        return {xR: (curr.x + xD * fract) + 5, yR: (curr.y + yD * fract) + 5, xL: (curr.x + xD * fract) - 5, yL: (curr.y + yD * fract) - 5} 
    else if (xD > yD)
        return {xR: (curr.x + xD * fract), yR: (curr.y + yD * fract) + 8, xL: (curr.x + xD * fract), yL: (curr.y + yD * fract) - 8} 
    else
        return {xR: (curr.x + xD * fract) + 8, yR: (curr.y + yD * fract), xL: (curr.x + xD * fract) - 8, yL: (curr.y + yD * fract)}
        
    //}
}

function createTrees(scene) {
    new SceneLoader.ImportMeshAsync('', "../mesh/Treebis/", "tree.obj", scene).then(function (newMesh){
    let tree = Mesh.MergeMeshes(newMesh['meshes'], true, true, undefined, false, true)
    ways.forEach(way => {
        for (var i = 1; i < way.points.length-1; i++){
            var posTab = getInterPos(way.points[i], way.points[i+1])
            addInstance(tree, posTab['xL'], posTab['yL'])
            addInstance(tree, posTab['xR'], posTab['yR'])
        }
     })
     tree.isVisible = false
     setStatus('trees')
   })
}

export function disableTrees(){
    console.log(propsContainer)
}

function addInstance(mesh, x , y){
    let newmesh = mesh.createInstance('newmesh')
    newmesh.position = new Vector3(x, 0.1, y)
}

export default function dressMap(scene, container){
    scene.actionManager = new ActionManager(scene)
    setSounds(scene)
    createTrees(scene);

    (async () => {
       let bots = await createCarBots(scene, 10) 
        spawnTrafficLight(container, bots, scene, -195, -105, Math.PI, 'red')
        spawnTrafficLight(container, bots, scene, -105, -105, -Math.PI/2, 'red')
        spawnTrafficLight(container, bots, scene, -5, -105, -Math.PI/2, 'red')
        spawnTrafficLight(container, bots, scene, 5, -5, Math.PI, 'green')

        spawnStop(container, bots, scene, 195, -5, Math.PI)
        spawnYield(container, scene, 205, 95, Math.PI)
        spawnNoEntry(container, scene, 203, 207)
        createScriptTriggers(scene, container, bots)
        preventCollision(scene, container, bots)
        createScriptTriggers(scene,container,bots,6)
        setStatus('assets')
    })()
   //botshandler.createBots(scene, container)
    //AVAILABLE:
    // spawnTrafficLight(container, scene, 295, -105)
    // spawnYield(container, scene, 95, -5)
    // spawnStop(container, scene, 195, -5)
    // spawnNoEntry(container, scene, 304, 105)
    // spawnSpeedSign(container, scene, '30', 15, -5)//'50', '100'
    //
    loadArrow(scene)
    spawnSpeedSign(container, scene, '30', -195, -280, Math.PI)
    //spawnProp(scene, 0, 0)
}

