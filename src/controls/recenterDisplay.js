import { divCreator } from '../creators/buttoncreator'

let recenterDiv

export const recenterDisplaySetup = () => {
    const recenterStyle = `
        width: 100%;
        height: 100%;
        background-color: #00000099;
        z-index: 100;
        position: fixed;
        font-weight: 800;
        top: 0;
        left: 0;
        font-size: 60px;
        font-family: sans-serif;
        color: yellow;
        display: flex;
        flex-direcito: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    `

    recenterDiv = divCreator(recenterStyle, 
        {id: 'recenter',
        text: 'SORTIE DE ROUTE\nRECENTRAGE EN COURS...'})
    document.body.appendChild(recenterDiv)
    recenterDisplay (false)
}

export const recenterDisplay = (active) => {
    recenterDiv.style.display = active ? 'flex' : 'none'
}