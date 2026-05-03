let DATA2 = 
   [{ req : [ ["201", "write"], ["201", "read"], ], 
children: [ { req : [ ["190", "write"], ], 
children: [ { req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,],
resp: [["190", "result"], ] },,{ req : [ ["190", "write"], ["190", "read"], ], 
children: [ { req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ["10", "read"], ], 
children: [],
resp: [["10", "reply"], ["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,],
resp: [["190", "reply"], ["190", "result"], ] },,{ req : [ ["190", "write"], ], 
children: [ { req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,],
resp: [["190", "result"], ] },,],
resp: [["201", "reply"], ["201", "result"], ] },
{ req : [ ["201", "write"], ["201", "read"], ], 
children: [ { req : [ ["190", "write"], ], 
children: [ { req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,],
resp: [["190", "result"], ] },,{ req : [ ["190", "write"], ["190", "read"], ], 
children: [ { req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ["10", "read"], ], 
children: [],
resp: [["10", "reply"], ["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,],
resp: [["190", "reply"], ["190", "result"], ] },,{ req : [ ["190", "write"], ], 
children: [ { req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },,],
resp: [["190", "result"], ] },,],
resp: [["201", "reply"], ["201", "result"], ] },
]

let DATA1 = [{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,{ req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
{ req : [ ["32", "write"], ["32", "read"], ], 
children: [ { req : [ ["9", "write"], ["9", "read"], ], 
children: [],
resp: [["9", "reply"], ["9", "result"], ] },,],
resp: [["32", "reply"], ["32", "result"], ] },
{ req : [ ["32", "write"], ], 
children: [ { req : [ ["9", "write"], ], 
children: [],
resp: [["9", "result"], ] },,],
resp: [["32", "result"], ] },
]

let DATA3 = [{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
{ req : [ ["10", "write"], ["10", "read"], ], 
children: [],
resp: [["10", "reply"], ["10", "result"], ] },
{ req : [ ["10", "write"], ["10", "read"], ], 
children: [],
resp: [["10", "reply"], ["10", "result"], ] },
{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
{ req : [ ["10", "write"], ], 
children: [],
resp: [["10", "result"], ] },
]


function GetSize(cmdlists) {
  let ret = 0;
  cmdlists.forEach((cmd) => {
    ret += cmd.req.length + cmd.resp.length + GetSize(cmd.children);
  });
  return ret;
}

let g_canvas;
const W = 400, H = 800;

function setup() {
  createCanvas(W, H);
  g_canvas = createGraphics(W, H);
}

const Y_STEP = 10, X_STEP = 10;
function Draw(g, data, indent, x0, y0) {
  if (data == undefined) return;
  g_canvas.push();
  let y = y0;
  
  data.forEach((txn) => {
    const children_size = GetSize(txn.children);
    const req_h = txn.req.length * Y_STEP;
    const resp_h = txn.resp.length * Y_STEP;
    const tot_h = (children_size) * Y_STEP + req_h + resp_h;
    
    // Background
    g.fill("#ccc");
    g.noStroke()
    g.rect(x0, y, X_STEP, tot_h);
    
    // Request
    // labels
    g.push();
    g.fill("#733");
    g.noStroke();
    for (let i=0; i<txn.req.length; i++) {
      const x = txn.req[i];
      const dy = y+i*Y_STEP+1, dx = x0+X_STEP+2;
      g.text(x[0] + " " + x[1], dx, dy);
      if (i > 0) {
        g.push();
        g.noFill();
        g.stroke("#f33");
        g.line(x0, dy, x0+X_STEP, dy);
        g.pop();
      }
    }
    g.pop();
    
    // rectangle
    g.fill("rgba(224,128,128,0.5)");
    g.rect(x0, y, X_STEP, txn.req.length * Y_STEP);
    
    // Response
    
    g.push();
    g.fill("#44f");
    for (let i=0; i<txn.resp.length; i++) {
      const x = txn.resp[i];
      const dy = y+i*Y_STEP+1+tot_h-resp_h, dx = x0+X_STEP+2;
      g.text(x[0] + " " + x[1], dx, dy);
      if (i > 0) {
        g.push();
        g.noFill();
        g.stroke("#337");
        g.line(x0, dy, x0+X_STEP, dy);
        g.pop();
      }
    }
    g.pop();
    
    g.fill("rgba(128,128,224,0.5)");
    g.rect(x0, y + tot_h - resp_h, X_STEP, resp_h);
    
    
    // full outline
    g.noFill();
    g.stroke("#333");
    g.rect(x0, y, X_STEP, tot_h);
    
    Draw(g, txn.children, indent+1, x0+X_STEP, y+req_h);
    y += tot_h;
  });
  g_canvas.pop();
}

let g_frame_count = 0;
function draw() {
  background(240);
  if (g_frame_count == 0) {
    g_canvas.textAlign(LEFT, TOP);
    g_canvas.textSize(Y_STEP);
    noStroke();
    fill(32);
    g_canvas.text("Accessing i2c-201\n(2 levels of muxes)", 48, 8);
    Draw(g_canvas, DATA2, 0, 48, 38);
    g_canvas.text("Accessing i2c-10\n(root level)", 168, 8);
    Draw(g_canvas, DATA3, 0, 168, 38);
    g_canvas.text("Accessing i2c-32\n(1 level of mux)", 296, 8);
    Draw(g_canvas, DATA1, 0, 296, 38);
    
    g_canvas.text("Time", 2, 18)
    // Arrow
    stroke(32);
    const y1 = 200;
    g_canvas.line(12, 32, 12, y1);
    g_canvas.line(12, y1, 4, y1-8);
    g_canvas.line(12, y1, 20, y1-8);
  }
  image(g_canvas, 0, 0);
  g_frame_count ++;
}