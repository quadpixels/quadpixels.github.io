// 2024-08-24

class Viz {
  constructor(x, y, w, h, caption) {
    this.lbs = [0,   121, 121, 242]
    this.ubs = [999, 999, 565, 565]
    this.try2 = [243, 244, 245];

    this.target = 1000;
    this.L = 6;
    this.PAD = 24;

    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;

    this.caption = caption;

    this.Clear();
  }

  
  Draw() {
    push();
    translate(this.x, this.y);
    const ms = millis();
    const delta_ms = ms - this.last_ms;
    this.last_ms = ms;
    // Increment x0 and y0
    const t = pow(0.95, delta_ms / 16.0);
    this.x0 = lerp(this.target_x0, this.x0, t);
    this.x1 = lerp(this.target_x1, this.x1, t);
    const t1 = pow(0.95, delta_ms / 16.0 * 4);
    this.y0 = lerp(this.target_y0, this.y0, t1);
    this.y1 = lerp(this.target_y1, this.y1, t1);

    // Update target_y0 and target_y1
    if (this.L > 1) {
      const ix0 = parseInt(this.x0), ix1 = parseInt(this.x1);
      const t0  = this.x0 - ix0, t1 = this.x1 - ix1;
      let dy0 = min(lerp(this.lbs[ix0], this.lbs[ix0+1], t0));
      let dy1 = max(lerp(this.ubs[ix0], this.ubs[ix0+1], t0));
      this.target_y0 = dy0;
      this.target_y1 = dy1;
    }

    const EPS = 0.01;
    if (abs(this.x0 - this.target_x0) < EPS) this.x0 = this.target_x0;
    if (abs(this.x1 - this.target_x1) < EPS) this.x1 = this.target_x1;
    if (abs(this.y0 - this.target_y0) < EPS) this.y0 = this.target_y0;
    if (abs(this.y1 - this.target_y1) < EPS) this.y1 = this.target_y1;

    push();
    const PAD = this.PAD;
    const LEFT_PAD = 8;
    noFill(); stroke(192);
    const L = this.L;
    const x0 = LEFT_PAD, x1 = this.w - PAD;
    const y0 = this.h - PAD, y1 = PAD;

    // X axis
    for (let i=0; i<L; i++) {
      if (i >= this.x0 && i <= this.x1) {
        const x = lerp(x0, x1, (i-this.x0)/(this.x1-this.x0));
        line(x, y0, x, y0-4);
      }
    }
    line(x0, y0, x1, y0);
    line(x0, y0, x0, y1);
    {
      noStroke();
      fill(192);
      textAlign(CENTER, TOP);
      let prev_x = 0;
      const TEXT_PAD = 1;
      for (let i=0; i<L; i++) {
        if (i >= this.x0 && i <= this.x1) {
          const x = lerp(x0, x1, (i-this.x0)/(this.x1-this.x0));
          if (prev_x < x - textWidth(i+"")/2 - TEXT_PAD) {
            text(i, x, y0);
            prev_x = x + textWidth(i+"")/2;
          }
        }
      }
    }
    
    noFill();
    stroke(224);
    const ty = this.MapY(this.target);
    line(x0, ty, x1, ty);
    noStroke();
    fill(192);
    textAlign(LEFT, CENTER);
    text("target=" + this.target, x1+2, ty);
    
    [[[32, 255, 32], this.lbs, this.ubs],
     //[[32, 32, 255], this.even_lbs, this.even_ubs]
    ].forEach((x) => {
        let c = x[0];
        fill("rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", 0.3)");
        stroke(c[0], c[1], c[2]);
        beginShape(TESS);
        const ix0 = parseInt(this.x0);
        const rem0 = this.x0 - ix0;
        if (rem0 > 0 && x[1].length > 1) {
          const dy0 = this.MapY(lerp(x[1][ix0], x[1][ix0+1], rem0));
          vertex(x0, dy0);
        }
        for (let i=0; i<this.draw_xlimit/*x[1].length*/; i++) {
          let ii = i;
          if (ii >= x[1].length) { ii = x[1].length - 1; }
          if (ii >= this.x0 && ii <= this.x1) {
            const dx = lerp(x0, x1, (i-this.x0)/(this.x1-this.x0));
            vertex(dx, this.MapY(x[1][ii]));
          }
        }
        for (let i=this.draw_xlimit-1/*x[2].length-1*/; i>=0; i--) {
          let ii = i;
          if (ii >= x[2].length) { ii = x[2].length - 1; }
          if (ii >= this.x0 && ii <= this.x1) {
            const dx = lerp(x0, x1, (i-this.x0)/(this.x1-this.x0));
            vertex(dx, this.MapY(x[2][ii]));
          }
        }
        if (rem0 > 0 && x[1].length > 1) {
          const dy0 = this.MapY(lerp(x[2][ix0], x[2][ix0+1], rem0));
          vertex(x0, dy0);
        }
        endShape(CLOSE);
    });

    // try2
    stroke(32, 255, 32);
    noFill();
    for (let i=0; i<this.draw_try2limit; i++) {
      const dy = this.MapY(this.try2[i]);
      line(x0, dy, x1, dy);
    }

    noStroke();
    fill(192);
    textAlign(LEFT, BOTTOM);
    text(parseInt(this.y0), LEFT_PAD, y0);
    textAlign(LEFT, TOP);
    text(parseInt(this.y1), LEFT_PAD, y1);
    
    textAlign(RIGHT, TOP);

    
    textAlign(RIGHT, TOP);
    text(this.caption, x1, y1);
    text(this.StatusString(), x1, y1 + 12);
    
    pop();
    pop();  // Translate
  }

