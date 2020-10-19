import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { toggleDebugWays } from './way'
import {disableTrees} from './dressmap'
import {toggleEsp} from './control'

var camPosInterval;

export function buttonCreator(style, content){
    var tmpBtn = document.createElement('button');
    tmpBtn.setAttribute('style', style + `; z-index: 10; position: absolute; font-weight: 800; color: white; opacity: 0.6; border-radius: 8px`);
    tmpBtn.id = content.id;
    tmpBtn.className = content.class;
    tmpBtn.innerText = content.text;
    return tmpBtn;
}


// export function buttonIconCreator(style, content){
    
//     var tmpBtn = document.createElement('button');
//     var tmpIcon = document.createElement('span');
//     tmpBtn.style.background = 'url(../images/speedometer.svg)'
//     tmpIcon.style.background = 'url(../images/speedometer.svg)';
//     tmpIcon.style.height = '15px'

//     tmpBtn.setAttribute('style', style + `; z-index: 10; position: absolute; font-weight: 800; color: white; opacity: 0.6; border-radius: 8px`);
//     tmpBtn.appendChild(tmpIcon);
//     tmpBtn.innerText = content.text;
//     console.log(tmpBtn);
//     return tmpBtn;
// }

export function divCreator(style, content){
    var tmpDiv = document.createElement('div');

    tmpDiv.setAttribute('style', style + `;z-index: 10; position: absolute; font-weight: 800`);

    tmpDiv.id = content.id;
    tmpDiv.innerText = content.text;
    return tmpDiv;
}

function changeColorAndText(divs, text = ['Enable', 'Disable'], colors = ['red', 'green']){
    divs.forEach (div => {
        var contains = div.innerText.includes(text[0]);
        div.style.backgroundColor = (div.style.backgroundColor === colors[0] ? colors[1] : colors[0]);
        div.innerText = div.innerText.replace(contains ? text[0] : text[1],  contains ? text[1] : text[0]);
    })
}

