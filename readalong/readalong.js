const PROBE_RANGE0 = 4, PROBE_INCREMENT0 = 2;

const PUZZLE_EVENT_COLOR = [192, 192, 244];
const TENTATIVE_MATCH_COLOR = [10, 183, 252];
const CAN_PROBE_COLOR = [ 32, 244, 244 ];
const DONE_BG = [ 238, 176, 94 ];
const DONE_FG = [ 204, 113, 84 ];

class AlignerParticle {
  // 这里的坐标是canvas上的坐标
  constructor(start, target, target_lidx, target_cidx) {
    this.p0 = start.copy();
    this.start  = start;
    this.target = target;
    this.pos = start.copy();
    this.done = false;
    this.target_lidx = target_lidx; this.target_cidx = target_cidx;

    this.wait_ms = 0;

    this.state = "wait";
    this.explode_ms = 500;
  }
  Update(delta_ms) {
    const VELOCITY = 400;
    let target_effective = this.target.copy();
    const translate_y = g_aligner.GetPanY() * (-1);
    target_effective.x += g_readalong_layout.x;
    target_effective.y += g_readalong_layout.y + translate_y;
    
    const t = target_effective;

    if (this.state == "wait") {
      this.wait_ms -= delta_ms;
      if (this.wait_ms < 0) {
        this.wait_ms = 0;
        this.state = "move";
      }
    } else if (this.state == "move") {
      const THRESH = VELOCITY * delta_ms / 1000;
      if (this.pos.copy().sub(t).magSq() <= THRESH * THRESH) {
        this.pos = t.copy();
        this.state = "explode";
      } else {
        const dir = target_effective.copy().sub(this.pos).normalize();
        const advance = dir.copy().mult(THRESH);
        this.pos.add(advance)
      }
    } else if (this.state == "explode") {
      this.explode_ms -= delta_ms;
      if (this.explode_ms < 0) {
        this.explode_ms = 0;
        this.done = true;
      }
    }
  }
  Render() {
    let r = 8, alpha = 128;
    if (this.state == "explode") {
      r = map(this.explode_ms, 500, 0, 8, 25);
      alpha = map(this.explode_ms, 500, 0, 128, 0);
    }
    stroke(32);
    fill(color(255, 234, 32, alpha));
    circle(this.pos.x, this.pos.y, r);
    //line(this.pos.x, this.pos.y, this.p0.x, this.p0.y);
  }
}

class AlignerParticleSystem {
  constructor() {
    this.particles = [];
  }

  Render() {
    this.particles.forEach((p) => {
      p.Render();
    })
  }

  Update(delta_ms, target_lidx, target_cidx) {
    //const lerp_k = pow(0.95, delta_ms / 16);
    let np = [];
    this.particles.forEach((p) => {
      p.Update(delta_ms);
      if (!p.done) {
        np.push(p);
      }
    });
    this.particles = np;
  }

  AddParticle(p0, p1, delay) {
    const p = new AlignerParticle(p0, p1);
    p.wait_ms = delay;
    this.particles.push(p);
  }
}

class Aligner extends MyStuff {
  constructor() {
    super();
    this.w = 478; this.h = 640;
    this.Reset();
    this.text_size = 28;

    this.saved_pinyin_idx = undefined;
    this.saved_line_idx = undefined;
    this.saved_char_idx = undefined;

    this.probe_lidx = undefined;
    this.probe_pidx = undefined;
    this.probe_cidx = undefined;

    // Lidx, Cidx
    this.char_positions = [];

    // 粒子到达时就会标记为True
    this.char_done = [];

    this.activation_lidx = -1;
    this.done_fadein_ms = 1000;
    this.is_done = false;
  }

  FadeInDone() {
    this.done_fadein_ms = 1000;
  }
  
  LoadData(data, title, text_size) {

    this.timestamp0 = millis();
    this.timestamp1 = millis();
    this.activation_lidx = -1;
    this.text_size = text_size;
    this.title = title;
    this.data = data.slice();
    this.puzzle_events = [];
    this.puzzle_events_watermark = -1; // 最大的【点击过的】事件列表
    this.line_idx = 0; // 第几行
    this.prev_line_idx = 0;
    
    this.char_idx   = 0; // 第几个字，可能与拼音有出入
    this.pinyin_idx = 0; // 第几个拼音
    
    this.saved_pinyin_idx = undefined;
    this.saved_line_idx = undefined;
    this.saved_char_idx = undefined;

    this.probe_lidx = undefined;
    this.probe_pidx = undefined;
    this.probe_cidx = undefined;
    this.is_done = false;

    console.log(this.data);

    if (data.length > 0) {
      // 为了适应空白分隔行
      for (let i=0; i<this.data.length; i++) {
        if (this.data[i].length < 1) continue;
        this.data[i][1] = this.data[i][1].slice(); // deep copy
      }
      for (let i=0; i<this.data.length; i++) {
        if (this.data[i].length > 0) { 
          if (typeof(this.data[i][1]) == "string") { // 为什么这个会持续
            this.data[i][1] = this.data[i][1].split(" ");
          }
        }
        this.puzzle_events.push([]);
      }
    }
    OnUpdateWeightMask();

    this.CalculateTextPositions();

    // [ (时间片idx, 文字位置) ]
    this.alignments = [];
  }

