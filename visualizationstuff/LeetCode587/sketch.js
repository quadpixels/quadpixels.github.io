// 2021-09-04
// Testing emscripten
// Emscripten-compiled C++ generates trace
// P5.js script renders trace
var g_data = [];

// [ [dx, dy], [px, py] ]
var g_trace = [];

// Highlight the scanning process
var g_trace2 = [];
var g_trace2_line = [];

// Which step is currently being visualized
var g_idx = 0;

var g_animator;

// 0: Find furthest point along the (-1,0) direction
// 1: Find the point reachable by rotating the least angle counter-clockwise
// 2: Go to the point
// 3: Finished
let g_algo_state = 0;

let graph0;

// Coordinate applies to both graph0 and canvas
let max_x = 0, max_y = 0;
const PAD = 20;

// Draw safe dist
// How many px can one draw outside the viewport
const DRAW_SAFE_DIST = 400

function PointXYToCanvasXY(pt) {
  const dx = map(pt[0], 0, max_x, PAD, graph0.width-PAD);
  const dy = map(pt[1], 0, max_y, PAD, graph0.height-PAD);
  return [dx, dy];
}

// Assume normalized
function GetTheta(dx, dy) {
  let len = sqrt(dx*dx + dy*dy);
  if (len == 0) return 0;
  dx /= len;
  let theta = acos(dx);
  if (dy < 0) theta = 2*PI - theta;
  return theta;
}

function SetInputData(d) {
  graph0.clear();
  max_x = 0; max_y = 0;
  graph0.push();
  graph0.fill(128);
  graph0.stroke(192);
  d.forEach((pt) => {
    max_x = max(max_x, pt[0]);
    max_y = max(max_y, pt[1]);
  });
  
  // Square shape
  max_x = max(max_x, max_y);
  max_y = max(max_x, max_y);
  
  d.forEach((pt) => {
    let dxdy = PointXYToCanvasXY(pt);
    graph0.circle(dxdy[0], dxdy[1], 10);
  });
  graph0.pop();
  
  g_algo_state = 0
}

const W = 640, H = 480, H1 = 400;

var g_game_objects = [];
let g_curr_cursor;
let g_extent_viz;

// (norm_x, norm_y) must be normalized
function DrawMyLine(norm_x, norm_y, prod) {
  let x0 = - prod * norm_x, y0 = - prod * norm_y;
  let L = 1000;
  let x1 = x0 + norm_y * L, y1 = x0 - norm_x * L;
  let x2 = x0 - norm_y * L, y2 = x0 + norm_x * L;
  
  let drawxy1 = PointXYToCanvasXY([x1,y1]);
  let drawxy2 = PointXYToCanvasXY([x2,y2]);
  
  // Todo: clip to rect
  line(drawxy1[0], drawxy1[1], drawxy2[0], drawxy2[1]);
}

