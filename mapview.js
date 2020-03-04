class MapView {
  constructor(g) {
    this.rot_x = 1;
    this.rot_y = 0;
    
    this.longitude = 20;
    this.latitude  = 50;
    this.zoom      = 0.5;
    
    this.num_verts_line = 0;
    this.num_triangles_fill = 0;
    this.num_poly_drawn = 0;
    
    this.detail_level = 0; // 如果不够就用次一级的
    this.metric_index = 0; // [ 确认、疑似、治愈、死亡 ]
    
    // 用于拾取物体
    this.w = W;
    this.h = H;
    this.cursor_pos = [ 0, 0 ];
    
    this.tact_modelspace = [ undefined, undefined ]; // Model space intersection
    this.tact_path = undefined;
    this.pick_orig = [ undefined, undefined, undefined ];
    this.pick_dir  = [ undefined, undefined, undefined ];
    
    this.dbg_modelspace = [ undefined, undefined, undefined ];
    
    // 上一次渲染时的extrude状态
    this.extrudes = { }
  }
  
  do_PrintNodeNameAndLevel(node, level) {
    var keys = Object.keys(node);
    for (let i=0; i<keys.length; i++) {
      var entry = node[keys[i]]
      var children = entry[1]
      this.do_PrintNodeNameAndLevel(children, level+1)
    }
  }
  
  PrintNodeNameAndLevel() {
    this.do_PrintNodeNameAndLevel(verts, 0);
  }
    
  ExtrudeFunc(reading) {
    return Math.log(1 + reading) / Math.log(2);
  }
  
  do_DrawMap(rt, node, stack, level_cap, skips) {
    if (stack.length > level_cap) return;
    
    var keys = Object.keys(node);
    for (let i=0; i<keys.length; i++) {
      var entry = node[keys[i]];
      var polys = entry[0], children = entry[1];
      let name  = keys[i];
      
      let should_render = true;
      // stack 不包括当前结点
      if (Object.keys(children).length < 1 || stack.length == this.detail_level) {
        should_render = true;
      } else { should_render = false; }
      
      if (should_render) {
        let path = (stack.concat([name])).join("/");
        //let extrude = GetReading(path, "dummy");
        let reading = GetReading(path, "dxy_data")[this.metric_index];
        let extrude = this.ExtrudeFunc(reading);
        let fill_color = GetColor("/" + path);
        
        this.extrudes[path] = extrude;
        
        for (let ip = 0; ip < polys.length; ip++) {
          let outline = polys[ip][0]
          
          var is_highlighted = false;
          var is_outlined = false;
          
          //if (level == 0 && i == g_l0idx) { 
          //  is_highlighted = true; 
          //  is_outlined = true;
          //}
          //if (level >= 1) { is_outlined = true; } 31 fps
          // is_outlined = true; // 5 fps
          if (path == this.tact_path) { is_outlined = true; }
          
          rt.noFill();
          if (is_outlined) {
            if (stack.length == 0) { rt.stroke(0); }
            else { rt.stroke(128); }
            
            rt.beginShape(LINES);
            for (let iip = 0; iip < outline.length; iip += 2) {
              let iip1 = (iip + 2) % outline.length;
              let dx0 =   (outline[iip]   - this.longitude) / this.zoom;
              let dy0 = - (outline[iip+1] - this.latitude ) / this.zoom;
              let dx1 =   (outline[iip1]  - this.longitude) / this.zoom;
              let dy1 = - (outline[iip1+1]- this.latitude ) / this.zoom;
              let dz = extrude / this.zoom;
              rt.vertex(dx0, dy0, dz); rt.vertex(dx1, dy1, dz);
              //rt.vertex(dx0, dy0, dz); rt.vertex(dx0, dy0, 0);
              //rt.vertex(dx1, dy1, dz); rt.vertex(dx1, dy1, 0);
              rt.vertex(dx0, dy0, 0 ); rt.vertex(dx1, dy1, 0);
            }
            this.num_lines_drawn += (outline.length);
            rt.endShape();
          }
          
          let poly = polys[ip][1];
          rt.noStroke();
          
          const FILL_MODE = 0; // 设为0：46 fps；设为1：21 fps
          
          if (is_highlighted) {
            //console.log("Highlighted: " + path)
            rt.fill(0, 0, 255); 
          } else { rt.fill(fill_color); }
          
          if (FILL_MODE == 0) {
            if (reading <= 0 && (is_highlighted == false)) {
              rt.fill(192);
            }
            rt.beginShape(TRIANGLES);
            let skip = skips[stack.length];
            for (let iip = 0; iip < poly.length; iip += 2 * skip) {
              // 对于WebGL的Graphics来说，(0, 0)在画布正中央，所以不像2D的那样需要平移
              let dx =   (poly[iip]  -this.longitude) / this.zoom; // + rt.width/2
              let dy = - (poly[iip+1]- this.latitude) / this.zoom; // + rt.height/2)
              let dz =   extrude / this.zoom
              rt.vertex(dx, dy, dz);
            }
            this.num_triangles_drawn += (poly.length / 3);
            rt.endShape();
            
            rt.fill(fill_color);
            if (reading > 0) {
              
              //rt.fill(fill_color[0]/2, fill_color[1]/2, fill_color[2]/2); // 变暗一点
              rt.fill(lerp(fill_color[0], 0, 0.1),
                      lerp(fill_color[1], 0, 0.1),
                      lerp(fill_color[2], 0, 0.1)); // 变浅一点
              
              rt.beginShape(TRIANGLES);
              for (let iip = 0; iip < outline.length; iip += 2) {
                let iip1 = (iip + 2) % outline.length;
                let dx0 =   (outline[iip]   - this.longitude) / this.zoom;
                let dy0 = - (outline[iip+1] - this.latitude ) / this.zoom;
                let dx1 =   (outline[iip1]  - this.longitude) / this.zoom;
                let dy1 = - (outline[iip1+1]- this.latitude ) / this.zoom;
                let dz  = extrude / this.zoom;
                rt.vertex(dx0, dy0, 0);
                rt.vertex(dx1, dy1, 0);
                rt.vertex(dx1, dy1, dz);
                
                rt.vertex(dx1, dy1, dz);
                rt.vertex(dx0, dy0, dz);
                rt.vertex(dx0, dy0, 0);
              }
              this.num_triangles_drawn += (outline.length * 2);
              rt.endShape();
            }
            
          } else {
            rt.beginShape();
            let skip = skips[stack.length];
            for (let iip = 0; iip < outline.length; iip += 2 * skip) {
              let dx =   (poly[iip]   - this.longitude) / this.zoom; // + rt.width/2
              let dy = - (poly[iip+1]- this.latitude )  / this.zoom; // + rt.height/2)
              rt.vertex(dx, dy);
            }
            this.num_poly_drawn += 1;
            rt.endShape();
          }
          rt.fill(0);
        }
      }
      
      this.do_DrawMap(rt, children, stack.concat([name]), level_cap, skips);
    }
  }
  
  Update(delta_s) { }
  
  Render(rt) {
    this.extrudes = { };
    this.num_lines_drawn = 0;
    this.num_triangles_drawn = 0;
    
    rt.background(220);
    rt.camera();
    rt.rotateX(this.rot_x);
    rt.rotateY(this.rot_y);
    this.do_DrawMap(rt, verts, 
      [], 1,
      [1, 1, 1, 1]); // Skip
    
    rt.fill(0, 0, 255);
    rt.beginShape();
    
    // 确保从摄像机空间与模型空间中画出的位置是一样的
    if (false) {
      let x = this.cursor_pos[0]// * this.zoom,// - this.longitude / this.zoom,
      let y = - this.cursor_pos[1]// * this.zoom;//+ this.latitude / this.zoom;
      rt.vertex(x-10, y+10, 1);
      rt.vertex(x-10, y-10, 1);
      rt.vertex(x+10, y-10, 1);
      rt.vertex(x+10, y+10, 1);
      
      rt.endShape(CLOSE);
      
      rt.fill(255, 128, 128);
      rt.beginShape();
      
      let z;
      x = this.dbg_modelspace[0]; //this.tact_modelspace[0];
      y = this.dbg_modelspace[1]; //this.tact_modelspace[1];
      z = this.dbg_modelspace[2];
      if (x != undefined) {
        let dx0 =   (x - 10 - this.longitude) / this.zoom;
        let dy0 = - (y - 10 - this.latitude) / this.zoom;
        let dx1 =   (x + 10 - this.longitude) / this.zoom;
        let dy1 = - (y + 10 - this.latitude) / this.zoom;
        let dz  = z / this.zoom;
        rt.vertex(dx0, dy1, dz);
        rt.vertex(dx1, dy1, dz);
        rt.vertex(dx1, dy0, dz);
        rt.vertex(dx0, dy0, dz);
      }
      rt.endShape(CLOSE);
    }
  }
  
  GetStatusString() {
    return "面数：" + this.num_triangles_drawn + "，线段数：" +
                this.num_lines_drawn + "，缩放级数：" + this.detail_level
  }
  
  Pan(delta_longitude, delta_latitude) {
    this.longitude += delta_longitude; this.latitude += delta_latitude
  }
  Zoom(delta_zoom) { this.zoom *= delta_zoom; }
  RotY(delta_roty) { this.rot_y += delta_roty; }
  RotX(delta_rotx) { this.rot_x += delta_rotx; }
  
  ChangeDetailLevel(delta) {
    let d = this.detail_level + delta;
    if (d < 0) d = 0;
    else if (d > 3) d = 3;
    this.detail_level = d;
  }
  
  Unproject(dx, dy) { // 将显示的坐标(dx, dy)反向投影到场景中。
    let tx = (2*dx/this.w - 1), ty = (2*dy/this.h - 1) * -1; // Y要倒一倒
    let dy0 = 1, dz0 = Math.sqrt(3), dx0 = dy0 / this.h * this.w;
    //console.log("dxyz0: " + dx0 + " " + dy0 + " " + dz0)
    let probe = [ dx0*tx, dy0*ty, -dz0 ];
    
    // 计算camera在世界坐标中的位置
    let positive_z = [ 0,0,1 ];
    let RotPosY = RotYMatrix(this.rot_y),
        RotPosX = RotXMatrix(this.rot_x),
        RotMinusY = RotYMatrix(-this.rot_y),
        RotMinusX = RotXMatrix(-this.rot_x);
        
    positive_z = MatVecMul(RotMinusY, MatVecMul(RotMinusX, positive_z));
    
    let z_mag = this.h / 2 / Math.tan(PI * 30 / 180);
    let cam_z = positive_z[2] * z_mag;
    let cam_x = positive_z[0] * z_mag;// + this.longitude / this.zoom,
    let cam_y = positive_z[1] * z_mag;// + this.latitude  / this.zoom
    
    //console.log(positive_z);
    //console.log("Cam pos: " + cam_x + ", " + cam_y + ", " + cam_z)
    
    probe = MatVecMul(RotMinusX, MatVecMul(RotPosY, Normalize(probe)));
    //console.log("probe: " + probe)
    
    let k = cam_z / (-probe[2]);
    let xx = cam_x + probe[0] * k,
        yy = cam_y + probe[1] * k;
        
    // 画布空间的交点位置
    this.cursor_pos = [xx, yy];
    
    // 模型空间的交点位置（旧方法，从画布空间的交点位置移回去）
    // xx *= this.zoom; xx += this.longitude; 
    // yy *= this.zoom; yy += this.latitude;
    // this.tact_modelspace = [ xx, yy ];
    
    // 另一种方法计算模型空间的交点位置，好处是可以将原点与方向存下来
    cam_z = cam_z * this.zoom;
    cam_x *= this.zoom; cam_x += this.longitude;
    cam_y *= this.zoom; cam_y += this.latitude;
    k = cam_z / (-probe[2])
    xx = cam_x + probe[0] * k;
    yy = cam_y + probe[1] * k;
    this.tact_modelspace = [ xx, yy ];
    this.pick_orig = [cam_x, cam_y, cam_z];
    this.pick_dir = probe.slice();
    
    is_map_dirty = true;
  }
  
  do_CheckIntersection(node, stack, level_cap, ret) {
    if (ret[0] != undefined) return;
    if (stack.length > level_cap) return;
    var keys = Object.keys(node);
    for (let i=0; i<keys.length; i++) {
      var entry = node[keys[i]];
      var polys = entry[0], children = entry[1];
      let name = keys[i];
      let should_render = true;
      if (Object.keys(children).length < 1 || stack.length == this.detail_level) {
        should_render = true;
      } else { should_render = false; }
      if (should_render) {
        let path = (stack.concat([name])).join("/");
        let extrude = this.extrudes[path];
        if (extrude == undefined) { extrude = 0; }
        
        for (let ip = 0; ip < polys.length; ip++) {
          let poly = polys[ip][1];
          let outline = polys[ip][0];
          
          // 如果 extrude > 0 就和侧边求交点
          if (extrude > 0) {
            for (let iip=0; iip < outline.length; iip += 2) {
              let iip1 = (iip + 1) % outline.length;
              let iip2 = (iip + 2) % outline.length;
              let iip3 = (iip + 3) % outline.length;
              let x0 = outline[iip],  y0 = outline[iip1];
              let x1 = outline[iip2], y1 = outline[iip3];
              let p0 = [ x0, y0, 0 ], p1 = [ x1, y1, 0 ];
              let p2 = [ x0, y0, extrude ];
              let proj = IntersectRayAndPlane(this.pick_orig, this.pick_dir, p0, p1, p2);
              if (proj != undefined) {
                this.dbg_modelspace = proj;
                ret[0] = path;
                return;
              }
            }
          }
          
          // 如果没有extrude，就用在Z=0平面上的交点
          var tact = [ this.tact_modelspace[0], this.tact_modelspace[1], 0 ];
          
          // 不然的话，就计算一下新的交点
          if (extrude > 0) {
            let k = (this.pick_orig[2] - extrude) / (-this.pick_dir[2]);
            let xx = this.pick_orig[0] + this.pick_dir[0] * k;
            let yy = this.pick_orig[1] + this.pick_dir[1] * k;
            //console.log(path + "'s extrude is > 0, tact: " + tact + " > " + xx + yy)
            tact = [xx, yy, 0];
          }
          
          for (let iip=0; iip < poly.length; iip += 6) {
            let a = [poly[iip], poly[iip+1], 0],
                b = [poly[iip+2], poly[iip+3], 0],
                c = [poly[iip+4], poly[iip+5], 0];
            
            // 在这里计算时，把所有点移到Z=0的平面上
            let intersected = PointInTriangle(tact, [a,b,c]);
            
            if (intersected) {
              ret[0] = path;
              return;
            }
          }
        }
      }
      this.do_CheckIntersection(children, stack.concat([name]), level_cap, ret);
    }
  }
  
  CheckIntersection() {
    this.tact_path = undefined;
    let ret = [ undefined ];
    this.do_CheckIntersection(verts, [], 1, ret);
    //console.log("CheckIntersection result: " + ret[0])
    this.tact_path = ret[0];
  }
}



