// 2020-08-09
// Original Q: https://leetcode.com/problems/minimum-cost-to-cut-a-stick/

const SPRING_L0 = 67;
const HOME_Y0_PAD = 66;

function GetParticleDuration() {
  if (!g_autorun) { return 500; }
  else return 77;
}

let g_autorun = true;
let g_frame_count = 0;

function UseCurrInput() {
  let n = parseInt(g_n_input.value());
  let cuts = JSON.parse(g_data_input.value());
  // Sanity check
  let ok = true;
  cuts.forEach((c) => {
    if (c <= 0 || c >= n) { 
      ok = false;
      SetGlobalMessage("Error: cuts cannot be < 0 or > n");
    }
  });
  const LEN_LIMIT = 20;
  if (cuts.length > LEN_LIMIT) {
    SetGlobalMessage("Error: length of cuts cannot be larger than " +
      LEN_LIMIT);
  }
  
  if (!ok) {
    
  } else {
    g_solution = new Solution(n, cuts);
    g_dptable = new DPTable(n, cuts);
    g_dptable.RefreshCanvas();
    SetGlobalMessage("New input assigned");
    g_nodes = [];
    g_springs = [];
    g_key_to_node = {};
  }
}

function RandomizeInput() {
  const len = parseInt(10 + random(1000));
  // 题目是100但是只能显示出20
  const nsplit = parseInt(1 + min(len/2, random(20)));
  let splits = new Set();
  for (let i=0; i<nsplit; i++) {
    let s;
    do {
      s = parseInt(1 + random(len-2));
    } while (splits.has(s))
    splits.add(s);
  }
  let cuts = [];
  splits.forEach((x) => cuts.push(x));
  cuts = sort(cuts);
  g_solution = new Solution(len, cuts);
  g_dptable = new DPTable(len, cuts);
  g_dptable.RefreshCanvas();
  g_nodes = [];
  g_springs = [];
  g_key_to_node = {};
  SetGlobalMessage("New random input assigned");
  g_n_input.value(len+"");
  g_data_input.value("["+cuts+"]");
}

if (!Array.prototype.remove) {
  Array.prototype.remove = function(val) {
    var i = this.indexOf(val);
         return i>-1 ? this.splice(i, 1) : [];
  };
}

// Currently highlighted TreeNode
let g_highlight_key = undefined;
let g_msg = "";
let g_data_input, g_n_input;
let g_particles = [];

function SetGlobalMessage(msg) {
  //console.log("[SetGlobalMessage] " + msg);
  g_msg = msg;
}

class Particle {
  constructor(p0, p1, timeout, cb=undefined) {
    this.p0 = p0; this.p1 = p1;
    this.dir = p1.copy().sub(p0);
    this.tot_dist = this.dir.mag();
    this.dir.normalize();
    this.marked_for_delete = false;
    this.timeout = timeout;
    this.start_millis = millis();
    this.pos = this.p0.copy();
    this.cb = cb;
  }
  
  Update() {
    const us = millis();
    const c = (us - this.start_millis) / (this.timeout);
    if (c > 1) { this.MarkForDelete(); }
    this.pos.x = lerp(this.p0.x, this.p1.x, c);
    this.pos.y = lerp(this.p0.y, this.p1.y, c);
  }
  
  Render() {
    if (this.marked_for_delete) {
      return;
    }
    noStroke();
    fill(32, 192, 32, 128);
    const LEN = 55;
    
    //circle(this.pos.x, this.pos.y, 30);
    let pp0, pp1;
    const us = millis();
    const c = (us - this.start_millis) / (this.timeout);
    const elapsed = c * this.tot_dist;
    if (elapsed < LEN/2) { pp0 = this.p0; }
    else { pp0 = this.pos.copy().sub(this.dir.copy().mult(LEN/2)); }
    if (elapsed > this.tot_dist - LEN/2) { pp1 = this.p1; }
    else { pp1 = this.pos.copy().add(this.dir.copy().mult(LEN/2)); }
    
    stroke(32, 192, 32, 128);
    strokeWeight(10);
    //console.log(pp0);
    //console.log(pp1);
    line(pp0.x, pp0.y, pp1.x, pp1.y);
    strokeWeight(1);
  }
  
