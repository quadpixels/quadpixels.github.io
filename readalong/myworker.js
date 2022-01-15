importScripts("./tf.min.js");
importScripts("./ctc.js");
importScripts("./pinyin_list.js");

let g_millis0 = 0;
function millis() {
  if (g_millis0 == 0) {
    g_millis0 = new Date().getTime();
  }
  return new Date().getTime() - g_millis0;
}

let g_model;

async function LoadModel() {
  console.log("[Worker] Loading model");
  const ms0 = millis();
  const model = await tf.loadLayersModel("model/model.json");
  const ms1 = millis();
  console.log("[Worker] Model loading took " + (ms1-ms0) + " ms")

  postMessage({
    "TfjsVersion": "tfjs " + tf.version.tfjs + "(" + tf.getBackend() + ") [WebWorker]",
    "TfjsBackend": tf.getBackend(),
    "Loaded": true
  });

  g_model = model;
}

async function PreheatModel() {
  const N = 400;
  let tb = tf.buffer([1, N, 200, 1]);
  await g_model.predictOnBatch(tb.toTensor());
  const ms2 = millis();
  console.log("[Worker] Model preheat took " + (ms2-ms1) + " ms");

  postMessage({
    "message": "preheat_complete"
  })
}

function ScaleFFTDataPoint(x) {
  let ret = Math.log(x + 1);
  if (ret < 0) ret = 0;
  return ret;
}

function Init() {
  console.log("[Worker] Init");
  postMessage({
    "TfjsVersion": "tfjs " + tf.version.tfjs + "(" + tf.getBackend() + ") [WebWorker]",
    "TfjsBackend": tf.getBackend()
  });
}

Init();

let weight_mask = undefined;
let g_frameskip = 0;

onmessage = async function(event) {
  if (event.data.tag == "LoadModel") {
    console.log("[myworker] LoadModel command received");
    LoadModel();
  } else if (event.data.tag == "Predict") {
    // Predict
    const ms0 = millis();
    const ffts = event.data.ffts;
    const N = ffts.length;
    let tb = tf.buffer([1, N, 200, 1]);
    for (let i=0; i<N; i++) {
      for (let j=0; j<200; j++) {
        tb.set(ScaleFFTDataPoint(ffts[i][j]), 0, i, j, 0)  // Floating point to int16
      }
    }
    const temp0 = await g_model.predictOnBatch(tb.toTensor());
    const ms1 = millis();

    // 关于T
    // Decode
    temp0array = []; // for ctc
    const T = temp0.shape[1];
    const S = temp0.shape[2];
    
    //console.log("T="+ T + ", N=" + N)
    // T=12, N=100

    let src = temp0.slice([0, 0, 0], [1, T, S]).dataSync();
    for (let t=0; t<T; t++) {
      let line = [];
      let idx0 = S * t;
      for (let s=0; s<S; s++) {
        let value = src[s + idx0];

        if (weight_mask != undefined) {
          value = value * weight_mask[s];
        }

        line.push(value);
      }
      temp0array.push(line);
    }
    let blah = Decode(temp0array, 5, S-1, g_frameskip);
    let out = ""
    blah[0].forEach((x) => {
      out = out + PINYIN_LIST[x] + " "
    });
    const ms2 = millis();

    this.postMessage({
      "PredictionTime": (ms1-ms0),
      "DecodeTime": (ms2-ms1),
      "serial": event.data.serial,
      "Decoded": out,
      "timestamp": event.data.timestamp,  // 本次预测的数据包的时间戳
      "decode_timestamp": blah[1].slice(), // 逐字时间戳
    });
  } else if (event.data.tag == "weight_mask") {
    weight_mask = event.data.weight_mask;
  } else if (event.data.tag == "frameskip") {
    g_frameskip = event.data.frameskip;
  } else if (event.data.tag == "dispose") {
    if (g_model != undefined) {
      g_model.dispose();
      g_model = undefined;
      console.log("[Worker] g_model disposed.");
    }
  } else if (event.data.tag = "decode") {
    const S = event.data.S;
    let temp0array = event.data.temp0array;
    const ms0 = millis();
    let blah = Decode(temp0array, 5, S-1, g_frameskip);
    if (blah == undefined) return;
    let out = ""
    blah[0].forEach((x) => {
      out = out + PINYIN_LIST[x] + " "
    });
    const ms1 = millis();

    this.postMessage({
      "PredictionTime": event.data.predictionTime,
      "DecodeTime": (ms1-ms0),
      "Decoded": out,
      "serial": event.data.serial,
      "timestamp": event.data.timestamp,  // 本次预测的数据包的时间戳
      "decode_timestamp": blah[1].slice(), // 逐次时间戳
    });
  }
}