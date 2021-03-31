import { getLook } from '../controls/loops'
import score from './scoring'

//Vision check related scoring
let checks = [0, 0]
let checking = false;
let currentLook;
let lookScore = 0;

export default function lookScoring(approach){
    currentLook = getLook();

     if (!approach && checking === true) {
        checking = false;
        lookScore = lookScore <= 0 ? -100 : lookScore > 75 ? lookScore * 0.625 : -50
        // score.newScore(`INTERSECTION_CHECK_${lookScore > 0 ? 'GOOD' : 'BAD'}`, lookScore | 0);
        score.newScore(`look`, lookScore>0?true:false);
        checks = [0,0];
    } else if (approach && approach < 20){
        checking = true;
        checks[0] = currentLook < checks[0] ? currentLook  < -80 ? -80 : currentLook : checks[0]; 
        checks[1] = currentLook > checks[1] ? currentLook > 80 ? 80 : currentLook : checks[1];
        lookScore = checks[1] + Math.abs(checks[0]);
    }
}