function RemoveFromArray(arr, elt) {
  let ret = [];
  arr.forEach((x) => {
    if (x != elt) {
      ret.push(x);
    }
  });
  return ret;
}

class IntroScreen {
  constructor() {
    this.countdown = 0;
    this.countdown0 = 1000;
    // 门开的程度，1为全开
    this.k0 = 0;
    this.k1 = 0;
    this.k = 0;
    this.visible = true;
    this.state = "";
    this.message = "";
  }

  Update(delta_ms) {
    if (this.countdown >= 0) {
      this.countdown -= delta_ms;
      if (this.countdown < 0) {
        this.countdown = 0;
        if (this.state == "fadeout") {
          this.visible = false;
          this.message = "";
        }
      }
    }
  }

  GetCompletion() {
    return 1 - this.countdown / this.countdown0;
  }

  // 开的程度，1为全开
  GetK() {
    return lerp(this.k0, this.k1, this.GetCompletion());
  }

  SetMessage(x) {
    this.message = x;
  }

  FadeOut() {
    this.visible = true;
    this.k0 = 0;
    this.k1 = 1;
    this.countdown = 1000;
    this.state = "fadeout";
  }

  Render() {
    if (!this.visible) return;
    push();
    noStroke();
    //stroke(color(167, 119, 37));

    fill(color(252, 232, 199));
    let x0 = 0, x1 = W0/2 * (1-this.GetK());
    rect(x0, 0, x1-x0, H0);
    x0 = W0/2 + W0/2 * this.GetK(); x1 = W0;
    rect(x0, 0, x1-x0, H0);

    const a = 255 * (1 - this.GetK());
    stroke(color(167, 119, 37));
    fill(color(213, 173, 114));
    const w1 = W0 / 5 * (1 - this.GetK()), y0 = H0 * 0.15, y1 = H0 * 0.58, y2 = H0 * 0.75;
    const pad_y = 68;
    rect(W0/2-w1/2, y0, w1, y1-y0);

    stroke(43, 20, 0, a);
    fill(169, 58, 39, a)
    const title = ["芝", "麻", "开", "门"];
    textAlign(CENTER, CENTER);
    textSize(48);
    for (let i=0; i<title.length; i++) {
      text(title[i], W0/2, lerp(y0+pad_y, y1-pad_y, i/(title.length-1)));
    }

    textSize(24);
    noStroke();
    fill(213, 173, 114, a);
    text(this.message, W0/2, y2);

    //
    fill(64);

    pop();
  }
}

const THRESHOLD_START = 8;
const THRESHOLD_RABBIT = 20;

class LevelSelect extends MyStuff {
  constructor() {
    super();
    this.visible = true;

    this.btn_modes_y = 120;
    this.btn_levels_y = 200;
    this.btn_poems_y = 300;
    

    this.page_number_y = 660;
    
    this.Init();

    this.title_idx_lb = 0;
    this.title_idx_ub = this.btn_titles.length - 1; // Inclusive
    

    this.num_sentences = 0;

    this.preview_text = "";
    this.preview_countdown_ms = 3000;

    this.UpdateTitles();
    this.chosen_puzzle_idx = 0;
  }

  DeselectTitle(idx) {
    this.selected_title_idxes = RemoveFromArray(this.selected_title_idxes, idx);
    this.num_sentences -= DATA[idx].length;
    this.UpdateTitles();
  }

  SelectTitle(idx) {
    this.selected_title_idxes.push(idx);
    this.num_sentences += DATA[idx].length;
    let first_sentence = DATA[idx][0][0];
    this.SetPreviewText(first_sentence);
    this.UpdateTitles();
  }

  ClearSelection() {
    this.btn_puzzles.forEach((b) => {
      b.checked = false;
    });
    this.selected_title_idxes = [];
    this.num_sentences = 0;
    this.UpdateTitles();
  }

