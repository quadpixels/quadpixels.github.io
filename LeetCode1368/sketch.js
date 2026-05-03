// author: https://leetcode.com/quadpixels/
// 2020-03-01

let g_autorun = true;
let g_frame_count = 0;

var datasets = [
  [[1,1,1,1],[2,2,2,2],[1,1,1,1],[2,2,2,2]],
  [[1,1,3],[3,2,2],[1,1,4]],
  [[1,2],[4,3]],
  [[2,2,2],[2,2,2]],
  [[3,4,3],[2,2,2],[2,1,1],[4,3,2],[2,1,4],[2,4,1],[3,3,3],[1,4,2],[2,2,1],[2,1,1],[3,3,1],[4,1,4],[2,1,4],[3,2,2],[3,3,1],[4,4,1],[1,2,2],[1,1,1],[1,3,4],[1,2,1],[2,2,4],[2,1,3],[1,2,1],[4,3,2],[3,3,4],[2,2,1],[3,4,3],[4,2,3],[4,4,4]],
]

let grid_vis = {
  rt: undefined,
  dirty: true,
  
  highlight_rt: undefined,
  highlight_dirty: true,
  
  grid_size: 10,
  x: 16,
  y: 16,
  pad: 3,
}

function RenderGrid(grid) {
  grid_vis.rt.clear();
  let grid_size = 80;
  const w = grid[0].length, h = grid.length;
  while (grid_size * w > grid_vis.rt.width || grid_size * h > grid_vis.rt.height)
    grid_size =  Math.floor(grid_size / 1.2);
  grid_vis.grid_size = grid_size;
  for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
      grid_vis.rt.stroke(0); grid_vis.rt.noFill();
      const dx = x * grid_size + grid_vis.pad,
            dy = y * grid_size + grid_vis.pad;
      grid_vis.rt.rect(dx, dy, grid_size, grid_size);
      grid_vis.rt.noFill();
      grid_vis.rt.strokeWeight(2);
      switch (grid[y][x]) {
        case 1: {// right arrow
          grid_vis.rt.stroke(255, 0, 0);
          grid_vis.rt.line(dx + grid_size * 0.2, dy + grid_size * 0.5,
                           dx + grid_size * 0.8, dy + grid_size * 0.5);
          grid_vis.rt.line(dx + grid_size * 0.8, dy + grid_size * 0.5,
                           dx + grid_size * 0.6, dy + grid_size * 0.3);
          grid_vis.rt.line(dx + grid_size * 0.8, dy + grid_size * 0.5,
                           dx + grid_size * 0.6, dy + grid_size * 0.7);
          break;
        }
        case 2: { // left arrow
          grid_vis.rt.stroke(64, 15, 15);
          grid_vis.rt.line(dx + grid_size * 0.2, dy + grid_size * 0.5,
                           dx + grid_size * 0.8, dy + grid_size * 0.5);
          grid_vis.rt.line(dx + grid_size * 0.2, dy + grid_size * 0.5,
                           dx + grid_size * 0.4, dy + grid_size * 0.3);
          grid_vis.rt.line(dx + grid_size * 0.2, dy + grid_size * 0.5,
                           dx + grid_size * 0.4, dy + grid_size * 0.7);
          break;
        }
        case 3: { // down arrow
          grid_vis.rt.stroke(0, 0, 255);
          grid_vis.rt.line(dx + grid_size * 0.5, dy + grid_size * 0.2,
                           dx + grid_size * 0.5, dy + grid_size * 0.8);
          grid_vis.rt.line(dx + grid_size * 0.5, dy + grid_size * 0.8,
                           dx + grid_size * 0.3, dy + grid_size * 0.6);
          grid_vis.rt.line(dx + grid_size * 0.5, dy + grid_size * 0.8,
                           dx + grid_size * 0.7, dy + grid_size * 0.6);
          break;
        }
        case 4: { // up arrow
          grid_vis.rt.stroke(255, 128, 192);
          grid_vis.rt.line(dx + grid_size * 0.5, dy + grid_size * 0.2,
                           dx + grid_size * 0.5, dy + grid_size * 0.8);
          grid_vis.rt.line(dx + grid_size * 0.5, dy + grid_size * 0.2,
                           dx + grid_size * 0.3, dy + grid_size * 0.4);
          grid_vis.rt.line(dx + grid_size * 0.5, dy + grid_size * 0.2,
                           dx + grid_size * 0.7, dy + grid_size * 0.4);
          break;
        }
      }
      grid_vis.rt.strokeWeight(1);
    }
  }
}

