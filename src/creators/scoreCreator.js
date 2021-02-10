import warningScore from '../enum/warningscore'

let id = 0;
var divs = [];

function slideDiv(div){
    var cur = 0
    let inter = setInterval(() => {
        if (cur < 25) {
            cur += 1;
            div.style.left = `${parseInt(div.style.left)+1}vw`
        } else 
            clearInterval(inter);
    }, 10)
}

function fadeDiv(div){
    let opa = 1;
    let inter = setInterval(() => {
        if (opa > 0) {
            opa -= 0.1;
            if (div)
            div.style.opacity = opa;
        } else 
            clearInterval(inter);
    }, 10)
}


export function feedbackDivCreator(content){
    let div = 
    `<div id='new-score${id}' style='position: absolute; top: 2%; left: 10%; width: 23vw; height: 8.5vh; background-color: white; box-shadow: -1px 2px 7.2px 1.8px rgba(0, 0, 0, 0.15); border-radius: 10vh; font-family: "Asap Condensed", sans serif; font-size: 2.5vh'>
        <div style='height:100%'>
            <div style='height: 80%; width: 40%; float: left; border-radius: 10vh; margin-top: 2%; margin-left: 2%;  background: ${content.value < 0 ? '#FFDBDB' : 'rgba(57, 208, 44, 0.2)' }'>
                <div style='height: 90%; margin-bottom: 10%'>
                    <img style='height: 80%; float: left;margin-left: 0.5vw; margin-top: 5%' src=${content.value < 0 ? '../../images/sad.svg' : '../../images/smile.svg'}></img>
                    <div style='float: left; margin-top: 4%; margin-left: 1.5vw; font-weight: 800; font-size: 4vh;'>
                        ${content.value}
                    </div>
                </div>
            </div>
            <div style='display: table-cell; height: 8.5vh; padding-left: 2vw; padding-right: 2vw; font-size: 2.8vh; vertical-align: middle; line-height: 3vh;  text-overflow: clip'>
                ${warningScore[content.text]}
            </div>
        </div>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div);

    let current = document.getElementById(`new-score${id++}`);
    divs.forEach(div => {
        slideDiv(div);
    })
    divs.push(current);
    setTimeout(()=>{
        fadeDiv(current)
    }, 2000)
    setTimeout(() => {
        current.remove();
        divs = divs.filter(div => div.id === `new-score${id}`);
    }, 3000);
}

export function feedbackDivCreatord(content){
    let div = 
    `<div id='new-score${id}' style='position: absolute; top: 2%; left: 10%; width: 27vw; height: 10.5vh; background-color: white; box-shadow: -1px 2px 7.2px 1.8px rgba(0, 0, 0, 0.15); border-radius: 10vh; font-family: "Asap Condensed", sans serif; font-size: 2.5vh'>
        <div style='height:100%'>
            <div style='height: 80%; width: 40%; float: left; border-radius: 10vh; margin-top: 2%; margin-left: 2%;  background: ${content.value < 0 ? '#FFDBDB' : 'rgba(57, 208, 44, 0.2)' }'>
                <div style='height: 90%; margin-bottom: 10%'>
                    <img style='height: 80%; float: left;margin-left: 0.5vw; margin-top: 5%' src=${content.value < 0 ? '../../images/sad.svg' : '../../images/smile.svg'}></img>
                    <div style='float: left; margin-top: 4%; margin-left: 2vw; font-weight: 800; font-size: 5vh;'>
                        ${content.value}
                    </div>
                </div>
            </div>
            <div style='display: table-cell; height: 10.5vh; padding-left: 2vw; padding-right: 2vw; font-size: 4vh; vertical-align: middle; line-height: 3.5vh;  text-overflow: clip'>
                ${warningScore[content.text]}
            </div>
        </div>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div);

    let current = document.getElementById(`new-score${id++}`);
    divs.forEach(div => {
        slideDiv(div);
    })
    divs.push(current);
    setTimeout(()=>{
        fadeDiv(current)
    }, 2000)
    setTimeout(() => {
        current.remove();
        divs = divs.filter(div => div.id === `new-score${id}`);
    }, 3000);
}