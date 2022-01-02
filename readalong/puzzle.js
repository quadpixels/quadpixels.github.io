// readalong puzzle editor
//
// WASD 控制的是【cam】移动的方向，而在触摸UI中，控制的是【东西】移动的方向
//

let g_suppress_textures = false;
let g_models = {};
let g_texes = {};
let g_tex;
let g_highlighted_obj = undefined;
let g_highlighted_obj_idx = -1;
let g_puzzle_vis;

let g_rotY = 0;
let g_rotX = 0;
let g_flags = [ 0,0,0,0,0 ];
let g_puzzle_director;

let g_cam;
let g_axis = [ 0, 0, 0, 0, 0, 0, 0 ]; // Pan x, pan y, pan z, shift, move x, move y, move z
let g_crystal_speed = [0, 0, 0]; // x and y
let g_rot_inertia = [0, 0];

function preload() {
  Object.values(OBJ_DATASET).forEach((entry) => {
    entry.objs.forEach((objname) => {
      const m = loadModel("objs/" + objname);
      g_models[objname] = m;
    })
    let tex = entry.texture;
    if (tex != undefined) {
      g_texes[tex] = loadImage("textures/" + tex);
    }
  });
}

function SetupPuzzle() {
  g_cam = new Camera3();
  //g_cam.RotateAlongGlobalAxis(new p5.Vector(1, 0, 0), -PI*0.6);
  g_cam.pos = new p5.Vector(0, 0, 20);
  g_puzzle_vis = new PuzzleViz();
  LoadPuzzleDataset("coffin4");
}

function LoadPuzzleDataset(name) {
  if (g_puzzle_vis == undefined) return;
  let entry = OBJ_DATASET[name];
  g_puzzle_vis.objects = [];

  g_tex = undefined;
  if (entry.texture != undefined) {
    g_tex = g_texes[entry.texture];
  }

  entry.objs.forEach((objname) => {
    let o = new ObjModel(g_models[objname]);
    if (g_tex != undefined) {
      o.material = "texture";
      o.texture = g_tex;
    } else {
      o.material = "diffuse";
    }
    o.scale.y = -1;
    g_puzzle_vis.objects.push(o);
  });
  
  g_puzzle_director = new PuzzleDirector(g_puzzle_vis.objects);
}

class PuzzleViz {
  static CELL_SIZE = 90;
  static UCOORDS = [0.2, 0.4, 0.6, 0.8];
  constructor() {
    this.x = 4;
    this.y = 57;
    this.w = 472;
    this.h = 440;
    this.graph3d = createGraphics(this.w, this.h, WEBGL);
    this.objects = [];
  }
  
  DrawGrid() {
    push();

    stroke(32);
    fill(255);
    rect(0, 0, this.w, this.h);

    rectMode(CENTER);
    noStroke();
    fill(240);
    const us = PuzzleViz.UCOORDS;
    const ys = [ this.h-32-PuzzleViz.CELL_SIZE*0.5, this.h-32-PuzzleViz.CELL_SIZE*1.5 ];
    for (let y=0; y<ys.length; y++) {
      for (let x=0; x<us.length; x++) {
        const dx = us[x]*this.w, dy = ys[y];
        rect(dx, dy, PuzzleViz.CELL_SIZE-20, PuzzleViz.CELL_SIZE-20);
      }
    }
    pop();
  }


