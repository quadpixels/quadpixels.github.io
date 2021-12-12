// 2021-10-09
// audio stuff

const COLOR0 = "rgba(167,83,90,1)"; // 满江红
const COLOR1 = "rgba(238,162,164,1)" // 牡丹粉红
const COLOR_FFTBARS = "rgba(238,162,164,1)" // 牡丹粉红
const FRAMERATE_NORMAL = 30;
const FRAMERATE_RECORDING = 10;

var g_animator;

var g_audio_context, g_media_stream;
var normalized = [];
var amplitudeSpectrum;
var g_buffer = [];
var g_model;
var g_worker;
let g_tfjs_version = undefined;
let g_tfjs_backend = undefined;
let g_tfjs_use_webworker = undefined;
var g_hovered_button = undefined;

// UI元素的位置
const STATS4NERDS_POS = [ 1, -220 ];
const RUNNINGMODEVIS_POS = [ 10, 70 ];

// 是否只有按住REC时才录音
// true：按下时才录音
// false：无论何时都录音，但是只有按下时会加入识别队列
var g_push_to_talk = true;

const STATUS_Y = 98;
// Audio processor
var g_audio_source;
var g_my_processor;

const W0 = 480, H0 = 854;
var W = 480, H = 854, WW, HH;
var prevW = W, prevH = H;
var g_scale = 1;
var g_dirty = 0;

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
    
    resizeCanvas(W, H);
    
    prevW = W; prevH = H;
    g_dirty += 2;
  }
}

var g_btn_rec, g_btn_mic, g_btn_file, g_btn_demo_data;
var g_btn_load_model, g_btn_predict;
var g_btn_wgt_add, g_btn_wgt_sub, g_btn_frameskip_add, g_btn_frameskip_sub;

function VerticalLayout() {

}

var g_ui_translate_x = 0, g_ui_translate_y = 0;
class MyStuff {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.children = [];
  }

  Push() {
    push();
    g_ui_translate_x += this.x; g_ui_translate_y += this.y;
    translate(this.x, this.y);
  }

  Pop() {
    g_ui_translate_x -= this.x; g_ui_translate_y -= this.y;
    pop();
  }

  Render() {
    if (this.is_hidden == true) return;
    this.Push();
    this.do_Render();
    if (this.children != undefined) {
      this.children.forEach((c) => {
        c.Render();
      })
    }
    this.Pop();
  }

  SetParent(p) {
    if (p.children != undefined) {
      p.children.push(this);
      this.parent = p;
    } else {
      
    }
  }

  IsHidden() {
    if (this.is_hidden == true) return true;
    else {
      const p = this.parent;
      if (p == undefined) return false;
      else return p.IsHidden();
    }
  }
}

class FFTVis extends MyStuff {
  constructor() {
    super();
    this.nshown = 200;
    this.x = 200;
    this.y = STATUS_Y;
    this.w = 256;
    this.h = 13;

    this.fft = [];
    this.sliding_window = new SlidingWindow();
    this.last_win_ms = 0;
    this.fft_per_sec = 0;
  }

  myMap(x) {
    let ret = map(log(x), 1, 12, 0, 1);
    ret = constrain(ret, 0, 1);
    return ret;
  }

  AddOneEntry(fft) {
    this.fft = fft;
    this.sliding_window.AddOneEvent(millis());
  }

  do_Render() {
    const ms = millis();
    if (ms >= this.last_win_ms + 1000) {
      this.fft_per_sec = this.sliding_window.GetCountAndTotalWeightAfter(ms - 1000);
      this.sliding_window.RemoveEventsBefore(ms - 1000);
      this.last_win_ms += parseInt((ms - this.last_win_ms) / 1000) * 1000;
    }

    const fft = this.fft;
    const TEXT_SIZE = 16;

    noStroke();
    fill(COLOR0);
    for (let i=0; i<this.nshown && i < fft.length; i++) {
      const x0 = map(i,   0, this.nshown-1, 0, this.w);
      const x1 = map(i+1, 0, this.nshown-1, 0, this.w);
      const y0 = constrain(map(this.myMap(fft[i]), 0, 1, this.h, 0), 0, this.w);
      rect(x0, y0, x1-x0+1, this.h-y0);
    }

    const nbreaks = 9;
    
    // Resampled to 16KHz, so max nyquist frequency is 8Khz
    const fftfreq = 8000;
    
    textAlign(CENTER, TOP);
    
    for (let i=0; i<nbreaks; i++) {
      let freq = parseInt(map(i, 0, nbreaks-1, 0, fftfreq));
      if (freq > 1000) {
        freq = parseFloat(freq / 1000).toFixed(1) + "k";
      }
      const dx = map(i, 0, nbreaks-1, 0, this.w);
      stroke(122);
      noFill();
      line(dx, 0, dx, this.h);

      noStroke();
      fill(122);
      text(freq+"", dx, TEXT_SIZE);
    }

    const binwidth = parseFloat(fftfreq / (fft.length / 2));
    textAlign(LEFT, TOP);
    text(binwidth + " hz * " + fft.length + " bins, showing " + this.nshown + " bins",
      0, TEXT_SIZE*2);
    fill(32);
    text(this.fft_per_sec[0] + " ffts/s ", 0, TEXT_SIZE * 3);

    noFill();
    stroke(32);
    rect(0, 0, this.w, this.h);
  }
}