  SpawnPuzzleEventLabels(num_steps) {
    let num_non_empty_lines = 0;
    this.data.forEach((line) => {
      if (line[0].length > 0) {
        num_non_empty_lines ++;
      }
    })
    let num_non_empty_lines_seen = 0;

    let step_idx = 0;

    for (let i=0; i<this.data.length; i++) {
      if (this.data[i][0].length > 0) {
        num_non_empty_lines_seen ++;
      }
      const data_idx = parseInt(map(step_idx+1, 0, num_steps, 0, num_non_empty_lines));
      if (num_non_empty_lines_seen >= data_idx) {
        step_idx ++;
        this.puzzle_events[i].push("※");
      }
      if (step_idx >= num_steps) break;
    }
  }
  
  static PUNCT = new Set(['，', '。', '；']);
  
  PinyinIdxToCharIdx(lidx, pidx) {
    if (lidx >= this.data.length) return 0;
    
    const line = this.data[lidx][0];
    let ret = 0;
    for (let i=0; i<pidx; i++) {
      while (Aligner.PUNCT.has(line[ret])) {
        ret++;
      }
      ret++;
    }
    return ret;
  }
  
  CharIdxToPinyinIdx(lidx, cidx) {
    let ret = 0;
    const line = this.data[lidx][0];
    let i = 0;
    do {
      while (line[i] in PUNCT) { i++; }
      i++; ret++;
    } while (i < line.length);
    return ret;
  }
  
  GetNextPinyins(n) {
    let ret = [];
    let l = this.line_idx, c = this.char_idx;
    if (l >= this.data.length) return undefined;
    for (let i=0; i<n; i++) {
      ret.push(this.data[l][1][c]);
      c++;
      if (c >= this.data[l][1].length) {
        c = 0; l++;
      }
      if (l >= this.data.length) break;
    }
    return ret;
  }

  CompareLineAndCharIdxes(line_idx0, char_idx0, line_idx1, char_idx1) {
    if (line_idx0 < line_idx1) return -1;
    else if (line_idx0 > line_idx1) return 1;
    else {
      if (char_idx0 < char_idx1) return -1;
      else if (char_idx0 == char_idx1) return 0;
      else return 1;
    }
  }

  // 计算 Layout之后 所有字符的位置
  CalculateTextPositions() {
    this.char_positions = [];
    // 画图的位置：(x+dx, y)
    // 在Render中，需要加上(g_readalong_layout.x, g_readalong_layout.y + translate_y)
    // 在这里就不加了
    push();
    let y = 0;
    const TEXT_SIZE = this.text_size;
    textSize(TEXT_SIZE);
    for (let i=0; i<this.data.length; i++) {
      const line_cps = [];
      if (this.data[i].length > 0) {
        const line = this.data[i][0];
        let dx = 0;
        for (let cidx = 0; cidx < line.length; cidx ++) {
          const ch = line[cidx];
          const tw = textWidth(ch);
          dx = dx + tw;
          line_cps.push(new p5.Vector(dx+tw/2, y+TEXT_SIZE/2));
        }
      }
      y = y + TEXT_SIZE * 1.2;
      this.char_positions.push(line_cps);
    }
    pop();
  }

  DrawParticles() {

  }

