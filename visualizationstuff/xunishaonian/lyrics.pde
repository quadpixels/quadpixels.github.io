int TEXT_COLOR[] = { 32, 160, 220 };
int HIGHLIGHT_COLOR[] = { 128, 128, 0 };
int LOWLIGHT_COLOR[] = { 44, 44, 44 };

class Lyricist {
  public long elapsed_millis = 0;
  
  public int idx = 0;
  
  // 是不是要根据先前录下的时间来自动跳行
  public long line_start_millis = 0;
  boolean is_auto_scroll_line = false;
  
  // Fade-in and fade-out
  
  public String[] lyrics = {
    "",
    "《虚拟少年》",
    "唱：徵羽摩柯",
    "作曲：himmel",
    "作词：大♂古",
    "调教：OQQ",
    "",
    "在你陷入沉眠之前 设定好了剧情",
    "计划任务惯例 早已把吵闹的推送关停",
    "你的耳畔 反复着我的低语",
    "请在梨花树下 如约苏醒",
    "才记起 副本的原则最绝情",
    "从未有 相逢不相忘的心",
    "你被放逐在故事里",
    "用梦解锁咒语",
    "明知情动尚不可虚拟",
    "却没来由地沉迷",
    "(music)",
    "",
    "忘掉鲜衣怒马现身时的那些浮夸",
    "攀谈的每句话 你都不厌其烦入微观察",
    "山长水阔 偶遇未必更潇洒",
    "我的人间 你走不到天涯",
    "就尽情 欣赏沿途一路风景",
    "体会我 建模时宕机的心",
    "我被封存在真实里",
    "不为谁而开启",
    "明知记忆尚不可提取",
    "却一再想要堆积",
    "(music)",
    "",
    "相拥已经太久",
    "月光褪色般温柔",
    "这衷肠对酒的绸缪",
    "何处扁舟",
    "择棋子 挑灯花 指尖交错的一刹",
    "仿佛你 把天地 复刻在我眉骨下",
    "辞旧话 煮新茶 管他身是过客",
    "似镜里韶华 漏中流沙",
    "才记起 副本的原则最绝情",
    "从未有 相逢不相忘的心",
    "你被放逐在故事里",
    "用梦解锁咒语",
    "明知情动尚不可虚拟",
    "却没来由地沉迷",
    "我被封存在数据里",
    "从前世苏醒",
    "想挣开岁月那虚无的侵袭",
    "自定义是我",
    "未命名是你",
    "无关于轮回的密令",
    "你我明知在故事里",
    "梦醒就分离",
    "明知相守模式尚不可沉浸",
    "重置前的我",
    "忘却前的你",
    "还在等那抹黎明",
    "(end)",
  };
  
