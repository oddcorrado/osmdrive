
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

export function divCreator(style, content){
    var tmpDiv = document.createElement('div');

    tmpDiv.setAttribute('style', style + `;z-index: 10; position: absolute; font-weight: 800`);

    tmpDiv.id = content.id;
    tmpDiv.innerText = content.text;
    return tmpDiv;
}

export function buttonCreator(style, content){
    var tmpBtn = document.createElement('button');
    tmpBtn.setAttribute('style', style + `; z-index: 10; position: absolute; font-weight: 800; color: white; opacity: 0.6; border-radius: 8px`);
    tmpBtn.id = content.id;
    tmpBtn.className = content.class;
    tmpBtn.innerText = content.text;
    return tmpBtn;
}

export function divControlCreator (div, img, defimg){
    var tmpDiv = document.createElement('div');
    var tmpDefImg = document.createElement('img');
    var tmpImg = document.createElement('img');

    tmpDiv.setAttribute('style', div.style + `;z-index: 10; position: absolute; font-weight: 800; opacity: 0.6; border-radius: 8px`);
    tmpImg.setAttribute('style', img.style + ';position: relative;')
    tmpDefImg.setAttribute('style', defimg.style + ';position: relative;')
    tmpImg.src = img.src;
    tmpDefImg.src = defimg.src;
    tmpDiv.id = div.id;
    tmpDiv.appendChild(tmpImg);
    tmpDiv.appendChild(tmpDefImg);
    return tmpDiv;
}


export function valueButtonCreator(maindiv, img){
    var div = `
    <div id='${maindiv.mainid}' style='${maindiv.style}; z-index: 10 ;background-color: #dbdbdb; width: 16vw; height: 5vh; z-index: 10; position: absolute; font-weight: 400; border-radius: 8px; opacity: 0.8;'>
        <div id='${maindiv.idminus}' style='text-align: center;font-size: 50px; line-height: 20px; height: 5vh; width: 25%; border-right: solid black 2px; float: left'>
            -
        </div>
        <div style='width: 46%; float: left '>
            <div style='margin-left: 5%'>
                <img src='${img.src}' style='${img.style}; float: left'></img>
            </div>
            <div id='${maindiv.id}' style='font-size: 20px; font-weight: 800; margin-left: 18%; line-height: 28px;float:left'>0</div>
        </div>
        <div id='${maindiv.idplus}' style='text-align: center;z-index: 10;font-size: 40px; line-height: 24px; height: 5vh; width: 25%; border-left: solid black 2px; float: left'>
            +
        </div>
    </div>`
    return div;
}

export function accelerationWitness(){
    var div = `
    <div style='position: absolute; bottom: -3.8rem; right: 36vw; height: 10rem;'>
        <div>
            <div style='height: 0.75rem; width: 2rem'>
                <img class='accelwit' id='maxf' style='height: 2rem; width: 2rem' src='../../images/Vclear.svg'></img>
            </div>
            <div style='height: 0.75rem; width: 2rem'>
                <img class='accelwit' id='avgf' style='height: 2rem; width: 2rem' src='../../images/Vclear.svg'></img>
            </div>
            <div style='height: 0.75rem; width: 2rem'>
                <img class='accelwit' id='minf' style='height: 2rem; width: 2rem' src='../../images/Vclear.svg'></img>
            </div>
        </div>
        <div>
            <img id='neutral' src='../../images/greencircle.svg' style='height: 0.75rem; margin-left: 0.6rem; margin-top: 0.6rem'></img>
        </div>
        <div style='margin-top: 0.4rem;'>
            <div style='transform: rotateZ(180deg); height: 0.75rem; width: 2rem'>
                <img class='accelwit' id='minb' style='height: 2rem; width: 2rem' src='../../images/Vclear.svg'></img>
            </div>
            <div style='transform: rotateZ(180deg); height: 0.75rem; width: 2rem'>
                <img class='accelwit' id='avgb' style='height: 2rem; width: 2rem' src='../../images/Vclear.svg'></img>
            </div>
            <div style='transform: rotateZ(180deg); height: 0.75rem; width: 2rem'>
                <img class='accelwit' id='maxb' style='height: 2rem; width: 2rem' src='../../images/Vclear.svg'></img>
            </div>
        </div>
    </div>`
    return div;
}