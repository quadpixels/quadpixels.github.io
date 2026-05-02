let g_textbox; // Full screen overlay
let g_cam;
let g_flags = [ 0, 0, 0, 0, 0, 0 ]
let g_graph3d;
let g_curr_scene;
let g_animator;

let g_box;
let g_gl;
let g_highlighted = null;

let g_obj_module1;
let g_obj_module2, g_obj_module2_simp;
let g_obj_module3;
let g_obj_car;
let g_obj_cell, g_obj_cell74, g_obj_arrow;
let g_gadget0, g_gadget1, g_gadget2, g_gadget3, g_gadget4, g_bg_gadget;
var g_curr_gadget;
let g_curr_animated_obj;
var g_loop_count = 0;

let g_debug = false;
let g_the_car = undefined;

// HACK，请见p5.js line 98493
let g_suppress_textures = false;

// 编辑模式专用
var g_curr_editing_obj = undefined;
function Manipulate(x) { g_curr_editing_obj = x; }

let g_obj_grid;

function unittest() {
  const u = new p5.Vector(1,4,5).normalize();
  const m = Mat3.RotationMatrix(u, 1.234);
  const q = Mat3ToQuaternion(m)
  console.log(q)
  console.log(m)
  const m2 = QuaternionToMat3(q)
  console.log(m2)
}

// 关于显示
// P5.js 尺寸： 400x720   px
// 5510:       800x1440  px (pixelDensity == 2)
// P30:        1020x1836 px (pixelDensity == 2.55)
// 

var W0 = 400, H0 = 720
var W = 400, H = 720, WW, HH;

function windowResized() {
  OnWindowResize();
}

function OnWindowResize() {
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
}

function setup() {
  
  console.log("W=" + W + ", H=" + H);
  createCanvas(W0, H0);
  
  g_animator = new Animator()
  
  g_textbox = createGraphics(W, H);
  g_graph3d = createGraphics(W, H, WEBGL);
  
  //g_graph3d.pixelDensity(1) // 强力避免卡顿
  
  g_cam = new Camera3()
  g_cam.pos.y = -100
  
  g_box = new Box()
  g_box.pos.x = 0;
  g_box.pos.y = 132.5;
  g_box.pos.z = -200;
  
  g_obj_module1 = loadModel("./module1.obj", false);
  g_obj_module1.bbox = [ 9, 187.5, 30 ];
  g_obj_module2 = loadModel("./module2.obj", false);
  g_obj_module2.bbox = [ 195, 90, 30 ];
  g_obj_module2_simp = loadModel("./module2_simple.obj", false);
  g_obj_module2_simp.bbox = [ 195, 30, 90 ];
  g_obj_module3 = loadModel("./module3.obj", false);
  g_obj_grid = loadModel("./grid.obj", false);
  g_obj_cell = loadModel("./cell.obj", false);
  g_obj_car  = loadModel("./car.obj", false);
  g_obj_cell74 = loadModel("./cell74.obj", false);
  g_obj_arrow  = loadModel("./arrow.obj",  false);
  
  LoadScene();
  
  g_gl = g_graph3d.canvas.getContext("webgl");
}

let gt = 0
let g_frame_count = 0
let g_last_millis = 0

function DisableLights() {
  g_graph3d.noLights(); 
}

function EnableLights() {
  g_graph3d.directionalLight(200, 250, 250, 1, 1, -1);
}

