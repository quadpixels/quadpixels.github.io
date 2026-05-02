// Art resources are from:
//
// 1) "Random Pixel Characters" by icedman
// https://opengameart.org/content/random-pixel-characters
//
// 2) "Pixel Art Style Clouds" by redmdlee
// https://www.deviantart.com/redmdlee/art/Pixel-Art-Style-Clouds-761194063

let g_autorun = false;

const GLOBAL_OFFSET = 1;
let g_persons = [];
let g_animator, g_stagelayout, g_performerlayout, g_director;
let g_performerlayout2;
let g_skip_animation = false;
let g_sprite_sheet;

let g_bg_textures = [];

let g_completed_persons = new Set([]);

let g_billboard1; // “第X期”

// 以下 分别是从后往前的每一层
let g_bg_sprites = [];
let g_cloud_sprites = [];
let g_stage_sprites = [];
let g_cloud_sprites2 = []; // 前层

let g_finishlayout;

let g_songlist;

// “x名演唱者”
let g_label1 = {
  x: 16,
  y: 40,
  font_size: 24,
  last_watermark_x: -999,
  text: "",
  Reset: function() {
    this.x = 16; this.y = 40; this.font_size = 24;
    this.last_watermark_x = -999;
    this.text = "";
  }
};

// Pseudo-3D graphics!

const g_audience_sizes = [
  50, 50, 50, 50, 50,
  51, 51, 51, 51, 51,
  52, 52, 52, 52, 52,
  52, 52, 52, 52, 52,
  50, 45,
];

const PERFORMERS = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [7, 12, 13, 14, 3, 15, 16, 0, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 3, 27, 7, 0, 28, 21, 5, 29, 30, 31],
  [32, 33, 34, 18, 24, 35, 3, 36, 5, 0, 7, 37],
  [3, 38, 39, 40, 5, 41, 42, 0, 14, 43, 29, 25, 44],
  [41, 3, 24, 5, 0, 18, 45, 46, 7, 47, 48],
  [49, 3, 50, 51, 52, 53, 40, 5, 29, 39, 54],
  [55, 56, 57, 3, 58, 0, 59, 21, 50, 60, 40, 24],
  [58, 61, 62, 55, 63, 3, 24, 64, 65, 46, 40, 66, 5, 53, 67, 61],
  [3, 68, 69, 70, 46, 36, 5, 53, 71],
  [72, 73, 3, 46, 74, 70, 2, 5, 53, 36, 75, 41, 76, 48],
  [77, 62, 3, 53, 74, 46, 0, 78, 5, 79, 80, 48],
  [81, 74, 82, 3, 62, 61, 0, 53, 24, 5, 45, 7],
  [46, 83, 84, 7, 3, 85, 60, 53, 36, 74, 0, 86, 48],
  [87, 88, 84, 83, 3, 5, 74, 53, 7, 0, 45],
  [83, 62, 3, 84, 7, 21, 24, 89, 90, 74, 0, 79, 53],
  [91, 90, 92, 74, 41, 5, 93, 3, 54, 62, 53, 39, 45],
  [94, 7, 53, 92, 54, 59, 95, 3, 41, 45],
  [3, 96, 24, 62, 41, 7, 54],
  [97, 98, 66, 3, 99, 5, 54, 23, 86],
  [66, 100, 101, 102, 3, 7, 99, 100, 62, 5, 54, 103],
  [104, 105, 102, 55, 3, 0, 5, 99, 7, 66, 106, 98, 2, 21, 53, 107, 86],
];