const HIGHLIGHT_DURATION = 800;
// "Game Objects" for various kinds of visualization
class ExtentViz {
  constructor(dx, dy) {
    this.duration = 1000; // ms
    this.elapsed = 0;
    this.done = false;
    let len = sqrt(dx*dx + dy*dy);
    this.dx = dx/len;
    this.dy = dy/len;
    this.projmin = 1e20;
    this.projmax = -1e20;
    
    const X_PAD_SCALE = 1.8;
    const maxx1 = -(width - graph0.width)/2 * max_x / graph0.width * X_PAD_SCALE;
    const maxx2 = max_x + (width - graph0.width)/2 * max_x / graph0.width * X_PAD_SCALE;
    
    let pts = [
      new p5.Vector(maxx1, 0),
      new p5.Vector(maxx1, max_y),
      new p5.Vector(maxx2, max_y),
      new p5.Vector(maxx2, 0)
    ];
    //let projmin = 1e20, idx = -1;
    let i = 0;
    pts.forEach((p) => {
       let prod = p.dot(new p5.Vector(dx, dy));
       if (prod < this.projmin) {
         this.projmin = prod;
       }
       if (prod > this.projmax) {
         this.projmax = prod;
       }
    });
    this.last_proj = this.projmin;
    this.highlights = {}
  }
  step(ms) {
    const last_elapsed = this.elapsed;
    this.elapsed += ms;
    
    // Create cursor as soon as line ends
    if (this.elapsed >= this.duration && last_elapsed < this.duration) {
      let t0 = g_trace[0];
      g_curr_cursor = new CurrCursor(t0[1][0], t0[1][1], PI/2);
      g_game_objects.push(g_curr_cursor);
    }
    
    let hl_next = {};
    Object.keys(this.highlights).forEach((k) => {
      const val = this.highlights[k] - ms;
      if (val > 0) {
        hl_next[k] = val;
      }
    });
    this.highlights = hl_next;
    if (this.elapsed > this.duration) {
      if (Object.keys(this.highlights) == 0) {
        this.done = true;
      }
    }
  }
  render() {
    this.completion = constrain(this.elapsed / this.duration, 0, 1);
    push();
    noFill();
    stroke("#3ff");
    const proj = lerp(this.projmin, this.projmax, this.completion);
    
    // Register new highlights
    let idx = 0;
    g_data.forEach((p) => {
      const pp = this.dx*p[0] + this.dy*p[1];
      if (pp < proj && pp >= this.last_proj) {
        this.highlights[idx] = HIGHLIGHT_DURATION;
      }
      idx += 1;
    });
    
    if (this.elapsed <= this.duration) {
      this.last_proj = proj;
      DrawMyLine(this.dx, this.dy, -proj);
    }
    
    // Draw highlights
    noStroke();
    Object.keys(this.highlights).forEach((idx) => {
      let p = g_data[idx];
      let alpha = this.highlights[idx] / HIGHLIGHT_DURATION;
      alpha = 1-(1-alpha)*(1-alpha);
      fill('rgba(255,255,125,' + alpha + ')');
      let dxy = PointXYToCanvasXY(p);
      circle(dxy[0], dxy[1], 10);
    });
    
    pop();
  }
}

class CurrCursor {
  constructor(x, y, theta) {
    this.pos = new p5.Vector(x, y);
    this.theta = { value: theta };  // Ugly :(
    this.done = false;
  }
  step(ms) {
    
  }
  render() {
    push();
    stroke("#3fc");
    fill("#3ca");
    
    const theta = this.theta["value"];
    let dx = cos(theta), dy = sin(theta);
    let x = this.pos.x, y = this.pos.y;
    let disp_xy = PointXYToCanvasXY([x, y]);
    circle(disp_xy[0], disp_xy[1], 10);
    
    // Clamp to appropriate location
    const GRID_SIZE = 3
    if (abs(dy) < 0.707) {
      // Align along X axis
      let x_aligned = 0;
      let xbrk = parseInt((x - x_aligned) / (4 * dx) + 1);
      x_aligned = x_aligned + 4*dx*xbrk;
      let y_aligned = y + (x_aligned - x) * dy / dx;
      x = x_aligned; y = y_aligned;
    } else {
      // Align along Y axis
      let y_aligned = 0;
      let ybrk = parseInt((y - y_aligned) / (4 * dy) + 1);
      y_aligned = y_aligned + 4*dy*ybrk;
      let x_aligned = x + (y_aligned - y) * dx / dy;
      x = x_aligned; y = y_aligned;
    }
    
    for (let i=0; i<1000; i++) { // Draw at most 1000 points
      let disp_xy = PointXYToCanvasXY([x, y])
      strokeWeight(2);
      point(disp_xy[0], disp_xy[1]);
      if (disp_xy[0] < -DRAW_SAFE_DIST || disp_xy[0] > width+DRAW_SAFE_DIST ||
          disp_xy[1] < -DRAW_SAFE_DIST || disp_xy[1] > height+DRAW_SAFE_DIST) break;
      x += dx * 4;
      y += dy * 4;
    }
    pop();
  }
}

