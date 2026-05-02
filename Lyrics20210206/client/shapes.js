const RESTITUTIONS = [ 0.3, 0.3, 0 ];
let RESTITUTION = 0.3;
const FRIC_DYNAMIC = 0.3;
const FRIC_STATIC = 0.3;
const GRAVITY = 9.8;
const MY_DEBUG = false;

const COLORS = [
  "rgba(255, 173, 173, 1)",
  "rgba(250, 163, 7,   1)",
  "rgba(255, 214, 165, 1)",
  "rgba(253, 255, 182, 1)",
  "rgba(202, 255, 191, 1)",
  "rgba(155, 246, 255, 1)",
  "rgba(160, 196, 255, 1)",
  "rgba(189, 178, 255, 1)",
  "rgba(255, 198, 255, 1)",
  "rgba(255, 255, 252, 1)",
]

const SIZES = 
[
  [ 3, 15 ],
  [ 3, 20 ],
  [ 3, 25 ],
  [ 3, 35 ],
  [ 2, 35 ],
  [ 2, 45 ],
  [ 2, 40 ],
  [ 2, 70 ],
  [ 2, 70 ],
  [ 2, 70 ],
  [ 2, 100 ],
]

const MAX_TAG = 10; // Inclusive

// XY Limits for physical computation
function GetGlobalXYLimit() {
  return [0, width, -height*0.5, height]; // 给屏幕上方一些容错空间
}

function PerpVec2(v) {
  return new p5.Vector(v.y, -v.x);
}

class Mat2 {
  constructor(a00, a01, a10, a11) {
    this.a00 = a00;
    this.a01 = a01;
    this.a10 = a10;
    this.a11 = a11;
  }
  
  static Rotation(theta) {
    const s = sin(theta), c = cos(theta);
    return new Mat2(
      c, -s, s, c
    );
  }
  
  Mult(v) {
    return new p5.Vector(
      v.x*this.a00 + v.y*this.a01,
      v.x*this.a10 + v.y*this.a11
    )
  }
  
  Det() {
    return this.a00 * this.a11 - this.a01 * this.a10;
  }
  
  Inverse() {
    if (this.Det() == 0) {
      return undefined;
    }
    const dinv = 1.0 / this.Det();
    return new Mat2(
      this.a11 * dinv,
      this.a01 * (-1) * dinv,
      this.a10 * (-1) * dinv,
      this.a00 * dinv
    );
  }
  
  Transpose() {
    return new Mat2(
      this.a00, this.a10,
      this.a01, this.a11
    );
  }
}

const MAX_NUM_CONTACTS = 100;
const FADE_IN_COUNTDOWN_MS = 2;
// 破Shape
class PoShape {
  constructor() {
    this.pos = new p5.Vector(0, 0);
    this.theta = 0;
    this.v = new p5.Vector(0, 0);
    this.omega = 0;
    this.inv_mass = 0;
    this.status_flag = 0x00;
 
    this.pos_prev = new p5.Vector(0, 0);
    this.v_q = new p5.Vector(0, 0); // Queued V
    this.v_prev = new p5.Vector(0, 0);
    this.j_q = new p5.Vector(0, 0); // Impulse
    this.torque_q = 0;
    this.inv_inertia = 0; // Moment of inertia
    this.theta_prev = 0;
    this.omega_prev = 0;
    this.type = "";
    this.tex = undefined;
    
    this.state = 0; // 0：刚扔下来，1：已经在下方了
    this.fade_in_countdown_ms = 0; // 是否在fade in过程中
  }
  
  StartFadeIn() {
    console.log("StartFadeIn");
    this.fade_in_countdown_ms = FADE_IN_COUNTDOWN_MS; 
  }
  
  IsFadingIn() { return (this.fade_in_countdown_ms > 0); }
  
