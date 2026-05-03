// 2021-10-02
// Testing Emscripten again

const W = 480, H = 480;
let graph_board;
let g_problem;
let g_animator;

let g_cellwidth = 24;
let g_pad = 36;
let g_textsize = 20;

class HighlightRect {
  constructor() {
    this.pos = new p5.Vector(g_pad + g_cellwidth, g_pad + g_cellwidth);
    this.w = g_cellwidth;
    this.h = g_cellwidth;
    this.done = false;
    this.alpha = 0.5;
    this.color = [255,255,32];
  }
  
  Render() {
    if (this.done) return;
    push();
    fill("rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] +
      "," + this.alpha + ")");
    rect(this.pos.x, this.pos.y, this.w, this.h);
    pop();
  }
}

class TextRect {
  constructor(txt) {
    this.pos = new p5.Vector(g_pad + g_cellwidth, g_pad + g_cellwidth);
    this.w = g_cellwidth;
    this.h = g_cellwidth;
    this.done = false;
    this.alpha = 0;
    this.color = [160,160,160];
    this.txt = txt
  }
  
  Render() {
    if (this.done) return;
    push();
    textAlign(CENTER, CENTER);
    noStroke();
    fill("rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] +
      "," + this.alpha + ")");
    rect(this.pos.x, this.pos.y, this.w, this.h);
    fill("rgba(255,255,255," + this.alpha + ")");
    text(this.txt, this.pos.x + this.w/2, this.pos.y + this.h/2);
    pop();
  }
}

let g_auxHighlightRects = []; // Auxiliary highlight rects
let g_highlightRect;
let g_topPointer, g_leftPointer;

class Problem {
  constructor() {
    this.state = "not started";
    this.dp = []
    this.kases = [];
    this.L = g_cellwidth;
    this.pad = g_pad;
    this.text1 = "";
    this.text2 = "";
    this.need_render_board = true;
    this.L1 = this.text1.length;
    this.L2 = this.text2.length;
    
    this.dp_idx = 0;
    this.dp_row = 0;
    this.dp_col = 0;
    
    this.replay_step = 0; // This unit will be activated next
    this.disp_step = 0;
  }
  
  AddTraceEntry(y, x, valu, kase) {
    console.log(y + ", " + x + ", " + valu)
    this.dp[y][x] = valu;
    this.kases.push(kase);
  }
  
  SetProblem(text1, text2) {
    this.state = "not started";
    this.dp = [];
    this.kases = [];
    this.text1 = text1;
    this.text2 = text2;
    this.L1 = this.text1.length;
    this.L2 = this.text2.length;
    this.replay_step = 0; // 1 past shown idx
    this.disp_step = 0;   // for disp
    
    const N = text1.length, M = text2.length;
    for (let y=0; y<N; y++) {
      let line = [];
      for (let x=0; x<M; x++) {
        line.push(0);
      }
      this.dp.push(line);
    }
    this.need_render_board = true;
    
   g_leftPointer.alpha = 0;
   g_topPointer.alpha = 0;
   g_highlightRect.alpha = 0;
   console.log(this.dp);
  }
  
  RenderBoard(g) {
    const H = this.dp.length, W = this.dp[0].length;
    g.clear();
    g.push();
    g.textSize(g_textsize);
    const pad = this.pad, L = this.L;
    const x0 = pad, x1 = x0 + W * L;
    const y0 = pad, y1 = y0 + H * L;
    g.noFill();
    g.stroke(192);
    console.log(W + ", " + H);
    for (let y=0; y<H+1; y++) {
      const dy = y * L + y0;
      g.line(x0, dy, x1, dy);
    }
    for (let x=0; x<W+1; x++) {
      const dx = x * L + x0;
      g.line(dx, y0, dx, y1);
    }
    
    g.noStroke();
    g.fill(192);
    g.textAlign(RIGHT, CENTER);
    for (let y=0; y<H; y++) {
      const dy = y0 + (0.5+y) * L;
      g.text(this.text1[y], pad-2, dy);
    }
    g.textAlign(CENTER, BOTTOM);
    for (let x=0; x<W; x++) {
      const dx = x0 + (0.5+x) * L;
      g.text(this.text2[x], dx, pad-2);
    }
    
    g.pop();
    
    this.need_render_board = false;
  }
  
