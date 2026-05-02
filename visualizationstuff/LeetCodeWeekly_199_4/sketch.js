// Orig Q:
// https://leetcode.com/problems/string-compression-ii/
//
// author: https://leetcode.com/quadpixels/
// 2020-07-26

const W = 720, H = 640;
const PANEL_W = 320, PANEL_H = 16;
const PANEL_Xs = [165, 165+330, 165+330*2];
const LABEL_Y = H - 48;
const PANEL_Y0 = 40, PANEL_Y1 = H - 64;
let g_animator;
let g_is_mouse_out = false;
let g_overlays = [];
let g_overlays2 = [];
let g_data_input, g_data_input2;
let g_banner;
let g_skip_animation = false;

class Banner {
  constructor() {
    this.x = 4; this.y = 4;
    this.text = "";
    this.textcolor = color(255);
  }
  
  SetText(txt, flag = undefined) {
    this.text = txt;
    if (flag == undefined) { this.textcolor = color(255); }
    else if (flag == "red") { this.textcolor = color(255, 0, 0); }
  }
  
  Render() {
    textAlign(LEFT, TOP);
    noStroke();
    fill(this.textcolor);
    text(this.text, this.x, this.y);
  }
}

class Animator {
  constructor() { this.subjects = []; }
  
  Animate(s, field, values, intervals, callback=null) {
    const m = millis()
    
    this.subjects.push({
      subject:  s,
      field:    field,
      values:    values,
      intervals: intervals,
      index: 0,
      start_millis: m,
      callback: callback
    })
  }
  
  Update() {
    let victims = new Set()
    const m = millis()
    for (let i=0; i<this.subjects.length; i++) {
      let s = this.subjects[i]
      const elapsed = m - s.start_millis
      while (elapsed > s.intervals[s.index+1]) {
        s.index++
      }
      
      let val, done = false;
      if (g_skip_animation) {
        s.index = s.intervals.length-1;
        done = true;
      }
      
      {
        if (s.index >= s.intervals.length-1) { // ended?
          val = s.values[s.values.length-1]
          done = true
          if (s.callback != null) { s.callback(s.subject); }
        } else {
          const x0 = elapsed - s.intervals[s.index]
          const x1 = s.intervals[s.index + 1] - s.intervals[s.index]
          let completion = x0 * 1.0 / x1
          completion = 1.0 - pow(1.0-completion, 2);
          val = lerp(s.values[s.index], s.values[s.index+1], completion)
        }
      }
      
      s.subject[s.field] = val;
      if (done) { victims.add(i); }
    }
    
    if (victims.size > 0) {
      let x = []
      for (let i=0; i<this.subjects.length; i++) {
        if (victims.has(i) == false) x.push(this.subjects[i])
      }
      this.subjects = x
    }
  }
  
  FinishPendingAnimations() {
    this.subjects.forEach((s) => {
      let val = s.values[s.values.length - 1];
      if (s.callback != null) { s.callback(s.subject); }
      s.subject[s.field] = val;
    });
    this.subjects = [];
  }
}

class State {
  constructor(nd, prefix_len, last_char, last_char_occ) {
    this.nd = nd; // Number of deletions
    this.prefix_len = prefix_len;
    this.last_char = last_char;
    this.last_char_occ = last_char_occ;
    this.x = 32; this.y = 32;
    this.full_string = "";
  }
  
  Duplicate() {
    let ret = new State(this.nd, this.prefix_len, this.last_char, this.last_char_occ);
    ret.x = this.x; ret.y = this.y; ret.full_string = this.full_string;
  }
  
  Equals(s) {
    return (this.nd == s.nd && this.prefix_len == s.prefix_len &&
            this.last_char == s.last_char && this.last_char_occ == s.last_char_occ);
  }
  
  Duplicate() {
    let ret = new State(this.nd, this.prefix_len, this.last_char, this.last_char_occ);
    ret.full_string = this.full_string;
    return ret;
  }
  
  // Note: need to set nd manually after calling this
  PushChar(c) {
    if (c != this.last_char) {
      let ret = new State(this.nd, this.GetTotalLen(), c, 1);
      ret.full_string = this.full_string + c;
      return ret;
    } else {
      let ret = new State(this.nd, this.prefix_len, c, this.last_char_occ+1);
      ret.full_string = this.full_string + c;
      return ret;
    }
  }
  