const SONG_LIST = [
  [ "野狼DISCO", "アイモ", "采薇", "那女孩对我说",
    "3月9日", "旋木", "深海", "斑马斑马", "Last Dance", "多远都要在一起" ],
  [ "我也不想这样", "今夏", "其实都没有", "那女孩对我说", "還沒想好", 
    "催眠", "九九八十一", "下雨天", "失落沙洲", ],
  [ "Black and yellow", "假如我是真的", "How Far I’ll Go", "野子", "怎么了",
    "对的时间点", "孤独患者", "斑马斑马", "小宇", "没想好", "莫斯科郊外的晚上",
    "给我一个理由忘记", "你就不要想起我", "慢慢喜欢你", "吃瓜", ],
  [ "追光者；夏天的风", "我很快乐", "不难", "爱你不是两三天",
    "How Far I’ll Go", "怎么了", "我很想爱她", "知否知否", "成都",
    "我听过你的歌", "红豆", ],
  [ "太阳", "我要我们在一起", "大开眼界", "你怎么说", "Yellow", "胡广生", "梦一场",
    "Brave Heart", "本色", "你给我听好", "陪你去流浪", "演员", "想見你想見你想見你", ],
  [ "成都（吉他弹唱）", "白雪", "他不爱我", "这就是爱吗", "红玫瑰", "富士山下",
    "红色高跟鞋", "在劫难逃", "待定", ],
  [ "爱要怎么说出口", "待定吧", "日不落", "园游会", "无人之境", "晚安喵", "莉莉安",
    "大鱼", "可惜没如果", ],
  [ "那些你很冒险的梦", "如果有来生", "浪漫手机", "浪费", "女主角", "左手指月", "待定",
    "绿色", "约定", "遗失的美好", ],
  [ "我们的爱", "路过人间", "待定", "Reflection", "K歌之王", "南方姑娘", "未确定", 
    "一丝不挂", "不枉 （由于室友睡得很早，希望能够早一点唱）", "世界这么大还是遇见你",
    "夏天的风", "断点", "你不是真正的快乐", "", ],
  [ "海阔天空", "待定", "男孩别哭", "未定", "待定", "山水贵客", "最长的电影",
    "这一生关于你的风景", ],
  ["小丸子的心事", "江南", "", "这就是爱吗", "富士山下，爱情转移", "男孩别哭", "虚拟少年",
   "如果你也听说", "明明就淘汰", "Stay with you", "雪之华（中岛美嘉）",
   "Viva La Vida", ],
  [ "浪花一朵朵", "太阳", "需要人陪", "彩虹", "像我这样的人", "倒带", "突然想起你",
    "爱我别走（吉他弹唱）", "传奇", "大红大紫", "千年之恋", ],
  [ "春天花会开", "天黑黑", "Fly me to the moon", "平凡的一天", "Someday or one day",
    "beautiful love", "喜欢你", "待定", "我多喜欢你，你会知道", "单车", "模范情书", ],
  [ "待定", "朋友", "人间天堂", "推开世界的门", "咖喱咖喱", "青花瓷", "当时的月亮",
    "上海1943", "一生守候", "如果爱", "口是心非", "最美的太阳", ],
  [ "夏夜晚风", "爱情🐦", "外面的世界", "世间美好与你环环相扣", "她来听我的演唱会",
    "借我", "第三天", "妥协", "明年今日", ],
  [ "待定", "4536251", "好想爱这个世界啊", "直到世界尽头", "爱是一颗幸福的子弹",
    "大碗宽面", "雨还是不停地落下", "芒种", "像我这样的人", "一丝不挂", "万有引力",
    "死性不改/ 孤儿仔", "相信你的人", ],
  [ "菊花台", "画心", "爱的就是你", "Landing Guy", "信仰", "Fix you",
    "我等到花儿都谢了", "不潮不用花钱", "一笑倾城", "芒种", "阴天快乐", "Wonderful U", "小城大事", ],
  [ "春天花会开", "味道", "普通朋友", "莉莉安", "夏天的风", "说走就走",
    "遇见你时所有星星都落在我头上", "The Scientist", "儿时", ],
  [ "Faded", "漂洋过海来看你", "想你的365天", "百年孤寂", "Hotel California",
    "流着眼泪唱起歌", "信仰", ],
  [ "迷迭香", "领悟", "待定", "左右手", "Zombie", "芒种", "枫", "她说", "佛系少女", ],
  [ "待定", "愛的就是你", "Bad Romance", "龙的传人", "迷宫", "天天想你",
    "少年锦时", "謝謝妳愛我", "我喜欢上你时的内心活动", "不醉不会", "偏爱", "Safe and sound", ],
  [ "暂定", "寂寞的季节", "雪绒花", "Too Bad", "言不由衷", "最简单的美好", "你的眼神",
   "月半弯", "As long as I have music", "自然醒", "阿妹", "千本算法题",
   "人美路子野 + 风月", "二十二", "水星记", "攀登者", ],
];

