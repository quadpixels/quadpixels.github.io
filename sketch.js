var g_exit_flag = false, g_exit_flag_prev = false
const W = 1024, H = 8
const FONT_SIZE = H / 30;
var g_fps = undefined;
var g_flags = [0, 0, 0, 0, 0, 0, 0]
var g_l0idx = 0
var g_shift_flag = false;

var g_map_graph = undefined;
var g_mapview = undefined;
var g_billboard_graph = undefined;
var g_billboardview = undefined;
var MapAreaDesc = {
  x: 0, y: 0, w: W, h: H,
  pad: 0, margin_left: 0,
}
const MAP_USE_RT = true

function GetL0Keys() {
  return Object.keys(verts);
}

// HACK，请见p5.js line 98493
let g_suppress_textures = false;

// 折线图
var NationwideGraphDesc = {
  x: 0, y: 0,
  w: W, h: H / 3,
  pad: W / 30,
  textsize: H / 70,
  margin_left: W / 15,
  
  dt0: "2020-01-20",
  dt1: "2020-02-13",
  
  mouse_hover_x: undefined, // 局部的X
  title: "",
  mouse_clicked_x: undefined // 点击到的X
}
function GetCurrNationwideGraphTimestamp(nd) {
  if (nd.mouse_hover_x == undefined) return undefined;
  const ts0 = dtToTimestamp(nd.dt0);
  const ts1 = dtToTimestamp(nd.dt1);
  const c = (nd.mouse_hover_x * 1.0 / (nd.w - nd.margin_left - nd.pad * 2));
  return ts0 + (ts1-ts0) * c;
}
function IsInArea(n, mx, my) {
  if (mx > n.x + n.pad + n.margin_left &&
      mx < n.x + n.w - n.pad &&
      my > n.y + n.pad &&
      my < n.y + n.h - n.pad) {
    return true;
  } else return false;
}
var g_nationwide_graph = undefined;
var g_nationwide_graph_dirty = true;
var is_map_dirty = true

// 控制地图显示的 某时刻的快照
// key是地图上的地名的Path
// 流程：先获得丁香园格式的快照，再汇总成KML格式的
var g_curr_kml_snapshot = { };

// 进入疫情的时间
var g_kml_entry_dates = { };

// 控制时间线显示的
var g_aggregated_chart_data = [];
var g_aggregated_chart_midxes = [];
var g_aggregated_chart_palette = undefined;
var g_aggregated_chart_is_stack = false;
var g_aggregated_chart_series = [];

const COLOR_KEYS = [
  "颜色仅用于区分不同地区",
  "颜色表示人数多少",
  "颜色表示进入疫情先后的顺序",
]
var g_colorkey_select;

const BILLBOARD_KEYS = [
  "不显示标签",
  "标签显示人数",
  "标签显示地名"
]
var g_billboard_select;

const LOCS = [
  "--跳转到某地区--", "北美洲", "南美洲", "欧洲", "非洲", "南亚、西亚", "东亚、东南亚", "大洋洲"
]
var g_locs_select

// Utility classes
class FPS {
  constructor() {
    this.curr_fps = 0
    this.frame_group_end = 1; // Seconds
    this.frames_in_group = 0;
    this.secs_group = 0;
  }
  // 演染时间其实很少，大多数时间都消耗在CPU一侧了
  Update(d) {
    this.frames_in_group ++;
    this.secs_group += d
    if (this.secs_group > this.frame_group_end) {
      this.curr_fps = this.frames_in_group / this.frame_group_end
      this.frames_in_group = 0
      this.secs_group = 0
    }
  }
  GetCurrFPS() { return this.curr_fps }
}

