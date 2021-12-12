// 一些边框图样
// 一些邊框圖様

function DrawBorderStyle1(x, y, w, h) {
  // 左上角的部分
  const r0 = 5, r1 = 8;
  const P = [
    [r1, 0], [r1, r0], [0, r0], [0, 0], [r0, 0], [r0, r1], [0, r1]
  ];

  // 四个角
  beginShape();

  vertex(r1, 0);
  // 左上角
  P.forEach((p) => {
    vertex(p[0], p[1]);
  });

  vertex(0, h-r1);
  // 左下角
  P.forEach((p) => {
    vertex(p[1], h-p[0]);
  })

  // 右下角
  vertex(w-r1, h);
  P.forEach((p) => {
    vertex(w-p[0], h-p[1]);
  })

  vertex(w, r1);
  P.forEach((p) => {
    vertex(w-p[1], p[0]);
  })

  endShape(CLOSE);
}

function DrawBorderStyle2(x, y, w, h) {
  const r1 = 8;
  rect(x, y, w, h);
  line(x+r1, y, x, y+r1);
  line(x+w-r1, y, x+w, y+r1);
  line(x+r1, y+h, x, y+h-r1);
  line(x+w-r1, y+h, x+w, y+h-r1);
}

function DrawBorderStyle3(x, y, w, h) {
  const r1 = 6;
  rect(x, y, w, h);
  rect(x, y, r1, r1);
  rect(x+w-r1, y, r1, r1);
  rect(x, y+h-r1, r1, r1);
  rect(x+w-r1, y+h-r1, r1, r1);
}