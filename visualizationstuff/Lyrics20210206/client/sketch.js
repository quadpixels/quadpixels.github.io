// 2021-02-01
//
// [done] 音符功能
// [done] 加一根红线表示游戏结束的上限
// ??? 消失时的动画 
// [done] 球落地会跳起来：原因是摩擦力计算错误，已修复
// 2) 一个人玩的时候会无法扔
// 3）手臂不能超出范围
// 4）合成时的变化有点快
// 
// 又有感觉：目前的状态、自由度有点过高、合成过于容易
// 
// 如果想突出合作的话：合作的动机在于场景自己会捣乱。
// 方法一：大家都可以动，但是就让房主放
// 方法二：每次只有一个人能动
// 
// 在某些场景中触发墙壁上平移
// - 要么“轮到”显示得明显一些, 或者 自动N秒扔一下
// 加【观察模式】
// 还是有当有人离场时剩下的人会没法扔的bug
// sudden death

let socket;
let g_token;
let g_state = {
  game_title: "《合成高音符》",
  cxn_state: "未连接",
  cxn_role: "选择了游戏者身份",
  room_info: "",
  turn_info: "",
};
let g_scene = undefined;
let g_cand = undefined;

const PHYS_W = 400, PHYS_H = 720;
const DEBUG_DRAG = true;
let g_flags = [0,0,0];

// 从之前的脚本里来的
let g_btn_connect, g_btn_player, g_btn_observer;
let g_room_buttons = [];
let g_buttons = [], g_textlabels = [];
let g_skip_animation = false;

let g_hovered_block;
let g_viewport;
let g_dirty = 0;
let g_ythresh = 10;
let g_gameover_detector = undefined;

let g_paused = false;
let g_animator;
let g_ball;
let g_viewmode = 0;

let SNAPSHOT_INTERVAL = 1000; // 1000ms
let g_snapshot_interval_countdown = SNAPSHOT_INTERVAL;
let g_drag_is_release = false;
let THETA_UPDATE_INTERVAL = 100;
let g_theta_update_countdown = THETA_UPDATE_INTERVAL;

let g_scorepanel;

let g_banner_text = "";
let g_banner_countdown = 0;
let g_banner_duration = 0;
function ShowBanner(txt, ms) {
  g_banner_duration = ms;
  g_banner_countdown = ms;
  g_banner_text = txt;
}

// 侯选区
let g_thetas = [3.1415/2, 3.1415*0.75]; // 手臂的角度，顺时针旋转
const THETA_CHANGE_RATE = 3.1415 * 0.76;
// 所有人的theta的平滑过渡
let g_theta_targets = [];

let g_skin = 1; // 0：数字，1：音符
let g_image0, g_atlas;
class Atlas {
  constructor(tex) {
    this.tex = tex;
    this.cell_size = 128;
    console.log(tex)
    this.ncol = parseInt(tex.width / this.cell_size);
  }
  
  Render(idx, x, y, w, h) {
    const l = min(w, h);
    const s = this.cell_size;
    let cx = idx % this.ncol, cy = parseInt(idx / this.ncol);
    push();
    imageMode(CENTER);
    image(this.tex, x, y, l, l, cx*s, cy*s, s, s);
    pop();
  }
}

class ScorePanel {
  constructor() {
    this.x = -88;
    this.y = 80;
    this.w = 72;
    this.h = 435;
  }
  
  Render() {
    push();
    noFill();
    stroke("#333");
    rect(this.x, this.y, this.w, this.h);
    
    const PAD = 10, IMG_W = 32;
    const y0 = this.y+PAD+IMG_W/2, y1 = this.y+this.h-PAD-IMG_W/2;
    const x = this.x+3+IMG_W/2;
    imageMode(CENTER);
    textSize(18);
    noStroke();

    const occ = g_score.combine_occ;
    for (let i=1; i<10; i++) {
      stroke(COLORS[i]);
      fill(0);
      const y = map(i, 1, 9, y0, y1);
      g_atlas.Render(i, x, y, IMG_W, IMG_W);
      textAlign(RIGHT, CENTER);
      if (i < occ.length) {
        text("" + occ[i], this.x + this.w - 5, y + 3);
      }
    }

    pop();
  }
}

function preload() {
  g_image0 = loadImage("image0.png");
}

