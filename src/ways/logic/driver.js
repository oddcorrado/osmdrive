import { getSegmentGetClosest, geoSegmentGetProjection } from '../../geofind/geosegment'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { scene as globalScene } from '../../index'
import { vectorIntersection } from '../../maths/geometry'
import {getArrow, createInstanceArrow} from '../../props/arrow'
import {getAngle, getSelection, getApproach} from '../../controls/loops'

// let nodes = []

const pathLength = 300

export const driverPathBuild = (position, nodes, junctionSelection) => {
    if(position == null) { 
        nodes = []
        return []
    }

    let prevNode = null
    let node = null

    if(nodes == null) {
        const closest = getSegmentGetClosest(position)
        if(closest != null) {
            const segment = closest.segment.nodes
            prevNode = segment[0].upwise ? segment[0] : segment[1]
            node = segment[0].upwise ? segment[1] : segment[0]
        } else {
            nodes = []
            return []
        }
    } else {
        prevNode = nodes[0]
        node = nodes[1]
    }

    let d = 0

    let selectionDone = false

    if(prevNode == null || prevNode.point ==null) {
        console.log(segment)
        return
    }

    nodes = [prevNode, node]

    let index = 0
    let selectionIndex = -1

    while(d < pathLength && node != null) {
        d += node.point.subtract(prevNode.point).length()   

        const dir = node.point.subtract(prevNode.point)

        let selectedNode = null
        // console.log('*************')
        node.nexts.forEach(n => {
            const newDir = n.point.subtract(node.point)
            
            const angle = Vector3.GetAngleBetweenVectors(newDir, dir, new Vector3(0, 1, 0))

            if(!selectionDone) {
                switch(junctionSelection) {
                    case 'L':
                        if(angle > 1) { 
                            selectedNode = n 
                            selectionDone = true
                            selectionIndex = index
                        }
                        break
                    case 'R':
                        if(angle < -1) { 
                            selectedNode = n 
                            selectionDone = true
                            selectionIndex = index
                        }
                        break
                }
                if(Math.abs(angle) < 1 && selectedNode == null) { selectedNode = n }
            } else {
                if(Math.abs(angle) < 1 && selectedNode == null) {
                    selectedNode = n
                }
            }
            // console.log(dir, newDir, selectionDone, angle)
        })  
        
        if(selectedNode != null && 
            !(selectedNode.roadIndex === nodes[0].roadIndex 
                && selectedNode.laneIndex === nodes[0].laneIndex 
                && selectedNode.nodeIndex === nodes[0].nodeIndex)) {
            prevNode = node
            nodes.push(selectedNode)
            node = selectedNode
        } else {
            node = null
        }
        index++
    }


    // console.log(position)
    driverPathDisplay(nodes)
    if(d < 30) { return([]) }
    // return driverPathSwitch(position)
    return { nodes, selectionIndex }
}

let boxes = []
let arrows = []
const boxCount = 200
const boxSpacing = 2
let arrow = null
const createBoxes = () => {
    for (let i = 0; i < boxCount; i++) {
        const b = MeshBuilder.CreateBox("box", {size: 0.5}, globalScene)
       b.isVisible = false;
        boxes.push(b)
    }
}

const createArrows = () => {
    arrow = arrow ? arrow : getArrow()
    if (arrow){
        for (let i = 0; i < boxCount; i++) {
            const b = createInstanceArrow(0, 0)
            b.rotation = new Vector3(0, Math.PI, 0)
            arrows.push(b)
        }
    }
}
let i = 0
export const driverPathDisplay = (nodes) => {
    //actually drawing depending on distance from car
    //draw depending on distance with node
    if(nodes == null || nodes.length < 2) { return }
    if(boxes.length < boxCount) { createBoxes () }
    if (arrows.length < boxCount){ createArrows() }
    else {boxes = arrows}
    let boxIndex = 0
    let nodeIndex = 1

    let prevNode = nodes[0]
    let node = nodes[nodeIndex]

    while(node != null && boxIndex < boxes.length) {
        const angle = getAngle()
        const selection = getSelection()
        const approach = getApproach()
        const offsetAngle = selection ? selection === 'L' ?  -Math.PI/2 : Math.PI/2 : 0
        //boxes[boxIndex++].position = new Vector3(node.point.x, 0.2, node.point.z)
        //boxes[boxIndex].rotation = boxIndex < 50 ? new Vector3(0, angle, 0) : new Vector3(0, angle, 0)
        const dir = node.point.subtract(prevNode.point).normalize().scale(boxSpacing)
        // console.log(dir)
        let point = prevNode.point
        while(boxIndex < boxes.length && node.point.subtract(point).length() > boxSpacing) {
            // console.log(point)
            point = point.add(dir)
            boxes[boxIndex++].position = new Vector3(point.x, 0.2, point.z)
            boxes[boxIndex].rotation = (boxIndex < 45 || approach > 10) ? new Vector3(0, angle, 0) : new Vector3(0, angle + offsetAngle, 0)
          //  console.log(boxIndex, boxes.length)
        }
        nodeIndex++
        prevNode = node
        node = nodes[nodeIndex]
    }

    while(boxIndex < boxes.length) {
        boxes[boxIndex++].position = new Vector3(1000, 1000, 1000)
    }
}