  MarkForDelete() {
    if (this.marked_for_delete) return;
    if (this.cb != undefined) { this.cb(); }
    this.marked_for_delete = true; 
  }
}

class Solution {
  constructor(n, cuts) {
    this.n = n;
    this.cuts = cuts;
    this.breaks = [0].concat(cuts).concat([n]);
    this.dp = {};
    this.return_values = {}
    this.Reset();
    this.home_y0s = [];
    this.done = false;
    for (let i=0; i<this.breaks.length-1; i++) {
      const lb = this.breaks[i], ub = this.breaks[i+1];
      const y = this.GetLevel(lb, ub);
      const t = y / this.breaks.length;
      this.home_y0s.push(lerp(HOME_Y0_PAD, height-HOME_Y0_PAD, t));
    }
  }
  
  Reset() {
    g_nodes = [];
    g_springs = [];         
    g_key_to_node = {};
    g_dptable = new DPTable(this.n, this.cuts);
    g_dptable.RefreshCanvas();
    
    this.callbacks = [() => {
      const key = this.GetKey(0, this.n);
      OnAppear(key, undefined);
      return this.GetCost(0, this.n, 0, key);
    }]
    this.done = false;
  }
  
  GetKey(lb, ub) {
    const key = "(" + lb + ", " + ub + ")";
    return key;
  }

  GetLevel(lb, ub) {
    const idx0 = this.breaks.indexOf(lb);
    const idx1 = this.breaks.indexOf(ub);
    return this.breaks.length - (idx1-idx0+1);
  }
  
  GetCost(lb, ub, reentry_step, parent_key) {
    //console.log("GetCost " + lb + " " + ub + " " + reentry_step);
    const key = this.GetKey(lb, ub);
    const callname = "GetCost(" + lb + ", " + ub + ")";

    switch (reentry_step) {
      case 0: {
        OnEnter(key);
        g_highlight_key = key;
        let ret = [];
        if (key in this.dp) {
          SetGlobalMessage(callname + "'s result is already in the DP table");
          this.return_values[key] = this.dp[key];
          
          const p0 = g_dptable.GetGlobalXY(lb, ub);
          const p1 = g_key_to_node[key].pos;
          
          g_particles.push(new Particle(p0, p1, GetParticleDuration(), function() {
            OnExit(key, parent_key);
          }));
          g_highlight_key = undefined;
        } else {
          SetGlobalMessage(callname + " has started");
          ret = [(key) => {
            return this.GetCost(lb, ub, 1, parent_key);
          }];
        }
        return ret;
      }

      case 1: {
        let is_atomic = true;
        let ret = [];
        let num_spawned = 0;
        this.cuts.forEach((c) => {
          if (c > lb && c < ub) {
            is_atomic = false;
            ret.push(() => { return this.GetCost(lb, c, 0, key); });
            ret.push(() => { return this.GetCost(c, ub, 0, key); });
            OnAppear(this.GetKey(lb, c), key, this.GetLevel(lb, c));
            OnAppear(this.GetKey(c, ub), key, this.GetLevel(c, ub));
            num_spawned += 2;
          }
        });
        SetGlobalMessage(callname + " has spawned " + num_spawned + " sub calls")
        ret.push(() => { return this.GetCost(lb, ub, 2, parent_key); });
        return ret;
      }

      case 2: {
        let is_atomic = true;
        let cut_cost = 1e9;
        let out;
        this.cuts.forEach((c) => {
          if (c > lb && c < ub) {
            is_atomic = false;
            const key1 = this.GetKey(lb, c);
            const key2 = this.GetKey(c, ub);
            const cand = this.return_values[key1] +
              this.return_values[key2];
            cut_cost = min(cut_cost, cand);
          }
        });
        if (!is_atomic) out = cut_cost + (ub - lb);
        else out = 0;
        this.dp[key] = out;
        this.return_values[key] = out;

        SetGlobalMessage(callname + " returns " + out);
        const p1 = g_dptable.GetGlobalXY(lb, ub);
        const p0 = g_key_to_node[key].pos;
        
        g_particles.push(new Particle(p0, p1, GetParticleDuration(), function() {
          g_dptable.OnDPCellFilled(lb, ub); // 没有逻辑上的副作用只有看着的区别
        }));
        OnExit(key, parent_key);
        g_highlight_key = undefined;
        return [];
      }
    }
  }

