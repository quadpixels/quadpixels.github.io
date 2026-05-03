// 2020-11-02
// 夜空中最亮的星 背景
// 更新之处在于：如果一对中有越界了的就不画线
let g_nodes = [];
let g_edges = [];
let g_background;

const LINE_COLOR = [ 64, 220, 255 ];
const NODE_COLOR = [ 2, 2, 192   ];

let LAMP_COLOR1;// = color(211, 202, 130);
let LAMP_COLOR2;// = color(201, 38,  1);

let MOVING = true;
let NODE_V_DECAY = 1;

let MY_DEBUG = false;

// 初始化大小
var W0 = 640, H0 = 360
var W = 640, H = 360, WW, HH;
var prevW = W, prevH = H;

let g_last_traverse_millis = 0;

let g_fps;
class FPS {
  constructor() {
    this.last_millis = 0;
    this.fps = 0;
    this.frame_group_count = 0;
  }
  OnNewFrame(ms) {

    if (ms - this.last_millis > 1000) {
      this.fps = this.frame_group_count / ((ms - this.last_millis) / 1000);
      this.last_millis = ms;
      this.frame_group_count = 0;
    }
    this.frame_group_count ++;
  }
  GetFPS() {
    return this.fps;
  }
}

function windowResized() {
  OnWindowResize();
}

function OnWindowResize() {
  if (WW != windowWidth || HH != windowHeight) {
    
    WW = windowWidth;
    HH = windowHeight;
    let ratio1 = WW * 1.0 / HH; // 432/688 = 0.6279
    let ratio0 = W0 * 1.0 / H0; // 400/720 = 0.5556
    //console.log("ratio1=" + ratio1 + ", ratio0=" + ratio0);
    if (ratio1 > ratio0) {
      H = HH;
      W = H * W0 / H0
    } else {
      W = WW;
      H = W * H0 / W0
    }
    resizeCanvas(W, H);
    
    g_nodes.forEach((n) => {
      n.pos.x *= (W / prevW);
      n.pos.y *= (H / prevH);
    });
    
    prevW = W; prevH = H;
  }
}



class PriorityQueue {
  constructor() {
    this.items = [];
  }
  Push(x) { // [entry, priority]
    if (this.items.length < 1) {
      this.items.push(x);
      return;
    }

    let idx = 0;
    while (idx < this.items.length && this.items[idx][1] < x[1]) idx++;
    
    if (idx < this.items.length) {
      this.items.splice(idx, 0, x);
    } else {
      this.items.push(x);
    }
  }
  Empty() { return (this.items.length < 1); }
  Pop() {
    if (this.Empty()) return undefined;
    let ret = this.items[0];
    this.items = this.items.slice(1);
    return ret;
  }
  Size() { return this.items.length; }
}

class Node {
  constructor(p = undefined) {
    if (p == undefined) {
      p = new p5.Vector(random(0, width), random(0, height));
    }
    this.pos = p;
    this.phase_delta = random(0, 1);
    this.period = 2000;
    this.r = random(3, 9);
    this.v = new p5.Vector(0, 0);
    if (MOVING) { this.Prod(); }
    this.oob_flag = false;
  }
  
  Update(delta_millis) {
    const delta_s = delta_millis / 1000.0;
    this.pos.add(this.v.copy().mult(delta_s));
    
    const decay = pow(NODE_V_DECAY, delta_millis / 16.0);
    this.v.mult(decay);
    
    {
      if (this.pos.x > width) { this.pos.x = 0; this.oob_flag = true; }
      if (this.pos.x < 0    ) { this.pos.x = width; this.oob_flag = true;}
      if (this.pos.y >height) { this.pos.y = 0; this.oob_flag = true;}
      if (this.pos.y < 0    ) { this.pos.y = height; this.oob_flag = true;}
    }
  }
  
  Render() {
    const p = this.pos;
    let phase = (millis() / this.period) + this.phase_delta;
    phase = phase - parseInt(phase);
    phase = sin(2*PI*phase);
    fill(lerpColor(LAMP_COLOR1, LAMP_COLOR2, phase));
    
    const r = this.r * width / W0;
    circle(p.x, p.y, r);
  }
  
  Prod() {
    this.v.x += random(0, 5);
    this.v.y += random(-3, 0); 
  }
}

class Edge {
  constructor(n0, n1) {
    this.n0 = n0; this.n1 = n1;
    this.alpha = 0;
    this.light_millis = -999;
  }
  Mag() {
    return (this.n1.pos.copy().sub(this.n0.pos)).mag();
  }
  SetLightTimeout(ms) {
    this.light_millis = millis() + ms;
    this.n0.oob_flag = false;
    this.n1.oob_flag = false;
  }
  Render() {
    if (this.alpha <= 0) return;
    if (this.n0.oob_flag == true || this.n1.oob_flag == true) return;
    const p0 = this.n0.pos, p1 = this.n1.pos;
    const c = LINE_COLOR;
    let a = this.alpha * this.alpha;
    //let a = 1;
    stroke(c[0]*a, c[1]*a, c[2]*a);
    line(p0.x, p0.y, p1.x, p1.y);
  }
  Update(delta_millis, ms) {
    if (this.light_millis > 0 && ms > this.light_millis) {
      this.alpha = 1;
      this.light_millis = -999;
    }
      
    if (this.alpha > 1e-3) {
      this.alpha *= pow(0.99, delta_millis/16.0);
    } else {
      this.alpha = 0;
      this.n0.blinking_count --;
      if (this.n0.blinking_count < 1) { this.n0.blinking_count = 0; }
      this.n1.blinking_count --;
      if (this.n1.blinking_count < 1) { this.n1.blinking_count = 0; }
    }
  }
}

