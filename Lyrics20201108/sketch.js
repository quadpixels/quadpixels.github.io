// 2020-11-08

const PAD_V = 12, PAD_H = 2;
let LYRIC_FONT_SIZE = 20;
const LYRIC_LINE_PAD = 4;
const LYRIC_COL_PAD = 4;
const USE_LINE_NUMBER = true;
let g_lyric_idx = 0;
const MY_DEBUG = false;
let g_use_background = true;

const W0 = 800, H0 = 640;
var W = 800, H = 640, WW, HH;
var prevW = W, prevH = H;
var g_dirty = 0;
let g_lyric_serial = 1;

let g_poster, g_zgzg_logo, g_xcjc_logo, g_xcjc_logo_2;

function windowResized() {
  OnWindowResize();
}

//
function OnWindowResize() {
  if (true) {
    WW = windowWidth;
    HH = windowHeight;
    let ratio1 = WW * 1.0 / HH; // 432/688 = 0.6279
    let ratio0 = W0 * 1.0 / H0; // 400/720 = 0.5556
    
    const KEEP_ASPECT_RATIO = false;
    if (KEEP_ASPECT_RATIO) {
      if (ratio1 > ratio0) {
        H = HH;
        W = H * W0 / H0
      } else {
        W = WW;
        H = W * H0 / W0
      }
    } else {
      H = HH; W = WW;
    }
    
    resizeCanvas(W, H);
    
    prevW = W; prevH = H;
    g_dirty += 2;
  }
}

function do_IsMouseOver(o, mx, my) {
  const wx = mx + g_viewport_x, wy = my + g_viewport_y;
  if (wx >= o.pos.x && wx <= o.pos.x + o.w && wy >= o.pos.y && wy <= o.pos.y + o.h) { return true; }
  else return false;
}

class PushButton {
  constructor(w, h, text, cb, font_size) {
    this.g = createGraphics(w, h);
    this.g.textAlign(CENTER, CENTER);
    this.g.noStroke();
    this.g.fill(32);
    if (font_size == undefined) {
      this.g.textSize(LYRIC_FONT_SIZE);
    } else {
      this.g.textSize(font_size);
    }
    this.g.text(text, w/2, h/2);
    this.pos = new p5.Vector(0, 0);
    this.w = w; this.h = h;
    this.OnClick = cb;
    this.is_enabled = true;
  }
  
  IsMouseOver(mx, my) {
    if (!this.is_enabled) return false;
    return do_IsMouseOver(this, mx, my);
  }
  
  Render() {
    if (!this.is_enabled) return;
    push();
    noFill();
    if (this.is_hovered) { stroke(32, 224, 32); fill(255, 255, 224); }
    else { stroke(128); fill(224); }
    rect(this.pos.x, this.pos.y, this.w, this.h);
    pop();
    image(this.g, this.pos.x, this.pos.y);
  }
}

class PosterButton {
  constructor(w, h, img, cb) {
    this.pos = new p5.Vector(0, 0);
    this.w = w; this.h = h;
    this.img = img;
    this.OnClick = cb;
  }
  
  Render() {
    image(this.img, this.pos.x, this.pos.y, this.w, this.h);
    push();
    noFill(); stroke(128);
    rect(this.pos.x, this.pos.y, this.w, this.h);
    pop();
  }
  
  IsMouseOver(mx, my) { return do_IsMouseOver(this, mx, my); }
}

// entry is a [[string]]
function IsEmpty(entry) {
  let total_len = 0;
  entry.forEach((line) => {
    line.forEach((w) => {
      total_len += w.length;
    })
  });
  return (total_len < 1);
}

// 基本类
class LyricBlock {
  // header is a [string]
  // contents is a [[string]]
  constructor(headers, contents, NF) {
    const h = PAD_V * 2 + (LYRIC_FONT_SIZE + LYRIC_LINE_PAD*2) * NF;
    const line_number_w = 2 * LYRIC_FONT_SIZE;
    
    const pad_h_scaled = PAD_H * LYRIC_FONT_SIZE / 20;
    const lyric_col_pad_scaled = LYRIC_COL_PAD * LYRIC_FONT_SIZE / 20;
    
    push();
    textSize(LYRIC_FONT_SIZE);
    let w = 0;
    
    if (headers != undefined) {
      headers.forEach((hdr) => {
        w = max(w, textWidth(hdr));
        w = w + lyric_col_pad_scaled;
      });      
    }
    
    let dx0 = pad_h_scaled;
    
    
    let xs = [ dx0, dx0+w ];
    let ys = [];
    for (let i=0; i<=NF; i++) {
      ys.push(PAD_V + i * (LYRIC_FONT_SIZE + LYRIC_LINE_PAD*2));
    }
    
    const L = contents[0].length;
    for (let i=0; i<L; i++) {
      let entry_w = 0;
      for (let j=0; j<NF; j++) {
        const entry = contents[j][i];
        entry_w = max(entry_w, textWidth(entry));
      }
      w += (entry_w + 2*lyric_col_pad_scaled);
      xs.push(w);
    }
    
    let gw = w + pad_h_scaled;
    if (USE_LINE_NUMBER) { gw += 2 * LYRIC_FONT_SIZE; }
    this.g = createGraphics(gw, h);
    this.g.clear();
    this.g.noFill();
    this.g.stroke(192, 128, 128);
    
    if (!IsEmpty(contents)) {
      // 画格子
      let x0 = pad_h_scaled, x1 = w, y0 = PAD_V, y1 = h - PAD_V;
      if (USE_LINE_NUMBER) {
        x0 += line_number_w;
        x1 += line_number_w;
      }
      for (let i=0; i<=NF; i++) {
        this.g.line(x0, ys[i], x1, ys[i]);
      }
      for (let i=0; i<xs.length; i++) {
        let xi = xs[i];
        if (USE_LINE_NUMBER) { xi += line_number_w; }

        const t0 = 0.1;
        for (let i=0; i<NF; i++) {
          const y00 = ys[i], y11 = ys[i+1];
          const y01 = lerp(y00, y11, t0);
          const y10 = lerp(y00, y11, 1-t0);
          this.g.line(xi, y00, xi, y01);
          this.g.line(xi, y10, xi, y11);
        }
      }

      this.g.textSize(LYRIC_FONT_SIZE);
      this.g.textAlign(LEFT, TOP);
      this.g.noStroke();
      this.g.fill(32);

      // 画表头
      if (headers != undefined) {
        for (let j=0; j<NF; j++) {
          let dx = x0 + lyric_col_pad_scaled, dy = ys[j] + LYRIC_LINE_PAD;
          //if (USE_LINE_NUMBER) { dx += line_number_w; }
          this.g.fill("#33F");
          this.g.text(headers[j], dx, dy);
        }
      }
      this.g.fill("#000");
      for (let j=0; j<NF; j++) {
        for (let i=0; i<L; i++) {
          let dx = xs[i+1] + lyric_col_pad_scaled, dy = ys[j] + LYRIC_LINE_PAD;
          if (USE_LINE_NUMBER) { dx += line_number_w; }
          this.g.text(contents[j][i], dx, dy);
        }
      }

      // 画行号
      if (USE_LINE_NUMBER) {
        this.g.fill(128);
        this.g.textAlign(RIGHT, TOP);
        let serial = (g_lyric_serial++);
        this.g.text(serial+"", line_number_w * 0.9, ys[0] + LYRIC_LINE_PAD);
      }
    }
      
    pop();
    this.pos = new p5.Vector(8, 8);
    this.w = w; this.h = h;
    if (USE_LINE_NUMBER) { this.w += line_number_w; }
  }
  
