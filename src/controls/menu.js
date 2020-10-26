import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { toggleDebugWays } from './../way'
import {disableTrees} from './../dressmap'
import {toggleEsp} from './control'
import { Vector3 } from '@babylonjs/core/Maths/math';
import { buttonDriveCreator } from './drivebuttons';

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
    // var test = divCreator('top:0; left: 0;height: 100vh; width: 50vw; border: solid 2px black', {id: 'test', text:'middle debug'})
    // document.body.appendChild(test);// debug middle
    var btnMenu = buttonCreator('top: 50px; right: 0; background-color:black; display: block',{text: 'Debug Menu'});
    var btnJ = buttonCreator('top: 70px; right: 0;background-color:green; display: none',{text: 'Disable Joysticks'});
    var btnCam = buttonCreator('top:30px; right: 0;background-color: black; display: none',{text: 'FreeCamera Switch (C)'});
    var btnSwCam = buttonCreator('top:50px; right: 0;background-color: black; display: none',{text: 'Camera Switch'});
    var btnBots = buttonCreator('top: 90px; right: 0;background-color:red; display: none',{text: 'Enable Bots'});
    var btnGrids = buttonCreator('top: 110px; right: 0;background-color:red; display: none',{text: 'Enable Grids'});
    var btnEsp = buttonCreator('top: 130px; right: 0;background-color:red; display: none',{text: 'Enable ESP'});
    var btnCamOri = buttonCreator('top: 150px; right: 0;background-color:green; display: none',{text: 'Disable Orientation Pos'});
    var btnTrees = buttonCreator('top: 170px; right: 0;background-color:red; display: none',{text: 'Enable Trees'});
    var btnWays = buttonCreator('top: 190px; right: 0;background-color:black; display: none',{text: 'Show Ways'});

    var camFresh = divCreator('top: 1vh; right: 1vw; height: 30px; display: none', {text: '', id:'position'});
    var camOriFresh = divCreator('top: 1vh; right: 50vw; width: 50wv; color: #d42a2a; height: 30px; display: block; font-size: 1.3rem;', {text: '', id:'camerapos'});
    var speedFresh = divCreator('font-family: aldrich ; text-align:center; top: 85.5vh; right: 47.2vw; height: 8rem; display: block; color: #56CCF2;font-size: 3rem', {text: 'none', id: 'speed'});
    var btnDivArrayMenu = [btnMenu, btnCam, btnSwCam, btnJ, btnBots, btnWays, btnGrids, btnEsp, btnCamOri];
    var divArray = [speedFresh, camFresh, camOriFresh];

    btnDivArrayMenu.forEach(btn => {
        document.body.appendChild(btn);
    })

    divArray.forEach(div => {
        document.body.appendChild(div);
    })

    btnMenu.onclick = () => {
        if (btnMenu.innerText === 'Debug Menu') {
            btnDivArrayMenu.forEach(btn => {
                btn.style.display = 'block';
            })
            btnMenu.innerText = 'Hide Menu';
            btnMenu.style.top = '210px';
        } else {
            btnDivArrayMenu.forEach(btn => {
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
        scene.activeCamera.position = new Vector3(-230, 10, -265)
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
            // speedFresh.setAttribute('style', 'right:57.5vw');
            // document.getElementById('dash').setAttribute('style', 'right:50vw');
            camFresh.style.display = 'none';
            scene.activeCamera = internalCamera;
        } else {
            // document.getElementById('dash').setAttribute('style', 'right:62vw');
            // speedFresh.setAttribute('style', 'right:69.5vw');
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
    
    btnCamOri.onclick = () => {
        changeColorAndText([btnCamOri]);
        camOriFresh.style.display = camOriFresh.style.display == 'block' ? 'none' : 'block';
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

export function divControlCreator (div, img, defimg){
    var tmpDiv = document.createElement('div');
    var tmpDefImg = document.createElement('img');
    var tmpImg = document.createElement('img');

    tmpDiv.setAttribute('style', div.style + `;width: 8vw; height: 5vh;z-index: 10; position: absolute; font-weight: 800; opacity: 0.6; border-radius: 8px`);
    tmpImg.setAttribute('style', img.style + ';position: relative;  margin-left: 0.1rem')
    tmpDefImg.setAttribute('style', defimg.style + ';position: relative; margin-left: 0.4rem')
    tmpImg.src = img.src;
    tmpDefImg.src = defimg.src;
    tmpDiv.id = div.id;
    tmpDiv.appendChild(tmpImg);
    tmpDiv.appendChild(tmpDefImg);
    return tmpDiv;
}

function setControlMenu(scene){
    var lk = divControlCreator({style: 'border: solid #43c7f7 3px; background-color: #43c7f7; top: 5vh; left: 0', id: 'lk'}, {src: '../../images/eye.svg', style: 'height: 2rem'}, {src: '../../images/rotate.svg', style:'opacity: 1; margin-bottom: 0.1rem; margin-left:0.3rem; height: 1.8rem'});
    var dir = divControlCreator({style: 'border: solid #7aed6b 3px; background-color: #7aed6b; top: 12vh; left: 0', id: 'dir'}, {src: '../../images/steer.svg', style: 'opacity: 1,;margin-bot: 0.1rem; height: 1.8rem'}, {src: '../../images/tilt.svg', style:'opacity: 1; margin-bottom: 0.1rem; height: 1.8rem'});
    var spd = divControlCreator({style: 'border: solid #f5f05f 3px; background-color: #f5f05f; top: 19vh; left: 0', id: 'spd'}, {src: '../../images/slide.svg',style: 'margin-bot: 0.1rem; height: 1.9rem'}, {src: '../../images/brake.svg', style:'opacity: 1; margin-bottom: 0.1rem; margin-left:0.3rem; height: 1.8rem'});
    var btnMenuControls = buttonCreator('top: 50px; left: 0; background-color:black; display: none',{text: 'Control Options'});

    var controlMenu = [btnMenuControls, lk, dir, spd]
    controlMenu.forEach(div => {
        document.body.appendChild(div);
    })
    
    

    spd.addEventListener('click', function(){
        console.log('test', spd.children)
        if (spd.children[1].src.includes('brake')){
            spd.children[1].src = '../../images/tilt.svg';
        } else if (spd.children[1].src.includes('tilt')) {
            spd.children[1].src = '../../images/rotate.svg';
        } else {
            spd.children[1].src = '../../images/brake.svg';
        }
    })

    lk.addEventListener('click', function(){
        if (lk.children[1].src.includes('nolook')){
            lk.children[1].src = '../../images/rotate.svg';
        } else if (lk.children[1].src.includes('rotate')) {
            lk.children[1].src = '../../images/tilt.svg';
        } else {
            lk.children[1].src = '../../images/nolook.svg';
        }
    })

    dir.addEventListener('click', function(){
        if (dir.children[1].src.includes('tilt')){
            dir.children[1].src = '../../images/rotate.svg';
        } else {
            dir.children[1].src = '../../images/tilt.svg';
        }
    })

    btnMenuControls.onclick = () => {
        if (btnMenuControls.innerText === 'Control Menu') {
            controlMenuArray.forEach(btn => {
                btn.style.display = 'block';
            })
            btnMenuControls.innerText = 'Hide';
            btnMenuControls.style.top = '150px';
        } else {
            controlMenuArray.forEach(btn => {
                if (btn != btnMenuControls)
                    btn.style.display = 'none';
            })
            btnMenuControls.innerText = 'Control Menu';
            btnMenuControls.style.top = '50px';
        }
    }

}

export default function createMenu(scene, camera, freecamera, bots, grids){
    setMainMenu(scene,camera,freecamera,bots,grids);
    setControlMenu(scene);
}