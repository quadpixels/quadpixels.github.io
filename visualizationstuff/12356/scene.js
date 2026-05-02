// 活动海报页面
let g_scene2 = {
  Init: function() {
    g_agg1.is_enabled = false;
    g_agg2.is_enabled = false;
    g_agg3.is_enabled = false;
    g_agg4.is_enabled = false;
    g_falling_blocks.is_enabled = false;
    g_strings_gadget.is_enabled = false;

    RemoveFlanks();
    g_messagebox.SetText("2020-10-04\n【载歌载谷云上生活系列之 想唱就唱】x\n【硅谷汉服社】之\n\n“五声调式讲解范例”\n", 18);
    g_imagebox0.is_enabled = true;
  },
  TearDown: function() {
    g_animator.Animate(g_imagebox0, "pos", "y", [POSTER_Y, POSTER_Y+720],
                      [0, 500]);
    g_animator.Animate(g_imagebox1, "pos", "y", [POSTER_Y, POSTER_Y+720],
                      [0, 500]);
    g_messagebox.Hide();
    g_messagebox.Clear();
  }
}

// 三分损益法界面
let g_scene0 = {
  // 三分损益法
  notes: [ 69, 76, 71, 78, 73, 81, -999 ],
  notes_idx: 0,
  text_sizes: [ 32, 32, 32, 32, 32, 32, 32, 24],
  messages: [
    [ "【三分损益法 与\n五声调式】" ],
    [ "首先，选择一个基准音\n我们使用A4 (440Hz)", "這是A4，频率為440Hz。" ],
    [ "将A4的频率乘以3/2，就得到了第二个音，E5。", "" ],
    [ "将E5的频率乘以3/4，就得到了第三个音，B4。", "" ],
    [ "将B4的频率乘以3/2，就得到了第四个音，\n#F4。", "" ],
    [ "将#F4的频率乘以3/4，就得到了第五个音，\n#C5。", "" ],
    [ "最后将基准音频率乘以2\n得到高八度的A5。", "" ],
    [ "这样，五声调式中的五个音就齐全了。\n（注：此演示中所用的是十二平均律的频率，与三分损益法有微小偏差）", "" ],
  ],
  Init: function() {
    RemoveFlanks();
    g_strings_gadget.is_enabled = true;
    g_strings_gadget.Reset();
    
    g_messagebox.is_enabled = true;
    const the_y = g_messagebox.pos.y;
    g_animator.Animate(g_messagebox, "pos", "y", [the_y, -220, the_y], 
    [0,250,500],
    ()=>{
      g_messagebox.Show();
      g_messagebox.SetText(this.messages[0][g_locale_id], 32);
    });
    
    let y0 = -100, y1 = 660;
    g_agg1.is_enabled = true;
    
    g_agg1.UnhighlightAllNotes();
    g_animator.Animate(g_agg1, "pos", "y", [y0, y1], [0, 400]);
    
    g_agg2.is_enabled = false;
    g_agg3.is_enabled = false;
    g_agg4.is_enabled = false;
    g_falling_blocks.is_enabled = false;
    
    g_agg1.SetNoteRange(-999, -999);
    const note_size = 26;
    g_animator.Animate(g_scene_props, "notenumbers_dist", undefined, [10, note_size], [0, 500]);
    g_animator.Animate(g_scene_props, "notenumbers_notesize", undefined, [5, note_size], [0, 500]);
    g_agg1.should_hide_non_A = false;
    g_agg1.pos.x = 45;
  },
  Step: function() {
    if (this.notes_idx < this.notes.length) {
      const nidx = this.notes[this.notes_idx];
      // 显示音符或者排序
      if (nidx > 0) { g_strings_gadget.Step(); }
      else {
        g_strings_gadget.StartSort();
      }
      g_agg1.UnhighlightAllNotes();
      let btn = g_agg1.RevealNoteByNumber(nidx);
      g_agg1.HighlightNoteByNumber(nidx);
      this.notes_idx ++;
      g_messagebox.SetText(this.messages[this.notes_idx][g_locale_id], this.text_sizes[this.notes_idx]);
    } else {
      g_messagebox.Hide();
      g_strings_gadget.is_enabled = false;
      g_agg1.RevealAllNotes();
      g_agg1.should_hide_non_A = true;
      const t = 600;
      g_animator.Animate(g_agg1, "pos", "x", [g_agg1.pos.x, NOTE_NUMBERS_X], [0, t]);
      g_animator.Animate(g_scene_props, "notenumbers_dist", undefined, [20, 10], [0, t]);
      g_animator.Animate(g_scene_props, "notenumbers_notesize", undefined, [20, 5], [0, t], ()=>{
        SetScene(1);
      });
    }
  },
  TearDown: function() {
  }
};

let g_scene1 = {
  Init: function() {
    RemoveFlanks();
    g_agg1.is_enabled = true;
    g_agg2.is_enabled = true;
    g_agg3.is_enabled = true;
    g_agg4.is_enabled = true;
    g_falling_blocks.is_enabled = true;
    let delta_t = 90;
    let duration = 400;
    
    let y1 = PIANO_KEYS_Y, y0 = y1 + 720; 
    g_animator.Animate(g_agg2, "pos", "y", [y0, y1], [0, duration]);
    
    y1 = NOTE_NUMBERS_Y;
    y0 = g_agg1.pos.y;
    g_animator.Animate(g_agg1, "pos", "y", 
      [y0, y0, y1], [0, 0+delta_t, duration+delta_t],
      ()=>{
        g_agg1.AlignScaleToClosestNote(g_agg3);
      });
    
    y1 = SCALES_Y;
    y0 = SCALES_Y + 720;
    g_animator.Animate(g_agg3, "pos", "y",
      [y0, y0, y1], [0, 0+delta_t*2, duration+delta_t*2]);
    
    y1 = FALLING_BLOCKS_Y;
    y0 = FALLING_BLOCKS_Y + 720;
    g_animator.Animate(g_falling_blocks, "pos", "y",
      [y0, y0, y1], [0, 0+delta_t*3, duration+delta_t*3]);
    
    y1 = PLAYKEYS_Y;
    y0 = PLAYKEYS_Y + 720;
    g_animator.Animate(g_agg4, "pos", "y",
      [y0, y0, y1], [0, 0+delta_t*4, duration+delta_t*4]);
  },
  TearDown: function() {
  }
}