// 2022-09-24

// 处理缩放的部分
const W0 = 480, H0 = 854; // 图纸上的长与宽
var W = 480, H = 854, WW, HH;
var prevW = W, prevH = H;
var g_scale = 1;
var g_dirty = 0;

let g_ui_translate_x = 0, g_ui_translate_y = 0;

function windowResized() {
  OnWindowResize();
}

function OnWindowResize() {
  if (true) {
    WW = windowWidth;
    HH = windowHeight;
    let ratio1 = WW * 1.0 / HH; // 432/688 = 0.6279
    let ratio0 = W0 * 1.0 / H0; // 400/720 = 0.5556
    
    const KEEP_ASPECT_RATIO = true;
    if (KEEP_ASPECT_RATIO) {
      if (ratio1 > ratio0) {
        H = HH;
        W = H * W0 / H0
        g_scale = HH / H0;
      } else {
        W = WW;
        H = W * H0 / W0
        g_scale = WW / W0;
      }
    } else {
      H = HH; W = WW;
      g_scale = 1;
    }
    
    if (prevW != W || prevH != H) {
      resizeCanvas(W, H);
    }
    
    prevW = W; prevH = H;
    g_dirty += 2;
  }
}

// -----------------------------------------------------


let g_allpaths = {};
let g_dataset_idx = 0;
let g_viewport_drag_y = 0, g_viewport_drag_x = 0;

let g_titles = [];
let g_texts = [];
let g_graphers = []; // 3个，最多三个同屏
let g_buttons = [];

let g_ch_variant = 'chs';

class MyStuff {
  constructor() {
    this.x = 0; this.y = 0;
    this.w = 480;
    this.h = 1;
  }
};

class TitleWidget extends MyStuff {
  constructor() {
    super();
    this.h = 72;
  }

  SetTitle(chs, cht, pinyin) {
    this.chs = chs;
    this.cht = cht;
    if (pinyin != undefined)
      this.pinyin = pinyin.split(" ");
  }

  Update(delta_ms) {
  }
  
  Render() {
    if (this.chs == undefined || this.cht == undefined) return;
    push();
    // 中文字
    textAlign(CENTER, CENTER);
    textSize(20);
    
    fill("#FF3");
    let ch = (g_ch_variant == 'chs' ? this.chs : this.cht);
    
    const SKIP = 40, PAD_Y = 48, PAD_X = 32;
    for (let i=0; i<ch.length; i++) {
      const dx = PAD_X + this.x + SKIP*i, dy = this.y + PAD_Y;
      text(ch[i], dx, dy);
    }
    
    // 边框
    noFill();
    stroke("#555");
    const L = 24;
    for (let i=0; i<ch.length; i++) {
      if (ch[i] == '+') continue; // 不管加号
      const dx = PAD_X + this.x + SKIP*i, dy = this.y + PAD_Y;
      beginShape();
      vertex(dx-L, dy);
      vertex(dx, dy+L);
      vertex(dx+L, dy);
      vertex(dx, dy-L);
      endShape(CLOSE);
    }
    
    rectMode(CENTER);
    textSize(16);
    // 拼音
    for (let i=0; i<this.pinyin.length; i++) {
      const py = this.pinyin[i];
      if (py == 'NA') continue;
      const tw = textWidth(py);
      const dx = PAD_X + this.x + SKIP*i, dy = this.y + PAD_Y - 25;
      /*
      fill("#333");
      stroke("#555");
      rect(dx, dy, tw, 22);
      */
      noStroke();
      fill("#FF3");
      text(py, dx, dy);
    }
    
    pop();
  }
};

class TextWidget extends MyStuff {
  constructor() {
    super();
    const PAD = 16;
    this.w = W0 - PAD;
    this.x = PAD/2;
    this.text = undefined;
    this.lines = [];
    this.text_size = 20;
    this.line_height = 24;
  }
  
  SetText(t) {
    this.text = t;
    this.PerformLayout();
    this.h = this.line_height * this.lines.length;
  }
  
  Update(delta_ms) {
    
  }
  
