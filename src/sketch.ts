import * as p5 from 'p5'

import {params} from './params'
import { GridMachine } from './grid/grid_machine';
import { GridCell } from './grid/grid_machine.models';
import { getColorMachine } from './chromotome';
import { Weave } from './weave';

var sketch = function (p: p5) {
  var pause = false;
  var canvas;
  var jump = false;
  var auto = false;
  var graphic;
  var color_machine = getColorMachine(params.color.palette);
  var grid_machine = new GridMachine(params.grid.rows,params.grid.cols);
  // var active_grid: GridCell[][] = grid_machine.stripeGrid(60);
  var active_grid: GridCell[][] = grid_machine.wolframGrid();
  var weave: Weave;
  var draw_index = 0;

  p.setup = function () {
    setupGraphics();
    setupWeave();
  }

  function setupWeave(){
    weave = new Weave(graphic, color_machine);
    weave.RefreshGrid([...active_grid]);
    // drawGrid(active_grid)
    p.image(graphic, 0, 0)
  }


  p.draw = function () {
    if(!pause){
      JumpKnight();
      if(true) 
        osscilateStrokeCellRatio();
      p.image(graphic, 0, 0)
      draw_index++;
    }
  }

  function osscilateStrokeCellRatio(){
    if (1 / draw_index < params.weave.smooth_oscillation_frequency){
      params.weave.stroke_cell_ratio += params.weave.stroke_cell_ratio_inc
      if(params.weave.stroke_cell_ratio >= params.weave.stroke_cell_ratio_max)
        params.weave.stroke_cell_ratio = params.weave.stroke_cell_ratio_min
    }
  }

  function JumpKnight(){
    if(auto || jump){
      if(!weave.Jump()){
        console.log("knight trapped")
        // pause = true;
        weave.RefreshGrid([...active_grid]);
        weave.RefreshKnight();
        weave.RefreshWeave();
      }
      jump = false;
    }
  }

  function drawGrid(grid){
    const sw = params.canvas.width / params.grid.cols * 0.05;
    grid.forEach((row) => {
      row.forEach((cell) => {
        const cv = cell.value
        const x = scale(cell.x, params.grid.rows, params.canvas.width) 
        const y = scale(cell.y, params.grid.cols, params.canvas.height)
        const dx = params.canvas.width / params.grid.rows;
        const dy = params.canvas.height / params.grid.cols;
        graphic.strokeWeight(sw)
        graphic.stroke(color_machine(cv).hex())
        // graphic.fill(color_machine(cv).hex())
        graphic.noFill();
        graphic.rect(x + sw/2,y + sw/2,dx - sw,dy - sw)
        // graphic.fill(color_machine(1-cv).hex())
        // graphic.circle(x+dx/2,y+dy/2,dx)
        // graphic.fill(color_machine(cv).hex())
        // graphic.circle(x+dx/2,y+dy/2,dx / Math.sqrt(2))
      })
    })
  }

  function scale(v, domain, range){
    return v * range / domain;
  }

  function setupGraphics(){
    canvas = p.createCanvas(params.canvas.width, params.canvas.height);
    canvas.background(params.color.background)
    graphic = p.createGraphics(params.canvas.width, params.canvas.height)
  }

  p.keyPressed = function (){
    switch(event.key){
      case " ": pause = !pause; break;
      // case "1": active_grid = grid_machine.randomGrid(); break;
      // case "2": active_grid = grid_machine.orderedDomainGrid(); break;
      // case "3": active_grid = grid_machine.orderedSequenceGrid(); break;
      // case "4": active_grid = grid_machine.stripeGrid(); break;
      // case "w": active_grid = grid_machine.wolframGrid(4); break;
      case "a": auto = !auto; break;
      case "j": jump = true; break;
    }
    
  }
  
  
}

new p5(sketch)
