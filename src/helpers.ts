export var round = (N,acc = 100000) => {
    return Math.round(N * acc) / acc
  }

export function RandReal(min, max, decimalPlaces = 0) {  
    var rand = Math.random()*(max-min) + min;
    var power = Math.pow(10, decimalPlaces);
    return Math.floor(rand*power) / power;
}

export function arrSum(array){
  return array.reduce(
      (sum, num) => sum + (Array.isArray(num) ? arrSum(num) : num * 1),
      0
  );
}

export function SmoothLine(
    line, 
    total_iters, 
    current_iter, 
    dist_ratio,
    lattice = false
  ) {
    if(total_iters == current_iter)
      return line;
    else{
      let sm_line = []
      if(lattice)
        sm_line.push(line[0])
      for (let i = 0; i < line.length - 1; i++) {
        let distance = 
          Math.sqrt(Math.pow(line[i + 1].x - line[i].x, 2) + 
          Math.pow(line[i + 1].y - line[i].y, 2))
        let d = distance * dist_ratio;
        sm_line.push({
          x: line[i].x + (d / distance) * (line[i + 1].x - line[i].x),
          y: line[i].y + (d / distance) * (line[i + 1].y - line[i].y)
        })
        d = distance * (1 - dist_ratio);
        sm_line.push({
          x: line[i].x + (d / distance) * (line[i + 1].x - line[i].x),
          y: line[i].y + (d / distance) * (line[i + 1].y - line[i].y)
        })
      }
      if(lattice)
        sm_line.push(line[line.length - 1])
      return SmoothLine(sm_line, total_iters, current_iter + 1, dist_ratio)
    }
  }