  long event_timestamps[][] = {
    // 
    {  },
    // 《虚拟少年》
    {  },
    // 唱：徵羽摩柯
    {  },
    // 作曲：himmel
    {  },
    // 作词：大♂古
    {  },
    // 调教：OQQ
    {  },
    // 
    {  },
    // 在你陷入沉眠之前 设定好了剧情
    { 0,175 , 175,421 , 421,685 , 685,1065 , 1065,1530 , 1530,2255 , 2255,2488 , 2488,2705 , 2705,2952 , 2952,3325 , 3325,3525 , 3525,3969 , 3969,4591 , 4591,4977 , 4977,6206 },
    // 计划任务惯例 早已把吵闹的推送关停
    { 0,212 , 212,419 , 419,659 , 659,977 , 977,1425 , 1425,2131 , 2131,2441 , 2441,2808 , 2808,3216 , 3216,3483 , 3483,3885 , 3885,4433 , 4433,4841 , 4841,5095 , 5095,5507 , 5507,6112 , 6112,6268 },
    // 你的耳畔 反复着我的低语
    { 0,852 , 852,1614 , 1614,2482 , 2482,3151 , 3151,3246 , 3246,3654 , 3654,4115 , 4115,4320 , 4320,4773 , 4773,5182 , 5182,5586 , 5586,6195 },
    // 请在梨花树下 如约苏醒
    { 0,861 , 861,1623 , 1623,2386 , 2387,3254 , 3254,3866 , 3866,4321 , 4321,4521 , 4521,4883 , 4883,5082 , 5082,5544 , 5544,5800 },
    // 才记起 副本的原则最绝情
    { 0,197 , 197,450 , 450,2071 , 2071,2482 , 2482,2896 , 2896,3296 , 3296,3749 , 3749,4164 , 4164,4569 , 4569,4824 , 4824,5253 , 5254,6199 },
    // 从未有 相逢不相忘的心
    { 0,209 , 209,413 , 413,2259 , 2259,2499 , 2499,2852 , 2852,3310 , 3310,3713 , 3713,4360 , 4360,4939 , 4939,5350 , 5350,5970 },
    // 你被放逐在故事里
    { 0,350 , 350,697 , 697,1389 , 1389,1967 , 1967,2349 , 2349,3009 , 3009,3641 , 3641,3808 },
    // 用梦解锁咒语
    { 0,567 , 567,1133 , 1133,1583 , 1583,1782 , 1782,2260 , 2260,2509 },
    // 明知情动尚不可虚拟
    { 0,152 , 152,279 , 279,499 , 499,1033 , 1033,1702 , 1703,2051 , 2051,2660 , 2660,3282 , 3282,3474 },
    // 却没来由地沉迷
    { 0,385 , 385,793 , 793,998 , 998,1512 , 1512,1917 , 1917,2274 , 2274,3390 },
    // (music)
    {  },
    // 
    {  },
    // 忘掉鲜衣怒马现身时的那些浮夸
    { 0,195 , 195,443 , 443,702 , 702,1056 , 1056,1512 , 1512,2172 , 2172,2422 , 2422,2883 , 2883,3337 , 3337,3540 , 3540,3949 , 3949,4556 , 4556,4918 , 4918,5982 },
    // 攀谈的每句话 你都不厌其烦入微观察
    { 0,145 , 145,369 , 369,595 , 595,983 , 983,1465 , 1465,2255 , 2255,2562 , 2564,2869 , 2869,3272 , 3272,3535 , 3535,3884 , 3884,4505 , 4505,4912 , 4912,5161 , 5161,5576 , 5576,6076 , 6076,6282 },
    // 山长水阔 偶遇未必更潇洒
    { 0,845 , 845,1611 , 1611,2472 , 2472,2877 , 2877,3295 , 3295,3698 , 3698,4152 , 4152,4359 , 4359,4715 , 4715,5169 , 5169,5577 , 5577,6147 },
    // 我的人间 你走不到天涯
    { 0,919 , 919,1722 , 1722,2542 , 2542,3255 , 3255,3358 , 3358,3915 , 3915,4580 , 4580,5038 , 5038,5244 , 5244,5656 , 5656,5909 },
    // 就尽情 欣赏沿途一路风景
    { 0,202 , 202,454 , 454,2292 , 2292,2499 , 2499,2894 , 2894,3302 , 3302,3756 , 3756,4208 , 4208,4568 , 4568,4817 , 4817,5222 , 5222,6273 },
    // 体会我 建模时宕机的心
    { 0,153 , 153,401 , 401,2023 , 2023,2431 , 2431,2838 , 2838,3244 , 3244,3655 , 3655,4305 , 4305,4915 , 4915,5333 , 5333,5932 },
    // 我被封存在真实里
    { 0,405 , 405,810 , 810,1414 , 1414,2072 , 2072,2437 , 2437,3090 , 3090,3704 , 3704,3902 },
    // 不为谁而开启
    { 0,654 , 654,1214 , 1214,1726 , 1726,1872 , 1872,2277 , 2277,2591 },
    // 明知记忆尚不可提取
    { 0,202 , 202,409 , 409,662 , 662,1218 , 1218,1876 , 1877,2278 , 2278,2837 , 2837,3496 , 3497,3653 },
    // 却一再想要堆积
    { 0,612 , 612,833 , 833,1032 , 1032,1492 , 1492,2013 , 2013,2407 , 2407,3787 },
    // (music)
    {  },
    // 
    {  },
    // 相拥已经太久
    { 0,603 , 603,1110 , 1110,1566 , 1566,2181 , 2181,2835 , 2835,3045 },
    // 月光褪色般温柔
    { 0,714 , 714,1215 , 1215,1624 , 1624,2028 , 2028,2438 , 2438,2842 , 2842,3042 },
    // 这衷肠对酒的绸缪
    { 0,710 , 710,1319 , 1319,1679 , 1679,2331 , 2331,2936 , 2936,3139 , 3139,3346 , 3346,3692 },
    // 何处扁舟
    { 0,555 , 555,760 , 760,1117 , 1117,1974 },
    // 择棋子 挑灯花 指尖交错的一刹
    { 0,206 , 206,463 , 463,759 , 759,861 , 861,1014 , 1014,1271 , 1271,1576 , 1576,1672 , 1672,1827 , 1827,2080 , 2080,2281 , 2281,2492 , 2492,2687 , 2687,2937 , 2937,3097 },
    // 仿佛你 把天地 复刻在我眉骨下
    { 0,149 , 149,401 , 401,626 , 626,762 , 762,966 , 966,1222 , 1222,1368 , 1368,1584 , 1584,1772 , 1772,2032 , 2032,2182 , 2182,2430 , 2430,2631 , 2631,2788 , 2788,3039 },
    // 辞旧话 煮新茶 管他身是过客
    { 0,196 , 196,454 , 454,649 , 649,853 , 853,1065 , 1065,1263 , 1263,1466 , 1466,1673 , 1673,1869 , 1869,2072 , 2072,2277 , 2277,2429 , 2429,2635 , 2635,2727 },
    // 似镜里韶华 漏中流沙
    { 0,157 , 157,404 , 404,606 , 606,858 , 858,1113 , 1113,1413 , 1413,1621 , 1621,2076 , 2076,2435 , 2435,3132 },
    // 才记起 副本的原则最绝情
    { 0,407 , 408,758 , 758,2683 , 2683,2888 , 2888,3246 , 3246,3705 , 3705,4112 , 4112,4514 , 4514,4967 , 4967,5171 , 5171,5531 , 5531,6696 },
    // 从未有 相逢不相忘的心
    { 0,206 , 206,459 , 459,2291 , 2291,2540 , 2540,2901 , 2901,3355 , 3355,3762 , 3762,4377 , 4377,5028 , 5028,5382 , 5382,6038 },
    // 你被放逐在故事里
    { 0,402 , 402,806 , 806,1413 , 1413,2076 , 2076,2479 , 2479,3086 , 3086,3699 , 3699,3952 },
    // 用梦解锁咒语
    { 0,600 , 600,1210 , 1210,1666 , 1666,1880 , 1880,2277 , 2277,2582 },
    // 明知情动尚不可虚拟
    { 0,201 , 201,400 , 400,605 , 605,1109 , 1109,1815 , 1815,2222 , 2222,2782 , 2782,3440 , 3440,3649 },
    // 却没来由地沉迷
    { 0,405 , 405,816 , 816,1061 , 1061,1516 , 1516,1929 , 1929,2333 , 2333,2585 },
    // 我被封存在数据里
    { 0,208 , 208,453 , 453,655 , 655,961 , 961,1120 , 1120,1521 , 1521,1726 , 1726,1976 },
    // 从前世苏醒
    { 0,456 , 456,713 , 713,1063 , 1063,1273 , 1273,1474 },
    // 想挣开岁月那虚无的侵袭
    { 0,411 , 411,656 , 656,964 , 964,1263 , 1263,1574 , 1574,1772 , 1772,2227 , 2227,2631 , 2631,2892 , 2892,3043 , 3043,3244 },
    // 自定义是我
    { 0,352 , 352,553 , 553,912 , 912,1059 , 1059,1367 },
    // 未命名是你
    { 0,454 , 454,659 , 659,1016 , 1016,1168 , 1168,1468 },
    // 无关于轮回的密令
    { 0,455 , 455,659 , 659,1009 , 1009,1213 , 1213,1621 , 1621,1831 , 1831,2227 , 2227,2478 },
    // 你我明知在故事里
    { 0,156 , 156,405 , 405,607 , 607,962 , 962,1173 , 1173,1565 , 1565,1725 , 1725,1972 },
    // 梦醒就分离
    { 0,356 , 356,667 , 667,971 , 971,1223 , 1223,1427 },
    // 明知相守模式尚不可沉浸
    { 0,404 , 404,664 , 664,1068 , 1068,1575 , 1575,1730 , 1730,2037 , 2037,2390 , 2390,2746 , 2746,2948 , 2948,3154 , 3154,3405 },
    // 重置前的我
    { 0,305 , 305,508 , 508,912 , 912,1108 , 1108,1366 },
    // 忘却前的你
    { 0,403 , 403,604 , 604,1012 , 1012,1214 , 1214,1476 },
    // 还在等那抹黎明
    { 0,405 , 405,608 , 608,1014 , 1014,1466 , 1466,1884 , 1884,2240 , 2240,3808 },
    // (end)
    {  },
  };
  