  PerformLayout() {
    if (this.text == undefined) return;
    let curr_word = "";
    let lines = [""];
    push();
    textSize(this.text_size);
    for (let i=0; i<=this.text.length; i++) {
      if (i == this.text.length || this.text[i] == ' ' || this.text[i] == '\n') {
        if (textWidth(lines[lines.length-1]) + textWidth(' ') + textWidth(curr_word) > this.w) {
          lines.push(curr_word);
          curr_word = "";
        } else {
          lines[lines.length-1] += " " + curr_word;
          curr_word = "";
        }
        if (this.text[i] == '\n') {
          lines.push("");
        }
      } else curr_word += this.text[i];
    }
    pop();
    this.lines = lines;
  }
  
  Render() {
    if (this.text == undefined) return;
    push();
    textAlign(LEFT, TOP);
    noStroke();
    textSize(this.text_size);
    fill("#CCC");
    for (let i=0; i<this.lines.length; i++) {
      text(this.lines[i], this.x, this.y+i*this.line_height);
    }
    pop();
  }
};

class PolygonGrapher extends MyStuff {
  constructor() {
    super();
    this.density = 2;
    this.g = createGraphics(W0*this.density, H0*this.density);
    
    // 画到哪了？
    this.polygon_idx = 0;
    this.vert_idx = 0;

    this.curr_edge_len = 0;
    this.curr_edge_completion = 0;
    
    this.speed = 200; // 源文件中的坐标距离 每秒
    this.scale = 3;
    
    // 坑：往贴图上画再显示出来会非常慢
    this.buffered = false;
  }
  
  CalculateBB() {
    if (this.data == undefined) { return [0,0,0,0]; }
    let x_min = 1e20, x_max = -1e20, y_min = 1e20, y_max = -1e20;
    for (let i=0; i<this.data.length; i++) {
      const poly = this.data[i];
      for (let j=0; j<poly.length; j++) {
        const x = poly[j][0], y = poly[j][1];
        x_min = min(x, x_min);
        x_max = max(x, x_max);
        y_min = min(y, y_min);
        y_max = max(y, y_max);
      }
    }
    return [x_min, y_min, y_min, y_max];
  }
  
  EdgeP0P1(pidx, vidx) {
    const poly = this.data[pidx];
    const p0 = new p5.Vector(poly[vidx][0], poly[vidx][1]);
    const p1 = new p5.Vector(poly[vidx+1][0], poly[vidx+1][1]);
    return [p0, p1];
  }
  
  CurrEdgeP0P1() {
    const poly = this.data[this.polygon_idx];
    const vidx = this.vert_idx;
    const p0 = new p5.Vector(poly[vidx][0], poly[vidx][1]);
    const p1 = new p5.Vector(poly[vidx+1][0], poly[vidx+1][1]);
    return [p0, p1];
  }
  
  GotoNextEdge() {
    const poly = this.data[this.polygon_idx];

    let ok = true;
    if (this.polygon_idx == this.data.length - 1) {
      if (this.polygon_idx >= this.data.length - 2) {
        ok = false;
        this.curr_edge_completion = 1;
      }
    }
    
    if (ok) {
      if (this.vert_idx >= poly.length - 2) {
        this.polygon_idx ++;
        this.vert_idx = 0;
        this.curr_edge_completion = 0;
        this.OnNewEdge();
      } else {
        this.vert_idx ++;
        this.curr_edge_completion = 0;
        this.OnNewEdge();
      }
    }
  }
  
  OnNewEdge() {
    if (this.IsDone()) return;
    let p0p1 = this.CurrEdgeP0P1();
    const p0 = p0p1[0], p1 = p0p1[1];
    this.curr_edge_len = p0.copy().sub(p1).mag();
    this.curr_edge_completion = 0;
  }
  
  SetData(d) {
    this.data = d;
    this.polygon_idx = 0;
    this.vert_idx = 0;
    this.g.clear();
    
    this.OnNewEdge();
    this.bb = this.CalculateBB();
    //this.h = (this.bb[3] - this.bb[1]) * this.scale;
    const PAD = 16;
    this.h = this.bb[3] * this.scale + PAD;
  }
  
