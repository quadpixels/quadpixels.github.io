// 2020-10-04
// zgzg想唱就唱第二季第三期
// 唱歌接龙环节所用

// TODO: 显示当前指针

const NOTE_H = 50;
const PREFIX = ["C","#C","D","#D","E","F","#F","G","#G","A","#A","B"];

let g_fc;
let g_fc_scale;

let g_data_idx = 0;
let g_line_idx = 0;
let g_dy = 0;
let g_dy_target = 0;
let g_dx = 0;
let g_dx_target = 0;
let g_flags = [0];
let g_txt_dy = 0;
const TXT_LINE_HEIGHT = 40;

// 新贵妃醉酒
let DATA0 = [
  [ "那,一,年,的,雪,花,飘,落,梅,花,开,枝,头",
    "#D4,#D4,#D4,#D4,D4,#D4,D4,#A3,C4,#A3,#A3,C4,G3"],
  [ "那, 一, 年, 的, 华, 清,池,旁,留,下,太,多,愁",
    "#D4,#D4,#D4,#D4,D4,#D4,D4,#A3,C4,G4,G4,#A3,C4"],
  [ "不,要,说,x,谁,是,谁,非,感,情,错,与,对,-",
    "#D4,#D4,#D4,X,D4,#D4,D4,#A3,C4,#A3,#A3,C4,G3,F3"],
  [ "只,想,梦,里,与,你,一,起,,再,醉,一,-,回",
    "#D3,#D3,#D3,#D4,D4,#D4,D4,#A3,X,C4,D4,C4,D4,#D4" ],
  [ "爱,恨,就,在,一,瞬,-,间,-",
    "G4,#A4,C5,#D5,D5,#A4,D5,D5,C5"],
  [ "举,杯,明,月,情,似,-,天,-",
    "G4,#A4,C5,#D5,C5,F4,#A4,#A4,G4"],
  [ "爱,恨,两,-,茫,-,-,茫,-,-",
    "C5,G5,F5,D5,C5,#D5,C5,#A4,G4,#A4"],
  [ "问,君,何,-,时,-,恋,-",
    "G4,F5,#D5,C5,#A4,#D5,#D5,C5"],
  [ "金,雀,钗,玉,搔,头,是,你,给,我,的,礼,物",
    "#D4,#D4,#D4,D4,D4,C4,#A3,#A3,C4,#A3,#A3,C4,G3"],
  [ "霓,裳,羽,衣,曲,几,番,轮,回,为,你,歌,舞",
    "#D4,#D4,#D4,#D4,#D4,D4,#D4,D4,#A3,C4,G4,#A3,C4"],
  [ "剑,门,关,是,你,对,我,深,深,的,思,念,-",
    "#D4,#D4,#D4,D4,#D4,D4,#A3,C4,#A3,#A3,C4,G3,F3"],
  [ "马,嵬,坡,下,愿,为,真,爱,,魂,断,红,-,-,颜",
    "#D3,#D3,#D3,#D4,D4,#D4,D4,#A3,X,C4,D4,C4,D4,#D4,F4" ],
  [ "菊,花,台,倒,映,明,-,月,-",
    "G4,#A4,C5,#D5,D5,#A4,D5,D5,C5"],
  [ "谁,知,吾,爱,心,中,-,寒,-",
    "G4,#A4,C5,#D5,C5,F4,#A4,#A4,G4"],
  [ "醉,在,君,-,王,-,-,怀,-,-",
    "C5,G5,F5,D5,C5,#D5,C5,#A4,G4,#A4"],
  [ "梦,回,大,-,唐,-,爱,-",
    "G4,F5,#D5,C5,#A4,#D5,#D5,C5"],
  [ "爱,恨,就,在,一,瞬,-,间,-",
    "G4,#A4,C5,#D5,D5,#A4,D5,D5,C5"],
  [ "举,杯,明,月,情,似,-,天,-",
    "G4,#A4,C5,#D5,C5,F4,#A4,#A4,G4"],
  [ "爱,恨,两,-,茫,-,-,茫,-,-",
    "C5,G5,F5,D5,C5,#D5,C5,#A4,G4,#A4"],
  [ "问,君,何,-,时,-,恋,-",
    "G4,F5,#D5,C5,#A4,#D5,#D5,C5"],
  [ "菊,花,台,倒,映,明,-,月,-",
    "G4,#A4,C5,#D5,D5,#A4,D5,D5,C5"],
  [ "谁,知,吾,爱,心,中,-,寒,-",
    "G4,#A4,C5,#D5,C5,F4,#A4,#A4,G4"],
  [ "醉,在,君,-,王,-,-,怀,-,-",
    "C5,G5,F5,D5,C5,#D5,C5,#A4,G4,#A4"],
  [ "梦,回,大,-,唐,-,爱,- (End)",
    "G4,F5,#D5,C5,#A4,#D5,#D5,C5"],
]

