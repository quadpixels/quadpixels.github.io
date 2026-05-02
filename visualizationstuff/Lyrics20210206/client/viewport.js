const THRESH = 10;
class Viewport {
  constructor() {
    this.pos = new p5.Vector(0, 0);
    this.rot = 0
    this.scale = 1
    
    this.rot_shake = 0;
    
    this.tween_millis_remaining = 0
    this.tween_duration = 0
    
    this.tween_x     = []
    this.tween_y     = []
    this.tween_scale = []
    
    this.target_pos = undefined;
    
    this.dummy = new p5.Vector(0,0);
    this.x0 = 406; // 总是回到这里
    this.saved_state = "";
  }
  
  // 用于应对UI按钮不需要受Viewport影响的情况
  Save() { this.saved_state = JSON.stringify(this); }
  Load() {
    const s = JSON.parse(this.saved_state);
    Object.assign(this, s);
    this.pos = new p5.Vector(); Object.assign(this.pos, s.pos);
    this.dummy = new p5.Vector(); Object.assign(this.dummy, s.dummy);
  }
  Identity() {
    this.pos.x = width / 2;
    this.pos.y = height / 2;
    this.scale = 1; this.rot = 0;
  }

  Update(delta_millis) {
    this.rot += g_axes[2] * delta_millis * 0.001
    const dx = g_axes[0] * delta_millis * 0.4;
    const dy = g_axes[1] * delta_millis * 0.4;
    
    this.scale = constrain(this.scale * (1 + g_axes[3] * 0.01), 0.1, 5);
    
    this.MoveAlongLocalAxis(dx, dy);
    this.rot_shake *= pow(0.9, delta_millis/16);
    
    const t = 1 - pow(0.9, delta_millis / 16.6);
    // Scrolling
    if (this.target_pos != undefined) {
      
      if (this.target_pos.y < 0) { this.target_pos.y = 0; }
      if (this.target_pos.y > this.ymax) { this.target_pos.y = this.ymax; }
      
      const dist_sq = this.pos.copy().sub(this.target_pos).magSq();
      if (dist_sq < THRESH) {
        this.pos = this.target_pos.copy();
      } else {
        this.pos.x = lerp(this.pos.x, this.target_pos.x, t);
        this.pos.y = lerp(this.pos.y, this.target_pos.y, t);
      }
    }
    
    {
      if (this.pos.y < 0) { this.pos.y = lerp(this.pos.y, 0, t); }
      if (this.pos.y > this.ymax) { this.pos.y = lerp(this.pos.y, this.ymax, t); }
    }
  }
  
  GetTweenCompletion() {
    if (this.tween_duration <= 0) return 0;
  }
  
  GetRot() {
    return this.rot + this.rot_shake;
  }
  
  ScrollY(delta) {
    if (this.target_pos == undefined) {
      this.target_pos = this.pos.copy();
    } else {
      const dist_sq = this.pos.copy().sub(this.target_pos).magSq();
      if (dist_sq <= THRESH) {
        this.target_pos = this.pos.copy();
      }
    }
    this.target_pos.y += delta;
  }
  
  // https://matthew-brett.github.io/teaching/rotation_2d.html
  Apply() {
    const s = this.scale;
    const r = this.GetRot();
    const cr = cos(r), sr = sin(r);
    const dx1 = s*(cr * this.pos.x - sr * this.pos.y), dy1 = s*(sr * this.pos.x + cr * this.pos.y);
    const dx = width/2 - dx1, dy = height/2 - dy1;
    
    translate(dx, dy);
    rotate(r);
    scale(s);
  }
  
  Apply3D(g) {
    const s = this.scale;
    const r = this.GetRot();
    const cr = cos(r), sr = sin(r);
    const dx1 = s*(cr * this.pos.x - sr * this.pos.y), dy1 = s*(sr * this.pos.x + cr * this.pos.y);
    const dx = -dx1, dy = -dy1;
    
    g.translate(dx, dy);
    g.rotateZ(r);
    g.scale(s);
  }
  
  Zoom(x) {
    this.scale *= x;
    this.scale = constrain(this.scale, 0.1, 5);
  }
  
  MoveAlongLocalAxis(lx, ly) {
    // TODO：为什么这里要取负号
    const cr = cos(-this.rot), sr = sin(-this.rot);
    this.pos.x += lx * cr - ly * sr;
    this.pos.y += lx * sr + ly * cr;
  }
  
  ToString() {
    return "x=" + this.pos.x.toFixed(1) + ", y=" + this.pos.y.toFixed(1) + ", rot=" + this.rot.toFixed(2) + ", scale=" + this.scale.toFixed(2);
  }
  
  ToLocalPoint(mx, my) { // Viewport to local
    // TODO：为什么这里要取负号
    const ct = cos(-this.rot), st = sin(-this.rot);
    const x0 = new p5.Vector(ct, st);
    const y0 = new p5.Vector(-st, ct);
    const dx = (mx - width/2) / this.scale, dy = (my - height/2) / this.scale;
    
    const x = this.pos.x + (x0.x) * dx + (y0.x) * dy;
    const y = this.pos.y + (x0.y) * dx + (y0.y) * dy;
    let ret = new p5.Vector(x, y);
    this.dummy = ret;
    return ret;
  }
  
  ToViewportPoint(lx, ly) {
    const ct = cos(-this.rot), st = sin(-this.rot);
    const dx = lx - this.pos.x, dy = ly - this.pos.y;
    const x = width/2 + (dx * ct + dy * st) * this.scale;
    const y = height/2 - (dx * st - dy * ct) * this.scale;
    return new p5.Vector(x, y);
  }
  
  SetPos(p) {
    this.pos.x = 0; this.pos.y = 0;
    this.MoveAlongLocalAxis(p.x, p.y);
  }
  
  StartDrag() {
    this.target_pos = undefined;
    this.pos_backup = this.pos.copy();
  }
  
  ApplyTemporaryDrag(dx, dy) { // 拖动的过程中
    const ct = cos(-this.rot), st = sin(-this.rot);
    const x0 = new p5.Vector(ct, st), y0 = new p5.Vector(-st, ct);
    const x = (x0.x * dx + y0.x * dy) / this.scale;
    const y = (x0.y * dx + y0.y * dy) / this.scale;
    this.pos = this.pos_backup.copy();
    this.pos.x += x;
    this.pos.y += y;
    
    /*
    if (dx < 0) { this.rot_shake += 0.01; }
    if (dx > 0) { this.rot_shake -= 0.01; }
    */
  }
  
  DrawPointer() {
    // Dummy
    push();
    fill(255); stroke(0);
    circle(this.dummy.x, this.dummy.y, 10);
    pop();
  }
  
  IsVisible(w) { // World point visible?
    
  }
}