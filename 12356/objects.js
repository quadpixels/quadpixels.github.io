class MyObject {
  constructor(p) {
    this.pos = p;
    this.parent = undefined;
    this.is_hovered = false;
    this.is_linked = false; // 同样音值的就会亮起来
    this.is_enabled = true;
  }
  
  SetMidiNoteNumber(n) {
    this.midi_note_number = n;
    if (n != undefined) {
      this.OnMouseClick = function() {
        PlayNote(n);
      }
    } else {
      this.OnMouseClick = undefined;
    }
  }
}

class MyTextLabel extends MyObject {
  constructor(p, txt, text_size = 12) {
    super(p);
    this.txt = txt;
    this.parent = undefined;
  }
  
  Render() {
    if (!this.is_enabled) return; 
    push();
    
    text(this.txt, this.pos.x, this.pos.y);
    pop();
  }
  
  IsMouseOver(mx, my) {
    if (!this.is_enabled) return false;
    return false;
  }
}

class MyCircle extends MyObject {
  constructor(p, r) {
    super(p);
    this.r = r;
    this.OnMouseClick = undefined;
    this.is_highlighted = false;
  }
  
  Highlight() {
    this.is_highlighted = true;
  }
  
  Unhighlight() {
    this.is_highlighted = false;
  }
  
  Render() {
    if (this.is_enabled == false) { return; }
    push();
    if (this.is_hovered) { stroke(HOVERED_STROKE); fill(HOVERED_FILL); }
    else if (this.is_linked) { stroke(LINKED_STROKE); fill(LINKED_FILL); }
    circle(this.pos.x, this.pos.y, this.r*2);
    
    noFill();
    stroke(32, 255, 32);
    if (this.is_highlighted) {
      strokeWeight(2);
      circle(this.pos.x, this.pos.y, this.r*2.4);
    }
    
    pop();
  }
  
  IsMouseOver(mx, my) {
    if (!this.is_enabled) return false;
    let dx = this.pos.x - mx, dy = this.pos.y - my;
    if (this.parent != undefined) {
      dx += this.parent.pos.x;
      dy += this.parent.pos.y;
    }
    if (dx*dx + dy*dy < this.r*this.r) { return true; }
    else { return false; }
  }
  
  Update() {
    
  }
}

class MyRect extends MyObject {
  constructor(p, hw, hh) {
    super(p);
    this.hw = hw;
    this.hh = hh;
    this.OnMouseClick = undefined;
  }
  
  Render() {
    if (this.is_hidden) return;
    push();
    rectMode(CENTER);
    if (this.is_hovered) {  stroke(HOVERED_STROKE); fill(HOVERED_FILL); }
    else if (this.is_linked) {  stroke(LINKED_STROKE); fill(LINKED_FILL); }
    rect(this.pos.x, this.pos.y, this.hw*2, this.hh*2);
    pop();
  }
  
  IsMouseOver(mx, my) {
    if (this.parent != undefined) {
      if (this.parent.is_enabled == false) return false;
    }
    if (!this.is_enabled) return false;
    let dx = this.pos.x - mx, dy = this.pos.y - my;
    if (this.parent != undefined) {
      dx += this.parent.pos.x;
      dy += this.parent.pos.y;
    }
    if (abs(dx) <= this.hw && abs(dy) <= this.hh) { return true; }
    else { return false; }
  }
}
let g_obj_serial = 0;
class FallingBlocks {
  constructor(p, w, h, num_keys = 10) {
    this.pos = p;
    this.w = w;
    this.h = h;
    this.num_keys = num_keys;
    
    this.curr_timestamp = 0;
    this.last_timestamp = 0;
    this.note_idx = 0;
    
    this.key_idx0 = 0
    
    this.state = "idle"; // idle: 没有音符； wait_input: 等待输入
    
    this.is_blocked = false;
    
    this.time_range = 2200; // 一共2200可视范围
    this.time_pad = 200; // 最下方200是铺垫空间
    
    this.SetData(DATA1);
    this.is_enabled = true;
    
    this.btn1 = new MyRect(new p5.Vector(0, -100), 150, 20);
    this.btn1.parent = this;
    
    this.buttons = [];
    this.labels  = [];
    
    let b = this.btn1;
    b.OnMouseClick = () => {
      g_falling_blocks.OnButtonClick(this.btn1);
    };
    
    this.btn2 = new MyRect(new p5.Vector(0, -40), 150, 20);
    this.btn2.parent = this;
    let b2 = this.btn2;
    b2.OnMouseClick = () => {
      g_falling_blocks.OnButtonClick(this.btn2);
    };
    
    this.label1 = new MyTextLabel(new p5.Vector(0,-100),"《青花瓷》",20);
    this.label2 = new MyTextLabel(new p5.Vector(0,-40),"《沧海一声笑》",20);
    g_objects.push(this.btn1);
    g_objects.push(this.btn2);
    
    this.state = "not_started";
    
    this.is_non_draggable = true;
  }
  
