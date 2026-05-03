// 2020-12-05

let g_scene;
let g_shapes = [];
let g_axis = [ 0, 0, 0, 0 ];
let temp0;
let g_candshapes = [];
let g_animator;
let g_xcjc, g_xcjc_sheet;
let g_xcjc_textures = []; // 四个字

let g_circle;

const TEXT_SIZE = 22;
const PAD = 24;

function LoadData(idx) {
  g_candshapes = [];
  let d = ALLDATA[idx];
  let x = 0;
  let bgcolor = "rgba(225,225,225,1)";
  let fgcolor = "rgba(0,0,0,1)";
  push();
  textSize(TEXT_SIZE);
  for (let i=0; i<d.length; i++) {
    // Width
    const entry = d[i];
    let lines = entry[0].split("\n");
    if (entry.length >= 2) { bgcolor = entry[1]; }
    if (entry.length >= 3) { fgcolor = entry[2]; }
    
    let w = 0;
    lines.forEach((l) => { w = max(w, textWidth(l)) });
    w += PAD;
    let h = PAD*2 + TEXT_SIZE * lines.length;
    
    let tex = createGraphics(w, h);
    tex.clear();
    tex.background(bgcolor);
    tex.textAlign(CENTER, CENTER);
    tex.noStroke();
    tex.fill(fgcolor);
    tex.textSize(TEXT_SIZE);
    tex.text(d[i][0], w/2, h/2);
    
    
    if (i > 0) { x += w/2; }
    
    let r = new PoRect(w/2, h/2);
    r.pos.x = x;
    r.pos.y = TEXT_SIZE * 3;
    r.SetTexture(tex);
    
    x += w/2 + PAD;
    g_candshapes.push(r);
  }
  pop();
}

function EjectCandidate() {
  if (g_candshapes.length < 1) return;
  g_animator.FinishAllPendingAnimations();
  g_animator.Update();
  let h = g_candshapes.shift();
  h.pos.x = width/2;
  h.omega = random(-0.1, 0.1);
  g_scene.shapes.push(h);
  
  if (g_candshapes.length > 0) {
    const h1 = g_candshapes[0];
    const delta_x = h1.pos.x - 0;
    for (let i=0; i<g_candshapes.length; i++) {
      let c = g_candshapes[i];
      g_animator.Animate(c, "pos", "x", [c.pos.x, c.pos.x-delta_x], [0, 1000]);
    }
  }
}

function ClearScene() {
  g_scene.LoadDefaultScene();
}

function preload() {
  g_xcjc = loadImage("images/xcjc_logo_2.png");
  g_xcjc_sheet = loadImage("images/xcjc_sheet.png");
}

function setup() {
  createCanvas(1280, 600);
  
  for (let y=0; y<512; y+=256) {
    for (let x=0; x<512; x+=256) {
      let ch = createGraphics(256, 256);
      ch.clear();
      ch.image(g_xcjc_sheet, 0, 0, ch.width, ch.height, x, y, 256, 256);
      g_xcjc_textures.push(ch);
    }
  }
  
  frameRate(60);
  g_scene = new PoScene();
  
  ClearScene();
  
  // DEBUG 用
  if (true) {
    for (let i=0; i<11; i++) {
      let x = new PoRect(random(20)+10, random(20)+10);
      x.pos = new p5.Vector((random(0.9)+0.05)*width,  (random(0.9)+0.05)*height);
      g_scene.shapes.push(x);
    }
  }
  
  for (let i=0; i<10; i++) {
    let c = new PoCircle(90);
    c.pos.x = random(width);
    c.pos.y = random(height);
    
    let r = random();
    if (r < 0.2) { c.tex = g_xcjc_textures[0]; }
    else if (r < 0.6) { c.tex = g_xcjc_textures[1]; }
    else if (r < 0.8) { c.tex = g_xcjc_textures[2]; }
    else if (r < 1) { c.tex = g_xcjc_textures[3]; }
    g_circle = c;
    g_scene.shapes.push(c);
  }
  
  g_animator = new Animator();
  InitMicStuff();
}

