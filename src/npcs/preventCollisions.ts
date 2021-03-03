import { Mesh } from "@babylonjs/core/Meshes/mesh";
import {CarBot} from './carbots'
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { Scene } from "@babylonjs/core/scene";
import { AssetContainer } from "@babylonjs/core/assetContainer";


async function mainCarLoaded(container: AssetContainer): Promise<Mesh> {
    return await new Promise (function(resolve) {
        const interval = setInterval(container =>  {
           if (container && container['meshes'].find(car => car.name == 'detailedcar')){
              resolve(container['meshes'].find(car => car.name == 'detailedcar'));
              clearInterval(interval);
           }
        }, 100, container)
     }).then((car: Mesh) => {
         return car
     })    
}

export default function preventCollisions(scene: Scene, container: AssetContainer, botmesh:Mesh, bots: CarBot[]){
    (async () => {
        let car = await mainCarLoaded(container)
        bots.forEach(botclass => {
            botclass.bot.actionManager = new ActionManager(scene)
            bots.forEach(botdiff => {

                botclass.bot.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnIntersectionEnterTrigger,
                            parameter: {
                            mesh: car
                        }
                    },
                    function(){                            
                        botclass.detected = ['contact']
                    })
                )
                botclass.bot.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnIntersectionExitTrigger,
                            parameter: {
                            mesh: car
                        }
                    },
                    function(){       
                        setTimeout(() => {botclass.detected = null}, 200)
                    })
                )

                if (botdiff.id != botclass.id){
                    botclass.bot.actionManager.registerAction(
                        new ExecuteCodeAction(
                            {
                                trigger: ActionManager.OnIntersectionEnterTrigger,
                                parameter: {
                                mesh: botdiff.bot
                            }
                        },
                        function(){                            
                            botclass.detected = ['contact']
                        })
                    )
                    botclass.bot.actionManager.registerAction(
                        new ExecuteCodeAction(
                            {
                                trigger: ActionManager.OnIntersectionExitTrigger,
                                parameter: {
                                mesh: botdiff.bot
                            }
                        },
                        function(){       
                            setTimeout(() => {botclass.detected = null}, 200)
                        })
                    )
                }

            })
        })
    })()
}