  // Returns [collided, MTD]
  static BoxBoxCollision(A, B) {
    let axes_a = A.GetSeparationAxes(),
        axes_b = B.GetSeparationAxes();
    let axes = [ axes_a[0], axes_a[1], axes_b[0], axes_b[1] ];
    let dists = [ 0, 0, 0, 0 ], min_dist = 1e20;
    let mtd;
    for (let i=0; i<4; i++) {
      const axis = axes[i];
      const minmaxA = A.GetInterval(axis);
      const minmaxB = B.GetInterval(axis);
      
      const min_A = minmaxA[0], max_A = minmaxA[1], min_B = minmaxB[0], max_B = minmaxB[1];
      if (max_A < min_B || max_B < min_A) {
        return [false,undefined]; 
      }
      
      let dist = 0;
      // Separation distance
      if (max_B > max_A && min_B < min_A) {
        const ab1 = max_B - min_A, ab2 = max_A - min_B;
        dist = (ab1 > ab2) ? ab2 : ab1;
      } else if (max_A > max_B && min_A < min_B) {
      const ba1 = max_A - min_B, ba2 = max_B - min_A;
    dist = (ba1 > ba2) ? ba2 : ba1;
    } else {
    let projs = [min_A, max_A, min_B, max_B]
        // projs.sort(); // 注意：负数会被当成字符串来比较
        projs.sort( function(a, b) {return a-b} );
    dist = projs[2] - projs[1];
    }
    dists[i] = dist;
      
      if (dist <= 0) {
        return [false, undefined];
      }
      if (min_dist > dist) {
        min_dist = dist; mtd = axis.copy();
      }
    }
    
    // 确保MTD由A指向B
    const ab = B.pos.copy().sub(A.pos);
    if (ab.dot(mtd) < 0) { mtd.mult(-1); }
    mtd.normalize(); mtd.mult(min_dist);
    
    A.SetIsCollided(true);
    B.SetIsCollided(true);
    
    return [true, mtd];
  }
  
  static BoxCircleCollision(rect, circ) {
    const EPS = 1e-5;
    const r = circ.r, hw = rect.hw, hh = rect.hh;
    const l = rect.ToLocalPoint(circ.pos.copy()); // Note: will modify
    if      (l.x >   r + hw) return [false, undefined];
    else if (l.x < - r - hw) return [false, undefined];
    else if (l.y >   r + hh) return [false, undefined];
    else if (l.y < - r - hh) return [false, undefined];
    
    const TOP_LEFT = 0, TOP_RIGHT = 1, BOTTOM_RIGHT = 2, BOTTOM_LEFT = 3;
    let corner_idx = -1;
    if      (l.y > hh  && l.x < -hw) corner_idx = TOP_LEFT;
    else if (l.y > hh  && l.x > hw)  corner_idx = TOP_RIGHT;
    else if (l.y < -hh && l.x > hw)  corner_idx = BOTTOM_RIGHT;
    else if (l.y < -hh && l.x < -hw) corner_idx = BOTTOM_LEFT;
    
    // 与角相撞
    if (corner_idx != -1) {
      let rv = [ // RV means Rectangle Vertex
        [ -hw, hh], [hw, hh], [hw, -hh], [-hw, -hh] 
      ];
      let vo = new p5.Vector(l.x - rv[corner_idx][0], l.y - rv[corner_idx][1]);
      if (vo.dot(vo) > r*r - EPS) {
      } else {
        const vo_len = vo.mag();
        vo.normalize();
        vo = rect.ToWorldDirection(vo);
        vo.mult(r - vo_len);
        return [true, vo];
      }
      return false;
    }
    
    // 与边相撞
    const dist_up = r + hh - l.y, dist_down = l.y - (-r-hh),
          dist_left = l.x - (-r-hw), dist_right = (r+hw) - l.x;
    if (l.x > -hw-r && l.x < hw+r && l.y > -hh-r && l.y < hh+r) {
      let idx_min = -1;
      let min_dist = 1e20;
      const dists = [ dist_up, dist_down, dist_left, dist_right ];
      const n = [[0, 1], [0, -1], [-1, 0], [1, 0]]; // Points from rect to circ
      for (let i=0; i<4; i++) {
        if (dists[i] <= -EPS) continue;
        if (dists[i] < min_dist) {
          min_dist = dists[i];
          idx_min = i;
        }
      }
      //console.log("idx_min=" + idx_min + ", dists=" + dist_up + ", " + dist_down + ", " + dist_left + ", " + dist_right);
      let mtd = new p5.Vector(n[idx_min][0], n[idx_min][1]);
      mtd = rect.ToWorldDirection(mtd);
      if (min_dist == 0) min_dist = EPS;
      mtd.mult(min_dist);
      return [true, mtd];
    }
    return false;
    
    
  }
  
  static CircleCircleCollision(circ1, circ2) {
    const EPS = 1e-5;
    let o1o2 = circ2.pos.copy().sub(circ1.pos);
    let R1 = circ1.r, R2 = circ2.r;
    let dist = R1 + R2 - o1o2.mag();
    if (dist < EPS) {
      return [ false, undefined ];
    } else {
      return [true, o1o2.normalize().mult(dist)];
    }
  }
  