  Init() {
    this.btn_puzzles = [];
    this.btn_titles = [];
    this.btn_modes = [];
    this.selected_title_idxes = [];
    this.btn_prevpage = undefined;
    this.btn_nextpage = undefined;
    this.btn_start = undefined;
    this.btn_rabbit_mode = undefined;
    this.game_mode = "practice";

    let btn_w = 200, btn_h = 48, btn_margin_x = 10, btn_margin_y = 10;
    // 选取模式
    let b = new Button("朗读");
    b.x = W0/2 - btn_margin_x/2 - btn_w;
    b.w = btn_w; b.h = btn_h; b.y = this.btn_modes_y;
    this.btn_modes.push(b);
    b.SetParent(this);
    b.text_size = 26;
    b.clicked = () => {
      this.game_mode = "practice";
      this.UpdateTitles();
    }

    b = new Button("朗读+拼图");
    b.x = W0/2 + btn_margin_x/2;
    b.w = btn_w; b.h = btn_h; b.y = this.btn_modes_y;
    this.btn_modes.push(b);
    b.SetParent(this);
    b.text_size = 22;
    b.clicked = () => {
      this.game_mode = "puzzle";
      this.UpdateTitles();
    }

    btn_w = 72; btn_h = 32; btn_margin_x = 10; btn_margin_y = 10;

    // 选取关卡
    const btn_levels_y = this.btn_levels_y;
    const btn_levels = [ "壹號", "貳號", "叁號", "肆號" ];
    const N = btn_levels.length;
    textSize(20);
    const tw = textWidth("拼图选择：");
    let tot_w = btn_margin_x * (N-1) + btn_w * N + tw;
    let x0 = W0/2 - tot_w/2 + tw;

    for (let x = x0, i=0; i<N; x+=(btn_w+btn_margin_x), i++) {
      const b = new Button(btn_levels[i]);
      b.w = btn_w; b.h = btn_h; b.x = x; b.y = btn_levels_y;
      b.checked = false;
      b.SetParent(this);
      b.clicked = () => {
        const c = b.checked;
        this.btn_puzzles.forEach((btn) => {
          btn.checked = false;
        });
        b.checked = !c;
        this.UpdateTitles();
      }
      this.btn_puzzles.push(b);
    }

    // 兔子模式按钮的字弄小一点
    if (this.btn_puzzles.length >= 5) {
      this.btn_rabbit_mode = this.btn_puzzles[4];
      this.btn_rabbit_mode.text_size = 18;
    }

    const btn_title_w = 220, btn_title_h = 50;
    tot_w = btn_margin_x + 2 * btn_title_w;
    const btn_title_x0 = W0 / 2 - tot_w / 2;
    const num_rows = 4, num_cols = 2;
    let y = this.btn_poems_y + 100;
    let count = 0;
    for (let i=0; i<num_rows; i++) {
      let x = btn_title_x0;
      for (let j=0; j<num_cols; j++) {
        const b = new Button("" + (1+count));
        b.x = x; b.y = y;
        b.w = btn_title_w; b.h = btn_title_h;
        b.SetParent(this);
        b.idx = count;
        b.clicked = () => {
          const idx = b.idx + this.title_idx_lb;
          if (this.selected_title_idxes.indexOf(idx) != -1) {
            this.DeselectTitle(idx);
            b.checked = false;
          } else {
            this.SelectTitle(idx);
            b.checked = true;
          }
        };
        this.btn_titles.push(b);
        x += btn_title_w + btn_margin_x;
        count ++;
      }
      y += btn_margin_y + btn_title_h;
    }

    y += btn_margin_y;
    const pad = 30;

    let x = btn_title_x0;
    b = new Button("<< 上一页");
    b.w = btn_title_w - pad; b.h = btn_title_h; b.x = x; b.y = y;
    b.clicked = () => {
      this.PrevPage();
    }
    b.SetParent(this);
    this.btn_prevpage = b;

    x += btn_title_w + btn_margin_x;
    b = new Button("下一页 >>");
    b.w = btn_title_w - pad; b.h = btn_title_h; b.x = x + pad; b.y = y;
    b.SetParent(this);
    b.clicked = () => {
      this.NextPage();
    }
    this.btn_nextpage = b;

    // 开始游戏按钮
    b = new Button("开始");
    b.w = 200;
    b.h = 80;
    b.x = W0/2 - b.w/2;
    b.y = 740;
    b.SetParent(this);
    b.clicked = () => {
      this.StartGame(true);
    }
    this.btn_start = b;
  }

  NextPage() {
    const N = this.btn_titles.length;
    if (this.title_idx_lb + N < TITLES.length) {
      this.title_idx_lb += N; this.title_idx_ub += N;
    }
    this.UpdateTitles();
  }

  PrevPage() {
    const N = this.btn_titles.length;
    if (this.title_idx_lb - N >= 0) {
      this.title_idx_lb -= N; this.title_idx_ub -= N;
    }
    this.UpdateTitles();
  }

