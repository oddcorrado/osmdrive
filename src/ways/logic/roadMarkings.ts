import {roads} from './roads'
import { Vector3 } from '@babylonjs/core/Maths/math'

//  * * * * * * * * *  rM stands for roadMarkings  * * * * * * * * * 

interface rMNode {
    point: Vector3 // position
    type?: string // used for intermediate nodes
    isJunction?:boolean
    isFirst?:boolean
}
type rMRoad = rMNode[] // is an array of marking nodes representing a way

export let roadMarkings: rMRoad[] = []
export let roadMarkingsFoundation: rMRoad[] = []

// Defines a new model for markings use only. So far we just take the middle of the two lanes.
export default function buildRoadMarkings() {
    
    // STEP 1 : First let's join the lanes into one that's in the middle
    
    roads.forEach((road,roadIndex) => {
        // create a road array
        roadMarkingsFoundation.push([])
        road.lanes[0].forEach((node0,i) => {
            // node in the 0 lane
            const node0Point= node0.point
            // node in front of it in the lane 1
            // sometimes the correspondant point doesne't exist I dk why so I had to treat it
            const node1Point = road.lanes[1][i] ? road.lanes[1][i].point : node0.point

            // determine the middle of the two and push it to the markingRoad table
            roadMarkingsFoundation[roadIndex].push( 
                {   
                    point:node0Point.add(node1Point).scale(0.5),
                    isJunction: node0.type === "junction"
                }
            )
        })
    })



    // console.log("# # # # # # # # # # # # # # # # # # # # # # # # # # # ")
    // roads[0].lanes[0].forEach((node,i)=>{
    //     console.log(node.point, roadMarkingsFoundation[0][i].point)
    // })
    

    const d = 6
    // STEP 2 : let's interpolate each point with the wanted distance
    roadMarkings = roadMarkingsFoundation.map(lane=>{
        // lane is here an array of laneNodes
        let currentNode = 0 // index of the currentNode
        let currentMark = lane[0].point // current point of the new way
        let dstToNextNode //  rest from currentMark to the next way point
        const markingLane = [{
            point:lane[0].point,
            isJunction:lane[0].isJunction,
            type:'lane',
            isFirst:true
        }] // initalize markingLane with first point - markkingLane is the output for one lane
        let startOffset = 0 // startOffset is to use to compensate the last point
    
        while(currentNode<lane.length-1){
            const nextNode = lane[currentNode+1].point
            dstToNextNode = nextNode.subtract(currentMark).length()
            while(dstToNextNode > d) {
                // stop when rest is to small to mark a new point
                const mainVector = nextNode.subtract(lane[currentNode].point)
                let distance = startOffset ? startOffset : d // we use offset only for the first mark of the lane
                const vectorToadd = mainVector.scale(distance/mainVector.length())
                if (startOffset){startOffset=0}
                currentMark = currentMark.add(vectorToadd)
                dstToNextNode = nextNode.subtract(currentMark).length()
                markingLane.push({
                    point:currentMark,
                    type:'lane',
                    isJunction:lane[currentNode].isJunction,
                    isFirst:false
                })
            }
            startOffset= d - dstToNextNode
            currentNode++
            currentMark=lane[currentNode].point
        }
        return markingLane
    })

    // console.log("roads[0].lanes[0]",roads[0].lanes[0].point)
    // console.log("roadMarkingsFoundation",roadMarkingsFoundation[0])



}
