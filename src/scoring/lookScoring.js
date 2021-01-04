import { getLook } from '../controls/loops'
import score from './scoring'

//Vision check related scoring
let checks = [false, false]
let checking = false;
let currentLook;

export default function lookScoring(approach){
    currentLook = getLook();

     if (!approach && checking === true) {
        checking = false;
        if (checks[0] && checks[1])
            score.newScore('INTERSECTION_CHECK', 100);
        else if (checks[0] || checks[1])
            score.newScore('INTERSECTION_CHECK', 50);
        else
            score.newScore('INTERSECTION_CHECK', -100);
    } else if (approach && approach < 12){
        checking = true;
        checks[0] = checks[0] ? true : currentLook >= 80 ? true : false;
        checks[1] = checks[1] ? true : currentLook <= -80 ? true : false;
    }
}