// 芒种
let DATA1 = [
  [ "一,想,到,你,我,就,wu,-,-,-",
    "C5,#G4,#A4,F4,F4,F4,#D5,#D5,#D5,C5"],
  [ "空,恨,别,夢\n梦,久,x,wu,-,-,-",
    "F4,G4,#G4,F4,#D4,X,#D4,#D5,F4,#G4"],
  [ "焼\n烧,去,紙\n纸,灰,埋,x,煙\n烟,x,柳",
    "#A4,#A4,#A4,#G4,C5,X,#G4,X,F4"],
  [ "（前奏）", "C5" ],
  [ "於\n于,鲜,活,的,枝,丫,_,凋,零,下,的,無\n无,瑕", 
    "C4,C4,#A3,C4,#A3,C4,X,#C4,#C4,#G3,#C4,#D4,#C4"],
  [ "是,收,穫\n获,謎\n谜,底,的,代,價\n价", "#D4,#D4,F4,#D4,#D4,#D4,C4,#A3"],
  [ "餘\n余,暉\n晖,沾,上,_,遠\n远,行,人,的,髪\n发", "#A3,#A3,#G3,C4,X,C4,#A3,C4,#A3,C4" ],
  [ "他, 洒, 下, 手, 中, 牵, 挂,-,-,_,于,桥,-,下",
    "#C4,#C4,#G3,#C4,#G4,#G4,G4,F4,#D4,X,#G3,F4,#D4,#D4" ],
  [ "前,世,遲\n迟,来,者,-,-,-, ,掌,心,刻,-,-",
     "F4,F4,F4,#G4,F4,#D4,F4,C5,X,F4,#D4,F4,#D4,#D5"],
  [ "你,眼,中,煙\n烟,波,滴,落,一,滴,墨,_,wo,-,-,-,-",
    "#D4,#D4,#D4,C5,#G4,#G4,#G4,#G4,#D4,#D4,X,#A4,#G4,G4,#G4,G4"],
  [ "若,佛,說\n说,-,-,,放,下,執\n执,著",
    "F4,#D4,F4,#D4,C5,X,#D5,F5,#D5,#A4"],
  [ "我,怎,能,波,瀾\n澜,不,驚\n惊, ,去,附,-,和",
    "#D4,#D4,#D4,C5,#G4,#G4,#D4,X,#D4,C5,#A4,#A4"],
  [ "一,想,到,你,我,就,wu,-,-,-",
    "C5,#G4,#A4,F4,F4,F4,#D5,#D5,#D5,C5"],
  [ "恨,情,不,壽\n寿,總\n总,於\n于,苦,海,囚,_,wu,-,-,-",
    "#A4,#A4,#G4,#A4,#A4,#G4,#A4,C5,#D4,X,#D4,#D5,F4,#G4",],
  ["新,翠,徒,留,落,花,影,中,游,_,wu,-,-,-",
    "#A4,#A4,#G4,#A4,#A4,#G4,C5,#G4,F4,X,F4,#D5,#D5,C5"],
  [ "相,思,無\n无,用,才,笑,山,盟,舊\n旧,_,wu,-,-,-,-",
    "#D5,#D5,C5,#D5,#D5,C5,#D5,C5,#G4,X,#D4,F5,#D5,C5,#D5"],
  [ "謂\n谓,我,何,求", "C5,#G4,#G4,F4"],
  [ "謂\n谓,我,何,求", "C5,#G4,#G4,F4"],
  [ "種\n种,一,万,朵,蓮\n莲,花,_,在,衆\n众,生,中,發\n发,芽", 
    "C4,C4,#A3,C4,#A3,C4,X,#C4,#C4,#G3,#C4,#D4,#C4"],
  [ "等,紅\n红,塵\n尘,一,萬\n万,种,解,答", "#D4,#D4,F4,#D4,#D4,#D4,C4,#A3"],
  [ "念,珠,落,進\n进,_,時\n时,間\n间,的,泥,沙", "#A3,#A3,#G3,C4,X,C4,#A3,C4,#A3,C4" ],
  [ "待, 割,捨\n舍,詮\n诠,釋\n释,慈,悲,-,-,_,的,讀\n读,-,法",
    "#C4,#C4,#G3,#C4,#G4,#G4,G4,F4,#D4,X,#G3,F4,#D4,#D4" ],
  [ "前,世,遲\n迟,来,者,-,-,-, ,掌,心,刻,-,-",
     "F4,F4,F4,#G4,F4,#D4,F4,C5,X,F4,#D4,F4,#D4,#D5"],
  [ "你,眼,中,煙\n烟,波,滴,落,一,滴,墨,_,wo,-,-,-,-",
    "#D4,#D4,#D4,C5,#G4,#G4,#G4,#G4,#D4,#D4,X,#A4,#G4,G4,#G4,G4"],
  [ "若,佛,說\n说,-,-,,放,下,執\n执,著",
    "F4,#D4,F4,#D4,C5,X,#D5,F5,#D5,#A4"],
  [ "我,怎,能,波,瀾\n澜,不,驚\n惊, ,去,附,-,和",
    "#D4,#D4,#D4,C5,#G4,#G4,#D4,X,#D4,C5,#A4,#A4"],
  [ "一,想,到,你,我,就,wu,-,-,-",
    "C5,#G4,#A4,F4,F4,F4,#D5,#D5,#D5,C5"],
  [ "恨,情,不,壽\n寿,總\n总,於\n于,苦,海,囚,_,wu,-,-,-",
    "#A4,#A4,#G4,#A4,#A4,#G4,#A4,C5,#D4,X,#D4,#D5,F4,#G4",],
  ["新,翠,徒,留,落,花,影,中,游,_,wu,-,-,-",
    "#A4,#A4,#G4,#A4,#A4,#G4,C5,#G4,F4,X,F4,#D5,#D5,C5"],
  [ "相,思,無\n无,用,才,笑,山,盟,舊\n旧,_,wu,-,-,-,-",
    "#D5,#D5,C5,#D5,#D5,C5,#D5,C5,#G4,X,#D4,F5,#D5,C5,#D5"],
  [ "謂\n谓,我,何,求", "C5,#G4,#G4,F4"],
  [ "謂\n谓,我,何,求 (end)", "C5,#G4,#G4,F4"],
  
]
// 醉赤壁
let DATA2 = [
  ["落,葉\n叶,堆,積\n积,了,好,幾\n几,層\n层", "#F3,B3,#A3,B3,#C4,#D4,B3,E4"],
  ["而,我,踩,過\n过,青,春,_,聽\n听,見\n见", "B3,#A3,#G3,#A3,#C4,#D4,X,#A3,B3"],
  ["前,世,誰\n谁,在,淚\n泪,語\n语,紛\n纷,-,紛\n纷", "#D4,B3,B3,#G3,#G3,E3,#D4,#C4,#C4"],
  ["一,次,緣\n缘,分,結\n结,一,次,繩\n绳", "#F3,B3,#A3,B3,#C4,#D4,B3,E4"],
  ["我,今,生,還\n还,在,等,_,一,世", "B3,#A3,#G3,#A3,#C4,#F4,X,#A3,B3"],
  ["就,只,能,有,一,次,的,認\n认,真", "#G3,#D4,#C4,B3,#D4,#C4,B3,#A3,B3"],
  ["確\n确,認\n认,過\n过,眼,神,_,我,遇,上,對\n对,的,人", "C4,#A3,#G3,#D3,F3,X,#G3,G3,#G3,#A3,G3,#D3"],
  ["我,揮\n挥,劍\n剑,轉\n转,身,_,而,鮮\n鲜,血,如,紅\n红,唇", "C4,#A3,#G3,#D3,F3,X,#D4,F4,#D4,C4,#A3,C4"],
  ["前,朝,記\n记,憶\n忆,渡,红,塵\n尘", "#A3,C4,#D4,F4,#D4,#G3,#A3"],
  ["傷\n伤,人,的,不,是,刀,刃", "#A3,C4,#D4,F4,#D4,G3,#G3"],
  ["是,你,轉\n转,世,而,來\n来,的,魂","F3,#C4,C4,#C4,#D4,C4,#G3,#A3"],
  ["確\n确,認\n认,過\n过,眼,神,_,我,遇,上,對\n对,的,人", "C4,#A3,#G3,#D3,F3,X,#G3,G3,#G3,#A3,G3,#D3"],
  ["我,策,馬\n马,出,征,_,馬\n马,蹄,聲\n声,如,淚\n泪,奔", "C4,#A3,#G3,#D3,F3,X,#D4,F4,#D4,C4,#A3,C4"],
  ["青,石,板,上,的,月,光,照,進\n进,這\n这,山,城","#D4,#G4,G4,G4,F4,F4,#D4,C4,#A3,#D4,C4,#G4"],
  ["我,一,路,的,跟,_,你,輪\n轮,回,聲\n声","C4,#C4,C4,#A3,C4,X,#D4,C4,#A3,C4"],
  ["我,對\n对,你,用,情,極\n极,-,深","F3,G3,#G3,#D4,C4,#A3,#G3,#G3"],
  ["（间奏）","C3"],
  ["洛,陽\n阳,城,旁,的,老,樹\n树,根", "#F3,B3,#A3,B3,#C4,#D4,B3,E4"],
  ["像,回,憶\n忆,般,延,伸,_,你,問\n问", "B3,#A3,#G3,#A3,#C4,#D4,X,#A3,B3"],
  ["經\n经,過\n过,是,誰\n谁,的,心,跳,-,聲\n声", "#D4,B3,B3,#G3,#G3,E3,#D4,#C4,#C4"],
  ["我,拿,醇,酒,一,罈\n坛,飲\n饮,恨", "B3,B3,#A3,B3,#C4,#D4,B3,E4"],
  ["妳\n你,那,千,年,眼,神,_,是,我", "B3,#A3,#G3,#A3,#C4,#F4,X,#A3,B3"],
  ["醉,醉,墜\n坠,-,入,赤,壁,的,傷\n伤,痕,-", "#G3,#D4,#C4,B3,B3,#D4,#C4,B3,#C4,#C4,B3"],
  ["確\n确,認\n认,過\n过,眼,神,_,我,遇,上,對\n对,的,人", "C4,#A3,#G3,#D3,F3,X,#G3,G3,#G3,#A3,G3,#D3"],
  ["我,揮\n挥,劍\n剑,轉\n转,身,_,而,鮮\n鲜,血,如,紅\n红,唇", "C4,#A3,#G3,#D3,F3,X,#D4,F4,#D4,C4,#A3,C4"],
  ["前,朝,記\n记,憶\n忆,渡,红,塵\n尘", "#A3,C4,#D4,F4,#D4,#G3,#A3"],
  ["傷\n伤,人,的,不,是,刀,刃", "#A3,C4,#D4,F4,#D4,G3,#G3"],
  ["是,你,轉\n转,世,而,來\n来,的,魂","F3,#C4,C4,#C4,#D4,C4,#G3,#A3"],
  ["確\n确,認\n认,過\n过,眼,神,_,我,遇,上,對\n对,的,人", "C4,#A3,#G3,#D3,F3,X,#G3,G3,#G3,#A3,G3,#D3"],
  ["我,策,馬\n马,出,征,_,馬,蹄,聲\n声,如,淚\n泪,奔", "C4,#A3,#G3,#D3,F3,X,#D4,F4,#D4,C4,#A3,C4"],
  ["青,石,板,上,的,月,光,照,進\n进,這\n这,山,城","#D4,#G4,G4,G4,F4,F4,#D4,C4,#A3,#D4,C4,#G4"],
  ["我,一,路,的,跟,_,你,輪\n轮,回,聲\n声","C4,#C4,C4,#A3,C4,X,#D4,C4,#A3,C4"],
  ["我,對\n对,你,用,情,極\n极,-,深","F3,G3,#G3,#D4,C4,#A3,#G3,#G3"],
  ["確\n确,認\n认,過\n过,眼,神,_,我,遇,上,對\n对,的,人", "D4,C4,#A3,F3,G3,X,#A3,A3,#A3,C4,F3,D4"],
  ["我,策,馬\n马,出,征,_,馬\n马,蹄,聲\n声,如,淚\n泪,奔,-,-", "D4,C4,#A3,F3,G3,X,#F4,G4,F4,D4,F4,G4,F4,D4"],
  ["青,石,板,上,的,月,光,照,進\n进,這\n这,山,城,-","F4,#A4,A4,A4,G4,G4,F4,D4,C4,D5,C5,C5,#A4"],
  ["我,一,路,的,跟,_,你,輪\n轮,回,聲\n声","D4,#D4,D4,C4,D4,X,F4,D4,C4,D4"],
  ["我,對\n对,你,用,情,極\n极,-,深","G4,F4,F4,#A3,D4,C4,#A3,#A3"],
  ["我,一,路,的,跟,_,你,輪\n轮,回,聲\n声","D4,#D4,D4,C4,D4,X,F4,D4,C4,D4"],
  ["我,對\n对,你,用,情,極\n极,-,深(end)","G3,A3,#A3,#A3,F4,D4,C4,#A3"],
]