const HL_DURATION = 800;
class HighlightedLine {
  constructor(x0, y0, x1, y1, t0) {
    this.elapsed = 0;
    this.t0 = t0;
    this.p0 = [x0,y0];
    this.p1 = [x1,y1];
    this.done = false;
  }
  step(ms) {
    this.elapsed += ms;
    if (this.elapsed > this.t0 + HL_DURATION) {
      this.done = true;
    }
  }
  render() {
    if (this.elapsed > this.t0) {
      const t0t1 = this.elapsed - this.t0;
      let completion = constrain((t0t1 - this.t0) / HL_DURATION, 0, 1);
      if (completion > 0 && completion < 1) {
        push();
        const alpha = 1-completion;
        stroke('rgba(255,255,0,' + alpha + ')');
        const dxdy0 = PointXYToCanvasXY(this.p0);
        const dxdy1 = PointXYToCanvasXY(this.p1);
        line(dxdy0[0], dxdy0[1], dxdy1[0], dxdy1[1]);
        pop();
      }
    }
  }
}

let g_button_input;
let g_button_autorun;
let g_button_step_fwd;
let g_button_step_back;

function setup() {
  g_animator = new Animator();
  createCanvas(W, H);
  graph0 = createGraphics(H1, H1);
  const data0 = [];
  SetInputData(data0);
  g_button_input = createButton("Generate Input");
  g_button_input.position(11, 8);
  g_button_input.mousePressed(RandomizeInput);
  
  g_button_autorun = createButton("Toggle Autorun");
  g_button_autorun.position(32, H-24);
  g_button_autorun.mousePressed(ToggleAutorun);
  
  g_button_step_fwd = createButton("Step Fwd >>");
  g_button_step_fwd.position(270, H-24);
  g_button_step_fwd.mousePressed(()=>{
    PanTrace(1);
  });
  
  g_button_step_back = createButton("<< Step Back");
  g_button_step_back.position(160, H-24);
  g_button_step_back.mousePressed(()=>{
    PanTrace(-1);
  });

}