  GetTotalLen() {
    let ret = this.prefix_len;
    if (this.last_char != undefined) {
      const o = this.last_char_occ;
      if (o == 0) { }
      else if (o == 1) { ret++; }
      else if (o <= 9) { ret += 2; }
      else if (o <= 99) { ret += 3; }
      else ret += 4;
    }
    return ret;
  }
  
  RemoveFromPanel() {
    if (this.panel != undefined) {
      this.panel.EraseStateEntry(this);
    }
  }
  
  ToString() {
    if (this.str == undefined) {
      if (this.last_char_occ == 0) { this.str = "(empty string)" }
      else { this.str = this.full_string + ", RLE length: " + this.GetTotalLen(); }
    }
    /*
    return "nd=" + this.nd + ", prefix=" + this.prefix_len + ", lc=" + this.last_char + ", total_len=" + this.GetTotalLen()
    */
    return this.str;
  }
  
  GetGlobalXY() {
    if (this.global_xy_override != undefined) {
      return this.global_xy_override;
    }
    if (this.panel == undefined) { return undefined; }
    else {
      const x01 = (this.x0 + this.x1) * 0.5 - this.panel.w/2, 
            y0 = this.y - this.panel.h/2;
      return [this.panel.x + x01, this.panel.GetDispY() + y0];
    }
  }
}

class Overlay {
  constructor(state0, state1, timeout) {
    this.state0 = state0;
    this.state1 = state1;
    this.marked_for_delete = false;
    this.timeout = timeout;
    this.start_millis = millis();
  }
  
  Render() {
    if (this.marked_for_delete) {
      return;
    }
    else if (millis() > this.start_millis + this.timeout) {
      this.MarkForDelete();
    }
    noFill();
    
    stroke(255, 255, 32);
    let xy0 = this.state0.GetGlobalXY();
    let xy1 = this.state1.GetGlobalXY();
    if (xy0 != undefined && xy1 != undefined) {
      if (false) {
        line(xy0[0], xy0[1], xy1[0], xy1[1]);
      } else {
        const t = constrain((millis() - this.start_millis) / this.timeout, 0, 1);
        const xx = lerp(xy0[0], xy1[0], t);
        const yy = lerp(xy0[1], xy1[1], t);
        noStroke();
        fill(255, 255, 32);
        rectMode(CENTER);
        rect(xx, yy, 3, 3);
      }
    }
  }
  
  MarkForDelete() { this.marked_for_delete = true; }
}

// Visual cues for "going to the next iteration"
function AddOverlay(s0, s1, velocity=800) {
  if (g_skip_animation) return;
  const xy0 = s0.GetGlobalXY(), xy1 = s1.GetGlobalXY();
  const dist = sqrt(pow(xy0[0]-xy1[0], 2) + pow(xy0[1]-xy1[1], 2));
  const t = dist / velocity * 1000;
  g_overlays.push(new Overlay(s0, s1, t));
  return t;
}
function ClearOverlay() {
  g_overlays.forEach((o) => { o.MarkForDelete(); });
}
function RenderAndUpdateOverlays() {
  let tmp = [];
  g_overlays.forEach((o) => {
    o.Render();
    if (!o.marked_for_delete) { tmp.push(o); }
  });
  g_overlays = tmp;
}

class Particle {
  constructor(xy) {
    this.x = xy[0]; this.y = xy[1];
    const vx = random(-1, 1);
    const vy = random(-1, 1);
    const signx = vx > 0 ? 1 : -1;
    const signy = vy > 0 ? 1 : -1;
    this.vx = vx * vx * signx * 0.6;
    this.vy = vy * vy * signy * 0.6;
    this.start_millis = millis();
    this.lifespan = 500 + random(0, 1000);
  }
  
  Update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  
  Render() {
    point(this.x, this.y);
  }
  
  ShouldDelete() {
    return millis() > this.start_millis + this.lifespan;
  }
}

// Visual cues for "removed"
function AddOverlay2(s0) {
  if (g_skip_animation) return;
  const xy0 = s0.GetGlobalXY();
  for (let i=0; i<5; i++) {
    g_overlays2.push(new Particle(xy0));
  }
}