class AudioStatsViz extends MyStuff {
  constructor() {
    super();
    this.window_audiosample = new SlidingWindow();
    this.samp_per_sec = 0;
    this.cb_per_sec   = 0;
    this.x = 8;
    this.y = STATUS_Y;
    this.last_ms = 0;
    this.w = 64;
    this.ub = 0; this.lb = 0;
  }

  AddOneEvent(buffer) {
    const ms = millis();
    this.window_audiosample.AddOneEvent(millis(), buffer.length);
  }

  do_Render() {
    const TEXT_SIZE = 16
    const ms = millis();
    if (ms > this.last_ms + 1000) {
      const x = this.window_audiosample.GetCountAndTotalWeightAfter(ms - 1000);
      this.samp_per_sec = x[1];
      this.cb_per_sec   = x[0];
      this.window_audiosample.RemoveEventsBefore(ms - 1000);

      this.last_ms += parseInt((ms - this.last_ms) / 1000) * 1000;
      //this.last_ms += 1000;
    }
    push();
    noStroke();
    textAlign(LEFT, TOP);
    
    //fill(122);
    //text("tfjs " + tf.version.tfjs, this.x, this.y + TEXT_SIZE*4);

    fill(122);
    text(this.lb.toFixed(2) + ".." + this.ub.toFixed(2), 0, TEXT_SIZE);
    fill(32);
    text(this.samp_per_sec + " sp/s", 0, TEXT_SIZE*2);
    text(this.cb_per_sec + " cb/s", 0, TEXT_SIZE*3);
    // draw buffer
    const b = g_buffer;

    for (let i=0; i<b.length; i++) {
      this.ub = max(this.ub, b[i]);
      this.lb = min(this.lb, b[i]);
    }

    const dy_min = 0, dy_max = dy_min + 13;
    noFill();
    stroke(COLOR0);
    for (let i=1; i<b.length && i < this.w; i++) {
      const idx0 = parseInt(map(i-1, 0, this.w-1, 0, b.length-1));
      const idx1 = parseInt(map(i  , 0, this.w-1, 0, b.length-1));
      const samp0 = b[idx0], samp1 = b[idx1];
      const dy0 = map(samp0, this.lb, this.ub, dy_max, dy_min);
      const dy1 = map(samp1, this.lb, this.ub, dy_max, dy_min);
      const dx0 = i-1;
      const dx1 = i  ;
      line(dx0, dy0, dx1, dy1);
    }
    stroke(32);
    rect(0, dy_min, this.w, dy_max-dy_min);

    pop();
  }
}

// for manually recording a small segment of sound & testing
// model uses 25ms width and 10ms delta
class RecorderViz extends MyStuff {
  constructor() {
    super();
    this.Clear();
    this.graph = createGraphics(500, 32);
    this.is_recording = false;
    this.x = 16;
    this.y = 680;
    this.window_delta = 10; // ms
    this.graph.clear();
    this.start_record_ms = 0;
    this.duration_ms = 0;
    this.px_per_samp = 1;  // 1 sample = 1 px

    this.window_offset = 0;
    this.window_delta = 25;
    this.window_width = 100;
  }

  Clear() {
    this.buffer = [];
    this.duration_ms = 0;
    if (this.graph != undefined)
      this.graph.clear();
  }

  StartRecording() {
    this.graph.clear();
    this.is_recording = true;
    this.buffer = [];
    this.start_record_ms = millis();
    this.window_offset = 0;
    g_audio_context.resume();
    frameRate(FRAMERATE_RECORDING);
  }

  myMap(x) {
    let ret = map(Math.log(x+1), 0, 20, 0, 1);
    ret = constrain(ret, 0, 1);
    return ret;
  }

  RenderAllFFTs() {
    // Render fft
    const g = this.graph;
    g.clear();
    g.noFill();
    const c0 = color(128, 128, 128);
    const c1 = color(0,   0,   0);
    for (let i=0; i<this.buffer.length && i < g.width; i++) {
      const col = this.buffer[i];
      for (let j=0; j<g.height; j++) {
        const idx = parseInt(j/(g.height-1)*(col.length-1));
        const intensity = constrain(this.myMap(col[idx]), 0, 1);
        g.stroke(lerpColor(c0, c1, intensity));
        g.point(i, g.height - 1 - j);
      }
    }
  }

  RenderOneLineOfFFT(fft, x) {
    const g = this.graph;
    if (x >= g.width) return;
    g.noFill();
    const c0 = color(128, 128, 128);
    const c1 = color(0,   0,   0);
    for (let j=0; j<g.height; j++) {
      const idx = parseInt(j/(g.height-1)*(fft.length-1));
      const intensity = constrain(this.myMap(fft[idx]), 0, 1);
      g.stroke(lerpColor(c0, c1, intensity));
      g.point(x, g.height - 1 - j);
    }
  }

  StopRecording() {
    g_audio_context.suspend();
    this.is_recording = false;
    this.duration_ms = millis() - this.start_record_ms;
    frameRate(FRAMERATE_NORMAL);
  }

