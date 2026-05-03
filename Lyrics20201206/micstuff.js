let g_mic, g_fft;
let samples_history;
const HIST_LEN = 5;

function InitMicStuff() {
  g_mic = new p5.AudioIn();
  g_mic.start();
  g_fft = new p5.FFT(0, 1024);
  g_fft.setInput(g_mic);
  
  samples_history = [];
  for (let i=0; i<HIST_LEN; i++) {
    let row = [];
    for (let i=0; i<1024; i++) {
      row.push(0);
    }
    samples_history.push(row);
  }
}