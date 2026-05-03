// 2025-11-22

let g_points = [];
let g_N_slider;
let g_N_p;
let g_last_N = 50;
let g_select;
let g_last_select_value = "";

const PHI = (1.0 + Math.sqrt(5)) / 2.0;

function UpdateCaption() {
  let txt = 'Fibonacci Curve<br/>';
  txt += g_last_select_value + ", n=" + g_last_N;
  g_N_p.html(txt)
}

function setup() {
  createCanvas(400, 400, WEBGL);
  g_points = GeneratePointsInUnitSquare(50);
  
  g_N_slider = createSlider(1, 200, g_last_N, 1);
  g_N_slider.position(2, height+20);
  
  g_N_p = createP();
  g_N_p.position(2, 2);
  g_N_p.style('font-family', 'courier new');
  g_N_p.style('color', 'yellow')
  g_N_p.position(5, 0);
  
  g_select = createSelect();
  g_select.option("square");
  g_select.option("circle");
  g_select.option("sphere");
  g_select.position(200, height+20);
  g_last_select_value = g_select.value()
  
  UpdateCaption();
}

// https://extremelearning.com.au/how-to-evenly-distribute-points-on-a-sphere-more-effectively-than-the-canonical-fibonacci-lattice/
function GeneratePointsInUnitSquare(N) {
  const R = 100
  let ret = [];
  for (let i=0; i<N; i++) {
    const x = fract(i * 1.0 / PHI) * R * 2 - R;
    const z = i * 1.0 / N * R * 2 - R;
    p = createVector(x, 0, z)
    ret.push(p);
  }
  return ret;
}

function GeneratePointsInUnitCircle(N) {
  const R = 100
  let ret = [];
  for (let i=0; i<N; i++) {
    const x = fract(i * 1.0 / PHI);
    const z = i * 1.0 / N;
    const theta = 2 * PI * x;
    const r = sqrt(z);
    const x1 = cos(theta) * r * R;
    const z1 = sin(theta) * r * R;
    p = createVector(x1, 0, z1)
    ret.push(p);
  }
  return ret;
}

function GeneratePointsInUnitSphere(N) {
  const R = 100
  let ret = [];
  for (let i=0; i<N; i++) {
    const x = fract(i * 1.0 / PHI);
    const z = i * 1.0 / N;
    const theta = 2 * PI * x;
    const phi = acos(1 - 2 * z);
    const x1 = cos(theta) * sin(phi) * R;
    const y1 = sin(theta) * sin(phi) * R;
    const z1 = cos(phi) * R;
    p = createVector(x1, y1, z1)
    ret.push(p);
  }
  return ret;
}

function Generate(x, n) {
  if (x == "square") {
    g_points = GeneratePointsInUnitSquare(n);
  } else if (x == "circle") {
    g_points = GeneratePointsInUnitCircle(n);
  } else {
    g_points = GeneratePointsInUnitSphere(n);
  }
}

function draw() {  
  {
    const n = g_N_slider.value();
    const sn = g_select.value();
    if (sn != g_last_select_value ||
       n != g_last_N) {
      g_last_N = n;
      g_last_select_value = sn;
      UpdateCaption(n);
      Generate(sn, n);
    }
  }
  
  orbitControl();
  push();
  scale(1, -1, 1);
  background(32);
  beginShape(LINES);
  const L = 1000;
  stroke("darkred");
  vertex(-L, 0, 0); vertex(0, 0, 0);
  stroke("red");
  vertex( L, 0, 0); vertex(0, 0, 0);
  stroke("green");
  vertex(0, -L, 0); vertex(0, 0, 0);
  stroke("lightgreen");
  vertex(0,  L, 0); vertex(0, 0, 0);
  stroke("darkblue")
  vertex(0, 0, -L); vertex(0, 0, 0);
  stroke("blue");
  vertex(0, 0, L); vertex(0, 0, 0);
  endShape();
  
  stroke("white");
  beginShape(POINTS);
  g_points.forEach((p) => {
    vertex(p.x, p.y, p.z);
  });
  endShape();
  
  pop();
}