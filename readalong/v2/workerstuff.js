class MyWorkerWrapper {
  constructor() {
    this.worker = undefined; // 包含了TFJS与CTC解码器的Web Worker
    this.model = undefined;  // 直接在主线程中执行的TFJS Model
    this.is_tfjs_webworker = true;
  }

  LogMessage(msg) {
    Hello.AddLogEntry(msg);
  }

  IncrementInFlightCount() {
    Hello.num_in_flight ++;
  }

  DecrementInFlightCount() {
    Hello.num_in_flight --;
    if (Hello.num_in_flight < 1) {
      g_aligner.OnAllPredictionsDone();
      Hello.is_recording = false;
      if (Hello.continuous_prediction_state == "draining")
        Hello.continuous_prediction_state = "not_started";
    }
  }

  /**
 * 尝试初始化TFJS模型，优先顺序如下
 * 1. WebWorker + WebGL
 * 2. 主线程 + WebGL
 * 3. 主线程 + CPU
 * 
 * 无论是否在Web Worker中执行TFJS，都是会在Web Worker中执行CTC Decoding步骤的。
 * 
 * @param {*} non_worker 是否强制不在Web Worker中使用TFJS。
 */
  InitializeMyWorker(non_worker = false) {
    if (non_worker) {
      this.do_LoadModelNonWorker();
      return;
    }
    this.worker = new Worker("myworker.js");
    this.worker.postMessage("Hey");
    this.LogMessage("尝试在WebWorker中装入TFJS");
    // 状态转换：先是undefined，再是选用了某个后端
    this.worker.onmessage = ((event) => {
      if (event.data.TfjsVersion) {
        const be = event.data.TfjsBackend;
        console.log(be)
        switch(be) {
          case "cpu":
            this.LogMessage("似乎WebWorker只支持启用TFJS CPU后端，所以尝试在主线程中启用WebGL后端，Worker只留作解码之用。");
            this.is_tfjs_webworker = false;
            setTimeout(()=>{
              this.worker.postMessage({
                "tag": "dispose",
              });
              this.do_LoadModelNonWorker();
            }, 1000);
            break;
          case undefined:
            this.LogMessage("假定WebGL后端可用，将要预热模型。");
            this.worker.postMessage({
              "tag": "LoadModel"
            });
            break;
          case "webgl":
            this.LogMessage("WebGL后端着实可用，已启用WebGL后端。")
            Hello.tfjs_init_done = true;
            break;
        }
      } else if (event.data.message) {
        if (event.data.message == "preheat_complete") {
          this.LogMessage("预热完成");
          Hello.tfjs_init_done = true;
        }
      } else {
        this.OnPredictionResult(event);
      }
    });
  }

  async do_LoadModelNonWorker() {
    this.LogMessage("尝试在主线程中装入TFJS");
    this.model = await tf.loadLayersModel("model/model.json");
    const N = 400;
    let tb = tf.buffer([1, N, 200, 1]);
    await this.model.predictOnBatch(tb.toTensor());

    const be = tf.getBackend();
    if (be == "webgl") {
      this.LogMessage("在主线程中启用了WebGL");
    }
    Hello.tfjs_init_done = true;
  }

  /**
   * @param {*} ffts FFTs，长度不限，但一般是100个FFT
   * 注意：该函数可能异步完成
   */
  async Predict(timestamp, serial, ffts) {
    this.IncrementInFlightCount();
    if (this.is_tfjs_webworker) {
      this.worker.postMessage({
        "timestamp": timestamp,
        "serial": serial,
        "ffts": ffts,
        "tag": "Predict",
      })
    } else {
      let temp0 = await this.do_PredictNonWorker(ffts);

      let temp0array = [];
      const T = temp0.shape[1];
      const S = temp0.shape[2];
      let src = temp0.slice([0, 0, 0], [1, T, S]).dataSync();
      for (let t=0; t<T; t++) {
        let line = [];
        let idx0 = S * t;
        for (let s=0; s<S; s++) {
          let value = src[s + idx0];

          //if (g_weight_mask != undefined) {
          //  value = value * g_weight_mask[s];
          //}

          line.push(value);
        }
        temp0array.push(line);
      }

      this.worker.postMessage({
        "timestamp": timestamp,
        "tag": "decode",
        "S": temp0.shape[2],
        "temp0array": temp0array,
        "serial": serial,
      });
    }
  }

  async do_PredictNonWorker(ffts) {
    const N = ffts.length;
    let tb = tf.buffer([1, N, 200, 1]);
    for (let i=0; i<N; i++) {
      for (let j=0; j<200; j++) {
        tb.set(ScaleFFTDataPoint(ffts[i][j]), 0, i, j, 0);  // Floating point to int16
      }
    }
    return await this.model.predictOnBatch(tb.toTensor());
  }

  OnPredictionResult(res) {
    this.DecrementInFlightCount();
    this.LogMessage(res.data.Decoded + ", " + res.data.DecodeTime);
    g_aligner.OnPredictionResult(res.data);
  }
}

function ScaleFFTDataPoint(x) {
  let ret = Math.     log(x + 1);
  if (ret < 0) ret = 0;
  return ret;
}