function RenderAndUpdateOverlays2() {
  let tmp = [];
  noFill();
  stroke(32, 255, 255);
  strokeWeight(2);
  g_overlays2.forEach((o) => {
    o.Render();
    o.Update();
    if (o.ShouldDelete()) {} else { tmp.push(o); }
  });
  strokeWeight(1);
  g_overlays2 = tmp;
}

class Panel {
  constructor() {
    this.x = 176;
    this.y = 166;
    this.target_y = this.y;
    this.y_disp = this.y;
    this.w = PANEL_W;
    this.h = PANEL_H;
    this.g = createGraphics(this.w, this.h);
    this.dirty = true;
    this.hist = {};
    this.PAD_LEFT = 32;
    this.PAD_RIGHT = 2;
    this.PAD_BOTTOM = 3;
    this.states = new Set();
    this.states_dict = {}
    this.del_count = 0;
    this.is_mouse_over = false;
    this.mouse_over_idx = 0;
    this.local_mouse_xy = [ -999, -999 ];
    this.uses_repulsor = false;
    
    for (let i=0; i<26; i++) {
      const key = String.fromCharCode('a'.charCodeAt(0) + i);
      this.states_dict[key] = [];
    }
    
    this.flash_start_millis = 0;
    this.flash_duration = 0;
  }
  
  GetX(xtick) {
    const inc = (this.w - this.PAD_LEFT - this.PAD_RIGHT) / 26;
    return this.PAD_LEFT + xtick * inc;
  }
  
  RenderTexture() {
    if (this.dirty == false) return;
    this.dirty = false;
    
    const g = this.g;
    const inc = (this.w - this.PAD_LEFT - this.PAD_RIGHT) / 26;
    g.clear();
    g.background(64);
    g.stroke(128);
    
    for (let i=0; i<=26; i++) {
      const x0 = this.GetX(i);
      g.line(x0, this.PAD_BOTTOM, x0, this.h-this.PAD_BOTTOM);
    }
    
    g.textAlign(CENTER, BOTTOM);
    g.noStroke();
    g.textSize(10);
    g.fill(128);
    for (let i=0; i<26; i++) {
      const x0 = this.PAD_LEFT + (0.5+i) * inc;
      g.text(String.fromCharCode('a'.charCodeAt(0)+i), x0, this.h-this.PAD_BOTTOM);
    }
    
    g.textAlign(LEFT, CENTER);
    g.text("" + this.del_count, 2, this.h/2)
    
    this.states.forEach((s) => {
      this.RenderStateEntry(s);
    });
  }
  
  GetDispY() { 
    return this.disp_y;
  }
  
  Flash(duration = 700) {
    if (g_skip_animation) {
      duration = 0;
    }
    this.flash_start_millis = millis();
    this.flash_duration = duration;
  }
  
