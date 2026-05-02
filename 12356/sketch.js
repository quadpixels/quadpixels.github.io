// 2020-09-25
// 宫商角徵羽 vis
//

const DEBUG_CROSSHAIR = false;
const INIT_NOTE_SIZE = 10;
const INIT_NOTE_SIZE1 = 5;
let g_scale_factor = 1.0;
let g_fft;
let g_prev_waveform;

const COLOR1 = "#ed5736";
const COLOR2 = "#ffb3a7";
const COLOR3 = "#f00056";
const COLOR4 = "#9d2933";
const COLOR5 = "#331111";
const BGCOLOR = "#220000";

const TEXT_COLOR_IS_A = COLOR1;
const TEXT_COLOR_NON_A = COLOR2;

const HOVERED_FILL = "#00ff00";
const HOVERED_STROKE = "#44ff44";

const LINKED_FILL = "#80ff00";
const LINKED_STROKE = "#ccff44";

const MIDI_NOTE_RANGE = [ 48, 84 ];
//const KEY_RADIUS = 18; // 以A4为中心的半径

// Layout:
// name                variable_name
// [ pianokeys      ]  g_agg2
// [ notenumbers    ]  g_agg1
// [ scale          ]  g_agg3
// [ falling blocks ]  g_falling_blocks
// [ playkeys       ]  g_agg4
const PIANO_KEYS_Y   = 40;
const NOTE_NUMBERS_Y = 110;
const NOTE_NUMBERS_X = 220;
const SCALES_Y        = 140;
const PLAYKEYS_Y     = 660;
const FALLING_BLOCKS_Y = 400;

const POSTER_Y = 450;

let g_locale_id = 0;
let g_scene_id = 0;
let g_scene_props = {
  notenumbers_dist: 10,
  notenumbers_notesize: 5,
};
let g_prev_scene_props = {
  
};

var W0 = 400, H0 = 720;
var W  = 400, H  = 720, WW, HH;
var prevW = W, prevH = H;

function windowResized() {
  OnWindowResize();
}

function OnWindowResize() {
  if (WW != windowWidth || HH != windowHeight) {
    
    WW = windowWidth;
    HH = windowHeight;
    let ratio1 = WW * 1.0 / HH; // 432/688 = 0.6279
    let ratio0 = W0 * 1.0 / H0; // 400/720 = 0.5556
    //console.log("ratio1=" + ratio1 + ", ratio0=" + ratio0);
    if (ratio1 > ratio0) {
      H = HH;
      W = H * W0 / H0
    } else {
      W = WW;
      H = W * H0 / W0
    }
    resizeCanvas(W, H);
    
    g_scale_factor = W / W0;
    
    prevW = W; prevH = H;
  }
}

//
const DATA0 = [
  [ 9, 3 ], [ 8, 1 ], [ 7, 2 ], [ 6, 2 ], [5, 6], [ -999, 2],
  [ 7, 3 ], [ 6, 1 ], [ 5, 2 ], [ 4, 2 ], [3, 6], [ -999, 2],
  [ 3, 3 ], [ 4, 1 ], [ 3, 1 ], [ 4, 1 ], [5, 3], [6, 1], [7,2], [8,2],
  [ 9, 3 ], [ 8, 1 ], [ 7, 1 ], [ 6, 1 ], [5, 2], [6, 6], [-999, 2],
]

// https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2530502774,1086729081&fm=26&gp=0.jpg
const DATA1 = [
  [6,1], [5,1], [4,1],
  [5,2], [5,1], [4,1], [5,2], [5,1], [4,1],
  [5,1], [4,1], [3,2], [-999,1], [6,1], [5,1], [4,1],
  [5,2], [5,1], [4,1], [5,2], [5,1], [7,1],
  [6,1], [5,1], [5,2], [-999,1], [3,1], [4,1], [7,1],
  [7,2], [7,1], [6,1], [7,2], [7,1], [6,1],
  [7,1], [8,2], [7,1], [-999,1], [7,1], [7,1], [7,1],
  [6,1], [6,1], [6,1], [6,1], [6,2], [5,1], [7,2], [6,3],[-999,1],
  [6,1], [5,1], [4,1],
  [5,2], [5,1], [4,1], [5,2], [5,1], [4,1],
  [5,1], [4,1], [3,2], [-999,1], [3,1], [5,1], [7,1],
  [8,2], [8,1], [7,1], [8,2], [8,1], [7,1],
  [6,1], [5,1], [5,2], [-999,1], [6,1], [5,1], [6,1],
  [7,1], [6,1], [6,1], [5,1], [6,1], [-999,1], [5,1], [4,1],
  [6,1], [5,1], [5,1], [4,1], [5,2], [5,1], [5,1], [-999,13],
  [8,1], [8,1], [7,1], [6,1], [7,1], [4,1], [-999,1],
  [6,1], [7,1], [8,1], [7,1], [6,2], [-999,2],
  
]