  UpdateTitles() {
    const N = this.btn_titles.length;

    if (this.title_idx_lb + N < TITLES.length) {
      this.btn_nextpage.is_enabled = true;
    } else { this.btn_nextpage.is_enabled = false; }

    if (this.title_idx_lb - N >= 0) {
      this.btn_prevpage.is_enabled = true;
    } else { this.btn_prevpage.is_enabled = false; }

    for (let i=0; i<this.btn_titles.length; i++) {
      let idx = this.title_idx_lb + i;
      let b = this.btn_titles[i];
      if (idx >= 0 && idx < TITLES.length) {
        b.txt = TITLES[idx];
        b.is_enabled = true;
        if (this.selected_title_idxes.indexOf(idx) != -1) {
          b.checked = true;
        } else {
          b.checked = false;
        }
      } else {
        b.txt = "---";
        b.is_enabled = false;
        b.checked = false;
      }
    }

    // 可否激活兔子模式？
    //this.btn_start.is_enabled  = (this.num_sentences >= THRESHOLD_START);
    //this.btn_rabbit_mode.is_enabled = (this.num_sentences >= THRESHOLD_RABBIT);
    //if (this.num_sentences < THRESHOLD_RABBIT) {
    //  this.btn_rabbit_mode.checked = false;
    //}
    //this.btn_practice.is_enabled = (this.num_sentences > 0);

    if (this.game_mode == "practice") {
      this.btn_start.is_enabled = true;
    } else {
      if (this.ChosenPuzzleIdx() == -999) {
        this.btn_start.is_enabled = false;
      } else {
        if (this.num_sentences >= 8) {
          this.btn_start.is_enabled = true;
        }
      }
    }

    if (this.game_mode == "practice") {
      this.btn_puzzles.forEach((b) => {
        b.is_enabled = false;
      })
      this.chosen_puzzle_idx = -999;
      this.btn_modes[0].checked = true;
      this.btn_modes[1].checked = false;
    } else {
      this.btn_puzzles.forEach((b) => {
        b.is_enabled = true;
      })
      this.btn_modes[0].checked = false;
      this.btn_modes[1].checked = true;
    }
  }

  ChosenPuzzleIdx() {
    let ret = -999;
    for (let i=0; i<this.btn_puzzles.length; i++) {
      if (this.btn_puzzles[i].checked) {
        ret = i; break;
      }
    }
    return ret;
  }
  
  Update(delta_ms) {
    if (this.preview_countdown_ms > 0) {
      this.preview_countdown_ms -= delta_ms;
      if (this.preview_countdown_ms <= 0) {
        this.preview_countdown_ms = 0;
      }
    }
  }

  SetPreviewText(x) {
    this.preview_countdown_ms = 3000;
    this.preview_text = x;
  }

  GetPreviewAlpha() {
    if (this.preview_countdown_ms > 1000) {
      return 255;
    } else {
      return map(this.preview_countdown_ms, 1000, 0, 255, 0);
    }
  }

