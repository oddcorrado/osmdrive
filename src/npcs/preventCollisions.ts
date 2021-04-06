import { Mesh } from "@babylonjs/core/Meshes/mesh";
import {CarBot} from './carbotsIndependantDetector'
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { Scene } from "@babylonjs/core/scene";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import mainCarLoaded from '../car/carloaded'
import {createEndOfLevel} from '../creators/endGameCreator'
import {setGameState} from '../controls/loops'

export default function preventCollisions(scene: Scene, container: AssetContainer, bots: CarBot[]){
    (async () => {
        let car = await mainCarLoaded(container)
        bots.forEach(botclass => {
            botclass.detector.actionManager = new ActionManager(scene)
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
                        // botclass.detected.push(['contact'])
                       setTimeout(() => {setGameState('end'); createEndOfLevel(false)}, 100)
                    })
                )

                botclass.detector.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnIntersectionEnterTrigger,
                            parameter: {
                            mesh: car
                        }
                    },
                    function(){
                        botclass.detected.push(['contact'])
                       // setTimeout(() => {setGameState('end'); createEndOfLevel(false)}, 100)
                    })
                )

                botclass.detector.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnIntersectionExitTrigger,
                            parameter: {
                            mesh: car
                        }
                    },
                    function(){    
                        setTimeout(() => {botclass.filter('contact')}, 200)
                    })
                )

                if (botdiff.id != botclass.id){
                    botclass.detector.actionManager.registerAction(
                        new ExecuteCodeAction(
                            {
                                trigger: ActionManager.OnIntersectionEnterTrigger,
                                parameter: {
                                mesh: botdiff.bot
                            }
                        },
                        function(){     
                            // botclass.detected = ['contact', botdiff.id]
                            //if (botdiff.detected.length == 2 && botdiff.detected[1] === botclass.id){
                            botclass.detected.push(['contact', botdiff.id])
                            if (botdiff.detected.length == 2 && botdiff.detected[0][1] === botclass.id){
                                setTimeout(() => {
                                    // botclass.detected = []
                                    botclass.filter('contact')
                                }, 200)
                            }
                        })
                    )
                    botclass.detector.actionManager.registerAction(
                        new ExecuteCodeAction(
                            {
                                trigger: ActionManager.OnIntersectionExitTrigger,
                                parameter: {
                                mesh: botdiff.bot
                            }
                        },
                        function(){       
                            setTimeout(() => {
                                // botclass.detected = []
                                botclass.filter('contact')
                            }, 200)
                        })
                    )
                }

            })
        })
    })()
}