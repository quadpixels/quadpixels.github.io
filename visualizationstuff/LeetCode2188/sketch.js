// 2022-02-26

const W = 480;
const H = 480;

class Tires {
  constructor() {
    this.tires = [];
    this.x = 16
    this.y = 32
    this.focused_idx = 0;
    this.scroll_focus_idx = 0;
    
    this.change_time = 0;
  }
  
  Render() {
    const NSHOWN = 15;
    const HEXT = parseInt(NSHOWN/2);
    let idx0 = max(0,                   this.scroll_focus_idx - HEXT);
    let idx1 = min(this.tires.length-1, idx0 + NSHOWN-1);
    
    let y = this.y, x = this.x;
    const LINE_HEIGHT = 13;
    
    noStroke();
    fill(128);
    textAlign(LEFT, TOP);
    text("Tires x" + this.tires.length, x, y);
    y += LINE_HEIGHT;
    
    textAlign(LEFT, TOP);
    textSize(12);
    for (let i=idx0; i<=idx1; i++) {
      const txt = "(" + this.tires[i][0] + ", " + this.tires[i][1] + ")";
      if (i == this.focused_idx) {
        fill(128);
        rect(x, y, textWidth(txt), 13);
        fill(240);
      } else {
        fill(192);
      }
      text(txt, x, y);
      y += LINE_HEIGHT;
    }
    
    fill(128)
    text("Change time:", x, this.y+250);
    fill(192)
    text("" + this.change_time, x, this.y+263)
  }
  
  Unfocus() {
    this.focused_idx = -999;
  }
  
  Focus(idx) {
    this.focused_idx = idx;
    this.scroll_focus_idx = idx;
  }
}

class LineGraph {
  constructor() {
    // Columns of data
    this.columns = []
    this.dp = [] // Min Y per x
    
    this.x_min = 1
    this.x_max = 87
    this.x = 140
    this.y = 32
    this.w = W - 16 - this.x
    this.h = H - 96
    
    this.y_min = 0
    this.y_max = 100
    
    this.cursor0_x = -999;
    this.cursor0_y = -999;
    this.cursor1_x = -999;
    this.cursor1_y = -999;
    
    this.SetXMax(87);
  }
  
  SetXMax(xmax) {
    this.x_max = xmax;
    this.columns = []
    for (let i=0; i<=xmax; i++) {
      this.columns.push([])
    }
    this.dp = []
    for (let i=0; i<=xmax; i++) {
      this.dp.push(0)
    }
  }
  
