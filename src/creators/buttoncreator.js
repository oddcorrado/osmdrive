
export function buttonDriveCreator(style, content){
    var tmpBtn = document.createElement('div')
    var tmpImg = document.createElement('img')

    tmpImg.src = content.img
    tmpImg.setAttribute('style', content.style)
    tmpImg.setAttribute('draggable', false)
    tmpBtn.setAttribute('style', style + `position: absolute;`)
    tmpBtn.id = content.id
    tmpBtn.appendChild(tmpImg)
    return tmpBtn;
}

export function falseStickCreator(){
    var tmpdiv =  `<div id='falsestick' style="position: absolute; width: 18%; height: 0; padding-bottom: 18%;text-align: center;border-radius: 50%; border: 0.3vw solid #56CCF2; display: none; top: 40vh; right: 10vw;">     
    <div style="margin-top: 14%; margin-left: 14%;border: 0.9vw solid #56CCF2; width: 60%; height: 0; padding-bottom: 60%; border-radius: 50%">
    </div>
    </div>`
    return tmpdiv;
}

export function feedbackDivCreator(content){
    var tmpdiv = `<div id='feedback-drive' style='position: absolute; top: 20vh; left: 40vw; text-align:center; font-size: 5vh; color: ${content.color}; height: 10vh; width: 30vw'>
        ${content.text} <div style="margin-top: 4vh; display: inline-block"><img style='height: 5vh; width:5vh; display: inline-block; margin-left: 1vw;' src=${content.img}></img></div>
    </div>`

    document.body.insertAdjacentHTML('afterbegin', tmpdiv)
    setTimeout(() => {
        document.getElementById('feedback-drive').remove();
    }, 3000);
}

export function divCreator(style, content){
    var tmpDiv = document.createElement('div');

    tmpDiv.setAttribute('style', style + `; position: absolute; font-weight: 800`);

    tmpDiv.id = content.id;
    tmpDiv.innerText = content.text;
    return tmpDiv;
}

export function buttonCreator(style, content){
    var tmpBtn = document.createElement('button');
    tmpBtn.setAttribute('style', style + `; z-index: 10; position: absolute; width: 13vw; height: 4vh;font-size: 2vh;font-weight: 800; color: white; opacity: 0.6; border-radius: 8px`);
    tmpBtn.id = content.id;
    tmpBtn.className = content.class;
    tmpBtn.innerText = content.text;
    return tmpBtn;
}

export function divControlCreator(div, img, defimg){
    var div = `<div id='${div.id}' style='${div.style}; z-index: 10; position: absolute; font-weight: 800; opacity: 0.6; border-radius: 8px'> 
        <img src='${img.src}' style='${img.style}; position: relative;'></img>
        <img src='${defimg.src}' style='${defimg.style};'></img>
    </div>`;

    return div;
}


export function valueButtonCreator(maindiv, img){
    var div = `
    <div id='${maindiv.mainid}' style='${maindiv.style}; z-index: 10 ;background-color: #dbdbdb; width: 16vw; height: 6vh; z-index: 10; position: absolute; font-weight: 400; border-radius: 8px; opacity: 0.8;'>
        <div id='${maindiv.idminus}' style='text-align: center;font-size: 6vh; line-height: 5vh; height: 6vh; width: 25%; border-right: solid black 2px; float: left'>
            -
        </div>
        <div style='width: 46%; float: left '>
            <div style='margin-left:2%'>
                <img src='${img.src}' style='${img.style}; float: left'></img>
            </div>
            <div id='${maindiv.id}' style='font-size: 4vh; margin-top: 10%;font-weight: 800; margin-left: 18%; line-height: 4vh;float:left'>0</div>
        </div>
        <div id='${maindiv.idplus}' style='text-align: center;z-index: 10;font-size: 5vh; line-height: 5vh; height: 6vh; width: 25%; border-left: solid black 2px; float: left'>
            +
        </div>
    </div>`
    return div;
}

