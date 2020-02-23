const EPIDEMIC_START_DT = "2019-12-20"; // 疫情开始之日
const EPIDEMIC_START_TS = dtToTimestamp(EPIDEMIC_START_DT);

const REGION_NAMES = [
  [ "Fujian", 1, [ "福建省" ] ],
]

function dtToTimestamp(dt) {
  var tmp = new Date(dt)
  return (tmp.getTime() + tmp.getTimezoneOffset() * 60000) / 1000
}

function timestampToDT(x) {
  var d = new Date(Math.floor(x) * 1000)
  var ret = ""
  ret = ret + d.getFullYear()
  var m = "" + (d.getMonth() + 1)
  if (m.length < 2) m = "0" + m
  ret = ret + "-" + m
  var day = "" + d.getDate()
  if (day.length < 2) day = "0" + day
  ret = ret + "-" + day
  return ret
}

// Stack 是遍历栈，包括"当前的node"
// aggregate_desc 的形式为：
// {
//    aggregate_l0: 传出参数
//    start_path: 开始堆积的路径
//    started:    是否已开始
//    aggregate_mode: 是每个地区分一类还是每种指标分一类 (per_subregion | per_metric)
// }
function do_GetDXYTimelineSnapshot(ts, node, name, stack, ret, aggregate_desc) {
  let keys = Object.keys(node[1]);
  let tl   = node[0];
  let readings = []
  
  if (tl.length < 1 || tl < EPIDEMIC_START_TS) {
    readings = [0,0,0,0];
  } else {
    if (ts < tl[0][0]) { // 如果在第一笔记录之前怎么考虑？
      let weight = 0.0
      if (false) { // 插值
        if (ts >= EPIDEMIC_START_TS) {
          weight = (ts - EPIDEMIC_START_TS) * 1.0 / (tl[0][0] - EPIDEMIC_START_TS);
        }
        readings = tl[0][1].slice()
        for (let midx = 0; midx < 4; midx ++) {
          readings[midx] = Math.round(readings[midx] * weight);
        }
      } else { // 啥也不做
        readings = [0,0,0,0]
      }
    } else if (ts > tl[tl.length-1][0]) {
      readings = tl[tl.length-1][1].slice()
    } else {
      let idx = 0;
      for (; idx < tl.length-1; idx ++) {
        let ts0 = tl[idx][0], ts1 = tl[idx+1][0];
        if (ts0 <= ts && ts1 > ts) {
          for (let midx = 0; midx < 4; midx ++) {
            // [ 确认 疑似 治愈 死亡 ]
            let ret0 = tl[idx][1][midx], ret1 = tl[idx][1][midx];
            let w0   = ts1 - ts,      w1   = ts - ts0;
            let r = (w0 * ret0 + w1 * ret1) / (w0 + w1);
            readings.push(r);
          }
          break;
        }
      }
    }
  }
  
  // 每个地点的path给存下来
  let path = stack.join("/");
  if (ret != undefined) {
    ret[path] = readings;
  }
  
  //console.log("[traverse] path=" + path)
  //console.log(aggregate_desc)
  
  if (aggregate_desc != undefined) {
    if (aggregate_desc.started == true) {
      // 加到全国的数据中
      const aggregate_path_len = aggregate_desc.start_path.split("/").length;
      if (stack.length == aggregate_path_len + 1 &&
          aggregate_desc.aggregate_l0 != undefined) {
        if (aggregate_desc.aggregate_mode == "per_subregion") {
          // 现在只加入第一种metric
          aggregate_desc.aggregate_l0.push(readings[0]);
        } else if (aggregate_desc.aggregate_mode == "per_metric") {
          for (let midx = 0; midx < 4; midx ++) {
            aggregate_desc.aggregate_l0[midx] += readings[midx];
          }
        }
        
        // 汇总系列名
        if (aggregate_desc.series != undefined) {
          aggregate_desc.series.push(path);
        }
      }
    }
  }
  
  // 开始汇总
  if (aggregate_desc != undefined) {
    if (path == aggregate_desc.start_path) {
      aggregate_desc.started = true;
    }
  }
  
  
  // Children
  for (let i=0; i<keys.length; i++) {
    let name = keys[i]
    do_GetDXYTimelineSnapshot(ts, node[1][name], name, stack.concat([name]), ret, aggregate_desc)
  }
}

