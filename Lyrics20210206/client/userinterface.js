// World coordinates


function UpdateHover() {
  g_hovered_block = undefined;
  const p = g_viewport.ToLocalPoint(g_pointer_x, g_pointer_y);
  g_buttons.forEach((b) => { b.is_hovered = false });
  g_buttons.forEach((b) => {
    if (b.IsMouseOver(p.x, p.y)) {
      g_hovered_block = b;
      b.is_hovered = true;
    } else {
      b.is_hovered = false;
    }
  });
}

function do_IsMouseOver(o, wx, wy) {
  if (wx >= o.pos.x && wx <= o.pos.x + o.w && wy >= o.pos.y && wy <= o.pos.y + o.h) { return true; }
  else return false;
}

class PushButton {
  constructor(w, h, pos, text, cb, font_size) {
    this.g = createGraphics(w, h);
    this.g.textAlign(CENTER, CENTER);
    this.g.noStroke();
    this.g.clear();
    if (font_size == undefined) {
      this.g.textSize(12);
    } else {
      this.g.textSize(font_size);
    }
    this.g.fill(66);
    this.g.text(text, w/2, h/2);
    if (pos == undefined) {
      this.pos = new p5.Vector(0, 0);
    } else {
      this.pos = pos;
    }
    this.w = w; this.h = h;
    this.OnClick = cb;
    this.is_enabled = true;
    this.is_active = true;
    this.bgcolor = "rgba(224,224,224,1)";
  }
  
  IsMouseOver(mx, my) {
    if (!this.is_active) return false;
    if (!this.is_enabled) return false;
    return do_IsMouseOver(this, mx, my);
  }
  
  Render() {
    if (!this.is_active) return;
    push();
    noFill();
    if (this.is_enabled) {
      if (this.is_hovered) { stroke(32, 224, 32); fill(255, 255, 224); }
      else { stroke(128); fill(this.bgcolor); }
    }
    rect(this.pos.x, this.pos.y, this.w, this.h);
    image(this.g, this.pos.x, this.pos.y);
    if (!this.is_enabled) {
      fill('rgba(128,128,128,0.5)');
      noStroke();
      rect(this.pos.x, this.pos.y, this.w, this.h);
    }
    pop();
  }
}

class TextLabel {
  constructor(w, h, pos, key, font_size) {
    this.w = w; this.h = h;
    if (pos == undefined) { this.pos = new p5.Vector(0, 0);
    } else { this.pos = pos; }
    this.font_size = font_size;
    this.key = key;
    this.align = LEFT;
    this.textcolor = "#000";
  }

  Render() {
    push();
    noStroke();
    fill(this.textcolor);
    textSize(this.font_size);
    textAlign(this.ALIGN, CENTER);
    text(g_state[this.key], this.pos.x, this.pos.y + this.h/2);
    pop();
  }
}