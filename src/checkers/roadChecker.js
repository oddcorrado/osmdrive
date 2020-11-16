
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { getSegmentGetClosest } from '../geofind/geosegment'
import { scene as globalScene } from '../index'
import { Color3 } from '@babylonjs/core/Maths/math.color'

let currentSegment = null
let debugLine = null

export const checkerDebugSegment = (pos) => {
    const closest = getSegmentGetClosest(pos)

    if(currentSegment != null && closest.segment.id === currentSegment.id) { return }
    currentSegment = closest.segment
    
    const points = [closest.segment.start, closest.segment.end]
console.log(currentSegment, points)
    debugLine = Mesh.CreateLines('li', points, globalScene)

    debugLine.position.y = debugLine.position.y + 0.1
    debugLine.position.y = debugLine.position.y + 0.1
    debugLine.color = Color3.Random()
}
