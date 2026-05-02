class Aggregate {
  constructor(p) {
    this.objects = [];
    this.pos = p;
    this.is_enabled = true;
  }
  AddObject(o) { 
    o.parent = this;
    this.objects.push(o); 
    
    g_objects.push(o); // 注意
  }
  RenderPosition() {
    if (!this.is_enabled) return;
    if (!DEBUG_CROSSHAIR) return;
    push();
    noFill();
    stroke(255);
    const p = this.pos;
    line(p.x-10, p.y, p.x+10, p.y);
    line(p.x, p.y-10, p.x, p.y+10);
    pop();
  }
  Render() {
    if (!this.is_enabled) return;
    push();
    translate(this.pos.x, this.pos.y);
    this.objects.forEach((o) => { o.Render(); });
    pop();
        
    if (true) { // dbg
      this.RenderPosition();
    }
  }
  RemoveChildrenFromObjects() {
    let victims = new Set([]);
    this.objects.forEach((o) => { victims.add(o); });
    let new_o = [];
    g_objects.forEach((o) => {
      if (!victims.has(o)) {
        new_o.push(o);
      }
    });
    g_objects = new_o;
  }
}

class NoteNumbers extends Aggregate {
  constructor(p) {
    super(p);
    
    this.note_size = INIT_NOTE_SIZE;
    
    this.note_range = MIDI_NOTE_RANGE.slice();
    this.notes = [];
    this.labels = [];
    this.should_hide_non_A = false;
    this.number2note = {};
    this.number2label = {};
    this.is_x_centered = false;
    
    // 水平居中
    let min_x = 1e20, max_x = -1e20;
    
    for (let note = this.note_range[0]; note <= this.note_range[1]; note++) {
      const semitone = note - 69;
      const dx = semitone * this.note_size;
      const c = new MyCircle(new p5.Vector(dx, 0), 10);
      g_objects.push(c);
      c.freq = GetFreq(note);
      const num = 69 + semitone; 
      c.midi_note_number = num; // 69: A4
      c.OnMouseClick = () => {
        PlayNote(note);
        
        // scene 0 专用
        c.Unhighlight();
        if (g_scene_id == 0) {
          g_strings_gadget.Pluck(note);
        }
      };
      this.number2note[num] = note;
      
      super.AddObject(c);
      this.notes.push(c);

      min_x = min(min_x, dx);
      max_x = max(max_x, dx);
      
      const delta_x = -25;
      const t = new MyTextLabel(new p5.Vector(dx, delta_x), ""+parseInt(c.freq));
      super.AddObject(t);
      this.labels.push(t);
      this.number2label[num] = t;
      
      if ((semitone % 12) == 0) {
        c.is_A = true; t.is_A = true;
      } else { c.is_A = false; t.is_A = false; }
    }
    
    // 水平居中
    if (this.is_x_centered) {
      const x1 = (max_x + min_x) / 2;
      for (let i=0; i<this.labels.length; i++) {
        //console.log(this.notes[i].pos.x);
        this.notes[i].pos.x -= x1;
        this.labels[i].pos.x -= x1;
      }
    }
    
    this.SetDist(10);
    this.SetNoteSize(5);
    this.should_hide_non_A = true;
    
    this.is_non_draggable = true;
  }
  
  GetNoteByNumber(num) {
    if (num in this.number2note) {
      return this.number2note[num];
    } else return undefined;
  }
  GetLabelByNumber(num) {
    if (num in this.number2label) {
      return this.number2label[num];
    } else return undefined;
  }
  
  Render() {
    if (!this.is_enabled) return;
    push();
    translate(this.pos.x, this.pos.y);
    this.notes.forEach((o) => { 
      stroke(220);
      if (o.is_A && o.is_enabled) {
        push();
        stroke(220, 220, 100);
        line(o.pos.x, o.pos.y, o.pos.x, o.pos.y-15);
        pop();
      }
      o.Render(); 
    });
    
    noStroke();
    this.labels.forEach((t) => {
      if (!t.is_A) {
        if (this.should_hide_non_A) return;
        fill(TEXT_COLOR_IS_A);
      } else {
        fill(TEXT_COLOR_NON_A);
      }
      
      t.Render();
    });
    pop();
    
    this.RenderPosition();
  }
  