  long line_durations_val[] = {   // 
    0,    // 《虚拟少年》
    0,    // 原唱：徵羽摩柯
    0,    // 作曲：himmel
    0,    // 作词：大♂古
    0,    // 调教：OQQ
    0,    // 
    0,    // 在你陷入沉眠之前 设定好了剧情
    6629,    // 计划任务惯例 早已把吵闹的推送关停
    6650,    // 你的耳畔 反复着我的低语
    6564,    // 请在梨花树下 如约苏醒
    6050,    // 才记起 副本的原则最绝情
    6564,    // 从未有 相逢不相忘的心
    6328,    // 你被放逐在故事里
    4269,    // 用梦解锁咒语
    2617,    // 明知情动尚不可虚拟
    3990,    // 却没来由地沉迷
    4162,    // (music)
    7294,    // 
    5106,    // 忘掉鲜衣怒马现身时的那些浮夸
    6500,    // 攀谈的每句话 你都不厌其烦入微观察
    6736,    // 山长水阔 偶遇未必更潇洒
    6715,    // 我的人间 你走不到天涯
    6157,    // 就尽情 欣赏沿途一路风景
    6500,    // 体会我 建模时宕机的心
    6200,    // 我被封存在真实里
    4269,    // 不为谁而开启
    2660,    // 明知记忆尚不可提取
    3969,    // 却一再想要堆积
    3861,    // (music)
    6050,    // 
    6607,    // 相拥已经太久
    3325,    // 月光褪色般温柔
    3261,    // 这衷肠对酒的绸缪
    3947,    // 何处扁舟
    2231,    // 择棋子 挑灯花 指尖交错的一刹
    3389,    // 仿佛你 把天地 复刻在我眉骨下
    3261,    // 辞旧话 煮新茶 管他身是过客
    2982,    // 似镜里韶华 漏中流沙
    3153,    // 才记起 副本的原则最绝情
    7036,    // 从未有 相逢不相忘的心
    6221,    // 你被放逐在故事里
    4269,    // 用梦解锁咒语
    2853,    // 明知情动尚不可虚拟
    3797,    // 却没来由地沉迷
    2574,    // 我被封存在数据里
    2360,    // 从前世苏醒
    1673,    // 想挣开岁月那虚无的侵袭
    3304,    // 自定义是我
    1673,    // 未命名是你
    1609,    // 无关于轮回的密令
    2639,    // 你我明知在故事里
    2317,    // 梦醒就分离
    1652,    // 明知相守模式尚不可沉浸
    3368,    // 重置前的我
    1587,    // 忘却前的你
    1609,    // 还在等那抹黎明
    4569,    // (end)
    0,
  };
  