class Question4Sim {
  constructor() {
    this.STRIDE = 100000;
    this.Reset();
  }
  ToIdx(x, y) { return y*this.STRIDE + x; }
  FromIdx(idx) { return [Math.floor(idx % this.STRIDE), Math.floor(idx/this.STRIDE)];}
  
  // ConveyorStep() computes "which grids are able to reach this.visited"
  ConveryorStep() {
    while (true) {
      let updated = new Set([]);
      Object.keys(this.visited).forEach((key) => {
        let p = this.FromIdx(key);
        
      });
    }
  }
  
  Step() {
    if (this.status == "conveyor") {
      let frontier = new Set(Object.keys(this.visited));
      while (frontier.size > 0) {
        let frontier_next = new Set([]);
        frontier.forEach((key) => {
          const dx = [ -1,0,1,0 ], dy = [ 0,-1,0,1 ], color = [ 1,3,2,4 ];
          const p = this.FromIdx(key);
          for (let i=0; i<4; i++) {
            let nx = p[0] + dx[i], ny = p[1] + dy[i], nk = this.ToIdx(nx, ny);
            if (nx >= 0 && ny >= 0 && nx < grid[0].length && ny < grid.length) {
              if ((nk in this.visited) == false &&
                  grid[ny][nx] == color[i]) {
                frontier_next.add(nk);
                this.visited[nk] = this.step;
              }
            }
          }
        });
        frontier = frontier_next;
      }
      grid_vis.highlight_dirty = true;
      if (0 in this.visited) {
        this.status = "finished";
      } else {
        this.status = "expand";
      }
    } else if (this.status == "expand") {
      this.step ++;
      Object.keys(this.visited).forEach((key) => {
        const p = this.FromIdx(key);
        const dx = [ -1,0,1,0 ], dy = [ 0,-1,0,1 ];
        for (let i=0; i<4; i++) {
          let nx = p[0]+dx[i], ny = p[1]+dy[i], nk = this.ToIdx(nx, ny);
          if (nx >= 0 && ny >= 0 && nx < grid[0].length && ny < grid.length) {
            if ((nk in this.visited) == false) {
              this.visited[nk] = this.step;
            }
          }
        }
      });
      grid_vis.highlight_dirty = true;
      this.status = "conveyor";
    }
    
    this.Render(grid_vis.highlight_rt);
  }
  
  Render(rt) {
    rt.clear();
    
    // Next Status
    if (this.status == "conveyor") { 
      rt.fill(255, 255, 0, 120);
    } else if (this.status == "expand") {
      rt.fill(0, 255, 255, 120);
    }
    Object.keys(this.visited).forEach((key) => {
      let p = this.FromIdx(key);
      const dx = grid_vis.pad + grid_vis.grid_size * p[0],
            dy = grid_vis.pad + grid_vis.grid_size * p[1];
      rt.noStroke();
      rt.rect(dx, dy, grid_vis.grid_size, grid_vis.grid_size);
    })
  }
  
  Reset() {
    this.step = 0;
    const x = grid[0].length-1, y = grid.length-1;
    const idx = this.ToIdx(x, y);
    this.frontier = new Set([this.ToIdx(x,y)]);
    this.visited = {}
    this.visited[idx] = 1
    this.status = "conveyor"
    this.Render(grid_vis.highlight_rt);
  }
  
  UpdateDesc() {
    if (this.status == "conveyor") {
      
    }
  }
  
  GetStatusString() {
    if (this.status == "finished") {
      return "Cost=" + this.step + ", algorithm completed!" 
    } else {
      return "Cost=" + this.step + ", " + Object.keys(this.visited).length + " cells can reach the exit";
    }
  }
}

function LoadDataset(g) {
  grid = g;
  grid_vis.dirty = true;
  q4sim.Reset();
  grid_vis.highlight_dirty = true;
}

// I'm doing an eval() here. Use at your own risk! :P
function LoadCustomTestcase() {
  grid = eval(custom_testcase_input.value())
  grid_vis.dirty = true;
  q4sim.Reset();
  grid_vis.highlight_dirty = true;
}

function Randomize() {
  let w = 1 + Math.floor(Math.random() * 22);
  let h = 1 + Math.floor(Math.random() * 22);
  grid = [];
  let str = ""
  for (let y=0; y<h; y++) {
    let line = [];
    for (let x=0; x<w; x++) {
      line.push(Math.floor(Math.random() * 4) + 1)
    }
    grid.push(line);
    str = str + line.join(",")
  }
  custom_testcase_input.value("[["+grid.join("],[")+"]]")
  grid_vis.dirty = true;
  q4sim.Reset();
  grid_vis.highlight_dirty = true;
}

