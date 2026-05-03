let g_textbox; // Full screen overlay
let g_cam;
let g_flags = [ 0, 0, 0, 0, 0, 0 ]

class Mat3 {
  constructor() {
    this.m = [ new p5.Vector(1,0,0),
               new p5.Vector(0,1,0),
               new p5.Vector(0,0,1) ];
  }
  
  static Mult(a, b) {
    let ret = new Mat3()
    for (let i=0; i<3; i++) {
      ret.m[i].x = a.m[0].x * b.m[i].x + a.m[1].x * b.m[i].y + a.m[2].x * b.m[i].z;
      ret.m[i].y = a.m[0].y * b.m[i].x + a.m[1].y * b.m[i].y + a.m[2].y * b.m[i].z;
      ret.m[i].z = a.m[0].z * b.m[i].x + a.m[1].z * b.m[i].y + a.m[2].z * b.m[i].z;
    }
    return ret;
  }
  
  static RotationMatrix(u, theta) {
    let ct = cos(theta), st = sin(theta);
    // r 行 列
    let r11 = ct + u.x * u.x * (1 - ct),
        r12 = u.x * u.y * (1 - ct) - u.z * st,
        r13 = u.x * u.z * (1 - ct) + u.y * st,
        r21 = u.y * u.x * (1 - ct) + u.z * st,
        r22 = ct + u.y * u.y * (1 - ct),
        r23 = u.y * u.z * (1 - ct) - u.x * st,
        r31 = u.z * u.x * (1 - ct) - u.y * st,
        r32 = u.z * u.y * (1 - ct) + u.x * st,
        r33 = ct + u.z * u.z * (1 - ct);
    let ret = new Mat3();
    ret.m[0].x = r11; ret.m[0].y = r21; ret.m[0].z = r31;
    ret.m[1].x = r12; ret.m[1].y = r22; ret.m[1].z = r32;
    ret.m[2].x = r13; ret.m[2].y = r23; ret.m[2].z = r33;
    return ret;
  }
  
  Transpose() {
    let ret = new Mat3();
    ret.m[0].x = this.m[0].x; ret.m[0].y = this.m[1].x; ret.m[0].z = this.m[2].x;
    ret.m[1].x = this.m[0].y; ret.m[1].y = this.m[1].y; ret.m[1].z = this.m[2].y;
    ret.m[2].x = this.m[0].z; ret.m[2].y = this.m[1].z; ret.m[2].z = this.m[2].z;
    return ret;
  }
  
  Mult(x) {
    let ret = new p5.Vector()
    ret.x = this.m[0].x * x.x + this.m[1].x * x.y + this.m[2].x * x.z;
    ret.y = this.m[0].y * x.x + this.m[1].y * x.y + this.m[2].y * x.z;
    ret.z = this.m[0].z * x.x + this.m[1].z * x.y + this.m[2].z * x.z;
    return ret;
  }
}

class Camera3 {
  constructor() {
    this.pos = new p5.Vector(0, 0, 200);
    this.orientation = new Mat3();
  }
  
  Apply() {
    let center = this.pos.copy();
    let o = this.orientation;
    center.add(p5.Vector.mult(o.m[2], -1)); // 看向的方向是 -Z
    
    let up = o.m[1];
    camera(this.pos.x, this.pos.y, this.pos.z, 
           center.x, center.y, center.z, 
           up.x, up.y, up.z);
  }
  
  MoveInLocalSpace(pos_delta) {
    this.pos.add(p5.Vector.mult(this.orientation.m[0], pos_delta.x));
    this.pos.add(p5.Vector.mult(this.orientation.m[1], pos_delta.y));
    this.pos.add(p5.Vector.mult(this.orientation.m[2], pos_delta.z));
  }
  
  RotateAlongLocalAxis(axis, delta_theta) {
    if (axis.equals(new p5.Vector(1, 0, 0))) delta_theta *= -1; // 
    this.orientation = Mat3.Mult(this.orientation, Mat3.RotationMatrix(axis, delta_theta));
  }
  