function setup() {
  g_fps = new FPS();
  //pixelDensity(1);
  frameRate(30);
  createCanvas(W, H);
  g_map_graph = createGraphics(MapAreaDesc.w, MapAreaDesc.h, WEBGL);
  
  //g_map_graph.pixelDensity(1);
  
  
  g_mapview = new MapView();
  g_billboard_graph = createGraphics(MapAreaDesc.w, MapAreaDesc.h, WEBGL);
  g_billboardview = new BillboardView(g_mapview);
  
  g_nationwide_graph = createGraphics(NationwideGraphDesc.w, NationwideGraphDesc.h);
  
  // 设为当前日期
  let d = new Date()
  let offset = d.getTimezoneOffset()
  let d_utc = d;
  d_utc.setMinutes(d_utc.getMinutes() + offset)
  NationwideGraphDesc.dt1 = timestampToDT(d_utc.getTime()/1000);
  console.log("UTC = local time + " + offset + " min")
  
  InitColorPalette();
  //GetNationwideTimelineData();
  GetWorldTimelineData();
  
  // 颜色表示什么
  g_colorkey_select = createSelect()
  g_colorkey_select.position(50, height+20)
  for (let i=0; i<COLOR_KEYS.length; i++) { g_colorkey_select.option(COLOR_KEYS[i]) }
  g_colorkey_select.selected(COLOR_KEYS[0])
  g_colorkey_select.changed(RequestRefresh)
  
  // 标签表示什么
  g_billboard_select = createSelect()
  g_billboard_select.position(270, height+20)
  for (let i=0; i<BILLBOARD_KEYS.length; i++) { g_billboard_select.option(BILLBOARD_KEYS[i]) }
  g_billboard_select.selected(BILLBOARD_KEYS[0])
  g_billboard_select.changed(RequestRefresh);
  
  // 跳转到某地区
  g_locs_select = createSelect()
  g_locs_select.position(width-150, height+20)
  for (let i=0; i<LOCS.length; i++) { g_locs_select.option(LOCS[i]); }
  g_locs_select.selected(LOCS[0]);
  g_locs_select.changed(function() {
    g_mapview.SetLocation(g_locs_select.value());
    g_locs_select.selected(LOCS[0]);
  })
  
  let reset_view = createButton("重置视角")
  reset_view.position(width - 230, height + 20)
  reset_view.mousePressed(function() {
    g_mapview.SetLocation("")  
  })
  
  // 到最近的时间点
  NationwideGraphDesc.mouse_clicked_x = NationwideGraphDesc.mouse_hover_x =
    NationwideGraphDesc.w - NationwideGraphDesc.margin_left - NationwideGraphDesc.pad
  const ts = GetCurrNationwideGraphTimestamp(NationwideGraphDesc)
  GetDXYTimelineSnapshot(ts)
  is_map_dirty = true;
}

var last_secs = 0;
function draw() {
  // Update
  var secs = millis() / 1000.0;
  var delta_secs = secs - last_secs;
  last_secs = secs;
  
  // 画这个的速度其实挺快的
  if (g_nationwide_graph_dirty == true) {
    g_nationwide_graph_dirty = false;
    RenderLineChart(g_nationwide_graph, // Rendertarget
                    NationwideGraphDesc, // 图表区域 desc
                    g_aggregated_chart_data, // data
                    g_aggregated_chart_midxes, // 列 index
                    g_aggregated_chart_is_stack); // stack?
  }
  
  if (g_flags[0] != 0 || g_flags[1] != 0 || g_flags[2] != 0 ||
      g_flags[3] != 0 || g_flags[4] != 0) is_map_dirty = true;
  let was_map_dirty = is_map_dirty;
  
  const should_render_billboard = (g_billboard_select.value() != BILLBOARD_KEYS[0]);
  
  if (is_map_dirty == true) {
    g_billboardview.Update(delta_secs);
    g_fps.Update(delta_secs);
    is_map_dirty = false;
    // Render to Rendertargets
    
    if (MAP_USE_RT) {
      g_map_graph.background(220);
      g_mapview.Update(delta_secs);
      g_mapview.Pan(g_flags[0] * delta_secs * 90, g_flags[1] * delta_secs * 90)
      g_mapview.Zoom(Math.exp(Math.log(0.6) * delta_secs * g_flags[2]))
      g_mapview.RotY(delta_secs * g_flags[3]);
      g_mapview.RotX(delta_secs * g_flags[4]);
      g_suppress_textures = true;
      g_mapview.Render(g_map_graph);
      g_suppress_textures = false;
    } else {
      background(220);
      g_mapview.Update(delta_secs);
      g_mapview.Pan(g_flags[0] * delta_secs * 90, g_flags[1] * delta_secs * 90)
      g_mapview.Zoom(Math.exp(Math.log(0.6) * delta_secs * g_flags[2]))
      g_mapview.RotY(delta_secs * g_flags[3]);
      g_mapview.RotX(delta_secs * g_flags[4]);
      g_suppress_textures = true;
      g_mapview.Render1(); // to canvas directly
      g_suppress_textures = false;
    }
    
    if (should_render_billboard)
      g_billboardview.Render(g_billboard_graph);
  }
  
  // Render to canvas
  background(220);
  if (MAP_USE_RT) {
    
    if (true) {
      const yy = 0.3 // Copy 30% less data
      image(g_map_graph, MapAreaDesc.x, MapAreaDesc.y + MapAreaDesc.h * yy,
                         MapAreaDesc.w, MapAreaDesc.h * (1-yy),
                         MapAreaDesc.x, MapAreaDesc.y + MapAreaDesc.h * yy,
                         MapAreaDesc.w, MapAreaDesc.h * (1-yy));
    }
  }
  
  if (should_render_billboard) {
    image(g_billboard_graph, MapAreaDesc.x, MapAreaDesc.y, MapAreaDesc.w, MapAreaDesc.h);
  }
  
  textAlign(RIGHT, BOTTOM);
  textSize(FONT_SIZE);
  if (was_map_dirty == false) { fill(128); } else { fill(0); }
  noStroke();
  text(g_fps.GetCurrFPS().toFixed(0) + " fps", width, height);
  fill(0);
  if (false) {
    textAlign(LEFT, TOP);
    text(g_mapview.GetStatusString(), 0, 0);
  }
  
  fill(0);
  
  //textAlign(LEFT, TOP);
  //text(GetL0Keys()[g_l0idx], 0, FONT_SIZE * 1.03);
  
  
  // 覆盖显示大图
  image(g_nationwide_graph, NationwideGraphDesc.x, NationwideGraphDesc.y,
                            NationwideGraphDesc.w, NationwideGraphDesc.h);
  
  // Hover 大图
  var ng = NationwideGraphDesc
  
  if (ng.mouse_clicked_x != undefined) {
    const dx = ng.mouse_clicked_x + ng.x + ng.margin_left + ng.pad;
    stroke(32);
    line(dx, ng.y + ng.pad, dx, ng.y + ng.h - ng.pad);
  }
  
  if (ng.mouse_hover_x != undefined) {
    const dx = ng.mouse_hover_x + ng.x + ng.margin_left + ng.pad;
    stroke(0, 0, 255);
    line(dx, ng.y + ng.pad, dx, ng.y + ng.h - ng.pad);
  }
  
  // 大图标题
  fill(0);
  noStroke();
  textAlign(CENTER, BOTTOM);
  let dx = NationwideGraphDesc.x + NationwideGraphDesc.w/2;
  let dy = NationwideGraphDesc.y + NationwideGraphDesc.pad;
  text(NationwideGraphDesc.title, dx, dy);
  
  // Exit?
  if (g_exit_flag && (!g_exit_flag_prev)) {
    fill(220, 220, 220, 224);
    noStroke();
    /*
    rect(0, 0, width, height);
    */
    textAlign(CENTER, TOP);
    fill(0);
    text("(P5.js stopped)", width/2, 0);
    noLoop();
  } else if (!g_exit_flag && g_exit_flag_prev) {
    
  }
  g_exit_flag_prev = g_exit_flag;
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) { g_flags[0] = -1 } 
  else if (keyCode == RIGHT_ARROW) { g_flags[0] = 1 }
  else if (keyCode == UP_ARROW) { g_flags[1] = +1 } 
  else if (keyCode == DOWN_ARROW) { g_flags[1] = -1 }
  else if (key == '[') { g_flags[2] = -1 }
  else if (key == ']') { g_flags[2] = 1 }
  else if (key == 'l') { g_flags[3] = 1; }
  else if (key == 'j') { g_flags[3] = -1; }
  else if (key == 'i') { g_flags[4] = 1; }
  else if (key == 'k') { g_flags[4] = -1; }
  else if (key == '=') { 
    //g_l0idx = (g_l0idx + 1 + 9 * (g_shift_flag ? 1:0)) %
    //GetL0Keys().length;
    g_mapview.ChangeDetailLevel(1);
  } else if (key == '-') {
    //var keys = GetL0Keys();
    //g_l0idx = (g_l0idx - 1 - 9 * (g_shift_flag ? 1:0) + keys.length) % keys.length;
    g_mapview.ChangeDetailLevel(-1);
  } else if (key == 'p') { 
    GetNationwideTimelineData();
  } else if (key == 'r') {
    GetWorldTimelineData();
  } else if (key == 'd') {
    g_mapview.CheckIntersection();
  } else if (keyCode == SHIFT) { g_shift_flag = true; }
  else if (keyCode == ESCAPE) {
    if (g_exit_flag) {
      console.log("resume loop\n");
      loop();
    }
    g_exit_flag = !g_exit_flag
    console.log("ESCAPE pressed");
  }
  is_map_dirty = true
}

