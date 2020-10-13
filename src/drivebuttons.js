import {buttonCreator, divCreator} from './menu.js'

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
    var accel = buttonDriveCreator('z-index: 10; top: 80vh; right: 2vw; height:6rem;',{height: '6rem', id:'accelerator',img: '../images/gaspedal.png'});
    var brake = buttonDriveCreator('z-index: 10; top: 85vh; right: 7.5vw; height:3.5rem;',{height: '3.5rem', id:'brake', img: '../images/brake.png'});
    var wheel = buttonDriveCreator('z-index: 10; top: 68vh; right: 83vw; height:8rem;', {height: '8rem', id: 'wheel', img: '../images/steerwheel.png'})
    var dashboard = buttonDriveCreator('z-index: 0; top: 68vh; right: 80.5vw; height: 9rem;', {height: '4rem', id: 'dash', img: '../images/dashboard.png'});
    var btnDivArray = [accel, brake, wheel, dashboard];

    btnDivArray.forEach(btn => {
        document.body.appendChild(btn);
    })


    console.log(accel);
    accel.value = 0;
    brake.value = 0;

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

}