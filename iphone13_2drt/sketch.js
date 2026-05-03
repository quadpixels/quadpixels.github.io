let g_graph;
const W = 800, H = 473;
const NSAMP = 64;

const JITTER = 0.04

//
const DRAW_AREAS = [
  [ 208, 54, 360, 372 ],
  [ 431, 81, 568, 370 ],
]
let g_num_pixels = 0;

let g_workitem1;
let g_start_millis = -999, g_end_millis = -999;

let g_overlay;

function preload() {
  g_overlay = loadImage("iphone13.png");
}

function setup() {
  createCanvas(W, H);
  g_graph = createGraphics(W, H);
  g_graph.pixelDensity(1);
  
  if (false) {
    g_graph.loadPixels();
    let p = g_graph.pixels;
    for (let i=0; i<p.length; i+=4) {
      p[i  ] = i%255;  // R
      p[i+1] = (i/255) % 255;  // G
      p[i+2] = 0;      // B
      p[i+3] = 255;    // A
    }
    g_graph.updatePixels();
  }
  frameRate(30);
  g_workitem1 = new WorkItem1(g_graph);
  
  g_num_pixels = 0;
  DRAW_AREAS.forEach((a) => {
    const x0 = a[0], x1 = a[2], y0 = a[1], y1 = a[3];
    g_num_pixels += (x1-x0) * (y1-y0);
  })
}

class Vec2 {
  constructor(_x=0, _y=0) {
    this.x = _x; this.y = _y;
  }
  Sub(v) { return new Vec2(this.x-v.x, this.y-v.y); }
  Add(v) { return new Vec2(this.x+v.x, this.y+v.y); }
  Perp() { return new Vec2(-this.y, this.x); }
  LenSq() { return this.x*this.x + this.y*this.y; }
  Len() { return Math.sqrt(this.LenSq()); }
  Normalize() {
    const lr = 1.0 / this.Len();
    return new Vec2(this.x*lr, this.y*lr);
  }
  Dot(v) { return this.x*v.x + this.y*v.y; }
  Mult(a) { return new Vec2(this.x*a, this.y*a); }
  static RandDir() {
    const theta = Math.random() * 2 * PI;
    let ret = new Vec2();
    ret.x = cos(theta); ret.y = sin(theta);
    return ret;
  }
};

class LineSegment {
  constructor(p1, p2) {
    this.p1 = p1; this.p2 = p2;
    this.n = p2.Sub(p1).Perp().Normalize();
  }
  IntersectRay(ray) {
    const o = ray.o, d = ray.d.Normalize();
    const op1 = this.p1.Sub(o);
    const dist = this.n.Dot(op1);
    const ddn  = this.n.Dot(d);
    const t = dist / ddn;
    if (t > 0) {
      const tact = o.Add(d.Mult(t));
      const p1p2 = this.p2.Sub(this.p1);
      const t0 = (tact.Sub(this.p1).Dot(p1p2));
      const t1 = (this.p2.Sub(tact).Dot(p1p2));
      const completion = t0 / (t0+t1);
      if (completion >= 0 && completion <= 1) {
        return [t, tact];
      }
    } else return undefined; // 没有交点
  }
  Render(g) {
    g.line(this.p1.x, this.p1.y,
           this.p2.x, this.p2.y);
  }
};

class Wall extends LineSegment {
  constructor(p1, p2) {
    super(p1, p2);
  }
};

class Light extends LineSegment {
  constructor(p1, p2, _intensity) {
    super(p1, p2);
    this.intensity = _intensity;
  }
};

class Ray {
  constructor(_o, _d) {
    this.o = _o; this.d = _d;
  }
  Render(g) {
    // 屏幕的四边
    const p0 = new Vec2(0, 0),
          p1 = new Vec2(width, 0),
          p2 = new Vec2(width, height),
          p3 = new Vec2(0, height);
    const bounds = [
      new LineSegment(p0, p1),
      new LineSegment(p1, p2),
      new LineSegment(p2, p3),
      new LineSegment(p3, p0)
    ];
    let t = 1e9, tact;
    for (let i=0; i<4; i++) {
      const tt = bounds[i].IntersectRay(this);
      if (tt != undefined) {
        if (tt[0] < t) {
          t = tt[0]; tact = tt[1];
        }
      }
    }
    g.stroke(0, 0, 255);
    
    // 可能超出屏幕范围了
    if (tact != undefined) {
      g.line(this.o.x, this.o.y,
             tact.x, tact.y);
      g.circle(tact.x, tact.y, 5);
    }
  }
};

