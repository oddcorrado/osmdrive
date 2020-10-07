import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { toggleDebugWays } from './way'
import {disableTrees} from './dressmap'

var camPosInterval;

function buttonCreator(style, content){
    var tmpBtn = document.createElement('button');
    
    tmpBtn.innerText = content.text;
    tmpBtn.style.backgroundColor = style.color;
    tmpBtn.style.top = style.top;
    tmpBtn.style.color = 'white';
    tmpBtn.style.opacity = '0.6';
    tmpBtn.style.position = 'absolute';
    tmpBtn.style.borderRadius = '8px';
    tmpBtn.style.zIndex = 10;
    tmpBtn.style.right = '0px';
    tmpBtn.style.display = style.display;
    return tmpBtn;
}

function divCreator(style, content){
    var tmpDiv = document.createElement('div');

    tmpDiv.style.top = style.top;
    tmpDiv.style.right = style.right;
    tmpDiv.style.height = style.height;
    tmpDiv.style.color = style.color; 
    tmpDiv.style.right = style.right;
    tmpDiv.style.fontSize = style.fontSize;
    tmpDiv.style.position = 'absolute';
    tmpDiv.style.display = style.display;
    tmpDiv.id = content.id;
    tmpDiv.innerText = content.text;
    tmpDiv.fontWeight = '800';
    return tmpDiv;
}

export default function createMenu(scene, camera, freecamera, bots, grids){
    var btnMenu = buttonCreator({top: '50px', color:'black', display: 'block'},{text: 'Debug Menu'});
    var btnJ = buttonCreator({top: '50px', color:'green', display: 'none'},{text: 'Disable Joysticks'});
    var btnCam = buttonCreator({top:'30px', color: 'black', display: 'none'},{text: 'Camera Switch (C)'});
    var btnBots = buttonCreator({top: '70px', color:'red', display: 'none'},{text: 'Enable Bots'});
    var btnGrids = buttonCreator({top: '90px', color:'red', display: 'none'},{text: 'Enable Grids'});
    var btnTrees = buttonCreator({top: '1300px', color:'red', display: 'none'},{text: 'Enable Trees'});
    var btnWays = buttonCreator({top: '110px', color:'black', display: 'none'},{text: 'Show Ways'});
    var camFresh = divCreator({top: '1vh', right: '1vw', height: '30px', color: 'black', display: 'none'}, {text: '', id:'position'});
    var speedFresh = divCreator({top: '93vh', right: '89vw', height: '90px', color: 'black', display: 'block', fontSize: '2rem'}, {text: 'none', id: 'speed'});
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