  Step() {
    this.do_Step(0, 0);
  }
  
  do_Step(value, type) {
    const duration = 333;
    if (this.state == "not started") {
      this.state = "running";
      g_topPointer.alpha = 0;
      g_leftPointer.alpha = 0;
      g_highlightRect.alpha = 0;
      g_topPointer.pos = new p5.Vector(this.pad         , this.pad - this.L);
      g_leftPointer.pos= new p5.Vector(this.pad - this.L, this.pad         );
      g_highlightRect.pos= new p5.Vector(this.pad       , this.pad         );
      g_animator.Animate(g_topPointer, "alpha", undefined,
          [0, 0.5],
          [0, duration],
          undefined);
      g_animator.Animate(g_leftPointer, "alpha", undefined,
          [0, 0.5],
          [0, duration],
          undefined);
      g_animator.Animate(g_highlightRect, "alpha", undefined,
          [0, 0.5],
          [0, duration],
          undefined);
    } else if (this.state == "running") {
      if (this.replay_step == this.L1 * this.L2) {
        // 完成前的最后一步
        g_animator.Animate(g_topPointer, "alpha", undefined,
          [0.5, 0],
          [0, duration],
          undefined);
        g_animator.Animate(g_leftPointer, "alpha", undefined,
          [0.5, 0],
          [0, duration],
          undefined);
        g_animator.Animate(g_highlightRect, "alpha", undefined,
          [0.5, 0],
          [0, duration],
          undefined);
        this.state = "not started";
        this.replay_step = 0;
        this.disp_step = 0;
      } else {
        const xy = this.GetCellXY(this.replay_step);
        const k = this.kases[this.replay_step];
        const step = this.replay_step + 1;
        
        const row = parseInt(this.replay_step / this.L2);
        const col = parseInt(this.replay_step % this.L2);
        
        if (k == 0) { // 相等，从左上角加一
          g_topPointer.color = [32,255,32];
          g_leftPointer.color = [32,255,32];
          const x = new TextRect("+1");
          x.color = [32,128,32];
          x.pos.x = xy[0] - this.L;
          x.pos.y = xy[1] - this.L;
          g_animator.Animate(x, "alpha", undefined,
            [0, 0, 1],
            [0, duration, duration*1.5],
            () => {
              g_animator.Animate(x, "pos", "x",
                [xy[0]-this.L, xy[0]],
                [0, duration],
                undefined
              );
              g_animator.Animate(x, "pos", "y",
                [xy[1]-this.L, xy[1]],
                [0, duration],
                () => {
                  g_animator.Animate(x, "alpha", undefined,
                    [1, 0],
                    [0, duration],
                    ()=> {
                      x.done=true;
                      this.disp_step = step;
                    }
                  );
                }
              );
            }
          );
          g_auxHighlightRects.push(x);
          
          let prevsc = undefined;
          if (row > 0 && col > 0) {
            prevsc = this.dp[row-1][col-1];
          }
          if (prevsc != undefined) {
            const x1 = new TextRect(prevsc);
            x1.color = [160,160,160];
            x1.pos.x = xy[0] - this.L;
            x1.pos.y = xy[1] - this.L;
            x1.alpha = 0;
            g_animator.Animate(x1, "pos", "x",
              [x1.pos.x, x1.pos.x, xy[0]],
              [0, duration, duration*1.5],
              undefined
            );
            g_animator.Animate(x1, "pos", "y",
              [x1.pos.y, x1.pos.y, xy[1]],
              [0, duration, duration*1.5],
              undefined
            );
            g_animator.Animate(x1, "alpha", undefined,
              [0, 0, 1, 1, 1, 0],
              [0, duration, duration, duration*1.5, duration*2.5, duration*3.5],
              () => {
                x1.done = true;
              }
            );
            g_auxHighlightRects.push(x1);
          }
        } else {
          // 不等，从左边和上面取大的
          g_topPointer.color = [255,255,32];
          g_leftPointer.color = [255,255,32];
          
          
          if (row > 0) {
            const x = new TextRect("" + this.dp[row-1][col]);
            x.pos.x = xy[0];
            x.pos.y = xy[1] - this.L;
            g_animator.Animate(x, "alpha", undefined,
              [0, 0, 1],
              [0, duration, duration*1.5],
              () => {
                g_animator.Animate(x, "pos", "y",
                  [x.pos.y, xy[1]],
                  [0, duration],
                  () => {
                    g_animator.Animate(x, "alpha", undefined,
                      [1, 0],
                      [0, duration/2],
                      () => { x.done = true; }
                    );
                    this.disp_step = step;
                  }
                );
              }
            );
            g_auxHighlightRects.push(x);
          }
          if (col > 0) {
            const x = new TextRect("" + this.dp[row][col-1]);
            x.pos.x = xy[0] - this.L;
            x.pos.y = xy[1];
            g_animator.Animate(x, "alpha", undefined,
              [0, 0, 1],
              [0, duration, duration*1.5],
              () => {
                g_animator.Animate(x, "pos", "x",
                  [x.pos.x, xy[0]],
                  [0, duration],
                  () => {
                    g_animator.Animate(x, "alpha", undefined,
                      [1, 0],
                      [0, duration/2],
                      () => { x.done = true; }
                    );
                    this.disp_step = step;
                  }
                );
              }
            );
            g_auxHighlightRects.push(x);
          } 
        }
        
        g_animator.Animate(g_highlightRect, "pos", "x",
          [g_highlightRect.pos.x, xy[0]],
          [0, duration],
          undefined);
        g_animator.Animate(g_highlightRect, "pos", "y",
          [g_highlightRect.pos.y, xy[1]],
          [0, duration],
          undefined);
        g_animator.Animate(g_topPointer, "pos", "x",
          [g_topPointer.pos.x, xy[0]],
          [0, duration],
          undefined);
        g_animator.Animate(g_leftPointer,"pos", "y",
          [g_leftPointer.pos.y, xy[1]],
          [0, duration],
          undefined);

        if (this.replay_step < this.L1 * this.L2) {
          this.replay_step ++;
        }
      }
    }
  }
  
