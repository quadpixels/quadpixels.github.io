// 2020-10-11
// zgzg想唱就唱第二季第四期
// 这回有两个音高
// 唱歌接龙环节所用

const VIZ_METHOD = 1; // 可视化方式，1或2。2为新版

const MIN_NOTE = 44;
const MAX_NOTE = 87;

const NOTE_H = 50;
const PREFIX = ["C","#C","D","#D","E","F","#F","G","#G","A","#A","B"];
const COLOR0 = "#F8F";
const COLOR1 = "#55F";
const BGCOLOR = "#222";
const FONTCOLOR0 = "#888";
const FONTCOLOR1 = "#FF3";
const FONTCOLOR2 = "#CCC";
const Y_GRID_COLOR = "#555";
const FLASHCARD_HIGHLIGHT_COLOR = "#333"

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

// 小心：顺序不是按0到7来的

// 龙卷风，龍捲風 (+5)
// 原唱第一个字：E3
// 翻唱第一个字：A3
let DATA0 = [
  [ "愛\n爱,像,一,陣\n阵,風\n风,_,吹,完,它,就,走",
    "A3,E4,E4,D4,#F4,X,A3,E4,E4,D4,#F4",
    "-5"],
  [ "這,樣,的,節,奏,_,誰,都,無,可,奈,-,何",
    "B3,#F4,#F4,E4,G4,X,#A3,#F4,G4,#F4,E4,D4,D4",
    "-5"],
  [ "沒\n没,有,你,以,後\n后,_,我,靈\n灵,魂,失,控",
    "A3,E4,E4,D4,#F4,X,A3,E4,E4,D4,#F4",
    "" ],
  [ "黑,雲\n云,在,降,落,_,我,被,它,拖,着,-,走",
    "B3,#F4,#F4,E4,G4,X,#A3,#F4,G4,#F4,E4,D4,D4",
    "-5"],
  [ "静,静,悄,悄,偷,偷,離,開",
    "B4,B4,#F4,#F4,D4,D4,B3,B3",
    "" ],
  [ "陷,入,了,危,險,邊,緣,Ba,by",
    "A4,A4,E4,E4,#C4,#C4,A3,#C4,D4",
    ""],
  [ "我,的,世,界,已,狂,風,暴,-,雨",
    "B3,D4,B3,D4,B3,D4,E4,#F4,G4,E4",
    ""],
  [ "Oh,-,愛,情,來,得,太,快,就,像,龍,捲,風",
    "#F4,G4,A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4,D5",
    ""],
  [ "離,不,開,暴,風,圈,來,不,及,逃",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4",
    ""],
  [ "我,不,能,再,想,_,我,不,能,再,想",
    "D4,E4,#F4,A4,A4,X,D4,E4,#F4,A4,A4",
    "" ],
  [ "我,不,_,我,不,_,我,不,能,-,-,-,-,-",
    "D4,E4,X,D4,E4,X,D4,E4,#F4,E4,#F4,G4,#F4,G4",
    ""],
  [ "愛,情,走,得,太,快,就,像,龍,捲,風",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4,D5",
    ""],
  [ "不,能,承,受,我,已,無,處,可,躲",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4",
    ""],
  [ "我,不,要,再,想,_,我,不,要,再,想",
    "D4,E4,#F4,A4,A4,X,D4,E4,#F4,A4,A4",
    "" ],
  [ "我,不,_,我,不,_,我,不,要,再,想,你",
    "D4,E4,X,D4,E4,X,D4,E4,#F4,E4,D4,D4",
    ""],
  [ "不,知,不,覺,你,已,經,離,開,我",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4",
    "" ],
  [ "不,知,不,覺,我,跟,了,這,節,奏",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4",
    "" ],
  [ "後,知,後,覺,又,過,了,一,個,秋",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4",
    "" ],
  [ "後,知,後,覺,我,該,好,好,生,活",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4",
    "" ],
  [ "静,静,悄,悄,偷,偷,離,開",
    "B4,B4,#F4,#F4,D4,D4,B3,B3",
    "" ],
  [ "陷,入,了,危,險,邊,緣,Ba,by",
    "A4,A4,E4,E4,#C4,#C4,A3,#C4,D4",
    ""],
  [ "我,的,世,界,已,狂,風,暴,-,雨",
    "B3,D4,B3,D4,B3,D4,E4,#F4,G4,E4",
    ""],
  [ "Oh,-,愛,情,來,得,太,快,就,像,龍,捲,風",
    "#F4,G4,A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4,D5",
    ""],
  [ "離,不,開,暴,風,圈,來,不,及,逃",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4",
    ""],
  [ "我,不,能,再,想,_,我,不,能,再,想",
    "D4,E4,#F4,A4,A4,X,D4,E4,#F4,A4,A4",
    "" ],
  [ "我,不,_,我,不,_,我,不,能,-,-,-,-,-",
    "D4,E4,X,D4,E4,X,D4,E4,#F4,E4,#F4,G4,#F4,G4",
    ""],
  [ "愛,情,走,得,太,快,就,像,龍,捲,風",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4,D5",
    ""],
  [ "不,能,承,受,我,已,無,處,可,躲",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4",
    ""],
  [ "我,不,要,再,想,_,我,不,要,再,想",
    "D4,E4,#F4,A4,A4,X,D4,E4,#F4,A4,A4",
    "" ],
  [ "我,不,_,我,不,_,我,不,要,再,想,你",
    "D4,E4,X,D4,E4,X,D4,E4,#F4,G4,A4,D5",
    ""],
  [ "現,在,_,你,要,我,說,多,難,堪",
    "0,0,X,0,0,0,0,0,0,0",
    "" ],
  [ "我,根,本,就,不,想,分,開",
    "0,0,0,0,0,0,0,0",
    "" ],
  [ "為,什,麼,還,要,我,用,_,用,微,笑,來,代,過",
    "0,0,0,0,0,0,0,_,0,0,0,0,0,0",
    ""],
  [ "沒,有,_,我,沒,有,_,沒,有,這,種,天,份",
    "0,0,X,0,0,0,X,0,0,0,0,0,0",
    ""],
  [ "包,容,你,也,接,受,他","0,0,0,0,0,0,0",""],
  [ "但,不,用,擔,心,太,多","0,0,0,0,0,0,0",""],
  [ "我,會,一,直,好,好,過","0,0,0,0,0,0,0",""],
  [ "我,_,看,着,你,已,經,遠,遠,離,開","0,X,0,0,0,0,0,0,0,0,0",""],
  [ "我,也,會,慢,慢,走,開", "0,0,0,0,0,0,0,0", ""],
  [ "為,什,麼,我,連,分,開,都,遷,就,著,你", "0,0,0,0,0,0,0,0,0,0,0,0,0,0", ""],
  [ "我,真,的,沒,有,天,份,_,安,静,得,沒,那,麼,快", "0,0,0,0,0,0,0,X,0,0,0,0,0,0,0", ""],
  [ "and,_,I,_,will,_,learn,_,to,_,give,_,up,_,because,_,我,愛,你","0,X,0,X,0,X,0,X,0,X,0,X,0,X,0,X,0,0,0",""],
  [ "愛,情,來,得,太,快,就,像,龍,捲,風",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4,D5",
    ""],
  [ "離,不,開,暴,風,圈,來,不,及,逃",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4",
    ""],
  [ "我,不,能,再,想,_,我,不,能,再,想",
    "D4,E4,#F4,A4,A4,X,D4,E4,#F4,A4,A4",
    "" ],
  [ "我,不,_,我,不,_,我,不,能,-,-,-,-,-",
    "D4,E4,X,D4,E4,X,D4,E4,#F4,E4,#F4,G4,#F4,G4",
    ""],
  [ "愛,情,走,得,太,快,就,像,龍,捲,風",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4,D5",
    ""],
  [ "不,能,承,受,我,已,無,處,可,躲",
    "A4,G4,#F4,#F4,G4,A4,A4,G4,#F4,#F4",
    ""],
  [ "我,不,要,再,想,_,我,不,要,再,想",
    "D4,E4,#F4,A4,A4,X,D4,E4,#F4,A4,A4",
    "" ],
  [ "我,不,_,我,不,_,我,不,要,再,想,你",
    "D4,E4,X,D4,E4,X,D4,E4,#F4,G4,A4,D5",
    ""],
  [ "不,知,不,覺,你,已,經,離,開,我,\r,你,-,-,-,-,-",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,D5,D5,D5,D5,D5,D5",
    "" ],
  [ "不,知,不,覺,我,跟,了,這,節,奏,\r,Oh,-,-,-,-,-,-,-,-",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,D5,DF5,#F5,#F5,E5,D5,D5,D5,D5",
    "" ],
  [ "後,知,後,覺,又,過,了,一,個,秋,\r,Oh,-,-,-,-,-,-,-,-",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,D5,D5,A5,A5,A5,A5,A5,A5,A5",
    "" ],
  [ "後,知,後,覺,我,該,好,好,生,活,\r,Oh,-,-,-,-,",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,B5,B5,A5,A5,A5,A5",
    "" ],
  [ "不,知,不,覺,你,已,經,離,開,我,\r,,,,,,(已,经,離,開,我,-)",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,X,X,X,X,X,D5,D5,E5,D5,D5,B4",
    "" ],
  [ "不,知,不,覺,我,跟,了,這,節,奏,\r,,,,,,(你,給,的,生,活,-)",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,X,X,X,X,X,D5,D5,#C5,D5,B4,A4",
    "" ],
  [ "後,知,後,覺,又,過,了,一,個,秋,\r,,,,,(我,應,該,好,好,地",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,X,X,X,X,D5,D5,D5,D5,D5,D5",
    "" ],
  [ "後,知,後,覺,我,該,好,好,生,活,\r,生,活,-,-,-,-,-)",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4,X,E5,E5,E5,D5,D5,#C5,B4",
    "" ],
  [ "不,知,不,覺,你,已,經,離,開,我",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4",
    "" ],
  [ "不,知,不,覺,我,跟,了,這,節,奏",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4",
    "" ],
  [ "後,知,後,覺,又,過,了,一,個,秋",
    "D4,A3,#F4,D4,G4,#F4,D4,E4,#F4,E4",
    "" ],
  [ "後,知,後,覺,_,後,知,後,覺",
    "D4,A3,#F4,D4,X,D4,A3,#F4,D4",
    "" ],
]