function setup() {
  createCanvas(400, 720);
  g_atlas = new Atlas(g_image0);
  g_animator = new Animator();

  // 按钮
  g_btn_connect = new PushButton(100, 20, new p5.Vector(292, 8), "连接服务器", function() {
    ConnectToServer();
  }); 
  g_buttons.push(g_btn_connect)
  
  g_btn_player = new PushButton(100, 40, new p5.Vector(108, 52), "我要玩", function() {
    g_state.cxn_role = "身份：游戏者";
    g_is_observer = false;
  });
  g_buttons.push(g_btn_player);
  g_btn_player.OnClick();
  
  g_btn_observer = new PushButton(100, 40, new p5.Vector(216, 52), "我要围观", function() {
    g_state.cxn_role = "身份：观察者";
    g_is_observer = true;
  });
  g_buttons.push(g_btn_observer);

  let tl;
  tl = new TextLabel(100, 20, new p5.Vector(8, 8), "cxn_state", 12);
  g_textlabels.push(tl);
  tl = new TextLabel(100, 20, new p5.Vector(8, 8), "turn_info", 12);
  tl.textcolor = "#333";
  g_textlabels.push(tl);
  tl = new TextLabel(100, 20, new p5.Vector(268, 8), "room_info", 12);
  tl.textcolor = "#000";
  tl.align = RIGHT;
  g_textlabels.push(tl);
  tl = new TextLabel(100, 20, new p5.Vector(8, 52), "cxn_role", 12);
  g_textlabels.push(tl);

  g_viewport = new Viewport();
  g_viewport.pos.x = PHYS_W / 2;
  g_viewport.pos.y = PHYS_H / 2;
  
  //g_cand = new PoCircle(4);
  g_ythresh = PHYS_W / 2;
  g_gameover_detector = new PoRect(PHYS_W/2, PHYS_H/8);
  g_gameover_detector.pos.y = PHYS_H/8;
  
  g_scorepanel = new ScorePanel();
  ConnectToServer();
}

if (!Array.prototype.remove) {
  Array.prototype.remove = function(val) {
    var i = this.indexOf(val);
         return i>-1 ? this.splice(i, 1) : [];
  };
}

// 更新房间列表状态
function SpawnRoomButtons(room_states) {
  const bw = 64, bh = 40, pad = 4;
  const x0 = 8, y0 = 120;
  let x = x0, y = y0;
  
  g_room_buttons.forEach((b) => g_buttons.remove(b));
  g_room_buttons = [];
  for (let i=0; i<room_states.length; i++) {
    const rs = room_states[i];
    let b;
    if (rs == "vacant") {
      b = new PushButton(bw, bh, new p5.Vector(x, y), ""+(i+1), ()=>{
        if (g_is_observer) {
        } else {
          CreateNewGame(i);
        }
      });
    } else {
      b = new PushButton(bw, bh, new p5.Vector(x, y), ""+(i+1), ()=>{
        if (g_is_observer) {
          JoinRoomAsObserver(i);
        } else {
          JoinRoom(i);
        }
      });
      b.bgcolor = "rgba(128,225,128,1)";
    }
    g_room_buttons.push(b);
    g_buttons.push(b);
    
    x += bw + pad;
    if (x > width - bw - pad) { x = x0; y += pad + bh; }
  }
}

function HideRoomButtons() {
  g_room_buttons.forEach((b) => g_buttons.remove(b));
  g_room_buttons = [];
  g_btn_connect.is_active = false;
  g_btn_player.is_active = false;
  g_btn_observer.is_active = false;
  g_state.cxn_role = "";
}

function Draw2DTorus(x, y, r0, r1, theta0, theta1) {
  if (theta0 > theta1) return;
  const STEP = 3;
  // 外圈
  const l1 = r1 * (theta1 - theta0);
  let nbreaks = 2 + parseInt(l1 / STEP);
  beginShape();
  for (let i=0; i<nbreaks; i++) {
    const theta = map(i, 0, nbreaks-1, theta0, theta1);
    vertex(x+cos(theta)*r1, y+sin(theta)*r1);
  }
  // 内圈
  const l0 = r0 * (theta1 - theta0);
  nbreaks = 2 + parseInt(l0 / STEP);
  for (let i=0; i<nbreaks; i++) {
    const theta = map(i, 0, nbreaks-1, theta1, theta0);
    vertex(x+cos(theta)*r0, y+sin(theta)*r0);
  }
  endShape(CLOSE);
}

