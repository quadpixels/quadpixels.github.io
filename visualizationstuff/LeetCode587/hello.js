

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
  base64DecodeToExistingUint8Array(bufferView, 1024, "AGlpAGRkaWkAdmVjdG9yAHN0ZDo6ZXhjZXB0aW9uAGFsbG9jYXRvcjxUPjo6YWxsb2NhdGUoc2l6ZV90IG4pICduJyBleGNlZWRzIG1heGltdW0gc3VwcG9ydGVkIHNpemUAAAAAAACIBAAABAAAAAUAAAAGAAAAU3Q5ZXhjZXB0aW9uAAAAAHQFAAB4BAAAAAAAALQEAAABAAAABwAAAAgAAABTdDExbG9naWNfZXJyb3IAnAUAAKQEAACIBAAAAAAAAOgEAAABAAAACQAAAAgAAABTdDEybGVuZ3RoX2Vycm9yAAAAAJwFAADUBAAAtAQAAFN0OXR5cGVfaW5mbwAAAAB0BQAA9AQAAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAAJwFAAAMBQAABAUAAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAAJwFAAA8BQAAMAUAAAAAAABgBQAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABEAAAAAAAAA5AUAAAoAAAASAAAADAAAAA0AAAAOAAAAEwAAABQAAAAVAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAJwFAAC8BQAAYAUAAA==");
  base64DecodeToExistingUint8Array(bufferView, 1520, "UAlQAA==");
  base64DecodeToExistingUint8Array(bufferView, 1524, "");
  base64DecodeToExistingUint8Array(bufferView, 1784, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==");
}

  var scratchBuffer = new ArrayBuffer(16);
  var i32ScratchView = new Int32Array(scratchBuffer);
  var f32ScratchView = new Float32Array(scratchBuffer);
  var f64ScratchView = new Float64Array(scratchBuffer);
  
  function wasm2js_scratch_store_f32(value) {
    f32ScratchView[2] = value;
  }
      
  function wasm2js_scratch_load_i32(index) {
    return i32ScratchView[index];
  }
      
  function wasm2js_scratch_store_i32(index, value) {
    i32ScratchView[index] = value;
  }
      
  function wasm2js_scratch_load_f32() {
    return f32ScratchView[2];
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
 var fimport$1 = env.__cxa_allocate_exception;
 var fimport$2 = env.__cxa_throw;
 var fimport$3 = env.__cxa_atexit;
 var fimport$4 = env.abort;
 var fimport$5 = env.emscripten_resize_heap;
 var fimport$6 = env.emscripten_memcpy_big;
 var global$0 = 5245264;
 var global$1 = 0;
 var global$2 = 0;
 var global$5 = 0;
 var global$6 = 0;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0() {
  global$2 = 5245264;
  global$1 = 2384;
  fimport$3(2, 0, 1024) | 0;
  fimport$3(3, 0, 1024) | 0;
 }
 
 function $1($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $3($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2 = 0, $3_1 = 0, $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15_1 = 0, $16 = Math_fround(0), $17_1 = 0, $18 = 0, $19_1 = 0, $20_1 = 0, $21_1 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = Math_fround(0), $27 = 0, $28_1 = 0, $29 = Math_fround(0), $30 = Math_fround(0), $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35_1 = 0, $36_1 = 0, $37 = 0, $38 = 0, $39_1 = Math_fround(0), $40_1 = 0, $41_1 = 0, $42_1 = 0, $43 = 0, $44 = 0, $45 = Math_fround(0), $46_1 = 0, $47_1 = 0, $48 = 0, $49_1 = 0, $50 = 0, $51 = Math_fround(0), $52 = Math_fround(0), $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57_1 = 0, $58 = 0, $59_1 = 0, $60 = 0, $61_1 = 0, $62_1 = 0, $63_1 = 0, $64_1 = 0, $65_1 = 0, $66_1 = 0, $67_1 = 0, $68_1 = 0, $69_1 = 0, $70_1 = 0, $71_1 = 0, $72 = 0, $73_1 = 0, $74_1 = 0, $75_1 = 0, $76 = 0, $77_1 = 0, $78_1 = 0, $79_1 = 0, $80_1 = 0, $81_1 = 0, $82_1 = 0, $83_1 = 0, $84_1 = 0, $85_1 = 0, $86_1 = 0, $87_1 = 0, $88_1 = 0, $89 = 0, $90_1 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $110 = 0, $111 = 0, $112 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + -64;
   $2 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$2 >> 2];
   $10_1 = HEAP32[$2 + 4 >> 2];
   $41_1 = HEAP32[$2 + 8 >> 2];
   $36_1 = HEAP32[$2 + 12 >> 2];
   $42_1 = HEAP32[$2 + 16 >> 2];
   $47_1 = HEAP32[$2 + 20 >> 2];
   $48 = HEAP32[$2 + 24 >> 2];
   $59_1 = HEAP32[$2 + 32 >> 2];
   $60 = HEAP32[$2 + 36 >> 2];
   $61_1 = HEAP32[$2 + 40 >> 2];
   $62_1 = HEAP32[$2 + 44 >> 2];
   $63_1 = HEAP32[$2 + 48 >> 2];
   $64_1 = HEAP32[$2 + 52 >> 2];
   $65_1 = HEAP32[$2 + 56 >> 2];
   $66_1 = HEAP32[$2 + 60 >> 2];
   $17_1 = HEAP32[$2 + 28 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $34 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $10_1 = global$0 + -64 | 0;
   global$0 = $10_1;
   HEAP32[$10_1 + 48 >> 2] = 0;
   HEAP32[$10_1 + 40 >> 2] = 0;
   HEAP32[$10_1 + 44 >> 2] = 0;
   HEAP32[$10_1 + 28 >> 2] = 0;
   HEAP32[$10_1 + 32 >> 2] = 0;
   $36_1 = $10_1 + 24 | 4;
   HEAP32[$10_1 + 24 >> 2] = $36_1;
   $41_1 = 0;
  }
  label$2 : {
   if (($0_1 | 0) < 1 ? global$5 : 1) {
    while (1) {
     $42_1 = global$5 ? $42_1 : 0;
     while (1) {
      if (!global$5) {
       $47_1 = ($17() | 0) % 100 | 0;
       $48 = ($17() | 0) % 100 | 0;
       $2 = $48 + Math_imul($47_1, 1001) | 0;
       $17_1 = $36_1;
       $5 = HEAP32[$10_1 + 28 >> 2];
       if ($5) {
        while (1) {
         $3_1 = ($2 | 0) > HEAP32[$5 + 16 >> 2];
         $17_1 = $3_1 ? $17_1 : $5;
         $5 = HEAP32[($3_1 << 2) + $5 >> 2];
         if ($5) {
          continue
         }
         break;
        }
       }
       $17_1 = (($2 | 0) >= HEAP32[$17_1 + 16 >> 2] ? ($17_1 | 0) != ($36_1 | 0) : 0) ? $17_1 : $36_1;
      }
      label$19 : {
       if (!global$5) {
        if (($17_1 | 0) != ($36_1 | 0)) {
         break label$19
        }
        HEAP32[$10_1 + 16 >> 2] = 0;
        HEAP32[$10_1 + 8 >> 2] = 0;
        HEAP32[$10_1 + 12 >> 2] = 0;
        $59_1 = $10_1;
       }
       if (!(global$5 ? $34 : 0)) {
        $2 = $28(8);
        if ((global$5 | 0) == 1) {
         $5 = 0;
         break label$2;
        }
        $60 = $2;
       }
       if (!global$5) {
        $2 = $60;
        HEAP32[$59_1 + 8 >> 2] = $2;
        HEAP32[$10_1 + 12 >> 2] = $2;
        $17_1 = $2 + 8 | 0;
        HEAP32[$10_1 + 16 >> 2] = $17_1;
        HEAP32[$2 >> 2] = $47_1;
        HEAP32[$2 + 4 >> 2] = $48;
        HEAP32[$10_1 + 12 >> 2] = $17_1;
       }
       label$27 : {
        if (!global$5) {
         $2 = HEAP32[$10_1 + 44 >> 2];
         if ($2 >>> 0 < HEAPU32[$10_1 + 48 >> 2]) {
          HEAP32[$2 + 8 >> 2] = 0;
          HEAP32[$2 >> 2] = 0;
          HEAP32[$2 + 4 >> 2] = 0;
          HEAP32[$2 >> 2] = HEAP32[$10_1 + 8 >> 2];
          HEAP32[$2 + 4 >> 2] = HEAP32[$10_1 + 12 >> 2];
          HEAP32[$2 + 8 >> 2] = HEAP32[$10_1 + 16 >> 2];
          HEAP32[$10_1 + 16 >> 2] = 0;
          HEAP32[$10_1 + 8 >> 2] = 0;
          HEAP32[$10_1 + 12 >> 2] = 0;
          HEAP32[$10_1 + 44 >> 2] = $2 + 12;
          break label$27;
         }
         $62_1 = $10_1 + 8 | 0;
         $61_1 = $10_1 + 40 | 0;
        }
        if (global$5 ? ($34 | 0) == 1 : 1) {
         $5 = $61_1;
         $6_1 = $62_1;
         $13 = 0;
         $3_1 = 0;
         $23 = 0;
         $32 = 0;
         $33 = 0;
         $28_1 = 0;
         if ((global$5 | 0) == 2) {
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 28;
          $2 = HEAP32[global$6 >> 2];
          $5 = HEAP32[$2 >> 2];
          $6_1 = HEAP32[$2 + 4 >> 2];
          $23 = HEAP32[$2 + 8 >> 2];
          $28_1 = HEAP32[$2 + 12 >> 2];
          $32 = HEAP32[$2 + 16 >> 2];
          $13 = HEAP32[$2 + 24 >> 2];
          $3_1 = HEAP32[$2 + 20 >> 2];
         }
         if ((global$5 | 0) == 2) {
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
          $33 = HEAP32[HEAP32[global$6 >> 2] >> 2];
         }
         __inlined_func$4 : {
          label$20 : {
           label$8 : {
            label$9 : {
             if (!global$5) {
              $23 = HEAP32[$5 >> 2];
              $28_1 = (HEAP32[$5 + 4 >> 2] - $23 | 0) / 12 | 0;
              $2 = $28_1 + 1 | 0;
              if ($2 >>> 0 >= 357913942) {
               break label$9
              }
              $23 = (HEAP32[$5 + 8 >> 2] - $23 | 0) / 12 | 0;
              $4 = $23 << 1;
              $2 = $23 >>> 0 < 178956970 ? ($2 >>> 0 > $4 >>> 0 ? $2 : $4) : 357913941;
              if ($2 >>> 0 >= 357913942) {
               break label$8
              }
              $23 = Math_imul($2, 12);
              $32 = $23;
             }
             if (!(global$5 ? $33 : 0)) {
              $2 = $28($32);
              if ((global$5 | 0) == 1) {
               $2 = 0;
               break label$20;
              }
              $3_1 = $2;
             }
             if (!global$5) {
              $13 = $3_1 + Math_imul($28_1, 12) | 0;
              HEAP32[$13 + 8 >> 2] = 0;
              HEAP32[$13 >> 2] = 0;
              HEAP32[$13 + 4 >> 2] = 0;
              HEAP32[$13 >> 2] = HEAP32[$6_1 >> 2];
              HEAP32[$13 + 4 >> 2] = HEAP32[$6_1 + 4 >> 2];
              HEAP32[$13 + 8 >> 2] = HEAP32[$6_1 + 8 >> 2];
              HEAP32[$6_1 + 8 >> 2] = 0;
              HEAP32[$6_1 >> 2] = 0;
              HEAP32[$6_1 + 4 >> 2] = 0;
              $2 = $13 + 12 | 0;
              $6_1 = HEAP32[$5 + 4 >> 2];
              $4 = HEAP32[$5 >> 2];
              if (($6_1 | 0) != ($4 | 0)) {
               while (1) {
                $13 = $13 - 12 | 0;
                HEAP32[$13 + 8 >> 2] = 0;
                HEAP32[$13 >> 2] = 0;
                HEAP32[$13 + 4 >> 2] = 0;
                $6_1 = $6_1 - 12 | 0;
                HEAP32[$13 >> 2] = HEAP32[$6_1 >> 2];
                HEAP32[$13 + 4 >> 2] = HEAP32[$6_1 + 4 >> 2];
                HEAP32[$13 + 8 >> 2] = HEAP32[$6_1 + 8 >> 2];
                HEAP32[$6_1 + 8 >> 2] = 0;
                HEAP32[$6_1 >> 2] = 0;
                HEAP32[$6_1 + 4 >> 2] = 0;
                if (($4 | 0) != ($6_1 | 0)) {
                 continue
                }
                break;
               }
              }
              HEAP32[$5 + 8 >> 2] = $3_1 + $23;
              $3_1 = HEAP32[$5 >> 2];
              HEAP32[$5 >> 2] = $13;
              $13 = HEAP32[$5 + 4 >> 2];
              HEAP32[$5 + 4 >> 2] = $2;
              if (($3_1 | 0) != ($13 | 0)) {
               while (1) {
                $2 = $13 - 12 | 0;
                $6_1 = HEAP32[$2 >> 2];
                if ($6_1) {
                 HEAP32[$13 - 8 >> 2] = $6_1;
                 $71($6_1);
                }
                $13 = $2;
                if (($3_1 | 0) != ($2 | 0)) {
                 continue
                }
                break;
               }
              }
              if ($3_1) {
               $71($3_1)
              }
              break __inlined_func$4;
             }
            }
            $13 = global$5 ? $13 : $5;
            if (global$5 ? ($33 | 0) == 1 : 1) {
             $36();
             if ((global$5 | 0) == 1) {
              $2 = 1;
              break label$20;
             }
            }
            if (!global$5) {
             abort()
            }
           }
           if (global$5 ? ($33 | 0) == 2 : 1) {
            $9(1055);
            if ((global$5 | 0) == 1) {
             $2 = 2;
             break label$20;
            }
           }
           if (!global$5) {
            abort()
           }
           break __inlined_func$4;
          }
          HEAP32[HEAP32[global$6 >> 2] >> 2] = $2;
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
          $2 = HEAP32[global$6 >> 2];
          HEAP32[$2 >> 2] = $5;
          HEAP32[$2 + 4 >> 2] = $6_1;
          HEAP32[$2 + 8 >> 2] = $23;
          HEAP32[$2 + 12 >> 2] = $28_1;
          HEAP32[$2 + 16 >> 2] = $32;
          HEAP32[$2 + 20 >> 2] = $3_1;
          HEAP32[$2 + 24 >> 2] = $13;
          HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 28;
         }
         if ((global$5 | 0) == 1) {
          $5 = 1;
          break label$2;
         }
        }
       }
       if (!global$5) {
        $2 = HEAP32[$10_1 + 8 >> 2];
        if ($2) {
         HEAP32[$10_1 + 12 >> 2] = $2;
         $71($2);
        }
        $42_1 = 1;
       }
      }
      if (!($42_1 & 1 ? 1 : global$5)) {
       continue
      }
      break;
     };
     if (!global$5) {
      $41_1 = $41_1 + 1 | 0;
      if (($41_1 | 0) != ($0_1 | 0)) {
       continue
      }
     }
     break;
    }
   }
   if (!global$5) {
    fimport$0(1524, 1024, 0) | 0;
    $17_1 = HEAP32[$10_1 + 44 >> 2];
    $5 = HEAP32[$10_1 + 40 >> 2];
    if (($17_1 | 0) != ($5 | 0)) {
     while (1) {
      $2 = HEAP32[$5 >> 2];
      $3_1 = HEAP32[$2 + 4 >> 2];
      HEAP32[$10_1 >> 2] = HEAP32[$2 >> 2];
      HEAP32[$10_1 + 4 >> 2] = $3_1;
      fimport$0(1541, 1025, $10_1 | 0) | 0;
      $5 = $5 + 12 | 0;
      if (($5 | 0) != ($17_1 | 0)) {
       continue
      }
      break;
     }
    }
    fimport$0(1568, 1024, 0) | 0;
    $64_1 = $10_1 + 56 | 0;
    $65_1 = $10_1 + 40 | 0;
    $63_1 = $10_1 + 8 | 0;
   }
   if (global$5 ? ($34 | 0) == 2 : 1) {
    $24 = $63_1;
    $5 = $64_1;
    $13 = $65_1;
    $4 = 0;
    $2 = 0;
    $3_1 = 0;
    $6_1 = 0;
    $23 = 0;
    $32 = 0;
    $33 = 0;
    $28_1 = 0;
    $34 = 0;
    if ((global$5 | 0) == 2) {
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 304;
     $5 = HEAP32[global$6 >> 2];
     $24 = HEAP32[$5 >> 2];
     $13 = HEAP32[$5 + 8 >> 2];
     $4 = HEAP32[$5 + 12 >> 2];
     $2 = HEAP32[$5 + 16 >> 2];
     $19_1 = HEAP32[$5 + 20 >> 2];
     $3_1 = HEAP32[$5 + 24 >> 2];
     $6_1 = HEAP32[$5 + 28 >> 2];
     $9_1 = HEAP32[$5 + 32 >> 2];
     $11 = HEAP32[$5 + 36 >> 2];
     $12 = HEAP32[$5 + 40 >> 2];
     $21_1 = HEAP32[$5 + 44 >> 2];
     $18 = HEAP32[$5 + 48 >> 2];
     $25 = HEAP32[$5 + 52 >> 2];
     $67_1 = HEAP32[$5 + 56 >> 2];
     $68_1 = HEAP32[$5 + 60 >> 2];
     $69_1 = HEAP32[$5 + 64 >> 2];
     $49_1 = HEAP32[$5 + 68 >> 2];
     $50 = HEAP32[$5 + 72 >> 2];
     $43 = HEAP32[$5 + 76 >> 2];
     $44 = HEAP32[$5 + 80 >> 2];
     $37 = HEAP32[$5 + 84 >> 2];
     $38 = HEAP32[$5 + 88 >> 2];
     $29 = HEAPF32[$5 + 92 >> 2];
     $30 = HEAPF32[$5 + 96 >> 2];
     $51 = HEAPF32[$5 + 100 >> 2];
     $39_1 = HEAPF32[$5 + 104 >> 2];
     $16 = HEAPF32[$5 + 108 >> 2];
     $52 = HEAPF32[$5 + 112 >> 2];
     $70_1 = HEAP32[$5 + 116 >> 2];
     $71_1 = HEAP32[$5 + 120 >> 2];
     $72 = HEAP32[$5 + 124 >> 2];
     $73_1 = HEAP32[$5 + 128 >> 2];
     $74_1 = HEAP32[$5 + 132 >> 2];
     $75_1 = HEAP32[$5 + 136 >> 2];
     $76 = HEAP32[$5 + 140 >> 2];
     $77_1 = HEAP32[$5 + 144 >> 2];
     $78_1 = HEAP32[$5 + 148 >> 2];
     $110 = HEAP32[$5 + 152 >> 2];
     $79_1 = HEAP32[$5 + 156 >> 2];
     $80_1 = HEAP32[$5 + 160 >> 2];
     $81_1 = HEAP32[$5 + 164 >> 2];
     $82_1 = HEAP32[$5 + 168 >> 2];
     $111 = HEAP32[$5 + 172 >> 2];
     $83_1 = HEAP32[$5 + 176 >> 2];
     $84_1 = HEAP32[$5 + 180 >> 2];
     $23 = HEAP32[$5 + 184 >> 2];
     $85_1 = HEAP32[$5 + 188 >> 2];
     $86_1 = HEAP32[$5 + 192 >> 2];
     $87_1 = HEAP32[$5 + 196 >> 2];
     $88_1 = HEAP32[$5 + 200 >> 2];
     $89 = HEAP32[$5 + 204 >> 2];
     $32 = HEAP32[$5 + 208 >> 2];
     $90_1 = HEAP32[$5 + 212 >> 2];
     $91 = HEAP32[$5 + 216 >> 2];
     $92 = HEAP32[$5 + 220 >> 2];
     $93 = HEAP32[$5 + 224 >> 2];
     $94 = HEAP32[$5 + 228 >> 2];
     $95 = HEAP32[$5 + 232 >> 2];
     $33 = HEAP32[$5 + 236 >> 2];
     $96 = HEAP32[$5 + 240 >> 2];
     $97 = HEAP32[$5 + 244 >> 2];
     $98 = HEAP32[$5 + 248 >> 2];
     $99 = HEAP32[$5 + 252 >> 2];
     $100 = HEAP32[$5 + 256 >> 2];
     $28_1 = HEAP32[$5 + 260 >> 2];
     $101 = HEAP32[$5 + 264 >> 2];
     $102 = HEAP32[$5 + 268 >> 2];
     $34 = HEAP32[$5 + 272 >> 2];
     $103 = HEAP32[$5 + 276 >> 2];
     $104 = HEAP32[$5 + 280 >> 2];
     $105 = HEAP32[$5 + 284 >> 2];
     $106 = HEAP32[$5 + 288 >> 2];
     $107 = HEAP32[$5 + 292 >> 2];
     $108 = HEAP32[$5 + 296 >> 2];
     $109 = HEAP32[$5 + 300 >> 2];
     $5 = HEAP32[$5 + 4 >> 2];
    }
    if ((global$5 | 0) == 2) {
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
     $14_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
    }
    if (!global$5) {
     $4 = global$0 - 224 | 0;
     global$0 = $4;
     HEAP32[$4 + 216 >> 2] = 0;
     HEAP32[$4 + 208 >> 2] = 0;
     HEAP32[$4 + 212 >> 2] = 0;
    }
    __inlined_func$5 : {
     label$22 : {
      label$83 : {
       label$94 : {
        label$10 : {
         label$115 : {
          label$12 : {
           if (!global$5) {
            $2 = HEAP32[$13 >> 2];
            $19_1 = HEAP32[$13 + 4 >> 2];
            if (($2 | 0) == ($19_1 | 0)) {
             break label$12
            }
           }
           while (1) {
            if (!global$5) {
             $3_1 = HEAP32[$2 >> 2];
             $6_1 = HEAP32[$3_1 + 4 >> 2];
             $9_1 = HEAP32[$3_1 >> 2];
            }
            label$166 : {
             if (!global$5) {
              $3_1 = HEAP32[$4 + 212 >> 2];
              $11 = HEAP32[$4 + 216 >> 2];
              if (($3_1 | 0) != ($11 | 0)) {
               HEAP32[$3_1 >> 2] = $9_1;
               HEAP32[$3_1 + 4 >> 2] = $6_1;
               HEAP32[$4 + 212 >> 2] = $3_1 + 8;
               break label$166;
              }
              $12 = HEAP32[$4 + 208 >> 2];
              $21_1 = $3_1 - $12 | 0;
              $18 = $21_1 >> 3;
              $3_1 = $18 + 1 | 0;
              if ($3_1 >>> 0 >= 536870912) {
               break label$10
              }
             }
             label$197 : {
              if (!global$5) {
               $1_1 = $11 - $12 | 0;
               $25 = $1_1 >> 2;
               $11 = $1_1 >> 3 >>> 0 < 268435455 ? ($3_1 >>> 0 > $25 >>> 0 ? $3_1 : $25) : 536870911;
               $1_1 = 0;
               if (!$11) {
                break label$197
               }
               if ($11 >>> 0 >= 536870912) {
                break label$115
               }
               $70_1 = $11 << 3;
              }
              $7_1 = $3_1;
              if (!(global$5 ? $14_1 : 0)) {
               $1_1 = $28($70_1);
               if ((global$5 | 0) == 1) {
                $1_1 = 0;
                break label$22;
               }
               $71_1 = $1_1;
              }
              $1_1 = global$5 ? $7_1 : $71_1;
             }
             $3_1 = $1_1;
             if (!global$5) {
              $18 = ($18 << 3) + $3_1 | 0;
              $1_1 = $18;
              HEAP32[$1_1 >> 2] = $9_1;
              HEAP32[$1_1 + 4 >> 2] = $6_1;
              $6_1 = ($11 << 3) + $3_1 | 0;
              $9_1 = $1_1 + 8 | 0;
              if (($21_1 | 0) >= 1) {
               $74($3_1, $12, $21_1)
              }
              HEAP32[$4 + 216 >> 2] = $6_1;
              HEAP32[$4 + 212 >> 2] = $9_1;
              HEAP32[$4 + 208 >> 2] = $3_1;
              if (!$12) {
               break label$166
              }
              $71($12);
             }
            }
            if (!global$5) {
             $2 = $2 + 12 | 0;
             if (($19_1 | 0) != ($2 | 0)) {
              continue
             }
            }
            break;
           };
          }
          label$31 : {
           label$32 : {
            label$33 : {
             if (!global$5) {
              if ((HEAP32[$4 + 212 >> 2] - HEAP32[$4 + 208 >> 2] | 0) != 8) {
               break label$33
              }
              HEAP32[$24 + 8 >> 2] = 0;
              HEAP32[$24 >> 2] = 0;
              HEAP32[$24 + 4 >> 2] = 0;
              $12 = HEAP32[$13 + 4 >> 2];
              $3_1 = HEAP32[$13 >> 2];
              $2 = $12 - $3_1 | 0;
              $6_1 = ($2 | 0) / 12 | 0;
              if (!$2) {
               break label$83
              }
              if ($6_1 >>> 0 >= 357913942) {
               break label$31
              }
              $73_1 = $2;
              $72 = $24;
             }
             if (global$5 ? ($14_1 | 0) == 1 : 1) {
              $1_1 = $28($73_1);
              if ((global$5 | 0) == 1) {
               $1_1 = 1;
               break label$22;
              }
              $74_1 = $1_1;
             }
             if (!global$5) {
              $2 = $74_1;
              HEAP32[$72 >> 2] = $2;
              HEAP32[$24 + 4 >> 2] = $2;
              HEAP32[$24 + 8 >> 2] = Math_imul($6_1, 12) + $2;
             }
             if (($3_1 | 0) == ($12 | 0) ? global$5 : 1) {
              while (1) {
               if (!global$5) {
                HEAP32[$2 + 8 >> 2] = 0;
                HEAP32[$2 >> 2] = 0;
                HEAP32[$2 + 4 >> 2] = 0;
               }
               label$45 : {
                if (!global$5) {
                 $9_1 = HEAP32[$3_1 + 4 >> 2] - HEAP32[$3_1 >> 2] | 0;
                 if (!$9_1) {
                  break label$45
                 }
                 if (($9_1 | 0) <= -1) {
                  break label$32
                 }
                 $76 = $9_1;
                 $75_1 = $2;
                }
                if (global$5 ? ($14_1 | 0) == 2 : 1) {
                 $1_1 = $28($76);
                 if ((global$5 | 0) == 1) {
                  $1_1 = 2;
                  break label$22;
                 }
                 $77_1 = $1_1;
                }
                if (!global$5) {
                 $6_1 = $77_1;
                 HEAP32[$75_1 >> 2] = $6_1;
                 HEAP32[$2 + 4 >> 2] = $6_1;
                 HEAP32[$2 + 8 >> 2] = ($9_1 >> 2 << 2) + $6_1;
                 $11 = HEAP32[$3_1 >> 2];
                 $9_1 = HEAP32[$3_1 + 4 >> 2] - $11 | 0;
                 if (($9_1 | 0) >= 1) {
                  $6_1 = $74($6_1, $11, $9_1) + $9_1 | 0
                 }
                 HEAP32[$2 + 4 >> 2] = $6_1;
                }
               }
               if (!global$5) {
                $2 = $2 + 12 | 0;
                $3_1 = $3_1 + 12 | 0;
                if (($12 | 0) != ($3_1 | 0)) {
                 continue
                }
               }
               break;
              }
             }
             if (!global$5) {
              HEAP32[$24 + 4 >> 2] = $2;
              break label$83;
             }
            }
            if (!global$5) {
             $78_1 = $4 + 192 | 0;
             $79_1 = $4 + 208 | 0;
             $110 = $5;
            }
            if (global$5 ? ($14_1 | 0) == 3 : 1) {
             $7($78_1, $79_1, Math_fround(-1.0), Math_fround(0.0));
             if ((global$5 | 0) == 1) {
              $1_1 = 3;
              break label$22;
             }
            }
            if (!global$5) {
             HEAP32[$4 + 184 >> 2] = 0;
             HEAP32[$4 + 176 >> 2] = 0;
             HEAP32[$4 + 180 >> 2] = 0;
             $2 = 0;
            }
            label$62 : {
             label$63 : {
              label$64 : {
               if (!global$5) {
                $3_1 = HEAP32[$4 + 192 >> 2];
                if (($3_1 | 0) == HEAP32[$4 + 196 >> 2]) {
                 break label$64
                }
               }
               while (1) {
                $6_1 = global$5 ? $6_1 : HEAP32[$4 + 208 >> 2] + (HEAP32[($2 << 2) + $3_1 >> 2] << 3) | 0;
                label$68 : {
                 if (!global$5) {
                  $3_1 = HEAP32[$4 + 180 >> 2];
                  $12 = HEAP32[$4 + 184 >> 2];
                  if (($3_1 | 0) != ($12 | 0)) {
                   $1_1 = HEAP32[$6_1 + 4 >> 2];
                   HEAP32[$3_1 >> 2] = HEAP32[$6_1 >> 2];
                   HEAP32[$3_1 + 4 >> 2] = $1_1;
                   HEAP32[$4 + 180 >> 2] = $3_1 + 8;
                   break label$68;
                  }
                  $9_1 = HEAP32[$4 + 176 >> 2];
                  $11 = $3_1 - $9_1 | 0;
                  $19_1 = $11 >> 3;
                  $3_1 = $19_1 + 1 | 0;
                  if ($3_1 >>> 0 >= 536870912) {
                   break label$62
                  }
                 }
                 label$71 : {
                  if (!global$5) {
                   $1_1 = $12 - $9_1 | 0;
                   $21_1 = $1_1 >> 2;
                   $12 = $1_1 >> 3 >>> 0 < 268435455 ? ($3_1 >>> 0 > $21_1 >>> 0 ? $3_1 : $21_1) : 536870911;
                   $1_1 = 0;
                   if (!$12) {
                    break label$71
                   }
                   if ($12 >>> 0 >= 536870912) {
                    break label$63
                   }
                   $80_1 = $12 << 3;
                  }
                  $7_1 = $3_1;
                  if (global$5 ? ($14_1 | 0) == 4 : 1) {
                   $1_1 = $28($80_1);
                   if ((global$5 | 0) == 1) {
                    $1_1 = 4;
                    break label$22;
                   }
                   $81_1 = $1_1;
                  }
                  $1_1 = global$5 ? $7_1 : $81_1;
                 }
                 $3_1 = $1_1;
                 if (!global$5) {
                  $8 = HEAP32[$6_1 + 4 >> 2];
                  $19_1 = ($19_1 << 3) + $3_1 | 0;
                  $1_1 = $19_1;
                  HEAP32[$1_1 >> 2] = HEAP32[$6_1 >> 2];
                  HEAP32[$1_1 + 4 >> 2] = $8;
                  $6_1 = ($12 << 3) + $3_1 | 0;
                  $12 = $1_1 + 8 | 0;
                  if (($11 | 0) >= 1) {
                   $74($3_1, $9_1, $11)
                  }
                  HEAP32[$4 + 184 >> 2] = $6_1;
                  HEAP32[$4 + 180 >> 2] = $12;
                  HEAP32[$4 + 176 >> 2] = $3_1;
                  if (!$9_1) {
                   break label$68
                  }
                  $71($9_1);
                 }
                }
                if (!global$5) {
                 $2 = $2 + 1 | 0;
                 $3_1 = HEAP32[$4 + 192 >> 2];
                 if ($2 >>> 0 < HEAP32[$4 + 196 >> 2] - $3_1 >> 2 >>> 0) {
                  continue
                 }
                }
                break;
               };
              }
              if (!global$5) {
               $82_1 = $4 + 160 | 0;
               $83_1 = $4 + 176 | 0;
               $111 = $5;
              }
              if (global$5 ? ($14_1 | 0) == 5 : 1) {
               $7($82_1, $83_1, Math_fround(0.0), Math_fround(-1.0));
               if ((global$5 | 0) == 1) {
                $1_1 = 5;
                break label$22;
               }
              }
              if (!global$5) {
               $1_1 = HEAP32[$4 + 176 >> 2] + (HEAP32[HEAP32[$4 + 160 >> 2] >> 2] << 3) | 0;
               $37 = HEAP32[$1_1 >> 2];
               $38 = HEAP32[$1_1 + 4 >> 2];
               HEAP32[$4 + 152 >> 2] = 0;
               HEAP32[$4 + 144 >> 2] = 0;
               HEAP32[$4 + 148 >> 2] = 0;
              }
              if (global$5 ? ($14_1 | 0) == 6 : 1) {
               $1_1 = $28(8);
               if ((global$5 | 0) == 1) {
                $1_1 = 6;
                break label$22;
               }
               $84_1 = $1_1;
              }
              if (!global$5) {
               $2 = $84_1;
               HEAP32[$2 >> 2] = $37;
               HEAP32[$2 + 4 >> 2] = $38;
               $3_1 = $2 + 8 | 0;
               HEAP32[$4 + 152 >> 2] = $3_1;
               HEAP32[$4 + 148 >> 2] = $3_1;
               HEAP32[$4 + 144 >> 2] = $2;
               $67_1 = $4 + 96 | 4;
               $13 = $4 + 128 | 4;
               $29 = Math_fround(1.0);
               $68_1 = $4 + 52 | 0;
               $69_1 = $4 + 48 | 0;
               $49_1 = $37;
               $25 = $37;
               $30 = Math_fround(0.0);
               $50 = $38;
               $5 = $38;
              }
              while (1) {
               if (!global$5) {
                HEAP32[$4 + 132 >> 2] = 0;
                HEAP32[$4 + 136 >> 2] = 0;
                HEAP32[$4 + 128 >> 2] = $13;
                $51 = Math_fround(Math_sqrt(Math_fround(Math_fround($29 * $29) + Math_fround($30 * $30))));
                $39_1 = Math_fround(100000002004087734272.0);
                $9_1 = 0;
               }
               label$97 : {
                if (!global$5) {
                 $2 = HEAP32[$4 + 208 >> 2];
                 if (($2 | 0) == HEAP32[$4 + 212 >> 2]) {
                  break label$97
                 }
                }
                label$99 : {
                 while (1) {
                  label$100 : {
                   label$103 : {
                    if (!global$5) {
                     $12 = $9_1 << 3;
                     $2 = $12 + $2 | 0;
                     $3_1 = HEAP32[$2 >> 2];
                     if (HEAP32[$2 + 4 >> 2] == ($5 | 0) ? ($3_1 | 0) == ($25 | 0) : 0) {
                      break label$103
                     }
                     $16 = Math_fround($3_1 - $25 | 0);
                     $26 = Math_fround(HEAP32[$2 + 4 >> 2] - $5 | 0);
                     $45 = $14(Math_fround(Math_fround(Math_fround($30 * $16) + Math_fround($29 * $26)) / Math_fround($51 * Math_fround(Math_sqrt(Math_fround(Math_fround($16 * $16) + Math_fround($26 * $26)))))));
                     $16 = Math_fround(Math_fround($30 * $26) - Math_fround($29 * $16)) > Math_fround(0.0) ? Math_fround(6.283185307179586 - +$45) : $45;
                     $3_1 = $13;
                     label$106 : {
                      $2 = HEAP32[$4 + 132 >> 2];
                      if (!$2) {
                       $2 = $13;
                       $3_1 = $2;
                       break label$106;
                      }
                      while (1) {
                       $26 = HEAPF32[$2 + 16 >> 2];
                       if ($16 < $26) {
                        if (HEAP32[$2 >> 2]) {
                         $3_1 = $2;
                         $2 = HEAP32[$2 >> 2];
                         continue;
                        }
                        $3_1 = $2;
                        break label$106;
                       }
                       if (!($16 > $26)) {
                        break label$106
                       }
                       $3_1 = $2 + 4 | 0;
                       if (!HEAP32[$2 + 4 >> 2]) {
                        break label$106
                       }
                       $2 = HEAP32[$3_1 >> 2];
                       continue;
                      };
                     }
                     $11 = $16 < $39_1;
                    }
                    label$112 : {
                     if (!global$5) {
                      $6_1 = HEAP32[$3_1 >> 2];
                      if ($6_1) {
                       break label$112
                      }
                     }
                     if (global$5 ? ($14_1 | 0) == 7 : 1) {
                      $1_1 = $28(32);
                      if ((global$5 | 0) == 1) {
                       $1_1 = 7;
                       break label$22;
                      }
                      $23 = $1_1;
                     }
                     if (!global$5) {
                      $6_1 = $23;
                      HEAPF32[$6_1 + 16 >> 2] = $16;
                      HEAP32[$6_1 + 8 >> 2] = $2;
                      HEAP32[$6_1 >> 2] = 0;
                      HEAP32[$6_1 + 4 >> 2] = 0;
                      HEAP32[$6_1 + 28 >> 2] = 0;
                      $1_1 = $6_1 + 20 | 0;
                      HEAP32[$1_1 >> 2] = 0;
                      HEAP32[$1_1 + 4 >> 2] = 0;
                      HEAP32[$3_1 >> 2] = $6_1;
                      if (HEAP32[HEAP32[$4 + 128 >> 2] >> 2]) {
                       HEAP32[$4 + 128 >> 2] = HEAP32[HEAP32[$4 + 128 >> 2] >> 2]
                      }
                      $1_1 = HEAP32[$3_1 >> 2];
                      $20_1 = HEAP32[$4 + 132 >> 2];
                      $8 = ($20_1 | 0) == ($1_1 | 0);
                      HEAP8[$1_1 + 12 | 0] = $8;
                      label$1 : {
                       if ($8) {
                        break label$1
                       }
                       while (1) {
                        $7_1 = HEAP32[$1_1 + 8 >> 2];
                        if (HEAPU8[$7_1 + 12 | 0]) {
                         break label$1
                        }
                        $8 = HEAP32[HEAP32[$7_1 + 8 >> 2] >> 2];
                        label$3 : {
                         if (($7_1 | 0) == ($8 | 0)) {
                          $8 = HEAP32[$7_1 + 8 >> 2];
                          $27 = HEAP32[$8 + 4 >> 2];
                          if (!(!$27 | HEAPU8[$27 + 12 | 0])) {
                           HEAP8[$7_1 + 12 | 0] = 1;
                           HEAP8[$8 + 12 | 0] = ($8 | 0) == ($20_1 | 0);
                           HEAP8[$27 + 12 | 0] = 1;
                           $1_1 = $8;
                           break label$3;
                          }
                          if (($1_1 | 0) != HEAP32[HEAP32[$1_1 + 8 >> 2] >> 2]) {
                           $1_1 = HEAP32[$7_1 + 4 >> 2];
                           $8 = HEAP32[$1_1 >> 2];
                           HEAP32[$7_1 + 4 >> 2] = $8;
                           if ($8) {
                            HEAP32[$8 + 8 >> 2] = $7_1
                           }
                           HEAP32[$1_1 + 8 >> 2] = HEAP32[$7_1 + 8 >> 2];
                           $8 = HEAP32[$7_1 + 8 >> 2];
                           if (HEAP32[$8 >> 2] != ($7_1 | 0)) {
                            $8 = HEAP32[$7_1 + 8 >> 2] + 4 | 0
                           }
                           HEAP32[$8 >> 2] = $1_1;
                           HEAP32[$1_1 >> 2] = $7_1;
                           HEAP32[$7_1 + 8 >> 2] = $1_1;
                           $1_1 = $7_1;
                          }
                          $1_1 = HEAP32[$1_1 + 8 >> 2];
                          HEAP8[$1_1 + 12 | 0] = 1;
                          $1_1 = HEAP32[$1_1 + 8 >> 2];
                          HEAP8[$1_1 + 12 | 0] = 0;
                          $8 = HEAP32[$1_1 >> 2];
                          $7_1 = HEAP32[$8 + 4 >> 2];
                          HEAP32[$1_1 >> 2] = $7_1;
                          if ($7_1) {
                           HEAP32[$7_1 + 8 >> 2] = $1_1
                          }
                          HEAP32[$8 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
                          $7_1 = HEAP32[$1_1 + 8 >> 2];
                          if (HEAP32[$7_1 >> 2] != ($1_1 | 0)) {
                           $7_1 = HEAP32[$1_1 + 8 >> 2] + 4 | 0
                          }
                          HEAP32[$7_1 >> 2] = $8;
                          HEAP32[$8 + 4 >> 2] = $1_1;
                          HEAP32[$1_1 + 8 >> 2] = $8;
                          break label$1;
                         }
                         label$114 : {
                          if (!(HEAPU8[$8 + 12 | 0] | !$8)) {
                           HEAP8[$7_1 + 12 | 0] = 1;
                           $1_1 = HEAP32[$7_1 + 8 >> 2];
                           HEAP8[$1_1 + 12 | 0] = ($1_1 | 0) == ($20_1 | 0);
                           HEAP8[$8 + 12 | 0] = 1;
                           $7_1 = 1;
                           break label$114;
                          }
                          if (($1_1 | 0) == HEAP32[HEAP32[$1_1 + 8 >> 2] >> 2]) {
                           $1_1 = HEAP32[$7_1 >> 2];
                           $8 = HEAP32[$1_1 + 4 >> 2];
                           HEAP32[$7_1 >> 2] = $8;
                           if ($8) {
                            HEAP32[$8 + 8 >> 2] = $7_1
                           }
                           HEAP32[$1_1 + 8 >> 2] = HEAP32[$7_1 + 8 >> 2];
                           $8 = HEAP32[$7_1 + 8 >> 2];
                           if (HEAP32[$8 >> 2] != ($7_1 | 0)) {
                            $8 = HEAP32[$7_1 + 8 >> 2] + 4 | 0
                           }
                           HEAP32[$8 >> 2] = $1_1;
                           HEAP32[$1_1 + 4 >> 2] = $7_1;
                           HEAP32[$7_1 + 8 >> 2] = $1_1;
                           $1_1 = $7_1;
                          }
                          $1_1 = HEAP32[$1_1 + 8 >> 2];
                          HEAP8[$1_1 + 12 | 0] = 1;
                          $1_1 = HEAP32[$1_1 + 8 >> 2];
                          HEAP8[$1_1 + 12 | 0] = 0;
                          $8 = HEAP32[$1_1 + 4 >> 2];
                          $7_1 = HEAP32[$8 >> 2];
                          HEAP32[$1_1 + 4 >> 2] = $7_1;
                          if ($7_1) {
                           HEAP32[$7_1 + 8 >> 2] = $1_1
                          }
                          HEAP32[$8 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
                          $7_1 = HEAP32[$1_1 + 8 >> 2];
                          if (($1_1 | 0) != HEAP32[$7_1 >> 2]) {
                           $7_1 = HEAP32[$1_1 + 8 >> 2] + 4 | 0
                          }
                          HEAP32[$7_1 >> 2] = $8;
                          HEAP32[$8 >> 2] = $1_1;
                          HEAP32[$1_1 + 8 >> 2] = $8;
                          $7_1 = 0;
                         }
                         if (!$7_1) {
                          break label$1
                         }
                        }
                        if (($1_1 | 0) != ($20_1 | 0)) {
                         continue
                        }
                        break;
                       };
                      }
                      HEAP32[$4 + 136 >> 2] = HEAP32[$4 + 136 >> 2] + 1;
                     }
                    }
                    if (!global$5) {
                     $39_1 = $11 ? $16 : $39_1;
                     $3_1 = HEAP32[$4 + 208 >> 2] + $12 | 0;
                     $2 = HEAP32[$6_1 + 24 >> 2];
                     $11 = HEAP32[$6_1 + 28 >> 2];
                     if (($2 | 0) != ($11 | 0)) {
                      $1_1 = HEAP32[$3_1 + 4 >> 2];
                      HEAP32[$2 >> 2] = HEAP32[$3_1 >> 2];
                      HEAP32[$2 + 4 >> 2] = $1_1;
                      HEAP32[$6_1 + 24 >> 2] = $2 + 8;
                      break label$103;
                     }
                     $18 = $6_1 + 20 | 0;
                     $12 = HEAP32[$18 >> 2];
                     $19_1 = $2 - $12 | 0;
                     $21_1 = $19_1 >> 3;
                     $2 = $21_1 + 1 | 0;
                     if ($2 >>> 0 >= 536870912) {
                      break label$100
                     }
                    }
                    label$123 : {
                     if (!global$5) {
                      $1_1 = $11 - $12 | 0;
                      $18 = $1_1 >> 2;
                      $11 = $1_1 >> 3 >>> 0 < 268435455 ? ($2 >>> 0 > $18 >>> 0 ? $2 : $18) : 536870911;
                      $1_1 = 0;
                      if (!$11) {
                       break label$123
                      }
                      if ($11 >>> 0 >= 536870912) {
                       break label$99
                      }
                      $85_1 = $11 << 3;
                     }
                     $7_1 = $2;
                     if (global$5 ? ($14_1 | 0) == 8 : 1) {
                      $1_1 = $28($85_1);
                      if ((global$5 | 0) == 1) {
                       $1_1 = 8;
                       break label$22;
                      }
                      $86_1 = $1_1;
                     }
                     $1_1 = global$5 ? $7_1 : $86_1;
                    }
                    $2 = $1_1;
                    if (!global$5) {
                     $8 = HEAP32[$3_1 + 4 >> 2];
                     $21_1 = ($21_1 << 3) + $2 | 0;
                     $1_1 = $21_1;
                     HEAP32[$1_1 >> 2] = HEAP32[$3_1 >> 2];
                     HEAP32[$1_1 + 4 >> 2] = $8;
                     $3_1 = ($11 << 3) + $2 | 0;
                     $11 = $1_1 + 8 | 0;
                     if (($19_1 | 0) >= 1) {
                      $74($2, $12, $19_1)
                     }
                     HEAP32[$6_1 + 28 >> 2] = $3_1;
                     HEAP32[$6_1 + 24 >> 2] = $11;
                     HEAP32[$6_1 + 20 >> 2] = $2;
                     if (!$12) {
                      break label$103
                     }
                     $71($12);
                    }
                   }
                   if (!global$5) {
                    $9_1 = $9_1 + 1 | 0;
                    $2 = HEAP32[$4 + 208 >> 2];
                    if ($9_1 >>> 0 >= HEAP32[$4 + 212 >> 2] - $2 >> 3 >>> 0) {
                     break label$97
                    }
                    continue;
                   }
                  }
                  break;
                 };
                 $87_1 = global$5 ? $87_1 : $18;
                 if (global$5 ? ($14_1 | 0) == 9 : 1) {
                  $36();
                  if ((global$5 | 0) == 1) {
                   $1_1 = 9;
                   break label$22;
                  }
                 }
                 if (!global$5) {
                  abort()
                 }
                }
                if (global$5 ? ($14_1 | 0) == 10 : 1) {
                 $9(1055);
                 if ((global$5 | 0) == 1) {
                  $1_1 = 10;
                  break label$22;
                 }
                }
                if (!global$5) {
                 abort()
                }
               }
               if (!global$5) {
                HEAP32[$4 + 120 >> 2] = 0;
                HEAP32[$4 + 112 >> 2] = 0;
                HEAP32[$4 + 116 >> 2] = 0;
               }
               label$147 : {
                if (!global$5) {
                 $3_1 = HEAP32[$4 + 128 >> 2];
                 if (($3_1 | 0) == ($13 | 0)) {
                  break label$147
                 }
                }
                while (1) {
                 if (!global$5) {
                  $16 = HEAPF32[$3_1 + 16 >> 2];
                  HEAP32[$4 + 108 >> 2] = 0;
                  HEAP32[$4 + 100 >> 2] = 0;
                  HEAP32[$4 + 104 >> 2] = 0;
                  HEAPF32[$4 + 96 >> 2] = $16;
                  $18 = $3_1;
                 }
                 label$151 : {
                  label$152 : {
                   label$153 : {
                    label$154 : {
                     label$155 : {
                      if (!global$5) {
                       $3_1 = HEAP32[$18 + 24 >> 2] - HEAP32[$18 + 20 >> 2] | 0;
                       if (!$3_1) {
                        break label$155
                       }
                       if (($3_1 | 0) <= -1) {
                        break label$154
                       }
                       $89 = $3_1;
                       $88_1 = $4;
                      }
                      if (global$5 ? ($14_1 | 0) == 11 : 1) {
                       $1_1 = $28($89);
                       if ((global$5 | 0) == 1) {
                        $1_1 = 11;
                        break label$22;
                       }
                       $32 = $1_1;
                      }
                      if (!global$5) {
                       $2 = $32;
                       HEAP32[$88_1 + 100 >> 2] = $2;
                       HEAP32[$4 + 104 >> 2] = $2;
                       HEAP32[$4 + 108 >> 2] = ($3_1 >> 3 << 3) + $2;
                       $6_1 = HEAP32[$18 + 20 >> 2];
                       $3_1 = HEAP32[$18 + 24 >> 2] - $6_1 | 0;
                       if (($3_1 | 0) >= 1) {
                        $2 = $74($2, $6_1, $3_1) + $3_1 | 0
                       }
                       HEAP32[$4 + 104 >> 2] = $2;
                      }
                     }
                     if (!global$5) {
                      $2 = HEAP32[$4 + 100 >> 2];
                      $12 = HEAP32[$4 + 104 >> 2];
                      if (($2 | 0) == ($12 | 0)) {
                       break label$151
                      }
                     }
                     while (1) {
                      label$167 : {
                       if (!global$5) {
                        $3_1 = HEAP32[$4 + 116 >> 2];
                        $9_1 = HEAP32[$4 + 120 >> 2];
                        if (($3_1 | 0) != ($9_1 | 0)) {
                         $1_1 = HEAP32[$2 + 4 >> 2];
                         HEAP32[$3_1 >> 2] = HEAP32[$2 >> 2];
                         HEAP32[$3_1 + 4 >> 2] = $1_1;
                         HEAP32[$4 + 116 >> 2] = $3_1 + 8;
                         break label$167;
                        }
                        $6_1 = HEAP32[$4 + 112 >> 2];
                        $11 = $3_1 - $6_1 | 0;
                        $19_1 = $11 >> 3;
                        $3_1 = $19_1 + 1 | 0;
                        if ($3_1 >>> 0 >= 536870912) {
                         break label$153
                        }
                       }
                       label$170 : {
                        if (!global$5) {
                         $9_1 = $9_1 - $6_1 | 0;
                         $21_1 = $9_1 >> 2;
                         $9_1 = $9_1 >> 3 >>> 0 < 268435455 ? ($3_1 >>> 0 > $21_1 >>> 0 ? $3_1 : $21_1) : 536870911;
                         $1_1 = 0;
                         if (!$9_1) {
                          break label$170
                         }
                         if ($9_1 >>> 0 >= 536870912) {
                          break label$152
                         }
                         $90_1 = $9_1 << 3;
                        }
                        $7_1 = $3_1;
                        if (global$5 ? ($14_1 | 0) == 12 : 1) {
                         $1_1 = $28($90_1);
                         if ((global$5 | 0) == 1) {
                          $1_1 = 12;
                          break label$22;
                         }
                         $91 = $1_1;
                        }
                        $1_1 = global$5 ? $7_1 : $91;
                       }
                       $3_1 = $1_1;
                       if (!global$5) {
                        $8 = HEAP32[$2 + 4 >> 2];
                        $1_1 = ($19_1 << 3) + $3_1 | 0;
                        HEAP32[$1_1 >> 2] = HEAP32[$2 >> 2];
                        HEAP32[$1_1 + 4 >> 2] = $8;
                        $9_1 = ($9_1 << 3) + $3_1 | 0;
                        $19_1 = $1_1 + 8 | 0;
                        if (($11 | 0) >= 1) {
                         $74($3_1, $6_1, $11)
                        }
                        HEAP32[$4 + 120 >> 2] = $9_1;
                        HEAP32[$4 + 116 >> 2] = $19_1;
                        HEAP32[$4 + 112 >> 2] = $3_1;
                        if (!$6_1) {
                         break label$167
                        }
                        $71($6_1);
                       }
                      }
                      if (!global$5) {
                       $2 = $2 + 8 | 0;
                       if (($12 | 0) == ($2 | 0)) {
                        break label$151
                       }
                       continue;
                      }
                      break;
                     };
                    }
                    $92 = global$5 ? $92 : $67_1;
                    if (global$5 ? ($14_1 | 0) == 13 : 1) {
                     $36();
                     if ((global$5 | 0) == 1) {
                      $1_1 = 13;
                      break label$22;
                     }
                    }
                    if (!global$5) {
                     abort()
                    }
                   }
                   $93 = global$5 ? $93 : $4 + 112 | 0;
                   if (global$5 ? ($14_1 | 0) == 14 : 1) {
                    $36();
                    if ((global$5 | 0) == 1) {
                     $1_1 = 14;
                     break label$22;
                    }
                   }
                   if (!global$5) {
                    abort()
                   }
                  }
                  if (global$5 ? ($14_1 | 0) == 15 : 1) {
                   $9(1055);
                   if ((global$5 | 0) == 1) {
                    $1_1 = 15;
                    break label$22;
                   }
                  }
                  if (!global$5) {
                   abort()
                  }
                 }
                 if (!global$5) {
                  $2 = HEAP32[$4 + 100 >> 2];
                  if ($2) {
                   HEAP32[$4 + 104 >> 2] = $2;
                   $71($2);
                  }
                  $2 = HEAP32[$18 + 4 >> 2];
                  label$2018 : {
                   if (!$2) {
                    $3_1 = HEAP32[$18 + 8 >> 2];
                    if (HEAP32[$3_1 >> 2] == ($18 | 0)) {
                     break label$2018
                    }
                    $6_1 = $18 + 8 | 0;
                    while (1) {
                     $2 = HEAP32[$6_1 >> 2];
                     $6_1 = $2 + 8 | 0;
                     $3_1 = HEAP32[$2 + 8 >> 2];
                     if (HEAP32[$3_1 >> 2] != ($2 | 0)) {
                      continue
                     }
                     break;
                    };
                    break label$2018;
                   }
                   while (1) {
                    $3_1 = $2;
                    $2 = HEAP32[$2 >> 2];
                    if ($2) {
                     continue
                    }
                    break;
                   };
                  }
                  if (($3_1 | 0) != ($13 | 0)) {
                   continue
                  }
                 }
                 break;
                };
               }
               if (!global$5) {
                HEAP32[$4 + 88 >> 2] = 0;
                HEAP32[$4 + 80 >> 2] = 0;
                HEAP32[$4 + 84 >> 2] = 0;
               }
               label$207 : {
                label$208 : {
                 label$209 : {
                  label$210 : {
                   label$211 : {
                    label$212 : {
                     if (!global$5) {
                      $6_1 = HEAP32[$4 + 112 >> 2];
                      $2 = HEAP32[$4 + 116 >> 2] - $6_1 | 0;
                      if (!$2) {
                       break label$212
                      }
                      if (($2 | 0) <= -1) {
                       break label$211
                      }
                      $95 = $2;
                      $94 = $4;
                     }
                     if (global$5 ? ($14_1 | 0) == 16 : 1) {
                      $1_1 = $28($95);
                      if ((global$5 | 0) == 1) {
                       $1_1 = 16;
                       break label$22;
                      }
                      $33 = $1_1;
                     }
                     if (!global$5) {
                      $3_1 = $33;
                      HEAP32[$94 + 80 >> 2] = $3_1;
                      HEAP32[$4 + 84 >> 2] = $3_1;
                      $9_1 = ($2 >> 3 << 3) + $3_1 | 0;
                      HEAP32[$4 + 88 >> 2] = $9_1;
                      $74($3_1, $6_1, $2);
                      HEAP32[$4 + 84 >> 2] = $9_1;
                     }
                    }
                    if (!global$5) {
                     fimport$0(1665, 1024, 0) | 0;
                     $2 = HEAP32[$4 + 84 >> 2] - HEAP32[$4 + 80 >> 2] | 0;
                     if (($2 | 0) >= 1) {
                      $2 = $2 >> 3;
                      while (1) {
                       $3_1 = $2 - 1 | 0;
                       $6_1 = HEAP32[$4 + 80 >> 2] + ($3_1 << 3) | 0;
                       $1_1 = HEAP32[$6_1 + 4 >> 2];
                       HEAP32[$4 + 64 >> 2] = HEAP32[$6_1 >> 2];
                       HEAP32[$4 + 68 >> 2] = $1_1;
                       fimport$0(1689, 1025, $4 - -64 | 0) | 0;
                       $6_1 = ($2 | 0) > 1;
                       $2 = $3_1;
                       if ($6_1) {
                        continue
                       }
                       break;
                      };
                     }
                     fimport$0(1725, 1024, 0) | 0;
                     $2 = HEAP32[$4 + 80 >> 2];
                     if ($2) {
                      HEAP32[$4 + 84 >> 2] = $2;
                      $71($2);
                     }
                     HEAP32[$68_1 >> 2] = $5;
                     HEAP32[$69_1 >> 2] = $25;
                     HEAPF64[$4 + 40 >> 3] = $29;
                     HEAPF64[$4 + 32 >> 3] = $30;
                     fimport$0(1623, 1028, $4 + 32 | 0) | 0;
                     $2 = 0;
                     $1_1 = $2;
                     if (+$39_1 >= 3.1405926535897932) {
                      break label$207
                     }
                     $3_1 = HEAP32[$4 + 208 >> 2];
                     if (($3_1 | 0) == HEAP32[$4 + 212 >> 2]) {
                      break label$208
                     }
                     $52 = Math_fround(-100000002004087734272.0);
                    }
                    while (1) {
                     label$226 : {
                      if (!global$5) {
                       $9_1 = $2 << 3;
                       $3_1 = $9_1 + $3_1 | 0;
                       $6_1 = HEAP32[$3_1 >> 2];
                       if (HEAP32[$3_1 + 4 >> 2] == ($5 | 0) ? ($6_1 | 0) == ($25 | 0) : 0) {
                        break label$226
                       }
                       $16 = Math_fround($6_1 - $25 | 0);
                       $12 = HEAP32[$3_1 + 4 >> 2];
                       $26 = Math_fround($12 - $5 | 0);
                       $45 = $14(Math_fround(Math_fround(Math_fround($30 * $16) + Math_fround($29 * $26)) / Math_fround($51 * Math_fround(Math_sqrt(Math_fround(Math_fround($16 * $16) + Math_fround($26 * $26)))))));
                       if (!(+Math_fround(Math_abs(Math_fround((Math_fround(Math_fround($30 * $26) - Math_fround($29 * $16)) > Math_fround(0.0) ? Math_fround(6.283185307179586 - +$45) : $45) - $39_1))) < .001)) {
                        break label$226
                       }
                      }
                      label$229 : {
                       if (!global$5) {
                        if (($12 | 0) == ($50 | 0) ? ($6_1 | 0) == ($49_1 | 0) : 0) {
                         break label$229
                        }
                        $6_1 = HEAP32[$4 + 148 >> 2];
                        $11 = HEAP32[$4 + 152 >> 2];
                        if (($6_1 | 0) != ($11 | 0)) {
                         $1_1 = HEAP32[$3_1 + 4 >> 2];
                         HEAP32[$6_1 >> 2] = HEAP32[$3_1 >> 2];
                         HEAP32[$6_1 + 4 >> 2] = $1_1;
                         HEAP32[$4 + 148 >> 2] = $6_1 + 8;
                         break label$229;
                        }
                        $12 = HEAP32[$4 + 144 >> 2];
                        $19_1 = $6_1 - $12 | 0;
                        $21_1 = $19_1 >> 3;
                        $6_1 = $21_1 + 1 | 0;
                        if ($6_1 >>> 0 >= 536870912) {
                         break label$210
                        }
                       }
                       label$233 : {
                        if (!global$5) {
                         $1_1 = $11 - $12 | 0;
                         $18 = $1_1 >> 2;
                         $11 = $1_1 >> 3 >>> 0 < 268435455 ? ($6_1 >>> 0 > $18 >>> 0 ? $6_1 : $18) : 536870911;
                         $1_1 = 0;
                         if (!$11) {
                          break label$233
                         }
                         if ($11 >>> 0 >= 536870912) {
                          break label$209
                         }
                         $96 = $11 << 3;
                        }
                        $7_1 = $6_1;
                        if (global$5 ? ($14_1 | 0) == 17 : 1) {
                         $1_1 = $28($96);
                         if ((global$5 | 0) == 1) {
                          $1_1 = 17;
                          break label$22;
                         }
                         $97 = $1_1;
                        }
                        $1_1 = global$5 ? $7_1 : $97;
                       }
                       $6_1 = $1_1;
                       if (!global$5) {
                        $8 = HEAP32[$3_1 + 4 >> 2];
                        $21_1 = ($21_1 << 3) + $6_1 | 0;
                        $1_1 = $21_1;
                        HEAP32[$1_1 >> 2] = HEAP32[$3_1 >> 2];
                        HEAP32[$1_1 + 4 >> 2] = $8;
                        $3_1 = ($11 << 3) + $6_1 | 0;
                        $11 = $1_1 + 8 | 0;
                        if (($19_1 | 0) >= 1) {
                         $74($6_1, $12, $19_1)
                        }
                        HEAP32[$4 + 152 >> 2] = $3_1;
                        HEAP32[$4 + 148 >> 2] = $11;
                        HEAP32[$4 + 144 >> 2] = $6_1;
                        if (!$12) {
                         break label$229
                        }
                        $71($12);
                       }
                      }
                      if (!global$5) {
                       $3_1 = HEAP32[$4 + 208 >> 2] + $9_1 | 0;
                       $6_1 = HEAP32[$3_1 >> 2];
                       $16 = Math_fround($6_1 - $25 | 0);
                       $26 = Math_fround($16 * $16);
                       $3_1 = HEAP32[$3_1 + 4 >> 2];
                       $16 = Math_fround($3_1 - $5 | 0);
                       $16 = Math_fround($26 + Math_fround($16 * $16));
                       if (!($52 < $16)) {
                        break label$226
                       }
                       $52 = $16;
                       $44 = $6_1;
                       $43 = $3_1;
                      }
                     }
                     if (!global$5) {
                      $2 = $2 + 1 | 0;
                      $3_1 = HEAP32[$4 + 208 >> 2];
                      if ($2 >>> 0 < HEAP32[$4 + 212 >> 2] - $3_1 >> 3 >>> 0) {
                       continue
                      }
                      break label$208;
                     }
                     break;
                    };
                   }
                   $98 = global$5 ? $98 : $4 + 80 | 0;
                   if (global$5 ? ($14_1 | 0) == 18 : 1) {
                    $36();
                    if ((global$5 | 0) == 1) {
                     $1_1 = 18;
                     break label$22;
                    }
                   }
                   if (!global$5) {
                    abort()
                   }
                  }
                  $99 = global$5 ? $99 : $4 + 144 | 0;
                  if (global$5 ? ($14_1 | 0) == 19 : 1) {
                   $36();
                   if ((global$5 | 0) == 1) {
                    $1_1 = 19;
                    break label$22;
                   }
                  }
                  if (!global$5) {
                   abort()
                  }
                 }
                 if (global$5 ? ($14_1 | 0) == 20 : 1) {
                  $9(1055);
                  if ((global$5 | 0) == 1) {
                   $1_1 = 20;
                   break label$22;
                  }
                 }
                 if (!global$5) {
                  abort()
                 }
                }
                if (!global$5) {
                 if (($44 | 0) == ($49_1 | 0)) {
                  $1_1 = 0;
                  if (($43 | 0) == ($50 | 0)) {
                   break label$207
                  }
                 }
                 $29 = Math_fround($43 - $5 | 0);
                 $30 = Math_fround($44 - $25 | 0);
                 $25 = $44;
                 $5 = $43;
                 $2 = 1;
                }
                $1_1 = $2;
               }
               $2 = $1_1;
               if (!global$5) {
                $3_1 = HEAP32[$4 + 112 >> 2];
                if ($3_1) {
                 HEAP32[$4 + 116 >> 2] = $3_1;
                 $71($3_1);
                }
                $10($4 + 128 | 0, HEAP32[$4 + 132 >> 2]);
                if ($2) {
                 continue
                }
               }
               break;
              };
              if (!global$5) {
               HEAP32[$4 + 104 >> 2] = 0;
               HEAP32[$4 + 96 >> 2] = 0;
               HEAP32[$4 + 100 >> 2] = 0;
               $3_1 = HEAP32[$4 + 144 >> 2];
               $12 = HEAP32[$4 + 148 >> 2];
               if (($3_1 | 0) == ($12 | 0)) {
                break label$94
               }
              }
              while (1) {
               label$268 : {
                if (!global$5) {
                 $37 = HEAP32[$3_1 >> 2];
                 $38 = HEAP32[$3_1 + 4 >> 2];
                 HEAP32[$4 + 136 >> 2] = 0;
                 HEAP32[$4 + 128 >> 2] = 0;
                 HEAP32[$4 + 132 >> 2] = 0;
                 $100 = $4;
                }
                if (global$5 ? ($14_1 | 0) == 21 : 1) {
                 $1_1 = $28(8);
                 if ((global$5 | 0) == 1) {
                  $1_1 = 21;
                  break label$22;
                 }
                 $28_1 = $1_1;
                }
                if (!global$5) {
                 $2 = $28_1;
                 HEAP32[$100 + 128 >> 2] = $2;
                 HEAP32[$4 + 132 >> 2] = $2;
                 $6_1 = $2 + 8 | 0;
                 HEAP32[$4 + 136 >> 2] = $6_1;
                 HEAP32[$2 >> 2] = $37;
                 HEAP32[$2 + 4 >> 2] = $38;
                 HEAP32[$4 + 132 >> 2] = $6_1;
                }
                label$278 : {
                 label$279 : {
                  if (!global$5) {
                   $2 = HEAP32[$4 + 100 >> 2];
                   if (($2 | 0) == HEAP32[$4 + 104 >> 2]) {
                    break label$279
                   }
                   HEAP32[$2 + 8 >> 2] = 0;
                   HEAP32[$2 >> 2] = 0;
                   HEAP32[$2 + 4 >> 2] = 0;
                  }
                  label$281 : {
                   if (!global$5) {
                    $9_1 = HEAP32[$4 + 132 >> 2] - HEAP32[$4 + 128 >> 2] | 0;
                    if (!$9_1) {
                     break label$281
                    }
                    if (($9_1 | 0) <= -1) {
                     break label$268
                    }
                    $102 = $9_1;
                    $101 = $2;
                   }
                   if (global$5 ? ($14_1 | 0) == 22 : 1) {
                    $1_1 = $28($102);
                    if ((global$5 | 0) == 1) {
                     $1_1 = 22;
                     break label$22;
                    }
                    $34 = $1_1;
                   }
                   if (!global$5) {
                    $6_1 = $34;
                    HEAP32[$101 >> 2] = $6_1;
                    HEAP32[$2 + 4 >> 2] = $6_1;
                    HEAP32[$2 + 8 >> 2] = ($9_1 >> 2 << 2) + $6_1;
                    $11 = HEAP32[$4 + 128 >> 2];
                    $9_1 = HEAP32[$4 + 132 >> 2] - $11 | 0;
                    if (($9_1 | 0) >= 1) {
                     $6_1 = $74($6_1, $11, $9_1) + $9_1 | 0
                    }
                    HEAP32[$2 + 4 >> 2] = $6_1;
                   }
                  }
                  if (!global$5) {
                   HEAP32[$4 + 100 >> 2] = $2 + 12;
                   break label$278;
                  }
                 }
                 if (!global$5) {
                  $104 = $4 + 128 | 0;
                  $103 = $4 + 96 | 0;
                 }
                 if (global$5 ? ($14_1 | 0) == 23 : 1) {
                  $20_1 = $103;
                  $1_1 = $104;
                  $7_1 = 0;
                  $22 = 0;
                  $8 = 0;
                  $31 = 0;
                  $27 = 0;
                  $40_1 = 0;
                  $35_1 = 0;
                  $53 = 0;
                  $54 = 0;
                  $46_1 = 0;
                  $55 = 0;
                  $56 = 0;
                  $57_1 = 0;
                  $58 = 0;
                  if ((global$5 | 0) == 2) {
                   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 60;
                   $1_1 = HEAP32[global$6 >> 2];
                   $20_1 = HEAP32[$1_1 >> 2];
                   $31 = HEAP32[$1_1 + 8 >> 2];
                   $27 = HEAP32[$1_1 + 12 >> 2];
                   $7_1 = HEAP32[$1_1 + 16 >> 2];
                   $22 = HEAP32[$1_1 + 20 >> 2];
                   $35_1 = HEAP32[$1_1 + 24 >> 2];
                   $46_1 = HEAP32[$1_1 + 28 >> 2];
                   $53 = HEAP32[$1_1 + 32 >> 2];
                   $55 = HEAP32[$1_1 + 36 >> 2];
                   $56 = HEAP32[$1_1 + 40 >> 2];
                   $54 = HEAP32[$1_1 + 44 >> 2];
                   $8 = HEAP32[$1_1 + 48 >> 2];
                   $57_1 = HEAP32[$1_1 + 52 >> 2];
                   $58 = HEAP32[$1_1 + 56 >> 2];
                   $1_1 = HEAP32[$1_1 + 4 >> 2];
                  }
                  if ((global$5 | 0) == 2) {
                   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
                   $40_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
                  }
                  __inlined_func$11 : {
                   label$213 : {
                    label$814 : {
                     label$915 : {
                      label$1016 : {
                       if (!global$5) {
                        $31 = HEAP32[$20_1 >> 2];
                        $27 = (HEAP32[$20_1 + 4 >> 2] - $31 | 0) / 12 | 0;
                        $7_1 = $27 + 1 | 0;
                        if ($7_1 >>> 0 >= 357913942) {
                         break label$1016
                        }
                        $22 = 0;
                       }
                       label$1217 : {
                        if (!global$5) {
                         $15_1 = (HEAP32[$20_1 + 8 >> 2] - $31 | 0) / 12 | 0;
                         $35_1 = $15_1 << 1;
                         $31 = $15_1 >>> 0 < 178956970 ? ($7_1 >>> 0 > $35_1 >>> 0 ? $7_1 : $35_1) : 357913941;
                         if (!$31) {
                          break label$1217
                         }
                         if ($31 >>> 0 >= 357913942) {
                          break label$915
                         }
                         $53 = Math_imul($31, 12);
                        }
                        $112 = $22;
                        if (!(global$5 ? $40_1 : 0)) {
                         $15_1 = $28($53);
                         if ((global$5 | 0) == 1) {
                          $15_1 = 0;
                          break label$213;
                         }
                         $55 = $15_1;
                        }
                        $22 = global$5 ? $112 : $55;
                       }
                       if (!global$5) {
                        $7_1 = Math_imul($27, 12) + $22 | 0;
                        HEAP32[$7_1 + 8 >> 2] = 0;
                        HEAP32[$7_1 >> 2] = 0;
                        HEAP32[$7_1 + 4 >> 2] = 0;
                       }
                       label$21 : {
                        if (!global$5) {
                         $35_1 = HEAP32[$1_1 >> 2];
                         $1_1 = HEAP32[$1_1 + 4 >> 2] - $35_1 | 0;
                         if (!$1_1) {
                          break label$21
                         }
                         if (($1_1 | 0) <= -1) {
                          break label$814
                         }
                         $46_1 = $7_1 + 4 | 0;
                         $56 = $46_1;
                         $54 = $1_1;
                        }
                        if (global$5 ? ($40_1 | 0) == 1 : 1) {
                         $15_1 = $28($54);
                         if ((global$5 | 0) == 1) {
                          $15_1 = 1;
                          break label$213;
                         } else {
                          $8 = $15_1
                         }
                        }
                        if (!global$5) {
                         $27 = $8;
                         HEAP32[$56 >> 2] = $8;
                         HEAP32[$7_1 >> 2] = $8;
                         $15_1 = ($1_1 >> 2 << 2) + $8 | 0;
                         HEAP32[$7_1 + 8 >> 2] = $15_1;
                         $74($8, $35_1, $1_1);
                         HEAP32[$46_1 >> 2] = $15_1;
                        }
                       }
                       if (!global$5) {
                        $1_1 = Math_imul($31, 12) + $22 | 0;
                        $27 = $7_1 + 12 | 0;
                        $22 = HEAP32[$20_1 + 4 >> 2];
                        $8 = HEAP32[$20_1 >> 2];
                        if (($22 | 0) != ($8 | 0)) {
                         while (1) {
                          $7_1 = $7_1 - 12 | 0;
                          HEAP32[$7_1 + 8 >> 2] = 0;
                          HEAP32[$7_1 >> 2] = 0;
                          HEAP32[$7_1 + 4 >> 2] = 0;
                          $22 = $22 - 12 | 0;
                          HEAP32[$7_1 >> 2] = HEAP32[$22 >> 2];
                          HEAP32[$7_1 + 4 >> 2] = HEAP32[$22 + 4 >> 2];
                          HEAP32[$7_1 + 8 >> 2] = HEAP32[$22 + 8 >> 2];
                          HEAP32[$22 + 8 >> 2] = 0;
                          HEAP32[$22 >> 2] = 0;
                          HEAP32[$22 + 4 >> 2] = 0;
                          if (($8 | 0) != ($22 | 0)) {
                           continue
                          }
                          break;
                         }
                        }
                        HEAP32[$20_1 + 8 >> 2] = $1_1;
                        $8 = HEAP32[$20_1 >> 2];
                        HEAP32[$20_1 >> 2] = $7_1;
                        $7_1 = HEAP32[$20_1 + 4 >> 2];
                        HEAP32[$20_1 + 4 >> 2] = $27;
                        if (($7_1 | 0) != ($8 | 0)) {
                         while (1) {
                          $1_1 = $7_1 - 12 | 0;
                          $20_1 = HEAP32[$1_1 >> 2];
                          if ($20_1) {
                           HEAP32[$7_1 - 8 >> 2] = $20_1;
                           $71($20_1);
                          }
                          $7_1 = $1_1;
                          if (($8 | 0) != ($1_1 | 0)) {
                           continue
                          }
                          break;
                         }
                        }
                        if ($8) {
                         $71($8)
                        }
                        break __inlined_func$11;
                       }
                      }
                      $57_1 = global$5 ? $57_1 : $20_1;
                      if (global$5 ? ($40_1 | 0) == 2 : 1) {
                       $36();
                       if ((global$5 | 0) == 1) {
                        $15_1 = 2;
                        break label$213;
                       }
                      }
                      if (!global$5) {
                       abort()
                      }
                     }
                     if (global$5 ? ($40_1 | 0) == 3 : 1) {
                      $9(1055);
                      if ((global$5 | 0) == 1) {
                       $15_1 = 3;
                       break label$213;
                      }
                     }
                     if (!global$5) {
                      abort()
                     }
                    }
                    $58 = global$5 ? $58 : $7_1;
                    if (global$5 ? ($40_1 | 0) == 4 : 1) {
                     $36();
                     if ((global$5 | 0) == 1) {
                      $15_1 = 4;
                      break label$213;
                     }
                    }
                    if (!global$5) {
                     abort()
                    }
                    break __inlined_func$11;
                   }
                   HEAP32[HEAP32[global$6 >> 2] >> 2] = $15_1;
                   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
                   $15_1 = HEAP32[global$6 >> 2];
                   HEAP32[$15_1 >> 2] = $20_1;
                   HEAP32[$15_1 + 4 >> 2] = $1_1;
                   HEAP32[$15_1 + 8 >> 2] = $31;
                   HEAP32[$15_1 + 12 >> 2] = $27;
                   HEAP32[$15_1 + 16 >> 2] = $7_1;
                   HEAP32[$15_1 + 20 >> 2] = $22;
                   HEAP32[$15_1 + 24 >> 2] = $35_1;
                   HEAP32[$15_1 + 28 >> 2] = $46_1;
                   HEAP32[$15_1 + 32 >> 2] = $53;
                   HEAP32[$15_1 + 36 >> 2] = $55;
                   HEAP32[$15_1 + 40 >> 2] = $56;
                   HEAP32[$15_1 + 44 >> 2] = $54;
                   HEAP32[$15_1 + 48 >> 2] = $8;
                   HEAP32[$15_1 + 52 >> 2] = $57_1;
                   HEAP32[$15_1 + 56 >> 2] = $58;
                   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 60;
                  }
                  if ((global$5 | 0) == 1) {
                   $1_1 = 23;
                   break label$22;
                  }
                 }
                }
                if (!global$5) {
                 $2 = HEAP32[$4 + 128 >> 2];
                 if ($2) {
                  HEAP32[$4 + 132 >> 2] = $2;
                  $71($2);
                 }
                 $3_1 = $3_1 + 8 | 0;
                 if (($12 | 0) != ($3_1 | 0)) {
                  continue
                 }
                 break label$94;
                }
               }
               break;
              };
              $105 = global$5 ? $105 : $2;
              if (global$5 ? ($14_1 | 0) == 24 : 1) {
               $36();
               if ((global$5 | 0) == 1) {
                $1_1 = 24;
                break label$22;
               }
              }
              if (!global$5) {
               abort()
              }
             }
             if (global$5 ? ($14_1 | 0) == 25 : 1) {
              $9(1055);
              if ((global$5 | 0) == 1) {
               $1_1 = 25;
               break label$22;
              }
             }
             if (!global$5) {
              abort()
             }
            }
            $106 = global$5 ? $106 : $4 + 176 | 0;
            if (global$5 ? ($14_1 | 0) == 26 : 1) {
             $36();
             if ((global$5 | 0) == 1) {
              $1_1 = 26;
              break label$22;
             }
            }
            if (!global$5) {
             abort()
            }
           }
           $107 = global$5 ? $107 : $2;
           if (global$5 ? ($14_1 | 0) == 27 : 1) {
            $36();
            if ((global$5 | 0) == 1) {
             $1_1 = 27;
             break label$22;
            }
           }
           if (!global$5) {
            abort()
           }
          }
          $108 = global$5 ? $108 : $24;
          if (global$5 ? ($14_1 | 0) == 28 : 1) {
           $36();
           if ((global$5 | 0) == 1) {
            $1_1 = 28;
            break label$22;
           }
          }
          if (!global$5) {
           abort()
          }
         }
         if (global$5 ? ($14_1 | 0) == 29 : 1) {
          $9(1055);
          if ((global$5 | 0) == 1) {
           $1_1 = 29;
           break label$22;
          }
         }
         if (!global$5) {
          abort()
         }
        }
        $109 = global$5 ? $109 : $4 + 208 | 0;
        if (global$5 ? ($14_1 | 0) == 30 : 1) {
         $36();
         if ((global$5 | 0) == 1) {
          $1_1 = 30;
          break label$22;
         }
        }
        if (!global$5) {
         abort()
        }
       }
       if (!global$5) {
        fimport$0(1665, 1024, 0) | 0;
        fimport$0(1725, 1024, 0) | 0;
        $3_1 = HEAP32[$4 + 144 >> 2];
        $2 = HEAP32[$3_1 + 4 >> 2];
        $3_1 = HEAP32[$3_1 >> 2];
        HEAP32[$4 + 16 >> 2] = $3_1;
        HEAP32[$4 + 20 >> 2] = $2;
        HEAPF64[$4 >> 3] = Math_fround($3_1 - $25 | 0);
        HEAPF64[$4 + 8 >> 3] = Math_fround($2 - $5 | 0);
        fimport$0(1623, 1028, $4 | 0) | 0;
        HEAP32[$24 + 8 >> 2] = 0;
        HEAP32[$24 >> 2] = 0;
        HEAP32[$24 + 4 >> 2] = 0;
        HEAP32[$24 >> 2] = HEAP32[$4 + 96 >> 2];
        HEAP32[$24 + 4 >> 2] = HEAP32[$4 + 100 >> 2];
        HEAP32[$24 + 8 >> 2] = HEAP32[$4 + 104 >> 2];
        $2 = HEAP32[$4 + 144 >> 2];
        if ($2) {
         HEAP32[$4 + 148 >> 2] = $2;
         $71($2);
        }
        $2 = HEAP32[$4 + 160 >> 2];
        if ($2) {
         HEAP32[$4 + 164 >> 2] = $2;
         $71($2);
        }
        $2 = HEAP32[$4 + 176 >> 2];
        if ($2) {
         HEAP32[$4 + 180 >> 2] = $2;
         $71($2);
        }
        $2 = HEAP32[$4 + 192 >> 2];
        if (!$2) {
         break label$83
        }
        HEAP32[$4 + 196 >> 2] = $2;
        $71($2);
       }
      }
      if (!global$5) {
       $2 = HEAP32[$4 + 208 >> 2];
       if ($2) {
        HEAP32[$4 + 212 >> 2] = $2;
        $71($2);
       }
       global$0 = $4 + 224 | 0;
      }
      break __inlined_func$5;
     }
     HEAP32[HEAP32[global$6 >> 2] >> 2] = $1_1;
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
     $1_1 = HEAP32[global$6 >> 2];
     HEAP32[$1_1 >> 2] = $24;
     HEAP32[$1_1 + 4 >> 2] = $5;
     HEAP32[$1_1 + 8 >> 2] = $13;
     HEAP32[$1_1 + 12 >> 2] = $4;
     HEAP32[$1_1 + 16 >> 2] = $2;
     HEAP32[$1_1 + 20 >> 2] = $19_1;
     HEAP32[$1_1 + 24 >> 2] = $3_1;
     HEAP32[$1_1 + 28 >> 2] = $6_1;
     HEAP32[$1_1 + 32 >> 2] = $9_1;
     HEAP32[$1_1 + 36 >> 2] = $11;
     HEAP32[$1_1 + 40 >> 2] = $12;
     HEAP32[$1_1 + 44 >> 2] = $21_1;
     HEAP32[$1_1 + 48 >> 2] = $18;
     HEAP32[$1_1 + 52 >> 2] = $25;
     HEAP32[$1_1 + 56 >> 2] = $67_1;
     HEAP32[$1_1 + 60 >> 2] = $68_1;
     HEAP32[$1_1 + 64 >> 2] = $69_1;
     HEAP32[$1_1 + 68 >> 2] = $49_1;
     HEAP32[$1_1 + 72 >> 2] = $50;
     HEAP32[$1_1 + 76 >> 2] = $43;
     HEAP32[$1_1 + 80 >> 2] = $44;
     HEAP32[$1_1 + 84 >> 2] = $37;
     HEAP32[$1_1 + 88 >> 2] = $38;
     HEAPF32[$1_1 + 92 >> 2] = $29;
     HEAPF32[$1_1 + 96 >> 2] = $30;
     HEAPF32[$1_1 + 100 >> 2] = $51;
     HEAPF32[$1_1 + 104 >> 2] = $39_1;
     HEAPF32[$1_1 + 108 >> 2] = $16;
     HEAPF32[$1_1 + 112 >> 2] = $52;
     HEAP32[$1_1 + 116 >> 2] = $70_1;
     HEAP32[$1_1 + 120 >> 2] = $71_1;
     HEAP32[$1_1 + 124 >> 2] = $72;
     HEAP32[$1_1 + 128 >> 2] = $73_1;
     HEAP32[$1_1 + 132 >> 2] = $74_1;
     HEAP32[$1_1 + 136 >> 2] = $75_1;
     HEAP32[$1_1 + 140 >> 2] = $76;
     HEAP32[$1_1 + 144 >> 2] = $77_1;
     HEAP32[$1_1 + 148 >> 2] = $78_1;
     HEAP32[$1_1 + 152 >> 2] = $110;
     HEAP32[$1_1 + 156 >> 2] = $79_1;
     HEAP32[$1_1 + 160 >> 2] = $80_1;
     HEAP32[$1_1 + 164 >> 2] = $81_1;
     HEAP32[$1_1 + 168 >> 2] = $82_1;
     HEAP32[$1_1 + 172 >> 2] = $111;
     HEAP32[$1_1 + 176 >> 2] = $83_1;
     HEAP32[$1_1 + 180 >> 2] = $84_1;
     HEAP32[$1_1 + 184 >> 2] = $23;
     HEAP32[$1_1 + 188 >> 2] = $85_1;
     HEAP32[$1_1 + 192 >> 2] = $86_1;
     HEAP32[$1_1 + 196 >> 2] = $87_1;
     HEAP32[$1_1 + 200 >> 2] = $88_1;
     HEAP32[$1_1 + 204 >> 2] = $89;
     HEAP32[$1_1 + 208 >> 2] = $32;
     HEAP32[$1_1 + 212 >> 2] = $90_1;
     HEAP32[$1_1 + 216 >> 2] = $91;
     HEAP32[$1_1 + 220 >> 2] = $92;
     HEAP32[$1_1 + 224 >> 2] = $93;
     HEAP32[$1_1 + 228 >> 2] = $94;
     HEAP32[$1_1 + 232 >> 2] = $95;
     HEAP32[$1_1 + 236 >> 2] = $33;
     HEAP32[$1_1 + 240 >> 2] = $96;
     HEAP32[$1_1 + 244 >> 2] = $97;
     HEAP32[$1_1 + 248 >> 2] = $98;
     HEAP32[$1_1 + 252 >> 2] = $99;
     HEAP32[$1_1 + 256 >> 2] = $100;
     HEAP32[$1_1 + 260 >> 2] = $28_1;
     HEAP32[$1_1 + 264 >> 2] = $101;
     HEAP32[$1_1 + 268 >> 2] = $102;
     HEAP32[$1_1 + 272 >> 2] = $34;
     HEAP32[$1_1 + 276 >> 2] = $103;
     HEAP32[$1_1 + 280 >> 2] = $104;
     HEAP32[$1_1 + 284 >> 2] = $105;
     HEAP32[$1_1 + 288 >> 2] = $106;
     HEAP32[$1_1 + 292 >> 2] = $107;
     HEAP32[$1_1 + 296 >> 2] = $108;
     HEAP32[$1_1 + 300 >> 2] = $109;
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 304;
    }
    if ((global$5 | 0) == 1) {
     $5 = 2;
     break label$2;
    }
   }
   if (!global$5) {
    $2 = HEAP32[$10_1 + 8 >> 2];
    if ($2) {
     $17_1 = HEAP32[$10_1 + 12 >> 2];
     if (($17_1 | 0) != ($2 | 0)) {
      while (1) {
       $0_1 = $17_1 - 12 | 0;
       $3_1 = HEAP32[$0_1 >> 2];
       if ($3_1) {
        HEAP32[$17_1 - 8 >> 2] = $3_1;
        $71($3_1);
       }
       $17_1 = $0_1;
       if (($17_1 | 0) != ($2 | 0)) {
        continue
       }
       break;
      }
     }
     HEAP32[$10_1 + 12 >> 2] = $2;
     $71(HEAP32[$10_1 + 8 >> 2]);
    }
    $6($10_1 + 24 | 0, HEAP32[$10_1 + 28 >> 2]);
    $2 = HEAP32[$10_1 + 40 >> 2];
    if ($2) {
     $17_1 = HEAP32[$10_1 + 44 >> 2];
     if (($17_1 | 0) != ($2 | 0)) {
      while (1) {
       $0_1 = $17_1 - 12 | 0;
       $3_1 = HEAP32[$0_1 >> 2];
       if ($3_1) {
        HEAP32[$17_1 - 8 >> 2] = $3_1;
        $71($3_1);
       }
       $17_1 = $0_1;
       if (($17_1 | 0) != ($2 | 0)) {
        continue
       }
       break;
      }
     }
     HEAP32[$10_1 + 44 >> 2] = $2;
     $71(HEAP32[$10_1 + 40 >> 2]);
    }
    global$0 = $10_1 - -64 | 0;
    $66_1 = 0;
   }
   if (!global$5) {
    return $66_1 | 0
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = $5;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $2 = HEAP32[global$6 >> 2];
  HEAP32[$2 >> 2] = $0_1;
  HEAP32[$2 + 4 >> 2] = $10_1;
  HEAP32[$2 + 8 >> 2] = $41_1;
  HEAP32[$2 + 12 >> 2] = $36_1;
  HEAP32[$2 + 16 >> 2] = $42_1;
  HEAP32[$2 + 20 >> 2] = $47_1;
  HEAP32[$2 + 24 >> 2] = $48;
  HEAP32[$2 + 28 >> 2] = $17_1;
  HEAP32[$2 + 32 >> 2] = $59_1;
  HEAP32[$2 + 36 >> 2] = $60;
  HEAP32[$2 + 40 >> 2] = $61_1;
  HEAP32[$2 + 44 >> 2] = $62_1;
  HEAP32[$2 + 48 >> 2] = $63_1;
  HEAP32[$2 + 52 >> 2] = $64_1;
  HEAP32[$2 + 56 >> 2] = $65_1;
  HEAP32[$2 + 60 >> 2] = $66_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - -64;
  return 0;
 }
 
 function $6($0_1, $1_1) {
  if ($1_1) {
   $6($0_1, HEAP32[$1_1 >> 2]);
   $6($0_1, HEAP32[$1_1 + 4 >> 2]);
   $71($1_1);
  }
 }
 
 function $7($0_1, $1_1, $2, $3_1) {
  var $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = Math_fround(0), $10_1 = 0, $11 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15_1 = 0, $16 = Math_fround(0), $17_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 56;
   $1_1 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$1_1 >> 2];
   $2 = HEAPF32[$1_1 + 8 >> 2];
   $3_1 = HEAPF32[$1_1 + 12 >> 2];
   $7_1 = HEAP32[$1_1 + 16 >> 2];
   $8 = HEAP32[$1_1 + 20 >> 2];
   $5 = HEAP32[$1_1 + 24 >> 2];
   $6_1 = HEAP32[$1_1 + 28 >> 2];
   $11 = HEAP32[$1_1 + 32 >> 2];
   $10_1 = HEAP32[$1_1 + 36 >> 2];
   $9_1 = HEAPF32[$1_1 + 40 >> 2];
   $12 = HEAP32[$1_1 + 44 >> 2];
   $13 = HEAP32[$1_1 + 48 >> 2];
   $14_1 = HEAP32[$1_1 + 52 >> 2];
   $1_1 = HEAP32[$1_1 + 4 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $15_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $7_1 = 0;
   HEAP32[$0_1 + 8 >> 2] = 0;
   HEAP32[$0_1 >> 2] = 0;
   HEAP32[$0_1 + 4 >> 2] = 0;
   $8 = HEAP32[$1_1 >> 2];
   $5 = HEAP32[$1_1 + 4 >> 2] - $8 | 0;
   label$9 : {
    if (!$5) {
     $9_1 = Math_fround(-100000002004087734272.0);
     break label$9;
    }
    $4 = $5 >> 3;
    $6_1 = $4 >>> 0 > 1 ? $4 : 1;
    $9_1 = Math_fround(-100000002004087734272.0);
    while (1) {
     $5 = ($7_1 << 3) + $8 | 0;
     $16 = Math_fround(Math_fround(Math_fround(HEAP32[$5 >> 2]) * $2) + Math_fround(Math_fround(HEAP32[$5 + 4 >> 2]) * $3_1));
     $9_1 = $9_1 < $16 ? $16 : $9_1;
     $7_1 = $7_1 + 1 | 0;
     if (($6_1 | 0) != ($7_1 | 0)) {
      continue
     }
     break;
    };
   }
  }
  label$2 : {
   label$12 : {
    label$13 : {
     label$14 : {
      if (!global$5) {
       $5 = HEAP32[$1_1 >> 2];
       if (($5 | 0) == HEAP32[$1_1 + 4 >> 2]) {
        break label$14
       }
       $7_1 = 0;
      }
      while (1) {
       label$17 : {
        if (!global$5) {
         $5 = ($7_1 << 3) + $5 | 0;
         if (!(+Math_fround(Math_abs(Math_fround(Math_fround(Math_fround(Math_fround(HEAP32[$5 >> 2]) * $2) + Math_fround(Math_fround(HEAP32[$5 + 4 >> 2]) * $3_1)) - $9_1))) < .001)) {
          break label$17
         }
         $5 = HEAP32[$0_1 + 4 >> 2];
         $6_1 = HEAP32[$0_1 + 8 >> 2];
         if (($5 | 0) != ($6_1 | 0)) {
          HEAP32[$5 >> 2] = $7_1;
          HEAP32[$0_1 + 4 >> 2] = $5 + 4;
          break label$17;
         }
         $8 = HEAP32[$0_1 >> 2];
         $11 = $5 - $8 | 0;
         $10_1 = $11 >> 2;
         $5 = $10_1 + 1 | 0;
         if ($5 >>> 0 >= 1073741824) {
          break label$13
         }
        }
        label$20 : {
         if (!global$5) {
          $4 = $6_1 - $8 | 0;
          $6_1 = $4 >> 1;
          $6_1 = $4 >> 2 >>> 0 < 536870911 ? ($5 >>> 0 > $6_1 >>> 0 ? $5 : $6_1) : 1073741823;
          $4 = 0;
          if (!$6_1) {
           break label$20
          }
          if ($6_1 >>> 0 >= 1073741824) {
           break label$12
          }
          $12 = $6_1 << 2;
         }
         $17_1 = $5;
         if (!(global$5 ? $15_1 : 0)) {
          $4 = $28($12);
          if ((global$5 | 0) == 1) {
           $4 = 0;
           break label$2;
          } else {
           $5 = $4
          }
          $13 = $5;
         }
         $4 = global$5 ? $17_1 : $13;
        }
        $5 = $4;
        if (!global$5) {
         $4 = ($10_1 << 2) + $5 | 0;
         HEAP32[$4 >> 2] = $7_1;
         $6_1 = ($6_1 << 2) + $5 | 0;
         $10_1 = $4 + 4 | 0;
         if (($11 | 0) >= 1) {
          $74($5, $8, $11)
         }
         HEAP32[$0_1 + 8 >> 2] = $6_1;
         HEAP32[$0_1 + 4 >> 2] = $10_1;
         HEAP32[$0_1 >> 2] = $5;
         if (!$8) {
          break label$17
         }
         $71($8);
        }
       }
       if (!global$5) {
        $7_1 = $7_1 + 1 | 0;
        $5 = HEAP32[$1_1 >> 2];
        if ($7_1 >>> 0 < HEAP32[$1_1 + 4 >> 2] - $5 >> 3 >>> 0) {
         continue
        }
       }
       break;
      };
     }
     if (!global$5) {
      return
     }
    }
    $14_1 = global$5 ? $14_1 : $0_1;
    if (global$5 ? ($15_1 | 0) == 1 : 1) {
     $36();
     if ((global$5 | 0) == 1) {
      $4 = 1;
      break label$2;
     }
    }
    if (!global$5) {
     abort()
    }
   }
   if (global$5 ? ($15_1 | 0) == 2 : 1) {
    $9(1055);
    if ((global$5 | 0) == 1) {
     $4 = 2;
     break label$2;
    }
   }
   if (!global$5) {
    abort()
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = $4;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $4 = HEAP32[global$6 >> 2];
  HEAP32[$4 >> 2] = $0_1;
  HEAP32[$4 + 4 >> 2] = $1_1;
  HEAPF32[$4 + 8 >> 2] = $2;
  HEAPF32[$4 + 12 >> 2] = $3_1;
  HEAP32[$4 + 16 >> 2] = $7_1;
  HEAP32[$4 + 20 >> 2] = $8;
  HEAP32[$4 + 24 >> 2] = $5;
  HEAP32[$4 + 28 >> 2] = $6_1;
  HEAP32[$4 + 32 >> 2] = $11;
  HEAP32[$4 + 36 >> 2] = $10_1;
  HEAPF32[$4 + 40 >> 2] = $9_1;
  HEAP32[$4 + 44 >> 2] = $12;
  HEAP32[$4 + 48 >> 2] = $13;
  HEAP32[$4 + 52 >> 2] = $14_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 56;
 }
 
 function $9($0_1) {
  var $1_1 = 0, $2 = 0, $3_1 = 0, $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15_1 = 0, $16 = 0, $17_1 = 0, $18 = 0, $19_1 = 0, $20_1 = 0, $21_1 = 0, $22 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 16;
   $3_1 = HEAP32[global$6 >> 2];
   $10_1 = HEAP32[$3_1 >> 2];
   $11 = HEAP32[$3_1 + 4 >> 2];
   $16 = HEAP32[$3_1 + 12 >> 2];
   $3_1 = HEAP32[$3_1 + 8 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $4 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $10_1 = fimport$1(8) | 0;
   $11 = $10_1;
   $3_1 = $0_1;
  }
  label$2 : {
   if (!(global$5 ? $4 : 0)) {
    $4 = $11;
    if ((global$5 | 0) == 2) {
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 20;
     $0_1 = HEAP32[global$6 >> 2];
     $4 = HEAP32[$0_1 >> 2];
     $17_1 = HEAP32[$0_1 + 12 >> 2];
     $18 = HEAP32[$0_1 + 16 >> 2];
     $12 = HEAP32[$0_1 + 4 >> 2];
     $13 = HEAP32[$0_1 + 8 >> 2];
    }
    if ((global$5 | 0) == 2) {
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
     $5 = HEAP32[HEAP32[global$6 >> 2] >> 2];
    }
    $0_1 = $3_1;
    if (!global$5) {
     $12 = $4;
     $13 = $0_1;
    }
    __inlined_func$12 : {
     label$20 : {
      if (!(global$5 ? $5 : 0)) {
       $8 = $12;
       $5 = 0;
       if ((global$5 | 0) == 2) {
        HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 20;
        $0_1 = HEAP32[global$6 >> 2];
        $8 = HEAP32[$0_1 >> 2];
        $14_1 = HEAP32[$0_1 + 4 >> 2];
        $19_1 = HEAP32[$0_1 + 12 >> 2];
        $20_1 = HEAP32[$0_1 + 16 >> 2];
        $5 = HEAP32[$0_1 + 8 >> 2];
       }
       if ((global$5 | 0) == 2) {
        HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
        $2 = HEAP32[HEAP32[global$6 >> 2] >> 2];
       }
       $0_1 = $13;
       if (!global$5) {
        HEAP32[$8 >> 2] = 1132;
        HEAP32[$8 >> 2] = 1176;
        $14_1 = $8 + 4 | 0;
        $5 = $0_1;
       }
       __inlined_func$33 : {
        label$21 : {
         if (!(global$5 ? $2 : 0)) {
          $15_1 = $14_1;
          $0_1 = $5;
          $2 = 0;
          if ((global$5 | 0) == 2) {
           HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 24;
           $0_1 = HEAP32[global$6 >> 2];
           $15_1 = HEAP32[$0_1 >> 2];
           $2 = HEAP32[$0_1 + 8 >> 2];
           $6_1 = HEAP32[$0_1 + 12 >> 2];
           $7_1 = HEAP32[$0_1 + 16 >> 2];
           $21_1 = HEAP32[$0_1 + 20 >> 2];
           $0_1 = HEAP32[$0_1 + 4 >> 2];
          }
          if ((global$5 | 0) == 2) {
           HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
           $22 = HEAP32[HEAP32[global$6 >> 2] >> 2];
          }
          if (!global$5) {
           $6_1 = $0_1;
           $1_1 = $0_1;
           __inlined_func$76 : {
            label$22 : {
             if ($0_1 & 3) {
              while (1) {
               if (!HEAPU8[$1_1 | 0]) {
                break label$22
               }
               $1_1 = $1_1 + 1 | 0;
               if ($1_1 & 3) {
                continue
               }
               break;
              }
             }
             while (1) {
              $2 = $1_1;
              $1_1 = $1_1 + 4 | 0;
              $9_1 = HEAP32[$2 >> 2];
              if (!(($9_1 ^ -1) & $9_1 - 16843009 & -2139062144)) {
               continue
              }
              break;
             };
             $1_1 = $2 - $6_1 | 0;
             if (!($9_1 & 255)) {
              break __inlined_func$76
             }
             while (1) {
              $9_1 = HEAPU8[$2 + 1 | 0];
              $1_1 = $2 + 1 | 0;
              $2 = $1_1;
              if ($9_1) {
               continue
              }
              break;
             };
            }
            $1_1 = $1_1 - $6_1 | 0;
           }
           $2 = $1_1;
           $6_1 = $2 + 13 | 0;
          }
          __inlined_func$31 : {
           label$203 : {
            if (!(global$5 ? $22 : 0)) {
             $1_1 = $28($6_1);
             if ((global$5 | 0) == 1) {
              break label$203
             }
             $7_1 = $1_1;
            }
            if (!global$5) {
             HEAP32[$7_1 + 8 >> 2] = 0;
             HEAP32[$7_1 + 4 >> 2] = $2;
             HEAP32[$7_1 >> 2] = $2;
             HEAP32[$15_1 >> 2] = $74($7_1 + 12 | 0, $0_1, $2 + 1 | 0);
            }
            if (!global$5) {
             break __inlined_func$31
            }
            abort();
           }
           HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
           HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
           $1_1 = HEAP32[global$6 >> 2];
           HEAP32[$1_1 >> 2] = $15_1;
           HEAP32[$1_1 + 4 >> 2] = $0_1;
           HEAP32[$1_1 + 8 >> 2] = $2;
           HEAP32[$1_1 + 12 >> 2] = $6_1;
           HEAP32[$1_1 + 16 >> 2] = $7_1;
           HEAP32[$1_1 + 20 >> 2] = $21_1;
           HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 24;
          }
          if ((global$5 | 0) == 1) {
           break label$21
          }
         }
         if (!global$5) {
          break __inlined_func$33
         }
         abort();
        }
        HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
        HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
        $0_1 = HEAP32[global$6 >> 2];
        HEAP32[$0_1 >> 2] = $8;
        HEAP32[$0_1 + 4 >> 2] = $14_1;
        HEAP32[$0_1 + 8 >> 2] = $5;
        HEAP32[$0_1 + 12 >> 2] = $19_1;
        HEAP32[$0_1 + 16 >> 2] = $20_1;
        HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 20;
       }
       if ((global$5 | 0) == 1) {
        break label$20
       }
      }
      if (!global$5) {
       HEAP32[$4 >> 2] = 1224
      }
      if (!global$5) {
       break __inlined_func$12
      }
      abort();
     }
     HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
     $0_1 = HEAP32[global$6 >> 2];
     HEAP32[$0_1 >> 2] = $4;
     HEAP32[$0_1 + 4 >> 2] = $12;
     HEAP32[$0_1 + 8 >> 2] = $13;
     HEAP32[$0_1 + 12 >> 2] = $17_1;
     HEAP32[$0_1 + 16 >> 2] = $18;
     HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 20;
    }
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   if (!global$5) {
    fimport$2($10_1 | 0, 1256, 1);
    abort();
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $10_1;
  HEAP32[$0_1 + 4 >> 2] = $11;
  HEAP32[$0_1 + 8 >> 2] = $3_1;
  HEAP32[$0_1 + 12 >> 2] = $16;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 16;
 }
 
 function $10($0_1, $1_1) {
  if ($1_1) {
   $10($0_1, HEAP32[$1_1 >> 2]);
   $10($0_1, HEAP32[$1_1 + 4 >> 2]);
   $0_1 = HEAP32[$1_1 + 20 >> 2];
   if ($0_1) {
    HEAP32[$1_1 + 24 >> 2] = $0_1;
    $71($0_1);
   }
   $71($1_1);
  }
 }
 
 function $14($0_1) {
  var $1_1 = Math_fround(0), $2 = 0, $3_1 = 0, $4 = Math_fround(0);
  $3_1 = (wasm2js_scratch_store_f32($0_1), wasm2js_scratch_load_i32(2));
  $2 = $3_1 & 2147483647;
  if ($2 >>> 0 >= 1065353216) {
   if (($2 | 0) == 1065353216) {
    return ($3_1 | 0) > -1 ? Math_fround(0.0) : Math_fround(3.141592502593994)
   }
   return Math_fround(Math_fround(0.0) / Math_fround($0_1 - $0_1));
  }
  label$4 : {
   if ($2 >>> 0 <= 1056964607) {
    $1_1 = Math_fround(1.570796251296997);
    if ($2 >>> 0 < 847249409) {
     break label$4
    }
    return Math_fround(Math_fround(Math_fround(Math_fround(7.549789415861596e-08) - Math_fround($15(Math_fround($0_1 * $0_1)) * $0_1)) - $0_1) + Math_fround(1.570796251296997));
   }
   if (($3_1 | 0) <= -1) {
    $0_1 = Math_fround(Math_fround($0_1 + Math_fround(1.0)) * Math_fround(.5));
    $1_1 = Math_fround(Math_sqrt($0_1));
    $0_1 = Math_fround(Math_fround(1.570796251296997) - Math_fround($1_1 + Math_fround(Math_fround($1_1 * $15($0_1)) + Math_fround(-7.549789415861596e-08))));
    return Math_fround($0_1 + $0_1);
   }
   $1_1 = Math_fround(Math_fround(Math_fround(1.0) - $0_1) * Math_fround(.5));
   $4 = Math_fround(Math_sqrt($1_1));
   $0_1 = (wasm2js_scratch_store_i32(2, (wasm2js_scratch_store_f32($4), wasm2js_scratch_load_i32(2)) & -4096), wasm2js_scratch_load_f32());
   $0_1 = Math_fround(Math_fround(Math_fround($4 * $15($1_1)) + Math_fround(Math_fround($1_1 - Math_fround($0_1 * $0_1)) / Math_fround($4 + $0_1))) + $0_1);
   $1_1 = Math_fround($0_1 + $0_1);
  }
  return $1_1;
 }
 
 function $15($0_1) {
  return Math_fround(Math_fround(Math_fround(Math_fround(Math_fround(Math_fround($0_1 * Math_fround(-.008656363002955914)) + Math_fround(-.04274342209100723)) * $0_1) + Math_fround(.16666586697101593)) * $0_1) / Math_fround(Math_fround($0_1 * Math_fround(-.7066296339035034)) + Math_fround(1.0)));
 }
 
 function $17() {
  var $0_1 = 0, $1_1 = 0;
  $1_1 = __wasm_i64_mul(HEAP32[466], HEAP32[467], 1284865837, 1481765933) + 1 | 0;
  $0_1 = i64toi32_i32$HIGH_BITS;
  $0_1 = $1_1 >>> 0 < 1 ? $0_1 + 1 | 0 : $0_1;
  HEAP32[466] = $1_1;
  HEAP32[467] = $0_1;
  return $0_1 >>> 1 | 0;
 }
 
 function $19($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  global$2 = $0_1;
  global$1 = $1_1;
 }
 
 function $20() {
  return global$2 | 0;
 }
 
 function $21() {
  return global$1 | 0;
 }
 
 function $28($0_1) {
  var $1_1 = 0, $2 = 0, $3_1 = 0, $4 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 16;
   $1_1 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$1_1 >> 2];
   $3_1 = HEAP32[$1_1 + 4 >> 2];
   $4 = HEAP32[$1_1 + 8 >> 2];
   $1_1 = HEAP32[$1_1 + 12 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $2 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  $3_1 = global$5 ? $3_1 : $0_1 ? $0_1 : 1;
  label$2 : {
   label$9 : {
    while (1) {
     if (!global$5) {
      $0_1 = $70($3_1);
      if ($0_1) {
       break label$9
      }
     }
     label$12 : {
      if (!global$5) {
       $0_1 = HEAP32[469];
       if (!$0_1) {
        break label$12
       }
       $4 = $0_1;
      }
      if (!(global$5 ? $2 : 0)) {
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
     fimport$4();
     abort();
    }
   }
   $0_1 = global$5 ? $1_1 : $0_1;
   if (!global$5) {
    return $0_1
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $2 = HEAP32[global$6 >> 2];
  HEAP32[$2 >> 2] = $0_1;
  HEAP32[$2 + 4 >> 2] = $3_1;
  HEAP32[$2 + 8 >> 2] = $4;
  HEAP32[$2 + 12 >> 2] = $1_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 16;
  return 0;
 }
 
 function $35() {
  return 1872;
 }
 
 function $36() {
  var $0_1 = 0;
  label$2 : {
   if ((global$5 | 0) == 2) {
    HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
    $0_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
   }
   if (!(global$5 ? $0_1 : 0)) {
    $9(1033);
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   if (!global$5) {
    abort()
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
 }
 
 function $39($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $40($0_1) {
  $0_1 = $0_1 | 0;
  $71($0_1);
 }
 
 function $41($0_1) {
  $0_1 = $0_1 | 0;
  return 1040;
 }
 
 function $42($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2 = 0, $3_1 = 0;
  HEAP32[$0_1 >> 2] = 1176;
  $2 = HEAP32[$0_1 + 4 >> 2] - 12 | 0;
  $1_1 = $2 + 8 | 0;
  $3_1 = $1_1;
  $1_1 = HEAP32[$1_1 >> 2] - 1 | 0;
  HEAP32[$3_1 >> 2] = $1_1;
  if (($1_1 | 0) <= -1) {
   $71($2)
  }
  return $0_1 | 0;
 }
 
 function $46($0_1) {
  $0_1 = $0_1 | 0;
  $71($42($0_1));
 }
 
 function $47($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[$0_1 + 4 >> 2];
 }
 
 function $49($0_1) {
  $0_1 = $0_1 | 0;
  $42($0_1);
  $71($0_1);
 }
 
 function $57($0_1, $1_1, $2) {
  var $3_1 = 0;
  if (!$2) {
   return HEAP32[$0_1 + 4 >> 2] == HEAP32[$1_1 + 4 >> 2]
  }
  if (($0_1 | 0) == ($1_1 | 0)) {
   return 1
  }
  $2 = HEAP32[$0_1 + 4 >> 2];
  $0_1 = HEAPU8[$2 | 0];
  $1_1 = HEAP32[$1_1 + 4 >> 2];
  $3_1 = HEAPU8[$1_1 | 0];
  label$2 : {
   if (!$0_1 | ($3_1 | 0) != ($0_1 | 0)) {
    break label$2
   }
   while (1) {
    $3_1 = HEAPU8[$1_1 + 1 | 0];
    $0_1 = HEAPU8[$2 + 1 | 0];
    if (!$0_1) {
     break label$2
    }
    $1_1 = $1_1 + 1 | 0;
    $2 = $2 + 1 | 0;
    if (($0_1 | 0) == ($3_1 | 0)) {
     continue
    }
    break;
   };
  }
  return ($0_1 | 0) == ($3_1 | 0);
 }
 
 function $59($0_1, $1_1, $2) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  var $3_1 = 0, $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15_1 = 0, $16 = 0, $17_1 = 0, $18 = 0, $19_1 = 0, $20_1 = 0, $21_1 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 44;
   $4 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$4 >> 2];
   $7_1 = HEAP32[$4 + 8 >> 2];
   $9_1 = HEAP32[$4 + 12 >> 2];
   $12 = HEAP32[$4 + 16 >> 2];
   $13 = HEAP32[$4 + 20 >> 2];
   $14_1 = HEAP32[$4 + 24 >> 2];
   $10_1 = HEAP32[$4 + 28 >> 2];
   $15_1 = HEAP32[$4 + 32 >> 2];
   $16 = HEAP32[$4 + 36 >> 2];
   $17_1 = HEAP32[$4 + 40 >> 2];
   $2 = HEAP32[$4 + 4 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $27 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $7_1 = global$0 + -64 | 0;
   global$0 = $7_1;
   $9_1 = 1;
  }
  label$2 : {
   label$9 : {
    if (!global$5) {
     if ($57($0_1, $1_1, 0)) {
      break label$9
     }
     $9_1 = 0;
     if (!$1_1) {
      break label$9
     }
     $12 = $1_1;
    }
    if (!(global$5 ? $27 : 0)) {
     $1_1 = $12;
     $4 = 0;
     $8 = 1328;
     if ((global$5 | 0) == 2) {
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 56;
      $6_1 = HEAP32[global$6 >> 2];
      $1_1 = HEAP32[$6_1 >> 2];
      $8 = HEAP32[$6_1 + 4 >> 2];
      $3_1 = HEAP32[$6_1 + 8 >> 2];
      $4 = HEAP32[$6_1 + 12 >> 2];
      $18 = HEAP32[$6_1 + 16 >> 2];
      $19_1 = HEAP32[$6_1 + 20 >> 2];
      $20_1 = HEAP32[$6_1 + 24 >> 2];
      $21_1 = HEAP32[$6_1 + 28 >> 2];
      $22 = HEAP32[$6_1 + 32 >> 2];
      $23 = HEAP32[$6_1 + 36 >> 2];
      $24 = HEAP32[$6_1 + 40 >> 2];
      $25 = HEAP32[$6_1 + 44 >> 2];
      $26 = HEAP32[$6_1 + 48 >> 2];
      $6_1 = HEAP32[$6_1 + 52 >> 2];
     }
     if ((global$5 | 0) == 2) {
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
      $5 = HEAP32[HEAP32[global$6 >> 2] >> 2];
     }
     if (!global$5) {
      $3_1 = global$0 + -64 | 0;
      global$0 = $3_1;
      $11 = HEAP32[$1_1 >> 2];
      $4 = HEAP32[$11 - 4 >> 2];
      $11 = HEAP32[$11 - 8 >> 2];
      HEAP32[$3_1 + 20 >> 2] = 0;
      HEAP32[$3_1 + 16 >> 2] = $8;
      HEAP32[$3_1 + 12 >> 2] = $1_1;
      HEAP32[$3_1 + 8 >> 2] = 1376;
      $8 = 0;
      $75($3_1 + 24 | 0, 39);
      $1_1 = $1_1 + $11 | 0;
     }
     __inlined_func$60 : {
      label$20 : {
       label$91 : {
        label$10 : {
         if (!global$5) {
          if (!$57($4, 1376, 0)) {
           break label$10
          }
          HEAP32[$3_1 + 56 >> 2] = 1;
          $19_1 = $3_1 + 8 | 0;
          $20_1 = $1_1;
          $22 = HEAP32[HEAP32[$4 >> 2] + 20 >> 2];
          $21_1 = $1_1;
          $18 = $4;
         }
         if (!(global$5 ? $5 : 0)) {
          FUNCTION_TABLE[$22 | 0]($18, $19_1, $20_1, $21_1, 1, 0);
          if ((global$5 | 0) == 1) {
           $5 = 0;
           break label$20;
          }
         }
         if (!global$5) {
          $8 = HEAP32[$3_1 + 32 >> 2] == 1 ? $1_1 : 0;
          break label$91;
         }
        }
        if (!global$5) {
         $24 = $3_1 + 8 | 0;
         $26 = HEAP32[HEAP32[$4 >> 2] + 24 >> 2];
         $25 = $1_1;
         $23 = $4;
        }
        if (global$5 ? ($5 | 0) == 1 : 1) {
         FUNCTION_TABLE[$26 | 0]($23, $24, $25, 1, 0);
         if ((global$5 | 0) == 1) {
          $5 = 1;
          break label$20;
         }
        }
        if (!global$5) {
         label$23 : {
          switch (HEAP32[$3_1 + 44 >> 2]) {
          case 0:
           $8 = HEAP32[$3_1 + 48 >> 2] == 1 ? (HEAP32[$3_1 + 36 >> 2] == 1 ? (HEAP32[$3_1 + 40 >> 2] == 1 ? HEAP32[$3_1 + 28 >> 2] : 0) : 0) : 0;
           break label$91;
          case 1:
           break label$23;
          default:
           break label$91;
          };
         }
         if (HEAP32[$3_1 + 48 >> 2] | HEAP32[$3_1 + 36 >> 2] != 1 | HEAP32[$3_1 + 40 >> 2] != 1 ? HEAP32[$3_1 + 32 >> 2] != 1 : 0) {
          break label$91
         }
         $8 = HEAP32[$3_1 + 24 >> 2];
        }
       }
       if (global$5) {
        $1_1 = $6_1
       } else {
        global$0 = $3_1 - -64 | 0;
        $1_1 = $8;
       }
       if (!global$5) {
        break __inlined_func$60
       }
       abort();
      }
      HEAP32[HEAP32[global$6 >> 2] >> 2] = $5;
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
      $5 = HEAP32[global$6 >> 2];
      HEAP32[$5 >> 2] = $1_1;
      HEAP32[$5 + 4 >> 2] = $8;
      HEAP32[$5 + 8 >> 2] = $3_1;
      HEAP32[$5 + 12 >> 2] = $4;
      HEAP32[$5 + 16 >> 2] = $18;
      HEAP32[$5 + 20 >> 2] = $19_1;
      HEAP32[$5 + 24 >> 2] = $20_1;
      HEAP32[$5 + 28 >> 2] = $21_1;
      HEAP32[$5 + 32 >> 2] = $22;
      HEAP32[$5 + 36 >> 2] = $23;
      HEAP32[$5 + 40 >> 2] = $24;
      HEAP32[$5 + 44 >> 2] = $25;
      HEAP32[$5 + 48 >> 2] = $26;
      HEAP32[$5 + 52 >> 2] = $6_1;
      HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 56;
      $1_1 = 0;
     }
     if ((global$5 | 0) == 1) {
      $1_1 = 0;
      break label$2;
     }
     $13 = $1_1;
    }
    if (!global$5) {
     $1_1 = $13;
     if (!$1_1) {
      break label$9
     }
     $10_1 = $7_1 + 8 | 0;
     $75($10_1 | 4, 52);
     HEAP32[$7_1 + 56 >> 2] = 1;
     HEAP32[$7_1 + 20 >> 2] = -1;
     HEAP32[$7_1 + 16 >> 2] = $0_1;
     HEAP32[$7_1 + 8 >> 2] = $1_1;
     $15_1 = HEAP32[$2 >> 2];
     $16 = HEAP32[HEAP32[$1_1 >> 2] + 28 >> 2];
     $14_1 = $1_1;
    }
    if (global$5 ? ($27 | 0) == 1 : 1) {
     FUNCTION_TABLE[$16 | 0]($14_1, $10_1, $15_1, 1);
     if ((global$5 | 0) == 1) {
      $1_1 = 1;
      break label$2;
     }
    }
    if (!global$5) {
     $0_1 = HEAP32[$7_1 + 32 >> 2];
     if (($0_1 | 0) == 1) {
      HEAP32[$2 >> 2] = HEAP32[$7_1 + 24 >> 2]
     }
     $9_1 = ($0_1 | 0) == 1;
    }
   }
   if (!global$5) {
    global$0 = $7_1 - -64 | 0;
    $17_1 = $9_1;
   }
   if (!global$5) {
    return $17_1 | 0
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = $1_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $1_1 = HEAP32[global$6 >> 2];
  HEAP32[$1_1 >> 2] = $0_1;
  HEAP32[$1_1 + 4 >> 2] = $2;
  HEAP32[$1_1 + 8 >> 2] = $7_1;
  HEAP32[$1_1 + 12 >> 2] = $9_1;
  HEAP32[$1_1 + 16 >> 2] = $12;
  HEAP32[$1_1 + 20 >> 2] = $13;
  HEAP32[$1_1 + 24 >> 2] = $14_1;
  HEAP32[$1_1 + 28 >> 2] = $10_1;
  HEAP32[$1_1 + 32 >> 2] = $15_1;
  HEAP32[$1_1 + 36 >> 2] = $16;
  HEAP32[$1_1 + 40 >> 2] = $17_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 44;
  return 0;
 }
 
 function $61($0_1, $1_1, $2) {
  var $3_1 = 0;
  $3_1 = HEAP32[$0_1 + 16 >> 2];
  if (!$3_1) {
   HEAP32[$0_1 + 36 >> 2] = 1;
   HEAP32[$0_1 + 24 >> 2] = $2;
   HEAP32[$0_1 + 16 >> 2] = $1_1;
   return;
  }
  label$2 : {
   if (($1_1 | 0) == ($3_1 | 0)) {
    if (HEAP32[$0_1 + 24 >> 2] != 2) {
     break label$2
    }
    HEAP32[$0_1 + 24 >> 2] = $2;
    return;
   }
   HEAP8[$0_1 + 54 | 0] = 1;
   HEAP32[$0_1 + 24 >> 2] = 2;
   HEAP32[$0_1 + 36 >> 2] = HEAP32[$0_1 + 36 >> 2] + 1;
  }
 }
 
 function $62($0_1, $1_1, $2, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  if ($57($0_1, HEAP32[$1_1 + 8 >> 2], 0)) {
   $61($1_1, $2, $3_1)
  }
 }
 
 function $63($0_1, $1_1, $2, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  var $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 20;
   $4 = HEAP32[global$6 >> 2];
   $5 = HEAP32[$4 >> 2];
   $6_1 = HEAP32[$4 + 4 >> 2];
   $7_1 = HEAP32[$4 + 8 >> 2];
   $8 = HEAP32[$4 + 12 >> 2];
   $4 = HEAP32[$4 + 16 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $9_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   if ($57($0_1, HEAP32[$1_1 + 8 >> 2], 0)) {
    $61($1_1, $2, $3_1);
    return;
   }
   $0_1 = HEAP32[$0_1 + 8 >> 2];
   $5 = $0_1;
   $7_1 = $2;
   $8 = $3_1;
   $4 = HEAP32[HEAP32[$0_1 >> 2] + 28 >> 2];
   $6_1 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $9_1 : 0)) {
    FUNCTION_TABLE[$4 | 0]($5, $6_1, $7_1, $8);
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $5;
  HEAP32[$0_1 + 4 >> 2] = $6_1;
  HEAP32[$0_1 + 8 >> 2] = $7_1;
  HEAP32[$0_1 + 12 >> 2] = $8;
  HEAP32[$0_1 + 16 >> 2] = $4;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 20;
 }
 
 function $64($0_1, $1_1, $2, $3_1) {
  HEAP8[$0_1 + 53 | 0] = 1;
  label$1 : {
   if (HEAP32[$0_1 + 4 >> 2] != ($2 | 0)) {
    break label$1
   }
   HEAP8[$0_1 + 52 | 0] = 1;
   $2 = HEAP32[$0_1 + 16 >> 2];
   label$2 : {
    if (!$2) {
     HEAP32[$0_1 + 36 >> 2] = 1;
     HEAP32[$0_1 + 24 >> 2] = $3_1;
     HEAP32[$0_1 + 16 >> 2] = $1_1;
     if (HEAP32[$0_1 + 48 >> 2] != 1) {
      break label$1
     }
     if (($3_1 | 0) == 1) {
      break label$2
     }
     break label$1;
    }
    if (($1_1 | 0) == ($2 | 0)) {
     $2 = HEAP32[$0_1 + 24 >> 2];
     if (($2 | 0) == 2) {
      HEAP32[$0_1 + 24 >> 2] = $3_1;
      $2 = $3_1;
     }
     if (HEAP32[$0_1 + 48 >> 2] != 1) {
      break label$1
     }
     if (($2 | 0) == 1) {
      break label$2
     }
     break label$1;
    }
    HEAP32[$0_1 + 36 >> 2] = HEAP32[$0_1 + 36 >> 2] + 1;
   }
   HEAP8[$0_1 + 54 | 0] = 1;
  }
 }
 
 function $65($0_1, $1_1, $2) {
  if (!(HEAP32[$0_1 + 28 >> 2] == 1 | HEAP32[$0_1 + 4 >> 2] != ($1_1 | 0))) {
   HEAP32[$0_1 + 28 >> 2] = $2
  }
 }
 
 function $66($0_1, $1_1, $2, $3_1, $4) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  var $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0, $12 = 0, $13 = 0, $14_1 = 0, $15_1 = 0, $16 = 0, $17_1 = 0, $18 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 68;
   $5 = HEAP32[global$6 >> 2];
   $0_1 = HEAP32[$5 >> 2];
   $2 = HEAP32[$5 + 8 >> 2];
   $3_1 = HEAP32[$5 + 12 >> 2];
   $4 = HEAP32[$5 + 16 >> 2];
   $6_1 = HEAP32[$5 + 20 >> 2];
   $7_1 = HEAP32[$5 + 24 >> 2];
   $8 = HEAP32[$5 + 28 >> 2];
   $9_1 = HEAP32[$5 + 32 >> 2];
   $10_1 = HEAP32[$5 + 36 >> 2];
   $11 = HEAP32[$5 + 40 >> 2];
   $12 = HEAP32[$5 + 44 >> 2];
   $13 = HEAP32[$5 + 48 >> 2];
   $14_1 = HEAP32[$5 + 52 >> 2];
   $15_1 = HEAP32[$5 + 56 >> 2];
   $16 = HEAP32[$5 + 60 >> 2];
   $17_1 = HEAP32[$5 + 64 >> 2];
   $1_1 = HEAP32[$5 + 4 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $18 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   if ($57($0_1, HEAP32[$1_1 + 8 >> 2], $4)) {
    $65($1_1, $2, $3_1);
    return;
   }
  }
  label$2 : {
   label$9 : {
    label$10 : {
     if (!global$5) {
      if (!$57($0_1, HEAP32[$1_1 >> 2], $4)) {
       break label$10
      }
      if (!(HEAP32[$1_1 + 20 >> 2] != ($2 | 0) ? ($2 | 0) != HEAP32[$1_1 + 16 >> 2] : 0)) {
       if (($3_1 | 0) != 1) {
        break label$9
       }
       HEAP32[$1_1 + 32 >> 2] = 1;
       return;
      }
      HEAP32[$1_1 + 32 >> 2] = $3_1;
     }
     label$14 : {
      if (!global$5) {
       if (HEAP32[$1_1 + 44 >> 2] == 4) {
        break label$14
       }
       HEAP16[$1_1 + 52 >> 1] = 0;
       $0_1 = HEAP32[$0_1 + 8 >> 2];
       $6_1 = $0_1;
       $8 = $2;
       $9_1 = $2;
       $10_1 = $4;
       $11 = HEAP32[HEAP32[$0_1 >> 2] + 20 >> 2];
       $7_1 = $1_1;
      }
      if (!(global$5 ? $18 : 0)) {
       FUNCTION_TABLE[$11 | 0]($6_1, $7_1, $8, $9_1, 1, $10_1);
       if ((global$5 | 0) == 1) {
        $5 = 0;
        break label$2;
       }
      }
      if (!global$5) {
       if (HEAPU8[$1_1 + 53 | 0]) {
        HEAP32[$1_1 + 44 >> 2] = 3;
        if (!HEAPU8[$1_1 + 52 | 0]) {
         break label$14
        }
        break label$9;
       }
       HEAP32[$1_1 + 44 >> 2] = 4;
      }
     }
     if (!global$5) {
      HEAP32[$1_1 + 20 >> 2] = $2;
      HEAP32[$1_1 + 40 >> 2] = HEAP32[$1_1 + 40 >> 2] + 1;
      if (HEAP32[$1_1 + 36 >> 2] != 1 | HEAP32[$1_1 + 24 >> 2] != 2) {
       break label$9
      }
      HEAP8[$1_1 + 54 | 0] = 1;
      return;
     }
    }
    if (!global$5) {
     $0_1 = HEAP32[$0_1 + 8 >> 2];
     $12 = $0_1;
     $14_1 = $2;
     $15_1 = $3_1;
     $16 = $4;
     $17_1 = HEAP32[HEAP32[$0_1 >> 2] + 24 >> 2];
     $13 = $1_1;
    }
    if (global$5 ? ($18 | 0) == 1 : 1) {
     FUNCTION_TABLE[$17_1 | 0]($12, $13, $14_1, $15_1, $16);
     if ((global$5 | 0) == 1) {
      $5 = 1;
      break label$2;
     }
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = $5;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $5 = HEAP32[global$6 >> 2];
  HEAP32[$5 >> 2] = $0_1;
  HEAP32[$5 + 4 >> 2] = $1_1;
  HEAP32[$5 + 8 >> 2] = $2;
  HEAP32[$5 + 12 >> 2] = $3_1;
  HEAP32[$5 + 16 >> 2] = $4;
  HEAP32[$5 + 20 >> 2] = $6_1;
  HEAP32[$5 + 24 >> 2] = $7_1;
  HEAP32[$5 + 28 >> 2] = $8;
  HEAP32[$5 + 32 >> 2] = $9_1;
  HEAP32[$5 + 36 >> 2] = $10_1;
  HEAP32[$5 + 40 >> 2] = $11;
  HEAP32[$5 + 44 >> 2] = $12;
  HEAP32[$5 + 48 >> 2] = $13;
  HEAP32[$5 + 52 >> 2] = $14_1;
  HEAP32[$5 + 56 >> 2] = $15_1;
  HEAP32[$5 + 60 >> 2] = $16;
  HEAP32[$5 + 64 >> 2] = $17_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 68;
 }
 
 function $67($0_1, $1_1, $2, $3_1, $4) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  if ($57($0_1, HEAP32[$1_1 + 8 >> 2], $4)) {
   $65($1_1, $2, $3_1);
   return;
  }
  label$2 : {
   if (!$57($0_1, HEAP32[$1_1 >> 2], $4)) {
    break label$2
   }
   if (!(HEAP32[$1_1 + 20 >> 2] != ($2 | 0) ? ($2 | 0) != HEAP32[$1_1 + 16 >> 2] : 0)) {
    if (($3_1 | 0) != 1) {
     break label$2
    }
    HEAP32[$1_1 + 32 >> 2] = 1;
    return;
   }
   HEAP32[$1_1 + 20 >> 2] = $2;
   HEAP32[$1_1 + 32 >> 2] = $3_1;
   HEAP32[$1_1 + 40 >> 2] = HEAP32[$1_1 + 40 >> 2] + 1;
   if (!(HEAP32[$1_1 + 36 >> 2] != 1 | HEAP32[$1_1 + 24 >> 2] != 2)) {
    HEAP8[$1_1 + 54 | 0] = 1
   }
   HEAP32[$1_1 + 44 >> 2] = 4;
  }
 }
 
 function $68($0_1, $1_1, $2, $3_1, $4, $5) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  $5 = $5 | 0;
  var $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0, $12 = 0, $13 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 28;
   $6_1 = HEAP32[global$6 >> 2];
   $7_1 = HEAP32[$6_1 >> 2];
   $8 = HEAP32[$6_1 + 4 >> 2];
   $9_1 = HEAP32[$6_1 + 8 >> 2];
   $10_1 = HEAP32[$6_1 + 12 >> 2];
   $11 = HEAP32[$6_1 + 16 >> 2];
   $12 = HEAP32[$6_1 + 20 >> 2];
   $6_1 = HEAP32[$6_1 + 24 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $13 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   if ($57($0_1, HEAP32[$1_1 + 8 >> 2], $5)) {
    $64($1_1, $2, $3_1, $4);
    return;
   }
   $0_1 = HEAP32[$0_1 + 8 >> 2];
   $7_1 = $0_1;
   $9_1 = $2;
   $10_1 = $3_1;
   $11 = $4;
   $12 = $5;
   $6_1 = HEAP32[HEAP32[$0_1 >> 2] + 20 >> 2];
   $8 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $13 : 0)) {
    FUNCTION_TABLE[$6_1 | 0]($7_1, $8, $9_1, $10_1, $11, $12);
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $7_1;
  HEAP32[$0_1 + 4 >> 2] = $8;
  HEAP32[$0_1 + 8 >> 2] = $9_1;
  HEAP32[$0_1 + 12 >> 2] = $10_1;
  HEAP32[$0_1 + 16 >> 2] = $11;
  HEAP32[$0_1 + 20 >> 2] = $12;
  HEAP32[$0_1 + 24 >> 2] = $6_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 28;
 }
 
 function $69($0_1, $1_1, $2, $3_1, $4, $5) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  $5 = $5 | 0;
  if ($57($0_1, HEAP32[$1_1 + 8 >> 2], $5)) {
   $64($1_1, $2, $3_1, $4)
  }
 }
 
 function $70($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2 = 0, $3_1 = 0, $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0;
  $11 = global$0 - 16 | 0;
  global$0 = $11;
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
              $5 = HEAP32[470];
              $7_1 = $0_1 >>> 0 < 11 ? 16 : $0_1 + 11 & -8;
              $2 = $7_1 >>> 3 | 0;
              $1_1 = $5 >>> $2 | 0;
              if ($1_1 & 3) {
               $3_1 = $2 + (($1_1 ^ -1) & 1) | 0;
               $1_1 = $3_1 << 3;
               $4 = HEAP32[$1_1 + 1928 >> 2];
               $0_1 = $4 + 8 | 0;
               $2 = HEAP32[$4 + 8 >> 2];
               $1_1 = $1_1 + 1920 | 0;
               label$15 : {
                if (($2 | 0) == ($1_1 | 0)) {
                 HEAP32[470] = __wasm_rotl_i32($3_1) & $5;
                 break label$15;
                }
                HEAP32[$2 + 12 >> 2] = $1_1;
                HEAP32[$1_1 + 8 >> 2] = $2;
               }
               $1_1 = $3_1 << 3;
               HEAP32[$4 + 4 >> 2] = $1_1 | 3;
               $1_1 = $1_1 + $4 | 0;
               HEAP32[$1_1 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2] | 1;
               break label$2;
              }
              $10_1 = HEAP32[472];
              if ($10_1 >>> 0 >= $7_1 >>> 0) {
               break label$12
              }
              if ($1_1) {
               $0_1 = 2 << $2;
               $0_1 = (0 - $0_1 | $0_1) & $1_1 << $2;
               $1_1 = (0 - $0_1 & $0_1) - 1 | 0;
               $0_1 = $1_1 >>> 12 & 16;
               $2 = $0_1;
               $1_1 = $1_1 >>> $0_1 | 0;
               $0_1 = $1_1 >>> 5 & 8;
               $2 = $2 | $0_1;
               $1_1 = $1_1 >>> $0_1 | 0;
               $0_1 = $1_1 >>> 2 & 4;
               $2 = $2 | $0_1;
               $1_1 = $1_1 >>> $0_1 | 0;
               $0_1 = $1_1 >>> 1 & 2;
               $2 = $2 | $0_1;
               $1_1 = $1_1 >>> $0_1 | 0;
               $0_1 = $1_1 >>> 1 & 1;
               $3_1 = ($2 | $0_1) + ($1_1 >>> $0_1 | 0) | 0;
               $0_1 = $3_1 << 3;
               $4 = HEAP32[$0_1 + 1928 >> 2];
               $1_1 = HEAP32[$4 + 8 >> 2];
               $0_1 = $0_1 + 1920 | 0;
               label$18 : {
                if (($1_1 | 0) == ($0_1 | 0)) {
                 $5 = __wasm_rotl_i32($3_1) & $5;
                 HEAP32[470] = $5;
                 break label$18;
                }
                HEAP32[$1_1 + 12 >> 2] = $0_1;
                HEAP32[$0_1 + 8 >> 2] = $1_1;
               }
               $0_1 = $4 + 8 | 0;
               HEAP32[$4 + 4 >> 2] = $7_1 | 3;
               $2 = $4 + $7_1 | 0;
               $1_1 = $3_1 << 3;
               $3_1 = $1_1 - $7_1 | 0;
               HEAP32[$2 + 4 >> 2] = $3_1 | 1;
               HEAP32[$1_1 + $4 >> 2] = $3_1;
               if ($10_1) {
                $1_1 = $10_1 >>> 3 | 0;
                $6_1 = ($1_1 << 3) + 1920 | 0;
                $4 = HEAP32[475];
                $1_1 = 1 << $1_1;
                label$21 : {
                 if (!($1_1 & $5)) {
                  HEAP32[470] = $1_1 | $5;
                  $1_1 = $6_1;
                  break label$21;
                 }
                 $1_1 = HEAP32[$6_1 + 8 >> 2];
                }
                HEAP32[$6_1 + 8 >> 2] = $4;
                HEAP32[$1_1 + 12 >> 2] = $4;
                HEAP32[$4 + 12 >> 2] = $6_1;
                HEAP32[$4 + 8 >> 2] = $1_1;
               }
               HEAP32[475] = $2;
               HEAP32[472] = $3_1;
               break label$2;
              }
              $9_1 = HEAP32[471];
              if (!$9_1) {
               break label$12
              }
              $1_1 = ($9_1 & 0 - $9_1) - 1 | 0;
              $0_1 = $1_1 >>> 12 & 16;
              $2 = $0_1;
              $1_1 = $1_1 >>> $0_1 | 0;
              $0_1 = $1_1 >>> 5 & 8;
              $2 = $2 | $0_1;
              $1_1 = $1_1 >>> $0_1 | 0;
              $0_1 = $1_1 >>> 2 & 4;
              $2 = $2 | $0_1;
              $1_1 = $1_1 >>> $0_1 | 0;
              $0_1 = $1_1 >>> 1 & 2;
              $2 = $2 | $0_1;
              $1_1 = $1_1 >>> $0_1 | 0;
              $0_1 = $1_1 >>> 1 & 1;
              $1_1 = HEAP32[(($2 | $0_1) + ($1_1 >>> $0_1 | 0) << 2) + 2184 >> 2];
              $3_1 = (HEAP32[$1_1 + 4 >> 2] & -8) - $7_1 | 0;
              $2 = $1_1;
              while (1) {
               label$23 : {
                $0_1 = HEAP32[$2 + 16 >> 2];
                if (!$0_1) {
                 $0_1 = HEAP32[$2 + 20 >> 2];
                 if (!$0_1) {
                  break label$23
                 }
                }
                $2 = (HEAP32[$0_1 + 4 >> 2] & -8) - $7_1 | 0;
                $4 = $2 >>> 0 < $3_1 >>> 0;
                $3_1 = $4 ? $2 : $3_1;
                $1_1 = $4 ? $0_1 : $1_1;
                $2 = $0_1;
                continue;
               }
               break;
              };
              $8 = HEAP32[$1_1 + 24 >> 2];
              $4 = HEAP32[$1_1 + 12 >> 2];
              if (($1_1 | 0) != ($4 | 0)) {
               $0_1 = HEAP32[$1_1 + 8 >> 2];
               HEAP32[$0_1 + 12 >> 2] = $4;
               HEAP32[$4 + 8 >> 2] = $0_1;
               break label$3;
              }
              $2 = $1_1 + 20 | 0;
              $0_1 = HEAP32[$2 >> 2];
              if (!$0_1) {
               $0_1 = HEAP32[$1_1 + 16 >> 2];
               if (!$0_1) {
                break label$11
               }
               $2 = $1_1 + 16 | 0;
              }
              while (1) {
               $6_1 = $2;
               $4 = $0_1;
               $2 = $0_1 + 20 | 0;
               $0_1 = HEAP32[$2 >> 2];
               if ($0_1) {
                continue
               }
               $2 = $4 + 16 | 0;
               $0_1 = HEAP32[$4 + 16 >> 2];
               if ($0_1) {
                continue
               }
               break;
              };
              HEAP32[$6_1 >> 2] = 0;
              break label$3;
             }
             $7_1 = -1;
             if ($0_1 >>> 0 > 4294967231) {
              break label$12
             }
             $0_1 = $0_1 + 11 | 0;
             $7_1 = $0_1 & -8;
             $9_1 = HEAP32[471];
             if (!$9_1) {
              break label$12
             }
             $3_1 = 0 - $7_1 | 0;
             $5 = 0;
             label$30 : {
              if ($7_1 >>> 0 < 256) {
               break label$30
              }
              $5 = 31;
              if ($7_1 >>> 0 > 16777215) {
               break label$30
              }
              $0_1 = $0_1 >>> 8 | 0;
              $4 = $0_1 + 1048320 >>> 16 & 8;
              $0_1 = $0_1 << $4;
              $2 = $0_1 + 520192 >>> 16 & 4;
              $0_1 = $0_1 << $2;
              $1_1 = $0_1 + 245760 >>> 16 & 2;
              $0_1 = ($0_1 << $1_1 >>> 15 | 0) - ($1_1 | ($2 | $4)) | 0;
              $5 = ($0_1 << 1 | $7_1 >>> $0_1 + 21 & 1) + 28 | 0;
             }
             $2 = HEAP32[($5 << 2) + 2184 >> 2];
             label$31 : {
              label$32 : {
               label$33 : {
                if (!$2) {
                 $0_1 = 0;
                 $4 = 0;
                 break label$33;
                }
                $0_1 = 0;
                $1_1 = $7_1 << (($5 | 0) == 31 ? 0 : 25 - ($5 >>> 1 | 0) | 0);
                $4 = 0;
                while (1) {
                 label$36 : {
                  $6_1 = (HEAP32[$2 + 4 >> 2] & -8) - $7_1 | 0;
                  if ($6_1 >>> 0 >= $3_1 >>> 0) {
                   break label$36
                  }
                  $4 = $2;
                  $3_1 = $6_1;
                  if ($3_1) {
                   break label$36
                  }
                  $3_1 = 0;
                  $0_1 = $2;
                  break label$32;
                 }
                 $6_1 = HEAP32[$2 + 20 >> 2];
                 $2 = HEAP32[(($1_1 >>> 29 & 4) + $2 | 0) + 16 >> 2];
                 $0_1 = $6_1 ? (($6_1 | 0) == ($2 | 0) ? $0_1 : $6_1) : $0_1;
                 $1_1 = $1_1 << 1;
                 if ($2) {
                  continue
                 }
                 break;
                };
               }
               if (!($0_1 | $4)) {
                $4 = 0;
                $0_1 = 2 << $5;
                $0_1 = (0 - $0_1 | $0_1) & $9_1;
                if (!$0_1) {
                 break label$12
                }
                $1_1 = ($0_1 & 0 - $0_1) - 1 | 0;
                $0_1 = $1_1 >>> 12 & 16;
                $2 = $0_1;
                $1_1 = $1_1 >>> $0_1 | 0;
                $0_1 = $1_1 >>> 5 & 8;
                $2 = $2 | $0_1;
                $1_1 = $1_1 >>> $0_1 | 0;
                $0_1 = $1_1 >>> 2 & 4;
                $2 = $2 | $0_1;
                $1_1 = $1_1 >>> $0_1 | 0;
                $0_1 = $1_1 >>> 1 & 2;
                $2 = $2 | $0_1;
                $1_1 = $1_1 >>> $0_1 | 0;
                $0_1 = $1_1 >>> 1 & 1;
                $0_1 = HEAP32[(($2 | $0_1) + ($1_1 >>> $0_1 | 0) << 2) + 2184 >> 2];
               }
               if (!$0_1) {
                break label$31
               }
              }
              while (1) {
               $1_1 = (HEAP32[$0_1 + 4 >> 2] & -8) - $7_1 | 0;
               $2 = $1_1 >>> 0 < $3_1 >>> 0;
               $3_1 = $2 ? $1_1 : $3_1;
               $4 = $2 ? $0_1 : $4;
               $1_1 = HEAP32[$0_1 + 16 >> 2];
               if ($1_1) {
                $0_1 = $1_1
               } else {
                $0_1 = HEAP32[$0_1 + 20 >> 2]
               }
               if ($0_1) {
                continue
               }
               break;
              };
             }
             if (!$4 | HEAP32[472] - $7_1 >>> 0 <= $3_1 >>> 0) {
              break label$12
             }
             $5 = HEAP32[$4 + 24 >> 2];
             $1_1 = HEAP32[$4 + 12 >> 2];
             if (($1_1 | 0) != ($4 | 0)) {
              $0_1 = HEAP32[$4 + 8 >> 2];
              HEAP32[$0_1 + 12 >> 2] = $1_1;
              HEAP32[$1_1 + 8 >> 2] = $0_1;
              break label$4;
             }
             $2 = $4 + 20 | 0;
             $0_1 = HEAP32[$2 >> 2];
             if (!$0_1) {
              $0_1 = HEAP32[$4 + 16 >> 2];
              if (!$0_1) {
               break label$10
              }
              $2 = $4 + 16 | 0;
             }
             while (1) {
              $6_1 = $2;
              $1_1 = $0_1;
              $2 = $0_1 + 20 | 0;
              $0_1 = HEAP32[$2 >> 2];
              if ($0_1) {
               continue
              }
              $2 = $1_1 + 16 | 0;
              $0_1 = HEAP32[$1_1 + 16 >> 2];
              if ($0_1) {
               continue
              }
              break;
             };
             HEAP32[$6_1 >> 2] = 0;
             break label$4;
            }
            $2 = HEAP32[472];
            if ($7_1 >>> 0 <= $2 >>> 0) {
             $3_1 = HEAP32[475];
             $1_1 = $2 - $7_1 | 0;
             label$44 : {
              if ($1_1 >>> 0 >= 16) {
               HEAP32[472] = $1_1;
               $0_1 = $3_1 + $7_1 | 0;
               HEAP32[475] = $0_1;
               HEAP32[$0_1 + 4 >> 2] = $1_1 | 1;
               HEAP32[$2 + $3_1 >> 2] = $1_1;
               HEAP32[$3_1 + 4 >> 2] = $7_1 | 3;
               break label$44;
              }
              HEAP32[475] = 0;
              HEAP32[472] = 0;
              HEAP32[$3_1 + 4 >> 2] = $2 | 3;
              $0_1 = $2 + $3_1 | 0;
              HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] | 1;
             }
             $0_1 = $3_1 + 8 | 0;
             break label$2;
            }
            $5 = HEAP32[473];
            if ($7_1 >>> 0 < $5 >>> 0) {
             $1_1 = $5 - $7_1 | 0;
             HEAP32[473] = $1_1;
             $2 = HEAP32[476];
             $0_1 = $2 + $7_1 | 0;
             HEAP32[476] = $0_1;
             HEAP32[$0_1 + 4 >> 2] = $1_1 | 1;
             HEAP32[$2 + 4 >> 2] = $7_1 | 3;
             $0_1 = $2 + 8 | 0;
             break label$2;
            }
            $0_1 = 0;
            if (HEAP32[588]) {
             $1_1 = HEAP32[590]
            } else {
             HEAP32[591] = -1;
             HEAP32[592] = -1;
             HEAP32[589] = 4096;
             HEAP32[590] = 4096;
             HEAP32[588] = $11 + 12 & -16 ^ 1431655768;
             HEAP32[593] = 0;
             HEAP32[581] = 0;
             $1_1 = 4096;
            }
            $9_1 = $7_1 + 47 | 0;
            $6_1 = $1_1 + $9_1 | 0;
            $4 = 0 - $1_1 | 0;
            $2 = $6_1 & $4;
            if ($2 >>> 0 <= $7_1 >>> 0) {
             break label$2
            }
            $1_1 = HEAP32[580];
            if ($1_1) {
             $8 = $1_1;
             $3_1 = HEAP32[578];
             $1_1 = $3_1 + $2 | 0;
             if ($8 >>> 0 < $1_1 >>> 0 | $1_1 >>> 0 <= $3_1 >>> 0) {
              break label$2
             }
            }
            if (HEAPU8[2324] & 4) {
             break label$7
            }
            label$50 : {
             label$51 : {
              $3_1 = HEAP32[476];
              if ($3_1) {
               $0_1 = 2328;
               while (1) {
                $1_1 = HEAP32[$0_1 >> 2];
                if ($3_1 >>> 0 < $1_1 + HEAP32[$0_1 + 4 >> 2] >>> 0 ? $3_1 >>> 0 >= $1_1 >>> 0 : 0) {
                 break label$51
                }
                $0_1 = HEAP32[$0_1 + 8 >> 2];
                if ($0_1) {
                 continue
                }
                break;
               };
              }
              $1_1 = $73(0);
              if (($1_1 | 0) == -1) {
               break label$8
              }
              $5 = $2;
              $3_1 = HEAP32[589];
              $0_1 = $3_1 - 1 | 0;
              if ($0_1 & $1_1) {
               $5 = ($2 - $1_1 | 0) + ($0_1 + $1_1 & 0 - $3_1) | 0
              }
              if ($5 >>> 0 <= $7_1 >>> 0 | $5 >>> 0 > 2147483646) {
               break label$8
              }
              $0_1 = HEAP32[580];
              if ($0_1) {
               $6_1 = $0_1;
               $3_1 = HEAP32[578];
               $0_1 = $3_1 + $5 | 0;
               if ($6_1 >>> 0 < $0_1 >>> 0 | $0_1 >>> 0 <= $3_1 >>> 0) {
                break label$8
               }
              }
              $0_1 = $73($5);
              if (($1_1 | 0) != ($0_1 | 0)) {
               break label$50
              }
              break label$6;
             }
             $5 = $4 & $6_1 - $5;
             if ($5 >>> 0 > 2147483646) {
              break label$8
             }
             $1_1 = $73($5);
             if (($1_1 | 0) == (HEAP32[$0_1 >> 2] + HEAP32[$0_1 + 4 >> 2] | 0)) {
              break label$9
             }
             $0_1 = $1_1;
            }
            if (!(($0_1 | 0) == -1 | $7_1 + 48 >>> 0 <= $5 >>> 0)) {
             $1_1 = HEAP32[590];
             $1_1 = $1_1 + ($9_1 - $5 | 0) & 0 - $1_1;
             if ($1_1 >>> 0 > 2147483646) {
              $1_1 = $0_1;
              break label$6;
             }
             if (($73($1_1) | 0) != -1) {
              $5 = $1_1 + $5 | 0;
              $1_1 = $0_1;
              break label$6;
             }
             $73(0 - $5 | 0);
             break label$8;
            }
            $1_1 = $0_1;
            if (($0_1 | 0) != -1) {
             break label$6
            }
            break label$8;
           }
           $4 = 0;
           break label$3;
          }
          $1_1 = 0;
          break label$4;
         }
         if (($1_1 | 0) != -1) {
          break label$6
         }
        }
        HEAP32[581] = HEAP32[581] | 4;
       }
       if ($2 >>> 0 > 2147483646) {
        break label$5
       }
       $1_1 = $73($2);
       $0_1 = $73(0);
       if (($1_1 | 0) == -1 | ($0_1 | 0) == -1 | $0_1 >>> 0 <= $1_1 >>> 0) {
        break label$5
       }
       $5 = $0_1 - $1_1 | 0;
       if ($5 >>> 0 <= $7_1 + 40 >>> 0) {
        break label$5
       }
      }
      $0_1 = HEAP32[578] + $5 | 0;
      HEAP32[578] = $0_1;
      if (HEAPU32[579] < $0_1 >>> 0) {
       HEAP32[579] = $0_1
      }
      label$61 : {
       label$62 : {
        label$63 : {
         $6_1 = HEAP32[476];
         if ($6_1) {
          $0_1 = 2328;
          while (1) {
           $3_1 = HEAP32[$0_1 >> 2];
           $2 = HEAP32[$0_1 + 4 >> 2];
           if (($3_1 + $2 | 0) == ($1_1 | 0)) {
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
         $0_1 = HEAP32[474];
         if (!($0_1 >>> 0 <= $1_1 >>> 0 ? $0_1 : 0)) {
          HEAP32[474] = $1_1
         }
         $0_1 = 0;
         HEAP32[583] = $5;
         HEAP32[582] = $1_1;
         HEAP32[478] = -1;
         HEAP32[479] = HEAP32[588];
         HEAP32[585] = 0;
         while (1) {
          $3_1 = $0_1 << 3;
          $2 = $3_1 + 1920 | 0;
          HEAP32[$3_1 + 1928 >> 2] = $2;
          HEAP32[$3_1 + 1932 >> 2] = $2;
          $0_1 = $0_1 + 1 | 0;
          if (($0_1 | 0) != 32) {
           continue
          }
          break;
         };
         $3_1 = $5 - 40 | 0;
         $0_1 = $1_1 + 8 & 7 ? -8 - $1_1 & 7 : 0;
         $2 = $3_1 - $0_1 | 0;
         HEAP32[473] = $2;
         $0_1 = $0_1 + $1_1 | 0;
         HEAP32[476] = $0_1;
         HEAP32[$0_1 + 4 >> 2] = $2 | 1;
         HEAP32[($1_1 + $3_1 | 0) + 4 >> 2] = 40;
         HEAP32[477] = HEAP32[592];
         break label$61;
        }
        if (HEAPU8[$0_1 + 12 | 0] & 8 | $3_1 >>> 0 > $6_1 >>> 0 | $1_1 >>> 0 <= $6_1 >>> 0) {
         break label$62
        }
        HEAP32[$0_1 + 4 >> 2] = $2 + $5;
        $0_1 = $6_1 + 8 & 7 ? -8 - $6_1 & 7 : 0;
        $2 = $0_1 + $6_1 | 0;
        HEAP32[476] = $2;
        $1_1 = HEAP32[473] + $5 | 0;
        $0_1 = $1_1 - $0_1 | 0;
        HEAP32[473] = $0_1;
        HEAP32[$2 + 4 >> 2] = $0_1 | 1;
        HEAP32[($1_1 + $6_1 | 0) + 4 >> 2] = 40;
        HEAP32[477] = HEAP32[592];
        break label$61;
       }
       if ($1_1 >>> 0 < HEAPU32[474]) {
        HEAP32[474] = $1_1
       }
       $2 = $1_1 + $5 | 0;
       $0_1 = 2328;
       label$71 : {
        label$72 : {
         label$73 : {
          label$74 : {
           label$75 : {
            label$76 : {
             while (1) {
              if (HEAP32[$0_1 >> 2] != ($2 | 0)) {
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
            $0_1 = 2328;
            while (1) {
             $2 = HEAP32[$0_1 >> 2];
             if ($6_1 >>> 0 >= $2 >>> 0) {
              $4 = $2 + HEAP32[$0_1 + 4 >> 2] | 0;
              if ($4 >>> 0 > $6_1 >>> 0) {
               break label$74
              }
             }
             $0_1 = HEAP32[$0_1 + 8 >> 2];
             continue;
            };
           }
           HEAP32[$0_1 >> 2] = $1_1;
           HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] + $5;
           $9_1 = ($1_1 + 8 & 7 ? -8 - $1_1 & 7 : 0) + $1_1 | 0;
           HEAP32[$9_1 + 4 >> 2] = $7_1 | 3;
           $5 = $2 + ($2 + 8 & 7 ? -8 - $2 & 7 : 0) | 0;
           $8 = $7_1 + $9_1 | 0;
           $2 = $5 - $8 | 0;
           if (($5 | 0) == ($6_1 | 0)) {
            HEAP32[476] = $8;
            $0_1 = HEAP32[473] + $2 | 0;
            HEAP32[473] = $0_1;
            HEAP32[$8 + 4 >> 2] = $0_1 | 1;
            break label$72;
           }
           if (($5 | 0) == HEAP32[475]) {
            HEAP32[475] = $8;
            $0_1 = HEAP32[472] + $2 | 0;
            HEAP32[472] = $0_1;
            HEAP32[$8 + 4 >> 2] = $0_1 | 1;
            HEAP32[$0_1 + $8 >> 2] = $0_1;
            break label$72;
           }
           $0_1 = HEAP32[$5 + 4 >> 2];
           if (($0_1 & 3) == 1) {
            $6_1 = $0_1 & -8;
            label$86 : {
             if ($0_1 >>> 0 <= 255) {
              $3_1 = HEAP32[$5 + 8 >> 2];
              $0_1 = $0_1 >>> 3 | 0;
              $1_1 = HEAP32[$5 + 12 >> 2];
              if (($3_1 | 0) == ($1_1 | 0)) {
               HEAP32[470] = HEAP32[470] & __wasm_rotl_i32($0_1);
               break label$86;
              }
              HEAP32[$3_1 + 12 >> 2] = $1_1;
              HEAP32[$1_1 + 8 >> 2] = $3_1;
              break label$86;
             }
             $7_1 = HEAP32[$5 + 24 >> 2];
             $1_1 = HEAP32[$5 + 12 >> 2];
             label$89 : {
              if (($5 | 0) != ($1_1 | 0)) {
               $0_1 = HEAP32[$5 + 8 >> 2];
               HEAP32[$0_1 + 12 >> 2] = $1_1;
               HEAP32[$1_1 + 8 >> 2] = $0_1;
               break label$89;
              }
              label$91 : {
               $0_1 = $5 + 20 | 0;
               $3_1 = HEAP32[$0_1 >> 2];
               if ($3_1) {
                break label$91
               }
               $0_1 = $5 + 16 | 0;
               $3_1 = HEAP32[$0_1 >> 2];
               if ($3_1) {
                break label$91
               }
               $1_1 = 0;
               break label$89;
              }
              while (1) {
               $4 = $0_1;
               $1_1 = $3_1;
               $0_1 = $1_1 + 20 | 0;
               $3_1 = HEAP32[$0_1 >> 2];
               if ($3_1) {
                continue
               }
               $0_1 = $1_1 + 16 | 0;
               $3_1 = HEAP32[$1_1 + 16 >> 2];
               if ($3_1) {
                continue
               }
               break;
              };
              HEAP32[$4 >> 2] = 0;
             }
             if (!$7_1) {
              break label$86
             }
             $3_1 = HEAP32[$5 + 28 >> 2];
             $0_1 = ($3_1 << 2) + 2184 | 0;
             label$93 : {
              if (($5 | 0) == HEAP32[$0_1 >> 2]) {
               HEAP32[$0_1 >> 2] = $1_1;
               if ($1_1) {
                break label$93
               }
               HEAP32[471] = HEAP32[471] & __wasm_rotl_i32($3_1);
               break label$86;
              }
              HEAP32[$7_1 + (HEAP32[$7_1 + 16 >> 2] == ($5 | 0) ? 16 : 20) >> 2] = $1_1;
              if (!$1_1) {
               break label$86
              }
             }
             HEAP32[$1_1 + 24 >> 2] = $7_1;
             $0_1 = HEAP32[$5 + 16 >> 2];
             if ($0_1) {
              HEAP32[$1_1 + 16 >> 2] = $0_1;
              HEAP32[$0_1 + 24 >> 2] = $1_1;
             }
             $0_1 = HEAP32[$5 + 20 >> 2];
             if (!$0_1) {
              break label$86
             }
             HEAP32[$1_1 + 20 >> 2] = $0_1;
             HEAP32[$0_1 + 24 >> 2] = $1_1;
            }
            $5 = $5 + $6_1 | 0;
            $2 = $2 + $6_1 | 0;
           }
           HEAP32[$5 + 4 >> 2] = HEAP32[$5 + 4 >> 2] & -2;
           HEAP32[$8 + 4 >> 2] = $2 | 1;
           HEAP32[$2 + $8 >> 2] = $2;
           if ($2 >>> 0 <= 255) {
            $0_1 = $2 >>> 3 | 0;
            $2 = ($0_1 << 3) + 1920 | 0;
            $1_1 = HEAP32[470];
            $0_1 = 1 << $0_1;
            label$97 : {
             if (!($1_1 & $0_1)) {
              HEAP32[470] = $0_1 | $1_1;
              $0_1 = $2;
              break label$97;
             }
             $0_1 = HEAP32[$2 + 8 >> 2];
            }
            HEAP32[$2 + 8 >> 2] = $8;
            HEAP32[$0_1 + 12 >> 2] = $8;
            HEAP32[$8 + 12 >> 2] = $2;
            HEAP32[$8 + 8 >> 2] = $0_1;
            break label$72;
           }
           $0_1 = 31;
           if ($2 >>> 0 <= 16777215) {
            $0_1 = $2 >>> 8 | 0;
            $4 = $0_1 + 1048320 >>> 16 & 8;
            $0_1 = $0_1 << $4;
            $3_1 = $0_1 + 520192 >>> 16 & 4;
            $0_1 = $0_1 << $3_1;
            $1_1 = $0_1 + 245760 >>> 16 & 2;
            $0_1 = ($0_1 << $1_1 >>> 15 | 0) - ($1_1 | ($3_1 | $4)) | 0;
            $0_1 = ($0_1 << 1 | $2 >>> $0_1 + 21 & 1) + 28 | 0;
           }
           HEAP32[$8 + 28 >> 2] = $0_1;
           HEAP32[$8 + 16 >> 2] = 0;
           HEAP32[$8 + 20 >> 2] = 0;
           $4 = ($0_1 << 2) + 2184 | 0;
           $3_1 = HEAP32[471];
           $1_1 = 1 << $0_1;
           label$100 : {
            if (!($3_1 & $1_1)) {
             HEAP32[471] = $1_1 | $3_1;
             HEAP32[$4 >> 2] = $8;
             HEAP32[$8 + 24 >> 2] = $4;
             break label$100;
            }
            $0_1 = $2 << (($0_1 | 0) == 31 ? 0 : 25 - ($0_1 >>> 1 | 0) | 0);
            $1_1 = HEAP32[$4 >> 2];
            while (1) {
             $3_1 = $1_1;
             if ((HEAP32[$1_1 + 4 >> 2] & -8) == ($2 | 0)) {
              break label$73
             }
             $1_1 = $0_1 >>> 29 | 0;
             $0_1 = $0_1 << 1;
             $4 = ($3_1 + ($1_1 & 4) | 0) + 16 | 0;
             $1_1 = HEAP32[$4 >> 2];
             if ($1_1) {
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
          $3_1 = $5 - 40 | 0;
          $0_1 = $1_1 + 8 & 7 ? -8 - $1_1 & 7 : 0;
          $2 = $3_1 - $0_1 | 0;
          HEAP32[473] = $2;
          $0_1 = $0_1 + $1_1 | 0;
          HEAP32[476] = $0_1;
          HEAP32[$0_1 + 4 >> 2] = $2 | 1;
          HEAP32[($1_1 + $3_1 | 0) + 4 >> 2] = 40;
          HEAP32[477] = HEAP32[592];
          $0_1 = ($4 + ($4 - 39 & 7 ? 39 - $4 & 7 : 0) | 0) - 47 | 0;
          $3_1 = $0_1 >>> 0 < $6_1 + 16 >>> 0 ? $6_1 : $0_1;
          HEAP32[$3_1 + 4 >> 2] = 27;
          $2 = HEAP32[585];
          $0_1 = $3_1 + 16 | 0;
          HEAP32[$0_1 >> 2] = HEAP32[584];
          HEAP32[$0_1 + 4 >> 2] = $2;
          $0_1 = HEAP32[583];
          HEAP32[$3_1 + 8 >> 2] = HEAP32[582];
          HEAP32[$3_1 + 12 >> 2] = $0_1;
          HEAP32[584] = $3_1 + 8;
          HEAP32[583] = $5;
          HEAP32[582] = $1_1;
          HEAP32[585] = 0;
          $0_1 = $3_1 + 24 | 0;
          while (1) {
           HEAP32[$0_1 + 4 >> 2] = 7;
           $1_1 = $0_1 + 8 | 0;
           $0_1 = $0_1 + 4 | 0;
           if ($1_1 >>> 0 < $4 >>> 0) {
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
           $2 = ($0_1 << 3) + 1920 | 0;
           $1_1 = HEAP32[470];
           $0_1 = 1 << $0_1;
           label$105 : {
            if (!($1_1 & $0_1)) {
             HEAP32[470] = $0_1 | $1_1;
             $0_1 = $2;
             break label$105;
            }
            $0_1 = HEAP32[$2 + 8 >> 2];
           }
           HEAP32[$2 + 8 >> 2] = $6_1;
           HEAP32[$0_1 + 12 >> 2] = $6_1;
           HEAP32[$6_1 + 12 >> 2] = $2;
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
           $2 = $0_1 + 520192 >>> 16 & 4;
           $0_1 = $0_1 << $2;
           $1_1 = $0_1 + 245760 >>> 16 & 2;
           $0_1 = ($0_1 << $1_1 >>> 15 | 0) - ($1_1 | ($2 | $3_1)) | 0;
           $0_1 = ($0_1 << 1 | $4 >>> $0_1 + 21 & 1) + 28 | 0;
          }
          HEAP32[$6_1 + 28 >> 2] = $0_1;
          $3_1 = ($0_1 << 2) + 2184 | 0;
          $2 = HEAP32[471];
          $1_1 = 1 << $0_1;
          label$108 : {
           if (!($2 & $1_1)) {
            HEAP32[471] = $1_1 | $2;
            HEAP32[$3_1 >> 2] = $6_1;
            HEAP32[$6_1 + 24 >> 2] = $3_1;
            break label$108;
           }
           $0_1 = $4 << (($0_1 | 0) == 31 ? 0 : 25 - ($0_1 >>> 1 | 0) | 0);
           $1_1 = HEAP32[$3_1 >> 2];
           while (1) {
            $2 = $1_1;
            if (($4 | 0) == (HEAP32[$1_1 + 4 >> 2] & -8)) {
             break label$71
            }
            $1_1 = $0_1 >>> 29 | 0;
            $0_1 = $0_1 << 1;
            $3_1 = ($2 + ($1_1 & 4) | 0) + 16 | 0;
            $1_1 = HEAP32[$3_1 >> 2];
            if ($1_1) {
             continue
            }
            break;
           };
           HEAP32[$3_1 >> 2] = $6_1;
           HEAP32[$6_1 + 24 >> 2] = $2;
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
       $0_1 = HEAP32[$2 + 8 >> 2];
       HEAP32[$0_1 + 12 >> 2] = $6_1;
       HEAP32[$2 + 8 >> 2] = $6_1;
       HEAP32[$6_1 + 24 >> 2] = 0;
       HEAP32[$6_1 + 12 >> 2] = $2;
       HEAP32[$6_1 + 8 >> 2] = $0_1;
      }
      $0_1 = HEAP32[473];
      if ($0_1 >>> 0 <= $7_1 >>> 0) {
       break label$5
      }
      $1_1 = $0_1 - $7_1 | 0;
      HEAP32[473] = $1_1;
      $2 = HEAP32[476];
      $0_1 = $2 + $7_1 | 0;
      HEAP32[476] = $0_1;
      HEAP32[$0_1 + 4 >> 2] = $1_1 | 1;
      HEAP32[$2 + 4 >> 2] = $7_1 | 3;
      $0_1 = $2 + 8 | 0;
      break label$2;
     }
     HEAP32[468] = 48;
     $0_1 = 0;
     break label$2;
    }
    label$111 : {
     if (!$5) {
      break label$111
     }
     $2 = HEAP32[$4 + 28 >> 2];
     $0_1 = ($2 << 2) + 2184 | 0;
     label$112 : {
      if (($4 | 0) == HEAP32[$0_1 >> 2]) {
       HEAP32[$0_1 >> 2] = $1_1;
       if ($1_1) {
        break label$112
       }
       $9_1 = __wasm_rotl_i32($2) & $9_1;
       HEAP32[471] = $9_1;
       break label$111;
      }
      HEAP32[$5 + (HEAP32[$5 + 16 >> 2] == ($4 | 0) ? 16 : 20) >> 2] = $1_1;
      if (!$1_1) {
       break label$111
      }
     }
     HEAP32[$1_1 + 24 >> 2] = $5;
     $0_1 = HEAP32[$4 + 16 >> 2];
     if ($0_1) {
      HEAP32[$1_1 + 16 >> 2] = $0_1;
      HEAP32[$0_1 + 24 >> 2] = $1_1;
     }
     $0_1 = HEAP32[$4 + 20 >> 2];
     if (!$0_1) {
      break label$111
     }
     HEAP32[$1_1 + 20 >> 2] = $0_1;
     HEAP32[$0_1 + 24 >> 2] = $1_1;
    }
    label$115 : {
     if ($3_1 >>> 0 <= 15) {
      $0_1 = $3_1 + $7_1 | 0;
      HEAP32[$4 + 4 >> 2] = $0_1 | 3;
      $0_1 = $0_1 + $4 | 0;
      HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] | 1;
      break label$115;
     }
     HEAP32[$4 + 4 >> 2] = $7_1 | 3;
     $5 = $4 + $7_1 | 0;
     HEAP32[$5 + 4 >> 2] = $3_1 | 1;
     HEAP32[$3_1 + $5 >> 2] = $3_1;
     if ($3_1 >>> 0 <= 255) {
      $0_1 = $3_1 >>> 3 | 0;
      $2 = ($0_1 << 3) + 1920 | 0;
      $1_1 = HEAP32[470];
      $0_1 = 1 << $0_1;
      label$118 : {
       if (!($1_1 & $0_1)) {
        HEAP32[470] = $0_1 | $1_1;
        $0_1 = $2;
        break label$118;
       }
       $0_1 = HEAP32[$2 + 8 >> 2];
      }
      HEAP32[$2 + 8 >> 2] = $5;
      HEAP32[$0_1 + 12 >> 2] = $5;
      HEAP32[$5 + 12 >> 2] = $2;
      HEAP32[$5 + 8 >> 2] = $0_1;
      break label$115;
     }
     $0_1 = 31;
     if ($3_1 >>> 0 <= 16777215) {
      $0_1 = $3_1 >>> 8 | 0;
      $6_1 = $0_1 + 1048320 >>> 16 & 8;
      $0_1 = $0_1 << $6_1;
      $2 = $0_1 + 520192 >>> 16 & 4;
      $0_1 = $0_1 << $2;
      $1_1 = $0_1 + 245760 >>> 16 & 2;
      $0_1 = ($0_1 << $1_1 >>> 15 | 0) - ($1_1 | ($2 | $6_1)) | 0;
      $0_1 = ($0_1 << 1 | $3_1 >>> $0_1 + 21 & 1) + 28 | 0;
     }
     HEAP32[$5 + 28 >> 2] = $0_1;
     HEAP32[$5 + 16 >> 2] = 0;
     HEAP32[$5 + 20 >> 2] = 0;
     $1_1 = ($0_1 << 2) + 2184 | 0;
     label$121 : {
      $2 = 1 << $0_1;
      label$122 : {
       if (!($2 & $9_1)) {
        HEAP32[471] = $2 | $9_1;
        HEAP32[$1_1 >> 2] = $5;
        break label$122;
       }
       $0_1 = $3_1 << (($0_1 | 0) == 31 ? 0 : 25 - ($0_1 >>> 1 | 0) | 0);
       $7_1 = HEAP32[$1_1 >> 2];
       while (1) {
        $1_1 = $7_1;
        if ((HEAP32[$1_1 + 4 >> 2] & -8) == ($3_1 | 0)) {
         break label$121
        }
        $2 = $0_1 >>> 29 | 0;
        $0_1 = $0_1 << 1;
        $2 = ($1_1 + ($2 & 4) | 0) + 16 | 0;
        $7_1 = HEAP32[$2 >> 2];
        if ($7_1) {
         continue
        }
        break;
       };
       HEAP32[$2 >> 2] = $5;
      }
      HEAP32[$5 + 24 >> 2] = $1_1;
      HEAP32[$5 + 12 >> 2] = $5;
      HEAP32[$5 + 8 >> 2] = $5;
      break label$115;
     }
     $0_1 = HEAP32[$1_1 + 8 >> 2];
     HEAP32[$0_1 + 12 >> 2] = $5;
     HEAP32[$1_1 + 8 >> 2] = $5;
     HEAP32[$5 + 24 >> 2] = 0;
     HEAP32[$5 + 12 >> 2] = $1_1;
     HEAP32[$5 + 8 >> 2] = $0_1;
    }
    $0_1 = $4 + 8 | 0;
    break label$2;
   }
   label$125 : {
    if (!$8) {
     break label$125
    }
    $2 = HEAP32[$1_1 + 28 >> 2];
    $0_1 = ($2 << 2) + 2184 | 0;
    label$126 : {
     if (($1_1 | 0) == HEAP32[$0_1 >> 2]) {
      HEAP32[$0_1 >> 2] = $4;
      if ($4) {
       break label$126
      }
      HEAP32[471] = __wasm_rotl_i32($2) & $9_1;
      break label$125;
     }
     HEAP32[(HEAP32[$8 + 16 >> 2] == ($1_1 | 0) ? 16 : 20) + $8 >> 2] = $4;
     if (!$4) {
      break label$125
     }
    }
    HEAP32[$4 + 24 >> 2] = $8;
    $0_1 = HEAP32[$1_1 + 16 >> 2];
    if ($0_1) {
     HEAP32[$4 + 16 >> 2] = $0_1;
     HEAP32[$0_1 + 24 >> 2] = $4;
    }
    $0_1 = HEAP32[$1_1 + 20 >> 2];
    if (!$0_1) {
     break label$125
    }
    HEAP32[$4 + 20 >> 2] = $0_1;
    HEAP32[$0_1 + 24 >> 2] = $4;
   }
   label$129 : {
    if ($3_1 >>> 0 <= 15) {
     $0_1 = $3_1 + $7_1 | 0;
     HEAP32[$1_1 + 4 >> 2] = $0_1 | 3;
     $0_1 = $0_1 + $1_1 | 0;
     HEAP32[$0_1 + 4 >> 2] = HEAP32[$0_1 + 4 >> 2] | 1;
     break label$129;
    }
    HEAP32[$1_1 + 4 >> 2] = $7_1 | 3;
    $2 = $1_1 + $7_1 | 0;
    HEAP32[$2 + 4 >> 2] = $3_1 | 1;
    HEAP32[$2 + $3_1 >> 2] = $3_1;
    if ($10_1) {
     $0_1 = $10_1 >>> 3 | 0;
     $6_1 = ($0_1 << 3) + 1920 | 0;
     $4 = HEAP32[475];
     $0_1 = 1 << $0_1;
     label$132 : {
      if (!($0_1 & $5)) {
       HEAP32[470] = $0_1 | $5;
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
    HEAP32[475] = $2;
    HEAP32[472] = $3_1;
   }
   $0_1 = $1_1 + 8 | 0;
  }
  global$0 = $11 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $71($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2 = 0, $3_1 = 0, $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0;
  label$1 : {
   if (!$0_1) {
    break label$1
   }
   $3_1 = $0_1 - 8 | 0;
   $1_1 = HEAP32[$0_1 - 4 >> 2];
   $0_1 = $1_1 & -8;
   $5 = $3_1 + $0_1 | 0;
   label$2 : {
    if ($1_1 & 1) {
     break label$2
    }
    if (!($1_1 & 3)) {
     break label$1
    }
    $1_1 = HEAP32[$3_1 >> 2];
    $3_1 = $3_1 - $1_1 | 0;
    if ($3_1 >>> 0 < HEAPU32[474]) {
     break label$1
    }
    $0_1 = $0_1 + $1_1 | 0;
    if (($3_1 | 0) != HEAP32[475]) {
     if ($1_1 >>> 0 <= 255) {
      $2 = HEAP32[$3_1 + 8 >> 2];
      $4 = $1_1 >>> 3 | 0;
      $1_1 = HEAP32[$3_1 + 12 >> 2];
      if (($2 | 0) == ($1_1 | 0)) {
       HEAP32[470] = HEAP32[470] & __wasm_rotl_i32($4);
       break label$2;
      }
      HEAP32[$2 + 12 >> 2] = $1_1;
      HEAP32[$1_1 + 8 >> 2] = $2;
      break label$2;
     }
     $7_1 = HEAP32[$3_1 + 24 >> 2];
     $1_1 = HEAP32[$3_1 + 12 >> 2];
     label$6 : {
      if (($3_1 | 0) != ($1_1 | 0)) {
       $2 = HEAP32[$3_1 + 8 >> 2];
       HEAP32[$2 + 12 >> 2] = $1_1;
       HEAP32[$1_1 + 8 >> 2] = $2;
       break label$6;
      }
      label$8 : {
       $2 = $3_1 + 20 | 0;
       $4 = HEAP32[$2 >> 2];
       if ($4) {
        break label$8
       }
       $2 = $3_1 + 16 | 0;
       $4 = HEAP32[$2 >> 2];
       if ($4) {
        break label$8
       }
       $1_1 = 0;
       break label$6;
      }
      while (1) {
       $6_1 = $2;
       $1_1 = $4;
       $2 = $1_1 + 20 | 0;
       $4 = HEAP32[$2 >> 2];
       if ($4) {
        continue
       }
       $2 = $1_1 + 16 | 0;
       $4 = HEAP32[$1_1 + 16 >> 2];
       if ($4) {
        continue
       }
       break;
      };
      HEAP32[$6_1 >> 2] = 0;
     }
     if (!$7_1) {
      break label$2
     }
     $2 = HEAP32[$3_1 + 28 >> 2];
     $4 = ($2 << 2) + 2184 | 0;
     label$10 : {
      if (($3_1 | 0) == HEAP32[$4 >> 2]) {
       HEAP32[$4 >> 2] = $1_1;
       if ($1_1) {
        break label$10
       }
       HEAP32[471] = HEAP32[471] & __wasm_rotl_i32($2);
       break label$2;
      }
      HEAP32[$7_1 + (HEAP32[$7_1 + 16 >> 2] == ($3_1 | 0) ? 16 : 20) >> 2] = $1_1;
      if (!$1_1) {
       break label$2
      }
     }
     HEAP32[$1_1 + 24 >> 2] = $7_1;
     $2 = HEAP32[$3_1 + 16 >> 2];
     if ($2) {
      HEAP32[$1_1 + 16 >> 2] = $2;
      HEAP32[$2 + 24 >> 2] = $1_1;
     }
     $2 = HEAP32[$3_1 + 20 >> 2];
     if (!$2) {
      break label$2
     }
     HEAP32[$1_1 + 20 >> 2] = $2;
     HEAP32[$2 + 24 >> 2] = $1_1;
     break label$2;
    }
    $1_1 = HEAP32[$5 + 4 >> 2];
    if (($1_1 & 3) != 3) {
     break label$2
    }
    HEAP32[472] = $0_1;
    HEAP32[$5 + 4 >> 2] = $1_1 & -2;
    HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
    HEAP32[$0_1 + $3_1 >> 2] = $0_1;
    return;
   }
   if ($3_1 >>> 0 >= $5 >>> 0) {
    break label$1
   }
   $1_1 = HEAP32[$5 + 4 >> 2];
   if (!($1_1 & 1)) {
    break label$1
   }
   label$13 : {
    if (!($1_1 & 2)) {
     if (HEAP32[476] == ($5 | 0)) {
      HEAP32[476] = $3_1;
      $0_1 = HEAP32[473] + $0_1 | 0;
      HEAP32[473] = $0_1;
      HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
      if (HEAP32[475] != ($3_1 | 0)) {
       break label$1
      }
      HEAP32[472] = 0;
      HEAP32[475] = 0;
      return;
     }
     if (HEAP32[475] == ($5 | 0)) {
      HEAP32[475] = $3_1;
      $0_1 = HEAP32[472] + $0_1 | 0;
      HEAP32[472] = $0_1;
      HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
      HEAP32[$0_1 + $3_1 >> 2] = $0_1;
      return;
     }
     $0_1 = ($1_1 & -8) + $0_1 | 0;
     label$17 : {
      if ($1_1 >>> 0 <= 255) {
       $2 = HEAP32[$5 + 8 >> 2];
       $4 = $1_1 >>> 3 | 0;
       $1_1 = HEAP32[$5 + 12 >> 2];
       if (($2 | 0) == ($1_1 | 0)) {
        HEAP32[470] = HEAP32[470] & __wasm_rotl_i32($4);
        break label$17;
       }
       HEAP32[$2 + 12 >> 2] = $1_1;
       HEAP32[$1_1 + 8 >> 2] = $2;
       break label$17;
      }
      $7_1 = HEAP32[$5 + 24 >> 2];
      $1_1 = HEAP32[$5 + 12 >> 2];
      label$20 : {
       if (($1_1 | 0) != ($5 | 0)) {
        $2 = HEAP32[$5 + 8 >> 2];
        HEAP32[$2 + 12 >> 2] = $1_1;
        HEAP32[$1_1 + 8 >> 2] = $2;
        break label$20;
       }
       label$22 : {
        $2 = $5 + 20 | 0;
        $4 = HEAP32[$2 >> 2];
        if ($4) {
         break label$22
        }
        $2 = $5 + 16 | 0;
        $4 = HEAP32[$2 >> 2];
        if ($4) {
         break label$22
        }
        $1_1 = 0;
        break label$20;
       }
       while (1) {
        $6_1 = $2;
        $1_1 = $4;
        $2 = $1_1 + 20 | 0;
        $4 = HEAP32[$2 >> 2];
        if ($4) {
         continue
        }
        $2 = $1_1 + 16 | 0;
        $4 = HEAP32[$1_1 + 16 >> 2];
        if ($4) {
         continue
        }
        break;
       };
       HEAP32[$6_1 >> 2] = 0;
      }
      if (!$7_1) {
       break label$17
      }
      $2 = HEAP32[$5 + 28 >> 2];
      $4 = ($2 << 2) + 2184 | 0;
      label$24 : {
       if (HEAP32[$4 >> 2] == ($5 | 0)) {
        HEAP32[$4 >> 2] = $1_1;
        if ($1_1) {
         break label$24
        }
        HEAP32[471] = HEAP32[471] & __wasm_rotl_i32($2);
        break label$17;
       }
       HEAP32[$7_1 + (($5 | 0) == HEAP32[$7_1 + 16 >> 2] ? 16 : 20) >> 2] = $1_1;
       if (!$1_1) {
        break label$17
       }
      }
      HEAP32[$1_1 + 24 >> 2] = $7_1;
      $2 = HEAP32[$5 + 16 >> 2];
      if ($2) {
       HEAP32[$1_1 + 16 >> 2] = $2;
       HEAP32[$2 + 24 >> 2] = $1_1;
      }
      $2 = HEAP32[$5 + 20 >> 2];
      if (!$2) {
       break label$17
      }
      HEAP32[$1_1 + 20 >> 2] = $2;
      HEAP32[$2 + 24 >> 2] = $1_1;
     }
     HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
     HEAP32[$0_1 + $3_1 >> 2] = $0_1;
     if (HEAP32[475] != ($3_1 | 0)) {
      break label$13
     }
     HEAP32[472] = $0_1;
     return;
    }
    HEAP32[$5 + 4 >> 2] = $1_1 & -2;
    HEAP32[$3_1 + 4 >> 2] = $0_1 | 1;
    HEAP32[$0_1 + $3_1 >> 2] = $0_1;
   }
   if ($0_1 >>> 0 <= 255) {
    $1_1 = $0_1 >>> 3 | 0;
    $0_1 = ($1_1 << 3) + 1920 | 0;
    $2 = HEAP32[470];
    $1_1 = 1 << $1_1;
    label$28 : {
     if (!($2 & $1_1)) {
      HEAP32[470] = $1_1 | $2;
      $2 = $0_1;
      break label$28;
     }
     $2 = HEAP32[$0_1 + 8 >> 2];
    }
    HEAP32[$0_1 + 8 >> 2] = $3_1;
    HEAP32[$2 + 12 >> 2] = $3_1;
    HEAP32[$3_1 + 12 >> 2] = $0_1;
    HEAP32[$3_1 + 8 >> 2] = $2;
    return;
   }
   $2 = 31;
   HEAP32[$3_1 + 16 >> 2] = 0;
   HEAP32[$3_1 + 20 >> 2] = 0;
   if ($0_1 >>> 0 <= 16777215) {
    $2 = $0_1 >>> 8 | 0;
    $1_1 = $2 + 1048320 >>> 16 & 8;
    $4 = $2 << $1_1;
    $2 = $4 + 520192 >>> 16 & 4;
    $6_1 = $4 << $2;
    $4 = $6_1 + 245760 >>> 16 & 2;
    $1_1 = ($6_1 << $4 >>> 15 | 0) - ($4 | ($1_1 | $2)) | 0;
    $2 = ($1_1 << 1 | $0_1 >>> $1_1 + 21 & 1) + 28 | 0;
   }
   HEAP32[$3_1 + 28 >> 2] = $2;
   $1_1 = ($2 << 2) + 2184 | 0;
   label$31 : {
    label$32 : {
     $4 = HEAP32[471];
     $6_1 = 1 << $2;
     label$33 : {
      if (!($4 & $6_1)) {
       HEAP32[471] = $4 | $6_1;
       HEAP32[$1_1 >> 2] = $3_1;
       HEAP32[$3_1 + 24 >> 2] = $1_1;
       break label$33;
      }
      $2 = $0_1 << (($2 | 0) == 31 ? 0 : 25 - ($2 >>> 1 | 0) | 0);
      $1_1 = HEAP32[$1_1 >> 2];
      while (1) {
       $4 = $1_1;
       if ((HEAP32[$1_1 + 4 >> 2] & -8) == ($0_1 | 0)) {
        break label$32
       }
       $1_1 = $2 >>> 29 | 0;
       $2 = $2 << 1;
       $6_1 = ($4 + ($1_1 & 4) | 0) + 16 | 0;
       $1_1 = HEAP32[$6_1 >> 2];
       if ($1_1) {
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
   $0_1 = HEAP32[478] - 1 | 0;
   HEAP32[478] = $0_1 ? $0_1 : -1;
  }
 }
 
 function $73($0_1) {
  var $1_1 = 0, $2 = 0;
  $1_1 = HEAP32[380];
  $2 = $0_1 + 3 & -4;
  $0_1 = $1_1 + $2 | 0;
  label$2 : {
   if ($0_1 >>> 0 <= $1_1 >>> 0 ? $2 : 0) {
    break label$2
   }
   if ($0_1 >>> 0 > __wasm_memory_size() << 16 >>> 0) {
    if (!(fimport$5($0_1 | 0) | 0)) {
     break label$2
    }
   }
   HEAP32[380] = $0_1;
   return $1_1;
  }
  HEAP32[468] = 48;
  return -1;
 }
 
 function $74($0_1, $1_1, $2) {
  var $3_1 = 0, $4 = 0, $5 = 0;
  if ($2 >>> 0 >= 512) {
   fimport$6($0_1 | 0, $1_1 | 0, $2 | 0) | 0;
   return $0_1;
  }
  $4 = $0_1 + $2 | 0;
  label$3 : {
   if (!(($0_1 ^ $1_1) & 3)) {
    label$5 : {
     if (!($0_1 & 3)) {
      $2 = $0_1;
      break label$5;
     }
     if (($2 | 0) < 1) {
      $2 = $0_1;
      break label$5;
     }
     $2 = $0_1;
     while (1) {
      HEAP8[$2 | 0] = HEAPU8[$1_1 | 0];
      $1_1 = $1_1 + 1 | 0;
      $2 = $2 + 1 | 0;
      if (!($2 & 3)) {
       break label$5
      }
      if ($2 >>> 0 < $4 >>> 0) {
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
     $5 = $3_1 + -64 | 0;
     if ($5 >>> 0 < $2 >>> 0) {
      break label$9
     }
     while (1) {
      HEAP32[$2 >> 2] = HEAP32[$1_1 >> 2];
      HEAP32[$2 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2];
      HEAP32[$2 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
      HEAP32[$2 + 12 >> 2] = HEAP32[$1_1 + 12 >> 2];
      HEAP32[$2 + 16 >> 2] = HEAP32[$1_1 + 16 >> 2];
      HEAP32[$2 + 20 >> 2] = HEAP32[$1_1 + 20 >> 2];
      HEAP32[$2 + 24 >> 2] = HEAP32[$1_1 + 24 >> 2];
      HEAP32[$2 + 28 >> 2] = HEAP32[$1_1 + 28 >> 2];
      HEAP32[$2 + 32 >> 2] = HEAP32[$1_1 + 32 >> 2];
      HEAP32[$2 + 36 >> 2] = HEAP32[$1_1 + 36 >> 2];
      HEAP32[$2 + 40 >> 2] = HEAP32[$1_1 + 40 >> 2];
      HEAP32[$2 + 44 >> 2] = HEAP32[$1_1 + 44 >> 2];
      HEAP32[$2 + 48 >> 2] = HEAP32[$1_1 + 48 >> 2];
      HEAP32[$2 + 52 >> 2] = HEAP32[$1_1 + 52 >> 2];
      HEAP32[$2 + 56 >> 2] = HEAP32[$1_1 + 56 >> 2];
      HEAP32[$2 + 60 >> 2] = HEAP32[$1_1 + 60 >> 2];
      $1_1 = $1_1 - -64 | 0;
      $2 = $2 - -64 | 0;
      if ($5 >>> 0 >= $2 >>> 0) {
       continue
      }
      break;
     };
    }
    if ($2 >>> 0 >= $3_1 >>> 0) {
     break label$3
    }
    while (1) {
     HEAP32[$2 >> 2] = HEAP32[$1_1 >> 2];
     $1_1 = $1_1 + 4 | 0;
     $2 = $2 + 4 | 0;
     if ($3_1 >>> 0 > $2 >>> 0) {
      continue
     }
     break;
    };
    break label$3;
   }
   if ($4 >>> 0 < 4) {
    $2 = $0_1;
    break label$3;
   }
   $3_1 = $4 - 4 | 0;
   if ($0_1 >>> 0 > $3_1 >>> 0) {
    $2 = $0_1;
    break label$3;
   }
   $2 = $0_1;
   while (1) {
    HEAP8[$2 | 0] = HEAPU8[$1_1 | 0];
    HEAP8[$2 + 1 | 0] = HEAPU8[$1_1 + 1 | 0];
    HEAP8[$2 + 2 | 0] = HEAPU8[$1_1 + 2 | 0];
    HEAP8[$2 + 3 | 0] = HEAPU8[$1_1 + 3 | 0];
    $1_1 = $1_1 + 4 | 0;
    $2 = $2 + 4 | 0;
    if ($3_1 >>> 0 >= $2 >>> 0) {
     continue
    }
    break;
   };
  }
  if ($2 >>> 0 < $4 >>> 0) {
   while (1) {
    HEAP8[$2 | 0] = HEAPU8[$1_1 | 0];
    $1_1 = $1_1 + 1 | 0;
    $2 = $2 + 1 | 0;
    if (($4 | 0) != ($2 | 0)) {
     continue
    }
    break;
   }
  }
  return $0_1;
 }
 
 function $75($0_1, $1_1) {
  var $2 = 0, $3_1 = 0, $4 = 0;
  label$2 : {
   if (!$1_1) {
    break label$2
   }
   $2 = $0_1 + $1_1 | 0;
   HEAP8[$2 - 1 | 0] = 0;
   HEAP8[$0_1 | 0] = 0;
   if ($1_1 >>> 0 < 3) {
    break label$2
   }
   HEAP8[$2 - 2 | 0] = 0;
   HEAP8[$0_1 + 1 | 0] = 0;
   HEAP8[$2 - 3 | 0] = 0;
   HEAP8[$0_1 + 2 | 0] = 0;
   if ($1_1 >>> 0 < 7) {
    break label$2
   }
   HEAP8[$2 - 4 | 0] = 0;
   HEAP8[$0_1 + 3 | 0] = 0;
   if ($1_1 >>> 0 < 9) {
    break label$2
   }
   $2 = 0 - $0_1 & 3;
   $0_1 = $2 + $0_1 | 0;
   HEAP32[$0_1 >> 2] = 0;
   $2 = $1_1 - $2 & -4;
   $1_1 = $2 + $0_1 | 0;
   HEAP32[$1_1 - 4 >> 2] = 0;
   if ($2 >>> 0 < 9) {
    break label$2
   }
   HEAP32[$0_1 + 8 >> 2] = 0;
   HEAP32[$0_1 + 4 >> 2] = 0;
   HEAP32[$1_1 - 8 >> 2] = 0;
   HEAP32[$1_1 - 12 >> 2] = 0;
   if ($2 >>> 0 < 25) {
    break label$2
   }
   HEAP32[$0_1 + 24 >> 2] = 0;
   HEAP32[$0_1 + 20 >> 2] = 0;
   HEAP32[$0_1 + 16 >> 2] = 0;
   HEAP32[$0_1 + 12 >> 2] = 0;
   HEAP32[$1_1 - 16 >> 2] = 0;
   HEAP32[$1_1 - 20 >> 2] = 0;
   HEAP32[$1_1 - 24 >> 2] = 0;
   HEAP32[$1_1 - 28 >> 2] = 0;
   $3_1 = $0_1 & 4 | 24;
   $1_1 = $2 - $3_1 | 0;
   if ($1_1 >>> 0 < 32) {
    break label$2
   }
   $4 = __wasm_i64_mul(0, 0, 1, 1);
   $2 = i64toi32_i32$HIGH_BITS;
   $3_1 = $0_1 + $3_1 | 0;
   while (1) {
    HEAP32[$3_1 + 24 >> 2] = $4;
    $0_1 = $2;
    HEAP32[$3_1 + 28 >> 2] = $0_1;
    HEAP32[$3_1 + 16 >> 2] = $4;
    HEAP32[$3_1 + 20 >> 2] = $0_1;
    HEAP32[$3_1 + 8 >> 2] = $4;
    HEAP32[$3_1 + 12 >> 2] = $0_1;
    HEAP32[$3_1 >> 2] = $4;
    HEAP32[$3_1 + 4 >> 2] = $0_1;
    $3_1 = $3_1 + 32 | 0;
    $1_1 = $1_1 - 32 | 0;
    if ($1_1 >>> 0 > 31) {
     continue
    }
    break;
   };
  }
 }
 
 function $77() {
  return global$0 | 0;
 }
 
 function $78($0_1) {
  $0_1 = $0_1 | 0;
  global$0 = $0_1;
 }
 
 function $79($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = global$0 - $0_1 & -16;
  global$0 = $0_1;
  return $0_1 | 0;
 }
 
 function $80($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2 = 0, $3_1 = 0, $4 = 0, $5 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 12;
   $2 = HEAP32[global$6 >> 2];
   $3_1 = HEAP32[$2 >> 2];
   $4 = HEAP32[$2 + 4 >> 2];
   $2 = HEAP32[$2 + 8 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $5 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $4 = $0_1;
   $3_1 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $5 : 0)) {
    $0_1 = FUNCTION_TABLE[$4 | 0]($3_1) | 0;
    if ((global$5 | 0) == 1) {
     break label$2
    }
    $2 = $0_1;
   }
   if (!global$5) {
    return $2 | 0
   }
   abort();
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $3_1;
  HEAP32[$0_1 + 4 >> 2] = $4;
  HEAP32[$0_1 + 8 >> 2] = $2;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 12;
  return 0;
 }
 
 function $81($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2 = 0, $3_1 = 0, $4 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 8;
   $2 = HEAP32[global$6 >> 2];
   $3_1 = HEAP32[$2 >> 2];
   $2 = HEAP32[$2 + 4 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $4 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $2 = $0_1;
   $3_1 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $4 : 0)) {
    FUNCTION_TABLE[$2 | 0]($3_1);
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $3_1;
  HEAP32[$0_1 + 4 >> 2] = $2;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 8;
 }
 
 function $82($0_1, $1_1, $2, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  var $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 20;
   $4 = HEAP32[global$6 >> 2];
   $5 = HEAP32[$4 >> 2];
   $6_1 = HEAP32[$4 + 4 >> 2];
   $7_1 = HEAP32[$4 + 8 >> 2];
   $8 = HEAP32[$4 + 12 >> 2];
   $4 = HEAP32[$4 + 16 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $9_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $6_1 = $2;
   $7_1 = $3_1;
   $8 = $0_1;
   $5 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $9_1 : 0)) {
    $0_1 = FUNCTION_TABLE[$8 | 0]($5, $6_1, $7_1) | 0;
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
  HEAP32[$0_1 >> 2] = $5;
  HEAP32[$0_1 + 4 >> 2] = $6_1;
  HEAP32[$0_1 + 8 >> 2] = $7_1;
  HEAP32[$0_1 + 12 >> 2] = $8;
  HEAP32[$0_1 + 16 >> 2] = $4;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 20;
  return 0;
 }
 
 function $83($0_1, $1_1, $2, $3_1, $4, $5, $6_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  $5 = $5 | 0;
  $6_1 = $6_1 | 0;
  var $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0, $12 = 0, $13 = 0, $14_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 28;
   $7_1 = HEAP32[global$6 >> 2];
   $8 = HEAP32[$7_1 >> 2];
   $9_1 = HEAP32[$7_1 + 4 >> 2];
   $10_1 = HEAP32[$7_1 + 8 >> 2];
   $11 = HEAP32[$7_1 + 12 >> 2];
   $12 = HEAP32[$7_1 + 16 >> 2];
   $13 = HEAP32[$7_1 + 20 >> 2];
   $7_1 = HEAP32[$7_1 + 24 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $14_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $9_1 = $2;
   $10_1 = $3_1;
   $11 = $4;
   $12 = $5;
   $13 = $6_1;
   $7_1 = $0_1;
   $8 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $14_1 : 0)) {
    FUNCTION_TABLE[$7_1 | 0]($8, $9_1, $10_1, $11, $12, $13);
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $8;
  HEAP32[$0_1 + 4 >> 2] = $9_1;
  HEAP32[$0_1 + 8 >> 2] = $10_1;
  HEAP32[$0_1 + 12 >> 2] = $11;
  HEAP32[$0_1 + 16 >> 2] = $12;
  HEAP32[$0_1 + 20 >> 2] = $13;
  HEAP32[$0_1 + 24 >> 2] = $7_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 28;
 }
 
 function $84($0_1, $1_1, $2, $3_1, $4, $5) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  $5 = $5 | 0;
  var $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0, $11 = 0, $12 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 24;
   $6_1 = HEAP32[global$6 >> 2];
   $7_1 = HEAP32[$6_1 >> 2];
   $8 = HEAP32[$6_1 + 4 >> 2];
   $9_1 = HEAP32[$6_1 + 8 >> 2];
   $10_1 = HEAP32[$6_1 + 12 >> 2];
   $11 = HEAP32[$6_1 + 16 >> 2];
   $6_1 = HEAP32[$6_1 + 20 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $12 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $8 = $2;
   $9_1 = $3_1;
   $10_1 = $4;
   $11 = $5;
   $6_1 = $0_1;
   $7_1 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $12 : 0)) {
    FUNCTION_TABLE[$6_1 | 0]($7_1, $8, $9_1, $10_1, $11);
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $7_1;
  HEAP32[$0_1 + 4 >> 2] = $8;
  HEAP32[$0_1 + 8 >> 2] = $9_1;
  HEAP32[$0_1 + 12 >> 2] = $10_1;
  HEAP32[$0_1 + 16 >> 2] = $11;
  HEAP32[$0_1 + 20 >> 2] = $6_1;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 24;
 }
 
 function $85($0_1, $1_1, $2, $3_1, $4) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2 = $2 | 0;
  $3_1 = $3_1 | 0;
  $4 = $4 | 0;
  var $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0, $10_1 = 0;
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 20;
   $5 = HEAP32[global$6 >> 2];
   $6_1 = HEAP32[$5 >> 2];
   $7_1 = HEAP32[$5 + 4 >> 2];
   $8 = HEAP32[$5 + 8 >> 2];
   $9_1 = HEAP32[$5 + 12 >> 2];
   $5 = HEAP32[$5 + 16 >> 2];
  }
  if ((global$5 | 0) == 2) {
   HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] - 4;
   $10_1 = HEAP32[HEAP32[global$6 >> 2] >> 2];
  }
  if (!global$5) {
   $7_1 = $2;
   $8 = $3_1;
   $9_1 = $4;
   $5 = $0_1;
   $6_1 = $1_1;
  }
  label$2 : {
   if (!(global$5 ? $10_1 : 0)) {
    FUNCTION_TABLE[$5 | 0]($6_1, $7_1, $8, $9_1);
    if ((global$5 | 0) == 1) {
     break label$2
    }
   }
   return;
  }
  HEAP32[HEAP32[global$6 >> 2] >> 2] = 0;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 4;
  $0_1 = HEAP32[global$6 >> 2];
  HEAP32[$0_1 >> 2] = $6_1;
  HEAP32[$0_1 + 4 >> 2] = $7_1;
  HEAP32[$0_1 + 8 >> 2] = $8;
  HEAP32[$0_1 + 12 >> 2] = $9_1;
  HEAP32[$0_1 + 16 >> 2] = $5;
  HEAP32[global$6 >> 2] = HEAP32[global$6 >> 2] + 20;
 }
 
 function $86($0_1) {
  $0_1 = $0_1 | 0;
  global$5 = 1;
  global$6 = $0_1;
  if (HEAPU32[global$6 >> 2] > HEAPU32[global$6 + 4 >> 2]) {
   abort()
  }
 }
 
 function $87() {
  global$5 = 0;
  if (HEAPU32[global$6 >> 2] > HEAPU32[global$6 + 4 >> 2]) {
   abort()
  }
 }
 
 function $88($0_1) {
  $0_1 = $0_1 | 0;
  global$5 = 2;
  global$6 = $0_1;
  if (HEAPU32[global$6 >> 2] > HEAPU32[global$6 + 4 >> 2]) {
   abort()
  }
 }
 
 function $90() {
  return global$5 | 0;
 }
 
 function __wasm_i64_mul($0_1, $1_1, $2, $3_1) {
  var $4 = 0, $5 = 0, $6_1 = 0, $7_1 = 0, $8 = 0, $9_1 = 0;
  $4 = $2 >>> 16 | 0;
  $5 = $0_1 >>> 16 | 0;
  $9_1 = Math_imul($4, $5);
  $6_1 = $2 & 65535;
  $7_1 = $0_1 & 65535;
  $8 = Math_imul($6_1, $7_1);
  $5 = ($8 >>> 16 | 0) + Math_imul($5, $6_1) | 0;
  $4 = ($5 & 65535) + Math_imul($4, $7_1) | 0;
  i64toi32_i32$HIGH_BITS = (Math_imul($1_1, $2) + $9_1 | 0) + Math_imul($0_1, $3_1) + ($5 >>> 16) + ($4 >>> 16) | 0;
  return $8 & 65535 | $4 << 16;
 }
 
 function __wasm_rotl_i32($0_1) {
  var $1_1 = 0;
  $1_1 = $0_1 & 31;
  $0_1 = 0 - $0_1 & 31;
  return (-1 >>> $1_1 & -2) << $1_1 | (-1 << $0_1 & -2) >>> $0_1;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(env);
 var FUNCTION_TABLE = Table([null, $42, $1, $1, $39, $40, $41, $46, $47, $49, $39, $40, $1, $1, $59, $69, $67, $62, $40, $68, $66, $63]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
 }
 
 return {
  "__wasm_call_ctors": $0, 
  "RunSolution": $3, 
  "__indirect_function_table": FUNCTION_TABLE, 
  "__errno_location": $35, 
  "stackSave": $77, 
  "stackRestore": $78, 
  "stackAlloc": $79, 
  "emscripten_stack_set_limits": $19, 
  "emscripten_stack_get_base": $20, 
  "emscripten_stack_get_end": $21, 
  "malloc": $70, 
  "free": $71, 
  "dynCall_ii": $80, 
  "dynCall_vi": $81, 
  "dynCall_iiii": $82, 
  "dynCall_viiiiii": $83, 
  "dynCall_viiiii": $84, 
  "dynCall_viiii": $85, 
  "asyncify_start_unwind": $86, 
  "asyncify_stop_unwind": $87, 
  "asyncify_start_rewind": $88, 
  "asyncify_stop_rewind": $87, 
  "asyncify_get_state": $90
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
  wasmBinaryFile = 'hello.wasm';
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
  1524: function() {g_data = [];},  
 1541: function($0, $1) {g_data.push([$0, $1]);},  
 1568: function() {SetInputData(g_data); g_trace = []; g_trace2 = [];},  
 1623: function($0, $1, $2, $3) {g_trace.push([ [$0, $1], [$2, $3] ]);},  
 1665: function() {g_trace2_line = [];},  
 1689: function($0, $1) {g_trace2_line.push( [$0, $1] );},  
 1725: function() {g_trace2.push(g_trace2_line); console.log(g_trace2);}
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

  function ___cxa_allocate_exception(size) {
      // Thrown object is prepended by exception metadata block
      return _malloc(size + 16) + 16;
    }

  function _atexit(func, arg) {
    }
  function ___cxa_atexit(a0,a1
  ) {
  return _atexit(a0,a1);
  }

  function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 16;
  
      this.set_type = function(type) {
        HEAP32[(((this.ptr)+(4))>>2)] = type;
      };
  
      this.get_type = function() {
        return HEAP32[(((this.ptr)+(4))>>2)];
      };
  
      this.set_destructor = function(destructor) {
        HEAP32[(((this.ptr)+(8))>>2)] = destructor;
      };
  
      this.get_destructor = function() {
        return HEAP32[(((this.ptr)+(8))>>2)];
      };
  
      this.set_refcount = function(refcount) {
        HEAP32[((this.ptr)>>2)] = refcount;
      };
  
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(((this.ptr)+(12))>>0)] = caught;
      };
  
      this.get_caught = function () {
        return HEAP8[(((this.ptr)+(12))>>0)] != 0;
      };
  
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(((this.ptr)+(13))>>0)] = rethrown;
      };
  
      this.get_rethrown = function () {
        return HEAP8[(((this.ptr)+(13))>>0)] != 0;
      };
  
      // Initialize native structure fields. Should be called once after allocated.
      this.init = function(type, destructor) {
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      }
  
      this.add_ref = function() {
        var value = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = value + 1;
      };
  
      // Returns true if last reference released.
      this.release_ref = function() {
        var prev = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = prev - 1;
        return prev === 1;
      };
    }
  
  var exceptionLast = 0;
  
  var uncaughtExceptionCount = 0;
  function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw ptr;
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
  "__cxa_allocate_exception": ___cxa_allocate_exception,
  "__cxa_atexit": ___cxa_atexit,
  "__cxa_throw": ___cxa_throw,
  "abort": _abort,
  "emscripten_asm_const_int": _emscripten_asm_const_int,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
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
var _RunSolution = Module["_RunSolution"] = function() {
  return (_RunSolution = Module["_RunSolution"] = Module["asm"]["RunSolution"]).apply(null, arguments);
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
var dynCall_vi = Module["dynCall_vi"] = function() {
  return (dynCall_vi = Module["dynCall_vi"] = Module["asm"]["dynCall_vi"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiii = Module["dynCall_iiii"] = function() {
  return (dynCall_iiii = Module["dynCall_iiii"] = Module["asm"]["dynCall_iiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viiiiii = Module["dynCall_viiiiii"] = function() {
  return (dynCall_viiiiii = Module["dynCall_viiiiii"] = Module["asm"]["dynCall_viiiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viiiii = Module["dynCall_viiiii"] = function() {
  return (dynCall_viiiii = Module["dynCall_viiiii"] = Module["asm"]["dynCall_viiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viiii = Module["dynCall_viiii"] = function() {
  return (dynCall_viiii = Module["dynCall_viiii"] = Module["asm"]["dynCall_viiii"]).apply(null, arguments);
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





