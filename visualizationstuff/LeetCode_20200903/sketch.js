// 2020-09-03
// "Repeated String Pattern"
// https://leetcode.com/explore/challenge/card/september-leetcoding-challenge/554/week-1-september-1st-september-7th/3447/

let g_autorun = true;

const FONT_SIZE = 16;
let CHAR_WIDTH = FONT_SIZE * 0.8;
const PAD = 1;
const PALETTE = [
  [128, 255, 255, 160],
  [128, 128, 255, 192]
];


let DUPE_ORIG_STR = "Duplicated original string";
let MAKE_NEEDLE = "Made a copy of the original string";
let OFFSET1 = "Move needle to the right by 1";
let COMPARING = "Comparing against a section of the original string";
let FOUND_MATCH = "Found a match, meaning the original string is substring reps";
let NOT_REPS_OF_SUBSTR = "The original string is not a repetition of substrings";
let EQUAL_STR = "Equal";
let NOT_EQUAL_STR = "Not equal";
let AUTORUN_MSG = "Autorun mode";
let INPUT_STR = "Input: ";

/*
let DUPE_ORIG_STR = "将原字串复制一份拼接到最后。";
let MAKE_NEEDLE = "再将原字串放到一边用于比对。";
let OFFSET1 = "先往右移一格再开始比对。";
let COMPARING = "逐字符移动看相不相等。";
let FOUND_MATCH = "发现相等，说明原字串是由子字符串重复而成。";
let NOT_REPS_OF_SUBSTR = "没有相等的情况，原字符串不是由子字符串重复而成。";
let EQUAL_STR = "相等";
let NOT_EQUAL_STR = "不相等";
let AUTORUN_MSG = "自动运行中";
let INPUT_STR = "输入：";
*/

// 一共就这么几个槽。
// 其实有点像old school graphics不是吗。
let g_sv0, g_sv1, g_sv2, g_temp1, g_temp2;
let g_state = "not started";
let g_director;
let g_animator;
let g_skip_animation = false;
let g_label, g_label2;

let g_global_info = "";

function SetGlobalInfo(x) {
  g_global_info = x;
}

const TICK_INTERVAL = 50;

class StrViz {
  constructor(str, x, y) {
    this.str = str;
    this.x = x;
    this.y = y;
    this.scale = 1;
    this.SetText(str);
    this.highlights = [];
    this.marker = undefined;

    // Test
    //this.AddHighlightArea([0,2]);
    //this.AddHighlightArea([3,5]);
    this.marker_color = [32, 255, 32];
  }

  SetGreenMarker() {
    this.marker_color = [32, 255, 32];
  }
  SetRedMarker() {
    this.marker_color = [255, 128, 32];
  }

  GetXByOffset(o) {
    return this.x + this.scale * CHAR_WIDTH * o;
  }

  AddHighlightArea(x) {
    this.highlights.push(x);
  }

  SetText(str) {
    this.w = CHAR_WIDTH * str.length;
    this.h = FONT_SIZE;
    this.num_char_shown = 0;
    this.last_millis = millis();
    this.tick_elapsed = this.last_millis;
    this.str = str;
  }

  Render() {
    rectMode(CORNER);

    // Highlight areas
    for (let i = 0; i < this.highlights.length; i++) {
      const c = PALETTE[i % PALETTE.length];
      fill(c[0], c[1], c[2], c[3]);
      const pad = 1;
      const lb = this.highlights[i][0];
      const ub = this.highlights[i][1];
      const x0 = this.x + pad + this.scale * CHAR_WIDTH * lb;
      const x1 = this.x - pad + this.scale * CHAR_WIDTH * (ub + 1);
      const y0 = this.y + pad;
      const y1 = this.y + this.h - pad;
      rect(x0, y0, x1 - x0, y1 - y0);
    }

    noFill();
    stroke(255);

    const ns = this.num_char_shown;

    const dw = CHAR_WIDTH * ns * this.scale;
    const dh = this.h;

    rect(this.x, this.y, dw, dh);

    for (let i = 1; i < ns; i++) {
      const dx = this.x + i * CHAR_WIDTH * this.scale;
      line(dx, this.y, dx, this.y + dh);
    }

    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < ns; i++) {
      text(this.str[i], this.x + (i + 0.5) * CHAR_WIDTH * this.scale, this.y + dh / 2 + PAD);
    }

