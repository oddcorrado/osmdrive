import { zoneSet, zoneGetSegment, zonesClean, zones } from './geozone'

const segments = []

let maxX = -1000000
let maxY = -1000000
let minX = 1000000
let minY = 1000000

export const geoSegmentDistanceToSegment = (pos, start, end) => {

}

// gets all geoSegment in the zone
export const geoSegmentsGet = (x, y) => {

}

export const getSegmentGetClosest = (x, y) => {
    
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
                        startPos: lane[ind - 1].point,
                        endPos: lane[ind].point,
                        roadIndex: ir,
                        laneIndex: il,
                        nodeIndex: ind,
                        id
                    }
                    id++
                    segments.push(segment)
                }
            })
        })
    })


    zoneSet(minX, minY, maxX, maxY)

    segments.forEach(segment => {
        const segmentZones = zoneGetSegment(segment.startPos.x, segment.startPos.z, segment.endPos.x, segment.endPos.z)
        segmentZones.forEach(zone => {
            zone.static.segments.push(segment)
        })
    })

    zones.forEach(z => console.log("size", z.static.segments.length))
    console.log("cnt", id)
}

