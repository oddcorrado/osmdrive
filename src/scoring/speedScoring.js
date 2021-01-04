import score from './scoring'

let hasStarted = false; 
let speedInterval;
let juncInterval
let stopInterval;

//Check speed in circulation
function speedingCheck(speed, approach){
    if (speed > 30 &&  (!approach || approach > 12 )) {
        //score.newScore('SPEED_TOO_SLOW', -10);
    } else if (speed < 15 && (!approach || approach > 12 )) {   
        //score.newScore('SPEED_TOO_SLOW', -10);
    }
}

//Check speed in turns and intersections
function speedingIntersectionCheck(speed, approach){
    //if (approach >=  ?? && speed > ??)//too fast in turn
    //score.newScore('SPEED_TOO_SLOW', -10);
    //check if interval disapears
}

//Check useless stops
function stopCheck(speed, approach, hasStarted){
    if (stopInterval && speed > 0)  {
        clearInterval(stopInterval)
    }
    if (speed === 0 && hasStarted === true && (!approach || approach > 12 )){//+ pas de voiture devant
        if (!stopInterval){
            score.newScore('SPEED_USELESS_STOP', -10);
            stopInterval = setInterval(() => {
                score.newScore('SPEED_USELESS_STOP', -10);
            }, 5000)
        }
    }
}

let x;
let i = 0
export default function speedScoring (speed, approach){
    // console.log(approach)
    hasStarted = !hasStarted && speed > 0 ? true : hasStarted;
    speedingCheck(speed, approach);
    speedingIntersectionCheck(speed, approach);
    stopCheck(speed, approach, hasStarted);
}
