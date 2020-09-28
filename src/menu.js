import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { toggleDebugWays } from './way'

export default function createMenu(scene, camera, freecamera, bots){
    var btnJ = document.createElement("button")
    var btnCam = document.createElement("button")
    var btnBots = document.createElement("button")
    var btnWays = document.createElement("button")

    btnJ.innerText = "Disable Joysticks"
    btnJ.style.zIndex = 10;
    btnJ.style.position = "absolute"
    btnJ.style.top = "30px"
    btnJ.style.right = "0px"

    
    btnCam.innerText = "Camera Switch (C)"
    btnCam.style.zIndex = 10;
    btnCam.style.position = "absolute"
    btnCam.style.top = "50px"
    btnCam.style.right = "0px"

    btnBots.innerText = "Enable bots"
    btnBots.style.zIndex = 10;
    btnBots.style.position = "absolute"
    btnBots.style.top = "70px"
    btnBots.style.right = "0px"

    btnWays.innerText = "Show ways"
    btnWays.style.zIndex = 10;
    btnWays.style.position = "absolute"
    btnWays.style.top = "90px"
    btnWays.style.right = "0px"

    document.body.appendChild(btnCam)
    document.body.appendChild(btnJ)
    document.body.appendChild(btnBots)
    document.body.appendChild(btnWays)


    function disableJoysticks() {
        if (VirtualJoystick.Canvas.style.zIndex == "-1"){
            VirtualJoystick.Canvas.style.zIndex = "4";
            btnJ.innerText = "Disable Joysticks";

        } else {
            VirtualJoystick.Canvas.style.zIndex = "-1";
            btnJ.innerText = "Enable Joysticks";
        }
    }

    btnJ.onclick = () => {disableJoysticks()}
    
    btnCam.onclick = () => {
        scene.activeCamera = (scene.activeCamera === freecamera ? camera : freecamera)
        disableJoysticks()
        console.log('joysticks were deactivated to use freecamera')
    }

    btnBots.onclick = () => {
        console.log(bots);
        btnBots.innerText = (btnBots.innerHTML == 'Enable Bots' ? 'Enable Bots' : 'Disable Bots')
        bots.forEach(bot => {
            bot.isVisible = (bot.isVisible ? false : true)
            bot.setEnabled(bot.isVisible ? true : false)
        })
    }
    btnWays.onclick = () => {
        toggleDebugWays()
    }
}