  Render() {
    
    // Update
    if (abs(this.target_y - this.disp_y) > 1) {
      this.disp_y = lerp(this.disp_y, this.target_y, 0.1);
    } else {
      this.disp_y = this.target_y;
    }
    
    if (!this.ShouldDraw()) return;
    rectMode(CENTER);
    const x = this.x, y = this.GetDispY(), w = this.w, h = this.h;
    image(this.g, x-w/2, y-h/2, w, h);
    noFill();
    if (this.is_mouse_over) { stroke(192, 192, 32); }
    else { stroke(192); }
    rect(x, y, w, h);
    
    const ms = millis();
    const elapsed = (ms - this.flash_start_millis);
    if (elapsed > 0 && elapsed < this.flash_duration) {
      const t = 1.0 - elapsed / this.flash_duration;
      fill(192, 192, 192, t*222);
      noStroke();
      rect(x, y, w, h);
    }
    
    if (this.is_mouse_over) {
      const idx = this.mouse_over_idx;
      if (idx >= 0 && idx < 26) {
        const x0 = this.x - this.w/2 + this.GetX(idx),
              x1 = this.x - this.w/2 + this.GetX(idx+1);
        noStroke();
        rectMode(CORNER);
        fill(192, 192, 32, 128);
        rect(x0+2, this.PAD_BOTTOM + this.GetDispY() - this.h/2,
             x1-x0-4, this.h - 2*this.PAD_BOTTOM);
        stroke(192, 192, 32);
        
        // Draw entries in this column
        let lines = [];
        const key = String.fromCharCode("a".charCodeAt(0)+idx);
        let the_line = this.states_dict[key];
        
        lines.push(this.del_count + " deletions, ending with '" + key + "': " + the_line.length + " entries");
        let max_width = 0;
        for (let i=0; i<the_line.length; i++) {
          const line = the_line[i].ToString()
          lines.push(line);
        }
        
        for (let i=0; i<lines.length; i++) {
          const line = lines[i];
          max_width = max(max_width, textWidth(line));
        }
        
        rectMode(CORNER);
        stroke(255, 255, 32, 192);
        fill(64, 64, 64, 192);
        const LINE_HEIGHT = 12;
        const rx0 = this.local_mouse_xy[0] + this.x - this.w/2 + 16;
        const rw = max_width + 4;
        const rh = lines.length * LINE_HEIGHT;
        const ry0 = this.disp_y - rh/2;
        rect(rx0, ry0, rw, rh);
        
        noStroke();
        fill(255);
        
        textAlign(LEFT, TOP);
        for (let i=0; i<lines.length; i++) {
          const tx0 = rx0 + 2;
          const ty0 = ry0 + 2 + LINE_HEIGHT*i;
          text(lines[i], tx0, ty0);
        }
      }
    }
  }
  
  AppendStateEntry(state, delayed=false) {
    const lc = state.last_char;
    let h = this.hist;
    if (!(lc in h)) { h[lc] = 0; }
    
    state.panel = this;
    
    const idx = lc.charCodeAt(0)-'a'.charCodeAt(0)
    state.x0 = this.GetX(idx)
    state.x1 = this.GetX(idx+1);
    //state.y = this.h - this.PAD_BOTTOM - h[lc] * 2;
    state.y = this.PAD_BOTTOM + h[lc] * 2;
    
    if (!delayed) {
      this.RenderStateEntry(state);
    }
    
    h[lc] ++;
    this.states.add(state);
    this.states_dict[lc].push(state);
  }
  
  do_drawStateEntry(state) {
    this.g.noFill();
    const x0 = state.x0, x1 = state.x1;
    this.g.line(x0+2, state.y, x1-2, state.y);
  }
  
  RenderStateEntry(state) {
    this.g.stroke(255);
    this.do_drawStateEntry(state);
  }
  
  EraseStateEntry(state) { // Need to manually rerender!
    let lc = state.last_char;
    this.g.stroke(64);
    this.do_drawStateEntry(state);
    this.states.delete(state);
    
    let tmp = [], the_list = this.states_dict[lc];
    for (let i=0; i<the_list.length; i++) {
      if (the_list[i] != state) { tmp.push(the_list[i]); }
    }
    this.states_dict[lc] = tmp;
  }
  
  Clear() {
    for (let i=0; i<26; i++) {
      const key = String.fromCharCode("a".charCodeAt(0) + i);
      this.hist[key] = 0;
      this.states_dict[key] = [];
    }
    this.states = new Set();
    this.dirty = true;
  }
  
  ResetRepulsor() {
    this.target_y = this.y;
    //console.log("reset to " + this.y);
  }
  
  ReactToRepulsor(rx, ry) {
    const THRESH = 80;
    const ydiff = this.y - ry;
    //this.disp_y = this.y;
    this.target_y = this.y;
    
    if (this.uses_repulsor == true) {
      if (rx >= this.x - this.w/2 && rx <= this.x + this.w/2) {
        if (ydiff >= -THRESH && ydiff < THRESH) {
          const t = ydiff / THRESH;
          const sign = ydiff > 0 ? 1 : -1;
          const tt = (1-pow((1.0-abs(t)), 2)) * sign;
          this.target_y = THRESH*tt + ry;
        }
      }
    }
  }
  
  ReactToMouse(mx, my) {
    if (abs(mx - this.x) < this.w/2 && abs(my - this.disp_y) < this.h/2) {
      this.is_mouse_over = true;
      this.local_mouse_xy = [mx - (this.x - this.w/2), my - (this.y - this.h/2)];
      this.mouse_over_idx = parseInt((this.local_mouse_xy[0] - this.PAD_LEFT) / ((this.w - this.PAD_LEFT - this.PAD_RIGHT) / 26));
    } else {
      this.is_mouse_over = false;
    }
  }
  
