// 2023-07-08

const LEN = 16;
const X0 = 64;
const Y0 = 80;
const Y1 = 200;

// 左对齐
class ArrayViz {
  constructor() {
    this.x = X0;
    this.y = Y0;
    this.SetArray([]);
    this.max_h = 60;
  }
  SetArray(a) {
    this.elts = a;
    this.highlight_colors = [];
  }
  SetZeroes(n) {
    this.elts = [];
    for (let i=0; i<n; i++) this.elts.push(0);
    this.highlight_colors = [];
  }
  Render() {
    const W = 16;
    push();
    translate(this.x, this.y);
    
    noStroke();
    let hl = this.highlight_colors;
    for (let i=0; i<hl.length; i++) {
      let c = this.highlight_colors[i];
      if (c != undefined) {
        fill(c[0], c[1], c[2]);
        rect(W*i, 0, W, W);
      }
    }
    
    noFill();
    stroke("#CCC");
    strokeWeight(1);
    rectMode(CORNERS);
    const N = this.elts.length;
    rect(0, 0, W*N, W);
    for (let i=1; i<N; i++) {
      line(W*i, 0, W*i, W);
    }
    noStroke();
    fill("#FFF");
    textAlign(CENTER, CENTER);
    for (let i=0; i<N; i++) {
      const dx = W*(0.5+i);
      const dy = W*0.5;
      text(""+parseInt(this.elts[i]), dx, dy);
    }
    pop();
  }
};

class RangeViz {
  constructor() {
    this.w = LEN * 3;
    this.weight = 2;
    this.x = X0;
    this.y = Y0;
  }
  Render() {
    push();
    translate(this.x, this.y);
    noFill();
    stroke("rgba(255,255,255,0.8)");
    rectMode(CORNER);
    rect(0, 0, this.w, LEN);
    fill("#FFF");
    textAlign(LEFT, CENTER);
    noStroke();
    text(this.weight, 3, LEN/2);
    pop();
  }
}

class RangesLayouter {
  constructor() {
    this.ranges = [];
    this.occs = {};  // Y => X-idxes
    this.x = X0;
    this.y = Y1;
  }
  Reset() {
    this.ranges = [];
    this.occs = {};
  }
  AddRange(x, value, len) {
    let y = 0;
    while (true) {
      if (this.occs[y] == undefined) {
        this.occs[y] = [x];
        break;
      } else {
        let xs = this.occs[y];
        let ok = true;
        for (let i=0; i<xs.length; i++) {
          const xx = xs[i];
          if (xx > x-len && xx < x+len) {
            ok = false; break;
          }
        }
        if (ok) {
          this.occs[y].push(x);
          this.occs[y].sort();
          break;
        }
        else y++;
      }
    }
    let rv = new RangeViz();
    rv.weight = value;
    rv.w = len * LEN;
    rv.x = x * LEN;
    rv.y = (y + 1) * (-LEN) - 2;
    this.ranges.push(rv);
  }
  Render() {
    push();
    translate(this.x, this.y);
    this.ranges.forEach((r => {
      r.Render();
    }));
    pop();
  }
}

class LineSegment {
  constructor(len) {
    this.x = X0;
    this.y = Y0-4;
    this.Reset(len);
    this.max_h = 50;
  }
  Reset(len) {
    this.deltas = [];
    this.xys = undefined;
    this.elts = [];
    for (let i=0; i<len; i++) {
      this.deltas.push(0);
      this.elts.push(0);
    }
    this.deltas.push(0);
    this.texts = [];  // "+1 at x=0, y=0", etc.
    this.CalculateXYBreaks();
  }
  Render() {
    this.CalculateXYBreaks();
    let yscale = 1;
    for (let i=0; i<this.xys.length; i++) {
      const xy = this.xys[i];
      const h = abs(LEN * xy[1]);
      if (h > this.max_h) {
        yscale = min(this.max_h / h, yscale);
      }
    }
    push();
    noFill();
    stroke("#3FF");
    for (let i=0; i<this.xys.length-1; i++) {
      let xy = this.xys[i];
      let xy1 = this.xys[i+1];
      const dx0 = this.x + LEN * xy[0];
      const dy0 = this.y - 2 - LEN * xy[1] * yscale;
      const dx1 = this.x + LEN * xy1[0];
      const dy1 = this.y - 2 - LEN * xy1[1] * yscale;
      line(dx0, dy0, dx1, dy1);
    }
    strokeWeight(3)
    for (let i=0; i<this.xys.length; i++) {
      let xy = this.xys[i];
      const dx0 = this.x + LEN * xy[0];
      const dy0 = this.y - 2 - LEN * xy[1] * yscale;
      point(dx0, dy0);
    }
    noStroke();
    fill("#ccc");
    textAlign(LEFT, BOTTOM);
    for (let i=0; i<this.texts.length; i++) {
      let txy = this.texts[i];
      const dx0 = this.x + 2 + LEN * txy[1];
      const dy0 = this.y - 2 - LEN * txy[2] * yscale;
      text(txy[0], dx0, dy0);
    }
    pop();
  }
  BumpRegion(x, value, len) {
    let idx0 = x;
    let idx1 = Math.min(this.deltas.length, x+len);
    g_animator.Animate(this, "deltas", idx0, [this.deltas[idx0], this.deltas[idx0]+value], [0, 500]);
    g_animator.Animate(this, "deltas", idx1, [this.deltas[idx1], this.deltas[idx1]-value], [0, 500]);
    for (let i=idx0; i<idx1; i++) {
      g_animator.Animate(this, "elts", i, [this.elts[i], this.elts[i]+value], [0, 500]);
    }
    this.CalculateXYBreaks();
  }
  CalculateXYBreaks() {
    let prev_x = 0, prev_y = 0;
    let first_x = 0;  // First X with the aforementioned Y
    let x = 0, y = 0;
    this.xys = [];
    this.texts = [];
    for (let i=0; i<this.deltas.length; i++) {
      let t = parseInt(this.deltas[i]) + "";
      
      y += this.deltas[i];
      x ++;
      if (prev_y != y) {
        this.xys.push([prev_x, prev_y])
        this.xys.push([prev_x, y])
        first_x = x;
        
        if (this.deltas[i] > 0) {
          t = "+" + t;
          this.texts.push([t, prev_x, prev_y])
        } else {
          this.texts.push([t, prev_x, y]);
        }
      }
      
      prev_y = y;
      prev_x = x;
    }
    const last_x = this.deltas.length-1;
    this.xys.push([last_x, y]);
    this.xys.push([last_x, 0]);
  }
}