  ShouldAddFFT() {
    if (g_push_to_talk)
      return true;
    else {
      return this.is_recording;
    }
  }

  AddSpectrumIfRecording(fft) {
    if (!this.ShouldAddFFT()) {
      return;
    }
    this.RenderOneLineOfFFT(fft, this.buffer.length);
    this.buffer.push(fft);
  }

  async DoPrediction() {
    // 每次画图的时候进行预测或者提交预测请求
    if (this.window_width + this.window_offset <= this.buffer.length) {
      let ffts = this.buffer.slice(this.window_offset, 
                                    this.window_offset + this.window_width);
      if (ffts.length > 0) {
        if (g_tfjs_use_webworker == true) {
          g_worker.postMessage({
            "tag": "Predict",
            "ffts": ffts
          });
        } else {
          const ms0 = millis();
          const temp0 = await DoPrediction(ffts);
          const ms1 = millis();

          temp0array = []; // for ctc
          const T = temp0.shape[1];
          const S = temp0.shape[2];
          let src = temp0.slice([0, 0, 0], [1, T, S]).dataSync();
          for (let t=0; t<T; t++) {
            let line = [];
            let idx0 = S * t;
            for (let s=0; s<S; s++) {
              let value = src[s + idx0];

              if (g_weight_mask != undefined) {
                value = value * g_weight_mask[s];
              }

              line.push(value);
            }
            temp0array.push(line);
          }

          g_worker.postMessage({
            "tag": "decode",
            "S": temp0.shape[2],
            "temp0array": temp0array,
          });
        }
      }
      this.window_offset += this.window_delta;
    }
  }

