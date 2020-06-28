import {params} from './params'
import { SmoothLine, arrSum } from './helpers';
import { GridMachine } from './grid/grid_machine';
import { GridCell } from './grid/grid_machine.models';

export interface Cell{
    value: number;
    x:number;
    y:number;
    cx:number;
    cy:number;
}

export class Weave{
    grid: GridCell[][] = [];
    original_grid: GridCell[][] = [];
    grid_sum: number; 
    start_grid_sum: number;
    cell_width: number = params.canvas.width / params.grid.cols;
    cell_height: number = params.canvas.height / params.grid.rows;
    jump_count: number = 0;
    cell_count: number = 0;
    grid_machine = new GridMachine(params.grid.rows,params.grid.cols);
    k_rand_a: number = Math.random();
    k_rand_b: number = Math.random();
    knightStartLUT = {
        'center':  {
            x: Math.floor(params.grid.cols / 2),
            y: Math.floor(params.grid.rows / 2)
        },
        'random':  {
            x: Math.floor(this.k_rand_a * params.grid.cols),
            y: Math.floor(this.k_rand_b * params.grid.rows)
        },
        'start':  {
            x: 0,
            y: 0
        },
    }

    knight_x: number;// = this.knightStartLUT[params.knight.start].x;
    knight_y: number;// = this.knightStartLUT[params.knight.start].y;
    weave_queue: any[]// = new Array(params.weave.queue_length).fill({x:this.knight_x,y:this.knight_y});
    weave_path = [];
    knight_jump_offsets: {x:number;y:number}[] = [];

    constructor(
        public graphic, 
        public color_machine,
    ){
        this.RefreshKnight();
        this.RefreshWeave();
    }


    RefreshKnight(){
        this.k_rand_a = Math.random();
        this.k_rand_b = Math.random();

        // this.knight_x = Math.random();//this.knightStartLUT[params.knight.start].x;
        // this.knight_y = 4;//this.knightStartLUT[params.knight.start].y;
        this.knight_x = Math.floor(Math.random() * params.grid.cols)
        this.knight_y = Math.floor(Math.random() * params.grid.rows)
        console.log('knight refreshed', this.knight_x, this.knight_y)
        for(let i = 0; i < 4; i++){
            const muls = Array.from(i.toString(2).padStart(2,'0')).map((m) => parseInt(m));
            const x_mul = muls[0] ? -1 : 1;
            const y_mul = muls[1] ? -1 : 1;
            const x = x_mul * params.knight.jump.x
            const y = y_mul * params.knight.jump.y
            this.knight_jump_offsets.push({x:x,y:y});
            this.knight_jump_offsets.push({x:y,y:x});
        }
        // const span = 1
        // for(let i = -span; i <= span; i++){
        //     for(let j = -span; j <= span; j++){
        //         this.knight_jump_offsets.push({x:i,y:j})
        //     }    
        // }
        // console.log('this.knight_jump_offsets',this.knight_jump_offsets)
    }


    RefreshWeave(){
        this.weave_queue = new Array(params.weave.queue_length).fill({x:this.knight_x,y:this.knight_y});
    }

    RefreshGrid(new_grid){

        // this.original_grid = this.gridGenerators[grid_type_index](max); 
        this.grid = new_grid.map((row) => {
            return row.map((cell)=> {
                return {
                    ...cell,
                    value: Math.floor(cell.value * params.grid.rows * params.grid.cols ),
                    x: cell.x * this.cell_width,
                    y: cell.y * this.cell_height,
                    cx: cell.x * this.cell_width + (this.cell_width / 2),
                    cy: cell.y * this.cell_height + (this.cell_height / 2)
                }
            })
        })
        
        this.start_grid_sum = arrSum(this.grid.map((row)=> row.map((cell)=>cell.value)))
    }

    getOriginalGrid(){
        return this.original_grid;
    }

    Jump(){
        this.weave_path.push({
            x:this.knight_x,
            y:this.knight_y,
        })
        this.grid[this.knight_x][this.knight_y].value = -1;

        const options = this.calculateNext()
        if(options.length == 0){
            this.jump_count = 0;
            return false;
        }
        this.rotateWeaveQueue()
        let next_jump_index = this.nextJumpIndex(options);
        this.knight_x = options[next_jump_index].x
        this.knight_y = options[next_jump_index].y
        // this.grid.forEach((row)=> console.log(row.map((cell)=>cell.value.toString().padStart(2,'0')).join(' ')))
        this.jump_count = (this.jump_count + 1) % params.color.domain;
        // console.log('weave_path ->',this.jump_count,this.weave_path)
        this.drawWeave();
        return true;
    }

    setKnightColors(){
        this.graphic.strokeWeight(params.knight.stroke_cell_ratio * this.cell_width);
        let cv = arrSum(this.grid.map((row)=> row.map((cell)=>cell.value))) / this.start_grid_sum;
        let col = this.color_machine(cv).rgba();
        col[3] = 255 * params.knight.alpha;
        this.graphic.fill(col);
        this.graphic.stroke(this.color_machine(1 - cv).hex())
    }

    rotateWeaveQueue(){
        this.weave_queue.push({
            x: this.knight_x,
            y: this.knight_y,
        })
        this.weave_queue.shift();
    }

    drawWeave(){
        const weave = this.weave_queue.map((cell_index) => {
            return{
                x: this.grid[cell_index.x][cell_index.y].cx,
                y: this.grid[cell_index.x][cell_index.y].cy,
            }
        })
        const smoothed_weave_path = SmoothLine(
            weave,
            params.weave.smooth_iters,
            params.weave.smooth_iter_start,
            params.weave.smooth_dist_ratio,   
        )
        this.graphic.strokeJoin('bevel')
        this.graphic.strokeWeight(this.cell_width * params.weave.stroke_cell_ratio + 10)
        this.graphic.stroke('black')
        this.graphic.beginShape()
        smoothed_weave_path.forEach((v)=>this.graphic.vertex(v.x,v.y))
        this.graphic.endShape();

        const cv = ((this.jump_count) % 4) / 4;
        let fill_color = this.color_machine(cv).rgba()
        let stroke_color = this.color_machine((cv + 0.5) % 1).rgba()
        fill_color[3] = 255;
        stroke_color[3] = 255;
        // this.graphic.stroke('white') //temp
        this.graphic.stroke(stroke_color)
        this.graphic.fill(fill_color)
        this.graphic.strokeWeight(this.cell_width * params.weave.stroke_cell_ratio)
        this.graphic.noFill();

        this.graphic.beginShape()
        smoothed_weave_path.forEach((v)=>this.graphic.vertex(v.x,v.y))
        this.graphic.endShape();
    }



    nextJumpIndex(options){
        let next_jump_index = -1;
        let high_value = -100000;
        options.forEach((option,index)=>{
            if(option.value > high_value){
                high_value = option.value;
                next_jump_index = index;
            }
        })
        return next_jump_index;
    }

    calculateNext(){
        let options = [];
        this.knight_jump_offsets.forEach((offset)=>{
            try{
                const x = this.knight_x + offset.x; 
                const y = this.knight_y + offset.y; 
                const v = this.grid[x][y].value;
                options.push({
                    value: v,
                    x: x,
                    y: y
                })
            } catch {}
        })
        options = Array.from(new Set(options.map(o => JSON.stringify(o)))).map(o => JSON.parse(o));
        options = options.filter(o => o.value !== -1)
        return options
    }

}