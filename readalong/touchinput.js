let g_touch_state, g_touch0_identifier;
let g_pointer_x, g_pointer_y, g_touch_start_y;
let g_prev_touch_millis = 0;
const DEBOUNCE_THRESH = 100;
let g_last_mouse_pos = [-999, -999];
let g_drag_start_mouse_pos = [-999, -999];
let g_drag_start_node_pos = [-999, -999];

// Firefox的鼠标不会产生Touch事件
function TouchOrMouseStarted(event) {
  if (event instanceof TouchEvent && g_touch_state == undefined &&
      touches.length == 1) { 
    g_touch_state = "touch";
    g_pointer_x = touches[0].x;
    g_pointer_y = touches[0].y;
    g_touch0_identifier = event.changedTouches[0].identifier;
  
    UpdateHover();
    
  
    // Code dupe, not g00d !
    g_viewport_drag_y_last = 0; g_viewport_drag_x_last = 0;
    g_viewport_drag_y = 0; g_viewport_drag_x = 0;
    g_viewport_drag_y_ms = g_viewport_drag_x_ms = millis();

    if (g_hovered_button == undefined) {
      g_aligner.StartDrag(g_pointer_y / g_scale);
    }
  } else if (event instanceof MouseEvent && g_touch_state == undefined) {
    if (millis() - g_prev_touch_millis > DEBOUNCE_THRESH) {
      g_touch_state = "mouse";
      g_pointer_x = mouseX;
      g_pointer_y = mouseY;

      g_viewport_drag_y_last = 0; g_viewport_drag_x_last = 0;
      g_viewport_drag_y = 0; g_viewport_drag_x = 0;
      g_viewport_drag_y_ms = g_viewport_drag_x_ms = millis();
      if (g_hovered_button == undefined) {
        g_aligner.StartDrag(g_pointer_y / g_scale);
      }
    } else return;
  } else return;
  
  g_last_mouse_pos = [g_pointer_x, g_pointer_y];
}

function TouchOrMouseEnded(event) {
  const x0 = g_drag_start_mouse_pos[0],
        x1 = g_drag_start_mouse_pos[1];
  
  if (event instanceof TouchEvent) {
    if (g_touch_state == "touch") {
      for (let t of event.changedTouches) {
        if (t.identifier == g_touch0_identifier) {
          g_touch_state = undefined;
          g_touch0_identifier = undefined;
          g_prev_touch_millis = millis();
          
          g_aligner.EndDrag();
        }
      }
    }
  } else if (event instanceof MouseEvent) {
    if (g_touch_state == "mouse") {
      g_touch_state = undefined;
      g_pointer_x = mouseX; g_pointer_y = mouseY;
      g_prev_touch_millis = millis();
      
      g_aligner.EndDrag();
    }
  }
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

        g_aligner.OnDragMouseUpdated(g_pointer_y / g_scale);
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

      g_aligner.OnDragMouseUpdated(g_pointer_y / g_scale);
    }
  }
}