// 刚好遇见你 (+12)
// 原唱“我们哭了”的“了”=#C3
// 翻唱“我们哭了”的“了”=#C4
let DATA1 = [
  [ "我,们,哭,了,_,我,们,笑,着", "#G3,#C4,#D4,#C4,X,#C4,#C4,#D4,#C4", "" ],
  [ "我,们,抬,头,望,天,空", "#C4,#C4,#D4,F4,#A4,C5,#C5", "" ],
  [ "星,星,还,亮,着,几,颗", "#A4,#A4,#G4,#G4,F4,#C4,#D4", "" ],
  [ "我,们,唱,着,_,时,间,的,歌", "#G3,#C4,#D4,#C4,X,#C4,#C4,#D4,F4" ],
  [ "才,懂,得,相,互,拥,抱", "#C4,#C4,#D4,F4,#A4,C5,#C5", "" ],
  [ "到,底,是,为,了,什,么", "#A4,#A4,#G4,#G4,#A4,F4,#D4", "" ],
  [ "因,为,我,刚,好,遇,见,-,你", "#C4,#C4,C4,#C4,#A3,#C5,#G4,#A4,#A4", "" ],
  [ "留,下,足,迹,才,美,丽", "#A4,#G4,#G4,F4,F4,#C4,#D4", "" ],
  [ "风,吹,花,落,泪,如,雨", "#C4,#C4,#C4,#A3,#C5,#D5,#C5,", ""],
  [ "因,为,-,_,不,想,分,离", "#C5,#G4,#A4,X,#G4,F4,#G4,#D4", "" ],
  [ "因,为,刚,好,遇,见,-,你", "#C4,#C4,#C4,#A3,#C5,#G4,#A4,#A4", "" ],
  [ "留,下,十,年,-,的,期,许", "#A4,#G4,#G4,#G4,#A4,F4,#A4,#D4", "" ],
  [ "如,果,-,再,相,遇", "#C4,#C4,#D4,#C4,C4,#C4", "" ],
  [ "我,想,我,会,记,得,你", "#C4,#D4,F4,#D4,#C4,C4,#C4", "" ],
  [ "（,间,奏,）", "0,0,0,0", ""],
  [ "我,们,哭,了,_,我,们,笑,着", "#G3,#C4,#D4,#C4,X,#C4,#C4,#D4,#C4", "" ],
  [ "我,们,抬,头,望,天,空", "#C4,#C4,#D4,F4,#A4,C5,#C5", "" ],
  [ "星,星,还,亮,着,几,颗", "#A4,#A4,#G4,#G4,F4,#C4,#D4", "" ],
  [ "我,们,唱,着,_,时,间,的,歌", "#G3,#C4,#D4,#C4,X,#C4,#C4,#D4,F4" ],
  [ "才,懂,得,相,互,拥,抱", "#C4,#C4,#D4,F4,#A4,C5,#C5", "" ],
  [ "到,底,是,为,了,什,么", "#A4,#A4,#G4,#G4,#A4,F4,#D4", "" ],
  [ "因,为,我,刚,好,遇,见,-,你", "#C4,#C4,C4,#C4,#A3,#C5,#G4,#A4,#A4", "" ],
  [ "留,下,足,迹,才,美,丽", "#A4,#G4,#G4,F4,F4,#C4,#D4", "" ],
  [ "风,吹,花,落,泪,如,雨", "#C4,#C4,#C4,#A3,#C5,#D5,#C5,", ""],
  [ "因,为,-,_,不,想,分,离", "#C5,#G4,#A4,X,#G4,F4,#G4,#D4", "" ],
  [ "因,为,刚,好,遇,见,-,你", "#C4,#C4,#C4,#A3,#C5,#G4,#A4,#A4", "" ],
  [ "留,下,十,年,-,的,期,许", "#A4,#G4,#G4,#G4,#A4,F4,#A4,#D4", "" ],
  [ "如,果,-,再,相,遇", "#C4,#C4,#D4,#C4,C4,#C4", "" ],
  [ "我,想,我,会,记,得,你", "#C4,#D4,F4,#D4,#C4,C4,#C4", "" ],
  [ "因,为,刚,好,遇,见,-,你", "#C4,#C4,#C4,#A3,#C5,#G4,#A4,#A4", "" ],
  [ "留,下,足,迹,才,美,丽", "#A4,#G4,#G4,F4,F4,#C4,#D4", "" ],
  [ "风,吹,花,落,泪,如,雨", "#C4,#C4,#C4,#A3,#C5,#D5,#C5,", ""],
  [ "因,为,-,_,不,想,分,离", "#C5,#G4,#A4,X,#G4,F4,#G4,#D4", "" ],
  [ "因,为,刚,好,遇,见,-,你", "#C4,#C4,#C4,#A3,#C5,#G4,#A4,#A4", "" ],
  [ "留,下,十,年,-,的,期,许", "#A4,#G4,#G4,#G4,#A4,F4,#A4,#D4", "" ],
  [ "如,果,-,再,相,遇", "#C4,#C4,#D4,#C4,C4,#C4", "" ],
  [ "我,想,我,会,记,得,你", "#C4,#D4,F4,#D4,#C4,C4,#C4", "" ],
  [ "（,+1,,key,,）", "0,0,0,0,0,0,0", ""],
  [ "因,为,我,刚,好,遇,见,-,你", "D4,D4,#C4,D4,B3,D5,A4,B4,B4", "" ],
  [ "留,下,足,迹,才,美,丽", "B4,A4,A4,#F4,#F4,D4,E4", "" ],
  [ "风,吹,花,落,泪,如,雨", "D4,D4,D4,B3,D5,E5,D5,", ""],
  [ "因,为,-,_,不,想,分,离", "D5,A4,B4,X,A4,#F4,A4,E4", "" ],
  [ "因,为,刚,好,遇,见,-,你", "D4,D4,D4,B3,D5,A4,B4,B4", "" ],
  [ "留,下,十,年,-,的,期,许", "B4,A4,A4,A4,B4,#F4,B4,E4", "" ],
  [ "如,果,-,再,相,遇", "D4,D4,E4,D4,#C4,D4", "" ],
  [ "我,想,我,会,记,得,你", "D4,E4,#F4,E4,D4,#C4,D4", "" ],
]

