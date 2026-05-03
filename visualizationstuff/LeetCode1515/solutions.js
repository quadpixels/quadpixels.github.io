// Will use the global g_positions variable

class Solution {
  constructor() {
    this.steps = [];
    this.residuals = [];
    this.done = false;
  }
  Reset() {};
  NextStep() {};
  GetSteps() {};
};

// My own solution that passed
class GradientDescent extends Solution {
  constructor() {
    super();
    this.Reset();
  }
  Reset() {
    this.x = 0;
    this.y = 0;
    this.step_x = 0.5;
    this.step_y = 0.5;
    this.last_ds_dx = 0;
    this.last_ds_dy = 0;
    this.last_s = 0;
    this.done = false;
    this.steps = [[this.x, this.y]];
    this.residuals = [Eval(g_positions, this.x, this.y)];
  }
  Eval(x, y) {
    return Eval(g_positions, x, y);
  }
  NextStep() {
    if (this.done) return;
    const s = this.Eval(this.x, this.y);
    const DX = this.step_x * 0.1,
          DY = this.step_y * 0.1;

    const ds_dx = s - this.Eval(this.x - DX, this.y);
    const ds_dy = s - this.Eval(this.x, this.y - DY);

    if (ds_dx < 0) this.x += this.step_x; else this.x -= this.step_x;
    if (ds_dy < 0) this.y += this.step_y; else this.y -= this.step_y;
    

    if (ds_dx * this.last_ds_dx < 0) { this.step_x *= 0.9; }
    if (ds_dy * this.last_ds_dy < 0) { this.step_y *= 0.9; }


    this.last_ds_dx = ds_dx;
    this.last_ds_dy = ds_dy;
    
    if (abs(s - this.last_s) < 1e-9) {
      this.done = true;
    }
    this.last_s = s;
    
    // Book-keeping
    this.steps.push([this.x, this.y]);
    this.residuals.push(s);
  }
  ToString() {
    const ns = this.steps.length-1;
    let ret = "";
    if (this.done) ret = "[DONE]";
    ret += "Gradient Descent, " + ns + " steps, step_x:" + MyPrettyPrint(this.step_x); 
    ret += ", step_y:" + MyPrettyPrint(this.step_y);
    if (ns > 0) ret += ", dist:" + MyPrettyPrint(this.last_s);
    return ret
  }
}

// https://leetcode.com/problems/best-position-for-a-service-centre/discuss/731606/C%2B%2B-Simulated-Annealing
// by: lzl124631x
// adapted to js by me
class SimulatedAnnealing extends Solution {
  constructor() {
    super();
    this.Reset();
  }
  Reset() {
    this.p = [2, 0];
    this.step = 100;
    this.EPS = 1e-6;
    this.done = false;
    this.steps = [this.p.slice()];
    this.residuals = [Eval(g_positions, this.p[0], this.p[1])];
    this.ans = 1e99;
  }
  Dist(a, b) {
    return sqrt(pow(a[0]-b[0], 2) + pow(a[1]-b[1], 2));
  }
  All(A, p) {
    let ans = 0;
    for (let i=0; i<A.length; i++) { ans += this.Dist(A[i], p); }
    return ans;
  }
  NextStep() {
    if (this.done) return;
    if (this.step > this.EPS) {
      let found = false;
      const DIRS = [ [0,1], [0,-1], [-1,0], [1,0] ];
      for (let i=0; i<4; i++) {
        const dir = DIRS[i];
        let next = [this.p[0]+this.step*dir[0], this.p[1]+this.step*dir[1] ];
        let d = this.All(g_positions, next);
        if (d < this.ans) {
          this.ans = d;
          this.p = next;
          found = true;
        }
      }
      
      // Book-keeping
      this.steps.push(this.p.slice());
      this.residuals.push(this.ans);
      
      if (!found) this.step /= 2;
    } else { this.done = true; }
  }
  ToString() {
    const ns = this.steps.length-1;
    let ret = "";
    if (this.done) ret = "[DONE]";
    ret += "Simulated Annealing, " + ns + " steps";
    ret = ret + ", step_size:" + this.step;
    ret = ret + ", pos:";
    ret = ret + "(" + MyPrettyPrint(this.p[0]) + "," + MyPrettyPrint(this.p[1]) + ")";
    if (ns > 0) ret += ", dist:" + MyPrettyPrint(this.ans);
    return ret
  }
}

class Weiszfeld extends Solution {
  constructor() {
    super();
    this.Reset();
  }
  Reset() {
    const N = g_positions.length;
    this.x = 0;
    this.y = 0;
    for (let i=0; i<N; i++) {
      this.x += g_positions[i][0];
      this.y += g_positions[i][1];
    }
    this.x /= N;
    this.y /= N;
    this.done = false;
    this.preans = 1e99;
    this.ans = 1e99;
    this.residuals = [Eval(g_positions, this.x, this.y)];
    this.steps = [[this.x, this.y]]
  }
  BottomSum(x, y) {
    let res = 0;
    for (let i=0; i<g_positions.length; i++) {
      const p = g_positions[i];
      const temp = sqrt(pow(x-p[0], 2) + pow(y-p[1], 2));
      if (temp == 0) continue;
      res += 1/temp;
    }
    return res;
  }
  UpperSum(x, y) {
    let xx = 0, yy = 0;
    for (let i=0; i<g_positions.length; i++) {
      const p = g_positions[i];
      const temp = sqrt(pow(x-p[0], 2) + pow(y-p[1], 2));
      if (temp == 0) continue;
      xx += p[0]/temp;
      yy += p[1]/temp;
    }
    return [xx, yy];
  }
  NextStep() {
    if (this.done) { return; }
    let xxyy = this.UpperSum(this.x, this.y);
    let bottom = this.BottomSum(this.x, this.y);
    if (bottom == 0) {
      this.done = true;
    } else {
      this.x = xxyy[0]/bottom;
      this.y = xxyy[1]/bottom;
      this.steps.push([this.x, this.y]);
      this.preans = this.ans;
      this.ans = Eval(g_positions, this.x, this.y);
      this.residuals.push(this.ans);
      if (abs(this.ans - this.preans) < 1e-7) { this.done = true; }
    }
  }
  ToString() {
    const ns = this.steps.length-1;
    let ret = "";
    if (this.done) ret = "[DONE]";
    ret += "Weiszfeld, " + ns + " steps";
    ret = ret + ", pos:";
    ret = ret + "(" + MyPrettyPrint(this.x) + "," + MyPrettyPrint(this.y) + ")";
    if (ns > 0) ret += ", dist:" + MyPrettyPrint(this.ans);
    return ret
  }
}