class UnionFind {
  constructor(N) {
    this.parents = [];
    for (let i=0; i<N; i++) { this.parents.push(i); }
  }
  GetParent(x) {
    if (x != this.parents[x]) {
      const p = this.GetParent(this.parents[x]);
      this.parents[x] = p;
      return p;
    } else { return this.parents[x]; }
  }
  Union(a, b) {
    this.parents[this.GetParent(a)] = this.GetParent(b);
  }
  Print() {
    let x = "";
    for (let i=0; i<this.parents.length; i++) {
      x = x + this.parents[i] + " ";
    }
    console.log(x);
  }
}

// Minimal Spanning Tree !!!
class MST {
  constructor(nodes) {
    this.nodes = nodes;
    const N = nodes.length;
    let pq = new PriorityQueue();
    this.first_idx = -999;
    
    for (let i=0; i<N; i++) {
      nodes[i].idx = i;
    }
    
    for (let i=0; i<N; i++) {
      let n0 = nodes[i];
      for (let j=i+1; j<N; j++) {
        let n1 = nodes[j];
        let e = new Edge(n0, n1);
        let emag = e.Mag();
        pq.Push([e, e.Mag()]);
      }
    }
    //console.log(pq.Size() + " edges in pq");
    
    this.edges = [];
    let uf = new UnionFind(N);
    let edges_added = 0;
    while (!pq.Empty() && this.edges.length < N-1) {
      let em = pq.Pop();
      let e = em[0];
      let n0 = e.n0, n1 = e.n1, idx0 = n0.idx, idx1 = n1.idx;
      let p0 = uf.GetParent(idx0), p1 = uf.GetParent(idx1);
      //console.log(idx0 + ", " + idx1 + ", " + p0 + ", " + p1);
      if (p0 != p1) {
        if (this.edges.length < 1) { this.first_idx = idx0; }
        this.edges.push(e);
        uf.Union(idx0, idx1);
      }
    }
    //uf.Print();
    //console.log(this.edges.length + " edges");
  }
  Edges() { return this.edges; }
  Traverse(start_idx = this.first_idx) {
    let n2v = new Set([]);
    let visited = new Set([]);
    const N = this.nodes.length;
    if (start_idx == undefined) {
      start_idx = parseInt(random(0, N));
    }
    
    n2v.add(start_idx);
    let ret = [];
    while (n2v.size > 0) {
      //console.log("n2v.size=" + n2v.size);
      let n2v_next = new Set([]);
      n2v.forEach((x) => {visited.add(x);});
      
      this.edges.forEach((e) => {
        let n0idx = e.n0.idx, n1idx = e.n1.idx;
        //console.log(n0idx + " " + n1idx);
        if (visited.has(n0idx) == false || visited.has(n1idx) == false) {
          ret.push(e);
          n2v_next.add(n0idx);
          n2v_next.add(n1idx);
        }
      });
      n2v = n2v_next;
    }
    
    for (let i=0; i<ret.length; i++) {
      ret[i].SetLightTimeout(100 + i * 22);
    }
    
    return ret;
  }
}

function setup() {
  createCanvas(400, 818);
  
  LAMP_COLOR1 = color(191, 202, 220);
  LAMP_COLOR2 = color(32, 129, 130);
  g_fps = new FPS();
}

function Gen() {
  for (let i=0; i<130; i++) {
    g_nodes.push(new Node());
  }
  let x = new MST(g_nodes);
  g_edges = x.Edges();
  x.Traverse();
}

let g_frame_count = 0;
let g_last_millis = 0;

function draw() {
  let ms = millis();
  let delta_millis = 0;
  if (g_frame_count > 0) {
    delta_millis = ms - g_last_millis;
  }
  g_last_millis = ms;
  g_frame_count ++;

  background(0);
  
  fill(NODE_COLOR[0], NODE_COLOR[1], NODE_COLOR[2]);
  
  stroke(LINE_COLOR[0], LINE_COLOR[1], LINE_COLOR[2]);
  
  strokeWeight(2 * width / W0);
  g_edges.forEach((e) => { 
    e.Update(delta_millis, ms);
    e.Render();
  });
  strokeWeight(1);
  
  noStroke();
  g_nodes.forEach((n) => {
    n.Update(delta_millis);
    n.Render();
  });
  
  if (ms - g_last_traverse_millis > 8727) {
    g_last_traverse_millis = ms;
    let mst = new MST(g_nodes);
    g_edges = mst.Edges();
    mst.Traverse();
  }
  
  if (g_frame_count == 1 || (g_frame_count % 60 == 0)) {
    OnWindowResize();
  }
  
  // 1-off event
  if (g_frame_count == 3) {
    Gen();
  }
  
  g_fps.OnNewFrame(ms);
  
  // dbg
  if (MY_DEBUG) {
    fill(255);
    textSize(12*width/W0);
    textAlign(LEFT, TOP);
    text(parseInt(g_fps.GetFPS()) + " fps", 4, 4);
  }
}