// 2022-03-05
// 2197. Replace Non-Coprime Numbers in Array
// https://leetcode.com/contest/weekly-contest-283/problems/replace-non-coprime-numbers-in-array/

const W = 480;
const H = 480;
const MARGIN_X = 32;
const MARGIN_Y = 64;

const TEXT_SIZE = 16;
const CELL_H = TEXT_SIZE + 3;

class Stepper {
  constructor() {
    this.idx = 0;
    this.target_idx = 0;
    this.countdown = 0;
    this.duration = 100;
    this.highlighted_cell = undefined;
  }
  
  StepTo(idx) {
    if (this.idx == -999) {
      this.idx = 0;
    }
    this.target_idx = idx;
    this.countdown = g_ffwd ? this.duration / 10 : this.duration;
  }
  
  Update(delta_ms) {
    if (!this.Done()) {
      this.countdown -= delta_ms;
      if (this.countdown <= 0) {
        const c = this.highlighted_cell;
        if (c != undefined) {
          c.highlight = -999;
        }
        if (this.target_idx > this.idx) {
          this.idx ++;
        } else if (this.target_idx < this.idx) {
          this.idx --;
        }
        
        if (this.target_idx != this.idx) {
          this.countdown = this.duration;
        }
        
        if (this.idx != -999) {
          this.highlighted_cell = g_cells[this.idx];
          this.highlighted_cell.highlight = 0;
        }
      }
    }
  }
  
  Unfocus() {
    if (this.highlighted_cell != undefined) {
      this.highlighted_cell.highlight = -999;
    }
    this.idx = -999;
    this.target_idx = -999;
  }
  
  Done() {
    return (this.countdown <= 0 && this.idx == this.target_idx);
  }
  
  Finish() {
    this.countdown = 0;
    this.Update(1);
  }
};

class Cell {
  // 中间对齐
  constructor(val) {
    this.w = 0; this.h = 0;
    this.x = W/2; this.y = H/2;
    this.value = val;
    this.SetValue(val);
    this.highlight = -999; // 高亮等级
    this.done = false;
  }
  
  SetValue(v) {
    this.value = v;
    textSize(TEXT_SIZE);
    this.h = CELL_H;
    this.w = 3 + textWidth(v)
  }
  
  Render() {
    textSize(TEXT_SIZE);
    fill(77);
    noStroke();
    rectMode(CENTER);
    
    switch (this.highlight) {
      case 0: fill("#222"); stroke("#3F3"); break;
      case 1: fill("#44b"); break;
      case 2: fill("#494"); break;
      default: fill("#555"); break;
    }
    rect(this.x, this.y, this.w, this.h);
    
    noStroke();
    
    switch (this.highlight) {
      case 0: fill("#3F3"); break;
      case 2: fill("#ccc"); break;
      default: fill("#ccc"); break;
    }
    textAlign(CENTER, CENTER);
    text(this.value, this.x, this.y);
  }
  
  Update(delta_ms) {
    
  }
  
  Done() {
    return this.done;
  }
}

let g_cells = [];
let g_inflight_cells = [];
let g_animator = new Animator();
let g_stepper = new Stepper();

function RemoveFromArray(arr, v) {
  let x = arr.slice();
  const N = arr.length;
  for (let i=0; i<N; i++) arr.pop();
  x.forEach((elt) => {
    if (elt != v) {
      arr.push(elt);
    }
  });
}

function LayoutCells(cells, x0, y0, x1, y1) {
  let x = x0, y = y0;
  const PAD = 3;
  for (let i=0; i<cells.length; i++) {
    if (x > x1) {
      y += CELL_H + PAD;
      x = x0;
    }
    const c = cells[i];
    c.target_x = x + c.w/2;
    c.target_y = y + c.h/2;
    
    x += c.w + PAD;
    const t = g_ffwd ? 10 : 500;
    g_animator.Animate(c, "x", undefined, [c.x, c.target_x], [0, t], undefined);
    g_animator.Animate(c, "y", undefined, [c.y, c.target_y], [0, t], undefined);
  }
}

