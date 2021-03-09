import { Mesh } from "@babylonjs/core/Meshes/mesh";
import {CarBot} from './carbotsIndependantDetector'
import { ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions';
import { Scene } from "@babylonjs/core/scene";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import mainCarLoaded from '../car/carloaded'

export default function preventCollisions(scene: Scene, container: AssetContainer, bots: CarBot[]){
    (async () => {
        let car = await mainCarLoaded(container)
        bots.forEach(botclass => {
            botclass.detector.actionManager = new ActionManager(scene)
            bots.forEach(botdiff => {

                botclass.detector.actionManager.registerAction(
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

                botclass.detector.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnIntersectionExitTrigger,
                            parameter: {
                            mesh: car
                        }
                    },
                    function(){    
                        setTimeout(() => {botclass.detected = []}, 200)
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
                            botclass.detected = ['contact', botdiff.id]
                            if (botdiff.detected.length == 2 && botdiff.detected[1] === botclass.id){
                                setTimeout(() => {botclass.detected = []}, 200)
                            }//choose prio
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
                            setTimeout(() => {botclass.detected = []}, 200)
                        })
                    )
                }

            })
        })
    })()
}

export  function preventCollisionsOld(scene: Scene, container: AssetContainer, botmesh:Mesh, bots: CarBot[]){
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
                        setTimeout(() => {botclass.detected = []}, 200)
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
                            setTimeout(() => {botclass.detected = []}, 200)
                        })
                    )
                }

            })
        })
    })()
}