
export function buttonDriveCreator(style, content){
    var tmpBtn = document.createElement('div');
    var tmpImg = document.createElement('img');

    tmpImg.src = content.img;
    tmpImg.setAttribute('style', content.style);
    tmpBtn.setAttribute('style', style + `position: absolute;`);
    tmpBtn.id = content.id;
    tmpBtn.appendChild(tmpImg);
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
   var div = ` <div style='display: block; height: 10vh; position: absolute; top: 1vh; left: 1vw; width: 20vw; color: #56CCF2; font-size: 7vh;'>
        <div style='float: left'>
            <img style='height: 7vh' src='../../images/car.svg'></img>
        </div>
        <div id='score' style='float: left; margin-left: 1vw; height: 100%; padding-bottom: 3vh'>
            0
        </div>
    </div>`
    return div;
}

export function tapButtonCreatorOld(){
    var div = `<div id='tapbutton' style="position: absolute;top: 32vh; right: 3vw; z-index: 10;width: 30vw; height: 40vh; text-align:center">
        <div>
            <img id='up' style="height: 14vh; width: 14vw; opacity:0.7" src='../../images/upbutton.svg'></img>
        </div>
        <div>
            <img id='left' style="height: 14vh; width: 14vw; opacity:0.7; display:inline" src='../../images/leftbutton.svg'></img>
            <img id='right' style="height: 14vh; width: 14vw; opacity:0.7;display: inline" src='../../images/rightbutton.svg'></img>
        </div>
        <div style='display: block'>
            <img id='down' style="height: 14vh; width: 14vw; opacity:0.7" src='../../images/downbutton.svg'></img> 
        </div>
    </div>`

    return div;
}; 

export function dashboardCreator(){
    var div = 
       ` <div id='dashboard' style='position: absolute;
            bottom: -8vh;
            width: 14vw;
            height: 35vh;
            left: 43vw;
            text-align: center;
            border-radius: 4vw;
            background-color: rgba(0,0,0,0.7);
            color: white;
            font-family: Microbrew Soft One, sans-serif'
            >
            <div style='margin-top: 2vh' id='next-turn'>
                <img id='gps' style='height: 7vh; width: 6vw' src='../../images/straight.svg'></img>
            </div>
            <div id='speeddiv' style='background-color: none; height: 40%; width: 50%; border-radius: 2vh; margin-left: 25%; margin-top: 5%'>
                <div id='speed' style=' width: 5vw; display: inline-block ;height: 7vh;font-size: 8vh;  font-weight: 400' id='speed'>0</div>    
                <div style='font-size: 3vh;color: white; margin-top: 0.5vh;font-weight: normal; opacity: 0.4;'>KM/H</div>
            </div> 
        </div>`
        return div;
}

export function tapButtonCreator(){
    var div = `
    <div>
    <div style="position: absolute;
            bottom: 1vh;
            left: 5vh;
            z-index: 10;
            width: 35vw;
            height: 30vh;
            display: flex;
            flex-direction: row;
            justify-content: start;">
            <img id='left' style="height: 30vh; opacity:0.7; display:inline" src='../../images/steerLeft.png'></img>
            <img id='right' style="height: 30vh; opacity:0.7;display:inline" src='../../images/steerRight.png'></img>
        </div>
        <div style="position: absolute;
            bottom: 5vh;
            right: 10vh;
            z-index: 10;
            width: 35vw;
            height: 30vh;
            display: flex;
            flex-direction: row-reverse;">
            <img id='up' style="height: 30vh; opacity:0.9" src='../../images/accel.svg'></img>
            <img id='down' style="height: 15vh; width: 14vw; margin-top: 15vh; opacity:0.9" src='../../images/brake.svg'></img> 
        </div>
    </div>`

    return div;
}

export function wheelCreator(){
    var div =
    `<div style='position: absolute; z-index: 0;bottom: 4vh; left: -4vw; height:33vh; width: 33vw;'>
        <img src='../images/steerwheel2.svg' style='height: 33vh; width: 33vw;'>
        </img>
        <img src='../images/center.svg' style='position:relative; height: 40%; bottom: 66%; left: 41%'></img>
    </div>`
     return div;
}

// export function viewZoneCreator(){
//     var div =
//     <div>

//     </div>
// }