  // 行宽与每个字的X偏移
  public ArrayList<Float> line_widths;
  public ArrayList<ArrayList<Float> > xoffsets;
  
  // Fixtures是静态实例、FixtureOccurrence是动态实例
  public ArrayList<Fixture> all_fixtures;
  public ArrayList<ArrayList<Fixture> > fixtures_per_line;
  
  public ArrayList<Long> line_durations; // 自动换行时每行持续时间
  
  // 0, 0为锚点
  class Fixture {
    public Fixture(String s, float _x, float _y, float _w, int _serial) {
      content = s; x = _x; y = _y; w = _w;
      serial = _serial;
    }
    public int serial;
    public String content;
    public float x, y;
    public float w;
    public void RenderInLine(PGraphics2D g, float dx, float dy) {
      g.text(content, x + dx, y + dy);
    }
    public void Render(PGraphics2D g, float dx, float dy) {
      g.text(content, dx, dy);
    }
  };
  
  class FixtureOccurrence {
    public int fade_state; // 0: 还没开始, 1: 正在淡入, 2: 正在淡出, 10: 丢进了回收区
    public long fade_begin_millis[] = { 0, 0 },
                fade_duration[] = { 0, 0 }; // [0]: in, [1]: out 
                
    public long highlight_begin_millis = 1000000000007L;
    public long highlight_end_millis   = 1000000000007L;
    public int highlight_state; // 0: not started, 1: highlighting, 2: cancel highlight
    
