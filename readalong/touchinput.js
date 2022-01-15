let g_touch_state, g_touch0_identifier;
let g_pointer_x, g_pointer_y, g_touch_start_y;
let g_prev_touch_millis = 0;
const DEBOUNCE_THRESH = 20;
let g_prev_touch_start_milis = 0;
const TEMP_DISABLE_MOUSE_THRESH = 2000; // 触摸后在这么长的时间内，忽略鼠标事件
let g_last_mouse_pos = [-999, -999];
let g_drag_start_mouse_pos = [-999, -999];
let g_drag_start_node_pos = [-999, -999];

// Firefox的鼠标不会产生Touch事件
function TouchOrMouseStarted(event) {
  const ms = millis();
  if (typeof(TouchEvent)!="undefined" && 
      event instanceof TouchEvent && 
      g_touch_state == undefined &&
      touches.length == 1) { 
    console.log("touch event");
    g_touch_state = "touch";
    g_pointer_x = touches[0].x;
    g_pointer_y = touches[0].y;
    g_touch0_identifier = event.changedTouches[0].identifier;
  
    // Code dupe, not g00d !
    g_viewport_drag_y_last = 0; g_viewport_drag_x_last = 0;
    g_viewport_drag_y = 0; g_viewport_drag_x = 0;
    g_viewport_drag_y_ms = g_viewport_drag_x_ms = ms;
    g_prev_touch_start_milis = ms;

    g_hovered_button = undefined;
    
    if (ms - g_prev_touch_millis > DEBOUNCE_THRESH) {
      const mx = g_pointer_x / g_scale, my = g_pointer_y / g_scale;
      //g_pathfinder_viz.result = "TouchStarted " + mx + " " + my;
      ForAllButtons((b) => { // TODO: 为什么需要在这里再加一下
        b.do_Hover(mx, my);
        if (b.is_hovered) {
          b.OnPressed();
          g_hovered_button = b;
        }
      })
    }

    const mx = g_pointer_x / g_scale, my = g_pointer_y / g_scale;
    if (g_hovered_button == undefined &&
        g_readalong_layout.IsHovered(mx, my)) {
      g_aligner.StartDrag(g_pointer_y / g_scale);
    }

    if (g_hovered_button == undefined && g_puzzle_vis.IsHovered(mx, my)) {
      g_puzzle_director.StartDrag(mx, my);
    }

  } else if (event instanceof MouseEvent &&
    g_touch_state == undefined &&
    ms - g_prev_touch_start_milis >= TEMP_DISABLE_MOUSE_THRESH) {
    if (millis() - g_prev_touch_millis > DEBOUNCE_THRESH) {
      g_touch_state = "mouse";
      g_pointer_x = mouseX;
      g_pointer_y = mouseY;

      g_viewport_drag_y_last = 0; g_viewport_drag_x_last = 0;
      g_viewport_drag_y = 0; g_viewport_drag_x = 0;
      g_viewport_drag_y_ms = g_viewport_drag_x_ms = millis();

      const mx = g_pointer_x / g_scale, my = g_pointer_y / g_scale;
      if (g_hovered_button == undefined &&
          g_readalong_layout.IsHovered(mx, my)) {
        g_aligner.StartDrag(my);
      }

      if (g_hovered_button == undefined && g_puzzle_vis.IsHovered(mx, my)) {
        g_puzzle_director.StartDrag(mx, my);
      }

      ForAllButtons((b) => {
        b.Hover(mx, my);
        if (b.is_hovered) {
          b.OnPressed();
        }
      })

    } else return;
  } else return;
  
  g_last_mouse_pos = [g_pointer_x, g_pointer_y];
}

function TouchOrMouseEnded(event) {
  const x0 = g_drag_start_mouse_pos[0],
        x1 = g_drag_start_mouse_pos[1];
  
  if ((typeof(TouchEvent) != "undefined") && event instanceof TouchEvent) {
    if (g_touch_state == "touch") {
      for (let t of event.changedTouches) {
        if (t.identifier == g_touch0_identifier) {
          g_touch_state = undefined;
          g_touch0_identifier = undefined;
          g_prev_touch_millis = millis();
          
          g_aligner.EndDrag();
          g_puzzle_director.EndDrag();

          ForAllButtons((b) => {
            b.Unhover();
          })
          g_hovered_button = undefined;
        }
      }
    }
  } else if (event instanceof MouseEvent) {
    if (g_touch_state == "mouse") {
      g_touch_state = undefined;
      g_pointer_x = mouseX; g_pointer_y = mouseY;
      g_prev_touch_millis = millis();
      
      g_aligner.EndDrag();
      g_puzzle_director.EndDrag();
    }
  }
}

function TouchOrMouseMoved(event) {
  if (g_touch_state == "touch" && event instanceof TouchEvent) {
    for (let t of event.changedTouches) {
      if (t.identifier == g_touch0_identifier) {
        g_pointer_x = t.clientX - canvas.offsetLeft;
        g_pointer_y = t.clientY - canvas.offsetTop;
        
        g_viewport_drag_y_last = g_viewport_drag_y;
        g_viewport_drag_y_ms = millis();
        g_viewport_drag_y = g_last_mouse_pos[1] - g_pointer_y;
        g_viewport_drag_x_last = g_viewport_drag_x;
        g_viewport_drag_x_ms = millis();
        g_viewport_drag_x = g_last_mouse_pos[0] - g_pointer_x;

        const mx = g_pointer_x / g_scale;
        const my = g_pointer_y / g_scale;

        g_aligner.OnDragMouseUpdated(my);
        g_puzzle_director.UpdateDrag(mx, my);
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

      const mx = g_pointer_x / g_scale;
      const my = g_pointer_y / g_scale;
        
      g_aligner.OnDragMouseUpdated(my);
      g_puzzle_director.UpdateDrag(mx, my);
    }
  }
}