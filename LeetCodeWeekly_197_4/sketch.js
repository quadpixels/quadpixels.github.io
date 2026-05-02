// Leetcode Weekly #197 Q4 "Best Position for a Service Centre" (https://leetcode.com/contest/weekly-contest-197/problems/best-position-for-a-service-centre/)
//
// author: https://leetcode.com/quadpixels/
// 2020-07-11

let ACCENT_COLORS;

// Autorun mode
let g_autorun = true;
let g_frame_count = 0;

// Simulation code
let AUTOFIRE_DELAYS = [ 400, 400, 250, 250, 250, 250, 100, 100, 100, 100, 50 ];
let g_last_autofire_millis = 0;
let g_autofire_delay_idx = 0;
let g_key_flags = [false];
let g_solutions = [];
function NextStep() {
  for (let i=0; i<g_solutions.length; i++) {
    g_solutions[i].NextStep();
  }
  DrawTrendLines(g_graph_trends);
}

// should be good for this problem b/c we only need 1e-6 precision
function MyPrettyPrint(x) {
  const sx = x + "";
  const idx = sx.indexOf(".");
  const idx1 = sx.indexOf("e");
  if (idx1 < 5 && idx1 >= 0) return x;
  else if (x < 1e-4) {
    let s = x.toExponential() + "";
    let i0 = s.indexOf(".");
    let i1 = s.indexOf("e");
    if (i1-i0 > 3) {
      return s.substr(0, i0+3) + s.substr(i1);
    } else return s;
  }
  else if (idx < 6 && sx.length > 10) { return sx.substr(0, idx+6); }
  else return x;
}

function DrawTrendLines(g) {
  g.clear();
  g.resetMatrix();
  g.background(0,0,0,32);
  
  const PAD_LEFT = 100, PAD_RIGHT = 20;
  const YMAX = 20, YMIN = g.height - 20, YMID = (YMIN+YMAX)/2;
  const X1 = g.width - PAD_RIGHT;
  const DISP_LEN = 32; // Display how many iterations?
  
  let max_residual = 0, min_residual = 1e99;
  let max_len = 0;
  
  for (let i=0; i<g_solutions.length; i++) {
    let s = g_solutions[i].residuals;
    max_len = max(max_len, s.length);
  }
  
  const j0 = max(max_len-DISP_LEN, 0);
  
  for (let i=0; i<g_solutions.length; i++) {
    let s = g_solutions[i].residuals;
    max_len = max(max_len, s.length);
    for (let j=j0; j<s.length; j++) {
      max_residual = max(max_residual, s[j]);
      min_residual = min(min_residual, s[j]);
    }
  }
  
  // Draw grid lines
  g.noStroke();
  g.fill(255);
  g.textAlign(RIGHT, BOTTOM);
  g.text(MyPrettyPrint(min_residual) + "", PAD_LEFT-2, YMIN);
  g.textAlign(RIGHT, TOP);
  g.text(MyPrettyPrint(max_residual) + "", PAD_LEFT-2, YMAX);
  g.textAlign(RIGHT, CENTER);
  g.fill(192);
  g.text("diff:" + MyPrettyPrint(max_residual-min_residual), PAD_LEFT-12, YMID);
  g.noFill();
  g.stroke(128);
  const tmp = PAD_LEFT * 0.68;
  g.line(tmp, YMID-11, tmp, YMAX+18);
  g.line(tmp, YMID+11, tmp, YMIN-18);
  
  g.stroke(255, 255, 255, 32);
  g.line(PAD_LEFT, YMIN, X1, YMIN);
  g.line(PAD_LEFT, YMAX, X1, YMAX);
  
  let delta_x = min(100, (g.width-PAD_LEFT-PAD_RIGHT)/DISP_LEN);
  let dx_max = 0, i_max = -999;
  
  let curr_highlights = [];
  
  for (let i=0; i<g_solutions.length; i++) {
    g.stroke(ACCENT_COLORS[i]);
    let s = g_solutions[i].residuals;
    curr_highlights.push([PAD_LEFT, MyMap(s[j0], min_residual, max_residual, YMIN, YMAX)]);
    g.beginShape(LINES);
    for (let j=j0, jj=0; j<s.length-1; j++, jj++) {
      const x0 = PAD_LEFT +  jj   *delta_x;
      const x1 = PAD_LEFT + (jj+1)*delta_x;
      const y0 = MyMap(s[j],  min_residual, max_residual, YMIN, YMAX);
      const y1 = MyMap(s[j+1],min_residual, max_residual, YMIN, YMAX);
      g.vertex(x0, y0);
      g.vertex(x1, y1);
      dx_max = max(dx_max, x1);
      i_max = max(j, i_max);
      
      // For highlighting current point
      curr_highlights[i][0] = x1;
      curr_highlights[i][1] = y1;
    }
    g.endShape();
  }
  
  // Vertical bars
  g.stroke(255, 255, 255, 32);
  g.line(PAD_LEFT, YMIN, PAD_LEFT, YMAX);
  g.line(dx_max,   YMIN, dx_max,   YMAX);
  g.textAlign(CENTER, TOP);
  g.noStroke();
  g.fill(255);
  g.text("Step " + (j0), PAD_LEFT, YMIN+2);
  if (i_max >= 0) {
    g.text("Step " + (i_max+1), dx_max, YMIN+2);
  }
  
  g.push();
  for (let i=0; i<curr_highlights.length; i++) {
    g.fill(ACCENT_COLORS[i]);
    const p = curr_highlights[i];
    if (p[0] != -999) {
      g.circle(p[0], p[1], 5);
    }
  }
  g.pop();
}

