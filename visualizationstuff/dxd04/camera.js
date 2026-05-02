class Camera3 extends Stuff {
  constructor() {
    super()
    this.pos = new p5.Vector(0, 0, 200);
    this.orientation = new Mat3();
  }
  
  Apply(g) {
    let center = this.pos.copy();
    let o = this.orientation;
    center.add(p5.Vector.mult(o.m[2], -1)); // 看向的方向是 -Z
    
    let up = o.m[1];
    g.camera(this.pos.x, this.pos.y, this.pos.z, 
           center.x, center.y, center.z, 
           up.x, up.y, up.z);
  }
  
  GetStatusString() {
    let x =
      "Camera Position Delta, X:" + g_flags[0] +
      ", Y:" + g_flags[1] + ", Z:" + g_flags[2] + "\n" +
      "Camera Rotation Delta: Y:" + g_flags[4] +
      ", X:" + g_flags[3] + ", Z:" + g_flags[5];
    return x
  }
  
  GetGlobalLookDir() { 
    const ret = this.orientation.m[2].copy()
    ret.mult(-1)
    //ret.x = -ret.x;
    ret.y = -ret.y;
    return ret
  }
  
  GetGlobalX() {
    let ret = this.orientation.m[0].copy();
    ret.y = -ret.y;
    return ret;
  }
  
  GetGlobalY() {
    let ret = this.orientation.m[1].copy();
    ret.y = -ret.y
    return ret;
  }
  
  GetPos() {
    let ret = this.pos.copy()
    ret.y = -ret.y
    return ret
  }
  
  // Returns [0, d]
  GetPickRay(mx, my) {
    let gx = this.GetGlobalX(),
        gy = this.GetGlobalY(),
        gz = this.GetGlobalLookDir();
        
    const fovy = PI / 3;
    const x_over_y = width * 1.0 / height;
    
    const dx = ((mx * 1.0 / width) - 0.5) * 2;
    const dy = ((my * 1.0 / height)- 0.5) * (-2)
    
    const y_over_z = tan(fovy/2);
    gy.mult(y_over_z * dy)
    gx.mult(y_over_z * x_over_y * dx)
    gz.sub(gy)
    gz.add(gx)
    gz.normalize()
    
    return gz
  }
}