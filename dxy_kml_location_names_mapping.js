const DxyAndKMLLocationNames = [
  [ "China", 0, [ "全国" ] ],
  [ "Anhui", 1, [ "安徽省" ] ],
]

// 丁香园的路径 ---> KML的路径
var g_dxy2kml_paths = {
  "全国": "China",
  "全国/安徽省": "China/Anhui",
  "全国/北京市": "China/Beijing",
  "全国/重庆市": "China/Chongqing",
  "全国/福建省": "China/Fujian",
  "全国/甘肃省": "China/Gansu",
  "全国/广东省": "China/Guangdong",
  "全国/广西省": "China/Guangxi",
  "全国/贵州省": "China/Guizhou",
  "全国/海南省": "China/Hainan",
  "全国/河北省": "China/Hebei",
  "全国/黑龙江省": "China/Heilongjiang",
  "全国/河南省": "China/Henan",
  "全国/河南省/安阳（含滑县）": "China/Henan/Anyang",
  "全国/河南省/鹤壁": "China/Henan/Hebi",
  "全国/河南省/焦作": "China/Henan/Jiaozuo",
  "全国/河南省/济源": "China/Henan/Jiyuan shi",
  "全国/河南省/开封": "China/Henan/Kaifeng",
  "全国/河南省/漯河": "China/Henan/Luohe",
  "全国/河南省/洛阳": "China/Henan/Luoyang",
  "全国/河南省/南阳（含邓州）": "China/Henan/Nanyang",
  "全国/河南省/平顶山": "China/Henan/Pingdingshan",
  "全国/河南省/濮阳": "China/Henan/Puyang",
  "全国/河南省/三门峡": "China/Henan/Sanmenxia",
  "全国/河南省/商丘（含永城）": "China/Henan/Shangqiu",
  "全国/河南省/新乡（含长垣）": "China/Henan/Xinxiang",
  "全国/河南省/信阳": "China/Henan/Xinyang",
  "全国/河南省/许昌": "China/Henan/Xuchang",
  "全国/河南省/郑州": "China/Henan/Zhengzhou",
  "全国/河南省/周口": "China/Henan/Zhoukou",
  "全国/河南省/驻马店": "China/Henan/Zhumadian",
  "全国/湖北省": "China/Hubei",
  "全国/湖北省/恩施州": "China/Hubei/Enshi Tujia and Miao",
  "全国/湖北省/鄂州": "China/Hubei/Ezhou",
  "全国/湖北省/黄冈": "China/Hubei/Huanggang",
  "全国/湖北省/黄石": "China/Hubei/Huangshi",
  "全国/湖北省/荆门": "China/Hubei/Jingmen",
  "全国/湖北省/荆州": "China/Hubei/Jingzhou",
  "全国/湖北省/潜江": "China/Hubei/Qianjiang",
  "全国/湖北省/神农架林区": "China/Hubei/Shennongjia",
  "全国/湖北省/十堰": "China/Hubei/Shiyan",
  "全国/湖北省/随州": "China/Hubei/Suizhou Shi",
  "全国/湖北省/天门": "China/Hubei/Tianmen",
  "全国/湖北省/武汉": "China/Hubei/Wuhan",
  "全国/湖北省/襄樊": "China/Hubei/Xiangfan",
  "全国/湖北省/咸宁": "China/Hubei/Xianning",
  "全国/湖北省/仙桃": "China/Hubei/Xiantao",
  "全国/湖北省/孝感": "China/Hubei/Xiaogan",
  "全国/湖北省/宜昌": "China/Hubei/Yichang",
  "全国/湖南省": "China/Hunan",
  "全国/湖南省/常德": "China/Hunan/Changde",
  "全国/湖南省/长沙": "China/Hunan/Changsha",
  "全国/湖南省/彬州": "China/Hunan/Chenzhou",
  "全国/湖南省/衡阳": "China/Hunan/Hengyang",
  "全国/湖南省/怀化": "China/Hunan/Huaihua",
  "全国/湖南省/娄底": "China/Hunan/Loudi",
  "全国/湖南省/邵阳": "China/Hunan/Shaoyang",
  "全国/湖南省/湘潭": "China/Hunan/Xiangtan",
  "全国/湖南省/湘西自治州": "China/Hunan/Xiangxi Tujia and Miao",
  "全国/湖南省/益阳": "China/Hunan/Yiyang",
  "全国/湖南省/永州": "China/Hunan/Yongzhou",
  "全国/湖南省/岳阳": "China/Hunan/Yueyang",
  "全国/湖南省/张家界": "China/Hunan/Zhangjiajie",
  "全国/湖南省/株洲": "China/Hunan/Zhuzhou",
  "全国/江苏省": "China/Jiangsu",
  "全国/江苏省/常州": "China/Jiangsu/Changzhou",
  "全国/江苏省/淮安": "China/Jiangsu/Huai'an",
  "全国/江苏省/连云港": "China/Jiangsu/Lianyungang",
  "全国/江苏省/南京": "China/Jiangsu/Nanjing",
  "全国/江苏省/南通": "China/Jiangsu/Nantong",
  "全国/江苏省/宿迁": "China/Jiangsu/Suqian",
  "全国/江苏省/苏州": "China/Jiangsu/Suzhou",
  "全国/江苏省/泰州": "China/Jiangsu/Taizhou",
  "全国/江苏省/无锡": "China/Jiangsu/Wuxi",
  "全国/江苏省/徐州": "China/Jiangsu/Xuzhou",
  "全国/江苏省/盐城": "China/Jiangsu/Yancheng",
  "全国/江苏省/扬州": "China/Jiangsu/Yangzhou",
  "全国/江苏省/镇江": "China/Jiangsu/Zhenjiang",
  "全国/江西省": "China/Jiangxi",
  "全国/江西省/抚州": "China/Jiangxi/Fuzhou",
  "全国/江西省/赣州": "China/Jiangxi/Ganzhou",
  "全国/江西省/吉安": "China/Jiangxi/Ji'an",
  "全国/江西省/景德镇": "China/Jiangxi/Jingdezhen",
  "全国/江西省/九江": "China/Jiangxi/Jiujiang",
  "全国/江西省/南昌": "China/Jiangxi/Nanchang",
  "全国/江西省/萍乡": "China/Jiangxi/Pingxiang",
  "全国/江西省/上饶": "China/Jiangxi/Shangrao",
  "全国/江西省/新余": "China/Jiangxi/Xinyu",
  "全国/江西省/宜春": "China/Jiangxi/Yichun",
  "全国/江西省/鹰潭": "China/Jiangxi/Yingtan",
  "全国/吉林省": "China/Jilin",
  "全国/吉林省/白城": "China/Jilin/Baicheng",
  "全国/吉林省/长春": "China/Jilin/Changchun",
  "全国/吉林省/吉林": "China/Jilin/Jilin",
  "全国/吉林省/辽源": "China/Jilin/Liaoyuan",
  "全国/吉林省/四平市": "China/Jilin/Siping",
  "全国/吉林省/松原": "China/Jilin/Songyuan",
  "全国/吉林省/通化": "China/Jilin/Tonghua",
  "全国/吉林省/延边": "China/Jilin/Yanbian Korean",
  "全国/辽宁省": "China/Liaoning",
  "全国/辽宁省/鞍山": "China/Liaoning/Anshan",
  "全国/辽宁省/本溪": "China/Liaoning/Benxi",
  "全国/辽宁省/朝阳": "China/Liaoning/Chaoyang",
  "全国/辽宁省/大连": "China/Liaoning/Dalian",
  "全国/辽宁省/丹东": "China/Liaoning/Dandong",
  "全国/辽宁省/抚顺": "China/Liaoning/Fushun",
  "全国/辽宁省/阜新": "China/Liaoning/Fuxin",
  "全国/辽宁省/葫芦岛": "China/Liaoning/Huludao",
  "全国/辽宁省/锦州": "China/Liaoning/Jinzhou",
  "全国/辽宁省/辽阳": "China/Liaoning/Liaoyang",
  "全国/辽宁省/盘锦": "China/Liaoning/Panjin",
  "全国/辽宁省/沈阳": "China/Liaoning/Shenyang",
  "全国/辽宁省/铁岭": "China/Liaoning/Tieling",
  "全国/内蒙古自治区": "China/Nei Mongol",
  "全国/内蒙古自治区/阿拉善": "China/Nei Mongol/Alxa",
  "全国/内蒙古自治区/包头": "China/Nei Mongol/Baotou",
  "全国/内蒙古自治区/包头市昆都仑区": "China/Nei Mongol/Baotou",
  "全国/内蒙古自治区/包头市东河区": "China/Nei Mongol/Baotou",
  "全国/内蒙古自治区/巴彦淖尔": "China/Nei Mongol/Baynnur",
  "全国/内蒙古自治区/赤峰": "China/Nei Mongol/Chifeng",
  "全国/内蒙古自治区/赤峰市松山区": "China/Nei Mongol/Chifeng",
  "全国/内蒙古自治区/赤峰市林西县": "China/Nei Mongol/Chifeng",
  "全国/内蒙古自治区/呼和浩特": "China/Nei Mongol/Hohhot",
  "全国/内蒙古自治区/呼伦贝尔": "China/Nei Mongol/Hulunbuir",
  "全国/内蒙古自治区/鄂尔多斯东胜区": "China/Nei Mongol/Ordos",
  "全国/内蒙古自治区/鄂尔多斯鄂托克前旗": "China/Nei Mongol/Ordos",
  "全国/内蒙古自治区/通辽": "China/Nei Mongol/Tongliao",
  "全国/内蒙古自治区/乌兰察布": "China/Nei Mongol/Ulaan Chab",
  "全国/内蒙古自治区/乌海": "China/Nei Mongol/Wuhai",
  "全国/内蒙古自治区/锡林郭勒盟": "China/Nei Mongol/Xilin Gol",
  "全国/内蒙古自治区/锡林郭勒盟锡林浩特": "China/Nei Mongol/Xilin Gol",
  "全国/内蒙古自治区/锡林郭勒盟二连浩特": "China/Nei Mongol/Xilin Gol",
  "全国/内蒙古自治区/兴安盟": "China/Nei Mongol/Xing'an",
  "全国/宁夏回族自治区": "China/Ningxia Hui",
  "全国/青海省": "China/Qinghai",
  "全国/陕西省": "China/Shaanxi",
  "全国/山东省": "China/Shandong",
  "全国/上海市": "China/Shanghai",
  "全国/山西省": "China/Shanxi",
  "全国/四川省": "China/Sichuan",
  "全国/天津市": "China/Tianjin",
  "全国/新疆维吾尔自治区": "China/Xinjiang Uygur",
  "全国/西藏自治区": "China/Xizang",
  "全国/云南省": "China/Yunnan",
  "全国/浙江省": "China/Zhejiang",
  "S. Korea": "South Korea",
  "USA"     : "United States of America",
  "U.K."    : "United Kingdom",
}