  Step() {
    if (this.done == true) {
      this.Reset();
      return;
    }
    
    let c = this.callbacks;
    const cb = c[c.length - 1];
    this.callbacks = c.slice(0, c.length - 1);
    const new_cbs = cb();
    for (let i = new_cbs.length - 1; i >= 0; i--) {
      this.callbacks.push(new_cbs[i]);
    }
    //console.log("Step, |callbacks|=" + this.callbacks.length);
    
    if (this.callbacks.length < 1) {
      this.done = true;
    }
  }
}

class DPTable {
  constructor(n, cuts, x=0, y=24) {
    this.breaks = [0].concat(cuts).concat([n]);
    let pad = 0;
   
    cuts.forEach((c) => {
      pad = max(pad, textWidth(c)); // Assume same font size
    });
    
    this.cuts = cuts;
    const L = 12;
    this.L = L;
    this.x0 = this.y0 = pad + L;
    const N = this.breaks.length;
    this.g = createGraphics(N*L+pad+L, N*L+pad+L);
    this.x = x;
    this.y = y;
  }
  
  RefreshCanvas() {
    this.g.clear();
    //this.g.background(64, 64, 64, 64);
    this.g.background(0, 0, 0, 0);
    const N = this.breaks.length;
    
    this.g.stroke(255);
    this.g.noFill();
    // From y to x
    for (let y=0; y<N; y++) {
      for (let x=0; x<N; x++) {
        if (x == y) continue;
        if (x >= y) this.do_DrawCell(x, y);
      }
    }
    
    // X labels
    this.g.noStroke();
    this.g.textAlign(LEFT, CENTER);
    this.g.fill(255);
    for (let x=0; x<N; x++) {
      const dx0 = this.x0 + (0.5+x) * this.L;
      this.g.push();
      this.g.translate(dx0, this.y0-4);
      this.g.rotate(-PI/2);
      this.g.text(""+this.breaks[x], 0, 0);
      this.g.pop();
    }
    
    this.g.textAlign(RIGHT, CENTER);
    for (let x=0; x<N; x++) {
      const dy0 = this.y0 + (0.5+x) * this.L;
      this.g.text("" + this.breaks[x], this.x0, dy0);
    }
  }
  
      
  GetGlobalXY(lb, ub) {
    const celly = this.breaks.indexOf(lb);
    const cellx = this.breaks.indexOf(ub);
    const gx = this.x + this.x0 + (cellx + 0.5) * this.L;
    const gy = this.y + this.y0 + (celly + 0.5) * this.L;
    return new p5.Vector(gx, gy);
  }
  
  OnDPCellFilled(lb, ub) {
    const idx0 = this.breaks.indexOf(lb);
    const idx1 = this.breaks.indexOf(ub);
    this.g.fill(0, 160, 32);
    this.do_DrawCell(idx1, idx0, 2);
  }
  
  do_DrawCell(x, y, inset = 0) {
    const dx0 = this.x0 + x * this.L;
    const dy0 = this.y0 + y * this.L;
    this.g.rectMode(CORNER);
    this.g.rect(dx0 + inset, dy0 + inset, this.L - 2*inset, this.L - 2*inset);
  }
  
  do_DrwaText(x, y, txt) {
    this.g.textMode(CENTER, TOP);
    const dx0 = this.x0 + (x + 0.5) * this.L;
    const dy0 = this.y0 + y * this.L;
    this.g.text(txt, dx0, dy0);
  }
  
  Render() {
    image(this.g, this.x, this.y);
  }
};