    public float x, y;
    
    FixtureOccurrence(Fixture f) {
      fixture = f;
      fade_state = 0;
      highlight_state = 0;
      
      final float HW = width * 0.5f, HH = height * 0.5f - 32;
      x = HW; y = HH;
    }
    public Fixture fixture;
    
    public float GetFadeCompletion(long millis, int idx) {
      long b = fade_begin_millis[idx];
      long d = fade_duration[idx];
      
      long elapsed = millis - b;
      float ret = elapsed * 1.0f / d;
      if (ret < 0) ret = 0;
      else if (ret > 1) ret = 1;
      
      return ret;
    }
    
    public void Render(PGraphics2D g, long millis) {
      
      // Determine color to use
      float color_r = TEXT_COLOR[0], color_g = TEXT_COLOR[1], color_b = TEXT_COLOR[2],
            color_a = 0;
      
      switch (highlight_state) {
        case 0: {
          if (millis > highlight_begin_millis) {
            highlight_state = 1;
            color_r += HIGHLIGHT_COLOR[0];
            color_g += HIGHLIGHT_COLOR[1];
            color_b += HIGHLIGHT_COLOR[2];
            color_a = 255;
            //System.out.println(String.format("%s hl 1\n", this.fixture.content));
          }
          break;
        }
        case 1: {
          if (millis > highlight_end_millis) {
            //System.out.println(String.format("%s hl 0\n", this.fixture.content));
            highlight_state = 2;
          } else {
            color_r += HIGHLIGHT_COLOR[0];
            color_g += HIGHLIGHT_COLOR[1];
            color_b += HIGHLIGHT_COLOR[2];
            color_a = 255;
          }
          break;
        }
      }
      
      switch (fade_state) {
        case 0: {
          float c = GetFadeCompletion(millis, 0);
          if (c > 0) {
            fade_state = 1; // Fading in
          }
          break;
        }
        case 1: {
          float c = GetFadeCompletion(millis, 0);
          float x_delta = (1.0f - c) * (-8.0f);
          
          //g.endDraw(); g.beginDraw();
          g.fill(color_r, color_g, color_b, color_a + c * 255);
          fixture.RenderInLine(g, x_delta+x, y);
          
          if (c > 1) { fade_state = 2; }
          break;
        }
        case 2: {
          //g.endDraw(); g.beginDraw();
          g.fill(color_r, color_g, color_b, 255);
          fixture.RenderInLine(g, x, y);
          break;
        }
        case 10: {
          g.fill(LOWLIGHT_COLOR[0], LOWLIGHT_COLOR[1], LOWLIGHT_COLOR[2]);
          fixture.Render(g, x, y);
          break;
        }
      }
    }
    
    public void FadeIn(long start, long duration) {
      fade_state = 0;
      fade_begin_millis[0] = start;
      fade_duration[0] = duration;
    }
    
    public void GotoRecycleZone() {
      fade_state = 10;
      float[] xy = IncrementRecycle(fixture.w);
      this.x = xy[0];
      this.y = xy[1];
      System.out.println("Recycle\n");
    }
  };
  
  ArrayList<FixtureOccurrence> fixture_occs = new ArrayList<FixtureOccurrence>();
  
