function CompareLineAndCharIdxes(line_idx0, char_idx0, line_idx1, char_idx1) {
  if (line_idx0 < line_idx1) return -1;
  else if (line_idx0 > line_idx1) return 1;
  else {
    if (char_idx0 < char_idx1) return -1;
    else if (char_idx0 == char_idx1) return 0;
    else return 1;
  }
}

class Aligner {
  static PUNCT = new Set(['，', '。', '；']);
  constructor() {
    this.lang_idx = 0; // 0:简体 1:繁体
    //this.LoadSampleData();
    this.data = undefined

this.is_debug = false;
    this.Reset();

    this.saved_pinyin_idx = undefined;
    this.saved_line_idx = undefined;
    this.saved_char_idx = undefined;

    this.probe_cidx = undefined;
    this.probe_lidx = undefined;
    this.probe_pidx = undefined;

    this.offset = 0;
    this.Clear();
  }

  PushIdxes() {
    this.saved_char_idx   = this.char_idx;
    this.saved_line_idx   = this.line_idx;
    this.saved_pinyin_idx = this.pinyin_idx;
  }

  Clear() {
    this.recog_status = [];
    this.offset = 0;
  }

  /**
   *
   * @param {*} data 
   * @param {*} title 
   */
  LoadData(data, title) {
    this.timestamp0 = millis();
    this.timestamp1 = millis();
    this.activation_lidx = -1;
    this.title = title;
    this.data = data.slice();
    this.Reset();

    if (data.length > 0) {
      // 为了适应空白分隔行
      for (let i=0; i<this.data.length; i++) {
        if (this.data[i].length < 1) continue;
        this.data[i][2] = this.data[i][2].slice(); // deep copy
      }
      for (let i=0; i<this.data.length; i++) {
        if (this.data[i].length > 0) { 
          if (typeof(this.data[i][2]) == "string") { // 为什么这个会持续
            this.data[i][2] = this.data[i][2].split(" ");
          }
        }
      }
    }
  }

  view(v) {
    if (this.data == undefined) {
      return m('div', '请选择一个题目')
    }

    let d = this.data;
    let c = [];

    c.push(m("div", this.title));
    for (let i=0; i<d.length; i++) {
      let line = [];
      const chars = d[i][this.lang_idx].split("");
      for (let j=0; j<chars.length; j++) {
        let st = {
          class: "aligner_cell"
        };
        if (i == this.line_idx && j == this.char_idx) {
          st.class = "aligner_curr";
        } else if (CompareLineAndCharIdxes(this.line_idx, this.char_idx, i, j) > 0) {
          st.class = "aligner_done";
        }
        line.push(m('span', st, chars[j]));
      }
      c.push(m('div', line));
    }

    if (this.is_debug) {
      c.push(m('div', 
        {"style":"color:grey"},
        'L=' + this.line_idx + ", C=" + this.char_idx + ", P=" + this.pinyin_idx));
      c.push(m('div', 
        {"style":"color:grey"},
        'Probe: L=' + this.probe_lidx + ", C=" + this.probe_cidx + ", P=" + this.probe_pidx));
    }

    return m('div', c);
  }