// Mass-Spring
class TreeNode {
  constructor(txt, tag = undefined, y0 = undefined) {
    let t = txt.split("\n");
    const PAD = 2;
    this.w = 0;
    this.h = 0;
    t.forEach((line) => {
      this.w = max(this.w, textWidth(line) + 2 * PAD);
    });
    this.h = textSize() * t.length + 2 * PAD;
    this.txt_dy = 2;
    this.pos = new p5.Vector(320, 320);
    this.txt = txt;
    this.inv_mass = 1;
    this.v = new p5.Vector(0, 0);
    this.tag = tag;
    this.highlight = 0;
    this.home_y0 = y0; // 总是倾向于回到该Y0处
  }
  Render() {
    const x = this.pos.x,
      y = this.pos.y;
    //noStroke();

    rectMode(CENTER);
    switch (this.highlight) {
      case 0: fill(64); break;
      case 1: fill(64, 192, 64); break;
      case 2: fill(64, 160, 160); break;
    }
    stroke(255);
    rect(x, y, this.w, this.h);
    
    noStroke();
    switch (this.highlight) {
      case 0: fill(255, 255, 255, 255); break;
      case 1: case 2: fill(0); break;
    }
    textAlign(CENTER, CENTER);
    text(this.txt, x, y + this.txt_dy);
    
    if (this.tag == g_highlight_key) {
      noFill();
      stroke(255, 255, 0);
      const PAD = 3;
      rect(x, y, this.w+2*PAD, this.h+2*PAD);
    }
  }
  ApplyForce(f) {
    this.v.add(f.copy().mult(this.inv_mass));
  }
  Update(delta_millis) {
    this.pos.add(this.v.copy().mult(delta_millis / 1000));
    this.v.mult(0.95);
    if (this.home_y0 != undefined) {
      this.pos.y = lerp(this.pos.y, this.home_y0, 0.2);
    }
    
    // If too close to edge, add repulsion force
    const MARGIN = 111;
    if (this.pos.x < MARGIN) {
      this.ApplyForce(new p5.Vector((MARGIN-this.pos.x) * 0.01, 0));
    } else if (this.pos.x > width - MARGIN) {
      this.ApplyForce(new p5.Vector((this.pos.x - (width - MARGIN)) * (-0.01), 0));
    }
  }
  Highlight(hl) {
    this.highlight = hl;
  }
  Unhighlight(hl) {
    this.highlight = 0;
  }
}

class Spring {
  constructor(n0, n1, l0 = undefined) {
    this.n0 = n0;
    this.n1 = n1;
    this.k = 0.03;
    this.f_max = 1;
    if (l0 == undefined) {
      l0 = n0.pos.copy().sub(n1.pos).mag();
    }
    this.l0 = l0;
  }
  Update() {
    const p0p1 = this.n0.pos.copy().sub(this.n1.pos);
    const dl = p0p1.mag() - this.l0;
    const f = p0p1.copy().normalize().mult(this.k * dl);
    const f_mag = f.mag();
    if (f_mag > 10) { f.mult(10 / f_mag); }
    this.n1.ApplyForce(f);
    this.n0.ApplyForce(f.copy().mult(-1));
  }
  Render() {
    noFill();
    stroke(160);
    line(this.n0.pos.x, this.n0.pos.y, this.n1.pos.x, this.n1.pos.y);
  }
}

var g_nodes = [];
var g_springs = [];
var g_scratch = {};

function AddEdge(n0, n1) {
  let p = new Spring(n0, n1, SPRING_L0);
  g_springs.push(p);
}

let g_key_to_node = { };

// level: 0 在最上，越大越朝下
function OnAppear(key, parent_key, level) {
  let n = undefined;
  if (!(key in g_key_to_node)) {
    //console.log("Adding a node, pk=" + parent_key + ", k=" + key);
    n = new TreeNode(key, key);
    g_key_to_node[key] = n;
    const theta = random(0, 2*PI);
    const d = random(100, 200);
    n.pos.x += cos(theta) * d;
    n.pos.y += sin(theta) * d;
    
    if (level == undefined) { level = 0; }
    const t = level / g_solution.cuts.length;
    n.home_y0 = lerp(HOME_Y0_PAD, height-HOME_Y0_PAD, t);
    //console.log("Level " + level + ", y0=" + n.home_y0);
    
    g_nodes.push(n);
    g_highlight_node = n;
  } else {
    n = g_key_to_node[key];
  }
  
  if (parent_key != undefined && (parent_key in g_key_to_node)) {
    AddEdge(n, g_key_to_node[parent_key]);
  }
}

function OnEnter(key) {
  g_key_to_node[key].Highlight(1);
}

