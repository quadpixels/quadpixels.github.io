function GetVertexes(data, scale=1) {
  let tmp = data.split(" ");
        
  let d = [];
  let x = 0, y = 0;
  let curr_mode = "l";
  let x0 = 0, y0 = 0, max_x = -1e20, max_y = -1e20;
  
  let idx = 0;
  for (let i=0; i<tmp.length; i++) {
    let entry = tmp[i];
    let xy = entry.split(",");
    let px = parseFloat(xy[0]), py = parseFloat(xy[1]);
    switch (entry) {
      case "c": {
        i += 2; break;
      }
      case "l": case "L": case "H": case "V": case "h": case "v": case "M":
        curr_mode = entry; break;
      case "m":
        break;
      case "Z": case "z":
        d.push([x0, y0]);
        continue;
      default: {
        if (curr_mode == "M") {
          x = px; y = py;
        } else if (curr_mode == "H") {
          x = px;
        } else if (curr_mode == "V") {
          y = px;
        } else if (curr_mode == "h") {
          x += px;
        } else if (curr_mode == "v") {
          y += px; // 只有一个元素，所以是px
        } else if (curr_mode == "l") {
          x += px; y += py;
        } else {
          x = px; y = py;
        }
        if (idx == 0) {
          x0 = x; y0 = y;
        }
        d.push([x*scale, y*scale]);
        idx ++;
      }
    }
  }
  return d; 
}