  Render() {
    const ms = millis();
    const delta_ms = ms - g_last_ms;
    if (g_frame_count > 0) {
      const d = delta_ms / 16 * 3;
      const cs = g_crystal_speed;
      const THRESH = 0.00001;
      const SPEED_MULT = 5;
  
      const damp = pow(0.97, delta_ms/16);
      for (let i=0; i<3; i++) {
        if (g_axis[i] != 0) {
          cs[i] = lerp(g_axis[i]*SPEED_MULT, cs[i], damp);
        }
      }
  
      const damp2 = pow(0.95, delta_ms/16);
      if (abs(cs[0]) > THRESH ) {
        CrystalBallMoveCamera(new p5.Vector(0,1,0), d*0.01*cs[0]);
        cs[0] *= damp2;
      } else cs[0] = 0;
  
      if (abs(cs[1]) > THRESH ) {
        CrystalBallMoveCamera(new p5.Vector(1,0,0), d*0.01*cs[1]);
        cs[1] *= damp2;
      } else cs[1] = 0;
  
      if (abs(cs[2]) > THRESH ) {
        CrystalBallMoveCamera(new p5.Vector(0,0,1), d*0.01*cs[2]);
        cs[2] *= damp2;
      } else cs[2] = 0;
  
      // Inertia
      if (abs(g_rot_inertia[0]) > THRESH) {
        CrystalBallMoveCamera(new p5.Vector(0,1,0), g_rot_inertia[0]*SPEED_MULT);
        g_rot_inertia[0] *= damp2;
      } else {
        g_rot_inertia[0] = 0;
      }
  
      if (abs(g_rot_inertia[1]) > THRESH) {
        CrystalBallMoveCamera(new p5.Vector(1,0,0), g_rot_inertia[1]*SPEED_MULT);
        g_rot_inertia[1] *= damp2;
      } else {
        g_rot_inertia[1] = 0;
      }
  
      let o = CurrentHighlightedObject();
      if (o != undefined) {
        o.pos.x += g_axis[4]*d*0.01;
        o.pos.y += g_axis[5]*d*0.01;
        o.pos.z += g_axis[6]*d*0.01;
      }
      // 以下为之前所用的平移视角
      /*
      if (g_axis[3] == 1) {
        g_cam_pos_target.add(g_cam.orientation.m[2].copy().mult(-d));
      }
      if (g_axis[3] == -1) {
        g_cam_pos_target.add(g_cam.orientation.m[2].copy().mult(d));
      }*/
    }

    this.graph3d.push();
    this.graph3d.resetMatrix();
    this.graph3d.camera();
    
    g_cam.Apply(this.graph3d);
    let lightDir = new p5.Vector(0, 0, -1);
    lightDir = g_cam.ToGlobalDirection(lightDir);
    this.graph3d.directionalLight(250, 250, 250, lightDir);
    this.graph3d.ambientLight(50);
  
    this.graph3d.scale(1, -1);
    
    this.graph3d.clear();
    this.graph3d.fill(255);
    this.graph3d.stroke(128);
    this.graph3d.perspective(PI/3.0, this.w*1.0/this.h, 0.1, 10000);
  
    if (g_tex != undefined) {
      this.graph3d.texture(g_tex);
    }

    g_puzzle_director.Update(delta_ms);

    this.objects.forEach((o) => {
      o.Render(this.graph3d);
    });
  
    this.graph3d.pop();

    // ================= 真正在画布上画东西
    push();
    translate(this.x, this.y);
    this.DrawGrid();
    image(this.graph3d, 0, 0, this.w, this.h);
  
    // push();
    // lights();
    // noStroke();
    // rotateY(g_rotY);
    // rotateX(g_rotX);
    // texture(g_tex);
    // scale(50);
    
    // g_models.forEach((m) => {
    //   model(m);
    // });
    // pop();
    
    // let dy = 0.01;
    // if (g_flags[2] == 1) dy = 0.001;
    // g_rotY += dy * deltaTime * g_flags[0];
    
    // let dx = 0.01;
    // if (g_flags[2] == 1) dx = 0.001;
    // g_rotX += dx * deltaTime * g_flags[1];
    g_frame_count ++;
    g_last_ms = ms;
    noStroke();
    fill(32);
    const p = g_cam.pos;
    textAlign(LEFT, TOP);

    const SHOW_DEBUG_TEXT = false;

    if (SHOW_DEBUG_TEXT) {
      text("Cam:" + p.x.toFixed(1) + ", " 
                  + p.y.toFixed(1) + ", "
                  + p.z.toFixed(1)// + " ptr: " + g_pointer_x + ", " + g_pointer_y
                  ,3, 3);
      text("Crystalball: " + g_crystal_speed[0].toFixed(2) + ", " +
                            g_crystal_speed[1].toFixed(2) + ", " +
                            g_crystal_speed[2].toFixed(2)
                            + " rot_inertia: " + g_rot_inertia[0].toFixed(5) + ", " + g_rot_inertia[1].toFixed(5), 3, 16)
      let txt = "Selected: ";
      if (g_highlighted_obj_idx == -1) {
        txt += "None";
      } else {
        txt += "[" + g_highlighted_obj_idx + "]";
      }
      text(txt, 3, 29);
    
      if (g_highlighted_obj_idx != -1) {
        const o = CurrentHighlightedObject();
        txt = "Pos: " + o.pos.x.toFixed(1) + ", "
                      + o.pos.y.toFixed(1) + ", "
                      + o.pos.z.toFixed(1);
        text(txt, 3, 42);
      }
    }
  
    // Crosshair
    const l = 10;
    const mx = (g_pointer_x - g_puzzle_vis.x) / g_scale;
    const my = (g_pointer_y - g_puzzle_vis.y) / g_scale;
    stroke(32);
    line(mx - l, my, mx + l, my);
    line(mx, my - l, mx, my + l);

    pop();
  }
  
