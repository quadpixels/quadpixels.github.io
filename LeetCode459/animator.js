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