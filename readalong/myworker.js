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

  const N = 400;
  let tb = tf.buffer([1, N, 200, 1]);
  await model.predictOnBatch(tb.toTensor());
  const ms2 = millis();
  console.log("[Worker] Model preheat took " + (ms2-ms1) + " ms");

  postMessage({
    "TfjsVersion": "tfjs " + tf.version.tfjs + "(" + tf.getBackend() + ") [WebWorker]"}
  );
  g_model = model;
}

function ScaleFFTDataPoint(x) {
  let ret = Math.log(x + 1);
  if (ret < 0) ret = 0;
  return ret;
}

LoadModel();

onmessage = async function(event) {
  console.dir(event);
  if (event.data.tag == "Predict") {
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

    // Decode
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

    this.postMessage({
      "PredictionTime": (ms1-ms0),
      "DecodeTime": (ms2-ms1),
      "Serial": event.serial,
      "Decoded": out
    });
  }
}