  DrawBorder() {
    push();
    translate(this.x, this.y);
    noFill();
    stroke(192, 192, 32);
    rect(0, this.PAD-2, width-this.PAD, this.h-6-this.PAD);  // Width is very broken I don't want to fix it now
    pop();
  }

  MapY(y) {
    const PAD = this.PAD;
    const use_log = false;

    if (y > this.y1) {
      y = this.y1;
    }
    
    if (use_log) {
      if (y < 1) y = 1;
      return map(log(y), log(max(1, this.y0)), log(max(1, this.y1)), this.h-PAD, PAD);
    } else {
      return map(y, this.y0, this.y1, this.h-PAD, PAD);
    }
  }
  
  Clear() {
    this.lbs = [];
    this.ubs = [];
    this.L = 0;
    this.try2 = [];
    this.draw_try2limit = 0;
    this.step = 0;
    
    this.ymax = 1;
    this.x0 = 0;
    this.x1 = this.L;
    this.y0 = 0;
    this.y1 = 2000;
    this.target_x0 = 0;
    this.target_x1 = this.x1;
    this.target_y0 = 0;
    this.target_y1 = this.ymax;
    this.last_ms = 0;
    this.target = 0.5;

    this.draw_xlimit = 1;
    this.draw_try2limit = 0;  // Odd then Even.
    this.step = 0;

    this.optimal_value = 0;
    this.optimal_diff = 0;
    this.status_string = "";
  }

  NumSteps() {
    return this.L + this.try2.length;
  }

  Done() {
    return (this.step >= this.NumSteps());
  }

  Step() {
    if (this.Done()) { return; }
    this.step ++;

    if (this.step < this.L) {
      this.draw_xlimit = this.step;
      const XRANGE_MIN = 5;
      if (this.step == 1) {
        this.x1 = this.target_x1 = XRANGE_MIN;
        this.x0 = this.target_x0 = 0;
      } else {
        this.target_x1 = max(XRANGE_MIN, this.step);
        this.target_x0 = max(0, this.step - 5);
      }
    } else if(this.step < this.L + this.try2.length) {
      if (this.step == this.L) {
        this.target_x1 = this.step - 1;
        this.target_x0 = max(0, this.step-2);
      }
      this.draw_try2limit = this.step - this.L;
      const idx = this.step - this.L;
      const diff = abs(this.try2[idx] - this.target);
      if (idx == 0 || diff < this.optimal_diff) {
        this.optimal_diff = diff;
        this.optimal_value = this.try2[idx];
      }
      this.status_string = "value=" + this.try2[idx] + ", diff=" + diff;
    } else {

    }
  }

