import screenfull from 'screenfull'
import { divCreator } from './menu'


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
    `

    const start = divCreator(startStyle, {id: 'startDiv', text: 'START'})

    document.body.appendChild(start)

    start.onclick = () => {
        if (screenfull.isEnabled) {
            screenfull.request()
        }
        document.body.removeChild(start)
        boot()
    }
}

export default startup