  SetDist(d) {
    const r = this.note_range;
    let min_x = 0, max_x = 0;
    for (let x = r[0], i=0; x<=r[1]; x++, i++) {
      const xx = d * (x-69);
      this.notes[i].pos.x = d * (x-69);
      this.labels[i].pos.x = d * (x-69);
      min_x = min(xx, min_x);
      max_x = max(xx, max_x);
    }
    if (this.is_x_centered) {
      const x1 = (max_x + min_x) / 2;
      for (let i=0; i<this.labels.length; i++) {
        //console.log(this.notes[i].pos.x);
        this.notes[i].pos.x -= x1;
        this.labels[i].pos.x -= x1;
      }
    }
  }
  SetNoteSize(note_size) {
    this.note_size = note_size;
    const r = this.note_range;
    for (let x=r[0], i=0; x<=r[1]; x++, i++) {
      this.notes[i].r = note_size;
    }
    this.labels.forEach((t) => {
      t.pos.y = -10 - note_size;
    });
  }
  
  GetNoteByNumber(n) {
    for (let i=0; i<this.notes.length; i++) {
      if (this.notes[i].midi_note_number == n) { return this.notes[i]; }
    }
    return undefined;
  }
  
  // s 是 七个键的 scale
  AlignScaleToClosestNote(s) {
    let closest_note = this.notes[0];
    let note0_x = s.notes[0].pos.x + s.pos.x;
    let min_dist = 1e20;
    this.notes.forEach((n) => {
      let xdist = abs(n.pos.x + this.pos.x - note0_x);
      if (xdist < min_dist) {
        closest_note = n;
        min_dist = xdist;
      }
    });
    
    // 对齐
    s.pos.x = this.pos.x + closest_note.pos.x - s.notes[0].pos.x;
    s.aligned_note = closest_note;
    
    s.SetStartingNote(closest_note.midi_note_number);
    
    // Left
    let n = closest_note.midi_note_number;
    while (n-12 >= MIDI_NOTE_RANGE[0]-23) { n-=12; }
    
    // 对齐玩家所用键盘
    //let first_1_note = -999;
    
    for (; n <= MIDI_NOTE_RANGE[1]; n+=12) {
      if (n == closest_note.midi_note_number) continue;
      
      // 依左边对齐
      let note = this.GetNoteByNumber(n);
      if (note != undefined) {
        let scale = new Scale(new p5.Vector(note.pos.x + this.pos.x,
                                            //note.pos.y + this.pos.y + 60
                                            SCALES_Y), g_agg3.key_dist);
        scale.is_non_draggable = true;
        scale.SetStartingNote(n);
     //   if (first_1_note == -999) { first_1_note = n; }
        scale.SetFlank();
        g_agg3_flank.push(scale);
      } else { // 依右边对齐
        note = this.GetNoteByNumber(n+11);
        if (note != undefined) {
          let scale = new Scale(new p5.Vector(note.pos.x + this.pos.x - this.note_size*11*2,
                                              //note.pos.y + this.pos.y + 60
                                              SCALES_Y), g_agg3.key_dist);
          scale.SetStartingNote(n);
    //      if (first_1_note == -999) { first_1_note = n; }
          scale.is_non_draggable = true;
          scale.SetFlank();
          g_agg3_flank.push(scale);
        }
      }
    }
    
    // 滑块的左边对齐第二个【宫】
    g_agg4.SetStartingNote(closest_note.midi_note_number - 12);
  }
  
  SetNoteRange(lb, ub) {
    const keyset = Object.keys(this.number2note);
    keyset.forEach((k) => {
      let note = this.GetNoteByNumber(k);
      let l = this.GetLabelByNumber(k);
      if (k >= lb && k <= ub) { 
        note.is_enabled = true; l.is_enabled = true;
      } else {
        note.is_enabled = false;l.is_enabled = false; 
      }
    });
  }
  
  // 返回刚刚启用的note与label
  RevealNoteByNumber(n) {
    let note = this.GetNoteByNumber(n);
    let l = this.GetLabelByNumber(n);
    if (note != undefined) { note.is_enabled = true; }
    if (l != undefined) { l.is_enabled = true; }
    return note;
  }
  
  RevealAllNotes() {
    this.notes.forEach((n) => { n.is_enabled = true; });
    this.labels.forEach((n)=> { n.is_enabled = true; });
  }
  
  HighlightNoteByNumber(n) {
    let note = this.GetNoteByNumber(n);
    if (note != undefined) {
      note.Highlight();
    }
  }
  
  UnhighlightAllNotes() {
    this.notes.forEach((n) => { n.Unhighlight(); });
  }
}

