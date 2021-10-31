// 2021-10-09
// audio stuff

const COLOR0 = "rgba(167,83,90,1)"; // 满江红
const COLOR_FFTBARS = "rgba(238,162,164,1)" // 牡丹粉红

var g_audio_context;
var normalized = [];
var amplitudeSpectrum;
var g_buffer = [];
var g_model;
var g_worker;
let g_tfjs_version = undefined;
var g_hovered_button = undefined;

const STATUS_Y = 208;
// Audio processor
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

function VerticalLayout() {

}

class LoudnessVis {
  constructor() {
    this.max_value = 16;
    this.x = 500;
    this.y = STATUS_Y;
    this.w = 100;
    this.h = 13;
  }

  Render(value) {
    while (this.max_value < value) {
      this.max_value += 8;
    }
    const TEXT_SIZE = 16;
    push();
    noStroke();
    fill(32);
    textAlign(LEFT, TOP);
    text("Loudness: " + value.toFixed(1), this.x, this.y + TEXT_SIZE + this.h);
    fill(122);

    rect(this.x, this.y, this.w * value / this.max_value, this.h);
    // xbreaks
    const N = 5;
    textAlign(CENTER, TOP);
    for (let i=0; i<N; i++) {
      const valu = parseInt(this.max_value * i / (N-1));
      const dx = map(i, 0, N-1, this.x, this.x + this.w);
      text(valu+"", dx, this.y+TEXT_SIZE);
      stroke(64);
      line(dx, this.y, dx, this.y + TEXT_SIZE-1);
      noStroke();
    }

    noFill();
    stroke(32);
    rect(this.x, this.y, this.w, this.h);

    pop();
  }
}

class FFTVis {
  constructor() {
    this.nshown = 200;
    this.x = 210;
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

  Render() {
    const ms = millis();
    if (ms >= this.last_win_ms + 1000) {
      this.fft_per_sec = this.sliding_window.GetCountAndTotalWeightAfter(ms - 1000);
      this.sliding_window.RemoveEventsBefore(ms - 1000);
      this.last_win_ms += parseInt((ms - this.last_win_ms) / 1000) * 1000;
    }

    const fft = this.fft;
    const TEXT_SIZE = 16;

    fill(COLOR0);
    for (let i=0; i<this.nshown && i < fft.length; i++) {
      const x0 = map(i, 0, this.nshown-1, this.x, this.x+this.w);
      const x1 = map(i+1,0,this.nshown-1, this.x, this.x+this.w);
      const y0 = constrain(map(this.myMap(fft[i]), 0, 1, this.y+this.h, this.y), this.y, this.y+this.w);
      rect(x0, y0, x1-x0+1, this.h+this.y-y0);
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
      const dx = map(i, 0, nbreaks-1, this.x, this.x+this.w);
      stroke(122);
      noFill();
      line(dx, this.y, dx, this.y+this.h);

      noStroke();
      fill(122);
      text(freq+"", dx, this.y + TEXT_SIZE);
    }

    const binwidth = parseFloat(fftfreq / (fft.length / 2));
    textAlign(LEFT, TOP);
    text(binwidth + " hz * " + fft.length + " bins, showing " + this.nshown + " bins",
      this.x, this.y + TEXT_SIZE*2);
    fill(32);
    text(this.fft_per_sec[0] + " ffts/s ", this.x, this.y + TEXT_SIZE * 3);

    noFill();
    stroke(32);
    rect(this.x, this.y, this.w, this.h);
  }
}

class AudioStatsViz {
  constructor() {
    this.window_audiosample = new SlidingWindow();
    this.samp_per_sec = 0;
    this.cb_per_sec   = 0;
    this.x = 16;
    this.y = STATUS_Y;
    this.last_ms = 0;
    this.w = 64;
    this.ub = 0; this.lb = 0;
  }

  AddOneEvent(buffer) {
    const ms = millis();
    this.window_audiosample.AddOneEvent(millis(), buffer.length);
  }