// 大鱼
let DATA2 = [
  [ "海,浪,无,声,将,夜,幕,深,深,淹,没", "#A3,#C4,#C4,#D4,#D4,F4,F4,#A4,#G4,F4,#D4", ""],
  [ "漫,过,天,空,尽,头,的,角,落", "#A3,#C4,#C4,#D4,#D4,F4,F4,#A3,#G3", "" ],
  [ "大,鱼,在,梦,境,的,缝,隙,里,游,过", "#A3,#C4,#C4,#D4,#D4,F4,F4,#A4,#G4,F4,#D4", ""],
  [ "凝,望,你,_,沉,睡,的,轮,廓", "#D4,F4,#A3,X,#D4,F4,#A3,#G3,#A3", "" ],
  [ "看,海,天,一,色,_,听,风,起,雨,落", "#A3,#C4,#D4,#C4,#A3,X,#A3,#C4,#D4,#C4,F4", "" ],
  [ "执,子,手,_,吹,散,苍,茫,茫,烟,波", "F4,#G4,#A4,X,#A4,#G4,F4,#D4,#C4,#D4,F4,", "" ],
  [ "大,鱼,的,翅,膀,_,已,经,太,辽,阔,-", "#A3,#C4,#D4,#C4,#A3,X,#A3,#C4,#D4,#C4,#D4,F4,", "" ],
  [ "我,松,开,_,时,间,的,绳,索", "#D4,F4,#A3,X,#D4,F4,#A3,#G3,#A3", "" ],
  [ "怕,你,飞,远,去,_,怕,你,离,我,而,去", "F4,#G4,#C5,#G4,F4,X,F4,#D4,#C4,#C4,#D4,F4", "" ],
  [ "更,怕,你,永,远,停,留,在,这,里", "F4,#D4,#C4,#A4,#C5,C5,#A4,#G4,#D4,F4", "" ],
  [ "每,一,滴,泪,水,_,都,向,你,流,淌,去", "F4,#G4,#C5,#G4,F4,X,F4,#D4,#C4,#C4,#D4,F4", "" ],
  [ "倒,流,进,_,天,空,的,海,底", "#D4,F4,#A3,X,#D4,F4,#A3,#G3,#A3", "" ],
  [ "（,间,奏,）", "0,0,0,0", ""],
  
  [ "海,浪,无,声,将,夜,幕,深,深,淹,没", "#A3,#C4,#C4,#D4,#D4,F4,F4,#A4,#G4,F4,#D4", ""],
  [ "漫,过,天,空,尽,头,的,角,落", "#A3,#C4,#C4,#D4,#D4,F4,F4,#A3,#G3", "" ],
  [ "大,鱼,在,梦,境,的,缝,隙,里,游,过", "#A3,#C4,#C4,#D4,#D4,F4,F4,#A4,#G4,F4,#D4", ""],
  [ "凝,望,你,_,沉,睡,的,轮,廓", "#D4,F4,#A3,X,#D4,F4,#A3,#G3,#A3", "" ],
  [ "看,海,天,一,色,_,听,风,起,雨,落", "#A3,#C4,#D4,#C4,#A3,X,#A3,#C4,#D4,#C4,F4", "" ],
  [ "执,子,手,_,吹,散,苍,茫,茫,烟,波", "F4,#G4,#A4,X,#A4,#G4,F4,#D4,#C4,#D4,F4,", "" ],
  [ "大,鱼,的,翅,膀,_,已,经,太,辽,阔,-", "#A3,#C4,#D4,#C4,#A3,X,#A3,#C4,#D4,#C4,#D4,F4,", "" ],
  [ "我,松,开,_,时,间,的,绳,索", "#D4,F4,#A3,X,#D4,F4,#A3,#G3,#A3", "" ],
  [ "看,你,飞,远,去,_,看,你,离,我,而,去", "F4,#G4,#C5,#G4,F4,X,F4,#D4,#C4,#C4,#D4,F4", "" ],
  [ "原,来,你,生,来,就,属,于,天,际", "F4,#D4,#C4,#A4,#C5,C5,#A4,#G4,#D4,F4", "" ],
  [ "每,一,滴,泪,水,_,都,向,你,流,淌,去", "F4,#G4,#C5,#G4,F4,X,F4,#D4,#C4,#C4,#D4,F4", "" ],
  [ "倒,流,回,_,最,初,的,相,遇", "#D4,F4,#A3,X,#D4,F4,#A3,#G3,#A3", "" ],
  
  [ "（,吟,唱,注,意,）", "0,0,0,0,0,0", ""],
  [ "Ah,-,-,-,-,-,-,-,-", "F4,#G4,#A4,X,#A4,#G4,#A4,#G4,F4", "" ],
  [ "Ah,-,-,-,-,-,-,-,-", "F4,#G4,#A4,X,#A4,#G4,#A4,C5,#C5", "" ],
  [ "Ah,-,-,-,-,-,-,-", "#A4,F5,#D5,#A4,F5,#D5,C5,#G4",""],
  [ "Ah,-,-,-,-,-,-,-,-", "#D5,F5,#A4,X,#D5,F5,#A4,#G4,#A4",""]
]