var custom_testcase_input;
var grid = datasets[0];
const W = 800, H = 600;
let q4sim = undefined
function setup() {
  textSize(16);
  createCanvas(W, H);
  grid_vis.rt           = createGraphics(W/2-32, H-32);
  grid_vis.highlight_rt = createGraphics(W/2-32, H-32);
  let btn_step = createButton("Execute Step");
  btn_step.position(width/2, 170);
  btn_step.mousePressed(function() {
    q4sim.Step();
  });
  let btn_reset = createButton("Reset");
  btn_reset.position(width/2 + 280, 170);
  btn_reset.mousePressed(function() {
    q4sim.Reset();
  });
  q4sim = new Question4Sim()
  
  for (let i=0; i<datasets.length; i++) {
    let x = width/2 + 340 * i / datasets.length, y = 270;
    let btn = createButton("Input " + (i+1));
    btn.position(x, y);
    btn.mousePressed(function() {
      LoadDataset(datasets[i]);
    });
  }
  
  custom_testcase_input = createElement("textarea", "[[1,2],[3,4]]");
  custom_testcase_input.size(320, 50);
  custom_testcase_input.position(width/2, 340)
  let btn_load = createButton("Load");
  btn_load.position(width/2, 400)
  btn_load.mousePressed(LoadCustomTestcase);
  
  let btn_randomize = createButton("Randomize");
  btn_randomize.position(width/2 + 200, 400);
  btn_randomize.mousePressed(Randomize);
  
  let anchor = createA("https://leetcode.com/contest/weekly-contest-178/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/", "Link to Problem")
  anchor.position(width/2, 530)
}


function draw() {
  if (g_frame_count == 0) {
    if (g_autorun) { AutoRunStep(); }
  }
  g_frame_count ++;
  
  if (grid_vis.dirty) {
    grid_vis.dirty = false;
    RenderGrid(grid);
  }
  if (grid_vis.highlight_dirty) {
    grid_vis.highlight_dirty = false;
    q4sim.Render(grid_vis.highlight_rt);
  }
  background(220);
  image(grid_vis.highlight_rt, grid_vis.x, grid_vis.y);
  image(grid_vis.rt,           grid_vis.x, grid_vis.y);
  textAlign(LEFT, TOP);
  
  const dx = width / 2, y0 = 40, y1 = 90, y2 = 140
  fill(66, 66, 66);
  rect(dx-32, y0-28, width-dx-8, y2-y0+20);
  rect(dx-32, y2-4, width-dx-8, 70);
  fill(160);
  text("What will happen in the current step:", dx, y0-24)
  fill(255, 255, 0);
  text("Find which cells may reach current set of cells\n" +
       "via existing arrows", dx, y0);
  fill(0, 255, 255);
  text("Find which cells may reach current set of cells\n" +
       "by changing 1 neighboring arrow", dx, y1);

  textAlign(RIGHT, TOP);
  fill(255)
  if (q4sim.status == "conveyor") {
    text("→ ", dx, y0);
  } else if (q4sim.status == "expand") {
    text("→ ", dx, y1);
  }
  
  textAlign(LEFT, TOP);
  if (q4sim.status == "finished") { fill(0, 255, 0); }
  text(q4sim.GetStatusString(), dx, y2+3)
  fill(255);
  
  // Input selection region
  fill(128)
  rect(dx-32, 240, width-dx-8, 200)
  fill(255)
  text("Load input:", dx, 250)
  text("Custom Testcase:", dx, 320)
  
  fill(160);
  rect(dx-32, 470, width-dx-8, 100);
  fill(255)
  text("1368. Minimum Cost to Make at Least One Valid\nPath in a Grid", dx, 490)
  
  if (g_autorun) {
    noStroke();
    fill(0, 0, 255);
    textAlign(LEFT, BOTTOM);
    text("Autorun mode. Press any key or click anywhere to cancel.", 8, height-8);
  }
}

function AutoRunStep() {
  if (!g_autorun) { return; }
  else {
    let done = false;
    let delay = 900;
    if (q4sim.status == "finished") {
      delay = 3000;
      done = true;
    }
    
    setTimeout(() => {
      if (!done) {
        q4sim.Step();
      } else {
        Randomize();
      }
      AutoRunStep();
    }, delay);
  }
}

function keyPressed() {
  if (key == 'a') {
    g_autorun = true;
    AutoRunStep();
  }
}

function mousePressed() {
  g_autorun = false;
}