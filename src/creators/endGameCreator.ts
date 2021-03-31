
import {getScore} from '../scoring/scoring.js'

let colors = ['#EA4114', '#ebae34', '#EAD703', '#AEEA00']

function createScoreCircle(score: number): string {
    let color = colors[Math.round(score/100*4)-1] 
    let nb = ((score-50)/100)*360 + 270
    let background =  `linear-gradient(270deg, ${color} 50%, transparent 50%)${score > 50 ? `, linear-gradient(${nb}deg, ${color} 50%, #EFF0F6 50%)`: `, linear-gradient(${270}deg, ${color} 50%, #EFF0F6 50%)`}` 
   let div =
    `<div style='float: left;width: 23%; height: 70%; border-radius: 100%; margin-left:7%; margin-top: 2%; background-color: #EFF0F6; background: ${background}'>
        <div style='position: relative; top: 10%; left: 10%; width: 80%; height: 80%; border-radius: 100%; background-color: white'>
            <div style='height: 100%; padding-top: 15%; font-size: 7vh; font-weight: 700; color: #024179'>${score}%</div>
        </div>
    </div>`

    return div
}

export function createEndOfLevel(){
    let sc = getScore()
    console.log(sc)
    const div:string = `
    <div style='position: absolute; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 100; font-family: Poppins'>
        <div style='width:54%; height:86%; background-color: white; margin-top: 3.5%; margin-left: 23%; border-radius: 5%; text-align: center'>
            <div style='height: 50%'>
                <div style='width:100%; height: 20%; font-size: 6vh; padding-top: 5%'>
                    Parcours terminé !
                </div>
                <div style='width: 100%; height:15%; font-size: 5vh'>
                    Votre synthèse :
                </div>
                <div style='margin-left:32%; height: 55%; padding-top: 5%'>
                    <img id='star1' style='height: 10vh; float: left' src='../../images/${sc.globalscore > 25 ? 'star' : 'stargrey'}.svg'></img>
                    <img id='star2' style='height: 10vh; float: left; margin-left: 3%' src='../../images/${sc.globalscore > 50 ? 'star' : 'stargrey'}.svg'></img>
                    <img id='star3' style='height: 10vh; float: left; margin-left: 3%' src='../../images/${sc.globalscore > 75 ? 'star' : 'stargrey'}.svg'></img>
                </div>
            </div>
            <div style='width: 100%; height: 48%; margin-top: 2%;'>
                <div style='height: 15%; width: 100%; margin: 0'>
                    <div style='float: left; margin-left:5%;width:25%'>Regard</div>
                    <div style='float: left; margin-left:5%;width:25%'>Allure</div>
                    <div style='float: left; margin-left:5%;width:25%'>Clignotants</div>
                </div>
                <div style='height: 75%; width: 100%;'>
                    ${createScoreCircle(sc.finalScores.look)}
                    ${createScoreCircle(sc.finalScores.speed)}
                    ${createScoreCircle(sc.finalScores.blinker)}
                </div>
            </div>
        </div>
        <button id='reload' style='box-shadow: 0px 0.5vh 1.2vh rgba(0,0,0,0.14); width: 10%; height:5%;border: none;font-family: Poppins; font-style: normal; background-color: #FFEC00; border-radius: 10px; margin-top:5%; font-weight: 500; font-size: 3vh'>
            Relancer
        </button>
    </div>
    `
    
    document.body.insertAdjacentHTML('afterbegin', div)
    document.getElementById('reload').addEventListener('click', () => {
        document.location.reload()
    })
}

` <div style='float: left;width: 23%; height: 70%; border-radius: 100%; margin-left:7%; margin-top: 2%; background-color: #EFF0F6; background: linear-gradient(270deg, black 50%, transparent 50%), linear-gradient(0deg, black 50%, lightgray 50%)'>
<div style='position: relative; top: 10%; left: 10%; width: 80%; height: 80%; border-radius: 100%; background-color: white'>
    <div style='height: 100%; padding-top: 15%; font-size: 7vh; font-weight: 700; color: #024179'>33%</div>
</div>
</div>
<div style='float: left; width: 23%; height: 70%; border-radius: 100%; margin-left:7%; margin-top: 2%; background-color: #EFF0F6; background: linear-gradient(270deg, black 50%, transparent 50%), linear-gradient(0deg, black 50%, lightgray 50%)'>
<div style='position: relative; top: 10%; left: 10%; width: 80%; height: 80%; border-radius: 100%; background-color: white'>
    <div style='height: 100%; padding-top: 15%; font-size: 7vh; font-weight: 700; color: #024179'>33%</div>
</div>
</div>`