// 她说
// 张碧晨版相比起林俊杰版 +3 key
let DATA3 = [
  [ "他,静,悄,悄,的,来,过", "#D4,#D4,D4,D4,#A3,#D3,C4", "" ],
  [ "他,慢,慢,带,走,沉,默", "#D4,#D4,D4,D4,#A3,#D3,#A3", "" ],
  [ "只,是,最,后,的,承,诺,-,-", "#D4,D4,#D4,D4,#D4,F4,F4,#D4,C4", "" ],
  [ "还,是,没,有,带,走,了,寂,寞", "D4,#D4,D4,D4,#D4,F4,F4,#D4,G4", ""],
  [ "我,们,爱,的,没,有,错", "#D4,#D4,F4,#D4,F4,#D4,C5", "" ],
  [ "只,是,美,丽,的,独,秀,_,太,折,磨", "#D4,#D4,F4,#D4,F4,#D4,#A4,X,G4,F4,#D4", ""],
  [ "她,说,无,所,谓,-,-,-", "#D4,D4,#D4,F4,F4,#D4,C4,#D4", "" ],
  [ "只,要,能,在,夜,里,翻,来,覆,去,的,时,候,有,寄,托",
    "#D4,#D4,D4,#D4,F4,#D4,#G4,G4,#G4,G4,#G4,G4,#G4,G4,G4,#A4", ""],
  [ "等,不,到,天,黑,_,烟,火,不,会,太,完,美", "G4,#G4,#A4,#D4,C5,X,#D4,D4,C4,D4,#D4,C5,#A4", "" ],
  [ "回,忆,烧,成,灰,_,还,是,等,不,到,结,尾,-,-", "F4,G4,#G4,G4,#A4,_,#D4,D4,C4,D4,#D4,#A4,G4,F4,#D4", "" ],
  [ "她,曾,说,得,无,所,谓", "F4,G4,#G4,G4,#G4,G4,#G4", "" ],
  [ "我,怕,一,天,一,天,被,摧,毁,_,-,-,-", "F4,G4,#G4,G4,#G4,G4,#G4,#A4,G4,X,F4,#G4,G4", "" ],
  [ "等,不,到,天,黑,_,不,敢,凋,谢,的,花,蕾", "G4,#G4,#A4,#D4,C5,X,#D4,D4,C4,D4,#D4,D5,#A4", "" ],
  [ "绿,叶,在,跟,随,_,放,开,刺,痛,的,滋,味", "F4,G4,#G4,G4,#A4,_,#A4,G4,#A4,G4,#A4,C5,G4", "" ],
  [ "今,后,不,再,怕,天,明", "G4,G4,F4,F4,G4,#G4,#G4", ""],
  [ "我,想,只,是,害,怕,清,-,醒", "#D4,#D4,D4,D4,#D4,F4,F4,#D4,#D4","" ],
  [ "等,不,到,天,黑,_,烟,火,不,会,太,完,美", "G4,#G4,#A4,#D4,C5,X,#D4,D4,C4,D4,#D4,C5,#A4", "" ],
  [ "回,忆,烧,成,灰,_,还,是,等,不,到,结,尾,-,-", "F4,G4,#G4,G4,#A4,_,#D4,D4,C4,D4,#D4,#A4,G4,F4,G4", "" ],
  [ "她,曾,说,得,无,所,谓,-", "F4,G4,#G4,G4,#G4,G4,#A4,#G4", "" ],
  [ "我,怕,一,天,一,天,被,摧,毁,_,wo,-,-,-,-", "F4,G4,#G4,G4,#G4,G4,#G4,#A4,G4,X,F4,G4,#G4,#A4,#A4", "" ],
  [ "等,不,到,天,黑,_,不,敢,凋,谢,的,花,蕾", "G4,#G4,#A4,#D4,C5,X,#D4,D4,C4,D4,#D4,D5,#A4", "" ],
  [ "绿,叶,在,跟,随,_,放,开,刺,痛,的,滋,味", "F4,G4,#G4,G4,#A4,_,#A4,G4,#A4,G4,#A4,C5,C5", "" ],
  [ "今,后,不,再,怕,天,明", "G4,G4,F4,F4,G4,#G4,#G4", ""],
  [ "我,想,只,是,害,怕,清,-,醒", "#D4,#D4,D4,D4,#D4,F4,F4,#D4,#D4","" ],
  [ "不,怕,天,明", "F4,G4,#G4,#G4", ""],
  [ "我,想,只,是,害,怕,清,-,醒", "#D4,#D4,D4,D4,#D4,F4,F4,#D4,#D4","" ],
]

