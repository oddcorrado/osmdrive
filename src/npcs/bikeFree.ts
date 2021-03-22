import { Scene } from "@babylonjs/core/scene"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"
import { Vector3, Color3 } from "@babylonjs/core/Maths/math"
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh"

const startPos = [
    new Vector3(-47,0.1,-3)
]

const endPos = [
    new Vector3(245,0.1,-3)
]

const ori = [
    new Vector3(0, Math.PI/2, 0)
]

export class BikeFree {
    id: string
    idx: number
    bot: InstancedMesh
    go: boolean
    detector: Mesh
    selection: string | boolean = null // 'R' or 'L' or null
    approach: number
    speed: number = 0
    maxspeed: number = 30
    adVector: Vector3
    detected: string[] = []
  
    constructor(mesh: InstancedMesh, i: number, scripted: boolean){
        this.id = `bike ${i}`
        this.idx = i
        this.go = !scripted
        this.adVector = startPos[i].subtract(endPos[i])
        this.bot = mesh
        this.bot.position = startPos[i]
        this.bot.rotation = ori[i]
        // this.detector = MeshBuilder.CreateBox('detector', {width: 1, height: 1, depth: 5})
        // let pos = trigBikePos[i].add(new Vector3(0,0,3))
        // this.detector.position = pos
        // this.detector.isVisible = false
       // var pivotTranslate = pos.subtract(trigBikePos[i]);
        //this.detector.setPivotMatrix(Matrix.Translation(pivotTranslate.x, pivotTranslate.y, pivotTranslate.z), false)
    }
 
    accelerate = () => {
        if (this.speed * 150 < this.maxspeed){
            this.speed = Math.min(2, this.speed + 0.001)
        }
    }

    slowDown = (speed: number) => {
        if (this.speed*150 > speed){
            this.speed = Math.max(0, this.speed - 0.004)
        } else if (this.speed*150 < speed){
            this.accelerate()
        }
    }

    stop = () => {
        if (this.speed > 0){
            this.speed = Math.max(0, this.speed - 0.004)
        }
    }

    faststop = () => {
        //this.speed = 0;
        if (this.speed > 0){
            this.speed = Math.max(0, this.speed - 0.01)
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
            case 'stop':
                this.stop()
                break
        }
    }

    speedHandler = (): number => {
        // if (this.detected.length >= 1) {
        //     this.detectorHandler()
        // } else if (this.approach && this.approach < 12){
        //     this.slowDown(15)
        // } else {
        //     this.accelerate()
        // }

        return this.speed
    }

    bikeFreeLoop = () => {           
        if (this.bot.position != endPos[this.idx]){
            this.bot.position.x -= this.adVector.x/1000
            this.bot.position.z -= this.adVector.z/1000
           // console.log(this.bot.position)
            //console.log(this.bot.position.x-=0.01)
        } else {
            console.log('arrivé')
        }
        //this.detector.position = this.bot.position
        //this.detector.rotationQuaternion = this.bot.rotationQuaternion
    }
}

const addBikeInstanceClass = (mesh: Mesh, i: number, scene: Scene, scripted: boolean): BikeFree => {//
    let newmesh = mesh.createInstance(`bike${i}`)
    return new BikeFree(newmesh, i, scripted)
}

const loadBikeModel = async (scene: Scene): Promise<Mesh> => {
    // return SceneLoader.ImportMeshAsync('', "../mesh/BotCar/", "cliobot.obj", scene).then(function(newMesh) {
    return  SceneLoader.ImportMeshAsync('', "../mesh/Bike/", "bike.obj", scene).then(function(newMesh) {
        let msh = newMesh['meshes'] as Mesh[]
        let bike = Mesh.MergeMeshes(msh, true, true, null, false, true)

        return bike
    }) 
}

let bikes: BikeFree[] = []

export const createBikeBots = (scene: Scene, nb: number): Promise<BikeFree[]>  => {
    let mesh: Mesh

   return (async () => {
     mesh = await loadBikeModel(scene)
       for (let i = 0; i < nb; i++){
          bikes.push(addBikeInstanceClass(mesh, i, scene, true))
       }
       mesh.isVisible = false
       return bikes
   })()
}

export async function bikeFreeLoop () {
    bikes.forEach(bot => {
        if (bot.go === true){
            bot.bikeFreeLoop()
        }
    })
}