class Cursor {
  constructor() {
    this.x = X0;
    this.y = Y0 + 24 + LEN;
    this.w = 3;
    this.pos = { x : 0 };
    this.color = "#3FF";
  }
  Render() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.color);
    rectMode(CORNER);
    rect(this.pos.x * LEN, 0, LEN*this.w, 3);
    pop();
  }
  MoveTo(x) {
    g_animator.Animate(this, "pos", "x", [this.pos.x, x], [0, 500]);
  }
}

class Director {
  constructor() {
    this.idx = 0;
    this.x = X0;
    this.y = Y0;
    this.state = "Not started";
    
    // Problem
    this.k = 3;
    this.input = [2,2,3,1,1,0];
    
    // Trace
    this.traces = [];
    this.currpos = 0;
  }
  Reset() {
    this.idx = 0;
    g_arrayviz.SetArray(this.input);
    g_arrayviz1.SetZeroes(this.input.length);
    g_cursor.w = this.k;
    g_cursor1.w = this.k;
    g_cursor.color = "#3FF";
    g_cursor1.color = "#3FF";
    g_cursor.MoveTo(0);
    g_cursor1.MoveTo(0);
    g_linesegment.Reset(this.input.length);
    g_arrayviz1.elts = g_linesegment.elts;
    g_rangeslayouter.Reset();
    this.state = "Ready to start";
    this.traces = [];
  }
  Step() {
    g_animator.FinishAllPendingAnimations();
    if (this.idx >= this.traces.length) return;
    this.do_ExecuteTrace(this.traces[this.idx++]);
    if (this.idx >= this.traces.length) {
    }
  }
  do_ExecuteTrace(t) {
    const currpos = this.currpos;
    this.state = "Done " + this.idx + "/" + this.traces.length + " steps";
    if (t[0] == "MoveCursor") {
      MoveCursors(t[1]);
      if (t[1] > this.input.length - this.k) {
        g_cursor.color = "#888";
        g_cursor1.color = "#888";
      }
      this.currpos = t[1];
    } else if (t[0] == "ApplyDiff") {
      g_rangeslayouter.AddRange(currpos, t[1], this.k);
      g_linesegment.BumpRegion(currpos, t[1], this.k);
    } else if (t[0] == "SetFailure") {
      g_arrayviz.highlight_colors[currpos] = [128,0,0];
      g_arrayviz1.highlight_colors[currpos] = [128,0,0];
      this.state = "Finished, output is False";
    } else if (t[0] == "SetSuccess") {
      this.state = "Finished, output is True";
    } else if (t[0] == "MarkCellAsGreen") {
      g_arrayviz.highlight_colors[currpos] = [0,128,0];
      g_arrayviz1.highlight_colors[currpos] = [0,128,0];
    }
  }
  Render() {
    push();
    noStroke();
    fill("#CCC");
    textAlign(LEFT, CENTER);
    text(this.state, this.x, this.y);
    pop();
  }
  IsDone() {
    return this.idx >= this.traces.length;
  }
}

g_arrayviz = new ArrayViz();
g_arrayviz.y = Y0 + 144;
g_rangeslayouter = new RangesLayouter();
g_rangeslayouter.y = Y0 + 80;
g_linesegment = new LineSegment(g_arrayviz.elts.length);
g_linesegment.y = Y0;
g_animator = new Animator();

