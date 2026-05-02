const STR_CELLS = "将74枚电芯\n排成两排";
const STR_NEXT = "下一步 >>";
const STR_MODULE1 = "一排电芯\n(74个)";
const STR_SCENE0_START = "准备好了";
const STR_SCENE0_CLICKED = "加油！";
const STR_WATT_HOUR = "Wh";
const STR_KILOWATT_HOUR = "KWh";
const STR_CELLS1 = "颗电芯";
const STR_MODULE1_1 = "这是74枚电芯\n组成的一排";
const STR_ROW1 = "排电芯";
const STR_MODULE2 = "电池模组\n包含6排电芯";
const STR_SCENE3START = "将16个模组\n组成电池板";
const STR_MODULE3_1 = "个模组";
const STR_SUMMARIZE = "总结一下";
const STR_SCENE1_DONE = "这样，7104枚电芯\n就组成了96排，\n每排74枚电芯。\n" +
                        "\n现在要把它们组装成\n" + "电池模组。";
const STR_SCENE2_DONE = "这样，就有了16个\n电池模组。\n" +
                        "\n现在要把它们组装成\n" + "一块电池板。" +
                        "\n这块板就是驱动\n这辆车的全部电源。";
                        
const STR_SCENE4 = [
  "一枚18650电芯\n储存的能量是\n12.2瓦时(10.31卡路里)\n大约相当于一块饼干。",
  "74枚电芯组成一排\n储存的能量是\n902.8瓦时(776卡路里)\n大约相当于一个汉堡\n或一顿盒饭。",
  "一个电池模组\n储存的能量是\n5.4千瓦时(5.4度电)\n大约相当于465毫升汽油。",
  "整辆车的电池板\n储存的能量是\n86.7千瓦时\n大约相当于7.5升汽油。",
];
                        
const CELL74_MATERIAL = "ambient"
const CELL74_COLOR = [164, 250, 164]

const MODULE1_MATERIAL = "ambient"
const MODULE1_COLOR = [ 222, 255, 222 ]

const MODULE2_MATERIAL = "ambient"
const MODULE2_COLOR = [ 255, 255, 222 ]

const CAR_COLOR = [ 1,1,1 ]

const Scene0 = [
  {
    gadget_name: "gadget1",
    pos: [ 0, 0, 0 ],
    shapes: [
      {
        shape: "box",
        pos:   [ -20, 20, 0 ],
        size:  [ 10, 10, 20 ],
      },
      {
        shape: "box",
        pos:   [  0, 20,  0 ],
        size:  [ 10, 10, 20 ],
      }
    ]
  }
]

// About model sizes:
//
// cell.obj (18650 Cell)
// Actual real life size:     1.8cm 1.8cm  6.5cm
// OBJ bounding box:          9.5   10     36
// Scale factor:              1     1      1

// module1.blend (a row of 74 cells)
// Actual real life size:     6.5cm 3.9cm  67.5cm
// OBJ bounding box:          35.6  22     375
// Scale factor:              1     1      1

// Tesla model 3 size:        185cm  469cm  142cm
// OBJ space:                 1027   2605   788

// module2.blend (a battery module)
// OBJ bounding box:          2.181  4.432  1.448
// Scale needed               470    587    544

// About energy:
//                  Wh   kCal  形似物
// 18650 cell:    12.2  10.31  一片饼干
// 74-cell row:  902.8    776  汉堡 / 一份盒饭
// module:      5416.8   4657  465 ml 汽油
// 整个电池板   86668.8   74521 7.452升 汽油  

const CAM_POS_0        = [ 1020, 1440, 3700 ];
const CAM_POS_0_1      = [ 1020, 1440, 4200 ];
const BILLBOARD_POS_0  = [ 1010, 2320, -290 ];
const PARTS_RANGE_X    = [ 0, 2010 ];  // 零件摆放X范围
const PARTS_RANGE_Z    = [ 10, 1000 ]; // 零件摆放Z范围
const BILLBOARD_NEXT_POS_0 = [ 1010, 720, 420 ]; // “下一步”按钮的位置

const CAM_POS_1        = [ 0,    128,  240 ];
const BILLBOARD_POS_1  = [ 0,    220, -150 ];
const MODULE_POS_1_END = [ 10, 132.5, -200 ];

const CAM_POS_2          = [ 300, 220,  800 ];
const BILLBOARD_POS_2    = [ 300, 600, -200 ];
const MODULE_POS_2_START = [ 225, 190, 200 ];
const MODULE_POS_2_END   = [ 300, 250, 100 ];

const CAM_POS_3          = [ 1350, 1000, 2500 ];
const BILLBOARD_POS_3    = [ 1350, 1800, -200 ];
const BILLBOARD_NEXT_POS_3 = [ 1350, 192, -200 ];
const MODULE_POS_3_START = [ 600, 200, -200 ];
const MODULE_POS_3_END   = [ 1350, 1100, -200 ];

const CAM_POS_4       = [ 1350, 1000, 2500 ];
const BILLBOARD_POS_4 = [ 1350, 2050, 0 ];
const BILLBOARD_NEXT_POS_4 = [ 1350, 120, 580 ];
const CAR_POS = [1050, 670, -800]
const MODULE_POSES_4 = [ 
  [ 600, 20, -200], [ 800, 200, -200 ], [ 1050, 200, -200 ],
  [ 1700, 860, 0 ], CAR_POS
];
const DELTA_Y_4 = [ 50, 240, 240, 900 ]
const PACK_WAYPOINT1 = [1360, 50, 200];
const PACK_WAYPOINT2 = [1210, 190, -1000];
const ARROW_Y0_4 = 3000;

function AssignPosFromArray(x, p, delta = undefined) {
  x.pos.x = p[0];
  x.pos.y = p[1];
  x.pos.z = p[2];
  
  if (delta != undefined) {
    x.pos.x += delta[0];
    x.pos.y += delta[1];
    x.pos.z += delta[2];
  }
}