  Render() {
    push();
    noStroke();

    fill(0);
    
    const TEXT_SIZE = this.text_size;
    const COLOR1 = '#33f', COLOR2 = '#000';
    textSize(TEXT_SIZE);
    textFont('KaiTi');
    
    const translate_y = -this.GetPanY();
    const margin = 32;

    // 高亮当前行
    const ly = g_readalong_layout.y, lh = g_readalong_layout.h;
    let hl_y0 = ly + translate_y + TEXT_SIZE*1.2 * this.line_idx;
    let hl_y1 = hl_y0 + TEXT_SIZE * 1.2;
    hl_y0 = min(hl_y0, ly+lh); hl_y1 = min(hl_y1, ly+lh);
    hl_y0 = max(hl_y0, ly)   ; hl_y1 = max(hl_y1, ly);
    let hl_x = g_readalong_layout.x;
    fill(220);
    if (hl_y1 > ly && hl_y0 < lh+ly) {
      //rect(hl_x, hl_y0, this.w, hl_y1-hl_y0);
    }

    let y = g_readalong_layout.y + translate_y;
    let x = g_readalong_layout.x;
    for (let i=0; i<this.data.length; i++) {
      const curr_line = this.data[i][0];
      
        
      let alpha = 255, c0, c;
      const ly = g_readalong_layout.y, lh = g_readalong_layout.h;
      const y1_disappear = ly+lh-TEXT_SIZE*1.2;
      if (y < ly+margin) {
        alpha = map(y, ly+margin, ly, 255, 0);
      } else if (y > y1_disappear-margin) {
        alpha = map(y, y1_disappear-margin, y1_disappear,
          255, 0);
      }

      let dx = 0, pidx = 0; // 拼音idx
      for (let cidx = 0; cidx < curr_line.length; cidx ++) {
        const ch = curr_line[cidx];
        
        // Is done?
        let state = "not_done";
        // 在“还未确定的辨识结果”中
        const slidx = this.saved_line_idx, scidx = this.saved_char_idx;
        const spidx = this.saved_pinyin_idx;
        if (this.saved_line_idx != undefined && this.saved_char_idx != undefined &&
            this.saved_pinyin_idx != undefined) {
          if (this.CompareLineAndCharIdxes(i, cidx, slidx, scidx) < 0) {
            state = "done";
          } else if (this.CompareLineAndCharIdxes(i, cidx, this.line_idx, this.char_idx) == -1) {
            state = "tentative";
          } else if (this.CompareLineAndCharIdxes(i, cidx, this.probe_lidx, this.probe_cidx) == -1) {
            state = "can probe"
          } else {
            state = "not done";
          }
        } else {
          if (this.CompareLineAndCharIdxes(i, cidx, this.line_idx, this.char_idx) <= 0) {
            state = "tentative";
          } else {
            state = "not done";
          }
        }
    
        // Is punct?
        let highlighted = 0;
        if (ch in Aligner.PUNCT) { }
        else {
          const py = this.data[i][1][pidx];
          if (py != undefined) {
            const no_tone_py = this.NoTonePinyin(py);
            //console.log(py);
            if (no_tone_py in g_highlights) {
              highlighted = g_highlights[no_tone_py];
            }
          }
          pidx ++;
        }

        c0 = color(128, 128, 128, alpha), c = c0;
        if (state == "done") {
          c0 = color(252, 183, 10, alpha);
        } else if (state == "tentative") {
          c0 = color(TENTATIVE_MATCH_COLOR[0], TENTATIVE_MATCH_COLOR[1], TENTATIVE_MATCH_COLOR[2], alpha);
        } else if (state == "can probe") {
          //c0 = color(CAN_PROBE_COLOR[0], CAN_PROBE_COLOR[1], CAN_PROBE_COLOR[2], alpha);
        }

        if (state != "done" && highlighted > 0) {
          c = lerpColor(c0, color(192, 192, 192, alpha), highlighted);
        } else {
          c = c0;
        }
        
        dx = dx + textWidth(ch);
        if (alpha > 0) {
          noStroke();
          fill(c);
          text(ch, dx+x, y);
          if (state == "can probe") {
            noFill(); stroke(32);
            line(dx+3, y+TEXT_SIZE, dx+textWidth(ch), y+TEXT_SIZE);
          }
        }
      }

      const e = this.puzzle_events[i];
      if (e.length > 0) {
        const c = PUZZLE_EVENT_COLOR;
        fill(color(c[0],c[1],c[2],alpha));
        this.puzzle_events[i].forEach((elt) => {
          dx += textWidth(elt);
          text(elt, dx+x, y);
        })
      }
      
      y += TEXT_SIZE*1.2;
    }

    textSize(20);
    const dy = g_readalong_layout.title_y;
    let t = g_aligner.title;
    const sp = t.split("\n");
    let tw = 12;
    sp.forEach((line) => {
      tw = max(tw, textWidth(line)+20);
    })
    let nlines = sp.length
    
    
    let th = nlines * 23 + 3;
    stroke(32);
    fill("rgba(255,255,255,0.9)")
    DrawBorderStyle1(240-tw/2, dy, tw, th);

    noStroke();
    fill(COLOR0);
    //rect(g_readalong_layout.x, g_readalong_layout.y, this.w, this.h);
    textAlign(CENTER, TOP);
    text(t, 240, dy+2);

    if (this.is_done) {
      const completion = map(this.done_fadein_ms, 1000, 0, 0, 1);
      let donex = W0/2;
      let doney = H0/2;
      let donex0 = 0;
      let donex1 = W0;
      noStroke();
      fill(DONE_BG[0], DONE_BG[1], DONE_BG[2]);
      const halfext = 60;
      const hw = completion * W0/2;
      rect(donex - hw, doney - halfext, 2*hw, 2*halfext);
      fill(DONE_FG[0], DONE_FG[1], DONE_FG[2]);
      textAlign(CENTER, CENTER);
      textSize(36);
      const secs = parseInt((this.timestamp1 - this.timestamp0) / 1000);
      text("完成！\n用时：" + secs + "秒", donex, doney);
    } else {
      this.timestamp1 = millis();
    }

    pop();
  }
  