// 为第 level 层的 name 多边形获取 kind 类型的数据
// kind may be ["color_index", "delta_cases"]
var blah = { }
function GetReading(path, kind) {
  if (kind == "dummy") {
    if (blah[path] == undefined) { blah[path] = Math.floor(1 + Math.random() * 12); }
    return blah[path]
  } else if (kind == "dxy_data") {
    if (g_curr_kml_snapshot[path] != undefined) {
      return g_curr_kml_snapshot[path];
    } else return [0,0,0,0];
  } 
}

function GetWorldTimelineData(is_include_chinamainland = false) {
  g_nationwide_graph_dirty = true;
    
  g_aggregated_chart_data = []
  const dt0 = NationwideGraphDesc.dt0
  const dt1 = NationwideGraphDesc.dt1
  const ts0 = dtToTimestamp(dt0), ts1 = dtToTimestamp(dt1);
  for (let ts = ts0; ts <= ts1; ts += 86400) {
    var nationwide = [];
    let aggregate_desc = {
      aggregate_l0: nationwide,
      start_path:   "",
      started:      false,
      aggregate_mode: "per_subregion",
      series:       []
    }
    if (ts == ts0) { g_aggregated_chart_series = aggregate_desc.series; }
    do_GetDXYTimelineSnapshot(ts, g_timeline_world, "", [""],     undefined, aggregate_desc);
    if (is_include_chinamainland) {
      do_GetDXYTimelineSnapshot(ts, g_timeline,       "全国",["全国"],undefined, aggregate_desc);
    }
    g_aggregated_chart_data.push([ts].concat(nationwide)); 
  }
  //https://stackoverflow.com/questions/3746725/how-to-create-an-array-containing-1-n
  g_aggregated_chart_midxes = Array.from(Array(g_aggregated_chart_data[0].length - 1).keys())
  g_aggregated_chart_is_stack = true
  NationwideGraphDesc.title = "世界其它地区确诊人数";
  g_aggregated_chart_palette = undefined;
}

// 画出总折线趋势图
function GetNationwideTimelineData() {
  const dt0 = NationwideGraphDesc.dt0
  const dt1 = NationwideGraphDesc.dt1
  const ts0 = dtToTimestamp(dt0)
  const ts1 = dtToTimestamp(dt1);
  for (let ts = ts0; ts <= ts1; ts += 86400) {
    var nationwide = [0, 0, 0, 0];
    let aggregate_desc_dxy = {
      aggregate_l0: nationwide,
      start_path:   "全国",
      started:      false,
      aggregate_mode: "per_metric",
    }
    do_GetDXYTimelineSnapshot(ts, g_timeline, "全国", ["全国"], undefined, aggregate_desc_dxy);
    g_aggregated_chart_data.push([ts].concat(nationwide)); 
  }
  g_aggregated_chart_midxes = [2,3,0]
  g_aggregated_chart_is_stack = false
  NationwideGraphDesc.title = "中国大陆确诊人数";
  g_nationwide_graph_dirty = true
  g_aggregated_chart_palette = PALETTE_NATIONWIDE
  g_aggregated_chart_series = []
}

