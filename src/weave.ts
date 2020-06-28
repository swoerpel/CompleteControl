import {params} from './params'
import { SmoothLine, arrSum } from './helpers';
import * as chroma from 'chroma.ts';
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

    knight_x: number = this.knightStartLUT[params.knight.start].x;
    knight_y: number = this.knightStartLUT[params.knight.start].y;
    weave_queue = new Array(params.weave.queue_length).fill({x:this.knight_x,y:this.knight_y});
    knight_jump_offsets: {x:number;y:number}[] = [];

    constructor(
        public graphic, 
        public color_machine,
    ){}


    RefreshKnight(){
        this.k_rand_a = Math.random();
        this.k_rand_b = Math.random();

        // this.knight_x = this.knightStartLUT[params.knight.start].x;
        // this.knight_y = this.knightStartLUT[params.knight.start].y;
        this.knight_x = Math.floor(Math.random() * params.grid.cols)
        this.knight_y = Math.floor(Math.random() * params.grid.rows)

        for(let i = 0; i < 4; i++){
            const muls = Array.from(i.toString(2).padStart(2,'0')).map((m) => parseInt(m));
            const x_mul = muls[0] ? -1 : 1;
            const y_mul = muls[1] ? -1 : 1;
            const x = x_mul * params.knight.jump.x
            const y = y_mul * params.knight.jump.y
            this.knight_jump_offsets.push({x:x,y:y});
            this.knight_jump_offsets.push({x:y,y:x});
        }
        // console.log('this.knight_jump_offsets',this.knight_jump_offsets)
    }

    private gridGenerators = [
        () => this.grid_machine.randomGrid(),
        (max) => this.grid_machine.orderedDomainGrid(max),
        (max) => this.grid_machine.orderedSequenceGrid(max),
        (max) => this.grid_machine.stripeGrid(max),
        (max) => this.grid_machine.wolframGrid(max),
    ]

    RefreshWeave(){
        this.weave_queue = new Array(params.weave.queue_length).fill({x:this.knight_x,y:this.knight_y});
    }

    RefreshGrid(grid_type_index = 0){
        let max = 4;
        this.original_grid = this.gridGenerators[grid_type_index](max); 
        this.grid = this.original_grid.map((row) => {
            return row.map((cell)=> {
                return {
                    ...cell,
                    value: Math.floor(cell.value * max ),
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
        const options = this.calculateNext()
        if(options.length == 0){
            this.jump_count = 0;
            return false;
        }
        if(false)
            this.drawOptions(options);
        if(false)
            this.drawKnight();
        if(true)
            this.drawWeave();
        
        this.rotateWeaveQueue()
        let next_jump_index = this.nextJumpIndex(options);
        this.knight_x = options[next_jump_index].x
        this.knight_y = options[next_jump_index].y
        this.grid[this.knight_x][this.knight_y].value = -1;
        this.jump_count = (this.jump_count + 1) % params.color.domain;
        // this.printWeaveQueue()
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

    setWeaveColors(){
        let col;
        if(!params.color.const){
            let cv = this.jump_count / params.color.domain;
            col = this.color_machine(cv).rgba()
        }
        else{
            col = params.color.const_color
            col = chroma.color(col).rgba()
        }
        col[3] = params.weave.alpha * 255;
        this.graphic.strokeWeight(params.weave.stroke_cell_ratio * this.cell_width);
        this.graphic.stroke(col);
    }

    setOptionsColors(){
        this.graphic.strokeWeight(0);
        // this.graphic.fill(params.weave.stroke_weight);
        let cv = this.jump_count / params.color.domain;
        let col = this.color_machine(1 - cv).rgba()
        col[3] = params.jump_options.alpha * 255;
        col[3] = 150
        this.graphic.fill(col);
    }

    rotateWeaveQueue(){
        this.weave_queue.push({
            x: this.knight_x,
            y: this.knight_y,
        })
        this.weave_queue.shift();
    }

    printWeaveQueue(){
        console.log('weave queue')
        this.weave_queue.forEach((w)=>{
            console.log('x: ',w.x,',y: ',w.y)
        })
    }

    drawKnightLUT = {
        'squares': ()=> {
            this.graphic.rect(
                this.grid[this.knight_x][this.knight_y].x, 
                this.grid[this.knight_x][this.knight_y].y, 
                this.cell_width, 
                this.cell_height
            )
        },
        'bars': ()=> {
            this.graphic.rect(
                this.grid[this.knight_x][this.knight_y].x, 
                this.grid[this.knight_x][this.knight_y].y, 
                this.cell_width, 
                params.canvas.height - this.grid[this.knight_x][this.knight_y].y,
            )
        }
    }

    drawKnight(){
        this.setKnightColors()
        this.drawKnightLUT[params.knight.draw_mode]();
    }
    
    drawWeave(){
        this.setWeaveColors();
        const weave = this.weave_queue.map((cell_index) => {
            return{
                x: this.grid[cell_index.x][cell_index.y].cx,
                y: this.grid[cell_index.x][cell_index.y].cy,
            }
        })
        this.graphic.noFill();
        this.graphic.beginShape()
        SmoothLine(
            weave,
            params.weave.smooth_iters,
            params.weave.smooth_iter_start,
            params.weave.smooth_dist_ratio,   
        ).forEach((v)=>this.graphic.vertex(v.x,v.y));
        this.graphic.endShape();
    }

    drawOptions(options){
        this.setOptionsColors();
        options.map((op) =>{
            if(params.jump_options.shape == 'circle'){
                this.graphic.circle(
                    this.grid[op.x][op.y].cx, 
                    this.grid[op.x][op.y].cy, 
                    this.cell_width * params.jump_options.radius, 
                )
            }
            if(params.jump_options.shape == 'rect'){
                let w = this.cell_width * params.jump_options.radius
                let h = this.cell_height * params.jump_options.radius
                this.graphic.rect(
                    this.grid[op.x][op.y].cx, 
                    this.grid[op.x][op.y].cy, 
                    w - w/2,
                    h - h/2,
                )
            }
        })
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
            }catch{
                
            }
        })
        // console.log('options',options)
        options = options.filter((o)=>o.value != -1)
        return options
    }

}