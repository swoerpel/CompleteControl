import * as p5 from 'p5'

import { getColorMachine } from './chromotome';
import { GridMachine } from './grid_machine';

var sketch = function (p: p5) {
  var canvas;
  var graphic;
  var color_machine = getColorMachine('RdBu');

  var pause = false;

  var canvas_params = {
    width: 1200,
    height: 1200,
  }

  var grid_params = {
    width: 9,
    height: 9,
  }

  var cell_width = canvas_params.width / grid_params.width
  var cell_height = canvas_params.height / grid_params.height

  var grid_machine = new GridMachine();
  var grid;

  p.setup = function () {
    setupGraphics();
    const grid_options = {
      id: 'drop-rows',
      width: grid_params.width,
      height: grid_params.height,
      max_value: 3,
      filters:[
        // 'flip-rows',
        'flip-columns',
        // 'invert-values'
      ]
      
    }
    grid = grid_machine.createGrid(grid_options);
  }

  p.draw = function () {
    if(!pause){
      grid.forEach((row) => {
        row.forEach((cell) => {
          const x = scale(cell.x, grid_params.width , canvas_params.width) 
          const y = scale(cell.y, grid_params.height, canvas_params.height)
          graphic.fill(color_machine(cell.value).hex())
          graphic.rect(x,y,cell_width,cell_height)
        })
      })
      p.image(graphic, 0, 0)
    }

  }

  function scale(v, domain, range){
    return v * range / domain;
  }

  function setupGraphics(){
    canvas = p.createCanvas(canvas_params.width, canvas_params.height);
    canvas.background('black')
    graphic = p.createGraphics(canvas_params.width, canvas_params.height)
  }

  p.keyPressed = function (){
    switch(event.key){
      case " ": pause = !pause;
    }
  }
}

new p5(sketch)
