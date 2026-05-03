// 2025-12-12
let g_nudge_slider;
let g_select_z;
let g_arrow_len_slider;
let g_arrow_head_size_slider;
let g_arrow_strokewidth_slider;
let g_select_dataset;
let g_title_p;

let g_shape_idx = -1, g_ray_idx = -1;

DATA_DUMMY = [
  [
    "aabb",
    [ [-1,-1,-1],[1,1,1] ],
    [
      [ [2,0,0], [-1,1,0], "hit" ]
    ]
  ],
  [
    "lss",
    [ 0,-2,0,1 ], [ 0,2,0,1 ]
  ]
]

let DATASETS = [
  [ DATA_RTX5060, "RTX 5060 triangles" ],
  [ DATA_RX9070,  "RX 9070 triangles" ],
  [ DATA_DUMMY,   "Dummy" ]
]

function setup() {
  createCanvas(400, 400, WEBGL);

  g_title_p = createP();
  g_title_p.style('font-family', 'courier new');
  g_title_p.style('color', 'yellow')
  g_title_p.position(2, 2);
  g_title_p.html("Tri intersection results viz.")
  
  let p = createP();
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.position(2, height+4);
  p.html("Nudge")
  
  p = createP();
  p.position(2, 2);
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.position(2, height+24);
  p.html("Arrow")
  
  p = createP();
  p.position(2, 2);
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.position(2, height+44);
  p.html("ArrHead")
  
  p = createP();
  p.position(2, 2);
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.position(2, height+64);
  p.html("Weight")
  
  g_nudge_slider = createSlider(1, 100);
  g_nudge_slider.position(80, height+20);
  
  g_arrow_len_slider = createSlider(1, 100);
  g_arrow_len_slider.position(80, height+40);
  
  g_arrow_head_size_slider = createSlider(1, 100);
  g_arrow_head_size_slider.position(80, height+60);
  
  g_arrow_strokewidth_slider = createSlider(1, 100, 20);
  g_arrow_strokewidth_slider.position(80, height+80);
  
  g_select_z = createSelect();
  g_select_z.position(240, height+40);
  g_select_z.option("Show only +Z dirs", 0);
  g_select_z.option("Show only -Z dirs", 1);
  g_select_z.option("Show both +Z & -Z dirs", 2);
  
  g_select_dataset = createSelect();
  g_select_dataset.position(240, height+20);
  for (let i=0; i<DATASETS.length; i++) {
    g_select_dataset.option(DATASETS[i][1], i);
  }
}

function drawRay(o, d, t, col) {
  let l0 = g_arrow_len_slider.value();
  let l1 = g_arrow_head_size_slider.value();
  o = createVector(o[0], o[1], o[2]);
  d = createVector(d[0], d[1], d[2]);
  let local_x = d.cross(createVector(1, 1, 0).normalize());
  let local_y = local_x.cross(d).normalize();
  let theta = millis() * 3.14159 / 2000.0;
  push();
  beginShape(LINES)
  strokeWeight(1 + g_arrow_strokewidth_slider.value() / 20);
  const lh = 0.1 * l1 / 100.0;
  let p = o.copy().add(d.copy().mult(t));
  let p0 = local_y.copy().mult(cos(theta)).mult(lh);
  p0 = p0.copy().add(local_x.copy().mult(sin(theta)).mult(lh));
  p0 = p0.copy().sub(d.copy().normalize().mult(lh * 1.4))
  p0.add(p);
  let p1 = local_y.copy().mult(cos(theta + PI)).mult(lh);
  p1 = p1.copy().add(local_x.copy().mult(sin(theta + PI)).mult(lh));
  p1 = p1.copy().sub(d.copy().normalize().mult(lh * 1.4))
  p1.add(p);
  l0 = l0 / 100.0;
  let c = o.copy().mult(l0).add(p.copy().mult(1-l0));
  stroke(col);
  vertex(c.x, c.y, c.z);
  vertex(p.x, p.y, p.z);
  vertex(p.x, p.y, p.z);
  vertex(p0.x, p0.y, p0.z);
  vertex(p.x, p.y, p.z);
  vertex(p1.x, p1.y, p1.z);
  endShape()
  pop();
}

