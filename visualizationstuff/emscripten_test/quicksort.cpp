#include <stdio.h>
#include <stdlib.h>
#include <time.h>

const int N = 20;
int arr[N];
int marker[2];  // Used to mark entrance and exit into a call to q()
volatile int g_state{0};  // Will be treated as a pointer by LLVM for now ...
volatile int g_pivot{0};
int g_randseed = time(0);

void q(int lb, int ub) {
    if (lb >= ub) return;
    int pivot = arr[ub];
    g_pivot = pivot;
    marker[0] = lb;
    marker[1] = ub;
    int ptr1 = ub, i = lb;
    while (i < ptr1) {
        if (arr[i] <= pivot) {
            i++;
        } else {
            //swap(arr[i], arr[ptr1]);  // TODO: How to make the LLVM pass detect alias to arr[i]
            int tmp = arr[ptr1-1];
            arr[ptr1-1] = arr[ptr1];
            arr[ptr1] = tmp;

            if (i < ptr1-1) {
                tmp = arr[i];
                arr[i] = arr[ptr1];
                arr[ptr1] = tmp;
            }

            ptr1--;
        }
    }
    g_pivot = -1;

    q(lb, i-1);
    q(i+1, ub);
    marker[0] = -lb;
    marker[1] = -ub;
}

extern "C"
void DoIt() {
    srand(++g_randseed);
    g_state = 0;  // Populating
    for (int i=0; i<N; i++) { arr[i] = i; }
    g_state = 1;  // Randomizing
    for (int i=0; i<N-1; i++) {
        int pos2 = i+1 + rand() % (N-1-i);
        // swap(arr[i], arr[pos2]);  // TODO: How to make the LLVM pass detect alias to arr[i]
        int tmp = arr[i];
        arr[i] = arr[pos2];
        arr[pos2] = tmp;
    }
    for (int i=0; i<N; i++) { printf("%d ", arr[i]); }
    printf("\n");
    g_state = 2;  // Sorting
    q(0, N-1);
    for (int i=0; i<N; i++) { printf("%d ", arr[i]); }
    printf("\n");
    g_state = 3;  // Ending
}

int main() {
    DoIt();
}