let g_last_millis = 0;
function draw() {
  const ms = millis();
  const delta_ms = ms - g_last_millis;
  g_last_millis = ms;
  
  if (g_countdown_ms > 0) {
    g_countdown_ms -= delta_ms;
    if (g_countdown_ms <= 0) {
      if (g_countdown_ms_prev > 0) {
        // 倒计时到了
        RequestReleaseCandidate();
      }
    }
  }
  g_countdown_ms_prev = g_countdown_ms;
  g_animator.Update();

  background(220);
  
  // Update UI event
  if (g_flags[0] != 0 && g_rank != undefined) {
    let t = g_thetas[g_rank] + g_flags[0] * delta_ms / 1000 * 3.14 / 2;
    if (t < 0) t = 0;
    if (t > PI) t = PI;
    g_thetas[g_rank] = t;
  }
  
  // 平滑过渡
  {
    const EPS = 1e-4;
    const max_change = THETA_CHANGE_RATE * delta_ms / 1000;
    for (let i=0; i<g_theta_targets.length; i++) {
      const v0 = g_thetas[i], v1 = g_theta_targets[i];
      if (g_theta_targets[i] == undefined) continue;
      let vout = v0;
      if (abs(v0 - v1) < EPS) {
        vout = v1;
      } else {
        if (v0 > v1) {
          vout = v0 - max_change;
          if (vout < v1) vout = v1;
        } else {
          vout = v0 + max_change;
          if (vout > v1) vout = v1;
        }
      }
      g_thetas[i] = vout;
    }
  }

  g_theta_update_countdown -= delta_ms;
  if (g_theta_update_countdown < 0) {
    g_theta_update_countdown = THETA_UPDATE_INTERVAL;
    SendMyThetaIfNeeded(g_thetas[g_rank], g_rank);
  }

  g_viewport.Save();
  g_viewport.Identity();
  UpdateHover();
  g_viewport.Load();

  // phys
  if (g_scene != undefined) {
    push();
    g_viewport.Apply();
    const dt = min(0.5, delta_ms / 100);
    const N = 4;
    if (!g_paused) {
      for (let i=0; i<N; i++) {
        g_scene.Step(dt / N);
      }
    }
    
    g_scene.Render();
    stroke("#F88");
    line(0, g_ythresh, PHYS_W, g_ythresh);

    if (g_is_host) {
      g_snapshot_interval_countdown -= delta_ms;
      if (g_snapshot_interval_countdown < 0) {
        if (g_game_status != GAME_STATUS_GAMEOVER) {
          SendSnapshotToRoom();
        }
        g_snapshot_interval_countdown = SNAPSHOT_INTERVAL;
      }
    }
    
    // 手臂
    fill("#AAA"); stroke(0);
    if (g_thetas.length > 0 && g_room_id != undefined) {
      let pts = [];
      let p0 = new p5.Vector(PHYS_W/2, 0);
      pts.push(p0);
      const L = PHYS_W / 2 / g_thetas.length;
      for (let i=0; i<g_thetas.length; i++) {
        const a = g_thetas[i];
        let delta = new p5.Vector(L*cos(a), L*sin(a));
        
        p0 = p0.copy().add(delta);
        pts.push(p0);
      }
      push();
      for (let i=0; i<pts.length-1; i++) {
        if (i == g_rank) { stroke("#33F"); } else { stroke("#333"); }
        line(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y); 
      } 
      pop();
      for (let i=0; i<pts.length; i++) { circle(pts[i].x, pts[i].y, 5); }
      if (g_cand != undefined) {
        g_cand.pos = p0.copy();
        g_cand.Render();
      }
    }
    pop();
  }

  g_buttons.forEach((b) => { b.Render(); });
  g_textlabels.forEach((l) => { l.Render(); });

  // 倒计时
  if (g_countdown_ms > 0) {
    const txt = "" + parseInt(g_countdown_ms / 1000);
    push();
    textAlign(CENTER, CENTER);
    textSize(40);
    noStroke();
    if (g_countdown_ms <= 3000) {
      fill("#F88");
    } else {
      fill("#888");
    }
    text(txt, width/2, 40);
    pop();
  }
  
  // Dragging the hand segment.
  if (g_touch_state != undefined   &&
      g_hovered_block == undefined &&
      g_game_status == GAME_STATUS_INGAME) {
    let txt = "Drag: (" + g_last_mouse_pos[0] + "," + g_last_mouse_pos[1] +
              ")+(" + g_viewport_drag_x + "," + g_viewport_drag_y;
    push();
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    //text(txt, 0, 0);
    text(""+g_drag_is_release, 0, 0);
    
    const x0 = g_last_mouse_pos[0], y0 = g_last_mouse_pos[1];
    const x1 = x0 - g_viewport_drag_x, y1 = y0 - g_viewport_drag_y;
    const R0 = 100, R1 = 200;
    noStroke();
    fill("rgba(32,192,255,0.3)");
    //arc(x0, y0, 2*R, 2*R, g_theta_min, g_theta_max, PIE);
    Draw2DTorus(x0, y0, R0, R1, g_theta_min, g_theta_max);
    noFill();
    
    let drag_dir = new p5.Vector(-g_viewport_drag_x, -g_viewport_drag_y);
    let drag_heading = drag_dir.heading();
    if (drag_heading < 0) drag_heading += 2*PI;
    const drag_mag = drag_dir.mag();
    const R2 = 100, R3 = 200, theta2 = (1.5 - 0.1) * PI, theta3 = (1.5+0.1)*PI;
    if (drag_mag > R2 && drag_mag < R3 && drag_heading > theta2 && drag_heading < theta3) {
      g_drag_is_release = true;
    } else g_drag_is_release = false;
    
    if (g_drag_is_release)
      fill("rgba(32,255,32,1)");
    else
      fill("rgba(32,255,32,0.3)");
    Draw2DTorus(x0, y0, R2, R3, theta2, theta3);
    
    stroke("rgba(32,192,255,1)");
    
    // 下半圈：控制角度
    if (drag_mag >= R0 && drag_mag <= R1 &&
      drag_heading >= g_theta_min && drag_heading <= g_theta_max) {
      g_theta_targets[g_rank] = drag_heading;
    } else {
      g_theta_targets[g_rank] = undefined; // 移出区域则立刻停止移动
    }
    
    line(x0, y0, x1, y1);
    
    pop();
  }
  
  // 分数显示
  if (g_scene != undefined) {
    push();
    const H = 40;
    textSize(H);
    textAlign(LEFT, TOP);
    const dx = 8, dy = 14;       
    const sc = g_score.score;
    const w = textWidth(sc);
    noStroke();
    fill("rgba(0, 0, 0, 0.3)");
    rect(dx, dy, w+4, H+4);
    fill("#FF0");
    text(sc, dx+2, dy+2);
    pop();
  }
  
  g_scorepanel.Render();
  
  if (g_banner_countdown > 0) {
    let alpha = g_banner_countdown / g_banner_duration;
    
    alpha *= 2;
    if (alpha > 1) { alpha = 1; }
    push();
    textSize(40);
    noStroke();
    fill("rgba(0,0,0,0.2)");
    const x = width/2, y = width/2;
    rect(0, y-22, width, 44);
    textAlign(CENTER, CENTER);
    noStroke();
    fill("rgba(255,192,192," + alpha + ")");
    text(g_banner_text, x, y);
    pop();
    
    g_banner_countdown -= delta_ms;
    if (g_banner_countdown < 0) {
      g_banner_countdown = 0;
    }
  }
  
  if (g_viewmode == 1) {
    push();
    textSize(16);
    text("操作方式：\n键盘 [A] [D] 控制方向； [空格] 放下音符\n触屏：在任何地方上滑或下滑",
      8, 640);
    pop();
  }
}