function draw() {
  orbitControl();
  push();
  scale(50, -50, 50);
  background(32);
  beginShape(LINES);
  const L = 1000;
  stroke("darkgrey");
  vertex(-L, 0, 0); vertex(0, 0, 0);
  stroke("red");
  vertex( L, 0, 0); vertex(0, 0, 0);
  stroke("darkgrey");
  vertex(0, -L, 0); vertex(0, 0, 0);
  stroke("lightgreen");
  vertex(0,  L, 0); vertex(0, 0, 0);
  stroke("darkgrey")
  vertex(0, 0, -L); vertex(0, 0, 0);
  stroke("blue");
  vertex(0, 0, L); vertex(0, 0, 0);
  endShape();
  
  let nudge = g_nudge_slider.value() / 100.0;
  fill("#333")
  stroke("#666")
  
  let the_data = DATASETS[g_select_dataset.value()][0];
  
  draw_rays = (rs) => {
    if (rs == undefined) return;
    for (let j=0; j<rs.length; j++) {
      let r = rs[j];
      if (g_select_z.value() == 0) {
        if (r[1][2] < 0) continue;
      } else if (g_select_z.value() == 1) {
        if (r[1][2] > 0) continue;
      }
      if (r[2] == "miss") {
       drawRay(r[0], r[1], 1, "red");
      } else {
        let hit_t = 1;
        if (r[3] != undefined) { hit_t = r[3]; }
        drawRay(r[0], r[1], hit_t, "green");
      }
    }
  };
  
  for (let i=0; i<the_data.length; i++) {
    push();
    let d = the_data[i];
    if (d[0] == "triangle") {
      let vs = d[1];
      let nudge_x = (vs[0][0] + vs[1][0] + vs[2][0]) / 3.0 * nudge;
      let nudge_y = (vs[0][1] + vs[1][1] + vs[2][1]) / 3.0 * nudge;
      let nudge_z = (vs[0][2] + vs[1][2] + vs[2][2]) / 3.0 * nudge;
      translate(nudge_x, nudge_y, nudge_z);
      beginShape();
      vertex(vs[0][0], vs[0][1], vs[0][2]);
      vertex(vs[1][0], vs[1][1], vs[1][2]);
      vertex(vs[2][0], vs[2][1], vs[2][2]);
      endShape(CLOSE);
      draw_rays(d[2]);
    } else if (d[0] == "aabb") {
      let vs = d[1];
      let lb = vs[0], ub = vs[1];
      beginShape(QUADS);
      vertex(lb[0], lb[1], lb[2]);
      vertex(ub[0], lb[1], lb[2]);
      vertex(ub[0], ub[1], lb[2]);
      vertex(lb[0], ub[1], lb[2]);
      endShape(CLOSE);
      
      beginShape(QUADS);
      vertex(lb[0], lb[1], ub[2]);
      vertex(ub[0], lb[1], ub[2]);
      vertex(ub[0], ub[1], ub[2]);
      vertex(lb[0], ub[1], ub[2]);
      endShape(CLOSE);
      
      beginShape(QUADS);
      vertex(lb[0], lb[1], lb[2]);
      vertex(ub[0], lb[1], lb[2]);
      vertex(ub[0], lb[1], ub[2]);
      vertex(lb[0], lb[1], ub[2]);
      endShape(CLOSE);
      
      beginShape(QUADS);
      vertex(lb[0], ub[1], lb[2]);
      vertex(ub[0], ub[1], lb[2]);
      vertex(ub[0], ub[1], ub[2]);
      vertex(lb[0], ub[1], ub[2]);
      endShape(CLOSE);
      
      beginShape(QUADS);
      vertex(lb[0], lb[1], lb[2]);
      vertex(lb[0], ub[1], lb[2]);
      vertex(lb[0], ub[1], ub[2]);
      vertex(lb[0], lb[1], ub[2]);
      endShape(CLOSE);
      
      beginShape(QUADS);
      vertex(ub[0], lb[1], lb[2]);
      vertex(ub[0], ub[1], lb[2]);
      vertex(ub[0], ub[1], ub[2]);
      vertex(ub[0], lb[1], ub[2]);
      endShape(CLOSE);
      
      draw_rays(d[2])
    }
    pop();
  }
}

function keyPressed() {
  if (key == ']') {}
}