// 青花瓷
let DATA3 = [
  ["素,胚,勾,勒,出,青,花,筆\n笔,鋒\n锋,濃\n浓,轉\n转,淡",
    "B3,A3,#F3,A3,A3,#F3,A3,A3,#F3,A3,#F3,E3"],
  ["瓶,身,描,繪\n绘,的,牡,丹,一,如,你,初,妝\n妆",
    "B3,A3,#F3,A3,A3,#F3,A3,A3,#C4,B4,A3,A3"],
  ["冉,冉,檀,香,透,過\n过,窗,心,事,我,了,-,然",
   "E3,#F3,#C4,#C4,#C4,B3,#C4,#C4,B3,#C4,E4,#C4,#C4"],
  ["宣,紙,上,走,筆,此,擱,一,半,-",
   "#C4,#C4,#C4,B3,B3,B3,B3,A3,#C4,B3"],
  ["釉,色,渲,染,仕,女,圖\n图,韻\n韵,味,被,私,藏",
    "B3,A3,#F3,A3,A3,#F3,A3,A3,#F3,A3,#F3,E3"],
  ["而,妳\n你,嫣,然,的,一,笑,如,含,苞,待,放",
   "E3,A3,#C4,E4,E4,#C4,E4,E4,#C4,B3,A3,A3"],
  ["妳,的,美,一,縷\n缕,飄\n飘,-,散",
   "B3,A3,B3,#C4,B3,B3,A3,B3"],
  ["去,到,我,去,不,了,的,地,方",
   "A3,#F3,B3,A3,A3,#F3,A3,A3,A3"],
  ["天,青,色,等,煙,雨,_,而,我,在,等,你",
   "E4,E4,#C4,B3,#C4,#F3,X,B3,#C4,E4,#C4,B3"],
  ["炊,煙\n烟,裊\n袅,裊\n袅,升,起,_,隔,江,千,萬\n万,里",
   "E4,E4,#C4,B3,#C4,#F3,X,B3,#C4,E4,B3,A3"],
  ["在,瓶,底,書,漢,隸,仿,前,朝,的,飄,逸",
   "A3,B3,#C4,E4,#F4,E4,#C4,E4,#C4,#C4,B3,B3"],
  ["就,當,我,為,遇,見,妳,伏,-,筆",
   "A3,B3,A3,B3,A3,B3,#C4,E4,#C4,#C4"],
  ["天,青,色,等,煙,雨,_,而,我,在,等,你",
   "E4,E4,#C4,B3,#C4,#F3,X,B3,#C4,E4,#C4,B3"],
  ["月,色,被,打,撈\n捞,起,_,暈\n晕,開\n开,了,結\n结,局",
   "E4,E4,#C4,B3,#C4,#F3,X,B3,#C4,E4,B3,A3"],
  ["如,傳\n传,世,的,青,花,瓷,自,顧\n顾,自,美,麗\n丽",
   "A3,B3,#C4,E4,#F4,E4,#C4,E4,#C4,#C4,B3,B3"],
  ["妳\n你,眼,帶\n带,笑,意",
   "E3,#C4,B3,B3,A3"],
  ["色,白,花,青,的,錦\n锦,鯉\n鲤,躍\n跃,然,於\n于,碗,底",
    "B3,A3,#F3,A3,A3,#F3,A3,A3,#F3,A3,#F3,E3"],
  ["臨\n临,摹,宋,體\n体,落,款,時\n时,卻\n却,惦,記\n记,着,妳\n你",
    "B3,A3,#F3,A3,A3,#F3,A3,A3,#C4,B3,A3,A3"],
  ["你,隱\n隐,藏,在,窯\n窑,燒\n烧,裡\n里,千,年,的,秘,-,密",
   "E3,#F3,#C4,#C4,#C4,B3,#C4,#C4,B3,#C4,E4,#C4,#C4"],
  ["極\n极,細\n细,膩\n腻,猶\n犹,如,繡\n绣,花,針,落,地,-",
   "#C4,#C4,#C4,B3,B3,B3,B3,B3,A3,#C4,B3"],
  ["簾\n帘,外,芭,蕉,惹,驟\n骤,雨,門\n门,環\n环,惹,銅\n铜,綠\n绿",
   "B3,A3,#F3,A3,A3,#F3,A3,A3,#F3,A3,#F3,E3"],
  ["而,我,路,過\n过,那,江,南,小,鎮\n镇,惹,了,妳\n你",
   "E3,A3,#C4,E4,E4,#C4,E4,E4,#C4,B3,A3,A3"],
  ["在,潑\n泼,墨,山,水,畫\n画,-,裡\n里",
   "B3,A3,B3,#C4,B3,B3,A3,B3"],
  ["妳\n你,從\n从,墨,色,深,處\n处,被,隱\n隐,去",
   "A3,#F3,B3,A3,A3,#F3,A3,A3,A3"],
  ["天,青,色,等,煙\n烟,雨,_,而,我,在,等,你",
   "F4,F4,D4,C4,D4,G3,X,C4,D4,F4,D4,C4"],
  ["炊,煙\n烟,裊\n袅,裊\n袅,升,起,_,隔,江,千,萬\n万,里",
   "F4,F4,D4,C4,D4,G3,X,C4,D4,F4,C4,#A3"],
  ["在,瓶,底,書\n书,漢\n汉,隸\n隶,仿,前,朝,的,飄\n飘,逸",
   "#A3,C4,D4,F4,G4,F4,D4,F4,D4,D4,C4,C4"],
  ["就,當\n当,我,為\n为,遇,見\n见,妳\n你,伏,-,筆\n笔",
   "#A3,C4,#A3,C4,#A3,C4,D4,F4,D4,D4"],
  ["天,青,色,等,煙\n烟,雨,_,而,我,在,等,你",
   "F4,F4,D4,C4,D4,G3,X,C4,D4,F4,D4,C4"],
  ["月,色,被,打,撈\n捞,起,_,暈\n晕,開\n开,了,結\n结,局",
   "F4,F4,D4,C4,D4,G3,X,C4,D4,F4,C4,#A3"],
  ["如,傳\n传,世,的,青,花,瓷,自,顧\n顾,自,美,麗\n丽",
   "#A3,C4,D4,F4,G4,F4,D4,F4,D4,D4,C4,C4"],
  ["妳\n你,眼,帶\n带,笑,意",
   "F3,D4,C4,C4,#A3"],
  ["天,青,色,等,煙\n烟,雨,_,而,我,在,等,你",
   "#F4,#F4,#D4,#C4,#D4,#G3,X,#C4,#D4,#F4,#D4,#C4"],
  ["炊,煙\n烟,裊\n袅,裊\n袅,升,起,_,隔,江,千,萬\n万,里",
   "#F4,#F4,#D4,#C4,#D4,#G3,X,#C4,#D4,#F4,#C4,B3"],
  ["在,瓶,底,書\n书,漢\n汉,隸\n隶,仿,前,朝,的,飄\n飘,逸",
   "B3,#C4,#D4,#F4,#G4,#F4,#D4,#F4,#D4,#D4,#C4,#C4"],
  ["就,當\n当,我,為\n为,遇,見\n见,妳\n你,伏,-,筆\n笔",
   "B3,#C4,B3,#C4,B3,#C4,#D4,#F4,#D4,#D4"],
  ["天,青,色,等,煙\n烟,雨,_,而,我,在,等,你",
   "#F4,#F4,#D4,#C4,#D4,#G3,X,#C4,#D4,#F4,#D4,#C4"],
  ["月,色,被,打,撈\n捞,起,_,暈\n晕,開\n开,了,結\n结,局",
   "#F4,#F4,#D4,#C4,#D4,#G3,X,#C4,#D4,#F4,#C4,B3"],
  ["如,傳\n传,世,的,青,花,瓷,自,顧\n顾,自,美,麗\n丽",
   "B3,#C4,#D4,#F4,#G4,#F4,#D4,#F4,#D4,#D4,#C4,#C4"],
  ["妳\n你,眼,帶\n带,笑,意",
   "#F3,#D4,#C4,#C4,B3"],
]