  StatusString() {
    //return "" + this.step + "/" + this.NumSteps() + " steps done";
    return this.status_string;
  }
}

function PopulateDummy() {
  g_viz_odd.Clear();
  g_viz_even.Clear();
  g_viz_odd.target = 1837722381;
  g_viz_even.target = 1837722381;
  AddEntry("odd", 0, 500000000);
  AddEntry("odd", 0, 250000000);
  AddEntry("odd", 0, 125000000);
  AddEntry("odd", 0, 62500000 );
  AddEntry("odd", 0, 31250000 );
  AddEntry("odd", 0, 15625000 );
  AddEntry("odd", 0, 7812500  );
  AddEntry("odd", 0, 3906250  );
  AddEntry("odd", 0, 1953125  );
  AddEntry("odd", 0, 976562   );
  AddEntry("odd", 0, 488281   );
  AddEntry("odd", 0, 244140   );
  AddEntry("odd", 0, 122070   );
  AddEntry("odd", 61034, 122070);
  AddEntry("odd", 91551, 122070);
  AddEntry("odd", 91551, 106810);
  AddEntry("odd", 99179, 106810);
  AddEntry("odd", 99179, 102994);
  AddEntry("odd", 99179, 101086);
  AddEntry("odd", 99179, 100132);
  AddEntry("odd", 99654, 100132);
  AddEntry("odd", 99892, 100132);
  AddEntry("odd", 99892, 100012);
  AddEntry("odd", 99951, 100012);
  AddEntry("odd", 99980, 100012);
  AddEntry("odd", 99995, 100012);
  AddEntry("odd", 99995, 100003);

  AddEntry("try2_odd", 99995, 0);
  AddEntry("try2_odd", 99996, 0);
  AddEntry("try2_odd", 99997, 0);
  AddEntry("try2_odd", 99998, 0);
  AddEntry("try2_odd", 99999, 0);
  AddEntry("try2_odd", 100000, 0);
  AddEntry("try2_odd", 100001, 0);
  AddEntry("try2_odd", 100002, 0);
  AddEntry("try2_odd", 100003, 0);

  AddEntry("even", 0, 500000000);
  AddEntry("even", 0, 250000000);
  AddEntry("even", 0, 125000000);
  AddEntry("even", 0, 62500000);
  AddEntry("even", 0, 31250000);
  AddEntry("even", 0, 15625000);
  AddEntry("even", 0, 7812500);
  AddEntry("even", 0, 3906250);
  AddEntry("even", 0, 1953125);
  AddEntry("even", 0, 976562);
  AddEntry("even", 0, 488281);
  AddEntry("even", 0, 244140);
  AddEntry("even", 0, 122070);
  AddEntry("even", 0, 61035);
  AddEntry("even", 0, 30517);
  AddEntry("even", 15257, 30517);
  AddEntry("even", 15257, 22887);
  AddEntry("even", 15257, 19072);
  AddEntry("even", 17163, 19072);
  AddEntry("even", 18116, 19072);
  AddEntry("even", 18116, 18594);
  AddEntry("even", 18354, 18594);
  AddEntry("even", 18354, 18474);
  AddEntry("even", 18354, 18414);
  AddEntry("even", 18354, 18384);
  AddEntry("even", 18368, 18384);
  AddEntry("even", 18375, 18384);


  AddEntry("try2_even", 18375, 0);
  AddEntry("try2_even", 18376, 0);
  AddEntry("try2_even", 18377, 0);
  AddEntry("try2_even", 18378, 0);
  AddEntry("try2_even", 18379, 0);
  AddEntry("try2_even", 18380, 0);
  AddEntry("try2_even", 18381, 0);
  AddEntry("try2_even", 18382, 0);
  AddEntry("try2_even", 18383, 0);
  AddEntry("try2_even", 18384, 0);

}