// g_agg1: NoteNumbers
// g_agg2: PianoKeys
// g_agg3: Scale
// g_agg4: PlayKeys
let g_curr_scene = undefined;
function SetScene(s) {
  const SCENES = [ g_scene0, g_scene1, g_scene2 ];
  console.log("SetScene " + s);
  if (g_curr_scene != undefined) {
    g_curr_scene.TearDown();
  }
  g_scene_id = s;
  g_curr_scene = SCENES[g_scene_id];
  g_curr_scene.Init();
}

function RemoveFlanks() {
  g_agg3_flank.forEach((f) => { f.RemoveChildrenFromObjects(); });
  g_agg3_flank = [];
}

const POLYPHONY = 12; // 多少和弦数
let g_oscillators = [];
let g_osc_idx = 0;
function GetOscillator() {
  return g_oscillators[(g_osc_idx++) % POLYPHONY];
}

// 0：三分损益法 1：十二平均律法
function GetFreq(midi_note_number, method=0) {
  let semitone = midi_note_number - 69;
  if (method == 0) {
    const freq = exp(log(2)/12*semitone) * 440
    return freq;
  } else {
    let octaves = parseInt(semitone / 12);
    let rem = semitone - octaves * 12;
    const freq_A = exp(log(2)/12*(octaves*12)) * 440;
    let freq = freq_A;
    switch (rem) {
      case 0: break;
      case 1: freq = freq_A * 2187/2048; break;
      case 1: freq = freq_A * 9/8; break;
      case 2: freq = freq_A * 81/64; break;
      case 3: freq = freq_A * 1968/1630; break;
      case 4: freq = freq_A * 81/64; break;
      case 5: freq = freq_A * 1771/1311; break;
      case 6: freq = freq_A * 729/512; break;
      case 7: freq = freq_A * 3/2; break;
      case 8: freq = freq_A * 6561/4096; break;
      case 9: freq = freq_A * 27/16; break;
      case 10: freq = freq_A * 5905/3277; break;
      case 11: freq = freq_A * 243/128; break;
    }
  }
}
function PlayNote(midi_note_number) {
  const freq = GetFreq(midi_note_number);
  let o = GetOscillator();
  o.start();
  o.freq(freq*1, 0);
  o.amp(0.5, 0);
  o.amp(0, 0.5);
}

let g_drag;
class Drag {
  constructor(objs, mx, my) {
    this.objects = []
    this.start_poses = [];
  }
  Empty() {
    return (this.objects.length < 1);
  }
  // 送到这里的必须是已经可以 drag 的
  StartDrag(objs, mx, my) {
    this.start_poses = [];
    objs.forEach((o) => {
      if (o.is_non_draggable != true) {
        let inhibited;

        if (o.OnStartDrag != undefined) {
          inhibited = o.OnStartDrag();
        }
        
        //if (inhibited != true) {
          this.start_poses.push(o.pos);
          this.objects.push(o);
        //}
      }
    });
    this.start_mouse_pos = new p5.Vector(mx, my);
    console.log("Start dragging " + objs.length + " objects, " + this.objects.length + ", "  + this.start_poses.length);
  }
  EndDrag() {
    this.objects.forEach((o) => {
      if (o.OnEndDrag != undefined) {
        o.OnEndDrag();
      }
    });
    this.objects = [];
    this.start_poses = [];
  }
  Update(mx, my) {
    //console.log(this.objects.length + ", " + this.start_poses.length);
    const N = this.objects.length;
    const delta = new p5.Vector(mx, my).sub(this.start_mouse_pos);
    for (let i=0; i<N; i++) {
      let d = delta;
      const o = this.objects[i];
      if (o.drag_x_constrained == true) { d.x = 0; }
      if (o.drag_y_constrained == true) { d.y = 0; }
      this.objects[i].pos = this.start_poses[i].copy().add(delta);
    }
  }
};