export function menuOptions(){
    var div = `
    <div style='position: absolute; top: 15vh; right: 1vw'>
        <img id='sound' src='../../images/nosound.svg' style='height: 7vh; width: 5vw; z-index: 12'></img>
        <img id='changecam' src='../../images/cam.svg' style='height: 7vh; width: 5vw; z-index: 12'></img>
        <img id='control' src='../../images/keyboard.svg' style='height: 7vh; width: 5vw; z-index: 12'></img>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
    
    return {sound: document.getElementById('sound'), changecam: document.getElementById('changecam')};
}

export function accelerationWitness(){
    var div = `
    <div style='position: absolute; display: none; bottom: 0vh; right: 26vw; height: 20vh;'>
        <div>
            <div style='height: 2vh; width: 4vw'>
                <img class='accelwit' id='maxf' style='height: 6vh; width: 4vw' src='../../images/Vclear.svg'></img>
            </div>
            <div style='height: 2vh; width: 4vw'>
                <img class='accelwit' id='avgf' style='height: 6vh; width: 4vw' src='../../images/Vclear.svg'></img>
            </div>
            <div style='height: 2vh; width: 4vw'>
                <img class='accelwit' id='minf' style='height: 6vh; width: 4vw' src='../../images/Vclear.svg'></img>
            </div>
        </div>
        <div>
            <img id='neutral' src='../../images/greencircle.svg' style='height: 3vh; margin-left: 31%; margin-top: 2vh; margin-bottom: 1.2vh'></img>
        </div>
        <div style='display:block'>
            <div style='transform: rotateZ(180deg); height: 2vh; width: 4vw'>
                <img class='accelwit' id='minb' style='height: 6vh; width: 4vw' src='../../images/Vclear.svg'></img>
            </div>
            <div style='transform: rotateZ(180deg); height: 2vh; width: 4vw'>
                <img class='accelwit' id='avgb' style='height: 6vh; width: 4vw' src='../../images/Vclear.svg'></img>
            </div>
            <div style='transform: rotateZ(180deg); height: 2vh; width: 4vw'>
                <img class='accelwit' id='maxb' style='height: 6vh; width: 4vw' src='../../images/Vclear.svg'></img>
            </div>
        </div>
    </div>`
    return div;
}

export function scoreDivCreator(){
   var div = ` <div style='display: block; height: 12vh;  font-family: "Asap Condensed", sans serif; font-weight: 700; font-size: 6vh; border-bottom-left-radius: 6vh;position: absolute; top: 0; right: 0; width: 15vw; background-color: #262626; color: white;'>
        <div style='float: left; margin-left: 2vw; margin-top: 2vh'>
            <img style='height: 4.5vh' src='../../images/star.svg'></img>
        </div>
        <div id='score' style='float: left; margin-left: 2vw; margin-top: 1.8vh; height: 100%'>
            0
        </div>
    </div>`
    return div;
}

export function dashboardCreator(){
    var div = 
       ` <div id='dashboard' style='position: absolute;
            bottom: -8vh;
            width: 14vw;
            height: 35vh;
            left: 43vw;
            border-radius: 4vw;
            background-color: rgba(0,0,0,0.7);
            color: white;
            font-family: Microbrew Soft One, sans-serif';
            >
            <div style='margin-top: 3vh; margin-left: 1vw; display: inline-block' id='next-turn'>
                <img id='gps' style='height: 7vh; width: 6vw' src='../../images/straight.svg'></img>
            </div>
            <div style='margin-top: 3vh; display: inline-block' id='next-turn'>
                <img id='gps' style='height: 7vh; width: 6vw' src='../../images/30.svg'></img>
            </div>
            <div id='speeddiv' style='text-align:center; rgba(0.25, 0.25, 0.25, 0.5); height: 40%; max-width:66%; margin-left: 17%; border-radius: 2vh; margin-top: 5%'>
                <div id='speed' style='text-align: center; display: inline-block ;height: 7vh;font-size: 8vh; font-weight: 400' id='speed'>0</div>    
                <div style='font-size: 3vh;color: white; margin-top: 0.5vh;font-weight: normal; opacity: 0.4;'>KM/H</div>
            </div> 
        </div>`
        return div;
}

export function tapButtonCreator(){
    var div = `
    <div>
        <div style="position: absolute;
            bottom: 4vh;
            right: 0vh;
            z-index: 10;
            width: 25vw;
            height: 30vh;
            display: flex;
            flex-direction: row-reverse;">
            <div style='width: 15vw'>
                <img draggable=false id='up' style="height: 30vh; width: 12vw; opacity:0.9" src='../../images/accel.svg'></img>
            </div>
            <div style='width: 13vw'>
                <img draggable=false id='down' style="height: 17vh; width: 14vw; margin-top: 13vh; opacity:0.9" src='../../images/brake.svg'></img> 
            </div>
        </div>
    </div>`

    return div;
}

export function viewZoneCreator(){
    var div =
    `<div id='view' style='position: absolute; z-index:10;bottom: 50vh; left: 6vw; width: 24vw; height: 20vh; text-align: center'>
        <div style='margin-top: 5vh'>
            <img draggable=false style='height: 10vh; width: 24vw; text-align:center;' src='../images/arrow.svg'></img>
        </div>
        <div id='look-eye' style='position:relative; left: 0vh;bottom: 15.2vh;'>
            <img draggable=false style='height: 19vh; width: 10vw' src='../images/centerview.svg'></img>
        </div>
    </div>`
    return div;
}

export function wheelCreator(){
    var div =
    `<div id='wheelzone' style='position: absolute; z-index: 10; bottom: 5vh; left: 0; height:40vh; width: 37vw; text-align: center; align-item: center'>
        <img draggable=false id='wheelimg' src='../images/wheel.svg' style='height: 40vh; width: 37vw;'></img>
    </div>`
     return div
}

export function wheelLockedCreator(){
    var div =
        `<div style='text-align: center'>
            <img draggable=false id='wheellocked' src='../images/locked.svg' style='display: none; z-index: 11;position: absolute; bottom: 3vh; left: 0vw; height: 53vh; width: 28vw; opacity: 0.8'></img>
        </div>`
     return div
}

export function blinkerCreator(){
    var div =`
    <div style='position: absolute; bottom: 5vh; left: 32.5%; width: 35%;z-index: 11; '>
        <div id='lblink' style='float: left; display: inline-block; height: 14vh; width: 10vw;'>
            <img id='lblinkimg' src='../images/blinkdef.svg' style='height: 14vh; width: 10vw;'></img>
        </div>
        <div id='rblink' style='float: right; transform: rotateY(180deg); height: 14vh; width: 10vw; display: inline-block'>
            <img id='rblinkimg' src='../images/blinkdef.svg' style='height: 14vh; width: 10vw'></img>
        </div>
    </div>
   `
   return div 
}