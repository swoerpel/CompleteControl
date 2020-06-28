import { GridCell, Domain } from "./grid_machine.models";
import { Wolfram } from "./wolfram/wolfram";
import { WolframParams } from "./wolfram/models/wolfram_params.model";

export class GridMachine {

    scale_factor: number;
    grid_request_count = 0;

    constructor(
        private rows: number,
        private cols: number
    ) { 
        this.scale_factor = Math.sqrt(this.rows * this.rows + this.cols * this.cols)
    }

    public orderedGrid(){
        return this.generateGrid().map((row) => {
            return row.map((cell) => {
                return {...cell, value: 1-cell.index / (this.rows * this.cols)}
            })
        })
    }


    public randomGrid(){
        return this.generateGrid().map((row) => {
            return row.map((cell) => {
                return {...cell, value: Math.random()}
            })
        })
    }

    public orderedDomainGrid(max){
        const max_value = this.getRandDomain(max).max + 1
        return this.generateGrid().map((row) => {
            return row.map((cell) => {
                return {...cell, value: (cell.index % max_value) / max_value}
            })
        })
    }

    public orderedSequenceGrid(mod_value = this.grid_request_count){
        return this.generateGrid().map((row) => {
            return row.map((cell) => {
                return {...cell, value: (cell.index % (2 + mod_value)) / (2 + mod_value)}
            })
        })
    }

    public stripeGrid(max){
        const domain = this.getRandDomain(max)
        return this.generateGrid().map((row) => {
            return row.map((cell) => {
                let value = cell.index % (domain.max + 1) + domain.min;
                if(value > domain.max)
                    value = domain.min + cell.index % domain.max
                return {
                    ...cell,
                    value: value / (domain.min + domain.max - 1),
                }
            })
        })
    }

    public wolframGrid(base = 4){
        let wolfram_params: WolframParams = {
            base:base,
            kernel: 'B',
            grid:{
                width: this.cols,
                height: this.rows
            },
            init_row:{
                mode: 'random',
                group_size: 1,
            }
        }
        let wolfram = new Wolfram(wolfram_params)
        wolfram.Initialize()
        const grid = this.generateGrid()
        for(let i = 0; i < this.rows; i++){
            wolfram.generateRow().forEach((value, j) => {
                grid[i][j].value = value / base;
            })
        }
        return grid
    }

    private generateGrid(){
        const grid: GridCell[][] = [];
        let index = 0;
        for(let i = 0; i < this.rows; i++){    
            let row = [];
            for(let j = 0; j < this.cols; j++){

                const cell: GridCell = {
                    index: index++,
                    x: i,
                    y: j,
                    value: 0
                }
                row.push(cell)
            }
            grid.push(row);
        }
        this.grid_request_count++;
        return grid;
    }

    private getRandDomain(max = this.scale_factor): Domain{
        let r1 = Math.floor(Math.random() * max) + 1
        let r2 = Math.floor(Math.random() * max) + 1
        if(r1 == r2){
            r1 += 1
            r2 -= 1
        }
        return (r1 > r2) ? {min: r2, max: r1} : {min: r1, max: r2}
    }
}