// 沧海一声笑
let DATA4 = [
  ["滄\n沧,海\n海,一,聲\n声,笑,_,滔,滔,兩\n两,岸,潮",
  "F4,#D4,C4,#A3,#G3,X,C4,#A3,#G3,F3,#D3"],
  ["浮,-,沉,-,隨\n随,-,浪,-,記\n记,-,今,-,-,朝",
   "#D3,F3,#D3,F3,#G3,#A3,C4,#D4,F4,#D4,C4,#A3,#G3,#A3"],
  ["蒼\n苍,天,-,-,-,笑,_,紛,紛,世,上,潮",
  "F4,F4,#D4,C4,#A3,#G3,X,C4,#A3,#G3,F3,#D3"],
  ["誰,負,誰,-,勝\n胜,-,出,-,天,-,知,-,-,曉\n晓",
   "#D3,F3,#D3,F3,#G3,#A3,C4,#D4,F4,#D4,C4,#A3,#G3,#A3"],
  ["江,山,-,-,-,笑,_,煙\n烟,-,雨,-,遙\n遥",
  "F4,F4,#D4,C4,#A3,#G3,X,C4,#A3,#G3,F3,#D3"],
  ["濤\n涛,浪,濤\n涛,盡\n尽,紅\n红,塵\n尘,俗,事,知,-,多,-,-,少",
   "#D3,F3,#D3,F3,#G3,#A3,C4,#D4,F4,#D4,C4,#A3,#G3,#A3"],
  ["清,風\n风,-,-,-,笑,_,竟,-,惹,寂,寥",
  "F4,F4,#D4,C4,#A3,#G3,X,C4,#A3,#G3,F3,#D3"],
  ["豪,-,情,-,還\n还,-,剩,了,一,-,襟,-,晚,照",
   "#D3,F3,#D3,F3,#G3,#A3,C4,#D4,F4,#D4,C4,#A3,#G3,#G3"],
  ["蒼\n苍,生,-,-,-,笑,_,不,-,再,寂,寥",
  "F4,F4,#D4,C4,#A3,#G3,X,C4,#A3,#G3,F3,#D3"],
  ["豪,-,情,-,仍,-,在,-,痴,痴,-,笑,-,笑",
   "#D3,F3,#D3,F3,#G3,#A3,C4,#D4,F4,#D4,C4,#A3,#G3,#G3"],
]