const g_cloud_rects = [ // X, Y, W, H
  [ 45, 12, 703, 365 ],
  [ 771, 33, 489, 363 ],
  [ 1261, 41, 445, 300 ],
  [ 69, 465, 352, 208 ],
  [ 506, 422, 479, 283 ],
  [ 1147, 427, 572, 293 ],
];

const g_stage_rects = [
  [ 13, 9, 1395, 486 ],
];

const W = 1280, H = 720;

// STATISTICS
let g_num_completed = 0;

class PerformerLayout {
  constructor(n, x0 = W*(-0.3), x1 = W*0.3, y=H*0.35) {
    this.positions = [];
    for (let i=0; i<n; i++) {
      const x = lerp(x0, x1, i/(n-1));
      this.positions.push(new p5.Vector(x, y, 0));
    }
    this.idx = 0;
    this.poses = {};
  }
  
  AlignCenter() { // 中心对齐
    let pos1 = [];
    const N = this.positions.length;
    let idx0 = parseInt(N/2), idx1 = idx0+1;
    let idx = 0;
    while (idx0 >= 0 && idx1 < N) {
      if (idx0 >= 0) pos1[idx++] = this.positions[idx0];
      if (idx1 < N)  pos1[idx++] = this.positions[idx1];
      idx0 --;
      idx1 ++;
    }
    this.positions = pos1;
  }
  
  GetPos(idx) { return this.positions[idx]; }
  GetPosOrAssignForSprite(s) {
    if ((s in this.poses) == false) {
      this.poses[s] = this.positions[this.idx];
      this.idx += 1;
    }
    return this.poses[s];
  }
  
  GetWatermarkX() {
    return this.positions[this.idx].x + W/2;
  }
  
  Reset() {
    this.poses = {};
    this.idx = 0;
  }
}

class StageLayout {
  constructor(x0 = W*(-0.3), x1=W*0.3, y0=H*0.06, y1=H*0.20, C=22, R=3) {
    this.positions = [];
    
    for (let j=0; j<R; j++) {
      for (let i=0; i<C; i++) {
        const x = lerp(x0, x1, i/(C-1));
        const y = lerp(y0, y1, j/(R-1));
        this.positions.push(new p5.Vector(x, y));
      }
    }
  }
  
  GetPos(idx) {
    return this.positions[idx];
  }
}

class Director {
  constructor() {
    this.idx = 0;
    this.num_audience = 0; this.num_songs = 0;
    this.state = "idle";
    this.audience = [];
    this.performers = [];
  }
  
  Step() {
    g_animator.FinishPendingAnimations();
    switch (this.state) {
    case "idle":
      this.state = "show_started";
      const idx = this.idx;
      this.num_audience = g_audience_sizes[idx];
      this.num_songs    = PERFORMERS[idx].length;
      this.performer_idxes   = PERFORMERS[idx].slice();
      this.StartShow(this.num_audience, this.num_songs);
      break;
    case "show_started":
      
      this.EndShow();
      this.idx ++;
      if (this.idx >= g_audience_sizes.length) {
        this.state = "finish_screen_start";
      } else {
        this.state = "idle";
      }
      
      {
        const xx = g_performerlayout2.GetWatermarkX() + 2;
        // Animate z
        if (g_label1.last_watermark_x != xx) {
          g_animator.Animate(g_label1, "x", [g_label1.x, xx], [0, 333]);
          g_animator.Animate(g_label1, "y", [g_label1.y, 40], [0, 333]);
          g_label1.text = g_performerlayout2.idx + "名演唱者";
          g_label1.last_watermark_x = xx;
        }
      }
  
      break;
    case "finish_screen_start": {
      let i=0;
      g_completed_persons.forEach((p) => {
        p.state = "completed";
        p.scale = 1;
        p.StartJumping();
        let dest = g_finishlayout.GetPos(i);
        g_animator.Animate(p, "x", [p.x, dest.x], [0, 400]);
        g_animator.Animate(p, "y", [p.y, dest.y], [0, 400]);
        g_animator.Animate(p, "z", [p.z, dest.z], [0, 400]);
        i++;
      });
      g_animator.Animate(g_label1, "x", [g_label1.x, W*0.65], [0, 400]);
      g_animator.Animate(g_label1, "y", [g_label1.y, H*0.25], [0, 400]);
      g_animator.Animate(g_label1, "font_size", [g_label1.font_size, 33], [0, 400]);
      g_label1.text = this.idx + "期\n" + g_performerlayout2.idx + "名演唱者";
      this.state = "finish_screen_end";
      this.idx = 0;
      break;
    }
    case "finish_screen_end": {
      for (let i=0; i<g_persons.length; i++) {
        let p = g_persons[i];
        p.StopJumping();
        p.GoDownToGround();
      }
      this.performers = [];
      this.audience = [];
      g_completed_persons = new Set([]);
      this.state = "idle";
      g_label1.Reset();
      g_performerlayout2.Reset();
      break;
    }
    }
  }
  
