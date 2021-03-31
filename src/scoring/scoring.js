import { Vector2 } from "@babylonjs/core/Maths/math";
import { feedbackDivCreator } from '../creators/scoreCreator';
import speedScoring from './speedScoring'
import lookScoring from './lookScoring'
import { getSpeed, getApproach } from '../controls/loops'

let globalscore = 0;
let scoreDiv;
let score = [{}];
let car;
let speed;
let approach;
let date = new Date();
let scoresTot = {look: 0, speed: 0, blinker: 0}
let scores = {look: 0, speed: 0, blinker: 0}
//var scorediv = document.getElementById('') get score div and update score at each input


function newScore(type, value){
    if (value === true){
        scores[type]++
        globalscore++
    }
    scoresTot[type]++   
    console.log(type, value, scores, globalscore)
}


// function newScore(type, value){

//     globalscore += value;
//    score.push({type: type, score: value, position: new Vector2(car.position.x, car.position.z), date: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`});
//     // feedbackDivCreator({text: type, value: value})
//     scoreDiv.innerHTML = globalscore;
// }

function setupScore(currentcar) {
    car = currentcar;
   // scoreDiv = document.getElementById('score');
}

export function getScore () {
    let finalScores = {speed: Math.round(scores.speed/scoresTot.speed*100) ,look: Math.round(scores.look/scoresTot.look*100), blinker: Math.round(scores.blinker/scoresTot.blinker*100)}
    let tot = Math.round(globalscore / (scoresTot.speed+scoresTot.look+scoresTot.blinker) * 100)
    return {finalScores, tot}
}

function loop(){
    speed = getSpeed();
    approach = getApproach();
    speedScoring(speed, approach);
    lookScoring(approach);
}

export default {
    newScore: (type, value) => newScore(type, value),
    setupScore: currentCar => setupScore(currentCar),
    loop: () => loop(),
}