  Render() {
    if (this.is_hovered) {
      push();
      fill("#FFFFCC");
      noStroke();
      rect(this.pos.x, this.pos.y, this.w, this.h);
      pop();
    }
    image(this.g, this.pos.x, this.pos.y);
  }
  
  IsMouseOver(mx, my) {
    return do_IsMouseOver(this, mx, my);
  }
}

let g_blocks = []
let g_goto_top;
let g_hovered_block;

// Link: https://tieba.baidu.com/p/5022374695?red_tag=1899203340
const DATA0 = [
  ["歌词", "闽南语正字", "闽南语拼音"],
  [
    [
      ["一时","失志","不免","怨叹"],
      ["一時","失志","毋免","怨嘆"],
      ["tsi̍t-sî","sit-tsì","m̄-bián","uàn-thàn"],
      ["注音来源: https://tieba.baidu.com/p/5022374695?red_tag=1899203340"]
    ],
    [
      ["一时","落魄","不免","胆寒" ],
      ["一時","落魄","毋免","膽寒" ],
      ["tsi̍t-sî","lo̍k-phik","m̄-bián","tám-hân"],
    ],
    [
      ["哪","怕","失去","希望"],
      ["哪","通","失去","希望"],
      ["ná","thang","sit-khì", "hi-bāng"],
    ],
    [
      ["每日","醉茫茫"],
      ["每日","醉茫茫"],
      ["muí-ji̍t","tsuì-bâng-bâng"],
    ],
    [
      ["无","魂","有","体","亲像","稻草人"],
      ["無","魂","有","體","親像","稻草人"],
      ["bô","hûn", "ū", "thé", "tshin-tshiūnn", "tiū-tsháu-lâng"]
    ],
    [
      ["人生","可比","是","海上","的","波浪"],
      ["人生","可比","是","海上","的","波浪"],
      ["jîn-sing", "khó-pí", "sī", "hái-siōng", "ê", "pho-lōng"],
    ],
    [
      ["有","时","起","有","时","落"],
      ["有","時","起","有","時","落"],
      ["ū", "sî", "khí", "ū", "sî", "lo̍h"],
    ],
    [
      ["好运","歹运"],
      ["好運","歹運"],
      ["hó-ūn", "pháinn-ūn"]
    ],
    [
      ["总","嘛","要","照起工","来","行"],
      ["總","嘛","要","照起工","來","行"],
      ["tsóng", "mā", "ài", "tsiàu-khí-kang", "lâi", "kiânn"]
    ],
    [
      ["三分","天","注定"],
      ["三分","天","註定"],
      ["sann-hun", "thinn", "tsù-tiānn"],
    ],
    [
      ["七分","靠","打拉"],
      ["七分","靠","拍拚"],
      ["tshit-hun", "khò", "phah-piànn"],
    ],
    [
      ["爱","拼","才","会","赢"],
      ["愛","拚","才","會","贏"],
      ["ài", "piànn", "tsiah", "ē","iânn"]
    ],
    [ [],[],[] ],
    [
      ["一时","失志","不免","怨叹"],
      ["一時","失志","毋免","怨嘆"],
      ["tsi̍t-sî","sit-tsì","m̄-bián","uàn-thàn"]
    ],
    [
      ["一时","落魄","不免","胆寒" ],
      ["一時","落魄","毋免","膽寒" ],
      ["tsi̍t-sî","lo̍k-phik","m̄-bián","tám-hân"],
    ],
    [
      ["哪","怕","失去","希望"],
      ["哪","通","失去","希望"],
      ["ná","thang","sit-khì", "hi-bāng"],
    ],
    [
      ["每日","醉茫茫"],
      ["每日","醉茫茫"],
      ["muí-ji̍t","tsuì-bâng-bâng"],
    ],
    [
      ["无","魂","有","体","亲像","稻草人"],
      ["無","魂","有","體","親像","稻草人"],
      ["bô","hûn", "ū", "thé", "tshin-tshiūnn", "tiū-tsháu-lâng"]
    ],
    [
      ["人生","可比","是","海上","的","波浪"],
      ["人生","可比","是","海上","的","波浪"],
      ["jîn-sing", "khó-pí", "sī", "hái-siōng", "ê", "pho-lōng"],
    ],
    [
      ["有","时","起","有","时","落"],
      ["有","時","起","有","時","落"],
      ["ū", "sî", "khí", "ū", "sî", "lo̍h"],
    ],
    [
      ["好运","歹运"],
      ["好運","歹運"],
      ["hó-ūn", "pháinn-ūn"]
    ],
    [
      ["总","嘛","要","照起工","来","行"],
      ["總","嘛","要","照起工","來","行"],
      ["tsóng", "mā", "ài", "tsiàu-khí-kang", "lâi", "kiânn"]
    ],
    [
      ["三分","天","注定"],
      ["三分","天","註定"],
      ["sann-hun", "thinn", "tsù-tiānn"],
    ],
    [
      ["七分","靠","打拼"],
      ["七分","靠","拍拚"],
      ["tshit-hun", "khò", "phah-piànn"],
    ],
    [
      ["爱","拼","才","会","赢"],
      ["愛","拚","才","會","贏"],
      ["ài", "piànn", "tsiah", "ē","iânn"]
    ],
    [ [],[],[] ],
    [
      ["人生","可比","是","海上","的","波浪"],
      ["人生","可比","是","海上","的","波浪"],
      ["jîn-sing", "khó-pí", "sī", "hái-siōng", "ê", "pho-lōng"],
    ],
    [
      ["有","时","起","有","时","落"],
      ["有","時","起","有","時","落"],
      ["ū", "sî", "khí", "ū", "sî", "lo̍h"],
    ],
    [
      ["好运","歹运"],
      ["好運","歹運"],
      ["hó-ūn", "pháinn-ūn"]
    ],
    [
      ["总","嘛","要","照起工","来","行"],
      ["總","嘛","要","照起工","來","行"],
      ["tsóng", "mā", "ài", "tsiàu-khí-kang", "lâi", "kiânn"]
    ],
    [
      ["三分","天","注定"],
      ["三分","天","註定"],
      ["sann-hun", "thinn", "tsù-tiānn"],
    ],
    [
      ["七分","靠","打拼"],
      ["七分","靠","拍拚"],
      ["tshit-hun", "khò", "phah-piànn"],
    ],
    [
      ["爱","拼","才","会","赢"],
      ["愛","拚","才","會","贏"],
      ["ài", "piànn", "tsiah", "ē","iânn"]
    ],
  ]
]