  // 返回[true/false, MTD (Minimal Translation Distance)]
  static Collided(A, B) {
    if (A instanceof PoRect && B instanceof PoRect) {
      return PoShape.BoxBoxCollision(A, B);
    } else if (A instanceof PoCircle && B instanceof PoRect) {
      let ret = PoShape.BoxCircleCollision(B, A);
      if (ret[1] != undefined) { ret[1].mult(-1); }
      return ret;
    } else if (A instanceof PoRect && B instanceof PoCircle) {
      let ret = PoShape.BoxCircleCollision(A, B);
      return ret;
    } else if (A instanceof PoCircle && B instanceof PoCircle) {
      return PoShape.CircleCircleCollision(A, B);
      
    }
  }
  
  OnNewFrame(dt) {
    this.SetIsCollided(false);
    this.v_q = new p5.Vector(0, 0);
    this.j_q = new p5.Vector(0, 0);
    this.torque_q = 0;
    
    if (this != g_cand) {
      // Combine 专用
      switch (this.state) {
        case 0:
          // 只有碰撞了之后才会变成1
          break;
        case 1:
          if (this.pos.y < g_ythresh && this.pos_prev.y >= g_ythresh) {
            GameOver();
          }
          break;
        default:
          break;
      }
    }
    
    this.pos_prev = this.pos.copy();
    
    const cd = this.fade_in_countdown_ms;
    if (cd > 0) {
      let cd1 = cd - dt;
      if (cd1 < 0) { cd1 = 0; }
      let c = 1.0 - cd1 / FADE_IN_COUNTDOWN_MS;
      c = 1 - (1-c)*(1-c)
      if (this instanceof PoCircle) {
        this.r = c * this.r0;
      } else if (this instanceof PoRect) {
        this.hw = c * this.hw0; this.hh = c * this.hh0;
      }
      this.fade_in_countdown_ms = cd1;
    }
  }
  
  SetIsCollided(is_collided) {
    this.SetStatusBit(1, is_collided);
  }
  SetIsSelected(is_selected) {
    this.SetStatusBit(2, is_selected);
  }
  
  SetStatusBit(idx, b) {
    const mask = 1 << idx;
    if (b == true) this.status_flag |= mask;
    else this.status_flag &= (~mask);
  }

  SetInfiniteMass() {
    this.inv_mass = 0;
    this.inv_inertia = 0;
  }
  
  ToWorldPoint(local) {
    const rot = Mat2.Rotation(this.theta);
    return rot.Mult(local).add(this.pos);
  }
  ToLocalPoint(world) {
    const rot = Mat2.Rotation(this.theta);
    return rot.Inverse().Mult(world.sub(this.pos));
  }
  ToWorldDirection(local) {
    const rot = Mat2.Rotation(this.theta);
    return rot.Mult(local);
  }
  ToLocalDirection(world) {
    const rot = Mat2.Rotation(this.theta);
    return rot.Inverse().Mult(world);
  }
  
  QueueImpulse(j, r_loc) {
    const rT = PerpVec2(r_loc);
    const j_loc = this.ToLocalDirection(j);
    const torque = j_loc.dot(rT);
    
    this.torque_q -= torque;
    if (this.inv_mass > 0) {
      this.v_q.add(j.mult(this.inv_mass));
    }
  }
  ApplyQueuedImpulse() {
    const delta_omega = this.torque_q * this.inv_inertia;
    this.omega += delta_omega;
    this.v.add(this.v_q);
    this.v_q = new p5.Vector(0, 0);
    this.torque_q = 0;
  }
  QueueImpulseInstant(j, r_loc) {
    const rT = PerpVec2(r_loc);
    const j_loc = this.ToLocalDirection(j);
    const torque = j_loc.dot(rT);
    this.torque_q -= torque;
    
    this.omega += this.torque_q * this.inv_inertia;
    if (this.inv_mass > 0) {
      this.v.add(j.mult(this.inv_mass));
    }
  }
  