  GetCellXY(idx) {
    const row = parseInt(idx / this.L2);
    const col = idx % this.L2;
    const dx = this.pad + col * this.L;
    const dy = this.pad + row * this.L;
    return [dx, dy];
  }
  
  Render() {
    image(graph_board, 0, 0);
    let y = 0, x = 0;
    push();
    noStroke();
    fill(224);
    textAlign(CENTER, CENTER);
    for (let i=0; i<this.disp_step; i++) {
      const dx = this.pad + (0.5+x) * this.L;
      const dy = this.pad + (0.5+y) * this.L;
      text(""+this.dp[y][x], dx, dy);
      if (x >= this.L2-1) {
        x = 0; y ++;
      } else {
        x++;
      }
    }
    pop();
  }
  
  ClearTrace() {
    this.dp = [];
  }
  
  Done() {
    return (this.replay_step == this.L1 * this.L2);
  }
}

function Randomize() {
  const dict1 = "aaaaaaabbbbbbbbccccddeeffgggh";
  const dict2 = "abcdefghijklmnopqrstuvwxyz";
  const len1 = [ 3, 10 ], len2 = [ 2, 8 ];
  
  let text1 = "", text2 = "";
  let dict, len;
  let texts = [];
  if (Math.random() < 0.5) {
    dict = dict1; len = len1;
  } else {
    dict = dict2; len = len2;
  }
  
  for (let i=0; i<2; i++) {
    const l = len[0] + parseInt(Math.random() * (len[1]-len[0]));
    let t = "";
    for (let j=0; j<l; j++) {
      t = t + dict[parseInt(Math.random()*dict.length)];
    }
    texts.push(t);
  }
  text1 = texts[0]; text2 = texts[1];
  
  g_problem.SetProblem(text1, text2);
  ccall("RunInput", 'number', ['string', 'string'], [text1, text2]);
}