function setMainMenu(scene, camera, internalCamera, freecamera, bots, grids){
    var btnMenu = buttonCreator('top: 50px; right: 0; background-color:black; display: block',{text: 'Debug Menu'});
    var btnJ = buttonCreator('top: 70px; right: 0;background-color:green; display: none',{text: 'Disable Joysticks'});
    var btnCam = buttonCreator('top:30px; right: 0;background-color: black; display: none',{text: 'FreeCamera Switch (C)'});
    var btnSwCam = buttonCreator('top:50px; right: 0;background-color: black; display: none',{text: 'Camera Switch'});
    var btnBots = buttonCreator('top: 90px; right: 0;background-color:red; display: none',{text: 'Enable Bots'});
    var btnGrids = buttonCreator('top: 110px; right: 0;background-color:red; display: none',{text: 'Enable Grids'});
    var btnEsp = buttonCreator('top: 130px; right: 0;background-color:green; display: none',{text: 'Disable ESP'});
    var btnWays = buttonCreator('top: 150px; right: 0;background-color:black; display: none',{text: 'Show Ways'});
    var btnTrees = buttonCreator('top: 170px; right: 0;background-color:red; display: none',{text: 'Enable Trees'});
    var camFresh = divCreator('top: 1vh; right: 1vw; height: 30px; display: none', {text: '', id:'position'});
    var speedFresh = divCreator('font-family: aldrich ; text-align:center; top: 85.5vh; right: 69.5vw; height: 8rem; display: block; color: #56CCF2;font-size: 3rem', {text: 'none', id: 'speed'});
    var btnDivArray = [btnMenu, btnCam, btnSwCam, btnJ, btnBots, btnWays, camFresh, speedFresh, btnGrids, btnEsp];

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
        changeColorAndText([btnJ]);
        if (VirtualJoystick.Canvas.style.zIndex == "-1"){
            VirtualJoystick.Canvas.style.zIndex = "4";
        } else {
            VirtualJoystick.Canvas.style.zIndex = "-1";
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


    btnSwCam.onclick = () => {
        if (scene.activeCamera != internalCamera) {
            speedFresh.setAttribute('style', 'right:57.5vw');
            document.getElementById('dash').setAttribute('style', 'right:50vw');
            camFresh.style.display = 'none';
            scene.activeCamera = internalCamera;
        } else {
            document.getElementById('dash').setAttribute('style', 'right:62vw');
            speedFresh.setAttribute('style', 'right:69.5vw');
            scene.activeCamera = camera;
            clearInterval(camPosInterval);
            camFresh.style.display = 'none';
        }
    }

    btnBots.onclick = () => {
        console.log(bots);
        changeColorAndText([btnBots]);
        bots.forEach(bot => {
            bot.isVisible = (bot.isVisible ? false : true)
            bot.setEnabled(bot.isVisible ? true : false)
        })
    }

    btnTrees.onclick = () => {
         disableTrees();
    }
    
    btnGrids.onclick = () => {
        changeColorAndText([btnGrids]);
        if (btnGrids.innerText == 'Disable Grids'){
            grids.forEach(grid => grid.visibility = 0);
        } else {
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

    btnEsp.onclick = () => {
        toggleEsp();
        changeColorAndText([btnEsp]);
    }
}

function setControlMenu(){
    var btnMenuControls = buttonCreator('top: 50px; left: 0; background-color:black; display: block',{text: 'Control Options'});
    var dir = buttonCreator('top: 50px; left: 0; background-color:rgb(66, 135, 245); display: none', {text: 'Slide Direction', id: 'dir', class: 'control-menu'});
    var spd = buttonCreator('top: 70px; left: 0; background-color:rgb(66, 135, 245); display: none', {text: 'Button Speed', id: 'spd', class: 'control-menu'});
    var lk = buttonCreator('top: 90px; left: 0; background-color:rgb(66, 135, 245); display: none', {text: 'Tilt Look', id: 'lk', class: 'control-menu'});
    var controlMenuArray = [btnMenuControls, dir, spd, lk];

    dir.addEventListener('click', function(){
        changeColorAndText([dir], ['Slide', 'Tilt'], ['rgb(66, 135, 245)', 'rgb(66, 194, 173)']);
    });

    spd.addEventListener('click', function(){
        if (spd.innerHTML.includes('Button')) {
            spd.style.backgroundColor = 'rgb(66, 194, 173)';
            spd.innerText = spd.innerText.replace('Button', 'Slide');
        } else if (spd.innerHTML.includes('Slide')) {
            spd.style.backgroundColor = 'rgb(84, 179, 71)';
            spd.innerText = spd.innerText.replace('Slide', 'Tilt');
        } else if (spd.innerHTML.includes('Tilt')){
            spd.style.backgroundColor = 'rgb(66, 135, 245)';
            spd.innerText = spd.innerText.replace('Tilt', 'Button');
        }
    })

    lk.addEventListener('click', function(){
        if (lk.innerHTML.includes('Tilt')) {
            lk.style.backgroundColor = 'rgb(66, 194, 173)';
            lk.innerText = lk.innerText.replace('Tilt', 'Slide');
        } else if (lk.innerHTML.includes('Slide')) {
            lk.style.backgroundColor = 'rgb(84, 179, 71)';
            lk.innerText = lk.innerText.replace('Slide', 'Off');
        } else if (lk.innerHTML.includes('Off')){
            lk.style.backgroundColor = 'rgb(66, 135, 245)';
            lk.innerText = lk.innerText.replace('Off', 'Tilt');
        }
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

    controlMenuArray.forEach(div => {
        document.body.appendChild(div)
    })
}

export default function createMenu(scene, camera, freecamera, bots, grids){
    setMainMenu(scene,camera,freecamera,bots,grids);
    setControlMenu();
}