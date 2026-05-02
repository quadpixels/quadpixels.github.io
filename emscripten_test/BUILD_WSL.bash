CXXFLAGS="-nostdinc++ -I$HOME/Downloads/emsdk/upstream/emscripten/cache/sysroot/include/c++/v1/ -I$HOME/Downloads/emsdk/upstream/emscripten/cache/sysroot/include/ -D_LIBCPP_HAS_NO_THREADS -O0 -g -emit-llvm --target=wasm32"
EMINC="$HOME/Downloads/emsdk/upstream/emscripten/cache/sysroot/include/"

LLVM_DIR="/usr"

if [ $1 = "clean" ]; then
  echo "Clean."
  for fn in "instrumented.bc" "quicksort.bc"\
            "a.out.js" "b.out.js" "c.out.js"; do
    [ -f $fn ] && rm -v $fn
  done
  exit 0
fi

source $HOME/Downloads/emsdk/emsdk_env.sh

if [ ! -f a.out.js ]; then
  $LLVM_DIR/bin/clang++-18 -I$EMINC -O0 -g -emit-llvm --target=wasm32 -c ./convert1darrayto2d.cpp -o convert1darrayto2d.bc
  $LLVM_DIR/bin/opt-18 -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.so --passes='inject-func-call' --target-abi=wasm32 convert1darrayto2d.bc -o instrumented.bc
  $LLVM_DIR/bin/llvm-dis-18 instrumented.bc
  em++ -O0 -sMODULARIZE -sEXPORTED_FUNCTIONS=_MyEmFunc,_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -s WASM=0 instrumented.bc runtime.cpp -o a.out.js
fi

if [ ! -f b.out.js ]; then
  $LLVM_DIR/bin/clang++-18 -I$EMINC -O0 -g -emit-llvm --target=wasm32 -c ./quicksort.cpp -o quicksort.bc
  $LLVM_DIR/bin/opt-18 -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.so --passes='inject-func-call' --target-abi=wasm32 quicksort.bc -o instrumented.bc
  $LLVM_DIR/bin/llvm-dis-18 instrumented.bc
  em++ -O0 -sMODULARIZE -sEXPORTED_FUNCTIONS=_MyEmFunc,_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sEXPORTED_FUNCTIONS=_DoIt -s WASM=0 instrumented.bc runtime.cpp -o b.out.js
fi

if [ ! -f c.out.js ]; then
  $LLVM_DIR/bin/clang++-18 $CXXFLAGS -c ./2463.cpp -o 2463.bc
  $LLVM_DIR/bin/opt-18 -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.so --passes='inject-func-call' --target-abi=wasm32 2463.bc -o instrumented.bc
  $LLVM_DIR/bin/llvm-dis-18 instrumented.bc
  em++ -O0 -sMODULARIZE=0 -sEXPORTED_FUNCTIONS=_MyEmFunc,_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sEXPORTED_FUNCTIONS=_main -s WASM=0 instrumented.bc runtime.cpp -o c.out.js
fi

if [ ! -f d.out.js ]; then
  $LLVM_DIR/bin/clang++-18 -nostdinc++ -I$HOME/Downloads/emsdk/upstream/emscripten/cache/sysroot/include/c++/v1/ -I$HOME/Downloads/emsdk/upstream/emscripten/cache/sysroot/include/ -D_LIBCPP_HAS_NO_THREADS -O0 -g -emit-llvm --target=wasm32 -c ./vectortest.cpp -o vectortest.bc
  $LLVM_DIR/bin/opt-18 -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.so --passes='inject-func-call' --target-abi=wasm32 vectortest.bc -o instrumented.bc
  $LLVM_DIR/bin/llvm-dis-18 instrumented.bc
  em++ -O0 -sMODULARIZE=0 -sEXPORTED_FUNCTIONS=_MyEmFunc,_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sEXPORTED_FUNCTIONS=_main -s WASM=0 instrumented.bc runtime.cpp -o d.out.js
fi
