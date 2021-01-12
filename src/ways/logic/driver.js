import { getSegmentGetClosest } from '../../geofind/geosegment'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { scene as globalScene } from '../../index'

let nodes = []

const pathLength = 300

export const driverPathBuild = (position, segment, junctionSelection) => {
    if(position == null) { 
        nodes = []
        return []
    }

    let prevNode = null
    let node = null

    if(segment == null) {
        const closest = getSegmentGetClosest(position)
        if(closest != null) {
            segment = closest.segment.nodes
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
                        }
                        break
                    case 'R':
                        if(angle < -1) { 
                            selectedNode = n 
                            selectionDone = true
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
    }


    // console.log(position)
    // console.log(nodes)
    driverPathDisplay(nodes)
    if(d < 30) { return([]) }
    return driverPathSwitch(position)
}

const boxes = []
const boxCount = 200
const boxSpacing = 2

const createBoxes = () => {
    for (let i = 0; i < boxCount; i++) {
        const b = MeshBuilder.CreateBox("box", {size: 0.5}, globalScene)
        //b.isVisible = false;
        b.position = new Vector3(0 , 0.2 , 0)
        boxes.push(b)
    }
}

export const driverPathDisplay = (nodes) => {
    if(nodes == null || nodes.length < 2) { return }
    if(boxes.length < boxCount) { createBoxes () }

    let boxIndex = 0
    let nodeIndex = 1

    let prevNode = nodes[0]
    let node = nodes[nodeIndex]

    while(node != null && boxIndex < boxes.length) {
        boxes[boxIndex++].position = new Vector3(node.point.x, 0.2, node.point.z)

        const dir = node.point.subtract(prevNode.point).normalize().scale(boxSpacing)
        // console.log(dir)
        let point = prevNode.point
        while(boxIndex < boxes.length && node.point.subtract(point).length() > boxSpacing) {
            // console.log(point)
            point = point.add(dir)
            boxes[boxIndex++].position = new Vector3(point.x, 0.2, point.z)
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
        return [nodes[0], nodes[1]]
    } 

    return [nodes[0], nodes[1]]
}