let g_scene0 = {
  state: "not_started",
  billboard0: undefined,
  billboard_next: undefined,
  SwitchParts: function(pt_id) {
    g_gadget0.shapes.forEach(function(x) {
      if (x instanceof ObjModel) {
        x.visible = false;
      }
    });
    
    g_gadget0.shapes.forEach(function(x) {
      if (x instanceof ObjModel) {
        if (x.tag == pt_id) x.visible = true;
      }
    });
  },
  num_cells_appeared: 0,
  
  HideBillboards() {
    const bn = this.billboard_next;
    g_animator.Animate(bn, "pos", "y", [BILLBOARD_NEXT_POS_0[1], BILLBOARD_NEXT_POS_0[1]-1500], [0, 2000]);
    const b = this.billboard0;
    g_animator.Animate(b, "pos", "y", [BILLBOARD_POS_0[1], BILLBOARD_POS_0[1]+3333], [0,2000]);
  },
  
  ShowBillboards() {
    const bn = this.billboard_next;
    g_animator.Animate(bn, "pos", "y", [BILLBOARD_NEXT_POS_0[1]-1500, BILLBOARD_NEXT_POS_0[1]], [0, 2000]);
    const b = this.billboard0;
    g_animator.Animate(b, "pos", "y", [BILLBOARD_POS_0[1]+3333, BILLBOARD_POS_0[1]], [0,2000]);
  },
  
  Reset: function() {
    this.state = "not_started";
    this.num_cells_appeared = 0;
    g_gadget1.visible = false;
    this.billboard0.SetText("");
    g_gadget0.cell74s.forEach(function(x) { x.visible = false; });
    this.SwitchParts("");
  },
  
  GotoNextScene: function() {
    if (this.state == "not_started") {
      this.billboard_next.SetText(STR_SCENE0_CLICKED);
      setTimeout(function() {
        g_gadget1.visible = true;
        g_gadget1.enabled = false;
        g_animator.AnimateCamera(g_cam, "pos", "x", [g_cam.pos.x, CAM_POS_1[0]],
          [0, 2000], function() {
            g_gadget0.visible = false;
            g_curr_gadget = g_gadget1;
            g_gadget1.enabled = true;
          }
        );
        g_animator.AnimateCamera(g_cam, "pos", "y", [g_cam.GetPos().y, CAM_POS_1[1]], [0, 2000]);
        g_animator.AnimateCamera(g_cam, "pos", "z", [g_cam.GetPos().z, CAM_POS_1[2]], [0, 2000]);
        g_scene0.HideBillboards();
      }, 1000);
    } else if (this.state == "scene1 done") {
      // 每6排 聚合到一起
      g_gadget1.visible = false;
      g_gadget0.shapes.forEach(function(s) {
        if (s.tag == "module1") {
          let x = 500 + Math.random() * 1000;
          g_animator.Animate(s, "pos", "x", [s.pos.x, s.dest[0]], [0, x]);
          g_animator.Animate(s, "pos", "y", [s.pos.y, s.dest[1]], [0, x]);
          g_animator.Animate(s, "pos", "z", [s.pos.z, s.dest[2]], [0, x]);
        }
      });
      
      
      g_scene0.HideBillboards();
      
      setTimeout(function() {
        const p = g_cam.GetPos();
        g_animator.AnimateCamera(g_cam, "pos", "x", [p.x, CAM_POS_2[0]], [0, 1500]);
        g_animator.AnimateCamera(g_cam, "pos", "y", [p.y, CAM_POS_2[1]], [0, 1500]);
        g_animator.AnimateCamera(g_cam, "pos", "z", [p.z, CAM_POS_2[2]], [0, 1500], function() {
          g_curr_gadget = g_gadget2;
          g_gadget2.visible = true;
          g_gadget2.enabled = true;
        });
      }, 2000);
    } else if (this.state == "scene2 done") {
      g_gadget0.shapes.forEach(function(s) {
        if (s.tag == "module2") {
          let x = 500 + Math.random() * 1000
          g_animator.Animate(s, "pos", "x", [s.pos.x, s.dest[0]], [0, x]);
          g_animator.Animate(s, "pos", "y", [s.pos.y, s.dest[1]], [0, x]);
          g_animator.Animate(s, "pos", "z", [s.pos.z, s.dest[2]], [0, x]);
          g_animator.Animate(s, "orientation", undefined,
            [s.orientation,
             Mat3.Mult(
               Mat3.RotationMatrix(new p5.Vector(0,0,1),PI/2),
               Mat3.RotationMatrix(new p5.Vector(1,0,0),PI/2)
             )],
            [0, 1500]);
        }
      });
      {
        const p = g_cam.GetPos();
        let x = 500 + Math.random() * 1000;
        g_animator.AnimateCamera(g_cam, "pos", "x", [p.x, CAM_POS_3[0]], [0, x]);
        g_animator.AnimateCamera(g_cam, "pos", "y", [p.y, CAM_POS_3[1]], [0, x]);
        g_animator.AnimateCamera(g_cam, "pos", "z", [p.z, CAM_POS_3[2]], [0, x], function() {
          g_curr_gadget = g_gadget3;
          g_gadget3.visible = true;
          g_gadget3.enabled = true;
        });
      }
      this.HideBillboards();
    }
  },
  
  OnScene1Done: function() {
    this.state = "scene1 done"
    this.billboard0.SetText(STR_SCENE1_DONE);
    
    let bn = this.billboard_next;
    bn.SetText(STR_NEXT);
    bn.visible = true;
    this.ShowBillboards();
  },
  
  OnScene2Done: function() {
    this.state = "scene2 done"
    this.billboard0.SetText(STR_SCENE2_DONE);
    
    let bn = this.billboard_next;
    bn.SetText(STR_NEXT);
    bn.visible = true;
    this.ShowBillboards();
  }
};

function LoadScene0() {
  g_gadget0 = new Gadget();
  g_gadget0.cell74s = [];
  
  // 开场提示
  let b = new Billboard(256, 256);
  b.scale.mult(8);
  AssignPosFromArray(b, BILLBOARD_POS_0);
  b.SetText("");
  g_gadget0.shapes.push(b);
  g_scene0.billboard0 = b;
  
  // 下一步
  b = new Billboard();
  b.scale.mult(8);
  AssignPosFromArray(b, BILLBOARD_NEXT_POS_0);
  b.SetText(STR_SCENE0_START);
  b.enabled = true;
  b.visible = false;
  b.onclick = function() {
    g_scene0.GotoNextScene();
  }
  g_scene0.billboard_next = b;
  g_gadget0.shapes.push(b);
  
  // module2/3 的摆放位置，每一块都写进来
  let module2_poses = [];
  let module3_poses = [];
  {
    const x0 = MODULE_POS_2_START[0], xdelta = 30,
          x1 = PARTS_RANGE_X[1] - (x0 - PARTS_RANGE_X[0]);
          z0 = MODULE_POS_2_START[2], z1 = PARTS_RANGE_Z[1];
    for (let j=0; j<4; j++) {
      const z = z0 + (z1-z0) * 1.0 * j / 3;
      for (let i=0; i<4; i++) {
        const x = x0 + (x1 - x0) * 1.0 * i / 3;
        for (let k=0; k<6; k++) {
          module2_poses.push([x+xdelta*k, 190, z]);
        }
      }
    }
    
    for (let i=0; i<16; i++) {
      const x = MODULE_POS_3_START[0] + 100 * i;
      const y = MODULE_POS_3_START[1];
      const z = MODULE_POS_3_START[2];
      module3_poses.push([x,y,z]);
    }
  }
  
  // 零件摆放
  let idx = 0;
  for (let j=0; j<6; j++) {
    for (let i=0; i<16; i++) {
      const x = PARTS_RANGE_X[0] + (PARTS_RANGE_X[1]-PARTS_RANGE_X[0])*1.0*i / 15;
      // idx==0 是 scene1 用的 所以跳过
      {
        const z = PARTS_RANGE_Z[0] + (PARTS_RANGE_Z[1]-PARTS_RANGE_Z[0])*1.0*j/5;
        
        // Cells
        let bp = new ObjModel(g_obj_cell74);
        g_gadget0.shapes.push(bp);
        g_gadget0.cell74s.push(bp);

        bp.pos.x = x; bp.pos.z = z; bp.pos.y = 32.5/1.8;
        bp.tag = "cell74";
        bp.visible = false;
        bp.color = CELL74_COLOR
        bp.material = CELL74_COLOR
        
        // Rows
        // Scene2 的开始位置：
        // ({225,255,...,375}, 190, 200)
        let br = new ObjModel(g_obj_module1);
        g_gadget0.shapes.push(br);
        br.pos.x = x; br.pos.z = z; br.pos.y = 190;
        br.tag = "module1";
        br.dest = module2_poses[idx];
        br.visible = false;
        br.material = MODULE1_MATERIAL
        br.color = MODULE1_COLOR
      }
      idx ++;
    }
  }
  
  // module的摆放
  idx = 0;
  for (let j=0; j<4; j++) {
    for (let i=0; i<4; i++) {
      const PAD = 500;
      {
        const x = (PARTS_RANGE_X[0] + PAD) +
                  (PARTS_RANGE_X[1] - PARTS_RANGE_X[0] - 2*PAD) * 1.0 * i / 3;
        const z = (PARTS_RANGE_Z[0]) +
                  (PARTS_RANGE_Z[1] - PARTS_RANGE_Z[0]) * 1.0 * j / 3;
        //const x = 1, z = 2;
        // Modules
        let bm = new ObjModel(g_obj_module2);
        g_gadget0.shapes.push(bm);
        bm.pos.x = x; bm.pos.z = z; bm.pos.y = 200;
        bm.orientation = Mat3.RotationMatrix(new p5.Vector(0,0,1), PI/2);
        bm.tag = "module2";
        bm.dest = module3_poses[idx];
        bm.visible = false;
        bm.material = "ambient";
        bm.color = MODULE2_COLOR;
      }
      idx ++;
    }
  }
}