// UI code
let g_btn_edit_input;
let g_data_input;
let g_btn_apply_input;
let g_btn_randomize;
let g_input_visible = false;
let g_graph_trends;

function RefreshInputPanels() {
  if (g_input_visible) {
    g_btn_edit_input.html("&gt;&gt; Edit Input");
    g_data_input.style("display", "block");
    g_btn_apply_input.style("display", "block");
  } else {
    g_btn_edit_input.html("&lt;&lt; Edit Input");
    g_data_input.style("display", "none");
    g_btn_apply_input.style("display", "none");
  }
}

function ToggleInputPanel() {
  g_input_visible = !g_input_visible;
  RefreshInputPanels();
}

// I'm doing an eval() here. Use at your own risk! :P
function UseInput() {
  g_positions = eval(g_data_input.value());
  g_solutions.forEach(function(s) { s.Reset(); });
  g_z = GenGrid(g_positions);
  DrawTrendLines(g_graph_trends);
}

// Visualization code
const XBREAKS = 21, YBREAKS = 21; // Number of endpoints; for number of grids, subtract 1
const YMIN = 0, YMAX = 100, XMIN = 0, XMAX = 100; 
const DISP_YMIN = -200, DISP_YMAX = 200, DISP_XMIN = -200, DISP_XMAX = 200;
const DISP_ZMIN = 0, DISP_ZMAX = 200;
let ZMAX, ZMIN;
let g_positions = [[0,1],[3,2],[4,5],[7,6],[8,9],[11,100],[100,12]];
let g_z;
let g_text_div;
let g_graph3d;
let g_gl;

function GetDispZ(z) {
  return MyMap(z, ZMIN, ZMAX, DISP_ZMIN, DISP_ZMAX);
}

function RandomizeInput() {
  const N = random() * 50 + 1;
  let c = "[";
  for (let i=0; i<N; i++) {
    const x = parseInt(random() * 101), y = parseInt(random() * 101);
    g_positions.push([x,y]);
    if (i > 0) c = c + ",";
    c = c + "[" + x + "," + y + "]";
  }
  c = c + "]";
  g_data_input.value(c);
  UseInput();
}

