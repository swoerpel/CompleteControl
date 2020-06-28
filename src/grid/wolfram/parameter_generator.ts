import { round } from './helpers';

export class ParameterGenerator{
    constructor(){}

    rand_param_list(len,std,acc = 100000):number[]{
        let params = []
        for(let i = 0; i < len; i++){
            let val = round(Math.random() * std * ((Math.random() > 0.5) ? -1 : 1),acc)
            params.push(val)
        }
        return params;
    }

    rand_int(base,length): string{
        let num = ''
        for(let i = 0; i < length; i++)
            num += Math.floor(Math.random() * base).toString()
        return num
    }
    
    round(N,acc){
        return Math.round(N * acc) / acc
    }
      
    // base and offset need to be same length
    apply_offset_matrix_2d(base,offset,iterations): number[][]{
        for (let i = 0; i < iterations;i++){
            for (let j = 0; j < base.length;j++){
                for (let k = 0; k < base[j].length;k++){
                    base[j][k] += offset[j][k]
                }
            }
        }
        return base
    }
    // base and offset need to be same length
    apply_offset_matrix_1d(base,offset,iterations): number[]{
        for (let i = 0; i < iterations;i++){
            for (let j = 0; j < base.length;j++){
                base[j] += offset[j]
                // console.log(base[j],offset[j])
            }
        }
        return base
    }
}