  // 视觉上希望用户看到的位置与世界坐标系中的位置的关系
  PreferredOnScreenPosToWorldPos(reload_idx) {
    let rx, ry, dist;
    if (reload_idx != -999) {
      const uvs = PuzzleViz.UCOORDS;
      const row = parseInt(reload_idx / uvs.length);
      const col = reload_idx % uvs.length;
      ry = this.h - 32 - PuzzleViz.CELL_SIZE * (0.5 + row);
      rx = this.w * uvs[col];
      dist = 60;
    } else {
      ry = this.h / 3;
      rx = this.w / 2;
      dist = 20;
    }

    const p0 = g_cam.pos.copy();
    p0.y *= -1; // 这个地方比较坑爹 :)
    const pick_ray = g_cam.GetPickRay(rx, ry, this.w, this.h);
    const ret = p0.add(pick_ray.mult(dist));
    return ret;
  }

  IsHovered(mx, my) {
    if (mx >= this.x && my >= this.y &&
      mx <= this.x + this.w &&
      my <= this.y + this.h) return true;
    else return false;
  }
}

function ComputeBoundingBox(obj) {
  let ub = new p5.Vector(-1e9, -1e9, -1e9);
  let lb = new p5.Vector( 1e9,  1e9,  1e9);
  obj.vertices.forEach((v) => {
    ub.x = max(ub.x, v.x);
    ub.y = max(ub.y, v.y);
    ub.z = max(ub.z, v.z);
    lb.x = min(lb.x, v.x);
    lb.y = min(lb.y, v.y);
    lb.z = min(lb.z, v.z);
  });
  return [lb, ub];
}

class PuzzleDirector {
  constructor(objects) {
    this.num_staging_max = 6;
    this.objects = objects;
    const N = objects.length;
    
    this.positions_orig = [];
    this.positions = [];
    this.bb_centers = [];

    for (let i=0; i<N; i++) {
      const bb = ComputeBoundingBox(objects[i].obj);
      const bbcenter = bb[0].copy().add(bb[1]).mult(0.5);
      bbcenter.y *= -1;
      this.bb_centers.push(bbcenter);
    }

    this.num_solved = 0;
    this.do_UpdatePoses();
  }

  Update(ms) {
    this.do_UpdatePoses();
    for (let i=0; i<this.objects.length; i++) {
      this.objects[i].pos = this.positions[i].copy();
    }
  }

  // Update主要有两步：
  // 1. 插值
  // 2. 根据camera中raycast的位置设置世界坐标系中的位置
  do_UpdatePoses() {
    for (let i=this.num_solved, j=0; i<this.objects.length; i++, j++) {
      const o = this.objects[i];
      if (j >= this.num_staging_max) {
        o.visible = false;
      } else {
        o.visible = true;
      }
      this.positions[i] = g_puzzle_vis.PreferredOnScreenPosToWorldPos(j);
      this.positions[i].add(o.ToGlobalDirection(this.bb_centers[i].copy().mult(-1)));
    }
    for (let i=0; i<this.num_solved; i++) {
      this.positions[i] = g_puzzle_vis.PreferredOnScreenPosToWorldPos(-999);
    }
  }

  NextStep() {
    this.num_solved++;
    if (this.num_solved > this.objects.length) {
      this.num_solved = this.objects.length;
    }
    this.do_UpdatePoses();
  }

  PrevStep() {
    this.num_solved--;
    if (this.num_solved < 0) {
      this.num_solved = 0;
    }
    this.do_UpdatePoses();
  }

  StartDrag(mx, my) {
    this.is_dragging = true;
    this.drag_start_mx = mx;
    this.drag_start_my = my;
    this.last_mx = mx; this.last_my = my;
  }
  EndDrag() {
    this.is_dragging = false;
  }
  UpdateDrag(mx, my) {
    if (!this.is_dragging) return;
    const deltax = mx - this.last_mx, deltay = my - this.last_my;
    this.last_mx = mx; this.last_my = my;
    g_rot_inertia[0] -= deltax * 0.0001;
    g_rot_inertia[1] += deltay * 0.0001;
  }
}

let g_last_ms = 0;

function DrawPuzzle() {
  g_puzzle_vis.Render();
}

// readalong视觉化专用
function CrystalBallMoveCamera(axis, rad) {
  const dist = g_cam.pos.mag();
  g_cam.pos = new p5.Vector(0,0,0);
  g_cam.RotateAlongLocalAxis(axis, rad);
  g_cam.MoveInLocalSpace(new p5.Vector(0,0,dist));
}

function IncrementHighlightIdx(delta) {
  if (g_highlighted_obj_idx == -1) {
    if (delta == 1) {
      g_highlighted_obj_idx = 0;
    } else {
      g_highlighted_obj_idx = g_puzzle_vis.objects.length - 1;
    }
  } else {
    g_highlighted_obj_idx += delta;
    if (g_highlighted_obj_idx == g_puzzle_vis.objects.length) {
      g_highlighted_obj_idx = -1;
    }
  }
}

function CurrentHighlightedObject() {
  if (g_highlighted_obj_idx == -1) return undefined;
  else return g_puzzle_vis.objects[g_highlighted_obj_idx];
}