let g_objects = [];
let g_agg1, g_agg2, g_agg3, g_agg4;
let g_falling_blocks;
let g_agg3_flank = [];
let g_animator;
let g_messagebox;

let g_imagebox0, g_imagebox1;
let g_image0, g_image1;
let g_strings_gadget;

function preload() {
  g_image0 = loadImage('images/xcjc_2_3_out.jpg');
  g_image1 = loadImage('images/WeChatImage_20201004220805.jpg')
}

function setup() {
  createCanvas(400, 720);
  
  g_animator = new Animator();
  
  for (let i=0; i<POLYPHONY; i++) {
    g_oscillators.push(new p5.Oscillator("sine"));
    g_oscillators[i].stop();
  }
  
  g_falling_blocks = new FallingBlocks(new p5.Vector(width/2, 420), width*0.95, FALLING_BLOCKS_Y);
  g_agg1 = new NoteNumbers(new p5.Vector(width/2, NOTE_NUMBERS_Y));
  g_agg2 = new PianoKeys(new p5.Vector(width/2+50, PIANO_KEYS_Y));
  g_agg3 = new Scale(new p5.Vector(width/2, SCALES_Y));
  g_agg4 = new PlayKeys(new p5.Vector(width/2, PLAYKEYS_Y));
  
  g_agg3.OnEndDrag = function() {
    g_agg1.AlignScaleToClosestNote(g_agg3);
  };
  
  g_drag = new Drag();
  
  // 一开始先在默认位置对齐
  g_agg1.AlignScaleToClosestNote(g_agg3);
  g_messagebox = new MessageBox(new p5.Vector(200, 140), 180, 120);
  g_messagebox.SetText("haha");
  
  g_fft = new p5.FFT();
  
  g_imagebox0 = new ImageBox(new p5.Vector(100, 450), 90, 160,
                            g_image0);
  g_imagebox1 = new ImageBox(new p5.Vector(300, 450), 90, 160,
                            g_image1);
  
  g_strings_gadget = new StringsGadget(new p5.Vector(200, 480));
  
  // 场景设定为0
  SetScene(2);
}