let g_frame_count = 0;
function draw() {
  
  if (g_frame_count == 0) {
    ccall("RunSolution", 'number', ['number'], [6]);
    RestartViz();

    ToggleAutorun();
  }
  
  background(32);
  
  push();
  
  let tx = (width - graph0.width)/2;
  let ty = (height- graph0.height)/2;
  translate(tx, ty, 0);
  image(graph0, 0, 0);
  
  stroke('#3cc');
  const N = g_trace.length;
  fill('#0ff');
  if (N != undefined && N > 0) {
    // All the lines up to the last ...
    for (let i=0; i<g_idx-1; i++) {
      const dxdy = PointXYToCanvasXY(g_trace[i][1]);
      const dxdy1 = PointXYToCanvasXY(g_trace[(i+1) % N][1]);
      line(dxdy[0], dxdy[1], dxdy1[0], dxdy1[1]);
    }
    
    // The last line.
    if (g_idx > 0 && g_curr_cursor != undefined) {
      const dxdy0 = PointXYToCanvasXY(g_trace[g_idx-1][1]);
      const dxdy1 = PointXYToCanvasXY([g_curr_cursor.pos.x, g_curr_cursor.pos.y]);
      line(dxdy0[0], dxdy0[1], dxdy1[0], dxdy1[1]);
    }
    
    for (let i=0; i<=g_idx; i++) {
      const dxdy = PointXYToCanvasXY(g_trace[i][1]);
      circle(dxdy[0], dxdy[1], 10);
    }
    
    /*
    push();
    stroke('#3ff');
    strokeWeight(2);
    let xy = g_trace[g_idx][1];
    let dxdy = g_trace[g_idx][0];
    let dx = dxdy[0], dy = dxdy[1];
    let len = sqrt(dx*dx + dy*dy);
    dx /= len; dy /= len;
    let x = xy[0], y = xy[1];
    for (let i=0; i<1000; i++) { // Draw at most 1000 points
      let disp_xy = PointXYToCanvasXY([x, y])
      point(disp_xy[0], disp_xy[1]);
      if (disp_xy[0] < 0 || disp_xy[0] > width ||
          disp_xy[1] < 0 || disp_xy[1] > height) break;
      x += dx * 1;
      y += dy * 1;
    }
    pop();
    */
  }
  
  let game_objects_next = [];
  for (let i=0; i<g_game_objects.length; i++) {
    g_game_objects[i].step(deltaTime);
  }
  g_game_objects.forEach((o) => {
    o.render();
    if (!o.done) {
      game_objects_next.push(o);
    }
  });
  g_game_objects = game_objects_next;
  
  stroke('#3FF');
  //DrawMyLine(0.707, 0.707, 30);
  pop();
  
  push();
  textAlign(LEFT, TOP);
  noStroke();
  fill("#3ff");
  text("Step " + (g_idx+1) + "/" + N, 1, 32);
  
  textAlign(LEFT, TOP);
  if (g_autorun) {
    fill("#ff3");
    text("Autorun", 1, 48);
  }
  
  textAlign(RIGHT, BOTTOM);
  if (IsAllAnimationFinished() == false) {
    fill("#080");
    text("Animating", width-1, height-1);
  }
  
  textAlign(LEFT, TOP);
  tx = 160;
  const algocolors = [
    '#ccc',
    '#ff8',
    '#8ff',
    '#ccc',
  ];
  const algosteps = [
     "1. Find furthest point along the (-1,0) direction",
     "2. Find the point reachable by rotating the least angle counter-clockwise",
     "3. Go to the point",
     "4. Finished"
  ];
  for (let i=0; i<4; i++) {
    let dy = 2+i*13;
    fill(algocolors[i]);
    text(algosteps[i], tx, dy);
  }
  fill(192);
  if (g_algo_state >= 0 && g_algo_state <= 3) {
    textAlign(RIGHT, TOP);
    text("-->", tx, 2+g_algo_state*13);
  }
  
  pop();
  
  g_animator.Update();
  
  
  g_frame_count ++;
}

function ShouldStartStep0() {
  if (g_idx == 0 && (g_extent_viz == undefined)) {
    return true;
  } else return false;
}

function StartStep0() {
  if (g_extent_viz == undefined || g_extent_viz.done) {
    g_curr_cursor = undefined;
    g_game_objects = []
    g_extent_viz = new ExtentViz(-1, 0);
    g_game_objects.push(g_extent_viz);
  }
}

function ClearAllTimers() {
  // Cancel all timeouts
  // https://stackoverflow.com/questions/8860188/javascript-clear-all-timeouts
  var id = window.setTimeout(function() {}, 0);
  while (id--) {
    window.clearTimeout(id); // will do nothing if no timeout with id is present
  }
}

function RestartViz() {
  ClearAllTimers();
  
  g_animator.FinishAllPendingAnimations();
  g_autorun = false;
  g_game_objects = []
  g_curr_cursor = undefined
  g_extent_viz = undefined
  g_idx = 0
}