  Render() {
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
    text(this.lb.toFixed(2) + ".." + this.ub.toFixed(2), this.x, this.y + TEXT_SIZE);
    fill(32);
    text(this.samp_per_sec + " sp/s", this.x, this.y + TEXT_SIZE*2);
    text(this.cb_per_sec + " cb/s", this.x, this.y + TEXT_SIZE*3);
    // draw buffer
    const b = g_buffer;

    for (let i=0; i<b.length; i++) {
      this.ub = max(this.ub, b[i]);
      this.lb = min(this.lb, b[i]);
    }

    const dy_min = this.y, dy_max = dy_min + 13;
    noFill();
    stroke(COLOR0);
    for (let i=1; i<b.length && i < this.w; i++) {
      const idx0 = parseInt(map(i-1, 0, this.w-1, 0, b.length-1));
      const idx1 = parseInt(map(i  , 0, this.w-1, 0, b.length-1));
      const samp0 = b[idx0], samp1 = b[idx1];
      const dy0 = map(samp0, this.lb, this.ub, dy_max, dy_min);
      const dy1 = map(samp1, this.lb, this.ub, dy_max, dy_min);
      const dx0 = i-1+ this.x;
      const dx1 = i  + this.x;
      line(dx0, dy0, dx1, dy1);
    }
    stroke(32);
    rect(this.x, dy_min, this.w, dy_max-dy_min);

    pop();
  }
}

// for manually recording a small segment of sound & testing
// model uses 25ms width and 10ms delta
class RecorderViz {
  constructor() {
    this.Clear();
    this.graph = createGraphics(500, 32);
    this.is_recording = false;
    this.x = 16;
    this.y = 80;
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
    this.is_recording = true;
    this.buffer = [];
    this.start_record_ms = millis();
    this.window_offset = 0;
  }

  myMap(x) {
    let ret = map(Math.log(x+1), 0, 20, 0, 1);
    ret = constrain(ret, 0, 1);
    return ret;
  }

