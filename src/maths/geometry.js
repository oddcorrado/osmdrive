import { Vector3 } from '@babylonjs/core/Maths/math'

var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}

export function segmentIntersection(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
    if (isNaN(x)||isNaN(y)) {
        return false
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false}
        } else {
            if (!between(x1, x, x2)) {return false}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false}
        } else {
            if (!between(y1, y, y2)) {return false}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false}
        } else {
            if (!between(x3, x, x4)) {return false}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false}
        } else {
            if (!between(y3, y, y4)) {return false}
        }
    }
    return {x: x, y: y}
}

export function vectorIntersection(v1, v2, u1, u2) {
    const x1 = v1.x
    const y1 = v1.z
    const x2 = v2.x
    const y2 = v2.z
    const x3 = u1.x
    const y3 = u1.z
    const x4 = u2.x
    const y4 = u2.z

    const inter = segmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4)
    if(!inter) { return null }

    return new Vector3(inter.x, v1.y, inter.y) // TODO user ratio for ys
}

export function lineIntersection(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
    if (isNaN(x)||isNaN(y)) {
        return false
    } else {
        return {x: x, y: y}
    }
    
}

export function vectorLineIntersection(v1, v2, u1, u2) {
    const x1 = v1.x
    const y1 = v1.z
    const x2 = v2.x
    const y2 = v2.z
    const x3 = u1.x
    const y3 = u1.z
    const x4 = u2.x
    const y4 = u2.z

    const inter = lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4)
    if(!inter) { return null }

    return new Vector3(inter.x, v1.y, inter.y) // TODO user ratio for ys
}