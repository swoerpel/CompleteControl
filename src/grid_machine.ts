
export class GridMachine {

    constructor() {}

    private filtersLUT = {
        'flip-rows': (grid) => this.flipRows(grid),
        'flip-columns': (grid) => this.flipColumns(grid),
        'invert-values': (grid) => this.invertValues(grid),
    }

    createGrid(options){
        let grid = this.defaultGrid(options.width, options.height);
        switch(options.id){
            case 'ordered': grid = this.ordered(grid); break;
            case 'checker': grid = this.checker(grid); break;
            case 'random': grid = this.random(grid); break;
            case 'modulus': grid = this.modulus(grid,options.max_value); break;
            case 'drop-rows': grid = this.dropRows(grid); break;
            case 'drop-columns': grid = this.dropColumns(grid); break;
        }
        this.print(grid);
        grid = this.normalize(grid)
        options.filters.forEach((filter_id: string) => {
            grid = this.filtersLUT[filter_id](grid);
        })
        return grid;
    }

    private defaultGrid(w,h){
        let grid = [];
        let n = 0;
        for(let i = 0; i < w; i++){
            let row = []
            for(let j = 0; j < h; j++){ 
                row.push({
                    x: i,
                    y: j,
                    index: n++,
                    value: 1,
                })
            }
            grid.push(row)
        }
        return grid
    }

    private ordered(grid){
        return grid.map(row => 
            row.map(cell => 
                {return {...cell, value: cell.index}}
            )
        );
    }

    private checker(grid){
        return grid.map((row) => {
            return row.map((cell) => {
                return {
                    ...cell,
                    value: (cell.x % 2 == 0) ? 
                        (cell.index + 1) % 2 :
                        (cell.index % 2)
                }
            })
        })
    }

    private random(grid){
        return grid.map(row => 
            row.map(cell => 
                {return {...cell, value: this.round(Math.random())}}
            )
        );
    }

    private modulus(grid, mod){
        return grid.map((row) => {
            return row.map((cell) => {
                return {...cell, value: cell.index % mod}
            })
        })
    }

    private dropRows(grid){
        const row_count = grid[0].length;
        const col_count = grid.length;
        const row_widths = new Array(row_count).fill(0)
            .map(() => Math.floor(Math.random() * col_count))
        const new_grid = [];
        for(let i = 0; i < row_count; i++){
            let new_row = []
            for(let j = 0; j < row_count; j++){
                new_row.push({
                    ...grid[j][i],
                    value: (j < row_widths[i]) ? (1 - (j / row_widths[i])) : 0
                })
            }
            new_grid.push(new_row);
        }
        return new_grid;
    }

    private dropColumns(grid){
        const row_count = grid.length;
        const col_heights = new Array(row_count).fill(0)
            .map(() => Math.floor(Math.random() * row_count))
        return grid.map((row,i) => {
            return row.map((cell, j) => {
                let val = 0;
                if(j < col_heights[i]){
                    val = 1 - (j / col_heights[i])
                }
                return {
                    ...cell,
                    value: val
                }
            })
        })
    }


    // filters / transforms
    private normalize(grid){
        let max = -1;
        grid.forEach((row)=>{
            row.forEach((cell) => {
                if(cell.value > max){
                    max = cell.value;
                }
            })
        })
        return grid.map(row => row.map(cell => {
            return {
                ...cell,
                value: this.round(cell.value / max)
            }
        }));
    }

    private flipRows(grid){
        return grid.map((row, i) =>{
            return row.map((cell, j) => {
                return {
                    ...cell,
                    value:(j % 2 == 0) ? 
                        cell.value : 
                        grid[grid.length - 1 - i][j].value
                }
            });
        })
    }

    private flipColumns(grid){
        return grid.map((row, i) =>{
            if(i % 2 == 0)
                return [...row];
            return row.map((cell, j) => {
                return {...cell, value: row[row.length - j - 1].value}
            })
        })
    }

    private invertValues(grid){
        return grid.map((row, i) =>{
            return row.map((cell, j) => {
                return {...cell, value: 1 - cell.value}
            })
        })
    }

    private print(grid){
        console.log(grid.forEach((row)=> console.log(row.map((cell)=>cell.value.toString().padStart(2,'0')).join(' '))))
    }

    round(n,acc = 4){
        return Math.floor(n * (10 * acc)) / (10 * acc)
    }

}