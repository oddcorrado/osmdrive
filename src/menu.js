import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { toggleDebugWays } from './way'
import {disableTrees} from './dressmap'

var camPosInterval;

export function buttonCreator(style, content){
    var tmpBtn = document.createElement('button');
    tmpBtn.setAttribute('style', style + `; z-index: 10; position: absolute; font-weight: 800; color: white; opacity: 0.6; border-radius: 8px`);

    tmpBtn.innerText = content.text;
    return tmpBtn;
}

export function divCreator(style, content){
    var tmpDiv = document.createElement('div');

    tmpDiv.setAttribute('style', style + `;z-index: 10; position: absolute; font-weight: 800`);

    tmpDiv.id = content.id;
    tmpDiv.innerText = content.text;
    return tmpDiv;
}

function setMainMenu(scene,camera,freecamera,bots,grids){
    var btnMenu = buttonCreator('top: 50px; right: 0; background-color:black; display: block',{text: 'Debug Menu'});
    var btnJ = buttonCreator('top: 50px; right: 0;background-color:green; display: none',{text: 'Disable Joysticks'});
    var btnCam = buttonCreator('top:30px; right: 0;background-color: black; display: none',{text: 'Camera Switch (C)'});
    var btnBots = buttonCreator('top: 70px; right: 0;background-color:red; display: none',{text: 'Enable Bots'});
    var btnGrids = buttonCreator('top: 90px; right: 0;background-color:red; display: none',{text: 'Enable Grids'});
    var btnTrees = buttonCreator('top: 1300px; right: 0;background-color:red; display: none',{text: 'Enable Trees'});
    var btnWays = buttonCreator('top: 110px; right: 0;background-color:black; display: none',{text: 'Show Ways'});
    var camFresh = divCreator('top: 1vh; right: 1vw; height: 30px; display: none', {text: '', id:'position'});
    var speedFresh = divCreator('top: 73vh; right: 76.5vw; height: 9rem; width: 10rem; display: block; color:white;font-size: 1rem', {text: 'none', id: 'speed'});
    var btnDivArray = [btnMenu, btnCam, btnJ, btnBots, btnWays, camFresh, speedFresh, btnGrids];

    btnDivArray.forEach(btn => {
        document.body.appendChild(btn);
    })

    btnMenu.onclick = () => {
        if (btnMenu.innerText === 'Debug Menu') {
            btnDivArray.forEach(btn => {
                btn.style.display = 'block';
            })
            btnMenu.innerText = 'Hide Menu';
            btnMenu.style.top = '180px';
        } else {
            btnDivArray.forEach(btn => {
            if (btn != btnMenu)
                    btn.style.display = 'none';
            })
            btnMenu.innerText = 'Debug Menu';
            btnMenu.style.top = '50px';
        }
    }

    var disableJoysticks = () => {
        if (VirtualJoystick.Canvas.style.zIndex == "-1"){
            VirtualJoystick.Canvas.style.zIndex = "4";
            btnJ.innerText = "Disable Joysticks";
            btnJ.style.backgroundColor = "green";
        } else {
            VirtualJoystick.Canvas.style.zIndex = "-1";
            btnJ.innerText = "Enable Joysticks";
            btnJ.style.backgroundColor = "red";
        }
    }

    btnJ.onclick = () => {
        disableJoysticks();
    }

    btnCam.onclick = () => {
        scene.activeCamera = (scene.activeCamera === freecamera ? camera : freecamera)
        if (scene.activeCamera === camera) {
            clearInterval(camPosInterval);
            camFresh.style.display = 'none';
            console.log('joysticks were deactivated to use freecamera')
            disableJoysticks();
        } else {
            showPosCam();
            camFresh.style.display = 'block';
            disableJoysticks();
        }
    }

    btnBots.onclick = () => {
        console.log(bots);
        btnBots.innerText = (btnBots.innerHTML == 'Disable Bots' ? 'Enable Bots' : 'Disable Bots')
        btnBots.style.backgroundColor = (btnBots.innerHTML == 'Disable Bots' ? 'green' : 'red')
        bots.forEach(bot => {
            bot.isVisible = (bot.isVisible ? false : true)
            bot.setEnabled(bot.isVisible ? true : false)
        })
    }

    btnTrees.onclick = () => {
        btnTrees.innerText = (btnTrees.innerHTML == 'Disable Trees' ? 'Enable Trees' : 'Disable Trees');
        disableTrees();
    }
    
    btnGrids.onclick = () => {
        if (btnGrids.innerText == 'Disable Grids'){
           btnGrids.innerHTML = 'Enable Grids';
            btnGrids.style.backgroundColor =  'red';
            grids.forEach(grid => grid.visibility = 0);
        } else {
            btnGrids.innerHTML = 'Disable Grids';
            btnGrids.style.backgroundColor =  'green';
            grids.forEach(grid => grid.visibility = 1);
        }
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

function setControlMenu(){
    var btnMenuControls = buttonCreator('top: 50px; left: 0; background-color:black; display: block',{text: 'Control Options'});
    var dirSlide = buttonCreator('top: 50px; left: 0; background-color:green; display: none', {text: 'Slider'});
    var dirAce = buttonCreator('top: 50px; left: 60px; background-color:red; display: none', {text: 'Accelerometer'});
    var spSlide = buttonCreator('top: 70px; left: 0; background-color:green; display: none', {text: 'Slider'});
    var spAce = buttonCreator('top: 70px; left: 60px; background-color:red; display: none', {text: 'Accelerometer'});
    var spPedal = buttonCreator('top: 70px; left: 175px; background-color:red; display: none', {text: 'Pedal'});
    var lookSlide = buttonCreator('top: 90px; left: 0; background-color:green; display: none', {text: 'Slider'});
    var lookAce = buttonCreator('top: 90px; left: 60px; background-color:red; display: none', {text: 'Accelerometer'});

    var controlMenuArray = [btnMenuControls, dirAce, dirSlide, spSlide, spAce, spPedal, lookAce, lookSlide];


    controlMenuArray.forEach(btn => {
        document.body.appendChild(btn);
    })

    btnMenuControls.onclick = () => {
        if (btnMenuControls.innerText === 'Control Options') {
            controlMenuArray.forEach(btn => {
                btn.style.display = 'block';
            })
            btnMenuControls.innerText = 'Hide Options';
            btnMenuControls.style.top = '150px';
        } else {
            controlMenuArray.forEach(btn => {
                if (btn != btnMenuControls)
                    btn.style.display = 'none';
            })
            btnMenuControls.innerText = 'Control Options';
            btnMenuControls.style.top = '50px';
        }
    }

    //foreachonclickcolor.

}

export default function createMenu(scene, camera, freecamera, bots, grids){
    setMainMenu(scene,camera,freecamera,bots,grids);
    setControlMenu();
}