  Lyricist(PGraphics2D g) {
    all_fixtures = new ArrayList<Fixture>();
    fixtures_per_line = new ArrayList<ArrayList<Fixture>>();
    line_durations = new ArrayList<Long>();
    // Preprocess
    g.textFont(font24);
    line_widths = new ArrayList<Float>();
    xoffsets = new ArrayList<ArrayList<Float>>();
    for (int i=0; i<lyrics.length; i++) {
      // Offsets
      ArrayList<Float> line_offsets = new ArrayList<Float>();
      String s = lyrics[i];
      final float w = g.textWidth(s);
      line_widths.add(w);
      line_offsets.add(0.0f);
      for (int j=1; j<s.length(); j++) {
        String chunk = s.substring(0, j);
        final float cw = g.textWidth(chunk);
        line_offsets.add(cw);
      }
      line_offsets.add(w);
      
      // Fixtures
      ArrayList<Fixture> line_fixtures = new ArrayList<Fixture>();
      int serial = 0;
      for (int j=0; j<s.length(); j++) {
        String ch = s.substring(j, j+1);
        final float dx = -w*0.5f + line_offsets.get(j);
        final float dy = 0;
        final float char_w = line_offsets.get(j+1) - line_offsets.get(j);
        Fixture f = new Fixture(ch, dx, dy, char_w, serial);
        serial ++;
        line_fixtures.add(f);
      }
      fixtures_per_line.add(line_fixtures);
      xoffsets.add(line_offsets);
      
      // Pre-poplate event lists
      EventList el = new EventList();
      if (i < event_timestamps.length) {
        long[] ts = event_timestamps[i];
        for (int j=0; j<ts.length; j+=2) {
          el.chars_on_time.add(ts[j]);
          el.chars_off_time.add(ts[j+1]);
        }
      }
      event_lists.add(el);
      
      // Line duration
      line_durations.add(line_durations_val[i]);
    }
    Reset();
  }
  
  void Reset() { idx = 0; }
  
  // EventList：一行中的每个字的出现与消失时间
  class EventList {
    long start_millis = 0;
    int inout = 0; // 0: edit "on time"; 1: edit "off time"
    ArrayList<Long> chars_on_time, chars_off_time;
    int GetEventPairCount() {
      final int s1 = chars_on_time.size(), s2 = chars_off_time.size();
      if (s1 < s2) return s1; else return s2;
    }
    EventList() {
      start_millis = 0;
      chars_on_time = new ArrayList<Long>();
      chars_off_time = new ArrayList<Long>();
    }
    void Reset(long s) {
      start_millis = s;
      chars_on_time.clear();
      chars_off_time.clear();
    }
    void RegisterOn(long millis) {
      final int s1 = chars_on_time.size(), s2 = chars_off_time.size();
      
      if (s1 == 0 && s2 == 0) start_millis = millis;
      
      
      final long offset = millis - start_millis;
      if (inout == 0) {
        chars_on_time.add(offset);
        inout = 1;
      } else {
        chars_on_time.set(s1-1, offset);
      }
    }
    
    void RegisterOff(long millis) {
      final int s1 = chars_on_time.size(), s2 = chars_off_time.size();
      
      if (s1 == 0 && s2 == 0) start_millis = millis;
      
      final  long offset = millis - start_millis;
      if (inout == 0) {
        //if (s2 > 0) chars_off_time.set(s2-1, offset);
      } else {
        chars_off_time.add(offset);
        inout = 0;
      }
    }
    
    String GetDebugString() {
      return String.format("%d/%d", chars_on_time.size(), chars_off_time.size());
    }
    
    String GetPairsToString() {
      StringBuilder sb = new StringBuilder();
      int ec = GetEventPairCount();
      for (int i=0; i<ec; i++) {
        if (i > 0) {
          sb.append(" , ");
        }
        sb.append(chars_on_time.get(i));
        sb.append(",");
        sb.append(chars_off_time.get(i));
      }
      return sb.toString();
    }
  };
  
  ArrayList<EventList> event_lists = new ArrayList<EventList>();
  public EventList GetCurrentEventList() {
    return event_lists.get(idx);
  }
  