// 记得
// 张惠妹版比林俊杰版 +4 key
let DATA4 = [
  [ "誰\n谁,還\n还,記\n记,得,_,是,誰\n谁,先,說\n说,_,永,遠\n远,地,愛\n爱,我",
     "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#F4,X,B4,B4,#A4,#F4,#D4",
    "" ],
  [ "以,前,的,一,句,話\n话", "B3,#G4,B3,#A3,#F4,#F4","" ],
  [ "是,我,們\n们,以,後\n后,的,傷\n伤,口", "E4,#D4,E4,#D4,E4,#F4,#D4,#C4", "" ],
  [ "過\n过,了,太,久,_,沒\n没,人,記\n记,得,_,當\n当,初,那,些,溫\n温,柔",
    "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#A4,X,#C5,B4,#A4,B4,#A4,#G4,#F4", "" ],
  [ "我,和,你,手,牽\n牵,手", "#A4,B4,#G4,#F4,#G4,B3", "" ],
  [ "說\n说,要,一,起,_,走,到,最,後\n后", "E4,#D4,E4,B4,X,#G4,B4,#A4,B4", "" ],
  [ "（,I,n,t,r,o,）", "0,0,0,0,0,0,0", ""],
  [ "我,們\n们,都,忘,了,_,這\n这,條\n条,路,走,了,多,久", "#D4,E4,#D4,#D4,#C4,X,#D4,E4,#D4,#D4,#C4,B3,#F3", "" ],
  [ "心,中,是,清,楚,的", "#D4,E4,#D4,#C4,B3,B3", ""],
  [ "有,一,天,_,有,一,天,都,會\n会,停,的", "#F3,#G3,#C4,X,#F3,#G3,B3,#D4,E4,B3,#C4", ""],
  [ "讓\n让,時\n时,間\n间,說\n说,真,話\n话,_,雖\n虽,然,我,也,害,怕", "#D4,E4,#D4,#D4,#C4,#F4,X,#F4,B3,#A3,#A3,B3,#C4" ],
  [ "在,天,黑,了,以,後\n后", "#D4,E4,#D4,#C4,B3,#F4", ""],
  [ "我,們\n们,都,不,知,道,會\n会,不,會\n会,有,以,後\n后", "B3,B3,#F4,#F4,E4,E4,B3,#F4,E4,E4,B3,#F4", "" ],
  
  [ "誰\n谁,還\n还,記\n记,得,_,是,誰\n谁,先,說\n说,_,永,遠\n远,地,愛\n爱,我",
     "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#F4,X,B4,B4,#A4,#F4,#D4",
    "" ],
  [ "以,前,的,一,句,話", "B3,#G4,B3,#A3,#F4,#F4","" ],
  [ "是,我,們\n们,以,後\n后,的,傷\n伤,口", "E4,#D4,E4,#D4,E4,#F4,#D4,#C4", "" ],
  [ "過\n过,了,太,久,_,沒\n没,人,記\n记,得,_,當\n当,初,那,些,溫\n温,柔",
    "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#A4,X,#C5,B4,#A4,B4,#A4,#G4,#F4", "" ],
  [ "我,和,你,手,牽\n牵,手", "#A4,B4,#G4,#F4,#G4,B3", "" ],
  [ "說\n说,要,一,起,_,走,到,最,-,後\n后", "E4,#D4,E4,B4,X,#G4,B4,#A4,B4,B4", "" ],
  
  [ "我,們\n们,都,累,了,_,卻\n却,沒\n没,辦\n办,法,往,回,走", "#D4,E4,#D4,#D4,#C4,X,#D4,E4,#D4,#D4,#C4,B3,#F3", "" ],
  [ "兩\n两,顆\n颗,心,都,迷,惑", "#D4,E4,#D4,#C4,B3,B3", ""],
  [ "怎,麼\n么,說\n说,_,怎,麼\n么,說\n说,都,沒\n没,有,救", "#F3,#G3,#C4,X,#F3,#G3,B3,#D4,E4,B3,#C4", ""],
  [ "親\n亲,愛\n爱,的,為\n为,什,麼\n么,_,也,許,你,也,不,懂", "#D4,E4,#D4,#D4,#C4,#F4,X,#F4,B3,#A3,#A3,B3,#C4" ],
  [ "兩\n两,個\n个,相,愛,的,人", "#D4,E4,#D4,#C4,B3,#F4", ""],
  [ "等,著\n着,對\n对,方,先,說\n说,想,分,開\n开,的,理,由", "B3,B3,#F4,#F4,E4,E4,B3,#F4,E4,E4,B3,#F4", "" ],
  
  [ "誰\n谁,還\n还,記\n记,得,_,愛\n爱,情,開\n开,始,_,變\n变,化,的,時\n时,候",
     "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#F4,X,B4,B4,#A4,#F4,#D4",
    "" ],
  [ "我,和,你,的,眼,中", "B3,#G4,B3,#A3,#F4,#F4","" ],
  [ "看,見,了,不,同,的,天,空", "E4,#D4,E4,#D4,E4,#F4,#D4,#C4", "" ],
  [ "走,得,太,遠\n远,_,終\n终,於\n于,走,到,_,分,岔,路,的,路,-,口",
    "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#A4,X,#C5,B4,#A4,B4,#A4,#G4,#F4,#F4", "" ],
  [ "是,不,是,你,和,我", "#A4,B4,#G4,#F4,#G4,B3", "" ],
  [ "要,有,兩\n两,個\n个,_,相,反,的,夢\n梦", "E4,#D4,E4,B4,X,#G4,B4,#A4,B4", "" ],
  [ "（,I,n,t,r,o,）", "0,0,0,0,0,0,0", ""], 
  
  [ "誰\n谁,還\n还,記\n记,得,_,是,誰\n谁,先,說\n说,_,永,遠\n远,地,愛\n爱,我",
     "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#F4,X,B4,B4,#A4,#F4,#D4",
    "" ],
  [ "以,前,的,一,句,話", "B3,#G4,B3,#A3,#F4,#F4","" ],
  [ "是,我,們\n们,以,後\n后,的,傷\n伤,口", "E4,#D4,E4,#D4,E4,#F4,#D4,#C4", "" ],
  [ "過\n过,了,太,久,_,沒\n没,人,記\n记,得,_,當\n当,初,那,些,溫\n温,-,柔,-",
    "#D4,#D4,E4,#D4,X,#F4,#F4,#G4,#A4,X,#C5,B4,#A4,B4,#A4,#D5,#C5,B4", "" ],
  [ "我,和,你,手,牽\n牵,手", "#A4,B4,#G4,#F4,#G4,B3", "" ],
  [ "說\n说,要,一,起,_,走,到,最,後\n后,-", "E4,#D4,E4,B4,X,#G4,B4,#C5,#C5,B4", "" ],
  
  [ "我,和,你,手,牽\n牵,手", "#A4,B4,#G4,#F4,#G4,B3", "" ],
  [ "說\n说,要,一,起,_,走,到,最,-,後\n后", "E4,#D4,E4,B4,X,#G4,B4,#A4,B4,B4", "" ],
]

