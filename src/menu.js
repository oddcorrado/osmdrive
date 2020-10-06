import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { toggleDebugWays } from './way'
import {disableTrees} from './dressmap'

var camPosInterval;

export default function createMenu(scene, camera, freecamera, bots){
    var btnJ = document.createElement("button")
    var btnCam = document.createElement("button")
    var btnBots = document.createElement("button")
    var btnWays = document.createElement("button")
    var camFresh = document.createElement("div");
    var btnTrees = document.createElement("button");

    camFresh.style.position = 'absolute';
    camFresh.style.top = '5px';
    camFresh.style.right = '0px';
    camFresh.style.height = '30px';
    camFresh.style.color = 'dark yellow';
    camFresh.style.display = 'none';

    btnJ.innerText = "Disable Joysticks"
    btnJ.style.zIndex = 10;
    btnJ.style.position = "absolute"
    btnJ.style.top = "30px"
    btnJ.style.right = "0px"
    btnJ.style.color = "green"

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
    btnBots.style.color = "red"


    btnWays.innerText = "Show ways"
    btnWays.style.zIndex = 10;
    btnWays.style.position = "absolute"
    btnWays.style.top = "90px"
    btnWays.style.right = "0px"

    btnTrees.innerText = "Disable trees"
    btnTrees.style.zIndex = 10;
    btnTrees.style.position = "absolute"
    btnTrees.style.top = "110px"
    btnTrees.style.right = "0px"

    document.body.appendChild(btnCam)
    document.body.appendChild(btnJ)
    document.body.appendChild(btnBots)
    document.body.appendChild(btnWays)
    document.body.appendChild(camFresh)
    // document.body.appendChild(btnTrees)

    function disableJoysticks() {
        if (VirtualJoystick.Canvas.style.zIndex == "-1"){
            VirtualJoystick.Canvas.style.zIndex = "4";
            btnJ.innerText = "Disable Joysticks";
            btnJ.style.color = "green";
        } else {
            VirtualJoystick.Canvas.style.zIndex = "-1";
            btnJ.innerText = "Enable Joysticks";
            btnJ.style.color = "red";
        }
    }

    btnJ.onclick = () => {disableJoysticks()}
    
    btnCam.onclick = () => {
        scene.activeCamera = (scene.activeCamera === freecamera ? camera : freecamera)
        if (scene.activeCamera === camera) {
            clearInterval(camPosInterval);
            camFresh.style.display = 'none';
            console.log('joysticks were deactivated to use freecamera')
        } else {
            disableJoysticks();
            showPosCam();
            camFresh.style.display = 'block';
        }
    }

    btnBots.onclick = () => {
        console.log(bots);
        btnBots.innerText = (btnBots.innerHTML == 'Enable Bots' ? 'Enable Bots' : 'Disable Bots')
        btnBots.style.color = (btnBots.innerHTML == 'Enable Bots' ? 'red' : 'green')
        bots.forEach(bot => {
            bot.isVisible = (bot.isVisible ? false : true)
            bot.setEnabled(bot.isVisible ? true : false)
        })
    }

    btnTrees.onclick = () => {
        btnTrees.innerText = (btnTrees.innerHTML == 'Disable Trees' ? 'Enable Trees' : 'Disable Trees');
        disableTrees();
    }
    
    btnWays.onclick = () => {
        toggleDebugWays()
    }

    function showPosCam(){
        camPosInterval = setInterval(() => {
            camFresh.innerHTML = `X: ${freecamera.position.x.toFixed(2)}   Y: ${freecamera.position.z.toFixed(2)}`;
        }, 1000)
    }
    
}