function Palin(x, is_odd) {
  let ret = x;
  x = x.toString().split('').reverse().join('');
  if (is_odd) x = x.substr(1);
  ret = ret + x;
  return parseInt(ret);
}

function SetTarget(tgt) {
  g_viz_odd.target = tgt;
  g_viz_even.target = tgt;
}

function AddEntry(oddeven, lb, ub) {
  console.log("AddEntry " + oddeven + " " + lb + " " + ub);
  if (oddeven == "odd" || oddeven == 1) {
    console.log("1");
    g_viz_odd.lbs.push(Palin(lb, true));
    g_viz_odd.ubs.push(Palin(ub, true));
  } else if (oddeven == "even" || oddeven == 2) {
    console.log("2");
    g_viz_even.lbs.push(Palin(lb, false));
    g_viz_even.ubs.push(Palin(ub, false));
  } else if (oddeven == "try2_odd" || oddeven == 3) {
    console.log("3");
    g_viz_odd.try2.push(Palin(lb, true));
  } else if (oddeven == "try2_even" || oddeven == 4) {
    console.log("4");
    g_viz_even.try2.push(Palin(lb, false));
  }
  g_viz_odd.L = max(g_viz_odd.lbs.length, g_viz_odd.lbs.length);
  g_viz_odd.target_x1 = g_viz_odd.L-1;
  g_viz_odd.ymax = max(g_viz_odd.ymax, max(lb, ub));
  g_viz_odd.target_y1 = g_viz_odd.ymax;

  g_viz_even.L = max(g_viz_even.lbs.length, g_viz_even.lbs.length);
  g_viz_even.target_x1 = g_viz_even.L-1;
  g_viz_even.ymax = max(g_viz_even.ymax, max(lb, ub));
  g_viz_even.target_y1 = g_viz_even.ymax;
}

let g_viz_odd, g_viz_even;
let g_step = 0;
let g_odd_optimal_result = [0, -1];  // Palindrome, diff
let g_even_optimal_result = [0, -1];  // Palindrome, diff
let g_optimal_result = ["odd", -1, -1];
let g_module;
async function f() {
  g_module = await Module();
}

function Clear() {
  g_viz_odd.Clear();
  g_viz_even.Clear();
  g_step = 0;
  g_odd_optimal_result = [0, -1];
  g_even_optimal_result = [0, -1];
  g_optimal_result = ["odd", -1, -1];
}

function NumSteps() {
  return g_viz_odd.NumSteps() + g_viz_even.NumSteps();
}

function Done() {
  return g_step >= NumSteps();
}

// Could have copied from cxx code
function UpdateOptimalResult() {
  if (g_odd_optimal_result[1] != -1) {
    if ((g_optimal_result[2] == -1) ||
        (g_optimal_result[2] > g_odd_optimal_result[1]) ||
        (g_optimal_result[2] == g_odd_optimal_result[1] && g_optimal_result[1] > g_odd_optimal_result[0])) {
      g_optimal_result = ["odd", g_odd_optimal_result[0], g_odd_optimal_result[1]]
    }
  }

  if (g_even_optimal_result[1] != -1) {
    if ((g_optimal_result[2] == -1) ||
        (g_optimal_result[2] > g_even_optimal_result[1]) ||
        (g_optimal_result[2] == g_even_optimal_result[1] && g_optimal_result[1] > g_even_optimal_result[0])) {
      g_optimal_result = ["even", g_even_optimal_result[0], g_even_optimal_result[1]]
    }
  }
}

function Step() {
  if (Done()) return;
  else {
    if (g_step < g_viz_odd.NumSteps()) {
      g_viz_odd.Step();
    } else {
      g_viz_even.Step();
    }
    g_step++;
    const ph = CurrPhase();
    if (ph == 1) {
      g_odd_optimal_result = [g_viz_odd.optimal_value, g_viz_odd.optimal_diff];
    }
    else if (ph == 3) {
      g_even_optimal_result = [g_viz_even.optimal_value, g_viz_even.optimal_diff];
    }
    UpdateOptimalResult();
  }
}

