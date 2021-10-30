function SetupMicrophoneInput(bufferSize) {
  if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
    window.AudioContext = webkitAudioContext;
  }

  if (navigator.hasOwnProperty('webkitGetUserMedia') && !navigator.hasOwnProperty('getUserMedia')) {
    navigator.getUserMedia = webkitGetUserMedia;
  }

  // Q: Cannot change sample rate in Firefox
  let context = new AudioContext();

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
      window.mediaStream = mediaStream;
      var source = context.createMediaStreamSource(window.mediaStream);
      let m = await context.audioWorklet.addModule('myprocessor.js');
      let processor = await CreateMyProcessor(context);
      source.connect(processor);
    };

    try {
      g_
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
async function CreateMyProcessor(ctx) {
  const myProcessor = new AudioWorkletNode(ctx, 'myprocessor');
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

// Load model
async function LoadModel() {
  if (window.Worker) {
    console.log("Web worker support detected.");
    g_worker = new Worker("myworker.js");
    g_worker.postMessage("Hey!");
    g_tfjs_version = "Initializing model in WebWorker";
    g_worker.onmessage = ((event) => {
      if (event.data.TfjsVersion) {
        g_tfjs_version = event.data.TfjsVersion
      } else {
        OnPredictionResult(event);
      }
    });
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