  HideAllButtons() {
    for (let idx=1; idx<=2; idx++) {
      let btn_key = "btn" + idx;
      let lbl_key = "label" + idx;
      this[btn_key].is_hidden = true;
      this[btn_key].is_enabled = false;
      this[lbl_key].is_hidden = true;
      this[lbl_key].is_enabled = false;
    }
  }
  
  ShowButtonAndLabel(idx) {
    let btn_key = "btn" + idx;
    let lbl_key = "label" + idx;
    this[btn_key].is_hidden = false;
    this[btn_key].is_enabled = true;
    this[lbl_key].is_hidden = false;
    this[lbl_key].is_enabled = true;
  }
  
  OnButtonClick(from) {
    console.log(from);
    if (from == this.btn1) {
      if (this.state == "not_started") {
        this.state = "idle";
        this.SetData(DATA1);
        this.Reset();
        this.HideAllButtons();
      }
    } else if (from == this.btn2) {
      if (this.state == "not_started") {
        this.state = "idle";
        this.SetData(DATA0);
        this.Reset();
        this.HideAllButtons();
      }
    }
  }
  
  SetData(data0) {
    const K = 250, T0 = 1500;
    this.key_data = []
    
    let t = T0;
    let max_t = 0;
    for (let i=0; i<data0.length; i++) {
      const entry = data0[i];
      let t1 = t + K*entry[1];
      if (entry[0] != -999) {
        this.key_data.push([entry[0], t, t1]);
      }
      t = t1;
      max_t = max(max_t, t);
    }
    this.max_t = max_t;
    
    // Pad
    for (let i=0; i<this.key_data.length; i++) {
      let k = this.key_data[i];
      k[1] += T0;
      k[2] += T0;
    }
    
    this.Reset();
  }
  
  Render() {
    if (!this.is_enabled) return;
    push();
    rectMode(CORNERS);
    const x0 = this.pos.x - this.w/2, x1 = this.pos.x + this.w/2;
    const y0 = this.pos.y - this.h/2, y1 = this.pos.y + this.h/2;
    
    const t0 = this.curr_timestamp - this.time_pad;
    const t1 = t0 + this.time_range;
    
    fill(COLOR5);
    stroke(COLOR2);
    rect(x0, y0, x1, y1);
    
    stroke(COLOR2);
    fill(COLOR1);
    for (let i=max(0, this.note_idx-3); i<this.key_data.length; i++) {
      const entry = this.key_data[i];
      if (entry[1] > t1 || entry[2] < t0) {
        continue;
      } else {
        // clip
        let dy1 = constrain(map(entry[1], t0, t1, y1, y0), y0, y1);
        let dy0 = constrain(map(entry[2], t0, t1, y1, y0), y0, y1);
        let keypos = entry[0];
        
        /*
        let dx0 = keypos * this.w / this.num_keys, 
            dx1 = (keypos+1) * this.w / this.num_keys;
            */
        let dx0dx1 = g_agg4.GetKeyX(keypos);
        let dx0 = dx0dx1[0], dx1 = dx0dx1[1];
        rect(dx0, dy0, dx1, dy1);
      }
    }
    
    const y2 = map(this.time_pad, 0, this.time_range, y1, y0);
    line(x0, y2, x1, y2);
    
    { // Progress bar
      const H = 8;
      fill(COLOR4);
      rect(x0, y0, constrain(x0+(x1-x0)*this.curr_timestamp/this.max_t, x0, x1), y0+H);
    }
    
    push();
    translate(this.pos.x, this.pos.y);
    this.btn1.Render();
    this.btn2.Render();
    noStroke();
    fill(COLOR2);
    this.label1.Render();
    this.label2.Render();
    pop();
    
    pop();
  }
  
