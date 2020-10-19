import {buttonCreator, divCreator} from './menu.js'
import { Vector3 } from '@babylonjs/core/Maths/math';

// buttonCretor({style}, {content})


export function buttonDriveCreator(style, content){
    var tmpBtn = document.createElement('div');
    var tmpImg = document.createElement('img');

    tmpImg.src = content.img;
    tmpImg.style.height = content.height;
    tmpBtn.setAttribute('style', style + `position: absolute;`);
    tmpBtn.id = content.id;
    tmpBtn.appendChild(tmpImg);
    return tmpBtn;
}


export default function createButtons (scene){
    var accel = buttonDriveCreator('z-index: 10; top: 73vh; right: 5vw; height:11rem;',{height: '8rem', id:'accelerator',img: '../images/gas2.svg'});
    var brake = buttonDriveCreator('z-index: 10; top: 84.5vh; right: 14vw; height:3.5rem;',{height: '4rem', id:'brake', img: '../images/brake2.svg'});
    var wheel = buttonDriveCreator('z-index: 0;top: 60vh; right: 78vw; height:12rem;', {height: '12rem', id: 'wheel', img: '../images/steerwheel2.svg'})
    var dashboard = buttonDriveCreator('z-index: 0; top: 82vh; right: 62vw; height: 8rem;', {height: '6rem', id: 'dash', img: '../images/dashboard2.png'});
    var left = buttonDriveCreator('opacity: 0.7; z-index: 10; top: 54vh; right: 15vw; height: 6rem;', {height: '6rem', id: 'left', img: '../images/left.svg'});
    var right = buttonDriveCreator('opacity: 0.7; z-index: 10; top: 54vh; right: 4vw; height: 6rem;', {height: '6rem', id: 'right', img: '../images/right.png'});


    var btnDivArray = [accel, brake, wheel, dashboard, left, right];

    btnDivArray.forEach(btn => {
        document.body.appendChild(btn);
    })

    accel.value = 0;
    brake.value = 0;

    // DeviceOrientationEvent.requestPermission()
    window.addEventListener("contextmenu", function(e) { e.preventDefault(); })//debug to deactivate right click menu ontouch

    var interAccel;
    var interBrake;

    accel.addEventListener('touchstart', function (){
        //accel.style.transform = (accel.style.transform == 'rotate3d(1, 0, 0, 45deg)' ? 'rotate3d(1, 0, 0, 0deg)' : 'rotate3d(1, 0, 0, 45deg)');
        accel.style.transform = 'rotate3d(1, 0, 0, 45deg)';

        console.log('start');
            accel.value = 0.3;
            interAccel = setInterval(() => {
                
                accel.value = accel.value + 0.3;
            }, 250)
     })
     accel.addEventListener('touchend', function (){
        accel.style.transform = 'rotate3d(1, 0, 0, 0deg)';
        accel.value = 0;
        clearInterval(interAccel);
     })
    
     brake.addEventListener('touchstart', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 45deg)';
        accel.value = accel.value - 0.3;
        interBrake = setInterval(() => {
            accel.value = (accel.value <= -1 ? -1 : accel.value - 0.3);
        }, 250)
    })

    brake.addEventListener('touchend', function(){
        brake.style.transform = 'rotate3d(1, 0, 0, 0deg)';
        accel.value = 0;
        clearInterval(interBrake);
    })

    left.addEventListener('touchstart', function(){
        left.style.opacity = '1'
        scene.activeCamera.setTarget(new Vector3(-15, 6, 50));
    });

    left.addEventListener('touchend', function(){
        left.style.opacity = '0.7'
        scene.activeCamera.setTarget(new Vector3(0, 0, 50));

    });

    right.addEventListener('touchstart', function(){
        right.style.opacity = '1'
        scene.activeCamera.setTarget(new Vector3(15, 6, 50));
    });

    right.addEventListener('touchend', function(){
        right.style.opacity = '0.7'
        scene.activeCamera.setTarget(new Vector3(0, 0, 50));

    });

}