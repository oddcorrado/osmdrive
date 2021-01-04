import { Vector2 } from "@babylonjs/core/Maths/math";
import { feedbackDivCreator } from '../creators/buttoncreator';
import speedScoring from './speedScoring'

var globalscore = 0;
var scoreDiv;
var score = [{}];
var car;
var date = new Date();

//var scorediv = document.getElementById('') get score div and update score at each input

function newScore(type, value){
    globalscore += value;
    score.push({type: type, score: value, position: new Vector2(car.position.x, car.position.z), date: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`});
    feedbackDivCreator({text: type, img: value > 0 ? '../../images/smile.svg' : '../../images/sad.svg', color: value > 0 ? 'green' : 'red'})
    scoreDiv.innerHTML = globalscore;
    console.log(score);
}

function setupScore(currentcar){
    car = currentcar;
    scoreDiv = document.getElementById('score');
}

function loop(){
    speedScoring()
}

export default {
    newScore: (type, value) => newScore(type, value),
    setupScore: currentCar => setupScore(currentCar),
    loop: () => loop()
}
