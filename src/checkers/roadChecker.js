
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { getSegmentGetClosest } from '../geofind/geosegment'
import { scene as globalScene } from '../index'
import { Color3 } from '@babylonjs/core/Maths/math.color'

let currentSegment = null
let debugLine = null
let closestSegment = null



export const checkerDebugSegment = (pos) => {
    const closest = getSegmentGetClosest(pos)

    if(closest == null) { return }

    if(currentSegment != null && closest.segment.id === currentSegment.id) { return }

    if(debugLine != null) {
        debugLine.dispose()
        debugLine = null
    }

    currentSegment = closest.segment
    
    const points = [closest.segment.start, closest.segment.end]

    debugLine = Mesh.CreateLines('li', points, globalScene)

    debugLine.position.y = debugLine.position.y + 0.1
    debugLine.position.y = debugLine.position.y + 0.1
    debugLine.color = Color3.White()
}

export const roadCheckerExit = (pos) => {
    const closest = getSegmentGetClosest(pos)

    if (closest == null) { return }

    if (closest.distance > 10) { return closest.projection }

    return null
}
