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
        console.log(lookScore, checks[0], checks[1])
        lookScore = lookScore === 0 ? -100 : lookScore > 80 ? lookScore * 0.625 : -50
        console.log(lookScore, checks[0], checks[1])
        score.newScore('INTERSECTION_CHECK', lookScore.toFixed());
        lookScore = 0;
    } else if (approach && approach < 12){
        checking = true;
        checks[0] = currentLook < checks[0] ? currentLook  < -80 ? -80 : currentLook : checks[0]; 
        checks[1] = currentLook > checks[1] ? currentLook > 80 ? 80 : currentLook : checks[1];
        lookScore = checks[1] + Math.abs(checks[0]);
    }
}