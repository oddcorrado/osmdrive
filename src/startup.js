import screenfull from 'screenfull'
import { divCreator } from './creators/buttoncreator'
import UAParser from 'ua-parser-js'
import {createStartScreen} from './creators/loadingCreator'

const displayText = (w, h) => {
    if( w > h) {
        return "Ubiquity"
    } else {
        return "UBIQUITY\n\nPLEASE\nROTATE\nDEVICE"
    }
}

const displayColor = (w, h) => {
    if(window.innerWidth > window.innerHeight) {
        return 'black'
    } else {
        return 'red'
    }
}

const displayBtn = (w, h) => {
    if(window.innerWidth > window.innerHeight) {
        return ''
    } else {
        return 'none'
    }
}

const startup = boot => {
    const ua = new UAParser()
    const os = ua.getOS()
    console.log('os', os)
    const {start, btn} = createStartScreen()
    start.style.color = displayColor(window.innerWidth, window.innerHeight)

    window.onresize = () => { 
        btn.style.display = displayBtn(window.innerWidth, window.innerHeight)
        start.innerText = displayText(window.innerWidth, window.innerHeight)
        start.style.color = displayColor(window.innerWidth, window.innerHeight)
    }

    btn.onclick = () => {
        if (window.innerWidth > window.innerHeight) {
            start.innerText = 'Ubiquity'
            if (screenfull.isEnabled && os.name !== 'Mac OS' && (os !== 'iOS')) {
                screenfull.request()
                screenfull.request(element, {navigationUI: 'hide'});
            }
            document.getElementById('startscreen').remove()
            boot()
        }
    }
}

export default startup