function setup() {
  createCanvas(W, H);
  g_highlightRect = new HighlightRect();
  g_topPointer = new HighlightRect();
  g_leftPointer = new HighlightRect();
  g_auxHighlightRects.push(g_highlightRect);
  g_auxHighlightRects.push(g_topPointer);
  g_auxHighlightRects.push(g_leftPointer);
  g_highlightRect.alpha = 0;
  g_highlightRect.color = [160,160,160];
  
  graph_board = createGraphics(W, H);
  g_problem = new Problem();
  const text1 = "abc";
  const text2 = "abdbcdce";
  g_problem.SetProblem(text1, text2);
  ccall("RunInput", 'number', ['string', 'string'], [text1, text2]);
  g_animator = new Animator();
  
  const btnStep = createButton("Step");
  btnStep.position(16, H-24);
  btnStep.mousePressed(() => {
    g_animator.FinishAllPendingAnimations();
    g_problem.Step();
  });
  
  const btnRandomize = createButton("Randomize");
  btnRandomize.position(width-80, H-24);
  btnRandomize.mousePressed(Randomize);
}

let g_frame_count = 0;
function draw() {
  if (g_frame_count == 0) {
    if (g_autorun) {
      AutorunCallback();
    }
  }
  push();
  background(32);
  noStroke();
  fill(192);
  textAlign(LEFT, TOP);
  textSize(g_textsize);
  text("1143. Longest Common Subsequence", 8, 8);
  
  translate(0, g_textsize + 12);
  
  if (g_problem.need_render_board) {
    g_problem.RenderBoard(graph_board);
  }
  const ahlrNext = [];
  noStroke();
  g_auxHighlightRects.forEach((r) => {
    r.Render();
    if (r.done == false) {
      ahlrNext.push(r);
    }
  });
  g_auxHighlightRects = ahlrNext;
  g_problem.Render();
  g_frame_count ++;
  g_animator.Update();
  pop();
  
  push();
  noStroke();
  textSize(12);
  fill("#ff3");
  textAlign(LEFT, BOTTOM);
  //text(g_problem.state + " " + g_problem.replay_step, width-16, height-16)
  if (g_autorun) {
    text("Autorun, [SPACE] to stop", 66, height-16);
  }
  
  
  
  textSize(15);
  const x0 = 36, y2 = height-44, y1 = height-64;
  
  fill("#3a3");
  text("If EQ", x0, y1);
  let tw = textWidth("If EQ");
  fill(220);
  text(": dp[y][x] = 1 + dp[y-1][x-1]", tw+x0+4, y1);
  
  fill("#880");
  text("If not EQ", x0, y2);
  tw = textWidth("If not EQ");
  fill(220);
  text(": dp[y][x] = max of top & left", tw+x0+4, y2);
  
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

let g_autorun = true;
function AutorunCallback() {
  if (g_autorun) {
    
    if (g_problem.Done() == false &&
        g_animator.IsDone()) {
      g_problem.Step();
    } else if (g_problem.Done() &&
        g_animator.IsDone()) {
      setTimeout(() => {
        Randomize();
        AutorunCallback();
      }, 2000);
      return;
    }
    
    setTimeout(() => {
      AutorunCallback();
    }, 100);
  }
}