  IntegratePosRot(dt) {
    if (this.inv_mass == 0) return;
    let next_x = this.pos.x + this.v.x*dt;
    let next_y = this.pos.y + this.v.y*dt;
    
    let xylimits = GetGlobalXYLimit();
    
    if (next_x < xylimits[0] || next_x > xylimits[1]) { this.v.x *= -1; }
    if (next_y < xylimits[2] || next_y > xylimits[3]) {
      this.v.y *= -1;
    }
    this.pos.add(this.v.copy().mult(dt));
    this.theta += this.omega*dt;
  }
  
  GetSeparationAxes() { return undefined; }
  GetInterval(dir) { return undefined; }
  GetVertexWorld(idx) { return undefined; }
  GetVertexLocal(idx) { return undefined; }
  FindSupportPoints(n) { return undefined; }
  
  
  GetVelocityWAt(local) {
    return this.v.copy().sub(this.ToWorldDirection(PerpVec2(local)).copy().mult(this.omega));
  }
  
}

class PoRect extends PoShape {
  constructor(hw, hh) {
    super();
    this.hw  = hw; this.hh  = hh;
    this.hw0 = hw; this.hh0 = hh;
    
    let mass = 4 * hw * hh;
    this.inv_mass = 1 / mass;
    let inertia = 8 / 3 * (hw*hw + hh*hh) * mass;
    this.inv_inertia = 1 / inertia;
    
    this.tex = undefined;
    this.type = "rect";
  }
  
  SetInfiniteMass() {
    this.inv_mass = 0;
    this.inv_inertia = 0;
  }
  
  Render() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.theta);
    
    if (this.tex != undefined) {
      imageMode(CENTER);
      image(this.tex, 0, 0, this.hw*2, this.hh*2);
      noFill();
    }
    
    rectMode(CENTER);
    if (this.tag != undefined) fill(COLORS[this.tag-1]);
    rect(0, 0, this.hw*2, this.hh*2);
    
    // 2021-02-04
    if (this.tag != undefined) {
      if (g_skin == 0) {
        push();
        textSize(min(this.hw*2, this.hh*2));
        textAlign(CENTER, CENTER);
        fill(0);
        text(this.tag + "", 0, 0);
        pop();
      } else {
        push();
        g_atlas.Render(this.tag-1, 0, 0, this.hw*2, this.hh*2);
        pop();
      }
    }
    
    if (MY_DEBUG) {
      noStroke();
      rotate(-this.theta);
      fill("#33F");
      text(this.state+"", 0, 0);
    }
    
    pop();
  }
  
  GetSeparationAxes() {
    const rot = Mat2.Rotation(this.theta);
    return [
      rot.Mult(new p5.Vector(0,1)),
      rot.Mult(new p5.Vector(1,0)),
    ];
  }
  
  GetVertexLocal(idx) {
    const hw = this.hw, hh = this.hh;
    switch(idx) {
      case 0: return new p5.Vector(-hw, hh);
      case 1: return new p5.Vector(-hw,-hh);
      case 2: return new p5.Vector( hw,-hh);
      case 3: return new p5.Vector( hw, hh);
      default: return undefined;
    }
  }
  
  GetVertexWorld(idx) {
    return this.ToWorldPoint(this.GetVertexLocal(idx));
  }
  
  GetInterval(dir) {
    let v = this.GetVertexWorld(0);
    let lb = v.dot(dir), ub = v.dot(dir);
    for (let i=1; i<4; i++) {
      v = this.GetVertexWorld(i);
      let d = v.dot(dir);
      if (d < lb) { lb = d; }
      if (d > ub) { ub = d; }
    }
    return [lb, ub];
  }
  
  FindSupportPoints(normal) {
    let prj_max = -1e20;
    let n_l = this.ToLocalDirection(normal).normalize();
    
    let prjs = [ 0,0,0,0 ];
    let points = [];
    for (let i=0; i<4; i++) {
      let prj = this.GetVertexLocal(i).dot(n_l);
      if (prj > prj_max) prj_max = prj;
      prjs[i] = prj;
    }
    
    // Find out parallel guys
    let pt_idx = 0;
    const thresh = 1e-5;
    for (let i=0; i<4; i++) {
      if (prjs[i] > prj_max - thresh) {
        points.push(this.GetVertexLocal(i));
        if (points.length >= 2) break;
      }
    }
    
    // 如果是面交
    if (points.length == 2) {
      let p1p2 = points[1].copy().sub(points[0]);
      let d = p1p2.dot(p1p2);
      if (d < 1e-4) {
        points.pop();
      }
    }
    
    return points;
  }
}

