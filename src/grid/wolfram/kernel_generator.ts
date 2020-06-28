import { Kernel } from './models/kernel.model'
  

export class KernelGenerator{
    private wolfram_kernels = {
        'A': [
            [1,1,1]
        ],
      
        'B':[
            [1,0,1],
            [0,1,0],
            [1,0,1],
        ],
      
        'C':[
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,1,1,1,1]
        ],
    }
    
    constructor(){
    }
    
    GenerateKernel(type: string): Kernel{
        let kernel: number[][] = this.wolfram_kernels[type]
        let k_dims = {
            x: kernel[0].length,
            y: kernel.length
        }
        let offsets = []
        let global_k_origin = {
            x: Math.floor((k_dims.x - 1) / 2),
            y: (k_dims.y - 1)
        }
        for(let i = 0; i < k_dims.y; i++){
            for(let j = 0; j < k_dims.x; j++){
                if(kernel[i][j] == 1){
                    offsets.push({
                        x: global_k_origin.x - j,
                        y: global_k_origin.y - i
                    })
                }
            }
        }   
        let kernel_obj:Kernel = {
            kernel: kernel,
            offsets: offsets,
            dims: k_dims,
            length: offsets.length
        }
        return kernel_obj;
    }   

}