  StartShow(n0, n1) { // n0 = # of audience, n1 = # of songs
    
    let chosen = new Set();
    
    this.audience = [];
    this.performers = [];
    
    let pf = new Set(this.performers);
    
    for (let i=0; i<n0; i++) {
      while (true) {
        const x = parseInt(random(0, g_persons.length-1));
        if (!(chosen.has(x)) && !(pf.has(x))) {
          let p = g_persons[x];
          if (p.state == "idle") {
            this.audience.push(p);
            const dest = g_stagelayout.GetPos(i);
            if (dest == undefined) {
              console.og("Hey");
            }
            g_persons[x].GoUpIntoCloud(dest);
            chosen.add(x);
            break;
          }
        }
      }
    }
    
    for (let i=0; i<this.performer_idxes.length; i++) {
      const x = this.performer_idxes[i];
      let p = g_persons[x];
      this.performers.push(p);
      p.StartJumping();
      const dest = g_performerlayout.GetPos(i);
      if (dest == undefined) {
        console.log("Hey");
      }
      p.GoUpIntoCloud(dest);
    }
    
    // Generate a bunch of clouds
    g_cloud_sprites = this.GenCloud(6, -W*0.4, W*0.4, H*0.1, H*0.3); 
    g_cloud_sprites2 = this.GenCloud(5, -W*0.4, W*0.4, H*(-0.1), H*0.0);
    g_stage_sprites = this.GenStage();
    
    // Show or hide song list
    this.ShowSongList();
  }
  
  ShowSongList() {
    g_songlist.SetSongList(SONG_LIST[this.idx]);
    g_animator.Animate(g_songlist, "y", [g_songlist.y1, g_songlist.y0], [0, 200]);
  }
  
  HideSongList() {
    g_animator.Animate(g_songlist, "y", [g_songlist.y0, g_songlist.y1], [0, 200]);
  }
  
  GenCloud(N, x0, x1, y0, y1) {
    let out = [];
    for (let n=0; n<N; n++) {
      const x = random(x0, x1);
      const y = random(y0, y1);
      const z = 0;
      const idx = parseInt(random(0, g_cloud_rects.length));
      const rect = g_cloud_rects[idx];
      
      const sp = new Sprite(x, y, z, rect[2], rect[3], 0.667, g_bg_textures[1],
        rect[0], rect[1], rect[2], rect[3]);
      // Left or right?
      if (x < (x0+x1)/2) {
        g_animator.Animate(sp, "x", [-W/2, sp.x], [0, 150+random(0,50)]);
        sp.dir = 1;
      } else {
        g_animator.Animate(sp, "x", [W/2, sp.x], [0, 150+random(0,50)]);
        sp.dir = -1;
      }
      
      out.push(sp);
    }
    return out;
  }
  
  DisposeOfCloud(sprites) {
    sprites.forEach((sp) => {
      if (sp.dir == 1) {
        g_animator.Animate(sp, "x", [sp.x, W*0.6], [0, 20+random(0, 400)], ()=>{
          sp.visible = false;
        });
      } else {
        g_animator.Animate(sp, "x", [sp.x, -W*0.6], [0, 20+random(0, 400)], ()=>{
          sp.visible = false;
        });
      }
    });
  }
  