  ShouldDraw() {
    if (this.idx != undefined && this.idx <= g_solution.s.length) return true;
    else return false;
  }
}

class Label {
  constructor() {
    this.x = 0;
    this.y = LABEL_Y;
    this.w = PANEL_W;
    this.h = PANEL_H;
    this.label = "label";
  }
  Render() {
    if (!this.ShouldDraw()) return;
    rectMode(CENTER);
    textAlign(CENTER, CENTER);

    const x = this.x, y = this.y, w = this.w, h = this.h;
    fill(255);
    noStroke();
    text(this.label, x, y);
    noFill();
    if (this.is_mouse_over == true) { 
      stroke(255, 255, 32); 
    }
    else { stroke(192); }
    rect(x, y, w, h);
  }
  
  ShouldDraw() {
    if (this.idx != undefined && this.idx <= g_solution.s.length) return true;
    else return false;
  }
}

class Solution {
  constructor() { }
  
  Init(s, k) {
    this.states = [];
    this.states_next = [];
    
    this.panels0 = [];
    this.panels1 = [];
    this.panels2 = [];
    g_panels = [];
    
    g_labels = [];
    for (let i=0; i<3; i++) {
      let l = new Label();
      l.x = PANEL_Xs[i];
      g_labels.push(l);
      l.label = "idx=" + i;
    }
    this.labels = g_labels;
    
    // Which Y-layout method to use?
    let layout_method = 0;
    if ((k+1) * PANEL_H > H - 60) {
      layout_method = 1;
    }
    
    for (let i=0; i<=k; i++) {
      
      let y;
      if (layout_method == 1) {
        y = lerp(PANEL_Y0, PANEL_Y1, (i+0.5)*1.0/(k+1));
      } else {
        y = H/2 + (-(k+1)/2+i)*(PANEL_H+2);
      }
      
      let p = new Panel();
      p.x = PANEL_Xs[0];
      p.y = p.target_y = p.disp_y = y; // Not very elegant yet
      p.del_count = i;
      p.idx = 0;
      p.uses_repulsor = (layout_method == 1);
      this.panels0.push(p);
      g_panels.push(p);
      
      p = new Panel();
      p.x = PANEL_Xs[1];
      p.y = p.target_y = p.disp_y = y; // Not very elegant yet
      p.del_count = i;
      p.idx = 1;
      p.uses_repulsor = (layout_method == 1);
      this.panels1.push(p);
      g_panels.push(p);
      
      p = new Panel();
      p.x = PANEL_Xs[2];
      p.y = p.target_y = p.disp_y = y; // Not very elegant yet
      p.del_count = i;
      p.idx = 2;
      p.uses_repulsor = (layout_method == 1);
      this.panels2.push(p);
      g_panels.push(p);
    }
    
    this.idx = 0;
    this.k   = k;
    this.s   = s;
    
    let s0 = new State(0, 0, 'a', 0);
    this.states.push(s0);
    this.panels0[0].AppendStateEntry(s0);
    
    this.substep = 0;
    
    this.panels_curr = this.panels0;
    this.panels_next = this.panels1;
    this.panels_other = this.panels2;
    
    this.label_curr = this.labels[0];
    this.label_next = this.labels[1];
    this.label_other = this.labels[2];
    this.label_curr.idx = 0;
    this.label_next.idx = 1;
    this.label_other.idx = 2;
    
    this.results_shown = false;
    g_result_panel.visible = false;
    
    g_banner.SetText("Algorithm just started.");
  }
  
