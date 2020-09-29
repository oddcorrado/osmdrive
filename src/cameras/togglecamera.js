import {ActionManager, ExecuteCodeAction} from '@babylonjs/core/Actions'

export default function toggleCamera (scene, camera, freecamera){
    scene.actionManager = new ActionManager(scene)

    scene.actionManager.registerAction(
        new ExecuteCodeAction({trigger: ActionManager.OnKeyDownTrigger, parameter: 'c'}, function (){
                console.log('camera switch')
                scene.activeCamera = (scene.activeCamera === freecamera ? camera : freecamera)
            }////
        )
    );
}