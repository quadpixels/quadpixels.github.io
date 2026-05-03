// 2022-10-22
// 2449. Minimum Number of Operations to Make Arrays Similar


const TEXT_SIZE = 18;
const Y_ODD_TO  = 116;
const Y_EVEN_TO = 196;
const Y_ODD_FROM = 148;
const Y_EVEN_FROM = 228;

const PENDING_VIEW_X = 16;
const PENDING_VIEW_Y = 84;

const TOTAL_OP_X = 16;
const TOTAL_OP_Y = 48;

const DURATION1 = 500;

class State {
  constructor(tgt_y_odd, tgt_y_even) {
    this.Reset();
    this.tgt_y_odd  = tgt_y_odd;
    this.tgt_y_even = tgt_y_even;
  }
  CategorizeOddElt(e, delay) {
    let tgt_x = this.odd_x + e.w/2;
    let tgt_y = this.tgt_y_odd;
    this.odd_x += e.w + 4;
    g_animator.Animate(e, "pos", "x", [e.pos.x, e.pos.x, tgt_x], [0, delay, delay + DURATION1]);
    g_animator.Animate(e, "pos", "y", [e.pos.y, e.pos.y, tgt_y], [0, delay, delay + DURATION1]);
    this.odd_elts.push(e);
  }
  CategorizeEvenElt(e, delay) {
    let tgt_x = this.even_x + e.w/2;
    let tgt_y = this.tgt_y_even;
    this.even_x += e.w + 4;
    g_animator.Animate(e, "pos", "x", [e.pos.x, e.pos.x, tgt_x], [0, delay, delay + DURATION1]);
    g_animator.Animate(e, "pos", "y", [e.pos.y, e.pos.y, tgt_y], [0, delay, delay + DURATION1]);
    this.even_elts.push(e);
  }
  Reset() {
    this.odd_elts = [];
    this.even_elts = [];
    this.odd_x = 16; // 左边的坐标
    this.even_x = 16;
  }
}

class SortSlot {
  constructor() {
    
  }
  SetElts(elts) {
    this.elts = elts;
    this.elts_sorted = [];
    this.src_x = elts[0].pos.x - elts[0].w/2;
  }
  Sort() {
    let tmp_sorted = this.elts.sort((a,b) => {
      return a.value - b.value;
    });
    this.elts_sorted = tmp_sorted;
    let tgt_x = this.src_x;
    for (let i=0; i<this.elts_sorted.length; i++) {
      let e = this.elts_sorted[i];
      g_animator.Animate(e, "pos", "x", [e.pos.x, tgt_x+e.w/2], [0, 400]);
      tgt_x += e.w + 4;
    }
  }
}

class Element {
  constructor(x, y, value, is_popup = false) {
    this.pos = new p5.Vector(x, y);
    this.value = value;
    this.h = TEXT_SIZE + 2;

    this.ComputeWidth();

    this.is_popup = is_popup;
    this.alpha = 1;
    this.last_value = value;
  }
  ComputeWidth() {
    push();
    textSize(TEXT_SIZE);
    this.w = textWidth("" + parseInt(this.value)) + 2;
    this.fill_color = "#ff3";
    pop();
  }
  Render() {
    push();
    textSize(TEXT_SIZE);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    fill("#222");
    
    if (this.value != this.last_value) {
      this.ComputeWidth();
    }
    
    if (!this.is_popup) {
      fill("rgba(32, 32, 32, " + this.alpha + ")");
      stroke("rgba(192, 192, 192, " + this.alpha + ")");
      rect(this.pos.x, this.pos.y, this.w, this.h);
    } else {
      noStroke();
      noFill();
    }
    
    noStroke();
    if (!this.is_popup) {
      fill(this.fill_color);
    } else {
      fill("rgba(192,192,192," + this.alpha + ")");
    }
    
    let txt = "";
    if (typeof(this.value) == "number") {
      txt = "" + parseInt(this.value);
    } else {
      txt = this.value;
    }
    
    text(txt, this.pos.x, this.pos.y);
    this.last_value = this.value;
    pop();
  }
}

