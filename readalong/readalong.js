
class Aligner {
  constructor() {
    this.w = 478; this.h = 480;
    this.Reset();
    this.text_size = 28;
  }
  
  LoadData(data, title, text_size) {
    this.text_size = text_size;
    this.title = title;
    this.data = data.slice();
    this.line_idx = 0; // 第几行
    
    this.char_idx   = 0; // 第几个字，可能与拼音有出入 
    this.pinyin_idx = 0; // 第几个拼音
    
    for (let i=0; i<data.length; i++) {
      data[i][1] = data[i][1].split(" ");
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
  
  Render() {
    push();
    noStroke();
    fill(COLOR0);
    //rect(g_readalong_x, g_readalong_y, this.w, this.h);
    textAlign(RIGHT, TOP);
    textSize(20);
    text("第" + (1+g_data_idx) + "/" + DATA.length + "篇\n" + g_aligner.title,
      480, g_readalong_y);


    fill(0);
    
    const TEXT_SIZE = this.text_size;
    const COLOR1 = '#33f', COLOR2 = '#000';
    textSize(TEXT_SIZE);
    textFont('KaiTi');
    
    const translate_y = -this.GetPanY();
    const margin = 64;

    let y = g_readalong_y + translate_y, x = g_readalong_x;
    for (let i=0; i<this.data.length; i++) {
      const line = this.data[i][0];
      
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
        
        let alpha = 255, c0, c;
        if (y < g_readalong_y) {
          alpha =map(y, g_readalong_y, g_readalong_y-margin, 255, 16);
        } else if (y > g_readalong_y + this.h) {
          alpha = map(y, g_readalong_y + this.h, g_readalong_y + this.h + margin,
            255, 16);
        }

        // 要是超出视野的话就用最低alpha值
        alpha = constrain(alpha, 16, 255);

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
      
      y += TEXT_SIZE*1.2;
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
      new Set([ "wang", "huang", "weng", "wen", "wan", "huan", "o", "fang" ]), 
      new Set([ "lei", "wei" ]),
      new Set([ "li", "ling" ]),
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
    let PROBE_RANGE = 4, PROBE_INCREMENT = 2;
    let pidx = this.pinyin_idx, lidx = this.line_idx;
    let nidx = 0;
    let found = -1;
    for (let i=0; i<PROBE_RANGE; i++) {
      
      if (lidx >= this.data.length) return;
      
      let this_found = false;
      let py = this.NoTonePinyin(this.data[lidx][1][pidx]);
      
      for (let j=found+1; j<newpys.length; j++) {
        const np = this.NoTonePinyin(newpys[j]);
        if (np == py) {
          found = j;
          this_found = true;
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
        this.line_idx = lidx;
      }
    }
    
    if (found != -1) {
      console.log("found=" + found + ", newpinyin=" + newpys);
      return found;
    }
     
    return -1;
  }
  
  Reset() {
    this.line_idx = 0;
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
    if (mx >= g_readalong_x && mx <= g_readalong_x + g_readalong_w &&
        my >= g_readalong_y && my <= g_readalong_y + g_readalong_h) {
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
}

let g_aligner;
function SetupReadAlong() {
  g_aligner = new Aligner();
  LoadDataset(0);
}

let g_data_idx = 0;
function LoadDataset(idx) { 
  g_aligner.LoadData(DATA[idx], TITLES[idx], FONT_SIZES[idx]); 
  g_aligner.Reset();
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

let g_readalong_x = 4, g_readalong_y = 280;
let g_readalong_w = 472, g_readalong_h = 480 - g_readalong_y;
function RenderReadAlong(deltaTime) {
  // Fade lights
  let victims = [];
  const p = pow(0.96, deltaTime / 16);
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
  
  g_aligner.Render();
}

let g_highlights = {}
function OnNewPinyins(x) {
  console.log(x);
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
  else if (key == 'R') { g_aligner.Reset(); }
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