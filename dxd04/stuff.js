// https://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/
// https://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/index.htm
class Quaternion {
  constructor() {
    this.m = [ 1,1,1,1 ]; // W X Y Z
  }
  
  static Slerp(a, b, t) {
    let ret = new Quaternion();
    const qaw = a.m[0], qax = a.m[1], qay = a.m[2], qaz = a.m[3];
    const qbw = b.m[0], qbx = b.m[1], qby = b.m[2], qbz = b.m[3];
    
    const cosHalfTheta = qaw * qbw + qax * qbx + qay * qby + qaz * qbz;
    if (abs(cosHalfTheta) >= 1.0){
      ret.m[0] = qaw;ret.m[1] = qax;ret.m[2] = qay;ret.m[3] = qaz;
      return ret;
    }
    // Calculate temporary values.
    const halfTheta = acos(cosHalfTheta);
    const sinHalfTheta = sqrt(1.0 - cosHalfTheta*cosHalfTheta);
    // if theta = 180 degrees then result is not fully defined
    // we could rotate around any axis normal to qa or qb
    if (abs(sinHalfTheta) < 0.001){ // fabs is floating point absolute
      ret.m[0] = (qaw * 0.5 + qbw * 0.5);
      ret.m[1] = (qax * 0.5 + qbx * 0.5);
      ret.m[2] = (qay * 0.5 + qby * 0.5);
      ret.m[3] = (qaz * 0.5 + qbz * 0.5);
      return ret;
    }
    const ratioA = sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = sin(t * halfTheta) / sinHalfTheta; 
    //calculate Quaternion.
    ret.m[0] = (qaw * ratioA + qbw * ratioB);
    ret.m[1] = (qax * ratioA + qbx * ratioB);
    ret.m[2] = (qay * ratioA + qby * ratioB);
    ret.m[3] = (qaz * ratioA + qbz * ratioB);
    return ret;
  }
}

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

function Mat3ToQuaternion(x) {
  let ret = new Quaternion();
  const r11 = x.m[0].x, r21 = x.m[0].y, r31 = x.m[0].z,
        r12 = x.m[1].x, r22 = x.m[1].y, r32 = x.m[1].z,
        r13 = x.m[2].x, r23 = x.m[2].y, r33 = x.m[2].z;
  const trace = r11 + r22 + r33;
  if (trace > 0) {
    const s = 0.5 / sqrt(trace + 1);
    ret.m[0] = 0.25 / s;
    ret.m[1] = (r32 - r23) * s;
    ret.m[2] = (r13 - r31) * s;
    ret.m[3] = (r21 - r12) * s;
  } else {
    if ( r11 > r22 && r11 > r33 ) {
      const s = 2.0 * sqrt( 1.0 + r11 - r22 - r33);
      ret.m[0] = (r32 - r23 ) / s;
      ret.m[1] = 0.25 * s;
      ret.m[2] = (r12 + r21 ) / s;
      ret.m[3] = (r13 + r31 ) / s;
    } else if (r22 > r33) {
      const s = 2.0 * sqrt( 1.0 + r22 - r11 - r33);
      ret.m[0] = (r13 - r31 ) / s;
      ret.m[1] = (r12 + r21 ) / s;
      ret.m[2] = 0.25 * s;
      ret.m[3] = (r23 + r32 ) / s;
    } else {
      const s = 2.0 * sqrt( 1.0 + r33 - r11 - r22 );
      ret.m[0] = (r21 - r12 ) / s;
      ret.m[1] = (r13 + r31 ) / s;
      ret.m[2] = (r23 + r32 ) / s;
      ret.m[3] = 0.25 * s;
    }
  }
  return ret;
}

function QuaternionToMat3(x) {
  let ret = new Mat3();
  const qw = x.m[0], qx = x.m[1], qy = x.m[2], qz = x.m[3];
  const r11 = 1 - 2*qy * qy - 2 * qz * qz,
        r12 = 2*qx*qy - 2*qz*qw,
        r13 = 2*qx*qz + 2*qy*qw,
        r21 = 2*qx*qy + 2*qz*qw,
        r22 = 1 - 2*qx*qx - 2*qz*qz,
        r23 = 2*qy*qz - 2*qx*qw,
        r31 = 2*qx*qz - 2*qy*qw,
        r32 = 2*qy*qz + 2*qx*qw,
        r33 = 1 - 2*qx*qx - 2*qy*qy;
  ret.m[0].x = r11; ret.m[0].y = r21; ret.m[0].z = r31;
  ret.m[1].x = r12; ret.m[1].y = r22; ret.m[1].z = r32;
  ret.m[2].x = r13; ret.m[2].y = r23; ret.m[2].z = r33;
  return ret;
}