  Step0() { // Generate new states
    const the_char = this.s[this.idx];
    this.states_next = [];
    let num_gen = 0;
    
    let overlay_stride = 1 + parseInt(this.states.length / 1000);
    
    let idx = 0;
    this.states.forEach((s) => {
      // delete
      if (s.nd < this.k) {
        let s1 = s.Duplicate();
        s1.nd = s.nd + 1;
        
        this.states_next.push(s1);
        this.panels_next[s1.nd].AppendStateEntry(s1, true);
        let duration = AddOverlay(s, s1);
        setTimeout(() => {
          this.panels_next[s1.nd].RenderStateEntry(s1);
        }, duration);
        
        //console.log(s.ToString() + ", del, " + s1.ToString());
        num_gen ++;
      }
      
      // take
      {
        let s2 = s.PushChar(the_char);
        
        this.states_next.push(s2);
        this.panels_next[s2.nd].AppendStateEntry(s2, true);
        let  duration = AddOverlay(s, s2);
        setTimeout(() => {
          this.panels_next[s2.nd].RenderStateEntry(s2);
        }, duration);
        
        num_gen ++;
        //console.log(s.ToString() + ", take, " + s2.ToString())
      }
    });
    
    g_banner.SetText("Generated " + num_gen + " new states for the next step.");
  }
  
  Step1() { // Eliminate all but the shortest RLE results ending with each char
    let tmp = []
    let num_rm = 0;
    for (let i=0; i<=this.k; i++) {
      tmp.push({}); // [num deletes][char] => minimal length
    }
    
    this.states_next.forEach((s) => {
      let dic = tmp[s.nd];
      const lc = s.last_char;
      const tl = s.GetTotalLen();
      if (lc in dic) {
        if (dic[lc] > tl) { dic[lc] = tl; }
      } else { dic[lc] = tl; }
    });
    
    let filtered = [];
    this.states_next.forEach((s) => {
      let dic = tmp[s.nd];
      const lc = s.last_char;
      const min_l = dic[lc];
      
      let dupe = false;
      
      if (s.GetTotalLen() > min_l) {
        dupe = true;
      } else if (s.GetTotalLen() == min_l) {
        for (let i=0; i<filtered.length; i++) {
          if (s.Equals(filtered[i])) {
            dupe = true;
            break;
          }
        }
      }
      
      if (dupe) {
        AddOverlay2(s);
        s.RemoveFromPanel();
        num_rm ++;
      } else {
        filtered.push(s);
      }
    });
    
    // Re-render!
    this.states_next = filtered;
    this.panels_next.forEach((p) => {
      p.RenderTexture();
      p.Flash();
    });
    
    g_banner.SetText("Removed " + num_rm + " duplicate states, " + this.states_next.length + " states remaining.");
  }
  
  Step2() { // Increment; todo: animate
    if (this.idx < this.s.length) {
      g_banner.SetText("Proceeding to step #" + (this.idx+1) + " (idx=" + (this.idx+1) + "), we have " + this.states_next.length + " states now.");
    } else {
      g_banner.SetText("Will process final results");
    }
    //this.panels_curr.forEach((p) => { 
    //  p.Clear();
    //  p.RenderTexture();
    //});
    
    let l0_nextidx = this.idx + 3;
    // ANIMATION
    this.panels_curr.forEach((p) => {
      g_animator.Animate(p, "x", [p.x, PANEL_Xs[0]-330], [0, 700], (me) => {
        me.Clear();
        me.RenderTexture();
        g_animator.Animate(me, "x", [PANEL_Xs[2]+100, PANEL_Xs[2]], [0, 250]);
      });
      p.idx = l0_nextidx;
    });
    this.panels_next.forEach((p) => {
      g_animator.Animate(p, "x", [p.x, PANEL_Xs[0]], [0, 700]);
    });
    this.panels_other.forEach((p) => {
      g_animator.Animate(p, "x", [p.x, PANEL_Xs[1]], [0, 700]);
    });
    let l0 = this.label_curr;
    g_animator.Animate(this.label_curr, "x", [this.label_curr.x, PANEL_Xs[0]-330, PANEL_Xs[2]+100, PANEL_Xs[2]], [0, 700, 701, 950], () => {
      l0.label = "idx=" + l0_nextidx;
      l0.idx = l0_nextidx;
    });
    g_animator.Animate(this.label_next, "x",  [this.label_next.x, PANEL_Xs[0]], [0, 700]);
    g_animator.Animate(this.label_other, "x", [this.label_other.x, PANEL_Xs[1]], [0, 700]);
    
    // Rotate panels
    const panels = [ this.panels0, this.panels1, this.panels2 ];
    
    const next_idx = this.idx + 1;
    this.panels_next = panels[(next_idx+1) % 3];
    this.panels_curr = panels[next_idx % 3];
    this.panels_other = panels[(next_idx+2) % 3];
    this.label_next = this.labels[(next_idx+1) % 3];
    this.label_curr = this.labels[(next_idx) % 3];
    this.label_other = this.labels[(next_idx+2) % 3];
    
    //this.states.forEach((s) => {
    //  s.RemoveFromPanel();
    //});
    
    this.states = this.states_next;
    this.states_next = [];
  }
  
