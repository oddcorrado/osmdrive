import { Scene } from "@babylonjs/core/scene"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"
import { Vector3 } from "@babylonjs/core/Maths/math"
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh"
import { driverPathBuild, driverGetSmootherTarget } from '../ways/logic/driver'
import { Quaternion } from '@babylonjs/core/Maths/math.vector'
import { geoSegmentGetProjection, geoAngleForInterpolation} from '../geofind/geosegment'


class CarBot {
    bot: InstancedMesh
    nodes = null
    selection = null // 'R' or 'L' or null
    nextJuction = null
    oldjunct
    approach: number
    speed = 0
    startupDone = false
    prevAngle = 0
    prevTarget = new Vector3(0, 0, 0)
    fakeAcceleration = 0
    fakeAccelerationStep = 0.001
    fakeAccelerationMax = 0.03
    fakeYaw = 0
    fakeYawStep = 0.001
    fakeYawMax = 0.05
    turnChancePercentage = 100
    choiceMade = false
    
    constructor(mesh: InstancedMesh){
        this.bot = mesh
    }


    speedHandler = (): number => {
        if (this.speed * 150 < 30) {
            this.speed = Math.min(2, this.speed + 0.002)
            this.fakeAcceleration = Math.max(-this.fakeAccelerationMax, this.fakeAcceleration - this.fakeAccelerationStep)
        }
    
        //when it will brake 
        //speed = Math.max(0, speed - 0.004)
        //     fakeAcceleration =  Math.min(fakeAccelerationMax, fakeAcceleration + fakeAccelerationStep)
        return this.speed
    }

    // limitedTurn = (): boolean | string => {
    //     if ()
    //     let rand = Math.random() * 2 | 0
    //     // console.log(rand)
    //     return rand === 1 ? 'L' : 'R'
    // }

    getAvailableTurns = (next: Object): Object => {
        let available: Object

        console.log(next)
        return available
    }

    randomTurn = (): boolean | string => {
        if (this.nextJuction == null) {return null}
       // let availableTurns = this.getAvailableTurns(this.nextJuction)
       // let availableTurns: number = this.nextJuction.nexts.length
        let nextAction = Math.random() * 100
        this.choiceMade = true

        // if (availableTurns <= 1){
        //     return this.limitedTurn()
        // }
        console.log('all turns')
        return nextAction < this.turnChancePercentage / 2 ? 'L' : nextAction < this.turnChancePercentage ?  'R' : null
    }

    carBotsLoop = () => {
            this.selection = this.choiceMade ? this.selection : this.randomTurn()
            //console.log('selec',this.selection)
            let nodes: Object;
            const {nodes: builtNodes, selectionIndex} = driverPathBuild(this.bot.position, nodes, this.selection) 
            if(builtNodes == null || builtNodes.length == 0) { return }
            nodes = builtNodes
            const {target , normalProjection, nodes: newNodes, slice } = driverGetSmootherTarget(this.bot.position, this.prevTarget, nodes, 4 + 6 * this.speed)
            this.prevTarget = target
            if(slice && selectionIndex === 0) {this.selection === null, this.choiceMade = false}//setTimeout(() => {this.selection = null; this.choiceMade = false}, 1000) }
            nodes = newNodes // FIXME   
        
            this.oldjunct = this.oldjunct ? this.oldjunct : nodes[0]
                if (nodes[1].type === 'junction' && this.oldjunct && this.oldjunct.junctionIndex != nodes[1].junctionIndex){
                this.nextJuction = nodes[1]
                this.oldjunct = nodes[1]
            } else if (nodes[0].type === 'junction'){
                this.nextJuction = null
            }
            this.approach = this.nextJuction ? Math.sqrt(Math.pow(this.bot.position.x - this.nextJuction.point.x, 2) + Math.pow(this.bot.position.z - this.nextJuction.point.z, 2)) : null
        
            //if(this.startupDone == false && nodes != null) {
                //if (nodes != null) {this.bot.position = nodes[0].point }
                //this.startupDone = true
            //} 

            this.speed = this.speedHandler()
    
            if(this.speed > 0) {
                const dir = target.subtract(this.bot.position).normalize().scale(this.speed)
                this.bot.position = this.bot.position.add(dir)
        
                const to = -Math.atan2(dir.z, dir.x) + Math.PI/2
                const bestTo = geoAngleForInterpolation(this.prevAngle, to)
                const angle = this.prevAngle * 0.9 + bestTo * 0.1
                if(Math.abs(angle-this.prevAngle) > 0.001) {
                    if(angle > this.prevAngle) { this.fakeYaw = Math.min(this.fakeYaw, this.fakeYaw + this.fakeYaw) }
                    else { this.fakeYaw = Math.max(-this.fakeYaw, this.fakeYaw - this.fakeYaw) }
                } else {
                    this.fakeYaw *= 0.95
                }
                this.prevAngle = angle
                this.bot.rotationQuaternion = Quaternion.FromEulerAngles(this.fakeAcceleration, angle, this.fakeYaw)
            } else {
                this.fakeYaw *= 0.95
                this.bot.rotationQuaternion = Quaternion.FromEulerAngles(this.fakeAcceleration, this.prevAngle, this.fakeYaw)
                }                
    }

}

let botPos: Vector3[] = [
    new Vector3(-230 , 0.1, 101),
    new Vector3(300 , 0.1, 220),
    new Vector3(-295 , 0.1, 5),
    new Vector3(-190 , 0.1, -2),
    new Vector3(1, 0.1, 110)
]
let bots: InstancedMesh[] = []
let classbots: CarBot[] = []


const addBotInstanceClass = (mesh: Mesh, i: number): CarBot => {
    let newmesh = mesh.createInstance('carbot' + i)

    newmesh.position = botPos[i]
    newmesh.scalingDeterminant = 0.6
    return new CarBot(newmesh)
}

const loadBotModel = (scene: Scene): Promise<Mesh> => {
    return SceneLoader.ImportMeshAsync('', "../mesh/BotCar/", "cliobot.obj", scene).then(function(newMesh) {
        let msh = newMesh['meshes'] as Mesh[]
        let bot = Mesh.MergeMeshes(msh, true, false, undefined, false, true)
        bot.name = 'bot'
        bot.scalingDeterminant = 0.6
        return bot
    }) 

}

export const createCarBots = (scene: Scene, nb: number) => {
    nb = 5
    let mesh: Mesh

    (async () => {
        mesh = await loadBotModel(scene)
        mesh.isVisible = false
        mesh.scalingDeterminant = 0.6
       for (let i = 0; i < nb; i++){
          classbots.push(addBotInstanceClass(mesh, i))
       }
   })()
}

//randomise color
export const carBotsLoop = () => {
    classbots.forEach(bot => {
        bot.carBotsLoop()
    })
}
