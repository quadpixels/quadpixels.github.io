// 2020-12-04

let temp0;
let a, ap; // astar and astar_path
let x0=7,y0=7,x1=23,y1=13; // 开始终止点
const W=30, H=20;

function setup() {
  createCanvas(400, 400);
  
  /*
  temp0 = new BinaryHeap();
  
  const elts = [ 3,2,6,5,7,8,1,4,9 ];
  for (let i=0; i<9; i++) {
    temp0.Push([elts[i], ""]);
  }
  for (let i=0; i<9; i++) {
    console.log(temp0.Pop());
  }*/
  
  temp0 = new TestGrid(W, H);
  a = new Astar(temp0.cells, undefined);
  FindPath();
}

function FindPath() {
  ap = a.FindPath(x0,y0,x1,y1);
  temp0.path = ap;
}

function draw() {
  background(220);

  noFill();
  temp0.Render();  
  fill("#383"); temp0.RenderGrid(x0, y0);
  fill("#f33"); temp0.RenderGrid(x1, y1);
  
  noStroke();
  fill("#383");
  let x = 40, y = 340, s = 14;
  text('w', x, y); text('s', x, y+s); text('a', x-s, y+s); text('d', x+s, y+s);
  fill('#f33');
  x = 200;
  text('i', x, y); text('k', x, y+s); text('j', x-s, y+s); text('l', x+s, y+s);
}

function keyPressed() {
  let changed = false;
  switch (key) {
    case 'w': y0--; y0 = max(0, y0); changed = true; break;
    case 's': y0++; y0 = min(y0, H-1); changed = true; break;
    case 'a': x0--; x0 = max(0, x0); changed = true; break;
    case 'd': x0++; x0 = min(W-1, x0); changed = true; break;
    case 'i': y1--; y1 = max(0, y1); changed = true; break;
    case 'k': y1++; y1 = min(H-1, y1); changed = true; break;
    case 'j': x1--; x1 = max(0, x1); changed = true; break;
    case 'l': x1++; x1 = min(W-1, x1); changed = true; break;
  }
  if (changed) { FindPath(); }
}