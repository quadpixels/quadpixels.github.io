// 2025-06-03

let g_graph;
const W = 512, H = 512;
let g_tris = []
let g_V;  //
let g_obb_center;
let g_obb_halfsize;  // min and max
let g_p;
let g_show_obb_common = 0;  // 0: hide, 1: show X, 2: show Y, 3: show Z
let g_cb;   // Show OBB
let g_cb1;  // Choose LUT using naive method
let g_algo = "DiTO";  // DiTO or PCA
let g_use_lut = false;
let g_show_obb_common_idx = -1;  // which idx
let g_serial = 0;
let g_is_demo_111 = false;
let g_lut_use_naive = false;
let g_chosen_lut_index = -1;
let g_show_mat2idx_dbg = false;
let g_mat2obbidx_axis;
let g_mat2obbidx_angle;

// 点集的源分布
let g_dir_z, g_dir_x, g_dir_y;

class Mat3 {
  constructor() {
    this.m = [
      createVector(1, 0, 0),
      createVector(0, 1, 0),
      createVector(0, 0, 1)
    ]
    this.name = ""
  }
  
  row(r) {
    if (r == 0) {
      return createVector(this.m[0].x, this.m[1].x, this.m[2].x);
    } else if (r == 1) {
      return createVector(this.m[0].y, this.m[1].y, this.m[2].y);
    } else if (r == 2) {
      return createVector(this.m[0].z, this.m[1].z, this.m[2].z);
    }
  }
  
  col(c) {
    return this.m[c]
  }
  
  transpose() {
    let ret = new Mat3();
    ret.m[0].x = this.m[0].x;
    ret.m[1].x = this.m[0].y;
    ret.m[2].x = this.m[0].z;
    
    ret.m[0].y = this.m[1].x;
    ret.m[1].y = this.m[1].y;
    ret.m[2].y = this.m[1].z;
    
    ret.m[0].z = this.m[2].x;
    ret.m[1].z = this.m[2].y;
    ret.m[2].z = this.m[2].z;
    
    return ret;
  }
  
  dump() {
    let txt = "" + this.name + ":";
    txt += this.m[0].x + " " + this.m[1].x + " " + this.m[2].x + "\n";
    txt += this.m[0].y + " " + this.m[1].y + " " + this.m[2].y + "\n";
    txt += this.m[0].z + " " + this.m[1].z + " " + this.m[2].z + "\n";
    console.log(txt)
  }
  
  get(c, r) {
    if (r == 0) {
      return this.m[c].x;
    } else if (r == 1) {
      return this.m[c].y;
    } else if (r == 2) {
      return this.m[c].z;
    }
  }
  
  set(c, r, value) {
    if (r == 0) {
      this.m[c].x = value;
    } else if (r == 1) {
      this.m[c].y = value;
    } else if (r == 2) {
      this.m[c].z = value;
    }
  }
  
  add(m) {
    this.m[0].add(m.m[0]);
    this.m[1].add(m.m[1]);
    this.m[2].add(m.m[2]);
  }
  
  mult(x) {
    this.m[0].mult(x);
    this.m[1].mult(x);
    this.m[2].mult(x);
  }
}

function Mat3Mul(a, b) {
  let ret = new Mat3();
  for (let c=0; c<3; c++) {
    ret.m[c].x = a.row(0).dot(b.col(c));
    ret.m[c].y = a.row(1).dot(b.col(c));
    ret.m[c].z = a.row(2).dot(b.col(c));
  }
  return ret;
}

function OuterProduct(v0, v1) {
  let ret = new Mat3();
  ret.set(0, 0, v0.x * v1.x);
  ret.set(1, 0, v0.x * v1.y);
  ret.set(2, 0, v0.x * v1.z);
  
  ret.set(0, 1, v0.y * v1.x);
  ret.set(1, 1, v0.y * v1.y);
  ret.set(2, 1, v0.y * v1.z);
  
  ret.set(0, 2, v0.z * v1.x);
  ret.set(1, 2, v0.z * v1.y);
  ret.set(2, 2, v0.z * v1.z);
  return ret;
}

