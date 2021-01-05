let id = 0;
var divs = [];

function slideDiv(div){
    var cur = 0
    let inter = setInterval(() => {
        if (cur < 20) {
            cur += 1;
            div.style.left = `${parseInt(div.style.left)+1}vw`
        } else 
            clearInterval(inter);
    }, 10)
}

export function feedbackDivCreator(content){
    var tmpDiv = document.createElement('div');

    tmpDiv.setAttribute('style', `position: absolute; width:15vw; top: 3vh; left: ${20}vw; text-align:center; font: 2.5vh "Gill Sans", sans-serif; color: ${content.value>0? 'green' : 'red'}; height: 10vh; width: 30vw`);
    tmpDiv.innerText = `${content.text} (${content.value})`;
    document.body.appendChild(tmpDiv);

    divs.forEach(div => {
        slideDiv(div);
    })
    divs.push(tmpDiv);
    setTimeout(() => {
        tmpDiv.remove();
        divs = divs.filter(div => div.id === `new-score${id}`);
    }, 3000);

}