function draw() {
  const m = millis();
  const delta_millis = m - g_last_millis;
  g_last_millis = m;
  
  // Intersect
  {
    g_highlighted = g_curr_gadget.IntersectWithMouse(g_cam.GetPos(), g_cam.GetPickRay(mouseX, mouseY));
    if (g_highlighted != null) {
      g_highlighted.OnHover();
    }
  }
  g_curr_gadget.Update(delta_millis);
  
  g_animator.Update()
  
  if (g_curr_editing_obj != undefined) {
    g_curr_editing_obj.pos.x += g_flags[0] * 10;
    g_curr_editing_obj.pos.y -= g_flags[2] * 10;
    g_curr_editing_obj.pos.z += g_flags[1] * 10;
  } else {
    // 在自身坐标系中移动
    {
      g_cam.MoveInLocalSpace(new p5.Vector(g_flags[0] * 20, 0, 0));
      g_cam.MoveInLocalSpace(new p5.Vector(0, g_flags[1] * 20, 0));
      g_cam.MoveInLocalSpace(new p5.Vector(0, 0, g_flags[2] * 20));
    }
    // 绕自身坐标系旋转
    {
      g_cam.RotateAlongLocalAxis(new p5.Vector(1, 0, 0), g_flags[3] * 0.03);
      g_cam.RotateAlongLocalAxis(new p5.Vector(0, 1, 0), g_flags[4] * 0.03);
      g_cam.RotateAlongLocalAxis(new p5.Vector(0, 0, 1), g_flags[5] * 0.03);
    }
  }
  
  // Apply first, then scale(1,-1)
  g_cam.Apply(g_graph3d)
  //g_graph3d.lights();
  
  g_graph3d.scale(1, -1);
  
  g_graph3d.background(48, 33, 48, 255);
  g_graph3d.fill(255);
  g_graph3d.stroke(128);
  g_graph3d.perspective(PI/3.0, width*1.0/height, 10, 100000);
  
  if (false) {
    g_box.RotateAlongLocalAxis(new p5.Vector(2,3,1).normalize(), delta_millis*0.001)
    const q0 = Mat3ToQuaternion(Mat3.RotationMatrix(new p5.Vector(1,2,3).normalize(), 1.2));
    const q1 = Mat3ToQuaternion(Mat3.RotationMatrix(new p5.Vector(1,2,3).normalize(), 1.5));
    gt = gt + delta_millis / 1000.0
    const ccc = gt - parseInt(gt)
    g_box.orientation = QuaternionToMat3(Quaternion.Slerp(q0, q1, ccc));
    g_box.Render(g_graph3d);
  }
  
  //g_graph3d.box(50, 50, 50);
  g_gadget1.Render(g_graph3d);
  g_gadget2.Render(g_graph3d);
  g_gadget3.Render(g_graph3d);
  
  // TODO: 动画中的例外
  g_curr_gadget.Render(g_graph3d);
  if (g_curr_animated_obj != undefined) {
    g_curr_animated_obj.Render(g_graph3d);
  }
  
  if (false) {
    g_graph3d.beginShape(LINES);
    g_graph3d.stroke(255, 0, 0); g_graph3d.vertex(0, 0, 0); g_graph3d.vertex(100, 0, 0); // +X
    g_graph3d.endShape();
    g_graph3d.beginShape(LINES);
    g_graph3d.stroke(0, 255, 0); g_graph3d.vertex(0, 0, 0); g_graph3d.vertex(0, 100, 0); // +Y
    g_graph3d.endShape();
    g_graph3d.beginShape(LINES);
    g_graph3d.stroke(0, 0, 255); g_graph3d.vertex(0, 0, 0); g_graph3d.vertex(0, 0, 100); // +Z
    g_graph3d.endShape();
  }
  
  if (false) {
    g_graph3d.translate(10, 122.5, -200);
    g_graph3d.push();
    g_graph3d.noStroke();
    g_graph3d.lights();
    let locX = mouseX - width / 2;
    let locY = mouseY - height / 2;
    g_graph3d.pointLight(20, 20, 20, locX, locY, 50);
    g_graph3d.model(g_teapot);
    g_graph3d.pop();
  }

  if (false && g_frame_count == 1) {
    g_graph3d.noLights();
    let locX = mouseX - width / 2;
    let locY = mouseY - height / 2;
    g_graph3d.pointLight(100, 20, 20, locX, locY, 50);
    console.log(locX + ", " + locY)
  }
  
  // 对于Scene 0的要特别处理
  if (g_frame_count == 1) {
    if (g_debug == false) {
      // 车从右侧进入（仅第一回）
      if (g_loop_count == 0) {
        g_animator.Animate(g_the_car, "pos", "x", [CAR_POS[0] + 5000, CAR_POS[0]], [0, 1000]);
      }
      StartAnimationScene0();
    } else {
      g_scene0.SwitchParts("cell74");
    }
    OnWindowResize()
  }
  
  // Grid on the ground
  DrawGrid(g_cam.pos.x, g_cam.pos.z, 50, g_graph3d)
  
  g_bg_gadget.Render(g_graph3d);
  
  g_graph3d.stroke(0);
  
  g_graph3d.resetMatrix();
  g_graph3d.camera();

  
  image(g_graph3d, 0, 0, width, height);
  
  textFont("Source Code Pro");
  noStroke()
  fill(255)
  textAlign(LEFT, TOP);
  
  
  //let t = g_cam.GetStatusString()
  if (g_debug) {
    let t = "Pixel Density: " + pixelDensity() + "\n"
    t = t + "windowWidth, windowHeight: " + windowWidth + " x " + windowHeight + "\n"
    t = t + "width, height: " + width + " x " + height + "\n"
    t = t + "W, H: " + W + " x " + H + "\n";
    t = t + "WW, HH: " + WW + " x " + HH;
    text(t, 2, 8)
  }
  
  g_frame_count ++;
}

function keyPressed() {
  // WSADQE: 移动
  // FHTGRY：旋转
  if      (key == 'w') g_flags[2] = -1; // 前进(-Z)
  else if (key == 's') g_flags[2] =  1; // 后退(+Z)
  else if (key == 'a') g_flags[0] = -1; // 向左(-X)
  else if (key == 'd') g_flags[0] =  1; // 向右(+X)
  else if (key == 'q') g_flags[1] =  1; // 向下(+Y)
  else if (key == 'e') g_flags[1] = -1; // 向上(-Y)
  else if (key == 't') g_flags[3] = -1; // 朝上看
  else if (key == 'g') g_flags[3] =  1; // 朝下看
  else if (key == 'f') g_flags[4] =  1; // 朝左看
  else if (key == 'h') g_flags[4] = -1; // 朝右看
  else if (key == 'r') g_flags[5] = -1; // 把头偏向左边(绕自身+Z逆时针旋转)
  else if (key == 'y') g_flags[5] =  1; // 朝头偏向右边(绕自身+Z顺时针旋转)
  else if (key == ' ') g_flags[6] =  1
}

function keyReleased() {
  if      (key == 'w' || key == 's') { g_flags[2] = 0; }
  else if (key == 'a' || key == 'd') { g_flags[0] = 0; }
  else if (key == 'q' || key == 'e') { g_flags[1] = 0; }
  else if (key == 't' || key == 'g') { g_flags[3] = 0; }
  else if (key == 'f' || key == 'h') { g_flags[4] = 0; }
  else if (key == 'r' || key == 'y') { g_flags[5] = 0; }
  else if (key == ' ') { g_flags[6] = 0; }
}

function mouseMoved() {
  
}

/*
function mouseClicked(event) {
  //console.log(event)
  if (g_highlighted != null) {
    g_highlighted.OnClick();
  }
}
*/

function touchStarted(event) {
  if (g_highlighted != null) {
    g_highlighted.OnClick();
  }
  return true;
}