  DisposeOfStage(sprites) {
    sprites.forEach((sp) => {
      g_animator.Animate(sp, "x", [sp.x, W*2], [0, 300], ()=>{
        sp.visible = false;
      });
    });
  }
  
  GenStage() {
    let out = [];
    const rect = g_stage_rects[0];
    const x = 0, y = 0.2*H;
    let sp = new Sprite(-W*2, y, 0, rect[2], rect[3], 0.667, g_bg_textures[2],
      rect[0], rect[1], rect[2], rect[3]);
    sp.tint = [ random(192,255), random(192, 255), random(192, 255) ];
    
    g_animator.Animate(sp, "x", [-W*2, x], [0, 300]); 
    
    g_billboard1.clear();
    g_billboard1.push();
    g_billboard1.translate(g_billboard1.width/2, g_billboard1.height/2);
    g_billboard1.rotate(random(-PI/8, 0));
    const R = g_billboard1.height*0.4;
    g_billboard1.rectMode(CENTER);
    g_billboard1.noStroke();
    g_billboard1.fill(255, random(128, 192), 111, 255);
    g_billboard1.rect(0, 0, R*2, R);
    
    g_billboard1.textSize(22);
    g_billboard1.noStroke();
    g_billboard1.fill(0);
    g_billboard1.textAlign(CENTER, CENTER);
    g_billboard1.text("第 " + (this.idx+GLOBAL_OFFSET) + " 期", 0, 0);
    
    g_billboard1.pop();
    
    // Sprite Billboard
    const xb = -W*0.3, yb = H*0.32;
    const rectb = [ 0, 0, g_billboard1.width, g_billboard1.height ];
    const spb = new Sprite(-W/2, yb, 0, rectb[2], rectb[3], 1.3, g_billboard1,
      rectb[0], rectb[1], rectb[2], rectb[3]);
    const HOLD = 100;
    g_animator.Animate(spb, "x", [0, 0, xb], [0, HOLD, 220]);
    g_animator.Animate(spb, "y", [0, 0, yb], [0, HOLD, 220]);
    g_animator.Animate(spb, "scale", [3, 3, 1], [0, HOLD, 220]);
    
    out.push(sp);
    out.push(spb);
    return out;
  }
  
  EndShow() {
    this.audience.forEach((x) => {
      x.GoDownToGround();
    });
    this.performers.forEach((x) => {
      x.StopJumping();
      x.GotoCompletionZone();
    });
    this.DisposeOfCloud(g_cloud_sprites);
    this.DisposeOfCloud(g_cloud_sprites2);
    this.DisposeOfStage(g_stage_sprites);
    
    this.HideSongList();
  }
  
  Dump() {
    return "[" + this.idx + "], " + this.state + ", " + this.num_audience +
           ", " + this.num_songs
  }
}

class SongList {
  constructor(x=W*0.5, y=H*0.75, w=W*0.8, h=H*0.44) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    
    this.y0 = y;
    this.y1 = H*2;
    
    // Hide in the beginning
    this.y = this.y1;
    
    this.SetSongList(["song1", "song2", "song3", "song4"]);
    let sl = [];
    for (let i=0; i<20; i++) {
      sl.push("song" + (i+1));
    }
    this.SetSongList(sl);
    this.visible = true;
  }
  
  SetSongList(sl) {
    this.color = [ random(192, 255),
                   random(192, 255),
                   random(192, 255) ];
    this.song_list = sl;
  }
  
  Render() {
    if (!this.visible) return;
    
    rectMode(CENTER, CENTER);
    fill(this.color[0], this.color[1], this.color[2], 224);
    stroke(0);
    rect(this.x, this.y, this.w, this.h);
    
    let xs = [this.x - this.w*0.45,
              this.x + this.w*0.05];
    let y0 = this.y - this.h * 0.45;
    let y1 = this.y + this.h * 0.45;
    noStroke();
    fill(0);
    
    const ncol = parseInt(this.song_list.length / 2)+1;
    
    push();
    textSize(22);
    for (let i=0; i<this.song_list.length; i++) {
      let x = xs[parseInt(i/ncol)];
      let y = y0 + 26 * parseInt(i%ncol);
      text(i+") " + this.song_list[i], x, y);
    }
    pop();
  }
}