let g_frame_count = 0;
let g_last_millis = 0;
function draw() {
  // Update
  const ms = millis();
  let delta_ms = 0;
  if (g_frame_count > 0) {
    delta_ms = ms - g_last_millis;
  }
  g_falling_blocks.Update(delta_ms);
  g_strings_gadget.Update(delta_ms);
  g_last_millis = ms;
  g_frame_count ++;
  g_animator.Update();
  
  {
    let p = g_scene_props;
    let pp = g_prev_scene_props;
    if (pp.notenumbers_dist != p.notenumbers_dist) {
      g_agg1.SetDist(p.notenumbers_dist);
      pp.notenumbers_dist = p.notenumbers_dist;
    }
    
    if (pp.notenumbers_notesize != p.notenumbers_notesize) {
      g_agg1.SetNoteSize(p.notenumbers_notesize);
      pp.notenumbers_notesize = p.notenumbers_notesize;
    }
  }
  
  if (g_frame_count == 1 || (g_frame_count % 60 == 0)) {
    OnWindowResize();
  }
  
  // Render loop
  push();
  scale(g_scale_factor);
  background(BGCOLOR);
  
  textAlign(CENTER, CENTER);
  
  const logical_mouse_x = mouseX / g_scale_factor;
  const logical_mouse_y = mouseY / g_scale_factor;
  
  // mouse event
  for (let i=0; i<g_objects.length; i++) {
    const c = g_objects[i];
    if (c.IsMouseOver(logical_mouse_x, logical_mouse_y)) {
      if (c.is_hovered == false) {
        c.is_hovered = true;
        const m = c.midi_note_number;
        if (m != undefined) {
          g_objects.forEach((cc) => {
            if (cc.midi_note_number == m) { cc.is_linked = true; }
          });
        }
      }
    } else {
      if (c.is_hovered == true) {
        c.is_hovered = false;

        const m = c.midi_note_number;
        if (m != undefined) {
          g_objects.forEach((cc) => {
            if (cc.midi_note_number == m) { cc.is_linked = false; }
          });
        }
      }
    }
  }
  
  // Update
  g_drag.Update(logical_mouse_x, logical_mouse_y);
  g_agg3.Update();
  
  stroke(COLOR2);
  fill(COLOR4);
  g_agg1.Render();
  g_agg2.Render();
  g_agg3.Render();
  g_agg4.Render();
  g_falling_blocks.Render();
  g_imagebox0.Render();
  g_imagebox1.Render();
  g_messagebox.Render();
  g_strings_gadget.Render();
  
  stroke(160);
  fill(80);
  g_agg3_flank.forEach((x) => { x.Render(); });
  
  stroke("#0F0");
  noFill();
  const L = 5;
  line(logical_mouse_x-L, logical_mouse_y, logical_mouse_x+L, logical_mouse_y, 10);
  line(logical_mouse_x, logical_mouse_y-L, logical_mouse_x, logical_mouse_y+L, 10);
  
  pop();
  
  if (g_scene_id == 0) {
    // autocorrelation??
    let w = g_fft.waveform();
    let offset = 0;
    if (g_prev_waveform != undefined) {
      let max_dp = 0;
      let probe_len = 256;
      for (let o=0; o<w.length * 0.3; o++) { // 把w往左移这么多
        let dp = 0;
        for (let o1 = 0; o1 < probe_len; o1 ++) {
          dp += w[o1+o] * g_prev_waveform[o1];
        }
        if (dp > max_dp) {
          max_dp = dp; offset = o;
        }
      }
    }
    noFill();
    beginShape();
    stroke(192);
    const y0 = 380, y1 = 440;
    for (let i=0; i+offset<w.length; i++) {
      let x = map(i, 0, w.length-1, 0, W);
      let y = map(w[i+offset], -1, 1, y1, y0);
      vertex(x, y);
    }
    endShape();
    g_prev_waveform = w.slice(offset);
  }
}

function mousePressed() {
  let dragged = new Set([]);
  const logical_mouse_x = mouseX / g_scale_factor;
  const logical_mouse_y = mouseY / g_scale_factor;
  g_objects.forEach((c) => {
    if (c.is_hovered) {
      if (c.OnMouseClick != undefined) {
        c.OnMouseClick();
      }
      
      let subject, src;
      
      // 如果是一组的话就整组一起动。
      if (c.parent != undefined) {
        subject = c.parent;
        src = c;
      } else {
        subject = c;
      }
      
      if (!dragged.has(subject)) {
        if (subject.is_non_draggable != true) {
          let inhibited;

          if (subject.OnStartDrag != undefined) {
            inhibited = subject.OnStartDrag(src);
          }

          if (inhibited != true) {
            dragged.add(subject);
            g_drag.StartDrag([subject], logical_mouse_x, logical_mouse_y);
          }
        }
      }
    }
  });
}

function mouseReleased() {
  g_drag.EndDrag();
}

function Step() {
  switch (g_scene_id) {
    case 0: g_scene0.Step(); break;
    case 2: SetScene(0); break;
  }
}

function keyPressed() {
  if (key == '1') {
    SetScene(1);
    //g_falling_blocks.SetData(DATA1);
  } else if (key == '0') {
    g_agg1.SetDist(10);
    g_agg1.SetNoteSize(5);
    g_agg1.should_hide_non_A = true;
    
    g_agg2.Layout(1, 1);
    g_agg3.SetDist(10);
    
  } else if (key == '2') {
    g_agg1.SetDist(32);
    g_agg1.SetNoteSize(10);
    g_agg1.should_hide_non_A = false;
    
    g_agg2.Layout(3, 1);
    g_agg3.SetDist(32);
  } else if (key == 'r') {
    g_falling_blocks.Reset();
  } else if (key == ' ') {
    Step();
  }
}