function CurrPhase() {
  if (g_step < g_viz_odd.lbs.length) { return 0; }
  else if (g_step < g_viz_odd.NumSteps()) { return 1; }
  else if (g_step < g_viz_odd.NumSteps() + g_viz_even.lbs.length) { return 2; }
  else if (g_step < g_viz_odd.NumSteps() + g_viz_even.NumSteps()) { return 3; }
  else return 4;
}

function setup() {
  createCanvas(480, 480);
  const h = 176;
  g_viz_odd = new Viz(8, 10, width-120, h, "Odd-length palindrome");
  g_viz_even = new Viz(8, g_viz_odd.y+h, width-120, h, "Even-length palindrome");
  
  PopulateDummy();
  f();
}

function draw() {
  background(48);
  push();
  noStroke();
  fill(255, 255, 0);
  textAlign(LEFT, TOP);
  text("564. Find the closest palindrome", 8, 8)

  textAlign(RIGHT, BOTTOM);
  text(g_step + "/" + NumSteps() + " steps done", width-8, height-8);

  textAlign(LEFT, TOP);
  fill(224);
  STEPS = [
    "1. Odd-length binary-search",
    "2. Odd-length scan through final range",
    "3. Even-length binary-search",
    "4. Even-length scan through final range",
    "5. Done"
  ];
  text("Target is " + g_viz_even.target, 16, g_viz_even.y + g_viz_even.h + 3);
  const y0 = g_viz_even.y+g_viz_even.h + 20;
  const ph = CurrPhase();
  for (let i=0; i<5; i++) {
    if (i == ph) { fill(255, 255, 0); }
    else { fill(192); }
    const dy = y0+12*i;
    text(STEPS[i], 16, dy);
    if (ph >= 1 && i == 1) {
      text("  value=" + g_odd_optimal_result[0] + ", diff=" + g_odd_optimal_result[1],
        textWidth(STEPS[i]) + 16, dy);
    }
    if (ph >= 3 && i == 3) {
      text("  value=" + g_even_optimal_result[0] + ", diff=" + g_even_optimal_result[1],
        textWidth(STEPS[i]) + 16, dy);
    }
  }

  if (ph >= 1) {
    if (ph == 4) {
      fill(32, 255, 32);
    }
    if (g_optimal_result[2] != -1) {
      text("Optimal: " + g_optimal_result[0] + ", value=" + g_optimal_result[1] + ", diff=" + g_optimal_result[2],
        16, y0+12*6);
    }
  }

  g_viz_odd.Draw();
  g_viz_even.Draw();
  if (ph == 0 || ph == 1) { g_viz_odd.DrawBorder(); }
  if (ph == 2 || ph == 3) { g_viz_even.DrawBorder(); }

  noStroke();
  fill(255, 255, 32);
  if (g_autorun) {
    textAlign(RIGHT, TOP);
    text("Autorun", width-8, 8);
  }
  
  pop();
}

function func1(a, b) {
  console.log("func1 from JS side " + a + ", " + b);
}

let g_autorun = false;
function AutorunCallback() {
  if (g_autorun) {
    let delay = 100;
    let ph = CurrPhase();

    if (ph != 4) { delay = 100; }
    else { delay = 2000; }

    if (Done() == false) {
      Step();
    }
    
    setTimeout(() => {
      if (ph == 4) {
        let tgt = parseInt(Math.random() * 1000000000 + 1);
        g_module.ccall("GenSolution", 'null', ['string'], [tgt.toString()])
      }
      AutorunCallback();
    }, delay);
  }
}

function keyPressed() {
  if (key == ' ') {
    g_autorun = false;
  } else if (key == 'a' || key == 'A') {
    g_autorun = true;
    AutorunCallback();
  }
}

setTimeout(() => {
  g_autorun = true;
  AutorunCallback();
}, 2000);