  do_Render() {
    if (!this.visible) return;
    fill(color(252, 232, 199));
    rect(0, 0, W0, H0);

    push();
    noStroke();
    
    textSize(30);
    textAlign(CENTER, TOP);
    fill(213, 173, 114);

    text("【谜题设置】", W0/2, 16)

    textSize(20);
    const nb = this.btn_titles.length;
    const pageidx = parseInt(this.title_idx_lb / nb) + 1;
    const np = parseInt((TITLES.length - 1) / nb)+1;
    textAlign(CENTER, CENTER);
    text("第" + pageidx + "/" + np + "页", W0/2,
      this.btn_nextpage.y + this.btn_nextpage.h/2);
    textAlign(RIGHT, CENTER);
    const bp0 = this.btn_puzzles[0];
    text("拼图选择：", bp0.x - 5, bp0.y + bp0.h/2);
    
    textSize(30);

    fill(169, 58, 39);
    textAlign(CENTER, BOTTOM);
    text("一、选择模式", W0/2, this.btn_modes_y - 20);
    text("二、选择篇目", W0/2, this.btn_poems_y - 20);
    textAlign(RIGHT, CENTER);
    text("三、", this.btn_start.x, this.btn_start.y + this.btn_start.h/2);

    const LEVEL_BAR_X0 = 4 + textWidth("句数：");
    let LEVEL_BAR_WIDTH = 5;
    let LEVEL_BAR_GAP = 10;
    const LEVEL_BAR_H = 20;
    const LEVEL_BAR_Y = this.btn_poems_y - 10;
    const pad0 = 4, pad1 = 8;

    const WLIMIT = W0 - 60;
    if (LEVEL_BAR_X0 + LEVEL_BAR_GAP*this.num_sentences > WLIMIT) {
      LEVEL_BAR_GAP = (WLIMIT-LEVEL_BAR_X0) / this.num_sentences;
      LEVEL_BAR_WIDTH = LEVEL_BAR_GAP/2
    }

    let breaks = [], break_descs = [];
    if (this.game_mode == "puzzle") {
      breaks = [THRESHOLD_START, THRESHOLD_RABBIT];
      break_descs = ["至少需要8句\n才能拼图"];//, "20句可开启\n兔子模式"];
    } else {
      breaks = [8, 16, 24, 32];
      break_descs = [ "8", "16", "24", "32" ];
    }

    const BREAKS_Y = LEVEL_BAR_Y + LEVEL_BAR_H + pad1 + 4;
    {
      let break_xs = [];
      for (let i=0; i<breaks.length; i++) {
        const x1 = LEVEL_BAR_X0 + LEVEL_BAR_GAP * breaks[i] -
          (LEVEL_BAR_GAP - LEVEL_BAR_WIDTH) / 2;
        break_xs.push(x1);
      }
      let overlapped = false;
      textSize(20);
      textAlign(CENTER, TOP);
      for (let i=0; i<break_xs.length - 1; i++) {
        const x0 = break_xs[i], x1 = break_xs[i+1];
        const tw0 = textWidth(break_descs[i]);
        const tw1 = textWidth(break_descs[i+1])
        if (x1-x0 <= (tw0+tw1)/2) {
          overlapped = true; break;
        }
      }
      for (let i=0; i<breaks.length; i++) {
        noFill();
        stroke(166, 129, 48);
        const x1 = break_xs[i];
        line(x1, LEVEL_BAR_Y - pad0, x1, LEVEL_BAR_Y + LEVEL_BAR_H + pad1);
        noStroke();
        fill(166, 129, 48);
        if (!overlapped) {
          text(break_descs[i], x1, BREAKS_Y);
        } else {
          text("" + breaks[i], x1, BREAKS_Y);
        }
      }
    }

    fill(169, 58, 39);
    noStroke();
    for (let i=0; i<this.num_sentences; i++) {
      if (i < THRESHOLD_START) {
        fill(163, 195, 132);
      } else if (i < THRESHOLD_RABBIT) {
        fill(181, 142, 73);
      } else {
        fill(207, 96, 68);
      }
      const x0 = LEVEL_BAR_X0 + LEVEL_BAR_GAP * i;
      rect(x0, LEVEL_BAR_Y, LEVEL_BAR_WIDTH, LEVEL_BAR_H);
    }

    fill(169, 58, 39);
    textSize(20);
    textAlign(RIGHT, CENTER);
    text("句数：", LEVEL_BAR_X0, LEVEL_BAR_Y + LEVEL_BAR_H / 2);
    
    textAlign(LEFT, CENTER);
    text(this.num_sentences + "",
      LEVEL_BAR_X0 + LEVEL_BAR_GAP*this.num_sentences,
      LEVEL_BAR_Y + LEVEL_BAR_H / 2);

    // 如果太多了的话就提示一下
    textAlign(RIGHT, TOP);
    if (this.num_sentences >= 50) {
      text("哇！会不会\n有点多呀！",
      W0 - 4,
      BREAKS_Y);
    }

    // 预览文字
    textAlign(CENTER, BOTTOM);
    noStroke();
    fill(color(213, 173, 114, this.GetPreviewAlpha()));
    text(this.preview_text, W0/2, this.btn_poems_y + 90);

    pop();
  }

  FadeOut() {
    g_animator.Animate(this, "y", undefined, [0, -H0], [0, 500], ()=>{
      this.visible = false;
    });
  }

  FadeIn() {
    this.visible = true;
    g_animator.Animate(this, "y", undefined, [-H0, 0], [0, 500], ()=>{
    });
  }

  GenTitle() {
    const ts = this.selected_title_idxes;
    let txt = "";
    const LIMIT = 40;
    for (let i=0; i<ts.length; i++) {
      const t = TITLES[ts[i]].split("\n")[0];
      if ((t + txt).length <= 40) {
        if (txt.length > 0) {
          txt = txt + "、";
        }
        txt = txt + t;
      } else {
        txt += "等" + ts.length + "篇";
        break;
      }
    };
    return txt;
  }

  // true：使用拼图；false：不使用拼图
  StartGame(is_puzzle) {
    // 组装数据集
    const d = [];
    const stidxes = this.selected_title_idxes;
    const title = this.GenTitle();

    if (is_puzzle) {
      HideNavigationButtons();
      g_btn_puzzle_mode.is_enabled = true;
      LoadMultipleDatasets(stidxes, title, this.ChosenPuzzleIdx());
    } else {
      HideNavigationButtons();
      g_btn_puzzle_mode.is_enabled = false;
      LoadMultipleDatasets(stidxes, title, -999);
    }

    this.FadeOut();
  }
}