class PoCircle extends PoShape {
  constructor(r) {
    super();
    this.r = r;
    this.r0 = r;
    let mass = PI * r * r;
    this.inv_mass = 1 / mass;
    let inertia = 0.5 * mass * r * r
    this.inv_inertia = 1 / inertia;
    
    this.tex = undefined;
    this.type = "circle";
  }
  
  SetInfiniteMass() {
    this.inv_mass = 0;
    this.inv_inertia = 0;
  }
  
  Render() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.theta);
    
    if (this.tex != undefined) {
      imageMode(CENTER);
      image(this.tex, 0, 0, this.r*2, this.r*2);
      noFill();
    } else {
      if (this.tag != undefined) fill(COLORS[this.tag-1]);
      circle(0, 0, this.r*2);
    }
    
    // 2021-02-04
    if (this.tag != undefined) {
      if (g_skin == 0) {
        push();
        textSize(this.r * 1.8);
        textAlign(CENTER, CENTER);
        fill(0);
        noStroke();
        text(this.tag + "", 0, 0);
        pop();
      } else {
        push();
        g_atlas.Render(this.tag-1, 0, 0, this.r*2, this.r*2);
        pop();
      }
    } else {
      line(0, 0, this.r, 0);
    }
    
    if (MY_DEBUG) {
      noStroke();
      rotate(-this.theta);
      fill("#33F");
      text(this.state+"", 0, 0);
    }
    
    pop();
  }
  
  GetSeparationAxes() {
    const rot = Mat2.Rotation(this.theta);
    return [
      rot.Mult(new p5.Vector(0,1)),
      rot.Mult(new p5.Vector(1,0)),
    ];
  }
  
  GetVertexLocal(idx) {
    if (idx == 0) return new p5.Vector(0, 0);
    let rad = PI * 2.0 / (idx-1) / 10;
    return new p5.Vector(cos(rad)*this.r, sin(rad)*this.r);
  }
  
  GetVertexWorld(idx) {
    return this.ToWorldPoint(this.GetVertexLocal(idx));
  }
  
  FindSupportPoints(normal) {
    let n_l = this.ToLocalDirection(normal).normalize();
    return [ n_l.mult(this.r) ];
  }
}

// =================== Contact
class PoContact {
  constructor(A, B, normal) {
    this.A = A; this.B = B; this.normal = normal;
    this.cpA = []; this.cpB = [];
    this.cpAW = []; this.cpBW = [];
    this.vAW = []; this.vBW = [];
    this.ComputePointPairs();
    this.is_static_fric_tact = false;
  }
  
  Copy() {
    let ret = new PoContact(this.A, this.B, this.normal.copy());
    ret.cpA = this.cpA.slice();
    ret.cpB = this.cpB.slice();
    ret.cpAW = this.cpAW.slice();
    ret.cpBW = this.cpBW.slice();
    ret.vAW = this.vAW.slice();
    ret.vBW = this.vBW.slice();
    return ret;
  }
  