let DATA1 = [
  ["歌词", "粤语拼音"],
  [
    [
      ["细","雨","带","风","湿","透","黄","昏","的","街","道"],
      ["sai", "jyu", "daai", "fung", "sap", "tau", "wong", "fan", "dik", "gaai", "dou"],
      ["注音来源：https://www.feitsui.com/zh-hans/lyrics/175"]
    ],
    [
      ["抹","去","雨","水","双","眼","无","故","地","仰","望"],
      ["mut","heoi","jyu","seoi","soeng","ngaan","mou","gu","dei","joeng","mong"],
    ],
    [
      ["望","向","孤","单","的","晚","灯"],
      ["mong","hoeng","gu","daan","dik","maan","dang"]
    ],
    [
      ["是","那","伤","感","的","记","忆"],
      ["si","naa","soeng","gam","dik","gei","jik"],
    ],
    [
      ["再","次","泛","起","心","里","无","数","的","思","念"],
      ["zoi","ci","faan","hei","sam","leoi","mou","sou","dik","si","nim"]
    ],
    [
      ["以","往","片","刻","欢","笑","仍","挂","在","脸","上"],
      ["ji","wong","pin","hak","fun","siu","jing","gwaa","zoi","lim","soeng"]
    ],
    [
      ["愿","你","此","刻","可","会","知"],
      ["jyun","nei","ci","hak","ho","wui","zi"],
    ],
    [
      ["是","我","衷","心","的","说","声"],
      ["si","ngo","cung","sam","dik","syut","seng"]
    ],
    [
      ["喜","欢","你"," ","那","双","眼","动","人"],
      ["hei","fun","nei"," ","naa","soeng","ngaan","dung","jan"],
    ],
    [
      ["笑","声","更","迷","人"," ","愿","再","可"],
      ["siu","seng","gang","mai","jan","", "jyun","zoi","ho"],
    ],
    [
      ["轻","抚","你"," ","那","可","爱","面","容"],
      ["hing","fu","nei"," ","naa","ho","oi","min","jung"],
    ],
    [
      ["挽","手","说","梦","话"," ","像","昨","天"," ","你","共","我"],
      ["waan","sau","syut","mung","waa"," ","zoeng","zok","tin"," ","nei","gung","ngo"],
    ],
    
    
    [ [],[] ],
    
    [
      ["满","带","理","想","的","我","曾","经","多","冲","动"],
      ["mun","daai","lei","soeng","dik","ngo","cang","ging","do","cung","dung"],
    ],
    [
      ["屡","怨","与","她","相","爱","难","有","自","由"],
      ["leoi","jyun","jyu","taa","soeng","oi","naan","jau","zi","jau"],
    ],
    [
      ["愿","你","此","刻","可","会","知"],
      ["jyun","nei","ci","hak","ho","wui","zi"],
    ],
    [
      ["是","我","衷","心","的","说","声"],
      ["si","ngo","cung","sam","dik","syut","seng"],
    ],
    
    [
      ["喜","欢","你"," ","那","双","眼","动","人"],
      ["hei","fun","nei"," ","naa","soeng","ngaan","dung","jan"],
    ],
    [
      ["笑","声","更","迷","人"," ","愿","再","可"],
      ["siu","seng","gang","mai","jan","", "jyun","zoi","ho"],
    ],
    [
      ["轻","抚","你"," ","那","可","爱","面","容"],
      ["hing","fu","nei"," ","naa","ho","oi","min","jung"],
    ],
    [
      ["挽","手","说","梦","话"," ","像","昨","天"," ","你","共","我"],
      ["waan","sau","syut","mung","waa"," ","zoeng","zok","tin"," ","nei","gung","ngo"],
    ],
    
    [ [],[] ],
    
    [
      ["每","晚","夜","里","自","我","独","行"],
      ["mui","maan","je","leoi","zi","ngo","duk","hang"],
    ],
    [
      ["随","处","荡"," ","多","冰","冷"],
      ["ceoi","cyu","dong"," ","do","bing","laang"],
    ],
    [
      ["以","往","为","了","自","我","挣","扎"],
      ["ji","wong","wai","liu","zi","ngo","zang","zaat"],
    ],
    [
      ["从","不","知"," ","她","的","痛","苦"],
      ["cung","bat","zi"," ","taa","dik","tung","fu"]
    ],
  
    [
      ["喜","欢","你"," ","那","双","眼","动","人"],
      ["hei","fun","nei"," ","naa","soeng","ngaan","dung","jan"],
    ],
    [
      ["笑","声","更","迷","人"," ","愿","再","可"],
      ["siu","seng","gang","mai","jan","", "jyun","zoi","ho"],
    ],
    [
      ["轻","抚","你"," ","那","可","爱","面","容"],
      ["hing","fu","nei"," ","naa","ho","oi","min","jung"],
    ],
    [
      ["挽","手","说","梦","话"," ","像","昨","天"," ","你","共","我"],
      ["waan","sau","syut","mung","waa"," ","zoeng","zok","tin"," ","nei","gung","ngo"],
    ],
  ]
]


