import { zoneSet, zoneGet, zoneGetSegment, zonesClean, zones } from './geozone'

const segments = []

let maxX = -1000000
let maxY = -1000000
let minX = 1000000
let minY = 1000000

import { Vector3 } from '@babylonjs/core/Maths/math'

export const geoSegmentGetProjection = (pos, start, end) => {
    const segment = end.subtract(start) // the segment vector
    const start2pos = pos.subtract(start)  // the vector from start to pos
    const dot = Vector3.Dot(segment, start2pos) / (segment.length() * segment.length())
    const projection = (dot >= 0 && dot < 1) ? start.add(segment.scale(dot)) : 
        (dot < 0 ? start : end) 
    return projection
}

export const geoAngleForInterpolation = (from, to) => {
    if(from > to) {
        while(Math.abs(from - to) > Math.PI) {
            to += 2 * Math.PI
        }
    } else {
        while(Math.abs(from - to) > Math.PI){
            to -= 2 * Math.PI
        }
    }
    return to
}

// KWIK TEST
// console.log('PRJ', geoSegmentGetProjection(new Vector3(20, 0, 10), new Vector3(10, 0, 10), new Vector3(30 ,0, 30)))
// console.log('PRJ', geoSegmentGetProjection(new Vector3(30, 0, 0), new Vector3(10, 0, 10), new Vector3(30 ,0, 30)))
// console.log('PRJ', geoSegmentGetProjection(new Vector3(40, 0, 0), new Vector3(10, 0, 10), new Vector3(30 ,0, 30)))

// gets all geoSegment in the zone
export const getSegmentGetClosest = (pos) => {
    const zone = zoneGet(pos.x, pos.z)

    if(zone == null || zone.static == null) { return }
    
    let d = Number.MAX_VALUE
    let best = null
    let bestSegment = null

    zone.static.segments.forEach(segment => {
        const prj = geoSegmentGetProjection (pos, segment.start, segment.end)
        const prjd = pos.subtract(prj).length()
        if(prjd < d) {
            best = prj
            d = prjd
            bestSegment = segment
        }
    })

    return ({
        projection : best,
        segment : bestSegment,
        distance : d
    })
}


export const geoSegmentsInit = (roads) => {
    let id = 0

    roads.forEach((road, ir) => {
        road.lanes.forEach((lane, il) => {
            lane.forEach((node, ind) => {
                maxX = Math.max(maxX, node.point.x)
                maxY = Math.max(maxY, node.point.z)
                minX = Math.min(minX, node.point.x)
                minY = Math.min(minY, node.point.z)
                if(ind > 0) {
                    const segment = {
                        start: lane[ind - 1].point,
                        end: lane[ind].point,
                        roadIndex: ir,
                        laneIndex: il,
                        nodeIndex: ind,
                        id,
                        nodes: [lane[ind - 1], lane[ind]],
                        upwise: lane[ind - 1].upwise
                    }
                    id++
                    segments.push(segment)
                }
            })
        })
    })


    zoneSet(minX, minY, maxX, maxY)

    segments.forEach(segment => {
        const segmentZones = zoneGetSegment(segment.start.x, segment.start.z, segment.end.x, segment.end.z)
        segmentZones.forEach(zone => {
            zone.static.segments.push(segment)
        })
    })

    // zones.forEach(z => console.log("size", z.static.segments.length))
    // console.log("cnt", id)
}