function RotationMatrix(axis, rad) {
  let ret = new Mat3();
  const c = cos(rad);
  const s = sin(rad);
  const x = axis.x, y = axis.y, z = axis.z;
  ret.set(0, 0, x*x*(1-c)+c);
  ret.set(0, 1, x*y*(1-c)+z*s);
  ret.set(0, 2, x*z*(1-c)-y*s);
  ret.set(1, 0, x*y*(1-c)-z*s);
  ret.set(1, 1, y*y*(1-c)+c);
  ret.set(1, 2, y*z*(1-c)+x*s);
  ret.set(2, 0, x*z*(1-c)+y*s);
  ret.set(2, 1, y*z*(1-c)-x*s);
  ret.set(2, 2, z*z*(1-c)+c);
  return ret;
}

function ApplyGivensRotation(m_ptr, p, q, q_total_ptr) {
  let s_pp = m_ptr[0].get(p, p);
  let s_pq = m_ptr[0].get(p, q);
  let s_qp = m_ptr[0].get(p, q);
  let s_qq = m_ptr[0].get(q, q);
  let theta = 3.1415926 / 4.0;
  if (s_pp != s_qq) {
    theta = 0.5 * atan(2 * s_pq / (s_pp - s_qq));
  }
  console.log("s_pp=" + s_pp + ", s_pq=" + s_pq + "," +
              "s_qq=" + s_qq + ", theta=" + theta);
  let Q = new Mat3();
  const c = cos(theta), s = sin(theta);
  Q.set(q, p, -s);  // eq to glm::mat3[p][q]
  Q.set(p, q, s);
  Q.set(p, p, c);
  Q.set(q, q, c);
  Q.name = "Q"
  //Q.dump()
  let nam = m_ptr[0].name
  m_ptr[0] = Mat3Mul(Q.transpose(), Mat3Mul(m_ptr[0], Q))
  m_ptr[0].name = nam
  //m_ptr[0].dump()
  q_total_ptr[0] = Mat3Mul(q_total_ptr[0], Q)
  q_total_ptr[0].name = "q_total"
}

function FindExtremePointsAlongDir(d) {
  let min_pt_idx = -1, max_pt_idx = -1;
  let min_dp = 1e20,  max_dp = -1e20;
  for (let tidx=0; tidx<g_tris.length; tidx++) {
    const tri = g_tris[tidx];
    const v0 = tri[0], v1 = tri[1], v2 = tri[2];
    const vertices = [ v0, v1, v2 ];
    for (let vidx=0; vidx<3; vidx++) {
      const v = vertices[vidx];
      const dp = p5.Vector.dot(v, d)
      if (dp < min_dp) {
        min_dp = dp; min_pt_idx = vidx + tidx * 3;
      }
      if (dp > max_dp) {
        max_dp = dp; max_pt_idx = vidx + tidx * 3;
      }
    }
  }
  return [ min_pt_idx, max_pt_idx ]
}

function FindFarthestPointPerpendicularToDir(p, d) {
  let max_len_sq = -1, max_pt_idx = -1;
  for (let tidx=0; tidx<g_tris.length; tidx++) {
    const tri = g_tris[tidx];
    const v0 = tri[0], v1 = tri[1], v2 = tri[2];
    const vertices = [ v0, v1, v2 ];
    for (let vidx=0; vidx<3; vidx++) {
      const v = vertices[vidx];
      const pv = v.copy().sub(p);
      const vdd = p5.Vector.dot(d, pv);
      const len_sq = p5.Vector.dot(pv, pv) - vdd * vdd;
      if (len_sq > max_len_sq) {
        max_len_sq = len_sq;
        max_pt_idx = tidx*3 + vidx;
      }
    }
  }
  return max_pt_idx;
}

function GetPointInTriList(idx) {
  let tidx = parseInt(idx / 3);
  let vidx = idx % 3;
  const tri = g_tris[tidx];
  const v0 = tri[0], v1 = tri[1], v2 = tri[2];
  const vertices = [ v0, v1, v2 ];
  return vertices[vidx];  
}