  Step() {
    if (this.idx >= this.s.length) {
      if (this.results_shown != true) {
        // Show results
        g_result_panel.visible = true;
        let s = [];
        //console.log(this.panels_curr);
        this.panels_curr.forEach((panel) => {
          panel.states.forEach((st) => {
            s.push(st)
          });
        });
        g_result_panel.SetStates(s);
      }
      return;
    }
    
    // Finish all pending animations from the previous step
    g_animator.FinishPendingAnimations();
    
    switch (this.substep) {
      case 0: { this.Step0(); this.substep = 1; break; }
      case 1: { this.Step1(); this.substep = 2; break; }
      case 2: {
        this.Step2();
        this.substep = 0;
        this.idx ++;
        g_overlays = [];
        break;
      }
    }
  }
  
  SkipToLastStep() {
    g_skip_animation = true;
    while (this.idx < this.s.length) { this.Step(); }
    g_skip_animation = false;
  }
  
  PrintDebugInfo() {
    textAlign(LEFT, TOP);
    fill(255);
    noStroke();
    text("idx=" + this.idx + ", substep=" + this.substep, 0, 20);
  }
}

class ResultPanel {
  constructor() {
    this.x = PANEL_Xs[1];
    this.y = (PANEL_Y0 + PANEL_Y1) / 2;
    this.w = PANEL_W;
    this.h = 128;
    this.visible = false;
    this.text_visible = true;
    this.idxes_picked = new Set();
    this.ys = [];
    this.is_compact_mode = false;
  }
  
  SetStates(states) {
    this.states = []
    this.ys = []
    //console.log(this.states);
    
    let overfloweth = false;
    const N = states.length;
    if (N * 12 > PANEL_Y1 - PANEL_Y0) {
      this.h = PANEL_Y1 - PANEL_Y0;
      overfloweth = true;
    } else {
      this.h = N * 12;
    }
    
    let y = this.y - this.h/2 + 6;
    for (let i=0; i<states.length; i++) {
      this.states.push(states[i].Duplicate());
      let s1 = this.states[i];
      let s0 = states[i];
      const xy0 = s0.GetGlobalXY();
      const x1 = this.x - this.w/2;
      s1.global_xy_override = [x1, y];
      
      this.ys.push(y);
      if (overfloweth) {
        y += (this.h - 12) / (N-1);
      } else { y += 12; }
    }
    
    for (let i=0; i<states.length; i++) {
      let s1 = this.states[i];
      let s0 = states[i];
      AddOverlay(s0, s1, 200);
    }
    
    this.PickAnswers();
  }
  
  Render() {
    if (this.visible != true) return;
    fill(64);
    stroke(128);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h);
    
    const LINE_HEIGHT = 12;
    
    
    if (this.text_visible == true) {
      
      // Highlight bars
      noStroke();
      rectMode(CORNER);
      const x0 = this.x - this.w/2;
      const y0 = this.y - this.h/2;
      
      // Draw non-highlighted entries
      textAlign(LEFT, CENTER);
      for (let i=0; i<this.states.length; i++) {
        if (!this.idxes_picked.has(i)) {
          stroke(160);
          fill(64);
          rect(x0, this.ys[i]-LINE_HEIGHT/2, this.w, LINE_HEIGHT);

          noStroke();
          fill(255);
          text(this.states[i].ToString(), x0, this.ys[i]);
        }
      }
      
      // Draw highlighted entries
      for (let i=0; i<this.states.length; i++) {
        if (this.idxes_picked.has(i)) {
          stroke(160);
          fill(0, 192, 0, 128);
          rect(x0, this.ys[i]-LINE_HEIGHT/2, this.w, LINE_HEIGHT);

          noStroke();
          fill(255);
          text(this.states[i].ToString(), x0, this.ys[i]);
        }
      }
    }
  }
  
  PickAnswers() {
    this.idxes_picked.clear();
    let min_length = 1e9;
    for (let i=0; i<this.states.length; i++) {
      const l = this.states[i].GetTotalLen();
      if (l < min_length) {
        min_length = l;
      }
    }
    
    for (let i=0; i<this.states.length; i++) {
      if (this.states[i].GetTotalLen() == min_length) {
        this.idxes_picked.add(i);
      }
    }
    
    //console.log("picked " + this.idxes_picked.size + " out of " + this.states.length);
    //console.log(this.idxes_picked);
    g_banner.SetText("")
  }
}