class Stuff {
  constructor() {
    this.pos = new p5.Vector(0, 0, 0);
    this.orientation = new Mat3();
    this.scale = new p5.Vector(1, 1, 1);
    
    this.hovered = 0;
    this.pick_tact = undefined; // Contact point for picking
    this.onhover = undefined;
    this.onclick = undefined;
    this.clicked = false;
    this.visible = true;
    this.update = undefined;
    this.enabled = true;
  }
  
  MoveInLocalSpace(pos_delta) {
    this.pos.add(p5.Vector.mult(this.orientation.m[0], pos_delta.x));
    this.pos.add(p5.Vector.mult(this.orientation.m[1], pos_delta.y));
    this.pos.add(p5.Vector.mult(this.orientation.m[2], pos_delta.z));
  }
  
  RotateAlongLocalAxis(axis, delta_theta) { 
    this.orientation = Mat3.Mult(this.orientation, Mat3.RotationMatrix(axis, delta_theta));
  }
  
  RotateAlongGlobalAxis(axis, delta_theta) {
    const local_axis = this.orientation.Transpose().Mult(axis);
    this.orientation = Mat3.Mult(this.orientation, Mat3.RotationMatrix(local_axis, delta_theta));
  }
  
  ApplyTransform(g) {
    const o = this.orientation, p = this.pos, s = this.scale;
    g.applyMatrix(o.m[0].x, o.m[0].y, o.m[0].z, 0,
                  o.m[1].x, o.m[1].y, o.m[1].z, 0,
                  o.m[2].x, o.m[2].y, o.m[2].z, 0,
                  p.x,      p.y,      p.z,      1);
    g.scale(s.x, s.y, s.z);
  }
  
  ToLocalDirection(v) {
    return this.orientation.Transpose().Mult(v);
  }
  
  ToLocalPoint(v) {
    const vv = v.sub(this.pos);
    return this.orientation.Transpose().Mult(vv);
  }
  
  ToGlobalDirection(v) {
    return this.orientation.Mult(v);
  }
  
  Intersect(_o, _d) { return undefined }
  Blur() { this.hovered = false; this.pick_tact = undefined; }
  
  OnHover() {
    if (this.onhover != null) this.onhover(this);
  }
  
  OnClick() {
    if (this.onclick != null) this.onclick(this);
  }
  
  Update(delta_millis) {
    if (this.update != undefined) {
      this.update(delta_millis);
    }
  }
}

class Box extends Stuff {
  constructor() {
    super()
    this.hh = 10; this.hw = 15; this.hd = 30;
  }
  
