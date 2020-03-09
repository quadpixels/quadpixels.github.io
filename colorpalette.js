var PALETTE = [
  [ 141,211,199 ],    
  [ 255,255,179 ],
  [ 190,186,218 ],
  [ 251,128,114 ],
  [ 128,177,211 ],
  [ 253,180,98  ],
  [ 179,222,105 ],
  [ 252,205,229 ],
  [ 166,206,227 ],
  [ 31,120,180  ],
  [ 178,223,138 ],
  [ 51,160,44   ],
  [ 251,154,153 ],
  [ 227,26,28   ],
  [ 253,191,111 ],
  [ 255,127,0   ],
  [ 202,178,214 ],
  [ 106,61,154  ],
  [ 255,255,153 ],
  [ 177,89,40   ],
]

var PALETTE_NATIONWIDE = [
  [ 192,  32, 32 ], // 确诊
  [ 128, 128, 22 ], // 疑似
  [ 32,  224, 32 ], // 治愈
  [ 32,   32, 32 ], // 死亡
]

var g_palette_for_region = { }
var g_palette_serial = 0;

function do_GetPaletteIndex(node, stack, parent_name) {
  var keys = Object.keys(node);
  for (let i=0; i<keys.length; i++) {
    let name = keys[i]
    
    var stack_next = stack.slice();
    stack_next.push(name);
    let pkey = "/" + stack_next.join("/")
    g_palette_for_region[pkey] = PALETTE[g_palette_serial % PALETTE.length];
    g_palette_serial ++;
    
    const level = stack.length;
    if (level > 0) {
      let ppkey = "/" + stack.join("/")
      let c1 = g_palette_for_region[ppkey];
      let c0 = g_palette_for_region[pkey];
      let c10 = [ lerp(c0[0], c1[0], 0.8),
                  lerp(c0[1], c1[1], 0.8),
                  lerp(c0[2], c1[2], 0.8) ];
      g_palette_for_region[pkey] = c10;
    }
    
    let entry = node[keys[i]];
    let children = entry[1];
    do_GetPaletteIndex(children, stack_next, name);
  }
}

function InitColorPalette() {
  let temp = []
  for (let i=0; i<200; i++) {
    temp.push(PALETTE[i % PALETTE.length]);
  }
  temp[24] = PALETTE[3];
  temp[181]= PALETTE[3];
  PALETTE = temp;
  
  g_palette_for_region = { }
  g_palette_serial = 0
  do_GetPaletteIndex(verts, [], "");
}

function GetColor(name) {
  let c = g_colorkey_select.value()
  if (c == COLOR_KEYS[0]) { // 颜色仅用于表示不同地区
    let pkey = name
    // 大中华区用同一种色
    if (pkey == "/Taiwan") { pkey = "/China"; }
    let ret = g_palette_for_region[pkey];
    if (ret == undefined) {
      g_palette_for_region[pkey] = PALETTE[g_palette_serial % PALETTE.length];
      g_palette_serial ++;
      ret = g_palette_for_region[pkey];
    }
    return ret;
  } else if (c == COLOR_KEYS[1]) { // 颜色表示人数多少
    let cnt       = g_curr_kml_snapshot[name.slice(1)]
    if (cnt != undefined) {
      cnt = cnt[0]
      let max_count = g_curr_kml_snapshot["max_count"][0]
      let t = Math.log(cnt) / Math.log(max_count)
      let r = lerp(199, 255, t)
      let g = lerp(192, 192, t)
      let b = lerp(192, 192, t)
      return [r, g, b]
    } else return [192, 192, 192]
  } else if (c == COLOR_KEYS[2]) { // 颜色表示进入疫情早与晚
    if (name == "/全国") { name = "/China" }
    const earliest = g_kml_entry_dates["earliest_date"]
    const latest   = g_kml_entry_dates["latest_date"]
    const dt = g_kml_entry_dates[name]
    if (dt != undefined) {
      let t = (latest - dt) / (latest - earliest)
      let r = lerp(224, 224, t)
      let g = lerp(192, 192, t)
      let b = lerp(192, 224, t)
      console.log(name + " -- " + t)
      return [r, g, b]
    } else return [192, 192, 192]
  }
}