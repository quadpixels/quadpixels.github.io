# For macOS

EMINC="/opt/homebrew/Cellar/emscripten/5.0.7/libexec/cache/sysroot/include/"

CLANGXX="/opt/homebrew/opt/llvm/bin/clang++"
OPT="/opt/homebrew/opt/llvm/bin/opt"
LLVM_DIS="/opt/homebrew/opt/llvm/bin/llvm-dis"

if [ ! -f a.out.js ]; then
  $CLANGXX -I$EMINC -O0 -g -emit-llvm --target=wasm32 -c ./convert1darrayto2d.cpp -o convert1darrayto2d.bc
  $OPT -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.dylib --passes='inject-func-call' --target-abi=wasm32 convert1darrayto2d.bc -o instrumented.bc
  $LLVM_DIS instrumented.bc
  em++ -O0 -sMODULARIZE -sEXPORTED_FUNCTIONS=_MyEmFunc,_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -s WASM=0 instrumented.bc runtime.cpp -o a.out.js
fi

if [ ! -f b.out.js ]; then
  $CLANGXX -I$EMINC -O0 -g -emit-llvm --target=wasm32 -c ./quicksort.cpp -o quicksort.bc
  $OPT -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.dylib --passes='inject-func-call' --target-abi=wasm32 quicksort.bc -o instrumented.bc
  $LLVM_DIS instrumented.bc
  em++ -O0 -sMODULARIZE -sEXPORTED_FUNCTIONS=_MyEmFunc,_main,_DoIt -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -s WASM=0 instrumented.bc runtime.cpp -o b.out.js
fi


if [ ! -f d.out.js ]; then
  $CLANGXX -nostdinc++ -I/opt/homebrew/Cellar/emscripten/5.0.7/libexec/cache/sysroot/include/c++/v1/ -I$EMINC -D_LIBCPP_HAS_NO_THREADS -O0 -g -emit-llvm --target=wasm32 -c ./vectortest.cpp -o vectortest.bc
  $OPT -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.dylib --passes='inject-func-call' --target-abi=wasm32 vectortest.bc -o instrumented.bc
  $LLVM_DIS instrumented.bc
  em++ -O0 -sMODULARIZE=0 -sEXPORTED_FUNCTIONS=_MyEmFunc,_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sEXPORTED_FUNCTIONS=_main -s WASM=0 instrumented.bc runtime.cpp -o d.out.js
fi