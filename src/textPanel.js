import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from '@babylonjs/core/Maths/math.color'

export default function textPanel(scene, text, x, y, z, planes) {
    //Set font
    var font_size = 48;
    var font = `bold ${font_size} px Arial`
    
    //Set height for plane
    var planeHeight = 3;
    
    //Set height for dynamic texture
    var DTHeight = 1.5 * font_size; //or set as wished
    
    //Calcultae ratio
    var ratio = planeHeight/DTHeight;
    
    //Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
    var temp = new DynamicTexture("DynamicTexture", 64, scene);
    var tmpctx = temp.getContext();
    tmpctx.font = font;
    var DTWidth = tmpctx.measureText(text).width + 8;
    
    //Calculate width the plane has to be 
    var planeWidth = DTWidth * ratio;

    //Create dynamic texture and write the text
    var dynamicTexture = new DynamicTexture("DynamicTexture", {width:DTWidth, height:DTHeight}, scene, false);
    var textMat = new StandardMaterial("mat", scene);
    textMat.diffuseTexture = dynamicTexture;
    textMat.diffuseColor = new Color3(1, 1, 1)
    textMat.emissiveColor = new Color3(1, 1 , 1)
    dynamicTexture.drawText(text, null, null, font, "#000000", "#ffffff", true);
    
    //Create plane and set dynamic texture as material
    const plane1 = MeshBuilder.CreatePlane('plane', {width:planeWidth, height:planeHeight}, scene);
    plane1.position.x = x
    plane1.position.y = y
    plane1.position.z = z
    const plane2 = MeshBuilder.CreatePlane('plane', {width:planeWidth, height:planeHeight}, scene);
    plane2.position.x = x
    plane2.position.y = y
    plane2.position.z = z
    plane2.rotation.y = Math.PI
    plane1.material = textMat;
    plane2.material = textMat;
    planes.push(plane1)
    planes.push(plane2)
}