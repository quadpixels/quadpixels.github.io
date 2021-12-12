function SetupMicrophoneInput(bufferSize) {
  if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
    window.AudioContext = webkitAudioContext;
  }

  if (navigator.hasOwnProperty('webkitGetUserMedia') && !navigator.hasOwnProperty('getUserMedia')) {
    navigator.getUserMedia = webkitGetUserMedia;
  }

  // Q: Cannot change sample rate in Firefox
  let context = new AudioContext();
  g_audio_context = context;
  g_pathfinder_viz.result = g_audio_context.sampleRate + " Hz"
  g_worker.postMessage({
    tag: "sampleRate",
    sampleRate: g_audio_context.sampleRate
  })

  var errorCallback = function errorCallback(err) {
    g_pathfinder_viz.result = err
    g_btn_mic.is_enabled = true;
    g_btn_file.is_enabled = true;
  };

  try {
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
    var constraints = {
      video: false,
      audio: true
    };
    var successCallback = async function successCallback(mediaStream) {
      g_media_stream = mediaStream;

      // 在Firefox中，可能会遇到这个问题：
      // Uncaught (in promise) DOMException: AudioContext.createMediaStreamSource: \
      // Connecting AudioNodes from AudioContexts with different sample-rate is \
      // currently not supported.

      var source = context.createMediaStreamSource(g_media_stream);
      let m = await context.audioWorklet.addModule('myprocessor.js');
      let processor = await CreateMyProcessor(context, { processorOptions: {sampleRate: g_audio_context.sampleRate} });
      g_my_processor = processor;
      g_audio_source = source;
      g_audio_source.connect(g_my_processor);
      if (g_push_to_talk) {
        g_audio_context.suspend();
      }
    };

    try {
      navigator.getUserMedia(constraints, successCallback, errorCallback);
    } catch (e) {
      var p = navigator.mediaDevices.getUserMedia(constraints);
      p.then(successCallback);
      p.catch(errorCallback);
    }
  } catch (e) {
    errorCallback();
  }
}

async function CreateAudioInput(the_file) {
  g_audio_elt = createElement("audio");  // p5.js-wrapped object
  g_audio_elt.attribute("controls", "")
  g_audio_elt.elt.src = URL.createObjectURL(the_file);
  g_audio_elt.position(400, 20);

  console.log(the_file);
  
  // create some audio context
  let audio_context = new AudioContext();
  let source = audio_context.createMediaElementSource(g_audio_elt.elt);
  let m = await audio_context.audioWorklet.addModule('myprocessor.js');
  const myProcessor = await CreateMyProcessor(audio_context);
  source.connect(myProcessor);
};

// Create my processor & bind events
async function CreateMyProcessor(ctx, options) {
  const myProcessor = new AudioWorkletNode(ctx, 'myprocessor', options);
  // port: https://stackoverflow.com/questions/62702721/how-to-get-microphone-volume-using-audioworklet
  myProcessor.port.onmessage = ((event) => {
    const ms = millis();
    SoundDataCallbackMyAnalyzer(event.data.buffer, event.data.downsampled, event.data.fft_frames);
    if (event.data.fft_frames) {
      event.data.fft_frames.forEach((f) => {
        const real = new Float32Array(400);
        const imag = new Float32Array(400);
        for (let i=0; i<400; i++) {
          real[i] = f[i];
        }
        
        // fft.js
        transform(real, imag);

        let spec = [];
        for (let i=0; i<400; i++) {
          const re = real[i], im = imag[i];
          const mag = Math.sqrt(re*re + im*im);
          spec.push(mag);
        }
        temp0 = f
        g_fft_vis.AddOneEntry(spec);
        g_recorderviz.AddSpectrumIfRecording(spec.slice(0, 200), ms);
      });
    }
  });
  return myProcessor;
}

// Load model, not using web worker
async function LoadModelNonWorker() {

  // Clear status bits
  g_tfjs_use_webworker = undefined;
  g_tfjs_backend = undefined;
  g_tfjs_version = undefined;

  g_tfjs_version = "Initializing model in main thread";
  console.log("Loading model");
  const ms0 = millis();
  const model = await tf.loadLayersModel("model/model.json");
  const ms1 = millis();
  console.log("Model loading took " + (ms1-ms0) + " ms")

  g_runningmode_vis.SetInfo("Backend=" + tf.getBackend() + ", pre-heating ..", 2000);

  const N = 400;
  let tb = tf.buffer([1, N, 200, 1]);
  await model.predictOnBatch(tb.toTensor());
  const ms2 = millis();
  console.log("Model preheat took " + (ms2-ms1) + " ms");

  // Update Running Mode Viz
  g_tfjs_backend = tf.getBackend();
  g_tfjs_use_webworker = false;
  g_tfjs_version = tf.version.tfjs + "(" + g_tfjs_backend + ")";

  if (g_tfjs_backend == "webgl") {
    g_runningmode_vis.SetInfo("WebGL backend initialized.", 2000);
  } else {
    g_runningmode_vis.SetInfo("No WebGL support.\nUser experience may be suboptimal.", 5000);
  }


  // 假定这时已经装入webgl后端了
  if (g_btn_mic.is_enabled == true) {
    g_btn_mic.clicked();
    setTimeout(() => {
      g_stats4nerds.Hide();
    }, 1000);
  }
  
  g_model = model;
}