  // 同时也会进行模糊音的处理
  NormalizePinyin(x) {
    const x_backup = x;
    const PinyinConsonants = [
      "zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x",
      "z", "c", "s", "y", "w", "r"
    ];
    
    const PinyinVowels = [ "ai", "ei", "ui", "ao", "ou", "iu", "ie", "ue", "ve", "er",
      "an", "en", "in", "un", "ang", "eng", "ing", "ong", "vn", "a", "o", "e", "i", "u", "v"
    ];
    
    const Irreducible = new Set([
      "zhi", "chi", "shi", "ri", "zi", "ci", "si", "yi", "wu", "yu", "ye", "yue",
      "yin", "yun", "yuan", "ying", "ng",
    ]);
    
    // 1. Split
    if (Irreducible.has(x)) {
    //  console.log("irreducible: " + x);
      return x;
    }
    
    // 拼音最多有三个部分：声母，韵母1，韵母2
    let part0="", part1="", part2="";
    for (let i=0; i<PinyinConsonants.length; i++) {
      const c = PinyinConsonants[i];
      if (x.indexOf(c) == 0) {
        x = x.slice(c.length);
        part0 = c;
        break;
      }
    }
    
    for (let i=0; i<PinyinVowels.length; i++) {
      const v = PinyinVowels[i];
      if (x.length >= v.length && x.indexOf(v) == x.length-v.length) {
        x = x.slice(0, x.length-v.length);
        part2 = v;
        break;
      }
    }
    
    part1 = x;
    
    const USE_FUZZY = true;
    
    // 模糊音处理
    const FuzzyPinyinPart0List = [
      new Set([ "zh", "z", "r", "n", "l", "ch", "c", "sh", "s", "y" ]),
      new Set([ "f", "h"  ]),
      new Set([ "g", "k", "t", "d"  ]),
      
      new Set([ "zh", "ch" ]), // 虫
      new Set([ "x", "q" ]),
    ];
    
    const FuzzyPinyinPart2List = [
      new Set([ "ang", "an" ]),
      new Set([ "eng", "en" ]),
      new Set([ "ing", "in" ]),
      
      new Set([ "ong", "ou", "u", "o" ]), // 红
    ]
    
    const FuzzyPinyinCompleteList = [
      new Set([ "ri", "lv", "ng" ]),
      new Set([ "wang", "huang", "weng", "wen", "wan", "huan", "o", "fang", "hua", "feng", "bang" ]), 
      new Set([ "jia", "jiang" ]),
      new Set([ "lei", "wei" ]),
      new Set([ "li", "ling" ]),
      new Set([ "qiu", "qiong" ]),
      new Set([ "ju",  "yu" ]), // 居
      new Set([ "shi", "chi"]), // 齿
      new Set([ "liao", "yao" ]), // 辽
    ];
      
    if (USE_FUZZY) {
      // 全音
      for (let i=0; i<FuzzyPinyinCompleteList.length; i++) {
        const f = FuzzyPinyinCompleteList[i];
        if (f.has(x_backup)) {
          return "comp[" + i + "]";
        }
      }
      
      // 声母
      for (let i=0; i<FuzzyPinyinPart0List.length; i++) {
        const f = FuzzyPinyinPart0List[i];
        if (f.has(part0)) {
          part0 = "p0[" + i + "]";
          break;
        }
      }
      
      // 韵母
      for (let i=0; i<FuzzyPinyinPart2List.length; i++) {
        const f = FuzzyPinyinPart2List[i];
        if (f.has(part2)) {
          part2 = "p2[" + i + "]";
          break;
        }
      }
    }
    
    return part0 + part1 + part2;
  }
  
  NoTonePinyin(x) {
    let c = x[x.length - 1];
    if (c >= '0' && c <= '9') {
      x = x.slice(0, x.length-1);
    }
    
    return this.NormalizePinyin(x);
  }
  
  PushIdxes() {
    this.saved_char_idx   = this.char_idx;
    this.saved_line_idx   = this.line_idx;
    this.saved_pinyin_idx = this.pinyin_idx;
  }

  PopIdxes() {
    if (this.saved_pinyin_idx != undefined) {
      this.pinyin_idx = this.saved_pinyin_idx; this.saved_pinyin_idx = undefined;
    }
    if (this.saved_line_idx != undefined) {
      this.line_idx = this.saved_line_idx; this.saved_line_idx = undefined;
    }
    if (this.saved_char_idx != undefined) {
      this.char_idx = this.saved_char_idx; this.saved_char_idx = undefined;
    }
  }

  OnStartRecording() {
    this.probe_cidx = undefined;
    this.probe_lidx = undefined;
    this.probe_pidx = undefined;

    // 让probe的范围显示出来
    this.do_AllPinyinList([" "]);

    this.PushIdxes();
    this.alignments = [];
  }

  OnStopRecording() {
    console.log("Aligner.OnStopRecording, saved idx:"
      + this.saved_line_idx + "," + this.saved_char_idx + ", curr idx:"
      + this.line_idx + "," + this.char_idx);
    console.trace();
    let idx = 0;
    this.alignments.forEach((a) => {
      const p0 = new p5.Vector(g_recorderviz.x + 3 * a[0], g_recorderviz.y);
      g_aligner_particle_system.AddParticle(p0, a[1], idx*20);
      idx ++;
    });

    // cheat：如果还差3个字以内，就直接跳到终点了
    if (this.line_idx == this.data.length - 1) {
      const last_line = this.data[this.data.length - 1];
      if (this.char_idx >= last_line.length - 3) {
        this.char_idx = 0; this.pinyin_idx = 0; this.line_idx = this.data.length;
      }
    }

    while (this.activation_lidx < this.line_idx) {
      if (this.activation_lidx >= 0) {
        this.puzzle_events[this.activation_lidx].forEach((entry) => {
          g_puzzle_director.NextStep(true);
        });
      }
      this.activation_lidx ++;
    }

    this.saved_char_idx   = this.char_idx;
    this.saved_line_idx   = this.line_idx;
    this.saved_pinyin_idx = this.pinyin_idx;

    this.probe_lidx = undefined;
    this.probe_cidx = undefined;
    this.probe_pidx = undefined;

    if (this.IsDone()) {
      if (!this.is_done) {
        this.is_done = true;
        this.FadeInDone();
      }
    }
  }

