import { Texture } from '@babylonjs/core/Materials/Textures/texture'
function textureCreator(scene, source, uS, vS){
    const tmpTxtur = new Texture(source, scene)

    tmpTxtur.uScale = uS
    tmpTxtur.vScale = vS

    return tmpTxtur
}

export function createTextureCollection (scene){
 const textureCollection = [
        [
            {texture: textureCreator(scene, '../textures/xsmallbuilding.jpg', 10, 1)},//type 0 (xsmall)
            {texture: textureCreator(scene, '../textures/xsmall2.jpg', 10, 1)},
            {texture: textureCreator(scene, '../textures/xsmall3.jpg', 10, 1)}            
        ],
        [
            {texture: textureCreator(scene, '../textures/smallbuilding.jpg', 10, 1)},//type 1 (small)
            {texture: textureCreator(scene, '../textures/smallbuilding2.jpg', 10, 1)},
            {texture: textureCreator(scene, '../textures/smallbuilding3.jpg', 10, 1)}
        ],
        [
            {texture: textureCreator(scene, '../textures/building.png', 10, 1)},//type 2 (medium)
            {texture: textureCreator(scene, '../textures/mediumbuilding.jpg', 10, 1)},
            {texture: textureCreator(scene, '../textures/mediumbuilding2.jpg', 10, 1)}
        ],
        [
            {texture: textureCreator(scene, '../textures/haussmann.jpg', 5, 1)},//type 3 (tall)
            {texture: textureCreator(scene, '../textures/haussmann2.jpg', 5, 1)},
            {texture: textureCreator(scene, '../textures/haussmann3.jpg', 5, 1)},
            {texture: textureCreator(scene, '../textures/haussmann4.jpg', 5, 1)}
        ],
        [
            {texture: textureCreator(scene, '../textures/sky.jpg', 5, 1)},//type 4 (high)
            {texture: textureCreator(scene, '../textures/sky2.jpg', 5, 1)},
            {texture: textureCreator(scene, '../textures/sky3.jpg', 5, 1)},
            {texture: textureCreator(scene, '../textures/sky4.jpg', 5, 1)}
        ]

        
    ]
    return textureCollection;
}