// 卷珠帘
// TODO: 查一下 卷 在这里的繁体是卷还是捲
let DATA5 = [
  [ "鐫\n镌,刻,好,每,道,眉,間\n间,心,-,上", "A3,E4,D4,C4,B3,A3,A3,G3,E3,D3", "" ],
  [ "畫\n画,間\n间,透,過\n过,思,量", "C4,G4,#F4,E4,D4,E4", "" ],
  [ "沾,染,了,_,墨,色,淌", "E4,G4,A4,X,G4,E4,D4", "" ],
  [ "千,家,文,-,-,_,都,泛,-,黃\n黄", "C4,D4,E4,D4,C4,X,C4,A3,G3,A3", "" ],
  [ "夜,静,謐\n谧,_,窗,紗\n纱,-,微,微,-,亮", "G3,A3,C4,X,B3,G3,E3,D4,C4,A3,A3", "" ],
  [ "拂,袖,起,舞,於\n于,夢\n梦,中,嫵\n妩,-,媚", "A3,E4,D4,C4,B3,A3,A3,G3,E3,D3", "" ],
  [ "相,思,蔓,上,心,扉", "C4,G4,#F4,E4,D4,E4", "" ],
  [ "她,眷,-,-,戀\n恋,_,梨,-,-,花,-,淚\n泪", "E4,G4,E4,G4,A4,X,G4,A4,G4,E4,D4,D4", "" ],
  [ "静,畫\n画,紅\n红,妝\n妆,-,_,等,誰\n谁,-,歸\n归", "C4,D4,E4,D4,C4,X,C4,A3,G3,A3", "" ],
  [ "空,留,伊,人,徐,-,徐,憔,-,悴,-", "G3,A3,C4,B3,G3,E3,D4,C4,A3,C4,A3", "" ],
  [ "啊,-,-,-,-,-,_,胭,脂,香,-,-,味", "G4,A4,A4,G4,A4,G4,X,#F4,E4,#F4,E4,D4,A3", "" ],
  [ "捲\n卷,珠,簾\n帘,-,_,是,為\n为,誰\n谁,-,-", "C4,D4,#F4,G4,X,#F4,E4,D4,E4,#F4", "" ],
  [ "啊,-,-,-,-,-,_,不,見,高,-,-,軒\n轩,-", "G4,A4,A4,G4,A4,G4,X,#F4,E4,#F4,E4,D4,E4,D4", "" ],
  [ "夜,未,-,明,_,此,時,難\n难,為\n为,情", "E4,D4,A3,A3,X,E4,D4,A3,G3,A3", "" ],
  
  [ "（,间,奏,）", "0,0,0,0", ""], 
  [ "啊,-,-,-,-,-,_,胭,脂,香,-,-,味", "G4,A4,A4,G4,A4,G4,X,#F4,E4,#F4,E4,D4,A3", "" ],
  [ "捲\n卷,珠,簾\n帘,-,_,是,為\n为,誰\n谁,-,-", "C4,D4,#F4,G4,X,#F4,E4,D4,E4,#F4", "" ],
  [ "啊,-,-,-,-,_,不,見,高,-,-,軒\n轩,-", "A4,B4,C5,C5,B4,X,A4,G4,A4,G4,#F4,G4,#F4", "" ],
  [ "夜,月,-,明,_,此,時,難\n难,為\n为,情", "E4,D4,A3,A3,X,E4,D4,A3,G3,A3", "" ],
  
  [ "細\n细,雨,落,入,初,春,的,清,-,晨", "A3,E4,D4,C4,B3,A3,A3,G3,E3,D3", "" ],
  [ "悄,悄,喚\n唤,醒,枝,枒", "C4,G4,#F4,E4,D4,E4", "" ],
  [ "聽\n听,微,-,-,風\n风,_,耳,-,-,畔,-,響\n响", "E4,G4,E4,G4,A4,X,G4,A4,G4,G4,#F4,#F4", "" ],
  [ "嘆\n叹,流,水,兮,落,花,傷\n伤,-", "E4,D4,E4,E4,D4,C4,D4,A3", "" ],
  [ "誰\n谁,在,煙\n烟,雲\n云,處\n处,-,琴,聲\n声,-,長", "G3,A3,C4,B3,G3,E3,D4,C4,A3,A3", "" ],
]

// 洋葱
// 叮当版 比 杨宗纬版 +5 key
let DATA6 = [
  [ "如,果,你,眼,神,能,够,为,我,片,刻,的,降,临", "C3,C3,F3,F3,A3,A3,C4,C4,C3,G3,F3,E3,F3,D3", "" ],
  [ "如,果,你,能,听,到,心,碎,的,声,音", "G3,G3,A3,A3,#A3,D3,G4,F4,G3,#A3,A3", "" ],
  [ "沉,默,地,守,护,着,你,_,沉,默,地,等,奇,迹", "D4,D4,A3,D4,E4,F4,D4,X,D4,D4,A3,E4,F4,D4", "" ],
  [ "沉,默,地,让,自,已,_,像,是,空,气", "A4,#A4,A4,#A4,A4,F4,X,F4,F4,D4,G4", "" ],
  [ "大,家,都,吃,着,聊,着,笑,着,_,今,晚,多,开,心", "C3,C3,F3,F3,A3,A3,C4,C4,C3,X,G3,F3,E3,F3,D3", "" ],
  [ "最,角,落,里,的,我,_,笑,得,多,合,群", "G3,G3,A3,A3,#A3,D3,X,G4,F4,G3,#A3,A3", "" ],
  [ "盘,底,的,洋,葱,像,我,_,永,远,是,调,味,品", "D4,D4,A3,D4,E4,F4,D4,X,D4,D4,A3,E4,F4,A4", "" ],
  [ "偷,偷,的,看,着,你,_,偷,偷,的,隐,藏,着,自,己", "A4,#A4,A4,#A4,A4,F4,X,D4,F4,D4,C5,A4,C5,A4,G4", "" ],
  [ "如,果,你,愿,意,一,层,一,层", "C4,C4,C5,A4,G4,A4,C5,C5,F5", "" ],
  [ "一,层,的,剥,开,我,的,心", "E5,C5,G4,A4,G4,A4,G4,A4", "" ],
  [ "你,会,发,现,_,你,会,讶,异", "F4,D5,C5,D5,_,F4,C5,#A4,C5", "" ],
  [ "你,是,我,最,压,抑,最,深,处,的,秘,密", "D4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,#A4,A4,G4", "" ],
  [ "如,果,你,愿,意,一,层,一,层", "C4,C4,C5,A4,G4,A4,C5,C5,F5", "" ],
  [ "一,层,的,剥,开,我,的,心", "E5,C5,G4,A4,G4,A4,G4,A4", "" ],
  [ "你,会,鼻,酸,_,你,会,流,泪", "F4,D5,C5,D5,_,F4,C5,#A4,C5", "" ],
  [ "只,要,你,能,听,到,我,看,到,我,的,全,心,全,意", "D4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,G4,F4,F4", "" ],
  [ "听,你,说,你,和,你,的,他,们,暧,昧,的,空,气", "C3,C3,F3,F3,A3,A3,C4,C4,C3,G3,F3,E3,F3,D3", "" ],
  [ "我,和,我,的,绝,望,装,得,很,风,趣", "G3,G3,A3,A3,#A3,D3,G4,F4,G3,#A3,A3", "" ],
  [ "我,就,像,一,颗,洋,葱,_,永,远,是,配,角,戏", "D4,D4,A3,D4,E4,F4,D4,X,D4,D4,A3,E4,F4,A4", "" ],
  [ "多,希,望,能,与,你,_,有,一,秒,专,属,的,剧,情", "A4,#A4,A4,#A4,A4,F4,X,D4,F4,D4,C5,A4,C5,A4,G4", "" ],
  [ "如,果,你,愿,意,一,层,一,层", "C4,C4,C5,A4,G4,A4,C5,C5,F5", "" ],
  [ "一,层,的,剥,开,我,的,心", "E5,C5,G4,A4,G4,A4,G4,A4", "" ],
  [ "你,会,发,现,_,你,会,讶,异", "F4,D5,C5,D5,_,F4,C5,#A4,C5", "" ],
  [ "你,是,我,最,压,抑,最,深,处,的,秘,密", "D4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,#A4,A4,G4", "" ],
  [ "如,果,你,愿,意,一,层,一,层", "C4,C4,C5,A4,G4,A4,C5,C5,F5", "" ],
  [ "一,层,的,剥,开,我,的,心", "E5,C5,G4,A4,G4,A4,G4,A4", "" ],
  [ "你,会,鼻,酸,_,你,会,流,泪", "F4,D5,C5,D5,_,F4,C5,#A4,C5", "" ],
  [ "只,要,你,能,听,到,我,看,到,我,的,全,心,全,意,-,-", "D4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,G4,F4,F4,F4,G4", "" ],
  [ "wo,-,-,-,_,-,-,-,-", "F4,G4,G4,A4,X,C5,A4,G4,F4", "" ],
  [ "一,层,的,剥,开,我,的,心", "E5,C5,G4,A4,G4,A4,G4,A4", "" ],
  [ "你,会,发,现,_,你,会,讶,异", "F4,D5,C5,D5,_,F4,C5,#A4,C5", "" ],
  [ "你,是,我,最,压,抑,最,深,处,的,秘,密", "D4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,#A4,A4,G4", "" ],
  [ "如,果,你,愿,意,一,层,一,层", "C4,C4,C5,A4,G4,A4,C5,C5,F5", "" ],
  [ "一,层,的,剥,开,我,的,心,-", "E5,C5,C5,D5,C5,D5,C5,D5,C5", "" ],
  [ "你,会,鼻,酸,_,你,会,流,泪", "F4,D5,C5,D5,_,F4,C5,#A4,C5", "" ],
  [ "只,要,你,能,听,到,我,看,到,我,的,全,心,全,意", "D4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,G4,F4,F4", "" ],
  
  [ "你,会,鼻,酸,_,你,会,流,泪", "F4,D5,C5,D5,_,F4,C5,#A4,C5", "" ],
  [ "只,要,你,能,听,到,我,看,到,我,的,全,心,全,意", "D4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,#A4,#A4,A4,G4,F4,F4", "" ],
]