  // 关于回收区
  float curr_recycle_x = 0;
  float curr_recycle_y = 24;
  final float RECYCLE_YDELTA = 36;
  final float RECYCLE_XSPACE = 18;
  final float RECYCLE_Y_PIVOT = 0.33; // 如果Y超过这个比率就拉回去
  final float RECYCLE_SCROLL_SPEED = 32; // 32 px 每秒
  
  long last_cursor_tick_millis = 0;
  
  // 返回X与Y
  float[] IncrementRecycle(float w) {
    float ret[] = { -1, -1 };
    if (curr_recycle_x + w > width) {
      curr_recycle_x = 0; curr_recycle_y += RECYCLE_YDELTA;
    }
    ret[0] = curr_recycle_x; ret[1] = curr_recycle_y;
    curr_recycle_x += w;
    return ret;
  }
  
  void ShiftRecycleUpwards(long delta_millis) {
    boolean changed = false;
    float delta_y = 0;
    final float thresh = height * RECYCLE_Y_PIVOT;
    final float y_lb = -24;
    
    if (curr_recycle_y > thresh) {
      changed = true;
      final float dist = curr_recycle_y - thresh;
      final float deduct1 = RECYCLE_SCROLL_SPEED * delta_millis / 1000.0f;
      float deduct = dist * 0.2f;
      
      if (deduct > deduct1) deduct = deduct1;
      if (deduct > dist) deduct = dist;
      
      if (Math.abs(dist) < 1) {
        deduct = dist;
      }
      
      delta_y = deduct;
    }
    
    if (changed) {
      ArrayList<FixtureOccurrence> new_foccs = new ArrayList<FixtureOccurrence>();
      curr_recycle_y -= delta_y;
      for (int i=0; i<fixture_occs.size(); i++) {
        FixtureOccurrence focc = fixture_occs.get(i);
        if (focc.fade_state == 10) {
          focc.y -= delta_y;
          if (focc.y < y_lb) {
          } else {
            new_foccs.add(focc);
          }
        } else {
          new_foccs.add(focc);
        }
      }
      fixture_occs = new_foccs;
    }
  }
  
  // 有哪些要显示的
  void ClearHighlightedChars() {
    //ArrayList<FixtureOccurrence> new_occ = new ArrayList<FixtureOccurrence>();
    for (int i=0; i<fixture_occs.size(); i++) {
      FixtureOccurrence focc = fixture_occs.get(i);
      final int s = focc.fade_state;
      if (s == 0 || s == 1 || s == 2) { 
        focc.GotoRecycleZone();
      }
      else {
      }
    }
    //fixture_occs = new_occ;
  }
  
  void ShowLine(int x) {
    long m = millis();
    if (x >= 0 && x < fixtures_per_line.size()) {
      ArrayList<Fixture> fl = fixtures_per_line.get(x);
      
      EventList el = event_lists.get(x);
      int ec = el.GetEventPairCount();
        
      for (int j=0; j<fl.size(); j++) {
        Fixture f = fl.get(j);
        FixtureOccurrence focc = new FixtureOccurrence(f);
        
        // Use fade time:
        System.out.println(String.format("%d event pairs\n", ec));
        
        if (j < ec) {
          long s = el.chars_on_time.get(j);
          long e = el.chars_off_time.get(j);
          focc.highlight_begin_millis = s + m;
          focc.highlight_end_millis   = e + m;
          System.out.println(String.format("event[%d] on=%d, off=%d\n",
            j, (int)(s+m), (int)(e+m)));
        }
        
        focc.FadeIn(m + 100 * j, 300);
        fixture_occs.add(focc);
      }
    }
  }
  
  void ResetCurrentEventList() {
    GetCurrentEventList().Reset(millis());
  }
  
  void RegisterEventListOnTime() {
    GetCurrentEventList().RegisterOn(millis());
  }
  
  void RegisterEventListOffTime() {
    GetCurrentEventList().RegisterOff(millis());
  }
  