    // Set marker
    if (this.marker != undefined) {
      push();
      const pad = 3;
      strokeWeight(2);
      const dx = this.x + this.scale * CHAR_WIDTH * this.marker;
      const c = this.marker_color;
      stroke(c[0], c[1], c[2]);
      noFill();
      line(dx, this.y - pad, dx, this.y + this.h + pad);
      pop();
    }
  }

  Update() {
    const ms = millis();

    this.tick_elapsed += max(0, ms - this.last_millis);

    while (this.tick_elapsed >= TICK_INTERVAL && this.num_char_shown < this.str.length) {
      this.tick_elapsed -= TICK_INTERVAL;
      this.num_char_shown++;
    }

    this.last_millis = ms;
  }

  StartFoldOut(idx = 0) {
    this.tick_elapsed = 0;
    this.num_char_shown = idx;
  }
}

class TextLabel {
  constructor(txt = "", x = 0, y = 0) {
    this.txt = txt;
    this.x = x;
    this.y = y;
    this.c = "#fff";
    this.align = CENTER;
    this.font_size = 12;
  }
  Render() {
    push();
    textAlign(this.align, CENTER);
    noStroke();
    fill(this.c);
    textSize(this.font_size);
    text(this.txt, this.x, this.y);
    pop();
  }
}

class Director {
  constructor() {
    this.state = "not_started";
    this.input = "";
  }
  SetInput(i) {
    g_iter ++;
    this.state = "not_started";
    SetGlobalInfo(INPUT_STR + i);
    g_sv1 = undefined;
    g_sv2 = undefined;
    g_sv0 = new StrViz(i, 16, 32);
    g_animator.Animate(g_sv0, "scale", [0, 1, 1], [0, 500]);
    g_sv0.StartFoldOut();
    this.input = i;
    g_label.txt = "";
    g_label2.txt = "";
    this.sv1_offset = 0;
    this.sv1_offset_disp = 0; // 仅用于显示

    this.count2 = 0;
  }
  Update() {
    if (g_sv1 != undefined) {
      g_sv1.x = g_sv0.GetXByOffset(this.sv1_offset_disp);
      g_label.y = g_sv1.y + FONT_SIZE * 2;
      g_label.x = g_sv1.x + g_sv1.w / 2;
    }
  }

  Step() {
    switch (this.state) {
      case "not_started": {
        SetGlobalInfo(DUPE_ORIG_STR);
        this.state = "duped";
        g_sv0.SetText(this.input + this.input);
        g_sv0.marker = this.input.length;
        g_sv0.SetGreenMarker();
        g_sv0.StartFoldOut(this.input.length);
        break;
      }
      case "duped": {
        SetGlobalInfo(MAKE_NEEDLE);
        this.state = "needle_done";
        const x = 16,
          y = 56 ;
        g_sv1 = new StrViz(this.input, x, y);
        g_sv1.StartFoldOut(this.input.length);
        g_animator.Animate(g_sv1, "x", [g_sv0.x, x], [0, 300]);
        g_animator.Animate(g_sv1, "y", [g_sv0.y, y], [0, 300]);
        this.sv1_offset = 0;
        break;
      }
      case "needle_done": {

        //g_label.txt = "";
        g_label.c = "#ddd";
        if (this.sv1_offset == 0) {
          SetGlobalInfo(OFFSET1);
        } else if (this.sv1_offset < this.input.length) {
          SetGlobalInfo(COMPARING);
        }

        const o = this.sv1_offset;
        if (o < this.input.length) {
          g_animator.Animate(this, "sv1_offset_disp", [o, o + 1], [0, 180], () => {
            g_label.c = "#eee";
            this.DoCompare();
          });
          this.sv1_offset++;
        } else {
          this.state = "end_not_found";
        }
        break;
      }
      case "end_found": {
        SetGlobalInfo(FOUND_MATCH);
        const l = this.sv1_offset;
        const x = 16,
          y = 104;
        g_sv2 = new StrViz(this.input.substr(0, l), g_sv0.x, g_sv0.y);
        g_sv2.StartFoldOut(l);
        g_animator.Animate(g_sv2, "x", [g_sv0.x, x], [0, 300]);
        g_animator.Animate(g_sv2, "y", [g_sv0.y, y], [0, 300]);

        g_temp1 = new StrViz(this.input.substr(0, l), -999, -999);
        g_temp2 = new StrViz(this.input.substr(0, l), -999, -999);

        this.state = "count2";
        g_label2.txt = "";
        g_label2.x = x + g_sv2.w + 3;
        g_label2.align = LEFT;
        g_label2.y = y + g_sv2.h / 2 + 1;
        break;
      }
      case "count2": {
        const l = this.sv1_offset;
        if (this.count2 * l >= this.input.length) {
          this.WipeOutEverything();
        } else {
          const lb = this.count2 * l,
            ub = lb + l - 1;

          g_label2.align = LEFT;
          g_label2.txt = "x" + (1 + this.count2);

          g_animator.Animate(g_temp1, "x", [g_sv2.x, g_sv0.GetXByOffset(lb)], [0, 250],
            () => {
              g_temp1.x = -999;
            });
          g_animator.Animate(g_temp1, "y", [g_sv2.y, g_sv0.y], [0, 250]);
          g_animator.Animate(g_temp2, "x", [g_sv2.x, g_sv1.GetXByOffset(lb)], [0, 250],
            () => {
              g_temp2.x = -999;
            });
          g_animator.Animate(g_temp2, "y", [g_sv2.y, g_sv1.y], [0, 250]);
          g_animator.Animate(g_label2, "font_size", [24, 12], [0, 150]);

          g_sv0.AddHighlightArea([lb, ub]);
          g_sv1.AddHighlightArea([lb, ub]);
          this.count2++;
        }
        break;
      }
      case "end_not_found": {
        this.WipeOutEverything();
        break;
      }
    }
  }

