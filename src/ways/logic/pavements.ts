import { ways } from '../../map'
import { createJunctions, createPaths } from './roads'
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { scene as globalScene } from '../../index'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { vectorIntersection, vectorLineIntersection } from '../../maths/geometry'

let junctions = null
let paths = null

interface PavNode {
    point: Vector3
    junctionIndex: number
    roadIndex: number
    nodeIndex: number
    id: string
    nexts: PavNode[]
}

interface PavRoad {
    nodes: PavNode[]
}

const getTripletId = (junctionIndex: number, id1: string, id2: string) => {
    return (id2 > id1 
        ? `${junctionIndex}/${id1}>${id2}`
        : `${junctionIndex}/${id2}>${id1}`)
}

const triplets = new Map<string, boolean>()

const createRoads = (paths: any):  PavRoad[] => {
    const junctionMap = new Map<number, PavNode[]>()

    // map to typescript
    const roads : PavRoad[] = paths.map((path: any, ri: number) => ({
            nodes: path.map((node: any, ni: number) => ({
                point: node.point,
                junctionIndex: node.junctionIndex,
                roadIndex: ri,
                nodeIndex: ni,
                id: `${ri.toString().padStart(4,'0')}-${ni.toString().padStart(4,'0')}`,
                nexts: []
            }))
        })
    )

    // cache all junctions by junction index
    roads.forEach((road: PavRoad) => {
        road.nodes.forEach((node: PavNode) => {
            if(node.junctionIndex !== -1) { 
                const js = junctionMap.has(node.junctionIndex) ? junctionMap.get(node.junctionIndex) : []
                js.push(node)
                junctionMap.set(node.junctionIndex, js) 
            } 
        })
    })

    // remap junction into nodes 
    roads.forEach((road: PavRoad) => {
        road.nodes.forEach((node: PavNode, ni: number) => {
            let nexts : PavNode[] = []
            if(ni > 0) { nexts.push(road.nodes[ni - 1]) }
            if(ni < road.nodes.length - 1 ) { nexts.push(road.nodes[ni + 1]) }
            if(node.junctionIndex !== -1) {
                junctionMap.get(node.junctionIndex).filter((n: PavNode) => n.id != node.id).forEach((j: PavNode) => {
                    if(j.nodeIndex > 0) { nexts.push(roads[j.roadIndex].nodes[j.nodeIndex - 1]) }
                    if(j.nodeIndex < roads[j.roadIndex].nodes.length - 1) { nexts.push(roads[j.roadIndex].nodes[j.nodeIndex + 1]) }
                })
            } 
            node.nexts = nexts
        })
    })

    return roads
}

interface LeftNode {
    node: PavNode
    angle: number
}
const getLeftNode = (prev: PavNode, node: PavNode) : LeftNode | null => {
    // console.log('\ngetLeftNode.........', node.id, prev.id, prev.point.x + '/' + prev.point.z, node.point.x + '/' + node.point.z)
    if(node.nexts == null || node.nexts.length === 0) { return null }

    const v = node.point.subtract(prev.point)
    let best : number | null = null
    let bestNode : PavNode | null = null
    // console.log('v', v, node.nexts)
    node.nexts.forEach((next: PavNode) => {
        const vt = next.point.subtract(node.point)

        const angle = Vector3.GetAngleBetweenVectors(v, vt, Vector3.Up())
        // console.log('angle/v/vt', prev.junctionIndex, next.junctionIndex, node.id, next.id, angle, v.x + '/' + v.z, vt.x + '/' + vt.z)
        if(next.id !== prev.id && (prev.junctionIndex === -1 || prev.junctionIndex !== next.junctionIndex)) {
            if(best == null || angle < best) {
                best = angle
                bestNode = next
                // console.log('vt chosen', angle, vt.x + '/' + vt.z)
            }
        }
    })

    // console.log('chosing...', bestNode.id)
    return {node: bestNode, angle: best}
}

