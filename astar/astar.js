// Min heap
// Element 的类型是(key, entry)
class BinaryHeap {
  constructor() {
    this.elts = [];
  }
  
  GetValue(idx) {
    return this.elts[idx][0];
  }
  
  SwapEntries(idx0, idx1) {
    const tmp = this.elts[idx0];
    this.elts[idx0] = this.elts[idx1];
    this.elts[idx1] = tmp;
  }
  
  Push(elt) {
    this.elts.push(elt);
    let idx = this.elts.length;
    while (idx > 1) {
      let idx_next = parseInt(idx / 2);
      if (this.GetValue(idx-1) < this.GetValue(idx_next-1)) {
        this.SwapEntries(idx-1, idx_next-1);
      } else break;
      idx = floor(idx / 2);
    }
  }
  
  Pop() {
    let ret = this.elts[0];
    this.elts[0] = this.elts.pop();
    let idx = 1;
    const N = this.elts.length;
    while (idx <= N) {
      const curr_value = this.GetValue(idx-1);
      let idx_next1 = idx*2, idx_next2 = idx_next1+1, idx_next;
      let ok1 = true, ok2 = true;
      if (idx_next1 <= N && this.GetValue(idx_next1-1) < curr_value) {
        ok1 = false;
      }
      if (idx_next2 <= N && this.GetValue(idx_next2-1) < curr_value) {
        ok2 = false;
      }
      if (ok1 && ok2) break;
      let next_value;
      if (!ok1) {
        if (next_value == undefined) {
          next_value = this.GetValue(idx_next1-1);
          idx_next = idx_next1;
        }
      }
      if (!ok2) {
        if (next_value == undefined || next_value > this.GetValue(idx_next2-1)) {
          next_value = this.GetValue(idx_next2-1);
          idx_next = idx_next2;
        }
      }
      
      // Swap
      this.SwapEntries(idx_next-1, idx-1);
      idx = idx_next;
    }
    return ret;
  }
  
  Print() {
    let txt = "";
    this.elts.forEach((e) => txt += e + " ");
    console.log(txt);
  }
  
  Empty() { return this.elts.length < 1; }
}

class Astar {
  // 必须和grid绑定，mask表示不能走的地方，两者放在一起定义哪里能走
  constructor(grid, mask) {
    this.H = grid.length; this.W = grid[0].length;
    this.grid = grid; this.mask = mask;
  }
  
  ToKey(x, y) {
    return y*this.W + x;
  }
  
  FromKey(k) {
    const y = parseInt(k / this.W);
    const x = parseInt(k % this.W);
    return [x, y];
  }
  
  IsPassable(x, y) {
    return this.grid[y][x] == 0
  }
  
  HScore(x0, y0, x1, y1) {
    return abs(x1-x0) + abs(y1-y0);
  }
  
  // https://en.wikipedia.org/wiki/A*_search_algorithm
  FindPath(start_x, start_y, end_x, end_y) {
    
    // 初始位置和终止位置必须是可以通过的
    if (!this.IsPassable(start_x, start_y)) return undefined;
    if (!this.IsPassable(end_x, end_y)) return undefined;
    
    let heap = new BinaryHeap();
    
    // G score at the start is 0
    // H score at the start is HScore(..)
    // F is G+H
    heap.Push([this.HScore(start_x, start_y, end_x, end_y), [start_x, start_y]]);
    let g_score = {};
    g_score[this.ToKey(start_x, start_y)] = 0;
    let came_from = {};
    
    let iter = 0;
    while (!heap.Empty()) {
      iter++;
      if (iter > 1000) break;
      let curr = heap.Pop();
      let curr_pos = curr[1];
      let curr_key = this.ToKey(curr_pos[0], curr_pos[1]);
      if (curr_pos[0] == end_x && curr_pos[1] == end_y) {
        let path = [];
        while (curr_key in came_from) {
          path.push(this.FromKey(curr_key));
          curr_key = came_from[curr_key];
        }
        // 到这里 curr 应该是开始的位置所以也加到路径里去
        path.push(this.FromKey(curr_key));
        return path;
      }
      
      // Neighbors
      const DX = [ -1,0,1,0 ], DY = [ 0,1,0,-1 ];
      for (let i=0; i<4; i++) {
        const nx = curr_pos[0]+DX[i],
              ny = curr_pos[1]+DY[i];
        const next_key = this.ToKey(nx, ny);
        if (this.IsPassable(nx, ny)) {
          const gs = g_score[curr_key] + 1;
          if (!(next_key in g_score) || g_score[next_key] > gs) {
            const hs = this.HScore(nx, ny, end_x, end_y);
            const fs = gs + hs;
            g_score[next_key] = gs;
            came_from[next_key] = curr_key;
            heap.Push([fs, [nx,ny]]);
          }
        }
      }
    }
  }
}