  Render() {
    if (this.buffered) {
      image(this.g, this.x, this.y, this.g.width / this.density, this.g.height / this.density);
    } else {
      if (this.data == undefined) return;
      let done = false;
      push();
      noFill();
      stroke("#FF3");
      strokeWeight(1 / this.scale);
      translate(this.x, this.y);
      scale(this.scale);
      for (let i=0; i<this.data.length; i++) {
        const poly = this.data[i];
        if (done) break;
        for (let j=0; j<poly.length-1; j++) {
          const p0p1 = this.EdgeP0P1(i, j);
          const p0 = p0p1[0], p1 = p0p1[1];
          if (i == this.polygon_idx && j == this.vert_idx) {
            done = true;
            const x = p5.Vector.lerp(p0, p1, this.curr_edge_completion);
            line(p0.x, p0.y, x.x, x.y);
            break;
          } else {
            line(p0.x, p0.y, p1.x, p1.y);
          }
        }
      }
      pop();
    }
  }
  
  IsDone() {
    if (this.data == undefined) return true;
    return (this.polygon_idx == this.data.length-1 &&
            this.vert_idx == this.data[this.data.length-1].length-2 &&
            this.curr_edge_completion >= 1);
  }
  
  Update(delta_ms) {
    if (this.IsDone()) return;
    this.g.push();
    this.g.scale(this.scale * this.density);
    this.g.strokeWeight(1/this.scale);
    this.g.stroke("#FF3");
    let togo = delta_ms / 1000.0 * this.speed;
    let attempt = 1;
    while (togo > 0 && attempt < 100) {
      attempt ++;
      if (this.IsDone()) break;
      const curr_edge_left = this.curr_edge_len * (1-this.curr_edge_completion);
      let deduct = togo;
      if (curr_edge_left <= togo) deduct = curr_edge_left;

      {
        togo -= deduct;
        let new_completion = this.curr_edge_completion + deduct / this.curr_edge_len;
        if (new_completion > 1) { this.new_completion = 1; }
        let p0p1 = this.CurrEdgeP0P1();
        const p0 = p0p1[0], p1 = p0p1[1];
        const d0 = p5.Vector.lerp(p0, p1, this.curr_edge_completion);
        const d1 = p5.Vector.lerp(p0, p1, new_completion);

        if (this.buffered) {
          this.g.line(d0.x, d0.y, d1.x, d1.y);
        }

        this.curr_edge_completion = new_completion;
        if (new_completion >= 1) {
          if (!this.IsDone()) {
            this.GotoNextEdge();
            this.OnNewEdge();
          }
        }
      }
    }
    this.g.pop();
  }
}

class Button extends MyStuff {
  constructor(txt) {
    super();
    this.x = 32;
    this.y = 280;
    this.w = 50;
    this.h = 50;
    this.is_enabled = true;
    this.is_hovered = false;
    this.is_pressed = false;
    this.clicked = function() {}
    this.released = function() {}
    this.txt = txt;
    this.border_style = 2;
    this.checked = false;
    this.text_size = undefined;
  }
  do_Render() {
    if (!this.is_enabled) {
      this.is_hovered = false;
      this.is_pressed = false;
    }
    push();

    let c = color(128, 128, 128);
    let f = color(32, 32, 32, 192);
    if (!this.is_enabled) {
      c = "#777";
      f = color(128, 128, 128, 192);
    } else {
      if (!this.is_hovered) {
        c = color(128, 128, 128);
        if (this.checked) {
          f = color(193, 84, 71, 192);
        } else {
          f = color(32, 32, 32, 192);
        }
      } else {
        if (this.is_pressed) {
          c = color(56, 32, 32);
          f = color(192, 44, 56, 192);
        } else {
          c = color(255, 255, 32);
          f = color(255, 240, 240, 192);
        }
      }
    }

    fill(f);
    stroke(c);

    const x = 0, y = 0, w = this.w, h = this.h;
    if (!this.is_enabled) {
      line(0, 0, w, h); line(w, 0, 0, h);
    }

    //rect(0, 0, w, h);
    if (this.border_style == 1) {
      DrawBorderStyle1(0, 0, w, h);
    } else {
      DrawBorderStyle2(0, 0, w, h);
    }

    fill(255, 255, 32);
    if (this.text_size != undefined) {
      textSize(this.text_size);
    } else {
      textSize(Math.max(14, this.h/3));
    }

    textAlign(CENTER, CENTER);
    noStroke();
    text(this.txt, w/2, h/2);
    pop();
  }
  IsHidden() { return false; }
  do_Hover(mx, my) {
    //const parent_xy = this.GetParentTranslate();
    const parent_xy = new p5.Vector(0, 0);
    
    if (this.IsHidden()) {
      this.is_hovered = false;
      return;
    }

    mx -= g_ui_translate_x;
    my -= g_ui_translate_y;
    mx -= parent_xy.x;
    my -= parent_xy.y;
    
    if (!this.is_enabled) return;
    if (mx >= this.x          && my >= this.y &&
        mx <= this.x + this.w && my <= this.y + this.h) {
      this.is_hovered = true;
    } else {
      this.is_hovered = false;
    }
  }
  Unhover() {
    this.is_hovered = false;
  }
  OnPressed() {
    if (!this.is_enabled) return;
    if (this.is_hidden) return;
    if (!this.is_pressed) {
      this.is_pressed = true;
      this.clicked();
    }
  }
  OnReleased() {
    if (!this.is_enabled) return;
    if (this.is_pressed) {
      this.is_pressed = false;
      this.released();
    }
  }
  
