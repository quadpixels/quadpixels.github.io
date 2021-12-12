// Based on:
// https://distill.pub/2017/ctc/
// https://gist.github.com/awni/56369a90d03953e370f3964c826ed4b0

const NEG_INF = -parseFloat("Infinity");

function ArrayEqual(a, b) {
  if (a.length != b.length) return false;
  else {
    for (let i=0; i<a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }
}

function Logsumexp(args) {
  let maxarg = args[0];
  let is_all_neginf = true;

  args.forEach((arg) => {
    if (arg > maxarg) {
      maxarg = arg;
    }
    
    if (arg != NEG_INF) {
      is_all_neginf = false;
    }
  });


  if (is_all_neginf) {
    return NEG_INF;
  }

  let s = 0;
  args.forEach((arg) => {
    if (arg != NEG_INF)
      s = s + Math.exp(arg - maxarg);
  });
  const lsp = Math.log(s);
  return maxarg + lsp;
}


function MyHash(key) {
  let ret = 0;
  for (let i=0; i<key.length; i++) {
    const k = key[i];
    for (let j=0; j<k.length; j++) {
      ret = (ret * 23333 + k.charCodeAt(j)) % 1000000007;
    }
  }
  return ret;
}

// 似乎有问题 :(
const USE_HASH = false;

class Beam {
  constructor() {
    this.entries = [];
    this.hash2idx = {};
    this.key2idx = {};
  }
  KeyEq(key1, key2) {
    if (key1.length == key2.length) {
      for (let i=0; i<key1.length; i++) {
        if (key1[i] != key2[i]) return false;
      }
      return true;
    } else {
      return false;
    }
  }
  AddEntry(key, value) {
    if (!USE_HASH) {
      this.entries.push([key, value]);
      this.key2idx[key.toString()] = this.entries.length-1;
    } else {
      this.entries.push([key, value]);
      const h = MyHash(key);
      const idx = this.entries.length - 1;
      if (!(h in this.hash2idx)) {
        this.hash2idx[h] = [[key.slice(), idx]];
      } else {
        this.hash2idx[h].push([key.slice(), idx]);
      }
    }
  }
  Get(prefix) {
    if (!USE_HASH) {
      const k = prefix.toString();
      let idx = this.key2idx[k];
      if (idx != undefined) {
        return this.entries[idx][1];
      }
      else return [NEG_INF, NEG_INF];
    } else {
      const h = MyHash(prefix);
      if (h in this.hash2idx) {
        const hs = this.hash2idx[h];
        for (let i=0; i<hs.length; i++) {
          const ik = hs[i];
          if (this.KeyEq(ik[0], prefix)) {
            return this.entries[ik[1]][1];
          }
        }
      }
      return [NEG_INF, NEG_INF];
    }
  }
  Set(prefix, value) {
    if (!USE_HASH) {
      const k = prefix.toString();
      let idx = this.key2idx[k];
      if (idx != undefined) {
        this.entries[idx][1] = value;
      }
      else
        this.AddEntry(prefix.slice(), value);
    } else {
      const h = MyHash(prefix);
      let modified = false;
      if (h in this.hash2idx) {
        const hs = this.hash2idx[h];
        for (let i=0; i<hs.length; i++) {
          const ik = hs[i];
          if (this.KeyEq(ik[0], prefix)) {
            this.entries[ik[1]][1] = value;
            modified = true;
          }
        }
      }
      if (!modified) {
        this.AddEntry(prefix.slice(), value);
      }
    }
  }
  Print() {
    this.entries.forEach((e) => {
      console.log(e[0] + "=" + e[1][0] + "," + e[1][1])
    })
  }
};

function Decode(probs, beam_size, blank, frameskip=0) {
  if (probs == undefined) return;
  const T = probs.length;
  const S = probs[0].length;


  // get log
  for (let i=0; i<T; i++) {
    for (let j=0; j<S; j++) {
      probs[i][j] = Math.log(probs[i][j]);
    }
  }

  let beam = new Beam();
  beam.AddEntry([], [0, NEG_INF]);

  for (let t=0; t<T; t+=(1+frameskip)) {
    let next_beam = new Beam();

    let temp = [];
    for (let s=0; s<S; s++) {
      temp.push(probs[t][s]);
    }
    temp.sort();
    const thresh = temp[Math.max(10, parseInt(temp.length * 0.1))];

    for (let s=0; s<S; s++) {
      const p = probs[t][s];
      if (p < thresh) continue;
      for (let i=0; i<beam.entries.length; i++) {
        const entry = beam.entries[i];
        const prefix = entry[0];
        const p_b = entry[1][0];
        const p_nb = entry[1][1];

        if (s == blank) {
          const x = next_beam.Get(prefix);
          let n_p_b = x[0], n_p_nb = x[1];
          n_p_b = Logsumexp([n_p_b, p_b+p, p_nb+p]);
          next_beam.Set(prefix, [n_p_b, n_p_nb]);
          continue;
        }

        let end_t;
        if (prefix.length > 0) {
          end_t = prefix[prefix.length-1];
        }

        let new_prefix = prefix.slice().concat([s]);
        let x = next_beam.Get(new_prefix);
        let n_p_b = x[0], n_p_nb = x[1];
        let n_p_nb0 = n_p_nb;
        if (s != end_t) {
          n_p_nb = Logsumexp([n_p_nb, p_b+p, p_nb+p]);
        } else {
          n_p_nb = Logsumexp([n_p_nb, p_b+p]);
        }

        next_beam.Set(new_prefix, [n_p_b, n_p_nb]);

        if (s == end_t) {
          x = next_beam.Get(prefix);
          n_p_b = x[0]; n_p_nb = x[1];
          n_p_nb = Logsumexp([n_p_nb, p_nb + p]);
          next_beam.Set(prefix, [n_p_b, n_p_nb]);
        }
      }
    }

    beam.entries = next_beam.entries.slice();

    beam.entries.sort((a, b) => {
      const lspa = Logsumexp(a[1]),
            lspb = Logsumexp(b[1]);
      return lspb - lspa;
    });
    beam.entries = beam.entries.slice(0, beam_size);
  }
  return [beam.entries[0][0], -Logsumexp(beam.entries[0][1])]
}