function ComputeOOBFromTriangle(p0, p1, p2) {
  const dir01 = p5.Vector.normalize(p1.copy().sub(p0));
  const dir02 = p2.copy().sub(p0);
  const n = p5.Vector.normalize(p5.Vector.cross(dir01, dir02));
  const d01cn = p5.Vector.normalize(p5.Vector.cross(n, dir01));
  //console.log(p0 + " " + p1 + " " + p2 + " " + dir01 + " " + d01cn)
  
  let V = new Mat3();
  V.m[0] = dir01;
  V.m[1] = n;
  V.m[2] = d01cn;
  //V.dump()
  
  //console.log("mags: " + V.m[0].mag() + ", " + V.m[1].mag() + ", " + V.m[2].mag())
  
  let [tmp0, tmp1] = ComputeOBBFromDirections(V);
  return [tmp0, tmp1, V]
}

function FindOBB_DiTO26() {
  const DOP26_DIRS = [
    createVector(1, 0, 0),
    createVector(0, 1, 0),
    createVector(0, 0, 1),
    createVector(1, 1, 1),
    createVector(1, 1,-1),
    createVector(1,-1, 1),
    createVector(1,-1,-1),
    createVector(1, 1, 0),
    createVector(1,-1, 0),
    createVector(1, 0, 1),
    createVector(1, 0,-1),
    createVector(0, 1, 1),
    createVector(0, 1,-1)
  ];
  
  let extremes = new Set([]);
  for (let i=0; i<13; i++) {
    const z = p5.Vector.normalize(DOP26_DIRS[i].copy());
    let [min_pt_idx, max_pt_idx] = FindExtremePointsAlongDir(z)
    extremes.add(min_pt_idx);
    extremes.add(max_pt_idx);
  }
  
  // 3 sets of axes per triangle
  // edge, normal, cross(edge, normal)
  let obb_sa = 1e20;  // for minimal obb
  for (let i=0; i<13; i++) {
    const z = p5.Vector.normalize(DOP26_DIRS[i].copy());
    let [min_pt_idx, max_pt_idx] = FindExtremePointsAlongDir(z)
    let p0 = GetPointInTriList(min_pt_idx), p1 = GetPointInTriList(max_pt_idx);
    let max_dist_idx = FindFarthestPointPerpendicularToDir(p0, p5.Vector.normalize(p1.copy().sub(p0)))
    let p2 = GetPointInTriList(max_dist_idx);
    
    const dir01 = (p1.copy().sub(p0)).normalize();
    const dir02 = (p2.copy().sub(p0)).normalize();
    const n012 = p5.Vector.cross(dir01, dir02);
    let [min_pt_n_idx, max_pt_n_idx] = FindExtremePointsAlongDir(n012);
    
    // Di-tetrahedron vertices
    let p3 = GetPointInTriList(min_pt_n_idx), p4 = GetPointInTriList(max_pt_n_idx);
    
    // p0, p1, p2 not co-linear
    let tris = [];
    if (abs(p5.Vector.dot(dir01, dir02)) < 0.9999) {
      tris.push([p0, p1, p2]);
      
      if (p5.Vector.dot(n012, p3.copy().sub(p0)) > 0.0001) {
        tris.push([p3, p0, p1]);
        tris.push([p3, p0, p2]);
        tris.push([p3, p1, p2]);
      }
      // p4 not co-planar
      if (p5.Vector.dot(n012, p4.copy().sub(p0)) > 0.0001) {
        tris.push([p4, p0, p1]);
        tris.push([p4, p0, p2]);
        tris.push([p4, p1, p2]);
      }
      
      for (let tidx=0; tidx<tris.length; tidx++) {
        let [x0, x1, x2] = tris[tidx];
        let [center, halfsize, V] = ComputeOOBFromTriangle(x0, x1, x2);
        const sa = halfsize.x * halfsize.y +
                   halfsize.x * halfsize.z +
                   halfsize.y * halfsize.z;
        if (sa < obb_sa) {
          obb_sa = sa;
          g_V = V;
          g_obb_center = center;
          g_obb_halfsize = halfsize;
        }
      }
    }
    
    // console.log("DOP26_DIRS[" + i + "], idxes=" +
    //             min_pt_idx + ", " + max_pt_idx + ", " +
    //             "max_dist_idx=" + max_dist_idx + ", n idxes=" +
    //             min_pt_n_idx + ", " + max_pt_n_idx)
  }
}