// 听海
// 张惠妹版 比 张学友版 +6 key
let DATA7 = [
  [ "写,信,告,诉,我,今,天,海,是,什,么,颜,色", "#A3,C4,C4,D4,D4,#A3,#D4,D4,C4,#A3,C4,D4,D4", "" ],
  [ "夜,夜,陪,著,你,的,海,心,情,又,如,何,-,-", "#A3,C4,C4,D4,D4,#A3,#D4,D4,C4,#A3,A4,F4,G4,F4", "" ],
  [ "灰,色,是,不,想,说,_,蓝,色,是,忧,郁", "F4,#D4,D4,#D4,G3,#D4,X,#D4,#D4,D4,C4,D4", "" ],
  [ "而,漂,泊,的,你,_,狂,浪,的,心,_,停,在,哪,里", "D4,D4,C4,#A3,C4,X,D4,C4,#A3,C4,X,C4,#A3,F4,C4", "" ],
  [ "写,信,告,诉,我,今,夜,你,想,要,梦,什,么", "#A3,C4,C4,D4,D4,#A3,#D4,D4,C4,#A3,C4,D4,D4", "" ],
  [ "梦,里,外,的,我,是,否,都,让,你,无,从,选,择", "#A3,C4,C4,D4,D4,#A3,#D4,D4,C4,#A3,A4,F4,D4,F4", "" ],
  [ "我,揪,著,一,颗,心,_,整,夜,都,闭,不,了,眼,睛", "F4,#D4,D4,#D4,G3,#D4,X,#D4,D4,C4,D4,F4,C4,D4,#A3", "" ],
  [ "为,何,你,明,明,动,了,情,_,却,又,不,靠,近", "#A3,C4,D4,D4,#D4,#D4,D4,C4,X,D4,C4,D4,C4,#A3", "" ],
  [ "听,_,海,哭,的,声,音", "F4,X,F4,C5,#A4,A4,#A4", "" ],
  [ "叹,惜,著,谁,又,被,伤,了,心,_,却,还,不,清,醒", "D4,#D4,F4,G4,G4,G4,G4,F4,G4,X,G4,G4,A4,#A4,C5", "" ],
  [ "一,定,不,是,我,_,至,少,我,很,冷,静", "A4,A4,A4,D4,F4,X,F4,D4,A4,#A4,A4,#A4", "" ],
  [ "可,是,泪,水,_,就,连,泪,水,_,也,都,不,相,信", "#A4,C5,D5,G4,X,#A4,C5,D5,G4,X,G4,D5,C5,#A4,C5", "" ],
  [ "听,_,海,哭,的,声,音", "F4,X,F4,C5,#A4,A4,#A4", "" ],
  [ "这,片,海,未,免,也,太,多,情,_,悲,泣,到,天,明", "D4,#D4,F4,G4,G4,G4,G4,F4,G4,X,G4,G4,A4,#A4,C5", "" ],
  [ "写,封,信,给,我,_,就,当,最,後,约,定", "A4,A4,A4,D4,F4,X,F4,D4,A4,#A4,A4,#A4", "" ],
  [ "说,你,在,离,开,我,的,时,候,_,是,怎,样,的,心,情", "#A4,C5,D5,G4,G4,F4,G4,A4,#A4,X,F4,#D5,D5,#A4,C5,#A4", "" ],
  [ "写,信,告,诉,我,今,夜,你,想,要,梦,什,么", "#A3,C4,C4,D4,D4,#A3,#D4,D4,C4,#A3,C4,D4,D4", "" ],
  [ "梦,里,外,的,我,是,否,都,让,你,无,从,选,择", "#A3,C4,C4,D4,D4,#A3,#D4,D4,C4,#A3,A4,F4,D4,F4", "" ],
  [ "我,揪,著,一,颗,心,_,整,夜,都,闭,不,了,眼,睛", "F4,#D4,D4,#D4,G3,#D4,X,#D4,D4,C4,D4,F4,C4,D4,#A3", "" ],
  [ "为,何,你,明,明,动,了,情,_,却,又,不,靠,近", "#A3,C4,D4,D4,#D4,#D4,D4,C4,X,D4,C4,D4,C4,#A3", "" ],
  [ "叹,惜,著,谁,又,被,伤,了,心,_,却,还,不,清,醒", "D4,#D4,F4,G4,G4,G4,G4,F4,G4,X,G4,G4,A4,#A4,C5", "" ],
  [ "一,定,不,是,我,_,至,少,我,很,冷,静", "A4,A4,A4,D4,F4,X,F4,D4,A4,#A4,A4,#A4", "" ],
  [ "可,是,泪,水,_,就,连,泪,水,_,也,都,不,相,信", "#A4,C5,D5,G4,X,#A4,C5,D5,G4,X,G4,D5,C5,#A4,C5", "" ],
  [ "听,_,海,哭,的,声,音", "F4,X,F4,C5,#A4,A4,#A4", "" ],
  [ "这,片,海,未,免,也,太,多,情,_,悲,泣,到,天,明", "D4,#D4,F4,G4,G4,G4,G4,F4,G4,X,G4,G4,A4,#A4,C5", "" ],
  [ "写,封,信,给,我,_,就,当,最,後,约,定", "A4,A4,A4,D4,F4,X,F4,D4,A4,#A4,A4,#A4", "" ],
  [ "说,你,在,离,开,我,的,时,候,_,是,怎,样,的,心,情", "#A4,C5,D5,G4,G4,F4,G4,A4,#A4,X,F4,#D5,D5,#A4,C5,#A4", "" ],

]

let g_flashcards = [];

let g_lines = [];