function keyReleased() {
  if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW)
    g_flags[0] = 0
  else if (keyCode == UP_ARROW || keyCode == DOWN_ARROW)
    g_flags[1] = 0
  else if (key == '[' || key == ']') g_flags[2] = 0;
  else if (key == 'j' || key == 'l') g_flags[3] = 0;
  else if (key == 'i' || key == 'k') g_flags[4] = 0;
  else if (keyCode == SHIFT) g_shift_flag = false;
  is_map_dirty = true
}

function mouseMoved() {
  var n = NationwideGraphDesc;
  if (IsInArea(n, mouseX, mouseY)) {
    n.mouse_hover_x = mouseX - n.x - n.pad - n.margin_left;
  } else {
    n.mouse_hover_x = undefined
  }
  
  if (IsInArea(MapAreaDesc, mouseX, mouseY)) {
    g_mapview.Unproject(mouseX, mouseY);
    g_mapview.CheckIntersection();
  }
}

function mousePressed() {
  if (event.button == 0) {
    const ts = GetCurrNationwideGraphTimestamp(NationwideGraphDesc);
    if (ts != undefined) {
      GetDXYTimelineSnapshot(ts);
      NationwideGraphDesc.mouse_clicked_x = NationwideGraphDesc.mouse_hover_x;
      is_map_dirty = true;
    } else { // Unclick
      NationwideGraphDesc.mouse_clicked_x = undefined;
    }
    
    if (IsInArea(MapAreaDesc, mouseX, mouseY)) {
      g_mapview.Unproject(mouseX, mouseY);
    } else {
    }
  }
}

function RequestRefresh() {
  is_map_dirty = true;
  g_billboardview.texture_is_dirty = true;
}