function ComputeOBBFromDirections(V) {
  // compute obb
  let extents = [1e20, -1e20, 1e20, -1e20, 1e20, -1e20];  // xmin, xmax, ymin, ymax, zmin, zmax
  for (let tidx=0; tidx<g_tris.length; tidx++) {
    const tri = g_tris[tidx];
    const v0 = tri[0].copy(), v1 = tri[1].copy(), v2 = tri[2].copy();
    const verts = [ v0, v1, v2 ];
    for (let j=0; j<3; j++) {
      let x = p5.Vector.dot(V.m[0], verts[j]);
      extents[0] = min(extents[0], x);
      extents[1] = max(extents[1], x);
      let y = p5.Vector.dot(V.m[1], verts[j]);
      extents[2] = min(extents[2], y);
      extents[3] = max(extents[3], y);
      let z = p5.Vector.dot(V.m[2], verts[j]);
      extents[4] = min(extents[4], z);
      extents[5] = max(extents[5], z);
    }
  }
  
  let center = V.m[0].copy().mult((extents[0] + extents[1]) / 2.0)
  center.add(V.m[1].copy().mult((extents[2] + extents[3]) / 2.0))
  center.add(V.m[2].copy().mult((extents[4] + extents[5]) / 2.0))
  
  let halfsize = createVector((extents[1] - extents[0]) / 2.0,
                              (extents[3] - extents[2]) / 2.0,
                              (extents[5] - extents[4]) / 2.0);
  //console.log("obb halfsize:" + halfsize)
  
  return [center, halfsize]
}

function FindOBB_PCA() {
  let mean = createVector(0, 0, 0);
  for (let tidx=0; tidx<g_tris.length; tidx++) {
    const tri = g_tris[tidx];
    const v0 = tri[0], v1 = tri[1], v2 = tri[2];
    mean.add(v0);
    mean.add(v1);
    mean.add(v2);
  }
  mean.mult(1.0 / g_tris.length / 3)
  
  
  let m1 = new Mat3();
  m1.mult(0);
  
  for (let tidx=0; tidx<g_tris.length; tidx++) {
    const tri = g_tris[tidx];
    const v0 = tri[0].copy(), v1 = tri[1].copy(), v2 = tri[2].copy();
    v0.sub(mean);
    v1.sub(mean);
    v2.sub(mean);
    const op0 = OuterProduct(v0, v0);
    const op1 = OuterProduct(v1, v1);
    const op2 = OuterProduct(v2, v2);
    m1.add(op0);
    m1.add(op1);
    m1.add(op2);
  }
  m1.mult(1.0 / g_tris.length / 3)
  
  // m1.m[0] = createVector(1, 2, 3);
  // m1.m[1] = createVector(4, 5, 6);
  // m1.m[2] = createVector(7, 8, 9);
  
  m1.name = "m1"
  m1.dump()
  
  let m1m1 = Mat3Mul(m1, m1.transpose())
  m1m1.name = "m1m1"
  
  const idxes = [ [0,1], [0,2], [1,2], [1,0], [2,0], [2,1] ];
  let q_total = new Mat3();
  let m1m1_ptr = [m1m1];
  let q_total_ptr = [q_total];
  
  for (let i=0; i<15; i++) {
    const ix = idxes[ i%3 ];
    ApplyGivensRotation(m1m1_ptr, ix[0], ix[1], q_total_ptr);
  }
  
  // Sort and negswap
  let rho = [ m1m1_ptr[0].get(0, 0), m1m1_ptr[0].get(1, 1), m1m1_ptr[0].get(2, 2) ]
  console.log("sort and negswap, " + rho)
  
  let V = q_total_ptr[0];
  V.name = "V_orig";
  //V.dump()
  
  let idxes1 = [ [0,1], [0,2], [1,2] ];
  for (let j=0; j<3; j++) {
    let [idx0, idx1] = idxes1[j];
    console.log(idx0 + " " + idx1)
    if (rho[idx0] < rho[idx1]) {
      let tmp = rho[idx0];
      rho[idx0] = rho[idx1];
      rho[idx1] = tmp;

      tmp = V.m[idx0].copy().mult(-1);
      V.m[idx0] = V.m[idx1].copy();
      V.m[idx1] = tmp;
    }
  }
  
  g_V = V;
  g_V.name = "V"
  g_V.dump()
  
  console.log("orthogonality: " + p5.Vector.dot(g_V.m[0], g_V.m[1]) + ", " +
                                  p5.Vector.dot(g_V.m[0], g_V.m[2]) + ", " +
                                  p5.Vector.dot(g_V.m[1], g_V.m[2]));
  
  let [tmp0, tmp1] = ComputeOBBFromDirections(V);
  g_obb_center = tmp0;
  g_obb_halfsize = tmp1;
}

