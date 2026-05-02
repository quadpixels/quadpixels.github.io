class UnionFind {
  constructor(N) {
    this.parents = [];
    for (let i=0; i<N; i++) { this.parents.push(i); }
  }
  GetParent(x) {
    if (x != this.parents[x]) {
      const p = this.GetParent(this.parents[x]);
      this.parents[x] = p;
      return p;
    } else { return this.parents[x]; }
  }
  Union(a, b) {
    this.parents[this.GetParent(a)] = this.GetParent(b);
  }
  Print() {
    let x = "";
    for (let i=0; i<this.parents.length; i++) {
      x = x + this.parents[i] + " ";
    }
    console.log(x);
  }
}