// Load model
// 偏好顺序：
// 1) Web Worker 里的 WebGL后端
// 2) 主线程里的 WebGL后端
async function LoadModel() {
  if (window.Worker) {
    console.log("Web worker support detected.");
    g_worker = new Worker("myworker.js");
    g_worker.postMessage("Hey!");
    g_tfjs_version = "Initializing model in WebWorker";

    g_worker.onmessage = ((event) => {
      if (event.data.TfjsVersion) {
        g_tfjs_version = event.data.TfjsVersion;
        g_tfjs_backend = event.data.TfjsBackend;
        g_tfjs_use_webworker = true;

        if (g_tfjs_backend == "cpu") {
          g_tfjs_use_webworker = false;
          g_runningmode_vis.SetInfo("Web worker does not appear to work with WebGL backend.\nAttempting to load model without WebWorker ..");
          setTimeout(() => {
            g_worker.postMessage({
              "tag": "dispose",
            });
            g_runningmode_vis.SetInfo("Loading model without using Webworker..");
            LoadModelNonWorker();
          }, 1000);
        } else if (event.data.Loaded == undefined) {
          console.log("WebGL backend enabled for Web Worker, initializing model.")
          g_runningmode_vis.SetInfo("WebGL backend enabled for Web Worker, initializing model.");
          g_worker.postMessage({
            "tag": "LoadModel"
          })
        } else if (g_tfjs_backend == "webgl") {
          // 同时按下“Mic”按钮
          if (g_btn_mic.is_enabled == true) {
            g_btn_mic.clicked();
            setTimeout(() => {
              g_stats4nerds.Hide();
            }, 1000);
          }
        }

      } else if (event.data.message) {
        if (event.data.message == "preheat_done") {
          console.log("preheat done");
        }
      } else {
        OnPredictionResult(event);
      }
    });
    g_btn_wgt_add.is_enabled = true;
    g_btn_wgt_sub.is_enabled = true;
    g_btn_frameskip_add.is_enabled = true;
    g_btn_frameskip_sub.is_enabled = true;
  } else {
    g_tfjs_version = "Initializing model in main thread";
    console.log("Loading model");
    const ms0 = millis();
    const model = await tf.loadLayersModel("model/model.json");
    const ms1 = millis();
    console.log("Model loading took " + (ms1-ms0) + " ms")

    const N = 400;
    let tb = tf.buffer([1, N, 200, 1]);
    await model.predictOnBatch(tb.toTensor());
    const ms2 = millis();
    console.log("Model preheat took " + (ms2-ms1) + " ms");

    return model;
  }
}

class SlidingWindow {
  constructor() {
    this.events = [];
  }

  AddOneEvent(ms, weight=1) {
    this.events.push([ms, weight]);
  }

  GetCountAndTotalWeightAfter(ms) {
    const e = this.events;
    let w = 0, cnt = 0
    for (let i=e.length-1; i>=0; i--) {
      if (e[i][0] >= ms) {
        w += e[i][1];
        cnt ++;
      } else break;
    }
    return [cnt, w];
  }
  
  RemoveEventsBefore(ms) {
    const e = this.events;
    let e1 = [];
    e.forEach((t) => {
      if (t[0] >= ms) {
        e1.push(t);
      }
    })
    this.events = e1;
  }
}

function ScaleFFTDataPoint(x) {
  let ret = log(x + 1);
  if (ret < 0) ret = 0;
  return ret;
}

async function DoPrediction(ffts) {
  const N = ffts.length;
  let tb = tf.buffer([1, N, 200, 1]);
  for (let i=0; i<N; i++) {
    for (let j=0; j<200; j++) {
      tb.set(ScaleFFTDataPoint(ffts[i][j]), 0, i, j, 0)  // Floating point to int16
    }
  }
  temp1 = ffts
  return await g_model.predictOnBatch(tb.toTensor());
}

