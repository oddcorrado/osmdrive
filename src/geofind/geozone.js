const zoneSize = 50

let minX = 0
let maxX = 2000
let minY = 0
let maxY = 2000
let xCount = 1 + (maxX - minX) / zoneSize
let yCount = 1 + (maxY - minY) / zoneSize
export const zones = []

export const zoneFloor = v => zoneSize * Math.floor(v / zoneSize)
export const zoneCeil = v => zoneSize * Math.ceil(v / zoneSize)

// cleans up an array of zones
export const zonesClean = zones => {
    zones = zones.filter(z => z === null)
    zones = zones.sort((a,b) => a.id - b.id)
    zones.filter((z, i) => i === 0 ? true : zones[i - 1].id === z.id)

    return zones
}

// sets the zoning
export const zoneSet = (inMinX, inMinY, inMaxX, inMaxY) => {
    minX = zoneFloor(inMinX)
    maxX = zoneCeil(inMaxX)
    minY = zoneFloor(inMinY)
    maxY = zoneCeil(inMaxY)
    let id = 0

    for(let y = minY; y <= maxY; y += zoneSize) {
        for(let x = minX; x <= maxX; x += zoneSize) {
            const zone = {
                size: zoneSize,
                minX: x,
                minY: y,
                static: {
                    segments: []
                },
                dynamic :{
                    objects: []
                },
                id: id++
            }
            zones.push(zone)
        }
    }
    xCount = 1 + (maxX - minX) / zoneSize
    yCount = 1 + (maxY - minY) / zoneSize
}

// returns the best zone for a point 
export const zoneGet = (x, y)  => {
    if(x < minX || x > maxX || y < minY || y > maxY) { return null }

    const index = Math.floor((x - minX) / zoneSize) + Math.floor((y - minY) / zoneSize) * xCount

    return zones[index]
}

// returns zones for a point 
export const zoneGetNine = (x, y) => {
    const output = []

    for(let yo = -zoneSize; yo <= zoneSize; yo += zoneSize) {
        for(let xo = -zoneSize; xo <= zoneSize; xo += zoneSize) {
            const zone = zoneGet (x + xo, y + yo)
            if(zone != null) output.push(zone)
        }
    }

    return output
}

// gets all zones a segment might cross
export const zoneGetSegment = (x0, y0, x1, y1) => {
    const output = []

    if(x0 === x1) {
        const ys = zoneFloor(Math.min(y0, y1)) // y start
        const ye = zoneFloor(Math.max(y0, y1)) // y end

        for(let y = ys; y <= ye; y += zoneSize) {
            console.log(x, y)
            const zone = zoneGet (x0, y)
            if(zone != null) output.push(zone)
        }
        return output
    }

    // switch so tha x0 is onthe left (easier to figure out)
    if(x0 > x1) {
        const xtmp = x0
        x0 = x1
        x1 = xtmp
        const ytmp = y0
        y0 = y1
        y1 = ytmp
    }

    const rate = (y1 - y0) / (x1 - x0) // rate of the segment
    const xs = zoneFloor(x0) // xs = xstart
    const xe = zoneCeil(x1) // xe = xend
    const ys = y0 + (xs - x0) * rate // ys = ystart

    // go from left to right at squre edges
    for(let x = xs; x < xe; x += zoneSize) {
        let yl = ys + (x - xs) * rate // yl = yleft (of the square)
        let yr = ys + (x + zoneSize - xs) * rate // yr = yright (of the square)
        yl = zoneFloor(yl) // align on squares
        yr = zoneFloor(yr) // align on squares
        const yt = Math.max(yl, yr) // yt = y top
        const yb = Math.min(yl, yr) // yb = y bottom

        // for each square we cross "vertically"
        for(let y = yb; y <= yt; y += zoneSize) {
            const zone = zoneGet (x, y)
            if(zone != null) output.push(zone)
        }
    }

    return output
}

// kwik test....
/* zoneSet (10, 30, 1994, 1501)
console.log(zones)
console.log(zoneGet(25,25))
console.log(zoneGetNine(1010, 1010))
console.log('seg', zoneGetSegment(0, 0, 2499, 999)) */