function OnExit(key, parent_key) {
  const victim = g_key_to_node[key];
  const vp = g_key_to_node[parent_key];
  //console.log("OnExit " + key + ", " + parent_key);
  
  //g_nodes.remove(victim);
  let ve = []; // ve = victim edges
  let num_edges_with_key = 0;
  g_springs.forEach((s) => {
    if (s.n0 == victim || s.n1 == victim) { num_edges_with_key ++; }
    if (s.n0 == victim && s.n1 == vp) { ve.push(s); }
    else if (s.n1 == victim && s.n0 == vp) { ve.push(s); }
  });
  ve.forEach((v) => {
    g_springs.remove(v);
  });
  g_key_to_node[key].Unhighlight();
}

function UpdateRepulsionForce() {
  
  const L0 = 112;
  const M = 4000;
  
  const N = g_nodes.length;
  for (let i=0; i<N-1; i++) {
    for (let j=i+1; j<N; j++) {
      const n0 = g_nodes[i], n1 = g_nodes[j];
      const p01 = n1.pos.copy().sub(n0.pos);
      const d01 = p01.dot(p01);
      if (d01 < L0*L0) {
        const f = M / d01;
        const n01 = p01.copy().normalize();
        n1.ApplyForce(n01.copy().mult(f));
        n0.ApplyForce(n01.copy().mult(-f));
      }
    }
  }
}

let g_solution;
let g_dptable;

function setup() {
  createCanvas(720, 640);

  btn1 = createButton("Step");
  btn1.size(100);
  btn1.position(width-108, 8);
  btn1.mousePressed(function() {
    // Finish all pending animations
    g_particles.forEach((p) => {
      p.start_millis = -100000000;
      p.Update();
    });
    g_solution.Step();
  });

  const n = 7, cuts = [1,3,4,5];
  g_solution = new Solution(n, cuts);
  g_dptable  = new DPTable(n, cuts);
  g_dptable.RefreshCanvas();
  
  const label1 = createDiv("<span style='color:white; font-size:9'>n:</span>");
  label1.position(2, height-32);
  g_n_input = createInput("7");
  g_n_input.size(80);
  g_n_input.position(22, height-32);
  
  const label2 = createDiv("<span style='color:white; font-size:9'>Cuts:</span>");
  label2.position(132, height-32);
  g_data_input = createInput("[1,3,4,5]");
  g_data_input.position(178, height-32);
  
  const btn2 = createButton("Use Input");
  btn2.position(368, height-32);
  btn2.mousePressed(function() {
    UseCurrInput();
  });
  
  const btn3 = createButton("Random Input");
  btn3.position(480, height-32);
  btn3.mousePressed(function() {
    RandomizeInput();
  });

  SetGlobalMessage("Press [Use Input] to set input or press [Step] to start algorithm");
}

function draw() {
  if (g_frame_count == 0) {
    AutoRunStep();
  }
  g_frame_count ++;
  
  background(32);
  
  UpdateRepulsionForce();

  g_springs.forEach((s) => {
    s.Update();
    s.Render();
  });

  g_nodes.forEach((n) => {
    n.Update(16);
    n.Render();
  });
  
  let particles_next = [];
  g_particles.forEach((p) => {
    p.Update();
    if (!p.marked_for_delete) {
      particles_next.push(p);
    }
  });
  g_particles = particles_next;
  g_particles.forEach((p) => {
    p.Render();
  });
  
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  text("DP Table", 8, 8);
  g_dptable.Render();
  
  
  textAlign(CENTER, TOP);
  text(g_msg, width/2, 8);
  
  if (g_autorun == true) {
    textAlign(LEFT, TOP);
    fill(255, 255, 0);
    text("Autorun mode\npress any key to stop", 128, 4);
  }
}

function AutoRunStep() {
  if (!g_autorun) return;
  if (g_solution.done) {
    setTimeout(function() {
      RandomizeInput();
      AutoRunStep();
    }, 3000);
  } else {
    setTimeout(function() {
      g_solution.Step();
      AutoRunStep();
    }, 100);
  }
}

function keyPressed() {
  g_autorun = false;
}

function mouseClicked() {
  g_autorun = false;
}