function MergeCells(from, to, val) {
  const c0 = g_cells[from];
  let v0 = g_cells[from].value;
  c0.SetValue(" ")
  let c1 = g_cells[to];
  
  let c = new Cell(v0);
  c.x = c0.x;
  c.y = c0.y;
  c.highlight = c0.highlight;
  g_inflight_cells.push(c);
  const t = g_ffwd ? 20 : 200, t2 = g_ffwd ? 40 : 400;
  g_animator.Animate(c, "x", undefined, [c.x, c.x, c1.x], [0, t, t2], undefined);
  g_animator.Animate(c, "y", undefined, [c.y, c.y, c1.y], [0, t, t2], ()=>{
    g_cells[to].SetValue(val);
    c.done = true;
    LayoutCells(g_cells, MARGIN_X, MARGIN_Y, W-MARGIN_X*2, H-MARGIN_Y*2);
  });
}

function ClearZeros() {
  let nc = [];
  g_cells.forEach((x) => {
    let should_delete = false;
    if (typeof(x.value) == "string" && x.value.trim() == "") {
      should_delete = true;
    }
    if (!should_delete) { nc.push(x); }
  });
  g_cells = nc;
  LayoutCells(g_cells, MARGIN_X, MARGIN_Y, W-MARGIN_X*2, H-MARGIN_Y*2);
}

class Problem {
  constructor() {
    this.nums = [ 6,4,3,2,7,6,2 ];
    this.moves = [];
    this.move_idx = 0;
  }
  
  Render() {
    noStroke();
    fill("#ccc");
    textAlign(LEFT, CENTER);
    let txt = this.move_idx + " / " + this.moves.length + " steps ";
    /*
    if (g_animator.IsDone()) {
      txt += " +anim";
    } else {
      txt += " -anim";
    }
    if (g_stepper.Done()) {
      txt += " +step";
    } else {
      txt += " -step";
    }*/
    
    
    text(txt, 16, H-80)
    
    if (this.Done()) {
      fill("#0F0");
      text("Done!", 16+8+textWidth(txt), H-80);
    }
  }
  
  SetProblem(nums) {
    this.nums = nums;
    this.moves = [];
    this.move_idx = 0;
  }
  
  Layout() {
    g_cells = [];
    this.nums.forEach((n) => {
      g_cells.push(new Cell(n));
    });
    LayoutCells(g_cells, MARGIN_X, MARGIN_Y, W-MARGIN_X*2, H-MARGIN_Y*2);
  }
  
  Done() {
    return (this.move_idx >= this.moves.length);
  }
  
  Reset() { 
    this.move_idx = 0;
    this.Layout();
  }
  
  Step() {
    
    // Finish all pending
    if (!g_animator.IsDone()) {
      //g_animator.FinishAllPendingAnimations();
      return;
    }
    if (!g_stepper.Done()) {
      //g_stepper.Finish();
      return;
    }
    
    if (this.Done()) return;
    const m = this.moves[this.move_idx];
    if (m[0] == "StepTo") {
      g_stepper.StepTo(m[1]);
    } else if (m[0] == "Highlight1") {
      g_cells[m[1]].highlight = 1;
    } else if (m[0] == "Highlight2") {
      g_cells[m[1]].highlight = 2;
    } else if (m[0] == "MergeCells") {
      MergeCells(m[1], m[2], m[3]);
    } else if (m[0] == "ClearHighlights12") {
      g_cells.forEach((c) => {
        if (c.highlight == 1 || c.highlight == 2)
          c.highlight = -999; 
      });
    } else if (m[0] == "ClearHighlight0") {
      g_stepper.Unfocus();
    } else if (m[0] == "ClearZeros") {
      ClearZeros();
    }
    
    this.move_idx ++;
  }
  
  StepTo(i) { this.moves.push(["StepTo", i]); }
  SendHighlight1(i) { this.moves.push(["Highlight1", i]); }
  SendHighlight2(i) { this.moves.push(["Highlight2", i]); }
  SendMergeCells(from, to, val) { this.moves.push(["MergeCells", from, to, val]); }
  ClearHighlights12() { this.moves.push(["ClearHighlights12"]); }
  ClearHighlight0() { this.moves.push(["ClearHighlight0"]); }
  DeleteZeros() { this.moves.push(["ClearZeros"]); }
}

let g_problem;

