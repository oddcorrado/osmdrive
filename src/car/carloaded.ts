import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export default async function mainCarLoaded(container: AssetContainer): Promise<Mesh> {
    return await new Promise (function(resolve) {
        const interval = setInterval(container =>  {
           if (container && container['meshes'].find(car => car.name == 'detailedcar')){
              resolve(container['meshes'].find(car => car.name == 'detailedcar'));
              clearInterval(interval);
           }
        }, 100, container)
     }).then((car: Mesh) => {
         return car
     })    
}