let DATA2 = [
  [ "简体", "繁体", "粤语拼音" ],
  [
    [
      ["浪","奔"," ","浪","流"],
      ["浪","奔"," ","浪","流"],
      ["long", "ban", " ", "long", "lau"],
      ["注音来源：https://www.feitsui.com/zh-hans/lyrics/32"],
    ],
    [
      ["万","里","滔","滔","江","水","永","不","休",],
      ["萬","里","滔","滔","江","水","永","不","休",],
      ["maan","lei","tou","tou","gong","seoi","wing","bat","jau"],
    ],
    [
      ["淘","尽","了"," ","世","间","事"],
      ["淘","盡","了"," ","世","間","事"],
      ["tou","zeon","liu"," ","sai","gaan","si"],
    ],
    [
      ["混","作","滔","滔","一","片","潮","流"],
      ["混","作","滔","滔","一","片","潮","流"],
      ["wan","zok","tou","tou","jat","pin","ciu","lau"]
    ],
    [
      ["是","喜"," ","是","愁"],
      ["是","喜"," ","是","愁"],
      ["si","hei"," ", "si","sau"],
    ],
    [
      ["浪","里","分","不","清","欢","笑","悲","忧"],
      ["浪","裡","分","不","清","歡","笑","悲","憂"],
      ["long","leoi","fan","bat","cing","fun","siu","bei","jau"]
    ],
    [
      ["成","功"," ","失","败"],
      ["成","功"," ","失","敗"],
      ["sing","gung", " ","sat","baai"],
    ],
    [
      ["浪","里","看","不","出","有","未","有"],
      ["浪","裡","看","不","出","有","未","有"],
      ["long","leoi","hon","bat","ceot","jau","mei","jau"]
    ],
    [ [], [] ],
    [
      ["爱","你","恨","你"," ","问","君","知","否"],
      ["愛","你","恨","你"," ","問","君","知","否"],
      ["ngoi","nei","han","nei"," ","man","gwan","zi","fau"],
    ],
    [
      ["似","大","江","一","发","不","收"],
      ["似","大","江","一","發","不","收"],
      ["ci","daai","gong","jat","faat","bat","sau"],
    ],
    [
      ["转","千","湾"," ","转","千","滩"],
      ["轉","千","灣"," ","轉","千","灘"],
      ["zyun","cin","waan"," ","zyun","cin","taan"],
    ],
    [
      ["亦","未","平","复","此","中","争","斗"],
      ["亦","未","平","復","此","中","争","鬥"],
      ["jik","mei","ping","fuk","ci","zung","zaang","dau"],
    ],
    [
      ["又","有","喜"," ","又","有","愁"],
      ["又","有","喜"," ","又","有","愁"],
      ["jau","jau","hei"," ","jau","jau","sau"],
    ],
    [
      ["就","算","分","不","清","欢","笑","悲","忧"],
      ["就","算","分","不","清","欢","笑","悲","憂"],
      ["zau","syun","fan","bat","cing","fun","siu","bei","jau"],
    ],
    [
      ["仍","愿","翻"," ","百","千","浪"],
      ["仍","願","翻"," ","百","千","浪"],
      ["jing","jyun","faan"," ","baak","cin","long"],
    ],
    [
      ["在","我","心","中","起","伏","够"],
      ["在","我","心","中","起","伏","夠"],
      ["zoi","ngo","sam","zung","hei","fuk","gau"]
    ],
    [ [], [], [] ],
    [
      ["爱","你","恨","你"," ","问","君","知","否"],
      ["愛","你","恨","你"," ","問","君","知","否"],
      ["ngoi","nei","han","nei"," ","man","gwan","zi","fau"],
    ],
    [
      ["似","大","江","一","发","不","收"],
      ["似","大","江","一","發","不","收"],
      ["ci","daai","gong","jat","faat","bat","sau"],
    ],
    [
      ["转","千","湾"," ","转","千","滩"],
      ["轉","千","灣"," ","轉","千","灘"],
      ["zyun","cin","waan"," ","zyun","cin","taan"],
    ],
    [
      ["亦","未","平","复","此","中","争","斗"],
      ["亦","未","平","復","此","中","争","鬥"],
      ["jik","mei","ping","fuk","ci","zung","zaang","dau"],
    ],
    [
      ["又","有","喜"," ","又","有","愁"],
      ["又","有","喜"," ","又","有","愁"],
      ["jau","jau","hei"," ","jau","jau","sau"],
    ],
    [
      ["浪","里","分","不","清","欢","笑","悲","忧"],
      ["浪","里","分","不","清","欢","笑","悲","憂"],
      ["long","leoi","fan","bat","cing","fun","siu","bei","jau"],
    ],
    [
      ["仍","愿","翻"," ","百","千","浪"],
      ["仍","願","翻"," ","百","千","浪"],
      ["jing","jyun","faan"," ","baak","cin","long"],
    ],
    [
      ["在","我","心","中","起","伏","够"],
      ["在","我","心","中","起","伏","夠"],
      ["zoi","ngo","sam","zung","hei","fuk","gau"]
    ]
  ]
]

let DATA3 = [
  ["英文"],
  [
[["The", "snow", "glows", "white", "on", "the", "mountain", "tonight"]],
[["Not", "a", "footprint", "to", "be", "seen"]],
[["A", "kingdom", "of", "isolation,"]],
[["and", "it", "looks", "like", "I'm", "the", "Queen"]],
[["The", "wind", "is", "howling", "like", "this", "swirling", "storm", "inside"]],
[["Couldn't", "keep", "it", "in;", "Heaven", "knows", "I've", "tried"]],
[["Don", "t", "let", "them", "in,", "don", "t", "let", "them", "see"]],
[["Be", "the", "good", "girl", "you", "always", "have", "to", "be"]],
[["Conceal,", "don't", "feel,", "don't", "let", "them", "know"]],
[["Well", "now", "they", "know"]],
[["Let", "it", "go,", "let", "it", "go"]],
[["Can't", "hold", "it", "back", "anymore"]],
[["Let", "it", "go,", "let", "it", "go"]],
[["Turn", "away", "and", "slam", "the", "door"]],
[["I", "don't", "care", "what", "they're", "going", "to", "say"]],
[["Let", "the", "storm", "rage", "on"]],
[["The", "cold", "never", "bothered", "me", "anyway"]],
[["It's", "funny", "how", "some", "distance"]],
[["Makes", "everything", "seem", "small"]],
[["And", "the", "fears", "that", "once", "controlled", "me"]],
[["Can", "t", "get", "to", "me", "at", "all"]],
[["It", "s", "time", "to", "see", "what", "I", "can", "do"]],
[["To", "test", "the", "limits", "and", "break", "through"]],
[["No", "right,", "no", "wrong,", "no", "rules", "for", "me,"]],
[["I'm", "free!"]],
[["Let", "it", "go,", "let", "it", "go"]],
[["I", "am", "one", "with", "the", "wind", "and", "sky"]],
[["Let", "it", "go,", "let", "it", "go"]],
[["You", "ll", "never", "see", "me", "cry"]],
[["Here", "I", "stand"]],
[["And", "here", "I'll", "stay"]],
[["Let", "the", "storm", "rage", "on"]],
[["My", "power", "flurries", "through", "the", "air", "into", "the", "ground"]],
[["My", "soul", "is", "spiraling", "in", "frozen", "fractals", "all", "around"]],
[["And", "one", "thought", "crystallizes", "like", "an", "icy", "blast"]],
[["I'm", "never", "going", "back,", "the", "past", "is", "in", "the", "past"]],
[["Let", "it", "go,", "let", "it", "go"]],
[["And", "I'll", "rise", "like", "the", "break", "of", "dawn"]],
[["Let", "it", "go,", "let", "it", "go"]],
[["That", "perfect", "girl", "is", "gone"]],
[["Here", "I", "stand"]],
[["In", "the", "light", "of", "day"]],
[["Let", "the", "storm", "rage", "on"]],
[["The", "cold", "never", "bothered", "me", "anyway!"]],
[["The", "cold", "never", "bothered", "me", "anyway!"]],
]
];