class PendingView {
  constructor(x, y, value) {
    this.x = x; this.y = y; this.value = value;
  }
  Render() {
    push();
    textSize(TEXT_SIZE);
    textAlign(CENTER, CENTER);
    fill(192);
    let txt = "";
    if (this.value > 0) {
      txt = "+";
    } else if (this.value < 0) {
      txt = "-";
    }
    txt += parseInt(this.value);
    text(txt, this.x, this.y);
    noFill();
    stroke(192);
    const w = textWidth(txt);
    rectMode(CENTER);
    rect(this.x, this.y, w+4, TEXT_SIZE);
    pop();
  }
}

class TotalOpView {
  constructor() {
    this.num_ops = 0;
  }
  Render() {
    push();
    textAlign(LEFT, CENTER);
    fill(192);
    text(parseInt(this.num_ops) + " operations", TOTAL_OP_X, TOTAL_OP_Y);
    pop();
  }
}

let g_elts = [];
let g_popups = [];
let g_animator = new Animator();
let g_state_from = new State(Y_ODD_FROM, Y_EVEN_FROM);
let g_state_to = new State(Y_ODD_TO, Y_EVEN_TO);
let g_sortslot_from = new SortSlot();
let g_sortslot_to = new SortSlot();
let g_pending_view = new PendingView(PENDING_VIEW_X, PENDING_VIEW_Y, 0);
let g_totalop_view = new TotalOpView();

function GenInput() {
  const N = parseInt(Math.random() * 10) + 3;
  let tgt = [];
  for (let i=0; i<N; i++) {
    tgt.push(1+parseInt(random()*20));
  }
  const M = parseInt(Math.random() * 10);
  let arr = tgt.slice();
  for (let i=0; i<M; i++) {
    let idx0 = parseInt(random()*N);
    let idx1 = parseInt(random()*N);
    if (idx0 != idx1) {
      if (arr[idx0] > 2) {
        arr[idx0] -= 2;
        arr[idx1] += 2;
      } else {
        i--;
      }
    } else i--;
  }
  SetInput(tgt, arr);
}

function setup() {
  createCanvas(640, 480);
  //SetInput([8,12,6,1,2,5], [2,14,10,4,1,3]);
  GenInput()
  
  setTimeout(() => {
    g_autorun = true;
    AutoRunStep();
  }, 1000);
}

// Viz states

function SetInput(from, to) {
  g_elts = [];
  let xs = [8, 8];
  let ys = [(Y_ODD_FROM+Y_EVEN_FROM)/2, (Y_ODD_TO+Y_EVEN_TO)/2];
  let inputs = [from, to];
  let slots = [g_sortslot_from, g_sortslot_to];
  let slot_elts = [[], []]
  let colors = ["#ff3", "#3f3"];
  
  for (let itr=1; itr>=0; itr--) {
    let x = xs[itr]
    for (let i=0; i<inputs[itr].length; i++) {
      let e = new Element(x, ys[itr], inputs[itr][i]);
      e.pos.x += e.w / 2;
      x += e.w + 4;
      e.pos.y = ys[itr]
      g_elts.push(e);
      slot_elts[itr].push(e);
      e.fill_color = colors[itr];
    }
    slots[itr].SetElts(slot_elts[itr]);
  }
  
  g_pending_view.value = 0;
  g_state_from.Reset();
  g_state_to.Reset();
  g_totalop_view.num_ops = 0;
}

// 整体步骤的states

let g_state = "ready";

function DivideIntoOddAndEven() {
  let sortslots = [g_sortslot_from, g_sortslot_to];
  let states    = [g_state_from,    g_state_to];
  
  for (let itr=0; itr<2; itr++) {
    for (let i=0; i<sortslots[itr].elts_sorted.length; i++) {
      let e = sortslots[itr].elts_sorted[i];
      let delay = 100 * i;
      if ((e.value % 2) == 1) {
        states[itr].CategorizeOddElt(e, delay);
      } else {
        states[itr].CategorizeEvenElt(e, delay);
      }
    }
  }
}

let g_step_idx = 0;
let g_step_desc_idx = 0;