function setup() {
  createCanvas(W, H);
  g_problem = new Problem();
  g_animator = new Animator();
  
  LoadDefaultInput();
  
  const btn_step = createButton("Step");
  btn_step.position(16, H-24);
  btn_step.mousePressed(() => {
    g_problem.Step();
  });
  
  const btn_ffwd = createButton("Fast\nForward");
  btn_ffwd.position(16, H-48);
  btn_ffwd.mousePressed(() => {
    g_ffwd = true;
  });
  btn_ffwd.mouseReleased(() => {
    g_ffwd = false;
  });
  
  const btn_autorun = createButton("Autorun");
  btn_autorun.position(16 + 4 + btn_ffwd.width, H-48);
  btn_autorun.mousePressed(() => {
    g_autorun = !g_autorun;
    if (g_autorun) AutorunCallback();
  });
  
  let x = W-4;
  
  const btn_randomize = createButton("Random");
  x -= btn_randomize.width;
  x -= 4;
  btn_randomize.position(x, H-48);
  btn_randomize.mousePressed(() => {
    g_animator.FinishAllPendingAnimations();
    g_stepper.Finish();
    Randomize(); 
  });
  
  const btn_input_2 = createButton("Input 2");
  x -= btn_input_2.width;
  x -= 4;
  btn_input_2.position(x, H-48);
  btn_input_2.mousePressed(() => {
    g_animator.FinishAllPendingAnimations();
    g_stepper.Finish();
    let input = [];
    for (let i=0; i<40; i++) {
      input.push(2); input.push(3);
    }
    input.push(6);
    input.push(6);
    input.push(6);
    g_problem.SetProblem(input);
    ccall("RunInput", "void", ["string"], [input.join(",")]);
    g_problem.Reset();
  });
  
  const btn_input_1 = createButton("Input 1");
  x -= btn_input_1.width;
  x -= 4;
  btn_input_1.position(x, H-48);
  btn_input_1.mousePressed(() => {
    g_animator.FinishAllPendingAnimations();
    g_stepper.Finish();
    LoadDefaultInput();
  });
}

let g_frame_count = 0;
let g_autorun = true;

let g_last_ms = 0;
function draw() {
  const ms = millis();
  const delta_ms = ms - g_last_ms;
  if (g_frame_count == 0) {
    if (g_autorun) {
      AutorunCallback();
    }
  }
  
  background(32);
  
  textAlign(LEFT, TOP);
  noStroke();
  fill("#ccc");
  text("2197. Replace Non-Coprime Numbers in Array", 3, 3);
  
  g_stepper.Update(delta_ms);
  g_cells.forEach((c) => {
    c.Update(delta_ms);
    c.Render(); 
  });
  let inflight_next = [];
  g_inflight_cells.forEach((c) => {
    c.Update(delta_ms);
    c.Render();
    if (!c.Done()) {
      inflight_next.push(c);
    }
  });
  g_inflight_cells = inflight_next;
  g_problem.Render();
  g_animator.Update();
  
  if (g_autorun) {
    textAlign(RIGHT, TOP);
    noStroke();
    fill(222, 222, 0);
    text("Autorun", W-4, 4);
  }
  g_last_ms = ms;
  g_frame_count ++;
}

function keyPressed() {
  if (key == ' ') {
    g_autorun = false;
  } else if (key == 'a' || key == 'A') {
    g_autorun = true;
    AutorunCallback();
  }
}

function LoadDefaultInput() {
  let input = [6,4,3,2,7,6,2];
  g_problem.SetProblem(input);
  ccall("RunInput", "void", ["string"], [input.join(",")]);
  g_problem.Reset();
}

function Randomize() {
  const N = parseInt(Math.random() * 30) + 5;
  let ret = [];
  for (let i=0; i<N; i++) {
    ret.push(parseInt(1 + Math.random() * 20));
  }
  const NMULT = N;
  for (let i=0; i<NMULT; i++) {
    const idx = parseInt(Math.random() * N);
    if (Math.random() > 0.5) {
      ret[idx] *= 2;
    } else {
      ret[idx] *= 3;
    }
  }
  g_problem.SetProblem(ret);
  ccall("RunInput", "void", ["string"], [ret.join(",")]);
  g_problem.Reset();
}

let g_dummy = {"x":0}
let g_ffwd = false;
let g_delay = 120;
let g_replay_callback_set = false;

function AutorunCallback() {
  if (g_autorun) {
    
    if (g_problem.Done() == false && g_animator.IsDone()) {
      g_replay_callback_set = false;
      g_problem.Step();
    } else if (g_problem.Done() && g_animator.IsDone() &&
      g_replay_callback_set == false) {
      g_replay_callback_set = true;
      setTimeout(() => {
        Randomize(); 
        AutorunCallback();
      }, 1800);
      return;
    }
    
    setTimeout(() => {
      AutorunCallback();
    }, g_ffwd ? g_delay / 10 : g_delay);
  }
}