  ComputePointPairs() {
    const A = this.A, B = this.B;
    this.cpA = A.FindSupportPoints(this.normal);
    this.cpB = B.FindSupportPoints(this.normal.copy().mult(-1));
    this.cpAW = [];
    this.cpBW = [];
    this.cpA.forEach((p) => this.cpAW.push(A.ToWorldPoint(p)));
    this.cpB.forEach((p) => this.cpBW.push(B.ToWorldPoint(p)));
    
    let cpA = this.cpA, cpB = this.cpB, cpAW = this.cpAW, cpBW = this.cpBW;
    const n_cpA = cpA.length, n_cpB = cpB.length;
    
    if (n_cpA == 2 && n_cpB == 1) {
      let edgeA = cpAW[1].copy().sub(cpAW[0]);
	  let len_eA_sq = edgeA.dot(edgeA);
	  let len_proj_b = (cpBW[0].copy().sub(cpAW[0])).dot(edgeA);
	  let perpfoot_b = cpAW[0].copy().add(edgeA .copy().mult(len_proj_b / len_eA_sq));
      cpAW.pop(); cpA.pop();
	  cpAW[0] = perpfoot_b;
	  cpA[0] = A.ToLocalPoint(perpfoot_b);
    } else if (n_cpA == 1 && n_cpB == 2) {
      let edgeB = cpBW[1].copy().sub(cpBW[0]);
	  let len_eB_sq = edgeB.dot(edgeB);
	  let len_proj_a = (cpAW[0].copy().sub(cpBW[0])).dot(edgeB);
	  let perpfoot_a = cpBW[0].add(edgeB.copy().mult(len_proj_a / len_eB_sq));
      cpBW.pop(); cpB.pop();
	  cpBW[0] = perpfoot_a;
	  cpB[0] = B.ToLocalPoint(perpfoot_a);
    } else if (n_cpA == 2 && n_cpB == 2) {
      let handle = (this.normal.x == 0 ? new p5.Vector(1, 0) : new p5.Vector(0, 1));
	  //let n_perp = TripleProduct(n, handle, n);
	  let n_perp = new p5.Vector(-this.normal.y, this.normal.x).normalize();
		
	  let dp0 = cpAW[0].dot(n_perp), dp1 = cpAW[1].dot(n_perp),
		  dp2 = cpBW[0].dot(n_perp), dp3 = cpBW[1].dot(n_perp);
	  let prjs_orig   = [dp0, dp1, dp2, dp3];
	  let prjs_sorted = [dp0, dp1, dp2, dp3];
      
      let max_01 = (dp0 > dp1) ? dp0 : dp1, min_01 = (dp0 > dp1) ? dp1 : dp0,
			 max_23 = (dp2 > dp3) ? dp2 : dp3, min_23 = (dp2 > dp3) ? dp3 : dp2;
	  if(max_01 < min_23 || min_01 > max_23) {
		return;
	  }
      
      prjs_sorted.sort();
      
      for (let j=0; j<2; j++) {
        for (let i=1; i<=2; i++) {
          if (prjs_orig[j] == prjs_sorted[i]) {
            let edgeB = cpBW[1].copy().sub(cpBW[0]);
            let len_eB_sq = edgeB.dot(edgeB);
            let len_proj_a = (cpAW[j].copy().sub(cpBW[0])).dot(edgeB);
            let perpfoot_a = cpBW[0].copy().add(edgeB.copy().mult(len_proj_a / len_eB_sq));
            let bidx;
            if (i == 1) {
              if (dp2 < dp3) bidx = 0;
              else bidx = 1;
            } else if (i == 2) {
              if (dp2 < dp3) bidx = 1;
              else bidx = 0;
            }
            cpBW[bidx] = perpfoot_a;
            cpB[bidx] = B.ToLocalPoint(perpfoot_a);
          }
        }
      }
      
      for(let j=0; j<2; j++) {
        for(let i=1; i<=2; i++) {
          if(prjs_orig[j+2] == prjs_sorted[i]) { // project B[j].
          let edgeA = cpAW[1].copy().sub(cpAW[0]);
          let len_eA_sq = edgeA.dot(edgeA);
          let len_proj_b = (cpBW[j].copy().sub(cpAW[0])).dot(edgeA);
          let perpfoot_b = cpAW[0].copy().add((edgeA.copy().mult(len_proj_b / len_eA_sq)));
          let aidx = 0;
          if(i==1) {
            if (dp0 <= prjs_sorted[i]) aidx = 0;
            else if(dp1 <= prjs_sorted[i]) aidx = 1;
          } else if(i==2) {
            if(dp0 >= prjs_sorted[i]) aidx = 0;
            else if(dp1 >= prjs_sorted[i]) aidx = 1;
          } 
          cpAW[aidx] = perpfoot_b;
          cpA[aidx] = A.ToLocalPoint(perpfoot_b); // Make sure they are paired.
          }
        }
      }
    }
    
    //push();
    //fill("#ff3");
    this.vAW = []; this.vBW = [];
    let pw;
    this.cpA.forEach((p) => {
      this.vAW.push(A.GetVelocityWAt(p))
      pw = A.ToWorldPoint(p);
      //circle(pw.x, pw.y, 10);
    });
    //text(n_cpA + "+" + n_cpB, pw.x, pw.y);
    //fill("#3ff");
    this.cpB.forEach((p) => {
      this.vBW.push(B.GetVelocityWAt(p))
      pw = B.ToWorldPoint(p);
      //circle(pw.x, pw.y, 10);
    });
    //pop();
  }
  
  Resolve() {
    const A = this.A, B = this.B;
    if(this.cpA.length != this.cpB.length) {
      console.log("this.cpA.length != this.cpB.length");
    }
    
    for (let i=0; i<this.cpA.length; i++) {
      let k = 1.0 / this.cpA.length;
      let j = this.ComputeImpulse(i);
      
      if (this.normal.dot(j) > 0) { j.mult(-1); }
      
      A.QueueImpulse(j.copy().mult(k), this.cpA[i]);
      B.QueueImpulse(j.copy().mult(-k),this.cpB[i]);
    }
  }
  
