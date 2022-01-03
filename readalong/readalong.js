const PROBE_RANGE0 = 4, PROBE_INCREMENT0 = 2;

class Aligner {
  constructor() {
    this.w = 478; this.h = 640;
    this.Reset();
    this.text_size = 28;
  }
  
  LoadData(data, title, text_size) {
    this.text_size = text_size;
    this.title = title;
    this.data = data.slice();
    this.puzzle_events = [];
    this.line_idx = 0; // 第几行
    this.prev_line_idx = 0;
    
    this.char_idx   = 0; // 第几个字，可能与拼音有出入 
    this.pinyin_idx = 0; // 第几个拼音

    console.log(this.data)
    if (data.length > 0) {
      for (let i=0; i<this.data.length; i++) {
        this.data[i][1] = this.data[i][1].slice(); // deep copy
      }
      for (let i=0; i<this.data.length; i++) {
        if (typeof(this.data[i][1]) == "string") { // 为什么这个会持续
          this.data[i][1] = this.data[i][1].split(" ");
        }
        this.puzzle_events.push([]);
      }
    }
    OnUpdateWeightMask();
  }


  SpawnPuzzleEventLabels(num_steps) {

    for (let i=0; i<num_steps; i++) {
      const data_idx = parseInt(map(i+1, 0, num_steps, 0, this.data.length-1));
      console.log(data_idx);
      this.puzzle_events[data_idx].push("※");
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
      rect(hl_x, hl_y0, this.w, hl_y1-hl_y0);
    }

    let y = g_readalong_layout.y + translate_y, x = g_readalong_layout.x;
    for (let i=0; i<this.data.length; i++) {
      const line = this.data[i][0];
      
        
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
      for (let cidx = 0; cidx < line.length; cidx ++) {
        const ch = line[cidx];
        
        // Is done?
        let done = false;
        if (i < this.line_idx) { done = true;
        } else if (i == this.line_idx) {
          if (cidx < this.char_idx) { done = true; }
          else { done = false; }
        } else { done = false; }
    
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
        if (done) {
          c0 = color(252, 183, 10, alpha);
        }
        if (!done && highlighted > 0) {
          c = lerpColor(c0, color(192, 192, 192, alpha), highlighted);
        } else {
          c = c0;
        }
        
        dx = dx + textWidth(ch);
        if (alpha > 0) {
          fill(c);
          text(ch, dx+x, y);
        }
      }

      const e = this.puzzle_events[i];
      if (e.length > 0) {
        fill(color(192,192,244,alpha));
        this.puzzle_events[i].forEach((elt) => {
          dx += textWidth(elt);
          text(elt, dx+x, y);
        })
      }
      
      y += TEXT_SIZE*1.2;
    }

    textSize(20);
    const dy = g_readalong_layout.title_y;
    let t = "第" + (1+g_data_idx) + "/" + DATA.length + "篇 " + g_aligner.title
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
      new Set([ "wang", "huang", "weng", "wen", "wan", "huan", "o", "fang", "hua" ]), 
      new Set([ "lei", "wei" ]),
      new Set([ "li", "ling" ]),
      new Set([ "qiu", "qiong" ]),
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
      console.log("found=" + found + " (" + found_char + "), newpinyin=" + newpys);
      return found;
    }
     
    return -1;
  }
  
  Reset() {
    this.line_idx = 0;
    this.prev_line_idx = 0;
    this.char_idx = 0;
    this.pinyin_idx = 0;
    this.pan_y = 0;
    this.start_drag_my = 0;
    this.is_dragging = false;
    this.is_hovered = false;
  }
  
  do_NextStep() {
    if (this.line_idx >= this.data.length) return;
    else if (this.line_idx == this.data_length-1 && this.pinyin_idx >= this.data[this.line_idx][1].length-1) return;
    
    const line = this.data[this.line_idx][1];
    let pidx = this.pinyin_idx, lidx = this.line_idx;
    
    pidx ++;
    if (pidx >= line.length) {
      if (lidx < this.data.length) {
        pidx = 0; lidx ++;
      } else {
        pidx = line.length-1;
      }
    }
    this.char_idx = this.PinyinIdxToCharIdx(lidx, pidx);
    this.line_idx = lidx;
    this.pinyin_idx = pidx;
  }
  
  do_PrevStep() {
    if (this.line_idx < 0) return;
    else if (this.line_idx == 0 && this.pinyin_idx == 0) return;
    
    let pidx = this.pinyin_idx, lidx = this.line_idx;
    pidx --;
    if (pidx < 0) {
      if (lidx > 0) {
        lidx --; pidx = this.data[lidx][1].length-1;
      } else { pidx = 0; }
    }
    this.char_idx = this.PinyinIdxToCharIdx(lidx, pidx);
    this.line_idx = lidx;
    this.pinyin_idx = pidx;
  }
  
  Step(x) {
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

  Update(ms, override_k = undefined) {
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
      k = Math.pow(0.95, ms/16);
    }
    this.pan_y = lerp(y, this.pan_y, k);
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
  }

  SetFullHeight() {
    this.title_y = 3;
    this.y = ReadAlongLayout.YCOORDS[0];
    this.x = 4;
    this.w = 470;
    this.h = 732 - this.y;
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
function SetupReadAlong() {
  g_aligner = new Aligner();
  g_readalong_layout = new ReadAlongLayout();
  LoadDataset(g_data_idx);
}

function LoadDataset(idx) { 
  g_aligner.LoadData(DATA[idx], TITLES[idx], FONT_SIZES[idx]); 
  g_aligner.Reset();
  LoadPuzzleDataset("coffin4");  // TODO：加入其它的拼图
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
  rect(l.x, l.y, l.w, l.h);
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
  else if (keyCode == LEFT_ARROW) { g_aligner.Step(-1); }
  else if (keyCode == RIGHT_ARROW) { g_aligner.Step(1); }
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