  Push() {
    push();
    translate(this.x, this.y);
  }

  Pop() {
    pop();
  }
  Render() {
    if (this.is_hidden == true) return;
    if (this.parent && this.parent.visible == false) return;
    this.Push();
    this.do_Render();
    if (this.children != undefined) {
      this.children.forEach((c) => {
        c.Render();
      })
    }
    this.Pop();
  }
}

class WidgetViewport {
  constructor() {
    this.x = 0; this.y = 0;
    this.drag_y = 0;
    this.is_dragging = false;
  }
  
  OnStartDrag() {
    this.is_dragging = true;
  }
  
  OnDragging(delta_y) {
    this.drag_y = delta_y;
  }
  
  OnStopDrag() {
    this.y -= this.drag_y;
    this.drag_y = 0;
  }
  
  GetY() {
    return this.y - this.drag_y;
  }
}
let g_viewport = new WidgetViewport();

function setup() {
  createCanvas(480, 854);
  
  ALL_PATHS.forEach((x) => {
    const name = x[0];
    let path = [];
    x[1].forEach((p) => {
      path.push(GetVertexes(p));
    })
    g_allpaths[name] = path;
  });
  
  let b_prev = new Button("<<");
  b_prev.x = 8;
  b_prev.w = (W0-24)/2;
  b_prev.h = 48;
  b_prev.y = H0 - b_prev.h - 8;
  b_prev.clicked = function() {
    ScrollDataSet(-1);
  }
  g_buttons.push(b_prev);
  
  let b_next = new Button(">>");
  b_next.w = (W0-24)/2;
  b_next.x = W0-8-b_next.w;
  b_next.h = 48;
  b_next.y = H0 - b_prev.h - 8;
  b_next.clicked = function() {
    ScrollDataSet(1);
  }
  g_buttons.push(b_next);
  
  /*
  ALL_DATASETS.forEach((ds) => {
    let title = ds[0];
    let datasets = ds[1];
    let dataset_paths = [];
    ds[1].forEach((p) => {
      let path = [];
      for (let i=0; i<p.length; i++) {
        path.push(GetVertexes(p[i]));
      }
      dataset_paths.push(path);
    });
    g_dataset_paths.push(dataset_paths);
    g_dataset_titles.push(title);
  })
  */
}

// 设置数据集并且排版
function SetDataset(idx) {
  const layout = ALL_LAYOUTS[idx];
  g_graphers.forEach((g) => {
    g.SetData(undefined);
  });
  g_titles.forEach((g) => {
    g.SetTitle(undefined, undefined, undefined);
  });
  g_texts.forEach((g) => {
    g.SetText(undefined);
  });
  
  let gidx = 0, tidx = 0, y = 0, txtidx = 0;
  layout.forEach((entry) => {
    switch (entry[0]) {
      case "title": {
        g_titles[tidx].SetTitle(entry[1], entry[2], entry[3]);
        g_titles[tidx].y = y;
        y += g_titles[tidx].h;
        tidx++;
        break;
      }
      case "graph": {
        g_graphers[gidx].SetData(g_allpaths[entry[1]]);
        g_graphers[gidx].y = y;
        y += g_graphers[gidx].h
        gidx++;;
        break;
      }
      case "text": {
        g_texts[txtidx].SetText(entry[1]);
        g_texts[txtidx].y = y;
        y += g_texts[txtidx].h;
        txtidx++;
        break;
      }
    }
  })
}