class Sprite { // For drawing
  constructor(x, y, z, w, h, scale, tex, sx, sy, sw, sh) {
    this.x = x; this.y = y; this.z = z;
    this.w = w; this.h = h;
    this.scale = scale;
    this.tex = tex;
    this.visible = true;
    if (sx == undefined) { sx = 0; }
    if (sy == undefined) { sy = 0; }
    if (sw == undefined) { sw = tex.width; }
    if (sh == undefined) { sh = tex.height; }
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;
    
    this.tint = 0; // 染色？
  }
  
  Render() {
    if (!this.visible) return;
    imageMode(CENTER);
    if (this.tint != 0) {
      tint(this.tint[0], this.tint[1], this.tint[2]);
    } else {
      noTint();
    }
    
    const scalez = (this.z+1);
    const dx = W/2 + this.x * scalez;
    const dy = H/2 - this.y * scalez;
    
    image(this.tex, dx, dy,
      this.w*this.scale*scalez, this.h*this.scale*scalez,
      this.sx, this.sy,
      this.sw, this.sh);
  }
}

class Person {
  static serial = 0;
  static tag = 0;
  static BLINK_MS = 500;
  static JUMP_PERIOD = 1000; // Period
  
  constructor(x, y) {
    this.x = random(-210, 210);
    this.y = -100;
    this.z = random(0.1, 2);
    this.scale = 0.5;
    this.pos = new p5.Vector(
      this.x,
      this.y,
      this.z,
    );
    this.orig_pos = this.pos.copy();
    const d = random(0, PI*2);
    const vl = random(1,10);
    this.v   = new p5.Vector(0, 0); // 左右行走的人群
    this.state = "idle";
    this.participated = false;
    this.serial = Person.serial;
    Person.serial = (Person.serial + 1) % 64;
    
    this.tag = Person.tag;
    Person.tag ++;
    
    const sx = parseInt(this.serial % 8) * 36;
    const sy = parseInt(this.serial / 8) * 36;
    
    this.sprite = new Sprite(0, 0, 0, 36, 36, 0.5, g_sprite_sheet, sx, sy, 36, 36);
    
    this.delta_y = 0;
    this.elapsed = parseInt(random(0, 150));
    this.is_jumping = false;
  }
  
  Render() {
    this.sprite.x = this.x;
    this.sprite.y = this.y + this.delta_y;
    this.sprite.z = this.z;
    this.sprite.scale = this.scale;
    this.sprite.Render();
  }
  
  Update(delta_ms) {
    this.pos.add(this.v.copy().mult(delta_ms/1000));
    if (this.pos.x < 0) this.v.x *= -1;
    if (this.pos.x > W) this.v.x *= -1;
    if (this.pos.y < H/2) this.v.y *= -1;
    if (this.pos.y > H) this.v.y *= -1;
    
    if (this.state == "idle" || this.state == "done") {
      this.x = this.pos.x;
      this.y = this.pos.y;
    }
    
    this.elapsed += delta_ms;
    
    if (this.elapsed > Person.BLINK_MS) {
      this.elapsed -= Person.BLINK_MS;
      if (this.delta_y == 0) {
        this.delta_y = 1;
      } else {
        this.delta_y = 0;
      }
    }
    
    if (this.is_jumping == true) {
      const ms = millis();
      const phase = ms - Person.JUMP_PERIOD * parseInt(ms / Person.JUMP_PERIOD);
      this.delta_y = 5*abs(sin(this.elapsed / Person.JUMP_PERIOD * 2 * PI))
    }
  }
  
  StartJumping() {
    this.is_jumping = true;
  }
  
  StopJumping() {
    this.is_jumping = false;
    this.delta_y = 0;
  }
  
  GoUpIntoCloud(p) {
    this.state = "going_up";
    this.orig_pos = this.pos.copy();
    const offset = random(0, 200);
    g_animator.Animate(this, "scale", [0.5, 0.5, 1], [0, offset+0, offset+200]);
    g_animator.Animate(this, "x", [this.pos.x, this.pos.x, p.x], [0, offset+0, offset+200]);
    g_animator.Animate(this, "z", [this.pos.z, this.pos.z, p.z], [0, offset+0, offset+200]);
    g_animator.Animate(this, "y", [this.pos.y, this.pos.y, p.y], [0, offset+0, offset+200], ()=> {
      this.state = "on_cloud";
    });
  }
  
