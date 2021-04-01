//import '@babylonjs/core/Loading/Plugins'
import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { ways } from '../map'
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
import {createCarBots} from '../npcs/carbotsIndependantDetector'
import {createBikeBots} from '../npcs/bikeFree'
import preventCollision from '../npcs/preventCollisions'
import {createScriptTriggers} from '../npcs/scriptTrigger'
import {createParking} from './parking'
import { Scene } from '@babylonjs/core/scene'
import { AssetContainer } from '@babylonjs/core/assetContainer'
import loadPanels from '../roadsigns/loadPanels'
import spawnPanel from '../roadsigns/spawnPanel'
import spawnTrafficLightSq from '../roadsigns/trafficLightClass'
import mainCarLoaded from '../car/carloaded'


function getInterPos(curr: Vector3, next: Vector3){
    let xD:number = next.x - curr.x
    let yD:number = next.y - curr.y
    let dist:number = Math.sqrt(Math.pow(xD, 2) + Math.pow(yD, 2))
    let div:number = 10
    let fract:number
    let offsetRoadR:number = 2
    let offsetRoadL:number = 6
    //var fract = 20 / dist

    fract = div/dist
    if (xD/yD > 0.25 && xD/yD < 4)
        return {xR: (curr.x + xD * fract) + offsetRoadR, yR: (curr.y + yD * fract) - offsetRoadR, xL: (curr.x + xD * fract) - offsetRoadR, yL: (curr.y + yD * fract) + offsetRoadR} 
    else if (xD/yD > -4 && xD/yD < -0.25 )
        return {xR: (curr.x + xD * fract) + offsetRoadR, yR: (curr.y + yD * fract) + offsetRoadR, xL: (curr.x + xD * fract) - offsetRoadR, yL: (curr.y + yD * fract) - offsetRoadR} 
    else if (xD > yD)
        return {xR: (curr.x + xD * fract), yR: (curr.y + yD * fract) + offsetRoadL, xL: (curr.x + xD * fract), yL: (curr.y + yD * fract) - offsetRoadL} 
    else
        return {xR: (curr.x + xD * fract) + offsetRoadL, yR: (curr.y + yD * fract), xL: (curr.x + xD * fract) - offsetRoadL, yL: (curr.y + yD * fract)}
}

function createTrees(scene: Scene) {
    SceneLoader.ImportMeshAsync('', "../mesh/NewTree/", "tree.obj", scene).then(function (newMesh1){
     //   SceneLoader.ImportMeshAsync('', "../mesh/NewTree/", "tree.obj", scene).then(function (newMesh2){
   //         SceneLoader.ImportMeshAsync('', "../mesh/NewTree/", "tree.obj", scene).then(function (newMesh3){
                
                let mshs1 = newMesh1['meshes'] as Mesh[]
                //let mshs2 = newMesh1['meshes'] as Mesh[]
                //let mshs3 = newMesh1['meshes'] as Mesh[]
                let tree1 = Mesh.MergeMeshes(mshs1, true, true, undefined, false, true)
                //let tree2 = Mesh.MergeMeshes(mshs2, true, true, undefined, false, true)
                //let tree3 = Mesh.MergeMeshes(mshs3, true, true, undefined, false, true)
                let trees = []
                ways.forEach(way => {
                    for (var i = 1; i < way.points.length-1; i++){
                        var posTab = getInterPos(way.points[i], way.points[i+1])
                        addInstance(tree1, posTab['xL'], posTab['yL'])
                        addInstance(tree1, posTab['xR'], posTab['yR'])
                    }
                })
                tree1.isVisible = false
              //  tree2.isVisible = false
               // tree3.isVisible = false
                setStatus('trees')
            })
       // })
   //})
}

function addInstance(mesh: Mesh, x: number , y: number){
    let newmesh = mesh.createInstance('newmesh')
    newmesh.position = new Vector3(x, 0.1, y)
    newmesh.scalingDeterminant = 3
    newmesh.rotation = new Vector3(0,Math.random() * Math.PI,0)
}

export default function dressMap(scene: Scene, container:AssetContainer){
    scene.actionManager = new ActionManager(scene)
    setSounds(scene)
    createTrees(scene);

    (async () => {
        // available panels 110Limit, EndBikeLane, Zone30, EndInterdiction, LowBranches, NoTraffic, OneWay, Yield50, School, Slippery, PedestrianLane, LevelCrossing, PriorityRoad, PrioRight
       let bots = await createCarBots(scene, 10) 
       let bikes = await createBikeBots(scene, 1)
       let panels: Object = await loadPanels(scene)
        let car: Mesh = await mainCarLoaded(container) 

        spawnSpeedSign(container, scene, 30, panels['Zone30'], -195, -270, Math.PI)
        spawnPanel(panels['PriorityRoad'], [new Vector3(-195, 0, -250), new Vector3(0, Math.PI, 0)])
        spawnYield(container, scene, -212.5, -205, -Math.PI/2)
        spawnYield(container, scene, -187.5, -195, Math.PI/2)
        spawnTrafficLightSq(scene, car, bots, [new Vector3(-200, 0, -100), new Vector3(-100, 0, -100), new Vector3(0, 0, -100), new Vector3(0, 0, 0)])
        spawnPanel(panels['PrioRight'], [new Vector3(75, 0, -5), new Vector3(0, -Math.PI/2, 0)])
        spawnStop(container, bots, scene, 195, -5, Math.PI)
        spawnPanel(panels['Yield50'], [new Vector3(205, 0, 25), new Vector3(0, Math.PI, 0)])
        spawnYield(container, scene, 205, 87.5, Math.PI)
        spawnSpeedSign(container, scene, 50, panels['Zone30End'], 205, 124, Math.PI)
        spawnNoEntry(container, scene, 203, 207)
        preventCollision(scene, container, bots)
        createScriptTriggers(scene, container, bots, bikes, 6)
        spawnSpeedSign(container, scene, 110, panels['110Limit'], 305, 222,Math.PI)
        createParking(scene)
        for (let name in panels){
            panels[name].isVisible = false
        }
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
  //  spawnProp(scene, -190, -270)
}

