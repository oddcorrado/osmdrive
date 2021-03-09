import { Scene } from "@babylonjs/core/scene"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"
import { Vector3, Color3 } from "@babylonjs/core/Maths/math"
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh"
import { driverPathBuild, driverGetSmootherTarget } from '../ways/logic/driver'
import { Quaternion } from '@babylonjs/core/Maths/math.vector'
import { geoSegmentGetProjection, geoAngleForInterpolation} from '../geofind/geosegment'
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { RollingAverage } from "@babylonjs/core/Misc/performanceMonitor"

//MERGE IT AFTER CLONING

export class CarBot {
    bot: InstancedMesh
    id: string
    nodes = null
    selection: string | boolean = null // 'R' or 'L' or null
    nextJuction = null
    oldjunct
    approach: number
    speed: number = 0
    maxspeed: number 
    startupDone: boolean = false
    prevAngle: number = 0
    prevTarget:Vector3 = new Vector3(0, 0, 0)
    fakeAcceleration:number = 0
    fakeAccelerationStep:number = 0.001
    fakeAccelerationMax:number = 0.03
    fakeYaw:number = 0
    fakeYawStep:number = 0.001
    fakeYawMax:number = 0.05
    turnChancePercentage:number = Math.random() * 50 + 40
    choiceMade:boolean = false
    detected: string[]
    //detector: Mesh

    constructor(mesh: InstancedMesh){
        this.bot = mesh
        console.log(mesh)
        this.id = mesh.name
    }

    accelerate = () => {
        if (this.speed * 150 < 30){
            this.speed = Math.min(2, this.speed + 0.001)
            this.fakeAcceleration = Math.max(-this.fakeAccelerationMax, this.fakeAcceleration - this.fakeAccelerationStep)
        }
    }

    slowDown = (speed: number) => {
        if (this.speed*150 > speed){
            this.speed = Math.max(0, this.speed - 0.004)
            this.fakeAcceleration = Math.min(this.fakeAccelerationMax, this.fakeAcceleration + this.fakeAccelerationStep)
        } else if (this.speed*150 < speed){
            this.accelerate()
        }
    }

    stop = () => {
        if (this.speed > 0){
            this.speed = Math.max(0, this.speed - 0.004)
            this.fakeAcceleration = Math.min(this.fakeAccelerationMax, this.fakeAcceleration + this.fakeAccelerationStep)
        }
    }

    trafficLightHandler = () => {
        if (this.detected[1] === 'red'){ 
            this.stop()
        } else {
            this.accelerate()
            this.detected = null
        }
    }

    faststop = () => {
        //this.speed = 0;
        if (this.speed > 0){
            this.speed = Math.max(0, this.speed - 0.01)
            this.fakeAcceleration = Math.min(this.fakeAccelerationMax, this.fakeAcceleration + this.fakeAccelerationStep)
        }
    }

    contactHandler = () => {
        this.faststop()
    }

    detectorHandler = () => {
        switch(this.detected[0]){
            case 'contact':
                this.contactHandler()
                break
            case 'traffic':
                this.trafficLightHandler()
                break
            case 'stop':
                this.stop()
                break
        }
    }

    speedHandler = (): number => {
        if (this.detected) {
            this.detectorHandler()
        } else if (this.approach && this.approach < 12){
            this.slowDown(15)
        } else {
            this.accelerate()
        }
        return this.speed
    }

    // limitedTurn = (): boolean | string => {
    //     if ()
    //     let rand = Math.random() * 2 | 0
    //     // console.log(rand)
    //     return rand === 1 ? 'L' : 'R'
    // }

    getAvailableTurns = (next): Object[] => {
        let available: Object[]

       if (next.nexts[0].x === next.point.x){console.log('x same')}
       if (next.nexts[0].z === next.point.z){console.log('z same')}

        return available
    }

    easyTurn = (): string =>{
        let val = Math.random() * 100
        return val < this.turnChancePercentage/2 ? 'L' : val < this.turnChancePercentage ? 'R' : null
    }

    randomTurn = (): boolean | string => {
        if (this.nextJuction == null) {return null}
        let availableTurns = this.getAvailableTurns(this.nextJuction)
       
        this.choiceMade = true

        // if (availableTurns <= 1){
        //     return this.limitedTurn()
        // }
       // return availableTurns[Math.random() * availableTurns.length() | 0]
       return this.easyTurn()
    }

