class BillboardView {
  constructor(mv) {
    this.mapview = mv;
    this.x0 = [ 1, 0, 0 ];
    this.y0 = [ 0, 1, 0 ];
    this.z0 = [ 0, 0, 1 ];
    this.text_size = 12;
    this.num_lines = 50;
    this.tex_w = 160; this.tex_h = 2048;//this.text_size * this.num_lines
    this.texture = createGraphics(this.tex_w, this.tex_h)
    this.texture_lidx = 0; // Texture Line Index
    this.texture_is_dirty = true;
  }
  
  Update(delta_s) {
    let RotPosY = RotYMatrix(this.mapview.rot_y);
    let RotPosX = RotXMatrix(this.mapview.rot_x);
    this.x0 = MatVecMul(RotPosY, MatVecMul(RotPosX, [1, 0, 0]));
    this.y0 = MatVecMul(RotPosY, MatVecMul(RotPosX, [0, 1, 0]));
    this.z0 = MatVecMul(RotPosY, MatVecMul(RotPosX, [0, 0, 1]));
  }
  
  Render(rt) {
    rt.background(0, 0, 0, 0);
    rt.camera();
    rt.rotateX(this.mapview.rot_x);
    rt.rotateY(this.mapview.rot_y);
    
    const zoom = 1 / this.mapview.zoom;
    const xx = this.mapview.longitude * zoom, yy = this.mapview.latitude * zoom;

    // 画个坐标轴试验一下
    if (false) {
      rt.strokeWeight(2);
      
      rt.beginShape(LINES);
      rt.stroke(255, 0, 0);
      rt.vertex(-xx, yy, 0); rt.vertex(-xx + 100 * zoom, yy, 0);
      rt.endShape();
      
      rt.beginShape(LINES);
      rt.stroke(0, 255, 0);
      rt.vertex(-xx, yy, 0); rt.vertex(-xx, yy + 100 * zoom, 0);
      rt.endShape();
      
      rt.beginShape(LINES);
      rt.stroke(0, 0, 255);
      rt.vertex(-xx, yy, 0); rt.vertex(-xx, yy, 100 * zoom);
      rt.endShape();
      
      rt.strokeWeight(1);
    }
    
    /*
    this.RenderBillboard(rt, "", 0, 0, 100);
    */
    
    // 清除贴图。
    this.texture_lidx = 0;
    //this.texture.background(0, 0, 0, 0);
    if (this.texture_is_dirty == true) {
      this.texture.clear();
    }
    rt.blendMode(ADD);
    let gl = document.getElementById('defaultCanvas0').getContext('webgl');
    
    // Render billboard?
    let should_render_billboard = true;
    if (g_billboard_select.value() == BILLBOARD_KEYS[0]) {
    } else {
      const keys = Object.keys(g_curr_kml_snapshot);
      for (let i=0; i<keys.length; i++) {
        const cnt = g_curr_kml_snapshot[keys[i]]
        let c = GetRegionCenter(keys[i]);
        if (c != undefined && cnt[0] > 0) {
          let fill_color = GetColor("/" + keys[i]);
          rt.stroke(fill_color);
          this.RenderBillboard(rt, /*keys[i]*/""+cnt[0], c[0] * zoom, c[1] * zoom,
            20 + log(cnt[0])/log(2)*3,
            fill_color);
        }
      }
    }
    
    this.texture_is_dirty = false;
  }
  
  RenderBillboard(rt, text, x, y, z, fill_color) {
    const lidx = this.texture_lidx; // line index
    this.texture_lidx ++;
    let tx0 = 0, ty0 = lidx * this.text_size;
    // 准备贴图
    this.texture.textSize(this.text_size);
    this.texture.textAlign(LEFT, TOP);
    const tw = this.texture.textWidth(text);
    if (this.texture_is_dirty == true) {
      this.texture.fill(fill_color)
      this.texture.noStroke();
      this.texture.rect(tx0, ty0, tw, this.text_size);
      if (red(fill_color) + green(fill_color) + blue(fill_color) > 128*3) {
        this.texture.fill(0)
      } else {
        this.texture.fill(255);
      }
      this.texture.text(text, tx0, ty0+1);
    }
    let tx1 = tw, ty1 = ty0 + this.text_size;
    
    const zoom = 1 / this.mapview.zoom;
    const xx = this.mapview.longitude * zoom, yy = this.mapview.latitude * zoom;
    
    const RotMinusY = RotYMatrix(-this.mapview.rot_y);
    const RotMinusX = RotXMatrix(-this.mapview.rot_x);
    const bbx = MatVecMul(RotMinusX, MatVecMul(RotMinusY, [1, 0, 0]));
    const bby = MatVecMul(RotMinusX, MatVecMul(RotMinusY, [0, 1, 0]));
    const bbz = MatVecMul(RotMinusX, MatVecMul(RotMinusY, [0, 0, 1]));
    
    // Magic !
    bbx[1] *= -1; bby[1] *= -1; bbz[1] *= -1;
    
    const p00 = [ -xx + x, yy - y, 0 ]
    
    // 排版方式
    const LAYOUT_METHOD = 1;
    let p0;
    if (LAYOUT_METHOD == 1) {
      p0 = [ -xx + x, yy - y, z * zoom ]
    } else {
      const x1 = -width*0.45 + this.texture_lidx * (width / 50)
      p0 = [ x1, 0, 50 ]
    }
    const w = tw, h = this.text_size;
    const p1 = Vec3Add(Vec3Add(p0, Vec3Scale(bbx, -w/2)), Vec3Scale(bby, -h/2));
    const p2 = Vec3Add(Vec3Add(p0, Vec3Scale(bbx,  w/2)), Vec3Scale(bby, -h/2));
    const p3 = Vec3Add(Vec3Add(p0, Vec3Scale(bbx,  w/2)), Vec3Scale(bby,  h/2));
    const p4 = Vec3Add(Vec3Add(p0, Vec3Scale(bbx, -w/2)), Vec3Scale(bby,  h/2));

    
    
    rt.beginShape(LINES);
    rt.vertex(p00[0], p00[1], p00[2]);
    rt.vertex(p0[0],  p0[1],  p0[2] );
    rt.vertex(p1[0], p1[1], p1[2])
    rt.vertex(p2[0], p2[1], p2[2])
    rt.vertex(p2[0], p2[1], p2[2])
    rt.vertex(p3[0], p3[1], p3[2])
    rt.vertex(p3[0], p3[1], p3[2])
    rt.vertex(p4[0], p4[1], p4[2])
    rt.vertex(p4[0], p4[1], p4[2])
    rt.vertex(p1[0], p1[1], p1[2])
    rt.endShape();
    
    rt.texture(this.texture);
    rt.noStroke();
    rt.beginShape();
    rt.vertex(p1[0], p1[1], p1[2], tx0, ty1);
    rt.vertex(p2[0], p2[1], p2[2], tx1, ty1);
    rt.vertex(p3[0], p3[1], p3[2], tx1, ty0);
    rt.vertex(p4[0], p4[1], p4[2], tx0, ty0);
    rt.vertex(p1[0], p1[1], p1[2], tx0, ty1);
    rt.endShape();
    rt.fill(255);
    
    rt.stroke(fill_color);
  }
}