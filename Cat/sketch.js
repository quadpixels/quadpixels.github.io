// 2025-08-17

// bezier curve demo. drag the anchor/control points.

// 玩法
// 1) 金币移动到猫面前，到达面前的瞬间按键拾取
// 2) 金币在比猫高一点的地方，跳跃拾取
// 3) 金币可能出现在不同的Z位置，猫的Z位置可以移动，通过这样的移动拾取金币

let g_frames = [];
let g_highlight_segment_idx = -1;
let g_frame_idx = 0;
let g_selected_segment_idxes = new Set([]);
let g_is_animating = true;
let g_animating_frame_idx = 0;

const SILHOUETTE_IDXES = [
  [0, -1, 4, 5, 6, -3, -2],
  [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
]

function setup() {
  frameRate(60);
  createCanvas(640, 360);
  let values0 = [

      0.85,0.55, 0.75,0.4, 1,0.4,  // [0] 
    1.15,0.55, 1.25,0.4, 1,0.4,  // [1] 
    0.85,0.55, 0.85,0.55, 0.84,0.6,  // [2] 
    0.84,0.6, 0.84,0.6, 0.9,0.57,  // [3] 
    1.15,0.55, 1.15,0.55, 1.16,0.6,  // [4] 
    1.16,0.6, 1.16,0.6, 1.1,0.57,  // [5] 
    1.1,0.57, 1,0.58, 0.9,0.57,  // [6] 
    0.96,0.511, 0.96,0.511, 0.96,0.511,  // [7] 
    1.04,0.511, 1.04,0.511, 1.04,0.511,  // [8] 
    0.93,0.46, 1,0.42, 1.07,0.46,  // [9] 
    0.8305555555555556,0.44722222222222224, 0.7555555555555555,0.43333333333333335, 0.6527777777777778,0.48333333333333334,  // [10] 
    0.6527777777777778,0.48333333333333334, 0.4777777777777778,0.5527777777777778, 0.3611111111111111,0.45555555555555555,  // [11] 
    0.35833333333333334,0.4527777777777778, 0.26944444444444443,0.3416666666666667, 0.4,0.2916666666666667,  // [12] 
    0.4,0.29444444444444445, 0.45,0.26944444444444443, 0.525,0.25,  // [13] 
    0.525,0.24722222222222223, 0.5472222222222223,0.2861111111111111, 0.5472222222222223,0.2861111111111111,  // [14] 
    0.5472222222222223,0.2861111111111111, 0.497,0.333, 0.497,0.333,  // [15] 
    0.497,0.333, 0.6138888888888889,0.37222222222222223, 0.7472222222222222,0.3527777777777778,  // [16] 
    0.75,0.3527777777777778, 0.6027777777777777,0.28888888888888886, 0.6027777777777777,0.28888888888888886,  // [17] 
    0.6027777777777777,0.2861111111111111, 0.625,0.24722222222222223, 0.625,0.24722222222222223,  // [18] 
    0.625,0.24722222222222223, 0.794,0.35, 0.853,0.347,  // [19] 
    0.853,0.347, 0.9083333333333333,0.3472222222222222, 0.9805555555555555,0.4,  // [20] 
    0.3333333333333333,0.4222222222222222, 0.11666666666666667,0.6638888888888889, 0.30833333333333335,0.6472222222222223  // [21] 
  ];
  
  let values1 = [
    0.85,0.558, 0.75,0.40800000000000003, 1,0.40800000000000003,  // [0] 
    1.15,0.558, 1.25,0.40800000000000003, 1,0.40800000000000003,  // [1] 
    0.85,0.558, 0.85,0.558, 0.84,0.608,  // [2] 
    0.84,0.608, 0.84,0.608, 0.9,0.578,  // [3] 
    1.15,0.558, 1.15,0.558, 1.16,0.608,  // [4] 
    1.16,0.608, 1.16,0.608, 1.1,0.578,  // [5] 
    1.1,0.578, 1,0.588, 0.9,0.578,  // [6] 
    0.96,0.519, 0.96,0.519, 0.96,0.519,  // [7] 
    1.04,0.519, 1.04,0.519, 1.04,0.519,  // [8] 
    0.93,0.468, 1,0.428, 1.07,0.468,  // [9] 
    0.8305555555555556,0.45, 0.7305555555555555,0.4583333333333333, 0.6111111111111112,0.49166666666666664,  // [10] 
    0.6111111111111112,0.49166666666666664, 0.41944444444444445,0.5305555555555556, 0.2777777777777778,0.44166666666666665,  // [11] 
    0.2777777777777778,0.4388888888888889, 0.22777777777777777,0.3888888888888889, 0.24166666666666667,0.325,  // [12] 
    0.24166666666666667,0.3277777777777778, 0.24166666666666667,0.25, 0.24166666666666667,0.25,  // [13] 
    0.24444444444444444,0.24722222222222223, 0.29444444444444445,0.24166666666666667, 0.29444444444444445,0.24166666666666667,  // [14] 
    0.3,0.24444444444444444, 0.3138888888888889,0.3194444444444444, 0.4027777777777778,0.35,  // [15] 
    0.4027777777777778,0.3527777777777778, 0.49722222222222223,0.38055555555555554, 0.7111111111111111,0.35833333333333334,  // [16] 
    0.7222222222222222,0.35555555555555557, 0.7222222222222222,0.35555555555555557, 0.7111111111111111,0.28888888888888886,  // [17] 
    0.7138888888888889,0.2777777777777778, 0.7583333333333333,0.2833333333333333, 0.7583333333333333,0.2833333333333333,  // [18] 
    0.7611111111111111,0.2833333333333333, 0.7861111111111111,0.375, 0.8888888888888888,0.37777777777777777,  // [19] 
    0.8916666666666667,0.37777777777777777, 0.9388888888888889,0.375, 0.9722222222222222,0.4083333333333333,  // [20] 
    0.2861111111111111,0.4361111111111111, 0.08611111111111111,0.6027777777777777, 0.28055555555555556,0.6416666666666667  // [21] 
  ];
  
  let values2 = [
    0.85,0.5640000000000001, 0.75,0.41400000000000003, 1,0.41400000000000003,  // [0] 
    1.15,0.5640000000000001, 1.25,0.41400000000000003, 1,0.41400000000000003,  // [1] 
    0.85,0.5640000000000001, 0.85,0.5640000000000001, 0.84,0.614,  // [2] 
    0.84,0.614, 0.84,0.614, 0.9,0.584,  // [3] 
    1.15,0.5640000000000001, 1.15,0.5640000000000001, 1.16,0.614,  // [4] 
    1.16,0.614, 1.16,0.614, 1.1,0.584,  // [5] 
    1.1,0.584, 1,0.594, 0.9,0.584,  // [6] 
    0.96,0.525, 0.96,0.525, 0.96,0.525,  // [7] 
    1.04,0.525, 1.04,0.525, 1.04,0.525,  // [8] 
    0.93,0.47400000000000003, 1,0.434, 1.07,0.47400000000000003,  // [9] 
    0.8305555555555556,0.4527777777777778, 0.7305555555555555,0.4583333333333333, 0.6055555555555555,0.4861111111111111,  // [10] 
    0.6055555555555555,0.48333333333333334, 0.3638888888888889,0.5166666666666667, 0.2777777777777778,0.42777777777777776,  // [11] 
    0.2861111111111111,0.4361111111111111, 0.23333333333333334,0.3972222222222222, 0.20555555555555555,0.3472222222222222,  // [12] 
    0.20555555555555555,0.35, 0.175,0.30277777777777776, 0.17222222222222222,0.25555555555555554,  // [13] 
    0.17222222222222222,0.25, 0.20833333333333334,0.23333333333333334, 0.20833333333333334,0.23333333333333334,  // [14] 
    0.20555555555555555,0.23333333333333334, 0.2722222222222222,0.3194444444444444, 0.39166666666666666,0.36666666666666664,  // [15] 
    0.39166666666666666,0.36666666666666664, 0.5472222222222223,0.41944444444444445, 0.7305555555555555,0.35833333333333334,  // [16] 
    0.7361111111111112,0.35555555555555557, 0.7861111111111111,0.34444444444444444, 0.8472222222222222,0.2638888888888889,  // [17] 
    0.8472222222222222,0.2638888888888889, 0.8833333333333333,0.28055555555555556, 0.8833333333333333,0.28055555555555556,  // [18] 
    0.8861111111111111,0.28055555555555556, 0.7777777777777778,0.37777777777777777, 0.8694444444444445,0.38333333333333336,  // [19] 
    0.8722222222222222,0.38333333333333336, 0.9222222222222223,0.3888888888888889, 0.9638888888888889,0.4111111111111111,  // [20] 
    0.2861111111111111,0.4361111111111111, 0.1388888888888889,0.6222222222222222, 0.30833333333333335,0.65  // [21]     
  ];
  
  let values3 = [
    0.85,0.558, 0.75,0.40800000000000003, 1,0.40800000000000003,  // [0] 
    1.15,0.558, 1.25,0.40800000000000003, 1,0.40800000000000003,  // [1] 
    0.85,0.558, 0.85,0.558, 0.84,0.608,  // [2] 
    0.84,0.608, 0.84,0.608, 0.9,0.578,  // [3] 
    1.15,0.558, 1.15,0.558, 1.16,0.608,  // [4] 
    1.16,0.608, 1.16,0.608, 1.1,0.578,  // [5] 
    1.1,0.578, 1,0.588, 0.9,0.578,  // [6] 
    0.96,0.519, 0.96,0.519, 0.96,0.519,  // [7] 
    1.04,0.519, 1.04,0.519, 1.04,0.519,  // [8] 
    0.93,0.468, 1,0.428, 1.07,0.468,  // [9] 
    0.8305555555555556,0.45, 0.7305555555555555,0.4583333333333333, 0.6111111111111112,0.49166666666666664,  // [10] 
    0.6111111111111112,0.49166666666666664, 0.3611111111111111,0.5861111111111111, 0.25833333333333336,0.46944444444444444,  // [11] 
    0.25277777777777777,0.46944444444444444, 0.225,0.4444444444444444, 0.19722222222222222,0.4111111111111111,  // [12] 
    0.2,0.40555555555555556, 0.15833333333333333,0.325, 0.15833333333333333,0.325,  // [13] 
    0.16111111111111112,0.3194444444444444, 0.19444444444444445,0.2916666666666667, 0.19444444444444445,0.2916666666666667,  // [14] 
    0.2,0.29444444444444445, 0.25833333333333336,0.4027777777777778, 0.3472222222222222,0.39166666666666666,  // [15] 
    0.35555555555555557,0.3861111111111111, 0.5166666666666667,0.39166666666666666, 0.7111111111111111,0.35833333333333334,  // [16] 
    0.7111111111111111,0.35555555555555557, 0.775,0.3611111111111111, 0.8111111111111111,0.18055555555555555,  // [17] 
    0.8138888888888889,0.175, 0.8638888888888889,0.18333333333333332, 0.8638888888888889,0.18333333333333332,  // [18] 
    0.8666666666666667,0.18888888888888888, 0.7972222222222223,0.37777777777777777, 0.8777777777777778,0.35833333333333334,  // [19] 
    0.8861111111111111,0.35555555555555557, 0.9583333333333334,0.3527777777777778, 1.0055555555555555,0.4083333333333333,  // [20] 
    0.2388888888888889,0.46111111111111114, 0.08611111111111111,0.6027777777777777, 0.28055555555555556,0.6416666666666667  // [21] 
  ];
  
  
  g_frames = [];

  const values = [ values0, values1, values2, values3 ];

  for (let i=0; i<values.length; i++) {
    let f = [];
    const v = values[i];
    for (let j=0; j<v.length; j+=2) {
      f.push(createVector(v[j], v[j+1]));
    }
    g_frames.push(f);
  }
  g_highlight_segment_idx = parseInt(values.length/6) - 1;
}

let g_NITER = 5;
function DrawOne(p, q, s, is_add_vert) {
  let x, prev_x;
  const NITER = g_NITER;
  let iter = 0, t = 0
  for (; iter <= NITER ; iter++, t += 1.0 / NITER) {
    let a = q.copy().add(p.copy().sub(q).mult(1-t));
    let b = q.copy().add(s.copy().sub(q).mult(t));
    x = a.copy().add(b.copy().sub(a).mult(t));
    if (is_add_vert) {
      vertex(x.x, x.y);
    } else {
      if (t > 0) {
        line(x.x, x.y, prev_x.x, prev_x.y);
      }
    }
    prev_x = x;
  }
  
  if (!is_add_vert) {
    line(x.x, x.y, prev_x.x, prev_x.y);
  }
}

function ToScreenX(x) {
  if (g_is_animating) {
    return x * height * 0.4;
  } else {
    return x * height;
  }
}
function FromScreenX(x) {
  return x / height;
}

function ToScreenY(y) {
  if (g_is_animating) {
    return height * 0.8 - y * height * 0.4;
  } else {
    return height - y * height;
  }
}
function FromScreenY(y) {
  return (height - y) / height;
}

function draw() {
  const pts = g_frames[g_frame_idx];
  const NS = pts.length/3;  // Num of Segments
  push();
  
  background("rgba(170,220,240,1)");
  noStroke();
  for (let ty=0.5; ty<=1; ty+=0.02) {
    fill(lerpColor(color(170,220,240), color(71,178,143), map(ty,0.5,1,0,1)));
    rect(0, ty*height, width, 0.02*height+1)
  }
  
  push();
  beginClip();
  rect(0, 0, width, height*0.5);
  endClip();
  {
    let cx = width  * (0.25 + 0.02 * sin(millis() * 0.001));
    let cy = height * (0.22 + 0.02 * cos(millis() * 0.001));
    noStroke();
    fill("rgba(255,255,128,0.2)");
    const k0 = 0.4, k1 = 0.1;
    for (let r=height*k0; r>=height*k1; r-=height*(k0-k1)*0.2) {
      circle(cx, cy, r);
    }
  }
  pop();
  
  noFill();
  stroke(0);
  
  if (!g_is_animating) {
    g_NITER = 10;
    strokeWeight(4 * height / 360.0);
    stroke("yellow");
    for (let i=0; i<pts.length; i+=3) {
      const ii = i/3;
      if (ii == g_highlight_segment_idx) {
        if (g_selected_segment_idxes.has(ii)) {
          stroke("lightgreen");
        } else {
          stroke("cyan");
        }
      } else {
        if (g_selected_segment_idxes.has(ii)) {
          stroke("green");
        } else {
          stroke("yellow");
        }
      }
      DrawOne(createVector(ToScreenX(pts[i+0].x), ToScreenY(pts[i+0].y)),
              createVector(ToScreenX(pts[i+1].x), ToScreenY(pts[i+1].y)),
              createVector(ToScreenX(pts[i+2].x), ToScreenY(pts[i+2].y)));
    }
  } else {
    strokeWeight(4 * height / 360.0 * 0.4);
    const ms = millis();
    const nloops = ms / 500.0;  // 0.5s per 1 loop
    const loop_t = nloops - parseInt(nloops);
    const fidx = loop_t * g_frames.length;
    const fidx0 = parseInt(fidx), fidx1 = (fidx0+1) % g_frames.length;
    const t = fidx - fidx0;
    
    // BKGRND
    { 
      stroke("rgba(64,120,64,1)");
      const vanish_x = width/2, vanish_y = height * 0.35;
      const px_per_sec = width * ms / 1000 * 0.4;
      const scroll_cnt = px_per_sec / width;
      const r = fract(scroll_cnt);
      let getHorizonPoint = ((xy, y) => {
        const x1 = map(y, xy.y, vanish_y, xy.x, vanish_x);
        return createVector(x1, y);
      });
      
      if (true) {
        noStroke();
        let iter = 0;
        for (rr = -5; rr <= 5; rr+=0.5, iter++) {
          if (iter % 2 == 0) {
            fill("rgba(255,255,255,0.2)"); 
          } else {
            fill("rgba(128,128,128,0.1)"); 
          }
          const p00 = createVector((1-r+rr)    * width, height*1);
          const p10 = createVector((1-r+rr+0.5) * width, height*1);
          //point(p);
          let p01 = getHorizonPoint(p00, height * 0.45)
          let p11 = getHorizonPoint(p10, height * 0.45)
          //point(h);
          beginShape();
          vertex(p00.x, p00.y);
          vertex(p10.x, p10.y);
          vertex(p11.x, p11.y);
          vertex(p01.x, p01.y);
          endShape(CLOSE);
          //line(p00.x, p00.y, p10.x, p10.y);
        }
      }
      
      for (rr = -5; rr <= 5; rr+=1) {
        let p = createVector((1-r+rr) * width, height*0.86);
        p = getHorizonPoint(p, height * 0.72)
        fill("yellow");
        circle(p.x, p.y, 20)
        noFill();
        for (let r=20; r<25; r+=2) {
          let a = map(r,20,25,1,0);
          stroke("rgba(255,255,32," + a + ")");
          circle(p.x, p.y, r);
        }
      }
    }
    
    {
      noStroke();
      //fill(66);
      noFill();
      fill(128);
      beginShape();
      // Silhouette
      for (let si = 0; si < SILHOUETTE_IDXES.length; si++) {
        const sidxes = SILHOUETTE_IDXES[si];
        g_NITER = [3,2][si];
        //beginShape();
        for (let sii=0; sii<sidxes.length; sii++) {
          const sidx = sidxes[sii];
          const suffix0 = (sidx >= 0) ? 0 : 2;
          const suffix1 = (sidx >= 0) ? 2 : 0;
          const p00 = createVector(
            ToScreenX(g_frames[fidx0][abs(sidx)*3+suffix0].x),
            ToScreenY(g_frames[fidx0][abs(sidx)*3+suffix0].y)
          );
          const p01 = createVector(
            ToScreenX(g_frames[fidx0][abs(sidx)*3+1].x),
            ToScreenY(g_frames[fidx0][abs(sidx)*3+1].y)
          );
          const p02 = createVector(
            ToScreenX(g_frames[fidx0][abs(sidx)*3+suffix1].x),
            ToScreenY(g_frames[fidx0][abs(sidx)*3+suffix1].y)
          );
          const p10 = createVector(
            ToScreenX(g_frames[fidx1][abs(sidx)*3+suffix0].x),
            ToScreenY(g_frames[fidx1][abs(sidx)*3+suffix0].y)
          );
          const p11 = createVector(
            ToScreenX(g_frames[fidx1][abs(sidx)*3+1].x),
            ToScreenY(g_frames[fidx1][abs(sidx)*3+1].y)
          );
          const p12 = createVector(
            ToScreenX(g_frames[fidx1][abs(sidx)*3+suffix1].x),
            ToScreenY(g_frames[fidx1][abs(sidx)*3+suffix1].y)
          );
          const p0 = p5.Vector.lerp(p00, p10, t);
          const p1 = p5.Vector.lerp(p01, p11, t);
          const p2 = p5.Vector.lerp(p02, p12, t);
          DrawOne(p0, p1, p2, true);
        }
      }
      endShape(CLOSE);
    }
    
    //console.log(fidx0 + " " + fidx1 + " " + t)
    
    if (true) {
      g_NITER = 4;
      noFill();
      stroke(32);
      for (let i=0; i<pts.length; i+=3) {
        const p00 = createVector(
          ToScreenX(g_frames[fidx0][i+0].x),
          ToScreenY(g_frames[fidx0][i+0].y)
        );
        const p01 = createVector(
          ToScreenX(g_frames[fidx0][i+1].x),
          ToScreenY(g_frames[fidx0][i+1].y)
        );
        const p02 = createVector(
          ToScreenX(g_frames[fidx0][i+2].x),
          ToScreenY(g_frames[fidx0][i+2].y)
        );
        const p10 = createVector(
          ToScreenX(g_frames[fidx1][i+0].x),
          ToScreenY(g_frames[fidx1][i+0].y)
        );
        const p11 = createVector(
          ToScreenX(g_frames[fidx1][i+1].x),
          ToScreenY(g_frames[fidx1][i+1].y)
        );
        const p12 = createVector(
          ToScreenX(g_frames[fidx1][i+2].x),
          ToScreenY(g_frames[fidx1][i+2].y)
        );
        const p0 = p5.Vector.lerp(p00, p10, t);
        const p1 = p5.Vector.lerp(p01, p11, t);
        const p2 = p5.Vector.lerp(p02, p12, t);
        DrawOne(p0, p1, p2);
      }
    }
  }
  
  noStroke();
  fill("rgba(255,255,255,0.3)");
  
  if (!g_is_animating) {
    const CTRLSIZE = 10;
    if (g_highlight_segment_idx >= 0 && g_highlight_segment_idx < NS) {
      const lb = g_highlight_segment_idx * 3;
      const ub = lb + 3;
      for (let i=lb; i<ub; i++) {
        let pt = pts[i];
        fill([
          "rgba(255,32,32,0.6)",
          "rgba(32,255,32,0.6)",
          "rgba(32,32,255,0.6)"
        ][i-lb]);
        ellipse(ToScreenX(pt.x), ToScreenY(pt.y), CTRLSIZE, CTRLSIZE);

        if (mouseIsPressed) {
          if (dist(mouseX, mouseY, ToScreenX(pt.x), ToScreenY(pt.y)) < CTRLSIZE) {
            pt.x = FromScreenX(mouseX);
            pt.y = FromScreenY(mouseY);
          }
        }
      }
    }  
  }
  
  textAlign(LEFT, TOP);
  if (g_is_animating) {
    fill(192)
    text("animating", 4, 4)
  } else {
    const mx = mouseX, my = mouseY, L = 5;
    fill(192);
    const x = FromScreenX(mx), y = FromScreenY(my);
    text("X=" + x.toFixed(3) + ", Y=" + y.toFixed(3), 4, 4);
    text("Frame [" + g_frame_idx + "] total=" + g_frames.length, 4, 17);
    if (g_highlight_segment_idx >= 0 && g_highlight_segment_idx < NS) {
      text("segment [" + g_highlight_segment_idx + "] total=" + NS, 4, 30);
    } else {
      text("No highlighted segment", 4, 30);
    }
    
    text("Selected " + g_selected_segment_idxes.size + " segments", 4, 44)
  }
  
  fill(192);
  textSize(12);
  if (g_is_animating) {
    //text("我们是双翼的神马 / 飞驰在草原上", 4, height-12);
  } else {
    text("bezier curve demo / drag the handles to change the curve", 4, height-12);
  }
  pop();
}

function MoveHighlightedPoints(delta) {
  let pts = g_frames[g_frame_idx];
  g_selected_segment_idxes.forEach((i) => {
    pts[i*3  ].add(delta);
    pts[i*3+1].add(delta);
    pts[i*3+2].add(delta);
  })
}

function keyPressed() {
  let pts = g_frames[g_frame_idx];
  const NS = parseInt(pts.length/3);  // Num of Segments
  if (key === "p") {
    console.log("pts:")
    for (let i=0; i<pts.length; i+=3) {
      let line = "    " + pts[i+0].x + "," + pts[i+0].y + ", " + 
         pts[i+1].x + "," + pts[i+1].y + ", " +
         pts[i+2].x + "," + pts[i+2].y;
      if (i+3 < pts.length) { line += ","; }
      line += "  // [" + (i/3) + "]";
      console.log(line);
    }
  } else if (key == '=') {
    if (g_highlight_segment_idx == -1) {
      g_highlight_segment_idx = 0;
    } else {
      g_highlight_segment_idx ++;
      if (g_highlight_segment_idx >= NS) { g_highlight_segment_idx = 0; }
    }
  } else if (key == '-') {
    if (g_highlight_segment_idx == -1) {
      g_highlight_segment_idx = NS-1;
    } else {
      g_highlight_segment_idx --;
      if (g_highlight_segment_idx < 0) { g_highlight_segment_idx = NS - 1; }
    }
  } else if (key == '0') {
    g_highlight_segment_idx = -1;
  } else if (key == ']') {
    g_frame_idx++;
    if (g_frame_idx >= g_frames.length) { g_frame_idx = 0; }
  } else if (key == '[') {
    g_frame_idx--;
    if (g_frame_idx < 0) { g_frame_idx = g_frames.length - 1; }
  } else if (key == ' ') {
    const x = g_highlight_segment_idx;
    if (g_highlight_segment_idx >= 0 && g_highlight_segment_idx < NS) {
      if (g_selected_segment_idxes.has(x)) {
        g_selected_segment_idxes.delete(x);
      } else {
        g_selected_segment_idxes.add(x);
      }
    }
  } else if (keyCode === UP_ARROW) {
    MoveHighlightedPoints(createVector(0, 0.002));
  } else if (keyCode === DOWN_ARROW) {
    MoveHighlightedPoints(createVector(0,-0.002));
  } else if (keyCode === LEFT_ARROW) {
    MoveHighlightedPoints(createVector(-0.002,0));
  } else if (keyCode === RIGHT_ARROW) {
    MoveHighlightedPoints(createVector(0.002,0));
  } else if (key == 'a') {
    g_is_animating = !g_is_animating;
  }
  // Uncomment to prevent any default behavior.
  // return false;
}