let g_panels = [];
let g_labels = [];
let g_solution;
let g_result_panel;

function setup() {
  let c = createCanvas(W, H);
  g_solution = new Solution();
  g_animator = new Animator();
  
  console.dir(c);
  c.canvas.addEventListener("mouseout", function() {
    g_panels.forEach((p) => {
      p.ResetRepulsor();
    });
    g_is_mouse_out = true;
  });
  c.canvas.addEventListener("mouseover", function() {
    g_is_mouse_out = false;
  });
  
  let btn1 = createButton("Next Step");
  btn1.position(W-88, H-32);
  btn1.mousePressed(() => {
    g_solution.Step();
  });
  
  let btn2 = createButton("Use Input");
  btn2.position(8, H-32);
  btn2.mousePressed(function() {
    let v = g_data_input.value();
    let k = parseInt(g_data_input2.value());
    if (isNaN(k)) {
      g_banner.SetText("Input error: k is not valid", "red");
      return;
    }
    for (let i=0; i<v.length; i++) {
      const c = v.charCodeAt(i);
      if (c >= 97 && c <= 122) { }
      else {
        g_banner.SetText("Input error: string must be all lower-case characters")
        return;
      }
    }
    if (k > v.length) {
      g_banner.SetText("Input error: k must not be larger than the length of the input string", "red");
      return;
    }
    //console.log(v);
    //console.log(k);
    g_solution.Init(v, k);
  });
  
  g_data_input = createInput("aabbaa");
  g_data_input.size(320, 16);
  g_data_input.position(88, H-32)
  
  g_data_input2 = createInput("2");
  g_data_input2.size(20, 16);
  g_data_input2.position(420, H-32);
  
  g_result_panel = new ResultPanel();
  g_banner = new Banner();
  
  // For testing
  let btn3 = createButton("DBG");
  btn3.position(W-188, H-32);
  btn3.mousePressed(() => {
    g_solution.SkipToLastStep();
  });
}

let g_frame_count = 0;

function draw() {
  background(64);
  fill(255);
  resetMatrix();
  //translate(-0.5, -0.5);
  g_animator.Update();
  
  if (g_frame_count == 0) {
    g_solution.Init("aaabcccd", 2);
    //g_solution.Init("qazwsxedcrfvtgbyhnujmikolpqpwoeirutyghfjdkslamznxbcvf", 44);
  }
  
  g_panels.forEach((p) => {
    if (g_is_mouse_out == false) {
      p.ReactToRepulsor(mouseX, mouseY);
      p.ReactToMouse(mouseX, mouseY);
    }
    p.RenderTexture();
  });
  
  // Render hovered on top of non-hovered
  g_labels.forEach((l) => { l.Render(); });
  
  g_panels.forEach((l) => { if (l.is_mouse_over == false) { l.Render(); }});
  g_panels.forEach((l) => { if (l.is_mouse_over == true) { l.Render(); }});
  
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  //text(parseInt(frameRate()) + " fps", 0, 0);
  
  RenderAndUpdateOverlays();
  RenderAndUpdateOverlays2();
  
  //g_solution.PrintDebugInfo();
  
  if (false) {
    noFill();
    stroke(255);
    const L = 8, mx = mouseX, my = mouseY;
    line(mx-L, my, mx+L, my);
    line(mx, my-L, mx, my+L);
  }
  
  g_result_panel.Render();
  
  g_banner.Render();
  
  g_frame_count ++;
}

function keyPressed() {
  if (key == 's') {
    g_solution.SkipToLastStep();
  }
}