  Render() {
    stroke(128);
    let x = this.x, y = this.y
    line(x, y, x, y+this.h)
    line(x, y+this.h, x+this.w, y+this.h)
    const PAD = 8;
    let dx0 = x + PAD, dx1 = x+this.w-PAD;
    
    for (let xx = this.x_min; xx<=this.x_max; xx++) {
      const dx = map(xx, this.x_min, this.x_max, dx0, dx1)
      line(dx, y+this.h, dx, y+this.h-4)
    }
    
    const PAD2 = 8
    noStroke();
    fill(160);
    let x_watermark = this.x-100;
    for (let xx = this.x_min; xx<=this.x_max; xx++) {
      const dx = map(xx, this.x_min, this.x_max, dx0, dx1)
      let label = "" + xx;
      const tw = textWidth(label)
      if ((dx-tw/2 > x_watermark+PAD2 && dx+tw/2 <
           this.x+this.w-textWidth(this.x_max)-PAD2) || xx == this.x_max) {
        x_watermark = dx + tw/2
        text(label, dx-tw/2, y+this.h)
      }
    }
    
    if (this.cursor0_x != -999) {
      const dx = map(this.cursor0_x, this.x_min, this.x_max, dx0, dx1);
      stroke(144);
      line(dx, y, dx, y+this.h);
    }
    if (this.cursor1_x != -999) {
      const dx = map(this.cursor1_x, this.x_min, this.x_max, dx0, dx1);
      stroke(150, 150, 0);
      line(dx, y, dx, y+this.h);
    }
    
    stroke(0, 225, 0)
    fill(0, 225, 0)
    let last_dx = -999, last_dy = -999
    const dy0 = this.y + this.h - PAD2, dy1 = this.y+PAD2
    for (let xx = this.x_min; xx<=this.x_max; xx++) {
      if (this.dp[xx] == 0) continue
      const dy = map(this.dp[xx], this.y_min, this.y_max, dy0, dy1);
      const dx = map(xx, this.x_min, this.x_max, dx0, dx1)
      
      if (last_dx != -999) {
        line(last_dx, last_dy, dx, dy)
      }
      circle(dx, dy, 2)
      
      last_dx = dx; last_dy = dy;
    }
    
    noFill();
    textAlign(RIGHT, CENTER)
    stroke(160);
    for (let yy=0; yy<=1; yy+=0.1) {
      let dy = map(yy, 0, 1, dy0, dy1);
      line(x, dy, x+4, dy);
    }
    
    noStroke();
    fill(160);
    const NBREAKS = 10
    for (let yy=0; yy<=NBREAKS; yy+=1) {
      let ydisp = "" + parseInt(map(yy, 0, 10, this.y_min, this.y_max));
      let dy = map(yy, 0, NBREAKS, dy0, dy1);
      text("" + ydisp, x, dy);
    }
    
    noStroke();
    fill(222);
    for (let xx = this.x_min; xx<=this.x_max; xx++) {
      this.columns[xx].forEach((y) => {
        const dy = map(y, this.y_min, this.y_max, dy0, dy1);
        const dx = map(xx, this.x_min, this.x_max, dx0, dx1)
        circle(dx, dy, 3)
      });
    }
    
    fill(222, 222, 0)
    if (this.cursor1_x != -999) {
      const dy = map(this.cursor1_y, this.y_min, this.y_max, dy0, dy1);
      const dx = map(this.cursor1_x, this.x_min, this.x_max, dx0, dx1)
      circle(dx, dy, 4)
    }
  }
  
  AdjustYMax(y) {
    while (this.y_max < y) {
      this.y_max *= 2;
    }
  }
  
  AddPoint(x, y) {
    this.columns[x].push(y)
    this.AdjustYMax(y);
  }
  
  SetMinY(x, y) {
    this.dp[x] = y
    this.AdjustYMax(y);
  }
  
  SetCursor1(x, y) {
    this.cursor1_x = x; this.cursor1_y = y;
  }
  
  HideCursor1() {
    this.cursor1_x = -999; this.cursor1_y = -999;
  }
  
  SetCursor0(x) {
    this.cursor0_x = x;
  }
  
  HideCursor0() {
    this.cursor0_x = -999;
  }
}

class Problem {
  constructor() {
    this.events = []
    this.idx = 0
  }
  
  SetTire(tidx) {
    this.events.push(["SetTire", tidx])
  }
  
  Step() {
    if (this.Done()) return;
    g_animator.Animate(g_dummy, "x", undefined, [0, 0], [0, 16]);
    const evt = this.events[this.idx]
    if (evt[0] == "SetTire") {
      g_tires.Focus(evt[1])
    } else if (evt[0] == "AddPoint") {
      g_linegraph.AddPoint(evt[1], evt[2]);
    } else if (evt[0] == "SetMinY") {
      g_linegraph.SetMinY(evt[1], evt[2]);
    } else if (evt[0] == "Unfocus") {
      g_tires.Unfocus()
    } else if (evt[0] == "SetCursor1") {
      g_linegraph.SetCursor1(evt[1], evt[2]);
    } else if (evt[0] == "SetCursor0") {
      g_linegraph.SetCursor0(evt[1]);
    } else if (evt[0] == "HideCursor0") {
      g_linegraph.HideCursor0();
    } else if (evt[0] == "HideCursor1") {
      g_linegraph.HideCursor1();
    }
    this.idx ++
  }
  
  Reset() {
    g_tires.Reset()
    this.idx = 0
  }
  
  Done() {
    return (this.idx >= this.events.length)
  }
  
  AddPoint(x, y) {
    this.events.push(["AddPoint", x, y])
  }
  