  ResolvePosition() {
    const A = this.A, B = this.B, normal = this.normal;
    const s = A.inv_mass + B.inv_mass;
    const coef_a = A.inv_mass / s;
    const coef_b = B.inv_mass / s;
    A.pos.sub(normal.copy().mult(coef_a));
    B.pos.add(normal.copy().mult(coef_b));
  }
  
  // V_n points from A to B.
  //              -(1+restitution)(V_n)
  // J = -----------------------------------------
  //      1/mA + 1/mB + iA(rA×N)^2 + iB(rB×N)^2
  ComputeImpulse(pair_idx) {
    const A = this.A, B = this.B;
    const rAL = this.cpA[pair_idx], rBL = this.cpB[pair_idx];
    const len_n_sq = this.normal.dot(this.normal);
    const nn = this.normal.copy().normalize();
    const v = A.GetVelocityWAt(rAL).copy().sub(B.GetVelocityWAt(rBL));
    const vn = nn.copy().mult(nn.dot(v));
    const vt = v.copy().sub(vn);
    if (vn.dot(nn) < 1e-5) return new p5.Vector(0, 0);
    let delta_v = vn.copy().mult(-1-RESTITUTION);
    
    let rAN = rAL.dot(PerpVec2(A.ToLocalDirection(nn))); rAN *= rAN;
    rAN *= A.inv_inertia;
    let rBN = rBL.dot(PerpVec2(B.ToLocalDirection(nn.copy().mult(-1)))); rBN *= rBN;
    rBN *= B.inv_inertia;
    
    let inv_mass_a = max(0, A.inv_mass);
    let inv_mass_b = max(0, B.inv_mass);
    const denom = inv_mass_a + inv_mass_b + rAN + rBN;
    
    let j = delta_v.copy().mult(1.0 / denom);
    
    if (FRIC_DYNAMIC > 0) {
      let t = vt.copy().mult(-1);
      let j_len_sq = j.dot(j), t_len_sq = t.dot(t);
      if (t_len_sq > 0) {
        let scale = sqrt(j_len_sq / t_len_sq * FRIC_DYNAMIC * FRIC_DYNAMIC);
        t.mult(scale);
        j.add(t);
      }
    }
    
    if (!this.is_static_fric_tact && FRIC_STATIC > 0) {
      const EPS = 1e-4;
      let ratio_sq = vt.dot(vt) / vn.dot(vn);
      if (ratio_sq > EPS && ratio_sq < FRIC_STATIC * FRIC_STATIC) {
        let sf_n = vt.copy().normalize();
        let stat_fric_ct = this.Copy();
        stat_fric_ct.is_static_fric_tact = true;
        stat_fric_ct.normal = sf_n.copy();
        stat_fric_ct.Resolve();
      }
    }
    
    return j;
  }
}

// =================== Scene Management ======
class PoScene {
  constructor() {
    this.shapes = [];
    this.is_paused = false;
    this.contacts = [];
    this.secs_elapsed = 0;
  }
  
  do_UnionCircles(a, b) {
    const tag = a.tag + 1;
    this.shapes.remove(a);
    this.shapes.remove(b);
    
    AddScore(tag);
    
    if (tag <= MAX_TAG) {
      const ab = new PoCircle(SIZES[tag][1]);
      ab.tag = tag;
      ab.pos = a.pos.copy().add(b.pos).mult(0.5);
      ab.StartFadeIn();
      this.shapes.push(ab);
    }
  }
  do_UnionCircleRect(a, b) {
    const tag = a.tag + 1;
    this.shapes.remove(a);
    this.shapes.remove(b);
    
    AddScore(tag);
    
    if (tag <= MAX_TAG) {
      const S = SIZES[tag][1];
      let ab;
      if (Math.random() < 0.5) {
        const new_hh = S;
        const new_hw = S;
        ab = new PoRect(new_hw, new_hh);
        ab.tag = tag;
      } else {
        ab = new PoCircle(S);
        ab.tag = tag;
      }
      ab.pos = a.pos.copy().add(b.pos).mult(0.5);
      ab.StartFadeIn();
      this.shapes.push(ab);
    }
  }
  