function FindOBB() {
  if (g_algo == "PCA") {
    FindOBB_PCA()
  } else {
    FindOBB_DiTO26()
  }
  
  if (g_use_lut) {
    if (!g_lut_use_naive) {
      const permutations = [
        [ 0,1,2 ], [ 0,2,1 ],
        [ 1,0,2 ], [ 1,2,0 ],
        [ 2,0,1 ], [ 2,1,0 ]
      ];
      let min_sa = 1e20;
      let best_idx = -1;
      for (let i=0; i<6; i++) {
        let V = new Mat3();
        for (let j=0; j<3; j++) {
          V.m[j] = g_V.m[permutations[i][j]].copy()
        }
        let idx = MatrixToOBBIndex(V);
        g_chosen_lut_index = idx;
        console.log("idx=" + idx)
        if (idx == 127) {
          console.log("Error: invalid index returned");
          return;
        }
        let V1 = new Mat3();
        const line = OBB_COMMON[idx];

        let inv_lookup = [ 0,1,2 ];
        for (let j=0; j<3; j++) {
          inv_lookup[permutations[i][j]] = j;
        }
        console.log(permutations[i], inv_lookup)

        V1.m[inv_lookup[0]].x = line[0];
        V1.m[inv_lookup[0]].y = line[1];
        V1.m[inv_lookup[0]].z = line[2];
        V1.m[inv_lookup[1]].x = line[3];
        V1.m[inv_lookup[1]].y = line[4];
        V1.m[inv_lookup[1]].z = line[5];
        V1.m[inv_lookup[2]].x = line[6];
        V1.m[inv_lookup[2]].y = line[7];
        V1.m[inv_lookup[2]].z = line[8];

        let [tmp0, tmp1] = ComputeOBBFromDirections(V1);
        let sa = tmp1.x * tmp1.y +
                 tmp1.y * tmp1.z +
                 tmp1.z * tmp1.x;
        if (sa < min_sa) {
          min_sa = sa;
          bets_idx = idx;

          g_V = V1;
          g_obb_center = tmp0;
          g_obb_halfsize = tmp1;

        }
      }
    } else {  // Naive solution, just find the one that has the smallest SA
      let max_sc = 0;
      let min_sa = 1e20;
      let cand_V = new Mat3();
      for (let idx=0; idx<OBB_COMMON.length; idx++) {
        const line = OBB_COMMON[idx];
        let V1 = new Mat3();
        V1.m[0].x = line[0];
        V1.m[0].y = line[1];
        V1.m[0].z = line[2];
        V1.m[1].x = line[3];
        V1.m[1].y = line[4];
        V1.m[1].z = line[5];
        V1.m[2].x = line[6];
        V1.m[2].y = line[7];
        V1.m[2].z = line[8];
        let sc = abs(p5.Vector.dot(V1.m[0], g_V.m[0])) +
                 abs(p5.Vector.dot(V1.m[1], g_V.m[1])) +
                 abs(p5.Vector.dot(V1.m[2], g_V.m[2]));
        let [tmp0, tmp1] = ComputeOBBFromDirections(V1);
        let sa = tmp1.x * tmp1.y +
                 tmp1.y * tmp1.z +
                 tmp1.z * tmp1.x;
        //if (sc > max_sc)
        if (sa < min_sa)
        {
          min_sa = sa;
          max_sc = sc;
          cand_V = V1;
          g_obb_center = tmp0;
          g_obb_halfsize = tmp1;
          g_chosen_lut_index = idx;
        }
      }
      g_V = cand_V;
    }
  }
}