const createPolygon = (nodes: PavRoad[], prev: PavNode, node: PavNode): PavRoad | null => {
    let cont = true
    const polygon: PavRoad = { nodes: [] }
    let processedSegments = new Map<string, boolean>([[`${prev.id}/${node.id}`, true]])

    let loops = 0
    let startId = node.id

    polygon.nodes.push(prev)
    polygon.nodes.push(node)

    let totalAngle = 0

    while(cont) {
        if(node.nexts == null || node.nexts.length === 0) { return null }

        const next = getLeftNode(prev, node)
        // console.log('next', next)

        if(next == null) { return null }

        // check recurse
        const segmentId = `${node.id}/${next.node.id}`
        if(processedSegments.has(segmentId)) { return null }
        processedSegments.set(segmentId, true)

        if(next.node.id !== startId) {
            polygon.nodes.push(next.node)
        } else {
            cont = false
        }

        prev = node
        node = next.node
        totalAngle += next.angle

        if(loops++ > 50) { return polygon }
    }

    // console.log(`totalAngle: ${totalAngle}`)
    if(totalAngle > 0) return null

    // check triplets
    let found = false
    polygon.nodes.forEach((n: PavNode, i: number) => {
        if(i > 0 && i < polygon.nodes.length - 1 && n.junctionIndex !== -1) {
            const t = getTripletId(n.junctionIndex, polygon.nodes[i - 1].id, polygon.nodes[i + 1].id)
            // console.log('checking ' + t + triplets.has(t) + triplets.get(t))

            if(triplets.has(t)) { found = true }
        }
    })
    if(found) { return null}

    // add triplets
    polygon.nodes.forEach((n: PavNode, i: number) => {
        if(i > 0 && i < polygon.nodes.length - 1 && n.junctionIndex !== -1) {
            const t = getTripletId(n.junctionIndex, polygon.nodes[i - 1].id, polygon.nodes[i + 1].id)
            // console.log('adding ' + t)
            triplets.set(t, true)
        }
    })
    return polygon
}

const buildPolys = (roads: PavRoad[]) : PavRoad[] => {
    const polys : PavRoad[] = []
    for(let ri = 1; ri < roads.length; ri++) {
        for(let ni = 1; ni < roads[ri].nodes.length; ni++) {
            const node = roads[ri].nodes[ni]
            const prev = roads[ri].nodes[ni - 1]
            if(node.junctionIndex === -1) {
                const poly = createPolygon(roads, prev,node)
                // console.log('poly', poly)
                if(poly != null ) { polys.push(poly) }
            }
        }
    }
    return polys
}

const getNormal = (seg: Vector3): Vector3 => {
    const angle = Math.atan2(seg.z, seg.x)
    const norm = new Vector3(Math.cos(angle + Math.PI * 0.5), 0 , Math.sin(angle + Math.PI * 0.5))

    return norm
}
interface Segment {
    a: Vector3
    b: Vector3
    normal: Vector3
}

const shiftSegment = (seg: Segment, push: number = 0) : Segment => {
    const aa = seg.a.add(seg.normal)
    const bb = seg.b.add(seg.normal)
    const dir = bb.subtract(aa).normalize()

    const shift : Segment = {
        a: aa.subtract(dir.scale(push)),
        b: bb.add(dir.scale(push)),
        normal: seg.normal
    }

    return shift
}

const reducePoly = (poly: PavRoad) : Vector3[] => {
    const segs1 : Segment[] = []
    const segs2 : Segment[] = []
    const red1 : Vector3[] = []
    const red2 : Vector3[] = []

    poly.nodes.forEach((c: PavNode, i: number) => {
        const p = i === 0 ? poly.nodes[poly.nodes.length - 2] : poly.nodes[i - 1]

        const norm = getNormal(c.point.subtract(p.point)).scale(4)
        // console.log("POINTS", c.point, p.point, norm, shiftSegment({a: p.point, b: c.point, normal: norm}, 10))

        segs1.push(shiftSegment({a: p.point, b: c.point, normal: norm}, 5))
        segs2.push(shiftSegment({a: p.point, b: c.point, normal: norm.scale(-1)}, 5))
    })

    segs1.forEach((cSeg: Segment, i: number) => {
        const pSeg = i === 0 ? segs1[segs1.length - 1] : segs1[i - 1]

        const inter = vectorIntersection(pSeg.a, pSeg.b, cSeg.a, cSeg.b)

        if (inter === null) {
            red1.push(cSeg.a.scale(0.5).add(pSeg.b.scale(0.5)))
        } else { 
            red1.push (inter)
        }
    })

    segs2.forEach((cSeg: Segment, i: number) => {
        const pSeg = i === 0 ? segs1[segs1.length - 1] : segs1[i - 1]

        const inter = vectorIntersection(pSeg.a, pSeg.b, cSeg.a, cSeg.b)

        if (inter === null) {
            red2.push(cSeg.a.scale(0.5).add(pSeg.b.scale(0.5)))
        } else { 
            red2.push (inter)
        }
    })

    let length1 = 0
    for(let i = 1; i < red1.length; i++) { length1 += red1[i].subtract(red1[i - 1]).length()}

    let length2 = 0
    for(let i = 1; i < red1.length; i++) { length2+= red2[i].subtract(red2[i - 1]).length()}

    return (length1 < length2 ? red1 : red2)
}