  Render(g) {
    if (!this.visible) { return; }
    g.push()
    this.ApplyTransform(g);
    g.resetShader();
    
    if (this.hovered) g.fill(0, 255, 128);
    else g.fill(255);
    
    const hw = this.hw, hh = this.hh, hd = this.hd;
    
    //g.beginShape();
    //g.vertex(-hw, hh, hd);
    //g.vertex(-hw,-hh, hd);
    //g.vertex( hw,-hh, hd);
    //g.vertex( hw, hh, hd);
    //g.endShape();
    g.box(this.hw*2, this.hh*2, this.hd*2)
    
    // debug flags
    const DEBUG = false
    const DEBUG_TACT = false
    if (DEBUG) {
      const zx = this.ToLocalDirection(g_cam.GetGlobalX())
      const zy = this.ToLocalDirection(g_cam.GetGlobalY())
      const zz = this.ToLocalDirection(g_cam.GetGlobalLookDir())
      const zp = this.ToLocalPoint(g_cam.GetPos())
      
      g.beginShape(LINES)
      g.stroke(255,0,0)
      g.vertex(0,0,0)
      g.vertex(zx.x*201, zx.y*210, zx.z*210)
      g.endShape()
      
      g.beginShape(LINES)
      g.stroke(0,255,0)
      g.vertex(0,0,0)
      g.vertex(zy.x*201, zy.y*210, zy.z*210)
      g.endShape()
      
      g.beginShape(LINES)
      g.stroke(0,0,255)
      g.vertex(0,0,0)
      g.vertex(zz.x*(-201), zz.y*(-210), zz.z*(-210))
      g.endShape()
      
      g.beginShape(LINES)
      g.stroke(255)
      g.vertex(zp.x*(-1000), zp.y*(-1000), zp.z*(-1000))
      g.vertex(0,0,0)
      g.vertex(0,0,0)
      g.vertex(zp.x*(1000), zp.y*(1000), zp.z*(1000))
      g.endShape()
    }
    if (DEBUG_TACT) {
      if (this.pick_tact != undefined) {
        const p = this.pick_tact;
        
        g_gl.disable(g_gl.DEPTH_TEST);
        
        const EPS = 1e-3
        if (abs(p.x - this.hw) < EPS || abs(p.x + this.hw) < EPS) g.stroke(255, 0, 0);
        else if (abs(p.y - this.hh) < EPS || abs(p.y + this.hh) < EPS) g.stroke(0, 255, 0);
        else if (abs(p.z - this.hd) < EPS || abs(p.z + this.hd) < EPS) g.stroke(0, 0, 255);
        else g.stroke(128);
        
        g.beginShape(POINTS)
        
        g.vertex(p.x, p.y, p.z)
        g.endShape();
        g_gl.enable(g_gl.DEPTH_TEST);
      }
    }
    
    g.pop()
  }
  
  // o, d = Pick Ray
  // Hit: return t
  // Miss: return undefined
  // Sets intersection point
  Intersect(_o, _d) {
    if (this.hd == undefined) return undefined;
    
    const EPS = 1e-3;
    const o = this.ToLocalPoint(_o), d = this.ToLocalDirection(_d);
    const hh = this.hh, hw = this.hw, hd = this.hd;
    let cand = [ ] // [ [axis, t] ]
    if (abs(d.x) > EPS) {
      cand.push(['x', - (o.x - hw) / d.x]);
      cand.push(['x', - (o.x + hw) / d.x]);
    }
    if (abs(d.y) > EPS) {
      cand.push(['y', - (o.y - hh) / d.y]);
      cand.push(['y', - (o.y + hh) / d.y]);
    }
    if (abs(d.z) > EPS) {
      cand.push(['z', - (o.z - hd) / d.z]);
      cand.push(['z', - (o.z + hd) / d.z]);
    }
    cand.sort(function(a,b) {
      if (a[1] > b[1]) return 1;
      else if (a[1] < b[1]) return -1;
      else return 0;
    })
    
    for (let i=0; i<cand.length; i++) {
      const c = cand[i];
      const p = o.copy().add(d.copy().mult(c[1]));
      switch (c[0]) {
      case 'x':
        if (p.y >= -hh && p.y <= hh && p.z >= -hd && p.z <= hd) {
          this.pick_tact = p;
          return c[1];
        }
        break;
      case 'y':
        if (p.x >= -hw && p.x <= hw && p.z >= -hd && p.z <= hd) {
          this.pick_tact = p;
          return c[1];
        }
        break;
      case 'z':
        if (p.x >= -hw && p.x <= hw && p.y >= -hh && p.y <= hh) {
          this.pick_tact = p
          return c[1];
        }
      }
    }
    return undefined;
  }
}

class ObjModel extends Box {
  constructor(obj, bbox = undefined) {
    super();
    this.obj = obj;
    this.color = [220,220,220]
    this.material = "specular"
    
    if (bbox == undefined && obj.bbox != undefined) { bbox = obj.bbox; }
    
    if (bbox == undefined) { this.hw = this.hh = this.hd = undefined; }
    else { this.hw = bbox[0]; this.hh = bbox[1]; this.hd = bbox[2]; }
  }
  Render(g) {
    if (!this.visible) { return; }
    if (this.obj == undefined) { return; }
    g.push();
    g_suppress_textures = true;
    this.ApplyTransform(g);

    g.noStroke();
    g.lights();
    if (this.material == "specular") g.specularMaterial(55);
    else g.ambientMaterial(55);
    g.fill(this.color[0], this.color[1], this.color[2]);
    g.model(this.obj);
    
    if (this.hovered) {
      g.stroke(0, 255, 0);
      g.noFill();
      g.box(this.hw * 2, this.hh * 2, this.hd * 2);
    }

    g.pop();
  }
}