let DATA4 = [
  ["英文"],
  [
    [["An", "empty", "street,", "an", "empty", "house"]],
[["A", "hole", "inside", "my", "heart"]],
[["I'm", "all", "alone,", "the", "rooms", "are", "getting", "smaller"]],
[["I", "wonder", "how,", "I", "wonder", "why"]],
[["I", "wonder", "where", "they", "are"]],
[["The", "days", "we", "had,", "the", "songs", "we", "sang", "together"]],
[["Oh,", "yeah"]],
[[""]],
[["And", "oh,", "my", "love"]],
[["I'm", "holding", "on", "forever"]],
[["Reaching", "for", "the", "love", "that", "seems", "so", "far"]],
[[""]],
[["So,", "I", "say", "a", "little", "prayer"]],
[["And", "hope", "my", "dreams", "will", "take", "me", "there"]],
[["Where", "the", "skies", "are", "blue"]],
[["To", "see", "you", "once", "again,", "my", "love"]],
[["Overseas", "from", "coast", "to", "coast"]],
[["To", "find", "a", "place", "I", "love", "the", "most"]],
[["Where", "the", "fields", "are", "green"]],
[["To", "see", "you", "once", "again"]],
[["My", "love"]],
[[""]],
[["I", "try", "to", "read,", "I", "go", "to", "work"]],
[["I'm", "laughing", "with", "my", "friends"]],
[["But", "I", "can't", "stop", "to", "keep", "myself", "from", "thinking,", "oh,", "no"]],
[["I", "wonder", "how,", "I", "wonder", "why"]],
[["I", "wonder", "where", "they", "are"]],
[["The", "days", "we", "had,", "the", "songs", "we", "sang", "together,", "oh,", "yeah"]],
[[""]],
[["And", "oh,", "my", "love"]],
[["I'm", "holding", "on", "forever"]],
[["Reaching", "for", "the", "love", "that", "seems", "so", "far"]],
[[""]],
[["So,", "I", "say", "a", "little", "prayer"]],
[["And", "hope", "my", "dreams", "will", "take", "me", "there"]],
[["Where", "the", "skies", "are", "blue"]],
[["To", "see", "you", "l", "once", "again,", "my", "love"]],
[["Overseas", "from", "coast", "to", "coast"]],
[["To", "find", "a", "place", "I", "love", "the", "most"]],
[["Where", "the", "fields", "are", "green"]],
[["To", "see", "you", "once", "again"]],
[[""]],
[["To", "hold", "you", "in", "my", "arms"]],
[["To", "promise", "you", "my", "love"]],
[["To", "tell", "you", "from", "the", "heart"]],
[["You're", "all", "I'm", "thinking", "of"]],
[[""]],
[["I'm", "reaching", "for", "the", "love", "that", "seems", "so", "far"]],
[[""]],
[["So,", "I", "say", "a", "little", "prayer"]],
[["And", "hope", "my", "dreams", "will", "take", "me", "there"]],
[["Where", "the", "skies", "are", "blue"]],
[["To", "see", "you", "once", "again,", "my", "love"]],
[["Overseas", "from", "coast", "to", "coast"]],
[["To", "find", "the", "place", "I", "love", "the", "most"]],
[["Where", "the", "fields", "are", "green"]],
[["To", "see", "you", "once", "again"]],
[["(My", "love)"]],
[[""]],
[["Say", "a", "little", "prayer", "(My", "sweet", "love)"]],
[["Dreams", "will", "take", "me", "there"]],
[["Where", "the", "skies", "are", "blue", "(Woah,", "yeah)"]],
[["To", "see", "you", "once", "again"]],
[["Overseas", "from", "coast", "to", "coast"]],
[["To", "find", "the", "place", "I", "love", "the", "most"]],
[["Where", "the", "fields", "are", "green"]],
[["To", "see", "you", "once", "again"]],
[["My", "love"]],    
  ]
]

let DATA5 = [
  ["英文"],
  [
    [["Hiding", "from", "the", "rain", "and", "snow"]],
[["Trying", "to", "forget", "but", "I", "won't", "let", "go"]],
[["Looking", "at", "a", "crowded", "street"]],
[["Listening", "to", "my", "own", "heartbeat"]],
[[""]],
[["So", "many", "people", "all", "around", "the", "world"]],
[["Tell", "me", "where", "do", "I", "find", "someone", "like", "you,", "girl?"]],
[[""]],
[["Take", "me", "to", "your", "heart,", "take", "me", "to", "your", "soul"]],
[["Give", "me", "your", "hand", "before", "I'm", "old"]],
[["Show", "me", "what", "love", "is,", "haven't", "got", "a", "clue"]],
[["Show", "me", "that", "wonders", "can", "be", "true"]],
[["They", "say", "nothing", "lasts", "forever"]],
[["We're", "only", "here", "today"]],
[["Love", "is", "now", "or", "never"]],
[["Bring", "me", "far", "away"]],
[[""]],
[["Take", "me", "to", "your", "heart,", "take", "me", "to", "your", "soul"]],
[["Give", "me", "your", "hand", "and", "hold", "me"]],
[["Show", "me", "what", "love", "is,", "be", "my", "guiding", "star"]],
[["It's", "easy,", "take", "me", "to", "your", "heart"]],
[[""]],
[["Standing", "on", "a", "mountain", "high"]],
[["Looking", "at", "the", "moon", "through", "a", "clear", "blue", "sky"]],
[["I", "should", "go", "and", "see", "some", "friends"]],
[["But", "they", "don't", "really", "comprehend"]],
[[""]],
[["Don't", "need", "too", "much", "talking", "without", "saying", "anything"]],
[["All", "I", "need", "is", "someone", "who", "makes", "me", "wanna", "sing"]],
[[""]],
[["Take", "me", "to", "your", "heart,", "take", "me", "to", "your", "soul"]],
[["Give", "me", "your", "hand", "before", "I'm", "old"]],
[["Show", "me", "what", "love", "is,", "haven't", "got", "a", "clue"]],
[["Show", "me", "that", "wonders", "can", "be", "true"]],
[["They", "say", "nothing", "lasts", "forever"]],
[["We're", "only", "here", "today"]],
[["Love", "is", "now", "or", "never"]],
[["Bring", "me", "far", "away"]],
[[""]],
[["Take", "me", "to", "your", "heart,", "take", "me", "to", "your", "soul"]],
[["Give", "me", "your", "hand", "and", "hold", "me"]],
[["Show", "me", "what", "love", "is,", "be", "my", "guiding", "star"]],
[["It's", "easy,", "take", "me", "to", "your", "heart..."]],
[["(Take", "me,", "take", "me)"]],
[["Take", "me", "to", "your", "heart,", "take", "me", "to", "your", "soul"]],
[["Give", "me", "your", "hand", "and", "hold", "me"]],
[["Show", "me", "what", "love", "is,", "be", "my", "guiding", "star"]],
[["It's", "easy,", "take", "me", "to", "your", "heart"]],


  ]
]