function PanTrace(delta) {
  const N = g_trace.length;
  let old_idx = g_idx;
  let changed = false;
  let duration = 0;
  if (ShouldStartStep0()) {
    StartStep0();
    g_algo_state = 0;
    return;
  } else {
    g_idx = (g_idx + delta + N) % N;
    changed = true;
  }
  duration = 0;
  scan_delay = 20;
  if (delta > 0) {
    duration = 700;
    let deduct = g_idx-1;
    if (deduct >= N-2) {
      deduct = 1;
    }
    deduct = min(deduct, 5);
    if (deduct < 0) deudct = 0;
    duration = duration * exp(-deduct/5);
    scan_delay = scan_delay * exp(-deduct/5);
    
    g_algo_state = 1
    if (g_idx == 0 && old_idx == N-1) {
      g_algo_state = 3;
    }
  }
  if (changed) {
    const p = g_trace[g_idx];
    if (g_curr_cursor != undefined) {
      if (g_animator.FinishAllPendingAnimations()) {
        duration = 0; // Fast forward
      }
      
      let tot_scan_delay = 200;
      if (delta > 0 && g_idx > 0) {
        let i = 0;
        g_trace2[(g_idx-1+N)%N].forEach((cand) => { // g_idx 比较混乱
          let hl_line = new HighlightedLine(g_curr_cursor.pos.x,
            g_curr_cursor.pos.y, cand[0], cand[1], i*scan_delay*0.9);
          g_game_objects.push(hl_line);
          i++;
          tot_scan_delay += scan_delay;
        });
      }
      
      g_animator.Update();
      g_animator.Animate(g_curr_cursor, "pos", "x", 
          [g_curr_cursor.pos.x, g_curr_cursor.pos.x, p[1][0]], 
          [0, tot_scan_delay+duration, tot_scan_delay+2*duration]);
      g_animator.Animate(g_curr_cursor, "pos", "y",
          [g_curr_cursor.pos.y, g_curr_cursor.pos.y, p[1][1]],
          [0, tot_scan_delay+duration, tot_scan_delay+2*duration], ()=>{
            if (g_idx == N-1) {
              g_algo_state = 3;
            } else {
              g_algo_state = 1;
            }
          });
      
      
      // 动画只能顺时什，所以补齐
      let t0 = g_curr_cursor.theta["value"];
      let t1 = GetTheta(p[0][0], p[0][1]);
      while (t0 < t1) {
        t0 += 2*PI;
      }
      g_animator.Animate(g_curr_cursor, "theta","value", [t0, t0, t1], 
        [0, tot_scan_delay, tot_scan_delay+duration], ()=>{
        if (g_idx == N-1) {
          g_algo_state = 3;
        } else {
          g_algo_state = 2;
        }
      });
    }
  }
}

var g_autorun = false;
function AutorunCallback() {
  if (g_autorun) {
    
    // Do not early-finish any animation
    if (!IsAllAnimationFinished()) {
      setTimeout(()=>{
        AutorunCallback();
      }, 100);
      return;
    }
    
    PanTrace(1);  
    
    if (g_idx < g_trace.length - 1) {
      let t = 100;
      if (g_idx == g_trace.length - 2) {
        t = 100;
      }
      setTimeout(()=>{
        AutorunCallback();
      }, t);
    } else {
      setTimeout(()=>{
        RandomizeInput();
      }, 4000);
    }
  }
}

function RandomizeInput() {
  let a = g_autorun;
  const n = parseInt(random(20)+2);
  ccall("RunSolution", 'number', ['number'], [n]);
  RestartViz();
  if (a) {
    StartAutorun();
  }
}

function StartAutorun() {
  g_autorun = true;
  AutorunCallback();
}

function StopAutorun() {
  ClearAllTimers();
  g_animator.FinishAllPendingAnimations();
  g_autorun = false;
}

function ToggleAutorun() {
  if (g_autorun) {
    StopAutorun();
  } else {
    StartAutorun();
  }
}

function IsAllAnimationFinished() {
  let ret = true;
  if (g_extent_viz != undefined) {
    if (g_extent_viz.done == false) {
      ret = false;
    }
  }
  if (g_animator.IsDone() == false) {
    ret = false;
  }
  g_game_objects.forEach((o) => {
    if (o == g_curr_cursor) return;
    if (!o.done) ret = false;
  });
  return ret;
}

function keyPressed() {
  const N = g_trace.length;
  let changed = false;
  
  if (key == 'a') {
    ToggleAutorun();
  } else if (key == ' ') {
    
  } else if (keyCode == LEFT_ARROW) {
    PanTrace(-1);
  } else if (keyCode == RIGHT_ARROW) {
    PanTrace(1);
  }
}