  GoDownToGround() {
    const offset = random(0, 200);
    const x = this.x, y = this.y, z = this.z;
    
    // 下来的时候走不同的路线
    let x0 = random(W*0, W*0.2);
    if (random() < 0.5) x0 = x0*(-1);
    let y0 = random(H*0.1, H*0.3);
    
    g_animator.Animate(this, "scale", [1, 1, 0.5], [0, offset+0, offset+400]);
    g_animator.Animate(this, "x", [x, x0, x0, this.orig_pos.x], [0, offset+0, offset+200, offset+400]);
    g_animator.Animate(this, "z", [z, .3, .3, this.orig_pos.z ], [0, offset+0, offset+200, offset+400]);
    g_animator.Animate(this, "y", [y, y, y0, this.orig_pos.y], [0, offset+0, offset+200, offset+400], ()=> {
      this.state = "idle";
      this.pos = this.orig_pos.copy();
    });
  }
  
  GotoCompletionZone() {
    const x = this.x, y = this.y, z = this.z;
    const tgt = g_performerlayout2.GetPosOrAssignForSprite(this.GetKey());
    
    g_animator.Animate(this, "x", [x, tgt.x], [0, 200], ()=>{
      this.state = "completed";
      this.pos = this.orig_pos.copy();
    });
    g_animator.Animate(this, "y", [y, tgt.y], [0, 200]);
    g_animator.Animate(this, "z", [z, tgt.z], [0, 200]);
    
    g_completed_persons.add(this);
  }
  
  GetKey() {
    return "person" + this.tag;
  }
}

class Animator {
  constructor() { this.subjects = []; }
  
  Animate(s, field, values, intervals, callback=null) {
    const m = millis()
    
    this.subjects.push({
      subject:  s,
      field:    field,
      values:    values,
      intervals: intervals,
      index: 0,
      start_millis: m,
      callback: callback
    })
  }
  
  Update() {
    let victims = new Set()
    const m = millis()
    for (let i=0; i<this.subjects.length; i++) {
      let s = this.subjects[i]
      const elapsed = m - s.start_millis
      while (elapsed > s.intervals[s.index+1]) {
        s.index++
      }
      
      let val, done = false;
      if (g_skip_animation) {
        s.index = s.intervals.length-1;
        done = true;
      }
      
      {
        if (s.index >= s.intervals.length-1) { // ended?
          val = s.values[s.values.length-1]
          done = true
          if (s.callback != null) { s.callback(s.subject); }
        } else {
          const x0 = elapsed - s.intervals[s.index]
          const x1 = s.intervals[s.index + 1] - s.intervals[s.index]
          let completion = x0 * 1.0 / x1
          completion = 1.0 - pow(1.0-completion, 2);
          val = lerp(s.values[s.index], s.values[s.index+1], completion)
        }
      }
      
      s.subject[s.field] = val;
      if (done) { victims.add(i); }
    }
    
    if (victims.size > 0) {
      let x = []
      for (let i=0; i<this.subjects.length; i++) {
        if (victims.has(i) == false) x.push(this.subjects[i])
      }
      this.subjects = x
    }
  }
  
  FinishPendingAnimations() {
    this.subjects.forEach((s) => {
      let val = s.values[s.values.length - 1];
      if (s.callback != null) { s.callback(s.subject); }
      s.subject[s.field] = val;
    });
    this.subjects = [];
  }
}

function preload() {
  g_sprite_sheet = loadImage("out.png");
  g_bg_textures.push(loadImage("bg2.png"));
  g_bg_textures.push(loadImage("cloudbg.png"));
  g_bg_textures.push(loadImage("stagebg.png"));
}