  OnNewPinyins(newpys) {
    // 返回是在第几个 index 找到的
    let PROBE_RANGE = PROBE_RANGE0, PROBE_INCREMENT = PROBE_INCREMENT0;
    let pidx = this.pinyin_idx, lidx = this.line_idx;
    let nidx = 0;
    let found = -1, found_char = "";
    for (let i=0; i<PROBE_RANGE; i++) {
      
      if (lidx >= this.data.length) return;
      
      let this_found = false;
      let py = this.NoTonePinyin(this.data[lidx][1][pidx]);
      
      for (let j=found+1; j<newpys.length; j++) {
        const np = this.NoTonePinyin(newpys[j]);
        if (np == py) {
          found = j;
          this_found = true;
          found_char = this.data[lidx][0][pidx];
          PROBE_RANGE += PROBE_INCREMENT;
          break;
        }
      }
      
      pidx++;
      if (pidx >= this.data[lidx][1].length) {
        lidx++; pidx = 0;
      }
      
      if (this_found) {
        this.pinyin_idx = pidx;
        this.char_idx = this.PinyinIdxToCharIdx(lidx, pidx);

        if (this.line_idx != lidx) {
          for (let i = this.line_idx ; i < lidx; i++) {
            // 处理拼图事宜
            this.puzzle_events[i].forEach((entry) => {
              g_puzzle_director.NextStep();
            });
          }
        }

        this.line_idx = lidx;
        OnUpdateWeightMask();
      }
    }
    
    if (found != -1) {
      return found;
    }
     
    return -1;
  }

  do_AllPinyinList(all_pinyins) {
    // 用于显示 当前 最远可以 probe 到哪里
    this.probe_cidx = undefined;
    this.probe_lidx = undefined;
    this.probe_pidx = undefined;

    const lidx_lb = this.saved_line_idx, cidx_lb = this.saved_char_idx, pidx_lb = this.saved_pinyin_idx;
    const PROBE_RANGE = 6;
    let last_probe_idx = -1;
    const char2pyidx = [];  // 每个字最先是由几号时间片对齐的

    if (lidx_lb == undefined || cidx_lb == undefined || pidx_lb == undefined) {
      return;
    }
    
    this.alignments = [];

    // 预期说话速度
    let i_watermark = 0;

    let total_occs = 0;
    let last_coasting_i = -999;
    for (let i=0; i<all_pinyins.length; i++) {
      if (all_pinyins[i].length > 0) {
        if (last_coasting_i <= i-2) {
          last_coasting_i = i;
          total_occs ++;
        }
      }
    }
    
    while (i_watermark < all_pinyins.length) {
      let num_i_matched = 0;
      //let last_coasting_i = -999;
      //let coasting = 0;
      for (let i=i_watermark; i<all_pinyins.length; i++) {
        let lidx = lidx_lb, cidx = cidx_lb, pidx = pidx_lb;

        let num_matches_this_i = 0;
        //if (all_pinyins.length[i] > 0) {
        //  if (last_coasting_i <= i-2) {
        //    last_coasting_i = i;
        //    coasting++;
        //  }
        //}

        const j_max = Math.min(last_probe_idx + PROBE_RANGE, total_occs)// + coasting;

        for (let j=0; j<j_max; j++) {
          while (j >= char2pyidx.length) {
            char2pyidx.push(-1);
          }

          const target = this.data[lidx][1][pidx]
          const norm_target = this.NoTonePinyin(target);

          for (let k=0; k<all_pinyins[i].length; k++) {
            const cand = all_pinyins[i][k];
            const norm_cand = this.NoTonePinyin(cand);

            if (norm_target == norm_cand) {
              //console.log("Match: [" + i + "], " + norm_cand + ", " + norm_target + "|" + cand + ", " + target);
              if (char2pyidx[j] <= i) {
                char2pyidx[j] = i;
                num_i_matched ++;
                i_watermark = max(i_watermark, i+1);
                this.alignments.push([i, this.char_positions[lidx][cidx].copy()]);
              }
              if (last_probe_idx < j && num_matches_this_i < 2) { // 最多match两个，不然《元日》说一个字就到最后了
                last_probe_idx = j;
                num_matches_this_i ++;
                // 指向“下一个”
                [this.line_idx, this.char_idx, this.pinyin_idx] = 
                  this.NextStep(lidx, cidx, pidx);
              }
            }
          }

          [lidx, cidx, pidx] = this.NextStep(lidx, cidx, pidx);
          if (lidx >= this.data.length) break;
        }
        this.probe_lidx = lidx;
        this.probe_cidx = cidx;
        this.probe_pidx = pidx;
      }
      if (num_i_matched == 0) return;
    }
  }