let g_flashcards = [];

let g_lines = [];

let DATASETS = [ DATA4, DATA3, DATA2, DATA0, DATA1 ];

function ToMidiNoteNumber(x) {
  const octave = parseInt(x[x.length-1]);
  const rem = x.substr(0, x.length-1);
  for (let i=0; i<PREFIX.length; i++) {
    if (PREFIX[i] == rem) { return 12+octave*12+i; }
  }
  return -999;
}

function ToNoteName(num) {
  let octave = parseInt(num/12) - 1;
  let rem = num % 12;
  return PREFIX[rem] + octave;
}

class Flashcard {
  constructor(the_data, has_yscale = true) {
    let line = the_data[0];
    let notes = the_data[1];
    let words = line.split(",");
    let note_numbers = [];
    let x_increment = 36;
    
    this.min_note = 48;
    this.max_note = 85;
    
    notes = notes.split(",");
    for (let i=0; i<notes.length; i++) {
      let num = ToMidiNoteNumber(notes[i].trim());
      note_numbers.push(num);
      if (num >= 48 && num <= 128) {
        this.min_note = min(this.min_note, num);
        this.max_note = max(this.max_note, num);
      }
    }
    
    // Graphics
    
    this.w = min(width, notes.length*x_increment + 30);
    this.h = 300;
    
    let y0 = 5, y1 = this.h-5;
    let x0 = 5, x1 = this.w-5;
    
    this.pos = new p5.Vector(0, 0); // 左上角
    this.g = createGraphics(this.w, this.h);
    let g = this.g;
    g.clear();
    //g.background(220);
    g.noFill();
    g.stroke(32);
    g.rect(0, 0, g.width-1, g.height-1);
    
    g.stroke(192);
    g.fill(0);
    
    for (let n=this.min_note; n<=this.max_note; n++) {
      let y = y1+(y0-y1)*(n-this.min_note)/(this.max_note-this.min_note);
      g.line(x0, y, x1, y);
    }
    
    const text_size = 24;
    const note_text_size = 14;
    
    g.textAlign(LEFT, TOP);
    
    // bar
    if (has_yscale) {
      const bar_x0 = 28, bar_x1 = 50;
      for (let x=24, octave=1; x<=84; x+=12, octave++) {
        if (x >= this.min_note && x <= this.max_note) {
          let dy0 = y1 + (y0-y1) * (x - this.min_note) / (this.max_note - this.min_note);
          let dy1 = dy0 + (y0-y1) / (this.max_note - this.min_note);
          g.fill("#88F");
          g.stroke(128);
          g.rectMode(CORNERS);
          g.rect(bar_x0, dy1, bar_x1, dy0);

          g.noStroke();
          g.textAlign(RIGHT, CENTER);
          g.text("C"+octave, bar_x0-2, (dy0+dy1)/2);
        }
      }
    }
    
    // Lyrics
    let text_x0 = 5;
    if (has_yscale) {
      text_x0 = 64;
    }
    const text_offset = 3;
    const N = words.length;
    if (x_increment > (x1-x0)/N) { x_increment = (x1-x0)/N; }
    let x = text_x0;
    for (let i=0; i<N; i++) {
      g.textAlign(LEFT, BOTTOM);
      let x_next = x + x_increment;
      if (notes[i] != "X") {
        const note = ToMidiNoteNumber(notes[i]);
        let dy0 = y1 + (y0-y1) * (note - this.min_note) / (this.max_note - this.min_note);
        let dy1 = dy0 + (y0-y1) / (this.max_note - this.min_note);

        g.noStroke();
        g.fill(32);
        g.textSize(text_size);
        g.text(words[i].trim(), x + text_offset, dy1-1);

        g.textAlign(LEFT, TOP);
        g.fill(96);
        g.textSize(note_text_size)
        g.text(notes[i], x + text_offset, dy0 + 2);

        g.stroke(128);
        g.fill(255)
        g.rectMode(CORNERS);
        g.rect(x, dy1, x_next, dy0);
      }
      
      x = x_next;
    }
  }
  
