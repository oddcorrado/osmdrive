import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Scene } from "@babylonjs/core/scene"
import { CarBot } from "./carbotsIndependantDetector"
import { Vector3 } from "@babylonjs/core/Maths/math"
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions"
import { AssetContainer } from "@babylonjs/core/assetContainer"
import mainCarLoaded from "../car/carloaded"
import { BikeFree } from "./bikeFree"

let scriptBotPos: Vector3[] = [
   // new Vector3(-198,0.1,-113),//light 1
   new Vector3(-198,0.1,-130),//light 1
    new Vector3(-148,0.1,-102),//light 2
    new Vector3(-46,0,-102),//light 3
    new Vector3(2,0,-50),//light 4
    new Vector3(160,0,-2),//stop 1
    new Vector3(201,0,12),// yield 1
]

let carbotsId = [
    [0,1],
    [2,3],
    [4,5],
    [6],
    [7],
    [8]
]

let scriptBikePos: Vector3[] = [
    new Vector3(2, 0, -64)
]

let bikeId = [
    [0]
]

const addActionTrigBot = (scene: Scene, car: Mesh, bots: CarBot[], trig: Mesh, i: number) => {
    trig.actionManager = new ActionManager(scene)
        trig.actionManager.registerAction(
        new ExecuteCodeAction(
            {
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: car
                }
            },
            () => {
                carbotsId[i].forEach(x => {
                    bots[x].bot.isVisible = true
                    bots[x].go = true
                })
            }
        )
    )
}

const addActionTrigBike = (scene: Scene, car: Mesh, bikes: BikeFree[], trig: Mesh, i:number) => {
    trig.actionManager = new ActionManager(scene)
        trig.actionManager.registerAction(
        new ExecuteCodeAction(
            {
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: car
                }
            },
            () => {
                bikeId[i].forEach(x => {
                    bikes[x].go = true
                })
            })
    )
}

export const createScriptTriggers = (scene: Scene, container:AssetContainer, bots: CarBot[], bikes:BikeFree[], nb: number) => {
    (async () => {
        let car = await mainCarLoaded(container)
        for (let i = 0 ; i < nb; i++){
            let trig = MeshBuilder.CreateBox(`trig${i}`, {width: 1, depth: 1, height: 1}, scene)
            trig.position = scriptBotPos[i]
            trig.isVisible = false
            addActionTrigBot(scene, car, bots, trig, i)
        }
        for (let i = 0; i < scriptBikePos.length; i++){
                let biketrig = MeshBuilder.CreateBox(`trig${i}`, {width: 1, depth: 1, height: 1}, scene)
                biketrig.position = scriptBikePos[i]
                biketrig.isVisible = false
                addActionTrigBike(scene, car, bikes, biketrig, i)
        }
    })()
}