function setup() {
  createCanvas(W, H);

  const N = 500;
  for (let x=0; x<N; x++) { g_persons.push(new Person()); }
  
  // 按从远到近排列
  g_persons.sort(function(a, b) {
    if (a.z < b.z) { return -1; }
    else if (a.z == b.z) { return 0; }
    else return 1;
  });
  
  g_animator = new Animator();
  g_stagelayout = new StageLayout();
  g_performerlayout = new PerformerLayout(22, W*(-0.3), W*0.3, H*0.31);
  g_performerlayout.AlignCenter();
  g_performerlayout2 = new PerformerLayout(130, W*(-0.45), W*0.45, H*0.45,);
  g_director = new Director();

  g_finishlayout = new StageLayout(W*(-0.4), W*0.1, H*0.1, H*0.4, 20, 6);
  
  g_bg_sprites.push(new Sprite(0, -10, 0, 1280, 720, 1, g_bg_textures[0]));
  
  g_billboard1 = createGraphics(256, 128);
  g_songlist = new SongList();
}

// 这些Sprite按Z顺序绘制
g_sprite_list = [];
function EnqueueSprites(q) {
  for (let i=0; i<q.length; i++) {
    g_sprite_list.push(q[i]);
  }
}

function RenderQueuedSprites() {
  g_sprite_list.sort(function(a, b) {
    if (a.z > b.z) { return -1; }
    else if (a.z == b.z) { return 0; }
    else return 1;
  });
  g_sprite_list.forEach((s) => {
    s.Render();
  });
}

g_frame_count = 0;
g_last_millis = 0;
function draw() {
  const ms = millis();
  const delta = ms - g_last_millis;
  g_last_millis = ms;
  background(64);
  fill(255);
  stroke(0);
  
  if (g_frame_count == 0) {
    if (g_autorun) {
      AutoRunStep();
    }
  }
  
  // Background
  g_bg_sprites.forEach((p) => { p.Render(); });
  
  // Cloud BG
  g_cloud_sprites.forEach((c) => { c.Render(); });
  g_stage_sprites.forEach((c) => { c.Render(); });

  //g_persons.forEach((p) => { p.Render(); })
  
  let ZBREAKS = [ -9999, 0.2, 0.4, 0.6, 0.8, 1, 2, 9999 ];
  
  // 超拙劣的手工画家算法
  for (let i=1; i<ZBREAKS.length; i++) {
    const z = ZBREAKS[i], zprev = ZBREAKS[i-1];
    g_persons.forEach((p) => {
      if (p.z >= zprev && p.z < z) { p.Render(); }
    })
    
    if (zprev <= 0 && z >= 0) {
      g_cloud_sprites2.forEach((c) => { c.Render();});
    }
  }
  
  g_persons.forEach((p) => { p.Update(delta); });
  
  g_animator.Update();
  
  textAlign(LEFT, TOP);
  fill(255);
  noStroke();
  
  g_songlist.Render();
  
  push();
  textAlign(LEFT, CENTER);
  textSize(g_label1.font_size);
  noStroke();
  fill(255);
  text(g_label1.text, g_label1.x, g_label1.y);
  pop();
  
  textAlign(LEFT, TOP);
  if (g_autorun) {
    noStroke();
    fill(255, 255, 0);
    text("Autorun Mode\nPush [space]\nto cancel", 4, 4);
  }
  
  g_frame_count ++;
}

function StartAutoRun() {
  g_autorun = true;
  AutoRunStep();
}

function AutoRunStep() {
  if (!g_autorun) return;
  console.log("AutoRunStep");
  g_director.Step();
  
  let delay = 0;
  const x = g_director.idx;
  if (x < 3) {
    delay = 800;
  } else if (x < 10) {
    delay = 300 + random(0, 100);
  } else if (x < g_audience_sizes.length - 1) {
    delay = 100 + random(0, 50);
  } else {
    delay = 1200;
  }
  
  if (g_director.state == "idle" && x <= g_audience_sizes.length - 1) {
    delay /= 3;
  }
  
  // 特例
  if (g_director.state == "idle" && x == 0) {
    delay = 2000;
  }
  
  if (g_director.state == "finish_screen_start") {
    delay = 1000;
  } else if (g_director.state == "finish_screen_end") {
    delay = 2000;
  }
  
  setTimeout(function() {
    AutoRunStep();
  }, delay);
}

function keyPressed() {
  if (key === ' ') {
    g_autorun = false;
    g_director.Step();
  } else if (key == 'a') {
    StartAutoRun();
  }
  return false;
}