function keyPressed() {
  if (key == 's') {
    if (socket == undefined) {
      ConnectToServer();
    }
  }
  else if (key == 'a') {
    socket.emit('key', 'a');
  }
}

function OnConnected() {
  g_btn_connect.is_enabled = false;
  g_state.cxn_state = "已连接，请选择一个房间以开始或加入游戏";
}

function InitializeGame() {
  g_scene = new PoScene();
  g_scene.LoadDefaultScene();
  
  // 测试用场景
  if (true) {
    for (let i=0; i<3; i++) {
      let c = new PoCircle(12);
      
      if (true) {
        //c.pos.x = i*32+44;
        //c.pos.y = 200;
        c.pos.x = random() * PHYS_W;
        c.pos.y = random() * PHYS_H;
        c.tag = 1;
        g_ball = c;
      }

      g_scene.shapes.push(c);
    }
  } else {
  }
  console.log(g_scene.shapes.length)
}

// Tag
function GenCandidate() {
  let avg_tag = 0, n = 1;
  
  let dist = [];
  for (let i=0; i<MAX_TAG; i++) dist.push(0);
  
  if (g_scene != undefined) {
    g_scene.shapes.forEach((s) => {
      if (s.tag != undefined) {
        avg_tag += s.tag;
        n ++;
      }
    });
  } else { avg_tag = 1; }
  
  avg_tag = parseInt(avg_tag / n);
  const tag = 1 + parseInt(random(1+avg_tag));
  const S = SIZES[avg_tag];
  
  let cand;
  if (Math.random() < 0.5) {
    cand = new PoRect(Math.random()*S[0] + S[1], Math.random()*S[0] + S[1]);
  } else {
    cand = new PoCircle(Math.random()*S[0] + S[1]);
  }
  cand.tag = tag;
  g_cand = cand;
  g_cand.StartFadeIn();
}