//let DATASETS = [DATA3, DATA4, DATA5, DATA0, DATA1, DATA2];
let DATASETS = [DATA1, DATA4, DATA2, DATA3, DATA0, DATA5];

//let TITLES = [
//  "Let It Go", "My Love", "Take Me to Your Heart", "爱拼才会赢", "喜欢你", "上海滩"
//];

let TITLES = [
  "喜欢你", "My Love", "上海滩", "Let It Go", "爱拼才会赢", "Take Me to Your Heart"
];


let g_y_extent = 0;
function LoadData(idx) {
  g_lyric_serial = 1;
  let d = DATASETS[idx];
  g_dirty += 60;
  g_blocks = [];
  
  
  /*
  g_viewport_y = 0;
  g_viewport_vy = 0;
  g_viewport_drag_y = 0;
  g_viewport_drag_y_last = 0;
  g_viewport_x = 0;
  g_viewport_vx = 0;
  g_viewport_drag_x = 0;
  g_viewport_drag_x_last = 0;
  */
  
  const h = d[0], c = d[1];
  let y = 8;
  
  const btn_w = LYRIC_FONT_SIZE * 7;
  const btn_h = LYRIC_FONT_SIZE * 2.5
  
  // 海报 // 1210x1702
  {
    const scale = 0.4;
    const w = 1210*scale, h = 1702*scale;
    let p = new PosterButton(w, h, g_poster);
    p.pos.x = -w + 4;
    p.pos.y = 40;
    g_blocks.push(p);
    g_x_lb = p.pos.x-8;
    
    let b = new PushButton(480, 24, "本期（2020-11-08）歌曲接龙环节歌词板", undefined, 16);
    g_blocks.push(b);
    b.pos = new p5.Vector(8, 8);
    
    b = new PushButton(330, 24, "本期（2020-11-08）活动海报", undefined, 16);
    b.pos = new p5.Vector(-w+4, 8);
    g_blocks.push(b);
    
    // 链接
    b = new PushButton(400, 50, "报名链接（点此在新窗口中打开链接）：\nhttp://zgzg.link/2021-xcjc-signup", 
    function() {
      window.open("http://zgzg.link/2021-xcjc-signup", '_blank');
    },
    16);
    b.pos = new p5.Vector(-w+4, 40+p.h + 8);
    g_blocks.push(b);
    let dy = b.h;
    
    b = new PushButton(400, 50, "Zoom演唱平台链接：\nhttp://zgzg.link/2021-xcjc", 
                       function() {
                         window.open("http://zgzg.link/2021-xcjc", '_blank');
                       },
                       16);
    b.pos = new p5.Vector(-w+4, 40+p.h+64);
    g_blocks.push(b);
    
    
    let y = 920;
    
    p = new PosterButton(160, 160, g_zgzg_logo, function() {
      window.open("https://www.youtube.com/channel/UCY7-f7HBl8kvmoGtQX4TGUg", "_blank");
    });
    p.pos = new p5.Vector(-w+4, y);
    g_blocks.push(p);
    
    p = new PosterButton(160, 160, g_xcjc_logo);
    p.pos = new p5.Vector(-w+4+160+24, y);
    g_blocks.push(p);
    
    
    y += p.h+8;
    // 往期精彩节目
    b = new PushButton(440, 32, "往期回顾之《直通春晚歌手赛》回放", 
                       function() {},
                       16);
    b.pos = new p5.Vector(-w+4, y);
    g_blocks.push(b);
    b = new PushButton(440, 32, "初赛：https://www.youtube.com/watch?v=vkSOTyfWKKs", 
                       function() {
                         window.open("https://www.youtube.com/watch?v=vkSOTyfWKKs", '_blank');
                       },
                       16);
    b.pos = new p5.Vector(-w+4, y+40);
    g_blocks.push(b);
    b = new PushButton(440, 32, "决赛：https://www.youtube.com/watch?v=t0YGx-3OHFM", 
                       function() {
                         window.open("https://www.youtube.com/watch?v=t0YGx-3OHFM", '_blank');
                       },
                       16);
    b.pos = new p5.Vector(-w+4, y+80);
    g_blocks.push(b);
  }
  
  const btn_y = 40;
  // 顶端的几个按钮
  
  // 在微信中还是有 ghost touch 问题，所以只能出此下策
  if (false) {
    {
      let label = "<< 上一曲";
      if (idx <= 0) {
        label = ""
      }
      let b = new PushButton(btn_w, btn_h, label);
      b.pos = new p5.Vector(8, btn_y);
      if (idx > 0) {
        b.OnClick = function() {
          LoadData(idx-1);
          g_lyric_idx--;
        }
      }
      g_blocks.push(b);
    }

    {
      let label = "下一曲 >>";
      if (idx >= DATASETS.length - 1) {
        label = "";
      }
      let b = new PushButton(btn_w, btn_h, label);
      b.pos = new p5.Vector(16+btn_w, btn_y);
      if (idx < DATASETS.length - 1) {
        b.OnClick = function() {
          LoadData(idx+1);
          g_lyric_idx++;
        }
      }
      g_blocks.push(b);
    }
  } else {
    for (let i=0; i<6; i++) {
      let b = new PushButton(btn_h, btn_h, "曲目\n" + (i+1), undefined);
      b.pos = new p5.Vector(8+(btn_h+8)*i, btn_y);
      b.OnClick = function() {
        LoadData(i); g_lyric_idx = i;
      }
      g_blocks.push(b);
    }
  }
  
  let b1 = new PushButton(btn_w*3, btn_h, "曲目" + 
                          (idx + 1) + "/" + DATASETS.length + 
                          "：\n《" + TITLES[idx] + "》");
  b1.pos = new p5.Vector(8, LYRIC_FONT_SIZE*4+32);
  g_blocks.push(b1);
  
  const btn_zoom_w = LYRIC_FONT_SIZE * 3;
  const btn_zoomin_x = btn_w*2 + 96;
  const btn_zoomout_x = btn_zoomin_x + btn_zoom_w + 8;
  
  // Zoom out and zoom in
  {
    if (LYRIC_FONT_SIZE < 40) {
      let b = new PushButton(btn_zoom_w, btn_zoom_w, "放大\n字号", 24);
      b.pos = new p5.Vector(btn_zoomin_x, btn_y);
      b.x0 = btn_zoomin_x; b.y0 = 8;
      //b.is_fixed_position = true;
      b.OnClick = function() {
        LYRIC_FONT_SIZE += 4;
        LoadData(idx);
      }
      g_blocks.push(b);
    }
    
    if (LYRIC_FONT_SIZE > 12) {
      b = new PushButton(btn_zoom_w, btn_zoom_w, "缩小\n字号", 24);
      b.pos = new p5.Vector(btn_zoomout_x, btn_y);
      b.x0 = btn_zoomout_x; b.y0 = 8;
      //b.is_fixed_position = true;
      b.OnClick = function() {
        LYRIC_FONT_SIZE -= 4;
        LoadData(idx);
      }
      g_blocks.push(b);
    }
    
    b = new PushButton(btn_zoom_w*2, btn_zoom_w, "神奇摇摆按钮😬\n（并没有实际作用）", undefined, 12);
    b.pos = new p5.Vector(btn_zoomout_x, btn_y);
    b.x0 = btn_zoomout_x + btn_zoom_w*4 + 8; b.y0 = 8;
    b.pos.x = b.x0;
    //b.is_fixed_position = true;
    b.OnClick = function() {
      MysteryButton();
    }
    g_blocks.push(b);
    
    b = new PushButton(btn_zoom_w*2, btn_zoom_w/2, "开关背景图案", undefined, 12);
    b.pos = new p5.Vector(btn_zoomout_x, btn_y + btn_zoom_w/2 + 48);
    b.x0 = btn_zoomout_x + btn_zoom_w*4 + 8; b.y0 = 8;
    b.pos.x = b.x0;
    //b.is_fixed_position = true;
    b.OnClick = function() {
      g_use_background = !g_use_background;
    }
    g_blocks.push(b);
  }
  
  y = y + LYRIC_FONT_SIZE*8;
  g_x_extent = 0;
  
  const NF = h.length;
  for (let j=0; j<c.length; j++) {
    let b;
    if (j == 0) {
      b = new LyricBlock(h, c[j], NF);
    } else { b = new LyricBlock(undefined, c[j], NF); }
    b.pos.y = y
    y += b.g.height;
    g_blocks.push(b);
    g_y_extent = max(g_y_extent, b.pos.y);
    
    g_x_extent = max(g_x_extent, b.g.width);
    
    //
    // comments
    push();
    if (c[j].length > NF) {
      const cmt = c[j][NF][0];
      const fs = LYRIC_FONT_SIZE * 0.6;
      textSize(fs);
      const w = textWidth(cmt);
      let cmtb = new PushButton(w+16, fs*2, cmt, undefined, fs);
      cmtb.pos = new p5.Vector(b.pos.x + b.w + 16, b.pos.y + PAD_V);
      g_blocks.push(cmtb);
    }
    pop();
  }
  
  // 设置这个按钮是因为微信浏览器不能上滑
  b = new PushButton(212, 38, "点这里回到顶部", function() {
    g_viewport_y = 0;
    g_viewport_vy = 0;
    g_viewport_x = 0;
    g_viewport_vx = 0;
  }, 20);
  b.bottom_margin = b.h + 8;
  b.right_margin = b.w + 8;
  b.pos = new p5.Vector(8, height-32);
  g_goto_top = b;
  g_blocks.push(b);
}