let DATASETS = [ DATA7, DATA6, DATA5, DATA4, DATA3, DATA2, DATA1, DATA0 ];

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
    this.line = the_data[0];
    this.notes = the_data[1];
    this.delta_semitones = parseInt(the_data[2]);
    this.words = this.line.split(",");
    this.min_note = MIN_NOTE;//48;
    this.max_note = MAX_NOTE;//85;
    
    this.pos = new p5.Vector(0, 0); // 左上角
    
    if (VIZ_METHOD == 2) { this.PrepareTexture2(has_yscale); }
    else { this.PrepareTexture(has_yscale); }
  }
  
  // 新型 viz 方式
  PrepareTexture2(has_yscale = false) {
    let w = 220;
    if (has_yscale == true) {
      w = 32;
      this.g = createGraphics(w, 64);
      this.g.background(128, random(0,128), random(0, 128));
      return;
    }
    
    const TEXT_SIZE = 16;
    const WAVE_HEIGHT = 48;
    const WORD_HEIGHT = TEXT_SIZE * 2;
    const SPACE_INCREMENT = TEXT_SIZE/2;
    const PAD = 3;
    
    push();
    textSize(TEXT_SIZE);
    w = 0;
    for (let i=0; i<this.words.length; i++) {
      if (this.words[i] == "_") { w += SPACE_INCREMENT; }
      else if (this.words == "\r") { w = 0; }
      else { w += textWidth(this.words[i]); }
    }
    pop();
    
    // 将一行文字展开成多行文字，最多两行，超过两行就不管了
    let lines = [];
    for (let i=0; i<this.words.length; i++) {
      
    }
    
    this.g = createGraphics(w + 2*PAD, WAVE_HEIGHT + WORD_HEIGHT + 2*PAD);
    this.g.background("rgba(0,0,0,0)");
    let g = this.g;
    
    {
      let delta_y = 0;
      let x = PAD, x_prev = PAD, y_prev;
      let is_first_segment = false;
      for (let i=0; i<this.words.length; i++) {
        if (this.words[i] == "_") { 
          x += SPACE_INCREMENT; 
          x_prev = x;
          is_first_segment = true;
        } else if (this.words == "\r") { 
          x = 0;
          x_prev = x;
          delta_y += TEXT_SIZE;
          is_first_segment = true;
        } else {
          // 文字部分
          g.noStroke();
          g.fill("#f9f");
          g.textAlign(LEFT, TOP);
          g.textSize(TEXT_SIZE);
          g.text(this.words[i], x, WAVE_HEIGHT + delta_y + PAD);

          x += g.textWidth(this.words[i]);
          // 音高线部分
          g.stroke("#f9f");
          let note;
          if (this.notes[i] != "0") {
            note = ToMidiNoteNumber(this.notes[i]);
            const y = PAD + WAVE_HEIGHT * (1 - (note - this.min_note) / (this.max_note - this.min_note));
            g.line(x_prev, y, x, y);
            console.log(x_prev + ", " + y + ", " + x + ", " + y);
            if (!is_first_segment) {
              
            }
            y_prev = y;
            is_first_segment = true;
          } else {
            is_first_segment = true;
          }
          
          x_prev = x;
        }
      }
    }
  }
  
  PrepareTexture(has_yscale = false) {
    let note_numbers = [];
    
    let notes = this.notes;
    let line = this.line;
    let delta_semitones = this.delta_semitones;
    let words = this.words;
    const x_increment = 32;
    
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
    const text_size = 24;
    const note_text_size = 14;
    
    // 数一数X的范围
    push();
    textSize(text_size);
    let max_x = 0;
    {
      let width = 0;
      for (let i=0; i<words.length; i++) {
        if (words[i] == "\r") {
          width = 0; continue;
        } else {
          width = width + x_increment;
        }
        max_x = max(max_x, width);
      }
    }
    pop();
    
    this.w = min(width, max_x + 15);
    this.h = 300;
    
    let y0 = 5, y1 = this.h-5;
    let x0 = 5, x1 = this.w-5;
    
    this.g = createGraphics(this.w, this.h);
    let g = this.g;
    g.clear();
    //g.background(220);
    g.noFill();
    g.stroke(32);
    g.rect(0, 0, g.width-1, g.height-1);
    
    
    g.stroke(Y_GRID_COLOR);
    g.fill(0);
    
    for (let n=this.min_note; n<=this.max_note; n++) {
      let y = y1+(y0-y1)*(n-this.min_note)/(this.max_note-this.min_note);
      g.line(x0, y, x1, y);
    }
    
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
    //if (x_increment > (x1-x0)/N) { x_increment = (x1-x0)/N; }
    let x = text_x0;
    
    for (let i=0; i<N; i++) {
      g.textAlign(LEFT, BOTTOM);
      
      // 回退
      if (words[i] == "\r") { 
        x = text_x0; 
        continue;
      }
      
      let x_next = x + x_increment;
      if (notes[i] != "X") {
        
        let note = undefined;
        let dy0 = (y0 + y1)/2;
        let dy1 = dy0;
        if (notes[i] != "0") {
          note = ToMidiNoteNumber(notes[i]);
          dy0 = y1 + (y0-y1) * (note - this.min_note) / (this.max_note - this.min_note);
          dy1 = dy0 + (y0-y1) / (this.max_note - this.min_note);
        }

        g.noStroke();
        g.fill(FONTCOLOR2);
        g.textSize(text_size);
        g.text(words[i].trim(), x + text_offset, dy1-1);

        // 音块
        if (notes[i] != "0") {
          
          // 音高文字
          g.textAlign(LEFT, TOP);
          g.fill(COLOR0);
          g.textSize(note_text_size)
          g.text(notes[i], x + text_offset, dy0 + 2);
          
          g.stroke(128);
          g.fill(COLOR0)
          g.rectMode(CORNERS);
          g.rect(x, dy1, x_next, dy0);

          if (!(isNaN(delta_semitones)) && (note != undefined)) {
            let note1 = note + delta_semitones;
            dy0 = y1 + (y0-y1) * (note1 - this.min_note) / (this.max_note - this.min_note);
            dy1 = dy0 + (y0-y1) / (this.max_note - this.min_note);
            g.fill(COLOR1);
            g.rect(x, dy1, x_next, dy0);
          }
        }
      }
      
      x = x_next;
    }
  }
  
  Render() {
    if (g_line_idx == this.index) {
      push();
      rectMode(CORNER);
      fill(FLASHCARD_HIGHLIGHT_COLOR);
      rect(this.pos.x, this.pos.y, this.g.width, this.g.height);
      pop();
    }
    image(this.g, this.pos.x, this.pos.y);
  }
}

function ScrollToEnd() {
  //g_dy_target = -DATASETS[g_data_idx].length*200+200;
  g_dx_target = g_flashcards[g_flashcards.length-1].pos.x - (width/2 - g_fc_scale.g.width/2);
  g_dx = g_dx_target;
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
      
      if (words[j] == "\r") break;
      
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
  createCanvas(1600, 640);
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
  
  const THRESH = width/2;
  if (abs(g_dx_target - g_dx) > THRESH) { g_dx = lerp(g_dx, g_dx_target, 0.5); };
  
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
  
  background(BGCOLOR);
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
  fill(BGCOLOR);
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
      if (lidx == g_line_idx) { fill(FONTCOLOR1); }
      else fill(FONTCOLOR0);
      text(g_lines[lidx], width/2, y)
    }
  }
  pop();
  
  noStroke();
  fill(FONTCOLOR0);
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