function Vec3Cross(a, b) {
  return [ 
    a[1]*b[2] - b[1]*a[2],
    a[2]*b[0] - b[2]*a[0],
    a[0]*b[1] - b[0]*a[1]
  ];
}
function Vec3Add(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function Vec3Sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function Vec3Dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function Vec3Normalize(x) {
  let l = Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]);
  return [ x[0]/l, x[1]/l, x[2]/l ];
}
function Vec3Scale(a, k) { return [a[0]*k, a[1]*k, a[2]*k]; }

// https://blackpawn.com/texts/pointinpoly/default.html
// p: [x, y]
// tri: [[x0, y0], [x1, y1], [x2, y2]]
function PointInTriangle(p, tri, tolerance = 0) {
  
  let a = tri[0], b = tri[1], c = tri[2];
  let v0 = Vec3Sub(c, a);
  let v1 = Vec3Sub(b, a);
  let v2 = Vec3Sub(p, a);
  let v3 = Vec3Sub(p, b);
  
  let dot00 = Vec3Dot(v0, v0);
  let dot01 = Vec3Dot(v0, v1);
  let dot02 = Vec3Dot(v0, v2);
  let dot11 = Vec3Dot(v1, v1);
  let dot12 = Vec3Dot(v1, v2);
  
  let invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  let u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  let v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  return (u >= -tolerance) && (v >= -tolerance) && (u+v<1+tolerance);
}
// o = 光线原点, d = 光线方向
// p{0,1,2} 形如以下：
//    ^
// p2 |
//    |          法向量为 p0p1 cross p0p2
//    |     p1
// p0 +------->
// 都是3D的点
//
// 只有射线是靠近而非远离平面才算是相交
function IntersectRayAndPlane(o, d, p0, p1, p2) {
  let p0p1 = Vec3Sub(p1, p0), p0p2 = Vec3Sub(p2, p0);
  let n = Vec3Normalize(Vec3Cross(p0p1, p0p2));
  //if (Vec3Dot(n, d) >= 0) return undefined;
  let d0 = Vec3Normalize(d);
  let op0 = Vec3Sub(p0, o), dist = Vec3Dot(n, op0);
  let t = dist / Vec3Dot(n, d0);
  let proj = Vec3Add(o, Vec3Scale(d0, t));
  
  let p3 = Vec3Sub(Vec3Add(p1, p2), p0)
  
  if (PointInTriangle(proj, [p0, p1, p2], 0.04)) {
    return proj; 
  } else if (PointInTriangle(proj, [p3, p2, p1], 0.04)) {
    return proj; 
  }
  else return undefined;
}

function GetRegionCenter(path) {
  const p = verts[path];
  if (p != undefined) { return p[0][0][0]; }
}