var test0;

function Foo() {
  BecomeRoomHost();
  Save();
  Load(test0);
}

function ToP5Vector(s) {
  let ret = new p5.Vector();
  Object.assign(ret, s);
  return ret;
}

function Save() {
  test0 = JSON.stringify(g_scene);
  return test0;
}

function Load(snapshot) {
  let x = new PoScene();
  Object.assign(x, JSON.parse(snapshot));
  
  let shapes = [];
  for (let i=0; i<x.shapes.length; i++) {
    let s = x.shapes[i];
    if (s.type == "rect") {
      let s1 = new PoRect();
      // 需要手工重建这些个object，不能直接反序列化 :(
      Object.assign(s1, s);
      ["pos", "v", "pos_prev", "v_q", "v_prev", "j_q"].forEach((key) => {
        s1[key] = ToP5Vector(s[key]);
      });
      shapes.push(s1);
    } else if (s.type == "circle") {
      let c1 = new PoCircle();
      Object.assign(c1, s);
      ["pos", "v", "pos_prev", "v_q", "v_prev", "j_q"].forEach((key) => {
        c1[key] = ToP5Vector(s[key]);
      });
      shapes.push(c1);
    }
  }
  x.shapes = shapes;
  
  g_scene = x;
}

function keyPressed() {
  if (key == "a") { g_flags[0] = 1; }
  else if (key == "d") { g_flags[0] = -1; }
  else if (key == ' ') {
    RequestReleaseCandidate();
  } else if (key == 'p') {
    g_paused = !g_paused;
  }
}

function keyReleased() {
  if (key == "d" || key == "a") { g_flags[0] = 0; }
}

function OnTurnChanged() {
  // 行动次序
  if (g_rank != undefined && g_curr_turn != undefined) {
    let txt = "";
    let n = g_rank - g_curr_turn;
    if (n < 0) n += g_num_players;
    if (n == 0) { 
      txt = "轮到你扔下音符了";
      if (g_num_players > 1) ShowBanner(txt, 1000);
    }
    else if (n == 1) { txt = "下一轮就该你了"; }
    else { txt = "还有 " + n + " 轮到你"; }
    g_state.turn_info = txt;
  }
}

function StartGame() {
  if (g_game_status != GAME_STATUS_INGAME) {
    g_game_status = GAME_STATUS_INGAME;
    SetViewMode(1);
  }
}

function do_GameOver() {
  StopCountdown();
  g_game_status = GAME_STATUS_GAMEOVER;
  g_paused = true;
  g_state.turn_info = "游戏结束啦";
  ShowBanner("游戏结束啦！", 5000);
}

function GameOver() {
  do_GameOver();
  if (!g_is_host) return;
  if (socket != undefined) {
    socket.emit("gameover");
  }
  SendSnapshotToRoom();
}

function GameRestart() {

}

// host 播报给其它玩家
function AddScore(tag) {
  if (!g_is_host) return;
  if (isNaN(tag)) return;
  let occs = g_score.combine_occ;
  g_score.score += tag;
  while (occs.length < tag) {
    occs.push(0);
  }
  occs[tag-1]++;
  g_score.combine_occ = occs;
  if (socket != undefined) {
    socket.emit("score", g_score);
  }
}

// 0：没有控制界面
// 1：有控制界面
function SetViewMode(mode) {
  if (mode == 1) {
    g_viewmode = 1;
    const s = 0.75;
    g_animator.Animate(g_viewport, "scale", [1, s], [0, 1000]);
    g_viewport.pos.x = 156;
    g_viewport.pos.y = 470;
    g_animator.Animate(g_scorepanel, "x", [-88, 0], [0, 1000]);
  }
}
