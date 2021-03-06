import  '@babylonjs/loaders/OBJ'
import { Scene } from "@babylonjs/core/scene"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"
import { Vector3, Color3 } from "@babylonjs/core/Maths/math"
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh"
import { driverPathBuild, driverGetSmootherTarget } from '../ways/logic/driver'
import { Quaternion, Matrix } from '@babylonjs/core/Maths/math.vector'
import { geoSegmentGetProjection, geoAngleForInterpolation} from '../geofind/geosegment'
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { RollingAverage } from "@babylonjs/core/Misc/performanceMonitor"
import { TransformNode } from "@babylonjs/core/Meshes/transformNode"

let botPos: Vector3[] = [
    new Vector3(-60 , 0.1, -102),//trafficlight
    new Vector3(-76, 0.1, -102),//trafficlight
    new Vector3(-86, 0.1, -102),//trafficlight
    new Vector3(-50, 0.1, -102),//trafficlight
    new Vector3(-96, 0.1, -102),//trafficlight

    new Vector3(56, 0.1, -96),//rev traffic
    new Vector3(76, 0.1, -96),//rev traffic
    new Vector3(86, 0.1, -96),//rev traffic

    new Vector3(112, 0.1, -2),//stop
    new Vector3(-3, 0.1, 25),
    new Vector3(-3, 0.1, 45),
    new Vector3(-3, 0.1, 65),
    new Vector3(-3, 0.1, 85),
    new Vector3(102, 0.1, 62),
    new Vector3(100 , 0.1, 250),
    new Vector3(300 , 0.1, 220),
    new Vector3(-295 , 0.1, 5),
    new Vector3(-190 , 0.1, -2),
    new Vector3(1, 0.1, 110)
]

let trigBotPos: Vector3[] = [
    new Vector3(-197, 0, -292),
    new Vector3(-197,0,-260),
    new Vector3(-120,0,-98),
    new Vector3(-260,0,-102),//trig 1
   
    new Vector3(-101,0,-60),
    new Vector3(-97,0,-160),// trig 2
   
    new Vector3(2,0,-179),
    new Vector3(2,0,-189),// trig 3

    new Vector3(-2,0,80),// trig 4

    new Vector3(198,0,57),//trig 5

    // new Vector3(265,0,101),// trig 6

    new Vector3(115,0,98),// trig 7

]


export class CarBot {
    id: string
    idx: number
    bot: Mesh
    go: boolean
    detector: Mesh
    nodes = null
    selection: string | boolean = null // 'R' or 'L' or null
    nextJuction: any = null
    oldjunct: any
    approach: number
    speed: number = 0
    maxspeed: number = 30
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
    // detected: string[] = []
    detected: string[][] = []
    Rlig: StandardMaterial
    Llig: StandardMaterial
    BRlig: StandardMaterial
    BLlig: StandardMaterial
    brake: StandardMaterial
    blinkInter: any
    on = new Color3(1,1,1)
    off = new Color3(0,0,0)

    constructor(meshes: Mesh[], i: number, scene: Scene, scripted: boolean){
        this.id = `bot ${i}`
        this.go = !scripted
        this.Rlig = new StandardMaterial('blinker', scene)
        this.Llig = new StandardMaterial('blinker', scene)
        this.BRlig = new StandardMaterial('blinker', scene)
        this.BLlig = new StandardMaterial('blinker', scene)
        this.brake = new StandardMaterial('blinker', scene)
        let BRl = meshes.filter(m => m.id.includes('BRLight'))
        let BLl = meshes.filter(m => m.id.includes('BLLight'))
        let Rl = meshes.filter(m => m.id.includes('RLight'))
        let Ll = meshes.filter(m => m.id.includes('LLight'))
       // let br = meshes.filter(m => m.id.includes('LLight'))
        this.Rlig.emissiveColor = this.off
        this.Llig.emissiveColor = this.off
        this.Rlig.emissiveColor = this.off
        this.Llig.emissiveColor = this.off
       
        Rl[0].material = this.Rlig
        Ll[0].material = this.Llig
        BRl[0].material = this.BRlig
        BLl[0].material = this.BLlig
        let body = meshes.filter(m => m.id.includes('mm1'))
        let mat = new StandardMaterial('body', scene)
        mat.diffuseColor = new Color3(Math.random()*0.5+0.5, Math.random()*0.5+0.5, Math.random()*0.5+0.5)
        body.forEach(b => {b.material = mat})
        
        this.bot = Mesh.MergeMeshes(meshes, true, false, undefined, false, true)
        this.bot.scalingDeterminant = 0.6
        this.bot.isVisible = !scripted
        this.bot.position = trigBotPos[i]//botPos[i]
        this.bot.name = 'bot'
        this.detector = MeshBuilder.CreateBox('detector', {width: 1, height: 1, depth: 5})
        let pos = trigBotPos[i].add(new Vector3(0,0,3))
        this.detector.position = pos
        this.detector.isVisible = false
        var pivotTranslate = pos.subtract(trigBotPos[i]);
        this.detector.setPivotMatrix(Matrix.Translation(pivotTranslate.x, pivotTranslate.y, pivotTranslate.z), false)
    }