let g_frame_count = 0;
function draw() {
  push();
  
  scale(g_scale);
  
  if (g_frame_count == 0) {
    for (let i=0; i<3; i++) {
      g_graphers.push(new PolygonGrapher());
      g_titles.push(new TitleWidget());
      g_texts.push(new TextWidget());
    }
    SetDataset(g_dataset_idx);
  }
  g_frame_count ++;
  
  background(32);
  
  const SCALE = 3;
  
  push();
  translate(0, g_viewport.GetY());

  g_graphers.forEach((g) => {
    g.Update(deltaTime);
    g.Render();
  });

  g_texts.forEach((t) => {
    t.Update(deltaTime);
    t.Render();
  });
  
  g_titles.forEach((t) => {
    t.Update(deltaTime);
    t.Render();
  });

  pop();
    
  g_buttons.forEach((b) => {
    b.Render();
  })
  
  const mx = g_pointer_x / g_scale, my = g_pointer_y / g_scale;
  ForAllButtons((b) => {
    b.do_Hover(mx, my);
    if (b.is_hovered) {
      has_hovered_buttons = true;
      g_hovered_button = b;
    }
  })
  
  noStroke();
  fill("#FF3");
  textAlign(LEFT, TOP);
  
  {
    let dx = W0/2, dy = H0 - 80;
    const SKIP = 24;
    const N = ALL_LAYOUTS.length;
    dx = dx - SKIP * (N-1) / 2;
    for (let i=0; i<N; i++) {
      let R = 6;
      if (i == g_dataset_idx) {
        stroke("#999");
        fill("#FF3");
        R = 8;
      } else {
        stroke("#CCC");
        noFill();
      }
      beginShape();
      vertex(dx-R, dy);
      vertex(dx, dy-R);
      vertex(dx+R, dy);
      vertex(dx, dy+R);
      endShape(CLOSE);
      dx += SKIP;
    }
  }
  
  noStroke();
  fill("rgba(255, 255, 32, 0.5)");
  circle(mx, my, 5);
  
  fill("#FF3");
  //text(g_viewport_drag_y+"", 3, 3)
  
  pop();
  
  /*
  push();
  scale(SCALE);
  strokeWeight(1/SCALE);
  noFill();  
  stroke("#FF3")
  const p = g_paths[g_path_idx];
  for (let i=0; i<p.length; i++) {
    beginShape();
    for (let j=0; j<p[i].length; j++) {
      const v = p[i][j];
      vertex(v[0], v[1]);
    }
    endShape();
  }
  pop();
  */
  
  if (g_frame_count == 1 || (g_frame_count % 60 == 0)) {
    OnWindowResize();
  }
}
  
function ScrollDataSet(delta) {
  const N = ALL_LAYOUTS.length;
  g_dataset_idx = (g_dataset_idx + delta + N) % N;
  g_viewport.y = 0;
  SetDataset(g_dataset_idx);
}

function keyPressed(key) {
  let delta = 0;
  if (keyCode == LEFT_ARROW || keyCode == DOWN_ARROW) {
    delta = -1;
  } else if (keyCode == RIGHT_ARROW || keyCode == UP_ARROW) {
    delta = 1;
  }
  if (delta != 0 && g_graphers.length > 0) {
    ScrollDataSet(delta);
  }
}

// 遍历所有按钮
// 注意！包括不在 g_buttons 中的按钮
function do_ForAllButtons(elt, callback) {
  if (elt instanceof Button) {
    callback(elt);
  }
  if (elt.children instanceof Array) {
    elt.children.forEach((c) => {
      do_ForAllButtons(c, callback);
    })
  }
}

function ForAllButtons(callback) {
  {
    g_buttons.forEach((b) => {
      callback(b);
    })
  }
}

// Touch or mouse input events

function touchStarted(event) {
  TouchOrMouseStarted(event);
}

function mousePressed(event) {
  TouchOrMouseStarted(event);
  // TODO：为什么在手机上按一下既会触发touchevent又会触发mouseevent
}

function touchEnded(event) {
  TouchOrMouseEnded(event);
  ForAllButtons((b) => {
    b.OnReleased();
  });
}
function mouseReleased(event) {
  TouchOrMouseEnded(event);
  ForAllButtons((b) => {
    b.OnReleased();
  });
}

function touchMoved(event) {
  TouchOrMouseMoved(event);
}

function mouseMoved() {
  TouchOrMouseMoved(event);
}
