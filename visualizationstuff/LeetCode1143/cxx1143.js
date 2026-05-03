

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function(status, toThrow) {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

var nodeFS;
var nodePath;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


read_ = function shell_read(filename, binary) {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    return binary ? ret : ret.toString();
  }
  if (!nodeFS) nodeFS = require('fs');
  if (!nodePath) nodePath = require('path');
  filename = nodePath['normalize'](filename);
  return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
};

readBinary = function readBinary(filename) {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
};

readAsync = function readAsync(filename, onload, onerror) {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    onload(ret);
  }
  if (!nodeFS) nodeFS = require('fs');
  if (!nodePath) nodePath = require('path');
  filename = nodePath['normalize'](filename);
  nodeFS['readFile'](filename, function(err, data) {
    if (err) onerror(err);
    else onload(data.buffer);
  });
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  process['on']('unhandledRejection', abort);

  quit_ = function(status, toThrow) {
    if (keepRuntimeAlive()) {
      process['exitCode'] = status;
      throw toThrow;
    }
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {

// include: web_or_worker_shell_read.js


  read_ = function(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = function(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = function(title) { document.title = title };
} else
{
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message




var STACK_ALIGN = 16;

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {
  return func;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

// Add a wasm function to the table.
function addFunctionWasm(func, sig) {
  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    for (var i = 0; i < wasmTable.length; i++) {
      var item = wasmTable.get(i);
      // Ignore null values.
      if (item) {
        functionsInTableMap.set(item, i);
      }
    }
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    wasmTable.set(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    wasmTable.set(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(wasmTable.get(index));
  freeTableIndexes.push(index);
}

// 'sig' parameter is required for the llvm backend but only when func is not
// already a WebAssembly function.
function addFunction(func, sig) {

  return addFunctionWasm(func, sig);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
};

var getTempRet0 = function() {
  return tempRet0;
};



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime = Module['noExitRuntime'] || true;

// include: wasm2js.js


// wasm2js.js - enough of a polyfill for the WebAssembly object so that we can load
// wasm2js code that way.

// Emit "var WebAssembly" if definitely using wasm2js. Otherwise, in MAYBE_WASM2JS
// mode, we can't use a "var" since it would prevent normal wasm from working.
/** @suppress{duplicate, const} */
var
WebAssembly = {
  // Note that we do not use closure quoting (this['buffer'], etc.) on these
  // functions, as they are just meant for internal use. In other words, this is
  // not a fully general polyfill.
  Memory: function(opts) {
    this.buffer = new ArrayBuffer(opts['initial'] * 65536);
  },

  Module: function(binary) {
    // TODO: use the binary and info somehow - right now the wasm2js output is embedded in
    // the main JS
  },

  Instance: function(module, info) {
    // TODO: use the module and info somehow - right now the wasm2js output is embedded in
    // the main JS
    // This will be replaced by the actual wasm2js code.
    this.exports = (
function instantiate(asmLibraryArg) {
function Table(ret) {
  // grow method not included; table is not growable
  ret.set = function(i, func) {
    this[i] = func;
  };
  ret.get = function(i) {
    return this[i];
  };
  return ret;
}

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 1024, "aWlpaQAtKyAgIDBYMHgAdmVjdG9yAGJhc2ljX3N0cmluZwAobnVsbCkAUmV0dXJuIHZhbHVlOiAlZAoAAAAAABEACgAREREAAAAABQAAAAAAAAkAAAAACwAAAAAAAAAAEQAPChEREQMKBwABAAkLCwAACQYLAAALAAYRAAAAERERAAAAAAAAAAAAAAAAAAAAAAsAAAAAAAAAABEACgoREREACgAAAgAJCwAAAAkACwAACwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAAAAwAAAAACQwAAAAAAAwAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAADQAAAAQNAAAAAAkOAAAAAAAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAA8AAAAADwAAAAAJEAAAAAAAEAAAEAAAEgAAABISEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAEhISAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAAAAAAAAAACgAAAAAKAAAAAAkLAAAAAAALAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAADAAAAAAJDAAAAAAADAAADAAAMDEyMzQ1Njc4OUFCQ0RFRhAHAAA=");
  base64DecodeToExistingUint8Array(bufferView, 1576, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgDlAAAAAAAAUAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAADAAAAGAoAAAAEAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAr/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==");
  base64DecodeToExistingUint8Array(bufferView, 1952, "");
  base64DecodeToExistingUint8Array(bufferView, 2000, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
}

  var scratchBuffer = new ArrayBuffer(16);
  var i32ScratchView = new Int32Array(scratchBuffer);
  var f32ScratchView = new Float32Array(scratchBuffer);
  var f64ScratchView = new Float64Array(scratchBuffer);
  
  function wasm2js_scratch_load_i32(index) {
    return i32ScratchView[index];
  }
      
  function wasm2js_scratch_store_i32(index, value) {
    i32ScratchView[index] = value;
  }
      
  function wasm2js_scratch_load_f64() {
    return f64ScratchView[0];
  }
      
  function wasm2js_scratch_store_f64(value) {
    f64ScratchView[0] = value;
  }
      
function asmFunc(env) {
 var memory = env.memory;
 var buffer = memory.buffer;
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var abort = env.abort;
 var nan = NaN;
 var infinity = Infinity;
 var fimport$0 = env.emscripten_asm_const_int;
 var fimport$1 = env.abort;
 var fimport$2 = env.fd_write;
 var fimport$3 = env.emscripten_resize_heap;
 var fimport$4 = env.emscripten_memcpy_big;
 var fimport$5 = env.setTempRet0;
 var global$0 = 5246496;
 var global$1 = 0;
 var global$2 = 0;
 var global$5 = 0;
 var global$6 = 0;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0() {
  global$2 = 5246496;
  global$1 = 3616;
 }
 
 function $2($0_1, $1) {
  $0_1 = $0_1 | 0;
  $1 = $1 | 0;
  var $2_1 = 0, $3_1 = 0, $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15 = 0, $16_1 = 0, $17_1 = 0, $18_1 = 0, $19_1 = 0, $20 = 0, $21 = 0, $22 = 0, $23_1 = 0, $24 = 0, $25_1 = 0, $26_1 = 0, $27_1 = 0, $28_1 = 0, $29 = 0, $30 = 0, $31 = 0, $32_1 = 0, $33_1 = 0, $34 = 0, $35_1 = 0, $36_1 = 0, $37_1 = 0, $38 = 0, $39 = 0, $40_1 = 0, $41_1 = 0, $42 = 0, $43 = 0, $44 = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $48_1 = 0, $49_1 = 0, $50_1 = 0, $51 = 0, $52_1 = 0, $53_1 = 0, $54_1 = 0, $55_1 = 0, $56 = 0, $57_1 = 0, $58 = 0, $59 = 0, $60 = 0, $61 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 60;
   $1 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$1 >> 2];
   $8 = HEAP32[$1 + 8 >> 2];
   $9_1 = HEAP32[$1 + 12 >> 2];
   $18_1 = HEAP32[$1 + 16 >> 2];
   $31 = HEAP32[$1 + 20 >> 2];
   $35_1 = HEAP32[$1 + 24 >> 2];
   $36_1 = HEAP32[$1 + 28 >> 2];
   $37_1 = HEAP32[$1 + 32 >> 2];
   $38 = HEAP32[$1 + 36 >> 2];
   $39 = HEAP32[$1 + 40 >> 2];
   $40_1 = HEAP32[$1 + 44 >> 2];
   $41_1 = HEAP32[$1 + 48 >> 2];
   $42 = HEAP32[$1 + 52 >> 2];
   $59 = HEAP32[$1 + 56 >> 2];
   $1 = HEAP32[$1 + 4 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $19_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $8 = global$0 - 48 | 0;
   global$0 = $8;
  }
  label$2 : {
   label$9 : {
    label$10 : {
     if (!global$5) {
      $9_1 = $45($0_1);
      if ($9_1 >>> 0 >= 4294967280) {
       break label$10
      }
     }
     label$12 : {
      if (!global$5) {
       if ($9_1 >>> 0 <= 10) {
        HEAP8[$8 + 43 | 0] = $9_1;
        $18_1 = $8 + 32 | 0;
        break label$12;
       }
       $31 = $9_1 + 16 & -16;
       $35_1 = $31;
      }
      if (!(global$5 ? $19_1 : 0)) {
       $2_1 = $3($35_1);
       if ((global$5 | 0) == 1) {
        $2_1 = 0;
        break label$2;
       }
       $36_1 = $2_1;
      }
      if (!global$5) {
       HEAP32[$8 + 40 >> 2] = $31 | -2147483648;
       $18_1 = $36_1;
       HEAP32[$8 + 32 >> 2] = $18_1;
       HEAP32[$8 + 36 >> 2] = $9_1;
      }
     }
     if (!global$5) {
      if ($9_1) {
       $36($18_1, $0_1, $9_1)
      }
      HEAP8[$9_1 + $18_1 | 0] = 0;
      $9_1 = $45($1);
      if ($9_1 >>> 0 >= 4294967280) {
       break label$9
      }
     }
     label$23 : {
      if (!global$5) {
       if ($9_1 >>> 0 <= 10) {
        HEAP8[$8 + 27 | 0] = $9_1;
        $18_1 = $8 + 16 | 0;
        break label$23;
       }
       $0_1 = $9_1 + 16 & -16;
       $37_1 = $0_1;
      }
      if (global$5 ? ($19_1 | 0) == 1 : 1) {
       $2_1 = $3($37_1);
       if ((global$5 | 0) == 1) {
        $2_1 = 1;
        break label$2;
       }
       $38 = $2_1;
      }
      if (!global$5) {
       HEAP32[$8 + 24 >> 2] = $0_1 | -2147483648;
       $18_1 = $38;
       HEAP32[$8 + 16 >> 2] = $18_1;
       HEAP32[$8 + 20 >> 2] = $9_1;
      }
     }
     if (!global$5) {
      if ($9_1) {
       $36($18_1, $1, $9_1)
      }
      HEAP8[$9_1 + $18_1 | 0] = 0;
      $39 = $8 + 32 | 0;
      $40_1 = $8 + 16 | 0;
     }
     if (global$5 ? ($19_1 | 0) == 2 : 1) {
      $13 = $39;
      $15 = $40_1;
      $2_1 = 0;
      if ((global$5 | 0) == 2) {
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 76;
       $4 = HEAP32[global$6 >> 2];
       $13 = HEAP32[$4 >> 2];
       $6_1 = HEAP32[$4 + 8 >> 2];
       $14_1 = HEAP32[$4 + 12 >> 2];
       $5_1 = HEAP32[$4 + 16 >> 2];
       $7 = HEAP32[$4 + 20 >> 2];
       $16_1 = HEAP32[$4 + 28 >> 2];
       $17_1 = HEAP32[$4 + 32 >> 2];
       $20 = HEAP32[$4 + 36 >> 2];
       $21 = HEAP32[$4 + 40 >> 2];
       $12 = HEAP32[$4 + 44 >> 2];
       $22 = HEAP32[$4 + 48 >> 2];
       $23_1 = HEAP32[$4 + 52 >> 2];
       $27_1 = HEAP32[$4 + 56 >> 2];
       $3_1 = HEAP32[$4 + 60 >> 2];
       $24 = HEAP32[$4 + 64 >> 2];
       $10_1 = HEAP32[$4 + 68 >> 2];
       $25_1 = HEAP32[$4 + 72 >> 2];
       $15 = HEAP32[$4 + 4 >> 2];
       $2_1 = HEAP32[$4 + 24 >> 2];
      }
      if ((global$5 | 0) == 2) {
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
       $26_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
      }
      if (!global$5) {
       $6_1 = global$0 - 48 | 0;
       global$0 = $6_1;
       $14_1 = HEAP32[$13 + 4 >> 2];
       $5_1 = HEAPU8[$13 + 11 | 0];
       $7 = HEAP32[$15 + 4 >> 2];
       $2_1 = HEAPU8[$15 + 11 | 0];
       HEAP32[$6_1 + 16 >> 2] = 0;
       HEAP32[$6_1 + 20 >> 2] = 0;
       HEAP32[$6_1 + 24 >> 2] = 0;
      }
      __inlined_func$1 : {
       label$20 : {
        label$91 : {
         label$102 : {
          label$11 : {
           label$123 : {
            label$13 : {
             if (!global$5) {
              $16_1 = $2_1 << 24 >> 24 < 0 ? $7 : $2_1;
              if (!$16_1) {
               break label$13
              }
              if ($16_1 >>> 0 >= 1073741824) {
               break label$123
              }
              $7 = $16_1 << 2;
              $21 = $7;
              $20 = $6_1;
             }
             if (!(global$5 ? $26_1 : 0)) {
              $4 = $3($21);
              if ((global$5 | 0) == 1) {
               $4 = 0;
               break label$20;
              }
              $12 = $4;
             }
             if (!global$5) {
              $2_1 = $12;
              HEAP32[$20 + 16 >> 2] = $2_1;
              HEAP32[$6_1 + 20 >> 2] = $2_1;
              $4 = $2_1 + $7 | 0;
              HEAP32[$6_1 + 24 >> 2] = $4;
              $37($2_1, 0, $7);
              HEAP32[$6_1 + 20 >> 2] = $4;
             }
            }
            if (!global$5) {
             HEAP32[$6_1 + 40 >> 2] = 0;
             HEAP32[$6_1 + 32 >> 2] = 0;
             HEAP32[$6_1 + 36 >> 2] = 0;
            }
            label$22 : {
             if (!global$5) {
              $17_1 = $5_1 << 24 >> 24 < 0 ? $14_1 : $5_1;
              if (!$17_1) {
               break label$22
              }
              if ($17_1 >>> 0 >= 357913942) {
               break label$11
              }
              $5_1 = Math_imul($17_1, 12);
              $23_1 = $5_1;
              $22 = $6_1;
             }
             if (global$5 ? ($26_1 | 0) == 1 : 1) {
              $4 = $3($23_1);
              if ((global$5 | 0) == 1) {
               $4 = 1;
               break label$20;
              }
              $27_1 = $4;
             }
             if (!global$5) {
              $2_1 = $27_1;
              HEAP32[$22 + 32 >> 2] = $2_1;
              HEAP32[$6_1 + 36 >> 2] = $2_1;
              $14_1 = $2_1 + $5_1 | 0;
              HEAP32[$6_1 + 40 >> 2] = $14_1;
             }
             while (1) {
              if (!global$5) {
               HEAP32[$2_1 + 8 >> 2] = 0;
               HEAP32[$2_1 >> 2] = 0;
               HEAP32[$2_1 + 4 >> 2] = 0;
              }
              label$32 : {
               if (!global$5) {
                $7 = HEAP32[$6_1 + 20 >> 2] - HEAP32[$6_1 + 16 >> 2] | 0;
                if (!$7) {
                 break label$32
                }
                if (($7 | 0) <= -1) {
                 break label$102
                }
                $3_1 = $2_1;
                $24 = $7;
               }
               if (global$5 ? ($26_1 | 0) == 2 : 1) {
                $4 = $3($24);
                if ((global$5 | 0) == 1) {
                 $4 = 2;
                 break label$20;
                }
                $10_1 = $4;
               }
               if (!global$5) {
                $5_1 = $10_1;
                HEAP32[$3_1 >> 2] = $5_1;
                HEAP32[$2_1 + 4 >> 2] = $5_1;
                HEAP32[$2_1 + 8 >> 2] = ($7 >> 2 << 2) + $5_1;
                $4 = HEAP32[$6_1 + 16 >> 2];
                $7 = HEAP32[$6_1 + 20 >> 2] - $4 | 0;
                if (($7 | 0) >= 1) {
                 $5_1 = $36($5_1, $4, $7) + $7 | 0
                }
                HEAP32[$2_1 + 4 >> 2] = $5_1;
               }
              }
              if (!global$5) {
               $2_1 = $2_1 + 12 | 0;
               if (($2_1 | 0) != ($14_1 | 0)) {
                continue
               }
              }
              break;
             };
             if (!global$5) {
              HEAP32[$6_1 + 36 >> 2] = $2_1
             }
            }
            if (!global$5) {
             $2_1 = HEAP32[$6_1 + 16 >> 2];
             if ($2_1) {
              HEAP32[$6_1 + 20 >> 2] = $2_1;
              $33($2_1);
             }
             if (($17_1 | 0) < 1) {
              break label$91
             }
             $7 = 0;
             while (1) {
              if (($16_1 | 0) > 0) {
               $12 = $7 - 1 | 0;
               $2_1 = 0;
               $5_1 = 0;
               while (1) {
                label$49 : {
                 if (HEAPU8[(HEAP8[$13 + 11 | 0] < 0 ? HEAP32[$13 >> 2] : $13) + $7 | 0] == HEAPU8[(HEAP8[$15 + 11 | 0] < 0 ? HEAP32[$15 >> 2] : $15) + $2_1 | 0]) {
                  $14_1 = 0;
                  $4 = 1;
                  if (!$7) {
                   break label$49
                  }
                  $4 = 1;
                  if (!$2_1) {
                   break label$49
                  }
                  $10_1 = HEAP32[(HEAP32[HEAP32[$6_1 + 32 >> 2] + Math_imul($12, 12) >> 2] + ($2_1 << 2) | 0) - 4 >> 2] + 1 | 0;
                  $4 = ($5_1 | 0) < ($10_1 | 0) ? $10_1 : $5_1;
                  break label$49;
                 }
                 $14_1 = 1;
                 if ($7) {
                  $10_1 = HEAP32[HEAP32[HEAP32[$6_1 + 32 >> 2] + Math_imul($12, 12) >> 2] + ($2_1 << 2) >> 2];
                  $5_1 = ($5_1 | 0) < ($10_1 | 0) ? $10_1 : $5_1;
                 }
                 $4 = $5_1;
                 if (!$2_1) {
                  break label$49
                 }
                 $10_1 = HEAP32[(HEAP32[HEAP32[$6_1 + 32 >> 2] + Math_imul($7, 12) >> 2] + ($2_1 << 2) | 0) - 4 >> 2];
                 $4 = ($5_1 | 0) < ($10_1 | 0) ? $10_1 : $5_1;
                }
                $5_1 = $4;
                HEAP32[$6_1 + 12 >> 2] = $14_1;
                HEAP32[$6_1 + 8 >> 2] = $5_1;
                HEAP32[$6_1 >> 2] = $7;
                HEAP32[$6_1 + 4 >> 2] = $2_1;
                fimport$0(1952, 1024, $6_1 | 0) | 0;
                HEAP32[HEAP32[HEAP32[$6_1 + 32 >> 2] + Math_imul($7, 12) >> 2] + ($2_1 << 2) >> 2] = $5_1;
                $2_1 = $2_1 + 1 | 0;
                if (($16_1 | 0) != ($2_1 | 0)) {
                 continue
                }
                break;
               };
              }
              $7 = $7 + 1 | 0;
              if (($17_1 | 0) != ($7 | 0)) {
               continue
              }
              break;
             };
             break label$91;
            }
           }
           if (!global$5) {
            $27();
            abort();
           }
          }
          if (!global$5) {
           $27();
           abort();
          }
         }
         if (!global$5) {
          $27();
          abort();
         }
        }
        if (!global$5) {
         $5_1 = HEAP32[$6_1 + 36 >> 2];
         $25_1 = HEAP32[HEAP32[$5_1 - 8 >> 2] - 4 >> 2];
         $12 = HEAP32[$6_1 + 32 >> 2];
         if ($12) {
          if (($5_1 | 0) != ($12 | 0)) {
           while (1) {
            $2_1 = $5_1 - 12 | 0;
            $10_1 = HEAP32[$2_1 >> 2];
            if ($10_1) {
             HEAP32[$5_1 - 8 >> 2] = $10_1;
             $33($10_1);
            }
            $5_1 = $2_1;
            if (($2_1 | 0) != ($12 | 0)) {
             continue
            }
            break;
           }
          }
          HEAP32[$6_1 + 36 >> 2] = $12;
          $33(HEAP32[$6_1 + 32 >> 2]);
         }
         global$0 = $6_1 + 48 | 0;
        }
        $2_1 = $25_1;
        if (!global$5) {
         break __inlined_func$1
        }
        abort();
       }
       HEAP32[HEAP32[global$6 >> 2] >> 2] = $4;
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
       $4 = HEAP32[global$6 >> 2];
       HEAP32[$4 >> 2] = $13;
       HEAP32[$4 + 4 >> 2] = $15;
       HEAP32[$4 + 8 >> 2] = $6_1;
       HEAP32[$4 + 12 >> 2] = $14_1;
       HEAP32[$4 + 16 >> 2] = $5_1;
       HEAP32[$4 + 20 >> 2] = $7;
       HEAP32[$4 + 24 >> 2] = $2_1;
       HEAP32[$4 + 28 >> 2] = $16_1;
       HEAP32[$4 + 32 >> 2] = $17_1;
       HEAP32[$4 + 36 >> 2] = $20;
       HEAP32[$4 + 40 >> 2] = $21;
       HEAP32[$4 + 44 >> 2] = $12;
       HEAP32[$4 + 48 >> 2] = $22;
       HEAP32[$4 + 52 >> 2] = $23_1;
       HEAP32[$4 + 56 >> 2] = $27_1;
       HEAP32[$4 + 60 >> 2] = $3_1;
       HEAP32[$4 + 64 >> 2] = $24;
       HEAP32[$4 + 68 >> 2] = $10_1;
       HEAP32[$4 + 72 >> 2] = $25_1;
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 76;
       $2_1 = 0;
      }
      if ((global$5 | 0) == 1) {
       $2_1 = 2;
       break label$2;
      }
      $41_1 = $2_1;
     }
     if (!global$5) {
      $9_1 = $41_1;
      if (HEAP8[$8 + 27 | 0] <= -1) {
       $33(HEAP32[$8 + 16 >> 2])
      }
      if (HEAP8[$8 + 43 | 0] <= -1) {
       $33(HEAP32[$8 + 32 >> 2])
      }
      HEAP32[$8 >> 2] = $9_1;
      $42 = $8;
     }
     if (global$5 ? ($19_1 | 0) == 3 : 1) {
      $19_1 = 0;
      if ((global$5 | 0) == 2) {
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 24;
       $2_1 = HEAP32[global$6 >> 2];
       $30 = HEAP32[$2_1 >> 2];
       $43 = HEAP32[$2_1 + 4 >> 2];
       $44 = HEAP32[$2_1 + 8 >> 2];
       $45_1 = HEAP32[$2_1 + 16 >> 2];
       $60 = HEAP32[$2_1 + 20 >> 2];
       $19_1 = HEAP32[$2_1 + 12 >> 2];
      }
      if ((global$5 | 0) == 2) {
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
       $29 = HEAP32[HEAP32[global$6 >> 2] >> 2];
      }
      $2_1 = $42;
      if (!global$5) {
       $30 = global$0 - 16 | 0;
       global$0 = $30;
       HEAP32[$30 + 12 >> 2] = $2_1;
       $43 = HEAP32[392];
       $44 = 1066;
       $19_1 = $2_1;
      }
      __inlined_func$42 : {
       label$21 : {
        if (!(global$5 ? $29 : 0)) {
         $27_1 = 0;
         $12 = 0;
         $10_1 = 0;
         $7 = 0;
         $13 = 0;
         if ((global$5 | 0) == 2) {
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 16;
          $2_1 = HEAP32[global$6 >> 2];
          $12 = HEAP32[$2_1 >> 2];
          $7 = HEAP32[$2_1 + 8 >> 2];
          $27_1 = HEAP32[$2_1 + 12 >> 2];
          $10_1 = HEAP32[$2_1 + 4 >> 2];
         }
         if ((global$5 | 0) == 2) {
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
          $13 = HEAP32[HEAP32[global$6 >> 2] >> 2];
         }
         $6_1 = $43;
         $5_1 = $44;
         $2_1 = $19_1;
         if (!global$5) {
          $7 = $2_1;
          $12 = $6_1;
          $10_1 = $5_1;
         }
         __inlined_func$24 : {
          label$24 : {
           if (global$5 ? $13 : 0) {
            $2_1 = $27_1
           } else {
            $5_1 = $12;
            $2_1 = $10_1;
            $28_1 = $7;
            $4 = 0;
            $6_1 = 0;
            $14_1 = 0;
            $16_1 = 0;
            $24 = 0;
            $17_1 = 0;
            $21 = 0;
            $23_1 = 0;
            $25_1 = 0;
            $26_1 = 0;
            $29 = 0;
            $13 = 0;
            $15 = 0;
            $20 = 0;
            $22 = 0;
            if ((global$5 | 0) == 2) {
             HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 140;
             $3_1 = HEAP32[global$6 >> 2];
             $5_1 = HEAP32[$3_1 >> 2];
             $28_1 = HEAP32[$3_1 + 8 >> 2];
             $4 = HEAP32[$3_1 + 12 >> 2];
             $6_1 = HEAP32[$3_1 + 16 >> 2];
             $11_1 = HEAP32[$3_1 + 20 >> 2];
             $46_1 = HEAP32[$3_1 + 24 >> 2];
             $32_1 = HEAP32[$3_1 + 28 >> 2];
             $47_1 = HEAP32[$3_1 + 32 >> 2];
             $48_1 = HEAP32[$3_1 + 36 >> 2];
             $49_1 = HEAP32[$3_1 + 40 >> 2];
             $50_1 = HEAP32[$3_1 + 44 >> 2];
             $21 = HEAP32[$3_1 + 48 >> 2];
             $23_1 = HEAP32[$3_1 + 52 >> 2];
             $51 = HEAP32[$3_1 + 56 >> 2];
             $14_1 = HEAP32[$3_1 + 60 >> 2];
             $25_1 = HEAP32[$3_1 + 64 >> 2];
             $52_1 = HEAP32[$3_1 + 68 >> 2];
             $53_1 = HEAP32[$3_1 + 72 >> 2];
             $54_1 = HEAP32[$3_1 + 76 >> 2];
             $26_1 = HEAP32[$3_1 + 80 >> 2];
             $29 = HEAP32[$3_1 + 84 >> 2];
             $13 = HEAP32[$3_1 + 88 >> 2];
             $16_1 = HEAP32[$3_1 + 92 >> 2];
             $15 = HEAP32[$3_1 + 96 >> 2];
             $55_1 = HEAP32[$3_1 + 100 >> 2];
             $33_1 = HEAP32[$3_1 + 104 >> 2];
             $56 = HEAP32[$3_1 + 108 >> 2];
             $20 = HEAP32[$3_1 + 112 >> 2];
             $22 = HEAP32[$3_1 + 116 >> 2];
             $24 = HEAP32[$3_1 + 120 >> 2];
             $17_1 = HEAP32[$3_1 + 124 >> 2];
             $57_1 = HEAP32[$3_1 + 128 >> 2];
             $61 = HEAP32[$3_1 + 132 >> 2];
             $58 = HEAP32[$3_1 + 136 >> 2];
             $2_1 = HEAP32[$3_1 + 4 >> 2];
            }
            if ((global$5 | 0) == 2) {
             HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
             $34 = HEAP32[HEAP32[global$6 >> 2] >> 2];
            }
            if (!global$5) {
             $11_1 = global$0 - 208 | 0;
             global$0 = $11_1;
             HEAP32[$11_1 + 204 >> 2] = $28_1;
             $37($11_1 + 160 | 0, 0, 40);
             HEAP32[$11_1 + 200 >> 2] = HEAP32[$11_1 + 204 >> 2];
             $28_1 = 0;
            }
            if (!global$5) {
             $48_1 = $11_1 + 200 | 0;
             $49_1 = $11_1 + 80 | 0;
             $50_1 = $11_1 + 160 | 0;
             $21 = $4;
             $47_1 = $2_1;
             $23_1 = $6_1;
            }
            __inlined_func$15 : {
             label$25 : {
              if (!(global$5 ? $34 : 0)) {
               $3_1 = $16(0, $47_1, $48_1, $49_1, $50_1, $21, $23_1);
               if ((global$5 | 0) == 1) {
                $3_1 = 0;
                break label$25;
               }
               $51 = $3_1;
              }
              label$96 : {
               if (!global$5) {
                if (($51 | 0) < 0) {
                 $2_1 = -1;
                 break label$96;
                }
               }
               if (!global$5) {
                $28_1 = HEAP32[$5_1 + 76 >> 2] >= 0 ? 1 : $28_1;
                $3_1 = HEAP32[$5_1 >> 2];
                if (HEAP8[$5_1 + 74 | 0] <= 0) {
                 HEAP32[$5_1 >> 2] = $3_1 & -33
                }
                $46_1 = $3_1 & 32;
               }
               label$217 : {
                label$228 : {
                 if (!global$5) {
                  if (!HEAP32[$5_1 + 48 >> 2]) {
                   break label$228
                  }
                  $25_1 = $2_1;
                  $52_1 = $11_1 + 200 | 0;
                  $53_1 = $11_1 + 80 | 0;
                  $54_1 = $11_1 + 160 | 0;
                  $26_1 = $4;
                  $14_1 = $5_1;
                  $29 = $6_1;
                 }
                 if (global$5 ? ($34 | 0) == 1 : 1) {
                  $3_1 = $16($14_1, $25_1, $52_1, $53_1, $54_1, $26_1, $29);
                  if ((global$5 | 0) == 1) {
                   $3_1 = 1;
                   break label$25;
                  }
                  $13 = $3_1;
                 }
                 $3_1 = $13;
                 if (!global$5) {
                  break label$217
                 }
                }
                if (!global$5) {
                 HEAP32[$5_1 + 48 >> 2] = 80;
                 $33_1 = $11_1 + 80 | 0;
                 HEAP32[$5_1 + 16 >> 2] = $33_1;
                 HEAP32[$5_1 + 28 >> 2] = $11_1;
                 HEAP32[$5_1 + 20 >> 2] = $11_1;
                 $32_1 = HEAP32[$5_1 + 44 >> 2];
                 HEAP32[$5_1 + 44 >> 2] = $11_1;
                 $15 = $2_1;
                 $55_1 = $11_1 + 200 | 0;
                 $56 = $11_1 + 160 | 0;
                 $20 = $4;
                 $16_1 = $5_1;
                 $22 = $6_1;
                }
                if (global$5 ? ($34 | 0) == 2 : 1) {
                 $3_1 = $16($16_1, $15, $55_1, $33_1, $56, $20, $22);
                 if ((global$5 | 0) == 1) {
                  $3_1 = 2;
                  break label$25;
                 }
                 $24 = $3_1;
                }
                if (!global$5) {
                 $2_1 = $24;
                 $3_1 = $2_1;
                 if (!$32_1) {
                  break label$217
                 }
                 $57_1 = HEAP32[$5_1 + 36 >> 2];
                 $17_1 = $5_1;
                }
                if (global$5 ? ($34 | 0) == 3 : 1) {
                 FUNCTION_TABLE[$57_1 | 0]($17_1, 0, 0) | 0;
                 if ((global$5 | 0) == 1) {
                  $3_1 = 3;
                  break label$25;
                 }
                }
                if (!global$5) {
                 HEAP32[$5_1 + 48 >> 2] = 0;
                 HEAP32[$5_1 + 44 >> 2] = $32_1;
                 HEAP32[$5_1 + 28 >> 2] = 0;
                 HEAP32[$5_1 + 16 >> 2] = 0;
                 $6_1 = HEAP32[$5_1 + 20 >> 2];
                 HEAP32[$5_1 + 20 >> 2] = 0;
                 $2_1 = $6_1 ? $2_1 : -1;
                }
                $3_1 = $2_1;
               }
               $2_1 = $3_1;
               if (!global$5) {
                $6_1 = $5_1;
                $5_1 = HEAP32[$5_1 >> 2];
                HEAP32[$6_1 >> 2] = $5_1 | $46_1;
                $2_1 = $5_1 & 32 ? -1 : $2_1;
                if (!$28_1) {
                 break label$96
                }
               }
              }
              if (global$5) {
               $2_1 = $58
              } else {
               global$0 = $11_1 + 208 | 0
              }
              if (!global$5) {
               break __inlined_func$15
              }
              abort();
             }
             HEAP32[HEAP32[global$6 >> 2] >> 2] = $3_1;
             HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
             $3_1 = HEAP32[global$6 >> 2];
             HEAP32[$3_1 >> 2] = $5_1;
             HEAP32[$3_1 + 4 >> 2] = $2_1;
             HEAP32[$3_1 + 8 >> 2] = $28_1;
             HEAP32[$3_1 + 12 >> 2] = $4;
             HEAP32[$3_1 + 16 >> 2] = $6_1;
             HEAP32[$3_1 + 20 >> 2] = $11_1;
             HEAP32[$3_1 + 24 >> 2] = $46_1;
             HEAP32[$3_1 + 28 >> 2] = $32_1;
             HEAP32[$3_1 + 32 >> 2] = $47_1;
             HEAP32[$3_1 + 36 >> 2] = $48_1;
             HEAP32[$3_1 + 40 >> 2] = $49_1;
             HEAP32[$3_1 + 44 >> 2] = $50_1;
             HEAP32[$3_1 + 48 >> 2] = $21;
             HEAP32[$3_1 + 52 >> 2] = $23_1;
             HEAP32[$3_1 + 56 >> 2] = $51;
             HEAP32[$3_1 + 60 >> 2] = $14_1;
             HEAP32[$3_1 + 64 >> 2] = $25_1;
             HEAP32[$3_1 + 68 >> 2] = $52_1;
             HEAP32[$3_1 + 72 >> 2] = $53_1;
             HEAP32[$3_1 + 76 >> 2] = $54_1;
             HEAP32[$3_1 + 80 >> 2] = $26_1;
             HEAP32[$3_1 + 84 >> 2] = $29;
             HEAP32[$3_1 + 88 >> 2] = $13;
             HEAP32[$3_1 + 92 >> 2] = $16_1;
             HEAP32[$3_1 + 96 >> 2] = $15;
             HEAP32[$3_1 + 100 >> 2] = $55_1;
             HEAP32[$3_1 + 104 >> 2] = $33_1;
             HEAP32[$3_1 + 108 >> 2] = $56;
             HEAP32[$3_1 + 112 >> 2] = $20;
             HEAP32[$3_1 + 116 >> 2] = $22;
             HEAP32[$3_1 + 120 >> 2] = $24;
             HEAP32[$3_1 + 124 >> 2] = $17_1;
             HEAP32[$3_1 + 128 >> 2] = $57_1;
             HEAP32[$3_1 + 132 >> 2] = $61;
             HEAP32[$3_1 + 136 >> 2] = $58;
             HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 140;
             $2_1 = 0;
            }
            if ((global$5 | 0) == 1) {
             break label$24
            }
           }
           if (!global$5) {
            break __inlined_func$24
           }
           abort();
          }
          HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
          $2_1 = HEAP32[global$6 >> 2];
          HEAP32[$2_1 >> 2] = $12;
          HEAP32[$2_1 + 4 >> 2] = $10_1;
          HEAP32[$2_1 + 8 >> 2] = $7;
          HEAP32[$2_1 + 12 >> 2] = $27_1;
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 16;
          $2_1 = 0;
         }
         if ((global$5 | 0) == 1) {
          break label$21
         }
         $45_1 = 0;
        }
        if (!global$5) {
         global$0 = $30 + 16 | 0
        }
        if (!global$5) {
         break __inlined_func$42
        }
        abort();
       }
       HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
       $2_1 = HEAP32[global$6 >> 2];
       HEAP32[$2_1 >> 2] = $30;
       HEAP32[$2_1 + 4 >> 2] = $43;
       HEAP32[$2_1 + 8 >> 2] = $44;
       HEAP32[$2_1 + 12 >> 2] = $19_1;
       HEAP32[$2_1 + 16 >> 2] = $45_1;
       HEAP32[$2_1 + 20 >> 2] = $60;
       HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 24;
      }
      if ((global$5 | 0) == 1) {
       $2_1 = 3;
       break label$2;
      }
     }
     if (!global$5) {
      global$0 = $8 + 48 | 0;
      return $9_1 | 0;
     }
    }
    if (!global$5) {
     $27();
     abort();
    }
   }
   if (!global$5) {
    $27();
    abort();
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = $2_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $2_1 = HEAP32[global$6 >> 2];
  HEAP32[$2_1 >> 2] = $0_1;
  HEAP32[$2_1 + 4 >> 2] = $1;
  HEAP32[$2_1 + 8 >> 2] = $8;
  HEAP32[$2_1 + 12 >> 2] = $9_1;
  HEAP32[$2_1 + 16 >> 2] = $18_1;
  HEAP32[$2_1 + 20 >> 2] = $31;
  HEAP32[$2_1 + 24 >> 2] = $35_1;
  HEAP32[$2_1 + 28 >> 2] = $36_1;
  HEAP32[$2_1 + 32 >> 2] = $37_1;
  HEAP32[$2_1 + 36 >> 2] = $38;
  HEAP32[$2_1 + 40 >> 2] = $39;
  HEAP32[$2_1 + 44 >> 2] = $40_1;
  HEAP32[$2_1 + 48 >> 2] = $41_1;
  HEAP32[$2_1 + 52 >> 2] = $42;
  HEAP32[$2_1 + 56 >> 2] = $59;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 60;
  return 0;
 }
 
 function $3($0_1) {
  var $1 = 0, $2_1 = 0, $3_1 = 0, $4 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 16;
   $1 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$1 >> 2];
   $3_1 = HEAP32[$1 + 4 >> 2];
   $4 = HEAP32[$1 + 8 >> 2];
   $1 = HEAP32[$1 + 12 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $2_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  $3_1 = global$5 ? $3_1 : $0_1 ? $0_1 : 1;
  label$2 : {
   label$9 : {
    while (1) {
     if (!global$5) {
      $0_1 = $32($3_1);
      if ($0_1) {
       break label$9
      }
     }
     label$12 : {
      if (!global$5) {
       $0_1 = HEAP32[517];
       if (!$0_1) {
        break label$12
       }
       $4 = $0_1;
      }
      if (!(global$5 ? $2_1 : 0)) {
       FUNCTION_TABLE[$4 | 0]();
       if ((global$5 | 0) == 1) {
        break label$2
       }
      }
      if (!global$5) {
       continue
      }
     }
     break;
    };
    if (!global$5) {
     fimport$1();
     abort();
    }
   }
   $0_1 = global$5 ? $1 : $0_1;
   if (!global$5) {
    return $0_1
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $2_1 = HEAP32[global$6 >> 2];
  HEAP32[$2_1 >> 2] = $0_1;
  HEAP32[$2_1 + 4 >> 2] = $3_1;
  HEAP32[$2_1 + 8 >> 2] = $4;
  HEAP32[$2_1 + 12 >> 2] = $1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 16;
  return 0;
 }
 
 function $5() {
  return 2e3;
 }
 
 function $6($0_1) {
  return $0_1 - 48 >>> 0 < 10;
 }
 
 function $9($0_1, $1) {
  $0_1 = $0_1 | 0;
  $1 = $1 | 0;
  global$2 = $0_1;
  global$1 = $1;
 }
 
 function $10() {
  return global$2 | 0;
 }
 
 function $11() {
  return global$1 | 0;
 }
 
 function $14($0_1, $1) {
  if (!$0_1) {
   return 0
  }
  __inlined_func$13 : {
   label$2 : {
    if ($0_1) {
     if ($1 >>> 0 <= 127) {
      break label$2
     }
     label$4 : {
      if (!HEAP32[HEAP32[436] >> 2]) {
       if (($1 & -128) == 57216) {
        break label$2
       }
       break label$4;
      }
      if ($1 >>> 0 <= 2047) {
       HEAP8[$0_1 + 1 | 0] = $1 & 63 | 128;
       HEAP8[$0_1 | 0] = $1 >>> 6 | 192;
       $0_1 = 2;
       break __inlined_func$13;
      }
      if (!(($1 & -8192) != 57344 ? $1 >>> 0 >= 55296 : 0)) {
       HEAP8[$0_1 + 2 | 0] = $1 & 63 | 128;
       HEAP8[$0_1 | 0] = $1 >>> 12 | 224;
       HEAP8[$0_1 + 1 | 0] = $1 >>> 6 & 63 | 128;
       $0_1 = 3;
       break __inlined_func$13;
      }
      if ($1 - 65536 >>> 0 <= 1048575) {
       HEAP8[$0_1 + 3 | 0] = $1 & 63 | 128;
       HEAP8[$0_1 | 0] = $1 >>> 18 | 240;
       HEAP8[$0_1 + 2 | 0] = $1 >>> 6 & 63 | 128;
       HEAP8[$0_1 + 1 | 0] = $1 >>> 12 & 63 | 128;
       $0_1 = 4;
       break __inlined_func$13;
      }
     }
     HEAP32[500] = 25;
     $0_1 = -1;
    } else {
     $0_1 = 1
    }
    break __inlined_func$13;
   }
   HEAP8[$0_1 | 0] = $1;
   $0_1 = 1;
  }
  return $0_1;
 }
 
 function $16($0_1, $1, $2_1, $3_1, $4, $5_1, $6_1) {
  var $7 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15 = 0, $16_1 = 0, $17_1 = 0, $18_1 = 0, $19_1 = 0, $20 = 0, $21 = 0, $22 = 0, $23_1 = 0, $24 = 0, $25_1 = 0, $26_1 = 0, $27_1 = 0, $28_1 = 0, $29 = 0, $30 = 0, $31 = 0, $32_1 = 0, $33_1 = 0, $34 = 0, $35_1 = 0, $36_1 = 0, $37_1 = 0, $38 = 0, $39 = 0, $40_1 = 0, $41_1 = 0, $42 = 0, $43 = 0, $44 = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $48_1 = 0, $49_1 = 0, $50_1 = 0, $51 = 0, $52_1 = 0, $53_1 = 0, $54_1 = 0, $55_1 = 0.0, $56 = 0, $57_1 = 0, $58 = 0, $59 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 312;
   $7 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$7 >> 2];
   $1 = HEAP32[$7 + 4 >> 2];
   $2_1 = HEAP32[$7 + 8 >> 2];
   $3_1 = HEAP32[$7 + 12 >> 2];
   $4 = HEAP32[$7 + 16 >> 2];
   $5_1 = HEAP32[$7 + 20 >> 2];
   $6_1 = HEAP32[$7 + 24 >> 2];
   $9_1 = HEAP32[$7 + 28 >> 2];
   $32_1 = HEAP32[$7 + 32 >> 2];
   $23_1 = HEAP32[$7 + 36 >> 2];
   $27_1 = HEAP32[$7 + 40 >> 2];
   $20 = HEAP32[$7 + 44 >> 2];
   $10_1 = HEAP32[$7 + 48 >> 2];
   $8 = HEAP32[$7 + 52 >> 2];
   $11_1 = HEAP32[$7 + 56 >> 2];
   $14_1 = HEAP32[$7 + 60 >> 2];
   $19_1 = HEAP32[$7 + 64 >> 2];
   $15 = HEAP32[$7 + 68 >> 2];
   $21 = HEAP32[$7 + 72 >> 2];
   $13 = HEAP32[$7 + 76 >> 2];
   $12 = HEAP32[$7 + 80 >> 2];
   $31 = HEAP32[$7 + 84 >> 2];
   $33_1 = HEAP32[$7 + 88 >> 2];
   $34 = HEAP32[$7 + 92 >> 2];
   $35_1 = HEAP32[$7 + 96 >> 2];
   $36_1 = HEAP32[$7 + 100 >> 2];
   $37_1 = HEAP32[$7 + 104 >> 2];
   $38 = HEAP32[$7 + 108 >> 2];
   $39 = HEAP32[$7 + 112 >> 2];
   $40_1 = HEAP32[$7 + 116 >> 2];
   $41_1 = HEAP32[$7 + 120 >> 2];
   $42 = HEAP32[$7 + 124 >> 2];
   $43 = HEAP32[$7 + 128 >> 2];
   $44 = HEAP32[$7 + 132 >> 2];
   $45_1 = HEAP32[$7 + 136 >> 2];
   $46_1 = HEAP32[$7 + 140 >> 2];
   $47_1 = HEAP32[$7 + 144 >> 2];
   $48_1 = HEAP32[$7 + 148 >> 2];
   $49_1 = HEAP32[$7 + 152 >> 2];
   $50_1 = HEAP32[$7 + 156 >> 2];
   $51 = HEAP32[$7 + 160 >> 2];
   $52_1 = HEAP32[$7 + 164 >> 2];
   $53_1 = HEAP32[$7 + 168 >> 2];
   $54_1 = HEAP32[$7 + 172 >> 2];
   $18_1 = HEAP32[$7 + 180 >> 2];
   wasm2js_scratch_store_i32(0, HEAP32[$7 + 176 >> 2]);
   wasm2js_scratch_store_i32(1, $18_1 | 0);
   $55_1 = +wasm2js_scratch_load_f64();
   $56 = HEAP32[$7 + 184 >> 2];
   $57_1 = HEAP32[$7 + 188 >> 2];
   $58 = HEAP32[$7 + 192 >> 2];
   $59 = HEAP32[$7 + 196 >> 2];
   $60 = HEAP32[$7 + 200 >> 2];
   $61 = HEAP32[$7 + 208 >> 2];
   $62 = HEAP32[$7 + 212 >> 2];
   $63 = HEAP32[$7 + 216 >> 2];
   $64 = HEAP32[$7 + 220 >> 2];
   $65 = HEAP32[$7 + 224 >> 2];
   $66 = HEAP32[$7 + 228 >> 2];
   $67 = HEAP32[$7 + 232 >> 2];
   $68 = HEAP32[$7 + 236 >> 2];
   $69 = HEAP32[$7 + 240 >> 2];
   $70 = HEAP32[$7 + 244 >> 2];
   $71 = HEAP32[$7 + 248 >> 2];
   $72 = HEAP32[$7 + 252 >> 2];
   $73 = HEAP32[$7 + 256 >> 2];
   $74 = HEAP32[$7 + 260 >> 2];
   $75 = HEAP32[$7 + 264 >> 2];
   $76 = HEAP32[$7 + 268 >> 2];
   $77 = HEAP32[$7 + 272 >> 2];
   $78 = HEAP32[$7 + 276 >> 2];
   $79 = HEAP32[$7 + 280 >> 2];
   $80 = HEAP32[$7 + 284 >> 2];
   $81 = HEAP32[$7 + 288 >> 2];
   $82 = HEAP32[$7 + 292 >> 2];
   $83 = HEAP32[$7 + 296 >> 2];
   $84 = HEAP32[$7 + 300 >> 2];
   $85 = HEAP32[$7 + 304 >> 2];
   $86 = HEAP32[$7 + 308 >> 2];
   $87 = HEAP32[$7 + 204 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $22 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $9_1 = global$0 - 80 | 0;
   global$0 = $9_1;
   HEAP32[$9_1 + 76 >> 2] = $1;
   $32_1 = $9_1 + 55 | 0;
   $23_1 = $9_1 + 56 | 0;
   $27_1 = 0;
   $20 = 0;
   $1 = 0;
  }
  label$2 : {
   label$9 : {
    label$10 : while (1) {
     if (!global$5) {
      label$12 : {
       if (($20 | 0) < 0) {
        break label$12
       }
       if (($1 | 0) > (2147483647 - $20 | 0)) {
        HEAP32[500] = 61;
        $20 = -1;
        break label$12;
       }
       $20 = $1 + $20 | 0;
      }
      $10_1 = HEAP32[$9_1 + 76 >> 2];
      $1 = $10_1;
     }
     label$14 : {
      label$15 : {
       label$16 : {
        label$17 : {
         label$18 : {
          if (!global$5) {
           $8 = HEAPU8[$10_1 | 0];
           if (!$8) {
            break label$18
           }
          }
          while (1) {
           label$22 : {
            if (!global$5) {
             $8 = $8 & 255;
             label$24 : {
              if (!$8) {
               $8 = $1;
               break label$24;
              }
              if (($8 | 0) != 37) {
               break label$22
              }
              $8 = $1;
              while (1) {
               if (HEAPU8[$1 + 1 | 0] != 37) {
                break label$24
               }
               $11_1 = $1 + 2 | 0;
               HEAP32[$9_1 + 76 >> 2] = $11_1;
               $8 = $8 + 1 | 0;
               $14_1 = HEAPU8[$1 + 2 | 0];
               $1 = $11_1;
               if (($14_1 | 0) == 37) {
                continue
               }
               break;
              };
             }
             $1 = $8 - $10_1 | 0;
            }
            label$27 : {
             if (!global$5) {
              if (!$0_1) {
               break label$27
              }
              $34 = $10_1;
              $33_1 = $0_1;
              $35_1 = $1;
             }
             if (!(global$5 ? $22 : 0)) {
              $17($33_1, $34, $35_1);
              if ((global$5 | 0) == 1) {
               $7 = 0;
               break label$2;
              }
             }
            }
            if (!global$5) {
             if ($1) {
              continue label$10
             }
             $19_1 = -1;
             $7 = $9_1;
             $8 = !$6(HEAP8[HEAP32[$9_1 + 76 >> 2] + 1 | 0]);
             $1 = HEAP32[$9_1 + 76 >> 2];
             if ($8 | HEAPU8[$1 + 2 | 0] != 36) {
              $8 = 1
             } else {
              $19_1 = HEAP8[$1 + 1 | 0] - 48 | 0;
              $27_1 = 1;
              $8 = 3;
             }
             $1 = $8 + $1 | 0;
             HEAP32[$7 + 76 >> 2] = $1;
             $15 = 0;
             $14_1 = HEAP8[$1 | 0];
             $11_1 = $14_1 - 32 | 0;
             label$35 : {
              if ($11_1 >>> 0 > 31) {
               $8 = $1;
               break label$35;
              }
              $8 = $1;
              $11_1 = 1 << $11_1;
              if (!($11_1 & 75913)) {
               break label$35
              }
              while (1) {
               $8 = $1 + 1 | 0;
               HEAP32[$9_1 + 76 >> 2] = $8;
               $15 = $11_1 | $15;
               $14_1 = HEAP8[$1 + 1 | 0];
               $11_1 = $14_1 - 32 | 0;
               if ($11_1 >>> 0 >= 32) {
                break label$35
               }
               $1 = $8;
               $11_1 = 1 << $11_1;
               if ($11_1 & 75913) {
                continue
               }
               break;
              };
             }
             label$38 : {
              if (($14_1 | 0) == 42) {
               $7 = $9_1;
               label$40 : {
                label$41 : {
                 if (!$6(HEAP8[$8 + 1 | 0])) {
                  break label$41
                 }
                 $8 = HEAP32[$9_1 + 76 >> 2];
                 if (HEAPU8[$8 + 2 | 0] != 36) {
                  break label$41
                 }
                 HEAP32[((HEAP8[$8 + 1 | 0] << 2) + $4 | 0) - 192 >> 2] = 10;
                 $21 = HEAP32[((HEAP8[$8 + 1 | 0] << 3) + $3_1 | 0) - 384 >> 2];
                 $27_1 = 1;
                 $1 = $8 + 3 | 0;
                 break label$40;
                }
                if ($27_1) {
                 break label$17
                }
                $27_1 = 0;
                $21 = 0;
                if ($0_1) {
                 $1 = HEAP32[$2_1 >> 2];
                 HEAP32[$2_1 >> 2] = $1 + 4;
                 $21 = HEAP32[$1 >> 2];
                }
                $1 = HEAP32[$9_1 + 76 >> 2] + 1 | 0;
               }
               HEAP32[$7 + 76 >> 2] = $1;
               if (($21 | 0) > -1) {
                break label$38
               }
               $21 = 0 - $21 | 0;
               $15 = $15 | 8192;
               break label$38;
              }
              $21 = $18($9_1 + 76 | 0);
              if (($21 | 0) < 0) {
               break label$17
              }
              $1 = HEAP32[$9_1 + 76 >> 2];
             }
             $13 = -1;
             label$43 : {
              if (HEAPU8[$1 | 0] != 46) {
               break label$43
              }
              if (HEAPU8[$1 + 1 | 0] == 42) {
               label$45 : {
                if (!$6(HEAP8[$1 + 2 | 0])) {
                 break label$45
                }
                $1 = HEAP32[$9_1 + 76 >> 2];
                if (HEAPU8[$1 + 3 | 0] != 36) {
                 break label$45
                }
                HEAP32[((HEAP8[$1 + 2 | 0] << 2) + $4 | 0) - 192 >> 2] = 10;
                $13 = HEAP32[((HEAP8[$1 + 2 | 0] << 3) + $3_1 | 0) - 384 >> 2];
                $1 = $1 + 4 | 0;
                HEAP32[$9_1 + 76 >> 2] = $1;
                break label$43;
               }
               if ($27_1) {
                break label$17
               }
               if ($0_1) {
                $1 = HEAP32[$2_1 >> 2];
                HEAP32[$2_1 >> 2] = $1 + 4;
                $13 = HEAP32[$1 >> 2];
               } else {
                $13 = 0
               }
               $1 = HEAP32[$9_1 + 76 >> 2] + 2 | 0;
               HEAP32[$9_1 + 76 >> 2] = $1;
               break label$43;
              }
              HEAP32[$9_1 + 76 >> 2] = $1 + 1;
              $13 = $18($9_1 + 76 | 0);
              $1 = HEAP32[$9_1 + 76 >> 2];
             }
             $8 = 0;
             while (1) {
              $11_1 = $8;
              $12 = -1;
              if (HEAP8[$1 | 0] - 65 >>> 0 > 57) {
               break label$9
              }
              $14_1 = $1 + 1 | 0;
              HEAP32[$9_1 + 76 >> 2] = $14_1;
              $8 = HEAP8[$1 | 0];
              $1 = $14_1;
              $8 = HEAPU8[($8 + Math_imul($11_1, 58) | 0) + 1023 | 0];
              if ($8 - 1 >>> 0 < 8) {
               continue
              }
              break;
             };
            }
            label$49 : {
             label$50 : {
              label$51 : {
               if (!global$5) {
                if (($8 | 0) == 19) {
                 break label$51
                }
                if (!$8) {
                 break label$9
                }
                if (($19_1 | 0) >= 0) {
                 HEAP32[($19_1 << 2) + $4 >> 2] = $8;
                 $7 = ($19_1 << 3) + $3_1 | 0;
                 $18_1 = HEAP32[$7 + 4 >> 2];
                 HEAP32[$9_1 + 64 >> 2] = HEAP32[$7 >> 2];
                 HEAP32[$9_1 + 68 >> 2] = $18_1;
                 break label$50;
                }
                if (!$0_1) {
                 break label$14
                }
                $36_1 = $9_1 - -64 | 0;
                $38 = $2_1;
                $37_1 = $8;
                $39 = $6_1;
               }
               if (global$5 ? ($22 | 0) == 1 : 1) {
                $19($36_1, $37_1, $38, $39);
                if ((global$5 | 0) == 1) {
                 $7 = 1;
                 break label$2;
                }
               }
               if (!global$5) {
                $14_1 = HEAP32[$9_1 + 76 >> 2];
                break label$49;
               }
              }
              if (!global$5) {
               $12 = -1;
               if (($19_1 | 0) > -1) {
                break label$9
               }
              }
             }
             if (!global$5) {
              $1 = 0;
              if (!$0_1) {
               continue label$10
              }
             }
            }
            if (!global$5) {
             $31 = $15 & -65537;
             $8 = $15 & 8192 ? $31 : $15;
             $19_1 = 1029;
             $12 = 0;
             $15 = $23_1;
            }
            label$62 : {
             label$63 : {
              label$64 : {
               label$65 : {
                label$66 : {
                 if (!global$5) {
                  label$68 : {
                   label$69 : {
                    label$70 : {
                     label$71 : {
                      label$72 : {
                       label$73 : {
                        label$74 : {
                         label$75 : {
                          label$76 : {
                           label$77 : {
                            label$78 : {
                             $1 = HEAP8[$14_1 - 1 | 0];
                             $1 = $11_1 ? (($1 & 15) == 3 ? $1 & -33 : $1) : $1;
                             switch ($1 - 88 | 0) {
                             case 1:
                             case 2:
                             case 3:
                             case 4:
                             case 5:
                             case 6:
                             case 7:
                             case 8:
                             case 10:
                             case 16:
                             case 18:
                             case 19:
                             case 20:
                             case 21:
                             case 25:
                             case 26:
                             case 28:
                             case 30:
                             case 31:
                              break label$15;
                             case 11:
                              break label$62;
                             case 9:
                             case 13:
                             case 14:
                             case 15:
                              break label$63;
                             case 27:
                              break label$69;
                             case 12:
                             case 17:
                              break label$72;
                             case 23:
                              break label$73;
                             case 0:
                             case 32:
                              break label$74;
                             case 24:
                              break label$75;
                             case 22:
                              break label$76;
                             case 29:
                              break label$77;
                             default:
                              break label$78;
                             };
                            }
                            $15 = $23_1;
                            label$79 : {
                             switch ($1 - 65 | 0) {
                             case 1:
                             case 3:
                              break label$15;
                             case 0:
                             case 4:
                             case 5:
                             case 6:
                              break label$63;
                             case 2:
                              break label$66;
                             default:
                              break label$79;
                             };
                            }
                            if (($1 | 0) == 83) {
                             break label$68
                            }
                            break label$16;
                           }
                           $12 = 0;
                           $10_1 = HEAP32[$9_1 + 64 >> 2];
                           $7 = HEAP32[$9_1 + 68 >> 2];
                           $19_1 = 1029;
                           break label$71;
                          }
                          $1 = 0;
                          label$80 : {
                           switch ($11_1 & 255) {
                           case 0:
                            HEAP32[HEAP32[$9_1 + 64 >> 2] >> 2] = $20;
                            continue label$10;
                           case 1:
                            HEAP32[HEAP32[$9_1 + 64 >> 2] >> 2] = $20;
                            continue label$10;
                           case 2:
                            $7 = HEAP32[$9_1 + 64 >> 2];
                            HEAP32[$7 >> 2] = $20;
                            HEAP32[$7 + 4 >> 2] = $20 >> 31;
                            continue label$10;
                           case 3:
                            HEAP16[HEAP32[$9_1 + 64 >> 2] >> 1] = $20;
                            continue label$10;
                           case 4:
                            HEAP8[HEAP32[$9_1 + 64 >> 2]] = $20;
                            continue label$10;
                           case 6:
                            HEAP32[HEAP32[$9_1 + 64 >> 2] >> 2] = $20;
                            continue label$10;
                           case 7:
                            break label$80;
                           default:
                            continue label$10;
                           };
                          }
                          $7 = HEAP32[$9_1 + 64 >> 2];
                          HEAP32[$7 >> 2] = $20;
                          HEAP32[$7 + 4 >> 2] = $20 >> 31;
                          continue label$10;
                         }
                         $13 = $13 >>> 0 > 8 ? $13 : 8;
                         $8 = $8 | 8;
                         $1 = 120;
                        }
                        $7 = $23_1;
                        $18_1 = $1 & 32;
                        $16_1 = HEAP32[$9_1 + 64 >> 2];
                        $12 = HEAP32[$9_1 + 68 >> 2];
                        if ($16_1 | $12) {
                         while (1) {
                          $7 = $7 - 1 | 0;
                          HEAP8[$7 | 0] = HEAPU8[($16_1 & 15) + 1552 | 0] | $18_1;
                          $19_1 = !$12 & $16_1 >>> 0 > 15 | ($12 | 0) != 0;
                          $10_1 = $12;
                          $12 = $10_1 >>> 4 | 0;
                          $16_1 = ($10_1 & 15) << 28 | $16_1 >>> 4;
                          if ($19_1) {
                           continue
                          }
                          break;
                         }
                        }
                        $10_1 = $7;
                        $12 = 0;
                        $19_1 = 1029;
                        if (!(HEAP32[$9_1 + 64 >> 2] | HEAP32[$9_1 + 68 >> 2]) | !($8 & 8)) {
                         break label$70
                        }
                        $19_1 = ($1 >>> 4 | 0) + 1029 | 0;
                        $12 = 2;
                        break label$70;
                       }
                       $12 = 0;
                       $19_1 = 1029;
                       $7 = $23_1;
                       $16_1 = HEAP32[$9_1 + 64 >> 2];
                       $18_1 = HEAP32[$9_1 + 68 >> 2];
                       if ($16_1 | $18_1) {
                        while (1) {
                         $7 = $7 - 1 | 0;
                         HEAP8[$7 | 0] = $16_1 & 7 | 48;
                         $24 = !$18_1 & $16_1 >>> 0 > 7 | ($18_1 | 0) != 0;
                         $10_1 = $18_1;
                         $18_1 = $10_1 >>> 3 | 0;
                         $16_1 = ($10_1 & 7) << 29 | $16_1 >>> 3;
                         if ($24) {
                          continue
                         }
                         break;
                        }
                       }
                       $10_1 = $7;
                       if (!($8 & 8)) {
                        break label$70
                       }
                       $1 = $23_1 - $10_1 | 0;
                       $13 = ($1 | 0) < ($13 | 0) ? $13 : $1 + 1 | 0;
                       break label$70;
                      }
                      $12 = HEAP32[$9_1 + 68 >> 2];
                      $7 = $12;
                      $10_1 = HEAP32[$9_1 + 64 >> 2];
                      if (($7 | 0) <= -1) {
                       $7 = 0 - ($7 + (($10_1 | 0) != 0) | 0) | 0;
                       $10_1 = 0 - $10_1 | 0;
                       HEAP32[$9_1 + 64 >> 2] = $10_1;
                       HEAP32[$9_1 + 68 >> 2] = $7;
                       $12 = 1;
                       $19_1 = 1029;
                       break label$71;
                      }
                      if ($8 & 2048) {
                       $12 = 1;
                       $19_1 = 1030;
                       break label$71;
                      }
                      $12 = $8 & 1;
                      $19_1 = $12 ? 1031 : 1029;
                     }
                     $16_1 = $23_1;
                     $18_1 = $7;
                     label$21 : {
                      if (!(($7 | 0) == 1 | $7 >>> 0 > 1)) {
                       $7 = $10_1;
                       break label$21;
                      }
                      while (1) {
                       $7 = $10_1;
                       $29 = 0;
                       $88 = 0;
                       $24 = $18_1;
                       $25_1 = $18_1;
                       __inlined_func$_ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E : {
                        if (!$18_1) {
                         i64toi32_i32$HIGH_BITS = 0;
                         $7 = ($7 >>> 0) / 10 | 0;
                         break __inlined_func$_ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E;
                        }
                        $30 = 61 - Math_clz32($25_1) | 0;
                        $28_1 = 0 - $30 | 0;
                        $26_1 = $30 & 63;
                        $17_1 = $26_1 & 31;
                        if ($26_1 >>> 0 >= 32) {
                         $26_1 = 0;
                         $25_1 = $25_1 >>> $17_1 | 0;
                        } else {
                         $26_1 = $25_1 >>> $17_1 | 0;
                         $25_1 = ((1 << $17_1) - 1 & $25_1) << 32 - $17_1 | $7 >>> $17_1;
                        }
                        $28_1 = $28_1 & 63;
                        $17_1 = $28_1 & 31;
                        if ($28_1 >>> 0 >= 32) {
                         $24 = $7 << $17_1;
                         $7 = 0;
                        } else {
                         $24 = (1 << $17_1) - 1 & $7 >>> 32 - $17_1 | $24 << $17_1;
                         $7 = $7 << $17_1;
                        }
                        if ($30) {
                         while (1) {
                          $17_1 = $25_1 << 1 | $24 >>> 31;
                          $29 = $17_1;
                          $26_1 = $26_1 << 1 | $25_1 >>> 31;
                          $17_1 = 0 - ($26_1 + ($17_1 >>> 0 > 9) | 0) >> 31;
                          $28_1 = $17_1 & 10;
                          $25_1 = $29 - $28_1 | 0;
                          $26_1 = $26_1 - ($28_1 >>> 0 > $29 >>> 0) | 0;
                          $24 = $24 << 1 | $7 >>> 31;
                          $7 = $88 | $7 << 1;
                          $29 = $17_1 & 1;
                          $88 = $29;
                          $30 = $30 - 1 | 0;
                          if ($30) {
                           continue
                          }
                          break;
                         }
                        }
                        i64toi32_i32$HIGH_BITS = $24 << 1 | $7 >>> 31;
                        $7 = $29 | $7 << 1;
                       }
                       $17_1 = i64toi32_i32$HIGH_BITS;
                       $24 = $17_1;
                       $16_1 = $16_1 - 1 | 0;
                       HEAP8[$16_1 | 0] = $10_1 - __wasm_i64_mul($7, $17_1, 10, 0) | 48;
                       $17_1 = $18_1 >>> 0 > 9;
                       $10_1 = $7;
                       $18_1 = $24;
                       if ($17_1) {
                        continue
                       }
                       break;
                      };
                     }
                     if ($7) {
                      while (1) {
                       $16_1 = $16_1 - 1 | 0;
                       $10_1 = ($7 >>> 0) / 10 | 0;
                       HEAP8[$16_1 | 0] = $7 - Math_imul($10_1, 10) | 48;
                       $18_1 = $7 >>> 0 > 9;
                       $7 = $10_1;
                       if ($18_1) {
                        continue
                       }
                       break;
                      }
                     }
                     $10_1 = $16_1;
                    }
                    $8 = ($13 | 0) > -1 ? $8 & -65537 : $8;
                    $7 = HEAP32[$9_1 + 68 >> 2];
                    $18_1 = $7;
                    $16_1 = HEAP32[$9_1 + 64 >> 2];
                    if (!($13 | (($16_1 | 0) != 0 | ($7 | 0) != 0))) {
                     $13 = 0;
                     $10_1 = $23_1;
                     break label$16;
                    }
                    $1 = !($18_1 | $16_1) + ($23_1 - $10_1 | 0) | 0;
                    $13 = ($1 | 0) < ($13 | 0) ? $13 : $1;
                    break label$16;
                   }
                   $12 = 0;
                   $1 = $13;
                   $15 = ($1 | 0) != 0;
                   $8 = HEAP32[$9_1 + 64 >> 2];
                   $10_1 = $8 ? $8 : 1059;
                   $7 = $10_1;
                   __inlined_func$7 : {
                    label$23 : {
                     label$34 : {
                      label$46 : {
                       if (!($7 & 3) | !$1) {
                        break label$46
                       }
                       while (1) {
                        if (!HEAPU8[$7 | 0]) {
                         break label$34
                        }
                        $1 = $1 - 1 | 0;
                        $15 = ($1 | 0) != 0;
                        $7 = $7 + 1 | 0;
                        if (!($7 & 3)) {
                         break label$46
                        }
                        if ($1) {
                         continue
                        }
                        break;
                       };
                      }
                      if (!$15) {
                       break label$23
                      }
                     }
                     label$67 : {
                      if (!HEAPU8[$7 | 0] | $1 >>> 0 < 4) {
                       break label$67
                      }
                      while (1) {
                       $8 = HEAP32[$7 >> 2];
                       if (($8 ^ -1) & $8 - 16843009 & -2139062144) {
                        break label$67
                       }
                       $7 = $7 + 4 | 0;
                       $1 = $1 - 4 | 0;
                       if ($1 >>> 0 > 3) {
                        continue
                       }
                       break;
                      };
                     }
                     if (!$1) {
                      break label$23
                     }
                     while (1) {
                      $8 = $7;
                      if (!HEAPU8[$7 | 0]) {
                       break __inlined_func$7
                      }
                      $7 = $7 + 1 | 0;
                      $1 = $1 - 1 | 0;
                      if ($1) {
                       continue
                      }
                      break;
                     };
                    }
                    $8 = 0;
                   }
                   $1 = $8;
                   $15 = $1 ? $1 : $10_1 + $13 | 0;
                   $8 = $31;
                   $13 = $1 ? $1 - $10_1 | 0 : $13;
                   break label$15;
                  }
                  $7 = HEAP32[$9_1 + 64 >> 2];
                  if ($13) {
                   break label$65
                  }
                  $40_1 = $0_1;
                  $41_1 = $21;
                  $42 = $8;
                  $1 = 0;
                 }
                 if (global$5 ? ($22 | 0) == 2 : 1) {
                  $23($40_1, 32, $41_1, 0, $42);
                  if ((global$5 | 0) == 1) {
                   $7 = 2;
                   break label$2;
                  }
                 }
                 if (!global$5) {
                  break label$64
                 }
                }
                if (!global$5) {
                 HEAP32[$9_1 + 12 >> 2] = 0;
                 HEAP32[$9_1 + 8 >> 2] = HEAP32[$9_1 + 64 >> 2];
                 $11_1 = $9_1 + 8 | 0;
                 HEAP32[$9_1 + 64 >> 2] = $11_1;
                 $13 = -1;
                }
                $7 = $11_1;
               }
               $11_1 = $7;
               if (!global$5) {
                $1 = 0;
                label$98 : {
                 while (1) {
                  $14_1 = HEAP32[$11_1 >> 2];
                  if (!$14_1) {
                   break label$98
                  }
                  $14_1 = $14($9_1 + 4 | 0, $14_1);
                  $10_1 = ($14_1 | 0) < 0;
                  if (!($10_1 | $13 - $1 >>> 0 < $14_1 >>> 0)) {
                   $11_1 = $11_1 + 4 | 0;
                   $1 = $1 + $14_1 | 0;
                   if ($13 >>> 0 > $1 >>> 0) {
                    continue
                   }
                   break label$98;
                  }
                  break;
                 };
                 $12 = -1;
                 if ($10_1) {
                  break label$9
                 }
                }
                $44 = $21;
                $45_1 = $1;
                $43 = $0_1;
                $46_1 = $8;
               }
               if (global$5 ? ($22 | 0) == 3 : 1) {
                $23($43, 32, $44, $45_1, $46_1);
                if ((global$5 | 0) == 1) {
                 $7 = 3;
                 break label$2;
                }
               }
               if (!global$5) {
                if (!$1) {
                 $1 = 0;
                 break label$64;
                }
                $14_1 = HEAP32[$9_1 + 64 >> 2];
                $11_1 = 0;
               }
               while (1) {
                if (!global$5) {
                 $10_1 = HEAP32[$14_1 >> 2];
                 if (!$10_1) {
                  break label$64
                 }
                 $10_1 = $14($9_1 + 4 | 0, $10_1);
                 $11_1 = $11_1 + $10_1 | 0;
                 if (($11_1 | 0) > ($1 | 0)) {
                  break label$64
                 }
                 $48_1 = $9_1 + 4 | 0;
                 $47_1 = $0_1;
                 $49_1 = $10_1;
                }
                if (global$5 ? ($22 | 0) == 4 : 1) {
                 $17($47_1, $48_1, $49_1);
                 if ((global$5 | 0) == 1) {
                  $7 = 4;
                  break label$2;
                 }
                }
                if (!global$5) {
                 $14_1 = $14_1 + 4 | 0;
                 if ($1 >>> 0 > $11_1 >>> 0) {
                  continue
                 }
                }
                break;
               };
              }
              if (!global$5) {
               $51 = $21;
               $53_1 = $8 ^ 8192;
               $50_1 = $0_1;
               $52_1 = $1;
              }
              if (global$5 ? ($22 | 0) == 5 : 1) {
               $23($50_1, 32, $51, $52_1, $53_1);
               if ((global$5 | 0) == 1) {
                $7 = 5;
                break label$2;
               }
              }
              if (!global$5) {
               $1 = ($1 | 0) < ($21 | 0) ? $21 : $1;
               continue label$10;
              }
             }
             if (!global$5) {
              $55_1 = HEAPF64[$9_1 + 64 >> 3];
              $56 = $21;
              $57_1 = $13;
              $58 = $8;
              $59 = $1;
              $54_1 = $0_1;
              $60 = $5_1;
             }
             if (global$5 ? ($22 | 0) == 6 : 1) {
              $7 = FUNCTION_TABLE[$60 | 0]($54_1, $55_1, $56, $57_1, $58, $59) | 0;
              if ((global$5 | 0) == 1) {
               $7 = 6;
               break label$2;
              }
              $87 = $7;
             }
             if (!global$5) {
              $1 = $87;
              continue label$10;
             }
            }
            if (!global$5) {
             HEAP8[$9_1 + 55 | 0] = HEAP32[$9_1 + 64 >> 2];
             $13 = 1;
             $10_1 = $32_1;
             $15 = $23_1;
             $8 = $31;
             break label$15;
            }
           }
           if (!global$5) {
            $11_1 = $1 + 1 | 0;
            HEAP32[$9_1 + 76 >> 2] = $11_1;
            $8 = HEAPU8[$1 + 1 | 0];
            $1 = $11_1;
            continue;
           }
           break;
          };
         }
         if (!global$5) {
          $12 = $20;
          if ($0_1) {
           break label$9
          }
          if (!$27_1) {
           break label$14
          }
          $1 = 1;
         }
         while (1) {
          label$130 : {
           if (!global$5) {
            $8 = HEAP32[($1 << 2) + $4 >> 2];
            if (!$8) {
             break label$130
            }
            $61 = ($1 << 3) + $3_1 | 0;
            $63 = $2_1;
            $62 = $8;
            $64 = $6_1;
           }
           if (global$5 ? ($22 | 0) == 7 : 1) {
            $19($61, $62, $63, $64);
            if ((global$5 | 0) == 1) {
             $7 = 7;
             break label$2;
            }
           }
           if (!global$5) {
            $12 = 1;
            $1 = $1 + 1 | 0;
            if (($1 | 0) != 10) {
             continue
            }
            break label$9;
           }
          }
          break;
         };
         if (!global$5) {
          $12 = 1;
          if ($1 >>> 0 >= 10) {
           break label$9
          }
          while (1) {
           if (HEAP32[($1 << 2) + $4 >> 2]) {
            break label$17
           }
           $1 = $1 + 1 | 0;
           if (($1 | 0) != 10) {
            continue
           }
           break;
          };
          break label$9;
         }
        }
        if (!global$5) {
         $12 = -1;
         break label$9;
        }
       }
       $15 = global$5 ? $15 : $23_1;
      }
      if (!global$5) {
       $14_1 = $15 - $10_1 | 0;
       $15 = ($13 | 0) < ($14_1 | 0) ? $14_1 : $13;
       $11_1 = $12 + $15 | 0;
       $1 = ($11_1 | 0) > ($21 | 0) ? $11_1 : $21;
       $66 = $1;
       $67 = $11_1;
       $65 = $0_1;
       $68 = $8;
      }
      if (global$5 ? ($22 | 0) == 8 : 1) {
       $23($65, 32, $66, $67, $68);
       if ((global$5 | 0) == 1) {
        $7 = 8;
        break label$2;
       }
      }
      if (!global$5) {
       $70 = $19_1;
       $69 = $0_1;
       $71 = $12;
      }
      if (global$5 ? ($22 | 0) == 9 : 1) {
       $17($69, $70, $71);
       if ((global$5 | 0) == 1) {
        $7 = 9;
        break label$2;
       }
      }
      if (!global$5) {
       $73 = $1;
       $75 = $8 ^ 65536;
       $72 = $0_1;
       $74 = $11_1;
      }
      if (global$5 ? ($22 | 0) == 10 : 1) {
       $23($72, 48, $73, $74, $75);
       if ((global$5 | 0) == 1) {
        $7 = 10;
        break label$2;
       }
      }
      if (!global$5) {
       $77 = $15;
       $76 = $0_1;
       $78 = $14_1;
      }
      if (global$5 ? ($22 | 0) == 11 : 1) {
       $23($76, 48, $77, $78, 0);
       if ((global$5 | 0) == 1) {
        $7 = 11;
        break label$2;
       }
      }
      if (!global$5) {
       $80 = $10_1;
       $79 = $0_1;
       $81 = $14_1;
      }
      if (global$5 ? ($22 | 0) == 12 : 1) {
       $17($79, $80, $81);
       if ((global$5 | 0) == 1) {
        $7 = 12;
        break label$2;
       }
      }
      if (!global$5) {
       $83 = $1;
       $85 = $8 ^ 8192;
       $82 = $0_1;
       $84 = $11_1;
      }
      if (global$5 ? ($22 | 0) == 13 : 1) {
       $23($82, 32, $83, $84, $85);
       if ((global$5 | 0) == 1) {
        $7 = 13;
        break label$2;
       }
      }
      if (!global$5) {
       continue
      }
     }
     break;
    };
    $12 = global$5 ? $12 : 0;
   }
   if (!global$5) {
    global$0 = $9_1 + 80 | 0;
    $86 = $12;
   }
   if (!global$5) {
    return $86
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = $7;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $7 = HEAP32[global$6 >> 2];
  HEAP32[$7 >> 2] = $0_1;
  HEAP32[$7 + 4 >> 2] = $1;
  HEAP32[$7 + 8 >> 2] = $2_1;
  HEAP32[$7 + 12 >> 2] = $3_1;
  HEAP32[$7 + 16 >> 2] = $4;
  HEAP32[$7 + 20 >> 2] = $5_1;
  HEAP32[$7 + 24 >> 2] = $6_1;
  HEAP32[$7 + 28 >> 2] = $9_1;
  HEAP32[$7 + 32 >> 2] = $32_1;
  HEAP32[$7 + 36 >> 2] = $23_1;
  HEAP32[$7 + 40 >> 2] = $27_1;
  HEAP32[$7 + 44 >> 2] = $20;
  HEAP32[$7 + 48 >> 2] = $10_1;
  HEAP32[$7 + 52 >> 2] = $8;
  HEAP32[$7 + 56 >> 2] = $11_1;
  HEAP32[$7 + 60 >> 2] = $14_1;
  HEAP32[$7 + 64 >> 2] = $19_1;
  HEAP32[$7 + 68 >> 2] = $15;
  HEAP32[$7 + 72 >> 2] = $21;
  HEAP32[$7 + 76 >> 2] = $13;
  HEAP32[$7 + 80 >> 2] = $12;
  HEAP32[$7 + 84 >> 2] = $31;
  HEAP32[$7 + 88 >> 2] = $33_1;
  HEAP32[$7 + 92 >> 2] = $34;
  HEAP32[$7 + 96 >> 2] = $35_1;
  HEAP32[$7 + 100 >> 2] = $36_1;
  HEAP32[$7 + 104 >> 2] = $37_1;
  HEAP32[$7 + 108 >> 2] = $38;
  HEAP32[$7 + 112 >> 2] = $39;
  HEAP32[$7 + 116 >> 2] = $40_1;
  HEAP32[$7 + 120 >> 2] = $41_1;
  HEAP32[$7 + 124 >> 2] = $42;
  HEAP32[$7 + 128 >> 2] = $43;
  HEAP32[$7 + 132 >> 2] = $44;
  HEAP32[$7 + 136 >> 2] = $45_1;
  HEAP32[$7 + 140 >> 2] = $46_1;
  HEAP32[$7 + 144 >> 2] = $47_1;
  HEAP32[$7 + 148 >> 2] = $48_1;
  HEAP32[$7 + 152 >> 2] = $49_1;
  HEAP32[$7 + 156 >> 2] = $50_1;
  HEAP32[$7 + 160 >> 2] = $51;
  HEAP32[$7 + 164 >> 2] = $52_1;
  HEAP32[$7 + 168 >> 2] = $53_1;
  HEAP32[$7 + 172 >> 2] = $54_1;
  wasm2js_scratch_store_f64(+$55_1);
  $0_1 = wasm2js_scratch_load_i32(1) | 0;
  HEAP32[$7 + 176 >> 2] = wasm2js_scratch_load_i32(0);
  HEAP32[$7 + 180 >> 2] = $0_1;
  HEAP32[$7 + 184 >> 2] = $56;
  HEAP32[$7 + 188 >> 2] = $57_1;
  HEAP32[$7 + 192 >> 2] = $58;
  HEAP32[$7 + 196 >> 2] = $59;
  HEAP32[$7 + 200 >> 2] = $60;
  HEAP32[$7 + 204 >> 2] = $87;
  HEAP32[$7 + 208 >> 2] = $61;
  HEAP32[$7 + 212 >> 2] = $62;
  HEAP32[$7 + 216 >> 2] = $63;
  HEAP32[$7 + 220 >> 2] = $64;
  HEAP32[$7 + 224 >> 2] = $65;
  HEAP32[$7 + 228 >> 2] = $66;
  HEAP32[$7 + 232 >> 2] = $67;
  HEAP32[$7 + 236 >> 2] = $68;
  HEAP32[$7 + 240 >> 2] = $69;
  HEAP32[$7 + 244 >> 2] = $70;
  HEAP32[$7 + 248 >> 2] = $71;
  HEAP32[$7 + 252 >> 2] = $72;
  HEAP32[$7 + 256 >> 2] = $73;
  HEAP32[$7 + 260 >> 2] = $74;
  HEAP32[$7 + 264 >> 2] = $75;
  HEAP32[$7 + 268 >> 2] = $76;
  HEAP32[$7 + 272 >> 2] = $77;
  HEAP32[$7 + 276 >> 2] = $78;
  HEAP32[$7 + 280 >> 2] = $79;
  HEAP32[$7 + 284 >> 2] = $80;
  HEAP32[$7 + 288 >> 2] = $81;
  HEAP32[$7 + 292 >> 2] = $82;
  HEAP32[$7 + 296 >> 2] = $83;
  HEAP32[$7 + 300 >> 2] = $84;
  HEAP32[$7 + 304 >> 2] = $85;
  HEAP32[$7 + 308 >> 2] = $86;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 312;
  return 0;
 }
 
 function $17($0_1, $1, $2_1) {
  var $3_1 = 0, $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15 = 0, $16_1 = 0, $17_1 = 0, $18_1 = 0, $19_1 = 0, $20 = 0, $21 = 0, $22 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 16;
   $5_1 = HEAP32[global$6 >> 2];
   $7 = HEAP32[$5_1 >> 2];
   $21 = HEAP32[$5_1 + 12 >> 2];
   $8 = HEAP32[$5_1 + 4 >> 2];
   $9_1 = HEAP32[$5_1 + 8 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $4 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  label$2 : {
   label$6 : {
    if (!global$5) {
     if (HEAPU8[$0_1 | 0] & 32) {
      break label$6
     }
     $8 = $2_1;
     $9_1 = $0_1;
     $7 = $1;
    }
    if (!(global$5 ? $4 : 0)) {
     $2_1 = $7;
     $1 = $8;
     $0_1 = $9_1;
     $4 = 0;
     $5_1 = 0;
     if ((global$5 | 0) == 2) {
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 68;
      $1 = HEAP32[global$6 >> 2];
      $2_1 = HEAP32[$1 >> 2];
      $0_1 = HEAP32[$1 + 8 >> 2];
      $4 = HEAP32[$1 + 12 >> 2];
      $5_1 = HEAP32[$1 + 16 >> 2];
      $6_1 = HEAP32[$1 + 20 >> 2];
      $10_1 = HEAP32[$1 + 24 >> 2];
      $11_1 = HEAP32[$1 + 28 >> 2];
      $12 = HEAP32[$1 + 32 >> 2];
      $13 = HEAP32[$1 + 36 >> 2];
      $19_1 = HEAP32[$1 + 40 >> 2];
      $14_1 = HEAP32[$1 + 44 >> 2];
      $15 = HEAP32[$1 + 48 >> 2];
      $16_1 = HEAP32[$1 + 52 >> 2];
      $17_1 = HEAP32[$1 + 56 >> 2];
      $18_1 = HEAP32[$1 + 60 >> 2];
      $22 = HEAP32[$1 + 64 >> 2];
      $1 = HEAP32[$1 + 4 >> 2];
     }
     if ((global$5 | 0) == 2) {
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
      $20 = HEAP32[HEAP32[global$6 >> 2] >> 2];
     }
     __inlined_func$39 : {
      label$20 : {
       label$8 : {
        if (!global$5) {
         $4 = HEAP32[$0_1 + 16 >> 2];
         if (!$4) {
          $5_1 = 0;
          $4 = $0_1;
          $3_1 = HEAPU8[$0_1 + 74 | 0];
          HEAP8[$0_1 + 74 | 0] = $3_1 - 1 | $3_1;
          $3_1 = HEAP32[$0_1 >> 2];
          __inlined_func$38 : {
           if ($3_1 & 8) {
            HEAP32[$4 >> 2] = $3_1 | 32;
            $4 = -1;
            break __inlined_func$38;
           }
           HEAP32[$4 + 4 >> 2] = 0;
           HEAP32[$4 + 8 >> 2] = 0;
           $3_1 = HEAP32[$4 + 44 >> 2];
           HEAP32[$4 + 28 >> 2] = $3_1;
           HEAP32[$4 + 20 >> 2] = $3_1;
           HEAP32[$4 + 16 >> 2] = $3_1 + HEAP32[$4 + 48 >> 2];
           $4 = 0;
          }
          if ($4) {
           break label$8
          }
          $4 = HEAP32[$0_1 + 16 >> 2];
         }
        }
        label$11 : {
         if (!global$5) {
          $6_1 = HEAP32[$0_1 + 20 >> 2];
          if ($4 - $6_1 >>> 0 >= $1 >>> 0) {
           break label$11
          }
          $11_1 = $2_1;
          $12 = $1;
          $13 = HEAP32[$0_1 + 36 >> 2];
          $10_1 = $0_1;
         }
         if (!(global$5 ? $20 : 0)) {
          $3_1 = FUNCTION_TABLE[$13 | 0]($10_1, $11_1, $12) | 0;
          if ((global$5 | 0) == 1) {
           $3_1 = 0;
           break label$20;
          }
          $19_1 = $3_1;
         }
         if (!global$5) {
          break __inlined_func$39
         }
        }
        label$19 : {
         if (!global$5) {
          if (HEAP8[$0_1 + 75 | 0] < 0) {
           break label$19
          }
          $5_1 = $1;
          while (1) {
           $4 = $5_1;
           if (!$4) {
            break label$19
           }
           $5_1 = $4 - 1 | 0;
           if (HEAPU8[$5_1 + $2_1 | 0] != 10) {
            continue
           }
           break;
          };
          $15 = $2_1;
          $16_1 = $4;
          $17_1 = HEAP32[$0_1 + 36 >> 2];
          $14_1 = $0_1;
         }
         if (global$5 ? ($20 | 0) == 1 : 1) {
          $3_1 = FUNCTION_TABLE[$17_1 | 0]($14_1, $15, $16_1) | 0;
          if ((global$5 | 0) == 1) {
           $3_1 = 1;
           break label$20;
          }
          $18_1 = $3_1;
         }
         if (!global$5) {
          $5_1 = $18_1;
          if ($5_1 >>> 0 < $4 >>> 0) {
           break label$8
          }
          $6_1 = HEAP32[$0_1 + 20 >> 2];
          $2_1 = $2_1 + $4 | 0;
          $1 = $1 - $4 | 0;
         }
        }
        if (!global$5) {
         $36($6_1, $2_1, $1);
         HEAP32[$0_1 + 20 >> 2] = HEAP32[$0_1 + 20 >> 2] + $1;
         $5_1 = 0;
        }
       }
       if (!global$5) {
        break __inlined_func$39
       }
       abort();
      }
      HEAP32[HEAP32[global$6 >> 2] >> 2] = $3_1;
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
      $3_1 = HEAP32[global$6 >> 2];
      HEAP32[$3_1 >> 2] = $2_1;
      HEAP32[$3_1 + 4 >> 2] = $1;
      HEAP32[$3_1 + 8 >> 2] = $0_1;
      HEAP32[$3_1 + 12 >> 2] = $4;
      HEAP32[$3_1 + 16 >> 2] = $5_1;
      HEAP32[$3_1 + 20 >> 2] = $6_1;
      HEAP32[$3_1 + 24 >> 2] = $10_1;
      HEAP32[$3_1 + 28 >> 2] = $11_1;
      HEAP32[$3_1 + 32 >> 2] = $12;
      HEAP32[$3_1 + 36 >> 2] = $13;
      HEAP32[$3_1 + 40 >> 2] = $19_1;
      HEAP32[$3_1 + 44 >> 2] = $14_1;
      HEAP32[$3_1 + 48 >> 2] = $15;
      HEAP32[$3_1 + 52 >> 2] = $16_1;
      HEAP32[$3_1 + 56 >> 2] = $17_1;
      HEAP32[$3_1 + 60 >> 2] = $18_1;
      HEAP32[$3_1 + 64 >> 2] = $22;
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 68;
     }
     if ((global$5 | 0) == 1) {
      break label$2
     }
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $7;
  HEAP32[$0_1 + 4 >> 2] = $8;
  HEAP32[$0_1 + 8 >> 2] = $9_1;
  HEAP32[$0_1 + 12 >> 2] = $21;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 16;
 }
 
 function $18($0_1) {
  var $1 = 0, $2_1 = 0, $3_1 = 0;
  if ($6(HEAP8[HEAP32[$0_1 >> 2]])) {
   while (1) {
    $1 = HEAP32[$0_1 >> 2];
    $3_1 = HEAP8[$1 | 0];
    HEAP32[$0_1 >> 2] = $1 + 1;
    $2_1 = (Math_imul($2_1, 10) + $3_1 | 0) - 48 | 0;
    if ($6(HEAP8[$1 + 1 | 0])) {
     continue
    }
    break;
   }
  }
  return $2_1;
 }
 
 function $19($0_1, $1, $2_1, $3_1) {
  var $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 12;
   $4 = HEAP32[global$6 >> 2];
   $5_1 = HEAP32[$4 >> 2];
   $6_1 = HEAP32[$4 + 4 >> 2];
   $4 = HEAP32[$4 + 8 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $7 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  label$2 : {
   label$6 : {
    if (!global$5) {
     if ($1 >>> 0 > 20) {
      break label$6
     }
     label$8 : {
      switch ($1 - 9 | 0) {
      case 0:
       $1 = HEAP32[$2_1 >> 2];
       HEAP32[$2_1 >> 2] = $1 + 4;
       HEAP32[$0_1 >> 2] = HEAP32[$1 >> 2];
       return;
      case 1:
       $1 = HEAP32[$2_1 >> 2];
       HEAP32[$2_1 >> 2] = $1 + 4;
       $1 = HEAP32[$1 >> 2];
       HEAP32[$0_1 >> 2] = $1;
       HEAP32[$0_1 + 4 >> 2] = $1 >> 31;
       return;
      case 2:
       $1 = HEAP32[$2_1 >> 2];
       HEAP32[$2_1 >> 2] = $1 + 4;
       HEAP32[$0_1 >> 2] = HEAP32[$1 >> 2];
       HEAP32[$0_1 + 4 >> 2] = 0;
       return;
      case 3:
       $1 = HEAP32[$2_1 >> 2] + 7 & -8;
       HEAP32[$2_1 >> 2] = $1 + 8;
       $2_1 = HEAP32[$1 + 4 >> 2];
       HEAP32[$0_1 >> 2] = HEAP32[$1 >> 2];
       HEAP32[$0_1 + 4 >> 2] = $2_1;
       return;
      case 4:
       $1 = HEAP32[$2_1 >> 2];
       HEAP32[$2_1 >> 2] = $1 + 4;
       $1 = HEAP16[$1 >> 1];
       HEAP32[$0_1 >> 2] = $1;
       HEAP32[$0_1 + 4 >> 2] = $1 >> 31;
       return;
      case 5:
       $1 = HEAP32[$2_1 >> 2];
       HEAP32[$2_1 >> 2] = $1 + 4;
       HEAP32[$0_1 >> 2] = HEAPU16[$1 >> 1];
       HEAP32[$0_1 + 4 >> 2] = 0;
       return;
      case 6:
       $1 = HEAP32[$2_1 >> 2];
       HEAP32[$2_1 >> 2] = $1 + 4;
       $1 = HEAP8[$1 | 0];
       HEAP32[$0_1 >> 2] = $1;
       HEAP32[$0_1 + 4 >> 2] = $1 >> 31;
       return;
      case 7:
       $1 = HEAP32[$2_1 >> 2];
       HEAP32[$2_1 >> 2] = $1 + 4;
       HEAP32[$0_1 >> 2] = HEAPU8[$1 | 0];
       HEAP32[$0_1 + 4 >> 2] = 0;
       return;
      case 8:
       $1 = HEAP32[$2_1 >> 2] + 7 & -8;
       HEAP32[$2_1 >> 2] = $1 + 8;
       HEAPF64[$0_1 >> 3] = HEAPF64[$1 >> 3];
       return;
      case 9:
       break label$8;
      default:
       break label$6;
      };
     }
     $6_1 = $2_1;
     $4 = $3_1;
     $5_1 = $0_1;
    }
    if (!(global$5 ? $7 : 0)) {
     FUNCTION_TABLE[$4 | 0]($5_1, $6_1);
     if ((global$5 | 0) == 1) {
      break label$2
     }
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $5_1;
  HEAP32[$0_1 + 4 >> 2] = $6_1;
  HEAP32[$0_1 + 8 >> 2] = $4;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 12;
 }
 
 function $23($0_1, $1, $2_1, $3_1, $4) {
  var $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 32;
   $5_1 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$5_1 >> 2];
   $2_1 = HEAP32[$5_1 + 4 >> 2];
   $6_1 = HEAP32[$5_1 + 8 >> 2];
   $7 = HEAP32[$5_1 + 12 >> 2];
   $8 = HEAP32[$5_1 + 16 >> 2];
   $9_1 = HEAP32[$5_1 + 20 >> 2];
   $10_1 = HEAP32[$5_1 + 24 >> 2];
   $5_1 = HEAP32[$5_1 + 28 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $11_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $6_1 = global$0 - 256 | 0;
   global$0 = $6_1;
  }
  label$2 : {
   label$8 : {
    if (!global$5) {
     if ($4 & 73728 | ($2_1 | 0) <= ($3_1 | 0)) {
      break label$8
     }
     $2_1 = $2_1 - $3_1 | 0;
     $3_1 = $2_1 >>> 0 < 256;
     $37($6_1, $1 & 255, $3_1 ? $2_1 : 256);
    }
    if ($3_1 ? global$5 : 1) {
     while (1) {
      if (!global$5) {
       $8 = $6_1;
       $7 = $0_1;
      }
      if (!(global$5 ? $11_1 : 0)) {
       $17($7, $8, 256);
       if ((global$5 | 0) == 1) {
        $1 = 0;
        break label$2;
       }
      }
      if (!global$5) {
       $2_1 = $2_1 - 256 | 0;
       if ($2_1 >>> 0 > 255) {
        continue
       }
      }
      break;
     }
    }
    if (!global$5) {
     $10_1 = $6_1;
     $5_1 = $2_1;
     $9_1 = $0_1;
    }
    if (global$5 ? ($11_1 | 0) == 1 : 1) {
     $17($9_1, $10_1, $5_1);
     if ((global$5 | 0) == 1) {
      $1 = 1;
      break label$2;
     }
    }
   }
   if (!global$5) {
    global$0 = $6_1 + 256 | 0
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = $1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $1 = HEAP32[global$6 >> 2];
  HEAP32[$1 >> 2] = $0_1;
  HEAP32[$1 + 4 >> 2] = $2_1;
  HEAP32[$1 + 8 >> 2] = $6_1;
  HEAP32[$1 + 12 >> 2] = $7;
  HEAP32[$1 + 16 >> 2] = $8;
  HEAP32[$1 + 20 >> 2] = $9_1;
  HEAP32[$1 + 24 >> 2] = $10_1;
  HEAP32[$1 + 28 >> 2] = $5_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 32;
 }
 
 function $25($0_1) {
  if (!$0_1) {
   return 0
  }
  HEAP32[500] = $0_1;
  return -1;
 }
 
 function $26($0_1, $1, $2_1) {
  $0_1 = $0_1 | 0;
  $1 = $1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  $4 = HEAP32[$0_1 + 28 >> 2];
  HEAP32[$3_1 + 16 >> 2] = $4;
  $5_1 = HEAP32[$0_1 + 20 >> 2];
  HEAP32[$3_1 + 28 >> 2] = $2_1;
  HEAP32[$3_1 + 24 >> 2] = $1;
  $1 = $5_1 - $4 | 0;
  HEAP32[$3_1 + 20 >> 2] = $1;
  $4 = $1 + $2_1 | 0;
  $9_1 = 2;
  $5_1 = $3_1 + 16 | 0;
  $1 = $5_1;
  label$2 : {
   label$3 : {
    label$4 : {
     if (!$25(fimport$2(HEAP32[$0_1 + 60 >> 2], $1 | 0, 2, $3_1 + 12 | 0) | 0)) {
      while (1) {
       $5_1 = HEAP32[$3_1 + 12 >> 2];
       if (($5_1 | 0) == ($4 | 0)) {
        break label$4
       }
       if (($5_1 | 0) <= -1) {
        break label$3
       }
       $6_1 = HEAP32[$1 + 4 >> 2];
       $7 = $6_1 >>> 0 < $5_1 >>> 0;
       $8 = ($7 << 3) + $1 | 0;
       $6_1 = $5_1 - ($7 ? $6_1 : 0) | 0;
       HEAP32[$8 >> 2] = $6_1 + HEAP32[$8 >> 2];
       $8 = ($7 ? 12 : 4) + $1 | 0;
       HEAP32[$8 >> 2] = HEAP32[$8 >> 2] - $6_1;
       $4 = $4 - $5_1 | 0;
       $1 = $7 ? $1 + 8 | 0 : $1;
       $9_1 = $9_1 - $7 | 0;
       if (!$25(fimport$2(HEAP32[$0_1 + 60 >> 2], $1 | 0, $9_1 | 0, $3_1 + 12 | 0) | 0)) {
        continue
       }
       break;
      }
     }
     if (($4 | 0) != -1) {
      break label$3
     }
    }
    $1 = HEAP32[$0_1 + 44 >> 2];
    HEAP32[$0_1 + 28 >> 2] = $1;
    HEAP32[$0_1 + 20 >> 2] = $1;
    HEAP32[$0_1 + 16 >> 2] = $1 + HEAP32[$0_1 + 48 >> 2];
    $0_1 = $2_1;
    break label$2;
   }
   HEAP32[$0_1 + 28 >> 2] = 0;
   HEAP32[$0_1 + 16 >> 2] = 0;
   HEAP32[$0_1 + 20 >> 2] = 0;
   HEAP32[$0_1 >> 2] = HEAP32[$0_1 >> 2] | 32;
   $0_1 = 0;
   if (($9_1 | 0) == 2) {
    break label$2
   }
   $0_1 = $2_1 - HEAP32[$1 + 4 >> 2] | 0;
  }
  $4 = $0_1;
  global$0 = $3_1 + 32 | 0;
  return $4 | 0;
 }
 
 function $27() {
  $28();
  abort();
 }
 
 function $28() {
  fimport$1();
  abort();
 }
 
 function $32($0_1) {
  $0_1 = $0_1 | 0;
  var $1 = 0, $2_1 = 0, $3_1 = 0, $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0;
  $11_1 = global$0 - 16 | 0;
  global$0 = $11_1;
  label$2 : {
   label$3 : {
    label$4 : {
     label$5 : {
      label$6 : {
       label$7 : {
        label$8 : {
         label$9 : {
          label$10 : {
           label$11 : {
            label$12 : {
             if ($0_1 >>> 0 <= 244) {
              $5_1 = HEAP32[518];
              $7 = $0_1 >>> 0 < 11 ? 16 : $0_1 + 11 & -8;
              $2_1 = $7 >>> 3 | 0;
              $1 = $5_1 >>> $2_1 | 0;
              if ($1 & 3) {
               $3_1 = $2_1 + (($1 ^ -1) & 1) | 0;
               $1 = $3_1 << 3;
               $4 = HEAP32[$1 + 2120 >> 2];
               $0_1 = $4 + 8 | 0;
               $2_1 = HEAP32[$4 + 8 >> 2];
               $1 = $1 + 2112 | 0;
               label$15 : {
                if (($2_1 | 0) == ($1 | 0)) {
                 HEAP32[518] = __wasm_rotl_i32($3_1) & $5_1;
                 break label$15;
                }
                HEAP32[$2_1 + 12 >> 2] = $1;
                HEAP32[$1 + 8 >> 2] = $2_1;
               }
               $1 = $3_1 << 3;
               HEAP32[$4 + 4 >> 2] = $1 | 3;
               $1 = $1 + $4 | 0;
               HEAP32[$1 + 4 >> 2] = HEAP32[$1 + 4 >> 2] | 1;
               break label$2;
              }
              $10_1 = HEAP32[520];
              if ($10_1 >>> 0 >= $7 >>> 0) {
               break label$12
              }
              if ($1) {
               $0_1 = 2 << $2_1;
               $0_1 = (0 - $0_1 | $0_1) & $1 << $2_1;
               $1 = (0 - $0_1 & $0_1) - 1 | 0;
               $0_1 = $1 >>> 12 & 16;
               $2_1 = $0_1;
               $1 = $1 >>> $0_1 | 0;
               $0_1 = $1 >>> 5 & 8;
               $2_1 = $2_1 | $0_1;
               $1 = $1 >>> $0_1 | 0;
               $0_1 = $1 >>> 2 & 4;
               $2_1 = $2_1 | $0_1;
               $1 = $1 >>> $0_1 | 0;
               $0_1 = $1 >>> 1 & 2;
               $2_1 = $2_1 | $0_1;
               $1 = $1 >>> $0_1 | 0;
               $0_1 = $1 >>> 1 & 1;
               $3_1 = ($2_1 | $0_1) + ($1 >>> $0_1 | 0) | 0;
               $0_1 = $3_1 << 3;
               $4 = HEAP32[$0_1 + 2120 >> 2];
               $1 = HEAP32[$4 + 8 >> 2];
               $0_1 = $0_1 + 2112 | 0;
               label$18 : {
                if (($1 | 0) == ($0_1 | 0)) {
                 $5_1 = __wasm_rotl_i32($3_1) & $5_1;
                 HEAP32[518] = $5_1;
                 break label$18;
                }
                HEAP32[$1 + 12 >> 2] = $0_1;
                HEAP32[$0_1 + 8 >> 2] = $1;
               }
               $0_1 = $4 + 8 | 0;
               HEAP32[$4 + 4 >> 2] = $7 | 3;
               $2_1 = $4 + $7 | 0;
               $1 = $3_1 << 3;
               $3_1 = $1 - $7 | 0;
               HEAP32[$2_1 + 4 >> 2] = $3_1 | 1;
               HEAP32[$1 + $4 >> 2] = $3_1;
               if ($10_1) {
                $1 = $10_1 >>> 3 | 0;
                $6_1 = ($1 << 3) + 2112 | 0;
                $4 = HEAP32[523];
                $1 = 1 << $1;
                label$21 : {
                 if (!($1 & $5_1)) {
                  HEAP32[518] = $1 | $5_1;
                  $1 = $6_1;
                  break label$21;
                 }
                 $1 = HEAP32[$6_1 + 8 >> 2];
                }
                HEAP32[$6_1 + 8 >> 2] = $4;
                HEAP32[$1 + 12 >> 2] = $4;
                HEAP32[$4 + 12 >> 2] = $6_1;
                HEAP32[$4 + 8 >> 2] = $1;
               }
               HEAP32[523] = $2_1;
               HEAP32[520] = $3_1;
               break label$2;
              }
              $9_1 = HEAP32[519];
              if (!$9_1) {
               break label$12
              }
              $1 = ($9_1 & 0 - $9_1) - 1 | 0;
              $0_1 = $1 >>> 12 & 16;
              $2_1 = $0_1;
              $1 = $1 >>> $0_1 | 0;
              $0_1 = $1 >>> 5 & 8;
              $2_1 = $2_1 | $0_1;
              $1 = $1 >>> $0_1 | 0;
              $0_1 = $1 >>> 2 & 4;
              $2_1 = $2_1 | $0_1;
              $1 = $1 >>> $0_1 | 0;
              $0_1 = $1 >>> 1 & 2;
              $2_1 = $2_1 | $0_1;
              $1 = $1 >>> $0_1 | 0;
              $0_1 = $1 >>> 1 & 1;
              $1 = HEAP32[(($2_1 | $0_1) + ($1 >>> $0_1 | 0) << 2) + 2376 >> 2];
              $3_1 = (HEAP32[$1 + 4 >> 2] & -8) - $7 | 0;
              $2_1 = $1;
              while (1) {
               label$23 : {
                $0_1 = HEAP32[$2_1 + 16 >> 2];
                if (!$0_1) {
                 $0_1 = HEAP32[$2_1 + 20 >> 2];
                 if (!$0_1) {
                  break label$23
                 }
                }
                $2_1 = (HEAP32[$0_1 + 4 >> 2] & -8) - $7 | 0;
                $4 = $2_1 >>> 0 < $3_1 >>> 0;
                $3_1 = $4 ? $2_1 : $3_1;
                $1 = $4 ? $0_1 : $1;
                $2_1 = $0_1;
                continue;
               }
               break;
              };
              $8 = HEAP32[$1 + 24 >> 2];
              $4 = HEAP32[$1 + 12 >> 2];
              if (($1 | 0) != ($4 | 0)) {
               $0_1 = HEAP32[$1 + 8 >> 2];
               HEAP32[$0_1 + 12 >> 2] = $4;
               HEAP32[$4 + 8 >> 2] = $0_1;
               break label$3;
              }
              $2_1 = $1 + 20 | 0;
              $0_1 = HEAP32[$2_1 >> 2];
              if (!$0_1) {
               $0_1 = HEAP32[$1 + 16 >> 2];
               if (!$0_1) {
                break label$11
               }
               $2_1 = $1 + 16 | 0;
              }
              while (1) {
               $6_1 = $2_1;
               $4 = $0_1;
               $2_1 = $0_1 + 20 | 0;
               $0_1 = HEAP32[$2_1 >> 2];
               if ($0_1) {
                continue
               }
               $2_1 = $4 + 16 | 0;
               $0_1 = HEAP32[$4 + 16 >> 2];
               if ($0_1) {
                continue
               }
               break;
              };
              HEAP32[$6_1 >> 2] = 0;
              break label$3;
             }
             $7 = -1;
             if ($0_1 >>> 0 > 4294967231) {
              break label$12
             }
             $0_1 = $0_1 + 11 | 0;
             $7 = $0_1 & -8;
             $9_1 = HEAP32[519];
             if (!$9_1) {
              break label$12
             }
             $3_1 = 0 - $7 | 0;
             $5_1 = 0;
             label$30 : {
              if ($7 >>> 0 < 256) {
               break label$30
              }
              $5_1 = 31;
              if ($7 >>> 0 > 16777215) {
               break label$30
              }
              $0_1 = $0_1 >>> 8 | 0;
              $4 = $0_1 + 1048320 >>> 16 & 8;
              $0_1 = $0_1 << $4;
              $2_1 = $0_1 + 520192 >>> 16 & 4;
              $0_1 = $0_1 << $2_1;
              $1 = $0_1 + 245760 >>> 16 & 2;
              $0_1 = ($0_1 << $1 >>> 15 | 0) - ($1 | ($2_1 | $4)) | 0;
              $5_1 = ($0_1 << 1 | $7 >>> $0_1 + 21 & 1) + 28 | 0;
             }
             $2_1 = HEAP32[($5_1 << 2) + 2376 >> 2];
             label$31 : {
              label$32 : {
               label$33 : {
                if (!$2_1) {
                 $0_1 = 0;
                 $4 = 0;
                 break label$33;
                }
                $0_1 = 0;
                $1 = $7 << (($5_1 | 0) == 31 ? 0 : 25 - ($5_1 >>> 1 | 0) | 0);
                $4 = 0;
                while (1) {
                 label$36 : {
                  $6_1 = (HEAP32[$2_1 + 4 >> 2] & -8) - $7 | 0;
                  if ($6_1 >>> 0 >= $3_1 >>> 0) {
                   break label$36
                  }
                  $4 = $2_1;
                  $3_1 = $6_1;
                  if ($3_1) {
                   break label$36
                  }
                  $3_1 = 0;
                  $0_1 = $2_1;
                  break label$32;
                 }
                 $6_1 = HEAP32[$2_1 + 20 >> 2];
                 $2_1 = HEAP32[(($1 >>> 29 & 4) + $2_1 | 0) + 16 >> 2];
                 $0_1 = $6_1 ? (($6_1 | 0) == ($2_1 | 0) ? $0_1 : $6_1) : $0_1;
                 $1 = $1 << 1;
                 if ($2_1) {
                  continue
                 }
                 break;
                };
               }
               if (!($0_1 | $4)) {
                $4 = 0;
                $0_1 = 2 << $5_1;
                $0_1 = (0 - $0_1 | $0_1) & $9_1;
                if (!$0_1) {
                 break label$12
                }
                $1 = ($0_1 & 0 - $0_1) - 1 | 0;
                $0_1 = $1 >>> 12 & 16;
                $2_1 = $0_1;
                $1 = $1 >>> $0_1 | 0;
                $0_1 = $1 >>> 5 & 8;
                $2_1 = $2_1 | $0_1;
                $1 = $1 >>> $0_1 | 0;
                $0_1 = $1 >>> 2 & 4;
                $2_1 = $2_1 | $0_1;
                $1 = $1 >>> $0_1 | 0;
                $0_1 = $1 >>> 1 & 2;
                $2_1 = $2_1 | $0_1;
                $1 = $1 >>> $0_1 | 0;
                $0_1 = $1 >>> 1 & 1;
                $0_1 = HEAP32[(($2_1 | $0_1) + ($1 >>> $0_1 | 0) << 2) + 2376 >> 2];
               }
               if (!$0_1) {
                break label$31
               }
              }
              while (1) {
               $1 = (HEAP32[$0_1 + 4 >> 2] & -8) - $7 | 0;
               $2_1 = $1 >>> 0 < $3_1 >>> 0;
               $3_1 = $2_1 ? $1 : $3_1;
               $4 = $2_1 ? $0_1 : $4;
               $1 = HEAP32[$0_1 + 16 >> 2];
               if ($1) {
                $0_1 = $1
               } else {
                $0_1 = HEAP32[$0_1 + 20 >> 2]
               }
               if ($0_1) {
                continue
               }
               break;
              };
             }
             if (!$4 | HEAP32[520] - $7 >>> 0 <= $3_1 >>> 0) {
              break label$12
             }
             $5_1 = HEAP32[$4 + 24 >> 2];
             $1 = HEAP32[$4 + 12 >> 2];
             if (($1 | 0) != ($4 | 0)) {
              $0_1 = HEAP32[$4 + 8 >> 2];
              HEAP32[$0_1 + 12 >> 2] = $1;
              HEAP32[$1 + 8 >> 2] = $0_1;
              break label$4;
             }
             $2_1 = $4 + 20 | 0;
             $0_1 = HEAP32[$2_1 >> 2];
             if (!$0_1) {
              $0_1 = HEAP32[$4 + 16 >> 2];
              if (!$0_1) {
               break label$10
              }
              $2_1 = $4 + 16 | 0;
             }
             while (1) {
              $6_1 = $2_1;
              $1 = $0_1;
              $2_1 = $0_1 + 20 | 0;
              $0_1 = HEAP32[$2_1 >> 2];
              if ($0_1) {
               continue
              }
              $2_1 = $1 + 16 | 0;
              $0_1 = HEAP32[$1 + 16 >> 2];
              if ($0_1) {
               continue
              }
              break;
             };
             HEAP32[$6_1 >> 2] = 0;
             break label$4;
            }
            $2_1 = HEAP32[520];
            if ($7 >>> 0 <= $2_1 >>> 0) {
             $3_1 = HEAP32[523];
             $1 = $2_1 - $7 | 0;
             label$44 : {
              if ($1 >>> 0 >= 16) {
               HEAP32[520] = $1;
               $0_1 = $3_1 + $7 | 0;
               HEAP32[523] = $0_1;
               HEAP32[$0_1 + 4 >> 2] = $1 | 1;
               HEAP32[$2_1 + $3_1 >> 2] = $1;
               HEAP32[$3_1 + 4 >> 2] = $7 | 3;
               break label$44;
              }
              HEAP32[523] = 0;
              HEAP32[520] = 0;
              HEAP32[$3_1 + 4 >> 2] = $2_1 | 3;
              $0_1 = $2_1 + $3_1 | 0;
              HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] | 1;
             }
             $0_1 = $3_1 + 8 | 0;
             break label$2;
            }
            $5_1 = HEAP32[521];
            if ($7 >>> 0 < $5_1 >>> 0) {
             $1 = $5_1 - $7 | 0;
             HEAP32[521] = $1;
             $2_1 = HEAP32[524];
             $0_1 = $2_1 + $7 | 0;
             HEAP32[524] = $0_1;
             HEAP32[$0_1 + 4 >> 2] = $1 | 1;
             HEAP32[$2_1 + 4 >> 2] = $7 | 3;
             $0_1 = $2_1 + 8 | 0;
             break label$2;
            }
            $0_1 = 0;
            if (HEAP32[636]) {
             $1 = HEAP32[638]
            } else {
             HEAP32[639] = -1;
             HEAP32[640] = -1;
             HEAP32[637] = 4096;
             HEAP32[638] = 4096;
             HEAP32[636] = $11_1 + 12 & -16 ^ 1431655768;
             HEAP32[641] = 0;
             HEAP32[629] = 0;
             $1 = 4096;
            }
            $9_1 = $7 + 47 | 0;
            $6_1 = $1 + $9_1 | 0;
            $4 = 0 - $1 | 0;
            $2_1 = $6_1 & $4;
            if ($2_1 >>> 0 <= $7 >>> 0) {
             break label$2
            }
            $1 = HEAP32[628];
            if ($1) {
             $8 = $1;
             $3_1 = HEAP32[626];
             $1 = $3_1 + $2_1 | 0;
             if ($8 >>> 0 < $1 >>> 0 | $1 >>> 0 <= $3_1 >>> 0) {
              break label$2
             }
            }
            if (HEAPU8[2516] & 4) {
             break label$7
            }
            label$50 : {
             label$51 : {
              $3_1 = HEAP32[524];
              if ($3_1) {
               $0_1 = 2520;
               while (1) {
                $1 = HEAP32[$0_1 >> 2];
                if ($3_1 >>> 0 < $1 + HEAP32[$0_1 + 4 >> 2] >>> 0 ? $3_1 >>> 0 >= $1 >>> 0 : 0) {
                 break label$51
                }
                $0_1 = HEAP32[$0_1 + 8 >> 2];
                if ($0_1) {
                 continue
                }
                break;
               };
              }
              $1 = $35(0);
              if (($1 | 0) == -1) {
               break label$8
              }
              $5_1 = $2_1;
              $3_1 = HEAP32[637];
              $0_1 = $3_1 - 1 | 0;
              if ($0_1 & $1) {
               $5_1 = ($2_1 - $1 | 0) + ($0_1 + $1 & 0 - $3_1) | 0
              }
              if ($5_1 >>> 0 <= $7 >>> 0 | $5_1 >>> 0 > 2147483646) {
               break label$8
              }
              $0_1 = HEAP32[628];
              if ($0_1) {
               $6_1 = $0_1;
               $3_1 = HEAP32[626];
               $0_1 = $3_1 + $5_1 | 0;
               if ($6_1 >>> 0 < $0_1 >>> 0 | $0_1 >>> 0 <= $3_1 >>> 0) {
                break label$8
               }
              }
              $0_1 = $35($5_1);
              if (($1 | 0) != ($0_1 | 0)) {
               break label$50
              }
              break label$6;
             }
             $5_1 = $4 & $6_1 - $5_1;
             if ($5_1 >>> 0 > 2147483646) {
              break label$8
             }
             $1 = $35($5_1);
             if (($1 | 0) == (HEAP32[$0_1 >> 2] + HEAP32[$0_1 + 4 >> 2] | 0)) {
              break label$9
             }
             $0_1 = $1;
            }
            if (!(($0_1 | 0) == -1 | $7 + 48 >>> 0 <= $5_1 >>> 0)) {
             $1 = HEAP32[638];
             $1 = $1 + ($9_1 - $5_1 | 0) & 0 - $1;
             if ($1 >>> 0 > 2147483646) {
              $1 = $0_1;
              break label$6;
             }
             if (($35($1) | 0) != -1) {
              $5_1 = $1 + $5_1 | 0;
              $1 = $0_1;
              break label$6;
             }
             $35(0 - $5_1 | 0);
             break label$8;
            }
            $1 = $0_1;
            if (($0_1 | 0) != -1) {
             break label$6
            }
            break label$8;
           }
           $4 = 0;
           break label$3;
          }
          $1 = 0;
          break label$4;
         }
         if (($1 | 0) != -1) {
          break label$6
         }
        }
        HEAP32[629] = HEAP32[629] | 4;
       }
       if ($2_1 >>> 0 > 2147483646) {
        break label$5
       }
       $1 = $35($2_1);
       $0_1 = $35(0);
       if (($1 | 0) == -1 | ($0_1 | 0) == -1 | $0_1 >>> 0 <= $1 >>> 0) {
        break label$5
       }
       $5_1 = $0_1 - $1 | 0;
       if ($5_1 >>> 0 <= $7 + 40 >>> 0) {
        break label$5
       }
      }
      $0_1 = HEAP32[626] + $5_1 | 0;
      HEAP32[626] = $0_1;
      if (HEAPU32[627] < $0_1 >>> 0) {
       HEAP32[627] = $0_1
      }
      label$61 : {
       label$62 : {
        label$63 : {
         $6_1 = HEAP32[524];
         if ($6_1) {
          $0_1 = 2520;
          while (1) {
           $3_1 = HEAP32[$0_1 >> 2];
           $2_1 = HEAP32[$0_1 + 4 >> 2];
           if (($3_1 + $2_1 | 0) == ($1 | 0)) {
            break label$63
           }
           $0_1 = HEAP32[$0_1 + 8 >> 2];
           if ($0_1) {
            continue
           }
           break;
          };
          break label$62;
         }
         $0_1 = HEAP32[522];
         if (!($0_1 >>> 0 <= $1 >>> 0 ? $0_1 : 0)) {
          HEAP32[522] = $1
         }
         $0_1 = 0;
         HEAP32[631] = $5_1;
         HEAP32[630] = $1;
         HEAP32[526] = -1;
         HEAP32[527] = HEAP32[636];
         HEAP32[633] = 0;
         while (1) {
          $3_1 = $0_1 << 3;
          $2_1 = $3_1 + 2112 | 0;
          HEAP32[$3_1 + 2120 >> 2] = $2_1;
          HEAP32[$3_1 + 2124 >> 2] = $2_1;
          $0_1 = $0_1 + 1 | 0;
          if (($0_1 | 0) != 32) {
           continue
          }
          break;
         };
         $3_1 = $5_1 - 40 | 0;
         $0_1 = $1 + 8 & 7 ? -8 - $1 & 7 : 0;
         $2_1 = $3_1 - $0_1 | 0;
         HEAP32[521] = $2_1;
         $0_1 = $0_1 + $1 | 0;
         HEAP32[524] = $0_1;
         HEAP32[$0_1 + 4 >> 2] = $2_1 | 1;
         HEAP32[($1 + $3_1 | 0) + 4 >> 2] = 40;
         HEAP32[525] = HEAP32[640];
         break label$61;
        }
        if (HEAPU8[$0_1 + 12 | 0] & 8 | $3_1 >>> 0 > $6_1 >>> 0 | $1 >>> 0 <= $6_1 >>> 0) {
         break label$62
        }
        HEAP32[$0_1 + 4 >> 2] = $2_1 + $5_1;
        $0_1 = $6_1 + 8 & 7 ? -8 - $6_1 & 7 : 0;
        $2_1 = $0_1 + $6_1 | 0;
        HEAP32[524] = $2_1;
        $1 = HEAP32[521] + $5_1 | 0;
        $0_1 = $1 - $0_1 | 0;
        HEAP32[521] = $0_1;
        HEAP32[$2_1 + 4 >> 2] = $0_1 | 1;
        HEAP32[($1 + $6_1 | 0) + 4 >> 2] = 40;
        HEAP32[525] = HEAP32[640];
        break label$61;
       }
       if ($1 >>> 0 < HEAPU32[522]) {
        HEAP32[522] = $1
       }
       $2_1 = $1 + $5_1 | 0;
       $0_1 = 2520;
       label$71 : {
        label$72 : {
         label$73 : {
          label$74 : {
           label$75 : {
            label$76 : {
             while (1) {
              if (HEAP32[$0_1 >> 2] != ($2_1 | 0)) {
               $0_1 = HEAP32[$0_1 + 8 >> 2];
               if ($0_1) {
                continue
               }
               break label$76;
              }
              break;
             };
             if (!(HEAPU8[$0_1 + 12 | 0] & 8)) {
              break label$75
             }
            }
            $0_1 = 2520;
            while (1) {
             $2_1 = HEAP32[$0_1 >> 2];
             if ($6_1 >>> 0 >= $2_1 >>> 0) {
              $4 = $2_1 + HEAP32[$0_1 + 4 >> 2] | 0;
              if ($4 >>> 0 > $6_1 >>> 0) {
               break label$74
              }
             }
             $0_1 = HEAP32[$0_1 + 8 >> 2];
             continue;
            };
           }
           HEAP32[$0_1 >> 2] = $1;
           HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] + $5_1;
           $9_1 = ($1 + 8 & 7 ? -8 - $1 & 7 : 0) + $1 | 0;
           HEAP32[$9_1 + 4 >> 2] = $7 | 3;
           $5_1 = $2_1 + ($2_1 + 8 & 7 ? -8 - $2_1 & 7 : 0) | 0;
           $8 = $7 + $9_1 | 0;
           $2_1 = $5_1 - $8 | 0;
           if (($5_1 | 0) == ($6_1 | 0)) {
            HEAP32[524] = $8;
            $0_1 = HEAP32[521] + $2_1 | 0;
            HEAP32[521] = $0_1;
            HEAP32[$8 + 4 >> 2] = $0_1 | 1;
            break label$72;
           }
           if (($5_1 | 0) == HEAP32[523]) {
            HEAP32[523] = $8;
            $0_1 = HEAP32[520] + $2_1 | 0;
            HEAP32[520] = $0_1;
            HEAP32[$8 + 4 >> 2] = $0_1 | 1;
            HEAP32[$0_1 + $8 >> 2] = $0_1;
            break label$72;
           }
           $0_1 = HEAP32[$5_1 + 4 >> 2];
           if (($0_1 & 3) == 1) {
            $6_1 = $0_1 & -8;
            label$86 : {
             if ($0_1 >>> 0 <= 255) {
              $3_1 = HEAP32[$5_1 + 8 >> 2];
              $0_1 = $0_1 >>> 3 | 0;
              $1 = HEAP32[$5_1 + 12 >> 2];
              if (($3_1 | 0) == ($1 | 0)) {
               HEAP32[518] = HEAP32[518] & __wasm_rotl_i32($0_1);
               break label$86;
              }
              HEAP32[$3_1 + 12 >> 2] = $1;
              HEAP32[$1 + 8 >> 2] = $3_1;
              break label$86;
             }
             $7 = HEAP32[$5_1 + 24 >> 2];
             $1 = HEAP32[$5_1 + 12 >> 2];
             label$89 : {
              if (($5_1 | 0) != ($1 | 0)) {
               $0_1 = HEAP32[$5_1 + 8 >> 2];
               HEAP32[$0_1 + 12 >> 2] = $1;
               HEAP32[$1 + 8 >> 2] = $0_1;
               break label$89;
              }
              label$91 : {
               $0_1 = $5_1 + 20 | 0;
               $3_1 = HEAP32[$0_1 >> 2];
               if ($3_1) {
                break label$91
               }
               $0_1 = $5_1 + 16 | 0;
               $3_1 = HEAP32[$0_1 >> 2];
               if ($3_1) {
                break label$91
               }
               $1 = 0;
               break label$89;
              }
              while (1) {
               $4 = $0_1;
               $1 = $3_1;
               $0_1 = $1 + 20 | 0;
               $3_1 = HEAP32[$0_1 >> 2];
               if ($3_1) {
                continue
               }
               $0_1 = $1 + 16 | 0;
               $3_1 = HEAP32[$1 + 16 >> 2];
               if ($3_1) {
                continue
               }
               break;
              };
              HEAP32[$4 >> 2] = 0;
             }
             if (!$7) {
              break label$86
             }
             $3_1 = HEAP32[$5_1 + 28 >> 2];
             $0_1 = ($3_1 << 2) + 2376 | 0;
             label$93 : {
              if (($5_1 | 0) == HEAP32[$0_1 >> 2]) {
               HEAP32[$0_1 >> 2] = $1;
               if ($1) {
                break label$93
               }
               HEAP32[519] = HEAP32[519] & __wasm_rotl_i32($3_1);
               break label$86;
              }
              HEAP32[$7 + (HEAP32[$7 + 16 >> 2] == ($5_1 | 0) ? 16 : 20) >> 2] = $1;
              if (!$1) {
               break label$86
              }
             }
             HEAP32[$1 + 24 >> 2] = $7;
             $0_1 = HEAP32[$5_1 + 16 >> 2];
             if ($0_1) {
              HEAP32[$1 + 16 >> 2] = $0_1;
              HEAP32[$0_1 + 24 >> 2] = $1;
             }
             $0_1 = HEAP32[$5_1 + 20 >> 2];
             if (!$0_1) {
              break label$86
             }
             HEAP32[$1 + 20 >> 2] = $0_1;
             HEAP32[$0_1 + 24 >> 2] = $1;
            }
            $5_1 = $5_1 + $6_1 | 0;
            $2_1 = $2_1 + $6_1 | 0;
           }
           HEAP32[$5_1 + 4 >> 2] = HEAP32[$5_1 + 4 >> 2] & -2;
           HEAP32[$8 + 4 >> 2] = $2_1 | 1;
           HEAP32[$2_1 + $8 >> 2] = $2_1;
           if ($2_1 >>> 0 <= 255) {
            $0_1 = $2_1 >>> 3 | 0;
            $2_1 = ($0_1 << 3) + 2112 | 0;
            $1 = HEAP32[518];
            $0_1 = 1 << $0_1;
            label$97 : {
             if (!($1 & $0_1)) {
              HEAP32[518] = $0_1 | $1;
              $0_1 = $2_1;
              break label$97;
             }
             $0_1 = HEAP32[$2_1 + 8 >> 2];
            }
            HEAP32[$2_1 + 8 >> 2] = $8;
            HEAP32[$0_1 + 12 >> 2] = $8;
            HEAP32[$8 + 12 >> 2] = $2_1;
            HEAP32[$8 + 8 >> 2] = $0_1;
            break label$72;
           }
           $0_1 = 31;
           if ($2_1 >>> 0 <= 16777215) {
            $0_1 = $2_1 >>> 8 | 0;
            $4 = $0_1 + 1048320 >>> 16 & 8;
            $0_1 = $0_1 << $4;
            $3_1 = $0_1 + 520192 >>> 16 & 4;
            $0_1 = $0_1 << $3_1;
            $1 = $0_1 + 245760 >>> 16 & 2;
            $0_1 = ($0_1 << $1 >>> 15 | 0) - ($1 | ($3_1 | $4)) | 0;
            $0_1 = ($0_1 << 1 | $2_1 >>> $0_1 + 21 & 1) + 28 | 0;
           }
           HEAP32[$8 + 28 >> 2] = $0_1;
           HEAP32[$8 + 16 >> 2] = 0;
           HEAP32[$8 + 20 >> 2] = 0;
           $4 = ($0_1 << 2) + 2376 | 0;
           $3_1 = HEAP32[519];
           $1 = 1 << $0_1;
           label$100 : {
            if (!($3_1 & $1)) {
             HEAP32[519] = $1 | $3_1;
             HEAP32[$4 >> 2] = $8;
             HEAP32[$8 + 24 >> 2] = $4;
             break label$100;
            }
            $0_1 = $2_1 << (($0_1 | 0) == 31 ? 0 : 25 - ($0_1 >>> 1 | 0) | 0);
            $1 = HEAP32[$4 >> 2];
            while (1) {
             $3_1 = $1;
             if ((HEAP32[$1 + 4 >> 2] & -8) == ($2_1 | 0)) {
              break label$73
             }
             $1 = $0_1 >>> 29 | 0;
             $0_1 = $0_1 << 1;
             $4 = ($3_1 + ($1 & 4) | 0) + 16 | 0;
             $1 = HEAP32[$4 >> 2];
             if ($1) {
              continue
             }
             break;
            };
            HEAP32[$4 >> 2] = $8;
            HEAP32[$8 + 24 >> 2] = $3_1;
           }
           HEAP32[$8 + 12 >> 2] = $8;
           HEAP32[$8 + 8 >> 2] = $8;
           break label$72;
          }
          $3_1 = $5_1 - 40 | 0;
          $0_1 = $1 + 8 & 7 ? -8 - $1 & 7 : 0;
          $2_1 = $3_1 - $0_1 | 0;
          HEAP32[521] = $2_1;
          $0_1 = $0_1 + $1 | 0;
          HEAP32[524] = $0_1;
          HEAP32[$0_1 + 4 >> 2] = $2_1 | 1;
          HEAP32[($1 + $3_1 | 0) + 4 >> 2] = 40;
          HEAP32[525] = HEAP32[640];
          $0_1 = ($4 + ($4 - 39 & 7 ? 39 - $4 & 7 : 0) | 0) - 47 | 0;
          $3_1 = $0_1 >>> 0 < $6_1 + 16 >>> 0 ? $6_1 : $0_1;
          HEAP32[$3_1 + 4 >> 2] = 27;
          $2_1 = HEAP32[633];
          $0_1 = $3_1 + 16 | 0;
          HEAP32[$0_1 >> 2] = HEAP32[632];
          HEAP32[$0_1 + 4 >> 2] = $2_1;
          $0_1 = HEAP32[631];
          HEAP32[$3_1 + 8 >> 2] = HEAP32[630];
          HEAP32[$3_1 + 12 >> 2] = $0_1;
          HEAP32[632] = $3_1 + 8;
          HEAP32[631] = $5_1;
          HEAP32[630] = $1;
          HEAP32[633] = 0;
          $0_1 = $3_1 + 24 | 0;
          while (1) {
           HEAP32[$0_1 + 4 >> 2] = 7;
           $1 = $0_1 + 8 | 0;
           $0_1 = $0_1 + 4 | 0;
           if ($1 >>> 0 < $4 >>> 0) {
            continue
           }
           break;
          };
          if (($3_1 | 0) == ($6_1 | 0)) {
           break label$61
          }
          HEAP32[$3_1 + 4 >> 2] = HEAP32[$3_1 + 4 >> 2] & -2;
          $4 = $3_1 - $6_1 | 0;
          HEAP32[$6_1 + 4 >> 2] = $4 | 1;
          HEAP32[$3_1 >> 2] = $4;
          if ($4 >>> 0 <= 255) {
           $0_1 = $4 >>> 3 | 0;
           $2_1 = ($0_1 << 3) + 2112 | 0;
           $1 = HEAP32[518];
           $0_1 = 1 << $0_1;
           label$105 : {
            if (!($1 & $0_1)) {
             HEAP32[518] = $0_1 | $1;
             $0_1 = $2_1;
             break label$105;
            }
            $0_1 = HEAP32[$2_1 + 8 >> 2];
           }
           HEAP32[$2_1 + 8 >> 2] = $6_1;
           HEAP32[$0_1 + 12 >> 2] = $6_1;
           HEAP32[$6_1 + 12 >> 2] = $2_1;
           HEAP32[$6_1 + 8 >> 2] = $0_1;
           break label$61;
          }
          $0_1 = 31;
          HEAP32[$6_1 + 16 >> 2] = 0;
          HEAP32[$6_1 + 20 >> 2] = 0;
          if ($4 >>> 0 <= 16777215) {
           $0_1 = $4 >>> 8 | 0;
           $3_1 = $0_1 + 1048320 >>> 16 & 8;
           $0_1 = $0_1 << $3_1;
           $2_1 = $0_1 + 520192 >>> 16 & 4;
           $0_1 = $0_1 << $2_1;
           $1 = $0_1 + 245760 >>> 16 & 2;
           $0_1 = ($0_1 << $1 >>> 15 | 0) - ($1 | ($2_1 | $3_1)) | 0;
           $0_1 = ($0_1 << 1 | $4 >>> $0_1 + 21 & 1) + 28 | 0;
          }
          HEAP32[$6_1 + 28 >> 2] = $0_1;
          $3_1 = ($0_1 << 2) + 2376 | 0;
          $2_1 = HEAP32[519];
          $1 = 1 << $0_1;
          label$108 : {
           if (!($2_1 & $1)) {
            HEAP32[519] = $1 | $2_1;
            HEAP32[$3_1 >> 2] = $6_1;
            HEAP32[$6_1 + 24 >> 2] = $3_1;
            break label$108;
           }
           $0_1 = $4 << (($0_1 | 0) == 31 ? 0 : 25 - ($0_1 >>> 1 | 0) | 0);
           $1 = HEAP32[$3_1 >> 2];
           while (1) {
            $2_1 = $1;
            if (($4 | 0) == (HEAP32[$1 + 4 >> 2] & -8)) {
             break label$71
            }
            $1 = $0_1 >>> 29 | 0;
            $0_1 = $0_1 << 1;
            $3_1 = ($2_1 + ($1 & 4) | 0) + 16 | 0;
            $1 = HEAP32[$3_1 >> 2];
            if ($1) {
             continue
            }
            break;
           };
           HEAP32[$3_1 >> 2] = $6_1;
           HEAP32[$6_1 + 24 >> 2] = $2_1;
          }
          HEAP32[$6_1 + 12 >> 2] = $6_1;
          HEAP32[$6_1 + 8 >> 2] = $6_1;
          break label$61;
         }
         $0_1 = HEAP32[$3_1 + 8 >> 2];
         HEAP32[$0_1 + 12 >> 2] = $8;
         HEAP32[$3_1 + 8 >> 2] = $8;
         HEAP32[$8 + 24 >> 2] = 0;
         HEAP32[$8 + 12 >> 2] = $3_1;
         HEAP32[$8 + 8 >> 2] = $0_1;
        }
        $0_1 = $9_1 + 8 | 0;
        break label$2;
       }
       $0_1 = HEAP32[$2_1 + 8 >> 2];
       HEAP32[$0_1 + 12 >> 2] = $6_1;
       HEAP32[$2_1 + 8 >> 2] = $6_1;
       HEAP32[$6_1 + 24 >> 2] = 0;
       HEAP32[$6_1 + 12 >> 2] = $2_1;
       HEAP32[$6_1 + 8 >> 2] = $0_1;
      }
      $0_1 = HEAP32[521];
      if ($0_1 >>> 0 <= $7 >>> 0) {
       break label$5
      }
      $1 = $0_1 - $7 | 0;
      HEAP32[521] = $1;
      $2_1 = HEAP32[524];
      $0_1 = $2_1 + $7 | 0;
      HEAP32[524] = $0_1;
      HEAP32[$0_1 + 4 >> 2] = $1 | 1;
      HEAP32[$2_1 + 4 >> 2] = $7 | 3;
      $0_1 = $2_1 + 8 | 0;
      break label$2;
     }
     HEAP32[500] = 48;
     $0_1 = 0;
     break label$2;
    }
    label$111 : {
     if (!$5_1) {
      break label$111
     }
     $2_1 = HEAP32[$4 + 28 >> 2];
     $0_1 = ($2_1 << 2) + 2376 | 0;
     label$112 : {
      if (($4 | 0) == HEAP32[$0_1 >> 2]) {
       HEAP32[$0_1 >> 2] = $1;
       if ($1) {
        break label$112
       }
       $9_1 = __wasm_rotl_i32($2_1) & $9_1;
       HEAP32[519] = $9_1;
       break label$111;
      }
      HEAP32[$5_1 + (HEAP32[$5_1 + 16 >> 2] == ($4 | 0) ? 16 : 20) >> 2] = $1;
      if (!$1) {
       break label$111
      }
     }
     HEAP32[$1 + 24 >> 2] = $5_1;
     $0_1 = HEAP32[$4 + 16 >> 2];
     if ($0_1) {
      HEAP32[$1 + 16 >> 2] = $0_1;
      HEAP32[$0_1 + 24 >> 2] = $1;
     }
     $0_1 = HEAP32[$4 + 20 >> 2];
     if (!$0_1) {
      break label$111
     }
     HEAP32[$1 + 20 >> 2] = $0_1;
     HEAP32[$0_1 + 24 >> 2] = $1;
    }
    label$115 : {
     if ($3_1 >>> 0 <= 15) {
      $0_1 = $3_1 + $7 | 0;
      HEAP32[$4 + 4 >> 2] = $0_1 | 3;
      $0_1 = $0_1 + $4 | 0;
      HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] | 1;
      break label$115;
     }
     HEAP32[$4 + 4 >> 2] = $7 | 3;
     $5_1 = $4 + $7 | 0;
     HEAP32[$5_1 + 4 >> 2] = $3_1 | 1;
     HEAP32[$3_1 + $5_1 >> 2] = $3_1;
     if ($3_1 >>> 0 <= 255) {
      $0_1 = $3_1 >>> 3 | 0;
      $2_1 = ($0_1 << 3) + 2112 | 0;
      $1 = HEAP32[518];
      $0_1 = 1 << $0_1;
      label$118 : {
       if (!($1 & $0_1)) {
        HEAP32[518] = $0_1 | $1;
        $0_1 = $2_1;
        break label$118;
       }
       $0_1 = HEAP32[$2_1 + 8 >> 2];
      }
      HEAP32[$2_1 + 8 >> 2] = $5_1;
      HEAP32[$0_1 + 12 >> 2] = $5_1;
      HEAP32[$5_1 + 12 >> 2] = $2_1;
      HEAP32[$5_1 + 8 >> 2] = $0_1;
      break label$115;
     }
     $0_1 = 31;
     if ($3_1 >>> 0 <= 16777215) {
      $0_1 = $3_1 >>> 8 | 0;
      $6_1 = $0_1 + 1048320 >>> 16 & 8;
      $0_1 = $0_1 << $6_1;
      $2_1 = $0_1 + 520192 >>> 16 & 4;
      $0_1 = $0_1 << $2_1;
      $1 = $0_1 + 245760 >>> 16 & 2;
      $0_1 = ($0_1 << $1 >>> 15 | 0) - ($1 | ($2_1 | $6_1)) | 0;
      $0_1 = ($0_1 << 1 | $3_1 >>> $0_1 + 21 & 1) + 28 | 0;
     }
     HEAP32[$5_1 + 28 >> 2] = $0_1;
     HEAP32[$5_1 + 16 >> 2] = 0;
     HEAP32[$5_1 + 20 >> 2] = 0;
     $1 = ($0_1 << 2) + 2376 | 0;
     label$121 : {
      $2_1 = 1 << $0_1;
      label$122 : {
       if (!($2_1 & $9_1)) {
        HEAP32[519] = $2_1 | $9_1;
        HEAP32[$1 >> 2] = $5_1;
        break label$122;
       }
       $0_1 = $3_1 << (($0_1 | 0) == 31 ? 0 : 25 - ($0_1 >>> 1 | 0) | 0);
       $7 = HEAP32[$1 >> 2];
       while (1) {
        $1 = $7;
        if ((HEAP32[$1 + 4 >> 2] & -8) == ($3_1 | 0)) {
         break label$121
        }
        $2_1 = $0_1 >>> 29 | 0;
        $0_1 = $0_1 << 1;
        $2_1 = ($1 + ($2_1 & 4) | 0) + 16 | 0;
        $7 = HEAP32[$2_1 >> 2];
        if ($7) {
         continue
        }
        break;
       };
       HEAP32[$2_1 >> 2] = $5_1;
      }
      HEAP32[$5_1 + 24 >> 2] = $1;
      HEAP32[$5_1 + 12 >> 2] = $5_1;
      HEAP32[$5_1 + 8 >> 2] = $5_1;
      break label$115;
     }
     $0_1 = HEAP32[$1 + 8 >> 2];
     HEAP32[$0_1 + 12 >> 2] = $5_1;
     HEAP32[$1 + 8 >> 2] = $5_1;
     HEAP32[$5_1 + 24 >> 2] = 0;
     HEAP32[$5_1 + 12 >> 2] = $1;
     HEAP32[$5_1 + 8 >> 2] = $0_1;
    }
    $0_1 = $4 + 8 | 0;
    break label$2;
   }
   label$125 : {
    if (!$8) {
     break label$125
    }
    $2_1 = HEAP32[$1 + 28 >> 2];
    $0_1 = ($2_1 << 2) + 2376 | 0;
    label$126 : {
     if (($1 | 0) == HEAP32[$0_1 >> 2]) {
      HEAP32[$0_1 >> 2] = $4;
      if ($4) {
       break label$126
      }
      HEAP32[519] = __wasm_rotl_i32($2_1) & $9_1;
      break label$125;
     }
     HEAP32[(HEAP32[$8 + 16 >> 2] == ($1 | 0) ? 16 : 20) + $8 >> 2] = $4;
     if (!$4) {
      break label$125
     }
    }
    HEAP32[$4 + 24 >> 2] = $8;
    $0_1 = HEAP32[$1 + 16 >> 2];
    if ($0_1) {
     HEAP32[$4 + 16 >> 2] = $0_1;
     HEAP32[$0_1 + 24 >> 2] = $4;
    }
    $0_1 = HEAP32[$1 + 20 >> 2];
    if (!$0_1) {
     break label$125
    }
    HEAP32[$4 + 20 >> 2] = $0_1;
    HEAP32[$0_1 + 24 >> 2] = $4;
   }
   label$129 : {
    if ($3_1 >>> 0 <= 15) {
     $0_1 = $3_1 + $7 | 0;
     HEAP32[$1 + 4 >> 2] = $0_1 | 3;
     $0_1 = $0_1 + $1 | 0;
     HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] | 1;
     break label$129;
    }
    HEAP32[$1 + 4 >> 2] = $7 | 3;
    $2_1 = $1 + $7 | 0;
    HEAP32[$2_1 + 4 >> 2] = $3_1 | 1;
    HEAP32[$2_1 + $3_1 >> 2] = $3_1;
    if ($10_1) {
     $0_1 = $10_1 >>> 3 | 0;
     $6_1 = ($0_1 << 3) + 2112 | 0;
     $4 = HEAP32[523];
     $0_1 = 1 << $0_1;
     label$132 : {
      if (!($0_1 & $5_1)) {
       HEAP32[518] = $0_1 | $5_1;
       $0_1 = $6_1;
       break label$132;
      }
      $0_1 = HEAP32[$6_1 + 8 >> 2];
     }
     HEAP32[$6_1 + 8 >> 2] = $4;
     HEAP32[$0_1 + 12 >> 2] = $4;
     HEAP32[$4 + 12 >> 2] = $6_1;
     HEAP32[$4 + 8 >> 2] = $0_1;
    }
    HEAP32[523] = $2_1;
    HEAP32[520] = $3_1;
   }
   $0_1 = $1 + 8 | 0;
  }
  global$0 = $11_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $33($0_1) {
  $0_1 = $0_1 | 0;
  var $1 = 0, $2_1 = 0, $3_1 = 0, $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0;
  label$1 : {
   if (!$0_1) {
    break label$1
   }
   $3_1 = $0_1 - 8 | 0;
   $1 = HEAP32[$0_1 - 4 >> 2];
   $0_1 = $1 & -8;
   $5_1 = $3_1 + $0_1 | 0;
   label$2 : {
    if ($1 & 1) {
     break label$2
    }
    if (!($1 & 3)) {
     break label$1
    }
    $1 = HEAP32[$3_1 >> 2];
    $3_1 = $3_1 - $1 | 0;
    if ($3_1 >>> 0 < HEAPU32[522]) {
     break label$1
    }
    $0_1 = $0_1 + $1 | 0;
    if (($3_1 | 0) != HEAP32[523]) {
     if ($1 >>> 0 <= 255) {
      $2_1 = HEAP32[$3_1 + 8 >> 2];
      $4 = $1 >>> 3 | 0;
      $1 = HEAP32[$3_1 + 12 >> 2];
      if (($2_1 | 0) == ($1 | 0)) {
       HEAP32[518] = HEAP32[518] & __wasm_rotl_i32($4);
       break label$2;
      }
      HEAP32[$2_1 + 12 >> 2] = $1;
      HEAP32[$1 + 8 >> 2] = $2_1;
      break label$2;
     }
     $7 = HEAP32[$3_1 + 24 >> 2];
     $1 = HEAP32[$3_1 + 12 >> 2];
     label$6 : {
      if (($3_1 | 0) != ($1 | 0)) {
       $2_1 = HEAP32[$3_1 + 8 >> 2];
       HEAP32[$2_1 + 12 >> 2] = $1;
       HEAP32[$1 + 8 >> 2] = $2_1;
       break label$6;
      }
      label$8 : {
       $2_1 = $3_1 + 20 | 0;
       $4 = HEAP32[$2_1 >> 2];
       if ($4) {
        break label$8
       }
       $2_1 = $3_1 + 16 | 0;
       $4 = HEAP32[$2_1 >> 2];
       if ($4) {
        break label$8
       }
       $1 = 0;
       break label$6;
      }
      while (1) {
       $6_1 = $2_1;
       $1 = $4;
       $2_1 = $1 + 20 | 0;
       $4 = HEAP32[$2_1 >> 2];
       if ($4) {
        continue
       }
       $2_1 = $1 + 16 | 0;
       $4 = HEAP32[$1 + 16 >> 2];
       if ($4) {
        continue
       }
       break;
      };
      HEAP32[$6_1 >> 2] = 0;
     }
     if (!$7) {
      break label$2
     }
     $2_1 = HEAP32[$3_1 + 28 >> 2];
     $4 = ($2_1 << 2) + 2376 | 0;
     label$10 : {
      if (($3_1 | 0) == HEAP32[$4 >> 2]) {
       HEAP32[$4 >> 2] = $1;
       if ($1) {
        break label$10
       }
       HEAP32[519] = HEAP32[519] & __wasm_rotl_i32($2_1);
       break label$2;
      }
      HEAP32[$7 + (HEAP32[$7 + 16 >> 2] == ($3_1 | 0) ? 16 : 20) >> 2] = $1;
      if (!$1) {
       break label$2
      }
     }
     HEAP32[$1 + 24 >> 2] = $7;
     $2_1 = HEAP32[$3_1 + 16 >> 2];
     if ($2_1) {
      HEAP32[$1 + 16 >> 2] = $2_1;
      HEAP32[$2_1 + 24 >> 2] = $1;
     }
     $2_1 = HEAP32[$3_1 + 20 >> 2];
     if (!$2_1) {
      break label$2
     }
     HEAP32[$1 + 20 >> 2] = $2_1;
     HEAP32[$2_1 + 24 >> 2] = $1;
     break label$2;
    }
    $1 = HEAP32[$5_1 + 4 >> 2];
    if (($1 & 3) != 3) {
     break label$2
    }
    HEAP32[520] = $0_1;
    HEAP32[$5_1 + 4 >> 2] = $1 & -2;
    HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
    HEAP32[$0_1 + $3_1 >> 2] = $0_1;
    return;
   }
   if ($3_1 >>> 0 >= $5_1 >>> 0) {
    break label$1
   }
   $1 = HEAP32[$5_1 + 4 >> 2];
   if (!($1 & 1)) {
    break label$1
   }
   label$13 : {
    if (!($1 & 2)) {
     if (HEAP32[524] == ($5_1 | 0)) {
      HEAP32[524] = $3_1;
      $0_1 = HEAP32[521] + $0_1 | 0;
      HEAP32[521] = $0_1;
      HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
      if (HEAP32[523] != ($3_1 | 0)) {
       break label$1
      }
      HEAP32[520] = 0;
      HEAP32[523] = 0;
      return;
     }
     if (HEAP32[523] == ($5_1 | 0)) {
      HEAP32[523] = $3_1;
      $0_1 = HEAP32[520] + $0_1 | 0;
      HEAP32[520] = $0_1;
      HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
      HEAP32[$0_1 + $3_1 >> 2] = $0_1;
      return;
     }
     $0_1 = ($1 & -8) + $0_1 | 0;
     label$17 : {
      if ($1 >>> 0 <= 255) {
       $2_1 = HEAP32[$5_1 + 8 >> 2];
       $4 = $1 >>> 3 | 0;
       $1 = HEAP32[$5_1 + 12 >> 2];
       if (($2_1 | 0) == ($1 | 0)) {
        HEAP32[518] = HEAP32[518] & __wasm_rotl_i32($4);
        break label$17;
       }
       HEAP32[$2_1 + 12 >> 2] = $1;
       HEAP32[$1 + 8 >> 2] = $2_1;
       break label$17;
      }
      $7 = HEAP32[$5_1 + 24 >> 2];
      $1 = HEAP32[$5_1 + 12 >> 2];
      label$20 : {
       if (($1 | 0) != ($5_1 | 0)) {
        $2_1 = HEAP32[$5_1 + 8 >> 2];
        HEAP32[$2_1 + 12 >> 2] = $1;
        HEAP32[$1 + 8 >> 2] = $2_1;
        break label$20;
       }
       label$22 : {
        $2_1 = $5_1 + 20 | 0;
        $4 = HEAP32[$2_1 >> 2];
        if ($4) {
         break label$22
        }
        $2_1 = $5_1 + 16 | 0;
        $4 = HEAP32[$2_1 >> 2];
        if ($4) {
         break label$22
        }
        $1 = 0;
        break label$20;
       }
       while (1) {
        $6_1 = $2_1;
        $1 = $4;
        $2_1 = $1 + 20 | 0;
        $4 = HEAP32[$2_1 >> 2];
        if ($4) {
         continue
        }
        $2_1 = $1 + 16 | 0;
        $4 = HEAP32[$1 + 16 >> 2];
        if ($4) {
         continue
        }
        break;
       };
       HEAP32[$6_1 >> 2] = 0;
      }
      if (!$7) {
       break label$17
      }
      $2_1 = HEAP32[$5_1 + 28 >> 2];
      $4 = ($2_1 << 2) + 2376 | 0;
      label$24 : {
       if (HEAP32[$4 >> 2] == ($5_1 | 0)) {
        HEAP32[$4 >> 2] = $1;
        if ($1) {
         break label$24
        }
        HEAP32[519] = HEAP32[519] & __wasm_rotl_i32($2_1);
        break label$17;
       }
       HEAP32[$7 + (($5_1 | 0) == HEAP32[$7 + 16 >> 2] ? 16 : 20) >> 2] = $1;
       if (!$1) {
        break label$17
       }
      }
      HEAP32[$1 + 24 >> 2] = $7;
      $2_1 = HEAP32[$5_1 + 16 >> 2];
      if ($2_1) {
       HEAP32[$1 + 16 >> 2] = $2_1;
       HEAP32[$2_1 + 24 >> 2] = $1;
      }
      $2_1 = HEAP32[$5_1 + 20 >> 2];
      if (!$2_1) {
       break label$17
      }
      HEAP32[$1 + 20 >> 2] = $2_1;
      HEAP32[$2_1 + 24 >> 2] = $1;
     }
     HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
     HEAP32[$0_1 + $3_1 >> 2] = $0_1;
     if (HEAP32[523] != ($3_1 | 0)) {
      break label$13
     }
     HEAP32[520] = $0_1;
     return;
    }
    HEAP32[$5_1 + 4 >> 2] = $1 & -2;
    HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
    HEAP32[$0_1 + $3_1 >> 2] = $0_1;
   }
   if ($0_1 >>> 0 <= 255) {
    $1 = $0_1 >>> 3 | 0;
    $0_1 = ($1 << 3) + 2112 | 0;
    $2_1 = HEAP32[518];
    $1 = 1 << $1;
    label$28 : {
     if (!($2_1 & $1)) {
      HEAP32[518] = $1 | $2_1;
      $2_1 = $0_1;
      break label$28;
     }
     $2_1 = HEAP32[$0_1 + 8 >> 2];
    }
    HEAP32[$0_1 + 8 >> 2] = $3_1;
    HEAP32[$2_1 + 12 >> 2] = $3_1;
    HEAP32[$3_1 + 12 >> 2] = $0_1;
    HEAP32[$3_1 + 8 >> 2] = $2_1;
    return;
   }
   $2_1 = 31;
   HEAP32[$3_1 + 16 >> 2] = 0;
   HEAP32[$3_1 + 20 >> 2] = 0;
   if ($0_1 >>> 0 <= 16777215) {
    $2_1 = $0_1 >>> 8 | 0;
    $1 = $2_1 + 1048320 >>> 16 & 8;
    $4 = $2_1 << $1;
    $2_1 = $4 + 520192 >>> 16 & 4;
    $6_1 = $4 << $2_1;
    $4 = $6_1 + 245760 >>> 16 & 2;
    $1 = ($6_1 << $4 >>> 15 | 0) - ($4 | ($1 | $2_1)) | 0;
    $2_1 = ($1 << 1 | $0_1 >>> $1 + 21 & 1) + 28 | 0;
   }
   HEAP32[$3_1 + 28 >> 2] = $2_1;
   $1 = ($2_1 << 2) + 2376 | 0;
   label$31 : {
    label$32 : {
     $4 = HEAP32[519];
     $6_1 = 1 << $2_1;
     label$33 : {
      if (!($4 & $6_1)) {
       HEAP32[519] = $4 | $6_1;
       HEAP32[$1 >> 2] = $3_1;
       HEAP32[$3_1 + 24 >> 2] = $1;
       break label$33;
      }
      $2_1 = $0_1 << (($2_1 | 0) == 31 ? 0 : 25 - ($2_1 >>> 1 | 0) | 0);
      $1 = HEAP32[$1 >> 2];
      while (1) {
       $4 = $1;
       if ((HEAP32[$1 + 4 >> 2] & -8) == ($0_1 | 0)) {
        break label$32
       }
       $1 = $2_1 >>> 29 | 0;
       $2_1 = $2_1 << 1;
       $6_1 = ($4 + ($1 & 4) | 0) + 16 | 0;
       $1 = HEAP32[$6_1 >> 2];
       if ($1) {
        continue
       }
       break;
      };
      HEAP32[$6_1 >> 2] = $3_1;
      HEAP32[$3_1 + 24 >> 2] = $4;
     }
     HEAP32[$3_1 + 12 >> 2] = $3_1;
     HEAP32[$3_1 + 8 >> 2] = $3_1;
     break label$31;
    }
    $0_1 = HEAP32[$4 + 8 >> 2];
    HEAP32[$0_1 + 12 >> 2] = $3_1;
    HEAP32[$4 + 8 >> 2] = $3_1;
    HEAP32[$3_1 + 24 >> 2] = 0;
    HEAP32[$3_1 + 12 >> 2] = $4;
    HEAP32[$3_1 + 8 >> 2] = $0_1;
   }
   $0_1 = HEAP32[526] - 1 | 0;
   HEAP32[526] = $0_1 ? $0_1 : -1;
  }
 }
 
 function $35($0_1) {
  var $1 = 0, $2_1 = 0;
  $1 = HEAP32[450];
  $2_1 = $0_1 + 3 & -4;
  $0_1 = $1 + $2_1 | 0;
  label$2 : {
   if ($0_1 >>> 0 <= $1 >>> 0 ? $2_1 : 0) {
    break label$2
   }
   if ($0_1 >>> 0 > __wasm_memory_size() << 16 >>> 0) {
    if (!(fimport$3($0_1 | 0) | 0)) {
     break label$2
    }
   }
   HEAP32[450] = $0_1;
   return $1;
  }
  HEAP32[500] = 48;
  return -1;
 }
 
 function $36($0_1, $1, $2_1) {
  var $3_1 = 0, $4 = 0, $5_1 = 0;
  if ($2_1 >>> 0 >= 512) {
   fimport$4($0_1 | 0, $1 | 0, $2_1 | 0) | 0;
   return $0_1;
  }
  $4 = $0_1 + $2_1 | 0;
  label$3 : {
   if (!(($0_1 ^ $1) & 3)) {
    label$5 : {
     if (!($0_1 & 3)) {
      $2_1 = $0_1;
      break label$5;
     }
     if (($2_1 | 0) < 1) {
      $2_1 = $0_1;
      break label$5;
     }
     $2_1 = $0_1;
     while (1) {
      HEAP8[$2_1 | 0] = HEAPU8[$1 | 0];
      $1 = $1 + 1 | 0;
      $2_1 = $2_1 + 1 | 0;
      if (!($2_1 & 3)) {
       break label$5
      }
      if ($2_1 >>> 0 < $4 >>> 0) {
       continue
      }
      break;
     };
    }
    $3_1 = $4 & -4;
    label$9 : {
     if ($3_1 >>> 0 < 64) {
      break label$9
     }
     $5_1 = $3_1 + -64 | 0;
     if ($5_1 >>> 0 < $2_1 >>> 0) {
      break label$9
     }
     while (1) {
      HEAP32[$2_1 >> 2] = HEAP32[$1 >> 2];
      HEAP32[$2_1 + 4 >> 2] = HEAP32[$1 + 4 >> 2];
      HEAP32[$2_1 + 8 >> 2] = HEAP32[$1 + 8 >> 2];
      HEAP32[$2_1 + 12 >> 2] = HEAP32[$1 + 12 >> 2];
      HEAP32[$2_1 + 16 >> 2] = HEAP32[$1 + 16 >> 2];
      HEAP32[$2_1 + 20 >> 2] = HEAP32[$1 + 20 >> 2];
      HEAP32[$2_1 + 24 >> 2] = HEAP32[$1 + 24 >> 2];
      HEAP32[$2_1 + 28 >> 2] = HEAP32[$1 + 28 >> 2];
      HEAP32[$2_1 + 32 >> 2] = HEAP32[$1 + 32 >> 2];
      HEAP32[$2_1 + 36 >> 2] = HEAP32[$1 + 36 >> 2];
      HEAP32[$2_1 + 40 >> 2] = HEAP32[$1 + 40 >> 2];
      HEAP32[$2_1 + 44 >> 2] = HEAP32[$1 + 44 >> 2];
      HEAP32[$2_1 + 48 >> 2] = HEAP32[$1 + 48 >> 2];
      HEAP32[$2_1 + 52 >> 2] = HEAP32[$1 + 52 >> 2];
      HEAP32[$2_1 + 56 >> 2] = HEAP32[$1 + 56 >> 2];
      HEAP32[$2_1 + 60 >> 2] = HEAP32[$1 + 60 >> 2];
      $1 = $1 - -64 | 0;
      $2_1 = $2_1 - -64 | 0;
      if ($5_1 >>> 0 >= $2_1 >>> 0) {
       continue
      }
      break;
     };
    }
    if ($2_1 >>> 0 >= $3_1 >>> 0) {
     break label$3
    }
    while (1) {
     HEAP32[$2_1 >> 2] = HEAP32[$1 >> 2];
     $1 = $1 + 4 | 0;
     $2_1 = $2_1 + 4 | 0;
     if ($3_1 >>> 0 > $2_1 >>> 0) {
      continue
     }
     break;
    };
    break label$3;
   }
   if ($4 >>> 0 < 4) {
    $2_1 = $0_1;
    break label$3;
   }
   $3_1 = $4 - 4 | 0;
   if ($0_1 >>> 0 > $3_1 >>> 0) {
    $2_1 = $0_1;
    break label$3;
   }
   $2_1 = $0_1;
   while (1) {
    HEAP8[$2_1 | 0] = HEAPU8[$1 | 0];
    HEAP8[$2_1 + 1 | 0] = HEAPU8[$1 + 1 | 0];
    HEAP8[$2_1 + 2 | 0] = HEAPU8[$1 + 2 | 0];
    HEAP8[$2_1 + 3 | 0] = HEAPU8[$1 + 3 | 0];
    $1 = $1 + 4 | 0;
    $2_1 = $2_1 + 4 | 0;
    if ($3_1 >>> 0 >= $2_1 >>> 0) {
     continue
    }
    break;
   };
  }
  if ($2_1 >>> 0 < $4 >>> 0) {
   while (1) {
    HEAP8[$2_1 | 0] = HEAPU8[$1 | 0];
    $1 = $1 + 1 | 0;
    $2_1 = $2_1 + 1 | 0;
    if (($4 | 0) != ($2_1 | 0)) {
     continue
    }
    break;
   }
  }
  return $0_1;
 }
 
 function $37($0_1, $1, $2_1) {
  var $3_1 = 0, $4 = 0;
  label$2 : {
   if (!$2_1) {
    break label$2
   }
   $3_1 = $0_1 + $2_1 | 0;
   HEAP8[$3_1 - 1 | 0] = $1;
   HEAP8[$0_1 | 0] = $1;
   if ($2_1 >>> 0 < 3) {
    break label$2
   }
   HEAP8[$3_1 - 2 | 0] = $1;
   HEAP8[$0_1 + 1 | 0] = $1;
   HEAP8[$3_1 - 3 | 0] = $1;
   HEAP8[$0_1 + 2 | 0] = $1;
   if ($2_1 >>> 0 < 7) {
    break label$2
   }
   HEAP8[$3_1 - 4 | 0] = $1;
   HEAP8[$0_1 + 3 | 0] = $1;
   if ($2_1 >>> 0 < 9) {
    break label$2
   }
   $3_1 = $0_1;
   $0_1 = 0 - $0_1 & 3;
   $3_1 = $3_1 + $0_1 | 0;
   $4 = Math_imul($1 & 255, 16843009);
   HEAP32[$3_1 >> 2] = $4;
   $0_1 = $2_1 - $0_1 & -4;
   $1 = $0_1 + $3_1 | 0;
   HEAP32[$1 - 4 >> 2] = $4;
   if ($0_1 >>> 0 < 9) {
    break label$2
   }
   HEAP32[$3_1 + 8 >> 2] = $4;
   HEAP32[$3_1 + 4 >> 2] = $4;
   HEAP32[$1 - 8 >> 2] = $4;
   HEAP32[$1 - 12 >> 2] = $4;
   if ($0_1 >>> 0 < 25) {
    break label$2
   }
   HEAP32[$3_1 + 24 >> 2] = $4;
   HEAP32[$3_1 + 20 >> 2] = $4;
   HEAP32[$3_1 + 16 >> 2] = $4;
   HEAP32[$3_1 + 12 >> 2] = $4;
   HEAP32[$1 - 16 >> 2] = $4;
   HEAP32[$1 - 20 >> 2] = $4;
   HEAP32[$1 - 24 >> 2] = $4;
   HEAP32[$1 - 28 >> 2] = $4;
   $1 = $3_1 & 4 | 24;
   $2_1 = $0_1 - $1 | 0;
   if ($2_1 >>> 0 < 32) {
    break label$2
   }
   $4 = __wasm_i64_mul($4, 0, 1, 1);
   $0_1 = i64toi32_i32$HIGH_BITS;
   $1 = $1 + $3_1 | 0;
   while (1) {
    HEAP32[$1 + 24 >> 2] = $4;
    $3_1 = $0_1;
    HEAP32[$1 + 28 >> 2] = $3_1;
    HEAP32[$1 + 16 >> 2] = $4;
    HEAP32[$1 + 20 >> 2] = $3_1;
    HEAP32[$1 + 8 >> 2] = $4;
    HEAP32[$1 + 12 >> 2] = $3_1;
    HEAP32[$1 >> 2] = $4;
    HEAP32[$1 + 4 >> 2] = $3_1;
    $1 = $1 + 32 | 0;
    $2_1 = $2_1 - 32 | 0;
    if ($2_1 >>> 0 > 31) {
     continue
    }
    break;
   };
  }
 }
 
 function $40($0_1) {
  $0_1 = $0_1 | 0;
  return 0;
 }
 
 function $41($0_1, $1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1 = $1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  i64toi32_i32$HIGH_BITS = 0;
  return 0;
 }
 
 function $45($0_1) {
  var $1 = 0, $2_1 = 0, $3_1 = 0;
  $1 = $0_1;
  label$2 : {
   if ($1 & 3) {
    while (1) {
     if (!HEAPU8[$1 | 0]) {
      break label$2
     }
     $1 = $1 + 1 | 0;
     if ($1 & 3) {
      continue
     }
     break;
    }
   }
   while (1) {
    $2_1 = $1;
    $1 = $1 + 4 | 0;
    $3_1 = HEAP32[$2_1 >> 2];
    if (!(($3_1 ^ -1) & $3_1 - 16843009 & -2139062144)) {
     continue
    }
    break;
   };
   if (!($3_1 & 255)) {
    return $2_1 - $0_1 | 0
   }
   while (1) {
    $3_1 = HEAPU8[$2_1 + 1 | 0];
    $1 = $2_1 + 1 | 0;
    $2_1 = $1;
    if ($3_1) {
     continue
    }
    break;
   };
  }
  return $1 - $0_1 | 0;
 }
 
 function $46() {
  return global$0 | 0;
 }
 
 function $47($0_1) {
  $0_1 = $0_1 | 0;
  global$0 = $0_1;
 }
 
 function $48($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = global$0 - $0_1 & -16;
  global$0 = $0_1;
  return $0_1 | 0;
 }
 
 function $49($0_1, $1) {
  $0_1 = $0_1 | 0;
  $1 = $1 | 0;
  var $2_1 = 0, $3_1 = 0, $4 = 0, $5_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 12;
   $2_1 = HEAP32[global$6 >> 2];
   $3_1 = HEAP32[$2_1 >> 2];
   $4 = HEAP32[$2_1 + 4 >> 2];
   $2_1 = HEAP32[$2_1 + 8 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $5_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $4 = $0_1;
   $3_1 = $1;
  }
  label$2 : {
   if (!(global$5 ? $5_1 : 0)) {
    $0_1 = FUNCTION_TABLE[$4 | 0]($3_1) | 0;
    if ((global$5 | 0) == 1) {
     break label$2
    }
    $2_1 = $0_1;
   }
   if (!global$5) {
    return $2_1 | 0
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $3_1;
  HEAP32[$0_1 + 4 >> 2] = $4;
  HEAP32[$0_1 + 8 >> 2] = $2_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 12;
  return 0;
 }
 
 function $50($0_1, $1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1 = $1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 20;
   $4 = HEAP32[global$6 >> 2];
   $5_1 = HEAP32[$4 >> 2];
   $6_1 = HEAP32[$4 + 4 >> 2];
   $7 = HEAP32[$4 + 8 >> 2];
   $8 = HEAP32[$4 + 12 >> 2];
   $4 = HEAP32[$4 + 16 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $9_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $6_1 = $2_1;
   $7 = $3_1;
   $8 = $0_1;
   $5_1 = $1;
  }
  label$2 : {
   if (!(global$5 ? $9_1 : 0)) {
    $0_1 = FUNCTION_TABLE[$8 | 0]($5_1, $6_1, $7) | 0;
    if ((global$5 | 0) == 1) {
     break label$2
    }
    $4 = $0_1;
   }
   if (!global$5) {
    return $4 | 0
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $5_1;
  HEAP32[$0_1 + 4 >> 2] = $6_1;
  HEAP32[$0_1 + 8 >> 2] = $7;
  HEAP32[$0_1 + 12 >> 2] = $8;
  HEAP32[$0_1 + 16 >> 2] = $4;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 20;
  return 0;
 }
 
 function $52($0_1, $1, $2_1, $3_1, $4) {
  $0_1 = $0_1 | 0;
  $1 = $1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  var $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11_1 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15 = 0, $16_1 = 0, $17_1 = 0, $18_1 = 0, $19_1 = 0, $20 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 32;
   $5_1 = HEAP32[global$6 >> 2];
   $8 = HEAP32[$5_1 >> 2];
   $9_1 = HEAP32[$5_1 + 8 >> 2];
   $10_1 = HEAP32[$5_1 + 12 >> 2];
   $11_1 = HEAP32[$5_1 + 16 >> 2];
   $12 = HEAP32[$5_1 + 20 >> 2];
   $13 = HEAP32[$5_1 + 24 >> 2];
   $14_1 = HEAP32[$5_1 + 28 >> 2];
   $15 = HEAP32[$5_1 + 4 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $7 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $15 = $1;
   $9_1 = $2_1;
   $10_1 = $3_1;
   $11_1 = $4;
   $8 = $0_1;
  }
  label$2 : {
   if (!(global$5 ? $7 : 0)) {
    $0_1 = $8;
    $1 = $15;
    $2_1 = $9_1;
    $3_1 = $10_1;
    $4 = $11_1;
    $5_1 = 0;
    $7 = 0;
    if ((global$5 | 0) == 2) {
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 28;
     $6_1 = HEAP32[global$6 >> 2];
     $5_1 = HEAP32[$6_1 >> 2];
     $16_1 = HEAP32[$6_1 + 4 >> 2];
     $17_1 = HEAP32[$6_1 + 8 >> 2];
     $18_1 = HEAP32[$6_1 + 12 >> 2];
     $19_1 = HEAP32[$6_1 + 16 >> 2];
     $7 = HEAP32[$6_1 + 20 >> 2];
     $6_1 = HEAP32[$6_1 + 24 >> 2];
    }
    if ((global$5 | 0) == 2) {
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
     $20 = HEAP32[HEAP32[global$6 >> 2] >> 2];
    }
    if (!global$5) {
     $16_1 = $2_1;
     $17_1 = $3_1;
     $18_1 = $4;
     $19_1 = $0_1;
     $5_1 = $1;
    }
    __inlined_func$51 : {
     label$20 : {
      if (!(global$5 ? $20 : 0)) {
       $0_1 = FUNCTION_TABLE[$19_1 | 0]($5_1, $16_1, $17_1, $18_1) | 0;
       if ((global$5 | 0) == 1) {
        break label$20
       }
       $6_1 = i64toi32_i32$HIGH_BITS;
       $7 = $0_1;
      }
      if (!global$5) {
       i64toi32_i32$HIGH_BITS = $6_1;
       $0_1 = $7;
       break __inlined_func$51;
      }
      abort();
     }
     HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
     $0_1 = HEAP32[global$6 >> 2];
     HEAP32[$0_1 >> 2] = $5_1;
     HEAP32[$0_1 + 4 >> 2] = $16_1;
     HEAP32[$0_1 + 8 >> 2] = $17_1;
     HEAP32[$0_1 + 12 >> 2] = $18_1;
     HEAP32[$0_1 + 16 >> 2] = $19_1;
     HEAP32[$0_1 + 20 >> 2] = $7;
     HEAP32[$0_1 + 24 >> 2] = $6_1;
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 28;
     i64toi32_i32$HIGH_BITS = 0;
     $0_1 = 0;
    }
    if ((global$5 | 0) == 1) {
     break label$2
    }
    $13 = i64toi32_i32$HIGH_BITS;
    $12 = $0_1;
   }
   if (!global$5) {
    fimport$5($13 | 0);
    $14_1 = $12;
   }
   if (!global$5) {
    return $14_1 | 0
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $8;
  HEAP32[$0_1 + 4 >> 2] = $15;
  HEAP32[$0_1 + 8 >> 2] = $9_1;
  HEAP32[$0_1 + 12 >> 2] = $10_1;
  HEAP32[$0_1 + 16 >> 2] = $11_1;
  HEAP32[$0_1 + 20 >> 2] = $12;
  HEAP32[$0_1 + 24 >> 2] = $13;
  HEAP32[$0_1 + 28 >> 2] = $14_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 32;
  return 0;
 }
 
 function $53($0_1) {
  $0_1 = $0_1 | 0;
  global$5 = 1;
  global$6 = $0_1;
  if (HEAPU32[global$6 >> 2] > HEAPU32[global$6 + 4 >> 2]) {
   abort()
  }
 }
 
 function $54() {
  global$5 = 0;
  if (HEAPU32[global$6 >> 2] > HEAPU32[global$6 + 4 >> 2]) {
   abort()
  }
 }
 
 function $55($0_1) {
  $0_1 = $0_1 | 0;
  global$5 = 2;
  global$6 = $0_1;
  if (HEAPU32[global$6 >> 2] > HEAPU32[global$6 + 4 >> 2]) {
   abort()
  }
 }
 
 function $57() {
  return global$5 | 0;
 }
 
 function __wasm_i64_mul($0_1, $1, $2_1, $3_1) {
  var $4 = 0, $5_1 = 0, $6_1 = 0, $7 = 0, $8 = 0, $9_1 = 0;
  $4 = $2_1 >>> 16 | 0;
  $5_1 = $0_1 >>> 16 | 0;
  $9_1 = Math_imul($4, $5_1);
  $6_1 = $2_1 & 65535;
  $7 = $0_1 & 65535;
  $8 = Math_imul($6_1, $7);
  $5_1 = ($8 >>> 16 | 0) + Math_imul($5_1, $6_1) | 0;
  $4 = ($5_1 & 65535) + Math_imul($4, $7) | 0;
  i64toi32_i32$HIGH_BITS = (Math_imul($1, $2_1) + $9_1 | 0) + Math_imul($0_1, $3_1) + ($5_1 >>> 16) + ($4 >>> 16) | 0;
  return $8 & 65535 | $4 << 16;
 }
 
 function __wasm_rotl_i32($0_1) {
  var $1 = 0;
  $1 = $0_1 & 31;
  $0_1 = 0 - $0_1 & 31;
  return (-1 >>> $1 & -2) << $1 | (-1 << $0_1 & -2) >>> $0_1;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(env);
 var FUNCTION_TABLE = Table([null, $40, $26, $41]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
 }
 
 return {
  "__wasm_call_ctors": $0, 
  "RunInput": $2, 
  "__errno_location": $5, 
  "stackSave": $46, 
  "stackRestore": $47, 
  "stackAlloc": $48, 
  "emscripten_stack_set_limits": $9, 
  "emscripten_stack_get_base": $10, 
  "emscripten_stack_get_end": $11, 
  "malloc": $32, 
  "free": $33, 
  "__indirect_function_table": FUNCTION_TABLE, 
  "dynCall_ii": $49, 
  "dynCall_iiii": $50, 
  "dynCall_jiji": $52, 
  "asyncify_start_unwind": $53, 
  "asyncify_stop_unwind": $54, 
  "asyncify_start_rewind": $55, 
  "asyncify_stop_rewind": $54, 
  "asyncify_get_state": $57
 };
}

  return asmFunc(asmLibraryArg);
}

)(asmLibraryArg);
  },

  instantiate: /** @suppress{checkTypes} */ function(binary, info) {
    return {
      then: function(ok) {
        var module = new WebAssembly.Module(binary);
        ok({
          'instance': new WebAssembly.Instance(module)
        });
      }
    };
  },

  RuntimeError: Error
};

// We don't need to actually download a wasm binary, mark it as present but empty.
wasmBinary = [];

// end include: wasm2js.js
if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }
  var asyncMode = opts && opts.async;
  // Check if we started an async operation just now.
  if (Asyncify.currData) {
    // If so, the WASM function ran asynchronous and unwound its stack.
    // We need to return a Promise that resolves the return value
    // once the stack is rewound and execution finishes.
    return Asyncify.whenDone().then(onDone);
  }

  ret = onDone(ret);
  // If this is an async ccall, ensure we return a promise
  if (asyncMode) return Promise.resolve(ret);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function(type){ return type === 'number'});
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((Uint8Array|Array<number>), number)} */
function allocate(slab, allocator) {
  var ret;

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (slab.subarray || slab.slice) {
    HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js


// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536,
      'maximum': INITIAL_MEMORY / 65536
    });
  }

if (wasmMemory) {
  buffer = wasmMemory.buffer;
}

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);

// end include: runtime_init_memory.js

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// end include: runtime_stack_check.js
// include: runtime_assertions.js


// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;
var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;

  
  callRuntimeCallbacks(__ATINIT__);
}

function exitRuntime() {
  runtimeExited = true;
}

function postRun() {

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }

  what += '';
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
var wasmBinaryFile;
  wasmBinaryFile = 'cxx1143.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    exports = Asyncify.instrumentWasmExports(exports);

    Module['asm'] = exports;

    wasmTable = Module['asm']['__indirect_function_table'];

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(function (instance) {
      return instance;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      abort(reason);
    });
  }

  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming === 'function' &&
        !isDataURI(wasmBinaryFile) &&
        // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
        !isFileURI(wasmBinaryFile) &&
        typeof fetch === 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);

        return result.then(
          receiveInstantiationResult,
          function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      exports = Asyncify.instrumentWasmExports(exports);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  instantiateAsync();
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  1952: function($0, $1, $2, $3) {g_problem.AddTraceEntry($0,$1,$2,$3);}
};






  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            (function() {  dynCall_v.call(null, func); })();
          } else {
            (function(a1) {  dynCall_vi.apply(null, [func, a1]); })(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function demangle(func) {
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      // Anything else is an unexpected exception and we treat it as hard error.
      var toLog = e;
      err('exception thrown: ' + toLog);
      quit_(1, e);
    }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function _abort() {
      abort();
    }

  var readAsmConstArgsArray = [];
  function readAsmConstArgs(sigPtr, buf) {
      readAsmConstArgsArray.length = 0;
      var ch;
      // Most arguments are i32s, so shift the buffer pointer so it is a plain
      // index into HEAP32.
      buf >>= 2;
      while (ch = HEAPU8[sigPtr++]) {
        // A double takes two 32-bit slots, and must also be aligned - the backend
        // will emit padding to avoid that.
        var double = ch < 105;
        if (double && (buf & 1)) buf++;
        readAsmConstArgsArray.push(double ? HEAPF64[buf++ >> 1] : HEAP32[buf]);
        ++buf;
      }
      return readAsmConstArgsArray;
    }
  function _emscripten_asm_const_int(code, sigPtr, argbuf) {
      var args = readAsmConstArgs(sigPtr, argbuf);
      return ASM_CONSTS[code].apply(null, args);
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function abortOnCannotGrowMemory(requestedSize) {
      abort('OOM');
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      abortOnCannotGrowMemory(requestedSize);
    }

  function flush_NO_FILESYSTEM() {
      // flush anything remaining in the buffers during shutdown
      if (typeof _fflush !== 'undefined') _fflush(0);
      var buffers = SYSCALLS.buffers;
      if (buffers[1].length) SYSCALLS.printChar(1, 10);
      if (buffers[2].length) SYSCALLS.printChar(2, 10);
    }
  
  var SYSCALLS = {mappings:{},buffers:[null,[],[]],printChar:function(stream, curr) {
        var buffer = SYSCALLS.buffers[stream];
        if (curr === 0 || curr === 10) {
          (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
          buffer.length = 0;
        } else {
          buffer.push(curr);
        }
      },varargs:undefined,get:function() {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },get64:function(low, high) {
        return low;
      }};
  function _fd_write(fd, iov, iovcnt, pnum) {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[(((iov)+(i*8))>>2)];
        var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
        for (var j = 0; j < len; j++) {
          SYSCALLS.printChar(fd, HEAPU8[ptr+j]);
        }
        num += len;
      }
      HEAP32[((pnum)>>2)] = num
      return 0;
    }

  function _setTempRet0(val) {
      setTempRet0(val);
    }

  function runAndAbortIfError(func) {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    }
  
  function callUserCallback(func, synchronous) {
      if (ABORT) {
        return;
      }
      // For synchronous calls, let any exceptions propagate, and don't let the runtime exit.
      if (synchronous) {
        func();
        return;
      }
      try {
        func();
      } catch (e) {
        handleException(e);
      }
    }
  
  function runtimeKeepalivePush() {
      runtimeKeepaliveCounter += 1;
    }
  
  function runtimeKeepalivePop() {
      runtimeKeepaliveCounter -= 1;
    }
  var Asyncify = {State:{Normal:0,Unwinding:1,Rewinding:2,Disabled:3},state:0,StackSize:4096,currData:null,handleSleepReturnValue:0,exportCallStack:[],callStackNameToId:{},callStackIdToName:{},callStackId:0,asyncPromiseHandlers:null,sleepCallbacks:[],getCallStackId:function(funcName) {
        var id = Asyncify.callStackNameToId[funcName];
        if (id === undefined) {
          id = Asyncify.callStackId++;
          Asyncify.callStackNameToId[funcName] = id;
          Asyncify.callStackIdToName[id] = funcName;
        }
        return id;
      },instrumentWasmExports:function(exports) {
        var ret = {};
        for (var x in exports) {
          (function(x) {
            var original = exports[x];
            if (typeof original === 'function') {
              ret[x] = function() {
                Asyncify.exportCallStack.push(x);
                try {
                  return original.apply(null, arguments);
                } finally {
                  if (!ABORT) {
                    var y = Asyncify.exportCallStack.pop();
                    assert(y === x);
                    Asyncify.maybeStopUnwind();
                  }
                }
              };
            } else {
              ret[x] = original;
            }
          })(x);
        }
        return ret;
      },maybeStopUnwind:function() {
        if (Asyncify.currData &&
            Asyncify.state === Asyncify.State.Unwinding &&
            Asyncify.exportCallStack.length === 0) {
          // We just finished unwinding.
          
          Asyncify.state = Asyncify.State.Normal;
          // Keep the runtime alive so that a re-wind can be done later.
          runAndAbortIfError(Module['_asyncify_stop_unwind']);
          if (typeof Fibers !== 'undefined') {
            Fibers.trampoline();
          }
        }
      },whenDone:function() {
        return new Promise(function(resolve, reject) {
          Asyncify.asyncPromiseHandlers = {
            resolve: resolve,
            reject: reject
          };
        });
      },allocateData:function() {
        // An asyncify data structure has three fields:
        //  0  current stack pos
        //  4  max stack pos
        //  8  id of function at bottom of the call stack (callStackIdToName[id] == name of js function)
        //
        // The Asyncify ABI only interprets the first two fields, the rest is for the runtime.
        // We also embed a stack in the same memory region here, right next to the structure.
        // This struct is also defined as asyncify_data_t in emscripten/fiber.h
        var ptr = _malloc(12 + Asyncify.StackSize);
        Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
        Asyncify.setDataRewindFunc(ptr);
        return ptr;
      },setDataHeader:function(ptr, stack, stackSize) {
        HEAP32[((ptr)>>2)] = stack;
        HEAP32[(((ptr)+(4))>>2)] = stack + stackSize;
      },setDataRewindFunc:function(ptr) {
        var bottomOfCallStack = Asyncify.exportCallStack[0];
        var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
        HEAP32[(((ptr)+(8))>>2)] = rewindId;
      },getDataRewindFunc:function(ptr) {
        var id = HEAP32[(((ptr)+(8))>>2)];
        var name = Asyncify.callStackIdToName[id];
        var func = Module['asm'][name];
        return func;
      },doRewind:function(ptr) {
        var start = Asyncify.getDataRewindFunc(ptr);
        // Once we have rewound and the stack we no longer need to artificially keep
        // the runtime alive.
        
        return start();
      },handleSleep:function(startAsync) {
        if (ABORT) return;
        if (Asyncify.state === Asyncify.State.Normal) {
          // Prepare to sleep. Call startAsync, and see what happens:
          // if the code decided to call our callback synchronously,
          // then no async operation was in fact begun, and we don't
          // need to do anything.
          var reachedCallback = false;
          var reachedAfterCallback = false;
          startAsync(function(handleSleepReturnValue) {
            if (ABORT) return;
            Asyncify.handleSleepReturnValue = handleSleepReturnValue || 0;
            reachedCallback = true;
            if (!reachedAfterCallback) {
              // We are happening synchronously, so no need for async.
              return;
            }
            Asyncify.state = Asyncify.State.Rewinding;
            runAndAbortIfError(function() { Module['_asyncify_start_rewind'](Asyncify.currData) });
            if (typeof Browser !== 'undefined' && Browser.mainLoop.func) {
              Browser.mainLoop.resume();
            }
            var asyncWasmReturnValue, isError = false;
            try {
              asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
            } catch (err) {
              asyncWasmReturnValue = err;
              isError = true;
            }
            // Track whether the return value was handled by any promise handlers.
            var handled = false;
            if (!Asyncify.currData) {
              // All asynchronous execution has finished.
              // `asyncWasmReturnValue` now contains the final
              // return value of the exported async WASM function.
              //
              // Note: `asyncWasmReturnValue` is distinct from
              // `Asyncify.handleSleepReturnValue`.
              // `Asyncify.handleSleepReturnValue` contains the return
              // value of the last C function to have executed
              // `Asyncify.handleSleep()`, where as `asyncWasmReturnValue`
              // contains the return value of the exported WASM function
              // that may have called C functions that
              // call `Asyncify.handleSleep()`.
              var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
              if (asyncPromiseHandlers) {
                Asyncify.asyncPromiseHandlers = null;
                (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
                handled = true;
              }
            }
            if (isError && !handled) {
              // If there was an error and it was not handled by now, we have no choice but to
              // rethrow that error into the global scope where it can be caught only by
              // `onerror` or `onunhandledpromiserejection`.
              throw asyncWasmReturnValue;
            }
          });
          reachedAfterCallback = true;
          if (!reachedCallback) {
            // A true async operation was begun; start a sleep.
            Asyncify.state = Asyncify.State.Unwinding;
            // TODO: reuse, don't alloc/free every sleep
            Asyncify.currData = Asyncify.allocateData();
            runAndAbortIfError(function() { Module['_asyncify_start_unwind'](Asyncify.currData) });
            if (typeof Browser !== 'undefined' && Browser.mainLoop.func) {
              Browser.mainLoop.pause();
            }
          }
        } else if (Asyncify.state === Asyncify.State.Rewinding) {
          // Stop a resume.
          Asyncify.state = Asyncify.State.Normal;
          runAndAbortIfError(Module['_asyncify_stop_rewind']);
          _free(Asyncify.currData);
          Asyncify.currData = null;
          // Call all sleep callbacks now that the sleep-resume is all done.
          Asyncify.sleepCallbacks.forEach(function(func) {
            callUserCallback(func);
          });
        } else {
          abort('invalid state: ' + Asyncify.state);
        }
        return Asyncify.handleSleepReturnValue;
      },handleAsync:function(startAsync) {
        return Asyncify.handleSleep(function(wakeUp) {
          // TODO: add error handling as a second param when handleSleep implements it.
          startAsync().then(wakeUp);
        });
      }};
var ASSERTIONS = false;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf['buffer'], buf['byteOffset'], buf['byteLength']);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


var asmLibraryArg = {
  "abort": _abort,
  "emscripten_asm_const_int": _emscripten_asm_const_int,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "fd_write": _fd_write,
  "getTempRet0": getTempRet0,
  "memory": wasmMemory,
  "setTempRet0": setTempRet0
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
  return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _RunInput = Module["_RunInput"] = function() {
  return (_RunInput = Module["_RunInput"] = Module["asm"]["RunInput"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = function() {
  return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = function() {
  return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = function() {
  return (stackRestore = Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = function() {
  return (stackAlloc = Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_set_limits = Module["_emscripten_stack_set_limits"] = function() {
  return (_emscripten_stack_set_limits = Module["_emscripten_stack_set_limits"] = Module["asm"]["emscripten_stack_set_limits"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = function() {
  return (_emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
  return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = function() {
  return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _free = Module["_free"] = function() {
  return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_ii = Module["dynCall_ii"] = function() {
  return (dynCall_ii = Module["dynCall_ii"] = Module["asm"]["dynCall_ii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiii = Module["dynCall_iiii"] = function() {
  return (dynCall_iiii = Module["dynCall_iiii"] = Module["asm"]["dynCall_iiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = function() {
  return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _asyncify_start_unwind = Module["_asyncify_start_unwind"] = function() {
  return (_asyncify_start_unwind = Module["_asyncify_start_unwind"] = Module["asm"]["asyncify_start_unwind"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _asyncify_stop_unwind = Module["_asyncify_stop_unwind"] = function() {
  return (_asyncify_stop_unwind = Module["_asyncify_stop_unwind"] = Module["asm"]["asyncify_stop_unwind"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _asyncify_start_rewind = Module["_asyncify_start_rewind"] = function() {
  return (_asyncify_start_rewind = Module["_asyncify_start_rewind"] = Module["asm"]["asyncify_start_rewind"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _asyncify_stop_rewind = Module["_asyncify_stop_rewind"] = function() {
  return (_asyncify_stop_rewind = Module["_asyncify_stop_rewind"] = Module["asm"]["asyncify_stop_rewind"]).apply(null, arguments);
};





// === Auto-generated postamble setup entry stuff ===



var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}
Module['run'] = run;

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  EXITSTATUS = status;

  if (keepRuntimeAlive()) {
  } else {
    exitRuntime();
  }

  procExit(status);
}

function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    if (Module['onExit']) Module['onExit'](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();