function MatrixToOBBIndex(m) {
  let axis = createVector(
    m.m[2].y - m.m[1].z,
    m.m[0].z - m.m[2].x,
    m.m[1].x - m.m[0].y
  );
  axis.normalize();
  
  g_mat2obbidx_axis = axis.copy();
  
  let diagonal = m.m[0].x + m.m[1].y + m.m[2].z;
  console.log("diagonal=" + m.m[0].x + " + " + m.m[1].y + " + " + m.m[2].z + " = " + diagonal)
  let angle = acos(0.5 * (diagonal - 1.0));
  if (axis.z < 0.0) {
    axis = axis.mult(-1.0);
    angle *= -1.0;
  }
  if (angle < 0.0) {
    angle += 2*3.1415926;
  }
  
  g_mat2obbidx_angle = angle;
  
  const xIndex   = min(15, parseInt((axis.x + 1.0) / 0.125));
  const yIndex   = min(15, parseInt((axis.y + 1.0) / 0.125));
  const angIndex = min(15, parseInt((angle / 0.392699081625)));
  const index    = (xIndex << 8) | (yIndex << 4) | (angIndex);
  
  console.log("xIndex=" + xIndex + ", yIndex=" + yIndex + ", index=" + index + ", angIndex=" + angIndex)
  return ObbMatrixIndexLUT[index]
}

function Regenerate() {
  g_tris = []
  
  const NT = parseInt(random(4, 16));
  g_dir_z = p5.Vector.random3D();
  g_dir_x = p5.Vector.cross(createVector(0, 1, 0), g_dir_z);
  g_dir_y = p5.Vector.cross(g_dir_z, g_dir_x);
  
  for (let n=0; n<NT; n++) {
    let z = random(-20, 20);
    let x = random(-5, 5);
    let y = random(-5, 5);
    
    let tri = []
    for (let i=0; i<3; i++) {
      let p = g_dir_z.copy().mult(z + random(-5, 5));
      p.add(g_dir_y.copy().mult(y + random(-3, 3)));
      p.add(g_dir_x.copy().mult(x + random(-3, 3)));
      
      tri.push(p)
    }
    g_tris.push(tri)
  }
  
  if (g_serial == 0) {
    g_tris = []
    g_tris.push([createVector(-2, -3, -5), createVector(1, -4, 6), createVector(2, 4, 6)])
    g_tris.push([createVector(4, 6, 8), createVector(7, 10, 12), createVector(8, 12, 20)])
  }
  g_serial++;

  FindOBB();
  UpdateCaption();
}


function GeneratePointsInUnitSphere(N) {
  const R = 100
  let ret = [];
  for (let i=0; i<N; i++) {
    const x = fract(i * 1.0 / PHI);
    const z = i * 1.0 / N;
    const theta = 2 * PI * x;
    const phi = acos(1 - 2 * z);
    const x1 = cos(theta) * sin(phi) * R;
    const y1 = sin(theta) * sin(phi) * R;
    const z1 = cos(phi) * R;
    p = createVector(x1, y1, z1)
    ret.push(p);
  }
  return ret;
}

function MyUnitTest() {
  const r = RotationMatrix(createVector(1,2,3).normalize(), 12.34/180.0*3.14159);
  console.log(">>>>")
  r.dump()
}

function setup() {
  MyUnitTest()
  createCanvas(W, H, WEBGL);
  
  let p = createP('14-dops');
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.position(5, 0);
  p.html('[O]: show 104 obbs')
  g_p = p;
  
  Regenerate();
  
  let b = createButton("Regen (random)");
  b.mousePressed(()=>{
    Regenerate();
  })
  b.position(2, H+4)
  
  g_cb = createCheckbox("");
  g_cb.position(200, H+28);
  g_cb.checked(true);
  p = createP('');
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.html('Show OBB');
  p.position(220, H+14);
  
  p = createP('');
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.html('Choose LUT using bruteforce method');
  p.position(220, H+34);
  
  g_cb1 = createCheckbox("");
  g_cb1.position(200, H + 48);
  g_cb1.checked(false);
  g_cb1.mouseClicked(() => {
    g_lut_use_naive = g_cb1.checked();
    FindOBB();
    UpdateCaption();
  })
  
  let style = document.createElement('style');
  style.innerHTML = `
   .p5-radio label {
     display: flex;
     align-items: center;
     color: yellow;
   }
   .p5-radio option {
     margin-right: 5px;
     color: yellow;
   }
   .p5-radio {
     color: yellow;
     backgroud-color: yellow;
   }
 `;
  
  b = createButton("PCA/DiTO");
  b.position(90, H+28)
  b.mousePressed(()=>{
    if (g_algo == "PCA") {
      g_algo = "DiTO";
    } else {
      g_algo = "PCA";
    }
    
    FindOBB();
    
    UpdateCaption();
  })
  
  b = createCheckbox("");
  b.position(90, H+48)
  b.checked(false);
  b.mousePressed(()=>{
    g_use_lut = !(b.checked());
    FindOBB();
    UpdateCaption();
  })
    
  p = createP('');
  p.style('font-family', 'courier new');
  p.style('color', 'yellow')
  p.html('Use LUT');
  p.position(110, H+34);
}

