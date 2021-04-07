import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
//set a variable returning mesh directly or loading it
export default async function mainCarLoaded(container: AssetContainer): Promise<Mesh> {
    return await new Promise (function(resolve) {
        const interval = setInterval(container =>  {
           if (container && container['meshes'].find((car:Mesh) => car.name == 'car')){
              resolve(container['meshes'].find((car:Mesh) => car.name == 'car'));
              clearInterval(interval);
           }
        }, 100, container)
     }).then((car: Mesh) => {
         return car
     })    
}