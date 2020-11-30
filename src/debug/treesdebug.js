import { ways } from './map'

//to test trees position depedending on ways

function treesDebug(){
    //debug 
    var options = {
        diameterTop:2, 
        diameterBottom: 2, 
        height: 80, 
        tessellation: 10, 
        subdivisions: 1
    }

    ways.forEach(way => {
        for (var i = 1; i < way.points.length-1; i++){
                var posTab = getInterPos(way.points[i], way.points[i+1]);
                
                for (var node of entries.rootNodes) {
                    console.log('done')
                    node.position = new Vector3(posTab['xL'], 1, posTab['yL']);
                    node.position = new Vector3(posTab['xR'], 1, posTab['yR']);
                }    
            entries.mesh[0].position = new Vector3(posTab['xL'], 1, posTab['yL']);
            entries.mesh[0].position = new Vector3(posTab['xR'], 1, posTab['yR']);            
            var Lcol = new MeshBuilder.CreateCylinder('test', options);
            var Rcol = new MeshBuilder.CreateCylinder('test', options);
            var color = new StandardMaterial("myMaterial", scene);
            color.diffuseColor = posTab.color;
            color.emissiveColor = posTab.color;
            Lcol.position = new Vector3(posTab['xL'], 1, posTab['yL']);
            Rcol.position = new Vector3(posTab['xR'], 1, posTab['yR']);
            Lcol.material = color;
            Rcol.material = color;
            //end debug
        }
    })
}