  Update(delta_millis) {
    if (!this.is_enabled) return;
    if (this.state == "idle") {
      this.curr_timestamp += delta_millis;

      const nidx = this.note_idx;
      if (nidx >= 0 && nidx < this.key_data.length) {
        const curr_key = this.key_data[nidx];
        if (this.prev_timestamp <= curr_key[1] &&
            this.curr_timestamp >= curr_key[1]) {
          this.curr_timestamp = curr_key[1];
          this.state = "wait_input";
        }
      }

      this.prev_timestamp = 0;
    }
  }
  
  Reset() {
    this.curr_timestamp = 0;
    this.prev_timestamp = 0;
    this.note_idx = 0;
  }
  
  // 是键数，无关乎键的音高是多少。
  OnKeyPressed(key_idx) {
    if (this.state == "wait_input") {
      const curr_key = this.key_data[this.note_idx];
      if (curr_key[0] == key_idx) {
        this.note_idx++;
        this.state = "idle";
      }
    }
  }
}

// String在这的意思是 弦
// 数组中存的是取法的顺序，不是从低到高的 
class StringsGadget extends MyObject {
  constructor(p) {
    super(p);
    this.w = 360;
    this.h = 220;
    this.is_enabled = false;
    this.is_non_draggable = true;
    
    this.step = 0;
    
    const l0 = this.w * 0.7, l1 = l0 * 2/3, l2 = l1 * 4/3,
          l3 = l2 * 2/3, l4 = l3 * 4/3, l5 = l0 / 2;
    this.string_lens = [ l0, l1, l2, l3, l4, l5 ];
    this.freqs = [ 440, 659, 493, 739, 554, 880 ];
    this.magnitudes = [ 0,0,0,0,0,0 ];
    this.notes = [ 69, 76, 71, 78, 73, 81 ];
    this.note2idx = {
      69: 0, 76: 1, 71: 2, 78: 3, 73: 4, 81: 5
    };
    this.note2rank = {};
    const sorted_keys = sort(Object.keys(this.note2idx));
    let value = 0;
    sorted_keys.forEach((k) => {
      this.note2rank[k] = value;
      value ++;
    });
    
    this.note_y0 = [];
    this.note_y1 = [];
    this.Reset();
    this.completion = 0;
    this.state = 0;
  }

  Reset() { 
    const N = this.freqs.length;
    this.step = 0;
    this.note_y0 = [];
    this.note_y1 = [];
    const y0 = this.h*0.1, y1 = this.h*0.9;
    for (let i=0; i<N; i++) { this.note_y0.push(map(i, 0, 5, y0, y1)); }
    const sorted_y = sort(this.note_y0);
    this.notes.forEach((k) => {
      this.note_y1.push(sorted_y[this.note2rank[k]]);
    });
  }
  Step() { this.step ++; }
  
  Update(delta_ms) {
    const damp = pow(0.95, delta_ms / 16.0);
    for (let i=0; i<this.magnitudes.length; i++) {
      let x = this.magnitudes[i] * damp;
      if (abs(x) < 1e-3) x = 0;
      this.magnitudes[i] = x;
    }
    
    if (this.state == 1) {
      this.completion += delta_ms / 1000;
      this.completion = constrain(this.completion, 0, 1);
    }
  }

  Pluck(note_number) {
    let idx = this.note2idx[note_number];
    if (idx != undefined) {
      this.magnitudes[idx] = 20;
    }
  }
  
  StartSort() { this.state = 1; }
  
  Render() {
    push();
    translate(this.pos.x - this.w/2, this.pos.y - this.h/2);
    noFill();
    if (true) { // DBG
      stroke(255);
      rectMode(CORNERS);
      rect(0, 0, this.w, this.h);
    }
    
    const x0 = 16;
    const ms = millis();
    for (let i=0; i<this.step; i++) {
      const y = lerp(this.note_y0[i], this.note_y1[i], this.completion);
      let m = this.magnitudes[i];
      const x1 = x0 + this.string_lens[i];
      
      stroke(COLOR2);
      noFill();
      
      if (m > 0) {
        beginShape();
        for (let x=x0; x < x1; x+=1) {
          let theta = map(x, x0, x1, 0, PI);
          let envelope = sin(theta) * m;
          let theta1 = this.freqs[i] * (x-x0+(ms/30)) * (2*PI / 5000);
          let y1 = y + cos(theta1) * envelope;
          vertex(x, y1);
        }
        endShape();
      } else {
        line(x0, y, x0+this.string_lens[i], y);
      }
      
      fill(COLOR2);
      noStroke();
      circle(x0, y, 7);
      circle(x1, y, 7);
    }
    pop();
  }
}