  Render() {
    if (g_line_idx == this.index) {
      push();
      rectMode(CORNER);
      fill(240);
      rect(this.pos.x, this.pos.y, this.g.width, this.g.height);
      pop();
    }
    image(this.g, this.pos.x, this.pos.y);
  }
}

function ScrollToEnd() {
  //g_dy_target = -DATASETS[g_data_idx].length*200+200;
  g_dx_target = g_flashcards[g_flashcards.length-1].pos.x;
  g_line_idx = g_flashcards.length-1;
}

function ScrollToBeginning() {
  g_dx_target = 0;
  g_line_idx = 0;
}

function SetDataIdx(didx) {
  g_flashcards = [];
  g_lines = [];
  
  g_line_idx = 0;
  g_dy_target = 0;
  g_dy = 0;
  g_dx_target = 0;
  g_dx = 0;
  let data_set = DATASETS[g_data_idx];
  let y = 0, x = 0;
  
  
  for (let i=0; i<data_set.length; i++) {
    let fc = new Flashcard(data_set[i], false);
    fc.index = i;
    
    // 竖版
    //fc.pos.y = y;
    //y += fc.g.height;
    // 横版
    fc.pos.x = x;
    fc.pos.y = 0;
    x += fc.g.width;
    
    g_flashcards.push(fc);
    
    let words = data_set[i][0].split(",");
    let line = "";
    for (let j=0; j<words.length; j++) {
      let w = words[j].trim();
      let append = "";
      
      if (w.indexOf("\n") != -1) {
        let sp = w.split("\n");
        line = line + sp[sp.length-1];
      } else if (w == "x") {
      } else if (w != "-" && w != "_") {
        line = line + w;
      } else if (w == "_") {
        line = line + " ";
      }
    }
    g_lines.push(line);
  }
}

