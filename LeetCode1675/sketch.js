// 2020-12-06

class BinaryHeap {
  constructor() {
    this.elts = [];
  }
  
  GetValue(idx) {
    return this.elts[idx][0];
  }
  
  SwapEntries(idx0, idx1) {
    const tmp = this.elts[idx0];
    this.elts[idx0] = this.elts[idx1];
    this.elts[idx1] = tmp;
  }
  
  Push(elt) {
    this.elts.push(elt);
    let idx = this.elts.length;
//    console.log("==========" + this.elts.length + "pushed" + elt)
    let txt = "";
    this.elts.forEach((e) => txt += " " + e[0]);
//    console.log(txt)
    while (idx > 1) {
      let idx_next = parseInt(idx / 2);
      if (this.GetValue(idx-1) > this.GetValue(idx_next-1)) {
        this.SwapEntries(idx-1, idx_next-1);
      } else break;
      idx = floor(idx / 2);
    }
    txt = "";
    this.elts.forEach((e) => txt += " " + e[0]);
//    console.log(txt)
  }
  
  Top() { return this.elts[0]; }
  
  Pop() {
    let ret = this.elts[0];
    this.elts[0] = this.elts.pop();
    let idx = 1;
    const N = this.elts.length;
    while (idx <= N) {
      const curr_value = this.GetValue(idx-1);
      let idx_next1 = idx*2, idx_next2 = idx_next1+1, idx_next;
      let ok1 = true, ok2 = true;
      if (idx_next1 <= N && this.GetValue(idx_next1-1) > curr_value) {
        ok1 = false;
      }
      if (idx_next2 <= N && this.GetValue(idx_next2-1) > curr_value) {
        ok2 = false;
      }
      if (ok1 && ok2) break;
      let next_value;
      if (!ok1) {
        if (next_value == undefined) {
          next_value = this.GetValue(idx_next1-1);
          idx_next = idx_next1;
        }
      }
      if (!ok2) {
        if (next_value == undefined || next_value < this.GetValue(idx_next2-1)) {
          next_value = this.GetValue(idx_next2-1);
          idx_next = idx_next2;
        }
      }
      
      // Swap
      this.SwapEntries(idx_next-1, idx-1);
      idx = idx_next;
    }
    return ret;
  }
  
  Print() {
    let txt = "";
    this.elts.forEach((e) => txt += e + " ");
    console.log(txt);
  }
  
  Empty() { return this.elts.length < 1; }
}

class Entry {
  constructor(x) {
    this.x_orig = x;
    if (x % 2 == 1) {
      x *= 2;
    }
    this.x = x;
    this.elt = x;
  }
  
  GetX() { return this.x; }
  GetElt() { return this.elt; }
  Halve() { this.elt /= 2; }
}

class Viewport {
  constructor() { this.Reset(); }
  
  Reset() {
    this.entries = []; 
    this.xmin = 0;
    this.xmax = 1;
    this.done = false;
    this.heap = new BinaryHeap();
    this.max_elt = -1e20;
    this.min_elt = 1e20;
  }
  
  Randomize() {
    const n = floor(random(5,100));
    this.Reset();
    for (let i=0; i<n; i++) {
      let elt;
      if (random() < 0.5) elt = pow(2, floor(random(1, 10)))
      else elt = floor(random(1, 100000))
      this.AddEntryByElement(elt);
    }
  }
  
  AddEntryByElement(x) {
    const e = new Entry(x);
    this.entries.push(e);
    this.xmax = max(this.xmax, e.GetX());
    this.heap.Push([e.GetElt(), e])
    
    this.min_elt = min(this.min_elt, e.GetElt());
    this.max_elt = max(this.max_elt, e.GetElt());
  }
  
  Render() {
    const N = this.entries.length;
    for (let i=0; i<N; i++) {
      const e = this.entries[i];
      const dy = map(i, 0, N-1, height*0.05, height*0.95);
      let x = e.GetX();
      push();
      noStroke();
      while (x > 0) {
        const dx = map(x, 0, this.xmax, width*0.05, width*0.95);
        if (x == e.GetElt()) {
          if (x % 2 == 1) fill("#f33");
          else fill("#3f3");
          circle(dx, dy, 5);
        } else {
          fill("#888");
          circle(dx, dy, 3);
        }
        x = floor(x/2);
      }
      
      noFill();
      strokeWeight(0.5);
      if (!this.done) { stroke("#888"); }
      else { stroke("#3f3"); }
      const dx0 = map(this.min_elt, 0, this.xmax, width*0.05, width*0.95),
            dx1 = map(this.max_elt, 0, this.xmax, width*0.05, width*0.95);
      line(dx0, 0, dx0, height);
      line(dx1, 0, dx1, height);
      pop();
    }
  }
  
  Step() {
    if (this.heap.Top()[0] % 2 == 1) { this.done = true; return; }
    if (!this.done) {
      const e_and_ety = this.heap.Top();
      const e = e_and_ety[0], entry = e_and_ety[1];
      this.heap.Pop();
      entry.Halve();
      this.heap.Push([e / 2, entry]);
      this.min_elt = min(this.min_elt, e/2);
      if (this.heap.Top()[0] % 2 == 1) { 
        console.log("Done");
        this.done = true; return; 
      } else {
        this.max_elt = min(this.max_elt, this.heap.Top()[0]);
      }
    }
  }
}

let g_viewport;

function setup() {
  createCanvas(400, 400);
  g_viewport = new Viewport();
  [4,1,5,20,3].forEach((e) => {
    g_viewport.AddEntryByElement(e);
  });
}

let g_last_ms = 0;
let g_last_autorun_ms = 0;
let g_frame_count = 0;
const INTERVAL = 30; // ms
function draw() {
  const ms = millis();
  if (g_frame_count > 0) {
    while (g_last_autorun_ms < ms) {
      g_last_autorun_ms += INTERVAL;
      AutorunStep();
    }
  } else {
    g_last_autorun_ms = ms;
  }
  
  background(32);
  g_viewport.Render();
  
  g_frame_count ++;
  g_last_ms = ms;
}

function keyPressed() {
  if (key == ' ') { AutorunStep(); }
  if (key == 'r') { g_viewport.Randomize(); }
}

let done_countdown = 0;
function AutorunStep() {
  if (g_viewport.done) { 
    if (done_countdown < 1) {
      g_viewport.Randomize(); 
      done_countdown = 10;
    } else done_countdown --;
  }
  else g_viewport.Step();
}