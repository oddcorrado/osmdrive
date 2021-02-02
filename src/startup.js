import screenfull from 'screenfull'
import { divCreator } from './creators/buttoncreator'
import { recenterDisplaySetup } from './controls/recenterDisplay'
import UAParser from 'ua-parser-js'


const displayText = (w, h) => {
    if( w > h) {
        return "UBIQUITY\n\nSTART"
    } else {
        return "UBIQUITY\n\nPLEASE\nROTATE\nDEVICE"
    }
}

const displayColor = (w, h) => {
    if(window.innerWidth > window.innerHeight) {
        return 'gray'
    } else {
        return 'red'
    }
}

const startup = boot => {
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
        align-items: center;
        justify-content: center;
        text-align: center;
    `

    const ua = new UAParser()
    const os = ua.getOS()
console.log('os', os)
    const start = divCreator(startStyle, {id: 'startDiv', text: displayText(window.innerWidth, window.innerHeight)})

    start.style.color = displayColor(window.innerWidth, window.innerHeight)

    document.body.appendChild(start)

    window.onresize = () => { 
        start.innerText = displayText(window.innerWidth, window.innerHeight)
        start.style.color = displayColor(window.innerWidth, window.innerHeight)
    }

    start.onclick = () => {
        if (window.innerWidth > window.innerHeight) {
            start.innerText = 'UBIQUITY\nLOADING...\nPLEASE WAIT'
            if (screenfull.isEnabled  && os.name !== 'Mac OS' && (os !== 'iOS')) {
                // screenfull.request()
            }
            document.body.removeChild(start)
            boot()
            recenterDisplaySetup()
        }
    }
}

export default startup