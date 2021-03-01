import { VirtualJoystick } from '@babylonjs/core/Misc/virtualJoystick'
import { toggleDebugWays } from './../ways/logic/roads'
import {disableTrees} from '../environment/dressmap'
import {toggleEsp} from './loops'
import { Vector3 } from '@babylonjs/core/Maths/math';
import {buttonCreator, divCreator, valueButtonCreator, divControlCreator, accelerationWitness, falseStickCreator, menuOptions} from '../creators/buttoncreator.js';
import {scoreDivCreator} from '../creators/UIElementsCreator.js';
import type from '../enum/buttontype';

var camPosInterval;
var controlTab = [[],[]];

export function toggleCustomModes(display){
    controlTab[type.MODE].forEach((btn) => {
        if (btn!=controlmode )
        btn.style.display = display;
    })
    return controlTab;
}

function changeColorAndText(divs, text = ['Enable', 'Disable'], colors = ['red', 'green']){
    divs.forEach (div => {
        var contains = div.innerText.includes(text[0]);
        div.style.backgroundColor = (div.style.backgroundColor === colors[0] ? colors[1] : colors[0]);
        div.innerText = div.innerText.replace(contains ? text[0] : text[1],  contains ? text[1] : text[0]);
    })
}

function setMainMenu(scene, camera, internalCamera, freecamera){
    let {sound, changecam} = menuOptions();
    let top = 22
    // var test = divCreator('top:0; left: 0;height: 100vh; width: 50vw; border: solid 2px black', {id: 'test', text:'middle debug'})
    //document.body.appendChild(test);// debug middle
    var btnMenu = buttonCreator(`top: ${top}vh; right: 0; background-color:black; display: block`,{text: 'Debug Menu'});
    var btnCam = buttonCreator(`top: ${top}vh; right: 0;background-color: black; display: none`,{text: 'FreeCamera Switch (C)'});
    var btnSwCam = buttonCreator(`top: ${top+4}vh; right: 0;background-color: black; display: none`,{text: 'Camera Switch'});
    var btnJ = buttonCreator(`top: ${top+8}vh; right: 0;background-color:green; display: none`,{text: 'Disable Joysticks'});
    var btnBots = buttonCreator(`top: ${top+12}vh; right: 0;background-color:red; display: none`,{text: 'Enable Bots'});
    var btnCamOri = buttonCreator(`top: ${top+16}vh; right: 0;background-color:red; display: none`,{text: 'Enable Orientation Pos'});
    var btnTrees = buttonCreator(`top: ${top+20}vh; right: 0;background-color:red; display: none`,{text: 'Enable Trees'});
    var btnBar = buttonCreator(`top: ${top+24}vh; right: 0;background-color:black; display: none`,{text: 'Hide TopBar'});
    var btnWays = buttonCreator(`top: ${top+28}vh; right: 0;background-color:black; display: none`,{text: 'Show Ways'});
    var btnEsp = buttonCreator(`top: ${top}vh; right: 0;background-color:green; display: none`,{text: 'Disable ESP'});
    var btnGrids = buttonCreator(`top: ${top}vh; right: 0;background-color:red; display: none`,{text: 'Enable Grids'});
    
    var accelWitness = accelerationWitness();
    var camFresh = divCreator('top: 0; right: 40%; height: 1rem;font-size:0.7rem; display: block', {text: '', id:'position'});
    var camOriFresh = divCreator('top: 0; left: 0; width: 40vw; color: #d42a2a; height: 2rem; display: block; font-size: 0.8rem;display: none;', {text: '', id:'camerapos'});
    var carPosFresh = divCreator('top: 0; left: 0; width: 40vw; color: #d42a2a; height: 2rem; display: block; font-size: 0.8rem;display: none;', {text: '', id:'carpos'});
    var speedFresh = divCreator('font-family: aldrich ; text-align:center; bottom: -7vh; right: 35vw; height: 25vh; width: 29vw; display: none; color: #56CCF2;font-size: 5vw;', {text: '00', id: 'speedold'});
    var scoreFresh = scoreDivCreator();
    var falseStick = falseStickCreator();
    
    var btnDivArrayMenu = [btnMenu, btnCam, btnSwCam, btnJ, btnBots, btnWays, /*btnGrids, btnEsp,*/ btnCamOri, carPosFresh, btnBar];
    var divArray = [speedFresh, camFresh, camOriFresh];
    var insertArray =  [scoreFresh, falseStick, accelWitness];

    insertArray.forEach(div => {
        document.body.insertAdjacentHTML('afterbegin', div);
    })

    btnDivArrayMenu.forEach(btn => {
        document.body.appendChild(btn);
    })

    divArray.forEach(div => {
        document.body.appendChild(div);
    })

    btnBar.addEventListener('touchstart', function (){
        window.scrollTo(0, 1);
    })

    btnMenu.onclick = () => {
        if (btnMenu.innerText === 'Debug Menu') {
            btnDivArrayMenu.forEach(btn => {
                btn.style.display = 'block';
            })
            btnMenu.innerText = 'Hide Menu';
            btnMenu.style.top = `${top + 42}vh`;
        } else {
            btnDivArrayMenu.forEach(btn => {
            if (btn != btnMenu)
                    btn.style.display = 'none';
            })
            btnMenu.innerText = 'Debug Menu';
            btnMenu.style.top = `${top}vh`;
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
        scene.activeCamera = scene.activeCamera == freecamera ? internalCamera : freecamera
        //scene.activeCamera = freecamera;
        console.log(scene.activeCamera)
        if (scene.activeCamera === camera) {
            clearInterval(camPosInterval);
            camFresh.style.display = 'none';
            console.log('joysticks were deactivated to use freecamera')
            disableJoysticks();
        } else {
            showPosCam();
            scene.activeCamera.lockedTarget = null;
            camFresh.style.display = 'block';
            disableJoysticks();
        }
    }

    const switchCam = () => {
        switch (scene.activeCamera){
            case internalCamera:
                scene.activeCamera = camera
                break
            case camera:
                scene.activeCamera = freecamera
                break
            default:
                scene.activeCamera = internalCamera
        }
    }
    
    changecam.addEventListener('touchmove', () => {switchCam()})
    changecam.addEventListener('click', () => {switchCam()})

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

    // btnGrids.onclick = () => {
    //     changeColorAndText([btnGrids]);
    //     if (btnGrids.innerText == 'Disable Grids'){
    //         grids.forEach(grid => grid.visibility = 0);
    //     } else {
    //         grids.forEach(grid => grid.visibility = 1);
    //     }
    // }

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

function setControlMenu(scene){
    //USELESS, TO REMOVE
    //var btnMenuControls = buttonCreator('top: 15vh; white-space: nowrap; left: 0; background-color:black; display: block;',{text: 'Control Settings'});
    var controlMenu = ['controlmode', 'lk', 'dir', 'spd'];
    var sensiMenu = ['front', 'side', 'ori', 'setori', 'setcam', /*'sound',*/ 'controlmode', 'carselector'];//controlmode out if different modes are reinstantiated
    var wasOpen = false;

    //document.body.appendChild(btnMenuControls);
    
    //Default
    document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'width: 10vw; line-height: 7vh; height: 7vh;border: solid #43c7f7 3px; background-color: #43c7f7; top: 16vh; left: 0; ;display:none;', id: 'controlmode'}, {src: '../../images/mode.svg', style: ';margin-left: 0.1rem; margin-bottom: 0.4vh; height: 6vh; width: 4vw;'}, {src: '../../images/mode2.svg', style:'margin-left: 10vw; opacity: 1; margin-top: 1vh; margin-left:1vw; height: 6vh; width: 4vw;'}));
    document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'width: 10vw; line-height: 7vh; height: 7vh;border: solid #fc6d62 3px; background-color: #fc6d62; top: 16vh; left: 11vw; ;display:none;', id: 'carselector'}, {src: '../../images/carselector.svg', style: ';margin-left: 0.1rem; margin-bottom: 0.4vh; height: 6vh; width: 4vw;'}, {src: '../../images/ford.svg', style:'margin-left: 10vw; opacity: 1; margin-top: 1vh; margin-left:1vw; height: 6vh; width: 4vw;'}));
    //Buttons Advanced Control Menu
    document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'width: 5rem; height: 1.7rem; border: solid #7aed6b 3px; background-color: #7aed6b; top: 41vh; left: 0 ;display:none;', id: 'dir'}, {src: '../../images/steer.svg', style: 'margin-left: 0.1rem; opacity: 1,;margin-bottom: 0.1rem; height: 1.8rem; width: 1.8rem;'}, {src: '../../images/tilt.svg', style:'margin-left: 0.4rem; opacity: 1; margin-bottom: 0.1rem; height: 1.8rem; width: 1.8rem;'}));
    document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'width: 5rem; height: 1.7rem;border: solid #f5f05f 3px; background-color: #f5f05f; top: 45vh; left: 0 ;display:none;', id: 'spd'}, {src: '../../images/slide.svg',style: 'margin-left: 0.1rem;  height: 1.9rem; width: 1.9rem;'}, {src: '../../images/tilt.svg', style:'margin-left: 0.4rem; opacity: 1; margin-left:0.3rem; height: 1.8rem; width: 1.8rem;'}));
    //Buttons Sensitivity Menu
    document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'top: 40.5vh; left: 0.2vw; height: 9vh; width: 8vw; display:none;', id: 'ori'}, {src: '',style: ''}, {src: '../../images/smartphone.png', style:'opacity: 1; height: 9vh; width: 6vw'}));
    document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'top: 37.5vh; left: 7.5vw; height: 6vh; width: 5vw ;display:none;', id: 'setori'}, {src: '',style: ''}, {src: '../../images/explore.svg', style:'opacity: 1; height: 6vh; width: 5vw'}));
    document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'top: 19vh; right: 1.5vw; height: 5vh; width: 5vw ;display:none;', id: 'setcam'}, {src: '',style: ''}, {src: '../../images/cam.svg', style:'opacity: 1; height: 7vh; width: 5vw'}));
    //document.body.insertAdjacentHTML('afterbegin', divControlCreator({style: 'top: 13vh; right: 1vw; height: 5vh; width: 6vw; display:none;', id: 'sound'}, {src: '',style: ''}, {src: '../../images/nosound.svg', style:'opacity: 1; height: 7vh; width: 6.5vw'}));
    document.body.insertAdjacentHTML('afterbegin', valueButtonCreator({style: 'top: 25vh; display:none;', mainid:'front', id: 'frontsensi', idminus:'frontdec', idplus:'frontinc'}, {style:'height: 6vh; width: 6wv;margin-top: 1%;', src:'../../images/frontsensi.svg'}));
    document.body.insertAdjacentHTML('afterbegin', valueButtonCreator({style: 'top: 32vh; display:none;', mainid: 'side', id: 'sidesensi', idminus:'sidedec', idplus:'sideinc'}, {style:'height: 6vh; width: 3vw; margin-top: 1%;', src:'../../images/sidesensi.svg'}));
    

    controlMenu.forEach(id => {
        controlTab[type.MODE].push(document.getElementById(id));
    })
    sensiMenu.forEach(id => {
        controlTab[type.SENSI].push(document.getElementById(id));
    })
    
    // btnMenuControls.onclick = () => {
    //     if (btnMenuControls.innerText === 'Control Settings') {
    //         controlTab[type.SENSI].forEach((btn) => {
    //             btn.style.display = 'block';
    //         })
    //         controlTab[type.MODE].forEach((btn) => {
    //             if (wasOpen === false && btn != controlmode)
    //                 wasOpen = btn.style.display === 'block' ? true : false;
    //             if (btn != controlmode)
    //                 btn.style.display = 'none';
    //         })
    //         btnMenuControls.innerText = 'Hide';
    //         btnMenuControls.style.top = '45vh';
    //         btnMenuControls.style.zIndex = '15';
    //     } else {
    //         controlTab[type.SENSI].forEach((btn) => {
    //             btn.style.display = 'none';
    //         })
    //         if (wasOpen === true){
    //             controlTab[type.MODE].forEach((btn) => {
    //                 btn.style.display = 'block';
    //             })
    //         }
    //         btnMenuControls.innerText = 'Control Settings';
    //         btnMenuControls.style.top = '9vh';
    //     }
    // }
   
    
    // spd.addEventListener('click', function(){
    //     if (spd.children[1].src.includes('tilt')){
    //         spd.children[1].src = '../../images/rotate.svg';
    //     } else if (spd.children[1].src.includes('rotate')) {
    //         spd.children[1].src = '../../images/brake.svg';
    //     } else {
    //         spd.children[1].src = '../../images/tilt.svg';
    //         lk.children[1].src = '../../images/tilt.svg';
    //     }
    // })

    // lk.addEventListener('click', function(){
    //     if (!spd.children[1].src.includes('tilt')){
    //         if (lk.children[1].src.includes('nolook')){
    //             lk.children[1].src = '../../images/rotate.svg';
    //         } else if (lk.children[1].src.includes('rotate')) {
    //             lk.children[1].src = '../../images/tilt.svg';
    //         } else {
    //             lk.children[1].src = '../../images/nolook.svg';
    //         }
    //     } else {
    //         lk.children[1].src = '../../images/tilt.svg';
    //     }
    // })

    // dir.addEventListener('click', function(){
    //     if (dir.children[1].src.includes('tilt')){
    //         dir.children[1].src = '../../images/rotate.svg';
    //     } else {
    //         dir.children[1].src = '../../images/tilt.svg';
    //     }
    // })

    

}

export default function createMenu(scene, camera, internalCamera, freecamera){
    setMainMenu(scene,camera,internalCamera, freecamera);
    setControlMenu(scene);
}