  async do_Render() {
    push();
    noStroke();
    
    textAlign(LEFT, TOP);

    let dx = 0;
    let txt = "" + this.buffer.length + " | " + 
      (this.duration_ms / 1000).toFixed(1) + "s |";

    fill(122);

    txt = txt + " | Window:[" + this.window_offset + "," + 
          (this.window_offset + this.window_width) + "] |"

    dx = textWidth(txt) + 3;

    text(txt, 0, 0);

    if (!this.is_recording) {
      fill(122);
      text("Not recording", dx, 0);
    } else {
      fill("#F88");
      this.duration_ms = millis() - this.start_record_ms;
      text("Recording", dx, 0);
    }

    noFill();
    stroke(32);
    const h = this.graph.height;
    let dy = 15;
    const w = this.buffer.length;
    const w1 = w + this.window_width;

    if (w1 > W0) {
      scale(W0/w1, 1);
    }

    image(this.graph, 0, dy);
    noFill();
    stroke("#33f");
    const dx1 = this.window_offset;
    rect(dx1, dy, this.window_width, h);
    stroke(32);
    rect(0, dy, w, h);

    pop();

    // 在绘图完成时，进行预测
    this.DoPrediction();
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
    this.border_style = 1;
  }
  do_Render() {
    if (!this.is_enabled) {
      this.is_hovered = false;
      this.is_pressed = false;
    }
    push();

    let c = color(48, 48, 48);
    let f = color(255, 255, 255, 192);
    if (!this.is_enabled) {
      c = "#777";
      f = color(128, 128, 128, 192);
    } else {
      if (!this.is_hovered) {
        c = color(48, 48, 48);
        f = color(255, 255, 255, 192);
      } else {
        if (this.is_pressed) {
          c = color(56, 32, 32); // 高粱红
          f = color(192, 44, 56, 192);
        } else {
          c = color(56, 32, 32); // 莓红
          f = color(255, 255, 255, 192);
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

    fill(c);
    textSize(Math.max(14, h / 3));
    textAlign(CENTER, CENTER);
    noStroke();
    text(this.txt, w/2, h/2);
    pop();
  }
  Hover(mx, my) {
    if (this.IsHidden()) {
      this.is_hovered = false;
    }
    mx = mx - g_ui_translate_x;
    my = my - g_ui_translate_y;
    if (!this.is_enabled) return;
    if (mx >= this.x          && my >= this.y &&
        mx <= this.x + this.w && my <= this.y + this.h) {
      this.is_hovered = true;
    } else {
      this.is_hovered = false;
    }
  }
  OnPressed() {
    if (!this.is_enabled) return;
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
}

class PathfinderViz extends MyStuff {
  constructor() {
    super();
    this.x = 16;
    this.y = 30;

    this.py2idx = {};

    this.predict_time = 0;
    this.decode_time = 0;
  }

  SetResult(res, pred_time, dec_time) {
    this.result = res;
    this.predict_time = pred_time;
    this.decode_time = dec_time;
  }

  do_Render() {
    const TEXT_SIZE = 15;
    push();
    noStroke();
    fill(32);
    textAlign(LEFT, TOP);

    fill(128);
    if (g_tfjs_version == undefined) {
      text("tfjs not loaded", 0, 0);
    }
    text(g_tfjs_version, 0, 0);
    
    fill(32);
    
    text("Result: " + this.result, 0, TEXT_SIZE);
    text("Predict time: " + this.predict_time + " ms", 0, TEXT_SIZE*2);
    text("Decode time: " + this.decode_time + " ms", 0, TEXT_SIZE*3);

    pop();
  }

  MapColor(val) {
    if (val == 0) { val = -99; }
    else { val = Math.log(val); }
    val = constrain(val, -20, 0);
    val = map(val, -20, 0, 0, 1);
    
    const c0 = color(128, 128, 128);
    const c1 = color(0,   0,   0);

    return lerpColor(c0, c1, val);
  }

  RenderPredictionOutput(o) {
    // O is a tensor
    const len = o.shape[1];
    const vocab_size = o.shape[2];
    const g = this.graph;
    g.clear();
    g.noFill();

    if (true) {
      let pylist = [];
      for (let i=0; i<len && i < g.width; i++) {
        const line = o.slice([0,i,0], [1,1,vocab_size]).dataSync();
        for (let j=0; j<g.height; j++) {
          let lb = parseInt(map(j, 0, g.height-1, 0, vocab_size-1));
          let ub = parseInt(map(j+1,0,g.height-1, 0, vocab_size-1));
          if (ub < lb) ub = lb;

          let s = 0;
          for (let k=lb; k<=ub; k++) {
            s += line[k];
          }

          g.stroke(this.MapColor(s));
          g.point(i, j);
        }

        // Get argmax
        let maxprob = -1e20, maxidx = -999;
        for (let j=0; j<line.length; j++) {
          if (line[j] > maxprob) {
            maxprob = line[j];
            maxidx = j;
          }
        }
        if (maxidx != -999) {
          pylist.push(PINYIN_LIST[maxidx]);
        } else {
          pylist.push(" ");
        }
        console.log(pylist)
      }
    }
  }
}

class MovingWindowVis extends MyStuff {
  constructor() {
    super()
    this.W0 = 40;
    this.w = 80;
    this.h = 24;
    this.x = 0; this.y = 0;
    this.weights = [];
    this.UpdateWeights(6);
  }
  do_Render() {
    const TEXT_SIZE = 13;
    push();
    noStroke();
    fill(128);
    text("PredWin W=" + this.W0, 0, 0);
    const len = this.weights.length;
    stroke(32);
    fill(220);
    for (let i=0; i<len; i++) {
      const x0 = map(i, 0, len, 0, this.w);
      const x1 = map(i+1,0,len, 0, this.w);
      const y0 = map(this.weights[i], 1, 0, 0, this.h) + TEXT_SIZE;
      const y1 = this.h + TEXT_SIZE;
      rect(x0, y0, x1-x0, y1-y0);
      //console.log(x0 + " " + x1 + " " + y0 + " " + y1)
    }
    pop();
  }
  UpdateWeights(l) {
    this.len = l;
    this.weights = [];
    for (let i=0; i<l; i++) {
      const w = 1;
      this.weights.push(w);
    }
  }
}

class FrameskipVis extends MyStuff {
  constructor() {
    super();
    this.frameskip = 0;
    this.x = 274;
    this.y = 22;
  }

  ChangeFrameskip(delta) {
    this.frameskip += delta;
    if (this.frameskip < 0) this.frameskip = 0;
    g_worker.postMessage({
      "tag": "frameskip",
      "frameskip": this.frameskip
    });
  }

  IncrementFrameskip() {
    this.ChangeFrameskip(1);
  }

  DecrementFrameskip() {
    this.ChangeFrameskip(-1);
  }

  do_Render() {
    push();
    noStroke();
    fill(128);
    text("CTC frameskip", 0, 0);
    fill(0);
    textSize(16);
    text(""+this.frameskip, 0, 13);
    pop();
  }
}

function DrawLabel(label, x, y, w, h, highlighted = false) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  if (highlighted) {
    fill(COLOR1)
  } else {
    noFill();
  }
  stroke("black");
  rect(x, y, w, h);
  noStroke();
  fill("black");
  text(label, x, y);
  pop();
}
class Stats4Nerds extends MyStuff {
  constructor() {
    super();
    
    this.x = STATS4NERDS_POS[0];
    this.y = STATS4NERDS_POS[1];
    this.w = 476;
    this.h = 170;
    this.is_hidden = false;
  }
  do_Render() {
    fill("rgba(255,255,255,0.95)");
    stroke(32);
    DrawBorderStyle2(0, 0, this.w, this.h);
  }

  Hide() {
    const Y0 = -220, Y1 = 70;
    g_btn_statsfornerds.is_enabled = false;
    g_animator.Animate(this, "y", undefined, [Y1, Y0], [0, 300], ()=>{
      this.y = Y0;
      this.is_hiden = true;
      g_btn_statsfornerds.is_enabled = true;
    });
  }

  Show() {
    const Y0 = -220, Y1 = 70;
    this.is_hidden = false;
    g_btn_statsfornerds.is_enabled = false;
    g_animator.Animate(this, "y", undefined, [Y0, Y1], [0, 300], ()=>{
      this.y = Y1;
      this.is_hiden = false;
      g_btn_statsfornerds.is_enabled = true;
    });
  }

  Toggle() {
    g_animator.FinishAllPendingAnimations();
    const Y0 = -220, Y1 = 70;
    if (this.y == Y1) {
      this.Hide();
    } else {
      this.Show();
    }
  }
}
class RunningModeVis extends MyStuff {
  constructor() {
    super();
    this.x = RUNNINGMODEVIS_POS[0];
    this.y = RUNNINGMODEVIS_POS[1];
    this.w = 460;
    this.h = 100;
    this.info = "";
    this.info_millis = 0;

    this.visible = true;
  }

  SetInfo(x, timeout = 2000) {
    this.info = x;
    this.info_millis = timeout;
  }

  do_Render() {
    if (!this.visible) return;
    const TEXT_SIZE = 12;
    push();

    const PAD = 4;
    const x0 = this.x + this.w * 0.34;
    const x1 = this.x + this.w * 0.66;
    const yc = this.y + this.h * 0.38;
    const y1 = this.y + this.h * 0.32;
    const y2 = this.y + this.h * 0.5;
    noStroke();
    textSize(TEXT_SIZE);
    fill("black");
    textAlign(CENTER, TOP);
    // text("WebWorker", x0, this.y+PAD);
    // text("Backend",   x1, this.y+PAD);

    const x00 = this.x + this.w * 0.08;
    const x10 = this.x + this.w * 0.92;

    const w0 = 48;
    DrawLabel("Mic", x00, yc, w0, 32);
    DrawLabel("Pinyin", x10, yc, w0, 32);

    const w1 = 120;
    DrawLabel("Worker Thread", x0, y1, w1, 16, g_tfjs_use_webworker == true);
    DrawLabel("Main Thread", x0, y2, w1, 16, g_tfjs_use_webworker == false);

    const w2 = 100;
    DrawLabel("WebGL", x1, y1, w2, 16, g_tfjs_backend == "webgl");
    DrawLabel("CPU", x1, y2, w2, 16, g_tfjs_backend == "cpu");

    noStroke();
    fill("black");
    textAlign(LEFT, TOP);

    fill("rgba(0,0,0," + this.GetAlpha() + ")");
    text(this.info, this.x + PAD, this.y + this.h - (TEXT_SIZE+2)*2);

    stroke(COLOR1);
    strokeWeight(2);
    switch (g_tfjs_use_webworker) {
      case true:
        line(x00+24, yc, x0-w1/2, y1);
        switch (g_tfjs_backend) {
          case "webgl":
            line(x0+w1/2, y1, x1-w2/2, y1); break;
          case "cpu":
            line(x0+w1/2, y1, x1-w2/2, y2); break;
          break;
        }
        break;
      case false:
        line(x00+24, yc, x0-w1/2, y2);
        switch (g_tfjs_backend) {
          case "webgl":
            line(x0+w1/2, y2, x1-w2/2, y1); break;
          case "cpu":
            line(x0+w1/2, y2, x1-w2/2, y2); break;
          break;
        }
        break;
    }

    switch (g_tfjs_backend) {
      case "webgl":
        line(x1+w2/2, y1, x10-w0/2, yc); break;
      case "cpu":
        line(x1+w2/2, y2, x10-w0/2, yc); break;
      break;
    }

    noStroke();
    textAlign(RIGHT, BOTTOM);
    fill("#999");
    text((this.info_millis / 1000).toFixed(1), this.x + this.w - PAD, this.y + this.h - PAD);

    pop();
  }

  Update(millis) {
    this.info_millis -= millis;
    if (this.info_millis < 0) {
      this.info_millis = 0;
    }
    switch (this.anim) {
      case "show":
        this.y = lerp(this.y, this.y1, 1-pow(0.9, millis/15));
        if (abs(this.y - this.y1) < 1) {
          this.y = this.y1;
          this.anim = undefined;
        }
        break;
      case "hide":
        this.y = lerp(this.y, this.y0, 1-pow(0.9, millis/15));
        if (abs(this.y - this.y0) < 1) {
          this.y = this.y0;
          this.anim = undefined;
          this.visible = false;
        }
        break;
    }
  }

  GetAlpha() {
    const THRESH = 750;
    if (this.info_millis >= THRESH) { return 1; }
    else return this.info_millis / THRESH;
  }
}

var g_fft_vis;
var g_recording = false;
//var g_rec_mfcc = [];
//var graph_rec_mfcc;
var graph_mfcc0, graph_diff;
var g_moving_window_vis;
var g_frameskip_vis;
var g_runningmode_vis, g_stats4nerds;

var soundReady = true;

var normalized = [];
var currentPrediction = "";
var rotation = 0.0;

g_stats4nerds = new Stats4Nerds();
let g_frame_count = 0;
let g_last_draw_ms = 0;
let g_input_audio_stats_viz = new AudioStatsViz();
let g_downsp_audio_stats_viz = new AudioStatsViz();

g_input_audio_stats_viz.SetParent(g_stats4nerds);
g_downsp_audio_stats_viz.SetParent(g_stats4nerds);

let temp0, temp1;
let temp0array;
let g_textarea;
let g_audio;

let g_audio_file_input;
let g_audio_elt;

let g_buttons = [];

function OnPredictionResult(res) {
  const d = res.data;
  g_pathfinder_viz.SetResult(d.Decoded, d.PredictionTime, d.DecodeTime);
  OnNewPinyins(d.Decoded.split(" "));
}

// For moving window stuff
let g_py2idx = {};
let g_weight_mask = 0;
function OnUpdateWeightMask() {
  const N = g_moving_window_vis.weights.length;
  UpdateWeightMask(g_moving_window_vis.weights,
                   g_aligner.GetNextPinyins(N));
}
function UpdateWeightMask(window_weights, next_pinyins) {
  let m = [];
  const W0 = g_moving_window_vis.W0;
  for (let i=0; i<PINYIN_LIST.length; i++) {
    m.push(0);
  }
  const N = min(next_pinyins.length, window_weights.length);
  for (let i=0; i<N; i++) {
    const p = next_pinyins[i];
    const idxes = g_py2idx[p];
    if (idxes == undefined) {
      continue;
    }
    for (let j=0; j<idxes.length; j++) {
      const idx = idxes[j];
      if (m[idx] == 0) {
        m[idx] = W0;
      } else {
        m[idx] *= window_weights[i];
      }
    }
  }
  for (let i=0; i<PINYIN_LIST.length; i++) {
    m[i] += 1;
  }
  if (g_worker != undefined) {
    g_worker.postMessage({
      "tag": "weight_mask",
      "weight_mask": m
    });
  }
  g_weight_mask = m;
}
function ResetWeightMask() {
  if (g_worker != undefined) {
    g_worker.postMessage({
      "tag": "weight_mask",
      "weight_mask": undefined
    });
  }
}

async function setup() {
  // Setup window stuff
  for (let i=0; i<PINYIN_LIST.length; i++) {
    let p = PINYIN_LIST[i];
    let j = 0;
    for (; j<p.length; j++) {
      if (p[j]>='0' && p[j]<='9') break;
    }
    p = p.slice(0, j);
    if (!(p in g_py2idx)) {
      g_py2idx[p] = [ i ];
    } else {
      g_py2idx[p].push(i);
    }
  }

  g_audio_file_input = document.getElementById("audio_input");
  g_audio_file_input.addEventListener("input", async (x) => {
    console.log("addEventListener");
    console.log(x.target.files);
    let the_file;
    x.target.files.forEach((f) => {
      the_file = f;
    })
    if (the_file) { CreateAudioInput(the_file); }
  });

  createCanvas(640, 640);
  // 注：在Firefox中录制的话，需要降低帧数
  frameRate(FRAMERATE_NORMAL);

  graph_diff = createGraphics(512, 512);
  g_fft_vis = new FFTVis();
  g_fft_vis.SetParent(g_stats4nerds);
  g_moving_window_vis = new MovingWindowVis();
  g_moving_window_vis.x = 374;
  g_moving_window_vis.y = 22;
  g_moving_window_vis.SetParent(g_stats4nerds);

  g_frameskip_vis = new FrameskipVis();
  g_frameskip_vis.SetParent(g_stats4nerds);

  g_textarea = createElement("textarea", "");
  g_textarea.size(320, 50);
  g_textarea.position(32, STATUS_Y + 100)
  g_textarea.hide();

  g_downsp_audio_stats_viz.x = 102;

  // REC button
  g_btn_rec = new Button("REC");
  g_btn_rec.w = 220;
  g_btn_rec.h = 100;
  g_btn_rec.x = W0/2 - g_btn_rec.w/2;
  g_btn_rec.y = H0   - g_btn_rec.h - 12;
  g_btn_rec.is_enabled = false;
  g_btn_rec.clicked = function() {
    g_recorderviz.StartRecording();
  }
  g_btn_rec.released = function() {
    g_recorderviz.StopRecording();
  }
  g_buttons.push(g_btn_rec);

  // MIC button & FILE button
  g_btn_mic = new Button("Mic");
  g_btn_file = new Button("File");

  g_btn_mic.x = 16;
  g_btn_mic.y = 16;
  g_btn_mic.clicked = function() {
    SetupMicrophoneInput(512);
    g_btn_mic.is_enabled = false; g_btn_file.is_enabled = false;
    g_btn_rec.is_enabled = true;
  }
  g_btn_file.x = 80;
  g_btn_file.y = 16;
  g_btn_file.clicked = function() {
    g_audio_file_input.click();
    g_btn_mic.is_enabled = false; g_btn_file.is_enabled = false;
    g_btn_rec.is_enabled = true;
  }
  g_buttons.push(g_btn_mic);
  g_buttons.push(g_btn_file);

  // Load model & "Predict"
  g_btn_load_model = new Button("Load\nModel");
  g_btn_predict = new Button("Pre-\ndict");

  g_btn_load_model.w = 60;
  g_btn_load_model.x = 280;
  g_btn_load_model.y = 16;
  g_btn_load_model.clicked = async function() {
    g_runningmode_vis.SetInfo("Attempt to load and initialize model with WebWorker");
    g_model = await LoadModel();
    g_btn_predict.is_enabled = true;
    g_btn_load_model.is_enabled = false;
  }

  g_btn_predict.w = 50;
  g_btn_predict.x = 360;
  g_btn_predict.y = 16;
  g_btn_predict.is_enabled = false;
  g_btn_predict.clicked = async function() {
    if (g_tfjs_use_webworker) {
      g_worker.postMessage({
        "tag": "Predict",
        "ffts": g_recorderviz.buffer.slice()
      });
    } else {
      console.log(g_recorderviz.buffer)
      const ms0 = millis();
      temp0 = await DoPrediction(g_recorderviz.buffer);
      const ms1 = millis();
      //g_pathfinder_viz.RenderPredictionOutput(temp0);
      temp0array = []; // for ctc
      const T = temp0.shape[1];
      const S = temp0.shape[2];
      for (let t=0; t<T; t++) {
        let line = [];
        let src = temp0.slice([0, t, 0], [1, 1, S]).dataSync();
        for (let s=0; s<S; s++) {
          line.push(src[s]);
        }
        temp0array.push(line);
      }
      let blah = Decode(temp0array, 5, S-1);
      let out = ""
      blah[0].forEach((x) => {
        out = out + PINYIN_LIST[x] + " "
      });
      const ms2 = millis();
      g_pathfinder_viz.SetResult(out, ms1-ms0, ms2-ms1);
      console.log(out);
    }
  }
  g_buttons.push(g_btn_load_model);
  //g_buttons.push(g_btn_predict);

  g_btn_statsfornerds = new Button("Stats 4\nnerds");
  g_btn_statsfornerds.w = 80;
  g_btn_statsfornerds.x = 360;
  g_btn_statsfornerds.y = 16;
  g_btn_statsfornerds.is_enabled = true;
  g_btn_statsfornerds.clicked = async function() {
    g_stats4nerds.Toggle();
  }

  g_buttons.push(g_btn_statsfornerds);

  // Demo data.
  let g_btn_demo_data = new Button("Demo\nData");
  g_btn_demo_data.w = 60;
  g_btn_demo_data.x = 148;
  g_btn_demo_data.y = 16;
  g_btn_demo_data.clicked = function() {
    g_recorderviz.buffer = TESTDATA;
    g_recorderviz.StopRecording();
  }
  g_buttons.push(g_btn_demo_data);

  let btn_prev5 = new Button("-5");
  btn_prev5.x = 440;
  btn_prev5.w = 34;
  btn_prev5.h = 50;
  btn_prev5.y = 400;
  btn_prev5.clicked = function() {
    ModifyDataIdx(-5);
  }
  g_buttons.push(btn_prev5);

  let btn_next5 = new Button("+5");
  btn_next5.x = 440;
  btn_next5.w = 34;
  btn_next5.h = 50;
  btn_next5.y = 640;
  btn_next5.clicked = function() {
    ModifyDataIdx(5);
  }
  g_buttons.push(btn_next5);

  let btn_next = new Button(">");
  btn_next.x = 440;
  btn_next.w = 34;
  btn_next.h = 80;
  btn_next.y = 550;
  btn_next.clicked = function() {
    LoadNextDataset();
  }
  g_buttons.push(btn_next);

  let btn_prev = new Button("<");
  btn_prev.x = 440;
  btn_prev.w = 34;
  btn_prev.h = 80;
  btn_prev.y = 460;
  btn_prev.clicked = function() {
    LoadPrevDataset();
  }
  g_buttons.push(btn_prev);

  let btn_reset = new Button("R");
  btn_reset.x = 440;
  btn_reset.y = 240;
  btn_reset.w = 34;
  btn_reset.h = 35;
  btn_reset.clicked = function() {
    g_aligner.Reset();
  }
  g_buttons.push(btn_reset);

  g_btn_wgt_add = new Button("+");
  g_btn_wgt_add.x = 32;
  g_btn_wgt_add.y = 42;
  g_btn_wgt_add.w = 32;
  g_btn_wgt_add.h = 24;
  g_btn_wgt_add.border_style = 2;
  g_btn_wgt_add.clicked = function() {
    g_moving_window_vis.W0 *= 2;
  }
  g_btn_wgt_add.is_enabled = false;
  g_btn_wgt_add.SetParent(g_moving_window_vis);

  g_btn_wgt_sub = new Button("-");
  g_btn_wgt_sub.x = 0;
  g_btn_wgt_sub.y = 42;
  g_btn_wgt_sub.w = 32;
  g_btn_wgt_sub.h = 24;
  g_btn_wgt_sub.border_style = 2;
  g_btn_wgt_sub.clicked = function() {
    g_moving_window_vis.W0 /= 2;
  }
  g_btn_wgt_sub.is_enabled = false;
  g_btn_wgt_sub.SetParent(g_moving_window_vis);

  g_btn_frameskip_add = new Button("+");
  g_btn_frameskip_add.x = 32;
  g_btn_frameskip_add.y = 42;
  g_btn_frameskip_add.w = 32;
  g_btn_frameskip_add.h = 24;
  g_btn_frameskip_add.border_style = 2;
  g_btn_frameskip_add.clicked = function() {
    g_frameskip_vis.IncrementFrameskip();
  }
  g_btn_frameskip_add.is_enabled = false;
  g_btn_frameskip_add.SetParent(g_frameskip_vis);

  g_btn_frameskip_sub = new Button("-");
  g_btn_frameskip_sub.x = 0;
  g_btn_frameskip_sub.y = 42;
  g_btn_frameskip_sub.w = 32;
  g_btn_frameskip_sub.h = 24;
  g_btn_frameskip_sub.border_style = 2;
  g_btn_frameskip_sub.clicked = function() {
    g_frameskip_vis.DecrementFrameskip();
  }
  g_btn_frameskip_sub.is_enabled = false;
  g_btn_frameskip_sub.SetParent(g_frameskip_vis);

  g_runningmode_vis = new RunningModeVis();

  g_animator = new Animator()

  SetupReadAlong();

  setTimeout(() => {
    g_btn_statsfornerds.clicked();
  }, 5);

  setTimeout(() => {
    g_btn_load_model.clicked();
  }, 1000);
}

function draw() {
  let delta_ms = 0;
  const ms = millis();
  if (g_frame_count == 0) {
    g_recorderviz = new RecorderViz();
    g_pathfinder_viz = new PathfinderViz();
    
    g_pathfinder_viz.SetParent(g_stats4nerds);
  } else {
    delta_ms = (ms - g_last_draw_ms);
    g_animator.Update(delta_ms);
  }

  background(255);
  textSize(12);
  push();
  scale(g_scale);

  const mx = g_pointer_x / g_scale, my = g_pointer_y / g_scale;
  noFill();
  // 放在最底层
  RenderReadAlong(delta_ms);

  let has_hovered_buttons = false;
  g_hovered_button = undefined;

  g_buttons.forEach((b) => {
    b.Hover(mx, my);
    if (b.is_hovered) {
      has_hovered_buttons = true;
      g_hovered_button = b;
    }
  })
  if (!has_hovered_buttons) {
    g_aligner.Hover(mx, my);
  } else {
    g_aligner.is_hovered = false;
  }


  // ====================================================================
  // Begin stats for nerds
  fill(0);
  noStroke();
  if (soundReady) { }

  // 触摸单独在这里另外处理
  g_buttons.forEach((b) => {
    b.Render();
  })

  g_recorderviz.Render();
  
  g_stats4nerds.Render();

  // ====================================================================

  g_runningmode_vis.Update(delta_ms);

  // crosshair
  noFill();
  stroke(32);
  const l = 10 / g_scale;
  line(mx - l, my, mx + l, my);
  line(mx, my - l, mx, my + l);


  pop();

  push();
  noStroke();
  fill(192);
  textAlign(LEFT, TOP);
  text(parseInt(width) + "x" + parseInt(height) + "x" + g_scale.toFixed(2) + " " + windowWidth + "x" + windowHeight, 1, 1);

  pop();  // end scale


  g_frame_count ++;
  g_last_draw_ms = ms;

  if (g_frame_count == 1 || (g_frame_count % 60 == 0)) {
    OnWindowResize();
  }
}

// Callbacks from sound

function SoundDataCallbackMyAnalyzer(buffer, downsampled, fft_frames) {
  soundReady = true;
  g_input_audio_stats_viz.AddOneEvent(buffer);
  g_buffer = buffer;
  g_downsp_audio_stats_viz.AddOneEvent(downsampled);
}

function soundDataCallback(soundData) {
  const ms = millis();
  if (g_input_audio_stats_viz == undefined) return;
  if (g_recorderviz == undefined) return;
  soundReady = true;
  //mfcc = soundData.mfcc;
  
  g_buffer = soundData;
  g_recorderviz.AddSpectrumIfRecording(amplitudeSpectrum, ms);
}

// p5js input

function keyPressed() {
  if (key == 'r') {
    g_recorderviz.StartRecording();
  } else if (key == 'p') { // Print recorded
    g_textarea.show();
    const x = g_recorderviz.buffer;
    let txt = "";
    x.forEach((line) => {
      for (let i=0; i<line.length; i++) {
        if (i>0) {
          txt += ","
        }
        txt += ScaleFFTDataPoint(line[i])
      }
      txt += "\n"
    })
    g_textarea.value(txt);
  } else if (key == 'o') {
    g_textarea.show();
    const x = g_recorderviz.buffer;
    let txt = "[";
    x.forEach((line) => {
      txt += "["
      for (let i=0; i<line.length; i++) {
        if (i>0) {
          txt += ","
        }
        txt += line[i]
      }
      txt += "],\n"
    })
    txt += "]\n";
    g_textarea.value(txt);
  }
  
  {
    ReadAlongKeyPressed(key, keyCode);
  }
}

function keyReleased() {
  if (key == 'r') {
    g_recorderviz.StopRecording();
  }
}

// Touch or mouse input events

function touchStarted(event) {
  TouchOrMouseStarted(event);
}

function mousePressed(event) {
  TouchOrMouseStarted(event);

  // TODO：为什么在手机上按一下既会触发touchevent又会触发mouseevent
  if (millis() < g_prev_touch_millis + DEBOUNCE_THRESH) return;


  const mx = g_pointer_x / g_scale, my = g_pointer_y / g_scale;
  g_buttons.forEach((b) => { // TODO: 为什么需要在这里再加一下
    b.Hover(mx, my);
    if (b.is_hovered) {
      b.OnPressed();
    }
  })
}

function touchEnded(event) {
  TouchOrMouseEnded(event);
  g_buttons.forEach((b) => {
    b.OnReleased();
  });
}
function mouseReleased(event) {
  TouchOrMouseEnded(event);
  g_buttons.forEach((b) => {
    b.OnReleased();
  });
}

function touchMoved(event) {
  TouchOrMouseMoved(event);
}

function mouseMoved() {
  TouchOrMouseMoved(event);
}