  long last_millis = 0;
  void Render(PGraphics2D g) {
    g.noStroke();
    g.textFont(font24);
    g.textAlign(LEFT, TOP);
    final long m = millis();
    final long delta_millis = m - last_millis;
    last_millis = m;
    
    
    // Draw Recycle Cursor
    {
      final float BPM = 143;
      final long CURSOR_PERIOD = (long)(60000 * 2/ BPM);
      final long ON_DUTY = (long)(CURSOR_PERIOD * 0.75);
      final long phase = (m-last_cursor_tick_millis) % CURSOR_PERIOD;
      if (phase < ON_DUTY) {
        g.fill(LOWLIGHT_COLOR[0], LOWLIGHT_COLOR[1], LOWLIGHT_COLOR[2]);
        g.noStroke();
        final float W = 16, H = RECYCLE_YDELTA;
        final float dx = 0, dy = 3;
        float xx = curr_recycle_x, yy = curr_recycle_y;
        if (xx > width - W) { xx = 0; yy += RECYCLE_YDELTA; }
        g.rect(xx + dx + W/2, yy + dy, W, H);
      }
    }
    
    // Draw chars
    for (int i=0; i < fixture_occs.size(); i++) {
      fixture_occs.get(i).Render(g, m);
    }
    
    // Update
    if (is_auto_scroll_line) {
      if (line_durations.get(idx) <= 0) {
        is_auto_scroll_line = false;
        System.out.println("Stopping auto scroll b/c the current line does not have a timeout");
      } else {
        long rem = GetCurrLineAutoScrollRemainingTime(m);
        if (rem <= 0) {
          MoveLine(1, false);
          line_start_millis = m + rem; // Make up for offset
        }
      }
    }
    
    ShiftRecycleUpwards(delta_millis);
  }
  
  void MoveLine(int delta, boolean is_write_duration) {
    final int prev_idx = idx;
    long m = millis();
    
    idx += delta;
    if (idx < 0) idx = 0;
    else if (idx >= lyrics.length) idx = lyrics.length - 1;
    
    // 留点空格
    // RECYCLE
    {
      IncrementRecycle(RECYCLE_XSPACE);
      ClearHighlightedChars();
      last_cursor_tick_millis = m;
    }
    // SHOW
    ShowLine(idx);
    
    if (is_write_duration) {
      line_durations.set(prev_idx, m - line_start_millis);
      System.out.println(String.format("Line %d duration: %d\n",
        prev_idx, (int)(m-line_start_millis)));
    }
    line_start_millis = m;
  }
  
  void ShowDebugInfo() {
    textAlign(LEFT);
    textFont(font12);
    long m = millis();
    String txt = String.format("%.1fs | spectrum_mult=%.1f | idx=%d | %d Fixture occs | EventList: %s",
      (float)(m) / 1000.0f,
      FFT_MULTIPLIER,
      idx,
      fixture_occs.size(), GetCurrentEventList().GetDebugString());
    if (is_auto_scroll_line) {
      txt = txt + String.format(" | AutoScroll: %.1f",
        (float)GetCurrLineAutoScrollRemainingTime(m) / 1000.0f);
    }
    noStroke();
    fill(255);
    text(txt, 0, 12);
  }
  
  // 将录制好的逐字时间表印出来
  void DumpAllEventLists() {
    StringBuilder sb = new StringBuilder();
    sb.append("long event_timestamps[][] = {\n");
    for (int i=0; i<event_lists.size(); i++) {
      sb.append("  // " + lyrics[i] + "\n");
      EventList el = event_lists.get(i);
      sb.append("  { " + el.GetPairsToString() + " },\n");
    }
    sb.append("}\n");
    
    sb.append("\nlong line_durations_val[] = { ");
    for (int i=0; i<event_lists.size(); i++) {
      sb.append("  // " + lyrics[i] + "\n");
      sb.append("  ");
      sb.append(line_durations.get(i));
      sb.append(",\n");
    }
    sb.append("}\n");
    
    System.out.println(sb.toString());
  }
  
  // 停止自动换行
  void CancelAutoScrollLine() {
    is_auto_scroll_line = false;
  }
  
  // 前进到下一行并且开始自动换行
  void GotoNextLineAndStartAutoScrollLine() {
    is_auto_scroll_line = true;
    MoveLine(1, false);
  }
  
  // 自动换行时本行还剩多少时间
  long GetCurrLineAutoScrollRemainingTime(long m) {
    long e = m - line_start_millis;
    return line_durations.get(idx) - e;
  }
};