  LoadSampleData() {
    console.log("LoadSampleData")
    this.LoadData([
      ["海上生明月", "海上生明月", "hai shang sheng ming yue"],
      ["天涯共此时", "天涯共此時", "tian ya gong ci shi"],
      ["情人怨遥夜", "情人怨遙夜", "qing ren yuan yao ye"],
      ["竟夕起相思", "竟夕起相思", "jing xi qi xiang si"],
      ["灭烛怜光满", "滅燭憐光滿", "mie zhu lian guang man"],
      ["披衣觉露滋", "披衣覺露滋", "pi yi jue lu zi"],
      ["不堪盈手赠", "不堪盈手贈", "bu kan ying shou zeng"],
      ["还寝梦佳期", "還寢夢佳期", "huan qing meng jia qi"],
    ],
    "望月怀远"
    );
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

  // 计算【下一个字】的(line_idx, char_idx, pinyin_idx)
  NextStep(lidx, cidx, pidx) {
    if (cidx < 0 || lidx < 0 || pidx < 0) {
      return [0, 0, 0];
    }

    if (lidx >= this.data.length) {
      return [lidx, cidx, pidx];
    } else if (lidx == this.data.length - 1 && pidx >= this.data[lidx][2].length - 1) {
      return [lidx, cidx, pidx];
    }

    while (lidx < this.data.length) {
      pidx ++;
      const line = this.data[lidx][2];
      if (pidx >= line.length) {
        if (lidx < this.data.length) {
          pidx = 0; lidx ++; break;
        }
      } else break;
    }

    cidx = this.PinyinIdxToCharIdx(lidx, pidx);
    return [lidx, cidx, pidx];
  }

  PrevStep(lidx, cidx, pidx) {
    if (cidx < 0 || lidx < 0 || pidx < 0) {
      let lidx = this.data.length - 1;
      let cidx = this.data[lidx][0].length - 1;
      let pidx = this.CharIdxToPinyinIdx(lidx, cidx);
      return [lidx, cidx, pidx];
    }

    if (lidx < 0) {
      return [lidx, cidx, pidx];
    } else if (lidx == 0 && pidx == 0) {
      return [lidx, cidx, pidx];
    }

    pidx --;
    if (pidx < 0) {
      if (lidx > 0) {
        lidx --; pidx = this.data[lidx][2].length-1;
      } else { pidx = 0; }
    }
    cidx = this.PinyinIdxToCharIdx(lidx, pidx);
    return [lidx, cidx, pidx];
  }

  do_NextStep() {
    [this.line_idx, this.char_idx, this.pinyin_idx] = this.NextStep(
      this.line_idx, this.char_idx, this.pinyin_idx);
  }
  
  do_PrevStep() {
    [this.line_idx, this.char_idx, this.pinyin_idx] = this.PrevStep(
      this.line_idx, this.char_idx, this.pinyin_idx);
  }

  PinyinIdxToCharIdx(lidx, pidx) {
    if (lidx >= this.data.length) return 0;
    const line = this.data[lidx][this.lang_idx];
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
    const line = this.data[lidx][this.lang_idx];
    let i = 0, i2 = 0;
    do {
      while (line[i] in Aligner.PUNCT) { i++; }
      i++; ret++;
      i2++;
    } while (i < line.length && i2 < cidx);
    return ret;
  }

  MoveCursor(x) {
    if (x < 0) { for (let i=0; i>x; i--) { this.do_PrevStep(); } }
    else if (x > 0) { for (let i=0; i<x; i++) { this.do_NextStep(); } }
  }

  NoTonePinyin(x) {
    let c = x[x.length - 1];
    if (c >= '0' && c <= '9') {
      x = x.slice(0, x.length-1);
    }
    
    return this.NormalizePinyin(x);
  }

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

  do_AllPinyinList(all_pinyins) {
    console.log(all_pinyins)
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

          const target = this.data[lidx][2][pidx]
          const norm_target = this.NoTonePinyin(target);

          for (let k=0; k<all_pinyins[i].length; k++) {
            const cand = all_pinyins[i][k];
            const norm_cand = this.NoTonePinyin(cand);

            if (norm_target == norm_cand) {
              //console.log("Match: [" + i + "], " + norm_cand + ", " + norm_target + "|" + cand + ", " + target);
              if (char2pyidx[j] <= i) {
                char2pyidx[j] = i;
                num_i_matched ++;
                i_watermark = Math.max(i_watermark, i+1);
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

  OnPredictionResult(data) {
    const decoded = data.Decoded;
    const timestamps = data.decode_timestamp;

    this.recog_status[this.offset] = [ decoded, timestamps ];
    this.offset++;
    
    let rs = this.recog_status;
    let all_pinyins = [];
    const T = 12 / 4;
    for (let i=0; i<rs.length; i++) {
      const t_offset = T * i;
      const entry = rs[i];
      if (entry == undefined) break;

      const pinyins = entry[0].trim().split(" ");
      const widxes = entry[1];

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

  OnStartRecording() {
    this.probe_cidx = undefined;
    this.probe_lidx = undefined;
    this.probe_pidx = undefined;
    g_fft_buffer_idx = 0;
    this.PushIdxes();
  }

  // 其实是不光停止录音而且处理完所有待预测的字
  OnAllPredictionsDone() {
    this.saved_char_idx   = this.char_idx;
    this.saved_line_idx   = this.line_idx;
    this.saved_pinyin_idx = this.pinyin_idx;

    this.probe_lidx = undefined;
    this.probe_cidx = undefined;
    this.probe_pidx = undefined;
  }
}