  OnNotFound() {
    SetGlobalInfo(NOT_REPS_OF_SUBSTR);
    g_sv0.SetRedMarker();
    g_label2.txt = NOT_REPS_OF_SUBSTR;
    g_label2.align = CENTER;
    g_label2.y = 104;
    g_animator.Animate(g_label2, "x", [-width/2, width/2], [0, 300]);
    this.state = "end_not_found";
  }

  WipeOutEverything() {
    const t = 500;
    [g_sv0, g_sv1, g_sv2, g_label, g_label2, g_temp1, g_temp2].forEach((x) => {
      if (x != undefined) {
        g_animator.Animate(x, "x", [x.x, x.x + width], [0, t]);
      }
    });
    setTimeout(() => {
      GenInput();
    }, t);
  }

  DoCompare() {
    // GUARD
    if (this.sv1_offset >= this.input.length) {
      this.OnNotFound();
      return;
    }

    let eq = true;
    if (g_sv1 == undefined) return;
    for (let i = 0; i < this.input.length; i++) {
      if (g_sv0.str[i + this.sv1_offset] != g_sv1.str[i]) {
        eq = false;
        break;
      }
    }
    if (eq) {
      g_label.txt = EQUAL_STR;
      g_label.c = "#2f2";
      this.state = "end_found"
    } else {
      g_label.txt = NOT_EQUAL_STR;
      g_label.c = "#fff";
    }
  }
  
  GetAutoRunDelay() {
    if ((1+this.count2) * this.sv1_offset >= this.input.length-1) return 1500;
    else if (this.state == "not_started") return 1000;
    else if (this.state == "needle_done") return 500;
    else if (this.state == "count2") return 300;
    else return 900;
  }
};

function GenInput() {
  let i = "";
  let a = "";
  const pattern_len = random(1, 5);
  for (let k=0; k<pattern_len; k++) {
    a = a + String.fromCharCode(parseInt(random(97, 123))); // 'a' to 'z'
  }
  const total_len = random(5, 16);
  while (i.length < total_len) i = i + a;
  
  // Mess up the input
  if (g_iter % 2 == 0) {
    const ix = parseInt(random(0, i.length));
    i = i.substring(0, ix) + String.fromCharCode(parseInt(random(97, 124))) + i.substring(ix+1);
  }
  
  if (i.length > 10) { CHAR_WIDTH = FONT_SIZE * 0.7; }
  else { CHAR_WIDTH = FONT_SIZE; }
  
  g_director.SetInput(i);
}

function setup() {
  createCanvas(400, 160);
  g_label = new TextLabel("", 0, 0);
  g_label2 = new TextLabel("", 0, 0);
  g_animator = new Animator();
  g_director = new Director();
  GenInput();
}

let g_frame_count = 0;
let g_iter = 0;
function draw() {
  if (g_frame_count == 0 && g_autorun) { StartAutoRun(); }
  g_frame_count ++;
  
  background(62);
  g_animator.Update();
  g_director.Update();
  [g_sv0, g_sv1, g_sv2, g_temp1, g_temp2].forEach((x) => {
    if (x != undefined) {
      x.Update();
      x.Render();
    }
  });
  [g_label, g_label2].forEach((x) => {
    x.Render();
  });

  textAlign(LEFT, TOP);
  noStroke();
  fill(255);

  text(g_global_info, 4, 4);

  fill(255, 255, 32);
  
  if (g_autorun) {
    textAlign(LEFT, BOTTOM);
    text(AUTORUN_MSG, 2, height-2);
  }
}

function keyPressed() {
  if (key == ' ') {
    g_director.Step();
  }
}

function StartAutoRun() {
  g_autorun = true;
  AutoStep();
}

function AutoStep() {
  let t = g_director.GetAutoRunDelay();
  
  g_director.Step();
  
  setTimeout(() => { AutoStep(); }, t);
}