  GetStatusString() {
    let x =
      "Camera Position Delta, X:" + g_flags[0] +
      ", Y:" + g_flags[1] + ", Z:" + g_flags[2] + "\n" +
      "Camera Rotation Delta: Y:" + g_flags[4] +
      ", X:" + g_flags[3] + ", Z:" + g_flags[5];
    return x
  }
}

function setup() {
  displayDensity(1)
  createCanvas(400, 400, WEBGL);
  g_textbox = createGraphics(width, height)
  
  //console.log(Mat3.RotationMatrix(new p5.Vector(1,2,3).normalize(), 333))
  //console.log(Mat3.RotationMatrix(new p5.Vector(1,2,3).normalize(), 333).Transpose())
  console.log(Mat3.RotationMatrix(new p5.Vector(1,2,3).normalize(), 333).Mult(new p5.Vector(3,4,5)))
  
  g_cam = new Camera3()
}

function draw() {
  
  // 在自身坐标系中移动
  {
    g_cam.MoveInLocalSpace(new p5.Vector(g_flags[0] * 2, 0, 0));
    g_cam.MoveInLocalSpace(new p5.Vector(0, g_flags[1] * 2, 0));
    g_cam.MoveInLocalSpace(new p5.Vector(0, 0, g_flags[2] * 2));
  }
  // 绕自身坐标系旋转
  {
    g_cam.RotateAlongLocalAxis(new p5.Vector(1, 0, 0), g_flags[3] * 0.03);
    g_cam.RotateAlongLocalAxis(new p5.Vector(0, 1, 0), g_flags[4] * 0.03);
    g_cam.RotateAlongLocalAxis(new p5.Vector(0, 0, 1), g_flags[5] * 0.03);
  }
  
  // Apply first, then scale(1,-1)
  g_cam.Apply()
  scale(1, -1); 
  
  background(33);
  fill(255);
  stroke(128);
  box(50, 50, 50);
  beginShape(LINES);
  stroke(255, 0, 0); vertex(0, 0, 0); vertex(100, 0, 0); // +X
  endShape();
  beginShape(LINES);
  stroke(0, 255, 0); vertex(0, 0, 0); vertex(0, 100, 0); // +Y
  endShape();
  beginShape(LINES);
  stroke(0, 0, 255); vertex(0, 0, 0); vertex(0, 0, 100); // +Z
  endShape();
  stroke(0);
  
  resetMatrix();
  camera();
  
  g_textbox.textFont("Source Code Pro");
  g_textbox.background(33)
  g_textbox.noStroke()
  g_textbox.fill(255)
  g_textbox.textAlign(LEFT, TOP);
  let t = g_cam.GetStatusString()
  g_textbox.text(t, 2, 8)
  
  blendMode(ADD)
  texture(g_textbox)
  
  noStroke()
  plane(width, height)
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
  else if (key == 't') g_flags[3] =  1; // 朝上看
  else if (key == 'g') g_flags[3] = -1; // 朝下看
  else if (key == 'f') g_flags[4] =  1; // 朝左看
  else if (key == 'h') g_flags[4] = -1; // 朝右看
  else if (key == 'r') g_flags[5] = -1; // 把头偏向左边(绕自身+Z逆时针旋转)
  else if (key == 'y') g_flags[5] =  1; // 朝头偏向右边(绕自身+Z顺时针旋转)
}

function keyReleased() {
  if      (key == 'w' || key == 's') { g_flags[2] = 0; }
  else if (key == 'a' || key == 'd') { g_flags[0] = 0; }
  else if (key == 'q' || key == 'e') { g_flags[1] = 0; }
  else if (key == 't' || key == 'g') { g_flags[3] = 0; }
  else if (key == 'f' || key == 'h') { g_flags[4] = 0; }
  else if (key == 'r' || key == 'y') { g_flags[5] = 0; }
}