// 音阶标识，与频率表对齐
// 原点为 do
// todo: 对齐某个按键
class Scale extends Aggregate {
  constructor(p, key_dist = INIT_NOTE_SIZE) {
    super(p);
    this.objects = [];
    this.notes = [];
    this.labels = [];
    let x = 0;
    this.drag_y_constrained = true;
    
    this.aligned_note = undefined; // 与NoteNumbers上的某个Note对齐
    
    let xmult = [ 0, 2, 4, 5, 7, 9, 11 ];
    
    for (let i=0; i<7; i++) {
      let x = key_dist * xmult[i];
      
      let blah = new MyRect(new p5.Vector(x, 0), key_dist/2, 8);
      super.AddObject(blah);
      this.notes.push(blah);
      blah.parent = this;
      
      let label = new MyTextLabel(new p5.Vector(x, 16), ""+(1+i));
      super.AddObject(label);
      this.labels.push(label);
    }
    
    // If non-flank
    this.label_rect = new MyRect(new p5.Vector(key_dist * 5.5, 36), key_dist * 6,
                                 12);
    super.AddObject(this.label_rect);
    
    this.key_dist = key_dist;
  }
  SetFlank() {
    this.label_rect.is_hidden = true;
  }
  SetStartingNote(n0) {
    let xmult = [ 0,2,4,5,7,9,11 ];
    for (let i=0; i<7; i++) {
      this.notes[i].SetMidiNoteNumber(n0 + xmult[i]);
    }
  }
  Render() {
    if (!this.is_enabled) return;
    push();
    translate(this.pos.x, this.pos.y);
    
    this.notes.forEach((n) => { n.Render(); });
    push();
    noStroke();
    fill(TEXT_COLOR_NON_A);
    this.labels.forEach((l) => { l.Render(); });
    pop();
    
    this.label_rect.Render();
    
    pop();
    this.RenderPosition();
  }
  SetDist(d) {
    let xmult = [ 0, 2, 4, 5, 7, 9, 11 ];
    for (let i=0; i<7; i++) {
      this.notes[i].pos.x = d * xmult[i];
      this.labels[i].pos.x = d* xmult[i];
      this.notes[i].hw = d/2;
    }
    this.key_dist = d;
    
    this.label_rect.pos.x = d * 5.5;
    this.label_rect.hw = d * 6;
  }
  Update() {
    if (!this.is_enabled) return;
    let an = this.aligned_note;
    if (an != undefined) {
      this.pos.x = an.parent.pos.x + an.pos.x - this.notes[0].pos.x;
    }
  }
  OnStartDrag(arg) {
    if (!this.is_enabled) return;
    this.aligned_note = undefined; // Unlock.
    
    if (arg == this.label_rect) {
      RemoveFlanks();
      return false;
    } else return true; // Do not drag
  }
}

const KEY_W = 10, KEY_H = 30;
class PianoKeys extends Aggregate {
  constructor(p) {
    super(p);
    this.num_octaves = 3;
    let o_offset = -0.5 * (this.num_octaves) * KEY_W * 7;
    let midi_note_number = 60 - parseInt(this.num_octaves/2) * 12;
    
    for (let o=0; o<this.num_octaves; o++) {
      let x0 = o_offset + o * KEY_W * 7;
      const dx = [ -2.5,   -2, -1.5,   -1, -0.5, 0.5,    1, 1.5,    2, 2.5,    3, 3.5 ],
            dy = [  0.5, -0.5,  0.5, -0.5,  0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5 ];

      for (let i=0; i<12; i++) {
        let key = new MyRect(new p5.Vector(dx[i]*KEY_W + x0, dy[i]*KEY_H), 
                             KEY_W/2, KEY_H/2
                            );

        this.AddObject(key);
        key.x0 = key.pos.x; key.y0 = key.pos.y;
        key.hw0 = KEY_W/2;  key.hh0 = KEY_H/2;
        key.midi_note_number = midi_note_number;
        key.SetMidiNoteNumber(key.midi_note_number);
        //key.OnMouseClick = function() { PlayNote(key.midi_note_number); }
        midi_note_number ++;
      }
    }
    
    this.Layout(1.5);
    this.is_non_draggable = true;
  }
  
  Layout(xscale, yscale = 1) {
    let idx = 0;
    let o_offset = -0.5 * (this.num_octaves) * KEY_W * 7;
    for (let o=0; o<this.num_octaves; o++) {
      for (let i=0; i<12; i++, idx++) {
        let key = this.objects[idx];
        key.pos.x = key.x0 * xscale; key.pos.y = key.y0 * yscale;
        key.hw = key.hw0 * xscale - 1; key.hh = key.hh0 * yscale - 1;
      }
    }
  }
  
  Render() {
    if (!this.is_enabled) return;
    super.Render();
  }
}