// 更新 g_dxy2kml_paths
function InitDXYToKMLLocationMapping() {
  for (let i=0; i<DxyAndKMLLocationNames.length; i++) {
    let entry = DxyAndKMLLocationNames[i];
    let level = entry[1], en = entry[0];
    for (let j=0; j<entry[2].length; j++) {
      let ch = entry[2][j];
      mapping_levels[level][ch] = en;
    }
  }
}

// 就是获得每个地方的感染人数
// 返回数据格式：
// [ 地图上的Region, Level, Count ]
//
// aggregate_l0：因为全国数据没有直接提供，所以要在level1的时候自己添加
function GetDXYTimelineSnapshot(ts) {
  var ret = { }
  var nationwide = [0, 0, 0, 0]
  
  // 丁香园数据
  let aggregate_desc_dxy = {
    aggregate_l0: nationwide,
    start_path:   "全国",
    started:      false,
    aggregate_mode: "per_metric",
  }
  do_GetDXYTimelineSnapshot(ts, g_timeline, "全国", ["全国"],  ret, aggregate_desc_dxy, undefined)
  // 世界其它地区的数据
  do_GetDXYTimelineSnapshot(ts, g_timeline_world, "",    [], ret, undefined, undefined)
  
  g_curr_kml_snapshot = { };
  
  // 把大陆地区的数据补进去
  g_curr_kml_snapshot["China"] = nationwide.slice()
  
  // Extract Path
  let keys = Object.keys(ret);
  for (let i=0; i<keys.length; i++) {
    let key_dxy = keys[i];
    let key_kml = key_dxy;
    
    if (g_dxy2kml_paths[key_dxy] != undefined) {
      key_kml = g_dxy2kml_paths[key_dxy];
    }
    
    if (key_kml != undefined) {
      if (g_curr_kml_snapshot[key_kml] == undefined) {
        g_curr_kml_snapshot[key_kml] = [0, 0, 0, 0];
      }
      for (let j=0; j<4; j++) {
        g_curr_kml_snapshot[key_kml][j] += ret[key_dxy][j];
      }
    }
  }
  
  // 重画billboard
  g_billboardview.texture_is_dirty = true;
  
  return ret;
}
