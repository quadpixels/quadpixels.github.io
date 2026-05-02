EMINC="/opt/homebrew/Cellar/emscripten/3.1.56/libexec/cache/sysroot/include/"

/opt/homebrew/opt/llvm/bin/clang++ -I$EMINC -O0 -g -emit-llvm --target=wasm32 -c ./convert1darrayto2d.cpp -o convert1darrayto2d.bc
/opt/homebrew/opt/llvm/bin/opt -load-pass-plugin ./llvm_pass/build/libInjectFuncCall.dylib --passes='inject-func-call' --target-abi=wasm32 convert1darrayto2d.bc -o instrumented.bc
/opt/homebrew/opt/llvm/bin/llvm-dis instrumented.bc
em++ -O0 -sMODULARIZE -sEXPORTED_FUNCTIONS=_MyEmFunc,_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -s WASM=0 instrumented.bc runtime.cpp 