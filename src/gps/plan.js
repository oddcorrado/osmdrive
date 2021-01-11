import arrowCreator from '../creators/gpsCreator'
import score from '../scoring/scoring'

let prev;
let next;
let idx = 1;
let plan = ['I','S', 'L', 'S', 'S', 'L', 'L', 'R', 'S', 'R', 'L', 'S', 'E'];
let arrow;

function checkJunctionGps(current, prev){
    ///console.log(current[1].roadIndex, 'L:',current[0].nexts[1].roadIndex, 'R:', current[0].nexts[0].roadIndex)
    if (plan[idx] === 'S'){
        if (current[1].roadIndex === prev.roadIndex)
            score.newScore('RIGHT_TURN', 20)
        else
            score.newScore('WRONG_TURN', -20)
    } else if (plan[idx] === 'L') {
        if (current[0].nexts[1] && current[0].nexts[1].roadIndex === current[1].roadIndex)
            score.newScore('RIGHT_TURN', 20)
        else 
            score.newScore('WRONG_TURN', -20)
    } else if (plan[idx] === 'R'){
        if (current[0].nexts[0] && current[0].nexts[0].roadIndex === current[1].roadIndex)
            score.newScore('RIGHT_TURN', 20)
        else 
            score.newScore('WRONG_TURN', -20)
    }
    nextArrow(plan[++idx]);
}

function nextArrow(next){
    if (arrow)
        if (next === 'S'){
            arrow.style.transform = 'rotateX(50deg)';
        } else if (next === 'L'){
            arrow.style.transform = 'rotateZ(-90deg)';
        } else if (next === 'R'){
            arrow.style.transform = 'rotateZ(90deg)';
        }
}

export function setupGps(){
    //createMap()
    arrow = arrowCreator();
}

let prevNormal;

export function gpsCheck(current, car){
    //console.log(car.rotationQuaternion);
    prevNormal = prevNormal ? prevNormal : current[1];
    prev = prev ? prev : current[0];

    if (current[1].type == 'normal' && prevNormal != current[1]){
        checkJunctionGps(current, prevNormal)
        prevNormal = current[1];
    }
    // if (current[0].junctionIndex != prev.junctionIndex){
    //     if (current[0].type == 'junction'){
    //     }   
    //     prev = current[0]; 
    // }
}




