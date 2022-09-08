var root = document.body;
var g_canvas = document.createElement("canvas", "g_canvas");
var g_myworker_wrapper = new MyWorkerWrapper();

var g_aligner = new Aligner();

var Splash = {
  view: function() {
    return m("a", {href:"#!/hello"}, "Enter!")
  }
}

function GetAudioContextState(x) {
  let ret = "Sample rate: " + x.sampleRate + " Hz<br/>";
  ret = ret + "currentTime: " + x.currentTime + "<br/>";
  return ret;
}

var Hello = {
  count: 0,
  debug: false,
  frame_count: 0,
  state: "Not clicked",
  log_entries: [],
  num_in_flight: 0,
  tfjs_init_done: false,
  continuous_prediction: false,
  continuous_prediction_state: "not_started",
  views: function() {
    ret = [];

    if (this.tfjs_init_done == true) {
      ret.push(
        m("input", {
          class: "button1",
          type: "submit",
          value: this.num_in_flight > 0 ? "等待识别("+ this.num_in_flight + ")" : "按键录音",
          "onpointerdown": ()=>{ Hello.OnMouseDown(); },
          "onpointerup": ()=>{ Hello.OnMouseUp(); },
          disabled: this.num_in_flight > 0,
        })
      );
      ret.push(
        m("input", {
          class: "button1",
          type: "submit",
          value: this.debug ? "关闭debug" : "开启debug",
          "onpointerdown": ()=>{ this.debug = !this.debug; Hello.SetDebug(this.debug); }
        })
      );
      ret.push(
        m("input", {
          class: "button1",
          type: "submit",
          value: "题目一",
          "onpointerdown": ()=>{
            g_aligner.LoadSampleData();
          }
        })
      );
      ret.push(
        m("input", {
          class: "button1",
          type: "submit",
          value: "题目二",
          "onpointerdown": ()=>{
            g_aligner.LoadData([
              ["中庭地白树栖鸦", "中庭地白树栖鸦", "zhong ting di bai shu qi ya"],
              ["冷露无声湿桂花", "冷露无声湿桂花", "leng lu wu sheng shi gui hua"],
              ["今夜月明人尽望", "今夜月明人尽望", "jin ye yue ming ren jin wang"],
              ["不知秋思落谁家", "不知秋思落谁家", "bu zhi qiu si luo shei jia"],
            ],
            "十五夜望月"
            );
          }
        })
      );
    } else {
      ret.push(
        m("div", 
          "正在装入tfjs"
        )
      );
    }

    if (this.debug) {
      ret.push(m("div", "frame " + this.frame_count));
      //ret.push(m("div", "g_record_buffer_orig.length=" + g_record_buffer_orig.length));
      //ret.push(m("div", "g_record_buffer_16khz.length=" + g_record_buffer_16khz.length));
      ret.push(m("div", "g_fft_buffer.length=" + g_fft_buffer.length));
      ret.push(m("div", "g_fft_buffer_idx=" + g_fft_buffer_idx));
      ret.push(m("div", this.num_in_flight + " in-flight reqs"));

      const num_shown = 20;
      for (let i=0; i<num_shown; i++) {
        let idx = this.log_entries.length - num_shown + i;
        if (idx >= 0 && idx < this.log_entries.length) {
          ret.push(m("div", {}, this.log_entries[idx]));
        }
      };
    }

    return ret;
  },
  view: function() {
    return m("main",
      this.views()
    )
  },
  OnMouseDown: function() {
    this.count++
    ClearRecordBuffer();
    g_aligner.OnStartRecording();
    if (Hello.continuous_prediction) {
      Hello.continuous_prediction_state = "started";
    }
    g_processor.port.postMessage({ recording: true });
  },
  OnMouseUp: function() {
    PredictCurrentBuffer(g_fft_buffer_idx);
    g_processor.port.postMessage({ recording: false });
    if (Hello.continuous_prediction_state == "started") {
      if (Hello.num_in_flight > 0)
        Hello.continuous_prediction_state = "draining";
      else
        Hello.continuous_prediction_state = "not_started";
    }
  },
  AddLogEntry: function(entry) {
    this.log_entries.push(entry);
  },
  SetDebug: function(x) {
    this.debug = x;
    let d = document.querySelector("#debug_panel");
    if (x) {
      d.style.display = "block";
    } else {
      d.style.display = "none";
    }
  }
}

m.mount(document.body,
  {
    view:() => [
      m("div",
        { style:"text-align:center" },
        [
          m(g_aligner),
          m(Hello),
        ]
      )
    ]
  }
)

