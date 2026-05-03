let g_graph;
const W = 640, H = 640;
const NSAMP = 8;

const JITTER = 0.04

let g_workitem1;
let g_start_millis = -999, g_end_millis = -999;

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
    
    const w = this.g.width, h = this.g.height;
    const hw = this.g.width * 0.5, hh = this.g.height * 0.5;
    const r = 120;
    this.lines = []
    /*
    this.lines.push(new Light(new Vec2(hw-r, hh), new Vec2(hw, hh-r), [1, .1,.1]));
    this.lines.push(new Light(new Vec2(hw*2-32, 0), new Vec2(hw*2, 32), [.1,1,.1]));
    this.lines.push(new Light(new Vec2(hw+r, hh), new Vec2(hw, hh+r), [.1,.1,1]));
    //this.lines.push(new Light(new Vec2(hw, hh+r), new Vec2(hw-r, hh), [0.5,0.5,.1]));
    this.lines.push(new Wall(new Vec2(0, 0), new Vec2(2*hw, 0)));
    //this.lines.push(new Wall(new Vec2(2*hw, 0), new Vec2(2*hw, 2*hh)));
    //this.lines.push(new Wall(new Vec2(2*hw, 2*hh), new Vec2(0, 2*hh)));
    //this.lines.push(new Wall(new Vec2(0, 2*hh), new Vec2(0, 0)));
    this.lines.push(new Wall(new Vec2(hw-4, hh-32), new Vec2(hw-4, hh+32)));
    this.lines.push(new Wall(new Vec2(hw+4, hh-32), new Vec2(hw+4, hh+32)));
    this.lines.push(new Wall(new Vec2(hw-4, hh-32), new Vec2(hw+4, hh-32)));
    this.lines.push(new Wall(new Vec2(hw-4, hh+32), new Vec2(hw+4, hh+32)));
    */
    
    this.lines.push(new Wall(new Vec2(0.04*w, 0), 
                              new Vec2(0.97*w, 0),
                             [0.2, 0.2, 0.2]));
    this.lines.push(new Light(new Vec2(w, 0), new Vec2(w, h), [0.2,0.2,0.2]));
    this.lines.push(new Light(new Vec2(w, h), new Vec2(0,h), [0.3,0.3,0.2]));
    this.lines.push(new Light(new Vec2(0, h), new Vec2(0, 0), [0.2,0.2,0.2]));
    
    // 硅
    this.lines.push(new Light(
      new Vec2(0.06*w, 0.12*h),
      new Vec2(0.229*w, 0.104*h),
      [0.5, 0.5, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.142*w, 0.115*h),
      new Vec2(0.053*w, 0.239*h),
      [0.4, 0.4, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.114*w, 0.184*h),
      new Vec2(0.111*w, 0.257*h),
      [0.3, 0.3, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.104*w, 0.174*h),
      new Vec2(0.176*w, 0.167*h),
      [0.2, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.176*w, 0.167*h),
      new Vec2(0.194*w, 0.254*h),
      [0.3, 0.3, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.111*w, 0.264*h),
      new Vec2(0.194*w, 0.267*h),
      [0.5, 0.5, 0]
    ));
    
    this.lines.push(new Light(
      new Vec2(0.268*w, 0.109*h),
      new Vec2(0.412*w, 0.118*h),
      [0.5, 0.5, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.247*w, 0.176*h),
      new Vec2(0.457*w, 0.174*h),
      [0.4, 0.4, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.278*w, 0.250*h),
      new Vec2(0.404*w, 0.240*h),
      [0.4, 0.4, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.214*w, 0.320*h),
      new Vec2(0.478*w, 0.316*h),
      [0.3, 0.3, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.337*w, 0.054*h),
      new Vec2(0.346*w, 0.318*h),
      [0.4, 0.4, 0]
    ));
    
    // 谷
    this.lines.push(new Light(
      new Vec2(0.649*w, 0.065*h),
      new Vec2(0.616*w, 0.137*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.791*w, 0.051*h),
      new Vec2(0.868*w, 0.117*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.649*w, 0.065*h),
      new Vec2(0.616*w, 0.137*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.734*w, 0.103*h),
      new Vec2(0.533*w, 0.281*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.720*w, 0.106*h),
      new Vec2(0.972*w, 0.282*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.637*w, 0.219*h),
      new Vec2(0.626*w, 0.345*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Wall(
      new Vec2(0.672*w, 0.211*h),
      new Vec2(0.847*w, 0.207*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.847*w, 0.207*h),
      new Vec2(0.867*w, 0.352*h),
      [0.0, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.626*w, 0.346*h),
      new Vec2(0.867*w, 0.349*h),
      [0.0, 0.2, 0.4]
    ));
    
    // 脱
    // 月
    this.lines.push(new Light(
      new Vec2(0.060*w, 0.413*h),
      new Vec2(0.03*w, 0.706*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.065*w, 0.413*h),
      new Vec2(0.171*w, 0.389*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.171*w, 0.389*h),
      new Vec2(0.155*w, 0.709*h),
      [0.4, 0.15, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.155*w, 0.709*h),
      new Vec2(0.117*w, 0.671*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.067*w, 0.493*h),
      new Vec2(0.143*w, 0.491*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.071*w, 0.585*h),
      new Vec2(0.135*w, 0.575*h),
      [0.4, 0.2, 0]
    ));
    // 兑
    this.lines.push(new Light(
      new Vec2(0.213*w, 0.393*h),
      new Vec2(0.237*w, 0.443*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.315*w, 0.393*h),
      new Vec2(0.293*w, 0.441*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.203*w, 0.461*h),
      new Vec2(0.195*w, 0.555*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.208*w, 0.458*h),
      new Vec2(0.349*w, 0.439*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.349*w, 0.439*h),
      new Vec2(0.345*w, 0.539*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.195*w, 0.559*h),
      new Vec2(0.345*w, 0.539*h),
      [0.3, 0.15, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.349*w, 0.439*h),
      new Vec2(0.345*w, 0.539*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.227*w, 0.577*h),
      new Vec2(0.193*w, 0.699*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.349*w, 0.439*h),
      new Vec2(0.345*w, 0.539*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.281*w, 0.563*h),
      new Vec2(0.267*w, 0.695*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.267*w, 0.695*h),
      new Vec2(0.353*w, 0.699*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.267*w, 0.695*h),
      new Vec2(0.353*w, 0.699*h),
      [0.4, 0.2, 0]
    ));
    this.lines.push(new Light(
      new Vec2(0.353*w, 0.699*h),
      new Vec2(0.353*w, 0.635*h),
      [0.4, 0.2, 0]
    ));
    // 口
    this.lines.push(new Light(
      new Vec2(0.399*w, 0.461*h),
      new Vec2(0.397*w, 0.645*h),
      [0.1, 0.3, 0.1]
    ));
    this.lines.push(new Light(
      new Vec2(0.401*w, 0.457*h),
      new Vec2(0.607*w, 0.439*h),
      [0.1, 0.3, 0.1]
    ));
    this.lines.push(new Light(
      new Vec2(0.607*w, 0.439*h),
      new Vec2(0.605*w, 0.644*h),
      [0.1, 0.3, 0.1]
    ));
    this.lines.push(new Light(
      new Vec2(0.397*w, 0.635*h),
      new Vec2(0.625*w, 0.615*h),
      [0.1, 0.3, 0.1]
    ));
    
    // 秀
    // 禾
    this.lines.push(new Light(
      new Vec2(0.851*w, 0.385*h),
      new Vec2(0.699*w, 0.433*h),
      [0.4, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.673*w, 0.463*h),
      new Vec2(0.869*w, 0.463*h),
      [0.4, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.775*w, 0.413*h),
      new Vec2(0.777*w, 0.527*h),
      [0.4, 0.2, 0.4]
    ));
    this.lines.push(new Wall(
      new Vec2(0.757*w, 0.463*h),
      new Vec2(0.661*w, 0.515*h),
      [0.2, 0.1, 0.2]
    ));
    this.lines.push(new Wall(
      new Vec2(0.795*w, 0.465*h),
      new Vec2(0.871*w, 0.523*h),
      [0.2, 0.1, 0.2]
    ));
    // 乃
    this.lines.push(new Light(
      new Vec2(0.695*w, 0.559*h),
      new Vec2(0.863*w, 0.549*h),
      [0.5, 0.25, 0.5]
    ));
    this.lines.push(new Light(
      new Vec2(0.863*w, 0.549*h),
      new Vec2(0.845*w, 0.617*h),
      [0.2, 0.1, 0.2]
    ));
    this.lines.push(new Light(
      new Vec2(0.845*w, 0.617*h),
      new Vec2(0.895*w, 0.621*h),
      [0.4, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.895*w, 0.621*h),
      new Vec2(0.865*w, 0.699*h),
      [0.2, 0.1, 0.2]
    ));
    this.lines.push(new Light(
      new Vec2(0.865*w, 0.699*h),
      new Vec2(0.819*w, 0.701*h),
      [0.4, 0.2, 0.4]
    ));
    this.lines.push(new Light(
      new Vec2(0.765*w, 0.567*h),
      new Vec2(0.687*w, 0.715*h),
      [0.4, 0.2, 0.4]
    ));
    
    
    
    /*{ // G
      const x0 = 0.1*w, x1 = 0.15*w, x2 = 0.2*w, y1 = 0.30*h, y2 = 0.45*h, y0 = 0.15*h;
      this.lines.push(new Light(new Vec2(x1, y1), new Vec2(x2, y1),[0.5,0.0,0.0]));
      this.lines.push(new Wall(new Vec2(x2, y1), new Vec2(x2, y2), [0.3,0.0,0.0]));
      this.lines.push(new Light(new Vec2(x0, y2), new Vec2(x2, y2), [0.5,0.0,0.0]));
      this.lines.push(new Wall(new Vec2(x0, y2), new Vec2(x0, y0), [0.3,0.0,0.0]));
      this.lines.push(new Light(new Vec2(x0, y0), new Vec2(x2, y0), [0.5,0.0,0.0]));
    }
    { // A
      const x0 = 0.275*w, x1 = 0.325*w, x2 = 0.375*w, y1 = 0.30*h, y2 = 0.45*h, y0 = 0.15*h, y3 = 0.35*h;
      this.lines.push(new Wall(new Vec2(x1, y0), new Vec2(x2, y1),[0.0,0.3,0.0]));
      this.lines.push(new Wall(new Vec2(x1, y0), new Vec2(x0, y1),[0.0,0.3,0.0]));
      this.lines.push(new Light(new  Vec2(x0, y3), new Vec2(x2, y3),[0.0,0.5,0.0]));
      //this.lines.push(new Wall(new Vec2(x0+w*0.01, y1-h*0.01), new Vec2(x2-w*0.01, y1-h*0.01),[0.0,1.0,0.0]));
      this.lines.push(new Wall(new Vec2(x0, y1), new Vec2(x0, y2)));
      this.lines.push(new Wall(new Vec2(x2, y1), new Vec2(x2, y2)));
    }
    { // M
      const x0 = 0.45*w, x1 = 0.5*w, x2 = 0.55*w, y1 = 0.30*h, y2 = 0.45*h, y0 = 0.15*h;
      this.lines.push(new Wall(new Vec2(x0,y0), new Vec2(x0,y2)));
      this.lines.push(new Light(new Vec2(x0,y0), new Vec2(x1,y2), [0.5,0.5,0.0]));
      this.lines.push(new Light(new Vec2(x2,y0), new Vec2(x1,y2), [0.5,0.5,0.0]));
      this.lines.push(new Wall(new Vec2(x2,y0), new Vec2(x2,y2)));
    }
    { // E
      const x0 = 0.625*w, x1 = 0.675*w, x2 = 0.725*w, y1 = 0.30*h, y2 = 0.45*h, y0 = 0.15*h;
      this.lines.push(new Wall(new Vec2(x0,y0), new Vec2(x0,y2), [0,0.5,0.5]));
      this.lines.push(new Light(new Vec2(x0,y0), new Vec2(x2,y0), [0,0.5,0.5]));
      this.lines.push(new Light(new Vec2(x0,y2), new Vec2(x2,y2), [0,0.5,0.5]));
      this.lines.push(new Light(new Vec2(x0,y1), new Vec2(x1,y1), [0,0.5,0.5]));
    }
    { // S
      const x0 = 0.80*w, x1 = 0.85*w, x2 = 0.90*w, y1 = 0.30*h, y2 = 0.45*h, y0 = 0.15*h;
      this.lines.push(new Light(new Vec2(x0,y0), new Vec2(x2,y0), [0.5,0.2,0.2]));
      this.lines.push(new Wall(new Vec2(x0,y0), new Vec2(x0,y1), [0.5,0.2,0.2]));
      this.lines.push(new Light(new Vec2(x0,y1), new Vec2(x2,y1), [0.5,0.2,0.2]));
      this.lines.push(new Wall(new Vec2(x2,y1), new Vec2(x2,y2), [0.5,0.2,0.2]));
      this.lines.push(new Light(new Vec2(x0,y2), new Vec2(x2,y2), [0.5,0.2,0.2]));
    }
    // 2
    {
      const x0 = 0.25*w, x1 = 0.3*w, x2 = 0.35*w, y1 = 0.7*h, y2 = 0.85*h, y0 = 0.55*h;
      this.lines.push(new Wall(new Vec2(x0,y0), new Vec2(x2,y0)));
      this.lines.push(new Light(new Vec2(x2,y0), new Vec2(x2,y1), [0.3,0.3,0.7]));
      this.lines.push(new Wall(new Vec2(x0,y1), new Vec2(x2,y1), [0.3,0.3,0.7]));
      this.lines.push(new Light(new Vec2(x0,y1), new Vec2(x0,y2), [0.3,0.3,0.7]));
      this.lines.push(new Wall(new Vec2(x0,y2), new Vec2(x2,y2)));
    }
    // 0
    {
      const x0 = 0.45*w, x1 = 0.5*w, x2 = 0.55*w, y1 = 0.7*h, y2 = 0.85*h, y0 = 0.55*h;
      this.lines.push(new Wall(new Vec2(x0,y0), new Vec2(x2,y0), [0.2,0.2,0.4]));
      this.lines.push(new Light(new Vec2(x2,y0), new Vec2(x2,y2), [0.2,0.2,0.4]));
      this.lines.push(new Wall(new Vec2(x2,y2), new Vec2(x0,y2), [0.2,0.2,0.42]));
      this.lines.push(new Light(new Vec2(x0,y0), new Vec2(x0,y2), [0.2,0.2,0.4]));
    }
    // 1
    {
      const x0 = 0.65*w, x1 = 0.7*w, x2 = 0.75*w, y1 = 0.7*h, y2 = 0.85*h, y0 = 0.55*h;
      this.lines.push(new Wall(new Vec2(x1,y0), new Vec2(x1-0.05*w,y0+0.075*h), [0.4,0.4,0.8]));
      this.lines.push(new Light(new Vec2(x1,y0), new Vec2(x1,y2), [0.4, 0.4, 0.8]));
      this.lines.push(new Wall(new Vec2(x2,y2), new Vec2(x0,y2)));
      
      this.lines.push(new Light(new Vec2(0.15*w, 0.5*h), new Vec2(0.15*w, 0.9*h), [0.6,0.6,1.4]))
      this.lines.push(new Light(new Vec2(0.85*w, 0.5*h), new Vec2(0.85*w, 0.9*h), [0.6,0.6,1.4]))
      this.lines.push(new Light(new Vec2(w*0.15, h*0.95), new Vec2(w*0.85,h*0.95), [0.6,0.6,1.4]));
      this.lines.push(new Light(new Vec2(0.05*w, 0.05*h), new Vec2(0.95*w, 0.05*h), [0.3,0.6,0.6]));
      this.lines.push(new Light(new Vec2(0.05*w, 0.1*h), new Vec2(0.05*w, 0.5*h), [0.1,0.2,0.2]));
      this.lines.push(new Light(new Vec2(0.95*w, 0.1*h), new Vec2(0.95*w, 0.5*h), [0.1,0.2,0.2]));
    }*/
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
          let damp = 1000 / (1+exp((t + t0)/60));
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
    
    const w = this.g.width, h = this.g.height;
    const x = this.idx % w, y = this.idx / w;
    
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
  }
  Done() { return this.idx >= this.num_pixels };
}

function draw() {
  const m = millis();
  
  const mode = 1
  
  if (mode == 1) {
    if (g_workitem1.Done()) {
    } else {
      for (let i=0; i<2560/NSAMP; i++)
        g_workitem1.Step();
    }
    image(g_graph, 0, 0, W, H);
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
  }
}