// Returns: true if done
function SingleStepThrough(pass_id) {
  const N0 = g_state_from.odd_elts.length;
  const N1 = g_state_from.even_elts.length;
  if (g_step_idx >= N0+N1) return true;
  
  let elt0 = undefined, elt1 = undefined;
  while (true) {
    if (g_step_idx < N0) {
      elt0 = g_state_from.odd_elts[g_step_idx];
      elt1 = g_state_to.odd_elts[g_step_idx];
    } else {
      elt0 = g_state_from.even_elts[g_step_idx - N0];
      elt1 = g_state_to.even_elts[g_step_idx - N0];
    }
    
    if (elt0 == undefined || elt1 == undefined) return;
    
    ok = false;
    switch (pass_id) {
      case 0: {
        if (elt1.value == elt0.value) {
          ok = true;
        }
        break;
      }
      case 1: {
        if (elt1.value < elt0.value) {
          ok = true;
        }
        break;
      }
      case 2: {
        if (elt1.value > elt0.value) {
          ok = true;
        }
        break;
      }
    }
    
    if (ok) break;
    
    g_step_idx ++;
    if (g_step_idx >= N0+N1) {
      return true;
    }
  }
  
  const T = 400;
  const dy = TEXT_SIZE;
  
  switch (pass_id) {  
    case 0: {
      g_animator.Animate(elt0, "pos", "x", [elt0.pos.x, elt1.pos.x], [0, T]);
      g_animator.Animate(elt0, "pos", "y", [elt0.pos.y, elt1.pos.y], [0, T]);
      break;
    }
    case 1: {
      g_animator.Animate(elt0, "pos", "x", [elt0.pos.x, elt1.pos.x], [0, T]);
      g_animator.Animate(elt0, "pos", "y", [elt0.pos.y, elt1.pos.y], [0, T]);
      g_animator.Animate(elt0, "value", undefined, [elt0.value, elt1.value], [0, T]);
      
      let absdiff = elt0.value - elt1.value
      let deduct = new Element(elt0.pos.x, elt0.pos.y, "-" + absdiff, true);
      g_animator.Animate(deduct, "pos", "x", [elt0.pos.x, elt1.pos.x], [0, T]);
      g_animator.Animate(deduct, "pos", "y", [elt0.pos.y+dy, elt1.pos.y+dy], [0, T]);
      g_animator.Animate(deduct, "alpha", undefined, [1,1,0], [0,T,T*2]);
      g_popups.push(deduct);
      
      let complement = new Element(elt0.pos.x, elt0.pos.y, "+" + absdiff, true);
      g_animator.Animate(complement, "pos", "x", [elt0.pos.x, g_pending_view.x], [0, T]);
      g_animator.Animate(complement, "pos", "y", [elt0.pos.y+dy, g_pending_view.y], [0, T],
                        ()=>{
        g_pending_view.value += absdiff;
      });
      g_animator.Animate(complement, "alpha", undefined, [1,1,0], [0,T,T*1.2]);
      g_popups.push(complement);
      
      g_animator.Animate(g_totalop_view, "num_ops", undefined,
                        [g_totalop_view.num_ops, g_totalop_view.num_ops + absdiff/2],
                        [0, T]);
      break;
    }
    case 2: {
      g_animator.Animate(elt0, "pos", "x",
                         [elt0.pos.x, elt0.pos.x, elt1.pos.x], [0, T, T*2]);
      g_animator.Animate(elt0, "pos", "y",
                         [elt0.pos.y, elt0.pos.y, elt1.pos.y], [0, T, T*2]);
      g_animator.Animate(elt0, "value", undefined,
                         [elt0.value, elt0.value, elt1.value], [0, T, T*2]);
      
      let absdiff = elt1.value - elt0.value
       
      g_animator.Animate(g_pending_view, "x", undefined,
                        [g_pending_view.x, elt0.pos.x], [0, T]);
      g_animator.Animate(g_pending_view, "y", undefined,
                        [g_pending_view.y, elt0.pos.y+dy], [0, T]);
      g_animator.Animate(g_pending_view, "value", undefined,
                        [g_pending_view.value, g_pending_view.value, g_pending_view.value - absdiff], [0, T, T+1]);
      
      let add = new Element(elt0.pos.x, elt0.pos.y, "+" + absdiff, true);
      g_animator.Animate(add, "pos", "x", 
                         [elt0.pos.x, elt0.pos.x, elt1.pos.x], [0, T, T*2]);
      g_animator.Animate(add, "pos", "y", 
                         [elt0.pos.y+dy, elt0.pos.y+dy, elt1.pos.y+dy], [0, T, T*2]);
      g_animator.Animate(add, "alpha", undefined,
                         [0,0,1,1,0], [0,T,T+1,T*2, T*3]);

      g_popups.push(add);
    }
  }
  
  g_step_idx ++;
}