class Billboard extends Stuff {
  constructor(w = 160, h = 60) {
    super()
    this.text_size = 20;
    this.w = w; this.h = h
    this.canvas = createGraphics(this.w, this.h)
    this.pick_tact = undefined;
    this.bgcolor = [ 128,128,128,128 ];
    this.enabled = true;
  }
  
  SetText(t) {
    const bgc = this.bgcolor;
    this.canvas.clear();
    this.canvas.background(bgc[0], bgc[1], bgc[2], bgc[3]);
    this.canvas.textFont("Source Code Pro")
    this.canvas.noStroke()
    this.canvas.fill(255)
    this.canvas.textSize(this.text_size)
    this.canvas.textAlign(CENTER, CENTER)
    this.canvas.text(t, this.w/2, this.h/2)
  }
  
  Render(g) {
    if (this.visible != true) return;
    g.push()
    this.ApplyTransform(g)
    g_suppress_textures = false;
    
    const hw = this.w*0.5, hh = this.h*0.5
    const tw = this.canvas.width, th = this.canvas.height;
    
    if (this.pick_tact != undefined) {
      g.beginShape(LINES);
      g.stroke(0, 255, 0);
      g.vertex(-hw, hh, 0);
      g.vertex(-hw,-hh, 0);
      
      g.vertex(-hw,-hh, 0);
      g.vertex( hw,-hh, 0);
      
      g.vertex( hw,-hh, 0);
      g.vertex( hw, hh, 0);
      
      g.vertex( hw, hh, 0);
      g.vertex(-hw, hh, 0);
      g.endShape();
    }
    
    g_gl.enable(g_gl.BLEND);
    g_gl.blendFunc(g_gl.SRC_ALPHA, g_gl.ONE_MINUS_SRC_ALPHA);
    
    g.beginShape();
    g.stroke(255)
    g.texture(this.canvas)
    
    
    g.vertex(-hw,  hh, 0, 0, 0);
    g.vertex(-hw, -hh, 0, 0, th);    
    g.vertex( hw, -hh, 0, tw, th);
    g.vertex( hw,  hh, 0, tw, 0);

    g.endShape();
    
    g.pop();
  }
  
  Intersect(_o, _d) {
    if (this.visible == false) return undefined;
    if (this.enabled == false) return undefined;
    const EPS = 1e-3;
    const o = this.ToLocalPoint(_o), d = this.ToLocalDirection(_d);
    const n = new p5.Vector(0,0,1);
    let ddn = d.dot(n);
    if (abs(ddn) < EPS) return undefined;
    const t = -o.z / ddn;
    this.pick_tact = undefined;
    const p = o.copy().add(d.copy().mult(t));
    const hw = this.w / 2 * this.scale.x, hh = this.h / 2 * this.scale.y;
    if (p.x >= -hw && p.x <= hw && p.y >= -hh && p.y <= hh) {
      this.pick_tact = p;
      return t;
    }
    return undefined;
  }
}

function SnapToGrid(x, step) {
  const n = parseInt(x / step)
  return step * n
}

function DrawGrid(x, z, step, g) {
  const y = 0
  const N = 7
  const x0 = SnapToGrid(x, step),
        z0 = SnapToGrid(z-N*step, step)
        
  if (false) {
    g.stroke(224)
    g.beginShape(LINES)
    const xx0 = x0-N*step, xx1 = x0+N*step,
          zz0 = z0-N*step, zz1 = z0+N*step
    for (let i=-N; i<=N; i++) {
      const zz = z0+i*step
      for (let j=-N; j<=N; j++) {
        const xx = x0+j*step
        g.vertex(xx, y, zz0); g.vertex(xx, y, zz1);
        g.vertex(xx0, y, zz); g.vertex(xx1, y, zz);
      }
    }
    g.endShape()
  } else {
    const S = 2700
    g.push()
    g.strokeWeight(6);
    
    g.fill(0,0,0,128);
    
    g.translate(-S,0,S/2);
    
    g.model(g_obj_grid);
    g.translate(S, 0, 0);
    g.model(g_obj_grid);
    g.translate(S, 0, 0);
    g.model(g_obj_grid);
    
    
    g.translate(-2*S, 0, -S);
    g.model(g_obj_grid);
    g.translate(S, 0, 0);
    g.model(g_obj_grid);
    g.translate(S, 0, 0);
    g.model(g_obj_grid);
    
    g.translate(-2*S, 0, -S);
    g.model(g_obj_grid);
    g.translate(S, 0, 0);
    g.model(g_obj_grid);
    g.translate(S, 0, 0);
    g.model(g_obj_grid);
    
    //g.translate(0, 0, 2*S);
    //g.model(g_obj_grid);
    
    g.pop();
  }
}