// data的格式：[x, y0, y1, ... yN]
// midxes 是 Metric Indexes
function RenderLineChart(rt, desc, data, midxes, is_stack = false) {
  const n   = data.length;
  const dim = data[0].length - 1;
  rt.textSize(desc.textsize);
  rt.clear();
  rt.background(0, 0, 0, 0);
  rt.noStroke();
  let last_text_x = 2333333333;
  
  let max_y = 0;
  
  // 画出格线，从右（离现在最近）往左（过去）
  for (let i=n-1; i>=0; i--) {
    let dx = ((desc.w - 2*desc.pad - desc.margin_left) * i * 1.0 / (n-1))
             + desc.pad + desc.margin_left;
    let dy0 = desc.pad, dy1 = desc.h - desc.pad;
    let ts = data[i][0];
    
    let is_break = false;
    let dt = timestampToDT(ts);
    let tw = rt.textWidth(dt);
    
    // 画竖线
    if (dx + tw < last_text_x && dx > desc.pad + desc.margin_left + tw) {
      is_break = true
      rt.fill(0) // 文字是fill的
      rt.noStroke()
      rt.textAlign(RIGHT, TOP);
      rt.text(dt, dx, dy1);
      last_text_x = dx - tw;
    }
    
    // 画带刻度的竖线
    if (is_break) { rt.stroke(128); }
    else { rt.stroke(192); }
    rt.line(dx, dy0, dx, 
      is_break ? (dy1 + desc.textsize) : dy1);
    
    // Max_y
    if (is_stack) {
      let tmp = 0; for (let ii=1; ii<1+dim; ii++) { tmp += data[i][ii]; }
      max_y = Math.max(max_y, tmp);
    } else {
      max_y = Math.max(Math.max.apply(null, data[i].slice(1, 1+dim)), max_y);
    }
  }
  
  // 确定刻度大小
  const breaks = [1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000,
                  10000, 20000, 50000, 100000, 200000, 500000, 1000000]
  let bidx = 0;
  while (bidx + 1 < breaks.length && max_y / breaks[bidx] > 10) { bidx ++; }
  let break_width = breaks[bidx];
  
  // 画Y轴
  {
    let dx = desc.pad + desc.margin_left, dx1 = desc.w - desc.pad;
    let dy0 = desc.pad, dy1 = desc.h - desc.pad;
    rt.stroke(0)
    rt.noFill();
    rt.line(dx, dy0, dx, dy1);
    
    rt.textAlign(RIGHT, BOTTOM);
    const NBREAKS = 5;
    let last_dy = -999;
    for (let y=0; y < max_y; y += break_width) {
      let dy = dy1 + (dy0 - dy1) * y / max_y;
      if (Math.abs(dy - last_dy) > desc.textsize) {
        rt.fill(0);
        rt.noStroke();
        rt.text("" + y, dx, dy);
        last_dy = dy
        
        rt.stroke(200);
        rt.noFill();
        rt.line(dx, dy, dx1, dy);
      }
    }
  }
  
  // 1～4: [ 确认 疑似 治愈 死亡 ]
  // let midxes = [2,1]
  let ycoords = [] // 按midx的index顺序
  for (let im = 0; im < midxes.length; im ++) {
    let yc = [];
    for (let nn = 0; nn < n; nn ++) yc.push(0);
    ycoords.push(yc);
  }
  
  // 画数据点
  for (let im = 0; im < midxes.length; im ++) {
    let midx = midxes[im];
    rt.noFill();
    let c;
    if (g_aggregated_chart_palette != undefined) {
      let palette = g_aggregated_chart_palette[midx % g_aggregated_chart_palette.length];
      c = color(palette);
    } else {
      c = GetColor(g_aggregated_chart_series[im]);
      c = color(c[0], c[1], c[2]);
    }
    
    for (let i=0; i<n; i++) {
      let dy_ub = desc.pad, dy_lb = desc.h - desc.pad;
      let dy1   = dy_lb    + data[i][1+midx] / max_y * (dy_ub - dy_lb);
      if (is_stack && im > 0) {
        dy1 += (ycoords[im-1][i] - dy_lb);
      }
      let dx_lb = desc.pad + desc.margin_left, dx_ub = desc.w - desc.pad;
      let dx1 = dx_lb +  i    * (dx_ub - dx_lb) / (n-1);
      ycoords[im][i] = dy1;
      if (i > 0) {
        let dx0 = dx_lb + (i-1) * (dx_ub - dx_lb) / (n-1);
        let dy0 = ycoords[im][i-1];
        // 画底部覆盖区域
        let dyprev0 = dy_lb, dyprev1 = dy_lb;
        
        if (is_stack && im > 0) {
          dyprev0 = ycoords[im-1][i-1];
          dyprev1 = ycoords[im-1][i];
        }
        
        c.setAlpha(128);
        rt.fill(c); rt.noStroke();
        rt.beginShape(TRIANGLES)
        rt.vertex(dx0, dyprev0); rt.vertex(dx1, dyprev1); rt.vertex(dx1, dy1);
        rt.vertex(dx1, dy1); rt.vertex(dx0, dy0); rt.vertex(dx0, dyprev0);
        rt.endShape()
        // 画线
        c.setAlpha(255);
        rt.stroke(c);
        rt.fill(c);
        rt.line(dx0, dy0, dx1, dy1);
      }
    }
  }
}