let g_last_millis = 0;
let g_frame_count = 0;
function draw() {
  //console.log(g_circle.v);
  const ms = millis();
  background(220);
  
  push();
  imageMode(CENTER);
  const L = min(height,width)*0.8;
  image(g_xcjc, width/2, height/2, L, L);
  pop();
  
  fill("#fff");
  stroke("#000");
  
  // Waveform
  let samples = g_fft.waveform();
  const ND = 512;
  
  let row = [];
  for (let i=0; i<1024; i++) {
    samples_history[g_frame_count % HIST_LEN][i] = samples[i];
  }
  for (let j=0; j<1024; j++) {
    let s = 0;
    for (let i=0; i<HIST_LEN; i++) {
      s += samples_history[i][j];
    }
    s /= HIST_LEN;
    row.push(s);
  }
  
  beginShape(LINES);
  
  let FFT_MULT = 6;
  for (let i=0; i<ND; i++) {
    const dx = map(i, 0, ND-1, 0, width);
    const dx1 = map(i+1, 0, ND, 0, width);
    const idx = floor(map(i, 0, ND, 0, samples.length-1));
    const idx1 = floor(map(i+1, 0, ND, 0, samples.length-1));
    const dy = height/2 + height * row[idx] * FFT_MULT;
    const dy1 = height/2 + height * row[idx1] * FFT_MULT;
    vertex(dx, dy);
    vertex(dx1, dy1);
  }
  endShape();
  
  // Demo object
  if (false) {
    temp0.theta += 0.05 * g_axis[2];
    temp0.pos.x += 2 * g_axis[0];
    temp0.pos.y += 2 * g_axis[1];
  }
  
  // Gravity
  let dt = 0;
  if (g_frame_count > 0) {
    dt = (ms - g_last_millis) / 1000.0;
    g_animator.Update();
  }  
  
  g_scene.Step(dt*5);
  g_scene.Render();
  
  // 侯选掉落; 全放最中心
  push();
  translate(width/2, 0);
  g_candshapes.forEach((r) => r.Render());
  pop();

  if (MY_DEBUG) {
    const w = temp0.ToWorldPoint(new p5.Vector(2, 30));
    circle(w.x, w.y, 5);
    const l = temp0.ToLocalPoint(new p5.Vector(mouseX, mouseY));
    const wl = temp0.ToWorldPoint(l);
    fill("#3f3");
    circle(wl.x, wl.y, 5);
    const dir = new p5.Vector(mouseX - temp0.pos.x, mouseY - temp0.pos.y).normalize();
    line(temp0.pos.x, temp0.pos.y, temp0.pos.x + dir.x*44, temp0.pos.y + dir.y*44);
    const dir_l = temp0.ToLocalDirection(dir);
    const dir_w = temp0.ToWorldDirection(dir_l);
    stroke("#3F3");
    line(temp0.pos.x, temp0.pos.y, temp0.pos.x + dir_w.x*22, temp0.pos.y + dir_w.y*22);
    let sp = temp0.FindSupportPoints(dir_w);
    fill("#f33");
    sp.forEach((s) => {
      const sw = temp0.ToWorldPoint(s);
      circle(sw.x, sw.y, 5);
    })
  }
  
  
  g_last_millis = ms;
  g_frame_count ++;
  
}

function keyPressed() {
  if (keyCode == UP_ARROW || key == 'w') { g_axis[1] = -1; }
  else if (keyCode == DOWN_ARROW || key == 's') { g_axis[1] = 1; }
  else if (keyCode == LEFT_ARROW || key == 'a') { g_axis[0] = -1; }
  else if (keyCode == RIGHT_ARROW || key == 'd') { g_axis[0] = 1; }
  else if (key == 'q') { g_axis[2] = -1; }
  else if (key == 'e') { g_axis[2] = 1; }
  else if (key == ' ') {
    if (false) {
      temp0.QueueImpulseInstant(new p5.Vector(0,11110), temp0.ToLocalPoint(new p5.Vector(mouseX, mouseY)));
    }
    
    EjectCandidate();
    
  } else if (key == '1') {
    LoadData(0);
  } else if (key == '2') {
    LoadData(1);
  } else if (key == '3') {
    LoadData(2);
  } else if (key == '4') {
    LoadData(3);
  } else if (key == '5') {
    LoadData(4);
  } else if (key == '6') {
    LoadData(5);
  } else if (key == 'c') {
    ClearScene();
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW || keyCode == DOWN_ARROW || key == 'w' || key == 's') { g_axis[1] = 0; }
  else if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW || key == 'a' || key == 'd') { g_axis[0] = 0; }
  else if (key == 'a' || key == 'z' || key == 'q' || key == 'e') { g_axis[2] = 0; }
}