class Animator {
  constructor() {
    this.subjects = []
  }
  
  // Keyframes: [value, DELTA_millis]
  Animate(s, property, field, values, intervals, callback=null) {
    const m = millis()
    
    for (let i=0; i<values.length; i++) {
      if (values[i] instanceof Mat3) {
        values[i] = Mat3ToQuaternion(values[i]);
      }
    }
    
    this.subjects.push({
      subject:  s,
      property: property,
      field:    field,
      values:    values,
      intervals: intervals,
      index: 0,
      start_millis: m,
      callback: callback
    })
  }
  
  // Camera里有一个坑：
  //   所有的Y都要乘以-1。
  AnimateCamera(c, property, field, values, intervals, callback=null) {
    if (property == "pos" && field == "y") {
      console.log("Hohoho")
      for (let i=0; i<values.length; i++) { values[i] *= -1; }
    }
    this.Animate(c, property, field, values, intervals, callback);
  }
  
  Update() {
    let victims = new Set()
    const m = millis()
    for (let i=0; i<this.subjects.length; i++) {
      let s = this.subjects[i]
      const elapsed = m - s.start_millis
      while (elapsed > s.intervals[s.index+1]) {
        s.index++
      }
      
      let val, done = false;
      let is_orientation = false;
      if (s.property == "orientation") { is_orientation = true; }
      
      {
        if (s.index >= s.intervals.length-1) { // ended?
          val = s.values[s.values.length-1]
          if (is_orientation) val = QuaternionToMat3(val);
          done = true
          if (s.callback != null) { s.callback() }
        } else {
          const x0 = elapsed - s.intervals[s.index]
          const x1 = s.intervals[s.index + 1] - s.intervals[s.index]
          const completion = x0 * 1.0 / x1
          if (is_orientation) {
            val = QuaternionToMat3(Quaternion.Slerp(s.values[s.index],
              s.values[s.index+1], completion))
          } else {
            val = lerp(s.values[s.index], s.values[s.index+1], completion)
          }
        }
      }
      
      if (is_orientation) s.subject.orientation = val;
      else s.subject[s.property][s.field] = val;
      if (done) { victims.add(i); }
    }
    
    if (victims.size > 0) {
      let x = []
      for (let i=0; i<this.subjects.length; i++) {
        if (victims.has(i) == false) x.push(this.subjects[i])
      }
      this.subjects = x
    }
  }
}

class Gadget {
  constructor() {
    this.shapes = []
    this.pos = new p5.Vector(0,0,0)
    this.visible = false;
    this.enabled = false;
  }
  
  // o and are world ray position & direction
  IntersectWithMouse(o, d) {
    if (this.enabled != true) return;
    if (this.visible != true) return;
    let t_min = 1e20, cand = null
    for (let i=0; i<this.shapes.length; i++) {
      const s = this.shapes[i];
      s.Blur();
      const t = s.Intersect(g_cam.GetPos(), d);
      if (t != undefined) {
        if (t_min > t) {
          t_min = t; cand = s;
        }
      }
    }
    if (cand != null) cand.hovered = true;
    return cand;
  }
  
  Update(delta_millis) {
    this.shapes.forEach(function(x) {
      x.Update(delta_millis);
    });
  }
  
  Render(g) {
    if (!this.visible) { return; }
    g.push()
    g.translate(this.pos.x, this.pos.y, this.pos.z)
    for (let i=0; i<this.shapes.length; i++) this.shapes[i].Render(g)
    g.pop()
  }
}