  SetMinY(x, y) {
    this.events.push(["SetMinY", x, y])
  }
  
  Unfocus() {
    this.events.push(["Unfocus"])
  }
  
  SetCursor1(x, y) {
    this.events.push(["SetCursor1", x, y])
  }
  
  SetCursor0(x, y) {
    this.events.push(["SetCursor0", x])
  }
  
  HideCursor0(x, y) {
    this.events.push(["SetCursor0"])
  }
  
  HideCursor1(x, y) {
    this.events.push(["SetCursor1"])
  }
  
  Render() {
    noStroke();
    fill(160);
    textAlign(LEFT, CENTER);
    text("Step " + (this.idx) + "/" + this.events.length,
      60, H-20)
  }
}

function Randomize() {
  const ntires = parseInt(1+random()*30);
  let tires = []
  for (let i=0; i<ntires; i++) {
    let f = 1 + parseInt(2+random()*10);
    let r = 1 + parseInt(2+random()*10);
    tires.push([f, r])
  }
  let change_time = parseInt(random()*100+1)
  let num_laps = parseInt(random()*28+4)
  SetProblem(tires, change_time, num_laps)
}

function SetProblem(tires, change_time, num_laps) {
  g_linegraph.SetXMax(num_laps)
  g_tires.tires = tires.slice()
  g_tires.Unfocus()
  g_linegraph.y_max = 10;
  
  g_problem.events = []
  g_tires.change_time = change_time;
  g_problem.idx = 0
  
  tires_str = ""
  tires.forEach((x) => {
    if (tires_str.length > 0) {
      tires_str += ","
    }
    tires_str += x[0] + "," + x[1]
  });
  ccall("RunInput", 'number', ['string','string','string'],
    [tires_str, ""+change_time, ""+num_laps])
  
  
  let g_delay = 100;
  if (g_problem.events.length < 100) {
    g_delay = 100;
  } else if (g_problem.length < 1000) {
    g_delay = 40;
  } else {
    g_delay = 16;
  }
  console.log("g_delay=" + g_delay)
}

let g_tires, g_linegraph, g_problem;
let g_animator;

function setup() {
  createCanvas(W, H);
  g_tires = new Tires()
  g_linegraph = new LineGraph()
  g_problem = new Problem()
  g_animator = new Animator();
  
  const btnStep = createButton("Step");
  btnStep.position(16, H-24);
  btnStep.mousePressed(() => {
    g_problem.Step();
  });
  
  const btnRand = createButton("Randomize");
  btnRand.position(W-100, H-24);
  btnRand.mousePressed(() => {
    Randomize();
  });
  
  SetProblem([[2,3],[3,4]], 5, 4)
}

let g_frame_count = 0;
let g_autorun = true;

function draw() {
  if (g_frame_count == 0) {
    if (g_autorun) {
      AutorunCallback();
    }
  }
  
  background(32);
  
  noStroke();
  fill(128);
  textAlign(LEFT, TOP);
  text("2188. Minimum Time to Finish the Race", 16, 16);
  
  g_tires.Render();
  g_linegraph.Render();
  g_problem.Render();
  
  g_animator.Update();
  if (g_autorun) {
    textAlign(RIGHT, BOTTOM);
    noStroke();
    fill(222, 222, 0);
    text("Autorun", W-124, H-16);
  }
}

function keyPressed() {
  if (key == ' ') {
    g_autorun = false;
  } else if (key == 'a' || key == 'A') {
    g_autorun = true;
    AutorunCallback();
  }
}

let g_dummy = {"x":0}
let g_delay = 100;

function AutorunCallback() {
  if (g_autorun) {
    
    if (g_problem.Done() == false && g_animator.IsDone()) {
      g_problem.Step();
    } else if (g_problem.Done() && g_animator.IsDone()) {
      g_animator.Animate(g_dummy, "x", undefined, [0, 0], [0, 2000]);
      setTimeout(() => {
        Randomize(); 
        AutorunCallback();
      }, 1800);
      return;
    }
    
    setTimeout(() => {
      AutorunCallback();
    }, g_delay);
  }
}