function draw() {
  background(36);
  
  const L = 100;
  const L1 = 30;
  const PAD = 8;
  scale(10, -10, 10);  // Make Y axis face up
  
  beginShape(LINES);
  strokeWeight(1.5)
  stroke('red');
  vertex(-L, 0, 0);
  vertex( L, 0, 0);
  
  stroke('green');
  vertex(0.001,  L, 0.001);
  vertex(0.001, -L, 0.001);
  
  stroke('blue');
  vertex(0, 0, -L);
  vertex(0, 0,  L);
  endShape();
  
  if (g_cb.checked()) {
      const v000 = g_obb_center.copy().add(g_V.m[0].copy().mult(-g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult(-g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult(-g_obb_halfsize.z));
      const v001 = g_obb_center.copy().add(g_V.m[0].copy().mult(-g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult(-g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult( g_obb_halfsize.z));
      const v010 = g_obb_center.copy().add(g_V.m[0].copy().mult(-g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult( g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult(-g_obb_halfsize.z));
      const v011 = g_obb_center.copy().add(g_V.m[0].copy().mult(-g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult( g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult( g_obb_halfsize.z));
      const v100 = g_obb_center.copy().add(g_V.m[0].copy().mult( g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult(-g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult(-g_obb_halfsize.z));
      const v101 = g_obb_center.copy().add(g_V.m[0].copy().mult( g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult(-g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult( g_obb_halfsize.z));
      const v110 = g_obb_center.copy().add(g_V.m[0].copy().mult( g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult( g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult(-g_obb_halfsize.z));
      const v111 = g_obb_center.copy().add(g_V.m[0].copy().mult( g_obb_halfsize.x))
                                      .add(g_V.m[1].copy().mult( g_obb_halfsize.y))
                                      .add(g_V.m[2].copy().mult( g_obb_halfsize.z));

      beginShape(LINES);
      stroke('#8080ff');
      let temp = [ v000, v001, v010, v011, v100, v101, v110, v111 ];
      for (let i=0; i<8; i+=2) {
        vertex(temp[i  ].x, temp[i  ].y, temp[i  ].z);
        vertex(temp[i+1].x, temp[i+1].y, temp[i+1].z);
      }

      stroke('#80FF80');
      temp = [ v000, v010, v001, v011, v100, v110, v101, v111 ];
      for (let i=0; i<8; i+=2) {
        vertex(temp[i  ].x, temp[i  ].y, temp[i  ].z);
        vertex(temp[i+1].x, temp[i+1].y, temp[i+1].z);
      }

      stroke('#ff8080');
      temp = [ v000, v100, v010, v110, v001, v101, v011, v111 ];
      for (let i=0; i<8; i+=2) {
        vertex(temp[i  ].x, temp[i  ].y, temp[i  ].z);
        vertex(temp[i+1].x, temp[i+1].y, temp[i+1].z);
      }

      endShape();
  }
  
  if (g_show_obb_common) {
    stroke("white")
    beginShape(POINTS);
    const L0 = 20;
    for (let i=0; i<OBB_COMMON.length; i++) {
      const x = OBB_COMMON[i];
      const ofst = (g_show_obb_common - 1) * 3;
      vertex(x[ofst] * L0, x[ofst+1] * L0, x[ofst+2] * L0);
    }
    endShape();
  }
  
  let draw_axes = (r) => {
    const L0 = 20;
    stroke("white");
    push();
    strokeWeight(3);
    beginShape(LINES)
    stroke("#FF8888");
    vertex(0, 0, 0);
    let x = r.m[0];
    
    vertex(x.x * L0, x.y * L0, x.z * L0);
    stroke("#88FF88");
    vertex(0, 0, 0);
    x = r.m[1]
    vertex(x.x * L0, x.y * L0, x.z * L0);
    stroke("#8888FF");
    vertex(0, 0, 0);
    x = r.m[2]
    vertex(x.x * L0, x.y * L0, x.z * L0);
    endShape();
    pop();
  }
  
  if (g_show_mat2idx_dbg && g_mat2obbidx_axis != undefined) {
    let blah = 1;//fract(millis() / 1000) / 1000;
    const r = RotationMatrix(g_mat2obbidx_axis, blah * g_mat2obbidx_angle)
    draw_axes(r)
  }
  
  if (g_show_obb_common_idx != -1) {
    const x = OBB_COMMON[g_show_obb_common_idx];
    const L0 = 20;
    stroke("white");
    push();
    strokeWeight(3);
    beginShape(LINES)
    stroke("#FF8888");
    vertex(0, 0, 0);
    vertex(x[0] * L0, x[1] * L0, x[2] * L0);
    stroke("#88FF88");
    vertex(0, 0, 0);
    vertex(x[3] * L0, x[4] * L0, x[5] * L0);
    stroke("#8888FF");
    vertex(0, 0, 0);
    vertex(x[6] * L0, x[7] * L0, x[8] * L0);
    endShape();
    pop();
  }
  
  if (g_is_demo_111) {
    const r = RotationMatrix(createVector(1,1,1).normalize(), millis()/4000*3.1415*2);
    draw_axes(r);
  }
  
  push();
  beginShape(TRIANGLES);
  stroke(192);
  fill(100);
  for (let i=0; i<g_tris.length; i++) {
    const tri = g_tris[i];
    vertex(tri[0].x, tri[0].y, tri[0].z);
    vertex(tri[1].x, tri[1].y, tri[1].z);
    vertex(tri[2].x, tri[2].y, tri[2].z);
  }
  endShape();
  pop();
  
  orbitControl();
}

function UpdateCaption() {
  let x = "Algo: " + g_algo + "<br/>";
  
  let pidx = 0;  // principal index
  let dp = abs(p5.Vector.dot(g_dir_z, g_V.m[pidx]))
  for (let i=1; i<3; i++) {
    let dp1 = abs(p5.Vector.dot(g_dir_z, g_V.m[i]));
    if (dp1 > dp) {
      pidx = i;
    }
  }
  
  // console.log("pidx      :" + pidx)
  // console.log("Z         :" + g_dir_z)
  // console.log("g_V.m[pidx]:" + g_V.m[2])
  const angle = acos(abs(p5.Vector.dot(g_dir_z, g_V.m[pidx])));
  // console.log("angle:" + angle)
  
  const sa = g_obb_halfsize.x * g_obb_halfsize.y +
             g_obb_halfsize.x * g_obb_halfsize.z +
             g_obb_halfsize.y * g_obb_halfsize.z;
  // x += "angle vs ground_truth: " + angle + "<br/>";
  x += "surface area: " + sa;
  x += "<br/>";
  x += "Use LUT: " + (g_use_lut ? "yes" : "no")
  if (g_use_lut) {
    x += " [" + g_chosen_lut_index + "]";
  }
  //x += "[O]: OBB mode=" + g_show_obb_common;
  
  if (g_show_obb_common > 0) {
    x += "<br/>"
    x += "showing 104-cand's " + ("XYZ"[g_show_obb_common-1]) + " axis"
  }
  
  if (g_show_obb_common_idx >= 0)  {
    x += "<br/>"
    x += "showing [" + g_show_obb_common_idx + "] = " + OBB_DESCS[g_show_obb_common_idx]
  }
  
  g_p.html(x);
}

function keyPressed() {
  if (key == "O" || key == 'o') {
    g_show_obb_common = (g_show_obb_common + 1) % 4;
    if (g_show_obb_common > 0) {
      g_show_mat2idx_dbg = true;
    } else g_show_mat2idx_dbg = false;
    UpdateCaption();
  }
  if (key == '[') {
    g_show_obb_common_idx -= 1;
    if (g_show_obb_common_idx < -1) g_show_obb_common_idx = 103;
    UpdateCaption();
  }
  if (key == ']') {
    g_show_obb_common_idx += 1;
    if (g_show_obb_common_idx >= 104) g_show_obb_common_idx = -1; 
    UpdateCaption();
  }
  if (key == "D" || key == "d") {
    g_is_demo_111 = !g_is_demo_111;
  }
}