let l = new LineSegment(new Vec2(10, 20),
                        new Vec2(200, 300));
let g_ray = new Ray(new Vec2(12, 34), new Vec2(-1, 1));

class WorkItem1 {
  constructor(_g) {
    this.g = _g;
    this.num_pixels = _g.width * _g.height;
    this.idx = 0;
    this.num_pixels_drawn = 0;
    
    const w = this.g.width, h = this.g.height;
    const hw = this.g.width * 0.5, hh = this.g.height * 0.5;
    const r = 120;
    this.lines = []
    
    const l = 2.4;
    const color0 = [0.22*l, 0.47*l, 0.24*l];
    const color1 = [0.15*l, 0.3*l, 0.4*l];
    const color2 = [0.2*l*0.9, 0.34*l*0.9, 0.5*l*0.9];
    
    // 左边那台
    // 285,152  -- 285, 256
    this.lines.push(new Light(
      new Vec2(285/800*w, 152/473*h),
      new Vec2(285/800*w, 256/473*h),
      color0
    ));
    this.lines.push(new Light(
      new Vec2(286/800*w, 152/473*h),
      new Vec2(286/800*w, 256/473*h),
      color1
    ));
    
    this.lines.push(new Light(
      new Vec2(328/800*w, 204/473*h),
      new Vec2(354/800*w, 204/473*h),
      color0
    ));
    this.lines.push(new Light(
      new Vec2(328/800*w, 205/473*h),
      new Vec2(354/800*w, 205/473*h),
      color1
    ));
    
    this.lines.push(new Light(
      new Vec2(285/800*w, 314/473*h),
      new Vec2(238/800*w, 361/473*h),
      color0
    ));
    this.lines.push(new Light(
      new Vec2(285/800*w, 315/473*h),
      new Vec2(238/800*w, 362/473*h),
      color2
    ));
    
    this.lines.push(new Light(
      new Vec2(336/800*w, -6/473*h),
      new Vec2(423/800*w, 68/473*h),
      color0
    ));
    
    // 分割线
    this.lines.push(new Wall(
      new Vec2(397/800*w, 0/473*h),
      new Vec2(397/800*w, 473/473*h),
      [0,0,0]
    ));
    
    const l1 = 1.5
    const color10 = [0.15*l1, 0.35*l1, 1.0*l1];
    const color11 = [0.3*l1, 0.3*l1, 0.45*l1];
    // 右边那台
    this.lines.push(new Light(
      new Vec2(410/800*w, 110/473*h),
      new Vec2(485/800*w, 186/473*h),
      color10
    ));
    this.lines.push(new Light(
      new Vec2(410/800*w, 111/473*h),
      new Vec2(485/800*w, 187/473*h),
      color11
    ));
    
    this.lines.push(new Light(
      new Vec2(458/800*w, 218/473*h),
      new Vec2(540/800*w, 218/473*h),
      color10
    ));
    this.lines.push(new Light(
      new Vec2(458/800*w, 219/473*h),
      new Vec2(540/800*w, 219/473*h),
      color11
    ));
    
    this.lines.push(new Light(
      new Vec2(498/800*w, 252/473*h),
      new Vec2(498/800*w, 332/473*h),
      color10
    ));
    this.lines.push(new Light(
      new Vec2(499/800*w, 252/473*h),
      new Vec2(499/800*w, 332/473*h),
      color11
    ));
  }
  
