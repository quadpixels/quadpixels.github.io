// 2024-10-20

let g_frame_count = 0;
let g_module = undefined;
let g_idx = 0;
let g_actions = [];
let g_state = "";
let g_autorun = true;
let g_delay_mult = 1.0;
let g_pivot = undefined;

async function f() {
  g_module = await Module();
}

class ArrayViz {
  constructor(m, n, t) {
    this.elts = Array(m);
    for (let i=0; i<m; i++) { this.elts[i] = Array(n); }
    this.x = 8;
    this.y = 8;
    this.nrows = m;
    this.ncols = n;
    this.title = t;
    this.stacks = [];  // array of pair<int,int>
    this.levels = Array(n);
    this.delta_ys = Array(n);
    this.target_ys = Array(n);
    this.brightnesses = Array(n);
    this.brightness_color = Array(n);
    this.done = Array(n);
    for (let i=0; i<n; i++) {
      this.delta_ys[i] = 0;
      this.levels[i] = 0;
      this.target_ys[i] = 0;
      this.brightnesses[i] = 0;
      this.brightness_color[i] = 0;
      this.done[i] = false;
    }
  }

  Render(delta_ms) {
    const Y_MULT = 12;

    // Update deltays
    const t01 = pow(0.95, delta_ms/16.0);
    for (let i=0; i<this.ncols; i++) {
      this.target_ys[i] = this.levels[i] * Y_MULT;
      this.delta_ys[i] = lerp(this.delta_ys[i], this.target_ys[i], 1-t01);
      this.brightnesses[i] *= t01;
      if (this.brightnesses[i] < 0.01) { this.brightnesses[i] = 0; }
    }

    const L = 20;
    push();
    translate(this.x, this.y);
    for (let i=0; i<this.ncols; i++) {
      for (let j=0; j<this.nrows; j++) {
        const dx = i*L;
        const dy = j*L + this.delta_ys[i];
        const b = this.brightnesses[i];
        const c = this.brightness_color[i];
        if (this.elts[j][i] == g_pivot) {
          fill(160,160,32);
        } else {
          if (b > 0) {
            if (c == 0) {
              fill("rgba(128,128,128," + b + ")");
            } else {
              fill("rgba(16,255,16," + b + ")");
            }
          } else {
            noFill();
          }
        }
        stroke(224);
        rect(dx, dy, L, L);
      }
    }
    noStroke();
    fill(224);
    textAlign(LEFT, BOTTOM);
    text(this.title, 0, 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    let idx = 0;
    for (let r=0; r<this.nrows; r++) {
      for (let c=0; c<this.ncols; c++) {
        const dx = L*(c+0.5), dy = L*(r+0.5) + this.delta_ys[c];
        const e = this.elts[r][c];
        if (e != undefined) {
          if (this.done[c] == true) {
            fill(32,224,32);
          } else {
            fill(224);
          }
          text("" + e, dx, dy); 
        }
      }
    }

    // Draw Stack
    noFill();
    stroke(224);
    for (let i=0; i<this.stacks.length; i++) {
      const x = this.stacks[i];
      const dx0 = L*x[0], dx1 = L*(x[1]+1);
      const dy = (Y_MULT*(i));
      line(dx0, dy, dx1, dy);
    }

    pop();
  }

  Reset() {
    for (let c=0; c<this.ncols; c++) {
      for (let r=0; r<this.nrows; r++) {
        this.elts[r][c] = undefined;
        this.done[c] = false;
      }
    }
  }

  PushStack(lb, ub) {
    this.stacks.push([lb, ub]);
    for (let x=lb; x<=ub; x++) {
      this.levels[x]++;
    }
  }

  PopStack(lb, ub) {
    if (this.stacks.length > 0) {
      let x = this.stacks[this.stacks.length-1];
      if (x[0] == lb && x[1] == ub) {
        for (let x=lb; x<=ub; x++) {
          this.levels[x]--;
        }
        this.stacks.pop();
      }
    }
  }

  SetValue(r, c, v) {
    this.elts[r][c] = v;
    this.brightnesses[c] = 1;
    this.brightness_color[c] = 0;
  }

  HighLight(r, c, col) {
    this.brightnesses[c] = 1;
    this.brightness_color[c] = col;
    if (col == 1) {
      this.done[c] = true;
    }
  }
}

let g_viz = new ArrayViz(1, 20, "Array");

function setup() {
  createCanvas(480, 160);
  g_viz.y = 40;
  g_viz.x = 16;
  f();
  Reset();
}

let g_last_ms = 0;
function draw() {
  let ms = millis();
  let delta_ms = ms - g_last_ms;
  g_last_ms = ms;
  push();
  background(32);
  g_viz.Render(delta_ms);
  noStroke();
  fill(192);
  textAlign(RIGHT, TOP);
  text("Step " + (g_idx) + "/" + g_actions.length + " done", width-2, 2);
  textAlign(LEFT, TOP);
  text(g_state, 2, 2);
  textAlign(RIGHT, BOTTOM);
  if (g_autorun) {
    fill(255,255,32);
    text("Autorun", width-2, height-2);
  }
  pop();
}

function Reset() {
  g_viz.Reset();
  g_idx = 0;
  g_state = "0. Not started"
  g_pivot = -1;
  g_actions = [];

  // Regenerate
  if (g_module != undefined) {
    g_module.ccall("DoIt", "undefined", []);
  }
}

function Done() {
  return g_idx >= g_actions.length;
}

function NextStep() {
  if (Done()) return 1000;
  {
    let a = g_actions[g_idx];
    if (a[0] == "arr") {
      g_viz.SetValue(0, a[1], a[2]);
      g_idx++;      
      return 60;
    } else if (a[0] == "marker") {
      let aa = g_actions[g_idx+1];
      let lb = a[2], ub = aa[2];
      let ret = 300;
      if (lb >= 0 && ub >= 0) {
        g_viz.PushStack(lb, ub);
        ret = 300;
      } else {
        g_viz.PopStack(-lb, -ub);
        for (let i=-lb; i<=-ub; i++) {
          g_viz.HighLight(0, i, 1);
        }
        ret = 500;
      }
      g_idx+=2;
      return ret;
    } else if (a[0] == "g_state") {  // TODO: Change to variable update
      g_idx++;
      switch (a[2]) {
        case 0: g_state = "1. Populating array"; return 500;
        case 1: g_state = "2. Randomizing array"; return 500;
        case 2: g_state = "3. Sorting"; return 500;
        case 3: g_state = "4. Done"; return 1000;
      }
    } else if (a[0] == "g_pivot") {
      g_idx++;
      g_pivot = a[2];
      return 300;
    }
  }
}


function AutorunCallback() {
  if (g_autorun) {
    let delay = 900;

    if (Done() == false) {
      delay = NextStep();
    } else {
      Reset();
    }
    
    setTimeout(() => {
      AutorunCallback();
    }, delay * g_delay_mult);
  }
}

function Update1DArray(name, idx, val) {
  console.log("Update1DArray " + name + " " + idx + " " + val);
  if (name == "arr" ||
      name == "g_state" ||
      name == "marker" ||
      name == "g_pivot"
  )
  g_actions.push([name, parseInt(idx), parseInt(val)]);
}

function keyPressed() {
  if (key == " ") {
    if (g_autorun == false) { NextStep(); }
    else { g_delay_mult = 0.2; }
  } else if (key == 'r') {
    Reset();
  } else if (key == 'a') {
    g_autorun = !g_autorun;
    if (g_autorun) {
      AutorunCallback();
    }
  }
}

function keyReleased() {
  if (key == " ") {
    if (g_autorun) { g_delay_mult = 1.0; }
  }
}

setTimeout(() => {
  g_autorun = true;
  AutorunCallback();
}, 2000);