export const driverPathGet = () => { return [nodes[0], nodes[1]] }

const switchDistance = 2

export const driverPathSwitch = (position) => {
    if (position == null || nodes == null) { return null }

    if (nodes.length == 0) {
        const closest = getSegmentGetClosest(position)
        if (closest == null) { return [] }
        return closest.nodes
    }

    if (nodes.length < 2) { return nodes[0] }
    if (position.subtract(nodes[1].point).length() < switchDistance) {
        nodes = nodes.slice(1)
    } 

    return nodes
}

let targetVisu = null
let projVisu = null

const createtargetVisu = () => {
    targetVisu = MeshBuilder.CreateBox("box", {size: 1}, globalScene)
    projVisu = MeshBuilder.CreateBox("box", {size: 2}, globalScene)
}

export const driverGetSmootherTarget = (point, prevTarget, nodes, distance) => {
    // if(targetVisu == null) createtargetVisu()
    let slice = false
    if(nodes == null || nodes.length < 2) { return { target: point, normalProjection: point, nodes, slice } }

    // let p = geoSegmentGetProjection(point, nodes[0].point, nodes[1].point)
    const to = prevTarget.subtract(point).normalize()
    const angle = Math.atan2(to.z, to.x)
    const norm = new Vector3(10 * Math.cos(angle + Math.PI * 0.5), 0 , 10 * Math.sin(angle + Math.PI * 0.5))
    let p = vectorIntersection(
        point.add(norm.normalize().scale(100)),
        point.add(norm.normalize().scale(-100)),
        nodes[0].point,
        nodes[1].point)

    if(p == null) {
        p = point
    }

    const normalProjection = p
    let d = distance
    let ni = 1
    let target = null
    
    while(ni < nodes.length && target == null) {
        const ssize = p.subtract(nodes[ni].point).length()
        if(d < ssize) {
            target = p.add(nodes[ni].point.subtract(p).normalize().scale(d))
        } else {
            d -= ssize
        }
        p = nodes[ni].point
        ni++
    }
    if(target == null) { target = p }

    // targetVisu.position = target
    // projVisu.position = normalProjection

    if (normalProjection.subtract(nodes[1].point).length() < switchDistance) {
        slice = true
        nodes = nodes.slice(1)
    } 

    return { nodes, target, normalProjection, slice }
}

// export const driverPathDisplay = (nodes) => {
//     if(nodes == null || nodes.length < 2) { return }
//     if(boxes.length < boxCount) { createBoxes () }

//     let boxIndex = 0
//     let nodeIndex = 1

//     let prevNode = nodes[0]
//     let node = nodes[nodeIndex]

//     while(node != null && boxIndex < boxes.length) {
//         boxes[boxIndex++].position = new Vector3(node.point.x, 0.2, node.point.z)

//         const dir = node.point.subtract(prevNode.point).normalize().scale(boxSpacing)
//         // console.log(dir)
//         let point = prevNode.point
//         while(boxIndex < boxes.length && node.point.subtract(point).length() > boxSpacing) {
//             // console.log(point)
//             point = point.add(dir)
//             boxes[boxIndex++].position = new Vector3(point.x, 0.2, point.z)
//         }
//         nodeIndex++
//         prevNode = node
//         node = nodes[nodeIndex]
//     }

//     while(boxIndex < boxes.length) {
//         boxes[boxIndex++].position = new Vector3(1000, 1000, 1000)
//     }
// }