    filter = (det: string) => {
       this.detected = this.detected.filter(elem => elem[0] != det)
    }

    clearBlinker = () => {
        clearInterval(this.blinkInter)
        this.blinkInter = null 
        this.Llig.emissiveColor = this.off
        this.Rlig.emissiveColor = this.off
        this.BLlig.emissiveColor = this.off
        this.BRlig.emissiveColor = this.off
    }

    toggleBlinker = () => {
        if (this.blinkInter){return}
        if (this.selection === 'R'){
            this.blinkInter = setInterval(() => {
                this.Llig.emissiveColor = this.Llig.emissiveColor === this.on ? this.off : this.on
                this.BLlig.emissiveColor = this.BLlig.emissiveColor === this.on ? this.off : this.on
            }, 500)
        } else if (this.selection === 'L'){
            this.blinkInter = setInterval(() => {
                this.Rlig.emissiveColor = this.Rlig.emissiveColor === this.on ? this.off : this.on
                this.BRlig.emissiveColor = this.BRlig.emissiveColor === this.on ? this.off : this.on
            }, 500)
        }
    }

    accelerate = () => {
        if (this.speed * 150 < this.maxspeed){
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
        //if (this.detected[1] === 'red' || this.detected[1] === 'orange'){ 
        if (this.detected[0][1] === 'red' || this.detected[0][1] === 'orange'){ 
            this.stop()
        } else {
            this.accelerate()
            this.detected = []
        }
    }

    faststop = () => {
        //this.speed = 0;
        if (this.speed > 0){
            this.speed = Math.max(0, this.speed - 0.007)
            this.fakeAcceleration = Math.min(this.fakeAccelerationMax, this.fakeAcceleration + this.fakeAccelerationStep)
        }
    }

    contactHandler = () => {
        this.faststop()
    }

    detectorHandler = () => {
        switch(this.detected[0][0]){
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
        if (this.detected.length >= 1) {
            this.detectorHandler()
        } else if (this.approach && this.approach < 12){
            this.slowDown(15)
        } else {
            this.accelerate()
        }
        return this.speed
    }

    
    getAvailableTurns = (next): Object[] => {
        let available: Object[]

       if (next.nexts[0].x === next.point.x){console.log('x same')}
       if (next.nexts[0].z === next.point.z){console.log('z same')}

        return available
    }

    easyTurn = (): string => {
        return 'L'
        //return null
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
            if(slice && selectionIndex === 0) {this.selection = null, this.choiceMade = false, this.clearBlinker()}
            this.nodes = newNodes // FIXME   
        
            this.oldjunct = this.oldjunct ? this.oldjunct : this.nodes[0]
                if (this.nodes[1].type === 'junction' && this.oldjunct && this.oldjunct.junctionIndex != this.nodes[1].junctionIndex){
                this.nextJuction = this.nodes[1]
                this.oldjunct = this.nodes[1]
            } else if (this.nodes[0].type === 'junction'){
                this.nextJuction = null
            }
            this.approach = this.nextJuction ? Math.sqrt(Math.pow(this.bot.position.x - this.nextJuction.point.x, 2) + Math.pow(this.bot.position.z - this.nextJuction.point.z, 2)) : null
        
            this.speedHandler()
            this.toggleBlinker()
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
        this.detector.position = this.bot.position
        this.detector.rotationQuaternion = this.bot.rotationQuaternion
    }
}

const addBotInstanceClass = (meshes: Mesh[], i: number, scene: Scene, scripted: boolean): CarBot => {//
    
    let newmesh: Mesh[] = []
    meshes.forEach(msh => {
        let x = msh.clone()
        newmesh.push(x)
    })
    return new CarBot(newmesh, i, scene, scripted)
}

const loadBotModel = async (scene: Scene): Promise<Mesh[]> => {
    return SceneLoader.ImportMeshAsync('', "../mesh/ClioV3sign/", "cliofinal.obj", scene).then(function(newMesh) {
        let msh = newMesh['meshes'] as Mesh[]
        return msh
    }) 
}

let bots: CarBot[] = []

export const createCarBots = (scene: Scene, nb: number): Promise<CarBot[]>  => {
    nb = 11
    let mesh: Mesh[]

   return (async () => {
     mesh = await loadBotModel(scene)
       for (let i = 0; i < nb; i++){
          bots.push(addBotInstanceClass(mesh, i, scene, i!=0 && i!=1?true:false))//scripted always true
       }
       mesh.forEach(msh => {msh.dispose()})
       return bots
   })()
}

//randomise color
export const carBotsLoop = () => {
    bots.forEach(bot => {
        if (bot.go === true){
            bot.carBotsLoop()
        }
    })
}
