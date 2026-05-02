#include <stdio.h>
#include <string.h>
#include <emscripten.h>

extern "C" void MyEmFunc() {
  EM_ASM({
    console.log("[MyEmFunc]");
  });
}

extern "C" void Update1DArray(const char* name, int idx, int value) {
  char buf[1000];
  snprintf(buf, sizeof(buf), "Update1DArray('%s', %d, %d)", name, idx, value);
  emscripten_run_script(buf);
}

extern "C" void Update2DArray(const char* name, int r, int c, int value) {
  char buf[1000];
  snprintf(buf, sizeof(buf), "Update2DArray('%s', %d, %d, %d)", name, r, c, value);
  emscripten_run_script(buf);
}