function LinesHelper(lines, num_shown) {
  let ret = lines.slice(0, num_shown);
  for (let i=0; i<lines.length - num_shown; i++) { ret.push(""); }
  return ret.join("\n");
}

function scene0_anim_step0(idx) {
  const b = g_scene0.billboard0;
  const px = b.pos.x;
  
  let latency = 0;
  if (idx < 5)        { latency = 375; }
  else if (idx < 13)  { latency = 180; }
  else if (idx <= 95) { latency = 30;  }
  else if (idx == 96) { latency = 1000; }
  
  g_animator.Animate(b, "pos", "x", [px, px], [0,latency], function() {
    if (idx <= 95) {
      if (idx == 0) {
        g_gadget0.cell74s[idx].visible = true
        //g_gadget1.visible = true;
        // 动一下cam
        g_animator.AnimateCamera(g_cam, "pos", "z", [CAM_POS_0[2], CAM_POS_0_1[2]], [0, 8888]);
      } else {
        g_gadget0.cell74s[idx].visible = true
      }
      
      g_scene0.num_cells_appeared += 74;
      b.SetText("这里是大西岛研究室。\n" +
                "\n" +
                "今天，我们拿到了\n" +
                g_scene0.num_cells_appeared + "枚18650电芯。\n\n\n\n\n");
      
      scene0_anim_step0(idx+1);
    } else { scene0_anim_step1(); }
  });
}


const step0lines = [
  "这里是大西岛研究室。",
  "",
  "今天，我们拿到了",
  "7104枚18650电芯。",
  "",
  "现在，你将把这些电芯",
  "组装成整辆车的电池板。",
  "",
  "准备好了吗？ :)",
];

function StartAnimationScene0() {
  // 清除所有当前的倒计时
  let id = window.setTimeout(function() {}, 0);
  while (id--) {
      window.clearTimeout(id); // will do nothing if no timeout with id is present
  }
  
  g_gadget0.cell74s.forEach(function(x) { x.visible = false; });
  const b = g_scene0.billboard0;
  const bn = g_scene0.billboard_next;
  bn.SetText(STR_SCENE0_START);
  
  [ g_gadget1, g_gadget2, g_gadget3, g_gadget4 ].forEach(function(x) {
    x.visible = false;
  });
  g_scene0.num_cells_appeared = 0;
  
  g_cam.pos.x = CAM_POS_0[0];
  g_cam.pos.y =-CAM_POS_0[1];
  g_cam.pos.z = CAM_POS_0[2];
  
  const px = b.pos.x; 
  const t_ms = 850;
  g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
    b.SetText(LinesHelper(step0lines, 1));
    g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
      b.SetText(LinesHelper(step0lines, 3));
      g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
        scene0_anim_step0(0);
      })
    })
  })
}

function scene0_anim_step1() {
  const t_ms = 850;
  const b = g_scene0.billboard0;
  const bn = g_scene0.billboard_next;
  const px = b.pos.x;
  g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
    b.SetText(LinesHelper(step0lines, 4));
    g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
      b.SetText(LinesHelper(step0lines, 6));
      g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
        b.SetText(LinesHelper(step0lines, 7));
        g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
          b.SetText(LinesHelper(step0lines, 9));
          g_animator.Animate(b, "pos", "x", [px, px], [0, t_ms], function() {
            bn.visible = true; bn.enabled = true;
            g_animator.Animate(bn, "pos", "y", [bn.pos.y-1000, BILLBOARD_NEXT_POS_0[1]], [0, 1000]);
          })
        })
      })
    })
  })
}