  //                 [rgb]
  IntersectWithScene(intensity, ray, level, t) {
    if (level > 3) return;
    let t0, obj;
    for (let j=0; j<this.lines.length; j++) {
      const l = this.lines[j];
      let tact = l.IntersectRay(ray);
      if (tact != undefined) {
        const t1 = tact[0];
        if (t0 == undefined || t0>t1) {
          t0 = t1;
          obj = l;
        }
      }
    }
    if (obj != undefined) {
      if (obj instanceof Light) {
        {
          let damp = 1000 / (1+exp((t + t0)/130));
          intensity[0] += obj.intensity[0] * damp;
          intensity[1] += obj.intensity[1] * damp;
          intensity[2] += obj.intensity[2] * damp;
        }
      } else if (obj instanceof Wall) {
        let d1 = Vec2.RandDir();
        let wn = obj.n;
        
        if (wn.Dot(ray.d) > 0) { wn = wn.Mult(-1); }
        while (d1.Dot(wn) < 0) {
          d1 = Vec2.RandDir();
        }
        //d1 = wn;
        // 拉回来一点
        let o1 = ray.o.Add(ray.d.Mult(t0));
        o1 = o1.Sub(ray.d.Mult(0.001));
        this.IntersectWithScene(intensity, new Ray(o1, d1), level+1, t+t0);
      }
    }
  }
  Step() {
    if (this.idx >= this.num_pixels) {
      if (g_end_millis == -999) {
        g_end_millis = millis();
        console.log("Elapsed time: " + (g_end_millis - g_start_millis) + "ms")
      }
      return;
    }
    if (this.idx == 0) {
      g_start_millis = millis();
    }
    
    let w, h, x, y;
    while (this.idx < this.num_pixels) {
      let ok = false;
      w = this.g.width; h = this.g.height;
      x = this.idx % w; y = this.idx / w;
      // 208,54 -- 360,372

      DRAW_AREAS.forEach((a) => {
        const x0 = a[0], x1 = a[2], y0 = a[1], y1 = a[3];
        if (x>=x0 && x<x1 && y>=y0 && y<y1) ok = true;
      })
      
      if (ok) {
        break;
      }
      else this.idx++;
    }
    if (this.idx >= this.num_pixels) return;
    
    const nsamp = NSAMP;
    let intensity = [0, 0, 0];
    let o = new Vec2(x + JITTER, y + JITTER);
    
    for (let i=0; i<nsamp; i++) {
      let d = Vec2.RandDir();
      let ray = new Ray(o, d);
      
      let this_intensity = [0,0,0];
      this.IntersectWithScene(this_intensity, ray, 0, 0);
      for (let j=0; j<3; j++) {
        intensity[j] += this_intensity[j] * 1.0 / nsamp;
      }
    }
    
    this.g.stroke(intensity[0], intensity[1], intensity[2]);
    this.g.strokeWeight(1);
    this.g.point(x-0.5, y-0.5); // hack
    this.idx ++;
    this.num_pixels_drawn ++;
  }
  Done() { return this.idx >= this.num_pixels };
}

function draw() {
  const m = millis();
  
  const mode = 1
  
  if (mode == 1) {
    if (g_workitem1.Done()) {
    } else {
      for (let i=0; i<32000/NSAMP; i++)
        g_workitem1.Step();
    }
    image(g_graph, 0, 0, W, H);
    image(g_overlay, 0, 0, W, H);
    push();
    textAlign(LEFT, TOP);
    fill("#338");
    noStroke();
    const n0 = g_workitem1.num_pixels_drawn, n1 = g_num_pixels, pct = parseInt(100*n0/n1);
    text(n0 + "/" + n1 + " pixels drawn (" + pct + "%)", 3, 3);
    pop();
  } else if (mode == 2) {  
    g_ray.d.x = cos(m * 0.001);
    g_ray.d.y = sin(m * 0.001);

    g_graph.background(220);
    g_graph.stroke(0);
    g_graph.fill(255);

    l.Render(g_graph);
    const tact = l.IntersectRay(g_ray);
    if (tact != undefined) {
      g_graph.stroke(0, 128, 0);
      g_graph.line(g_ray.o.x, g_ray.o.y, tact[1].x, tact[1].y);
      g_graph.circle(g_ray.o.x, g_ray.o.y, 5);
      g_graph.circle(tact[1].x, tact[1].y, 5);
    } else {
      g_ray.Render(g_graph);
    }

    g_graph.stroke(0);
    g_graph.circle(mouseX, mouseY, 5);
    g_ray.o.x = mouseX; g_ray.o.y = mouseY;
    image(g_graph, 0, 0, W, H);
    //image(g_overlay, 0, 0, W, H);
  }
}