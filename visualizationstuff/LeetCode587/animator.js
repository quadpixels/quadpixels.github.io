class Animator {
  constructor() {
    this.subjects = []
  }
  
  // Keyframes: [value, DELTA_millis]
  Animate(s, property, field, values, intervals, callback=null) {
    const m = millis()
    
    this.subjects.push({
      subject:  s,
      property: property,
      field:    field,
      values:    values,
      intervals: intervals,
      index: 0,
      start_millis: m,
      callback: callback
    })
  }
  
  // Camera里有一个坑：
  //   所有的Y都要乘以-1。
  AnimateCamera(c, property, field, values, intervals, callback=null) {
    if (property == "pos" && field == "y") {
      for (let i=0; i<values.length; i++) { values[i] *= -1; }
    }
    this.Animate(c, property, field, values, intervals, callback);
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
      
      {
        if (s.index >= s.intervals.length-1) { // ended?
          val = s.values[s.values.length-1]
          done = true
          if (s.callback != null) { s.callback() }
        } else {
          const x0 = elapsed - s.intervals[s.index]
          const x1 = s.intervals[s.index + 1] - s.intervals[s.index]
          const completion = x0 * 1.0 / x1
          val = lerp(s.values[s.index], s.values[s.index+1], completion)
        }
      }
      
      if (s.field != undefined) {
        s.subject[s.property][s.field] = val;
      } else {
        s.subject[s.property] = val;
      }
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
  
  FinishAllPendingAnimations() {
    let ret = false;
    if (this.subjects.length > 0) {
      ret = true;
    }
    this.subjects.forEach((s) => s.start_millis = -9999999 );
    return ret;
  }
  
  IsDone() {
    return (this.subjects.length < 1);
  }
}