let g_scene1 = {
  watt_hours: 0,
  num_cells:  0,
  num_cells_remaining: 0,
  scene:      undefined,
  module1:    undefined,
  billboard:  undefined,
  
  Reset: function() {
    this.watt_hours = 0;
    this.num_cells = 0;
    this.num_cells_remaining = 0;
  },
  
  OnSceneEnd: function() {
    this.scene.shapes.forEach(function(x) {
      const xcn = x.constructor.name;
      if (xcn == "ObjModel") {
        if (x.obj == g_obj_cell) {
          x.visible = false;
        }
        else x.visible = true; 
      }
    });
    
    this.module1.update = function(delta_millis) {
      g_scene1.module1.RotateAlongLocalAxis(new p5.Vector(0,1,0),
        delta_millis * 0.001);
    }
    
    this.billboard.SetText(STR_MODULE1_1);
    
    // Press button to go to next scene
    let bn = g_scene1.billboard_next;
    bn.visible = true;
    g_animator.Animate(bn, "pos", "y", [bn.pos.y - 300, bn.pos.y], [0, 2000]); 
  },
  OnBatteryUpdate: function() {
    this.num_cells ++;
    this.num_cells_remaining --;
    g_scene1.watt_hours += 12.2;
    g_scene1.billboard.SetText(g_scene1.watt_hours.toFixed(2) + " " + STR_WATT_HOUR + "\n"
                         + g_scene1.num_cells + " " + STR_CELLS1);
    if (this.num_cells_remaining == 0) {
      this.OnSceneEnd();
    }
  },
  
  // 回到 scene0
  GotoNextScene: function() {
    g_gadget0.visible = true;
    g_scene0.SwitchParts("module1");
    g_scene0.OnScene1Done();
    g_gadget1.enabled = false;
    g_gadget1.visible = false;
    g_curr_gadget = g_gadget0;

    g_animator.AnimateCamera(g_cam, "pos",  "x", [CAM_POS_1[0],  CAM_POS_0[0]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "y", [CAM_POS_1[1],  CAM_POS_0[1]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "z", [CAM_POS_1[2],  CAM_POS_0[2]], [0, 2000], function() {
      g_gadget0.enabled = true;
    });
  },
  
  GotoNextScene_old: function() {
    g_gadget2.visible = true;
    g_animator.Animate(this.module1, "pos", "x", [MODULE_POS_1_END[0], MODULE_POS_2_START[0]], [0, 2000],
      function(x) {
        g_gadget1.visible = false;
        g_gadget2.enabled = true;
      });
    g_animator.Animate(this.module1, "pos", "y", [MODULE_POS_1_END[1], MODULE_POS_2_START[1]], [0, 2000]);
    g_animator.Animate(this.module1, "pos", "z", [MODULE_POS_1_END[2], MODULE_POS_2_START[2]], [0, 2000]);
    g_animator.Animate(this.module1, "orientation", undefined,
      [g_scene1.module1.orientation, new Mat3()], [0, 1000],
      function() { g_scene1.module1.update = undefined; } );
    g_curr_animated_obj = g_gadget1;
    g_animator.AnimateCamera(g_cam, "pos",  "x", [CAM_POS_1[0],  CAM_POS_2[0]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "y", [CAM_POS_1[1],  CAM_POS_2[1]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "z", [CAM_POS_1[2],  CAM_POS_2[2]], [0, 2000]);
    g_curr_gadget = g_gadget2;
    g_gadget2.enabled = false;
  }
}

function LoadScene1() {
  g_gadget1 = new Gadget();
  g_scene1.scene = g_gadget1;
  
  // cells
  let billboard = new Billboard();
  billboard.SetText(STR_CELLS);
  billboard.pos.x = BILLBOARD_POS_1[0];
  billboard.pos.y = BILLBOARD_POS_1[1];
  billboard.pos.z = BILLBOARD_POS_1[2];
  g_scene1.billboard = billboard;
  
  if (false) {
    let billboard_10cm = new Billboard(55.55, 10);
    billboard_10cm.text_size = 8
    billboard_10cm.pos.x = 0;
    billboard_10cm.pos.y = 2;
    billboard_10cm.pos.z = 0;
    billboard_10cm.bgcolor = [ 0, 128, 128, 255 ];
    billboard_10cm.SetText("<- 10 cm ->");
    billboard_10cm.orientation = Mat3.RotationMatrix(
      new p5.Vector(1,0,0), -PI/4)
    g_gadget1.shapes.push(billboard_10cm);
  }
  
  // Buttons
  let billboard_next = new Billboard();
  billboard_next.SetText(STR_NEXT);
  billboard_next.pos.x = BILLBOARD_POS_1[0];
  billboard_next.pos.y = 32;
  billboard_next.pos.z = BILLBOARD_POS_1[2];
  billboard_next.visible = false;
  billboard_next.onclick = function() {
    g_scene1.GotoNextScene();
  };
  g_scene1.billboard_next = billboard_next;
  
  const X0LB = -50, X0UB = 50, X0DELTA = 10;
  let x0 = X0LB; y0 = 32.5/1.8+2; z0 = -70;
  let i = 0;
  
  // Battery --> Module1
  
  let cb = function() {
    g_scene1.OnBatteryUpdate();
  }
  
  for (let x=-150; x<=210; x+=10) {
    for (let y=-5; y<=5; y+=10) {
      //let b = new Box()
      let b = new ObjModel(g_obj_cell);
      g_scene1.num_cells_remaining ++;
      
      const tx = y, ty = x+100+y/2, tz = -200;
      
      b.material = "ambient"
      b.color = CELL74_COLOR
      b.pos.x = x0; b.pos.y = y0; b.pos.z = z0;
      b.onhover = function(x) {
        if (x.scene1_flag == true) { return; }
        else {
          x.scene1_flag = true;
          g_animator.Animate(x, "pos", "x", [x.pos.x, tx], [0, 500], cb);
          g_animator.Animate(x, "pos", "y", [x.pos.y, ty], [0, 500]);
          g_animator.Animate(x, "pos", "z", [x.pos.z, tz], [0, 500]);
          g_animator.Animate(x, "orientation", null, [x.orientation, 
            Mat3.RotationMatrix(new p5.Vector(0,1,0),0)], [0, 500]);
        }
      }
      b.RotateAlongLocalAxis(new p5.Vector(1,0,0).normalize(), -PI/2);
      
      b.update = function(x, delta_millis) {
        //x.RotateAlongGlobalAxis(new p5.Vector(0,1,0), delta_millis*0.001);
      }
      
      x0 = x0 + X0DELTA;
      if (x0 > X0UB) {
        x0 = X0LB; z0 += 10;
      }
      i++;
      b.hw = 9 / 1.8; b.hh = 9 / 1.8; b.hd = 32.5 / 1.8
      g_gadget1.shapes.push(b)
    }
  }
  
  let module1 = new ObjModel(g_obj_module1);
  module1.pos.x = 0;
  module1.pos.y = 132.5;
  module1.pos.z = -200;
  module1.visible = false;
  module1.color = MODULE1_COLOR; module1.material = MODULE1_MATERIAL
  g_gadget1.shapes.push(module1);
  g_scene1.module1 = module1;
  
  // Billboard必须最后画
  g_gadget1.shapes.push(billboard);
  g_gadget1.shapes.push(billboard_next);
  
  const cp = g_cam.pos;
  
  g_curr_gadget = g_gadget1;
  g_gadget1.enabled = true;
}

let g_scene2 = { 
  num_modules: 0,
  num_modules_remaining: 0,
  watt_hours: 0,
  module2: undefined,
  
  Reset: function() {
    this.num_modules = 0;
    this.num_modules_remaining = 0;
    this.watt_hours = 0;
  },
  
  HideBillboards: function() {
    
  },
  
  OnModuleUpdate: function() {
    this.num_modules_remaining --;
    this.num_modules ++;
    
    this.watt_hours += 12.2 * 74;
    this.billboard.SetText(
      (g_scene2.watt_hours/1000).toFixed(2) + " 度电\n" +
      g_scene2.num_modules + " 排电芯");
    
    if (this.num_modules_remaining <= 0) {
      this.OnSceneEnd();
    }
  },
  
  OnSceneEnd: function() {
    this.billboard.SetText(STR_MODULE2);
    this.module2.update = function(delta_millis) {
      g_scene2.module2.RotateAlongLocalAxis(new p5.Vector(0,1,0),
        delta_millis * 0.001);
    }
    g_gadget2.shapes.forEach(function(s) {
      if (s.constructor.name == "ObjModel" && s.obj == g_obj_module1) {
        s.visible = false;
      }
    })
    g_scene2.module2.visible = true;
    
    let bn = this.billboard_next;
    bn.visible = true;
    g_animator.Animate(bn, "pos", "y", [bn.pos.y-1500, bn.pos.y], [0, 2000]);
    
    console.log("scene 2 done");
  },
  
  GotoNextScene: function() {
    g_gadget0.visible = true;
    g_scene2.HideBillboards();
    g_gadget2.enabled = false;
    g_scene0.SwitchParts("module2");
    g_scene0.OnScene2Done();
    g_curr_gadget = g_gadget0;
    g_scene2.billboard.visible = false;
    
    // scene0 中的 最左上角的那个
    const m2 = this.module2;
    const PAD = 500;
    g_animator.Animate(this.module2, "pos", "x", [m2.pos.x, PARTS_RANGE_X[0]+PAD], [0, 2000]);
    g_animator.Animate(this.module2, "pos", "y", [m2.pos.y, 200], [0, 2000]);
    g_animator.Animate(this.module2, "pos", "z", [m2.pos.z, PARTS_RANGE_Z[0]], [0, 2000]);
    g_animator.Animate(this.module2, "orientation", undefined,
      [m2.orientation, Mat3.RotationMatrix(new p5.Vector(0,0,1), PI/2)], [0, 2000]);
    
    g_animator.AnimateCamera(g_cam, "pos",  "x", [CAM_POS_2[0],  CAM_POS_0[0]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "y", [CAM_POS_2[1],  CAM_POS_0[1]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "z", [CAM_POS_2[2],  CAM_POS_0[2]], [0, 2000], function() {
      g_gadget0.enabled = true;
      g_gadget2.visible = false;
    });
  },
  
  GotoNextScene_old: function() {
    g_gadget3.visible = true;
    g_animator.Animate(this.module2, "pos", "x", [MODULE_POS_2_END[0], MODULE_POS_3_START[0]], [0, 2000],
      function(x) { g_scene1.module1.visible = false; });
    g_animator.Animate(this.module2, "pos", "y", [MODULE_POS_2_END[1], MODULE_POS_3_START[1]], [0, 2000]);
    g_animator.Animate(this.module2, "pos", "z", [MODULE_POS_2_END[2], MODULE_POS_3_START[2]], [0, 2000]);
    g_animator.Animate(this.module2, "orientation", undefined,
      [g_scene2.module2.orientation, Mat3.Mult(
            Mat3.RotationMatrix(new p5.Vector(1,0,0), PI/2),
            Mat3.RotationMatrix(new p5.Vector(0,1,0), PI/2) // 注意：是Local叠加
          )
      ], [0, 2000],
      function() { 
        g_scene2.module2.update = undefined;
        g_gadget2.visible = false;
        g_gadget3.enabled = true;
      } );
    g_animator.AnimateCamera(g_cam, "pos",  "x", [CAM_POS_2[0],  CAM_POS_3[0]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "y", [CAM_POS_2[1],  CAM_POS_3[1]], [0, 2000]);
    g_animator.AnimateCamera(g_cam, "pos",  "z", [CAM_POS_2[2],  CAM_POS_3[2]], [0, 2000]);
    g_curr_gadget = g_gadget3;
    g_curr_animated_obj = g_gadget2;
  }
}

function LoadScene2() {
  g_gadget2 = new Gadget();
  
  const center_x = MODULE_POS_2_START[0] + 30 * 2.5;
  g_scene2.num_modules = 0;
  
  let cb = function() { g_scene2.OnModuleUpdate(); }
  
  for (let i=0; i<6; i++) {
    let module1 = new ObjModel(g_obj_module1);
    module1.pos.x = MODULE_POS_2_START[0] + 30 * i;
    module1.pos.y = MODULE_POS_2_START[1];
    module1.pos.z = MODULE_POS_2_START[2];
    module1.material = MODULE1_MATERIAL
    module1.color = MODULE1_COLOR
    
    const ty = MODULE_POS_2_END[1] + 30 * i;
    
    module1.onhover = function(x) {
      if (x.scene2_flag == true) { return; }
      else {
        x.scene2_flag = true;
        g_animator.Animate(x, "pos", "x", [x.pos.x, MODULE_POS_2_END[0]], [0, 500], cb);
        g_animator.Animate(x, "pos", "y", [x.pos.y, ty], [0, 500]);
        g_animator.Animate(x, "pos", "z", [x.pos.z, MODULE_POS_2_END[2]], [0, 500]);
        g_animator.Animate(x, "orientation", undefined, [
          x.orientation, Mat3.RotationMatrix(new p5.Vector(0,0,1), PI/2)], [0, 500]);
      }
    }
    g_gadget2.shapes.push(module1);
    g_scene2.num_modules_remaining ++;
  }
  
  // Destination
  let module2 = new ObjModel(g_obj_module2);
  module2.pos.x = MODULE_POS_2_END[0];
  module2.pos.y = MODULE_POS_2_END[1] + 30 * 2.5;
  module2.pos.z = MODULE_POS_2_END[2];
  module2.material = MODULE2_MATERIAL
  module2.color = MODULE2_COLOR
  g_gadget2.shapes.push(module2);
  
  // cells
  let billboard = new Billboard();
  billboard.SetText(STR_MODULE1);
  billboard.pos.x = BILLBOARD_POS_2[0];
  billboard.pos.y = BILLBOARD_POS_2[1];
  billboard.pos.z = BILLBOARD_POS_2[2];
  billboard.scale = new p5.Vector(3, 3, 3);
  g_scene2.billboard = billboard;
  module2.visible = false;
  g_scene2.module2 = module2;
  g_gadget2.shapes.push(billboard);
  
  // Next
  let billboard_next = new Billboard();
  billboard_next.SetText(STR_NEXT);
  billboard_next.pos.x = BILLBOARD_POS_2[0];
  billboard_next.scale = new p5.Vector(3, 3, 3);
  billboard_next.pos.y = 32 * 3;
  billboard_next.pos.z = BILLBOARD_POS_2[2];
  billboard_next.visible = false;
  billboard_next.onclick = function() {
    g_scene2.GotoNextScene();
  };
  g_scene2.billboard_next = billboard_next;
  g_gadget2.shapes.push(billboard_next);
  
  // For DBG
  //g_cam.pos.x = 400
}

let g_scene3 = {
  num_modules: 0,
  num_modules_remaining: 0,
  watt_hours: 0,
  module3: undefined,
  billboard: undefined,
  billboard_next: undefined,
  
  Reset: function() {
    this.watt_hours = 0;
    this.num_modules = 0;
    this.num_modules_remaining = 0;
    AssignPosFromArray(this.billboard,      BILLBOARD_POS_3);
    AssignPosFromArray(this.billboard_next, BILLBOARD_NEXT_POS_3);
  },
  
  FadeOutBillboards: function() {
    g_animator.Animate(this.billboard, "pos", "y", 
      [BILLBOARD_POS_3[1], BILLBOARD_POS_3[1]+3333], [0,2000]);
    g_animator.Animate(this.billboard_next, "pos", "y",
      [BILLBOARD_NEXT_POS_3[1], BILLBOARD_NEXT_POS_3[1]-3333], [0,2000]);
  },
  
  OnModuleUpdate: function() {
    this.num_modules_remaining --;
    g_scene3.num_modules ++;
    
    g_scene3.watt_hours += 12.2 * 74 * 6;
    g_scene3.billboard.SetText(
      (g_scene3.watt_hours/1000).toFixed(2) + " " + STR_KILOWATT_HOUR + "\n" +
      g_scene3.num_modules + " " + STR_MODULE3_1);
    
    
    if (this.num_modules_remaining <= 0) {
      this.module3.visible = true;
      this.module3.update = function(delta_millis) {
        g_scene3.module3.RotateAlongGlobalAxis(new p5.Vector(0,1,0),
          delta_millis * 0.001);
      }
      
      g_gadget3.shapes.forEach(function(s) {
        if (s.constructor.name == "ObjModel" && s.obj == g_obj_module2_simp) {
          s.visible = false;
        }
      })
      
      let bn = this.billboard_next;
      bn.visible = true;
      g_animator.Animate(bn, "pos", "y", [bn.pos.y-1500, bn.pos.y], [0, 2000]);
      
      g_scene3.module3.visible = true;
      console.log("scene 3 done");
    }
  },
  
  ShowEnding() {
    this.FadeOutBillboards();
    g_scene4.Reset();
    g_scene4.arrow.visible = false;
    g_gadget4.visible = true;
    g_animator.Animate(this.module3, "pos", "x", [MODULE_POS_3_END[0], MODULE_POSES_4[3][0]], [0, 2000]);
    g_animator.Animate(this.module3, "pos", "y", [MODULE_POS_3_END[1], MODULE_POSES_4[3][1]], [0, 2000]);
    g_animator.Animate(this.module3, "pos", "z", [MODULE_POS_3_END[2], MODULE_POSES_4[3][2]], [0, 2000],
      function() {
        g_gadget3.visible = false;
        g_gadget4.shapes[3].visible = true; // MODULE3
        g_gadget4.enabled = true;
      }
    );
    g_animator.Animate(this.module3, "orientation", undefined,
      [g_scene3.module3.orientation,
        Mat3.Mult(
        Mat3.RotationMatrix(new p5.Vector(1,0,0),PI/2),
        Mat3.RotationMatrix(new p5.Vector(0,0,1),0)
      )],
      [0,2000]);
    
    // 箭头出现
    const g4s0 = g_gadget4.shapes[0];
    const g4s1 = g_gadget4.shapes[1];
    const g4s2 = g_gadget4.shapes[2];
    let g4arr = g_scene4.arrow;
    const zdelta = CAM_POS_4[2] + 400;
    g_animator.Animate(g4s0, "pos", "z", [g4s0.pos.z + zdelta, g4s0.pos.z], [0,2000]);
    g_animator.Animate(g4s1, "pos", "z", [g4s1.pos.z + zdelta, g4s1.pos.z], [0,2300]);
    g_animator.Animate(g4s2, "pos", "z", [g4s2.pos.z + zdelta, g4s2.pos.z], [0,2500]);
    
    setTimeout(function() {
      g_scene4.billboard.SetText(STR_SCENE4[0]);
    }, 3500);

    g4arr.pos.x = MODULE_POSES_4[0][0];
    g_animator.Animate(g4arr, "pos", "y",
      [MODULE_POSES_4[0][1] + 3500, MODULE_POSES_4[0][1]+3500, MODULE_POSES_4[0][1] + 50],
      [0, 2500, 3500])
    g4arr.pos.z = MODULE_POSES_4[0][2];
    g4arr.visible = true;
    
    g_curr_animated_obj = g_gadget3;
    g_curr_gadget = g_gadget4;
    g_gadget4.shapes[3].visible = false
    g_gadget4.enabled = false;
    
  }
};

function LoadScene3() {
  g_gadget3 = new Gadget();
  
  const tdeltas = [
    [-200, -665, 0], [200, -665, 0],
    [-200, -475, 0], [200, -475, 0],
    [-200, -285, 0], [200, -285, 0],
    [-200, -95,  0], [200,  -95, 0],
    [-200, 95,   0], [200,   95, 0],
    [-200, 285,  0], [200,  285, 0],
    [-200, 475,  0], [200,  475, 0],
    [   0, 665,  0], [  0,  665, 80],
  ];
  
  const cb = function() {
    g_scene3.OnModuleUpdate();
  }
  
  for (let i=0; i<16; i++) {
    let module2 = new ObjModel(g_obj_module2_simp);
    module2.pos.x = MODULE_POS_3_START[0] + 100 * i;
    module2.pos.y = MODULE_POS_3_START[1];
    module2.pos.z = MODULE_POS_3_START[2];
    module2.RotateAlongGlobalAxis(new p5.Vector(0,0,1),PI/2);
    //module2.RotateAlongGlobalAxis(new p5.Vector(1,0,0),PI/2)
    module2.material = MODULE2_MATERIAL;
    module2.color = MODULE2_COLOR;
    g_gadget3.shapes.push(module2);
    
    const tx = MODULE_POS_3_END[0] + tdeltas[i][1];
    const ty = MODULE_POS_3_END[1] + tdeltas[i][0];
    const tz = MODULE_POS_3_END[2] + tdeltas[i][2];
    module2.onhover = function(x) {
      if (x.scene3_flag == true) { return; }
      else {
        x.scene3_flag = true;
        g_animator.Animate(x, "pos", "x", [x.pos.x, tx], [0, 500], cb);
        g_animator.Animate(x, "pos", "y", [x.pos.y, ty], [0, 500]);
        g_animator.Animate(x, "pos", "z", [x.pos.z, tz], [0, 500]);
        g_animator.Animate(x, "orientation", undefined, [
          x.orientation, 
          Mat3.Mult(
            Mat3.RotationMatrix(new p5.Vector(1,0,0), PI/2),
            Mat3.RotationMatrix(new p5.Vector(0,1,0), PI/2) // 注意：是Local叠加
          )], [0, 500]);
      }
    }
    
    g_scene3.num_modules_remaining ++;
  }
  
  // Billboard
  let billboard = new Billboard();
  billboard.SetText(STR_SCENE3START);
  billboard.pos.x = BILLBOARD_POS_3[0];
  billboard.pos.y = BILLBOARD_POS_3[1];
  billboard.pos.z = BILLBOARD_POS_3[2];
  billboard.scale = new p5.Vector(6, 6, 6);
  g_gadget3.shapes.push(billboard);
  g_scene3.billboard = billboard;
  
  // Next
  let billboard_next = new Billboard();
  billboard_next.SetText(STR_NEXT);
  billboard_next.scale = new p5.Vector(6, 6, 6);
  billboard_next.pos.x = BILLBOARD_NEXT_POS_3[0];
  billboard_next.pos.y = BILLBOARD_NEXT_POS_3[1];
  billboard_next.pos.z = BILLBOARD_NEXT_POS_3[2];
  billboard_next.visible = false;
  billboard_next.onclick = function() {
    g_scene3.ShowEnding();
  };
  g_scene3.billboard_next = billboard_next;
  g_gadget3.shapes.push(billboard_next);
  
  // entire battery pack
  let module3 = new ObjModel(g_obj_module3);
  AssignPosFromArray(module3, MODULE_POS_3_END);
  module3.RotateAlongGlobalAxis(new p5.Vector(1,0,0), PI/2);
  module3.RotateAlongGlobalAxis(new p5.Vector(0,0,1),-PI/2);
  module3.visible = false;
  g_gadget3.shapes.push(module3);
  g_scene3.module3 = module3;
  
  g_gadget2.visible = false;
}

let g_scene4 = {
  m1: undefined,
  m2: undefined,
  m3: undefined,
  m4: undefined,
  billboard: undefined,
  billboard_next: undefined,
  arrow: undefined,
  step: 0,
  
  Reset: function() {
    this.step = 0;
    AssignPosFromArray(this.m1, MODULE_POSES_4[0]);
    AssignPosFromArray(this.m2, MODULE_POSES_4[1]);
    AssignPosFromArray(this.m3, MODULE_POSES_4[2]);
    AssignPosFromArray(this.m4, MODULE_POSES_4[3]);
    this.arrow.visible = true;
    this.m1.visible = true;
    this.m2.visible = true;
    this.m3.visible = true;
    this.m4.visible = true;
    this.billboard_next.visible = true;
    this.billboard.SetText(STR_SUMMARIZE);
  },
  
  FadeOutBillboards: function() {
    g_animator.Animate(this.billboard, "pos", "y", [BILLBOARD_POS_4[1], BILLBOARD_POS_4[1]+3333], [0,2000]);
    g_animator.Animate(this.billboard_next, "pos", "y",
      [BILLBOARD_NEXT_POS_4[1], BILLBOARD_NEXT_POS_4[1]-3333], [0,2000]);
  },
  
  GotoNextStep: function() {
    [ g_gadget1, g_gadget2, g_gadget3 ].forEach(function(x) { x.visible = false; })
    g_animator.Animate(this.m4, "pos", "x", [g_scene4.m4.pos.x, PACK_WAYPOINT1[0]], [0,2000]);
    g_animator.Animate(this.m4, "pos", "y", [g_scene4.m4.pos.y, PACK_WAYPOINT1[1]], [0,2000]);
    g_animator.Animate(this.m4, "pos", "z", [g_scene4.m4.pos.z, PACK_WAYPOINT1[2]], [0,2000],
      function() {
        g_animator.Animate(g_scene4.m4, "pos", "x", [g_scene4.m4.pos.x, PACK_WAYPOINT2[0]], [0,2000])
        g_animator.Animate(g_scene4.m4, "pos", "y", [g_scene4.m4.pos.y, PACK_WAYPOINT2[1]], [0,2000])
        g_animator.Animate(g_scene4.m4, "pos", "z", [g_scene4.m4.pos.z, PACK_WAYPOINT2[2]], [0,2000],
          function() {
            g_gadget4.visible = false;
            g_animator.Animate(g_the_car, "pos", "x", [CAR_POS[0], CAR_POS[0] - 5000], [0, 1000],
              function(){
                RandomCarColor();
                g_animator.Animate(g_the_car, "pos", "x", [CAR_POS[0] + 5000, CAR_POS[0]], [0, 1000],
                  function() {
                    g_loop_count ++;
                    StartOver();
                  }
                );
              }
            );
          }
        );
        g_animator.Animate(g_scene4.m4, "orientation", undefined,
          [g_scene4.m4.orientation, Mat3.RotationMatrix(new p5.Vector(0,1,0),PI/2)],
          [0, 2000]);
      }
    );
    g_animator.Animate(this.m4, "orientation", undefined, [g_scene4.m4.orientation, new Mat3()], [0, 2000]);
    g_animator.Animate(this.m1, "pos", "z", [MODULE_POSES_4[0][2], MODULE_POSES_4[0][2]+4000], [0,2000]);
    g_animator.Animate(this.m2, "pos", "z", [MODULE_POSES_4[1][2], MODULE_POSES_4[1][2]+4000], [0,2000]);
    g_animator.Animate(this.m3, "pos", "z", [MODULE_POSES_4[2][2], MODULE_POSES_4[2][2]+4000], [0,2000]);
  },
  
  Step: function() {
    if (this.step <= 2) {
      g_scene4.billboard.SetText(STR_SCENE4[this.step+1]);
      const PAD = 50
      const s = this.step;
      g_animator.Animate(this.arrow, "pos", "x",
        [MODULE_POSES_4[s][0],     MODULE_POSES_4[s+1][0]], [0, 450]);
      g_animator.Animate(this.arrow, "pos", "y",
        [MODULE_POSES_4[s][1]+DELTA_Y_4[s], MODULE_POSES_4[s+1][1]+DELTA_Y_4[s+1]], [0, 450]);
      g_animator.Animate(this.arrow, "pos", "z",
        [MODULE_POSES_4[s][2],     MODULE_POSES_4[s+1][2]], [0, 450]);
      this.step ++;
    } else if (this.step == 3) {
      const arr = this.arrow;
      g_animator.Animate(arr, "pos", "y", [arr.pos.y, arr.pos.y + 3500], [0,1000]);
      g_animator.AnimateCamera(g_cam, "pos", "x", [CAM_POS_4[0], CAM_POS_0[0]], [0,2000]);
      g_animator.AnimateCamera(g_cam, "pos", "y", [CAM_POS_4[1], CAM_POS_0[1]], [0,2000]);
      g_animator.AnimateCamera(g_cam, "pos", "z", [CAM_POS_4[2], CAM_POS_0[2]], [0,2000]);
      this.FadeOutBillboards();
      this.GotoNextStep()
    }
  }
};

function LoadScene4() {
  g_gadget4 = new Gadget();
  
  // 地上展出的四种东西
  let m1 = new ObjModel(g_obj_cell);
  
  AssignPosFromArray(m1, MODULE_POSES_4[0]);
  m1.RotateAlongGlobalAxis(new p5.Vector(1,0,0),PI/2);
  g_gadget4.shapes.push(m1);
  m1.color = CELL74_COLOR; m1.material = CELL74_MATERIAL
  g_scene4.m1 = m1;
  
  let m2 = new ObjModel(g_obj_module1);
  AssignPosFromArray(m2, MODULE_POSES_4[1]);
  g_gadget4.shapes.push(m2);
  m2.color = MODULE1_COLOR; m2.material = MODULE1_MATERIAL
  g_scene4.m2 = m2;
  
  let m3 = new ObjModel(g_obj_module2);
  m3.RotateAlongGlobalAxis(new p5.Vector(0,0,1),PI/2);
  AssignPosFromArray(m3, MODULE_POSES_4[2]);
  g_gadget4.shapes.push(m3);
  m3.material = MODULE2_MATERIAL; m3.color = MODULE2_COLOR;
  g_scene4.m3 = m3;
  
  let m4 = new ObjModel(g_obj_module3);
  m4.RotateAlongGlobalAxis(new p5.Vector(1,0,0),PI/2);
  AssignPosFromArray(m4, MODULE_POSES_4[3]);
  g_gadget4.shapes.push(m4);
  g_scene4.m4 = m4;
  
  // Billboard4
  let billboard = new Billboard(300, 150);
  billboard.SetText(STR_SUMMARIZE);
  billboard.pos.x = BILLBOARD_POS_4[0];
  billboard.pos.y = BILLBOARD_POS_4[1];
  billboard.pos.z = BILLBOARD_POS_4[2];
  billboard.scale = new p5.Vector(4, 4, 4);
  g_gadget4.shapes.push(billboard);
  g_scene4.billboard = billboard;
  
  let billboard_next = new Billboard();
  billboard_next.SetText(STR_NEXT);
  AssignPosFromArray(billboard_next, BILLBOARD_NEXT_POS_4);
  billboard_next.scale = new p5.Vector(4, 4, 4);
  billboard_next.onclick = function() {
    g_scene4.Step();
  }
  g_gadget4.shapes.push(billboard_next);
  g_scene4.billboard_next = billboard_next;
  
  let arrow = new ObjModel(g_obj_arrow);
  g_gadget4.shapes.push(arrow);
  arrow.pos.x = MODULE_POSES_4[0][0];
  arrow.pos.y = MODULE_POSES_4[0][1] + 50;
  arrow.pos.z = MODULE_POSES_4[0][2];
  arrow.color = [ 10, 200, 10 ];
  arrow.scale = new p5.Vector(5,5,5);
  arrow.material = "ambient"
  arrow.update = function(delta_millis) {
    g_scene4.arrow.RotateAlongLocalAxis(new p5.Vector(0,1,0), delta_millis * 0.002);
  }
  g_scene4.arrow = arrow;
  
}

function RandomCarColor() {
  const A = 64, B = 32;
  r = Math.random() * A + B;
  g = Math.random() * A + B;
  b = Math.random() * A + B;
  CAR_COLOR[0] = r;
  CAR_COLOR[1] = g;
  CAR_COLOR[2] = b;
  g_the_car.color = CAR_COLOR
}

function LoadBackgroundGadget() {
  g_bg_gadget = new Gadget();
  let m5 = new ObjModel(g_obj_car);  
  m5.scale = new p5.Vector(520, 520, 520);
  g_the_car = m5;
  
  if (false) {
    if (g_loop_count == 0) { m5.color = CAR_COLOR; }
    else { RandomCarColor(); }
  } else {
  }
  
  //m5.orientation = Mat3.RotationMatrix(new p5.Vector(0,1,0), -PI/2);
  AssignPosFromArray(m5, MODULE_POSES_4[4])
  g_bg_gadget.shapes.push(m5);
}

function LoadScene() {
  LoadScene1();
  LoadScene2();
  LoadScene3();
  LoadScene4();
  LoadScene0();
  LoadBackgroundGadget();
  
  // 初始的时候 0 和 1 都可见
  g_bg_gadget.visible = true;
  g_gadget0.visible = true;
  g_gadget1.visible = true;
  
  g_gadget0.enabled = true;
  JumpTo0();
}

// 注意！底下这些个函数都是测试用的。

function Done1() {
  g_gadget1.shapes.forEach(function(x) {
    x.OnHover();
  });
}

function Goto2() {
  g_scene1.GotoNextScene();
}

function JumpTo0() {
  g_cam.pos.x =  CAM_POS_0[0];
  g_cam.pos.y = -CAM_POS_0[1];
  g_cam.pos.z =  CAM_POS_0[2];
  g_curr_gadget = g_gadget0;
}

function JumpTo1() {
  g_cam.pos.x =  CAM_POS_1[0];
  g_cam.pos.y = -CAM_POS_1[1];
  g_cam.pos.z =  CAM_POS_1[2];
  g_curr_gadget = g_gadget1;
}

function JumpTo2() {
  g_cam.pos.x =  CAM_POS_2[0];
  g_cam.pos.y = -CAM_POS_2[1];
  g_cam.pos.z =  CAM_POS_2[2];
  g_gadget2.visible = true;
  g_gadget2.enabled = true;
  g_curr_gadget = g_gadget2;
}

function Done2() {
  g_gadget2.shapes.forEach(function(x) {
    x.OnClick();
  });
}

function Goto3() {
  g_scene2.GotoNextScene();
}

function JumpTo3() {
  g_cam.pos.x =  CAM_POS_3[0];
  g_cam.pos.y = -CAM_POS_3[1];
  g_cam.pos.z =  CAM_POS_3[2];
  g_curr_gadget = g_gadget3;
  g_gadget3.enabled = true;
  g_gadget3.visible = true;
}

function Done3() {
  g_gadget3.shapes.forEach(function(x) {
    if (x != g_scene3.billboard_next)
      x.OnClick();
  });
}

function JumpTo4() {
  g_cam.pos.x =  CAM_POS_4[0];
  g_cam.pos.y = -CAM_POS_4[1];
  g_cam.pos.z =  CAM_POS_4[2];
  g_gadget4.visible = true;
  g_gadget4.enabled = true;
  g_scene4.Reset();
  g_curr_gadget = g_gadget4;
}

function StartOver() {
  [ g_scene0, g_scene1, g_scene2, g_scene3, g_scene4 ].forEach(function(x) {
    x.Reset();
  });
  [ g_gadget1, g_gadget2, g_gadget3, g_gadget4 ].forEach(function(x) {
    x.visible = false;
  });
  g_curr_animated_obj = undefined;
  g_animator.AnimateCamera(g_cam, "pos", "x", [g_cam.pos.x, CAM_POS_0[0]], [0, 2000],
    function() {
      g_curr_animated_obj = undefined;
    })
  g_animator.AnimateCamera(g_cam, "pos", "y", [g_cam.GetPos().y, CAM_POS_0[1]], [0, 2000])
  g_animator.AnimateCamera(g_cam, "pos", "z", [g_cam.pos.z, CAM_POS_0[2]], [0, 2000])

  LoadScene()

  g_frame_count = 0;
  g_scene0.Reset();
  StartAnimationScene0();
  
  g_curr_object = g_gadget0;
  g_gadget0.visible = true;
  g_gadget0.enabled = true;
}