function CurrStepThroughDone() {
  const N0 = g_state_from.odd_elts.length;
  const N1 = g_state_from.even_elts.length;
  if (g_step_idx >= N0+N1) return true;
  return false;
}

function draw() {
  background(32);
  push();
  noStroke();
  fill(192);
  textAlign(LEFT, TOP);
  text("2449. Minimum Number of Operations to Make Arrays Similar", 8, 8);
  if (g_autorun) {
    textAlign(RIGHT, TOP);
    fill("#ff3");
    text("Autorun", width-8, 8);
  }
  
  g_animator.Update();
  g_elts.forEach((e) => {
    e.Render();
  })
  let next_popups = [];
  g_popups.forEach((p) => {
    p.Render();
    if (p.alpha > 0) { next_popups.push(p); }
  })
  g_popups = next_popups;
  g_pending_view.Render();
  
  textAlign(LEFT, TOP);
  textSize(20);
  fill(192);
  let tx = 32, ty = 320;
  
  const steps = [
    "1. Sort input",
    "2. Divide to odd and even elements",
    "3. (Skip equal elements)",
    "4. Count number of -2 operations",
    "5. Apply the complement operations (+2)",
    "6. Done",
  ];
  
  for (let i=0; i<steps.length; i++) {
    if (g_step_desc_idx == i) {
      textAlign(RIGHT, TOP);
      text(">", tx-3, ty);
      fill("#ff3");
    } else {
      fill(192);
    }
    
    textAlign(LEFT, TOP);
    text(steps[i], tx, ty);
    
    ty += 23;
  }

  g_totalop_view.Render();
  
  pop();
}

function IncrementPlayState() {
  g_animator.FinishAllPendingAnimations();
  g_animator.Update();
  switch (g_state) {
    case "ready": {
      g_sortslot_from.Sort();
      g_sortslot_to.Sort();
      g_state = "divide_to_odd_and_even";
      break;
    }
    case "divide_to_odd_and_even": {
      DivideIntoOddAndEven();
      g_state = "step_through_eq";
      g_step_desc_idx = 2;
      break;
    }
    case "step_through_eq": {
      SingleStepThrough(0);
      if (CurrStepThroughDone()) {
        g_step_idx = 0; g_state = "step_through_deduct";
        g_step_desc_idx = 3;
      }
      break;
    }
    case "step_through_deduct": {
      SingleStepThrough(1);
      if (CurrStepThroughDone()) {
        g_step_idx = 0; g_state = "step_through_add";
        g_step_desc_idx = 4;
      }
      break;
    }
    case "step_through_add": {
      SingleStepThrough(2);
      if (CurrStepThroughDone()) {
        g_step_idx = 0; g_state = "done";
        g_step_desc_idx = 5;
      }
      break;
    }
    case "done": {
      g_animator.Animate(g_pending_view, "x", undefined,
                        [g_pending_view.x, PENDING_VIEW_X], [0, 500]);
      g_animator.Animate(g_pending_view, "y", undefined,
                        [g_pending_view.y, PENDING_VIEW_Y], [0, 500]);
      g_state = "gen_new_input";
      break;
    }
    case "gen_new_input": {
      GenInput();
      g_state = "ready";
      g_step_desc_idx = 0;
      break;
    }
  }
}

let g_autorun = false;
function keyPressed() {
  if (key == ' ') {
    IncrementPlayState()
  } else if (key == 'a') {
    if (!g_autorun) {
      g_autorun = true;
      AutoRunStep();
    } else {
      g_autorun = false;
    }
  }
}

function AutoRunStep() {
  if (g_autorun) {
    if (g_animator.IsDone()) {
      IncrementPlayState();
    }
    
    let t = 400;
    if (g_state == "gen_new_input") {
      t = 1000;
    } else if (g_state == "ready") {
      t = 1000;
    }
    
    setTimeout(() => {
      AutoRunStep();
    }, t);
  }
}