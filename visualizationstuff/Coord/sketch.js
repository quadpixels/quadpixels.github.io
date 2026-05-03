var g_rot_y = 0;
var g_rot_x = 0;
var g_rot_z = 0;
var g_zoom = 10;
var omega_z = 0;//10.0 * 3.14159 / 180.0; // 每秒转10度

// Y = x^a0 + x * a1 + a2
var g_a0 = 1, g_a1 = 0, g_a2 = 0

// 开始秒数 结束秒数 次方始 次方终 系数始 系数终 常数始 常数终
var AnimationSequence = [
  [0,       2,      1,     1,     0,     0,     0,     0],
  [2,       7,      1,     2,     0,     0,     0,     0],
  [7,      10,      2,     2,     0,     0,     0,     0],
  [10,     15,      2,     2,     0,     1,     0,     0],
  [15,     18,      2,     2,     1,     1,     0,     0],
  [18,     23,      2,     2,     1,     1,     0,     1],
  [23,     25,      2,     2,     1,     1,     1,     1],
]
var g_anim_index = 0
var g_anim_start_sec = 0

var g_rt = undefined; // Rendertarget

const W = 720, H = 720;

function setup() {
  createCanvas(W, H);
  g_rt = createGraphics(W, H, WEBGL)
  textSize(height / 40);
  frameRate(30);
}

function GetAngle(a) { // 极角
  if (a[1] == 0) {
    if (a[0] > 0) return 0;
    else return 3.1415926;
  }
  let len = GetLen(a)
  let omega = Math.acos(a[0] / len)
  if (a[1] < 0) omega = 2 * 3.1415926 - omega
  return omega
}
function GetLen(a) {
  let len = Math.sqrt(a[0]*a[0] + a[1]*a[1]);
  return len
}
function PowerImag(a, exponent) {
  let len = GetLen(a), omega = GetAngle(a)
  len = Math.exp(Math.log(len) * exponent)
  omega = omega * exponent
  return [len * Math.cos(omega), len * Math.sin(omega)]
}

function MultImag(a, b) {
  let re = a[0] * b[0] - a[1] * b[1]
  let im = a[0] * b[1] + a[1] * b[0]
  return [re, im]
}
function ScaleImag(a, b) {
  return [a[0]*b, a[1]*b]
}
function AddImag(a, b) {
  return [a[0] + b[0], a[1] + b[1]]
}

function F(x) {
  let xx = PowerImag(x, g_a0)
  let xx_plus_x = AddImag(xx, ScaleImag(x, g_a1))
  let ret = AddImag(xx_plus_x, [g_a2, 0])
  return ret;
}

var last_sec = 0;
function draw() {
  background(32);
  let sec = millis() / 1000.0;
  let delta_s = sec - last_sec;
  last_sec = sec;
  
  // 更新动画系统
  let anim_elapsed = sec - g_anim_start_sec;
  while (g_anim_index < AnimationSequence.length &&
        anim_elapsed > AnimationSequence[g_anim_index][1]) { 
    g_anim_index ++; 
    console.log("Anim Index=" + g_anim_index)
  }
  if (g_anim_index >= AnimationSequence.length) {
    g_anim_index = 0; g_anim_start_sec = sec;
    anim_elapsed = 0;
  }
  let entry = AnimationSequence[g_anim_index];
  g_a0 = map(anim_elapsed, entry[0], entry[1], entry[2], entry[3], true);
  g_a1 = map(anim_elapsed, entry[0], entry[1], entry[4], entry[5], true);
  g_a2 = map(anim_elapsed, entry[0], entry[1], entry[6], entry[7], true);
  
  g_rot_z += delta_s * omega_z;
  
  g_rt.clear();
  g_rt.camera();
  
  g_rt.scale(g_zoom, -g_zoom, g_zoom); // Processing里的Y轴是反着的。
  g_rt.noFill();
  const EPS = 1e-3;
  // 画坐标轴
  const X0 = -10, X1 = 10, Y0 = -10, Y1 = 10, STEP = 0.5
  
  g_rt.stroke(64);
  g_rt.beginShape(LINES)
  for (let x=X0; x<=X1; x+=STEP) {
    for (let y=Y0; y<=Y1; y+=STEP) {
      let x11 = [x, y], x01 = [x-STEP, y], x10 = [x, y-STEP]
      let f11 = F(x11), f01 = F(x01), f10 = F(x10)
      if (y > Y0 && Math.abs(x) > EPS) {
        g_rt.vertex(f11[0], f11[1], 0)
        g_rt.vertex(f10[0], f10[1], 0)
      }
      if (x > X0 && Math.abs(y) > EPS) {
        g_rt.vertex(f11[0], f11[1], 0)
        g_rt.vertex(f01[0], f01[1], 0)
      }
    }
  }
  g_rt.endShape()
  
  //画坐标轴 - X轴
  g_rt.stroke(255, 0, 0)
  g_rt.beginShape(LINES)
  for (let x=X0+STEP; x<=X1; x+=STEP) {
    let x1 = [x,0], x0=[x-STEP,0]
    let f1 = F(x1), f0=F(x0)
    g_rt.vertex(f1[0], f1[1], 0);
    g_rt.vertex(f0[0], f0[1], 0);
  }
  g_rt.endShape()
  
  // 画坐标轴 - Y轴
  g_rt.stroke(0, 255, 0)
  g_rt.beginShape(LINES)
  for (let y=Y0+STEP; y<=Y1; y+=STEP) {
    let y1 = [0, y], y0=[0, y-STEP]
    let f1 = F(y1), f0=F(y0)
    g_rt.vertex(f1[0], f1[1], 0);
    g_rt.vertex(f0[0], f0[1], 0);
  }
  g_rt.endShape()
  
  image(g_rt, 0, 0, W, H)
  
  // 状态表示
  textAlign(CENTER, TOP);
  let txt = "y = x^" + g_a0.toFixed(2) + " + x*" + g_a1.toFixed(2) + " + " + g_a2.toFixed(2);
  noStroke();
  fill(192);
  text(txt, width/2, 0)
}
  