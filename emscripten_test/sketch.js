// 2024-09-02

let g_frame_count = 0;

class ArrayViz {
  constructor(m, n, t) {
    this.elts = Array(m);
    for (let i=0; i<m; i++) { this.elts[i] = Array(n); }
    this.x = 8;
    this.y = 8;
    this.nrows = m;
    this.ncols = n;
    this.title = t;
  }

  Render() {
    const L = 16;
    push();
    noFill(); stroke(224);
    translate(this.x, this.y);
    for (let i=0; i<=this.ncols; i++) {
      const dx = i*L;
      line(dx, 0, dx, L*this.nrows);
    }
    for (let i=0; i<=this.nrows; i++) {
      const dy = i*L;
      line(0, dy, L*this.ncols, dy);
    }
    noStroke(); fill(255, 255, 0);
    textAlign(CENTER, CENTER);
    let idx = 0;
    for (let r=0; r<this.nrows; r++) {
      for (let c=0; c<this.ncols; c++) {
        const dx = L*(c+0.5), dy = L*(r+0.5);
        const e = this.elts[r][c];
        if (e != undefined) {
          text("" + e, dx, dy); 
        }
      }
    }
    textAlign(LEFT, BOTTOM);
    text(this.title, 0, 0);
    pop();
  }

  Reset() {
    for (let r=0; r<this.nrows; r++) {
      for (let c=0; c<this.ncols; c++) {
        this.elts[r][c] = undefined;
      }
    }
  }
}

async function f() {
  g_module = await Module();
}

let g_a;
let g_b;
let g_actions = [];
let g_currstep = 0;
let g_autorun = false;

function setup() {
  createCanvas(240, 160);
  g_a = new ArrayViz(1, 6, "Array A");
  g_b = new ArrayViz(2, 3, "Array B");
  g_a.x = 8; g_a.y = 48;
  g_b.x = 8; g_b.y = 96;
  g_actions = [];
  f();
}

function draw() {
  background(32);
  push();
  noStroke();
  textAlign(LEFT, TOP);
  fill(255, 255, 0);
  //text(g_frame_count + "", 16, 16);
  g_frame_count ++;

  g_a.Render();
  g_b.Render();

  textAlign(RIGHT, TOP);
  text("Step " + g_currstep + "/" + g_actions.length + " done", width-8, 8);
  textAlign(LEFT, TOP);
  text("CXX -> JS", 8, 8);

  pop();
}

function Update1DArray(name, idx, val) {
  //g_a.elts[0][idx] = val;
  g_actions.push([name, 0, idx, val]);
}

function Update2DArray(name, r, c, val) {
  //g_b.elts[r][c] = val;
  g_actions.push([name, r, c, val]);
}

function Reset() {
  g_a.Reset();
  g_b.Reset();
  g_currstep = 0;
}

function Done() {
  return (g_currstep >= g_actions.length);
}

function NextStep() {
  if (Done()) return;
  const a = g_actions[g_currstep++];
  if (a[0] == "a") {
    g_a.elts[a[1]][a[2]] = a[3];
  } else if (a[0] == "b") {
    g_b.elts[a[1]][a[2]] = a[3];
  }
}

function AutorunCallback() {
  if (g_autorun) {
    let delay = 100;

    if (Done() == false) {
      delay = 300;
      NextStep();
      if (Done()) {
        delay = 2000;
      }
    } else {
      Reset();
    }
    
    setTimeout(() => {
      AutorunCallback();
    }, delay);
  }
}

setTimeout(() => {
  g_autorun = true;
  AutorunCallback();
}, 2000);