function ClearRecordBuffer() {
  g_record_buffer_16khz = [];
  g_record_buffer_orig = [];
  g_fft_buffer = [];
  g_aligner.Clear();
}

const window_width = 100;
const window_delta = 25;
function PredictCurrentBuffer(start_idx) {
  Hello.AddLogEntry("PredictCurrentBuffer [" + start_idx.toString() +
    + ", " + g_fft_buffer.length);
  // 把所有当前存着的FFT都丢进预测器
  for (let i=start_idx; i<g_fft_buffer.length; i+=window_delta) {
    let ffts = g_fft_buffer.slice(i, i+window_width);
    let gap = window_width - ffts.length;
    if (gap < 50) {
      ffts = PadZero(ffts, window_width);
      let ts = i * (1.0 / 16000);
      g_myworker_wrapper.Predict(ts, i, ffts);
    }
  }
}

function IncrementallyPredict() {
  if (g_fft_buffer.length - g_fft_buffer_idx >= window_width) {
    let ffts = g_fft_buffer.slice(g_fft_buffer_idx,
      g_fft_buffer_idx + window_width);
    let gap = window_width - ffts.length;
    if (gap < 50) {
      ffts = PadZero(ffts, window_width);
      let ts = g_fft_buffer_idx * (1.0 / 16000);
      g_myworker_wrapper.Predict(ts, g_fft_buffer_idx, ffts);
      g_fft_buffer_idx += window_delta;
    }
  }
}

let g_prev_timestamp = 0;
function step(timestamp) {
  if (true) {
    let ts = millis();
    //console.log(ts + " " + timestamp + " " + (ts-g_prev_timestamp))
    if (ts - g_prev_timestamp > 50) {
      g_prev_timestamp = ts;
      Hello.frame_count ++;
      m.redraw();

      if (Hello.continuous_prediction_state == "started" ||
          Hello.continuous_prediction_state == "draining") {
        IncrementallyPredict();
      }
    }
  }
  window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);

document.body.appendChild(g_canvas)

// ======================================

window.onload = async () => {
  Hello.AddLogEntry("window.onload");
  await InitializeAudioRecorder();
  g_myworker_wrapper.InitializeMyWorker();
  SelectRecordDevice(document.querySelector("#micSelect").value) 

  document.querySelector("#SelectRecordDevice").addEventListener("pointerdown",
    ()=>{
      SelectRecordDevice(document.querySelector("#micSelect").value) 
    }
  );

  document.querySelector("#test2").addEventListener("pointerdown",
    ()=>{
      g_processor.port.postMessage({ recording:false });
    }
  )

  document.querySelector("#test3").addEventListener("pointerdown",
    ()=>{
      g_processor.port.postMessage({ recording:true  });
    }
  )

  document.querySelector("#test4").addEventListener("pointerdown",
    ()=>{
      let audio_url = WriteWAVFileToBlob(g_record_buffer_orig, g_context.sampleRate);
      let a = document.querySelector("#audio_orig");
      let d = document.querySelector("#download_orig");
      a.setAttribute("src", audio_url);
      d.setAttribute("href", audio_url);
      d.download = "output_orig.wav";

      audio_url = WriteWAVFileToBlob(g_record_buffer_16khz, 16000);
      a = document.querySelector("#audio_16khz");
      d = document.querySelector("#download_16khz");
      a.setAttribute("src", audio_url);
      d.setAttribute("href", audio_url);
      d.download = "output_16khz.wav";
    }
  );

  document.querySelector("#ClearButton").addEventListener("pointerdown",
    ()=>{
      g_record_buffer_16khz = [];
      g_record_buffer_orig = [];
      g_fft_buffer = [];
      g_aligner.Clear();

      if (Hello != undefined)
        Hello.log_entries = [];
    }
  );

  document.querySelector("#LoadTfjs").addEventListener("pointerdown",
    ()=>{
      g_myworker_wrapper.InitializeMyWorker();
    }
  )

  document.querySelector("#DoPredictButton").addEventListener("pointerdown",
    ()=>{
      PredictCurrentBuffer(0);
    }
  )

  Hello.SetDebug(false);
}

function PadZero(ffts, len) {
  while (ffts.length < len) {
    let zeroes = [];
    for (let i=0; i<200; i++) { zeroes.push(0); }
    ffts.push(zeroes);
  }
  return ffts;
}

window.addEventListener('keydown', function(event) {
  if (event.keyCode == 37) {  // left arrow
    g_aligner.do_PrevStep();
  } else if (event.keyCode == 39) { // Right arrow
    g_aligner.do_NextStep();
  }
})