function preload() {
  g_poster = loadImage("XCJC20201108.png");
  g_zgzg_logo = loadImage("zgzg_logo.jpg");
  g_xcjc_logo = loadImage("xcjc.png");
  g_xcjc_logo_2 = loadImage("xcjc_logo_2.png");
}

function setup() {
  createCanvas(720, 480);
  LoadData(g_lyric_idx);
}

function ShouldRedraw() {
  if (g_dirty > 0) { return true; }
  if (g_viewport_y != g_viewport_y_last) { return true; }
  if (g_frame_count <= 1) return true;
  return false;
}

let g_flags = [0, 0, 0, 0];
let g_viewport_y = 0, g_viewport_y_last = 0;
let g_viewport_drag_y = 0, g_viewport_drag_y_last = 0, g_viewport_drag_y_ms = 0;
let g_viewport_vy = 0;
let g_viewport_x = -700, g_viewport_x_last = 0;
let g_viewport_drag_x = 0, g_viewport_drag_x_last = 0, g_viewport_drag_x_ms = 0;
let g_viewport_vx = 0;
let g_last_millis = 0;
let g_frame_count = 0;
let g_x_extent = 0, g_x_lb = 0;

let g_bg_dx = 0, g_bg_dy = 0;

function drawBG() {
  
  const W = 462/2, H = 460/2;
  const W_STEP = Math.floor(width / W) * W * 2;
  const H_STEP = Math.floor(height / H) * H * 2;
  
  let x_lb = g_bg_dx - Math.floor(g_bg_dx / W_STEP) * W_STEP - W_STEP;
  let y_lb = g_bg_dy - Math.floor(g_bg_dy / H_STEP)* H_STEP  - H_STEP;
  
  let w = width, h = height;
  const rs = GetRotAndScale();
  if (rs[0] != 0) {
    w *= 2; h *= 2;
  }
  
  push();
  fill(250);
  noStroke();
  for (let x=x_lb, i=0; x<w; x+=W, i++) {
    for (let y=y_lb, j=0; y<h; y+=H, j++) {
      if ((i+j)%2 == 0) {
        //rect(x, y, W, H);
        image(g_xcjc_logo_2, x, y, W, H);
      }
    }
  }
  pop();
}

