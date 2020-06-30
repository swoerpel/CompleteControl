import * as p5 from 'p5'

import { getColorMachine } from './chromotome';
import { GridMachine } from './grid_machine';

var sketch = function (p: p5) {
  var canvas;
  var graphic;
  var color_machine = getColorMachine('RdBu');

  var pause = false;

  var cw = 1200;
  var ch = 1200;

  var w = 8;
  var h = 8;
  var m = 5;

  var grid_machine = new GridMachine();

  var grid;
  p.setup = function () {
    setupGraphics();
    grid = grid_machine.createGrid(w,h,m);
    console.log('grid',grid)
  }

  p.draw = function () {
    if(!pause){
      grid.forEach((row) => {
        row.forEach((cell) => {
          // console.log(cell)
          const cv = (cell.v % m) / m
          const x = scale(cell.x, w , cw) 
          const y = scale(cell.y, h, ch)
          const dx = cw / w;
          const dy = ch / h;
          console.log(cv)

          graphic.fill(color_machine(cv).hex())

          graphic.rect(x,y,dx,dy)
        })
      })
      image(graphic,0,0)
    }

  }

  function scale(v, domain, range){
    return v * range / domain;
  }

  function setupGraphics(){
    canvas = p.createCanvas(cw, ch);
    canvas.background('black')
    graphic = p.createGraphics(cw, ch)
  }

  p.keyPressed = function (){
    switch(event.key){
      case " ": pause = !pause;
    }
  }
}

new p5(sketch)
