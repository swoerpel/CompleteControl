
export class GridMachine {

    constructor() {}

    createGrid(w,h,m){
        let grid = [];
        let n = 0;
        for(let i = 0; i < w; i++){
            let row = []
            for(let j = 0; j < h; j++){ 
                row.push({
                    x: i,
                    y: j,
                    v: n++,
                })
            }
            grid.push(row)
        }
        return grid
    }
}