  do_UnionRects(a, b) {
    let ab;
    const tag = a.tag + 1;
    this.shapes.remove(a);
    this.shapes.remove(b);
    
    AddScore(tag);
    
    if (tag <= MAX_TAG) {
      const S = SIZES[tag][1];
      ab = new PoRect(S, S);
      ab.tag = tag;
      ab.pos = a.pos.copy().add(b.pos).mult(0.5);
      this.shapes.push(ab);
      ab.StartFadeIn();
    }
  }
  
  // 合成
  Union(a, b) {
    
    if (a.IsFadingIn() || b.IsFadingIn()) return;
    
    if (a.type == "circle" && b.type == "circle") {
      this.do_UnionCircles(a, b);
    } else if (a.type == "rect" && b.type == "rect") {
      this.do_UnionRects(a, b);
    } else if (a.type == "rect" && b.type == "circle") {
      this.do_UnionCircleRect(b, a);
    } else if (a.type == "circle" && b.type == "rect") {
      this.do_UnionCircleRect(a, b);
    }
  }
  
  // dt是秒数
  Step(dt) {
    // OnNewFrame and Gravity
    this.shapes.forEach((s) => {
      s.OnNewFrame(dt);
      if (s.inv_mass > 0) {
        s.QueueImpulseInstant(new p5.Vector(0, GRAVITY*dt/s.inv_mass), new p5.Vector(0,0));
      }
    })
    
    const NITER = 3;
    for (let iter=0; iter<NITER; iter++) {
      this.contacts = [];
      
      let is_force_overlap = (iter == NITER-1);
      this.CollisionDetection(is_force_overlap);
      
      RESTITUTION = RESTITUTIONS[iter];
      
      this.contacts.forEach((c) => { c.Resolve(); });
      
      this.shapes.forEach((s) => {
        s.ApplyQueuedImpulse();
        s.IntegratePosRot(dt / NITER);
      });
    }
    
    // 20210204
    let done = false;
    while (!done) {
      done = true;
      for (let i=0; i<this.contacts.length; i++) {
        const c = this.contacts[i];
        if (c.A.tag == c.B.tag) {
          this.Union(c.A, c.B);
          this.contacts.remove(c);
          done = false;
          break;
        }
      }
    }
    
    this.secs_elapsed += dt;
  }
  
  CollisionDetection(force_resolve_overlap) {
    
    // 按照从低到高（Y从大到小）的顺序排列一下所有shape
    let shapes1 = this.shapes.slice();
    shapes1.sort((a, b) => {
      return a.pos.y > b.pos.y;
    });
    
    const N = this.shapes.length;
    for (let i=0; i<N; i++) {
      for (let j=i+1; j<N; j++) {
        let A = shapes1[i], B = shapes1[j];
        const c = PoShape.Collided(A, B);
        const is_collided = c[0];
        
        // For 合成；与任何东西碰撞之后，都将状态从0改为1
        if (is_collided) {
          if (A.state == 0) { A.state = 1; }
          if (B.state == 0) { B.state = 1; }
        }
        
        const normal = c[1];
        if ((!(A.inv_mass == 0 && B.inv_mass == 0)) && is_collided) {
          // Add a contact
          if (this.contacts.length < MAX_NUM_CONTACTS) {
            this.contacts.push(new PoContact(A, B, normal));
          }
          
          // DBG
          if (force_resolve_overlap) {
            const s = A.inv_mass + B.inv_mass;
            const coef_a = A.inv_mass / s;
            const coef_b = B.inv_mass / s;
            A.pos.sub(normal.copy().mult(coef_a));
            B.pos.add(normal.copy().mult(coef_b));
          }
        }
      }
    }
  }
  
  Render() {
    this.shapes.forEach((s) => s.Render());
  }
  
  LoadDefaultScene() {
    this.shapes = [];
    let temp1 = new PoRect(width/2, 10);
    temp1.pos = new p5.Vector(width/2, height-11);
    temp1.SetInfiniteMass();
    temp1.theta = 0;
    this.shapes.push(temp1);
      
    let temp2 = new PoRect(10, height/2);
    temp2.pos = new p5.Vector(0, height/2);
    temp2.SetInfiniteMass();
    this.shapes.push(temp2);
  
    temp2 = new PoRect(10, height/2);
    temp2.pos = new p5.Vector(width+10, height/2);
    temp2.SetInfiniteMass();
    this.shapes.push(temp2);
    
    console.log(this.shapes);
  }
}