  StopRecording() {
    this.is_recording = false;
    this.duration_ms = millis() - this.start_record_ms;
    
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

  AddSpectrumIfRecording(fft) {
    if (!this.is_recording) return;
    this.buffer.push(fft);
  }

  Render() {
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

    text(txt, this.x, this.y);

    if (!this.is_recording) {
      fill(122);
      text("Not recording", this.x + dx, this.y);
    } else {
      fill("#F88");
      this.duration_ms = millis() - this.start_record_ms;
      text("Recording", this.x + dx, this.y);
    }

    noFill();
    stroke(32);
    const h = this.graph.height;
    let dy = this.y + 15;
    const w = this.buffer.length;
    if (!this.is_recording)
      image(this.graph, this.x, dy);
    noFill();
    stroke(32);
    rect(this.x, dy, w, h);

    pop();

    // Also, submit recog task
    if (g_worker != undefined) {
      if (this.window_width + this.window_offset <= this.buffer.length) {
        if (g_worker) {
          let ffts = this.buffer.slice(this.window_offset, 
                                       this.window_offset + this.window_width);
          if (ffts.length > 0) {
            g_worker.postMessage({
              "tag": "Predict",
              "ffts": ffts
            });
          }
        } else {
          console.log("Should do non-worker version here.");
        }
        this.window_offset += this.window_delta;
      }
    }
  }
}

class Button {
  constructor(txt) {
    this.pos = new p5.Vector(32, 280);
    this.w = 50;
    this.h = 50;
    this.is_enabled = true;
    this.is_hovered = false;
    this.is_pressed = false;
    this.clicked = function() {}
    this.released = function() {}
    this.txt = txt;
  }
  Render() {
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

    const x = this.pos.x, y = this.pos.y, w = this.w, h = this.h;
    if (!this.is_enabled) {
      line(x, y, x+w, y+h); line(x+w, y, x, y+h);
    }

    rect(x, y, w, h);
    fill(c);
    textSize(h / 3);
    textAlign(CENTER, CENTER);
    noStroke();
    text(this.txt, x+w/2, y+h/2);
    pop();
  }
  Hover(mx, my) {
    if (!this.is_enabled) return;
    if (mx >= this.pos.x          && my >= this.pos.y &&
        mx <= this.pos.x + this.w && my <= this.pos.y + this.h) {
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

class PathfinderViz {
  constructor() {
    this.x = 16;
    this.y = 140;

    this.py2idx = {};

    this.predict_time = 0;
    this.decode_time = 0;
  }

  SetResult(res, pred_time, dec_time) {
    this.result = res;
    this.predict_time = pred_time;
    this.decode_time = dec_time;
  }

  Render() {
    const TEXT_SIZE = 15;
    push();
    noStroke();
    fill(32);
    textAlign(LEFT, TOP);

    //text("Result panel", this.x, this.y);
    fill(128);
    if (g_tfjs_version == undefined) {

    }
    text(g_tfjs_version, this.x, this.y);
    
    fill(32);
    if (this.result != undefined) {
      text("Result: " + this.result, this.x, this.y + TEXT_SIZE);
      text("Predict time: " + this.predict_time + " ms", this.x, this.y + TEXT_SIZE*2);
      text("Decode time: " + this.decode_time + " ms", this.x, this.y + TEXT_SIZE*3);
    }

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

var g_loudness_vis, g_fft_vis;
var g_recording = false;
//var g_rec_mfcc = [];
//var graph_rec_mfcc;
var graph_mfcc0, graph_diff;

var soundReady = true;

var normalized = [];
var currentPrediction = "";
var rotation = 0.0;

let g_frame_count = 0;
let g_last_draw_ms = 0;
let g_input_audio_stats_viz = new AudioStatsViz();
let g_downsp_audio_stats_viz = new AudioStatsViz();

let temp0, temp1;
let temp0array;
let g_textarea;
let g_audio;

let g_audio_file_input;
let g_audio_elt;

let g_buttons = [];

function OnPredictionResult(res) {
  const d = res.data;
  console.log(d.Decoded);
  g_pathfinder_viz.SetResult(d.Decoded, d.PredictionTime, d.DecodeTime);
  OnNewPinyins(d.Decoded.split(" "));
}

async function setup() {
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
  frameRate(30);

  graph_diff = createGraphics(512, 512);
  g_loudness_vis = new LoudnessVis();
  g_fft_vis = new FFTVis();

  g_textarea = createElement("textarea", "");
  g_textarea.size(320, 50);
  g_textarea.position(32, STATUS_Y + 100)
  g_textarea.hide();

  g_downsp_audio_stats_viz.x = 110;

  // REC button
  g_btn_rec = new Button("REC");
  g_btn_rec.w = 220;
  g_btn_rec.h = 100;
  g_btn_rec.pos.x = W0/2 - g_btn_rec.w/2;
  g_btn_rec.pos.y = H0 - g_btn_rec.h - 12;
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

  g_btn_mic.pos.x = 16;
  g_btn_mic.pos.y = 16;
  g_btn_mic.clicked = function() {
    SetupMicrophoneInput(512);
    g_btn_mic.is_enabled = false; g_btn_file.is_enabled = false;
    g_btn_rec.is_enabled = true;
  }
  g_btn_file.pos.x = 80;
  g_btn_file.pos.y = 16;
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
  g_btn_load_model.pos.x = 280;
  g_btn_load_model.pos.y = 16;
  g_btn_load_model.clicked = async function() {
    g_model = await LoadModel();
    g_btn_predict.is_enabled = true;
    g_btn_load_model.is_enabled = false;
  }

  g_btn_predict.w = 50;
  g_btn_predict.pos.x = 360;
  g_btn_predict.pos.y = 16;
  g_btn_predict.is_enabled = false;
  g_btn_predict.clicked = async function() {
    if (g_worker) {
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
  g_buttons.push(g_btn_predict);

  // Demo data.
  let g_btn_demo_data = new Button("Demo\nData");
  g_btn_demo_data.w = 60;
  g_btn_demo_data.pos.x = 148;
  g_btn_demo_data.pos.y = 16;
  g_btn_demo_data.clicked = function() {
    g_recorderviz.buffer = TESTDATA;
    g_recorderviz.StopRecording();
  }
  g_buttons.push(g_btn_demo_data);

  let btn_next = new Button(">");
  btn_next.pos.x = 440;
  btn_next.w = 34;
  btn_next.h = 100;
  btn_next.pos.y = 500;
  btn_next.clicked = function() {
    LoadNextDataset();
  }
  g_buttons.push(btn_next);

  let btn_prev = new Button("<");
  btn_prev.pos.x = 440;
  btn_prev.w = 34;
  btn_prev.h = 100;
  btn_prev.pos.y = 390;
  btn_prev.clicked = function() {
    LoadPrevDataset();
  }
  g_buttons.push(btn_prev);

  let btn_reset = new Button("R");
  btn_reset.pos.x = 440;
  btn_reset.pos.y = 610;
  btn_reset.w = 34;
  btn_reset.h = 50;
  btn_reset.clicked = function() {
    g_aligner.Reset();
  }
  g_buttons.push(btn_reset);

  SetupReadAlong();
}

function draw() {
  let delta_ms = 0;
  const ms = millis();
  if (g_frame_count == 0) {
    g_recorderviz = new RecorderViz();
    g_pathfinder_viz = new PathfinderViz();
  } else {
    delta_ms = (ms - g_last_draw_ms);
  }

  background(255);
  textSize(12);
  push();

  scale(g_scale);

  if (soundReady) {
    fill(0);
    noStroke();

    //g_loudness_vis.Render(loudness.total);
    g_fft_vis.Render();
    textAlign(LEFT, TOP);
    if (g_recording) {
      fill(0, 0, 255);
      noStroke();
      text("REC " + g_rec_mfcc.length, 16, 16);
    }
    
    g_input_audio_stats_viz.Render();
    g_downsp_audio_stats_viz.Render();
    g_recorderviz.Render();
    g_pathfinder_viz.Render();
  }

  const mx = g_pointer_x / g_scale, my = g_pointer_y / g_scale;
  noFill();
  stroke(32);
  const l = 10 / g_scale;
  line(mx - l, my, mx + l, my);
  line(mx, my - l, mx, my + l);

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

  // 触摸单独在这里另外处理


  g_buttons.forEach((b) => {
    b.Render();
  })

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