const reducePolys = (polys: PavRoad[]) : Vector3[][] => {
    const reds : Vector3[][] = []

    polys.forEach((poly: PavRoad) => {
        reds.push(reducePoly(poly))
    })

    return reds
}

const rotatePlanar = (v: Vector3, angle: number): Vector3 => {
    /* const normQuaternion = Quaternion.FromEulerAngles(0, angle, 0)
    let rotated: Vector3 = new Vector3(1, 1, 1)
    v.rotateByQuaternionToRef(normQuaternion, rotated) */
    console.log(v)
    const vAngle = v.x !== 0 ? Math.atan2(v.z, v.x) : (v.z > 0 ? Math.PI * 0.5 : -Math.PI * 0.5)
    console.log(vAngle)
    const rotated = new Vector3(10 * Math.cos(vAngle + angle), 0 , 10 * Math.sin(vAngle + angle))
    return rotated
}
const circleFromCorner = (prev: Vector3, cur: Vector3, next: Vector3, count: number = 3) => {
    
    // get normals
    const prevNorm = rotatePlanar(prev.subtract(cur), Math.PI * 0.5)
    const nextNorm = rotatePlanar(next.subtract(cur), Math.PI * 0.5)

    // find center
    console.log(prev.subtract(cur).normalize(), prevNorm.normalize(), next.subtract(cur).normalize(), nextNorm.normalize())
    console.log(vectorLineIntersection(prev, prev.add(prevNorm), next, next.add(nextNorm)))

    // get line intersections
}

const cutCornerPoly = (poly: Vector3[]) : Vector3[] => {
    const cutPoly : Vector3[] = []
console.log('\n********', poly)
    poly.forEach((p: Vector3, i: number) => {
        const prev = i > 0 ? poly[i - 1] : poly[poly.length - 1]
        const next = i < poly.length - 1 ? poly[i + 1] : poly[0]

        const angle = Vector3.GetAngleBetweenVectors(next.subtract(p), prev.subtract(p), Vector3.Up())

        if((Math.abs(angle) > Math.PI * 0.1 && Math.abs(angle) < Math.PI * 0.9)
            || (Math.abs(angle) > Math.PI * 1.1 && Math.abs(angle) < Math.PI * 1.9))
        {
            console.log('GO')
            const prevVec = prev.subtract(p).normalize().scale(5)
            const nextVec = next.subtract(p).normalize().scale(5)
            cutPoly.push(p.add(prevVec))
            cutPoly.push(p.add(nextVec))
            circleFromCorner(prevVec, p, nextVec)
        }
        else
        {
            // console.log(i, p, prev, next, angle)
            cutPoly.push(p)
        }

        //
        
    })

    return cutPoly
}

const cutCornerPolys = (polys: Vector3[][]) : Vector3[][] => {
    const cuts : Vector3[][] = []

    polys.forEach((poly: Vector3[]) => {
        cuts.push(cutCornerPoly(poly))
    })

    return cuts
}

const buildPavements = () : Vector3[][] => {
    // we first isolate the junctions from the ways
    junctions = createJunctions(ways) // FIXME: no global variables
    paths = createPaths(ways) // FIXME: no global variables

    const roads = createRoads(paths)

    console.log('buildRoads', roads)

    const polys = buildPolys(roads)
    console.log('polys', polys)

    const reds = reducePolys(polys)
    console.log('reds', reds)

    const cuts = cutCornerPolys(reds)
    console.log('cuts', cuts)

    cuts.forEach((poly, i) => {
        const closedPoly = poly.concat(poly, [poly[0]])
        let li = Mesh.CreateLines('li', closedPoly, globalScene)
        li.position.y = li.position.y + 0.1
        li.color = Color3.White()
    })

    return cuts
}

export default buildPavements