function setup() {
  let renderer = createCanvas(720, 720);
  g_graph3d = createGraphics(720, 720, WEBGL);
  g_z = GenGrid(g_positions);
  g_graph_trends = createGraphics(720, 240);
  
  const btn1 = createButton("Next Step");
  btn1.position(10, 10);
  btn1.mousePressed(NextStep);
  
  const btn2 = createButton("Reset");
  btn2.position(90, 10);
  btn2.mousePressed(function() {
    g_solutions.forEach(function(s) { s.Reset(); });
    DrawTrendLines(g_graph_trends);
  });
  
  g_gl = g_graph3d.canvas.getContext("webgl");
  
  ACCENT_COLORS = [
    color(255, 128, 128),
    color(128, 255, 128),
    color(128, 128, 255),
  ];
  
  g_btn_edit_input = createButton("<< Edit Input");
  g_btn_edit_input.position(width-100, 10);
  g_btn_edit_input.mousePressed(ToggleInputPanel);
  
  g_data_input = createElement("textarea", "[[1,2],[3,4]]");
  g_data_input.size(320, 50);
  g_data_input.position(width - 335, 40)
  
  g_btn_apply_input = createButton("Use Input");
  g_btn_apply_input.position(width-100, 100);
  g_btn_apply_input.mousePressed(UseInput);
  
  g_btn_randomize = createButton("Random Input");
  g_btn_randomize.position(width-210, 10);
  g_btn_randomize.mousePressed(RandomizeInput);
  
  RefreshInputPanels();
  
  g_solutions = [
    new GradientDescent(),
    new SimulatedAnnealing(),
    new Weiszfeld(),
  ]
}

function MyMap(x, x0, x1, y0, y1) {
  const t = (x-x0) / (x1-x0);
  return y0 + (y1-y0) * t;
}

function Eval(positions, x, y) {
  let ret = 0;
  for (let i=0; i<positions.length; i++) {
    const x0 = positions[i][0], y0 = positions[i][1];
    ret = ret + sqrt((x-x0)*(x-x0) + (y-y0)*(y-y0));
  }
  return ret;
}

// Subscript: [y][x]
function GenGrid(positions) {
  ret = [];
  ZMIN = 1e99; ZMAX = -1e99;
  for (let y=0; y<YBREAKS; y++) {
    let line = [];
    for (let x=0; x<XBREAKS; x++) {
      const xx = lerp(XMIN, XMAX, x/(XBREAKS-1));
      const yy = lerp(YMIN, YMAX, y/(YBREAKS-1));
      const zz = Eval(positions, xx, yy);
      ZMIN = min(ZMIN, zz);
      ZMAX = max(ZMAX, zz);
      line.push(zz);
    }
    ret.push(line);
  }
  return ret;
}

let rot_z = 0;

// CAUTION: Depth Test is disabled for this routine
// To do depth-test correctly, you need to traverse the surface of this mesh
function DrawSteps(g, positions, steps, the_color) {
  const DIST_THRESH = 5;
  const SKIP_MAX = 10; // Skip this many at maximum
  const L2 = 10; // Do not skip the last 10 points during visualization
  
  g_gl.disable(g_gl.DEPTH_TEST);
  g.stroke(the_color);
  g.beginShape(LINES);
  let last_x = steps[0][0], last_y = steps[0][1];
  let last_z = Eval(positions, last_x, last_y);

  let idx = 1, last_idx = 0
  let x, y, z;
  while (idx < steps.length) {
    x = steps[idx][0]; y = steps[idx][1]; z = Eval(positions, x, y);
    let dist_sq = (x-last_x)*(x-last_x) + (y-last_y)*(y-last_y) + (z-last_z)*(z-last_z);
    let skip = false;
    if (dist_sq < DIST_THRESH && idx-last_idx < SKIP_MAX && idx < steps.length-L2) { 
      skip = true;
    }
    if (skip == false) {
      const xx0 = map(last_x, XMIN, XMAX, DISP_XMIN, DISP_XMAX);
      const yy0 = map(last_y, YMAX, YMIN, DISP_YMIN, DISP_YMAX);
      const xx1 = map(x, XMIN, XMAX, DISP_XMIN, DISP_XMAX);
      const yy1 = map(y, YMAX, YMIN, DISP_YMIN, DISP_YMAX);
      g.vertex(xx0, yy0, GetDispZ(last_z));
      g.vertex(xx1, yy1, GetDispZ(z));
      
      last_x = x; last_y = y; last_z = z; last_idx = idx;
    }
    idx ++;
  }
  g.endShape();
  g_gl.enable(g_gl.DEPTH_TEST);
}

