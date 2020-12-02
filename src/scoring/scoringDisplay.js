import { divCreator } from '../creators/buttoncreator'

let scoreDiv

export const scoringDisplaySetup = () => {
    const startStyle = `
        width: 100%;
        height: 100%;
        background-color: aliceblue;
        z-index: 10;
        position: fixed;
        font-weight: 800;
        top: 0;
        left: 0;
        font-size: 60px;
        font-family: sans-serif;
        color: gray;
        display: flex;
        flex-direcito: column;
        align-items: center;
        justify-content: flex-start;
        text-align: center;
    `

    const score = divCreator(startStyle, {id: 'startDiv', text: displayText(window.innerWidth, window.innerHeight)})

    start.style.color = displayColor(window.innerWidth, window.innerHeight)

    document.body.appendChild(start)

    start.onclick = () => {
        if(window.innerWidth > window.innerHeight) {
            start.innerText = 'UBIQUITY\nLOADING...\nPLEASE WAIT'
            if (screenfull.isEnabled) {
                screenfull.request()
            }
            document.body.removeChild(start)
            boot()
        }
    }
}

export const scoringDisplaySetScore = (score) => {
    if(scoreDiv != null) {
        scoreDiv.innerText = score
    }
}