function draw() {
  const ms = millis();
  g_viewport_y_last = (g_viewport_y + g_viewport_drag_y);
  if (g_frame_count > 0) {
    const delta_ms = ms - g_last_millis;
    g_viewport_x += g_flags[0] * delta_ms / 5;
    g_viewport_y += g_flags[1] * delta_ms / 5;
    g_viewport_y += g_viewport_vy * 16 / delta_ms;
    g_viewport_x += g_viewport_vx * 16 / delta_ms;
    
    const ease = pow(0.95, delta_ms / 16);
    const ease2 = pow(0.9, delta_ms / 16);
    g_viewport_vy *= ease2;
    g_viewport_vx *= ease2;
    
    if (g_viewport_y < 0) {
      g_viewport_y = lerp(0, g_viewport_y, ease);
    } else if (g_viewport_y > g_y_extent) {
      g_viewport_y = lerp(g_y_extent, g_viewport_y, ease);
    }
    
    if (g_viewport_x < g_x_lb) {
      g_viewport_x = lerp(g_x_lb, g_viewport_x, ease);
    } else if (g_viewport_x > g_x_extent) {
      g_viewport_x = lerp(g_x_extent, g_viewport_x, ease);
    }
    
  }
  g_frame_count ++;
  g_last_millis = ms;
  
  if (g_frame_count == 1 || (g_frame_count % 60 == 0)) {
    OnWindowResize();
  }
  
  // 是否启用“回到顶部”按钮
  if (g_viewport_y > LYRIC_FONT_SIZE*10) {
    g_goto_top.is_enabled = true;
  } else { g_goto_top.is_enabled = false; }
  
  let should_redraw = ShouldRedraw();
  
  // Hover 会影响 should_redraw
  should_redraw |= UpdateHover();
  should_redraw |= g_use_background;
  
  // 固定位置的按钮
  g_blocks.forEach((b) => {
    if (b.is_fixed_position) {
      b.pos.x = g_viewport_x + g_viewport_drag_x + b.x0;
      b.pos.y = g_viewport_y + g_viewport_drag_y + b.y0;
    }
    if (b.bottom_margin != undefined) {
      b.pos.y = height - b.bottom_margin + g_viewport_y + g_viewport_drag_y;
    }
    if (b.left_margin != undefined) {
      b.pos.x = b.left_margin + g_viewport_x + g_viewport_drag_x;
    }
    if (b.right_margin != undefined) {
      b.pos.x = width - b.right_margin + g_viewport_x + g_viewport_drag_x; 
    }
  });
  
  // 如果画面没有变化就不重画了
  if (should_redraw) {
    background(240);
    
    push();
    const rs = GetRotAndScale();
    if (rs[0] != 0) {
      rotate(rs[0]);
      scale(rs[1]);
    }
    if (g_use_background) {
      // 视差效果！
      g_bg_dx = -(g_viewport_x + g_viewport_drag_x) * 0.666;
      g_bg_dy = -(g_viewport_y + g_viewport_drag_y) * 0.666;
      drawBG();
    }
    
    pop();
    
    push();
    
    translate(-g_viewport_x-g_viewport_drag_x, -g_viewport_y-g_viewport_drag_y);
    if (rs[0] != 0) {
      rotate(rs[0]);
      scale(rs[1]);
    }
    

    g_blocks.forEach((b) => {
      b.Render()
    });
    pop();
    
    g_dirty --;
    if (g_dirty < 0) g_dirty = 0;
  }
  
  if (MY_DEBUG) {
    let txt = "g_last_mouse_pos:" + parseInt(g_last_mouse_pos[0]) +
              "," + parseInt(g_last_mouse_pos[1]);
    txt = txt + " pointer:" + parseInt(g_pointer_x) + "," + parseInt(g_pointer_y);
    txt = txt + " should_redraw:" + should_redraw;
    txt = txt + " vp_y:" + Math.floor(g_viewport_y) + "+" + Math.floor(g_viewport_drag_y) + ", v=" + Math.floor(g_viewport_vy);
    txt = txt + " ts:" + g_touch_state + ", lyric_idx:" + g_lyric_idx;
    textAlign(LEFT, TOP);
    text(txt, 0, 0);
  }
}

function UpdateHover() {
  let ret = false;
  g_hovered_block = undefined;
  g_blocks.forEach((b) => {
    if (b.IsMouseOver(g_pointer_x + g_viewport_drag_x,
                      g_pointer_y + g_viewport_drag_y)) {
      //if (g_touch_state == undefined) { //
        b.is_hovered = true;
        g_hovered_block = b;
      //}
      ret = true;
    } else {
      b.is_hovered = false;
    }
  })
  return ret;
}

function keyPressed() {
  if (keyCode == UP_ARROW || key == 'k') { g_flags[0] = -1;
  } else if (keyCode == DOWN_ARROW || key == 'j') { g_flags[0] = 1;
  } else if (key == ' ') { MysteryButton(); }
}

function keyReleased() {
  if (keyCode == UP_ARROW || key == 'k') { g_flags[0] = 0;
  } else if (keyCode == DOWN_ARROW || key == 'j') { g_flags[0] = 0;
  }
}

// 触摸事件的巨坑开始

// 很拙劣的消除抖动的方法 
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
    
    
  } else if (event instanceof MouseEvent && g_touch_state == undefined) {
    if (millis() - g_prev_touch_millis > DEBOUNCE_THRESH) {
      g_touch_state = "mouse";
      g_pointer_x = mouseX;
      g_pointer_y = mouseY;
      
      if (g_hovered_block != undefined) {
        if (g_hovered_block.OnClick != undefined) {
          g_hovered_block.OnClick();
          g_dirty += 2;
        }
      }
  
      g_viewport_drag_y_last = 0; g_viewport_drag_x_last = 0;
      g_viewport_drag_y = 0; g_viewport_drag_x = 0;
      g_viewport_drag_y_ms = g_viewport_drag_x_ms = millis();
    } else return;
  } else return;
  
  g_last_mouse_pos = [g_pointer_x, g_pointer_y];
}

function touchStarted(event) {
  TouchOrMouseStarted(event);
}

function mousePressed(event) {
  TouchOrMouseStarted(event);
}

function InertiaMove() {
  // 放手
  // Y
  const delta_ms = g_prev_touch_millis - g_viewport_drag_y_ms;
  let diff = g_viewport_drag_y - g_viewport_drag_y_last;
  if (abs(diff) > 3) {
    g_viewport_vy = (g_viewport_drag_y - g_viewport_drag_y_last);
    //if (delta_ms > 1) { g_viewport_vy *= 16 / delta_ms }
  }
  g_viewport_y = g_viewport_y + g_viewport_drag_y;
  g_viewport_drag_y = 0;
  g_viewport_drag_y_last = 0;
  
  // X
  diff = g_viewport_drag_x - g_viewport_drag_x_last;
  if (abs(diff) > 3) {
    g_viewport_vx = (g_viewport_drag_x - g_viewport_drag_x_last);
    //if (delta_ms > 1) { g_viewport_vy *= 16 / delta_ms }
  }
  g_viewport_x = g_viewport_x + g_viewport_drag_x;
  g_viewport_drag_x = 0;
  g_viewport_drag_x_last = 0;
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
          InertiaMove();
          
          if (g_hovered_block != undefined) {
            const TOUCH_DIST_SQ_THRESH = 88;
            const dx = g_pointer_x - g_last_mouse_pos[0];
            const dy = g_pointer_y - g_last_mouse_pos[1];
            if (dx*dx + dy*dy <= TOUCH_DIST_SQ_THRESH) {
              if (g_hovered_block.OnClick != undefined) {
                g_hovered_block.OnClick();
                g_dirty += 2;
              }
            }
          }
        }
      }
    }
  } else if (event instanceof MouseEvent) {
    if (g_touch_state == "mouse") {
      g_touch_state = undefined;
      g_pointer_x = mouseX; g_pointer_y = mouseY;
      g_prev_touch_millis = millis();
      InertiaMove();
    }
  }
}

function touchEnded(event) {
  TouchOrMouseEnded(event);
}
function mouseReleased(event) {
  TouchOrMouseEnded(event);
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
    }
  }
}

function touchMoved(event) {
  TouchOrMouseMoved(event);
}

function mouseMoved() {
  TouchOrMouseMoved(event);
}

let g_rot_end_millis = 0;
let g_rot_duration = 2333;
function GetRotAndScale() {
  const ms = millis();
  if (ms > g_rot_end_millis) return [0, 1];
  else {
    const c = 1 - (g_rot_end_millis - ms) / g_rot_duration;
    let s = 1-0.5*sin(2*PI*c);
    let r = PI/8*sin(6*PI*c);
    return [r, s];
  }
}

function MysteryButton() {
  g_rot_end_millis = millis() + g_rot_duration;
}