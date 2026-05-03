class TestGrid {
  constructor(W, H) {
    this.cells = [];
    for (let y=0; y<H; y++) {
      let row = [];
      for (let x=0; x<W; x++) {
        row.push(0);
      }
      this.cells.push(row);
    }
    
    // Border
    for (let x=0; x<W; x++) {
      this.SetCell(x, 0,   1);
      this.SetCell(x, H-1, 1);
    }
    for (let y=0; y<H; y++) {
      this.SetCell(0,   y, 1);
      this.SetCell(W-1, y, 1);
    }
    for (let y=3; y<H-3; y++) {
      this.SetCell(parseInt(W/2), y, 1);
    }
    for (let x=parseInt(W/2)-2; x<W; x++) {
      this.SetCell(x, parseInt(H/2), 1); 
    }
    
    this.W = W; this.H = H;
    this.x0 = 4;
    this.y0 = 4;
    this.cell_width = 10;
  }
  
  SetCell(x, y, c) {
    this.cells[y][x] = c;
  }
  
  Render() {
    // 画格子中的内容
    push();
    noStroke();
    fill(255);
    for (let y=0; y<this.H; y++) {
      for (let x=0; x<this.W; x++) {
        switch (this.cells[y][x]) {
          case 0: break;
          case 1: this.RenderGrid(x,y); break;
          default: rect(x1, y1, this.cell_width, this.cell_width); break;
        }
      }
    }
    
    // 画格线
    noFill();
    stroke(128);
    for (let x=0; x<=this.W; x++) {
      const dx = this.x0 + this.cell_width*x, y0 = this.y0, y1 = y0 + this.H * this.cell_width;
      line(dx, y0, dx, y1);
    }
    for (let y=0; y<=this.H; y++) {
      const dy = this.y0 + this.cell_width*y, x0 = this.x0, x1 = x0 + this.W * this.cell_width;
      line(x0, dy, x1, dy);
    }
    
    // 如果有路径就画路径
    stroke("#ff3");
    if (this.path != undefined) {
      const l = this.path.length;
      for (let i=0; i<l-1; i++) {
        const p0 = this.path[i], p1 = this.path[i+1];
        const dx0 = this.x0 + (0.5 + p0[0]) * this.cell_width,
              dy0 = this.y0 + (0.5 + p0[1]) * this.cell_width,
              dx1 = this.x0 + (0.5 + p1[0]) * this.cell_width,
              dy1 = this.y0 + (0.5 + p1[1]) * this.cell_width;
        line(dx0, dy0, dx1, dy1);
      }
    }
    pop();
  }
  
  RenderGrid(x, y) {
    const x1 = this.x0 + this.cell_width * x, y1 = this.y0 + this.cell_width * y;
    rect(x1, y1, this.cell_width, this.cell_width);
  }
}