function draw() {
  textAlign(LEFT, TOP);
  if (g_frame_count == 0) {
    RandomizeInput();
    AutoRunStep();
  }
  g_frame_count ++;
  
  const ms = millis();
  if (g_key_flags[0]) {
    if (ms - g_last_autofire_millis > AUTOFIRE_DELAYS[g_autofire_delay_idx]) {
      g_last_autofire_millis = ms;
      if (g_autofire_delay_idx < AUTOFIRE_DELAYS.length-1) {
        g_autofire_delay_idx++;
      }
      NextStep();
    }
  }
  
  g_graph3d.background(32);
  g_graph3d.camera();
  g_graph3d.rotateX(PI/4);
  g_graph3d.rotateZ(rot_z);
  
  // Avoid Z-fighting
  g_graph3d.push();
  g_graph3d.translate(0, 0, 0.1);
  
  const S = 100;
  
  g_graph3d.beginShape(TRIANGLES);
  g_graph3d.fill(64);
  g_graph3d.noStroke();
  for (let y=0; y<YBREAKS; y++) {
    for (let x=0; x<XBREAKS; x++) {
      const z00 = g_z[y][x];
      const xx = lerp(DISP_XMIN, DISP_XMAX, x/(XBREAKS-1));
      const yy = lerp(DISP_YMAX, DISP_YMIN, y/(YBREAKS-1));
      // x edge
      if (x < XBREAKS-1 && y < YBREAKS-1) {
        const z10 = g_z[y][x+1];
        const z01 = g_z[y+1][x];
        const z11 = g_z[y+1][x+1];
        const xx1 = lerp(DISP_XMIN, DISP_XMAX, (x+1)/(XBREAKS-1));
        const yy1 = lerp(DISP_YMAX, DISP_YMIN, (y+1)/(YBREAKS-1)); // Revert Y when displaying in p5.js
        g_graph3d.vertex(xx,  yy,  GetDispZ(z00));
        g_graph3d.vertex(xx1, yy,  GetDispZ(z10));
        g_graph3d.vertex(xx,  yy1, GetDispZ(z01));
        
        g_graph3d.vertex(xx1, yy,  GetDispZ(z10));
        g_graph3d.vertex(xx1, yy1, GetDispZ(z11));
        g_graph3d.vertex(xx,  yy1, GetDispZ(z01));
      }
      
      if ((x == 0 || x == XBREAKS-1) && (y < YBREAKS-1)) {
        const yy1 = lerp(DISP_YMAX, DISP_YMIN, (y+1)/(YBREAKS-1)); // Revert Y when displaying in p5.js
        const z01 = g_z[y+1][x];
        g_graph3d.vertex(xx, yy,  DISP_ZMIN);
        g_graph3d.vertex(xx, yy1, DISP_ZMIN);
        g_graph3d.vertex(xx, yy1, GetDispZ(z01));
        
        g_graph3d.vertex(xx, yy1, GetDispZ(z01));
        g_graph3d.vertex(xx, yy,  DISP_ZMIN);
        g_graph3d.vertex(xx, yy,  GetDispZ(z00));
      }
      
      if ((y == 0 || y == YBREAKS-1) && (x < XBREAKS-1)) {
        const xx1 = lerp(DISP_XMIN, DISP_XMAX, (x+1)/(XBREAKS-1));
        const z10 = g_z[y][x+1];
        g_graph3d.vertex(xx,  yy, DISP_ZMIN);
        g_graph3d.vertex(xx1, yy, DISP_ZMIN);
        g_graph3d.vertex(xx1, yy, GetDispZ(z10));
        
        g_graph3d.vertex(xx1, yy, GetDispZ(z10));
        g_graph3d.vertex(xx,  yy, DISP_ZMIN);
        g_graph3d.vertex(xx,  yy, GetDispZ(z00));
      }
    }
  }
  g_graph3d.endShape();
  
  // Inner grids
  g_graph3d.beginShape(LINES);
  g_graph3d.stroke(80);
  for (let y=0; y<YBREAKS; y++) {
    for (let x=0; x<XBREAKS; x++) {
      const xx = lerp(DISP_XMIN, DISP_XMAX, x/(XBREAKS-1));
      const yy = lerp(DISP_YMAX, DISP_YMIN, y/(YBREAKS-1)); // Revert Y when displaying in p5.js
      const z00 = g_z[y][x];
      if (x < XBREAKS-1) {
        const xx1 = lerp(DISP_XMIN, DISP_XMAX, (x+1)/(XBREAKS-1));
        const z10 = g_z[y][x+1];
        if (!(y == 0 || y == YBREAKS-1)) {
          g_graph3d.vertex(xx,  yy, GetDispZ(z00));
          g_graph3d.vertex(xx1, yy, GetDispZ(z10));
        }
      }
      if (y < YBREAKS-1) {
        const yy1 = lerp(DISP_YMAX, DISP_YMIN, (y+1)/(YBREAKS-1)); // Revert Y when displaying in p5.js
        const z01 = g_z[y+1][x];
        if (!(x == 0 || x == XBREAKS-1)) {
          g_graph3d.vertex(xx, yy,  GetDispZ(z00));
          g_graph3d.vertex(xx, yy1, GetDispZ(z01));
        }
      }
    }
  }
  g_graph3d.endShape();
  
  // Outermost outlines
  g_graph3d.stroke(128);
  g_graph3d.beginShape(LINES);
  for (let y=0; y<YBREAKS; y++) {
    for (let x=0; x<XBREAKS; x++) {
      const xx = lerp(DISP_XMIN, DISP_XMAX, x/(XBREAKS-1));
      const yy = lerp(DISP_YMAX, DISP_YMIN, y/(YBREAKS-1)); // Revert Y when displaying in p5.js
      const z00 = g_z[y][x];
      if ((y == 0 || y==YBREAKS-1) && x < XBREAKS-1) {
        const xx1 = lerp(DISP_XMIN, DISP_XMAX, (x+1)/(XBREAKS-1));
        const z10 = g_z[y][x+1];
        g_graph3d.vertex(xx,  yy, GetDispZ(z00));
        g_graph3d.vertex(xx1, yy, GetDispZ(z10));
      }
      if ((x == 0 || x == XBREAKS-1) && (y < YBREAKS-1)) {
        const yy1 = lerp(DISP_YMAX, DISP_YMIN, (y+1)/(YBREAKS-1)); // Revert Y when displaying in p5.js
        const z01 = g_z[y+1][x];
        g_graph3d.vertex(xx, yy,  GetDispZ(z00));
        g_graph3d.vertex(xx, yy1, GetDispZ(z01));
      }
    }
  }
  // Four poles
  {
    const z00 = g_z[0][0], z01 = g_z[YBREAKS-1][0];
    const z10 = g_z[0][XBREAKS-1], z11 = g_z[YBREAKS-1][XBREAKS-1];
    
    // Revert Y when displaying in p5.js for all of the following Y coordinates
    g_graph3d.vertex(DISP_XMIN, DISP_YMAX, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMIN, DISP_YMAX, GetDispZ(z00));
    
    g_graph3d.vertex(DISP_XMAX, DISP_YMAX, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMAX, DISP_YMAX, GetDispZ(z10));
    
    g_graph3d.vertex(DISP_XMIN, DISP_YMIN, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMIN, DISP_YMIN, GetDispZ(z01));
    
    g_graph3d.vertex(DISP_XMAX, DISP_YMIN, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMAX, DISP_YMIN, GetDispZ(z11));
  }
  {
    g_graph3d.vertex(DISP_XMIN, DISP_YMIN, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMIN, DISP_YMAX, DISP_ZMIN);
    
    g_graph3d.vertex(DISP_XMIN, DISP_YMAX, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMAX, DISP_YMAX, DISP_ZMIN);
    
    g_graph3d.vertex(DISP_XMAX, DISP_YMAX, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMAX, DISP_YMIN, DISP_ZMIN);
    
    g_graph3d.vertex(DISP_XMAX, DISP_YMIN, DISP_ZMIN);
    g_graph3d.vertex(DISP_XMIN, DISP_YMIN, DISP_ZMIN);
  }
  {
  }
  g_graph3d.endShape();
  
  g_graph3d.beginShape(LINES);
  for (let i=0; i<g_positions.length; i++) {
    const px = g_positions[i][0], py = g_positions[i][1];
    const xx = MyMap(px, XMIN, XMAX, DISP_XMIN, DISP_XMAX);
    const yy = MyMap(py, YMAX, YMIN, DISP_YMIN, DISP_YMAX); // Revert Y when displaying in p5.js
    const zz = Eval(g_positions, px, py);
    g_graph3d.stroke(0, 255, 255);
    g_graph3d.vertex(xx, yy, GetDispZ(zz) + 7);
    g_graph3d.vertex(xx, yy, GetDispZ(zz));
  }
  g_graph3d.endShape();
  
  
  g_graph3d.pop();
  
  
  // Rotating Platform
  g_graph3d.fill(80);
  g_graph3d.stroke(128);
  g_graph3d.circle(0, 0, (DISP_XMAX - DISP_XMIN) / 0.667)
  
  
  // Steps
  for (let i=0; i<g_solutions.length; i++) {
    let s = g_solutions[i];
    DrawSteps(g_graph3d, g_positions, s.steps, ACCENT_COLORS[i]);
  }
  g_graph3d.stroke(0);
  
  g_graph3d.noStroke();
  
  image(g_graph3d, 0, 0, width, height);
  
  image(g_graph_trends, 0, height-g_graph_trends.height);
  
  noStroke();
  fill(255);
  
  for (let i=0; i<g_solutions.length; i++) {
    let s = g_solutions[i];
    fill(ACCENT_COLORS[i]);
    text(s.ToString(), 10, 52 + 16 * i);
  }

  rot_z = 0.1 * sin(millis()/1000);
  
  if (g_autorun) {
    noStroke();
    textAlign(CENTER, TOP);
    fill(255, 255, 0);
    text("Autorun mode activated\nClick anywhere or press any key to disable",
      width/2, 4);
  }
}

function keyPressed() {
  if (key == ' ') { 
    g_key_flags[0] = true; 
    NextStep();
    g_last_autofire_millis = millis();
  }
  g_autorun = false;
}

function mouseClicked() {
  g_autorun = false;
}

function keyReleased() {
  if (key == ' ') {
    g_key_flags[0] = false;
    g_autofire_delay_idx = 0;
  }
}

function StartAutoRun() {
  if (g_autorun == true) return;
  g_autorun = true;
  AutoRunStep();
}

function AutoRunStep() {
  if (!g_autorun) return;
  let all_done = true;
  g_solutions.forEach((s) => {
    if (!s.done) { all_done = false; }
  });
  
  if (!all_done) {
    setTimeout(function() {
      g_key_flags[0] = true;
      AutoRunStep();
    }, 200);
  } else {
    g_key_flags[0] = false;
    setTimeout(function() {
      RandomizeInput();
      AutoRunStep();
    }, 3000);
  }
}

function StopAutoRun() {
  g_autorun = false;
}