  // 从RecorderViz来的，从此次用户按下REC始所识别出的拼音
  // 好处有二：一为可更准确，二是可以将识别结果用作显示反馈
  OnRecogStatus(rs) {
    let all_pinyins = []; // 下标：时间片（1秒12片）
    const T = 12 / 4; // 因为一次是走四分之一窗口大小(250ms vs 1s)
    for (let i=0; i<rs.length; i++) {
      const t_offset = T * i;
      const entry = rs[i];

      // 有更新，但是还未更新完，最后一个entry是undefined
      if (entry == undefined) break;

      const pinyins = entry[0].trim().split(" "), widxes = entry[1];
      for (let j=0; j<widxes.length; j++) {
        const t = widxes[j] + t_offset;
        while (all_pinyins.length <= t) {
          all_pinyins.push([]);
        }
        all_pinyins[t].push(pinyins[j]);
      }
    }
    this.do_AllPinyinList(all_pinyins);
  }
  
  Reset() {
    this.line_idx = 0;
    this.prev_line_idx = 0;
    this.char_idx = -1;
    this.pinyin_idx = 0;
    this.pan_y = 0;
    this.start_drag_my = 0;
    this.is_dragging = false;
    this.is_hovered = false;
    this.saved_pinyin_idx = undefined;
    this.saved_line_idx = undefined;
    this.saved_char_idx = undefined;
    this.is_done = false;
    this.timestamp0 = millis();
    this.timestamp1 = millis();
  }

  do_NextStep() {
    [this.line_idx, this.char_idx, this.pinyin_idx] = this.NextStep(
      this.line_idx, this.char_idx, this.pinyin_idx);
  }
  
  do_PrevStep() {
    [this.line_idx, this.char_idx, this.pinyin_idx] = this.PrevStep(
      this.line_idx, this.char_idx, this.pinyin_idx);
  }

  // 计算【下一个字】的(line_idx, char_idx, pinyin_idx)
  NextStep(lidx, cidx, pidx) {
    if (lidx >= this.data.length) {
      return [lidx, cidx, pidx];
    } else if (lidx == this.data.length - 1 && pidx >= this.data[lidx][1].length - 1) {
      return [lidx, cidx, pidx];
    }

    while (lidx < this.data.length) {
      pidx ++;
      const line = this.data[lidx][1];
      if (pidx >= line.length) {
        if (lidx < this.data.length) {
          pidx = 0; lidx ++;
        }
      } else break;
    }

    cidx = this.PinyinIdxToCharIdx(lidx, pidx);
    return [lidx, cidx, pidx];
  }

  PrevStep(lidx, cidx, pidx) {
    if (lidx < 0) {
      return [lidx, cidx, pidx];
    } else if (lidx == 0 && pidx == 0) {
      return [lidx, cidx, pidx];
    }

    pidx --;
    if (pidx < 0) {
      if (lidx > 0) {
        lidx --; pidx = this.data[lidx][1].length-1;
      } else { pidx = 0; }
    }
    cidx = this.PinyinIdxToCharIdx(lidx, pidx);
    return [lidx, cidx, pidx];
  }
  
  MoveCursor(x) {
    if (x < 0) { for (let i=0; i>x; i--) { this.do_PrevStep(); } }
    else if (x > 0) { for (let i=0; i<x; i++) { this.do_NextStep(); } }
  }

  Hover(mx, my) {
    if (mx >= g_readalong_layout.x && mx <= g_readalong_layout.x + g_readalong_layout.w &&
        my >= g_readalong_layout.y && my <= g_readalong_layout.y + g_readalong_layout.h) {
      this.is_hovered = true;
    }
  }

  StartDrag(my) {
    this.start_drag_my = my;
    this.drag_my = my;
    this.start_drag_pan_y = this.pan_y;
    this.is_dragging = true;
  }

  EndDrag() {
    this.pan_y = this.GetPanY();
    this.is_dragging = false;
  }

  OnDragMouseUpdated(my) {
    this.drag_my = my;
  }

  GetPanY() {
    if (this.is_dragging) {
      return this.start_drag_pan_y - (this.drag_my - this.start_drag_my);
    } else {
      return this.pan_y;
    }
  }


  Update(delta_ms, override_k = undefined) {
    // 聚焦到当前行
    if (this.is_dragging) return;

    const MARGIN = 32;
    const DISP_Y = -64;

    // 是否超限？
    const tot_h = this.text_size * this.data.length * 1.2;
    const overshoot = tot_h - (g_readalong_layout.h - MARGIN*2 + DISP_Y);
    let y;

    if (overshoot > 0 && this.data.length > 0) {
      y = DISP_Y + lerp(0, overshoot, this.line_idx / (this.data.length-1));
    } else {
      y = DISP_Y;
    }

    let k;
    if (override_k != undefined) {
      k = override_k;
    } else {
      k = Math.pow(0.95, delta_ms/16);
    }
    this.pan_y = lerp(y, this.pan_y, k);

    if (this.done_fadein_ms > 0) {
      this.done_fadein_ms -= delta_ms;
    }
  }