    carBotsLoop = () => {
            this.selection = this.choiceMade ? this.selection : this.randomTurn()
            const {nodes: builtNodes, selectionIndex} = driverPathBuild(this.bot.position, this.nodes, this.selection) 
            if(builtNodes == null || builtNodes.length == 0) { return }
            this.nodes = builtNodes
            const {target , normalProjection, nodes: newNodes, slice } = driverGetSmootherTarget(this.bot.position, this.prevTarget, this.nodes, 4 + 6 * this.speed)
            this.prevTarget = target
            if(slice && selectionIndex === 0) {this.selection = null, this.choiceMade = false}/*setTimeout(() => {this.selection = null; this.choiceMade = false}, 2000) }*/
            this.nodes = newNodes // FIXME   
        
            this.oldjunct = this.oldjunct ? this.oldjunct : this.nodes[0]
                if (this.nodes[1].type === 'junction' && this.oldjunct && this.oldjunct.junctionIndex != this.nodes[1].junctionIndex){
                this.nextJuction = this.nodes[1]
                this.oldjunct = this.nodes[1]
            } else if (this.nodes[0].type === 'junction'){
                this.nextJuction = null
            }
            this.approach = this.nextJuction ? Math.sqrt(Math.pow(this.bot.position.x - this.nextJuction.point.x, 2) + Math.pow(this.bot.position.z - this.nextJuction.point.z, 2)) : null
        
            //if(this.startupDone == false && nodes != null) {
                //if (nodes != null) {this.bot.position = nodes[0].point }
                //this.startupDone = true
            //} 
            this.speedHandler()
    
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
            //console.log(this.bot.rotationQuaternion.y.toFixed(2))
           // this.detector.position = this.bot.position.add(new Vector3(0, 3, 0))
    }

}

let botPos: Vector3[] = [
    new Vector3(-60 , 0.1, -102),//trafficlight
    new Vector3(-76, 0.1, -102),//trafficlight
    new Vector3(-86, 0.1, -102),//trafficlight
    new Vector3(-50, 0.1, -102),//trafficlight
    new Vector3(-96, 0.1, -102),//trafficlight

    new Vector3(56, 0.1, -96),//rev traffic
    new Vector3(76, 0.1, -96),//rev traffic
    new Vector3(86, 0.1, -96),//rev traffic


    new Vector3(20, 0.1, -1),//stop
    new Vector3(102, 0.1, 62),
    new Vector3(100 , 0.1, 250),
    new Vector3(300 , 0.1, 220),
    new Vector3(-295 , 0.1, 5),
    new Vector3(-190 , 0.1, -2),
    new Vector3(1, 0.1, 110)
]


const addBotInstanceClass = (mesh: Mesh, i: number): CarBot => {//
    let newmesh = mesh.createInstance('carbot' + i)
//    let newmesh = mesh.clone()
    newmesh.position = botPos[i]
    newmesh.scalingDeterminant = 0.6
    return new CarBot(newmesh)
}

const loadBotModel = (scene: Scene): Promise<Mesh> => {
    // return SceneLoader.ImportMeshAsync('', "../mesh/BotCar/", "cliobot.obj", scene).then(function(newMesh) {
    return SceneLoader.ImportMeshAsync('', "../mesh/BotCarNew/", "botcar.obj", scene).then(function(newMesh) {
        let msh = newMesh['meshes'] as Mesh[]

        let RLig = new StandardMaterial('blinkon', scene)
        let LLig = new StandardMaterial('blinkoff', scene)
        let on = new Color3(1,1,1)
        let off = new Color3(0,0,0)
        let Rl = msh.filter(m => m.name.includes('RLight'))
        let Ll = msh.filter(m => m.name.includes('LLight'))
        Rl[0].material = RLig
        Ll[0].material = LLig
        setInterval(() => {
             RLig.emissiveColor = RLig.emissiveColor === on ? off : on
             LLig.emissiveColor = LLig.emissiveColor === on ? off : on
        }, 500)


        let box = MeshBuilder.CreateBox('detector', {width: 1, height: 1, depth: 1})
        let mat = new StandardMaterial('mat', scene)
        box.position = new Vector3(0, 0, 10)
        mat.alpha = 0;
        box.material = mat

        msh.push(box)
        let bot = Mesh.MergeMeshes(msh, true, false, undefined, false, true)
        //bot.isVisible = false
        bot.position = new Vector3(0, -10, -10)
        bot.name = 'bot'
        return bot
    }) 
}

export const createCarBots = (scene: Scene, nb: number): Promise<{bots: CarBot[] ,mesh: Mesh}>  => {
    nb = 12
    let mesh: Mesh

   return (async () => {
        mesh = await loadBotModel(scene)
        mesh.scalingDeterminant = 0.6

       for (let i = 0; i < nb; i++){
          bots.push(addBotInstanceClass(mesh, i))
       }
       return {bots, mesh}
   })()
}

let bots: CarBot[] = []


//randomise color
export const carBotsLoop = () => {
    bots.forEach(bot => {
        bot.carBotsLoop()
    })
}