// Scratch
g_arrayviz1 = new ArrayViz();
g_arrayviz1.y = Y0 + 96;
g_arrayviz1.elts = g_linesegment.elts;

g_cursor = new Cursor();
g_cursor.y = g_arrayviz.y + LEN;
g_cursor1 = new Cursor();
g_cursor1.y = g_arrayviz1.y + LEN;

g_director = new Director();
g_director.y = g_arrayviz.y + LEN*3;

function MoveCursors(x) {
  g_cursor.MoveTo(x);
  g_cursor1.MoveTo(x);
}

function setup() {
  createCanvas(400, 400);
  Init();
  const btnStep = createButton("Step");
  btnStep.position(16, height-24);
  btnStep.mousePressed(() => {
    g_animator.FinishAllPendingAnimations();
    if (g_director.IsDone()) {
      InitWithRandomInput();
    } else {
      g_director.Step();
    }
  });
  
  const btnRandomInput = createButton("Random Input");
  btnRandomInput.position(80, height-24);
  btnRandomInput.mousePressed(() => {
    InitWithRandomInput();
  });
}

let g_frame_count = 0;
function draw() {
  if (g_frame_count == 0) {
    if (g_autorun) {
      AutorunCallback();
    }
  }
  g_frame_count++;
  g_animator.Update();
  background(32);
  g_arrayviz.Render();
  g_arrayviz1.Render();
  g_rangeslayouter.Render();
  g_linesegment.Render();
  g_cursor.Render();
  g_cursor1.Render();
  g_director.Render();
  
  push();
  noFill();
  stroke("#666");
  let dys = [
    g_linesegment.y + 3,
    g_rangeslayouter.y + 3,
    g_arrayviz1.y + 32,
    g_director.y - 12,
  ]; 
  const PAD = 16;
  dys.forEach((dy) => {
      line(X0, dy, width-PAD, dy);
  });
  textAlign(RIGHT, CENTER);
  noStroke();
  fill("#888");
  let dys1 = [
    dys[0]/2,
    (dys[0]+dys[1])/2,
    (dys[1]+dys[2])/2,
    (dys[2]+dys[3])/2,
    g_director.y
  ];
  let txts = [
    "Horizon\nview",
    "Slices\nview",
    "Draft\narray",
    "Problem",
    "Status",
  ];
  for (let i=0; i<dys1.length; i++) {
    text(txts[i], X0-8, dys1[i]);
  }
  fill("#FF0");
  if (g_autorun) {
    textAlign(RIGHT, BOTTOM);
    text("Autorun", width-5, height-5);
  }
  pop();
}

function keyPressed() {
  if (key == ' ') {
    g_autorun = false;
  } else if (key == 'a' || key == 'A') {
    g_autorun = true;
    AutorunCallback();
  }
}

function Init(input, k) {
  if (input == undefined) {
    input=[2,2,3,1,1,0];
  }
  if (k == undefined) {
    k = 3;
  }
  g_director.input = input;
  g_director.k = k;
  g_director.Reset();
  ccall("RunInput", "number", ["string","number"],
    [input.join(" "), k]);
}

function InitWithRandomInput() {
  let L = parseInt(random(2, 18));
  let k = 0;
  while (!(k > 0 && k < L)) {
    k = parseInt(random(0, L+1));
  }
  let input = [];
  for (let i=0; i<L; i++) { input.push(0); }
  let X = parseInt(random(1, 10));
  for (let i=0; i<X; i++) {
    let idx = parseInt(random(0, L+1-k));
    for (let j=0; j<k; j++) {
      input[j+idx]++;
    }
  }
  console.log(input)
  if (random() < 0.5) {  // Mess up with the answer
    input[parseInt(random(0, L))]++;
  }
  Init(input, k);
}

function AddTraceEntry(action, arg) {
  if (action == "MoveCursor") {
    g_traces.push(["MoveCursor", arg]);
  } else if (action == "ApplyDiff") {
    g_traces.push(["ApplyDiff", arg]);
  } else if (action == "SetFailure") {
    console.log("setfailure");
    g_traces.push(["SetFailure"]);
  } else if (action == "SetSuccess") {
    g_traces.push(["SetSuccess"]);
  } else if (action == "MarkCellAsGreen") {
    g_traces.push(["MarkCellAsGreen"]);
  }
}

let g_autorun = true;
function AutorunCallback() {
  if (g_autorun) {
    console.log("ARC");
    
    if (g_director.IsDone() == false &&
        g_animator.IsDone()) {
      g_director.Step();
    } else if (g_director.IsDone() &&
        g_animator.IsDone()) {
      setTimeout(() => {
        InitWithRandomInput();
        AutorunCallback();
      }, 2000);
      return;
    }
    
    setTimeout(() => {
      AutorunCallback();
    }, 600);
  }
}