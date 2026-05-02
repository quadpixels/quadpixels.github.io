// 触摸事件的巨坑开始
// 很拙劣的消除抖动的方法 
let g_touch_state, g_touch0_identifier;
let g_pointer_x, g_pointer_y, g_touch_start_y;
let g_prev_touch_millis = 0;
const DEBOUNCE_THRESH = 100;
const DEBOUNCE_THRESH1 = 500;
let g_last_mouse_pos = [-999, -999];
let g_drag_start_mouse_pos = [-999, -999];
let g_drag_start_node_pos = [-999, -999];
let g_viewport_drag_x = 0, g_viewport_drag_y = 0;``

function InertiaMove() {
  // 放手
  // Y
  let tx = g_viewport.pos.x, ty = g_viewport.pos.y;
  const delta_ms = g_prev_touch_millis - g_viewport_drag_y_ms;
  let diff = g_viewport_drag_y - g_viewport_drag_y_last;
  if (abs(diff) > 3) {
    g_viewport_vy = (g_viewport_drag_y - g_viewport_drag_y_last);
    ty = ty + g_viewport_vy * 10;
  }  
  
  // X
  diff = g_viewport_drag_x - g_viewport_drag_x_last;
  if (abs(diff) > 3) {
    g_viewport_vx = (g_viewport_drag_x - g_viewport_drag_x_last);
  }
  g_viewport.target_pos = new p5.Vector(tx, ty);
  
  g_viewport_drag_x = g_viewport_drag_y = 0;
}


// Firefox的鼠标不会产生Touch事件
function TouchOrMouseStarted(event) {
  if (window.TouchEvent && event instanceof TouchEvent && g_touch_state == undefined &&
      touches.length == 1) { 
    g_touch_state = "touch";
    g_pointer_x = touches[0].x;
    g_pointer_y = touches[0].y;
    g_touch0_identifier = event.changedTouches[0].identifier;
  
    UpdateHover();
    g_viewport.StartDrag();
  
    // Code dupe, not g00d !
    g_viewport_drag_y_last = 0; g_viewport_drag_x_last = 0;
    g_viewport_drag_y = 0; g_viewport_drag_x = 0;
    g_viewport_drag_y_ms = g_viewport_drag_x_ms = millis();
    
    
  } else if (event instanceof MouseEvent && g_touch_state == undefined) {
    if (millis() - g_prev_touch_millis > DEBOUNCE_THRESH) {
      g_touch_state = "mouse";
      g_pointer_x = mouseX;
      g_pointer_y = mouseY;
  
      g_viewport_drag_y_last = 0; g_viewport_drag_x_last = 0;
      g_viewport_drag_y = 0; g_viewport_drag_x = 0;
      g_viewport_drag_y_ms = g_viewport_drag_x_ms = millis();
      
      g_viewport.StartDrag();
    } else return;
  } else return;
  
  g_last_mouse_pos = [g_pointer_x, g_pointer_y];
}

function touchStarted(event) {
  TouchOrMouseStarted(event);
}

function mousePressed(event) {
  TouchOrMouseStarted(event);
}

function TouchOrMouseEnded(event) {
  const x0 = g_drag_start_mouse_pos[0],
        x1 = g_drag_start_mouse_pos[1];
  
  if (window.TouchEvent && event instanceof TouchEvent) { // TouchEvent for FF
    if (g_touch_state == "touch") {
      for (let t of event.changedTouches) {
        if (t.identifier == g_touch0_identifier) {
          g_touch_state = undefined;
          g_touch0_identifier = undefined;
          let ms = millis(), elapsed = ms - g_prev_touch_millis;
          InertiaMove();
          
          if (elapsed > DEBOUNCE_THRESH1) {
            const TOUCH_DIST_SQ_THRESH = 88;
            const dx = g_pointer_x - g_last_mouse_pos[0];
            const dy = g_pointer_y - g_last_mouse_pos[1];
            if (dx*dx + dy*dy <= TOUCH_DIST_SQ_THRESH) {
              if (g_hovered_block != undefined) {
                if (g_hovered_block.OnClick != undefined) {
                  g_hovered_block.OnClick();
                  g_prev_touch_millis = ms;
                  g_dirty += 2;
                }
              }
            }
          }
          
          if (g_drag_is_release) {
            RequestReleaseCandidate();
          }
        }
      }
    }
  } else if (event instanceof MouseEvent) {
    if (g_touch_state == "mouse") {
      g_touch_state = undefined;
      g_pointer_x = mouseX; g_pointer_y = mouseY;
      g_prev_touch_millis = millis();
      InertiaMove();
      const dx = g_pointer_x - g_last_mouse_pos[0];
      const dy = g_pointer_y - g_last_mouse_pos[1];
      const CLICK_DIST_SQ_THRESH = 10;
      if (dx*dx + dy*dy <= CLICK_DIST_SQ_THRESH) {
        if (g_hovered_block != undefined) {
          if (g_hovered_block.OnClick != undefined) {
            g_hovered_block.OnClick();
            g_dirty += 2;
          }
        }
      }
      if (g_drag_is_release) {
        RequestReleaseCandidate();
      }
    }
  }
}

function touchEnded(event) {
  TouchOrMouseEnded(event);
}
function mouseReleased(event) {
  TouchOrMouseEnded(event);
}

function TouchOrMouseMoved(event) {
  if (g_touch_state == "touch" && event instanceof TouchEvent) {
    for (let t of event.changedTouches) {
      if (t.identifier == g_touch0_identifier) {
        g_pointer_x = t.clientX;
        g_pointer_y = t.clientY;
        
        g_viewport_drag_y_last = g_viewport_drag_y;
        g_viewport_drag_y_ms = millis();
        g_viewport_drag_y = g_last_mouse_pos[1] - g_pointer_y;
        g_viewport_drag_x_last = g_viewport_drag_x;
        g_viewport_drag_x_ms = millis();
        g_viewport_drag_x = g_last_mouse_pos[0] - g_pointer_x;
      }
    }
  } else if (event instanceof MouseEvent) {
    g_pointer_x = mouseX;
    g_pointer_y = mouseY;
    
    if (g_touch_state == "mouse") {
      g_viewport_drag_y_last = g_viewport_drag_y;
      g_viewport_drag_y_ms = millis();
      g_viewport_drag_y = g_last_mouse_pos[1] - g_pointer_y;
      g_viewport_drag_x_last = g_viewport_drag_x;
      g_viewport_drag_x_ms = millis();
      g_viewport_drag_x = g_last_mouse_pos[0] - g_pointer_x;
    }
  }
}

function touchMoved(event) {
  TouchOrMouseMoved(event);
}

function mouseMoved() {
  TouchOrMouseMoved(event);
}

// 不要缩放，就scroll
function mouseWheel(event) {
  const delta = event.delta;
  const zoom = pow(0.95, delta/10);
  //g_viewport.Zoom(zoom);
  
  g_viewport.ScrollY(delta);
}