function setup() {
  createCanvas(1080, 640);
  g_fc_scale = new Flashcard(["",""]);
  SetDataIdx(g_data_idx);
  //ScrollToEnd();
}

// delta = -1 or 1
function ScrollOneLine(delta, is_passive = false) {
  if (delta < 0) {
    g_line_idx --; 
    if (g_line_idx >= 0) { g_txt_dy -= TXT_LINE_HEIGHT; }
  } else { 
    g_line_idx ++; 
    if (g_line_idx < g_flashcards.length) { g_txt_dy += TXT_LINE_HEIGHT; }
  }
  if (g_line_idx < 0) g_line_idx = 0;
  else if (g_line_idx >= g_flashcards.length) { g_line_idx = g_flashcards.length-1; }
  const fc = g_flashcards[g_line_idx];
  if (!is_passive) {
    g_dx_target = fc.pos.x - width/2 + fc.g.width/2 + g_fc_scale.g.width;
  }
}

let g_frame_count = 0;
function draw() {
  const cursor_x0 = g_dx;
  const cursor_x1 = cursor_x0 + (width - g_fc_scale.g.width);
  const cursor_mid = (cursor_x0 + cursor_x1) / 2;
  
  for (let i=0; i<5; i++) {
    let fc = g_flashcards[g_line_idx];
    
    let thresh0 = (fc.pos.x + fc.g.width < width/2) ? cursor_x0 : cursor_mid;
    
    if (fc.pos.x + fc.g.width < thresh0) {
      ScrollOneLine(1, true);
    }
    else if (fc.pos.x > cursor_mid) {
      ScrollOneLine(-1, true);
    }
    else break;
  }
  
  g_dx_target += g_flags[0] * 10;
  if (g_dx_target < 0) { g_dx_target = 0; }
  g_dy = lerp(g_dy, g_dy_target, 0.2);
  g_dx = lerp(g_dx, g_dx_target, 0.05);
  
  g_txt_dy *= 0.8;
  
  background(220);
  push();
  translate(-g_dx + g_fc_scale.g.width, 0);
  g_flashcards.forEach((fc) => { 
    //if (fc.pos.y > -g_dy + height) return;
    //if (fc.pos.y < -g_dy - fc.h) return;
    fc.Render();
    //image(fc.g, 0, 0);
  });
  
  pop();
  
  push();
  fill(220);
  rectMode(CORNER);
  rect(0, 0, g_fc_scale.g.width, g_fc_scale.g.height);
  g_fc_scale.Render();
  pop();
  
  push();
  translate(0, g_txt_dy);
  textSize(32);
  textAlign(CENTER, CENTER);
  for (let lidx = g_line_idx-3, j=0; lidx <= g_line_idx + 4; lidx++, j++) {
    const y = 330 + j * TXT_LINE_HEIGHT;
    if (lidx >= 0 && lidx < g_lines.length) {
      if (lidx == g_line_idx) { fill(0, 0, 255); }
      else fill(0);
      text(g_lines[lidx], width/2, y)
    }
  }
  pop();
  
  textAlign(LEFT, BOTTOM);
  let data_set = DATASETS[g_data_idx];
  let fc = g_flashcards[g_line_idx];
  let msg = "曲目 " + (g_data_idx+1) + "/" + DATASETS.length;
  msg += " | 句数 " + (g_line_idx+1) + "/" + g_flashcards.length;
  msg += "   viewport:[" + parseInt(cursor_x0) + ", " + parseInt(cursor_x1) + "], currline:[";
  msg += parseInt(fc.pos.x) + ", " + parseInt(fc.pos.x + fc.g.width) + "]"
  //msg += " dx=" + parseInt(g_dx);
  text(msg, 4, height-4);
}

function keyPressed() {
  if (key == 'j' || key == 'k') {
    if (key == 'k') {
      ScrollOneLine(-1);
    } else { 
      ScrollOneLine(1);
    }
    if (g_line_idx < 0) g_line_idx = 0;
    else if (g_line_idx >= g_flashcards.length) { g_line_idx = g_flashcards.length-1; }
    const fc = g_flashcards[g_line_idx];
    g_dx_target = fc.pos.x - width/2 + fc.g.width/2 + g_fc_scale.g.width;
  } else if (key == 'h' || key == 'l') {
    if (key == 'h') { g_flags[0] = -1; } else g_flags[0] = 1;
  } else if (key == '[' || key == ']') {
    let didxdelta = 0;
    if (key == '[') { didxdelta = DATASETS.length-1; }
    else didxdelta = 1;
    g_data_idx = (g_data_idx + didxdelta) % DATASETS.length;
    SetDataIdx(g_data_idx);
  } else if (key == 'G') {
    ScrollToEnd();
  } else if (key == '0') {
    ScrollToBeginning();
  }
}

function keyReleased() {
  if (key == 'h' || key == 'l') { g_flags[0] = 0; }
}