  IsDone() {
    return (this.line_idx >= this.data.length);
  }
}

// 根据【拼图模式】激活与否，调整该View的大小
class ReadAlongLayout {
  static YCOORDS = [ 62, 500 ];

  constructor() {
    this.SetFullHeight();
  }

  SetHalfHeight() {
    this.title_y = 3;
    this.x = 4;
    this.y = ReadAlongLayout.YCOORDS[1];
    this.h = 732 - this.y;
    g_btn_puzzle_next_step.is_hidden = false;
    g_btn_puzzle_prev_step.is_hidden = false;
  }

  SetFullHeight() {
    this.title_y = 3;
    this.y = ReadAlongLayout.YCOORDS[0];
    this.x = 4;
    this.w = 470;
    this.h = 732 - this.y;
    g_btn_puzzle_next_step.is_hidden = true;
    g_btn_puzzle_prev_step.is_hidden = true;
  }

  SwitchMode() {
    if (this.y == ReadAlongLayout.YCOORDS[0]) {
      this.SetHalfHeight();
    } else {
      this.SetFullHeight();
    }
  }

  ShouldDrawPuzzle() {
    if (this.y == ReadAlongLayout.YCOORDS[1]) {
      return true;
    } else {
      return false;
    }
  }

  IsHovered(mx, my) {
    if (mx >= this.x && my >= this.y &&
        mx <= this.x + this.w &&
        my <= this.y + this.h) return true;
    else return false;
  }
}

let g_aligner;
let g_data_idx = 2;
let g_aligner_particle_system;

function SetupReadAlong() {
  g_aligner = new Aligner();
  g_readalong_layout = new ReadAlongLayout();
  LoadDataset(g_data_idx);
  g_aligner_particle_system = new AlignerParticleSystem();
}

function LoadDataset(idx) { 
  g_aligner.LoadData(DATA[idx], TITLES[idx], FONT_SIZES[idx]); 
  g_aligner.Reset();
  LoadPuzzleDataset("stc29");  // TODO：加入其它的拼图
  g_aligner.SpawnPuzzleEventLabels(g_puzzle_vis.objects.length);
}

function LoadPrevDataset() {
  g_data_idx --; if (g_data_idx < 0) { g_data_idx = 0; }
  LoadDataset(g_data_idx); 
}
function LoadNextDataset() {
  g_data_idx ++; if (g_data_idx >= DATA.length) { g_data_idx = DATA.length - 1; }
  LoadDataset(g_data_idx);
}

function LoadMultipleDatasets(title_idxes, title, obj_idx) {
  const data = [];
  let font_size = 40;
  let idx = 0;
  title_idxes.forEach((i) => {
    if (idx > 0) {
      data.push([[],[]]);
    }
    const passage = DATA[i];
    passage.forEach((line) => {
      data.push(line);
    });
    font_size = Math.min(font_size, FONT_SIZES[i]);
    idx ++;
  });
  g_aligner.LoadData(data, title, font_size);

  if (obj_idx != -999) {
    let plabel = OBJ_KEYS[obj_idx];
    LoadPuzzleDataset(plabel);
    g_aligner.SpawnPuzzleEventLabels(g_puzzle_vis.objects.length);
    g_readalong_layout.SetHalfHeight();
  } else {
    g_readalong_layout.SetFullHeight();
  }
}

function ModifyDataIdx(delta) {
  if (delta > 0) {
    for (let i=0; i<delta; i++) {
      g_data_idx ++;
    }
    if (g_data_idx >= DATA.length) { g_data_idx = DATA.length - 1; }
    LoadDataset(g_data_idx);
  } else {
    for (let i=0; i<(-delta); i++) {
      g_data_idx --;
    }
    if (g_data_idx < 0) { g_data_idx = 0; }
    LoadDataset(g_data_idx);
  }
}

let g_message = "";
let g_readalong_title_y = 3;

function RenderReadAlong(delta_ms) {
  // Fade lights
  let victims = [];
  const p = pow(0.96, delta_ms / 16);
  let keyz = Object.keys(g_highlights);
  keyz.forEach((k) => {
    g_highlights[k] *= p;
    if (g_highlights[k] <= 0.01) {
      victims.push(k);
    }
  });
  victims.forEach((k) => delete g_highlights[k])
  
  textAlign(LEFT, TOP);
  text(g_message, 0, 18);

  g_aligner.Update(delta_ms);
  g_aligner.Render();
  push();
  noFill(); stroke(128);
  const l = g_readalong_layout;
  DrawBorderStyle2(l.x, l.y, l.w, l.h);

  g_aligner_particle_system.Update(delta_ms);
  g_aligner_particle_system.Render();

  pop();
}

let g_highlights = {}
function OnNewPinyins(x) {
  g_aligner.OnNewPinyins(x);
  
  // Highlight 拼音's
  x.forEach((py) => {
    const no_tone_py = g_aligner.NoTonePinyin(py);
    if (no_tone_py != "_") {
      g_highlights[no_tone_py] = 1;
    }
  });
}

