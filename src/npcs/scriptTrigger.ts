import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Scene } from "@babylonjs/core/scene"
import { CarBot } from "./carbotsIndependantDetector"
import { Vector3 } from "@babylonjs/core/Maths/math"
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions"
import { AssetContainer } from "@babylonjs/core/assetContainer"
import mainCarLoaded from "../car/carloaded"

let scriptPos: Vector3[] = [
    new Vector3(-198,0.1,-113),
    new Vector3(-115,0.1,-102)
]

let carbotsId = [
    [0,1],
    [2,3]
]

const addActionTrig = (scene: Scene, car: Mesh, bots: CarBot[], trig: Mesh, i: number) => {
    trig.actionManager = new ActionManager(scene)
    console.log(car)
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
                    bots[x].go = true
                })
            }
        )
    )
}

export const createScriptTriggers = (scene: Scene, container:AssetContainer, bots: CarBot[], nb: number) => {
    (async () => {
        let car = await mainCarLoaded(container)
        for (let i = 0 ; i < nb; i++){
            let trig = MeshBuilder.CreateBox(`trig${i}`, {width: 1, depth: 1, height: 1}, scene)
            trig.position = scriptPos[i]
            addActionTrig(scene, car, bots, trig, i)
        }
    })()
}

