import { Vector2 } from "@babylonjs/core/Maths/math";
import { feedbackDivCreator } from '../creators/scoreCreator';
import speedScoring from './speedScoring'
import lookScoring from './lookScoring'
import routeScoring from './routeScoring'
import { getSpeed, getApproach } from '../controls/loops'

let globalscore = 0;
let scoreDiv;
let score = [{}];
let car;
let speed;
let approach;
let date = new Date();
//var scorediv = document.getElementById('') get score div and update score at each input

function newScore(type, value){
    // globalscore += value;
    // score.push({type: type, score: value, position: new Vector2(car.position.x, car.position.z), date: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`});
    // feedbackDivCreator({text: type, value: value})
    // scoreDiv.innerHTML = globalscore;
}

function setupScore(currentcar){
    car = currentcar;
   // scoreDiv = document.getElementById('score');
}

function loop(){
    speed = getSpeed();
    approach = getApproach();
    speedScoring(speed, approach);
    lookScoring(approach);
    routeScoring();
}

export default {
    newScore: (type, value) => newScore(type, value),
    setupScore: currentCar => setupScore(currentCar),
    loop: () => loop()
}