function ReadAlongKeyPressed(key, keyCode) {
  if (key == ' ') { g_aligner.NextChar(); }
  else if (keyCode == LEFT_ARROW) { g_aligner.MoveCursor(-1); }
  else if (keyCode == RIGHT_ARROW) { g_aligner.MoveCursor(1); }
  else if (key == '[') { LoadPrevDataset(); }
  else if (key == ']') { LoadNextDataset(); }
  else if (key == 'R') { LoadDataset(g_data_idx); }
}

// 测试拼音分出隔是否分得对
function Test() {
  const Testcases = [
    [ "a", "o", "e", "i", "u", "v", "ai", "ei", "ui", "ao", "ou", "iu", "ie", "ve", "er", "an", "en", "in", "un", "vn", "ang", "eng", "ing", "ong" ],
    [ "ba", "pa", "ma", "fa", "bo", "po", "mo", "fo", "me", "bi", "pi", "mi", "bu", "pu", "mu", "fu", "bai", "pai", "mai", "bei", "pei", "mei", "fei",
      "bao", "pao", "mao", "pou", "mou", "fou", "miu", "bie", "pie", "mie", "ban", "pan", "man", "fan", "ben", "pen", "men", "fen",
    "bin", "pin", "min", "bang", "pang", "mang", "fang", "beng", "peng", "meng", "feng", "bing", "ping", "ming", "bian", "pian", "mian", "biao", "piao", "miao" ],
    [ "da", "ta", "na", "la", "lo", "de", "te", "ne", "le", "di", "ti", "ni", "li", "du", "tu", "nu", "lu", "nv", "lv", "dai", "tai", "nai", "lai",
      "dei", "nei", "lei", "dui", "tui", "dao", "tao", "nao", "lao", "dou", "tou", "nou", "lou", "diu", "tiu", "niu", "liu", "die", "tie", "nie", "lie", "nve", "lve",
      "dan", "tan", "nan", "lan", "den", "nen", "nin", "lin", "dun", "tun", "lun", "dang", "tang", "nang", "lang", "deng", "teng", "neng", "leng", "ding", "ting", "ning", "ling",
      "dong", "tong", "nong", "long", "dia", "lia", "dian", "tian", "nian", "lian", "niang", "liang", "diao", "tiao", "niao", "liao", "duan", "tuan", "nuan", "luan", "duo", "tuo", "nuo", "luo" ],
    [ "ga", "ka", "ha", "ge", "ke", "he", "gu", "ku", "hu", "gai", "kai", "hai", "gei", "kei", "hei", "gui", "kui", "hui", "gao", "kao", "hao", "gou", "kou", "hou", "gan", "kan", "han", 
      "gen", "ken", "hen", "gun", "kun", "hun", "gang", "kang", "hang", "geng", "keng", "neng", "gong", "kong", "hong", "gua", "kua", "hua", "guai", "kuai", "huai", "guan", "kuan", "huan", "guang", "kuang", "huang",
      "guo", "kuo", "huo" ],
    [ "ji", "qi", "xi", "ju", "qu", "xu", "jiu", "qiu", "xiu", "jie", "qie", "xie", "jue", "que", "xue", "jin", "qin", "xin", "jun", "qun", "xun", "jing", "qing", "xing", "jia", "qia", "xia", "jian", "qian", "xian",
    "jiang", "qiang", "xiang", "jiao", "qiao", "xiao", "jiong", "qiong", "xiong", "juan", "quan", "xuan" ],
    [ "ha", "zhe", "zhi", "zhu", "zhai", "zhei", "zhui", "zhao", "zhou", "zhan", "zhen", "zhun", "zhang", "zheng", "zhong", "zhua", "zhuai", "zhuan", "zhuang", "zhuo",
      "cha", "che", "chi", "chu", "chai", "chui", "chao", "chou", "chan", "chen", "chun", "chang", "cheng", "chong", "chua", "chuai", "chuan", "chuang", "chuo",
      "sha", "she", "shi", "shu", "shai", "shei", "shui", "shao", "shou", "shan", "shen", "shun", "shang", "sheng", "shua", "shuai", "shuan", "shuang", "shuo",
      "re", "ri", "ru", "rui", "rao", "rou", "ran", "ren", "run", "rang", "reng", "rong", "rua", "ruan", "ruo" ],
    [ "za", "ze", "zi", "zu", "zai", "zei", "zui", "zao", "zou", "zan", "zen", "zun", "zang", "zeng", "zong", "zuan", "zuo",
      "ca", "ce", "ci", "cu", "cai", "cui", "cao", "cou", "can", "cen", "cun", "cang", "ceng", "cong", "cuan", "cuo",
      "sa", "se", "si", "su", "sai", "sui", "sao", "sou", "san", "sen", "sun", "sang", "seng", "song", "suan", "suo" ],
    [ "ya", "wa", "yo", "wo", "ye", "yi", "wu", "yu", "wai", "wei", "yao", "you", "yue", "yan", "wan", "wen", "yin", "yun", "yang", "wang", "weng", "ying", "yong", "yuan" ],
  ]
  
  for (let i=7; i<Testcases.length; i++) {
    const tc = Testcases[i];
    tc.forEach((x) => {
      g_aligner.NormalizePinyin(x);
    });
  }
}
