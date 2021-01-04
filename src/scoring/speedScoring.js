import { getSpeed, getApproach } from '../controls/loops'
import score from './scoring'
var speed;
var approach;
var hasStarted = false;
var authorized = false;
var penaltyInterval;

export default function speedScoring (){
    speed = getSpeed();
    approach = getApproach();
    // console.log(approach)
    hasStarted = !hasStarted && speed > 0 ? true : hasStarted;

    //if (speed > 1) //toofast
    if (speed > 0 && penaltyInterval)  {
        clearInterval(penaltyInterval)
    }
    if (speed === 0 && hasStarted === true && (!approach || approach > 10 )){//+ pas de voiture devant
        if (!penaltyInterval){
            score.newScore('SPEED_USELESS_STOP', -10);
            penaltyInterval = setInterval(() => {
                score.newScore('SPEED_USELESS_STOP', -10);
            },5000)
        }
    } //find a way to have multiple penalty interval recur ou pas
}
