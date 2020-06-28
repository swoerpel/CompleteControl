let len = 2400;
export var params = {
  canvas: {
    width: len,
    height:len,
  },

  grid:{
    rows: 12,
    cols: 12,
    cell:{
      population:'ordered',
      domain:{
        min: 4,
        max: 16,
      }
    }
  },

  knight:{
    start:'random',
    jump:{
      x: 1,
      y: 1,

      // only toggle knight jump on
      min_x: 2,
      min_y: 1,

      max_x: 4,
      max_y: 4,
    },
    toggle_jump_frequency: 0.01,
    alpha: .1,
    draw_mode: 'bars',
    stroke_cell_ratio: 0.05,
    stroke: 'black'
  },

  weave:{
    grid_type: 'wolfram',
    queue_length: 8,
    smooth_oscillation_frequency: 1000,
    smooth_iters: 8,
    smooth_iter_start: 0,
    
    smooth_dist_ratio: .25,
    alpha: 1,
    stroke_cell_ratio: .25,
    stroke_cell_ratio_min: .25,
    stroke_cell_ratio_max: 1.01,
    stroke_cell_ratio_inc: .25,

    stroke_cell_oscillation_frequency: 0.03,
  },

  jump_options:{
    alpha: 0.05,
    shape: 'circle',
    radius: 0.25,
  },


  color: {
    const: false,
    const_color: 'white',
    // palette: 'hilda02',
    palette: 'tundra4',
    // palette: 'winter-night',
    // palette: 'cc232',
    // palette: 'RdBu',
    // palette: 'Viridis',
    // palette: 'Spectral',
    // palette: 'lemon_citrus',
    // palette: ['black','white','darkorange','purple'],
    domain: 20,
    background:'black',
  },
}

