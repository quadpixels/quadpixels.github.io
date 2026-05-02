#include <stdio.h>

int main() {
  const int m=2, n=3;
  int a[m*n] = { 0 };
  int b[m][n];

  for (int i=0; i<6; i++) { a[i]=i+1; }

  int idx = 0;
  for (int r=0; r<m; r++) {
    for (int c=0; c<n; c++) {
      b[r][c] = a[idx];
      idx++;
    }
  }
  printf("Done.\n");
}
