import score from './scoring'

let hasStarted = false; 
let inter = {fast: null, slow: null, junc: null, stop: null, turnfast: null, juncslow: null};

//Check speed in circulation
function resetInterval(id){
    if (id){
        clearInterval(id);
        return null
    }
    return id;
}

function speedingCheck(speed, approach){
    if (speed > 0.2 &&  (!approach || approach > 12 )) {
        if (!inter.fast){
            inter.fast = setInterval(() => {
                score.newScore('SPEED_TOO_FAST', -10);
            }, 5000)
        }
    } else if (speed < 0.1 && (!approach || approach > 12 )) {   
        if (!inter.slow){
            inter.slow = setInterval(() => {
                score.newScore('SPEED_TOO_SLOW', -10);
            }, 5000)
        }
    } else {
        inter.slow = resetInterval(inter.slow);
        inter.fast = resetInterval(inter.fast);
    }
}

//Check speed in turns and intersections
function speedingIntersectionCheck(speed, approach){
    if (isTurning && speed>0.2){
        if (!inter.turnfast){
            inter.turnfast = setInterval(() => {
                score.newScore('SPEED_TURN_TOO_FAST', -10);
            }, 5000)
        }
    } else
        inter.turnfast = resetInterval(inter.turnfast);
    if (approach < 3 && speed > 0.2)
        if (!inter.juncfast){
            inter.juncfast = setInterval(() => {
                score.newScore('INTERSECTION_TOO_FAST', -10);
        }, 5000)
    } else
        inter.juncfast = resetInterval(inter.juncfast);
}

//Check useless stops
function stopCheck(speed, approach, hasStarted){
    if (speed > 0)  {
        inter.stop = resetInterval(inter.stop);
    }
    if (speed === 0 && hasStarted === true && (!approach || approach > 12 )){//+ pas de voiture devant
        if (!inter.stop){
            score.newScore('SPEED_USELESS_STOP', -10);
            inter.stop = setInterval(() => {
                score.newScore('SPEED_USELESS_STOP', -10);
            }, 5000)
        }
    }
}

export default function speedScoring (speed, approach){
    hasStarted = !hasStarted && speed > 0 ? true : hasStarted;
    //speedingCheck(speed, approach);
    //speedingIntersectionCheck(speed, approach);
    stopCheck(speed, approach, hasStarted);
}
