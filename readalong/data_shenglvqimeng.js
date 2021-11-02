const DATA = [
  [
    [ "春眠不觉晓", "chun mian bu jue xiao" ],
    [ "处处闻啼鸟", "chu chu wen ti niao" ],
    [ "夜来风雨声", "ye lai feng yu sheng" ],
    [ "花落知多少", "hua luo zhi duo shao" ] ,
  ],
  [
    [ "爆竹声中一岁除", "bao zhu sheng zhong yi sui chu" ],
    [ "春风送暖入屠苏", "chun feng song nuan ru tu su" ],
    [ "千门万户曈曈日", "qian men wan hu tong tong ri" ],
    [ "总把新桃换旧符", "zong ba xin tao huan jiu fu" ],
  ],
  [
    [ "煮豆燃豆萁", "zhu dou ran dou qi" ],
    [ "豆在釡中泣", "dou zai fu zhong qi" ],
    [ "本是同根生", "ben shi tong gen sheng" ],
    [ "相煎何太急", "xiang jian he tai ji" ] ,
  ],
  [
    [ "云对雨，雪对风，晚照对晴空。", "yun dui yu xue dui feng wan zhao dui qing kong" ],
    [ "来鸿对去雁，宿鸟对鸣虫。", "lai hong dui qu yan su niao dui ming chong" ],
    [ "三尺剑，六钧弓。岭北对江东。", "san chi jian liu jun gong ling bei dui jiang dong" ],
    [ "人间清暑殿，天上广寒宫。", "ren jian qing shu dian tian shang guang han gong"],
    [ "两岸晓烟杨柳绿，一园春雨杏花红。", "liang an xiao yan yang liu lv yi yuan chun yu xing hua hong" ],
    [ "两鬓风霜，途次早行之客", "liang bin feng shuang tu ci zao xing zhi ke" ],
    [ "一蓑烟雨，溪边晚钓之翁。", "yi suo yan yu xi bian wan diao zhi weng" ],
    [ "沿对革，异对同。白叟对黄童。", "yan dui ge yi dui tong bai sou dui huang tong" ],
    [ "江风对海雾，牧子对渔翁。", "jiang feng dui hai wu mu zi dui yu weng"],
    [ "颜巷陋，阮途穷。冀北对辽东。", "yan xiang lou ruan tu qiong ji bei dui liao dong"],
    [ "池中濯足水，门外打头风。", "chi zhong zhuo zu shui men wai da tou feng"],
    [ "梁帝讲经同泰寺，汉皇置酒未央宫。", "liang di jiang jing tong tai si han huang zhi jiu wei yang gong"],
    [ "尘虑萦心，懒抚七弦绿绮；", "chen lv yin xin lan fu qi xian lv qi" ],
    [ "霜华满鬓，羞看百炼青铜。", "shuang hua man bin xiu kan bai lian qing tong" ],
    [ "贫对富，塞对通。野叟对溪童。", "pin dui fu se dui tong ye sou dui xi tong" ],
    [ "鬓皤对眉绿，齿皓对唇红。", "bin po dui mei lv chi hao dui chun hong" ],
    [ "天浩浩，日融融。佩剑对弯弓。", "tian hao hao ri rong rong pei jian dui wan gong"],
    [ "半溪流水绿，千树落花红。", "ban xi liu shui lv qian shu luo hua hong"],
    [ "野渡燕穿杨柳雨，芳池鱼戏芰荷风。", "ye du yan chuan yang liu yu fang chi yu xi ji he feng"],
    [ "女子眉纤，额下现一弯新月；", "nv zi mei xian e xia xian yi wan xin yue" ],
    [ "男儿气壮，胸中吐万丈长虹。", "nan er qi zhuang xiong zhong tu wan zhang chang hong"]
  ],
  [
    [ "春对夏，秋对冬。暮鼓对晨钟。", "chun dui xia qiu dui dong mu gu dui chen zhong" ],
    [ "观山对玩水，绿竹对苍松。", "guan shan dui wan shui lv zhu dui cang song" ],
    [ "冯妇虎，叶公龙。舞蝶对鸣蛩。", "feng fu hu ye gong long wu die dui ming qiong" ],
    [ "衔泥双紫燕，课蜜几黄蜂。", "xian ni shuang zi yan ke mi ji huang feng" ],
    [ "春日园中莺恰恰，秋天寒外雁雍雍。", "chun ri yuan zhong ying qia qia qiu tian sai wai yan yong yong" ],
    [ "秦岭云横，迢递八千远路；", "qin ling yun heng tiao di ba qian yuan lu" ],
    [ "巫山雨洗，嵯峨十二危峰。", "wu shan yu xi cuo e shi er wei feng" ],
    [ "明对暗，淡对浓。上智对中庸。", "ming dui an dan dui nong shang zhi dui zhong yong" ],
    [ "镜奁对衣笥，野杵对村舂。", "jing lian dui yi si ye chu dui cun chong" ],
    [ "花灼烁，草蒙茸。九夏对三冬。", "hua zhuo shuo cao meng rong jiu xia dui san dong" ],
    [ "台高名戏马，斋小号蟠龙。", "tai gao ming xi ma zhai xiao hao pan long" ],
    [ "手擘蟹螯从毕卓，身披鹤氅自王恭。", "shou bo xie ao cong bi zhuo shen pi he chang zi wang gong" ],
    [ "五老峰高，秀插云霄如玉笔；", "wu lao feng gao xiu cha yun xiao ru yu bi" ],
    [ "三姑石大，响传风雨若金镛。", "san gu shi da xiang chuan feng yu ruo jin yong" ],
    [ "仁对义，让对恭。禹舜对羲农。", "ren dui yi rang dui gong yu shun dui xi nong" ],
    [ "雪花对云叶，芍药对芙蓉。", "xue hua dui yun ye shao yao dui fu rong" ],
    [ "陈后主，汉中宗。绣虎对雕龙。", "chen hou zhu han zhong zong xiu hu dui diao long" ],
    [ "柳塘风淡淡，花圃月浓浓。", "liu tang feng dan dan hua pu yue nong nong" ],
    [ "春日正宜朝看蝶，秋风那更夜闻蛩。", "chun ri zheng yi zhao kan die qiu feng na geng ye wen qiong" ],
    [ "战士邀功，必借干戈成勇武；", "zhan shi yao gong bi jie gan ge cheng yong wu" ],
    [ "逸民适志，须凭诗酒养疏慵。", "yi min shi zhi xiang chuan feng yu ruo jin yong" ],
  ],
  [
    [ "楼对阁，户对窗。巨海对长江。", "lou dui ge hu dui chuang ju hai dui chang jiang" ],
    [ "蓉裳对蕙帐，玉斝对银釭。", "rong chang dui hui zhang yu jia dui yin gang" ],
    [ "青布幔，碧油幢。宝剑对金缸。", "qing bu man bi you zhuang bao jian dui jin gang" ],
    [ "忠心安社稷，利口覆家邦。", "zhong xin an she ji li kou fu jia bang" ],
    [ "世祖中兴延马武，桀王失道杀龙逄。", "shi zu zhong xing yan ma wu jie wang shi dao sha long tang" ],
    [ "秋雨潇潇，漫烂黄花都满径；", "qiu yu xiao xiao man lan huang hua dou man jing" ],
    [ "春风袅袅，扶疏绿竹正盈窗。", "chun feng niao niao fu shu lv zhu zheng ying chuang" ],
    [ "旌对旆，盖对幢。故国对他邦。", "jing dui pei gai dui zhuang gu guo dui ta bang" ],
    [ "千山对万水，九泽对三江。", "qian shan dui wan shui jiu ze dui san jiang" ],
    [ "山岌岌，水淙淙。鼓振对钟撞。", "shan ji ji shui cong cong gu zhen dui zhong zhuang" ],
    [ "清风生酒舍，皓月照书窗。", "qing feng sheng jiu she hao yue zhao shu chuang" ],
    [ "阵上倒戈辛纣战，道旁系剑子婴降。", "zhen shang dao ge xin zhou zhan dao pang ji jian zi ying xiang" ],
    [ "夏日池塘，出没浴波鸥对对；", "xia ri chi tang chu mo yu bo ou dui dui" ],
    [ "春风帘幕，往来营垒燕双双。", "chun feng lian mu wang lai ying lei yan shuanug shuang" ],
    [ "铢对两，只对双。华岳对湘江。", "zhu dui liang zhi dui shuang hua yue dui xiang jiang" ],
    [ "朝车对禁鼓，宿火对寒缸。", "chao che dui jin gu su huo dui han gang" ],
    [ "青琐闼，碧纱窗。汉社对周邦。", "qing suo ta bi sha chuang han she dui zhou bang" ],
    [ "笙箫鸣细细，钟鼓响摐摐。", "sheng xiao ming xi xi zhong gu xiang chuang chuang" ],
    [ "主簿栖鸾名有览，治中展骥姓惟庞。", "zhu bu qi luan ming you lan zhi zhong zhan ji xing wei pang" ],
    [ "苏武牧羊，雪屡餐于北海；", "su wu mu yang xue lv can yu bei hai" ],
    [ "庄周活鲋，水必决于西江。", "zhuang zhou huo fu shui bi jue yu xi jiang" ],
  ],
  [
    [ "茶对酒，赋对诗。燕子对莺儿。", "cha dui jiu fu dui shi yan zi dui ying er" ],
    [ "栽花对种竹，落絮对游丝。", "zai hua dui zhong zhu luo xu dui you si" ],
    [ "四目颉，一足夔。鸲鹆对鹭鸶。", "si mu jie yi zu kui qu yu dui lu si" ],
    [ "半池红菡萏，一架白荼縻。", "ban chi hong han dan yi jia bai tu mi" ],
    [ "几阵秋风能应候，一犁春雨甚知时。", "ji zhen qiu feng neng ying hou yi li chun yu shen zhi shi" ],
    [ "智伯恩深，国士吞变形之炭；", "zhi bo en shen guo shi tun bian xing zhi tan" ],
    [ "羊公德大，邑人竖堕泪之碑。", "yang gong de da yi ren shu duo lei zhi bei" ],
    [ "行对止，速对迟。舞剑对围棋。", "xing dui zhi su dui chi wu jian dui wei qi" ],
    [ "花笺对草字，竹简对毛锥。", "hua jian dui cao zi zhu jian dui mao zhui" ],
    [ "汾水鼎，岘山碑。虎豹对熊罴。", "fen shui ding xian shan bei hu bao dui xiong pi" ],
    [ "花开红锦绣，水漾碧琉璃。", "hua kai hong jin xiu shui yang bi liu li" ],
    [ "去妇因探邻舍枣，出妻为种后园葵。", "qu fu yin tan ling she zao chu qi wei zhong hou yuan kui" ],
    [ "笛韵和谐，仙管恰从云里降；", "di yun he xie xian guan qia cong yun li jiang" ],
    [ "橹声咿轧，渔舟正向雪中移。", "lu sheng yi ya yu zhou zheng xiang xue zhong yi" ],
    [ "戈对甲，鼓对旗。紫燕对黄鹂。", "ge dui jia gu dui qi zi yan dui huang li" ],
    [ "梅酸对李苦，青眼对白眉。", "mei suan dui li ku qing yan dui bai mei" ],
    [ "三弄笛，一围棋。雨打对风吹。", "san nong di yi wei qi yu da dui feng chui" ],
    [ "海棠春睡早，杨柳昼眠迟。", "hai tang chun shui zao yang liu zhou mian chi" ],
    [ "张骏曾为槐树赋，杜陵不作海棠诗。", "zhang jun ceng wei huai shu fu du ling bu zuo hai tang shi" ],
    [ "晋士特奇，可比一斑之豹；", "jin shi te qi ke bi yi ban zhi bao" ],
    [ "唐儒博识，堪为五总之龟。", "tang ru bo shi kan wei wu zong zhi gui" ],
  ],
  [
    [ "来对往，密对稀。燕舞对莺飞。", "lai dui wang mi dui xi yan wu dui ying fei" ],
    [ "风清对月朗，露重对烟微。", "feng qing dui yue lang lu zhong dui yan wei" ],
    [ "霜菊瘦，雨梅肥。客路对渔矶。", "shuang ju shou yu mei fei ke lu dui yu ji" ],
    [ "晚霞舒锦绣，朝露缀珠玑。", "wan xia shu jin xiu zhao lu zhui zhu ji" ],
    [ "夏暑客思欹石枕，秋寒妇念寄边衣。", "xia shu ke si qi shi zhen qiu han fu nian ji bian yi" ],
    [ "春水才深，青草岸边渔父去；", "chun shui cai shen qing cao an bian yu fu qu" ],
    [ "夕阳半落，绿莎原上牧童归。", "xi yang ban luo lv suo yuan shang mu tong gui" ],
    [ "宽对猛，是对非。服美对乘肥。", "kuan dui meng shi dui fei fu mei dui sheng fei" ],
    [ "珊瑚对玳瑁，锦绣对珠玑。", "shan hu dui dai mao jin xiu dui zhu ji" ],
    [ "桃灼灼，柳依依。绿暗对红稀。", "tao zhuo zhuo liu yi yi lv an dui hong xi" ],
    [ "窗前莺并语，帘外燕双飞。", "chuang qian ying bing yu lian wai yan shuang fei" ],
    [ "汉致太平三尺剑，周臻大定一戎衣。", "han zhi tai ping san chi jian zhou zhen da ding yi rong yi" ],
    [ "吟成赏月之诗，只愁月堕；", "yin cheng shang yue zhi shi zhi chou yue duo" ],
    [ "斟满送春之酒，惟憾春归。", "zhen man song chun zhi jiu wei han chun gui" ],
    [ "声对色，饱对饥。虎节对龙旗。", "sheng dui se bao dui ji hu jie dui long qi" ],
    [ "杨花对桂叶，白简对朱衣。", "yang hua dui gui ye bai jian dui zhu yi" ],
    [ "尨也吠，燕于飞。荡荡对巍巍。", "mang ye fei yan yu fei dang dang dui wei wei" ],
    [ "春暄资日气，秋冷借霜威。", "chun xuan zi ri qi qiu leng jie shuang wei" ],
    [ "出使振威冯奉世，治民异等尹翁归。", "chu shi zhen wei feng feng shi zhi min yi deng yin weng gui" ],
    [ "燕我弟兄，载咏棣棠韡韡；", "yan wo di xiong zai yong di tang wei wei" ],
    [ "命伊将帅，为歌杨柳依依。", "ming yi jiang shuai wei ge yang liu yi yi" ],
  ],
  [
    [ "无对有，实对虚。作赋对观书。", "wu dui you shi dui xu zuo fu dui guan shu" ],
    [ "绿窗对朱户，宝马对香车。", "lv chuang dui zhu hu bao ma dui xiang ju" ],
    [ "伯乐马，浩然驴。弋雁对求鱼。", "bo le ma hao ran lv yi yan dui qiu yu" ],
    [ "分金齐鲍叔，奉璧蔺相如。", "fen jin qi bao shu feng bi lin xiang ru" ],
    [ "掷地金声孙绰赋，回文锦字窦滔书。", "zhi di jin sheng sun chuo fu hui wen jin zi dou tao shu" ],
    [ "未遇殷宗，胥靡困傅岩之筑；", "wei yu yin zong xu mi kun fu yan zhi zhu" ],
    [ "既逢周后，太公舍渭水之渔。", "ji feng zhou hou tai gong she wei shui zhi yu" ],
    [ "终对始，疾对徐。短褐对华裾。", "zhong dui shi ji dui xu duan he dui hua ju" ],
    [ "六朝对三国，天禄对石渠。", "liu chao dui san guo tian lu dui shi qu" ],
    [ "千字策，八行书。有若对相如。", "qian zi ce ba hang shu you ruo dui xiang ru" ],
    [ "花残无戏蝶，藻密有潜鱼。", "hua can wu xi die zao mi you qian yu" ],
    [ "落叶舞风高复下，小荷浮水卷还舒。", "luo ye wu feng gao fu xia xiao he fu shui juan huan shu" ],
    [ "爱见人长，共服宣尼休假盖；", "ai xian ren chang gong fu xuan ni xiu jia gai"],
    [ "恐彰已吝，谁知阮裕竟焚车。", "kong zhang ji lin shei zhih ruan yu jing fen ju" ],
    [ "麟对凤，鳖对鱼。内史对中书。", "lin dui feng bie dui yu nei shi dui zhong shu" ],
    [ "犁锄对耒耜，畎浍对郊墟。", "li chu dui lei zi quan hui dui jiao xu" ],
    [ "犀角带，象牙梳。驷马对安车。", "xi jiao dai xiang ya shu si ma dui an ju" ],
    [ "青衣能报赦，黄耳解传书。", "qing yi neng bao she huang er jie chuan shu" ],
    [ "庭畔有人持短剑，门前无客曳长裾。", "ting pan you ren chi duan jian men qian wu ke ye chang ju" ],
    [ "波浪拍船，骇舟人之水宿；", "bo lang pai chuan hai zhou ren zhi shui su" ],
    [ "峰峦绕舍，乐隐者之山居。", "feng luan rao she yao yin zhe zhi shan ju" ],
  ],
  [
    [ "金对玉，宝对珠。玉兔对金乌。", "jin dui yu bao dui zhu yu tu dui jin wu" ],
    [ "孤舟对短棹，一雁对双凫。", "gu zhou dui duan zhao yi yan dui shuang fu" ],
    [ "横醉眼，捻吟须。李白对杨朱。", "heng zui yan nian yin xu li bai dui yang zhu" ],
    [ "秋霜多过雁，夜月有啼乌。", "qiu shuang duo guo yan ye yue you ti wu" ],
    [ "日暖园林花易赏，雪寒村舍酒难沽。", "ri nuan yuan lin hua yi shang xue han cun she jiu nan gu" ],
    [ "人处岭南，善探巨象口中齿；", "ren chu ling nan shan tan ju xiang kou zhong chi" ],
    [ "客居江右，偶夺骊龙颔下珠。", "ke ju jiang you ou duo li long han xian zhu" ],
    [ "贤对圣，智对愚。傅粉对施朱。", "xian dui sheng zhi dui yu fu fen dui shi zhu" ],
    [ "名缰对利锁，挈榼对提壶。", "ming jiang dui li suo qie ke dui ti hu" ],
    [ "鸠哺子，燕调雏。石帐对郇厨。", "jiu bu zi yan tiao chu shi zhang dui xun chu" ],
    [ "烟轻笼岸柳，风急撼庭梧。", "yan qing long an liu feng ji han ting wu" ],
    [ "鸜眼一方端石砚，龙涎三炷博山垆。", "qu yan yi fang duan shi yan long xian san zhu bo shan lu" ],
    [ "曲沼鱼多，可使渔人结网；", "qu zhao yu duo ke shi yu ren jie wang" ],
    [ "平田兔少，漫劳耕者守株。", "ping tian tu shao man lao geng zhe shou zhu" ], 
    [ "秦对赵，越对吴。钓客对耕夫。", "qin dui zhao yue dui wu diao ke dui geng fu" ],
    [ "箕裘对杖履，杞梓对桑榆。", "ji qiu dui zhang lv qi zi dui sang yu" ],
    [ "天欲晓，日将晡。狡兔对妖狐。", "tian yu xiao ri jiang bu jiao tu dui yao hu" ],
    [ "读书甘刺股，煮粥惜焚须。", "du shu gan ci gu zhu zhou xi fen xu" ],
    [ "韩信武能平四海，左思文足赋三都。", "han xin wu neng ping si hai zuo si wen zu fu san du" ],
    [ "嘉遁幽人，适志竹篱茅舍；", "jia dun you ren shi zhi zhu li mao she" ],
    [ "胜游公子，玩情柳陌花衢。", "sheng you gong zi wan qing liu mo hua qu" ]
  ],
  [
    [ "岩对岫，涧对溪，远岸对危堤。", "yan dui xiu jian dui xi yuan an dui wei di" ],
    [ "鹤长对凫短，水雁对山鸡。", "he chang dui fu duan shui yan dui shan ji" ],
    [ "星拱北，月流西，汉露对汤霓。", "xing gong bei yue liu xi han lu dui tang ni" ],
    [ "桃林牛已放，虞坂马长嘶。", "tao lin niu yi fang yu ban fa chang si" ],
    [ "叔侄去官闻广受，弟兄让国有夷齐。", "shu zhi qu guan wen guang shou di xiong rang guo you yi qi" ],
    [ "三月春浓，芍药丛中蝴蝶舞；", "san yue chun nong shao yao cong zhong hu die wu" ],
    [ "五更天晓，海棠枝上子规啼。", "wu geng tian xiao hai tang zhi shang zi gui ti" ],
    [ "云对雨，水对泥，白璧对玄圭。", "yun dui yu shui dui ni bai bi dui xuan gui" ],
    [ "献瓜对投李，禁鼓对征鼙。", "xian gua dui tou li jin gu dui zheng pi" ],
    [ "徐稚榻，鲁班梯，凤翥对鸾栖，", "xu zhi ta lu ban ti feng zhu dui luan qi" ],
    [ "有官清似水，无客醉如泥。", "you guan qing si shui wu ke zui ru ni" ],
    [ "截发惟闻陶侃母，断机只有乐羊妻。", "jie fa wei wen tao kan mu duan ji zhi you yue yang qi" ],
    [ "秋望佳人，目送楼头千里雁；", "qiu wang jia ren mu song lou tou qian li yan" ],
    [ "早行远客，梦惊枕上五更鸡。", "zao xing yuan ke meng jing zhen shang wu geng ji" ],
    [ "熊对虎，象对犀，霹雳对虹霓。", "xiong dui hu xiang dui xi pi li dui hong ni" ],
    [ "杜鹃对孔雀，桂岭对梅溪。", "du juan dui kong que gui ling dui mei xi" ],
    [ "萧史凤，宋宗鸡，远近对高低。", "xiao shi feng song zong ji yuan jin dui gao di" ],
    [ "水寒鱼不跃，林茂鸟频栖。", "shui han yu bu yue lin mao niao pin qi" ],
    [ "杨柳和烟彭泽县，桃花流水武陵溪。", "yang liu he yan peng ze xian tao hua liu shui wu ling xi" ],
    [ "公子追欢，闲骤玉骢游绮陌；", "gong zi zhui huan xian zhou yu cong you qi mo" ],
    [ "佳人倦绣，闷欹珊枕掩香闺。", "jia ren juan xiu men qi shan zhen yan xiang gui" ],
  ]
]

const TITLES = [
  "春晓\n唐 孟浩然",
  "元日\n宋 王安石",
  "七步诗\n三国 曹植",
  "声律启蒙 卷上 一东\n清 车万育",
  "声律启蒙 卷上 二冬\n清 车万育",
  "声律启蒙 卷上 三江\n清 车万育",
  "声律启蒙 卷上 四支\n清 车万育",
  "声律启蒙 卷上 五微\n清 车万育",
  "声律启蒙 卷上 六鱼\n清 车万育",
  "声律启蒙 卷上 七虞\n清 车万育",
  "声律启蒙 卷上 八齐\n清 车万育",
]

const FONT_SIZES = [
  36, 36, 36,
  24,24,24,24,24,24,24,24
]
