function MatVecMul(m, v) {
  let x = v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0];
  let y = v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1];
  let z = v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2];
  return [x, y, z];
}

function RotXMatrix(rot_x) {
  return [ [1, 0,                0              ]   , // 第一列
           [0, Math.cos(rot_x), -Math.sin(rot_x)]   , // 第二列
           [0, Math.sin(rot_x),  Math.cos(rot_x)] ]   // 第三列
}

function RotYMatrix(rot_y) {
  return [ [ Math.cos(rot_y), 0, Math.sin(rot_y) ],
           [ 0,               1, 0               ],
           [ -Math.sin(rot_y),0, Math.cos(rot_y) ] ]
}

function Normalize(v) {
  let m = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  let ret = v.slice();
  ret[0] /= m; ret[1] /= m; ret[2] /= m;
  return ret;
}