class PlayKeys extends Aggregate {
  constructor(p, num_keys = 10) {
    super(p);
    
    this.objects = [];
    const w = width*0.85, x0 = (width-w)/2,
          btn_w = w/num_keys, gap = w / (num_keys - 1);
    let x = -w/2;
    const btn_h = 50;
    
    this.labels = [];
    this.buttons = [];
    
    const LABELS = [ "宫", "商", "角", "徵", "羽" ];
    
    this.key_x = [];
    for (let i=0; i<num_keys; i++) {
      const bx = x, by = 0;
      x = x + gap;
      let btn = new MyRect(new p5.Vector(bx, by), btn_w/2, btn_h/2);
      
      this.key_x.push([bx-btn_w/2 + p.x, bx+btn_w/2 + p.x]);
      
      super.AddObject(btn);
      this.buttons.push(btn);
      
      const lbl = new MyTextLabel(new p5.Vector(bx, by+btn_h/2+16), LABELS[i%LABELS.length]);
      super.AddObject(lbl);
      this.labels.push(lbl);
    }
    
    this.is_non_draggable = true;
  }
  SetStartingNote(n0) {
    const DELTAS = [ 2,2,3,2,3 ];
    let delta = 0;
    for (let i=0; i<this.buttons.length; i++) {
      let btn = this.buttons[i];
      btn.midi_note_number = n0 + delta;
      this.buttons[i].OnMouseClick = () => {
        g_falling_blocks.OnKeyPressed(i);
        PlayNote(btn.midi_note_number);
      }
      delta += DELTAS[i % DELTAS.length];
    }
  }
  Render() {
    if (!this.is_enabled) return;
    push();
    translate(this.pos.x, this.pos.y);
    
    this.buttons.forEach((n) => { n.Render(); });
    push();
    noStroke();
    fill(TEXT_COLOR_NON_A);
    textSize(20);
    this.labels.forEach((l) => { l.Render(); });
    pop();
    
    pop();
    this.RenderPosition();
  }
  GetKeyX(idx) {
    return this.key_x[idx];
  }
}

class MessageBox extends Aggregate {
  constructor(p, hw, hh) {
    super(p);
    this.pos = p;
    this.hw = hw; this.hh = hh;
    this.is_enabled = true;
    this.g = createGraphics(hw*2, hh*2);
    this.text_size = 16;
    this.text_pad = 10;
    
    const btn_y = this.hh - 28;
    const txt_y = this.hh - 25;
    this.button1 = new MyRect(new p5.Vector(0, btn_y), 50, 20);
    this.button1.OnMouseClick = function() { Step(); }
    //this.button1.is_non_draggable = true;
    this.is_non_draggable = true;
    this.label = new MyTextLabel(new p5.Vector(0, txt_y), "OK");
    super.AddObject(this.button1);
  }
  Render() {
    if (this.is_enabled == false) return;
    push();
    translate(this.pos.x, this.pos.y);
    rectMode(CENTER);
    fill(COLOR5);
    stroke(COLOR3);
    rect(0, 0, this.hw*2, this.hh*2);
    
    image(this.g, -this.hw + this.text_pad, -this.hh + this.text_pad);
    
    this.button1.Render();
    noStroke();
    textAlign(CENTER, CENTER);
    fill(COLOR2);
    this.label.Render();
    pop();
  }
  SetText(txt, text_size = 16) {
    this.text_size = text_size;
    this.g.clear();
    this.g.textAlign(LEFT, TOP);
    this.g.noStroke();
    this.g.fill(COLOR2);
    this.g.textSize(this.text_size);
    let idx = 0, prev_idx = 0;
    {
      const w = this.hw * 2 - this.text_pad * 2;
      let y = 4;
      while (true) {
        const t0 = txt.substr(prev_idx, idx-prev_idx),
              t1 = txt.substr(prev_idx, idx-prev_idx+1);
        if (idx == txt.length ||
            txt[idx] == "\n" ||
            this.g.textWidth(t0) <= w && this.g.textWidth(t1) >= w) {
          const line = txt.substr(prev_idx, idx-prev_idx);
          console.log("Wrote " + line);
          this.g.text(line, 0, y);
          y = y + this.text_size;
          if (txt[idx] == "\n") idx++;
          prev_idx = idx;
        }
        idx ++;
        if (idx > txt.length) break;
      }
    }
  }
  Show() {
    
  }
  Hide() {
    this.is_enabled = false;
  }
  
  Clear() {
    this.SetText("");
  }
}

class ImageBox extends Aggregate {
  constructor(p, hw, hh, image) {
    super(p);
    this.image = image;
    this.hw = hw;
    this.hh = hh;
  }
  
  Render() {
    if (this.is_enabled != true) return;
    push();
    translate(this.pos.x, this.pos.y);
    imageMode(CENTER);
    image(this.image, 0, 0,
                      2*this.hw, 2*this.hh,
                      0, 0,
                      this.image.width, this.image.height);
    noFill();
    stroke(COLOR1);
    rectMode(CENTER);
    rect(0, 0, this.hw*2, this.hh*2);
    pop();
  }
}
