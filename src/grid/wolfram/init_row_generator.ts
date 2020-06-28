import { params } from './params';

export class InitRowGenerator{
    constructor(private group_size = 1) {}
    
     rowFunctionLUT = {
        'random': (base,width) => this.rand_row(base,width),
        'center': (base,width) => this.group_row(base,width)
    }

    generate_row(
        mode: string, 
        row_index: number, 
        base: number, 
        width: number, 
        shift: number = 0
    ): number[]{
        let row = this.rowFunctionLUT[mode](base,width)
        return [...this.arrayRotate(row,row_index * shift)]
        // let row = this.rowFunctionLUT[params.images[0].init_row.mode](base,width)
        // return [...this.arrayRotate(row,row_index * params.images[0].init_row.shift)]
    }

    rand_row(base,width): number[]{
        let row: number[] = [];
        let rand_val = Math.floor(Math.random() * base)
        for(let i = 0; i < width; i++){
            row.push(
                rand_val
            )
            if(i % this.group_size == 0)
                rand_val = Math.floor(Math.random() * base)
        }
        return row
    }

    step_row(base,width, group_size = 1, offset = 0):number[]{
        let row = [];
        let count = 0;
        for(let i = 0; i < width / group_size; i++){
            let val = (count + offset) % base
            for(let j = 0; j < group_size; j++){
                row.push(val)
            }
            count++;
        }
        return row.slice(0,width)
    }

    alt_step_row(base,width, group_size = 1, offset = 0):number[]{
        let row = [];
        let up = new Array(new Array(base).keys())
        let down = up.reverse().slice(1,base - 1)
        let step = up.concat(down)
        for(let i = 0; i < width; i++)
            for(let j = 0; j < group_size; j++)
                row.push(step[(i + offset) % step.length])
        return row
    }

    group_row(base,width, justify = 1):number[]{
        // 0->left _ 1->center _ 2->right
        let row = new Array(width).fill(0)
        let center_index;
        if (justify == 0)
            center_index = (base - 1)
        if (justify == 1)
            center_index = Math.floor(width / 2)
        if (justify == 2)
            center_index = width - base
        for(let i = 0; i < width; i++){
            if (i == center_index){
                for(let j = 0; j < base; j++)
                    row[i + j] = ((base - 1) - j)
                for(let j = 1; j < base; j++)
                    row[i - j] = ((base - 1) - j)
            }
        }
        // console.log('initrow',row)
        return row
    }

    arrayRotate(arr, count) {
        count -= arr.length * Math.floor(count / arr.length);
        arr.push.apply(arr, arr.splice(0, count));
        return arr;
    }
}

