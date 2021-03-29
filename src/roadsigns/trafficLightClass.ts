import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Color3} from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { feedbackDivCreator } from '../creators/buttoncreator';
import score from '../scoring/scoring'
import { Scene } from '@babylonjs/core/scene';
import { CarBot } from '../npcs/carbotsIndependantDetector';

export class TrafficLightSq {
    trafficLs:Mesh[][]= [[],[],[],[]]//NW..NE
                             //......
                             //SW..SE
    trafficMerged:Mesh[] = []
    trigMesh: Mesh[] = []
    colorNS: StandardMaterial[]
    colorEW: StandardMaterial[]
    lights: Mesh[][] = [[],[],[],[]]
    status:string[] = ['green','red']
    cols = {
        red: new Color3(1, 0, 0),
        none: new Color3(0, 0, 0),
        green: new Color3(0, 1, 0),
        orange: new Color3(1, 0.4, 0)
     }
    defaultColors = {green: [this.cols['green'], this.cols['none'], this.cols['none']],
                    orange: [this.cols['none'], this.cols['orange'], this.cols['none']],
                    red: [this.cols['none'], this.cols['none'], this.cols['red']]}
                    

    constructor(scene: Scene, trafficMesh: Mesh[], pos: Vector3, carbots: CarBot[]){
        this.colorNS =  [new StandardMaterial('green', scene), new StandardMaterial('orange', scene), new StandardMaterial('red', scene)]
        this.colorEW =  [new StandardMaterial('green', scene), new StandardMaterial('orange', scene), new StandardMaterial('red', scene)]
        let meshColor = ['green', 'orange', 'red']
        let posVectors = [new Vector3(-5,0,5), new Vector3(5,0,5), new Vector3(5,0,-5), new Vector3(-5,0,-5)] 
        let rotVectors = [new Vector3(0,0,0),new Vector3(0,Math.PI/2,0), new Vector3(0,Math.PI,0), new Vector3(0,-Math.PI/2,0)]
    
        for (let i = 0; i< 4; i++){
            trafficMesh.forEach(msh => {
                this.trafficLs[i].push(msh.clone())
            })
            meshColor.forEach((color, nb = 0) => {
                this.trafficLs[i].forEach(msh => {
                    if (msh.id.includes(color)){
                        msh.material = i % 2 === 0 ? this.colorNS[nb] : this.colorEW[nb]
                    }
                })
            })
            this.trigMesh.push(MeshBuilder.CreateBox('box',{width:0.5, height:0.5, depth: 0.3}, scene))
            this.trigMesh[i].position = pos.add(new Vector3(i % 2 == 0 ? posVectors[i].x/3 : posVectors[i].x*2, 0.2, i % 2 == 0 ? posVectors[i].z*2 : posVectors[i].z/3))
            this.trigMesh[i].isVisible = false
            this.addAction(scene, carbots, i)
            this.trafficMerged.push(Mesh.MergeMeshes(this.trafficLs[i], true, false, undefined, false, true))
            this.trafficMerged[i].scalingDeterminant = 0.8
            this.trafficMerged[i].position = pos.add(new Vector3(posVectors[i].x, 0, posVectors[i].z))
            this.trafficMerged[i].rotation = rotVectors[i]
            this.trafficMerged[i].isVisible = true
        }
      this.createLightRotation('green')
    }

    createLightRotation(type: string){
        this.colorNS[type === 'red' ? 2 : 0].emissiveColor = this.defaultColors[type][0]
        this.colorEW[type === 'red' ? 0 : 2].emissiveColor = this.defaultColors[type === 'red' ? 'green' : 'red'][type === 'red' ? 0 : 2]

        setInterval(() => {
           if (this.status[0] === 'green'){
              this.setColors('orange');
              this.status[0] = 'orange'
              setTimeout(() => {
                 this.setColors('red');
                 this.status[0] = 'red'
              }, 2000)
           } else if (this.status[0] === 'red'){
              this.setColors('green')
              this.status[0] = 'green'
           }
        }, 15000)
     }

     setColors(color: string){
        switch(color){
            case 'green':
                this.colorNS.forEach((mat, i = 0) => {mat.emissiveColor = this.defaultColors['green'][i]})
                this.colorEW.forEach((mat, i = 0) => {mat.emissiveColor = this.defaultColors['red'][i]})
                this.status[1] = 'red'
                break
            case 'orange':
                this.colorNS.forEach((mat, i = 0) => {mat.emissiveColor = this.defaultColors['orange'][i]})
                break
            case 'red':
                this.colorNS.forEach((mat, i = 0) => {mat.emissiveColor = this.defaultColors['red'][i]})
                this.colorEW.forEach((mat, i = 0) => {mat.emissiveColor = this.defaultColors['green'][i]})
                this.status[1] = 'green'
                setTimeout(() => {
                    this.colorEW.forEach((mat, i = 0) => {mat.emissiveColor = this.defaultColors['orange'][i]})
                    this.status[1] = 'orange'
                }, 11000)
                break
        }
    }
    
    addAction(scene: Scene, bots: CarBot[], i: number){
        let inter
        this.trigMesh[i].actionManager = new ActionManager(scene)
        bots.forEach((classbot) => {
            this.trigMesh[i].actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: {
                        mesh: classbot.bot
                    }
                },
                () => {
                    classbot.detected = ['traffic', this.status[i % 2 === 0 ? 0:1]]//push it
                    inter = setInterval(() => {
                        if (this.status[i % 2 === 0 ? 0:1]=== 'green'){
                            classbot.detected = []
                            clearInterval(inter)
                        }
                    }, 1000)
                })
            )
        })
    }
}

const loadTrafficLight = async(scene: Scene): Promise<Mesh[]> => {
    return SceneLoader.ImportMeshAsync('', "../mesh/DoubleTrafficLight/", "doubletraffic.obj", scene).then(function(newMesh) {
        let msh = newMesh['meshes'] as Mesh[]
        msh.forEach(m=>m.isVisible=false)
        return msh
    }) 
}

 export default function spawnTrafficLightSq(scene: Scene, carbots:CarBot[], positions:Vector3[]):void {
    (async ()=>{
        let traffic = await loadTrafficLight(scene)
        for (let i = 0; i<positions.length; i++){
            new TrafficLightSq(scene, traffic, positions[i], carbots)
        }
    })()
}