
var Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir ||= __filename;
  return (
function(moduleArg = {}) {

// include: shell.js
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
var Module = moduleArg;

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise((resolve, reject) => {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});
["_func1","_GenSolution","_memory","___indirect_function_table","onRuntimeInitialized"].forEach((prop) => {
  if (!Object.getOwnPropertyDescriptor(Module['ready'], prop)) {
    Object.defineProperty(Module['ready'], prop, {
      get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
      set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
    });
  }
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

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
    readBinary;

if (ENVIRONMENT_IS_NODE) {
  if (typeof process == 'undefined' || !process.release || process.release.name !== 'node') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  var nodeVersion = process.versions.node;
  var numericVersion = nodeVersion.split('.').slice(0, 3);
  numericVersion = (numericVersion[0] * 10000) + (numericVersion[1] * 100) + (numericVersion[2].split('-')[0] * 1);
  var minVersion = 160000;
  if (numericVersion < 160000) {
    throw new Error('This emscripten-generated code requires node v16.0.0 (detected v' + nodeVersion + ')');
  }

  // `require()` is no-op in an ESM module, use `createRequire()` to construct
  // the require()` function.  This is only necessary for multi-environment
  // builds, `-sENVIRONMENT=node` emits a static import declaration instead.
  // TODO: Swap all `require()`'s with `import()`'s?
  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require('fs');
  var nodePath = require('path');

  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js
read_ = (filename, binary) => {
  // We need to re-wrap `file://` strings to URLs. Normalizing isn't
  // necessary in that case, the path should already be absolute.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return fs.readFileSync(filename, binary ? undefined : 'utf8');
};

readBinary = (filename) => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
};

readAsync = (filename, onload, onerror, binary = true) => {
  // See the comment in the `read_` function.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
    if (err) onerror(err);
    else onload(binary ? data.buffer : data);
  });
};
// end include: node_shell_read.js
  if (!Module['thisProgram'] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, '/');
  }

  arguments_ = process.argv.slice(2);

  // MODULARIZE will export the module in the proper place outside, we don't need to export here

  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };

} else
if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = read;
  }

  readBinary = (f) => {
    if (typeof readbuffer == 'function') {
      return new Uint8Array(readbuffer(f));
    }
    let data = read(f, 'binary');
    assert(typeof data == 'object');
    return data;
  };

  readAsync = (f, onload, onerror) => {
    setTimeout(() => onload(readBinary(f)));
  };

  if (typeof clearTimeout == 'undefined') {
    globalThis.clearTimeout = (id) => {};
  }

  if (typeof setTimeout == 'undefined') {
    // spidermonkey lacks setTimeout but we use it above in readAsync.
    globalThis.setTimeout = (f) => (typeof f == 'function') ? f() : abort();
  }

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit == 'function') {
    quit_ = (status, toThrow) => {
      // Unlike node which has process.exitCode, d8 has no such mechanism. So we
      // have no way to set the exit code and then let the program exit with
      // that code when it naturally stops running (say, when all setTimeouts
      // have completed). For that reason, we must call `quit` - the only way to
      // set the exit code - but quit also halts immediately.  To increase
      // consistency with node (and the web) we schedule the actual quit call
      // using a setTimeout to give the current stack and any exception handlers
      // a chance to run.  This enables features such as addOnPostRun (which
      // expected to be able to run code after main returns).
      setTimeout(() => {
        if (!(toThrow instanceof ExitStatus)) {
          let toLog = toThrow;
          if (toThrow && typeof toThrow == 'object' && toThrow.stack) {
            toLog = [toThrow, toThrow.stack];
          }
          err(`exiting due to exception: ${toLog}`);
        }
        quit(status);
      });
      throw toThrow;
    };
  }

  if (typeof print != 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console == 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.startsWith('blob:')) {
    scriptDirectory = '';
  } else {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/')+1);
  }

  if (!(typeof window == 'object' || typeof importScripts == 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js
read_ = (url) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('asm', 'wasmExports');
legacyModuleProp('read', 'read_');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';
var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';
var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';
var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';

var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_SHELL, 'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.');

// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary; 
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');

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
  /** @constructor */
  Memory: function(opts) {
    this.buffer = new ArrayBuffer(opts['initial'] * 65536);
  },

  Module: function(binary) {
    // TODO: use the binary and info somehow - right now the wasm2js output is embedded in
    // the main JS
  },

  /** @constructor */
  Instance: function(module, info) {
    // TODO: use the module somehow - right now the wasm2js output is embedded in
    // the main JS
    // This will be replaced by the actual wasm2js code.
    this.exports = (
function instantiate(info) {
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
  base64DecodeToExistingUint8Array(bufferView, 65536, "aWlpAC0rICAgMFgweAAtMFgrMFggMFgtMHgrMHggMHgAOiBubyBjb252ZXJzaW9uAG5hbgBzdG9sbABiYXNpY19zdHJpbmcAaW5mADogb3V0IG9mIHJhbmdlAE5BTgBJTkYALgAobnVsbCkAW0dlblNvbHV0aW9uXSAlcwoAcmV0OiAlcwoAAGkAAAAAAAAAGQAKABkZGQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAAZABEKGRkZAwoHAAEACQsYAAAJBgsAAAsABhkAAAAZGRkAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAGQAKDRkZGQANAAACAAkOAAAACQAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAABMAAAAAEwAAAAAJDAAAAAAADAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAPAAAABA8AAAAACRAAAAAAABAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAAAAAAAAAAAAAAEQAAAAARAAAAAAkSAAAAAAASAAASAAAaAAAAGhoaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoAAAAaGhoAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAXAAAAABcAAAAACRQAAAAAABQAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgAAAAAAAAAAAAAAFQAAAAAVAAAAAAkWAAAAAAAWAAAWAAAwMTIzNDU2Nzg5QUJDREVGMDAwMTAyMDMwNDA1MDYwNzA4MDkxMDExMTIxMzE0MTUxNjE3MTgxOTIwMjEyMjIzMjQyNTI2MjcyODI5MzAzMTMyMzMzNDM1MzYzNzM4Mzk0MDQxNDI0MzQ0NDU0NjQ3NDg0OTUwNTE1MjUzNTQ1NTU2NTc1ODU5NjA2MTYyNjM2NDY1NjY2NzY4Njk3MDcxNzI3Mzc0NzU3Njc3Nzg3OTgwODE4MjgzODQ4NTg2ODc4ODg5OTA5MTkyOTM5NDk1OTY5Nzk4OTkAAAAAAAAAAAAAAAAAAAAACgAAAAAAAABkAAAAAAAAAOgDAAAAAAAAECcAAAAAAACghgEAAAAAAEBCDwAAAAAAgJaYAAAAAAAA4fUFAAAAAADKmjsAAAAAAOQLVAIAAAAA6HZIFwAAAAAQpdToAAAAAKByThgJAAAAQHoQ81oAAACAxqR+jQMAAADBb/KGIwAAAIpdeEVjAQAAZKeztuANAADoiQQjx4o=");
  base64DecodeToExistingUint8Array(bufferView, 66528, "BQAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAMAAABYBQEAAAQAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAP////8KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AMBACAMAQAFAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABwAAABgMAQAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAA//////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4BAEA");
  base64DecodeToExistingUint8Array(bufferView, 66828, "eyBBZGRFbnRyeSgkMCwgJDEsICQyKTsgfQB7IENsZWFyKCk7IH0AeyBTZXRUYXJnZXQoJDApOyB9AA==");
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
      function wasm2js_trap() { throw new Error('abort'); }

function asmFunc(imports) {
 var buffer = new ArrayBuffer(16908288);
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
 var env = imports.env;
 var fimport$0 = env.emscripten_asm_const_int;
 var wasi_snapshot_preview1 = imports.wasi_snapshot_preview1;
 var fimport$1 = wasi_snapshot_preview1.fd_write;
 var fimport$2 = env.emscripten_memcpy_js;
 var fimport$3 = env.emscripten_resize_heap;
 var fimport$4 = env.abort;
 var fimport$5 = wasi_snapshot_preview1.fd_close;
 var fimport$6 = wasi_snapshot_preview1.fd_seek;
 var global$0 = 65536;
 var global$1 = 0;
 var global$2 = 0;
 var global$3 = 0;
 var global$4 = 66828;
 var global$5 = 66886;
 var __wasm_intrinsics_temp_i64 = 0;
 var __wasm_intrinsics_temp_i64$hi = 0;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0() {
  $314();
  $127();
 }
 
 function $1($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $7_1 = 0, $8_1 = 0, $9_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = 66828;
  $7_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
  $8_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  $9_1 = HEAP32[($5_1 + 24 | 0) >> 2] | 0;
  HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = $9_1;
  HEAP32[$5_1 >> 2] = $8_1;
  fimport$0($7_1 | 0, 65536 | 0, $5_1 | 0) | 0;
  global$0 = $5_1 + 32 | 0;
  return;
 }
 
 function $2($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $11_1 = 0;
  $3_1 = global$0 - 80 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 76 | 0) >> 2] = $0_1;
  HEAP32[$3_1 >> 2] = HEAP32[($3_1 + 76 | 0) >> 2] | 0;
  $91(65644 | 0, $3_1 | 0) | 0;
  HEAP32[($3_1 + 72 | 0) >> 2] = 66854;
  fimport$0(HEAP32[($3_1 + 72 | 0) >> 2] | 0 | 0, 65671 | 0, 0 | 0) | 0;
  HEAP32[($3_1 + 68 | 0) >> 2] = 66867;
  $11_1 = HEAP32[($3_1 + 68 | 0) >> 2] | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = $88(HEAP32[($3_1 + 76 | 0) >> 2] | 0 | 0) | 0;
  fimport$0($11_1 | 0, 65672 | 0, $3_1 + 16 | 0 | 0) | 0;
  $3($3_1 + 40 | 0 | 0, HEAP32[($3_1 + 76 | 0) >> 2] | 0 | 0) | 0;
  $4($3_1 + 52 | 0 | 0, $3_1 + 67 | 0 | 0, $3_1 + 40 | 0 | 0);
  $197($3_1 + 40 | 0 | 0) | 0;
  HEAP32[($3_1 + 32 | 0) >> 2] = $5($3_1 + 52 | 0 | 0) | 0;
  $91(65662 | 0, $3_1 + 32 | 0 | 0) | 0;
  $197($3_1 + 52 | 0 | 0) | 0;
  global$0 = $3_1 + 80 | 0;
  return;
 }
 
 function $3($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $11($5_1 | 0, $4_1 + 7 | 0 | 0, $4_1 + 6 | 0 | 0) | 0;
  $202($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, $12(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $4($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$3 = 0, i64toi32_i32$1 = 0, i64toi32_i32$5 = 0, i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, $5_1 = 0, i64toi32_i32$6 = 0, $6_1 = 0, $212$hi = 0, $213$hi = 0, $214$hi = 0, $215$hi = 0, $179_1 = 0, $180_1 = 0, $181_1 = 0, $216$hi = 0, $217$hi = 0, $218$hi = 0, $219$hi = 0, $223$hi = 0, $224$hi = 0, $227$hi = 0, $228$hi = 0, $182_1 = 0, $183_1 = 0, $184_1 = 0, $229$hi = 0, $230$hi = 0, $232$hi = 0, $233$hi = 0, $235$hi = 0, $236$hi = 0, $185_1 = 0, $186_1 = 0, $187_1 = 0, $237$hi = 0, $240$hi = 0, $241$hi = 0, $188_1 = 0, $189_1 = 0, $190_1 = 0, $242$hi = 0, $245$hi = 0, $246$hi = 0, $191_1 = 0, $192_1 = 0, $193_1 = 0, $248$hi = 0, $249$hi = 0, $254$hi = 0, $255$hi = 0, $256$hi = 0, $257$hi = 0, $260$hi = 0, $261$hi = 0, $262$hi = 0, $263$hi = 0, $266$hi = 0, $267$hi = 0, $194_1 = 0, $195_1 = 0, $196_1 = 0, $270$hi = 0, $271$hi = 0, $275$hi = 0, $276$hi = 0, $197_1 = 0, $198_1 = 0, $199_1 = 0, $277$hi = 0, $278$hi = 0, $279$hi = 0, $280$hi = 0, $200_1 = 0, $201_1 = 0, $202_1 = 0, $288$hi = 0, $289$hi = 0, $290$hi = 0, $291$hi = 0, $203_1 = 0, $204_1 = 0, $205_1 = 0, $292$hi = 0, $293$hi = 0, $294$hi = 0, $295$hi = 0, $299$hi = 0, $300$hi = 0, $303$hi = 0, $304$hi = 0, $206_1 = 0, $207_1 = 0, $208_1 = 0, $305$hi = 0, $306$hi = 0, $308$hi = 0, $309$hi = 0, $311$hi = 0, $312$hi = 0, $209_1 = 0, $210_1 = 0, $211_1 = 0, $313$hi = 0, $316$hi = 0, $317$hi = 0, $212_1 = 0, $213_1 = 0, $214_1 = 0, $318$hi = 0, $321$hi = 0, $322$hi = 0, $215_1 = 0, $217_1 = 0, $218_1 = 0, $324$hi = 0, $325$hi = 0, $330$hi = 0, $331$hi = 0, $332$hi = 0, $333$hi = 0, $336$hi = 0, $337$hi = 0, $338$hi = 0, $339$hi = 0, $342$hi = 0, $343$hi = 0, $219_1 = 0, $220_1 = 0, $221_1 = 0, $346$hi = 0, $347$hi = 0, $351$hi = 0, $352$hi = 0, $222_1 = 0, $223_1 = 0, $224_1 = 0, $353$hi = 0, $354$hi = 0, $355$hi = 0, $356$hi = 0, $225_1 = 0, $226_1 = 0, $228_1 = 0, $399 = 0, $425 = 0, $216_1 = 0, $437 = 0, $443 = 0, $454 = 0, $468 = 0, $227_1 = 0, $474 = 0, $229_1 = 0, $486 = 0, $232_1 = 0, $495 = 0, $511$hi = 0, $512 = 0, $528$hi = 0, $529 = 0, $245_1 = 0, $538 = 0, $548 = 0, $43_1 = 0, $254_1 = 0, $579 = 0, $260_1 = 0, $605 = 0, $266_1 = 0, $633 = 0, $653 = 0, $270_1 = 0, $659 = 0, $664 = 0, $275_1 = 0, $683 = 0, $277_1 = 0, $706 = 0, $279_1 = 0, $718 = 0, $728 = 0, $735 = 0, $739 = 0, $793 = 0, $292_1 = 0, $805 = 0, $811 = 0, $822 = 0, $836 = 0, $303_1 = 0, $842 = 0, $305_1 = 0, $854 = 0, $308 = 0, $863 = 0, $879$hi = 0, $880 = 0, $896$hi = 0, $897 = 0, $321 = 0, $906 = 0, $916 = 0, $131_1 = 0, $330 = 0, $947 = 0, $336 = 0, $973 = 0, $342 = 0, $1001 = 0, $1021 = 0, $346 = 0, $1027 = 0, $1032 = 0, $351 = 0, $1051 = 0, $353 = 0, $1074 = 0, $355 = 0, $1086 = 0, $1096 = 0, $1103 = 0, $1107 = 0;
  $5_1 = global$0 - 272 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 268 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 264 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 260 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 264 | 0) >> 2] | 0;
  $3($5_1 + 236 | 0 | 0, $5($2_1 | 0) | 0 | 0) | 0;
  i64toi32_i32$0 = $216($5_1 + 236 | 0 | 0, 0 | 0, 10 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  $197($5_1 + 236 | 0 | 0) | 0;
  $399 = i64toi32_i32$0;
  i64toi32_i32$0 = $5_1;
  HEAP32[(i64toi32_i32$0 + 248 | 0) >> 2] = $399;
  HEAP32[(i64toi32_i32$0 + 252 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = 0;
  HEAP32[(i64toi32_i32$0 + 224 | 0) >> 2] = 0;
  HEAP32[(i64toi32_i32$0 + 228 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = 0;
  HEAP32[(i64toi32_i32$0 + 216 | 0) >> 2] = 1e9;
  HEAP32[(i64toi32_i32$0 + 220 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = 0;
  HEAP32[(i64toi32_i32$0 + 208 | 0) >> 2] = 2147483647;
  HEAP32[(i64toi32_i32$0 + 212 | 0) >> 2] = i64toi32_i32$1;
  i64toi32_i32$1 = 0;
  HEAP32[(i64toi32_i32$0 + 200 | 0) >> 2] = 0;
  HEAP32[(i64toi32_i32$0 + 204 | 0) >> 2] = i64toi32_i32$1;
  HEAP8[(i64toi32_i32$0 + 199 | 0) >> 0] = 0 & 1 | 0;
  $6($0_1 | 0) | 0;
  i64toi32_i32$1 = 0;
  HEAP32[(i64toi32_i32$0 + 184 | 0) >> 2] = 2147483647;
  HEAP32[(i64toi32_i32$0 + 188 | 0) >> 2] = i64toi32_i32$1;
  label$1 : {
   label$2 : while (1) {
    i64toi32_i32$2 = $5_1;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 224 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 228 | 0) >> 2] | 0;
    $212$hi = i64toi32_i32$0;
    i64toi32_i32$0 = 0;
    $213$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $212$hi;
    i64toi32_i32$0 = $213$hi;
    i64toi32_i32$0 = $212$hi;
    i64toi32_i32$2 = i64toi32_i32$1;
    i64toi32_i32$1 = $213$hi;
    i64toi32_i32$3 = 10;
    i64toi32_i32$4 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
    i64toi32_i32$5 = i64toi32_i32$0 + i64toi32_i32$1 | 0;
    if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
     i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
    }
    $214$hi = i64toi32_i32$5;
    i64toi32_i32$0 = $5_1;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$0 + 216 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$0 + 220 | 0) >> 2] | 0;
    $215$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $214$hi;
    i64toi32_i32$2 = $215$hi;
    $425 = i64toi32_i32$5;
    i64toi32_i32$2 = $214$hi;
    i64toi32_i32$0 = i64toi32_i32$4;
    i64toi32_i32$5 = $215$hi;
    i64toi32_i32$3 = $425;
    if ((i64toi32_i32$2 | 0) < (i64toi32_i32$5 | 0)) {
     $179_1 = 1
    } else {
     if ((i64toi32_i32$2 | 0) <= (i64toi32_i32$5 | 0)) {
      if (i64toi32_i32$0 >>> 0 >= i64toi32_i32$3 >>> 0) {
       $180_1 = 0
      } else {
       $180_1 = 1
      }
      $181_1 = $180_1;
     } else {
      $181_1 = 0
     }
     $179_1 = $181_1;
    }
    if (!($179_1 & 1 | 0)) {
     break label$1
    }
    i64toi32_i32$3 = $5_1;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$3 + 224 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 228 | 0) >> 2] | 0;
    $216_1 = i64toi32_i32$0;
    $216$hi = i64toi32_i32$2;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 216 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$3 + 220 | 0) >> 2] | 0;
    $217$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $216$hi;
    i64toi32_i32$0 = $217$hi;
    $437 = i64toi32_i32$2;
    i64toi32_i32$0 = $216$hi;
    i64toi32_i32$3 = $216_1;
    i64toi32_i32$2 = $217$hi;
    i64toi32_i32$5 = $437;
    i64toi32_i32$1 = i64toi32_i32$3 + i64toi32_i32$5 | 0;
    i64toi32_i32$4 = i64toi32_i32$0 + i64toi32_i32$2 | 0;
    if (i64toi32_i32$1 >>> 0 < i64toi32_i32$5 >>> 0) {
     i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
    }
    $218$hi = i64toi32_i32$4;
    i64toi32_i32$4 = 0;
    $219$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $218$hi;
    i64toi32_i32$4 = $219$hi;
    i64toi32_i32$4 = $218$hi;
    i64toi32_i32$3 = $219$hi;
    i64toi32_i32$3 = __wasm_i64_sdiv(i64toi32_i32$1 | 0, i64toi32_i32$4 | 0, 2 | 0, i64toi32_i32$3 | 0) | 0;
    i64toi32_i32$4 = i64toi32_i32$HIGH_BITS;
    $443 = i64toi32_i32$3;
    i64toi32_i32$3 = $5_1;
    HEAP32[(i64toi32_i32$3 + 176 | 0) >> 2] = $443;
    HEAP32[(i64toi32_i32$3 + 180 | 0) >> 2] = i64toi32_i32$4;
    i64toi32_i32$0 = i64toi32_i32$3;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$3 + 176 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$3 + 180 | 0) >> 2] | 0;
    i64toi32_i32$3 = $7($6_1 | 0, i64toi32_i32$4 | 0, i64toi32_i32$3 | 0, 1 & 1 | 0 | 0) | 0;
    i64toi32_i32$4 = i64toi32_i32$HIGH_BITS;
    $454 = i64toi32_i32$3;
    i64toi32_i32$3 = i64toi32_i32$0;
    HEAP32[(i64toi32_i32$3 + 168 | 0) >> 2] = $454;
    HEAP32[(i64toi32_i32$3 + 172 | 0) >> 2] = i64toi32_i32$4;
    i64toi32_i32$0 = i64toi32_i32$3;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$3 + 176 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$3 + 180 | 0) >> 2] | 0;
    $223$hi = i64toi32_i32$3;
    i64toi32_i32$3 = 0;
    $224$hi = i64toi32_i32$3;
    i64toi32_i32$3 = $223$hi;
    i64toi32_i32$3 = $224$hi;
    i64toi32_i32$3 = $223$hi;
    i64toi32_i32$0 = i64toi32_i32$4;
    i64toi32_i32$4 = $224$hi;
    i64toi32_i32$5 = 1;
    i64toi32_i32$2 = i64toi32_i32$0 - i64toi32_i32$5 | 0;
    i64toi32_i32$6 = i64toi32_i32$0 >>> 0 < i64toi32_i32$5 >>> 0;
    i64toi32_i32$1 = i64toi32_i32$6 + i64toi32_i32$4 | 0;
    i64toi32_i32$1 = i64toi32_i32$3 - i64toi32_i32$1 | 0;
    i64toi32_i32$1 = $7($6_1 | 0, i64toi32_i32$2 | 0, i64toi32_i32$1 | 0, 1 & 1 | 0 | 0) | 0;
    i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
    $468 = i64toi32_i32$1;
    i64toi32_i32$1 = $5_1;
    HEAP32[(i64toi32_i32$1 + 160 | 0) >> 2] = $468;
    HEAP32[(i64toi32_i32$1 + 164 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$3 = i64toi32_i32$1;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$3 + 160 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 164 | 0) >> 2] | 0;
    $227_1 = i64toi32_i32$0;
    $227$hi = i64toi32_i32$1;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 224 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$3 + 228 | 0) >> 2] | 0;
    $228$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $227$hi;
    i64toi32_i32$0 = $228$hi;
    $474 = i64toi32_i32$1;
    i64toi32_i32$0 = $227$hi;
    i64toi32_i32$3 = $227_1;
    i64toi32_i32$1 = $228$hi;
    i64toi32_i32$5 = $474;
    if ((i64toi32_i32$0 | 0) < (i64toi32_i32$1 | 0)) {
     $182_1 = 1
    } else {
     if ((i64toi32_i32$0 | 0) <= (i64toi32_i32$1 | 0)) {
      if (i64toi32_i32$3 >>> 0 >= i64toi32_i32$5 >>> 0) {
       $183_1 = 0
      } else {
       $183_1 = 1
      }
      $184_1 = $183_1;
     } else {
      $184_1 = 0
     }
     $182_1 = $184_1;
    }
    label$3 : {
     if (!($182_1 & 1 | 0)) {
      break label$3
     }
     break label$1;
    }
    i64toi32_i32$5 = $5_1;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$5 + 168 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 172 | 0) >> 2] | 0;
    $229_1 = i64toi32_i32$3;
    $229$hi = i64toi32_i32$0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 248 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$5 + 252 | 0) >> 2] | 0;
    $230$hi = i64toi32_i32$3;
    i64toi32_i32$3 = $229$hi;
    i64toi32_i32$3 = $230$hi;
    $486 = i64toi32_i32$0;
    i64toi32_i32$3 = $229$hi;
    i64toi32_i32$5 = $229_1;
    i64toi32_i32$0 = $230$hi;
    i64toi32_i32$1 = $486;
    i64toi32_i32$4 = i64toi32_i32$5 - i64toi32_i32$1 | 0;
    i64toi32_i32$6 = i64toi32_i32$5 >>> 0 < i64toi32_i32$1 >>> 0;
    i64toi32_i32$2 = i64toi32_i32$6 + i64toi32_i32$0 | 0;
    i64toi32_i32$2 = i64toi32_i32$3 - i64toi32_i32$2 | 0;
    i64toi32_i32$5 = $5_1;
    HEAP32[(i64toi32_i32$5 + 152 | 0) >> 2] = i64toi32_i32$4;
    HEAP32[(i64toi32_i32$5 + 156 | 0) >> 2] = i64toi32_i32$2;
    i64toi32_i32$3 = i64toi32_i32$5;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 160 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 164 | 0) >> 2] | 0;
    $232_1 = i64toi32_i32$2;
    $232$hi = i64toi32_i32$5;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 248 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 252 | 0) >> 2] | 0;
    $233$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $232$hi;
    i64toi32_i32$2 = $233$hi;
    $495 = i64toi32_i32$5;
    i64toi32_i32$2 = $232$hi;
    i64toi32_i32$3 = $232_1;
    i64toi32_i32$5 = $233$hi;
    i64toi32_i32$1 = $495;
    i64toi32_i32$0 = i64toi32_i32$3 - i64toi32_i32$1 | 0;
    i64toi32_i32$6 = i64toi32_i32$3 >>> 0 < i64toi32_i32$1 >>> 0;
    i64toi32_i32$4 = i64toi32_i32$6 + i64toi32_i32$5 | 0;
    i64toi32_i32$4 = i64toi32_i32$2 - i64toi32_i32$4 | 0;
    i64toi32_i32$3 = $5_1;
    HEAP32[(i64toi32_i32$3 + 144 | 0) >> 2] = i64toi32_i32$0;
    HEAP32[(i64toi32_i32$3 + 148 | 0) >> 2] = i64toi32_i32$4;
    i64toi32_i32$2 = i64toi32_i32$3;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$3 + 152 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$3 + 156 | 0) >> 2] | 0;
    $235$hi = i64toi32_i32$3;
    i64toi32_i32$3 = 0;
    $236$hi = i64toi32_i32$3;
    i64toi32_i32$3 = $235$hi;
    i64toi32_i32$3 = $236$hi;
    i64toi32_i32$3 = $235$hi;
    i64toi32_i32$2 = i64toi32_i32$4;
    i64toi32_i32$4 = $236$hi;
    i64toi32_i32$1 = 0;
    if ((i64toi32_i32$3 | 0) < (i64toi32_i32$4 | 0)) {
     $185_1 = 1
    } else {
     if ((i64toi32_i32$3 | 0) <= (i64toi32_i32$4 | 0)) {
      if (i64toi32_i32$2 >>> 0 >= i64toi32_i32$1 >>> 0) {
       $186_1 = 0
      } else {
       $186_1 = 1
      }
      $187_1 = $186_1;
     } else {
      $187_1 = 0
     }
     $185_1 = $187_1;
    }
    label$4 : {
     if (!($185_1 & 1 | 0)) {
      break label$4
     }
     i64toi32_i32$1 = $5_1;
     i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 152 | 0) >> 2] | 0;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 156 | 0) >> 2] | 0;
     $237$hi = i64toi32_i32$3;
     i64toi32_i32$3 = 0;
     $511$hi = i64toi32_i32$3;
     i64toi32_i32$3 = $237$hi;
     $512 = i64toi32_i32$2;
     i64toi32_i32$3 = $511$hi;
     i64toi32_i32$1 = 0;
     i64toi32_i32$2 = $237$hi;
     i64toi32_i32$4 = $512;
     i64toi32_i32$5 = i64toi32_i32$1 - i64toi32_i32$4 | 0;
     i64toi32_i32$6 = i64toi32_i32$1 >>> 0 < i64toi32_i32$4 >>> 0;
     i64toi32_i32$0 = i64toi32_i32$6 + i64toi32_i32$2 | 0;
     i64toi32_i32$0 = i64toi32_i32$3 - i64toi32_i32$0 | 0;
     i64toi32_i32$1 = $5_1;
     HEAP32[(i64toi32_i32$1 + 152 | 0) >> 2] = i64toi32_i32$5;
     HEAP32[(i64toi32_i32$1 + 156 | 0) >> 2] = i64toi32_i32$0;
    }
    i64toi32_i32$3 = $5_1;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$3 + 144 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 148 | 0) >> 2] | 0;
    $240$hi = i64toi32_i32$1;
    i64toi32_i32$1 = 0;
    $241$hi = i64toi32_i32$1;
    i64toi32_i32$1 = $240$hi;
    i64toi32_i32$1 = $241$hi;
    i64toi32_i32$1 = $240$hi;
    i64toi32_i32$3 = i64toi32_i32$0;
    i64toi32_i32$0 = $241$hi;
    i64toi32_i32$4 = 0;
    if ((i64toi32_i32$1 | 0) < (i64toi32_i32$0 | 0)) {
     $188_1 = 1
    } else {
     if ((i64toi32_i32$1 | 0) <= (i64toi32_i32$0 | 0)) {
      if (i64toi32_i32$3 >>> 0 >= i64toi32_i32$4 >>> 0) {
       $189_1 = 0
      } else {
       $189_1 = 1
      }
      $190_1 = $189_1;
     } else {
      $190_1 = 0
     }
     $188_1 = $190_1;
    }
    label$5 : {
     if (!($188_1 & 1 | 0)) {
      break label$5
     }
     i64toi32_i32$4 = $5_1;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$4 + 144 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$4 + 148 | 0) >> 2] | 0;
     $242$hi = i64toi32_i32$1;
     i64toi32_i32$1 = 0;
     $528$hi = i64toi32_i32$1;
     i64toi32_i32$1 = $242$hi;
     $529 = i64toi32_i32$3;
     i64toi32_i32$1 = $528$hi;
     i64toi32_i32$4 = 0;
     i64toi32_i32$3 = $242$hi;
     i64toi32_i32$0 = $529;
     i64toi32_i32$2 = i64toi32_i32$4 - i64toi32_i32$0 | 0;
     i64toi32_i32$6 = i64toi32_i32$4 >>> 0 < i64toi32_i32$0 >>> 0;
     i64toi32_i32$5 = i64toi32_i32$6 + i64toi32_i32$3 | 0;
     i64toi32_i32$5 = i64toi32_i32$1 - i64toi32_i32$5 | 0;
     i64toi32_i32$4 = $5_1;
     HEAP32[(i64toi32_i32$4 + 144 | 0) >> 2] = i64toi32_i32$2;
     HEAP32[(i64toi32_i32$4 + 148 | 0) >> 2] = i64toi32_i32$5;
    }
    i64toi32_i32$1 = $5_1;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$1 + 152 | 0) >> 2] | 0;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$1 + 156 | 0) >> 2] | 0;
    $245_1 = i64toi32_i32$5;
    $245$hi = i64toi32_i32$4;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$1 + 144 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$1 + 148 | 0) >> 2] | 0;
    $246$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $245$hi;
    i64toi32_i32$5 = $246$hi;
    $538 = i64toi32_i32$4;
    i64toi32_i32$5 = $245$hi;
    i64toi32_i32$1 = $245_1;
    i64toi32_i32$4 = $246$hi;
    i64toi32_i32$0 = $538;
    if ((i64toi32_i32$5 | 0) > (i64toi32_i32$4 | 0)) {
     $191_1 = 1
    } else {
     if ((i64toi32_i32$5 | 0) >= (i64toi32_i32$4 | 0)) {
      if (i64toi32_i32$1 >>> 0 <= i64toi32_i32$0 >>> 0) {
       $192_1 = 0
      } else {
       $192_1 = 1
      }
      $193_1 = $192_1;
     } else {
      $193_1 = 0
     }
     $191_1 = $193_1;
    }
    label$6 : {
     label$7 : {
      if (!($191_1 & 1 | 0)) {
       break label$7
      }
      i64toi32_i32$0 = $5_1;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$0 + 176 | 0) >> 2] | 0;
      i64toi32_i32$5 = HEAP32[(i64toi32_i32$0 + 180 | 0) >> 2] | 0;
      $548 = i64toi32_i32$1;
      i64toi32_i32$1 = i64toi32_i32$0;
      HEAP32[(i64toi32_i32$1 + 216 | 0) >> 2] = $548;
      HEAP32[(i64toi32_i32$1 + 220 | 0) >> 2] = i64toi32_i32$5;
      break label$6;
     }
     i64toi32_i32$0 = $5_1;
     i64toi32_i32$5 = HEAP32[(i64toi32_i32$0 + 176 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$0 + 180 | 0) >> 2] | 0;
     $248$hi = i64toi32_i32$1;
     i64toi32_i32$1 = 0;
     $249$hi = i64toi32_i32$1;
     i64toi32_i32$1 = $248$hi;
     i64toi32_i32$1 = $249$hi;
     i64toi32_i32$1 = $248$hi;
     i64toi32_i32$0 = i64toi32_i32$5;
     i64toi32_i32$5 = $249$hi;
     i64toi32_i32$4 = 1;
     i64toi32_i32$3 = i64toi32_i32$0 - i64toi32_i32$4 | 0;
     i64toi32_i32$6 = i64toi32_i32$0 >>> 0 < i64toi32_i32$4 >>> 0;
     i64toi32_i32$2 = i64toi32_i32$6 + i64toi32_i32$5 | 0;
     i64toi32_i32$2 = i64toi32_i32$1 - i64toi32_i32$2 | 0;
     i64toi32_i32$0 = $5_1;
     HEAP32[(i64toi32_i32$0 + 224 | 0) >> 2] = i64toi32_i32$3;
     HEAP32[(i64toi32_i32$0 + 228 | 0) >> 2] = i64toi32_i32$2;
    }
    i64toi32_i32$1 = $5_1;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 224 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$1 + 228 | 0) >> 2] | 0;
    $43_1 = i64toi32_i32$2;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$1 + 216 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 220 | 0) >> 2] | 0;
    $1(1 | 0, $43_1 | 0, i64toi32_i32$0 | 0);
    continue label$2;
   };
  }
  i64toi32_i32$1 = $5_1;
  i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 224 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$1 + 228 | 0) >> 2] | 0;
  i64toi32_i32$0 = $7($6_1 | 0, i64toi32_i32$2 | 0, i64toi32_i32$0 | 0, 1 & 1 | 0 | 0) | 0;
  i64toi32_i32$2 = i64toi32_i32$HIGH_BITS;
  $254_1 = i64toi32_i32$0;
  $254$hi = i64toi32_i32$2;
  i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 248 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$1 + 252 | 0) >> 2] | 0;
  $255$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $254$hi;
  i64toi32_i32$0 = $255$hi;
  $579 = i64toi32_i32$2;
  i64toi32_i32$0 = $254$hi;
  i64toi32_i32$1 = $254_1;
  i64toi32_i32$2 = $255$hi;
  i64toi32_i32$4 = $579;
  label$8 : {
   if (!(((i64toi32_i32$1 | 0) == (i64toi32_i32$4 | 0) & (i64toi32_i32$0 | 0) == (i64toi32_i32$2 | 0) | 0) & 1 | 0)) {
    break label$8
   }
   i64toi32_i32$4 = $5_1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$4 + 224 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$4 + 228 | 0) >> 2] | 0;
   $256$hi = i64toi32_i32$0;
   i64toi32_i32$0 = -1;
   $257$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $256$hi;
   i64toi32_i32$0 = $257$hi;
   i64toi32_i32$0 = $256$hi;
   i64toi32_i32$4 = i64toi32_i32$1;
   i64toi32_i32$1 = $257$hi;
   i64toi32_i32$2 = -1;
   i64toi32_i32$5 = i64toi32_i32$4 + i64toi32_i32$2 | 0;
   i64toi32_i32$3 = i64toi32_i32$0 + i64toi32_i32$1 | 0;
   if (i64toi32_i32$5 >>> 0 < i64toi32_i32$2 >>> 0) {
    i64toi32_i32$3 = i64toi32_i32$3 + 1 | 0
   }
   i64toi32_i32$4 = $5_1;
   HEAP32[(i64toi32_i32$4 + 224 | 0) >> 2] = i64toi32_i32$5;
   HEAP32[(i64toi32_i32$4 + 228 | 0) >> 2] = i64toi32_i32$3;
  }
  i64toi32_i32$0 = $5_1;
  i64toi32_i32$3 = HEAP32[(i64toi32_i32$0 + 216 | 0) >> 2] | 0;
  i64toi32_i32$4 = HEAP32[(i64toi32_i32$0 + 220 | 0) >> 2] | 0;
  i64toi32_i32$4 = $7($6_1 | 0, i64toi32_i32$3 | 0, i64toi32_i32$4 | 0, 1 & 1 | 0 | 0) | 0;
  i64toi32_i32$3 = i64toi32_i32$HIGH_BITS;
  $260_1 = i64toi32_i32$4;
  $260$hi = i64toi32_i32$3;
  i64toi32_i32$3 = HEAP32[(i64toi32_i32$0 + 248 | 0) >> 2] | 0;
  i64toi32_i32$4 = HEAP32[(i64toi32_i32$0 + 252 | 0) >> 2] | 0;
  $261$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $260$hi;
  i64toi32_i32$4 = $261$hi;
  $605 = i64toi32_i32$3;
  i64toi32_i32$4 = $260$hi;
  i64toi32_i32$0 = $260_1;
  i64toi32_i32$3 = $261$hi;
  i64toi32_i32$2 = $605;
  label$9 : {
   if (!(((i64toi32_i32$0 | 0) == (i64toi32_i32$2 | 0) & (i64toi32_i32$4 | 0) == (i64toi32_i32$3 | 0) | 0) & 1 | 0)) {
    break label$9
   }
   i64toi32_i32$2 = $5_1;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 216 | 0) >> 2] | 0;
   i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 220 | 0) >> 2] | 0;
   $262$hi = i64toi32_i32$4;
   i64toi32_i32$4 = 0;
   $263$hi = i64toi32_i32$4;
   i64toi32_i32$4 = $262$hi;
   i64toi32_i32$4 = $263$hi;
   i64toi32_i32$4 = $262$hi;
   i64toi32_i32$2 = i64toi32_i32$0;
   i64toi32_i32$0 = $263$hi;
   i64toi32_i32$3 = 1;
   i64toi32_i32$1 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
   i64toi32_i32$5 = i64toi32_i32$4 + i64toi32_i32$0 | 0;
   if (i64toi32_i32$1 >>> 0 < i64toi32_i32$3 >>> 0) {
    i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
   }
   i64toi32_i32$2 = $5_1;
   HEAP32[(i64toi32_i32$2 + 216 | 0) >> 2] = i64toi32_i32$1;
   HEAP32[(i64toi32_i32$2 + 220 | 0) >> 2] = i64toi32_i32$5;
  }
  i64toi32_i32$4 = $5_1;
  i64toi32_i32$5 = HEAP32[(i64toi32_i32$4 + 224 | 0) >> 2] | 0;
  i64toi32_i32$2 = HEAP32[(i64toi32_i32$4 + 228 | 0) >> 2] | 0;
  HEAP32[(i64toi32_i32$4 + 140 | 0) >> 2] = i64toi32_i32$5;
  label$10 : {
   label$11 : while (1) {
    i64toi32_i32$5 = HEAP32[($5_1 + 140 | 0) >> 2] | 0;
    i64toi32_i32$2 = i64toi32_i32$5 >> 31 | 0;
    $266_1 = i64toi32_i32$5;
    $266$hi = i64toi32_i32$2;
    i64toi32_i32$4 = $5_1;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$4 + 216 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$4 + 220 | 0) >> 2] | 0;
    $267$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $266$hi;
    i64toi32_i32$5 = $267$hi;
    $633 = i64toi32_i32$2;
    i64toi32_i32$5 = $266$hi;
    i64toi32_i32$4 = $266_1;
    i64toi32_i32$2 = $267$hi;
    i64toi32_i32$3 = $633;
    if ((i64toi32_i32$5 | 0) < (i64toi32_i32$2 | 0)) {
     $194_1 = 1
    } else {
     if ((i64toi32_i32$5 | 0) <= (i64toi32_i32$2 | 0)) {
      if (i64toi32_i32$4 >>> 0 > i64toi32_i32$3 >>> 0) {
       $195_1 = 0
      } else {
       $195_1 = 1
      }
      $196_1 = $195_1;
     } else {
      $196_1 = 0
     }
     $194_1 = $196_1;
    }
    if (!($194_1 & 1 | 0)) {
     break label$10
    }
    i64toi32_i32$5 = HEAP32[($5_1 + 140 | 0) >> 2] | 0;
    i64toi32_i32$4 = i64toi32_i32$5 >> 31 | 0;
    i64toi32_i32$4 = $7($6_1 | 0, i64toi32_i32$5 | 0, i64toi32_i32$4 | 0, 1 & 1 | 0 | 0) | 0;
    i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
    $653 = i64toi32_i32$4;
    i64toi32_i32$4 = $5_1;
    HEAP32[(i64toi32_i32$4 + 128 | 0) >> 2] = $653;
    HEAP32[(i64toi32_i32$4 + 132 | 0) >> 2] = i64toi32_i32$5;
    i64toi32_i32$3 = i64toi32_i32$4;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 128 | 0) >> 2] | 0;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$3 + 132 | 0) >> 2] | 0;
    $270_1 = i64toi32_i32$5;
    $270$hi = i64toi32_i32$4;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$3 + 248 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 252 | 0) >> 2] | 0;
    $271$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $270$hi;
    i64toi32_i32$5 = $271$hi;
    $659 = i64toi32_i32$4;
    i64toi32_i32$5 = $270$hi;
    i64toi32_i32$3 = $270_1;
    i64toi32_i32$4 = $271$hi;
    i64toi32_i32$2 = $659;
    i64toi32_i32$0 = i64toi32_i32$3 - i64toi32_i32$2 | 0;
    i64toi32_i32$6 = i64toi32_i32$3 >>> 0 < i64toi32_i32$2 >>> 0;
    i64toi32_i32$1 = i64toi32_i32$6 + i64toi32_i32$4 | 0;
    i64toi32_i32$1 = i64toi32_i32$5 - i64toi32_i32$1 | 0;
    i64toi32_i32$1 = $8(i64toi32_i32$0 | 0, i64toi32_i32$1 | 0) | 0;
    i64toi32_i32$3 = i64toi32_i32$HIGH_BITS;
    $664 = i64toi32_i32$1;
    i64toi32_i32$1 = $5_1;
    HEAP32[(i64toi32_i32$1 + 120 | 0) >> 2] = $664;
    HEAP32[(i64toi32_i32$1 + 124 | 0) >> 2] = i64toi32_i32$3;
    i64toi32_i32$5 = i64toi32_i32$1;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 128 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$1 + 132 | 0) >> 2] | 0;
    $220(i64toi32_i32$5 + 108 | 0 | 0, i64toi32_i32$3 | 0, i64toi32_i32$1 | 0);
    $1(3 | 0, HEAP32[(i64toi32_i32$5 + 140 | 0) >> 2] | 0 | 0, 0 | 0);
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 120 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$5 + 124 | 0) >> 2] | 0;
    $275_1 = i64toi32_i32$1;
    $275$hi = i64toi32_i32$3;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$5 + 208 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 212 | 0) >> 2] | 0;
    $276$hi = i64toi32_i32$1;
    i64toi32_i32$1 = $275$hi;
    i64toi32_i32$1 = $276$hi;
    $683 = i64toi32_i32$3;
    i64toi32_i32$1 = $275$hi;
    i64toi32_i32$5 = $275_1;
    i64toi32_i32$3 = $276$hi;
    i64toi32_i32$2 = $683;
    if ((i64toi32_i32$1 | 0) < (i64toi32_i32$3 | 0)) {
     $197_1 = 1
    } else {
     if ((i64toi32_i32$1 | 0) <= (i64toi32_i32$3 | 0)) {
      if (i64toi32_i32$5 >>> 0 >= i64toi32_i32$2 >>> 0) {
       $198_1 = 0
      } else {
       $198_1 = 1
      }
      $199_1 = $198_1;
     } else {
      $199_1 = 0
     }
     $197_1 = $199_1;
    }
    label$12 : {
     label$13 : {
      label$14 : {
       if (!($197_1 & 1 | 0)) {
        break label$14
       }
       if (($9($5_1 + 108 | 0 | 0, $2_1 | 0) | 0) & 1 | 0) {
        break label$13
       }
      }
      i64toi32_i32$2 = $5_1;
      i64toi32_i32$5 = HEAP32[(i64toi32_i32$2 + 120 | 0) >> 2] | 0;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 124 | 0) >> 2] | 0;
      $277_1 = i64toi32_i32$5;
      $277$hi = i64toi32_i32$1;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 208 | 0) >> 2] | 0;
      i64toi32_i32$5 = HEAP32[(i64toi32_i32$2 + 212 | 0) >> 2] | 0;
      $278$hi = i64toi32_i32$5;
      i64toi32_i32$5 = $277$hi;
      i64toi32_i32$5 = $278$hi;
      $706 = i64toi32_i32$1;
      i64toi32_i32$5 = $277$hi;
      i64toi32_i32$2 = $277_1;
      i64toi32_i32$1 = $278$hi;
      i64toi32_i32$3 = $706;
      if (!(((i64toi32_i32$2 | 0) == (i64toi32_i32$3 | 0) & (i64toi32_i32$5 | 0) == (i64toi32_i32$1 | 0) | 0) & 1 | 0)) {
       break label$12
      }
      i64toi32_i32$3 = $5_1;
      i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 128 | 0) >> 2] | 0;
      i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 132 | 0) >> 2] | 0;
      $279_1 = i64toi32_i32$2;
      $279$hi = i64toi32_i32$5;
      i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 184 | 0) >> 2] | 0;
      i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 188 | 0) >> 2] | 0;
      $280$hi = i64toi32_i32$2;
      i64toi32_i32$2 = $279$hi;
      i64toi32_i32$2 = $280$hi;
      $718 = i64toi32_i32$5;
      i64toi32_i32$2 = $279$hi;
      i64toi32_i32$3 = $279_1;
      i64toi32_i32$5 = $280$hi;
      i64toi32_i32$1 = $718;
      if ((i64toi32_i32$2 | 0) < (i64toi32_i32$5 | 0)) {
       $200_1 = 1
      } else {
       if ((i64toi32_i32$2 | 0) <= (i64toi32_i32$5 | 0)) {
        if (i64toi32_i32$3 >>> 0 >= i64toi32_i32$1 >>> 0) {
         $201_1 = 0
        } else {
         $201_1 = 1
        }
        $202_1 = $201_1;
       } else {
        $202_1 = 0
       }
       $200_1 = $202_1;
      }
      if (!($200_1 & 1 | 0)) {
       break label$12
      }
     }
     i64toi32_i32$1 = $5_1;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 120 | 0) >> 2] | 0;
     i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 124 | 0) >> 2] | 0;
     $728 = i64toi32_i32$3;
     i64toi32_i32$3 = i64toi32_i32$1;
     HEAP32[(i64toi32_i32$3 + 208 | 0) >> 2] = $728;
     HEAP32[(i64toi32_i32$3 + 212 | 0) >> 2] = i64toi32_i32$2;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$3 + 140 | 0) >> 2] | 0;
     i64toi32_i32$2 = i64toi32_i32$3 >> 31 | 0;
     $735 = i64toi32_i32$3;
     i64toi32_i32$3 = i64toi32_i32$1;
     HEAP32[(i64toi32_i32$3 + 200 | 0) >> 2] = $735;
     HEAP32[(i64toi32_i32$3 + 204 | 0) >> 2] = i64toi32_i32$2;
     i64toi32_i32$1 = i64toi32_i32$3;
     i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 128 | 0) >> 2] | 0;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$3 + 132 | 0) >> 2] | 0;
     $739 = i64toi32_i32$2;
     i64toi32_i32$2 = i64toi32_i32$1;
     HEAP32[(i64toi32_i32$1 + 184 | 0) >> 2] = $739;
     HEAP32[(i64toi32_i32$1 + 188 | 0) >> 2] = i64toi32_i32$3;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 200 | 0) >> 2] | 0;
     i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 204 | 0) >> 2] | 0;
     i64toi32_i32$2 = $7($6_1 | 0, i64toi32_i32$3 | 0, i64toi32_i32$2 | 0, 1 & 1 | 0 | 0) | 0;
     i64toi32_i32$3 = i64toi32_i32$HIGH_BITS;
     $220(i64toi32_i32$1 + 96 | 0 | 0, i64toi32_i32$2 | 0, i64toi32_i32$3 | 0);
     $10($0_1 | 0, i64toi32_i32$1 + 96 | 0 | 0) | 0;
     $197(i64toi32_i32$1 + 96 | 0 | 0) | 0;
    }
    $197($5_1 + 108 | 0 | 0) | 0;
    HEAP32[($5_1 + 140 | 0) >> 2] = (HEAP32[($5_1 + 140 | 0) >> 2] | 0) + 1 | 0;
    continue label$11;
   };
  }
  i64toi32_i32$3 = 0;
  i64toi32_i32$2 = $5_1;
  HEAP32[(i64toi32_i32$2 + 224 | 0) >> 2] = 0;
  HEAP32[(i64toi32_i32$2 + 228 | 0) >> 2] = i64toi32_i32$3;
  i64toi32_i32$3 = 0;
  HEAP32[(i64toi32_i32$2 + 216 | 0) >> 2] = 1e9;
  HEAP32[(i64toi32_i32$2 + 220 | 0) >> 2] = i64toi32_i32$3;
  label$15 : {
   label$16 : while (1) {
    i64toi32_i32$1 = $5_1;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 224 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 228 | 0) >> 2] | 0;
    $288$hi = i64toi32_i32$2;
    i64toi32_i32$2 = 0;
    $289$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $288$hi;
    i64toi32_i32$2 = $289$hi;
    i64toi32_i32$2 = $288$hi;
    i64toi32_i32$1 = i64toi32_i32$3;
    i64toi32_i32$3 = $289$hi;
    i64toi32_i32$5 = 10;
    i64toi32_i32$4 = i64toi32_i32$1 + i64toi32_i32$5 | 0;
    i64toi32_i32$0 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
    if (i64toi32_i32$4 >>> 0 < i64toi32_i32$5 >>> 0) {
     i64toi32_i32$0 = i64toi32_i32$0 + 1 | 0
    }
    $290$hi = i64toi32_i32$0;
    i64toi32_i32$2 = $5_1;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 216 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 220 | 0) >> 2] | 0;
    $291$hi = i64toi32_i32$1;
    i64toi32_i32$1 = $290$hi;
    i64toi32_i32$1 = $291$hi;
    $793 = i64toi32_i32$0;
    i64toi32_i32$1 = $290$hi;
    i64toi32_i32$2 = i64toi32_i32$4;
    i64toi32_i32$0 = $291$hi;
    i64toi32_i32$5 = $793;
    if ((i64toi32_i32$1 | 0) < (i64toi32_i32$0 | 0)) {
     $203_1 = 1
    } else {
     if ((i64toi32_i32$1 | 0) <= (i64toi32_i32$0 | 0)) {
      if (i64toi32_i32$2 >>> 0 >= i64toi32_i32$5 >>> 0) {
       $204_1 = 0
      } else {
       $204_1 = 1
      }
      $205_1 = $204_1;
     } else {
      $205_1 = 0
     }
     $203_1 = $205_1;
    }
    if (!($203_1 & 1 | 0)) {
     break label$15
    }
    i64toi32_i32$5 = $5_1;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$5 + 224 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 228 | 0) >> 2] | 0;
    $292_1 = i64toi32_i32$2;
    $292$hi = i64toi32_i32$1;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 216 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$5 + 220 | 0) >> 2] | 0;
    $293$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $292$hi;
    i64toi32_i32$2 = $293$hi;
    $805 = i64toi32_i32$1;
    i64toi32_i32$2 = $292$hi;
    i64toi32_i32$5 = $292_1;
    i64toi32_i32$1 = $293$hi;
    i64toi32_i32$0 = $805;
    i64toi32_i32$3 = i64toi32_i32$5 + i64toi32_i32$0 | 0;
    i64toi32_i32$4 = i64toi32_i32$2 + i64toi32_i32$1 | 0;
    if (i64toi32_i32$3 >>> 0 < i64toi32_i32$0 >>> 0) {
     i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
    }
    $294$hi = i64toi32_i32$4;
    i64toi32_i32$4 = 0;
    $295$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $294$hi;
    i64toi32_i32$4 = $295$hi;
    i64toi32_i32$4 = $294$hi;
    i64toi32_i32$5 = $295$hi;
    i64toi32_i32$5 = __wasm_i64_sdiv(i64toi32_i32$3 | 0, i64toi32_i32$4 | 0, 2 | 0, i64toi32_i32$5 | 0) | 0;
    i64toi32_i32$4 = i64toi32_i32$HIGH_BITS;
    $811 = i64toi32_i32$5;
    i64toi32_i32$5 = $5_1;
    HEAP32[(i64toi32_i32$5 + 88 | 0) >> 2] = $811;
    HEAP32[(i64toi32_i32$5 + 92 | 0) >> 2] = i64toi32_i32$4;
    i64toi32_i32$2 = i64toi32_i32$5;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$5 + 88 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$5 + 92 | 0) >> 2] | 0;
    i64toi32_i32$5 = $7($6_1 | 0, i64toi32_i32$4 | 0, i64toi32_i32$5 | 0, 0 & 1 | 0 | 0) | 0;
    i64toi32_i32$4 = i64toi32_i32$HIGH_BITS;
    $822 = i64toi32_i32$5;
    i64toi32_i32$5 = i64toi32_i32$2;
    HEAP32[(i64toi32_i32$5 + 80 | 0) >> 2] = $822;
    HEAP32[(i64toi32_i32$5 + 84 | 0) >> 2] = i64toi32_i32$4;
    i64toi32_i32$2 = i64toi32_i32$5;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$5 + 88 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$5 + 92 | 0) >> 2] | 0;
    $299$hi = i64toi32_i32$5;
    i64toi32_i32$5 = 0;
    $300$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $299$hi;
    i64toi32_i32$5 = $300$hi;
    i64toi32_i32$5 = $299$hi;
    i64toi32_i32$2 = i64toi32_i32$4;
    i64toi32_i32$4 = $300$hi;
    i64toi32_i32$0 = 1;
    i64toi32_i32$1 = i64toi32_i32$2 - i64toi32_i32$0 | 0;
    i64toi32_i32$6 = i64toi32_i32$2 >>> 0 < i64toi32_i32$0 >>> 0;
    i64toi32_i32$3 = i64toi32_i32$6 + i64toi32_i32$4 | 0;
    i64toi32_i32$3 = i64toi32_i32$5 - i64toi32_i32$3 | 0;
    i64toi32_i32$3 = $7($6_1 | 0, i64toi32_i32$1 | 0, i64toi32_i32$3 | 0, 0 & 1 | 0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$HIGH_BITS;
    $836 = i64toi32_i32$3;
    i64toi32_i32$3 = $5_1;
    HEAP32[(i64toi32_i32$3 + 72 | 0) >> 2] = $836;
    HEAP32[(i64toi32_i32$3 + 76 | 0) >> 2] = i64toi32_i32$2;
    i64toi32_i32$5 = i64toi32_i32$3;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 72 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$3 + 76 | 0) >> 2] | 0;
    $303_1 = i64toi32_i32$2;
    $303$hi = i64toi32_i32$3;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$5 + 224 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$5 + 228 | 0) >> 2] | 0;
    $304$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $303$hi;
    i64toi32_i32$2 = $304$hi;
    $842 = i64toi32_i32$3;
    i64toi32_i32$2 = $303$hi;
    i64toi32_i32$5 = $303_1;
    i64toi32_i32$3 = $304$hi;
    i64toi32_i32$0 = $842;
    if ((i64toi32_i32$2 | 0) < (i64toi32_i32$3 | 0)) {
     $206_1 = 1
    } else {
     if ((i64toi32_i32$2 | 0) <= (i64toi32_i32$3 | 0)) {
      if (i64toi32_i32$5 >>> 0 >= i64toi32_i32$0 >>> 0) {
       $207_1 = 0
      } else {
       $207_1 = 1
      }
      $208_1 = $207_1;
     } else {
      $208_1 = 0
     }
     $206_1 = $208_1;
    }
    label$17 : {
     if (!($206_1 & 1 | 0)) {
      break label$17
     }
     break label$15;
    }
    i64toi32_i32$0 = $5_1;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$0 + 80 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$0 + 84 | 0) >> 2] | 0;
    $305_1 = i64toi32_i32$5;
    $305$hi = i64toi32_i32$2;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$0 + 248 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$0 + 252 | 0) >> 2] | 0;
    $306$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $305$hi;
    i64toi32_i32$5 = $306$hi;
    $854 = i64toi32_i32$2;
    i64toi32_i32$5 = $305$hi;
    i64toi32_i32$0 = $305_1;
    i64toi32_i32$2 = $306$hi;
    i64toi32_i32$3 = $854;
    i64toi32_i32$4 = i64toi32_i32$0 - i64toi32_i32$3 | 0;
    i64toi32_i32$6 = i64toi32_i32$0 >>> 0 < i64toi32_i32$3 >>> 0;
    i64toi32_i32$1 = i64toi32_i32$6 + i64toi32_i32$2 | 0;
    i64toi32_i32$1 = i64toi32_i32$5 - i64toi32_i32$1 | 0;
    i64toi32_i32$0 = $5_1;
    HEAP32[(i64toi32_i32$0 + 64 | 0) >> 2] = i64toi32_i32$4;
    HEAP32[(i64toi32_i32$0 + 68 | 0) >> 2] = i64toi32_i32$1;
    i64toi32_i32$5 = i64toi32_i32$0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 72 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 76 | 0) >> 2] | 0;
    $308 = i64toi32_i32$1;
    $308$hi = i64toi32_i32$0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 248 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 252 | 0) >> 2] | 0;
    $309$hi = i64toi32_i32$1;
    i64toi32_i32$1 = $308$hi;
    i64toi32_i32$1 = $309$hi;
    $863 = i64toi32_i32$0;
    i64toi32_i32$1 = $308$hi;
    i64toi32_i32$5 = $308;
    i64toi32_i32$0 = $309$hi;
    i64toi32_i32$3 = $863;
    i64toi32_i32$2 = i64toi32_i32$5 - i64toi32_i32$3 | 0;
    i64toi32_i32$6 = i64toi32_i32$5 >>> 0 < i64toi32_i32$3 >>> 0;
    i64toi32_i32$4 = i64toi32_i32$6 + i64toi32_i32$0 | 0;
    i64toi32_i32$4 = i64toi32_i32$1 - i64toi32_i32$4 | 0;
    i64toi32_i32$5 = $5_1;
    HEAP32[(i64toi32_i32$5 + 56 | 0) >> 2] = i64toi32_i32$2;
    HEAP32[(i64toi32_i32$5 + 60 | 0) >> 2] = i64toi32_i32$4;
    i64toi32_i32$1 = i64toi32_i32$5;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$1 + 64 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$1 + 68 | 0) >> 2] | 0;
    $311$hi = i64toi32_i32$5;
    i64toi32_i32$5 = 0;
    $312$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $311$hi;
    i64toi32_i32$5 = $312$hi;
    i64toi32_i32$5 = $311$hi;
    i64toi32_i32$1 = i64toi32_i32$4;
    i64toi32_i32$4 = $312$hi;
    i64toi32_i32$3 = 0;
    if ((i64toi32_i32$5 | 0) < (i64toi32_i32$4 | 0)) {
     $209_1 = 1
    } else {
     if ((i64toi32_i32$5 | 0) <= (i64toi32_i32$4 | 0)) {
      if (i64toi32_i32$1 >>> 0 >= i64toi32_i32$3 >>> 0) {
       $210_1 = 0
      } else {
       $210_1 = 1
      }
      $211_1 = $210_1;
     } else {
      $211_1 = 0
     }
     $209_1 = $211_1;
    }
    label$18 : {
     if (!($209_1 & 1 | 0)) {
      break label$18
     }
     i64toi32_i32$3 = $5_1;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 64 | 0) >> 2] | 0;
     i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 68 | 0) >> 2] | 0;
     $313$hi = i64toi32_i32$5;
     i64toi32_i32$5 = 0;
     $879$hi = i64toi32_i32$5;
     i64toi32_i32$5 = $313$hi;
     $880 = i64toi32_i32$1;
     i64toi32_i32$5 = $879$hi;
     i64toi32_i32$3 = 0;
     i64toi32_i32$1 = $313$hi;
     i64toi32_i32$4 = $880;
     i64toi32_i32$0 = i64toi32_i32$3 - i64toi32_i32$4 | 0;
     i64toi32_i32$6 = i64toi32_i32$3 >>> 0 < i64toi32_i32$4 >>> 0;
     i64toi32_i32$2 = i64toi32_i32$6 + i64toi32_i32$1 | 0;
     i64toi32_i32$2 = i64toi32_i32$5 - i64toi32_i32$2 | 0;
     i64toi32_i32$3 = $5_1;
     HEAP32[(i64toi32_i32$3 + 64 | 0) >> 2] = i64toi32_i32$0;
     HEAP32[(i64toi32_i32$3 + 68 | 0) >> 2] = i64toi32_i32$2;
    }
    i64toi32_i32$5 = $5_1;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$5 + 56 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$5 + 60 | 0) >> 2] | 0;
    $316$hi = i64toi32_i32$3;
    i64toi32_i32$3 = 0;
    $317$hi = i64toi32_i32$3;
    i64toi32_i32$3 = $316$hi;
    i64toi32_i32$3 = $317$hi;
    i64toi32_i32$3 = $316$hi;
    i64toi32_i32$5 = i64toi32_i32$2;
    i64toi32_i32$2 = $317$hi;
    i64toi32_i32$4 = 0;
    if ((i64toi32_i32$3 | 0) < (i64toi32_i32$2 | 0)) {
     $212_1 = 1
    } else {
     if ((i64toi32_i32$3 | 0) <= (i64toi32_i32$2 | 0)) {
      if (i64toi32_i32$5 >>> 0 >= i64toi32_i32$4 >>> 0) {
       $213_1 = 0
      } else {
       $213_1 = 1
      }
      $214_1 = $213_1;
     } else {
      $214_1 = 0
     }
     $212_1 = $214_1;
    }
    label$19 : {
     if (!($212_1 & 1 | 0)) {
      break label$19
     }
     i64toi32_i32$4 = $5_1;
     i64toi32_i32$5 = HEAP32[(i64toi32_i32$4 + 56 | 0) >> 2] | 0;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$4 + 60 | 0) >> 2] | 0;
     $318$hi = i64toi32_i32$3;
     i64toi32_i32$3 = 0;
     $896$hi = i64toi32_i32$3;
     i64toi32_i32$3 = $318$hi;
     $897 = i64toi32_i32$5;
     i64toi32_i32$3 = $896$hi;
     i64toi32_i32$4 = 0;
     i64toi32_i32$5 = $318$hi;
     i64toi32_i32$2 = $897;
     i64toi32_i32$1 = i64toi32_i32$4 - i64toi32_i32$2 | 0;
     i64toi32_i32$6 = i64toi32_i32$4 >>> 0 < i64toi32_i32$2 >>> 0;
     i64toi32_i32$0 = i64toi32_i32$6 + i64toi32_i32$5 | 0;
     i64toi32_i32$0 = i64toi32_i32$3 - i64toi32_i32$0 | 0;
     i64toi32_i32$4 = $5_1;
     HEAP32[(i64toi32_i32$4 + 56 | 0) >> 2] = i64toi32_i32$1;
     HEAP32[(i64toi32_i32$4 + 60 | 0) >> 2] = i64toi32_i32$0;
    }
    i64toi32_i32$3 = $5_1;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$3 + 64 | 0) >> 2] | 0;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$3 + 68 | 0) >> 2] | 0;
    $321 = i64toi32_i32$0;
    $321$hi = i64toi32_i32$4;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$3 + 56 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$3 + 60 | 0) >> 2] | 0;
    $322$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $321$hi;
    i64toi32_i32$0 = $322$hi;
    $906 = i64toi32_i32$4;
    i64toi32_i32$0 = $321$hi;
    i64toi32_i32$3 = $321;
    i64toi32_i32$4 = $322$hi;
    i64toi32_i32$2 = $906;
    if ((i64toi32_i32$0 | 0) > (i64toi32_i32$4 | 0)) {
     $215_1 = 1
    } else {
     if ((i64toi32_i32$0 | 0) >= (i64toi32_i32$4 | 0)) {
      if (i64toi32_i32$3 >>> 0 <= i64toi32_i32$2 >>> 0) {
       $217_1 = 0
      } else {
       $217_1 = 1
      }
      $218_1 = $217_1;
     } else {
      $218_1 = 0
     }
     $215_1 = $218_1;
    }
    label$20 : {
     label$21 : {
      if (!($215_1 & 1 | 0)) {
       break label$21
      }
      i64toi32_i32$2 = $5_1;
      i64toi32_i32$3 = HEAP32[(i64toi32_i32$2 + 88 | 0) >> 2] | 0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 92 | 0) >> 2] | 0;
      $916 = i64toi32_i32$3;
      i64toi32_i32$3 = i64toi32_i32$2;
      HEAP32[(i64toi32_i32$3 + 216 | 0) >> 2] = $916;
      HEAP32[(i64toi32_i32$3 + 220 | 0) >> 2] = i64toi32_i32$0;
      break label$20;
     }
     i64toi32_i32$2 = $5_1;
     i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 88 | 0) >> 2] | 0;
     i64toi32_i32$3 = HEAP32[(i64toi32_i32$2 + 92 | 0) >> 2] | 0;
     $324$hi = i64toi32_i32$3;
     i64toi32_i32$3 = 0;
     $325$hi = i64toi32_i32$3;
     i64toi32_i32$3 = $324$hi;
     i64toi32_i32$3 = $325$hi;
     i64toi32_i32$3 = $324$hi;
     i64toi32_i32$2 = i64toi32_i32$0;
     i64toi32_i32$0 = $325$hi;
     i64toi32_i32$4 = 1;
     i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$4 | 0;
     i64toi32_i32$6 = i64toi32_i32$2 >>> 0 < i64toi32_i32$4 >>> 0;
     i64toi32_i32$1 = i64toi32_i32$6 + i64toi32_i32$0 | 0;
     i64toi32_i32$1 = i64toi32_i32$3 - i64toi32_i32$1 | 0;
     i64toi32_i32$2 = $5_1;
     HEAP32[(i64toi32_i32$2 + 224 | 0) >> 2] = i64toi32_i32$5;
     HEAP32[(i64toi32_i32$2 + 228 | 0) >> 2] = i64toi32_i32$1;
    }
    i64toi32_i32$3 = $5_1;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 224 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 228 | 0) >> 2] | 0;
    $131_1 = i64toi32_i32$1;
    i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 216 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 220 | 0) >> 2] | 0;
    $1(2 | 0, $131_1 | 0, i64toi32_i32$2 | 0);
    continue label$16;
   };
  }
  i64toi32_i32$3 = $5_1;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 224 | 0) >> 2] | 0;
  i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 228 | 0) >> 2] | 0;
  i64toi32_i32$2 = $7($6_1 | 0, i64toi32_i32$1 | 0, i64toi32_i32$2 | 0, 0 & 1 | 0 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  $330 = i64toi32_i32$2;
  $330$hi = i64toi32_i32$1;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 248 | 0) >> 2] | 0;
  i64toi32_i32$2 = HEAP32[(i64toi32_i32$3 + 252 | 0) >> 2] | 0;
  $331$hi = i64toi32_i32$2;
  i64toi32_i32$2 = $330$hi;
  i64toi32_i32$2 = $331$hi;
  $947 = i64toi32_i32$1;
  i64toi32_i32$2 = $330$hi;
  i64toi32_i32$3 = $330;
  i64toi32_i32$1 = $331$hi;
  i64toi32_i32$4 = $947;
  label$22 : {
   if (!(((i64toi32_i32$3 | 0) == (i64toi32_i32$4 | 0) & (i64toi32_i32$2 | 0) == (i64toi32_i32$1 | 0) | 0) & 1 | 0)) {
    break label$22
   }
   i64toi32_i32$4 = $5_1;
   i64toi32_i32$3 = HEAP32[(i64toi32_i32$4 + 224 | 0) >> 2] | 0;
   i64toi32_i32$2 = HEAP32[(i64toi32_i32$4 + 228 | 0) >> 2] | 0;
   $332$hi = i64toi32_i32$2;
   i64toi32_i32$2 = -1;
   $333$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $332$hi;
   i64toi32_i32$2 = $333$hi;
   i64toi32_i32$2 = $332$hi;
   i64toi32_i32$4 = i64toi32_i32$3;
   i64toi32_i32$3 = $333$hi;
   i64toi32_i32$1 = -1;
   i64toi32_i32$0 = i64toi32_i32$4 + i64toi32_i32$1 | 0;
   i64toi32_i32$5 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
   if (i64toi32_i32$0 >>> 0 < i64toi32_i32$1 >>> 0) {
    i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
   }
   i64toi32_i32$4 = $5_1;
   HEAP32[(i64toi32_i32$4 + 224 | 0) >> 2] = i64toi32_i32$0;
   HEAP32[(i64toi32_i32$4 + 228 | 0) >> 2] = i64toi32_i32$5;
  }
  i64toi32_i32$2 = $5_1;
  i64toi32_i32$5 = HEAP32[(i64toi32_i32$2 + 216 | 0) >> 2] | 0;
  i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 220 | 0) >> 2] | 0;
  i64toi32_i32$4 = $7($6_1 | 0, i64toi32_i32$5 | 0, i64toi32_i32$4 | 0, 0 & 1 | 0 | 0) | 0;
  i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
  $336 = i64toi32_i32$4;
  $336$hi = i64toi32_i32$5;
  i64toi32_i32$5 = HEAP32[(i64toi32_i32$2 + 248 | 0) >> 2] | 0;
  i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 252 | 0) >> 2] | 0;
  $337$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $336$hi;
  i64toi32_i32$4 = $337$hi;
  $973 = i64toi32_i32$5;
  i64toi32_i32$4 = $336$hi;
  i64toi32_i32$2 = $336;
  i64toi32_i32$5 = $337$hi;
  i64toi32_i32$1 = $973;
  label$23 : {
   if (!(((i64toi32_i32$2 | 0) == (i64toi32_i32$1 | 0) & (i64toi32_i32$4 | 0) == (i64toi32_i32$5 | 0) | 0) & 1 | 0)) {
    break label$23
   }
   i64toi32_i32$1 = $5_1;
   i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 216 | 0) >> 2] | 0;
   i64toi32_i32$4 = HEAP32[(i64toi32_i32$1 + 220 | 0) >> 2] | 0;
   $338$hi = i64toi32_i32$4;
   i64toi32_i32$4 = 0;
   $339$hi = i64toi32_i32$4;
   i64toi32_i32$4 = $338$hi;
   i64toi32_i32$4 = $339$hi;
   i64toi32_i32$4 = $338$hi;
   i64toi32_i32$1 = i64toi32_i32$2;
   i64toi32_i32$2 = $339$hi;
   i64toi32_i32$5 = 1;
   i64toi32_i32$3 = i64toi32_i32$1 + i64toi32_i32$5 | 0;
   i64toi32_i32$0 = i64toi32_i32$4 + i64toi32_i32$2 | 0;
   if (i64toi32_i32$3 >>> 0 < i64toi32_i32$5 >>> 0) {
    i64toi32_i32$0 = i64toi32_i32$0 + 1 | 0
   }
   i64toi32_i32$1 = $5_1;
   HEAP32[(i64toi32_i32$1 + 216 | 0) >> 2] = i64toi32_i32$3;
   HEAP32[(i64toi32_i32$1 + 220 | 0) >> 2] = i64toi32_i32$0;
  }
  i64toi32_i32$4 = $5_1;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$4 + 224 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$4 + 228 | 0) >> 2] | 0;
  HEAP32[(i64toi32_i32$4 + 52 | 0) >> 2] = i64toi32_i32$0;
  label$24 : {
   label$25 : while (1) {
    i64toi32_i32$0 = HEAP32[($5_1 + 52 | 0) >> 2] | 0;
    i64toi32_i32$1 = i64toi32_i32$0 >> 31 | 0;
    $342 = i64toi32_i32$0;
    $342$hi = i64toi32_i32$1;
    i64toi32_i32$4 = $5_1;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$4 + 216 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$4 + 220 | 0) >> 2] | 0;
    $343$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $342$hi;
    i64toi32_i32$0 = $343$hi;
    $1001 = i64toi32_i32$1;
    i64toi32_i32$0 = $342$hi;
    i64toi32_i32$4 = $342;
    i64toi32_i32$1 = $343$hi;
    i64toi32_i32$5 = $1001;
    if ((i64toi32_i32$0 | 0) < (i64toi32_i32$1 | 0)) {
     $219_1 = 1
    } else {
     if ((i64toi32_i32$0 | 0) <= (i64toi32_i32$1 | 0)) {
      if (i64toi32_i32$4 >>> 0 > i64toi32_i32$5 >>> 0) {
       $220_1 = 0
      } else {
       $220_1 = 1
      }
      $221_1 = $220_1;
     } else {
      $221_1 = 0
     }
     $219_1 = $221_1;
    }
    if (!($219_1 & 1 | 0)) {
     break label$24
    }
    i64toi32_i32$0 = HEAP32[($5_1 + 52 | 0) >> 2] | 0;
    i64toi32_i32$4 = i64toi32_i32$0 >> 31 | 0;
    i64toi32_i32$4 = $7($6_1 | 0, i64toi32_i32$0 | 0, i64toi32_i32$4 | 0, 0 & 1 | 0 | 0) | 0;
    i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
    $1021 = i64toi32_i32$4;
    i64toi32_i32$4 = $5_1;
    HEAP32[(i64toi32_i32$4 + 40 | 0) >> 2] = $1021;
    HEAP32[(i64toi32_i32$4 + 44 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$5 = i64toi32_i32$4;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 40 | 0) >> 2] | 0;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$5 + 44 | 0) >> 2] | 0;
    $346 = i64toi32_i32$0;
    $346$hi = i64toi32_i32$4;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$5 + 248 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 252 | 0) >> 2] | 0;
    $347$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $346$hi;
    i64toi32_i32$0 = $347$hi;
    $1027 = i64toi32_i32$4;
    i64toi32_i32$0 = $346$hi;
    i64toi32_i32$5 = $346;
    i64toi32_i32$4 = $347$hi;
    i64toi32_i32$1 = $1027;
    i64toi32_i32$2 = i64toi32_i32$5 - i64toi32_i32$1 | 0;
    i64toi32_i32$6 = i64toi32_i32$5 >>> 0 < i64toi32_i32$1 >>> 0;
    i64toi32_i32$3 = i64toi32_i32$6 + i64toi32_i32$4 | 0;
    i64toi32_i32$3 = i64toi32_i32$0 - i64toi32_i32$3 | 0;
    i64toi32_i32$3 = $8(i64toi32_i32$2 | 0, i64toi32_i32$3 | 0) | 0;
    i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
    $1032 = i64toi32_i32$3;
    i64toi32_i32$3 = $5_1;
    HEAP32[(i64toi32_i32$3 + 32 | 0) >> 2] = $1032;
    HEAP32[(i64toi32_i32$3 + 36 | 0) >> 2] = i64toi32_i32$5;
    i64toi32_i32$0 = i64toi32_i32$3;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 40 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$3 + 44 | 0) >> 2] | 0;
    $220(i64toi32_i32$0 + 20 | 0 | 0, i64toi32_i32$5 | 0, i64toi32_i32$3 | 0);
    $1(4 | 0, HEAP32[(i64toi32_i32$0 + 52 | 0) >> 2] | 0 | 0, 0 | 0);
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$0 + 32 | 0) >> 2] | 0;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$0 + 36 | 0) >> 2] | 0;
    $351 = i64toi32_i32$3;
    $351$hi = i64toi32_i32$5;
    i64toi32_i32$5 = HEAP32[(i64toi32_i32$0 + 208 | 0) >> 2] | 0;
    i64toi32_i32$3 = HEAP32[(i64toi32_i32$0 + 212 | 0) >> 2] | 0;
    $352$hi = i64toi32_i32$3;
    i64toi32_i32$3 = $351$hi;
    i64toi32_i32$3 = $352$hi;
    $1051 = i64toi32_i32$5;
    i64toi32_i32$3 = $351$hi;
    i64toi32_i32$0 = $351;
    i64toi32_i32$5 = $352$hi;
    i64toi32_i32$1 = $1051;
    if ((i64toi32_i32$3 | 0) < (i64toi32_i32$5 | 0)) {
     $222_1 = 1
    } else {
     if ((i64toi32_i32$3 | 0) <= (i64toi32_i32$5 | 0)) {
      if (i64toi32_i32$0 >>> 0 >= i64toi32_i32$1 >>> 0) {
       $223_1 = 0
      } else {
       $223_1 = 1
      }
      $224_1 = $223_1;
     } else {
      $224_1 = 0
     }
     $222_1 = $224_1;
    }
    label$26 : {
     label$27 : {
      label$28 : {
       if (!($222_1 & 1 | 0)) {
        break label$28
       }
       if (($9($5_1 + 20 | 0 | 0, $2_1 | 0) | 0) & 1 | 0) {
        break label$27
       }
      }
      i64toi32_i32$1 = $5_1;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$1 + 32 | 0) >> 2] | 0;
      i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 36 | 0) >> 2] | 0;
      $353 = i64toi32_i32$0;
      $353$hi = i64toi32_i32$3;
      i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 208 | 0) >> 2] | 0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$1 + 212 | 0) >> 2] | 0;
      $354$hi = i64toi32_i32$0;
      i64toi32_i32$0 = $353$hi;
      i64toi32_i32$0 = $354$hi;
      $1074 = i64toi32_i32$3;
      i64toi32_i32$0 = $353$hi;
      i64toi32_i32$1 = $353;
      i64toi32_i32$3 = $354$hi;
      i64toi32_i32$5 = $1074;
      if (!(((i64toi32_i32$1 | 0) == (i64toi32_i32$5 | 0) & (i64toi32_i32$0 | 0) == (i64toi32_i32$3 | 0) | 0) & 1 | 0)) {
       break label$26
      }
      i64toi32_i32$5 = $5_1;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 40 | 0) >> 2] | 0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 44 | 0) >> 2] | 0;
      $355 = i64toi32_i32$1;
      $355$hi = i64toi32_i32$0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$5 + 184 | 0) >> 2] | 0;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$5 + 188 | 0) >> 2] | 0;
      $356$hi = i64toi32_i32$1;
      i64toi32_i32$1 = $355$hi;
      i64toi32_i32$1 = $356$hi;
      $1086 = i64toi32_i32$0;
      i64toi32_i32$1 = $355$hi;
      i64toi32_i32$5 = $355;
      i64toi32_i32$0 = $356$hi;
      i64toi32_i32$3 = $1086;
      if ((i64toi32_i32$1 | 0) < (i64toi32_i32$0 | 0)) {
       $225_1 = 1
      } else {
       if ((i64toi32_i32$1 | 0) <= (i64toi32_i32$0 | 0)) {
        if (i64toi32_i32$5 >>> 0 >= i64toi32_i32$3 >>> 0) {
         $226_1 = 0
        } else {
         $226_1 = 1
        }
        $228_1 = $226_1;
       } else {
        $228_1 = 0
       }
       $225_1 = $228_1;
      }
      if (!($225_1 & 1 | 0)) {
       break label$26
      }
     }
     i64toi32_i32$3 = $5_1;
     i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 32 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 36 | 0) >> 2] | 0;
     $1096 = i64toi32_i32$5;
     i64toi32_i32$5 = i64toi32_i32$3;
     HEAP32[(i64toi32_i32$3 + 208 | 0) >> 2] = $1096;
     HEAP32[(i64toi32_i32$3 + 212 | 0) >> 2] = i64toi32_i32$1;
     i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 52 | 0) >> 2] | 0;
     i64toi32_i32$1 = i64toi32_i32$5 >> 31 | 0;
     $1103 = i64toi32_i32$5;
     i64toi32_i32$5 = i64toi32_i32$3;
     HEAP32[(i64toi32_i32$3 + 200 | 0) >> 2] = $1103;
     HEAP32[(i64toi32_i32$3 + 204 | 0) >> 2] = i64toi32_i32$1;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 40 | 0) >> 2] | 0;
     i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 44 | 0) >> 2] | 0;
     $1107 = i64toi32_i32$1;
     i64toi32_i32$1 = i64toi32_i32$3;
     HEAP32[(i64toi32_i32$3 + 184 | 0) >> 2] = $1107;
     HEAP32[(i64toi32_i32$3 + 188 | 0) >> 2] = i64toi32_i32$5;
     i64toi32_i32$5 = HEAP32[(i64toi32_i32$3 + 200 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$3 + 204 | 0) >> 2] | 0;
     i64toi32_i32$1 = $7($6_1 | 0, i64toi32_i32$5 | 0, i64toi32_i32$1 | 0, 0 & 1 | 0 | 0) | 0;
     i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
     $220(i64toi32_i32$3 + 8 | 0 | 0, i64toi32_i32$1 | 0, i64toi32_i32$5 | 0);
     $10($0_1 | 0, i64toi32_i32$3 + 8 | 0 | 0) | 0;
     $197(i64toi32_i32$3 + 8 | 0 | 0) | 0;
    }
    $197($5_1 + 20 | 0 | 0) | 0;
    HEAP32[($5_1 + 52 | 0) >> 2] = (HEAP32[($5_1 + 52 | 0) >> 2] | 0) + 1 | 0;
    continue label$25;
   };
  }
  HEAP8[($5_1 + 199 | 0) >> 0] = 1 & 1 | 0;
  label$29 : {
   if ((HEAPU8[($5_1 + 199 | 0) >> 0] | 0) & 1 | 0) {
    break label$29
   }
   $197($0_1 | 0) | 0;
  }
  global$0 = $5_1 + 272 | 0;
  return;
 }
 
 function $5($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $13(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $6($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $11($4_1 | 0, $3_1 + 11 | 0 | 0, $3_1 + 10 | 0 | 0) | 0;
  $14($4_1 | 0);
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $7($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  $5_1 = global$0 - 64 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 60 | 0) >> 2] = $0_1;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$1 = $5_1;
  HEAP32[($5_1 + 48 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 52 | 0) >> 2] = i64toi32_i32$0;
  HEAP8[($5_1 + 47 | 0) >> 0] = $2_1;
  i64toi32_i32$0 = HEAP32[($5_1 + 48 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($5_1 + 52 | 0) >> 2] | 0;
  $220($5_1 + 32 | 0 | 0, i64toi32_i32$0 | 0, i64toi32_i32$1 | 0);
  $15($5_1 + 20 | 0 | 0, $5_1 + 32 | 0 | 0) | 0;
  label$1 : {
   if (!((HEAPU8[($5_1 + 47 | 0) >> 0] | 0) & 1 | 0)) {
    break label$1
   }
   $16($5_1 + 32 | 0 | 0);
  }
  HEAP32[($5_1 + 16 | 0) >> 2] = $17($5_1 + 32 | 0 | 0) | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = $18($5_1 + 32 | 0 | 0) | 0;
  $19(HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
  $20($5_1 + 20 | 0 | 0, $5_1 + 32 | 0 | 0) | 0;
  $3($5_1 | 0, $5($5_1 + 20 | 0 | 0) | 0 | 0) | 0;
  i64toi32_i32$1 = $216($5_1 | 0, 0 | 0, 10 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $197($5_1 | 0) | 0;
  $197($5_1 + 20 | 0 | 0) | 0;
  $197($5_1 + 32 | 0 | 0) | 0;
  global$0 = $5_1 + 64 | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function $8($0_1, $0$hi) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  var i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, i64toi32_i32$3 = 0, $7$hi = 0, $5$hi = 0, i64toi32_i32$5 = 0, $6$hi = 0, $13_1 = 0, $5_1 = 0, $25$hi = 0;
  i64toi32_i32$0 = $0$hi;
  i64toi32_i32$1 = global$0 - 16 | 0;
  HEAP32[(i64toi32_i32$1 + 8 | 0) >> 2] = $0_1;
  HEAP32[(i64toi32_i32$1 + 12 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$2 = i64toi32_i32$1;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$1 + 8 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$1 + 12 | 0) >> 2] | 0;
  $5_1 = i64toi32_i32$0;
  $5$hi = i64toi32_i32$1;
  i64toi32_i32$1 = 0;
  $6$hi = i64toi32_i32$1;
  i64toi32_i32$1 = $5$hi;
  i64toi32_i32$1 = $6$hi;
  i64toi32_i32$1 = $5$hi;
  i64toi32_i32$2 = i64toi32_i32$0;
  i64toi32_i32$0 = $6$hi;
  i64toi32_i32$3 = 63;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
   $13_1 = i64toi32_i32$1 >> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$0 = i64toi32_i32$1 >> i64toi32_i32$4 | 0;
   $13_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  $7$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $5$hi;
  i64toi32_i32$0 = $7$hi;
  i64toi32_i32$0 = $5$hi;
  i64toi32_i32$1 = $5_1;
  i64toi32_i32$2 = $7$hi;
  i64toi32_i32$3 = $13_1;
  i64toi32_i32$2 = i64toi32_i32$0 ^ $7$hi | 0;
  $25$hi = i64toi32_i32$2;
  i64toi32_i32$2 = $7$hi;
  i64toi32_i32$2 = $25$hi;
  i64toi32_i32$0 = i64toi32_i32$1 ^ i64toi32_i32$3 | 0;
  i64toi32_i32$1 = $7$hi;
  i64toi32_i32$4 = i64toi32_i32$0 - i64toi32_i32$3 | 0;
  i64toi32_i32$5 = (i64toi32_i32$0 >>> 0 < i64toi32_i32$3 >>> 0) + i64toi32_i32$1 | 0;
  i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$5 | 0;
  i64toi32_i32$0 = i64toi32_i32$4;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$5;
  return i64toi32_i32$0 | 0;
 }
 
 function $9($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $11_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $11_1 = (($21(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0) ^ -1 | 0) & 1 | 0;
  global$0 = $4_1 + 16 | 0;
  return $11_1 | 0;
 }
 
 function $10($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $22($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $11($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $23($6_1 | 0) | 0;
  $24($6_1 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $12($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $87(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $13($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $35($69(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $14($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $9_1 = 0, $4_1 = 0, $8_1 = 0, $38_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  i64toi32_i32$0 = 0;
  i64toi32_i32$1 = $3_1;
  HEAP32[$3_1 >> 2] = 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = i64toi32_i32$0;
  $8_1 = $25($4_1 | 0) | 0;
  i64toi32_i32$0 = HEAP32[$3_1 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  $38_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $8_1;
  HEAP32[i64toi32_i32$0 >> 2] = $38_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
  $9_1 = 8;
  HEAP32[(i64toi32_i32$0 + $9_1 | 0) >> 2] = HEAP32[($3_1 + $9_1 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $15($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, i64toi32_i32$0 = 0, $5_1 = 0, $19_1 = 0, $21_1 = 0, $20_1 = 0, i64toi32_i32$1 = 0, $81_1 = 0, $30_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $5_1;
  $30($29(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0);
  $31($5_1 | 0, $4_1 + 3 | 0 | 0, $4_1 + 2 | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if (($32(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0) & 1 | 0) {
     break label$2
    }
    $19_1 = $33(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0;
    $20_1 = $25($5_1 | 0) | 0;
    i64toi32_i32$0 = HEAP32[$19_1 >> 2] | 0;
    i64toi32_i32$1 = HEAP32[($19_1 + 4 | 0) >> 2] | 0;
    $81_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $20_1;
    HEAP32[i64toi32_i32$0 >> 2] = $81_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    $21_1 = 8;
    HEAP32[(i64toi32_i32$0 + $21_1 | 0) >> 2] = HEAP32[($19_1 + $21_1 | 0) >> 2] | 0;
    break label$1;
   }
   $203($5_1 | 0, $35($34(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0, $36(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0);
  }
  $30_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return $30_1 | 0;
 }
 
 function $16($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $38($4_1 | 0, ($37($4_1 | 0) | 0) - 1 | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $17($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $41($4_1 | 0, $40($4_1 | 0) | 0 | 0) | 0;
  $7_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $18($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $41($4_1 | 0, ($40($4_1 | 0) | 0) + ($37($4_1 | 0) | 0) | 0 | 0) | 0;
  $9_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $19($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  HEAP32[$4_1 >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  $39(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $20($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = $42(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $7_1 | 0;
 }
 
 function $21($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $35_1 = 0, $40_1 = 0, $63_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $37(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($4_1 + 16 | 0) >> 2] | 0 | 0) != ($37(HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0) | 0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP8[($4_1 + 31 | 0) >> 0] = 0 & 1 | 0;
    break label$1;
   }
   HEAP32[($4_1 + 12 | 0) >> 2] = $13(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($4_1 + 8 | 0) >> 2] = $13(HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0) | 0;
   label$3 : {
    if (!(($32(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0) | 0) & 1 | 0)) {
     break label$3
    }
    HEAP8[($4_1 + 31 | 0) >> 0] = ($72(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 16 | 0) >> 2] | 0 | 0) | 0 | 0) == (0 | 0) & 1 | 0;
    break label$1;
   }
   label$4 : {
    label$5 : while (1) {
     if (!(HEAP32[($4_1 + 16 | 0) >> 2] | 0)) {
      break label$4
     }
     $35_1 = 24;
     $40_1 = 24;
     label$6 : {
      if (!((((HEAPU8[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 0] | 0) << $35_1 | 0) >> $35_1 | 0 | 0) != (((HEAPU8[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 0] | 0) << $40_1 | 0) >> $40_1 | 0 | 0) & 1 | 0)) {
       break label$6
      }
      HEAP8[($4_1 + 31 | 0) >> 0] = 0 & 1 | 0;
      break label$1;
     }
     HEAP32[($4_1 + 16 | 0) >> 2] = (HEAP32[($4_1 + 16 | 0) >> 2] | 0) + -1 | 0;
     HEAP32[($4_1 + 12 | 0) >> 2] = (HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 1 | 0;
     HEAP32[($4_1 + 8 | 0) >> 2] = (HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 1 | 0;
     continue label$5;
    };
   }
   HEAP8[($4_1 + 31 | 0) >> 0] = 1 & 1 | 0;
  }
  $63_1 = (HEAPU8[($4_1 + 31 | 0) >> 0] | 0) & 1 | 0;
  global$0 = $4_1 + 32 | 0;
  return $63_1 | 0;
 }
 
 function $22($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, i64toi32_i32$0 = 0, $14_1 = 0, $16_1 = 0, $15_1 = 0, i64toi32_i32$1 = 0, $71_1 = 0, $23_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  label$1 : {
   if (!(($32($5_1 | 0) | 0) & 1 | 0)) {
    break label$1
   }
   $75($73($5_1 | 0) | 0 | 0, $52($5_1 | 0) | 0 | 0, $74($5_1 | 0) | 0 | 0);
  }
  $76($5_1 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0);
  $14_1 = $25(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  $15_1 = $25($5_1 | 0) | 0;
  i64toi32_i32$0 = HEAP32[$14_1 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($14_1 + 4 | 0) >> 2] | 0;
  $71_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $15_1;
  HEAP32[i64toi32_i32$0 >> 2] = $71_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
  $16_1 = 8;
  HEAP32[(i64toi32_i32$0 + $16_1 | 0) >> 2] = HEAP32[($14_1 + $16_1 | 0) >> 2] | 0;
  $55(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0, 0 | 0);
  $23_1 = $53(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  HEAP8[($4_1 + 3 | 0) >> 0] = 0;
  $51($23_1 | 0, $4_1 + 3 | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $23($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0;
 }
 
 function $24($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  $26($4_1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $25($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $28(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $26($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $27($4_1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $4_1 | 0;
 }
 
 function $27($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $28($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $29($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $43(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $30($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[((global$0 - 16 | 0) + 12 | 0) >> 2] = $0_1;
  return;
 }
 
 function $31($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $23($6_1 | 0) | 0;
  $44($6_1 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $32($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $16_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $16_1 = (((HEAPU8[(($33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 11 | 0) >> 0] | 0) >>> 7 | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0;
  global$0 = $3_1 + 16 | 0;
  return $16_1 | 0;
 }
 
 function $33($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $45(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $34($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = HEAP32[($33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $35($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $36($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = HEAP32[(($33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 4 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $37($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($32($4_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $9_1 = $36($4_1 | 0) | 0;
    break label$1;
   }
   $9_1 = $49($4_1 | 0) | 0;
  }
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $38($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $48($5_1 | 0, $47($40($5_1 | 0) | 0 | 0) | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $39($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  HEAP32[($4_1 + 16 | 0) >> 2] = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  $57(HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 16 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 32 | 0;
  return;
 }
 
 function $40($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($32($4_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $9_1 = $52($4_1 | 0) | 0;
    break label$1;
   }
   $9_1 = $53($4_1 | 0) | 0;
  }
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $41($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $9_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  $68($4_1 + 12 | 0 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  $9_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $42($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $10_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $10_1 = $205(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $13(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0, $37(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $10_1 | 0;
 }
 
 function $43($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $46(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $44($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $45($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $46($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $47($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $48($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $6_1 = 0, $10_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $6_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $50($6_1 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  $10_1 = (HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0;
  HEAP8[($5_1 + 3 | 0) >> 0] = 0;
  $51($10_1 | 0, $5_1 + 3 | 0 | 0);
  global$0 = $5_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $49($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $10_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $10_1 = ((HEAPU8[(($33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 11 | 0) >> 0] | 0) & 127 | 0) & 255 | 0;
  global$0 = $3_1 + 16 | 0;
  return $10_1 | 0;
 }
 
 function $50($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($32($5_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $54($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
    break label$1;
   }
   $55($5_1 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $51($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP8[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 0] = HEAPU8[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 0] | 0;
  return;
 }
 
 function $52($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = HEAP32[($25(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $53($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $56($25(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $54($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $6_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $6_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  HEAP32[(($25(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 4 | 0) >> 2] = $6_1;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $55($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0, $7_1 = 0, $9_1 = 0, $14_1 = 0, $6_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  $6_1 = HEAPU8[($4_1 + 8 | 0) >> 0] | 0;
  $7_1 = $25($5_1 | 0) | 0;
  $9_1 = 127;
  HEAP8[($7_1 + 11 | 0) >> 0] = (HEAPU8[($7_1 + 11 | 0) >> 0] | 0) & 128 | 0 | ($6_1 & $9_1 | 0) | 0;
  $14_1 = $25($5_1 | 0) | 0;
  HEAP8[($14_1 + 11 | 0) >> 0] = (HEAPU8[($14_1 + 11 | 0) >> 0] | 0) & $9_1 | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $56($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $57($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   if (!(($58($4_1 + 12 | 0 | 0, $4_1 + 8 | 0 | 0) | 0) & 1 | 0)) {
    break label$1
   }
   label$2 : {
    label$3 : while (1) {
     if (!(($60($4_1 + 12 | 0 | 0, $59($4_1 + 8 | 0 | 0) | 0 | 0) | 0) & 1 | 0)) {
      break label$2
     }
     $61($4_1 + 12 | 0 | 0, $4_1 + 8 | 0 | 0);
     $62($4_1 + 12 | 0 | 0) | 0;
     continue label$3;
    };
   }
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $58($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $11_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $11_1 = (($63(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0) ^ -1 | 0) & 1 | 0;
  global$0 = $4_1 + 16 | 0;
  return $11_1 | 0;
 }
 
 function $59($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) + -1 | 0;
  return $4_1 | 0;
 }
 
 function $60($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $11_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $11_1 = ($64(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0) >>> 0 < ($64(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0) >>> 0 & 1 | 0;
  global$0 = $4_1 + 16 | 0;
  return $11_1 | 0;
 }
 
 function $61($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[$4_1 >> 2] = HEAP32[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 2] | 0;
  $65(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0, HEAP32[$4_1 >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $62($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) + 1 | 0;
  return $4_1 | 0;
 }
 
 function $63($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $11_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $11_1 = ($64(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) == ($64(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0) & 1 | 0;
  global$0 = $4_1 + 16 | 0;
  return $11_1 | 0;
 }
 
 function $64($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0;
 }
 
 function $65($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $67($66($4_1 + 12 | 0 | 0) | 0 | 0, $66($4_1 + 8 | 0 | 0) | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $66($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0;
 }
 
 function $67($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP8[($4_1 + 7 | 0) >> 0] = HEAPU8[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 0] | 0;
  HEAP8[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 0] = HEAPU8[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 0] | 0;
  HEAP8[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 0] = HEAPU8[($4_1 + 7 | 0) >> 0] | 0;
  return;
 }
 
 function $68($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  HEAP32[$5_1 >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  return $5_1 | 0;
 }
 
 function $69($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $4_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!(($32($4_1 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    $9_1 = $34($4_1 | 0) | 0;
    break label$1;
   }
   $9_1 = $70($4_1 | 0) | 0;
  }
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $70($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $71($33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $71($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $72($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $9_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $9_1 = $90(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $5_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $73($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $78(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $74($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $10_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $10_1 = ((HEAP32[(($33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0) + 8 | 0) >> 2] | 0) & 2147483647 | 0) << 0 | 0;
  global$0 = $3_1 + 16 | 0;
  return $10_1 | 0;
 }
 
 function $75($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $77(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $76($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $79(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $77($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $80(HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, (HEAP32[($5_1 + 4 | 0) >> 2] | 0) << 0 | 0 | 0, 1 | 0);
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $78($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $86(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $79($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  $73(HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) | 0;
  $73($5_1 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $80($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  label$1 : {
   label$2 : {
    if (!(($81(HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[$5_1 >> 2] = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
    $82(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[$5_1 >> 2] | 0 | 0);
    break label$1;
   }
   $83(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0);
  }
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $81($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return (HEAP32[($3_1 + 12 | 0) >> 2] | 0) >>> 0 > 8 >>> 0 & 1 | 0 | 0;
 }
 
 function $82($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $84(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $83($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $85(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $84($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $146(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $85($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $143(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $86($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $87($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $95(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $88($0_1) {
  $0_1 = $0_1 | 0;
  var $2_1 = 0, $1_1 = 0, $3_1 = 0;
  label$1 : while (1) {
   $1_1 = $0_1;
   $0_1 = $0_1 + 1 | 0;
   $2_1 = HEAP8[$1_1 >> 0] | 0;
   if ($89($2_1 | 0) | 0) {
    continue label$1
   }
   break label$1;
  };
  $3_1 = 1;
  label$2 : {
   switch (($2_1 & 255 | 0) + -43 | 0 | 0) {
   case 2:
    $3_1 = 0;
   case 0:
    $2_1 = HEAP8[$0_1 >> 0] | 0;
    $1_1 = $0_1;
    break;
   default:
    break label$2;
   };
  }
  $0_1 = 0;
  label$5 : {
   $2_1 = $2_1 + -48 | 0;
   if ($2_1 >>> 0 > 9 >>> 0) {
    break label$5
   }
   $0_1 = 0;
   label$6 : while (1) {
    $0_1 = Math_imul($0_1, 10) - $2_1 | 0;
    $2_1 = HEAP8[($1_1 + 1 | 0) >> 0] | 0;
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 + -48 | 0;
    if ($2_1 >>> 0 < 10 >>> 0) {
     continue label$6
    }
    break label$6;
   };
  }
  return ($3_1 ? 0 - $0_1 | 0 : $0_1) | 0;
 }
 
 function $89($0_1) {
  $0_1 = $0_1 | 0;
  return ($0_1 | 0) == (32 | 0) | ($0_1 + -9 | 0) >>> 0 < 5 >>> 0 | 0 | 0;
 }
 
 function $90($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     if ($2_1 >>> 0 < 4 >>> 0) {
      break label$3
     }
     if (($1_1 | $0_1 | 0) & 3 | 0) {
      break label$2
     }
     label$4 : while (1) {
      if ((HEAP32[$0_1 >> 2] | 0 | 0) != (HEAP32[$1_1 >> 2] | 0 | 0)) {
       break label$2
      }
      $1_1 = $1_1 + 4 | 0;
      $0_1 = $0_1 + 4 | 0;
      $2_1 = $2_1 + -4 | 0;
      if ($2_1 >>> 0 > 3 >>> 0) {
       continue label$4
      }
      break label$4;
     };
    }
    if (!$2_1) {
     break label$1
    }
   }
   label$5 : {
    label$6 : while (1) {
     $3_1 = HEAPU8[$0_1 >> 0] | 0;
     $4_1 = HEAPU8[$1_1 >> 0] | 0;
     if (($3_1 | 0) != ($4_1 | 0)) {
      break label$5
     }
     $1_1 = $1_1 + 1 | 0;
     $0_1 = $0_1 + 1 | 0;
     $2_1 = $2_1 + -1 | 0;
     if (!$2_1) {
      break label$1
     }
     continue label$6;
    };
   }
   return $3_1 - $4_1 | 0 | 0;
  }
  return 0 | 0;
 }
 
 function $91($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 12 | 0) >> 2] = $1_1;
  $1_1 = $119(66528 | 0, $0_1 | 0, $1_1 | 0) | 0;
  global$0 = $2_1 + 16 | 0;
  return $1_1 | 0;
 }
 
 function $92($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0, $8_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  $4_1 = HEAP32[($0_1 + 28 | 0) >> 2] | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = $4_1;
  $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
  HEAP32[($3_1 + 28 | 0) >> 2] = $2_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $1_1;
  $1_1 = $5_1 - $4_1 | 0;
  HEAP32[($3_1 + 20 | 0) >> 2] = $1_1;
  $6_1 = $1_1 + $2_1 | 0;
  $4_1 = $3_1 + 16 | 0;
  $7_1 = 2;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       if (!($123(fimport$1(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $3_1 + 16 | 0 | 0, 2 | 0, $3_1 + 12 | 0 | 0) | 0 | 0) | 0)) {
        break label$5
       }
       $5_1 = $4_1;
       break label$4;
      }
      label$6 : while (1) {
       $1_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
       if (($6_1 | 0) == ($1_1 | 0)) {
        break label$3
       }
       label$7 : {
        if (($1_1 | 0) > (-1 | 0)) {
         break label$7
        }
        $5_1 = $4_1;
        break label$2;
       }
       $8_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
       $9_1 = $1_1 >>> 0 > $8_1 >>> 0;
       $5_1 = $4_1 + ($9_1 << 3 | 0) | 0;
       $8_1 = $1_1 - ($9_1 ? $8_1 : 0) | 0;
       HEAP32[$5_1 >> 2] = (HEAP32[$5_1 >> 2] | 0) + $8_1 | 0;
       $4_1 = $4_1 + ($9_1 ? 12 : 4) | 0;
       HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) - $8_1 | 0;
       $6_1 = $6_1 - $1_1 | 0;
       $4_1 = $5_1;
       $7_1 = $7_1 - $9_1 | 0;
       if (!($123(fimport$1(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $4_1 | 0, $7_1 | 0, $3_1 + 12 | 0 | 0) | 0 | 0) | 0)) {
        continue label$6
       }
       break label$6;
      };
     }
     if (($6_1 | 0) != (-1 | 0)) {
      break label$2
     }
    }
    $1_1 = HEAP32[($0_1 + 44 | 0) >> 2] | 0;
    HEAP32[($0_1 + 28 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 20 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 16 | 0) >> 2] = $1_1 + (HEAP32[($0_1 + 48 | 0) >> 2] | 0) | 0;
    $1_1 = $2_1;
    break label$1;
   }
   $1_1 = 0;
   HEAP32[($0_1 + 28 | 0) >> 2] = 0;
   HEAP32[($0_1 + 16 | 0) >> 2] = 0;
   HEAP32[($0_1 + 20 | 0) >> 2] = 0;
   HEAP32[$0_1 >> 2] = HEAP32[$0_1 >> 2] | 0 | 32 | 0;
   if (($7_1 | 0) == (2 | 0)) {
    break label$1
   }
   $1_1 = $2_1 - (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0;
  }
  global$0 = $3_1 + 32 | 0;
  return $1_1 | 0;
 }
 
 function $93($0_1) {
  $0_1 = $0_1 | 0;
  return 0 | 0;
 }
 
 function $94($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  i64toi32_i32$HIGH_BITS = 0;
  return 0 | 0;
 }
 
 function $95($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0, $3_1 = 0;
  $1_1 = $0_1;
  label$1 : {
   label$2 : {
    if (!($1_1 & 3 | 0)) {
     break label$2
    }
    label$3 : {
     if (HEAPU8[$1_1 >> 0] | 0) {
      break label$3
     }
     return $1_1 - $1_1 | 0 | 0;
    }
    $1_1 = $0_1;
    label$4 : while (1) {
     $1_1 = $1_1 + 1 | 0;
     if (!($1_1 & 3 | 0)) {
      break label$2
     }
     if (HEAPU8[$1_1 >> 0] | 0) {
      continue label$4
     }
     break label$1;
    };
   }
   label$5 : while (1) {
    $2_1 = $1_1;
    $1_1 = $1_1 + 4 | 0;
    $3_1 = HEAP32[$2_1 >> 2] | 0;
    if (!((($3_1 ^ -1 | 0) & ($3_1 + -16843009 | 0) | 0) & -2139062144 | 0)) {
     continue label$5
    }
    break label$5;
   };
   label$6 : while (1) {
    $1_1 = $2_1;
    $2_1 = $1_1 + 1 | 0;
    if (HEAPU8[$1_1 >> 0] | 0) {
     continue label$6
    }
    break label$6;
   };
  }
  return $1_1 - $0_1 | 0 | 0;
 }
 
 function $96($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, i64toi32_i32$0 = 0, $4_1 = 0, i64toi32_i32$1 = 0, $6_1 = 0, $5_1 = 0, $6$hi = 0;
  label$1 : {
   if (!$2_1) {
    break label$1
   }
   HEAP8[$0_1 >> 0] = $1_1;
   $3_1 = $0_1 + $2_1 | 0;
   HEAP8[($3_1 + -1 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 3 >>> 0) {
    break label$1
   }
   HEAP8[($0_1 + 2 | 0) >> 0] = $1_1;
   HEAP8[($0_1 + 1 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -3 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -2 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 7 >>> 0) {
    break label$1
   }
   HEAP8[($0_1 + 3 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -4 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 9 >>> 0) {
    break label$1
   }
   $4_1 = (0 - $0_1 | 0) & 3 | 0;
   $3_1 = $0_1 + $4_1 | 0;
   $1_1 = Math_imul($1_1 & 255 | 0, 16843009);
   HEAP32[$3_1 >> 2] = $1_1;
   $4_1 = ($2_1 - $4_1 | 0) & -4 | 0;
   $2_1 = $3_1 + $4_1 | 0;
   HEAP32[($2_1 + -4 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 9 >>> 0) {
    break label$1
   }
   HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 4 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -8 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -12 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 25 >>> 0) {
    break label$1
   }
   HEAP32[($3_1 + 24 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 20 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 16 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 12 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -16 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -20 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -24 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -28 | 0) >> 2] = $1_1;
   $5_1 = $3_1 & 4 | 0 | 24 | 0;
   $2_1 = $4_1 - $5_1 | 0;
   if ($2_1 >>> 0 < 32 >>> 0) {
    break label$1
   }
   i64toi32_i32$0 = 0;
   i64toi32_i32$1 = 1;
   i64toi32_i32$1 = __wasm_i64_mul($1_1 | 0, i64toi32_i32$0 | 0, 1 | 0, i64toi32_i32$1 | 0) | 0;
   i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
   $6_1 = i64toi32_i32$1;
   $6$hi = i64toi32_i32$0;
   $1_1 = $3_1 + $5_1 | 0;
   label$2 : while (1) {
    i64toi32_i32$0 = $6$hi;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 24 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 28 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 16 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 20 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = i64toi32_i32$0;
    i64toi32_i32$1 = $1_1;
    HEAP32[$1_1 >> 2] = $6_1;
    HEAP32[($1_1 + 4 | 0) >> 2] = i64toi32_i32$0;
    $1_1 = $1_1 + 32 | 0;
    $2_1 = $2_1 + -32 | 0;
    if ($2_1 >>> 0 > 31 >>> 0) {
     continue label$2
    }
    break label$2;
   };
  }
  return $0_1 | 0;
 }
 
 function $97($0_1) {
  $0_1 = $0_1 | 0;
  return 1 | 0;
 }
 
 function $98($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $99($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $100($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $101() {
  $99(67928 | 0);
  return 67932 | 0;
 }
 
 function $102() {
  $100(67928 | 0);
 }
 
 function $103($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = HEAP32[($0_1 + 72 | 0) >> 2] | 0;
  HEAP32[($0_1 + 72 | 0) >> 2] = $1_1 + -1 | 0 | $1_1 | 0;
  label$1 : {
   $1_1 = HEAP32[$0_1 >> 2] | 0;
   if (!($1_1 & 8 | 0)) {
    break label$1
   }
   HEAP32[$0_1 >> 2] = $1_1 | 32 | 0;
   return -1 | 0;
  }
  HEAP32[($0_1 + 4 | 0) >> 2] = 0;
  HEAP32[($0_1 + 8 | 0) >> 2] = 0;
  $1_1 = HEAP32[($0_1 + 44 | 0) >> 2] | 0;
  HEAP32[($0_1 + 28 | 0) >> 2] = $1_1;
  HEAP32[($0_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($0_1 + 16 | 0) >> 2] = $1_1 + (HEAP32[($0_1 + 48 | 0) >> 2] | 0) | 0;
  return 0 | 0;
 }
 
 function $104($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = ($2_1 | 0) != (0 | 0);
  label$1 : {
   label$2 : {
    label$3 : {
     if (!($0_1 & 3 | 0)) {
      break label$3
     }
     if (!$2_1) {
      break label$3
     }
     $4_1 = $1_1 & 255 | 0;
     label$4 : while (1) {
      if ((HEAPU8[$0_1 >> 0] | 0 | 0) == ($4_1 | 0)) {
       break label$2
      }
      $2_1 = $2_1 + -1 | 0;
      $3_1 = ($2_1 | 0) != (0 | 0);
      $0_1 = $0_1 + 1 | 0;
      if (!($0_1 & 3 | 0)) {
       break label$3
      }
      if ($2_1) {
       continue label$4
      }
      break label$4;
     };
    }
    if (!$3_1) {
     break label$1
    }
    label$5 : {
     if ((HEAPU8[$0_1 >> 0] | 0 | 0) == ($1_1 & 255 | 0 | 0)) {
      break label$5
     }
     if ($2_1 >>> 0 < 4 >>> 0) {
      break label$5
     }
     $4_1 = Math_imul($1_1 & 255 | 0, 16843009);
     label$6 : while (1) {
      $3_1 = (HEAP32[$0_1 >> 2] | 0) ^ $4_1 | 0;
      if ((($3_1 ^ -1 | 0) & ($3_1 + -16843009 | 0) | 0) & -2139062144 | 0) {
       break label$2
      }
      $0_1 = $0_1 + 4 | 0;
      $2_1 = $2_1 + -4 | 0;
      if ($2_1 >>> 0 > 3 >>> 0) {
       continue label$6
      }
      break label$6;
     };
    }
    if (!$2_1) {
     break label$1
    }
   }
   $3_1 = $1_1 & 255 | 0;
   label$7 : while (1) {
    label$8 : {
     if ((HEAPU8[$0_1 >> 0] | 0 | 0) != ($3_1 | 0)) {
      break label$8
     }
     return $0_1 | 0;
    }
    $0_1 = $0_1 + 1 | 0;
    $2_1 = $2_1 + -1 | 0;
    if ($2_1) {
     continue label$7
    }
    break label$7;
   };
  }
  return 0 | 0;
 }
 
 function $105($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = $104($0_1 | 0, 0 | 0, $1_1 | 0) | 0;
  return ($2_1 ? $2_1 - $0_1 | 0 : $1_1) | 0;
 }
 
 function $106() {
  return 67936 | 0;
 }
 
 function $107($0_1, $1_1) {
  $0_1 = +$0_1;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, $2_1 = 0, $10_1 = 0, $2$hi = 0;
  label$1 : {
   wasm2js_scratch_store_f64(+$0_1);
   i64toi32_i32$0 = wasm2js_scratch_load_i32(1 | 0) | 0;
   $2_1 = wasm2js_scratch_load_i32(0 | 0) | 0;
   $2$hi = i64toi32_i32$0;
   i64toi32_i32$2 = $2_1;
   i64toi32_i32$1 = 0;
   i64toi32_i32$3 = 52;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$1 = 0;
    $10_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
    $10_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
   }
   $3_1 = $10_1 & 2047 | 0;
   if (($3_1 | 0) == (2047 | 0)) {
    break label$1
   }
   label$2 : {
    if ($3_1) {
     break label$2
    }
    label$3 : {
     label$4 : {
      if ($0_1 != 0.0) {
       break label$4
      }
      $3_1 = 0;
      break label$3;
     }
     $0_1 = +$107(+($0_1 * 18446744073709551615.0), $1_1 | 0);
     $3_1 = (HEAP32[$1_1 >> 2] | 0) + -64 | 0;
    }
    HEAP32[$1_1 >> 2] = $3_1;
    return +$0_1;
   }
   HEAP32[$1_1 >> 2] = $3_1 + -1022 | 0;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$0 = $2_1;
   i64toi32_i32$2 = -2146435073;
   i64toi32_i32$3 = -1;
   i64toi32_i32$2 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
   i64toi32_i32$1 = i64toi32_i32$0 & i64toi32_i32$3 | 0;
   i64toi32_i32$0 = 1071644672;
   i64toi32_i32$3 = 0;
   i64toi32_i32$0 = i64toi32_i32$2 | i64toi32_i32$0 | 0;
   wasm2js_scratch_store_i32(0 | 0, i64toi32_i32$1 | i64toi32_i32$3 | 0 | 0);
   wasm2js_scratch_store_i32(1 | 0, i64toi32_i32$0 | 0);
   $0_1 = +wasm2js_scratch_load_f64();
  }
  return +$0_1;
 }
 
 function $108($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0;
  label$1 : {
   if ($2_1 >>> 0 < 512 >>> 0) {
    break label$1
   }
   fimport$2($0_1 | 0, $1_1 | 0, $2_1 | 0);
   return $0_1 | 0;
  }
  $3_1 = $0_1 + $2_1 | 0;
  label$2 : {
   label$3 : {
    if (($1_1 ^ $0_1 | 0) & 3 | 0) {
     break label$3
    }
    label$4 : {
     label$5 : {
      if ($0_1 & 3 | 0) {
       break label$5
      }
      $2_1 = $0_1;
      break label$4;
     }
     label$6 : {
      if ($2_1) {
       break label$6
      }
      $2_1 = $0_1;
      break label$4;
     }
     $2_1 = $0_1;
     label$7 : while (1) {
      HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
      $1_1 = $1_1 + 1 | 0;
      $2_1 = $2_1 + 1 | 0;
      if (!($2_1 & 3 | 0)) {
       break label$4
      }
      if ($2_1 >>> 0 < $3_1 >>> 0) {
       continue label$7
      }
      break label$7;
     };
    }
    label$8 : {
     $4_1 = $3_1 & -4 | 0;
     if ($4_1 >>> 0 < 64 >>> 0) {
      break label$8
     }
     $5_1 = $4_1 + -64 | 0;
     if ($2_1 >>> 0 > $5_1 >>> 0) {
      break label$8
     }
     label$9 : while (1) {
      HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
      HEAP32[($2_1 + 4 | 0) >> 2] = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
      HEAP32[($2_1 + 8 | 0) >> 2] = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
      HEAP32[($2_1 + 12 | 0) >> 2] = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
      HEAP32[($2_1 + 16 | 0) >> 2] = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
      HEAP32[($2_1 + 20 | 0) >> 2] = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
      HEAP32[($2_1 + 24 | 0) >> 2] = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
      HEAP32[($2_1 + 28 | 0) >> 2] = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
      HEAP32[($2_1 + 32 | 0) >> 2] = HEAP32[($1_1 + 32 | 0) >> 2] | 0;
      HEAP32[($2_1 + 36 | 0) >> 2] = HEAP32[($1_1 + 36 | 0) >> 2] | 0;
      HEAP32[($2_1 + 40 | 0) >> 2] = HEAP32[($1_1 + 40 | 0) >> 2] | 0;
      HEAP32[($2_1 + 44 | 0) >> 2] = HEAP32[($1_1 + 44 | 0) >> 2] | 0;
      HEAP32[($2_1 + 48 | 0) >> 2] = HEAP32[($1_1 + 48 | 0) >> 2] | 0;
      HEAP32[($2_1 + 52 | 0) >> 2] = HEAP32[($1_1 + 52 | 0) >> 2] | 0;
      HEAP32[($2_1 + 56 | 0) >> 2] = HEAP32[($1_1 + 56 | 0) >> 2] | 0;
      HEAP32[($2_1 + 60 | 0) >> 2] = HEAP32[($1_1 + 60 | 0) >> 2] | 0;
      $1_1 = $1_1 + 64 | 0;
      $2_1 = $2_1 + 64 | 0;
      if ($2_1 >>> 0 <= $5_1 >>> 0) {
       continue label$9
      }
      break label$9;
     };
    }
    if ($2_1 >>> 0 >= $4_1 >>> 0) {
     break label$2
    }
    label$10 : while (1) {
     HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
     $1_1 = $1_1 + 4 | 0;
     $2_1 = $2_1 + 4 | 0;
     if ($2_1 >>> 0 < $4_1 >>> 0) {
      continue label$10
     }
     break label$2;
    };
   }
   label$11 : {
    if ($3_1 >>> 0 >= 4 >>> 0) {
     break label$11
    }
    $2_1 = $0_1;
    break label$2;
   }
   label$12 : {
    $4_1 = $3_1 + -4 | 0;
    if ($4_1 >>> 0 >= $0_1 >>> 0) {
     break label$12
    }
    $2_1 = $0_1;
    break label$2;
   }
   $2_1 = $0_1;
   label$13 : while (1) {
    HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    HEAP8[($2_1 + 1 | 0) >> 0] = HEAPU8[($1_1 + 1 | 0) >> 0] | 0;
    HEAP8[($2_1 + 2 | 0) >> 0] = HEAPU8[($1_1 + 2 | 0) >> 0] | 0;
    HEAP8[($2_1 + 3 | 0) >> 0] = HEAPU8[($1_1 + 3 | 0) >> 0] | 0;
    $1_1 = $1_1 + 4 | 0;
    $2_1 = $2_1 + 4 | 0;
    if ($2_1 >>> 0 <= $4_1 >>> 0) {
     continue label$13
    }
    break label$13;
   };
  }
  label$14 : {
   if ($2_1 >>> 0 >= $3_1 >>> 0) {
    break label$14
   }
   label$15 : while (1) {
    HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 + 1 | 0;
    if (($2_1 | 0) != ($3_1 | 0)) {
     continue label$15
    }
    break label$15;
   };
  }
  return $0_1 | 0;
 }
 
 function $109($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, $5_1 = 0;
  label$1 : {
   label$2 : {
    $3_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
    if ($3_1) {
     break label$2
    }
    $4_1 = 0;
    if ($103($2_1 | 0) | 0) {
     break label$1
    }
    $3_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
   }
   label$3 : {
    $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
    if (($3_1 - $4_1 | 0) >>> 0 >= $1_1 >>> 0) {
     break label$3
    }
    return FUNCTION_TABLE[HEAP32[($2_1 + 36 | 0) >> 2] | 0 | 0]($2_1, $0_1, $1_1) | 0 | 0;
   }
   label$4 : {
    label$5 : {
     if ((HEAP32[($2_1 + 80 | 0) >> 2] | 0 | 0) < (0 | 0)) {
      break label$5
     }
     if (!$1_1) {
      break label$5
     }
     $3_1 = $1_1;
     label$6 : {
      label$7 : while (1) {
       $5_1 = $0_1 + $3_1 | 0;
       if ((HEAPU8[($5_1 + -1 | 0) >> 0] | 0 | 0) == (10 | 0)) {
        break label$6
       }
       $3_1 = $3_1 + -1 | 0;
       if (!$3_1) {
        break label$5
       }
       continue label$7;
      };
     }
     $4_1 = FUNCTION_TABLE[HEAP32[($2_1 + 36 | 0) >> 2] | 0 | 0]($2_1, $0_1, $3_1) | 0;
     if ($4_1 >>> 0 < $3_1 >>> 0) {
      break label$1
     }
     $1_1 = $1_1 - $3_1 | 0;
     $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
     break label$4;
    }
    $5_1 = $0_1;
    $3_1 = 0;
   }
   $108($4_1 | 0, $5_1 | 0, $1_1 | 0) | 0;
   HEAP32[($2_1 + 20 | 0) >> 2] = (HEAP32[($2_1 + 20 | 0) >> 2] | 0) + $1_1 | 0;
   $4_1 = $3_1 + $1_1 | 0;
  }
  return $4_1 | 0;
 }
 
 function $110($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var $5_1 = 0, i64toi32_i32$0 = 0, $8_1 = 0, $6_1 = 0, $7_1 = 0;
  $5_1 = global$0 - 208 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 204 | 0) >> 2] = $2_1;
  $96($5_1 + 160 | 0 | 0, 0 | 0, 40 | 0) | 0;
  HEAP32[($5_1 + 200 | 0) >> 2] = HEAP32[($5_1 + 204 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (($111(0 | 0, $1_1 | 0, $5_1 + 200 | 0 | 0, $5_1 + 80 | 0 | 0, $5_1 + 160 | 0 | 0, $3_1 | 0, $4_1 | 0) | 0 | 0) >= (0 | 0)) {
     break label$2
    }
    $4_1 = -1;
    break label$1;
   }
   label$3 : {
    label$4 : {
     if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) >= (0 | 0)) {
      break label$4
     }
     $6_1 = 1;
     break label$3;
    }
    $6_1 = !($97($0_1 | 0) | 0);
   }
   $7_1 = HEAP32[$0_1 >> 2] | 0;
   HEAP32[$0_1 >> 2] = $7_1 & -33 | 0;
   label$5 : {
    label$6 : {
     label$7 : {
      label$8 : {
       if (HEAP32[($0_1 + 48 | 0) >> 2] | 0) {
        break label$8
       }
       HEAP32[($0_1 + 48 | 0) >> 2] = 80;
       HEAP32[($0_1 + 28 | 0) >> 2] = 0;
       i64toi32_i32$0 = 0;
       HEAP32[($0_1 + 16 | 0) >> 2] = 0;
       HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$0;
       $8_1 = HEAP32[($0_1 + 44 | 0) >> 2] | 0;
       HEAP32[($0_1 + 44 | 0) >> 2] = $5_1;
       break label$7;
      }
      $8_1 = 0;
      if (HEAP32[($0_1 + 16 | 0) >> 2] | 0) {
       break label$6
      }
     }
     $2_1 = -1;
     if ($103($0_1 | 0) | 0) {
      break label$5
     }
    }
    $2_1 = $111($0_1 | 0, $1_1 | 0, $5_1 + 200 | 0 | 0, $5_1 + 80 | 0 | 0, $5_1 + 160 | 0 | 0, $3_1 | 0, $4_1 | 0) | 0;
   }
   $4_1 = $7_1 & 32 | 0;
   label$9 : {
    if (!$8_1) {
     break label$9
    }
    FUNCTION_TABLE[HEAP32[($0_1 + 36 | 0) >> 2] | 0 | 0]($0_1, 0, 0) | 0;
    HEAP32[($0_1 + 48 | 0) >> 2] = 0;
    HEAP32[($0_1 + 44 | 0) >> 2] = $8_1;
    HEAP32[($0_1 + 28 | 0) >> 2] = 0;
    $3_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
    i64toi32_i32$0 = 0;
    HEAP32[($0_1 + 16 | 0) >> 2] = 0;
    HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$0;
    $2_1 = $3_1 ? $2_1 : -1;
   }
   $3_1 = HEAP32[$0_1 >> 2] | 0;
   HEAP32[$0_1 >> 2] = $3_1 | $4_1 | 0;
   $4_1 = $3_1 & 32 | 0 ? -1 : $2_1;
   if ($6_1) {
    break label$1
   }
   $98($0_1 | 0);
  }
  global$0 = $5_1 + 208 | 0;
  return $4_1 | 0;
 }
 
 function $111($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  $6_1 = $6_1 | 0;
  var $12_1 = 0, $7_1 = 0, $15_1 = 0, $20_1 = 0, i64toi32_i32$1 = 0, $17_1 = 0, $14_1 = 0, $13_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, $11_1 = 0, $16_1 = 0, $19_1 = 0, $22_1 = 0, i64toi32_i32$3 = 0, i64toi32_i32$5 = 0, $9_1 = 0, $18_1 = 0, $24_1 = 0, $10_1 = 0, $25_1 = 0, $25$hi = 0, $21_1 = 0, $23_1 = 0, $33_1 = 0, $34_1 = 0, $35_1 = 0, $8_1 = 0, $266_1 = 0;
  $7_1 = global$0 - 80 | 0;
  global$0 = $7_1;
  HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
  $8_1 = $7_1 + 55 | 0;
  $9_1 = $7_1 + 56 | 0;
  $10_1 = 0;
  $11_1 = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : while (1) {
       $12_1 = 0;
       label$6 : while (1) {
        $13_1 = $1_1;
        if (($12_1 | 0) > ($11_1 ^ 2147483647 | 0 | 0)) {
         break label$4
        }
        $11_1 = $12_1 + $11_1 | 0;
        $12_1 = $1_1;
        label$7 : {
         label$8 : {
          label$9 : {
           label$10 : {
            label$11 : {
             $14_1 = HEAPU8[$12_1 >> 0] | 0;
             if (!$14_1) {
              break label$11
             }
             label$12 : while (1) {
              label$13 : {
               label$14 : {
                label$15 : {
                 $14_1 = $14_1 & 255 | 0;
                 if ($14_1) {
                  break label$15
                 }
                 $1_1 = $12_1;
                 break label$14;
                }
                if (($14_1 | 0) != (37 | 0)) {
                 break label$13
                }
                $14_1 = $12_1;
                label$16 : while (1) {
                 label$17 : {
                  if ((HEAPU8[($14_1 + 1 | 0) >> 0] | 0 | 0) == (37 | 0)) {
                   break label$17
                  }
                  $1_1 = $14_1;
                  break label$14;
                 }
                 $12_1 = $12_1 + 1 | 0;
                 $15_1 = HEAPU8[($14_1 + 2 | 0) >> 0] | 0;
                 $1_1 = $14_1 + 2 | 0;
                 $14_1 = $1_1;
                 if (($15_1 | 0) == (37 | 0)) {
                  continue label$16
                 }
                 break label$16;
                };
               }
               $12_1 = $12_1 - $13_1 | 0;
               $14_1 = $11_1 ^ 2147483647 | 0;
               if (($12_1 | 0) > ($14_1 | 0)) {
                break label$4
               }
               label$18 : {
                if (!$0_1) {
                 break label$18
                }
                $112($0_1 | 0, $13_1 | 0, $12_1 | 0);
               }
               if ($12_1) {
                continue label$6
               }
               HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
               $12_1 = $1_1 + 1 | 0;
               $16_1 = -1;
               label$19 : {
                $15_1 = (HEAP8[($1_1 + 1 | 0) >> 0] | 0) + -48 | 0;
                if ($15_1 >>> 0 > 9 >>> 0) {
                 break label$19
                }
                if ((HEAPU8[($1_1 + 2 | 0) >> 0] | 0 | 0) != (36 | 0)) {
                 break label$19
                }
                $12_1 = $1_1 + 3 | 0;
                $10_1 = 1;
                $16_1 = $15_1;
               }
               HEAP32[($7_1 + 76 | 0) >> 2] = $12_1;
               $17_1 = 0;
               label$20 : {
                label$21 : {
                 $18_1 = HEAP8[$12_1 >> 0] | 0;
                 $1_1 = $18_1 + -32 | 0;
                 if ($1_1 >>> 0 <= 31 >>> 0) {
                  break label$21
                 }
                 $15_1 = $12_1;
                 break label$20;
                }
                $17_1 = 0;
                $15_1 = $12_1;
                $1_1 = 1 << $1_1 | 0;
                if (!($1_1 & 75913 | 0)) {
                 break label$20
                }
                label$22 : while (1) {
                 $15_1 = $12_1 + 1 | 0;
                 HEAP32[($7_1 + 76 | 0) >> 2] = $15_1;
                 $17_1 = $1_1 | $17_1 | 0;
                 $18_1 = HEAP8[($12_1 + 1 | 0) >> 0] | 0;
                 $1_1 = $18_1 + -32 | 0;
                 if ($1_1 >>> 0 >= 32 >>> 0) {
                  break label$20
                 }
                 $12_1 = $15_1;
                 $1_1 = 1 << $1_1 | 0;
                 if ($1_1 & 75913 | 0) {
                  continue label$22
                 }
                 break label$22;
                };
               }
               label$23 : {
                label$24 : {
                 if (($18_1 | 0) != (42 | 0)) {
                  break label$24
                 }
                 label$25 : {
                  label$26 : {
                   $12_1 = (HEAP8[($15_1 + 1 | 0) >> 0] | 0) + -48 | 0;
                   if ($12_1 >>> 0 > 9 >>> 0) {
                    break label$26
                   }
                   if ((HEAPU8[($15_1 + 2 | 0) >> 0] | 0 | 0) != (36 | 0)) {
                    break label$26
                   }
                   label$27 : {
                    label$28 : {
                     if ($0_1) {
                      break label$28
                     }
                     HEAP32[($4_1 + ($12_1 << 2 | 0) | 0) >> 2] = 10;
                     $19_1 = 0;
                     break label$27;
                    }
                    $19_1 = HEAP32[($3_1 + ($12_1 << 3 | 0) | 0) >> 2] | 0;
                   }
                   $1_1 = $15_1 + 3 | 0;
                   $10_1 = 1;
                   break label$25;
                  }
                  if ($10_1) {
                   break label$10
                  }
                  $1_1 = $15_1 + 1 | 0;
                  label$29 : {
                   if ($0_1) {
                    break label$29
                   }
                   HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
                   $10_1 = 0;
                   $19_1 = 0;
                   break label$23;
                  }
                  $12_1 = HEAP32[$2_1 >> 2] | 0;
                  HEAP32[$2_1 >> 2] = $12_1 + 4 | 0;
                  $19_1 = HEAP32[$12_1 >> 2] | 0;
                  $10_1 = 0;
                 }
                 HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
                 if (($19_1 | 0) > (-1 | 0)) {
                  break label$23
                 }
                 $19_1 = 0 - $19_1 | 0;
                 $17_1 = $17_1 | 8192 | 0;
                 break label$23;
                }
                $19_1 = $113($7_1 + 76 | 0 | 0) | 0;
                if (($19_1 | 0) < (0 | 0)) {
                 break label$4
                }
                $1_1 = HEAP32[($7_1 + 76 | 0) >> 2] | 0;
               }
               $12_1 = 0;
               $20_1 = -1;
               label$30 : {
                label$31 : {
                 if ((HEAPU8[$1_1 >> 0] | 0 | 0) == (46 | 0)) {
                  break label$31
                 }
                 $21_1 = 0;
                 break label$30;
                }
                label$32 : {
                 if ((HEAPU8[($1_1 + 1 | 0) >> 0] | 0 | 0) != (42 | 0)) {
                  break label$32
                 }
                 label$33 : {
                  label$34 : {
                   $15_1 = (HEAP8[($1_1 + 2 | 0) >> 0] | 0) + -48 | 0;
                   if ($15_1 >>> 0 > 9 >>> 0) {
                    break label$34
                   }
                   if ((HEAPU8[($1_1 + 3 | 0) >> 0] | 0 | 0) != (36 | 0)) {
                    break label$34
                   }
                   label$35 : {
                    label$36 : {
                     if ($0_1) {
                      break label$36
                     }
                     HEAP32[($4_1 + ($15_1 << 2 | 0) | 0) >> 2] = 10;
                     $20_1 = 0;
                     break label$35;
                    }
                    $20_1 = HEAP32[($3_1 + ($15_1 << 3 | 0) | 0) >> 2] | 0;
                   }
                   $1_1 = $1_1 + 4 | 0;
                   break label$33;
                  }
                  if ($10_1) {
                   break label$10
                  }
                  $1_1 = $1_1 + 2 | 0;
                  label$37 : {
                   if ($0_1) {
                    break label$37
                   }
                   $20_1 = 0;
                   break label$33;
                  }
                  $15_1 = HEAP32[$2_1 >> 2] | 0;
                  HEAP32[$2_1 >> 2] = $15_1 + 4 | 0;
                  $20_1 = HEAP32[$15_1 >> 2] | 0;
                 }
                 HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
                 $21_1 = ($20_1 | 0) > (-1 | 0);
                 break label$30;
                }
                HEAP32[($7_1 + 76 | 0) >> 2] = $1_1 + 1 | 0;
                $21_1 = 1;
                $20_1 = $113($7_1 + 76 | 0 | 0) | 0;
                $1_1 = HEAP32[($7_1 + 76 | 0) >> 2] | 0;
               }
               label$38 : while (1) {
                $15_1 = $12_1;
                $22_1 = 28;
                $18_1 = $1_1;
                $12_1 = HEAP8[$1_1 >> 0] | 0;
                if (($12_1 + -123 | 0) >>> 0 < -58 >>> 0) {
                 break label$3
                }
                $1_1 = $1_1 + 1 | 0;
                $12_1 = HEAPU8[(($12_1 + Math_imul($15_1, 58) | 0) + 65615 | 0) >> 0] | 0;
                if (($12_1 + -1 | 0) >>> 0 < 8 >>> 0) {
                 continue label$38
                }
                break label$38;
               };
               HEAP32[($7_1 + 76 | 0) >> 2] = $1_1;
               label$39 : {
                label$40 : {
                 if (($12_1 | 0) == (27 | 0)) {
                  break label$40
                 }
                 if (!$12_1) {
                  break label$3
                 }
                 label$41 : {
                  if (($16_1 | 0) < (0 | 0)) {
                   break label$41
                  }
                  label$42 : {
                   if ($0_1) {
                    break label$42
                   }
                   HEAP32[($4_1 + ($16_1 << 2 | 0) | 0) >> 2] = $12_1;
                   continue label$5;
                  }
                  i64toi32_i32$2 = $3_1 + ($16_1 << 3 | 0) | 0;
                  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
                  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
                  $266_1 = i64toi32_i32$0;
                  i64toi32_i32$0 = $7_1;
                  HEAP32[($7_1 + 64 | 0) >> 2] = $266_1;
                  HEAP32[($7_1 + 68 | 0) >> 2] = i64toi32_i32$1;
                  break label$39;
                 }
                 if (!$0_1) {
                  break label$7
                 }
                 $114($7_1 + 64 | 0 | 0, $12_1 | 0, $2_1 | 0, $6_1 | 0);
                 break label$39;
                }
                if (($16_1 | 0) > (-1 | 0)) {
                 break label$3
                }
                $12_1 = 0;
                if (!$0_1) {
                 continue label$6
                }
               }
               if ((HEAPU8[$0_1 >> 0] | 0) & 32 | 0) {
                break label$2
               }
               $23_1 = $17_1 & -65537 | 0;
               $17_1 = $17_1 & 8192 | 0 ? $23_1 : $17_1;
               $16_1 = 0;
               $24_1 = 65540;
               $22_1 = $9_1;
               label$43 : {
                label$44 : {
                 label$45 : {
                  label$46 : {
                   label$47 : {
                    label$48 : {
                     label$49 : {
                      label$50 : {
                       label$51 : {
                        label$52 : {
                         label$53 : {
                          label$54 : {
                           label$55 : {
                            label$56 : {
                             label$57 : {
                              label$58 : {
                               $12_1 = HEAP8[$18_1 >> 0] | 0;
                               $12_1 = $15_1 ? (($12_1 & 15 | 0 | 0) == (3 | 0) ? $12_1 & -45 | 0 : $12_1) : $12_1;
                               switch ($12_1 + -88 | 0 | 0) {
                               case 11:
                                break label$43;
                               case 9:
                               case 13:
                               case 14:
                               case 15:
                                break label$44;
                               case 27:
                                break label$49;
                               case 12:
                               case 17:
                                break label$52;
                               case 23:
                                break label$53;
                               case 0:
                               case 32:
                                break label$54;
                               case 24:
                                break label$55;
                               case 22:
                                break label$56;
                               case 29:
                                break label$57;
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
                                break label$8;
                               default:
                                break label$58;
                               };
                              }
                              $22_1 = $9_1;
                              label$59 : {
                               switch ($12_1 + -65 | 0 | 0) {
                               case 0:
                               case 4:
                               case 5:
                               case 6:
                                break label$44;
                               case 2:
                                break label$47;
                               case 1:
                               case 3:
                                break label$8;
                               default:
                                break label$59;
                               };
                              }
                              if (($12_1 | 0) == (83 | 0)) {
                               break label$48
                              }
                              break label$9;
                             }
                             $16_1 = 0;
                             $24_1 = 65540;
                             i64toi32_i32$2 = $7_1;
                             i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                             i64toi32_i32$0 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                             $25_1 = i64toi32_i32$1;
                             $25$hi = i64toi32_i32$0;
                             break label$51;
                            }
                            $12_1 = 0;
                            label$60 : {
                             switch ($15_1 & 255 | 0 | 0) {
                             case 0:
                              HEAP32[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 2] = $11_1;
                              continue label$6;
                             case 1:
                              HEAP32[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 2] = $11_1;
                              continue label$6;
                             case 2:
                              i64toi32_i32$1 = $11_1;
                              i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
                              i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                              HEAP32[i64toi32_i32$1 >> 2] = $11_1;
                              HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
                              continue label$6;
                             case 3:
                              HEAP16[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 1] = $11_1;
                              continue label$6;
                             case 4:
                              HEAP8[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 0] = $11_1;
                              continue label$6;
                             case 6:
                              HEAP32[(HEAP32[($7_1 + 64 | 0) >> 2] | 0) >> 2] = $11_1;
                              continue label$6;
                             case 7:
                              break label$60;
                             default:
                              continue label$6;
                             };
                            }
                            i64toi32_i32$1 = $11_1;
                            i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
                            i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                            HEAP32[i64toi32_i32$1 >> 2] = $11_1;
                            HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
                            continue label$6;
                           }
                           $20_1 = $20_1 >>> 0 > 8 >>> 0 ? $20_1 : 8;
                           $17_1 = $17_1 | 8 | 0;
                           $12_1 = 120;
                          }
                          i64toi32_i32$2 = $7_1;
                          i64toi32_i32$0 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                          i64toi32_i32$1 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                          $13_1 = $115(i64toi32_i32$0 | 0, i64toi32_i32$1 | 0, $9_1 | 0, $12_1 & 32 | 0 | 0) | 0;
                          $16_1 = 0;
                          $24_1 = 65540;
                          i64toi32_i32$2 = $7_1;
                          i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                          i64toi32_i32$0 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                          if (!(i64toi32_i32$1 | i64toi32_i32$0 | 0)) {
                           break label$50
                          }
                          if (!($17_1 & 8 | 0)) {
                           break label$50
                          }
                          $24_1 = ($12_1 >>> 4 | 0) + 65540 | 0;
                          $16_1 = 2;
                          break label$50;
                         }
                         $16_1 = 0;
                         $24_1 = 65540;
                         i64toi32_i32$2 = $7_1;
                         i64toi32_i32$0 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                         i64toi32_i32$1 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                         $13_1 = $116(i64toi32_i32$0 | 0, i64toi32_i32$1 | 0, $9_1 | 0) | 0;
                         if (!($17_1 & 8 | 0)) {
                          break label$50
                         }
                         $12_1 = $9_1 - $13_1 | 0;
                         $20_1 = ($20_1 | 0) > ($12_1 | 0) ? $20_1 : $12_1 + 1 | 0;
                         break label$50;
                        }
                        label$67 : {
                         i64toi32_i32$2 = $7_1;
                         i64toi32_i32$1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                         i64toi32_i32$0 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                         $25_1 = i64toi32_i32$1;
                         $25$hi = i64toi32_i32$0;
                         i64toi32_i32$2 = i64toi32_i32$1;
                         i64toi32_i32$1 = -1;
                         i64toi32_i32$3 = -1;
                         if ((i64toi32_i32$0 | 0) > (i64toi32_i32$1 | 0)) {
                          $33_1 = 1
                         } else {
                          if ((i64toi32_i32$0 | 0) >= (i64toi32_i32$1 | 0)) {
                           if (i64toi32_i32$2 >>> 0 <= i64toi32_i32$3 >>> 0) {
                            $34_1 = 0
                           } else {
                            $34_1 = 1
                           }
                           $35_1 = $34_1;
                          } else {
                           $35_1 = 0
                          }
                          $33_1 = $35_1;
                         }
                         if ($33_1) {
                          break label$67
                         }
                         i64toi32_i32$2 = $25$hi;
                         i64toi32_i32$2 = 0;
                         i64toi32_i32$3 = 0;
                         i64toi32_i32$0 = $25$hi;
                         i64toi32_i32$1 = $25_1;
                         i64toi32_i32$5 = (i64toi32_i32$3 >>> 0 < i64toi32_i32$1 >>> 0) + i64toi32_i32$0 | 0;
                         i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$5 | 0;
                         $25_1 = i64toi32_i32$3 - i64toi32_i32$1 | 0;
                         $25$hi = i64toi32_i32$5;
                         i64toi32_i32$3 = $7_1;
                         HEAP32[($7_1 + 64 | 0) >> 2] = $25_1;
                         HEAP32[($7_1 + 68 | 0) >> 2] = i64toi32_i32$5;
                         $16_1 = 1;
                         $24_1 = 65540;
                         break label$51;
                        }
                        label$68 : {
                         if (!($17_1 & 2048 | 0)) {
                          break label$68
                         }
                         $16_1 = 1;
                         $24_1 = 65541;
                         break label$51;
                        }
                        $16_1 = $17_1 & 1 | 0;
                        $24_1 = $16_1 ? 65542 : 65540;
                       }
                       i64toi32_i32$5 = $25$hi;
                       $13_1 = $117($25_1 | 0, i64toi32_i32$5 | 0, $9_1 | 0) | 0;
                      }
                      if ($21_1 & ($20_1 | 0) < (0 | 0) | 0) {
                       break label$4
                      }
                      $17_1 = $21_1 ? $17_1 & -65537 | 0 : $17_1;
                      label$69 : {
                       i64toi32_i32$2 = $7_1;
                       i64toi32_i32$5 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                       i64toi32_i32$3 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                       $25_1 = i64toi32_i32$5;
                       $25$hi = i64toi32_i32$3;
                       i64toi32_i32$2 = i64toi32_i32$5;
                       i64toi32_i32$5 = 0;
                       i64toi32_i32$1 = 0;
                       if ((i64toi32_i32$2 | 0) != (i64toi32_i32$1 | 0) | (i64toi32_i32$3 | 0) != (i64toi32_i32$5 | 0) | 0) {
                        break label$69
                       }
                       if ($20_1) {
                        break label$69
                       }
                       $13_1 = $9_1;
                       $22_1 = $13_1;
                       $20_1 = 0;
                       break label$8;
                      }
                      i64toi32_i32$2 = $25$hi;
                      $12_1 = ($9_1 - $13_1 | 0) + !($25_1 | i64toi32_i32$2 | 0) | 0;
                      $20_1 = ($20_1 | 0) > ($12_1 | 0) ? $20_1 : $12_1;
                      break label$9;
                     }
                     $12_1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                     $13_1 = $12_1 ? $12_1 : 65637;
                     $12_1 = $105($13_1 | 0, ($20_1 >>> 0 < 2147483647 >>> 0 ? $20_1 : 2147483647) | 0) | 0;
                     $22_1 = $13_1 + $12_1 | 0;
                     label$70 : {
                      if (($20_1 | 0) <= (-1 | 0)) {
                       break label$70
                      }
                      $17_1 = $23_1;
                      $20_1 = $12_1;
                      break label$8;
                     }
                     $17_1 = $23_1;
                     $20_1 = $12_1;
                     if (HEAPU8[$22_1 >> 0] | 0) {
                      break label$4
                     }
                     break label$8;
                    }
                    label$71 : {
                     if (!$20_1) {
                      break label$71
                     }
                     $14_1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                     break label$46;
                    }
                    $12_1 = 0;
                    $118($0_1 | 0, 32 | 0, $19_1 | 0, 0 | 0, $17_1 | 0);
                    break label$45;
                   }
                   HEAP32[($7_1 + 12 | 0) >> 2] = 0;
                   i64toi32_i32$1 = $7_1;
                   i64toi32_i32$2 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                   i64toi32_i32$3 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
                   HEAP32[($7_1 + 8 | 0) >> 2] = i64toi32_i32$2;
                   HEAP32[($7_1 + 64 | 0) >> 2] = $7_1 + 8 | 0;
                   $14_1 = $7_1 + 8 | 0;
                   $20_1 = -1;
                  }
                  $12_1 = 0;
                  label$72 : {
                   label$73 : while (1) {
                    $15_1 = HEAP32[$14_1 >> 2] | 0;
                    if (!$15_1) {
                     break label$72
                    }
                    $15_1 = $129($7_1 + 4 | 0 | 0, $15_1 | 0) | 0;
                    if (($15_1 | 0) < (0 | 0)) {
                     break label$2
                    }
                    if ($15_1 >>> 0 > ($20_1 - $12_1 | 0) >>> 0) {
                     break label$72
                    }
                    $14_1 = $14_1 + 4 | 0;
                    $12_1 = $15_1 + $12_1 | 0;
                    if ($12_1 >>> 0 < $20_1 >>> 0) {
                     continue label$73
                    }
                    break label$73;
                   };
                  }
                  $22_1 = 61;
                  if (($12_1 | 0) < (0 | 0)) {
                   break label$3
                  }
                  $118($0_1 | 0, 32 | 0, $19_1 | 0, $12_1 | 0, $17_1 | 0);
                  label$74 : {
                   if ($12_1) {
                    break label$74
                   }
                   $12_1 = 0;
                   break label$45;
                  }
                  $15_1 = 0;
                  $14_1 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
                  label$75 : while (1) {
                   $13_1 = HEAP32[$14_1 >> 2] | 0;
                   if (!$13_1) {
                    break label$45
                   }
                   $13_1 = $129($7_1 + 4 | 0 | 0, $13_1 | 0) | 0;
                   $15_1 = $13_1 + $15_1 | 0;
                   if ($15_1 >>> 0 > $12_1 >>> 0) {
                    break label$45
                   }
                   $112($0_1 | 0, $7_1 + 4 | 0 | 0, $13_1 | 0);
                   $14_1 = $14_1 + 4 | 0;
                   if ($15_1 >>> 0 < $12_1 >>> 0) {
                    continue label$75
                   }
                   break label$75;
                  };
                 }
                 $118($0_1 | 0, 32 | 0, $19_1 | 0, $12_1 | 0, $17_1 ^ 8192 | 0 | 0);
                 $12_1 = ($19_1 | 0) > ($12_1 | 0) ? $19_1 : $12_1;
                 continue label$6;
                }
                if ($21_1 & ($20_1 | 0) < (0 | 0) | 0) {
                 break label$4
                }
                $22_1 = 61;
                $12_1 = FUNCTION_TABLE[$5_1 | 0]($0_1, +HEAPF64[($7_1 + 64 | 0) >> 3], $19_1, $20_1, $17_1, $12_1) | 0;
                if (($12_1 | 0) >= (0 | 0)) {
                 continue label$6
                }
                break label$3;
               }
               i64toi32_i32$1 = $7_1;
               i64toi32_i32$3 = HEAP32[($7_1 + 64 | 0) >> 2] | 0;
               i64toi32_i32$2 = HEAP32[($7_1 + 68 | 0) >> 2] | 0;
               HEAP8[($7_1 + 55 | 0) >> 0] = i64toi32_i32$3;
               $20_1 = 1;
               $13_1 = $8_1;
               $22_1 = $9_1;
               $17_1 = $23_1;
               break label$8;
              }
              $14_1 = HEAPU8[($12_1 + 1 | 0) >> 0] | 0;
              $12_1 = $12_1 + 1 | 0;
              continue label$12;
             };
            }
            if ($0_1) {
             break label$1
            }
            if (!$10_1) {
             break label$7
            }
            $12_1 = 1;
            label$76 : {
             label$77 : while (1) {
              $14_1 = HEAP32[($4_1 + ($12_1 << 2 | 0) | 0) >> 2] | 0;
              if (!$14_1) {
               break label$76
              }
              $114($3_1 + ($12_1 << 3 | 0) | 0 | 0, $14_1 | 0, $2_1 | 0, $6_1 | 0);
              $11_1 = 1;
              $12_1 = $12_1 + 1 | 0;
              if (($12_1 | 0) != (10 | 0)) {
               continue label$77
              }
              break label$1;
             };
            }
            $11_1 = 1;
            if ($12_1 >>> 0 >= 10 >>> 0) {
             break label$1
            }
            label$78 : while (1) {
             if (HEAP32[($4_1 + ($12_1 << 2 | 0) | 0) >> 2] | 0) {
              break label$10
             }
             $11_1 = 1;
             $12_1 = $12_1 + 1 | 0;
             if (($12_1 | 0) == (10 | 0)) {
              break label$1
             }
             continue label$78;
            };
           }
           $22_1 = 28;
           break label$3;
          }
          $22_1 = $9_1;
         }
         $1_1 = $22_1 - $13_1 | 0;
         $18_1 = ($20_1 | 0) > ($1_1 | 0) ? $20_1 : $1_1;
         if (($18_1 | 0) > ($16_1 ^ 2147483647 | 0 | 0)) {
          break label$4
         }
         $22_1 = 61;
         $15_1 = $16_1 + $18_1 | 0;
         $12_1 = ($19_1 | 0) > ($15_1 | 0) ? $19_1 : $15_1;
         if (($12_1 | 0) > ($14_1 | 0)) {
          break label$3
         }
         $118($0_1 | 0, 32 | 0, $12_1 | 0, $15_1 | 0, $17_1 | 0);
         $112($0_1 | 0, $24_1 | 0, $16_1 | 0);
         $118($0_1 | 0, 48 | 0, $12_1 | 0, $15_1 | 0, $17_1 ^ 65536 | 0 | 0);
         $118($0_1 | 0, 48 | 0, $18_1 | 0, $1_1 | 0, 0 | 0);
         $112($0_1 | 0, $13_1 | 0, $1_1 | 0);
         $118($0_1 | 0, 32 | 0, $12_1 | 0, $15_1 | 0, $17_1 ^ 8192 | 0 | 0);
         $1_1 = HEAP32[($7_1 + 76 | 0) >> 2] | 0;
         continue label$6;
        }
        break label$6;
       };
       break label$5;
      };
      $11_1 = 0;
      break label$1;
     }
     $22_1 = 61;
    }
    HEAP32[($106() | 0) >> 2] = $22_1;
   }
   $11_1 = -1;
  }
  global$0 = $7_1 + 80 | 0;
  return $11_1 | 0;
 }
 
 function $112($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  label$1 : {
   if ((HEAPU8[$0_1 >> 0] | 0) & 32 | 0) {
    break label$1
   }
   $109($1_1 | 0, $2_1 | 0, $0_1 | 0) | 0;
  }
 }
 
 function $113($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $1_1 = 0, $2_1 = 0, $4_1 = 0, $5_1 = 0;
  $1_1 = 0;
  label$1 : {
   $2_1 = HEAP32[$0_1 >> 2] | 0;
   $3_1 = (HEAP8[$2_1 >> 0] | 0) + -48 | 0;
   if ($3_1 >>> 0 <= 9 >>> 0) {
    break label$1
   }
   return 0 | 0;
  }
  label$2 : while (1) {
   $4_1 = -1;
   label$3 : {
    if ($1_1 >>> 0 > 214748364 >>> 0) {
     break label$3
    }
    $1_1 = Math_imul($1_1, 10);
    $4_1 = $3_1 >>> 0 > ($1_1 ^ 2147483647 | 0) >>> 0 ? -1 : $3_1 + $1_1 | 0;
   }
   $3_1 = $2_1 + 1 | 0;
   HEAP32[$0_1 >> 2] = $3_1;
   $5_1 = HEAP8[($2_1 + 1 | 0) >> 0] | 0;
   $1_1 = $4_1;
   $2_1 = $3_1;
   $3_1 = $5_1 + -48 | 0;
   if ($3_1 >>> 0 < 10 >>> 0) {
    continue label$2
   }
   break label$2;
  };
  return $1_1 | 0;
 }
 
 function $114($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $21_1 = 0, $29_1 = 0, $37_1 = 0, $45_1 = 0, $55_1 = 0, $63_1 = 0, $71_1 = 0, $79_1 = 0, $87_1 = 0, $97_1 = 0, $105_1 = 0, $115_1 = 0, $125_1 = 0, $133_1 = 0, $141_1 = 0;
  label$1 : {
   switch ($1_1 + -9 | 0 | 0) {
   case 0:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
    return;
   case 1:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = i64toi32_i32$0 >> 31 | 0;
    $21_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $21_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 2:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = 0;
    $29_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $29_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 4:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = i64toi32_i32$0 >> 31 | 0;
    $37_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $37_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 5:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = 0;
    $45_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $45_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 3:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $55_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $55_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 6:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP16[$1_1 >> 1] | 0;
    i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
    $63_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $63_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 7:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAPU16[$1_1 >> 1] | 0;
    i64toi32_i32$1 = 0;
    $71_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $71_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 8:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP8[$1_1 >> 0] | 0;
    i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
    $79_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $79_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 9:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAPU8[$1_1 >> 0] | 0;
    i64toi32_i32$1 = 0;
    $87_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $87_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 10:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $97_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $97_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 11:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = 0;
    $105_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $105_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 12:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $115_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $115_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 13:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
    $125_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $125_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 14:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$1 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
    $133_1 = i64toi32_i32$1;
    i64toi32_i32$1 = $0_1;
    HEAP32[i64toi32_i32$1 >> 2] = $133_1;
    HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
    return;
   case 15:
    $1_1 = HEAP32[$2_1 >> 2] | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 4 | 0;
    i64toi32_i32$0 = HEAP32[$1_1 >> 2] | 0;
    i64toi32_i32$1 = 0;
    $141_1 = i64toi32_i32$0;
    i64toi32_i32$0 = $0_1;
    HEAP32[i64toi32_i32$0 >> 2] = $141_1;
    HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
    return;
   case 16:
    $1_1 = ((HEAP32[$2_1 >> 2] | 0) + 7 | 0) & -8 | 0;
    HEAP32[$2_1 >> 2] = $1_1 + 8 | 0;
    HEAPF64[$0_1 >> 3] = +HEAPF64[$1_1 >> 3];
    return;
   case 17:
    FUNCTION_TABLE[$3_1 | 0]($0_1, $2_1);
    break;
   default:
    break label$1;
   };
  }
 }
 
 function $115($0_1, $0$hi, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, i64toi32_i32$3 = 0, $10_1 = 0, $3_1 = 0;
  label$1 : {
   i64toi32_i32$0 = $0$hi;
   if (!($0_1 | i64toi32_i32$0 | 0)) {
    break label$1
   }
   label$2 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    i64toi32_i32$0 = $0$hi;
    HEAP8[$1_1 >> 0] = HEAPU8[(($0_1 & 15 | 0) + 66144 | 0) >> 0] | 0 | $2_1 | 0;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$1 = 0;
    i64toi32_i32$3 = 15;
    $3_1 = i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$3 >>> 0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$1 = 4;
    i64toi32_i32$4 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$0 = 0;
     $10_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
     $10_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
    }
    $0_1 = $10_1;
    $0$hi = i64toi32_i32$0;
    if ($3_1) {
     continue label$2
    }
    break label$2;
   };
  }
  return $1_1 | 0;
 }
 
 function $116($0_1, $0$hi, $1_1) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, i64toi32_i32$3 = 0, $9_1 = 0, $2_1 = 0;
  label$1 : {
   i64toi32_i32$0 = $0$hi;
   if (!($0_1 | i64toi32_i32$0 | 0)) {
    break label$1
   }
   label$2 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    i64toi32_i32$0 = $0$hi;
    HEAP8[$1_1 >> 0] = $0_1 & 7 | 0 | 48 | 0;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$1 = 0;
    i64toi32_i32$3 = 7;
    $2_1 = i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$3 >>> 0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$1 = 3;
    i64toi32_i32$4 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$0 = 0;
     $9_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
     $9_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
    }
    $0_1 = $9_1;
    $0$hi = i64toi32_i32$0;
    if ($2_1) {
     continue label$2
    }
    break label$2;
   };
  }
  return $1_1 | 0;
 }
 
 function $117($0_1, $0$hi, $1_1) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $3_1 = 0, i64toi32_i32$5 = 0, i64toi32_i32$3 = 0, $2_1 = 0, $2$hi = 0, $4_1 = 0, $16_1 = 0, $16$hi = 0, $5_1 = 0;
  label$1 : {
   label$2 : {
    i64toi32_i32$0 = $0$hi;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$1 = 1;
    i64toi32_i32$3 = 0;
    if (i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 >= i64toi32_i32$3 >>> 0 | 0) | 0) {
     break label$2
    }
    i64toi32_i32$2 = i64toi32_i32$0;
    $2_1 = $0_1;
    $2$hi = i64toi32_i32$2;
    break label$1;
   }
   label$3 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    i64toi32_i32$2 = $0$hi;
    i64toi32_i32$0 = 0;
    i64toi32_i32$0 = __wasm_i64_udiv($0_1 | 0, i64toi32_i32$2 | 0, 10 | 0, i64toi32_i32$0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$HIGH_BITS;
    $2_1 = i64toi32_i32$0;
    $2$hi = i64toi32_i32$2;
    i64toi32_i32$0 = 0;
    i64toi32_i32$0 = __wasm_i64_mul($2_1 | 0, i64toi32_i32$2 | 0, 10 | 0, i64toi32_i32$0 | 0) | 0;
    i64toi32_i32$2 = i64toi32_i32$HIGH_BITS;
    $16_1 = i64toi32_i32$0;
    $16$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $0$hi;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$0 = $16$hi;
    i64toi32_i32$1 = $16_1;
    i64toi32_i32$5 = ($0_1 >>> 0 < i64toi32_i32$1 >>> 0) + i64toi32_i32$0 | 0;
    i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$5 | 0;
    HEAP8[$1_1 >> 0] = $0_1 - i64toi32_i32$1 | 0 | 48 | 0;
    i64toi32_i32$5 = i64toi32_i32$2;
    i64toi32_i32$5 = i64toi32_i32$2;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$3 = 9;
    i64toi32_i32$1 = -1;
    $3_1 = i64toi32_i32$5 >>> 0 > i64toi32_i32$3 >>> 0 | ((i64toi32_i32$5 | 0) == (i64toi32_i32$3 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$1 >>> 0 | 0) | 0;
    i64toi32_i32$2 = $2$hi;
    $0_1 = $2_1;
    $0$hi = i64toi32_i32$2;
    if ($3_1) {
     continue label$3
    }
    break label$3;
   };
  }
  label$4 : {
   i64toi32_i32$2 = $2$hi;
   $3_1 = $2_1;
   if (!$3_1) {
    break label$4
   }
   label$5 : while (1) {
    $1_1 = $1_1 + -1 | 0;
    $4_1 = ($3_1 >>> 0) / (10 >>> 0) | 0;
    HEAP8[$1_1 >> 0] = $3_1 - Math_imul($4_1, 10) | 0 | 48 | 0;
    $5_1 = $3_1 >>> 0 > 9 >>> 0;
    $3_1 = $4_1;
    if ($5_1) {
     continue label$5
    }
    break label$5;
   };
  }
  return $1_1 | 0;
 }
 
 function $118($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 256 | 0;
  global$0 = $5_1;
  label$1 : {
   if (($2_1 | 0) <= ($3_1 | 0)) {
    break label$1
   }
   if ($4_1 & 73728 | 0) {
    break label$1
   }
   $3_1 = $2_1 - $3_1 | 0;
   $2_1 = $3_1 >>> 0 < 256 >>> 0;
   $96($5_1 | 0, $1_1 | 0, ($2_1 ? $3_1 : 256) | 0) | 0;
   label$2 : {
    if ($2_1) {
     break label$2
    }
    label$3 : while (1) {
     $112($0_1 | 0, $5_1 | 0, 256 | 0);
     $3_1 = $3_1 + -256 | 0;
     if ($3_1 >>> 0 > 255 >>> 0) {
      continue label$3
     }
     break label$3;
    };
   }
   $112($0_1 | 0, $5_1 | 0, $3_1 | 0);
  }
  global$0 = $5_1 + 256 | 0;
 }
 
 function $119($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $110($0_1 | 0, $1_1 | 0, $2_1 | 0, 4 | 0, 5 | 0) | 0 | 0;
 }
 
 function $120($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  var $10_1 = 0, $11_1 = 0, $12_1 = 0, $18_1 = 0, $6_1 = 0, $21_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, $15_1 = 0, i64toi32_i32$4 = 0, $22_1 = 0, $23_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, i64toi32_i32$5 = 0, $19_1 = 0, $17_1 = 0, $8_1 = 0, $26_1 = 0.0, $24_1 = 0, $13_1 = 0, $24$hi = 0, $14_1 = 0, $16_1 = 0, $20_1 = 0, $9_1 = 0, $7_1 = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $25$hi = 0, $48_1 = 0, $25_1 = 0, $167_1 = 0, $169$hi = 0, $171$hi = 0, $173_1 = 0, $173$hi = 0, $175$hi = 0, $179_1 = 0, $179$hi = 0, $391 = 0.0, $855 = 0;
  $6_1 = global$0 - 560 | 0;
  global$0 = $6_1;
  $7_1 = 0;
  HEAP32[($6_1 + 44 | 0) >> 2] = 0;
  label$1 : {
   label$2 : {
    i64toi32_i32$0 = $122(+$1_1) | 0;
    i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    $24_1 = i64toi32_i32$0;
    $24$hi = i64toi32_i32$1;
    i64toi32_i32$2 = i64toi32_i32$0;
    i64toi32_i32$0 = -1;
    i64toi32_i32$3 = -1;
    if ((i64toi32_i32$1 | 0) > (i64toi32_i32$0 | 0)) {
     $45_1 = 1
    } else {
     if ((i64toi32_i32$1 | 0) >= (i64toi32_i32$0 | 0)) {
      if (i64toi32_i32$2 >>> 0 <= i64toi32_i32$3 >>> 0) {
       $46_1 = 0
      } else {
       $46_1 = 1
      }
      $47_1 = $46_1;
     } else {
      $47_1 = 0
     }
     $45_1 = $47_1;
    }
    if ($45_1) {
     break label$2
    }
    $8_1 = 1;
    $9_1 = 65550;
    $1_1 = -$1_1;
    i64toi32_i32$2 = $122(+$1_1) | 0;
    i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    $24_1 = i64toi32_i32$2;
    $24$hi = i64toi32_i32$1;
    break label$1;
   }
   label$3 : {
    if (!($4_1 & 2048 | 0)) {
     break label$3
    }
    $8_1 = 1;
    $9_1 = 65553;
    break label$1;
   }
   $8_1 = $4_1 & 1 | 0;
   $9_1 = $8_1 ? 65556 : 65551;
   $7_1 = !$8_1;
  }
  label$4 : {
   label$5 : {
    i64toi32_i32$1 = $24$hi;
    i64toi32_i32$3 = $24_1;
    i64toi32_i32$2 = 2146435072;
    i64toi32_i32$0 = 0;
    i64toi32_i32$2 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
    i64toi32_i32$1 = i64toi32_i32$3 & i64toi32_i32$0 | 0;
    i64toi32_i32$3 = 2146435072;
    i64toi32_i32$0 = 0;
    if ((i64toi32_i32$1 | 0) != (i64toi32_i32$0 | 0) | (i64toi32_i32$2 | 0) != (i64toi32_i32$3 | 0) | 0) {
     break label$5
    }
    $10_1 = $8_1 + 3 | 0;
    $118($0_1 | 0, 32 | 0, $2_1 | 0, $10_1 | 0, $4_1 & -65537 | 0 | 0);
    $112($0_1 | 0, $9_1 | 0, $8_1 | 0);
    $11_1 = $5_1 & 32 | 0;
    $112($0_1 | 0, ($1_1 != $1_1 ? ($11_1 ? 65585 : 65627) : $11_1 ? 65608 : 65631) | 0, 3 | 0);
    $118($0_1 | 0, 32 | 0, $2_1 | 0, $10_1 | 0, $4_1 ^ 8192 | 0 | 0);
    $12_1 = ($10_1 | 0) > ($2_1 | 0) ? $10_1 : $2_1;
    break label$4;
   }
   $13_1 = $6_1 + 16 | 0;
   label$6 : {
    label$7 : {
     label$8 : {
      label$9 : {
       $1_1 = +$107(+$1_1, $6_1 + 44 | 0 | 0);
       $1_1 = $1_1 + $1_1;
       if ($1_1 == 0.0) {
        break label$9
       }
       $10_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
       HEAP32[($6_1 + 44 | 0) >> 2] = $10_1 + -1 | 0;
       $14_1 = $5_1 | 32 | 0;
       if (($14_1 | 0) != (97 | 0)) {
        break label$8
       }
       break label$6;
      }
      $14_1 = $5_1 | 32 | 0;
      if (($14_1 | 0) == (97 | 0)) {
       break label$6
      }
      $15_1 = ($3_1 | 0) < (0 | 0) ? 6 : $3_1;
      $16_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
      break label$7;
     }
     $16_1 = $10_1 + -29 | 0;
     HEAP32[($6_1 + 44 | 0) >> 2] = $16_1;
     $15_1 = ($3_1 | 0) < (0 | 0) ? 6 : $3_1;
     $1_1 = $1_1 * 268435456.0;
    }
    $17_1 = ($6_1 + 48 | 0) + (($16_1 | 0) < (0 | 0) ? 0 : 288) | 0;
    $11_1 = $17_1;
    label$10 : while (1) {
     label$11 : {
      label$12 : {
       if (!($1_1 < 4294967296.0 & $1_1 >= 0.0 | 0)) {
        break label$12
       }
       $10_1 = ~~$1_1 >>> 0;
       break label$11;
      }
      $10_1 = 0;
     }
     HEAP32[$11_1 >> 2] = $10_1;
     $11_1 = $11_1 + 4 | 0;
     $1_1 = ($1_1 - +($10_1 >>> 0)) * 1.0e9;
     if ($1_1 != 0.0) {
      continue label$10
     }
     break label$10;
    };
    label$13 : {
     label$14 : {
      if (($16_1 | 0) >= (1 | 0)) {
       break label$14
      }
      $3_1 = $16_1;
      $10_1 = $11_1;
      $18_1 = $17_1;
      break label$13;
     }
     $18_1 = $17_1;
     $3_1 = $16_1;
     label$15 : while (1) {
      $3_1 = $3_1 >>> 0 < 29 >>> 0 ? $3_1 : 29;
      label$16 : {
       $10_1 = $11_1 + -4 | 0;
       if ($10_1 >>> 0 < $18_1 >>> 0) {
        break label$16
       }
       i64toi32_i32$1 = 0;
       $25_1 = $3_1;
       $25$hi = i64toi32_i32$1;
       i64toi32_i32$1 = 0;
       $24_1 = 0;
       $24$hi = i64toi32_i32$1;
       label$17 : while (1) {
        $167_1 = $10_1;
        i64toi32_i32$0 = $10_1;
        i64toi32_i32$1 = HEAP32[$10_1 >> 2] | 0;
        i64toi32_i32$2 = 0;
        $169$hi = i64toi32_i32$2;
        i64toi32_i32$2 = $25$hi;
        i64toi32_i32$2 = $169$hi;
        i64toi32_i32$0 = i64toi32_i32$1;
        i64toi32_i32$1 = $25$hi;
        i64toi32_i32$3 = $25_1;
        i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
        if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
         i64toi32_i32$1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
         $48_1 = 0;
        } else {
         i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$0 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$2 << i64toi32_i32$4 | 0) | 0;
         $48_1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
        }
        $171$hi = i64toi32_i32$1;
        i64toi32_i32$1 = $24$hi;
        i64toi32_i32$2 = $24_1;
        i64toi32_i32$0 = 0;
        i64toi32_i32$3 = -1;
        i64toi32_i32$0 = i64toi32_i32$1 & i64toi32_i32$0 | 0;
        $173_1 = i64toi32_i32$2 & i64toi32_i32$3 | 0;
        $173$hi = i64toi32_i32$0;
        i64toi32_i32$0 = $171$hi;
        i64toi32_i32$1 = $48_1;
        i64toi32_i32$2 = $173$hi;
        i64toi32_i32$3 = $173_1;
        i64toi32_i32$4 = i64toi32_i32$1 + i64toi32_i32$3 | 0;
        i64toi32_i32$5 = i64toi32_i32$0 + i64toi32_i32$2 | 0;
        if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
         i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
        }
        $24_1 = i64toi32_i32$4;
        $24$hi = i64toi32_i32$5;
        $175$hi = i64toi32_i32$5;
        i64toi32_i32$1 = 0;
        i64toi32_i32$1 = __wasm_i64_udiv(i64toi32_i32$4 | 0, i64toi32_i32$5 | 0, 1e9 | 0, i64toi32_i32$1 | 0) | 0;
        i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
        $24_1 = i64toi32_i32$1;
        $24$hi = i64toi32_i32$5;
        i64toi32_i32$1 = 0;
        i64toi32_i32$1 = __wasm_i64_mul($24_1 | 0, i64toi32_i32$5 | 0, 1e9 | 0, i64toi32_i32$1 | 0) | 0;
        i64toi32_i32$5 = i64toi32_i32$HIGH_BITS;
        $179_1 = i64toi32_i32$1;
        $179$hi = i64toi32_i32$5;
        i64toi32_i32$5 = $175$hi;
        i64toi32_i32$0 = i64toi32_i32$4;
        i64toi32_i32$1 = $179$hi;
        i64toi32_i32$3 = $179_1;
        i64toi32_i32$2 = i64toi32_i32$0 - i64toi32_i32$3 | 0;
        i64toi32_i32$4 = (i64toi32_i32$0 >>> 0 < i64toi32_i32$3 >>> 0) + i64toi32_i32$1 | 0;
        i64toi32_i32$4 = i64toi32_i32$5 - i64toi32_i32$4 | 0;
        HEAP32[$167_1 >> 2] = i64toi32_i32$2;
        $10_1 = $10_1 + -4 | 0;
        if ($10_1 >>> 0 >= $18_1 >>> 0) {
         continue label$17
        }
        break label$17;
       };
       i64toi32_i32$4 = $24$hi;
       $10_1 = $24_1;
       if (!$10_1) {
        break label$16
       }
       $18_1 = $18_1 + -4 | 0;
       HEAP32[$18_1 >> 2] = $10_1;
      }
      label$18 : {
       label$19 : while (1) {
        $10_1 = $11_1;
        if ($10_1 >>> 0 <= $18_1 >>> 0) {
         break label$18
        }
        $11_1 = $10_1 + -4 | 0;
        if (!(HEAP32[$11_1 >> 2] | 0)) {
         continue label$19
        }
        break label$19;
       };
      }
      $3_1 = (HEAP32[($6_1 + 44 | 0) >> 2] | 0) - $3_1 | 0;
      HEAP32[($6_1 + 44 | 0) >> 2] = $3_1;
      $11_1 = $10_1;
      if (($3_1 | 0) > (0 | 0)) {
       continue label$15
      }
      break label$15;
     };
    }
    label$20 : {
     if (($3_1 | 0) > (-1 | 0)) {
      break label$20
     }
     $19_1 = ((($15_1 + 25 | 0) >>> 0) / (9 >>> 0) | 0) + 1 | 0;
     $20_1 = ($14_1 | 0) == (102 | 0);
     label$21 : while (1) {
      $11_1 = 0 - $3_1 | 0;
      $21_1 = $11_1 >>> 0 < 9 >>> 0 ? $11_1 : 9;
      label$22 : {
       label$23 : {
        if ($18_1 >>> 0 < $10_1 >>> 0) {
         break label$23
        }
        $11_1 = !(HEAP32[$18_1 >> 2] | 0) << 2 | 0;
        break label$22;
       }
       $22_1 = 1e9 >>> $21_1 | 0;
       $23_1 = (-1 << $21_1 | 0) ^ -1 | 0;
       $3_1 = 0;
       $11_1 = $18_1;
       label$24 : while (1) {
        $12_1 = HEAP32[$11_1 >> 2] | 0;
        HEAP32[$11_1 >> 2] = ($12_1 >>> $21_1 | 0) + $3_1 | 0;
        $3_1 = Math_imul($12_1 & $23_1 | 0, $22_1);
        $11_1 = $11_1 + 4 | 0;
        if ($11_1 >>> 0 < $10_1 >>> 0) {
         continue label$24
        }
        break label$24;
       };
       $11_1 = !(HEAP32[$18_1 >> 2] | 0) << 2 | 0;
       if (!$3_1) {
        break label$22
       }
       HEAP32[$10_1 >> 2] = $3_1;
       $10_1 = $10_1 + 4 | 0;
      }
      $3_1 = (HEAP32[($6_1 + 44 | 0) >> 2] | 0) + $21_1 | 0;
      HEAP32[($6_1 + 44 | 0) >> 2] = $3_1;
      $18_1 = $18_1 + $11_1 | 0;
      $11_1 = $20_1 ? $17_1 : $18_1;
      $10_1 = (($10_1 - $11_1 | 0) >> 2 | 0 | 0) > ($19_1 | 0) ? $11_1 + ($19_1 << 2 | 0) | 0 : $10_1;
      if (($3_1 | 0) < (0 | 0)) {
       continue label$21
      }
      break label$21;
     };
    }
    $3_1 = 0;
    label$25 : {
     if ($18_1 >>> 0 >= $10_1 >>> 0) {
      break label$25
     }
     $3_1 = Math_imul(($17_1 - $18_1 | 0) >> 2 | 0, 9);
     $11_1 = 10;
     $12_1 = HEAP32[$18_1 >> 2] | 0;
     if ($12_1 >>> 0 < 10 >>> 0) {
      break label$25
     }
     label$26 : while (1) {
      $3_1 = $3_1 + 1 | 0;
      $11_1 = Math_imul($11_1, 10);
      if ($12_1 >>> 0 >= $11_1 >>> 0) {
       continue label$26
      }
      break label$26;
     };
    }
    label$27 : {
     $11_1 = ($15_1 - (($14_1 | 0) == (102 | 0) ? 0 : $3_1) | 0) - (($15_1 | 0) != (0 | 0) & ($14_1 | 0) == (103 | 0) | 0) | 0;
     if (($11_1 | 0) >= (Math_imul(($10_1 - $17_1 | 0) >> 2 | 0, 9) + -9 | 0 | 0)) {
      break label$27
     }
     $12_1 = $11_1 + 9216 | 0;
     $22_1 = ($12_1 | 0) / (9 | 0) | 0;
     $19_1 = (($6_1 + 48 | 0) + (($16_1 | 0) < (0 | 0) ? 4 : 292) | 0) + ($22_1 << 2 | 0) | 0;
     $21_1 = $19_1 + -4096 | 0;
     $11_1 = 10;
     label$28 : {
      $12_1 = $12_1 - Math_imul($22_1, 9) | 0;
      if (($12_1 | 0) > (7 | 0)) {
       break label$28
      }
      label$29 : while (1) {
       $11_1 = Math_imul($11_1, 10);
       $12_1 = $12_1 + 1 | 0;
       if (($12_1 | 0) != (8 | 0)) {
        continue label$29
       }
       break label$29;
      };
     }
     $23_1 = $19_1 + -4092 | 0;
     label$30 : {
      label$31 : {
       $12_1 = HEAP32[$21_1 >> 2] | 0;
       $20_1 = ($12_1 >>> 0) / ($11_1 >>> 0) | 0;
       $22_1 = $12_1 - Math_imul($20_1, $11_1) | 0;
       if ($22_1) {
        break label$31
       }
       if (($23_1 | 0) == ($10_1 | 0)) {
        break label$30
       }
      }
      label$32 : {
       label$33 : {
        if ($20_1 & 1 | 0) {
         break label$33
        }
        $1_1 = 9007199254740992.0;
        if (($11_1 | 0) != (1e9 | 0)) {
         break label$32
        }
        if ($21_1 >>> 0 <= $18_1 >>> 0) {
         break label$32
        }
        if (!((HEAPU8[($19_1 + -4100 | 0) >> 0] | 0) & 1 | 0)) {
         break label$32
        }
       }
       $1_1 = 9007199254740994.0;
      }
      $391 = ($23_1 | 0) == ($10_1 | 0) ? 1.0 : 1.5;
      $23_1 = $11_1 >>> 1 | 0;
      $26_1 = $22_1 >>> 0 < $23_1 >>> 0 ? .5 : ($22_1 | 0) == ($23_1 | 0) ? $391 : 1.5;
      label$34 : {
       if ($7_1) {
        break label$34
       }
       if ((HEAPU8[$9_1 >> 0] | 0 | 0) != (45 | 0)) {
        break label$34
       }
       $26_1 = -$26_1;
       $1_1 = -$1_1;
      }
      $12_1 = $12_1 - $22_1 | 0;
      HEAP32[$21_1 >> 2] = $12_1;
      if ($1_1 + $26_1 == $1_1) {
       break label$30
      }
      $11_1 = $12_1 + $11_1 | 0;
      HEAP32[$21_1 >> 2] = $11_1;
      label$35 : {
       if ($11_1 >>> 0 < 1e9 >>> 0) {
        break label$35
       }
       label$36 : while (1) {
        HEAP32[$21_1 >> 2] = 0;
        label$37 : {
         $21_1 = $21_1 + -4 | 0;
         if ($21_1 >>> 0 >= $18_1 >>> 0) {
          break label$37
         }
         $18_1 = $18_1 + -4 | 0;
         HEAP32[$18_1 >> 2] = 0;
        }
        $11_1 = (HEAP32[$21_1 >> 2] | 0) + 1 | 0;
        HEAP32[$21_1 >> 2] = $11_1;
        if ($11_1 >>> 0 > 999999999 >>> 0) {
         continue label$36
        }
        break label$36;
       };
      }
      $3_1 = Math_imul(($17_1 - $18_1 | 0) >> 2 | 0, 9);
      $11_1 = 10;
      $12_1 = HEAP32[$18_1 >> 2] | 0;
      if ($12_1 >>> 0 < 10 >>> 0) {
       break label$30
      }
      label$38 : while (1) {
       $3_1 = $3_1 + 1 | 0;
       $11_1 = Math_imul($11_1, 10);
       if ($12_1 >>> 0 >= $11_1 >>> 0) {
        continue label$38
       }
       break label$38;
      };
     }
     $11_1 = $21_1 + 4 | 0;
     $10_1 = $10_1 >>> 0 > $11_1 >>> 0 ? $11_1 : $10_1;
    }
    label$39 : {
     label$40 : while (1) {
      $11_1 = $10_1;
      $12_1 = $10_1 >>> 0 <= $18_1 >>> 0;
      if ($12_1) {
       break label$39
      }
      $10_1 = $10_1 + -4 | 0;
      if (!(HEAP32[$10_1 >> 2] | 0)) {
       continue label$40
      }
      break label$40;
     };
    }
    label$41 : {
     label$42 : {
      if (($14_1 | 0) == (103 | 0)) {
       break label$42
      }
      $21_1 = $4_1 & 8 | 0;
      break label$41;
     }
     $10_1 = $15_1 ? $15_1 : 1;
     $21_1 = ($10_1 | 0) > ($3_1 | 0) & ($3_1 | 0) > (-5 | 0) | 0;
     $15_1 = ($21_1 ? $3_1 ^ -1 | 0 : -1) + $10_1 | 0;
     $5_1 = ($21_1 ? -1 : -2) + $5_1 | 0;
     $21_1 = $4_1 & 8 | 0;
     if ($21_1) {
      break label$41
     }
     $10_1 = -9;
     label$43 : {
      if ($12_1) {
       break label$43
      }
      $21_1 = HEAP32[($11_1 + -4 | 0) >> 2] | 0;
      if (!$21_1) {
       break label$43
      }
      $12_1 = 10;
      $10_1 = 0;
      if (($21_1 >>> 0) % (10 >>> 0) | 0) {
       break label$43
      }
      label$44 : while (1) {
       $22_1 = $10_1;
       $10_1 = $10_1 + 1 | 0;
       $12_1 = Math_imul($12_1, 10);
       if (!(($21_1 >>> 0) % ($12_1 >>> 0) | 0)) {
        continue label$44
       }
       break label$44;
      };
      $10_1 = $22_1 ^ -1 | 0;
     }
     $12_1 = Math_imul(($11_1 - $17_1 | 0) >> 2 | 0, 9);
     label$45 : {
      if (($5_1 & -33 | 0 | 0) != (70 | 0)) {
       break label$45
      }
      $21_1 = 0;
      $10_1 = ($12_1 + $10_1 | 0) + -9 | 0;
      $10_1 = ($10_1 | 0) > (0 | 0) ? $10_1 : 0;
      $15_1 = ($15_1 | 0) < ($10_1 | 0) ? $15_1 : $10_1;
      break label$41;
     }
     $21_1 = 0;
     $10_1 = (($3_1 + $12_1 | 0) + $10_1 | 0) + -9 | 0;
     $10_1 = ($10_1 | 0) > (0 | 0) ? $10_1 : 0;
     $15_1 = ($15_1 | 0) < ($10_1 | 0) ? $15_1 : $10_1;
    }
    $12_1 = -1;
    $22_1 = $15_1 | $21_1 | 0;
    if (($15_1 | 0) > (($22_1 ? 2147483645 : 2147483646) | 0)) {
     break label$4
    }
    $23_1 = ($15_1 + (($22_1 | 0) != (0 | 0)) | 0) + 1 | 0;
    label$46 : {
     label$47 : {
      $20_1 = $5_1 & -33 | 0;
      if (($20_1 | 0) != (70 | 0)) {
       break label$47
      }
      if (($3_1 | 0) > ($23_1 ^ 2147483647 | 0 | 0)) {
       break label$4
      }
      $10_1 = ($3_1 | 0) > (0 | 0) ? $3_1 : 0;
      break label$46;
     }
     label$48 : {
      $10_1 = $3_1 >> 31 | 0;
      i64toi32_i32$4 = 0;
      $10_1 = $117(($3_1 ^ $10_1 | 0) - $10_1 | 0 | 0, i64toi32_i32$4 | 0, $13_1 | 0) | 0;
      if (($13_1 - $10_1 | 0 | 0) > (1 | 0)) {
       break label$48
      }
      label$49 : while (1) {
       $10_1 = $10_1 + -1 | 0;
       HEAP8[$10_1 >> 0] = 48;
       if (($13_1 - $10_1 | 0 | 0) < (2 | 0)) {
        continue label$49
       }
       break label$49;
      };
     }
     $19_1 = $10_1 + -2 | 0;
     HEAP8[$19_1 >> 0] = $5_1;
     $12_1 = -1;
     HEAP8[($10_1 + -1 | 0) >> 0] = ($3_1 | 0) < (0 | 0) ? 45 : 43;
     $10_1 = $13_1 - $19_1 | 0;
     if (($10_1 | 0) > ($23_1 ^ 2147483647 | 0 | 0)) {
      break label$4
     }
    }
    $12_1 = -1;
    $10_1 = $10_1 + $23_1 | 0;
    if (($10_1 | 0) > ($8_1 ^ 2147483647 | 0 | 0)) {
     break label$4
    }
    $23_1 = $10_1 + $8_1 | 0;
    $118($0_1 | 0, 32 | 0, $2_1 | 0, $23_1 | 0, $4_1 | 0);
    $112($0_1 | 0, $9_1 | 0, $8_1 | 0);
    $118($0_1 | 0, 48 | 0, $2_1 | 0, $23_1 | 0, $4_1 ^ 65536 | 0 | 0);
    label$50 : {
     label$51 : {
      label$52 : {
       label$53 : {
        if (($20_1 | 0) != (70 | 0)) {
         break label$53
        }
        $21_1 = $6_1 + 16 | 0 | 8 | 0;
        $3_1 = $6_1 + 16 | 0 | 9 | 0;
        $12_1 = $18_1 >>> 0 > $17_1 >>> 0 ? $17_1 : $18_1;
        $18_1 = $12_1;
        label$54 : while (1) {
         i64toi32_i32$5 = $18_1;
         i64toi32_i32$4 = HEAP32[$18_1 >> 2] | 0;
         i64toi32_i32$0 = 0;
         $10_1 = $117(i64toi32_i32$4 | 0, i64toi32_i32$0 | 0, $3_1 | 0) | 0;
         label$55 : {
          label$56 : {
           if (($18_1 | 0) == ($12_1 | 0)) {
            break label$56
           }
           if ($10_1 >>> 0 <= ($6_1 + 16 | 0) >>> 0) {
            break label$55
           }
           label$57 : while (1) {
            $10_1 = $10_1 + -1 | 0;
            HEAP8[$10_1 >> 0] = 48;
            if ($10_1 >>> 0 > ($6_1 + 16 | 0) >>> 0) {
             continue label$57
            }
            break label$55;
           };
          }
          if (($10_1 | 0) != ($3_1 | 0)) {
           break label$55
          }
          HEAP8[($6_1 + 24 | 0) >> 0] = 48;
          $10_1 = $21_1;
         }
         $112($0_1 | 0, $10_1 | 0, $3_1 - $10_1 | 0 | 0);
         $18_1 = $18_1 + 4 | 0;
         if ($18_1 >>> 0 <= $17_1 >>> 0) {
          continue label$54
         }
         break label$54;
        };
        label$58 : {
         if (!$22_1) {
          break label$58
         }
         $112($0_1 | 0, 65635 | 0, 1 | 0);
        }
        if ($18_1 >>> 0 >= $11_1 >>> 0) {
         break label$52
        }
        if (($15_1 | 0) < (1 | 0)) {
         break label$52
        }
        label$59 : while (1) {
         label$60 : {
          i64toi32_i32$5 = $18_1;
          i64toi32_i32$0 = HEAP32[$18_1 >> 2] | 0;
          i64toi32_i32$4 = 0;
          $10_1 = $117(i64toi32_i32$0 | 0, i64toi32_i32$4 | 0, $3_1 | 0) | 0;
          if ($10_1 >>> 0 <= ($6_1 + 16 | 0) >>> 0) {
           break label$60
          }
          label$61 : while (1) {
           $10_1 = $10_1 + -1 | 0;
           HEAP8[$10_1 >> 0] = 48;
           if ($10_1 >>> 0 > ($6_1 + 16 | 0) >>> 0) {
            continue label$61
           }
           break label$61;
          };
         }
         $112($0_1 | 0, $10_1 | 0, (($15_1 | 0) < (9 | 0) ? $15_1 : 9) | 0);
         $10_1 = $15_1 + -9 | 0;
         $18_1 = $18_1 + 4 | 0;
         if ($18_1 >>> 0 >= $11_1 >>> 0) {
          break label$51
         }
         $12_1 = ($15_1 | 0) > (9 | 0);
         $15_1 = $10_1;
         if ($12_1) {
          continue label$59
         }
         break label$51;
        };
       }
       label$62 : {
        if (($15_1 | 0) < (0 | 0)) {
         break label$62
        }
        $22_1 = $11_1 >>> 0 > $18_1 >>> 0 ? $11_1 : $18_1 + 4 | 0;
        $17_1 = $6_1 + 16 | 0 | 8 | 0;
        $3_1 = $6_1 + 16 | 0 | 9 | 0;
        $11_1 = $18_1;
        label$63 : while (1) {
         label$64 : {
          i64toi32_i32$5 = $11_1;
          i64toi32_i32$4 = HEAP32[$11_1 >> 2] | 0;
          i64toi32_i32$0 = 0;
          $10_1 = $117(i64toi32_i32$4 | 0, i64toi32_i32$0 | 0, $3_1 | 0) | 0;
          if (($10_1 | 0) != ($3_1 | 0)) {
           break label$64
          }
          HEAP8[($6_1 + 24 | 0) >> 0] = 48;
          $10_1 = $17_1;
         }
         label$65 : {
          label$66 : {
           if (($11_1 | 0) == ($18_1 | 0)) {
            break label$66
           }
           if ($10_1 >>> 0 <= ($6_1 + 16 | 0) >>> 0) {
            break label$65
           }
           label$67 : while (1) {
            $10_1 = $10_1 + -1 | 0;
            HEAP8[$10_1 >> 0] = 48;
            if ($10_1 >>> 0 > ($6_1 + 16 | 0) >>> 0) {
             continue label$67
            }
            break label$65;
           };
          }
          $112($0_1 | 0, $10_1 | 0, 1 | 0);
          $10_1 = $10_1 + 1 | 0;
          if (!($15_1 | $21_1 | 0)) {
           break label$65
          }
          $112($0_1 | 0, 65635 | 0, 1 | 0);
         }
         $12_1 = $3_1 - $10_1 | 0;
         $112($0_1 | 0, $10_1 | 0, (($15_1 | 0) > ($12_1 | 0) ? $12_1 : $15_1) | 0);
         $15_1 = $15_1 - $12_1 | 0;
         $11_1 = $11_1 + 4 | 0;
         if ($11_1 >>> 0 >= $22_1 >>> 0) {
          break label$62
         }
         if (($15_1 | 0) > (-1 | 0)) {
          continue label$63
         }
         break label$63;
        };
       }
       $118($0_1 | 0, 48 | 0, $15_1 + 18 | 0 | 0, 18 | 0, 0 | 0);
       $112($0_1 | 0, $19_1 | 0, $13_1 - $19_1 | 0 | 0);
       break label$50;
      }
      $10_1 = $15_1;
     }
     $118($0_1 | 0, 48 | 0, $10_1 + 9 | 0 | 0, 9 | 0, 0 | 0);
    }
    $118($0_1 | 0, 32 | 0, $2_1 | 0, $23_1 | 0, $4_1 ^ 8192 | 0 | 0);
    $12_1 = ($23_1 | 0) > ($2_1 | 0) ? $23_1 : $2_1;
    break label$4;
   }
   $23_1 = $9_1 + ((($5_1 << 26 | 0) >> 31 | 0) & 9 | 0) | 0;
   label$68 : {
    if ($3_1 >>> 0 > 11 >>> 0) {
     break label$68
    }
    $10_1 = 12 - $3_1 | 0;
    $26_1 = 16.0;
    label$69 : while (1) {
     $26_1 = $26_1 * 16.0;
     $10_1 = $10_1 + -1 | 0;
     if ($10_1) {
      continue label$69
     }
     break label$69;
    };
    label$70 : {
     if ((HEAPU8[$23_1 >> 0] | 0 | 0) != (45 | 0)) {
      break label$70
     }
     $1_1 = -($26_1 + (-$1_1 - $26_1));
     break label$68;
    }
    $1_1 = $1_1 + $26_1 - $26_1;
   }
   label$71 : {
    $10_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
    $855 = $10_1;
    $10_1 = $10_1 >> 31 | 0;
    i64toi32_i32$0 = 0;
    $10_1 = $117(($855 ^ $10_1 | 0) - $10_1 | 0 | 0, i64toi32_i32$0 | 0, $13_1 | 0) | 0;
    if (($10_1 | 0) != ($13_1 | 0)) {
     break label$71
    }
    HEAP8[($6_1 + 15 | 0) >> 0] = 48;
    $10_1 = $6_1 + 15 | 0;
   }
   $21_1 = $8_1 | 2 | 0;
   $18_1 = $5_1 & 32 | 0;
   $11_1 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
   $22_1 = $10_1 + -2 | 0;
   HEAP8[$22_1 >> 0] = $5_1 + 15 | 0;
   HEAP8[($10_1 + -1 | 0) >> 0] = ($11_1 | 0) < (0 | 0) ? 45 : 43;
   $12_1 = $4_1 & 8 | 0;
   $11_1 = $6_1 + 16 | 0;
   label$72 : while (1) {
    $10_1 = $11_1;
    label$73 : {
     label$74 : {
      if (!(Math_abs($1_1) < 2147483648.0)) {
       break label$74
      }
      $11_1 = ~~$1_1;
      break label$73;
     }
     $11_1 = -2147483648;
    }
    HEAP8[$10_1 >> 0] = HEAPU8[($11_1 + 66144 | 0) >> 0] | 0 | $18_1 | 0;
    $1_1 = ($1_1 - +($11_1 | 0)) * 16.0;
    label$75 : {
     $11_1 = $10_1 + 1 | 0;
     if (($11_1 - ($6_1 + 16 | 0) | 0 | 0) != (1 | 0)) {
      break label$75
     }
     label$76 : {
      if ($12_1) {
       break label$76
      }
      if (($3_1 | 0) > (0 | 0)) {
       break label$76
      }
      if ($1_1 == 0.0) {
       break label$75
      }
     }
     HEAP8[($10_1 + 1 | 0) >> 0] = 46;
     $11_1 = $10_1 + 2 | 0;
    }
    if ($1_1 != 0.0) {
     continue label$72
    }
    break label$72;
   };
   $12_1 = -1;
   $18_1 = $13_1 - $22_1 | 0;
   $19_1 = $21_1 + $18_1 | 0;
   if ((2147483645 - $19_1 | 0 | 0) < ($3_1 | 0)) {
    break label$4
   }
   $10_1 = $11_1 - ($6_1 + 16 | 0) | 0;
   $3_1 = $3_1 ? (($10_1 + -2 | 0 | 0) < ($3_1 | 0) ? $3_1 + 2 | 0 : $10_1) : $10_1;
   $11_1 = $19_1 + $3_1 | 0;
   $118($0_1 | 0, 32 | 0, $2_1 | 0, $11_1 | 0, $4_1 | 0);
   $112($0_1 | 0, $23_1 | 0, $21_1 | 0);
   $118($0_1 | 0, 48 | 0, $2_1 | 0, $11_1 | 0, $4_1 ^ 65536 | 0 | 0);
   $112($0_1 | 0, $6_1 + 16 | 0 | 0, $10_1 | 0);
   $118($0_1 | 0, 48 | 0, $3_1 - $10_1 | 0 | 0, 0 | 0, 0 | 0);
   $112($0_1 | 0, $22_1 | 0, $18_1 | 0);
   $118($0_1 | 0, 32 | 0, $2_1 | 0, $11_1 | 0, $4_1 ^ 8192 | 0 | 0);
   $12_1 = ($11_1 | 0) > ($2_1 | 0) ? $11_1 : $2_1;
  }
  global$0 = $6_1 + 560 | 0;
  return $12_1 | 0;
 }
 
 function $121($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $2_1 = 0, $12_1 = 0, $12$hi = 0, $15_1 = 0, $15$hi = 0;
  $2_1 = ((HEAP32[$1_1 >> 2] | 0) + 7 | 0) & -8 | 0;
  HEAP32[$1_1 >> 2] = $2_1 + 16 | 0;
  i64toi32_i32$2 = $2_1;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $12_1 = i64toi32_i32$0;
  $12$hi = i64toi32_i32$1;
  i64toi32_i32$2 = i64toi32_i32$2 + 8 | 0;
  i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $15_1 = i64toi32_i32$1;
  $15$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $12$hi;
  i64toi32_i32$1 = $15$hi;
  HEAPF64[$0_1 >> 3] = +$132($12_1 | 0, i64toi32_i32$0 | 0, $15_1 | 0, i64toi32_i32$1 | 0);
 }
 
 function $122($0_1) {
  $0_1 = +$0_1;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  wasm2js_scratch_store_f64(+$0_1);
  i64toi32_i32$0 = wasm2js_scratch_load_i32(1 | 0) | 0;
  i64toi32_i32$1 = wasm2js_scratch_load_i32(0 | 0) | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function $123($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   return 0 | 0;
  }
  HEAP32[($106() | 0) >> 2] = $0_1;
  return -1 | 0;
 }
 
 function $124() {
  return 42 | 0;
 }
 
 function $125() {
  return $124() | 0 | 0;
 }
 
 function $126() {
  return 67996 | 0;
 }
 
 function $127() {
  HEAP32[(0 + 68092 | 0) >> 2] = 67972;
  HEAP32[(0 + 68020 | 0) >> 2] = $125() | 0;
 }
 
 function $128($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = 1;
  label$1 : {
   label$2 : {
    if (!$0_1) {
     break label$2
    }
    if ($1_1 >>> 0 <= 127 >>> 0) {
     break label$1
    }
    label$3 : {
     label$4 : {
      if (HEAP32[(HEAP32[(($126() | 0) + 96 | 0) >> 2] | 0) >> 2] | 0) {
       break label$4
      }
      if (($1_1 & -128 | 0 | 0) == (57216 | 0)) {
       break label$1
      }
      HEAP32[($106() | 0) >> 2] = 25;
      break label$3;
     }
     label$5 : {
      if ($1_1 >>> 0 > 2047 >>> 0) {
       break label$5
      }
      HEAP8[($0_1 + 1 | 0) >> 0] = $1_1 & 63 | 0 | 128 | 0;
      HEAP8[$0_1 >> 0] = $1_1 >>> 6 | 0 | 192 | 0;
      return 2 | 0;
     }
     label$6 : {
      label$7 : {
       if ($1_1 >>> 0 < 55296 >>> 0) {
        break label$7
       }
       if (($1_1 & -8192 | 0 | 0) != (57344 | 0)) {
        break label$6
       }
      }
      HEAP8[($0_1 + 2 | 0) >> 0] = $1_1 & 63 | 0 | 128 | 0;
      HEAP8[$0_1 >> 0] = $1_1 >>> 12 | 0 | 224 | 0;
      HEAP8[($0_1 + 1 | 0) >> 0] = ($1_1 >>> 6 | 0) & 63 | 0 | 128 | 0;
      return 3 | 0;
     }
     label$8 : {
      if (($1_1 + -65536 | 0) >>> 0 > 1048575 >>> 0) {
       break label$8
      }
      HEAP8[($0_1 + 3 | 0) >> 0] = $1_1 & 63 | 0 | 128 | 0;
      HEAP8[$0_1 >> 0] = $1_1 >>> 18 | 0 | 240 | 0;
      HEAP8[($0_1 + 2 | 0) >> 0] = ($1_1 >>> 6 | 0) & 63 | 0 | 128 | 0;
      HEAP8[($0_1 + 1 | 0) >> 0] = ($1_1 >>> 12 | 0) & 63 | 0 | 128 | 0;
      return 4 | 0;
     }
     HEAP32[($106() | 0) >> 2] = 25;
    }
    $3_1 = -1;
   }
   return $3_1 | 0;
  }
  HEAP8[$0_1 >> 0] = $1_1;
  return 1 | 0;
 }
 
 function $129($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   return 0 | 0;
  }
  return $128($0_1 | 0, $1_1 | 0, 0 | 0) | 0 | 0;
 }
 
 function $130($0_1, $1_1, $1$hi, $2_1, $2$hi, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$3 = 0, $4$hi = 0, $18_1 = 0, $20_1 = 0, $21_1 = 0, $22_1 = 0, $11$hi = 0, $18$hi = 0, $19_1 = 0, $19$hi = 0, $4_1 = 0, $24$hi = 0;
  label$1 : {
   label$2 : {
    if (!($3_1 & 64 | 0)) {
     break label$2
    }
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$0 = 0;
    $11$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$2 = $1_1;
    i64toi32_i32$1 = $11$hi;
    i64toi32_i32$3 = $3_1 + -64 | 0;
    i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
     i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
     $18_1 = 0;
    } else {
     i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$4 | 0) | 0;
     $18_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
    }
    $2_1 = $18_1;
    $2$hi = i64toi32_i32$1;
    i64toi32_i32$1 = 0;
    $1_1 = 0;
    $1$hi = i64toi32_i32$1;
    break label$1;
   }
   if (!$3_1) {
    break label$1
   }
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$1 = 0;
   $18$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$0 = $1_1;
   i64toi32_i32$2 = $18$hi;
   i64toi32_i32$3 = 64 - $3_1 | 0;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = 0;
    $20_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
    $20_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
   }
   $19_1 = $20_1;
   $19$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $2$hi;
   i64toi32_i32$2 = 0;
   $4_1 = $3_1;
   $4$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $2$hi;
   i64toi32_i32$1 = $2_1;
   i64toi32_i32$0 = $4$hi;
   i64toi32_i32$3 = $3_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
    $21_1 = 0;
   } else {
    i64toi32_i32$0 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$1 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$2 << i64toi32_i32$4 | 0) | 0;
    $21_1 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
   }
   $24$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $19$hi;
   i64toi32_i32$2 = $19_1;
   i64toi32_i32$1 = $24$hi;
   i64toi32_i32$3 = $21_1;
   i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
   $2_1 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
   $2$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$1 = $4$hi;
   i64toi32_i32$1 = $1$hi;
   i64toi32_i32$0 = $1_1;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$3 = $4_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
    $22_1 = 0;
   } else {
    i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$0 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
    $22_1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
   }
   $1_1 = $22_1;
   $1$hi = i64toi32_i32$2;
  }
  i64toi32_i32$2 = $1$hi;
  i64toi32_i32$0 = $0_1;
  HEAP32[i64toi32_i32$0 >> 2] = $1_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$2;
  i64toi32_i32$2 = $2$hi;
  HEAP32[(i64toi32_i32$0 + 8 | 0) >> 2] = $2_1;
  HEAP32[(i64toi32_i32$0 + 12 | 0) >> 2] = i64toi32_i32$2;
 }
 
 function $131($0_1, $1_1, $1$hi, $2_1, $2$hi, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$4 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $4$hi = 0, $18_1 = 0, $20_1 = 0, $21_1 = 0, $22_1 = 0, $11$hi = 0, $18$hi = 0, $19_1 = 0, $19$hi = 0, $4_1 = 0, $24$hi = 0;
  label$1 : {
   label$2 : {
    if (!($3_1 & 64 | 0)) {
     break label$2
    }
    i64toi32_i32$0 = $2$hi;
    i64toi32_i32$0 = 0;
    $11$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $2$hi;
    i64toi32_i32$2 = $2_1;
    i64toi32_i32$1 = $11$hi;
    i64toi32_i32$3 = $3_1 + -64 | 0;
    i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
     i64toi32_i32$1 = 0;
     $18_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
     $18_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
    }
    $1_1 = $18_1;
    $1$hi = i64toi32_i32$1;
    i64toi32_i32$1 = 0;
    $2_1 = 0;
    $2$hi = i64toi32_i32$1;
    break label$1;
   }
   if (!$3_1) {
    break label$1
   }
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$1 = 0;
   $18$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$0 = $2_1;
   i64toi32_i32$2 = $18$hi;
   i64toi32_i32$3 = 64 - $3_1 | 0;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
    $20_1 = 0;
   } else {
    i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$0 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
    $20_1 = i64toi32_i32$0 << i64toi32_i32$4 | 0;
   }
   $19_1 = $20_1;
   $19$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $1$hi;
   i64toi32_i32$2 = 0;
   $4_1 = $3_1;
   $4$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $1$hi;
   i64toi32_i32$1 = $1_1;
   i64toi32_i32$0 = $4$hi;
   i64toi32_i32$3 = $3_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = 0;
    $21_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
    $21_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$1 >>> i64toi32_i32$4 | 0) | 0;
   }
   $24$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $19$hi;
   i64toi32_i32$2 = $19_1;
   i64toi32_i32$1 = $24$hi;
   i64toi32_i32$3 = $21_1;
   i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
   $1_1 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
   $1$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$1 = $4$hi;
   i64toi32_i32$1 = $2$hi;
   i64toi32_i32$0 = $2_1;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$3 = $4_1;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = 0;
    $22_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   } else {
    i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
    $22_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
   }
   $2_1 = $22_1;
   $2$hi = i64toi32_i32$2;
  }
  i64toi32_i32$2 = $1$hi;
  i64toi32_i32$0 = $0_1;
  HEAP32[i64toi32_i32$0 >> 2] = $1_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$2;
  i64toi32_i32$2 = $2$hi;
  HEAP32[(i64toi32_i32$0 + 8 | 0) >> 2] = $2_1;
  HEAP32[(i64toi32_i32$0 + 12 | 0) >> 2] = i64toi32_i32$2;
 }
 
 function $132($0_1, $0$hi, $1_1, $1$hi) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, i64toi32_i32$5 = 0, i64toi32_i32$3 = 0, i64toi32_i32$1 = 0, $4_1 = 0, $4$hi = 0, $5$hi = 0, $5_1 = 0, $2_1 = 0, $3_1 = 0, $44_1 = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $48_1 = 0, $49_1 = 0, $50_1 = 0, $12_1 = 0, $12$hi = 0, $14$hi = 0, $17_1 = 0, $17$hi = 0, $19$hi = 0, $33_1 = 0, $33$hi = 0, $36_1 = 0, $38_1 = 0, $43_1 = 0, $43$hi = 0, $45$hi = 0, $73_1 = 0, $73$hi = 0, $77$hi = 0, $80_1 = 0, $80$hi = 0, $82_1 = 0, $82$hi = 0, $86_1 = 0, $86$hi = 0, $88_1 = 0, $89$hi = 0, $98$hi = 0, $105_1 = 0, $105$hi = 0;
  $2_1 = global$0 - 32 | 0;
  global$0 = $2_1;
  label$1 : {
   label$2 : {
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$2 = $1_1;
    i64toi32_i32$1 = 2147483647;
    i64toi32_i32$3 = -1;
    i64toi32_i32$1 = i64toi32_i32$0 & i64toi32_i32$1 | 0;
    $4_1 = i64toi32_i32$2 & i64toi32_i32$3 | 0;
    $4$hi = i64toi32_i32$1;
    i64toi32_i32$0 = $4_1;
    i64toi32_i32$2 = -1006698496;
    i64toi32_i32$3 = 0;
    i64toi32_i32$4 = i64toi32_i32$0 + i64toi32_i32$3 | 0;
    i64toi32_i32$5 = i64toi32_i32$1 + i64toi32_i32$2 | 0;
    if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
     i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
    }
    $12_1 = i64toi32_i32$4;
    $12$hi = i64toi32_i32$5;
    i64toi32_i32$5 = $4$hi;
    i64toi32_i32$1 = $4_1;
    i64toi32_i32$0 = -1140785152;
    i64toi32_i32$3 = 0;
    i64toi32_i32$2 = i64toi32_i32$1 + i64toi32_i32$3 | 0;
    i64toi32_i32$4 = i64toi32_i32$5 + i64toi32_i32$0 | 0;
    if (i64toi32_i32$2 >>> 0 < i64toi32_i32$3 >>> 0) {
     i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
    }
    $14$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $12$hi;
    i64toi32_i32$5 = $12_1;
    i64toi32_i32$1 = $14$hi;
    i64toi32_i32$3 = i64toi32_i32$2;
    if (i64toi32_i32$4 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$4 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$5 >>> 0 >= i64toi32_i32$2 >>> 0 | 0) | 0) {
     break label$2
    }
    i64toi32_i32$5 = $0$hi;
    i64toi32_i32$3 = $0_1;
    i64toi32_i32$4 = 0;
    i64toi32_i32$1 = 60;
    i64toi32_i32$0 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$4 = 0;
     $44_1 = i64toi32_i32$5 >>> i64toi32_i32$0 | 0;
    } else {
     i64toi32_i32$4 = i64toi32_i32$5 >>> i64toi32_i32$0 | 0;
     $44_1 = (((1 << i64toi32_i32$0 | 0) - 1 | 0) & i64toi32_i32$5 | 0) << (32 - i64toi32_i32$0 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$0 | 0) | 0;
    }
    $17_1 = $44_1;
    $17$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $1$hi;
    i64toi32_i32$5 = $1_1;
    i64toi32_i32$3 = 0;
    i64toi32_i32$1 = 4;
    i64toi32_i32$0 = i64toi32_i32$1 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$1 & 63 | 0) >>> 0) {
     i64toi32_i32$3 = i64toi32_i32$5 << i64toi32_i32$0 | 0;
     $45_1 = 0;
    } else {
     i64toi32_i32$3 = ((1 << i64toi32_i32$0 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$0 | 0) | 0) | 0 | (i64toi32_i32$4 << i64toi32_i32$0 | 0) | 0;
     $45_1 = i64toi32_i32$5 << i64toi32_i32$0 | 0;
    }
    $19$hi = i64toi32_i32$3;
    i64toi32_i32$3 = $17$hi;
    i64toi32_i32$4 = $17_1;
    i64toi32_i32$5 = $19$hi;
    i64toi32_i32$1 = $45_1;
    i64toi32_i32$5 = i64toi32_i32$3 | i64toi32_i32$5 | 0;
    $4_1 = i64toi32_i32$4 | i64toi32_i32$1 | 0;
    $4$hi = i64toi32_i32$5;
    label$3 : {
     i64toi32_i32$5 = $0$hi;
     i64toi32_i32$3 = $0_1;
     i64toi32_i32$4 = 268435455;
     i64toi32_i32$1 = -1;
     i64toi32_i32$4 = i64toi32_i32$5 & i64toi32_i32$4 | 0;
     $0_1 = i64toi32_i32$3 & i64toi32_i32$1 | 0;
     $0$hi = i64toi32_i32$4;
     i64toi32_i32$5 = $0_1;
     i64toi32_i32$3 = 134217728;
     i64toi32_i32$1 = 1;
     if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0 | ((i64toi32_i32$4 | 0) == (i64toi32_i32$3 | 0) & i64toi32_i32$5 >>> 0 < i64toi32_i32$1 >>> 0 | 0) | 0) {
      break label$3
     }
     i64toi32_i32$5 = $4$hi;
     i64toi32_i32$1 = $4_1;
     i64toi32_i32$4 = 1073741824;
     i64toi32_i32$3 = 1;
     i64toi32_i32$0 = i64toi32_i32$1 + i64toi32_i32$3 | 0;
     i64toi32_i32$2 = i64toi32_i32$5 + i64toi32_i32$4 | 0;
     if (i64toi32_i32$0 >>> 0 < i64toi32_i32$3 >>> 0) {
      i64toi32_i32$2 = i64toi32_i32$2 + 1 | 0
     }
     $5_1 = i64toi32_i32$0;
     $5$hi = i64toi32_i32$2;
     break label$1;
    }
    i64toi32_i32$2 = $4$hi;
    i64toi32_i32$5 = $4_1;
    i64toi32_i32$1 = 1073741824;
    i64toi32_i32$3 = 0;
    i64toi32_i32$4 = i64toi32_i32$5 + i64toi32_i32$3 | 0;
    i64toi32_i32$0 = i64toi32_i32$2 + i64toi32_i32$1 | 0;
    if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
     i64toi32_i32$0 = i64toi32_i32$0 + 1 | 0
    }
    $5_1 = i64toi32_i32$4;
    $5$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $0$hi;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$5 = 134217728;
    i64toi32_i32$3 = 0;
    if ((i64toi32_i32$2 | 0) != (i64toi32_i32$3 | 0) | (i64toi32_i32$0 | 0) != (i64toi32_i32$5 | 0) | 0) {
     break label$1
    }
    i64toi32_i32$2 = $5$hi;
    i64toi32_i32$2 = $4$hi;
    i64toi32_i32$3 = $4_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$5 = 1;
    i64toi32_i32$0 = i64toi32_i32$2 & i64toi32_i32$0 | 0;
    $33_1 = i64toi32_i32$3 & i64toi32_i32$5 | 0;
    $33$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $5$hi;
    i64toi32_i32$2 = i64toi32_i32$4;
    i64toi32_i32$3 = $33$hi;
    i64toi32_i32$5 = $33_1;
    i64toi32_i32$1 = i64toi32_i32$2 + i64toi32_i32$5 | 0;
    i64toi32_i32$4 = i64toi32_i32$0 + i64toi32_i32$3 | 0;
    if (i64toi32_i32$1 >>> 0 < i64toi32_i32$5 >>> 0) {
     i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
    }
    $5_1 = i64toi32_i32$1;
    $5$hi = i64toi32_i32$4;
    break label$1;
   }
   label$4 : {
    i64toi32_i32$4 = $0$hi;
    $36_1 = !($0_1 | i64toi32_i32$4 | 0);
    i64toi32_i32$4 = $4$hi;
    i64toi32_i32$0 = $4_1;
    i64toi32_i32$2 = 2147418112;
    i64toi32_i32$5 = 0;
    $38_1 = i64toi32_i32$4 >>> 0 < i64toi32_i32$2 >>> 0 | ((i64toi32_i32$4 | 0) == (i64toi32_i32$2 | 0) & i64toi32_i32$0 >>> 0 < i64toi32_i32$5 >>> 0 | 0) | 0;
    i64toi32_i32$0 = i64toi32_i32$4;
    i64toi32_i32$0 = i64toi32_i32$4;
    i64toi32_i32$5 = $4_1;
    i64toi32_i32$4 = 2147418112;
    i64toi32_i32$2 = 0;
    if ((i64toi32_i32$5 | 0) == (i64toi32_i32$2 | 0) & (i64toi32_i32$0 | 0) == (i64toi32_i32$4 | 0) | 0 ? $36_1 : $38_1) {
     break label$4
    }
    i64toi32_i32$5 = $0$hi;
    i64toi32_i32$2 = $0_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$4 = 60;
    i64toi32_i32$3 = i64toi32_i32$4 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$4 & 63 | 0) >>> 0) {
     i64toi32_i32$0 = 0;
     $46_1 = i64toi32_i32$5 >>> i64toi32_i32$3 | 0;
    } else {
     i64toi32_i32$0 = i64toi32_i32$5 >>> i64toi32_i32$3 | 0;
     $46_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$5 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$3 | 0) | 0;
    }
    $43_1 = $46_1;
    $43$hi = i64toi32_i32$0;
    i64toi32_i32$0 = $1$hi;
    i64toi32_i32$5 = $1_1;
    i64toi32_i32$2 = 0;
    i64toi32_i32$4 = 4;
    i64toi32_i32$3 = i64toi32_i32$4 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$4 & 63 | 0) >>> 0) {
     i64toi32_i32$2 = i64toi32_i32$5 << i64toi32_i32$3 | 0;
     $47_1 = 0;
    } else {
     i64toi32_i32$2 = ((1 << i64toi32_i32$3 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$3 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$3 | 0) | 0;
     $47_1 = i64toi32_i32$5 << i64toi32_i32$3 | 0;
    }
    $45$hi = i64toi32_i32$2;
    i64toi32_i32$2 = $43$hi;
    i64toi32_i32$0 = $43_1;
    i64toi32_i32$5 = $45$hi;
    i64toi32_i32$4 = $47_1;
    i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
    i64toi32_i32$2 = i64toi32_i32$0 | i64toi32_i32$4 | 0;
    i64toi32_i32$0 = 524287;
    i64toi32_i32$4 = -1;
    i64toi32_i32$0 = i64toi32_i32$5 & i64toi32_i32$0 | 0;
    i64toi32_i32$5 = i64toi32_i32$2 & i64toi32_i32$4 | 0;
    i64toi32_i32$2 = 2146959360;
    i64toi32_i32$4 = 0;
    i64toi32_i32$2 = i64toi32_i32$0 | i64toi32_i32$2 | 0;
    $5_1 = i64toi32_i32$5 | i64toi32_i32$4 | 0;
    $5$hi = i64toi32_i32$2;
    break label$1;
   }
   i64toi32_i32$2 = 2146435072;
   $5_1 = 0;
   $5$hi = i64toi32_i32$2;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$0 = $4_1;
   i64toi32_i32$5 = 1140785151;
   i64toi32_i32$4 = -1;
   if (i64toi32_i32$2 >>> 0 > i64toi32_i32$5 >>> 0 | ((i64toi32_i32$2 | 0) == (i64toi32_i32$5 | 0) & i64toi32_i32$0 >>> 0 > i64toi32_i32$4 >>> 0 | 0) | 0) {
    break label$1
   }
   i64toi32_i32$0 = 0;
   $5_1 = 0;
   $5$hi = i64toi32_i32$0;
   i64toi32_i32$0 = i64toi32_i32$2;
   i64toi32_i32$0 = i64toi32_i32$2;
   i64toi32_i32$4 = $4_1;
   i64toi32_i32$2 = 0;
   i64toi32_i32$5 = 48;
   i64toi32_i32$3 = i64toi32_i32$5 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$5 & 63 | 0) >>> 0) {
    i64toi32_i32$2 = 0;
    $48_1 = i64toi32_i32$0 >>> i64toi32_i32$3 | 0;
   } else {
    i64toi32_i32$2 = i64toi32_i32$0 >>> i64toi32_i32$3 | 0;
    $48_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$4 >>> i64toi32_i32$3 | 0) | 0;
   }
   $3_1 = $48_1;
   if ($3_1 >>> 0 < 15249 >>> 0) {
    break label$1
   }
   i64toi32_i32$2 = $0$hi;
   i64toi32_i32$2 = $1$hi;
   i64toi32_i32$0 = $1_1;
   i64toi32_i32$4 = 65535;
   i64toi32_i32$5 = -1;
   i64toi32_i32$4 = i64toi32_i32$2 & i64toi32_i32$4 | 0;
   i64toi32_i32$2 = i64toi32_i32$0 & i64toi32_i32$5 | 0;
   i64toi32_i32$0 = 65536;
   i64toi32_i32$5 = 0;
   i64toi32_i32$0 = i64toi32_i32$4 | i64toi32_i32$0 | 0;
   $4_1 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
   $4$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $0$hi;
   i64toi32_i32$2 = $4$hi;
   $130($2_1 + 16 | 0 | 0, $0_1 | 0, i64toi32_i32$0 | 0, $4_1 | 0, i64toi32_i32$2 | 0, $3_1 + -15233 | 0 | 0);
   i64toi32_i32$2 = i64toi32_i32$0;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$2 = i64toi32_i32$0;
   i64toi32_i32$0 = $4$hi;
   $131($2_1 | 0, $0_1 | 0, i64toi32_i32$2 | 0, $4_1 | 0, i64toi32_i32$0 | 0, 15361 - $3_1 | 0 | 0);
   i64toi32_i32$4 = $2_1;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$4 >> 2] | 0;
   i64toi32_i32$2 = HEAP32[(i64toi32_i32$4 + 4 | 0) >> 2] | 0;
   $4_1 = i64toi32_i32$0;
   $4$hi = i64toi32_i32$2;
   i64toi32_i32$4 = i64toi32_i32$0;
   i64toi32_i32$0 = 0;
   i64toi32_i32$5 = 60;
   i64toi32_i32$3 = i64toi32_i32$5 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$5 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = 0;
    $49_1 = i64toi32_i32$2 >>> i64toi32_i32$3 | 0;
   } else {
    i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$3 | 0;
    $49_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$4 >>> i64toi32_i32$3 | 0) | 0;
   }
   $73_1 = $49_1;
   $73$hi = i64toi32_i32$0;
   i64toi32_i32$2 = $2_1 + 8 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   i64toi32_i32$2 = i64toi32_i32$0;
   i64toi32_i32$0 = 0;
   i64toi32_i32$5 = 4;
   i64toi32_i32$3 = i64toi32_i32$5 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$5 & 63 | 0) >>> 0) {
    i64toi32_i32$0 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
    $50_1 = 0;
   } else {
    i64toi32_i32$0 = ((1 << i64toi32_i32$3 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$3 | 0) | 0) | 0 | (i64toi32_i32$4 << i64toi32_i32$3 | 0) | 0;
    $50_1 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
   }
   $77$hi = i64toi32_i32$0;
   i64toi32_i32$0 = $73$hi;
   i64toi32_i32$4 = $73_1;
   i64toi32_i32$2 = $77$hi;
   i64toi32_i32$5 = $50_1;
   i64toi32_i32$2 = i64toi32_i32$0 | i64toi32_i32$2 | 0;
   $5_1 = i64toi32_i32$4 | i64toi32_i32$5 | 0;
   $5$hi = i64toi32_i32$2;
   label$5 : {
    i64toi32_i32$2 = $4$hi;
    i64toi32_i32$0 = $4_1;
    i64toi32_i32$4 = 268435455;
    i64toi32_i32$5 = -1;
    i64toi32_i32$4 = i64toi32_i32$2 & i64toi32_i32$4 | 0;
    $80_1 = i64toi32_i32$0 & i64toi32_i32$5 | 0;
    $80$hi = i64toi32_i32$4;
    i64toi32_i32$2 = $2_1;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 16 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 20 | 0) >> 2] | 0;
    $82_1 = i64toi32_i32$4;
    $82$hi = i64toi32_i32$0;
    i64toi32_i32$2 = (i64toi32_i32$2 + 16 | 0) + 8 | 0;
    i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
    i64toi32_i32$4 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
    $86_1 = i64toi32_i32$0;
    $86$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $82$hi;
    i64toi32_i32$2 = $82_1;
    i64toi32_i32$0 = $86$hi;
    i64toi32_i32$5 = $86_1;
    i64toi32_i32$0 = i64toi32_i32$4 | i64toi32_i32$0 | 0;
    i64toi32_i32$4 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
    i64toi32_i32$2 = 0;
    i64toi32_i32$5 = 0;
    $88_1 = (i64toi32_i32$4 | 0) != (i64toi32_i32$5 | 0) | (i64toi32_i32$0 | 0) != (i64toi32_i32$2 | 0) | 0;
    i64toi32_i32$4 = 0;
    $89$hi = i64toi32_i32$4;
    i64toi32_i32$4 = $80$hi;
    i64toi32_i32$5 = $80_1;
    i64toi32_i32$0 = $89$hi;
    i64toi32_i32$2 = $88_1;
    i64toi32_i32$0 = i64toi32_i32$4 | i64toi32_i32$0 | 0;
    $4_1 = i64toi32_i32$5 | i64toi32_i32$2 | 0;
    $4$hi = i64toi32_i32$0;
    i64toi32_i32$4 = $4_1;
    i64toi32_i32$5 = 134217728;
    i64toi32_i32$2 = 1;
    if (i64toi32_i32$0 >>> 0 < i64toi32_i32$5 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$5 | 0) & i64toi32_i32$4 >>> 0 < i64toi32_i32$2 >>> 0 | 0) | 0) {
     break label$5
    }
    i64toi32_i32$4 = $5$hi;
    i64toi32_i32$2 = $5_1;
    i64toi32_i32$0 = 0;
    i64toi32_i32$5 = 1;
    i64toi32_i32$3 = i64toi32_i32$2 + i64toi32_i32$5 | 0;
    i64toi32_i32$1 = i64toi32_i32$4 + i64toi32_i32$0 | 0;
    if (i64toi32_i32$3 >>> 0 < i64toi32_i32$5 >>> 0) {
     i64toi32_i32$1 = i64toi32_i32$1 + 1 | 0
    }
    $5_1 = i64toi32_i32$3;
    $5$hi = i64toi32_i32$1;
    break label$1;
   }
   i64toi32_i32$1 = $4$hi;
   i64toi32_i32$4 = $4_1;
   i64toi32_i32$2 = 134217728;
   i64toi32_i32$5 = 0;
   if ((i64toi32_i32$4 | 0) != (i64toi32_i32$5 | 0) | (i64toi32_i32$1 | 0) != (i64toi32_i32$2 | 0) | 0) {
    break label$1
   }
   i64toi32_i32$4 = $5$hi;
   i64toi32_i32$5 = $5_1;
   i64toi32_i32$1 = 0;
   i64toi32_i32$2 = 1;
   i64toi32_i32$1 = i64toi32_i32$4 & i64toi32_i32$1 | 0;
   $98$hi = i64toi32_i32$1;
   i64toi32_i32$1 = i64toi32_i32$4;
   i64toi32_i32$1 = $98$hi;
   i64toi32_i32$4 = i64toi32_i32$5 & i64toi32_i32$2 | 0;
   i64toi32_i32$5 = $5$hi;
   i64toi32_i32$2 = $5_1;
   i64toi32_i32$0 = i64toi32_i32$4 + i64toi32_i32$2 | 0;
   i64toi32_i32$3 = i64toi32_i32$1 + i64toi32_i32$5 | 0;
   if (i64toi32_i32$0 >>> 0 < i64toi32_i32$2 >>> 0) {
    i64toi32_i32$3 = i64toi32_i32$3 + 1 | 0
   }
   $5_1 = i64toi32_i32$0;
   $5$hi = i64toi32_i32$3;
  }
  global$0 = $2_1 + 32 | 0;
  i64toi32_i32$3 = $5$hi;
  i64toi32_i32$3 = $1$hi;
  i64toi32_i32$1 = $1_1;
  i64toi32_i32$4 = -2147483648;
  i64toi32_i32$2 = 0;
  i64toi32_i32$4 = i64toi32_i32$3 & i64toi32_i32$4 | 0;
  $105_1 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
  $105$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $5$hi;
  i64toi32_i32$3 = $5_1;
  i64toi32_i32$1 = $105$hi;
  i64toi32_i32$2 = $105_1;
  i64toi32_i32$1 = i64toi32_i32$4 | i64toi32_i32$1 | 0;
  wasm2js_scratch_store_i32(0 | 0, i64toi32_i32$3 | i64toi32_i32$2 | 0 | 0);
  wasm2js_scratch_store_i32(1 | 0, i64toi32_i32$1 | 0);
  return +(+wasm2js_scratch_load_f64());
 }
 
 function $133() {
  return __wasm_memory_size() << 16 | 0 | 0;
 }
 
 function $134($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = HEAP32[(0 + 66676 | 0) >> 2] | 0;
  $2_1 = ($0_1 + 7 | 0) & -8 | 0;
  $0_1 = $1_1 + $2_1 | 0;
  label$1 : {
   label$2 : {
    label$3 : {
     if (!$2_1) {
      break label$3
     }
     if ($0_1 >>> 0 <= $1_1 >>> 0) {
      break label$2
     }
    }
    if ($0_1 >>> 0 <= ($133() | 0) >>> 0) {
     break label$1
    }
    if (fimport$3($0_1 | 0) | 0) {
     break label$1
    }
   }
   HEAP32[($106() | 0) >> 2] = 48;
   return -1 | 0;
  }
  HEAP32[(0 + 66676 | 0) >> 2] = $0_1;
  return $1_1 | 0;
 }
 
 function $135($0_1) {
  $0_1 = $0_1 | 0;
  var $5_1 = 0, $4_1 = 0, $7_1 = 0, $8_1 = 0, $3_1 = 0, $2_1 = 0, $6_1 = 0, $10_1 = 0, $11_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, $1_1 = 0, $9_1 = 0, $79_1 = 0, $183_1 = 0, $782 = 0, $784 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  label$1 : {
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
             if ($0_1 >>> 0 > 244 >>> 0) {
              break label$11
             }
             label$12 : {
              $2_1 = HEAP32[(0 + 68128 | 0) >> 2] | 0;
              $3_1 = $0_1 >>> 0 < 11 >>> 0 ? 16 : ($0_1 + 11 | 0) & 504 | 0;
              $4_1 = $3_1 >>> 3 | 0;
              $0_1 = $2_1 >>> $4_1 | 0;
              if (!($0_1 & 3 | 0)) {
               break label$12
              }
              label$13 : {
               label$14 : {
                $3_1 = (($0_1 ^ -1 | 0) & 1 | 0) + $4_1 | 0;
                $4_1 = $3_1 << 3 | 0;
                $0_1 = $4_1 + 68168 | 0;
                $4_1 = HEAP32[($4_1 + 68176 | 0) >> 2] | 0;
                $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
                if (($0_1 | 0) != ($5_1 | 0)) {
                 break label$14
                }
                HEAP32[(0 + 68128 | 0) >> 2] = $2_1 & (__wasm_rotl_i32(-2 | 0, $3_1 | 0) | 0) | 0;
                break label$13;
               }
               HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
               HEAP32[($0_1 + 8 | 0) >> 2] = $5_1;
              }
              $0_1 = $4_1 + 8 | 0;
              $3_1 = $3_1 << 3 | 0;
              HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
              $4_1 = $4_1 + $3_1 | 0;
              HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 1 | 0;
              break label$1;
             }
             $6_1 = HEAP32[(0 + 68136 | 0) >> 2] | 0;
             if ($3_1 >>> 0 <= $6_1 >>> 0) {
              break label$10
             }
             label$15 : {
              if (!$0_1) {
               break label$15
              }
              label$16 : {
               label$17 : {
                $79_1 = $0_1 << $4_1 | 0;
                $0_1 = 2 << $4_1 | 0;
                $4_1 = __wasm_ctz_i32($79_1 & ($0_1 | (0 - $0_1 | 0) | 0) | 0 | 0) | 0;
                $0_1 = $4_1 << 3 | 0;
                $5_1 = $0_1 + 68168 | 0;
                $0_1 = HEAP32[($0_1 + 68176 | 0) >> 2] | 0;
                $7_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
                if (($5_1 | 0) != ($7_1 | 0)) {
                 break label$17
                }
                $2_1 = $2_1 & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
                HEAP32[(0 + 68128 | 0) >> 2] = $2_1;
                break label$16;
               }
               HEAP32[($7_1 + 12 | 0) >> 2] = $5_1;
               HEAP32[($5_1 + 8 | 0) >> 2] = $7_1;
              }
              HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
              $7_1 = $0_1 + $3_1 | 0;
              $4_1 = $4_1 << 3 | 0;
              $3_1 = $4_1 - $3_1 | 0;
              HEAP32[($7_1 + 4 | 0) >> 2] = $3_1 | 1 | 0;
              HEAP32[($0_1 + $4_1 | 0) >> 2] = $3_1;
              label$18 : {
               if (!$6_1) {
                break label$18
               }
               $5_1 = ($6_1 & -8 | 0) + 68168 | 0;
               $4_1 = HEAP32[(0 + 68148 | 0) >> 2] | 0;
               label$19 : {
                label$20 : {
                 $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
                 if ($2_1 & $8_1 | 0) {
                  break label$20
                 }
                 HEAP32[(0 + 68128 | 0) >> 2] = $2_1 | $8_1 | 0;
                 $8_1 = $5_1;
                 break label$19;
                }
                $8_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
               }
               HEAP32[($5_1 + 8 | 0) >> 2] = $4_1;
               HEAP32[($8_1 + 12 | 0) >> 2] = $4_1;
               HEAP32[($4_1 + 12 | 0) >> 2] = $5_1;
               HEAP32[($4_1 + 8 | 0) >> 2] = $8_1;
              }
              $0_1 = $0_1 + 8 | 0;
              HEAP32[(0 + 68148 | 0) >> 2] = $7_1;
              HEAP32[(0 + 68136 | 0) >> 2] = $3_1;
              break label$1;
             }
             $9_1 = HEAP32[(0 + 68132 | 0) >> 2] | 0;
             if (!$9_1) {
              break label$10
             }
             $7_1 = HEAP32[(((__wasm_ctz_i32($9_1 | 0) | 0) << 2 | 0) + 68432 | 0) >> 2] | 0;
             $4_1 = ((HEAP32[($7_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
             $5_1 = $7_1;
             label$21 : {
              label$22 : while (1) {
               label$23 : {
                $0_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
                if ($0_1) {
                 break label$23
                }
                $0_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
                if (!$0_1) {
                 break label$21
                }
               }
               $5_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
               $183_1 = $5_1;
               $5_1 = $5_1 >>> 0 < $4_1 >>> 0;
               $4_1 = $5_1 ? $183_1 : $4_1;
               $7_1 = $5_1 ? $0_1 : $7_1;
               $5_1 = $0_1;
               continue label$22;
              };
             }
             $10_1 = HEAP32[($7_1 + 24 | 0) >> 2] | 0;
             label$24 : {
              $0_1 = HEAP32[($7_1 + 12 | 0) >> 2] | 0;
              if (($0_1 | 0) == ($7_1 | 0)) {
               break label$24
              }
              $5_1 = HEAP32[($7_1 + 8 | 0) >> 2] | 0;
              HEAP32[(0 + 68144 | 0) >> 2] | 0;
              HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
              HEAP32[($0_1 + 8 | 0) >> 2] = $5_1;
              break label$2;
             }
             label$25 : {
              label$26 : {
               $5_1 = HEAP32[($7_1 + 20 | 0) >> 2] | 0;
               if (!$5_1) {
                break label$26
               }
               $8_1 = $7_1 + 20 | 0;
               break label$25;
              }
              $5_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
              if (!$5_1) {
               break label$9
              }
              $8_1 = $7_1 + 16 | 0;
             }
             label$27 : while (1) {
              $11_1 = $8_1;
              $0_1 = $5_1;
              $8_1 = $0_1 + 20 | 0;
              $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
              if ($5_1) {
               continue label$27
              }
              $8_1 = $0_1 + 16 | 0;
              $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
              if ($5_1) {
               continue label$27
              }
              break label$27;
             };
             HEAP32[$11_1 >> 2] = 0;
             break label$2;
            }
            $3_1 = -1;
            if ($0_1 >>> 0 > -65 >>> 0) {
             break label$10
            }
            $0_1 = $0_1 + 11 | 0;
            $3_1 = $0_1 & -8 | 0;
            $10_1 = HEAP32[(0 + 68132 | 0) >> 2] | 0;
            if (!$10_1) {
             break label$10
            }
            $6_1 = 0;
            label$28 : {
             if ($3_1 >>> 0 < 256 >>> 0) {
              break label$28
             }
             $6_1 = 31;
             if ($3_1 >>> 0 > 16777215 >>> 0) {
              break label$28
             }
             $0_1 = Math_clz32($0_1 >>> 8 | 0);
             $6_1 = ((($3_1 >>> (38 - $0_1 | 0) | 0) & 1 | 0) - ($0_1 << 1 | 0) | 0) + 62 | 0;
            }
            $4_1 = 0 - $3_1 | 0;
            label$29 : {
             label$30 : {
              label$31 : {
               label$32 : {
                $5_1 = HEAP32[(($6_1 << 2 | 0) + 68432 | 0) >> 2] | 0;
                if ($5_1) {
                 break label$32
                }
                $0_1 = 0;
                $8_1 = 0;
                break label$31;
               }
               $0_1 = 0;
               $7_1 = $3_1 << (($6_1 | 0) == (31 | 0) ? 0 : 25 - ($6_1 >>> 1 | 0) | 0) | 0;
               $8_1 = 0;
               label$33 : while (1) {
                label$34 : {
                 $2_1 = ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                 if ($2_1 >>> 0 >= $4_1 >>> 0) {
                  break label$34
                 }
                 $4_1 = $2_1;
                 $8_1 = $5_1;
                 if ($4_1) {
                  break label$34
                 }
                 $4_1 = 0;
                 $8_1 = $5_1;
                 $0_1 = $5_1;
                 break label$30;
                }
                $2_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
                $11_1 = HEAP32[(($5_1 + (($7_1 >>> 29 | 0) & 4 | 0) | 0) + 16 | 0) >> 2] | 0;
                $0_1 = $2_1 ? (($2_1 | 0) == ($11_1 | 0) ? $0_1 : $2_1) : $0_1;
                $7_1 = $7_1 << 1 | 0;
                $5_1 = $11_1;
                if ($5_1) {
                 continue label$33
                }
                break label$33;
               };
              }
              label$35 : {
               if ($0_1 | $8_1 | 0) {
                break label$35
               }
               $8_1 = 0;
               $0_1 = 2 << $6_1 | 0;
               $0_1 = ($0_1 | (0 - $0_1 | 0) | 0) & $10_1 | 0;
               if (!$0_1) {
                break label$10
               }
               $0_1 = HEAP32[(((__wasm_ctz_i32($0_1 | 0) | 0) << 2 | 0) + 68432 | 0) >> 2] | 0;
              }
              if (!$0_1) {
               break label$29
              }
             }
             label$36 : while (1) {
              $2_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
              $7_1 = $2_1 >>> 0 < $4_1 >>> 0;
              label$37 : {
               $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
               if ($5_1) {
                break label$37
               }
               $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
              }
              $4_1 = $7_1 ? $2_1 : $4_1;
              $8_1 = $7_1 ? $0_1 : $8_1;
              $0_1 = $5_1;
              if ($0_1) {
               continue label$36
              }
              break label$36;
             };
            }
            if (!$8_1) {
             break label$10
            }
            if ($4_1 >>> 0 >= ((HEAP32[(0 + 68136 | 0) >> 2] | 0) - $3_1 | 0) >>> 0) {
             break label$10
            }
            $11_1 = HEAP32[($8_1 + 24 | 0) >> 2] | 0;
            label$38 : {
             $0_1 = HEAP32[($8_1 + 12 | 0) >> 2] | 0;
             if (($0_1 | 0) == ($8_1 | 0)) {
              break label$38
             }
             $5_1 = HEAP32[($8_1 + 8 | 0) >> 2] | 0;
             HEAP32[(0 + 68144 | 0) >> 2] | 0;
             HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
             HEAP32[($0_1 + 8 | 0) >> 2] = $5_1;
             break label$3;
            }
            label$39 : {
             label$40 : {
              $5_1 = HEAP32[($8_1 + 20 | 0) >> 2] | 0;
              if (!$5_1) {
               break label$40
              }
              $7_1 = $8_1 + 20 | 0;
              break label$39;
             }
             $5_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
             if (!$5_1) {
              break label$8
             }
             $7_1 = $8_1 + 16 | 0;
            }
            label$41 : while (1) {
             $2_1 = $7_1;
             $0_1 = $5_1;
             $7_1 = $0_1 + 20 | 0;
             $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
             if ($5_1) {
              continue label$41
             }
             $7_1 = $0_1 + 16 | 0;
             $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
             if ($5_1) {
              continue label$41
             }
             break label$41;
            };
            HEAP32[$2_1 >> 2] = 0;
            break label$3;
           }
           label$42 : {
            $0_1 = HEAP32[(0 + 68136 | 0) >> 2] | 0;
            if ($0_1 >>> 0 < $3_1 >>> 0) {
             break label$42
            }
            $4_1 = HEAP32[(0 + 68148 | 0) >> 2] | 0;
            label$43 : {
             label$44 : {
              $5_1 = $0_1 - $3_1 | 0;
              if ($5_1 >>> 0 < 16 >>> 0) {
               break label$44
              }
              $7_1 = $4_1 + $3_1 | 0;
              HEAP32[($7_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
              HEAP32[($4_1 + $0_1 | 0) >> 2] = $5_1;
              HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
              break label$43;
             }
             HEAP32[($4_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
             $0_1 = $4_1 + $0_1 | 0;
             HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
             $7_1 = 0;
             $5_1 = 0;
            }
            HEAP32[(0 + 68136 | 0) >> 2] = $5_1;
            HEAP32[(0 + 68148 | 0) >> 2] = $7_1;
            $0_1 = $4_1 + 8 | 0;
            break label$1;
           }
           label$45 : {
            $7_1 = HEAP32[(0 + 68140 | 0) >> 2] | 0;
            if ($7_1 >>> 0 <= $3_1 >>> 0) {
             break label$45
            }
            $4_1 = $7_1 - $3_1 | 0;
            HEAP32[(0 + 68140 | 0) >> 2] = $4_1;
            $0_1 = HEAP32[(0 + 68152 | 0) >> 2] | 0;
            $5_1 = $0_1 + $3_1 | 0;
            HEAP32[(0 + 68152 | 0) >> 2] = $5_1;
            HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
            HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
            $0_1 = $0_1 + 8 | 0;
            break label$1;
           }
           label$46 : {
            label$47 : {
             if (!(HEAP32[(0 + 68600 | 0) >> 2] | 0)) {
              break label$47
             }
             $4_1 = HEAP32[(0 + 68608 | 0) >> 2] | 0;
             break label$46;
            }
            i64toi32_i32$1 = 0;
            i64toi32_i32$0 = -1;
            HEAP32[(i64toi32_i32$1 + 68612 | 0) >> 2] = -1;
            HEAP32[(i64toi32_i32$1 + 68616 | 0) >> 2] = i64toi32_i32$0;
            i64toi32_i32$1 = 0;
            i64toi32_i32$0 = 4096;
            HEAP32[(i64toi32_i32$1 + 68604 | 0) >> 2] = 4096;
            HEAP32[(i64toi32_i32$1 + 68608 | 0) >> 2] = i64toi32_i32$0;
            HEAP32[(0 + 68600 | 0) >> 2] = (($1_1 + 12 | 0) & -16 | 0) ^ 1431655768 | 0;
            HEAP32[(0 + 68620 | 0) >> 2] = 0;
            HEAP32[(0 + 68572 | 0) >> 2] = 0;
            $4_1 = 4096;
           }
           $0_1 = 0;
           $6_1 = $3_1 + 47 | 0;
           $2_1 = $4_1 + $6_1 | 0;
           $11_1 = 0 - $4_1 | 0;
           $8_1 = $2_1 & $11_1 | 0;
           if ($8_1 >>> 0 <= $3_1 >>> 0) {
            break label$1
           }
           $0_1 = 0;
           label$48 : {
            $4_1 = HEAP32[(0 + 68568 | 0) >> 2] | 0;
            if (!$4_1) {
             break label$48
            }
            $5_1 = HEAP32[(0 + 68560 | 0) >> 2] | 0;
            $10_1 = $5_1 + $8_1 | 0;
            if ($10_1 >>> 0 <= $5_1 >>> 0) {
             break label$1
            }
            if ($10_1 >>> 0 > $4_1 >>> 0) {
             break label$1
            }
           }
           label$49 : {
            label$50 : {
             if ((HEAPU8[(0 + 68572 | 0) >> 0] | 0) & 4 | 0) {
              break label$50
             }
             label$51 : {
              label$52 : {
               label$53 : {
                label$54 : {
                 label$55 : {
                  $4_1 = HEAP32[(0 + 68152 | 0) >> 2] | 0;
                  if (!$4_1) {
                   break label$55
                  }
                  $0_1 = 68576;
                  label$56 : while (1) {
                   label$57 : {
                    $5_1 = HEAP32[$0_1 >> 2] | 0;
                    if ($5_1 >>> 0 > $4_1 >>> 0) {
                     break label$57
                    }
                    if (($5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0) >>> 0 > $4_1 >>> 0) {
                     break label$54
                    }
                   }
                   $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
                   if ($0_1) {
                    continue label$56
                   }
                   break label$56;
                  };
                 }
                 $7_1 = $134(0 | 0) | 0;
                 if (($7_1 | 0) == (-1 | 0)) {
                  break label$51
                 }
                 $2_1 = $8_1;
                 label$58 : {
                  $0_1 = HEAP32[(0 + 68604 | 0) >> 2] | 0;
                  $4_1 = $0_1 + -1 | 0;
                  if (!($4_1 & $7_1 | 0)) {
                   break label$58
                  }
                  $2_1 = ($8_1 - $7_1 | 0) + (($4_1 + $7_1 | 0) & (0 - $0_1 | 0) | 0) | 0;
                 }
                 if ($2_1 >>> 0 <= $3_1 >>> 0) {
                  break label$51
                 }
                 label$59 : {
                  $0_1 = HEAP32[(0 + 68568 | 0) >> 2] | 0;
                  if (!$0_1) {
                   break label$59
                  }
                  $4_1 = HEAP32[(0 + 68560 | 0) >> 2] | 0;
                  $5_1 = $4_1 + $2_1 | 0;
                  if ($5_1 >>> 0 <= $4_1 >>> 0) {
                   break label$51
                  }
                  if ($5_1 >>> 0 > $0_1 >>> 0) {
                   break label$51
                  }
                 }
                 $0_1 = $134($2_1 | 0) | 0;
                 if (($0_1 | 0) != ($7_1 | 0)) {
                  break label$53
                 }
                 break label$49;
                }
                $2_1 = ($2_1 - $7_1 | 0) & $11_1 | 0;
                $7_1 = $134($2_1 | 0) | 0;
                if (($7_1 | 0) == ((HEAP32[$0_1 >> 2] | 0) + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0 | 0)) {
                 break label$52
                }
                $0_1 = $7_1;
               }
               if (($0_1 | 0) == (-1 | 0)) {
                break label$51
               }
               label$60 : {
                if ($2_1 >>> 0 < ($3_1 + 48 | 0) >>> 0) {
                 break label$60
                }
                $7_1 = $0_1;
                break label$49;
               }
               $4_1 = HEAP32[(0 + 68608 | 0) >> 2] | 0;
               $4_1 = (($6_1 - $2_1 | 0) + $4_1 | 0) & (0 - $4_1 | 0) | 0;
               if (($134($4_1 | 0) | 0 | 0) == (-1 | 0)) {
                break label$51
               }
               $2_1 = $4_1 + $2_1 | 0;
               $7_1 = $0_1;
               break label$49;
              }
              if (($7_1 | 0) != (-1 | 0)) {
               break label$49
              }
             }
             HEAP32[(0 + 68572 | 0) >> 2] = HEAP32[(0 + 68572 | 0) >> 2] | 0 | 4 | 0;
            }
            $7_1 = $134($8_1 | 0) | 0;
            $0_1 = $134(0 | 0) | 0;
            if (($7_1 | 0) == (-1 | 0)) {
             break label$5
            }
            if (($0_1 | 0) == (-1 | 0)) {
             break label$5
            }
            if ($7_1 >>> 0 >= $0_1 >>> 0) {
             break label$5
            }
            $2_1 = $0_1 - $7_1 | 0;
            if ($2_1 >>> 0 <= ($3_1 + 40 | 0) >>> 0) {
             break label$5
            }
           }
           $0_1 = (HEAP32[(0 + 68560 | 0) >> 2] | 0) + $2_1 | 0;
           HEAP32[(0 + 68560 | 0) >> 2] = $0_1;
           label$61 : {
            if ($0_1 >>> 0 <= (HEAP32[(0 + 68564 | 0) >> 2] | 0) >>> 0) {
             break label$61
            }
            HEAP32[(0 + 68564 | 0) >> 2] = $0_1;
           }
           label$62 : {
            label$63 : {
             $4_1 = HEAP32[(0 + 68152 | 0) >> 2] | 0;
             if (!$4_1) {
              break label$63
             }
             $0_1 = 68576;
             label$64 : while (1) {
              $5_1 = HEAP32[$0_1 >> 2] | 0;
              $8_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
              if (($7_1 | 0) == ($5_1 + $8_1 | 0 | 0)) {
               break label$62
              }
              $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
              if ($0_1) {
               continue label$64
              }
              break label$7;
             };
            }
            label$65 : {
             label$66 : {
              $0_1 = HEAP32[(0 + 68144 | 0) >> 2] | 0;
              if (!$0_1) {
               break label$66
              }
              if ($7_1 >>> 0 >= $0_1 >>> 0) {
               break label$65
              }
             }
             HEAP32[(0 + 68144 | 0) >> 2] = $7_1;
            }
            $0_1 = 0;
            HEAP32[(0 + 68580 | 0) >> 2] = $2_1;
            HEAP32[(0 + 68576 | 0) >> 2] = $7_1;
            HEAP32[(0 + 68160 | 0) >> 2] = -1;
            HEAP32[(0 + 68164 | 0) >> 2] = HEAP32[(0 + 68600 | 0) >> 2] | 0;
            HEAP32[(0 + 68588 | 0) >> 2] = 0;
            label$67 : while (1) {
             $4_1 = $0_1 << 3 | 0;
             $5_1 = $4_1 + 68168 | 0;
             HEAP32[($4_1 + 68176 | 0) >> 2] = $5_1;
             HEAP32[($4_1 + 68180 | 0) >> 2] = $5_1;
             $0_1 = $0_1 + 1 | 0;
             if (($0_1 | 0) != (32 | 0)) {
              continue label$67
             }
             break label$67;
            };
            $0_1 = $2_1 + -40 | 0;
            $4_1 = (-8 - $7_1 | 0) & 7 | 0;
            $5_1 = $0_1 - $4_1 | 0;
            HEAP32[(0 + 68140 | 0) >> 2] = $5_1;
            $4_1 = $7_1 + $4_1 | 0;
            HEAP32[(0 + 68152 | 0) >> 2] = $4_1;
            HEAP32[($4_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
            HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
            HEAP32[(0 + 68156 | 0) >> 2] = HEAP32[(0 + 68616 | 0) >> 2] | 0;
            break label$6;
           }
           if ($4_1 >>> 0 >= $7_1 >>> 0) {
            break label$7
           }
           if ($4_1 >>> 0 < $5_1 >>> 0) {
            break label$7
           }
           if ((HEAP32[($0_1 + 12 | 0) >> 2] | 0) & 8 | 0) {
            break label$7
           }
           HEAP32[($0_1 + 4 | 0) >> 2] = $8_1 + $2_1 | 0;
           $0_1 = (-8 - $4_1 | 0) & 7 | 0;
           $5_1 = $4_1 + $0_1 | 0;
           HEAP32[(0 + 68152 | 0) >> 2] = $5_1;
           $7_1 = (HEAP32[(0 + 68140 | 0) >> 2] | 0) + $2_1 | 0;
           $0_1 = $7_1 - $0_1 | 0;
           HEAP32[(0 + 68140 | 0) >> 2] = $0_1;
           HEAP32[($5_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
           HEAP32[(($4_1 + $7_1 | 0) + 4 | 0) >> 2] = 40;
           HEAP32[(0 + 68156 | 0) >> 2] = HEAP32[(0 + 68616 | 0) >> 2] | 0;
           break label$6;
          }
          $0_1 = 0;
          break label$2;
         }
         $0_1 = 0;
         break label$3;
        }
        label$68 : {
         if ($7_1 >>> 0 >= (HEAP32[(0 + 68144 | 0) >> 2] | 0) >>> 0) {
          break label$68
         }
         HEAP32[(0 + 68144 | 0) >> 2] = $7_1;
        }
        $5_1 = $7_1 + $2_1 | 0;
        $0_1 = 68576;
        label$69 : {
         label$70 : {
          label$71 : while (1) {
           if ((HEAP32[$0_1 >> 2] | 0 | 0) == ($5_1 | 0)) {
            break label$70
           }
           $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           if ($0_1) {
            continue label$71
           }
           break label$69;
          };
         }
         if (!((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0)) {
          break label$4
         }
        }
        $0_1 = 68576;
        label$72 : {
         label$73 : while (1) {
          label$74 : {
           $5_1 = HEAP32[$0_1 >> 2] | 0;
           if ($5_1 >>> 0 > $4_1 >>> 0) {
            break label$74
           }
           $5_1 = $5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0;
           if ($5_1 >>> 0 > $4_1 >>> 0) {
            break label$72
           }
          }
          $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
          continue label$73;
         };
        }
        $0_1 = $2_1 + -40 | 0;
        $8_1 = (-8 - $7_1 | 0) & 7 | 0;
        $11_1 = $0_1 - $8_1 | 0;
        HEAP32[(0 + 68140 | 0) >> 2] = $11_1;
        $8_1 = $7_1 + $8_1 | 0;
        HEAP32[(0 + 68152 | 0) >> 2] = $8_1;
        HEAP32[($8_1 + 4 | 0) >> 2] = $11_1 | 1 | 0;
        HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
        HEAP32[(0 + 68156 | 0) >> 2] = HEAP32[(0 + 68616 | 0) >> 2] | 0;
        $0_1 = ($5_1 + ((39 - $5_1 | 0) & 7 | 0) | 0) + -47 | 0;
        $8_1 = $0_1 >>> 0 < ($4_1 + 16 | 0) >>> 0 ? $4_1 : $0_1;
        HEAP32[($8_1 + 4 | 0) >> 2] = 27;
        i64toi32_i32$2 = 0;
        i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 68584 | 0) >> 2] | 0;
        i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 68588 | 0) >> 2] | 0;
        $782 = i64toi32_i32$0;
        i64toi32_i32$0 = $8_1 + 16 | 0;
        HEAP32[i64toi32_i32$0 >> 2] = $782;
        HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
        i64toi32_i32$2 = 0;
        i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 68576 | 0) >> 2] | 0;
        i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 68580 | 0) >> 2] | 0;
        $784 = i64toi32_i32$1;
        i64toi32_i32$1 = $8_1;
        HEAP32[($8_1 + 8 | 0) >> 2] = $784;
        HEAP32[($8_1 + 12 | 0) >> 2] = i64toi32_i32$0;
        HEAP32[(0 + 68584 | 0) >> 2] = $8_1 + 8 | 0;
        HEAP32[(0 + 68580 | 0) >> 2] = $2_1;
        HEAP32[(0 + 68576 | 0) >> 2] = $7_1;
        HEAP32[(0 + 68588 | 0) >> 2] = 0;
        $0_1 = $8_1 + 24 | 0;
        label$75 : while (1) {
         HEAP32[($0_1 + 4 | 0) >> 2] = 7;
         $7_1 = $0_1 + 8 | 0;
         $0_1 = $0_1 + 4 | 0;
         if ($7_1 >>> 0 < $5_1 >>> 0) {
          continue label$75
         }
         break label$75;
        };
        if (($8_1 | 0) == ($4_1 | 0)) {
         break label$6
        }
        HEAP32[($8_1 + 4 | 0) >> 2] = (HEAP32[($8_1 + 4 | 0) >> 2] | 0) & -2 | 0;
        $7_1 = $8_1 - $4_1 | 0;
        HEAP32[($4_1 + 4 | 0) >> 2] = $7_1 | 1 | 0;
        HEAP32[$8_1 >> 2] = $7_1;
        label$76 : {
         label$77 : {
          if ($7_1 >>> 0 > 255 >>> 0) {
           break label$77
          }
          $0_1 = ($7_1 & -8 | 0) + 68168 | 0;
          label$78 : {
           label$79 : {
            $5_1 = HEAP32[(0 + 68128 | 0) >> 2] | 0;
            $7_1 = 1 << ($7_1 >>> 3 | 0) | 0;
            if ($5_1 & $7_1 | 0) {
             break label$79
            }
            HEAP32[(0 + 68128 | 0) >> 2] = $5_1 | $7_1 | 0;
            $5_1 = $0_1;
            break label$78;
           }
           $5_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
          }
          HEAP32[($0_1 + 8 | 0) >> 2] = $4_1;
          HEAP32[($5_1 + 12 | 0) >> 2] = $4_1;
          $7_1 = 12;
          $8_1 = 8;
          break label$76;
         }
         $0_1 = 31;
         label$80 : {
          if ($7_1 >>> 0 > 16777215 >>> 0) {
           break label$80
          }
          $0_1 = Math_clz32($7_1 >>> 8 | 0);
          $0_1 = ((($7_1 >>> (38 - $0_1 | 0) | 0) & 1 | 0) - ($0_1 << 1 | 0) | 0) + 62 | 0;
         }
         HEAP32[($4_1 + 28 | 0) >> 2] = $0_1;
         i64toi32_i32$1 = $4_1;
         i64toi32_i32$0 = 0;
         HEAP32[($4_1 + 16 | 0) >> 2] = 0;
         HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$0;
         $5_1 = ($0_1 << 2 | 0) + 68432 | 0;
         label$81 : {
          label$82 : {
           label$83 : {
            $8_1 = HEAP32[(0 + 68132 | 0) >> 2] | 0;
            $2_1 = 1 << $0_1 | 0;
            if ($8_1 & $2_1 | 0) {
             break label$83
            }
            HEAP32[(0 + 68132 | 0) >> 2] = $8_1 | $2_1 | 0;
            HEAP32[$5_1 >> 2] = $4_1;
            HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
            break label$82;
           }
           $0_1 = $7_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
           $8_1 = HEAP32[$5_1 >> 2] | 0;
           label$84 : while (1) {
            $5_1 = $8_1;
            if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($7_1 | 0)) {
             break label$81
            }
            $8_1 = $0_1 >>> 29 | 0;
            $0_1 = $0_1 << 1 | 0;
            $2_1 = ($5_1 + ($8_1 & 4 | 0) | 0) + 16 | 0;
            $8_1 = HEAP32[$2_1 >> 2] | 0;
            if ($8_1) {
             continue label$84
            }
            break label$84;
           };
           HEAP32[$2_1 >> 2] = $4_1;
           HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
          }
          $7_1 = 8;
          $8_1 = 12;
          $5_1 = $4_1;
          $0_1 = $4_1;
          break label$76;
         }
         $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
         HEAP32[($0_1 + 12 | 0) >> 2] = $4_1;
         HEAP32[($5_1 + 8 | 0) >> 2] = $4_1;
         HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
         $0_1 = 0;
         $7_1 = 24;
         $8_1 = 12;
        }
        HEAP32[($4_1 + $8_1 | 0) >> 2] = $5_1;
        HEAP32[($4_1 + $7_1 | 0) >> 2] = $0_1;
       }
       $0_1 = HEAP32[(0 + 68140 | 0) >> 2] | 0;
       if ($0_1 >>> 0 <= $3_1 >>> 0) {
        break label$5
       }
       $4_1 = $0_1 - $3_1 | 0;
       HEAP32[(0 + 68140 | 0) >> 2] = $4_1;
       $0_1 = HEAP32[(0 + 68152 | 0) >> 2] | 0;
       $5_1 = $0_1 + $3_1 | 0;
       HEAP32[(0 + 68152 | 0) >> 2] = $5_1;
       HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
       HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
       $0_1 = $0_1 + 8 | 0;
       break label$1;
      }
      HEAP32[($106() | 0) >> 2] = 48;
      $0_1 = 0;
      break label$1;
     }
     HEAP32[$0_1 >> 2] = $7_1;
     HEAP32[($0_1 + 4 | 0) >> 2] = (HEAP32[($0_1 + 4 | 0) >> 2] | 0) + $2_1 | 0;
     $0_1 = $136($7_1 | 0, $5_1 | 0, $3_1 | 0) | 0;
     break label$1;
    }
    label$85 : {
     if (!$11_1) {
      break label$85
     }
     label$86 : {
      label$87 : {
       $7_1 = HEAP32[($8_1 + 28 | 0) >> 2] | 0;
       $5_1 = ($7_1 << 2 | 0) + 68432 | 0;
       if (($8_1 | 0) != (HEAP32[$5_1 >> 2] | 0 | 0)) {
        break label$87
       }
       HEAP32[$5_1 >> 2] = $0_1;
       if ($0_1) {
        break label$86
       }
       $10_1 = $10_1 & (__wasm_rotl_i32(-2 | 0, $7_1 | 0) | 0) | 0;
       HEAP32[(0 + 68132 | 0) >> 2] = $10_1;
       break label$85;
      }
      HEAP32[($11_1 + ((HEAP32[($11_1 + 16 | 0) >> 2] | 0 | 0) == ($8_1 | 0) ? 16 : 20) | 0) >> 2] = $0_1;
      if (!$0_1) {
       break label$85
      }
     }
     HEAP32[($0_1 + 24 | 0) >> 2] = $11_1;
     label$88 : {
      $5_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
      if (!$5_1) {
       break label$88
      }
      HEAP32[($0_1 + 16 | 0) >> 2] = $5_1;
      HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
     }
     $5_1 = HEAP32[($8_1 + 20 | 0) >> 2] | 0;
     if (!$5_1) {
      break label$85
     }
     HEAP32[($0_1 + 20 | 0) >> 2] = $5_1;
     HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
    }
    label$89 : {
     label$90 : {
      if ($4_1 >>> 0 > 15 >>> 0) {
       break label$90
      }
      $0_1 = $4_1 + $3_1 | 0;
      HEAP32[($8_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
      $0_1 = $8_1 + $0_1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
      break label$89;
     }
     HEAP32[($8_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
     $7_1 = $8_1 + $3_1 | 0;
     HEAP32[($7_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
     HEAP32[($7_1 + $4_1 | 0) >> 2] = $4_1;
     label$91 : {
      if ($4_1 >>> 0 > 255 >>> 0) {
       break label$91
      }
      $0_1 = ($4_1 & -8 | 0) + 68168 | 0;
      label$92 : {
       label$93 : {
        $3_1 = HEAP32[(0 + 68128 | 0) >> 2] | 0;
        $4_1 = 1 << ($4_1 >>> 3 | 0) | 0;
        if ($3_1 & $4_1 | 0) {
         break label$93
        }
        HEAP32[(0 + 68128 | 0) >> 2] = $3_1 | $4_1 | 0;
        $4_1 = $0_1;
        break label$92;
       }
       $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
      }
      HEAP32[($0_1 + 8 | 0) >> 2] = $7_1;
      HEAP32[($4_1 + 12 | 0) >> 2] = $7_1;
      HEAP32[($7_1 + 12 | 0) >> 2] = $0_1;
      HEAP32[($7_1 + 8 | 0) >> 2] = $4_1;
      break label$89;
     }
     $0_1 = 31;
     label$94 : {
      if ($4_1 >>> 0 > 16777215 >>> 0) {
       break label$94
      }
      $0_1 = Math_clz32($4_1 >>> 8 | 0);
      $0_1 = ((($4_1 >>> (38 - $0_1 | 0) | 0) & 1 | 0) - ($0_1 << 1 | 0) | 0) + 62 | 0;
     }
     HEAP32[($7_1 + 28 | 0) >> 2] = $0_1;
     i64toi32_i32$1 = $7_1;
     i64toi32_i32$0 = 0;
     HEAP32[($7_1 + 16 | 0) >> 2] = 0;
     HEAP32[($7_1 + 20 | 0) >> 2] = i64toi32_i32$0;
     $3_1 = ($0_1 << 2 | 0) + 68432 | 0;
     label$95 : {
      label$96 : {
       label$97 : {
        $5_1 = 1 << $0_1 | 0;
        if ($10_1 & $5_1 | 0) {
         break label$97
        }
        HEAP32[(0 + 68132 | 0) >> 2] = $10_1 | $5_1 | 0;
        HEAP32[$3_1 >> 2] = $7_1;
        HEAP32[($7_1 + 24 | 0) >> 2] = $3_1;
        break label$96;
       }
       $0_1 = $4_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
       $5_1 = HEAP32[$3_1 >> 2] | 0;
       label$98 : while (1) {
        $3_1 = $5_1;
        if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($4_1 | 0)) {
         break label$95
        }
        $5_1 = $0_1 >>> 29 | 0;
        $0_1 = $0_1 << 1 | 0;
        $2_1 = ($3_1 + ($5_1 & 4 | 0) | 0) + 16 | 0;
        $5_1 = HEAP32[$2_1 >> 2] | 0;
        if ($5_1) {
         continue label$98
        }
        break label$98;
       };
       HEAP32[$2_1 >> 2] = $7_1;
       HEAP32[($7_1 + 24 | 0) >> 2] = $3_1;
      }
      HEAP32[($7_1 + 12 | 0) >> 2] = $7_1;
      HEAP32[($7_1 + 8 | 0) >> 2] = $7_1;
      break label$89;
     }
     $0_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
     HEAP32[($0_1 + 12 | 0) >> 2] = $7_1;
     HEAP32[($3_1 + 8 | 0) >> 2] = $7_1;
     HEAP32[($7_1 + 24 | 0) >> 2] = 0;
     HEAP32[($7_1 + 12 | 0) >> 2] = $3_1;
     HEAP32[($7_1 + 8 | 0) >> 2] = $0_1;
    }
    $0_1 = $8_1 + 8 | 0;
    break label$1;
   }
   label$99 : {
    if (!$10_1) {
     break label$99
    }
    label$100 : {
     label$101 : {
      $8_1 = HEAP32[($7_1 + 28 | 0) >> 2] | 0;
      $5_1 = ($8_1 << 2 | 0) + 68432 | 0;
      if (($7_1 | 0) != (HEAP32[$5_1 >> 2] | 0 | 0)) {
       break label$101
      }
      HEAP32[$5_1 >> 2] = $0_1;
      if ($0_1) {
       break label$100
      }
      HEAP32[(0 + 68132 | 0) >> 2] = $9_1 & (__wasm_rotl_i32(-2 | 0, $8_1 | 0) | 0) | 0;
      break label$99;
     }
     HEAP32[($10_1 + ((HEAP32[($10_1 + 16 | 0) >> 2] | 0 | 0) == ($7_1 | 0) ? 16 : 20) | 0) >> 2] = $0_1;
     if (!$0_1) {
      break label$99
     }
    }
    HEAP32[($0_1 + 24 | 0) >> 2] = $10_1;
    label$102 : {
     $5_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
     if (!$5_1) {
      break label$102
     }
     HEAP32[($0_1 + 16 | 0) >> 2] = $5_1;
     HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
    }
    $5_1 = HEAP32[($7_1 + 20 | 0) >> 2] | 0;
    if (!$5_1) {
     break label$99
    }
    HEAP32[($0_1 + 20 | 0) >> 2] = $5_1;
    HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
   }
   label$103 : {
    label$104 : {
     if ($4_1 >>> 0 > 15 >>> 0) {
      break label$104
     }
     $0_1 = $4_1 + $3_1 | 0;
     HEAP32[($7_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
     $0_1 = $7_1 + $0_1 | 0;
     HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
     break label$103;
    }
    HEAP32[($7_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
    $3_1 = $7_1 + $3_1 | 0;
    HEAP32[($3_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
    HEAP32[($3_1 + $4_1 | 0) >> 2] = $4_1;
    label$105 : {
     if (!$6_1) {
      break label$105
     }
     $5_1 = ($6_1 & -8 | 0) + 68168 | 0;
     $0_1 = HEAP32[(0 + 68148 | 0) >> 2] | 0;
     label$106 : {
      label$107 : {
       $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
       if ($8_1 & $2_1 | 0) {
        break label$107
       }
       HEAP32[(0 + 68128 | 0) >> 2] = $8_1 | $2_1 | 0;
       $8_1 = $5_1;
       break label$106;
      }
      $8_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
     }
     HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
     HEAP32[($8_1 + 12 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 12 | 0) >> 2] = $5_1;
     HEAP32[($0_1 + 8 | 0) >> 2] = $8_1;
    }
    HEAP32[(0 + 68148 | 0) >> 2] = $3_1;
    HEAP32[(0 + 68136 | 0) >> 2] = $4_1;
   }
   $0_1 = $7_1 + 8 | 0;
  }
  global$0 = $1_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $136($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $5_1 = 0, $7_1 = 0, $8_1 = 0, $9_1 = 0, $3_1 = 0, $6_1 = 0;
  $3_1 = $0_1 + ((-8 - $0_1 | 0) & 7 | 0) | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 | 3 | 0;
  $4_1 = $1_1 + ((-8 - $1_1 | 0) & 7 | 0) | 0;
  $5_1 = $3_1 + $2_1 | 0;
  $0_1 = $4_1 - $5_1 | 0;
  label$1 : {
   label$2 : {
    if (($4_1 | 0) != (HEAP32[(0 + 68152 | 0) >> 2] | 0 | 0)) {
     break label$2
    }
    HEAP32[(0 + 68152 | 0) >> 2] = $5_1;
    $2_1 = (HEAP32[(0 + 68140 | 0) >> 2] | 0) + $0_1 | 0;
    HEAP32[(0 + 68140 | 0) >> 2] = $2_1;
    HEAP32[($5_1 + 4 | 0) >> 2] = $2_1 | 1 | 0;
    break label$1;
   }
   label$3 : {
    if (($4_1 | 0) != (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
     break label$3
    }
    HEAP32[(0 + 68148 | 0) >> 2] = $5_1;
    $2_1 = (HEAP32[(0 + 68136 | 0) >> 2] | 0) + $0_1 | 0;
    HEAP32[(0 + 68136 | 0) >> 2] = $2_1;
    HEAP32[($5_1 + 4 | 0) >> 2] = $2_1 | 1 | 0;
    HEAP32[($5_1 + $2_1 | 0) >> 2] = $2_1;
    break label$1;
   }
   label$4 : {
    $1_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
    if (($1_1 & 3 | 0 | 0) != (1 | 0)) {
     break label$4
    }
    $6_1 = $1_1 & -8 | 0;
    $2_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
    label$5 : {
     label$6 : {
      if ($1_1 >>> 0 > 255 >>> 0) {
       break label$6
      }
      $7_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
      $8_1 = $1_1 >>> 3 | 0;
      $1_1 = ($8_1 << 3 | 0) + 68168 | 0;
      label$7 : {
       if (($2_1 | 0) != ($7_1 | 0)) {
        break label$7
       }
       HEAP32[(0 + 68128 | 0) >> 2] = (HEAP32[(0 + 68128 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $8_1 | 0) | 0) | 0;
       break label$5;
      }
      HEAP32[($7_1 + 12 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 8 | 0) >> 2] = $7_1;
      break label$5;
     }
     $9_1 = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
     label$8 : {
      label$9 : {
       if (($2_1 | 0) == ($4_1 | 0)) {
        break label$9
       }
       $1_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
       HEAP32[(0 + 68144 | 0) >> 2] | 0;
       HEAP32[($1_1 + 12 | 0) >> 2] = $2_1;
       HEAP32[($2_1 + 8 | 0) >> 2] = $1_1;
       break label$8;
      }
      label$10 : {
       label$11 : {
        label$12 : {
         $1_1 = HEAP32[($4_1 + 20 | 0) >> 2] | 0;
         if (!$1_1) {
          break label$12
         }
         $7_1 = $4_1 + 20 | 0;
         break label$11;
        }
        $1_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
        if (!$1_1) {
         break label$10
        }
        $7_1 = $4_1 + 16 | 0;
       }
       label$13 : while (1) {
        $8_1 = $7_1;
        $2_1 = $1_1;
        $7_1 = $2_1 + 20 | 0;
        $1_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
        if ($1_1) {
         continue label$13
        }
        $7_1 = $2_1 + 16 | 0;
        $1_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
        if ($1_1) {
         continue label$13
        }
        break label$13;
       };
       HEAP32[$8_1 >> 2] = 0;
       break label$8;
      }
      $2_1 = 0;
     }
     if (!$9_1) {
      break label$5
     }
     label$14 : {
      label$15 : {
       $7_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
       $1_1 = ($7_1 << 2 | 0) + 68432 | 0;
       if (($4_1 | 0) != (HEAP32[$1_1 >> 2] | 0 | 0)) {
        break label$15
       }
       HEAP32[$1_1 >> 2] = $2_1;
       if ($2_1) {
        break label$14
       }
       HEAP32[(0 + 68132 | 0) >> 2] = (HEAP32[(0 + 68132 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $7_1 | 0) | 0) | 0;
       break label$5;
      }
      HEAP32[($9_1 + ((HEAP32[($9_1 + 16 | 0) >> 2] | 0 | 0) == ($4_1 | 0) ? 16 : 20) | 0) >> 2] = $2_1;
      if (!$2_1) {
       break label$5
      }
     }
     HEAP32[($2_1 + 24 | 0) >> 2] = $9_1;
     label$16 : {
      $1_1 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
      if (!$1_1) {
       break label$16
      }
      HEAP32[($2_1 + 16 | 0) >> 2] = $1_1;
      HEAP32[($1_1 + 24 | 0) >> 2] = $2_1;
     }
     $1_1 = HEAP32[($4_1 + 20 | 0) >> 2] | 0;
     if (!$1_1) {
      break label$5
     }
     HEAP32[($2_1 + 20 | 0) >> 2] = $1_1;
     HEAP32[($1_1 + 24 | 0) >> 2] = $2_1;
    }
    $0_1 = $6_1 + $0_1 | 0;
    $4_1 = $4_1 + $6_1 | 0;
    $1_1 = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
   }
   HEAP32[($4_1 + 4 | 0) >> 2] = $1_1 & -2 | 0;
   HEAP32[($5_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
   HEAP32[($5_1 + $0_1 | 0) >> 2] = $0_1;
   label$17 : {
    if ($0_1 >>> 0 > 255 >>> 0) {
     break label$17
    }
    $2_1 = ($0_1 & -8 | 0) + 68168 | 0;
    label$18 : {
     label$19 : {
      $1_1 = HEAP32[(0 + 68128 | 0) >> 2] | 0;
      $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
      if ($1_1 & $0_1 | 0) {
       break label$19
      }
      HEAP32[(0 + 68128 | 0) >> 2] = $1_1 | $0_1 | 0;
      $0_1 = $2_1;
      break label$18;
     }
     $0_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
    }
    HEAP32[($2_1 + 8 | 0) >> 2] = $5_1;
    HEAP32[($0_1 + 12 | 0) >> 2] = $5_1;
    HEAP32[($5_1 + 12 | 0) >> 2] = $2_1;
    HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
    break label$1;
   }
   $2_1 = 31;
   label$20 : {
    if ($0_1 >>> 0 > 16777215 >>> 0) {
     break label$20
    }
    $2_1 = Math_clz32($0_1 >>> 8 | 0);
    $2_1 = ((($0_1 >>> (38 - $2_1 | 0) | 0) & 1 | 0) - ($2_1 << 1 | 0) | 0) + 62 | 0;
   }
   HEAP32[($5_1 + 28 | 0) >> 2] = $2_1;
   HEAP32[($5_1 + 16 | 0) >> 2] = 0;
   HEAP32[($5_1 + 20 | 0) >> 2] = 0;
   $1_1 = ($2_1 << 2 | 0) + 68432 | 0;
   label$21 : {
    label$22 : {
     label$23 : {
      $7_1 = HEAP32[(0 + 68132 | 0) >> 2] | 0;
      $4_1 = 1 << $2_1 | 0;
      if ($7_1 & $4_1 | 0) {
       break label$23
      }
      HEAP32[(0 + 68132 | 0) >> 2] = $7_1 | $4_1 | 0;
      HEAP32[$1_1 >> 2] = $5_1;
      HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
      break label$22;
     }
     $2_1 = $0_1 << (($2_1 | 0) == (31 | 0) ? 0 : 25 - ($2_1 >>> 1 | 0) | 0) | 0;
     $7_1 = HEAP32[$1_1 >> 2] | 0;
     label$24 : while (1) {
      $1_1 = $7_1;
      if (((HEAP32[($1_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
       break label$21
      }
      $7_1 = $2_1 >>> 29 | 0;
      $2_1 = $2_1 << 1 | 0;
      $4_1 = ($1_1 + ($7_1 & 4 | 0) | 0) + 16 | 0;
      $7_1 = HEAP32[$4_1 >> 2] | 0;
      if ($7_1) {
       continue label$24
      }
      break label$24;
     };
     HEAP32[$4_1 >> 2] = $5_1;
     HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
    }
    HEAP32[($5_1 + 12 | 0) >> 2] = $5_1;
    HEAP32[($5_1 + 8 | 0) >> 2] = $5_1;
    break label$1;
   }
   $2_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
   HEAP32[($2_1 + 12 | 0) >> 2] = $5_1;
   HEAP32[($1_1 + 8 | 0) >> 2] = $5_1;
   HEAP32[($5_1 + 24 | 0) >> 2] = 0;
   HEAP32[($5_1 + 12 | 0) >> 2] = $1_1;
   HEAP32[($5_1 + 8 | 0) >> 2] = $2_1;
  }
  return $3_1 + 8 | 0 | 0;
 }
 
 function $137($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $2_1 = 0, $1_1 = 0, $5_1 = 0, $3_1 = 0, $6_1 = 0, $7_1 = 0;
  label$1 : {
   if (!$0_1) {
    break label$1
   }
   $1_1 = $0_1 + -8 | 0;
   $2_1 = HEAP32[($0_1 + -4 | 0) >> 2] | 0;
   $0_1 = $2_1 & -8 | 0;
   $3_1 = $1_1 + $0_1 | 0;
   label$2 : {
    if ($2_1 & 1 | 0) {
     break label$2
    }
    if (!($2_1 & 2 | 0)) {
     break label$1
    }
    $4_1 = HEAP32[$1_1 >> 2] | 0;
    $1_1 = $1_1 - $4_1 | 0;
    $5_1 = HEAP32[(0 + 68144 | 0) >> 2] | 0;
    if ($1_1 >>> 0 < $5_1 >>> 0) {
     break label$1
    }
    $0_1 = $4_1 + $0_1 | 0;
    label$3 : {
     label$4 : {
      label$5 : {
       if (($1_1 | 0) == (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
        break label$5
       }
       $2_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
       label$6 : {
        if ($4_1 >>> 0 > 255 >>> 0) {
         break label$6
        }
        $5_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
        $6_1 = $4_1 >>> 3 | 0;
        $4_1 = ($6_1 << 3 | 0) + 68168 | 0;
        label$7 : {
         if (($2_1 | 0) != ($5_1 | 0)) {
          break label$7
         }
         HEAP32[(0 + 68128 | 0) >> 2] = (HEAP32[(0 + 68128 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $6_1 | 0) | 0) | 0;
         break label$2;
        }
        HEAP32[($5_1 + 12 | 0) >> 2] = $2_1;
        HEAP32[($2_1 + 8 | 0) >> 2] = $5_1;
        break label$2;
       }
       $7_1 = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
       label$8 : {
        if (($2_1 | 0) == ($1_1 | 0)) {
         break label$8
        }
        $4_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
        HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
        HEAP32[($2_1 + 8 | 0) >> 2] = $4_1;
        break label$3;
       }
       label$9 : {
        label$10 : {
         $4_1 = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
         if (!$4_1) {
          break label$10
         }
         $5_1 = $1_1 + 20 | 0;
         break label$9;
        }
        $4_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
        if (!$4_1) {
         break label$4
        }
        $5_1 = $1_1 + 16 | 0;
       }
       label$11 : while (1) {
        $6_1 = $5_1;
        $2_1 = $4_1;
        $5_1 = $2_1 + 20 | 0;
        $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
        if ($4_1) {
         continue label$11
        }
        $5_1 = $2_1 + 16 | 0;
        $4_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
        if ($4_1) {
         continue label$11
        }
        break label$11;
       };
       HEAP32[$6_1 >> 2] = 0;
       break label$3;
      }
      $2_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
      if (($2_1 & 3 | 0 | 0) != (3 | 0)) {
       break label$2
      }
      HEAP32[(0 + 68136 | 0) >> 2] = $0_1;
      HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 & -2 | 0;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      HEAP32[$3_1 >> 2] = $0_1;
      return;
     }
     $2_1 = 0;
    }
    if (!$7_1) {
     break label$2
    }
    label$12 : {
     label$13 : {
      $5_1 = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
      $4_1 = ($5_1 << 2 | 0) + 68432 | 0;
      if (($1_1 | 0) != (HEAP32[$4_1 >> 2] | 0 | 0)) {
       break label$13
      }
      HEAP32[$4_1 >> 2] = $2_1;
      if ($2_1) {
       break label$12
      }
      HEAP32[(0 + 68132 | 0) >> 2] = (HEAP32[(0 + 68132 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
      break label$2;
     }
     HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($1_1 | 0) ? 16 : 20) | 0) >> 2] = $2_1;
     if (!$2_1) {
      break label$2
     }
    }
    HEAP32[($2_1 + 24 | 0) >> 2] = $7_1;
    label$14 : {
     $4_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
     if (!$4_1) {
      break label$14
     }
     HEAP32[($2_1 + 16 | 0) >> 2] = $4_1;
     HEAP32[($4_1 + 24 | 0) >> 2] = $2_1;
    }
    $4_1 = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
    if (!$4_1) {
     break label$2
    }
    HEAP32[($2_1 + 20 | 0) >> 2] = $4_1;
    HEAP32[($4_1 + 24 | 0) >> 2] = $2_1;
   }
   if ($1_1 >>> 0 >= $3_1 >>> 0) {
    break label$1
   }
   $4_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
   if (!($4_1 & 1 | 0)) {
    break label$1
   }
   label$15 : {
    label$16 : {
     label$17 : {
      label$18 : {
       label$19 : {
        if ($4_1 & 2 | 0) {
         break label$19
        }
        label$20 : {
         if (($3_1 | 0) != (HEAP32[(0 + 68152 | 0) >> 2] | 0 | 0)) {
          break label$20
         }
         HEAP32[(0 + 68152 | 0) >> 2] = $1_1;
         $0_1 = (HEAP32[(0 + 68140 | 0) >> 2] | 0) + $0_1 | 0;
         HEAP32[(0 + 68140 | 0) >> 2] = $0_1;
         HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
         if (($1_1 | 0) != (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
          break label$1
         }
         HEAP32[(0 + 68136 | 0) >> 2] = 0;
         HEAP32[(0 + 68148 | 0) >> 2] = 0;
         return;
        }
        label$21 : {
         if (($3_1 | 0) != (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
          break label$21
         }
         HEAP32[(0 + 68148 | 0) >> 2] = $1_1;
         $0_1 = (HEAP32[(0 + 68136 | 0) >> 2] | 0) + $0_1 | 0;
         HEAP32[(0 + 68136 | 0) >> 2] = $0_1;
         HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
         HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
         return;
        }
        $0_1 = ($4_1 & -8 | 0) + $0_1 | 0;
        $2_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
        label$22 : {
         if ($4_1 >>> 0 > 255 >>> 0) {
          break label$22
         }
         $5_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
         $3_1 = $4_1 >>> 3 | 0;
         $4_1 = ($3_1 << 3 | 0) + 68168 | 0;
         label$23 : {
          if (($2_1 | 0) != ($5_1 | 0)) {
           break label$23
          }
          HEAP32[(0 + 68128 | 0) >> 2] = (HEAP32[(0 + 68128 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $3_1 | 0) | 0) | 0;
          break label$16;
         }
         HEAP32[($5_1 + 12 | 0) >> 2] = $2_1;
         HEAP32[($2_1 + 8 | 0) >> 2] = $5_1;
         break label$16;
        }
        $7_1 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
        label$24 : {
         if (($2_1 | 0) == ($3_1 | 0)) {
          break label$24
         }
         $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
         HEAP32[(0 + 68144 | 0) >> 2] | 0;
         HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
         HEAP32[($2_1 + 8 | 0) >> 2] = $4_1;
         break label$17;
        }
        label$25 : {
         label$26 : {
          $4_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
          if (!$4_1) {
           break label$26
          }
          $5_1 = $3_1 + 20 | 0;
          break label$25;
         }
         $4_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
         if (!$4_1) {
          break label$18
         }
         $5_1 = $3_1 + 16 | 0;
        }
        label$27 : while (1) {
         $6_1 = $5_1;
         $2_1 = $4_1;
         $5_1 = $2_1 + 20 | 0;
         $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
         if ($4_1) {
          continue label$27
         }
         $5_1 = $2_1 + 16 | 0;
         $4_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
         if ($4_1) {
          continue label$27
         }
         break label$27;
        };
        HEAP32[$6_1 >> 2] = 0;
        break label$17;
       }
       HEAP32[($3_1 + 4 | 0) >> 2] = $4_1 & -2 | 0;
       HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
       HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
       break label$15;
      }
      $2_1 = 0;
     }
     if (!$7_1) {
      break label$16
     }
     label$28 : {
      label$29 : {
       $5_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
       $4_1 = ($5_1 << 2 | 0) + 68432 | 0;
       if (($3_1 | 0) != (HEAP32[$4_1 >> 2] | 0 | 0)) {
        break label$29
       }
       HEAP32[$4_1 >> 2] = $2_1;
       if ($2_1) {
        break label$28
       }
       HEAP32[(0 + 68132 | 0) >> 2] = (HEAP32[(0 + 68132 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
       break label$16;
      }
      HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($3_1 | 0) ? 16 : 20) | 0) >> 2] = $2_1;
      if (!$2_1) {
       break label$16
      }
     }
     HEAP32[($2_1 + 24 | 0) >> 2] = $7_1;
     label$30 : {
      $4_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
      if (!$4_1) {
       break label$30
      }
      HEAP32[($2_1 + 16 | 0) >> 2] = $4_1;
      HEAP32[($4_1 + 24 | 0) >> 2] = $2_1;
     }
     $4_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
     if (!$4_1) {
      break label$16
     }
     HEAP32[($2_1 + 20 | 0) >> 2] = $4_1;
     HEAP32[($4_1 + 24 | 0) >> 2] = $2_1;
    }
    HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
    if (($1_1 | 0) != (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
     break label$15
    }
    HEAP32[(0 + 68136 | 0) >> 2] = $0_1;
    return;
   }
   label$31 : {
    if ($0_1 >>> 0 > 255 >>> 0) {
     break label$31
    }
    $2_1 = ($0_1 & -8 | 0) + 68168 | 0;
    label$32 : {
     label$33 : {
      $4_1 = HEAP32[(0 + 68128 | 0) >> 2] | 0;
      $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
      if ($4_1 & $0_1 | 0) {
       break label$33
      }
      HEAP32[(0 + 68128 | 0) >> 2] = $4_1 | $0_1 | 0;
      $0_1 = $2_1;
      break label$32;
     }
     $0_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
    }
    HEAP32[($2_1 + 8 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = $2_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $0_1;
    return;
   }
   $2_1 = 31;
   label$34 : {
    if ($0_1 >>> 0 > 16777215 >>> 0) {
     break label$34
    }
    $2_1 = Math_clz32($0_1 >>> 8 | 0);
    $2_1 = ((($0_1 >>> (38 - $2_1 | 0) | 0) & 1 | 0) - ($2_1 << 1 | 0) | 0) + 62 | 0;
   }
   HEAP32[($1_1 + 28 | 0) >> 2] = $2_1;
   HEAP32[($1_1 + 16 | 0) >> 2] = 0;
   HEAP32[($1_1 + 20 | 0) >> 2] = 0;
   $3_1 = ($2_1 << 2 | 0) + 68432 | 0;
   label$35 : {
    label$36 : {
     label$37 : {
      label$38 : {
       $4_1 = HEAP32[(0 + 68132 | 0) >> 2] | 0;
       $5_1 = 1 << $2_1 | 0;
       if ($4_1 & $5_1 | 0) {
        break label$38
       }
       HEAP32[(0 + 68132 | 0) >> 2] = $4_1 | $5_1 | 0;
       $0_1 = 8;
       $2_1 = 24;
       $5_1 = $3_1;
       break label$37;
      }
      $2_1 = $0_1 << (($2_1 | 0) == (31 | 0) ? 0 : 25 - ($2_1 >>> 1 | 0) | 0) | 0;
      $5_1 = HEAP32[$3_1 >> 2] | 0;
      label$39 : while (1) {
       $4_1 = $5_1;
       if (((HEAP32[($4_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
        break label$36
       }
       $5_1 = $2_1 >>> 29 | 0;
       $2_1 = $2_1 << 1 | 0;
       $3_1 = ($4_1 + ($5_1 & 4 | 0) | 0) + 16 | 0;
       $5_1 = HEAP32[$3_1 >> 2] | 0;
       if ($5_1) {
        continue label$39
       }
       break label$39;
      };
      $0_1 = 8;
      $2_1 = 24;
      $5_1 = $4_1;
     }
     $4_1 = $1_1;
     $6_1 = $4_1;
     break label$35;
    }
    $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    HEAP32[($5_1 + 12 | 0) >> 2] = $1_1;
    $2_1 = 8;
    $3_1 = $4_1 + 8 | 0;
    $6_1 = 0;
    $0_1 = 24;
   }
   HEAP32[$3_1 >> 2] = $1_1;
   HEAP32[($1_1 + $2_1 | 0) >> 2] = $5_1;
   HEAP32[($1_1 + 12 | 0) >> 2] = $4_1;
   HEAP32[($1_1 + $0_1 | 0) >> 2] = $6_1;
   $1_1 = (HEAP32[(0 + 68160 | 0) >> 2] | 0) + -1 | 0;
   HEAP32[(0 + 68160 | 0) >> 2] = $1_1 ? $1_1 : -1;
  }
 }
 
 function $138($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0, $6_1 = 0, $4_1 = 0, $5_1 = 0;
  $2_1 = 16;
  label$1 : {
   label$2 : {
    $3_1 = $0_1 >>> 0 > 16 >>> 0 ? $0_1 : 16;
    if ($3_1 & ($3_1 + -1 | 0) | 0) {
     break label$2
    }
    $0_1 = $3_1;
    break label$1;
   }
   label$3 : while (1) {
    $0_1 = $2_1;
    $2_1 = $0_1 << 1 | 0;
    if ($0_1 >>> 0 < $3_1 >>> 0) {
     continue label$3
    }
    break label$3;
   };
  }
  label$4 : {
   if ((-64 - $0_1 | 0) >>> 0 > $1_1 >>> 0) {
    break label$4
   }
   HEAP32[($106() | 0) >> 2] = 48;
   return 0 | 0;
  }
  label$5 : {
   $1_1 = $1_1 >>> 0 < 11 >>> 0 ? 16 : ($1_1 + 11 | 0) & -8 | 0;
   $2_1 = $135(($1_1 + $0_1 | 0) + 12 | 0 | 0) | 0;
   if ($2_1) {
    break label$5
   }
   return 0 | 0;
  }
  $3_1 = $2_1 + -8 | 0;
  label$6 : {
   label$7 : {
    if (($0_1 + -1 | 0) & $2_1 | 0) {
     break label$7
    }
    $0_1 = $3_1;
    break label$6;
   }
   $4_1 = $2_1 + -4 | 0;
   $5_1 = HEAP32[$4_1 >> 2] | 0;
   $2_1 = ((($2_1 + $0_1 | 0) + -1 | 0) & (0 - $0_1 | 0) | 0) + -8 | 0;
   $0_1 = $2_1 + (($2_1 - $3_1 | 0) >>> 0 > 15 >>> 0 ? 0 : $0_1) | 0;
   $2_1 = $0_1 - $3_1 | 0;
   $6_1 = ($5_1 & -8 | 0) - $2_1 | 0;
   label$8 : {
    if ($5_1 & 3 | 0) {
     break label$8
    }
    $3_1 = HEAP32[$3_1 >> 2] | 0;
    HEAP32[($0_1 + 4 | 0) >> 2] = $6_1;
    HEAP32[$0_1 >> 2] = $3_1 + $2_1 | 0;
    break label$6;
   }
   HEAP32[($0_1 + 4 | 0) >> 2] = $6_1 | ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & 1 | 0) | 0 | 2 | 0;
   $6_1 = $0_1 + $6_1 | 0;
   HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 1 | 0;
   HEAP32[$4_1 >> 2] = $2_1 | ((HEAP32[$4_1 >> 2] | 0) & 1 | 0) | 0 | 2 | 0;
   $6_1 = $3_1 + $2_1 | 0;
   HEAP32[($6_1 + 4 | 0) >> 2] = HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 1 | 0;
   $140($3_1 | 0, $2_1 | 0);
  }
  label$9 : {
   $2_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
   if (!($2_1 & 3 | 0)) {
    break label$9
   }
   $3_1 = $2_1 & -8 | 0;
   if ($3_1 >>> 0 <= ($1_1 + 16 | 0) >>> 0) {
    break label$9
   }
   HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | ($2_1 & 1 | 0) | 0 | 2 | 0;
   $2_1 = $0_1 + $1_1 | 0;
   $1_1 = $3_1 - $1_1 | 0;
   HEAP32[($2_1 + 4 | 0) >> 2] = $1_1 | 3 | 0;
   $3_1 = $0_1 + $3_1 | 0;
   HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 1 | 0;
   $140($2_1 | 0, $1_1 | 0);
  }
  return $0_1 + 8 | 0 | 0;
 }
 
 function $139($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     if (($1_1 | 0) != (8 | 0)) {
      break label$3
     }
     $1_1 = $135($2_1 | 0) | 0;
     break label$2;
    }
    $3_1 = 28;
    if ($1_1 >>> 0 < 4 >>> 0) {
     break label$1
    }
    if ($1_1 & 3 | 0) {
     break label$1
    }
    $4_1 = $1_1 >>> 2 | 0;
    if ($4_1 & ($4_1 + -1 | 0) | 0) {
     break label$1
    }
    $3_1 = 48;
    if ((-64 - $1_1 | 0) >>> 0 < $2_1 >>> 0) {
     break label$1
    }
    $1_1 = $138(($1_1 >>> 0 > 16 >>> 0 ? $1_1 : 16) | 0, $2_1 | 0) | 0;
   }
   label$4 : {
    if ($1_1) {
     break label$4
    }
    return 48 | 0;
   }
   HEAP32[$0_1 >> 2] = $1_1;
   $3_1 = 0;
  }
  return $3_1 | 0;
 }
 
 function $140($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0, $2_1 = 0, $7_1 = 0, $6_1 = 0;
  $2_1 = $0_1 + $1_1 | 0;
  label$1 : {
   label$2 : {
    $3_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
    if ($3_1 & 1 | 0) {
     break label$2
    }
    if (!($3_1 & 2 | 0)) {
     break label$1
    }
    $4_1 = HEAP32[$0_1 >> 2] | 0;
    $1_1 = $4_1 + $1_1 | 0;
    label$3 : {
     label$4 : {
      label$5 : {
       label$6 : {
        $0_1 = $0_1 - $4_1 | 0;
        if (($0_1 | 0) == (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
         break label$6
        }
        $3_1 = HEAP32[($0_1 + 12 | 0) >> 2] | 0;
        label$7 : {
         if ($4_1 >>> 0 > 255 >>> 0) {
          break label$7
         }
         $5_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
         $6_1 = $4_1 >>> 3 | 0;
         $4_1 = ($6_1 << 3 | 0) + 68168 | 0;
         if (($3_1 | 0) != ($5_1 | 0)) {
          break label$5
         }
         HEAP32[(0 + 68128 | 0) >> 2] = (HEAP32[(0 + 68128 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $6_1 | 0) | 0) | 0;
         break label$2;
        }
        $7_1 = HEAP32[($0_1 + 24 | 0) >> 2] | 0;
        label$8 : {
         if (($3_1 | 0) == ($0_1 | 0)) {
          break label$8
         }
         $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
         HEAP32[(0 + 68144 | 0) >> 2] | 0;
         HEAP32[($4_1 + 12 | 0) >> 2] = $3_1;
         HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
         break label$3;
        }
        label$9 : {
         label$10 : {
          $4_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
          if (!$4_1) {
           break label$10
          }
          $5_1 = $0_1 + 20 | 0;
          break label$9;
         }
         $4_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
         if (!$4_1) {
          break label$4
         }
         $5_1 = $0_1 + 16 | 0;
        }
        label$11 : while (1) {
         $6_1 = $5_1;
         $3_1 = $4_1;
         $5_1 = $3_1 + 20 | 0;
         $4_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
         if ($4_1) {
          continue label$11
         }
         $5_1 = $3_1 + 16 | 0;
         $4_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
         if ($4_1) {
          continue label$11
         }
         break label$11;
        };
        HEAP32[$6_1 >> 2] = 0;
        break label$3;
       }
       $3_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
       if (($3_1 & 3 | 0 | 0) != (3 | 0)) {
        break label$2
       }
       HEAP32[(0 + 68136 | 0) >> 2] = $1_1;
       HEAP32[($2_1 + 4 | 0) >> 2] = $3_1 & -2 | 0;
       HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
       HEAP32[$2_1 >> 2] = $1_1;
       return;
      }
      HEAP32[($5_1 + 12 | 0) >> 2] = $3_1;
      HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
      break label$2;
     }
     $3_1 = 0;
    }
    if (!$7_1) {
     break label$2
    }
    label$12 : {
     label$13 : {
      $5_1 = HEAP32[($0_1 + 28 | 0) >> 2] | 0;
      $4_1 = ($5_1 << 2 | 0) + 68432 | 0;
      if (($0_1 | 0) != (HEAP32[$4_1 >> 2] | 0 | 0)) {
       break label$13
      }
      HEAP32[$4_1 >> 2] = $3_1;
      if ($3_1) {
       break label$12
      }
      HEAP32[(0 + 68132 | 0) >> 2] = (HEAP32[(0 + 68132 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
      break label$2;
     }
     HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($0_1 | 0) ? 16 : 20) | 0) >> 2] = $3_1;
     if (!$3_1) {
      break label$2
     }
    }
    HEAP32[($3_1 + 24 | 0) >> 2] = $7_1;
    label$14 : {
     $4_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
     if (!$4_1) {
      break label$14
     }
     HEAP32[($3_1 + 16 | 0) >> 2] = $4_1;
     HEAP32[($4_1 + 24 | 0) >> 2] = $3_1;
    }
    $4_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
    if (!$4_1) {
     break label$2
    }
    HEAP32[($3_1 + 20 | 0) >> 2] = $4_1;
    HEAP32[($4_1 + 24 | 0) >> 2] = $3_1;
   }
   label$15 : {
    label$16 : {
     label$17 : {
      label$18 : {
       label$19 : {
        $4_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
        if ($4_1 & 2 | 0) {
         break label$19
        }
        label$20 : {
         if (($2_1 | 0) != (HEAP32[(0 + 68152 | 0) >> 2] | 0 | 0)) {
          break label$20
         }
         HEAP32[(0 + 68152 | 0) >> 2] = $0_1;
         $1_1 = (HEAP32[(0 + 68140 | 0) >> 2] | 0) + $1_1 | 0;
         HEAP32[(0 + 68140 | 0) >> 2] = $1_1;
         HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
         if (($0_1 | 0) != (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
          break label$1
         }
         HEAP32[(0 + 68136 | 0) >> 2] = 0;
         HEAP32[(0 + 68148 | 0) >> 2] = 0;
         return;
        }
        label$21 : {
         if (($2_1 | 0) != (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
          break label$21
         }
         HEAP32[(0 + 68148 | 0) >> 2] = $0_1;
         $1_1 = (HEAP32[(0 + 68136 | 0) >> 2] | 0) + $1_1 | 0;
         HEAP32[(0 + 68136 | 0) >> 2] = $1_1;
         HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
         HEAP32[($0_1 + $1_1 | 0) >> 2] = $1_1;
         return;
        }
        $1_1 = ($4_1 & -8 | 0) + $1_1 | 0;
        $3_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
        label$22 : {
         if ($4_1 >>> 0 > 255 >>> 0) {
          break label$22
         }
         $5_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
         $2_1 = $4_1 >>> 3 | 0;
         $4_1 = ($2_1 << 3 | 0) + 68168 | 0;
         label$23 : {
          if (($3_1 | 0) != ($5_1 | 0)) {
           break label$23
          }
          HEAP32[(0 + 68128 | 0) >> 2] = (HEAP32[(0 + 68128 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $2_1 | 0) | 0) | 0;
          break label$16;
         }
         HEAP32[($5_1 + 12 | 0) >> 2] = $3_1;
         HEAP32[($3_1 + 8 | 0) >> 2] = $5_1;
         break label$16;
        }
        $7_1 = HEAP32[($2_1 + 24 | 0) >> 2] | 0;
        label$24 : {
         if (($3_1 | 0) == ($2_1 | 0)) {
          break label$24
         }
         $4_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
         HEAP32[(0 + 68144 | 0) >> 2] | 0;
         HEAP32[($4_1 + 12 | 0) >> 2] = $3_1;
         HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
         break label$17;
        }
        label$25 : {
         label$26 : {
          $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
          if (!$4_1) {
           break label$26
          }
          $5_1 = $2_1 + 20 | 0;
          break label$25;
         }
         $4_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
         if (!$4_1) {
          break label$18
         }
         $5_1 = $2_1 + 16 | 0;
        }
        label$27 : while (1) {
         $6_1 = $5_1;
         $3_1 = $4_1;
         $5_1 = $3_1 + 20 | 0;
         $4_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
         if ($4_1) {
          continue label$27
         }
         $5_1 = $3_1 + 16 | 0;
         $4_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
         if ($4_1) {
          continue label$27
         }
         break label$27;
        };
        HEAP32[$6_1 >> 2] = 0;
        break label$17;
       }
       HEAP32[($2_1 + 4 | 0) >> 2] = $4_1 & -2 | 0;
       HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
       HEAP32[($0_1 + $1_1 | 0) >> 2] = $1_1;
       break label$15;
      }
      $3_1 = 0;
     }
     if (!$7_1) {
      break label$16
     }
     label$28 : {
      label$29 : {
       $5_1 = HEAP32[($2_1 + 28 | 0) >> 2] | 0;
       $4_1 = ($5_1 << 2 | 0) + 68432 | 0;
       if (($2_1 | 0) != (HEAP32[$4_1 >> 2] | 0 | 0)) {
        break label$29
       }
       HEAP32[$4_1 >> 2] = $3_1;
       if ($3_1) {
        break label$28
       }
       HEAP32[(0 + 68132 | 0) >> 2] = (HEAP32[(0 + 68132 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
       break label$16;
      }
      HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($2_1 | 0) ? 16 : 20) | 0) >> 2] = $3_1;
      if (!$3_1) {
       break label$16
      }
     }
     HEAP32[($3_1 + 24 | 0) >> 2] = $7_1;
     label$30 : {
      $4_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
      if (!$4_1) {
       break label$30
      }
      HEAP32[($3_1 + 16 | 0) >> 2] = $4_1;
      HEAP32[($4_1 + 24 | 0) >> 2] = $3_1;
     }
     $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
     if (!$4_1) {
      break label$16
     }
     HEAP32[($3_1 + 20 | 0) >> 2] = $4_1;
     HEAP32[($4_1 + 24 | 0) >> 2] = $3_1;
    }
    HEAP32[($0_1 + 4 | 0) >> 2] = $1_1 | 1 | 0;
    HEAP32[($0_1 + $1_1 | 0) >> 2] = $1_1;
    if (($0_1 | 0) != (HEAP32[(0 + 68148 | 0) >> 2] | 0 | 0)) {
     break label$15
    }
    HEAP32[(0 + 68136 | 0) >> 2] = $1_1;
    return;
   }
   label$31 : {
    if ($1_1 >>> 0 > 255 >>> 0) {
     break label$31
    }
    $3_1 = ($1_1 & -8 | 0) + 68168 | 0;
    label$32 : {
     label$33 : {
      $4_1 = HEAP32[(0 + 68128 | 0) >> 2] | 0;
      $1_1 = 1 << ($1_1 >>> 3 | 0) | 0;
      if ($4_1 & $1_1 | 0) {
       break label$33
      }
      HEAP32[(0 + 68128 | 0) >> 2] = $4_1 | $1_1 | 0;
      $1_1 = $3_1;
      break label$32;
     }
     $1_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = $0_1;
    HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
    HEAP32[($0_1 + 8 | 0) >> 2] = $1_1;
    return;
   }
   $3_1 = 31;
   label$34 : {
    if ($1_1 >>> 0 > 16777215 >>> 0) {
     break label$34
    }
    $3_1 = Math_clz32($1_1 >>> 8 | 0);
    $3_1 = ((($1_1 >>> (38 - $3_1 | 0) | 0) & 1 | 0) - ($3_1 << 1 | 0) | 0) + 62 | 0;
   }
   HEAP32[($0_1 + 28 | 0) >> 2] = $3_1;
   HEAP32[($0_1 + 16 | 0) >> 2] = 0;
   HEAP32[($0_1 + 20 | 0) >> 2] = 0;
   $4_1 = ($3_1 << 2 | 0) + 68432 | 0;
   label$35 : {
    label$36 : {
     label$37 : {
      $5_1 = HEAP32[(0 + 68132 | 0) >> 2] | 0;
      $2_1 = 1 << $3_1 | 0;
      if ($5_1 & $2_1 | 0) {
       break label$37
      }
      HEAP32[(0 + 68132 | 0) >> 2] = $5_1 | $2_1 | 0;
      HEAP32[$4_1 >> 2] = $0_1;
      HEAP32[($0_1 + 24 | 0) >> 2] = $4_1;
      break label$36;
     }
     $3_1 = $1_1 << (($3_1 | 0) == (31 | 0) ? 0 : 25 - ($3_1 >>> 1 | 0) | 0) | 0;
     $5_1 = HEAP32[$4_1 >> 2] | 0;
     label$38 : while (1) {
      $4_1 = $5_1;
      if (((HEAP32[($4_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($1_1 | 0)) {
       break label$35
      }
      $5_1 = $3_1 >>> 29 | 0;
      $3_1 = $3_1 << 1 | 0;
      $2_1 = ($4_1 + ($5_1 & 4 | 0) | 0) + 16 | 0;
      $5_1 = HEAP32[$2_1 >> 2] | 0;
      if ($5_1) {
       continue label$38
      }
      break label$38;
     };
     HEAP32[$2_1 >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $4_1;
    }
    HEAP32[($0_1 + 12 | 0) >> 2] = $0_1;
    HEAP32[($0_1 + 8 | 0) >> 2] = $0_1;
    return;
   }
   $1_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[($1_1 + 12 | 0) >> 2] = $0_1;
   HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
   HEAP32[($0_1 + 24 | 0) >> 2] = 0;
   HEAP32[($0_1 + 12 | 0) >> 2] = $4_1;
   HEAP32[($0_1 + 8 | 0) >> 2] = $1_1;
  }
 }
 
 function $141($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0, wasm2js_i32$2 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $3_1 = 0;
  label$1 : {
   if ($0_1 & 3 | 0) {
    break label$1
   }
   if (($1_1 >>> 0) % ($0_1 >>> 0) | 0) {
    break label$1
   }
   $0_1 = $139($2_1 + 12 | 0 | 0, $0_1 | 0, $1_1 | 0) | 0;
   $3_1 = (wasm2js_i32$0 = 0, wasm2js_i32$1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0, wasm2js_i32$2 = $0_1, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
  }
  global$0 = $2_1 + 16 | 0;
  return $3_1 | 0;
 }
 
 function $142($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = $0_1 >>> 0 > 1 >>> 0 ? $0_1 : 1;
  label$1 : {
   label$2 : while (1) {
    $0_1 = $135($1_1 | 0) | 0;
    if ($0_1) {
     break label$1
    }
    label$3 : {
     $0_1 = $306() | 0;
     if (!$0_1) {
      break label$3
     }
     FUNCTION_TABLE[$0_1 | 0]();
     continue label$2;
    }
    break label$2;
   };
   fimport$4();
   wasm2js_trap();
  }
  return $0_1 | 0;
 }
 
 function $143($0_1) {
  $0_1 = $0_1 | 0;
  $137($0_1 | 0);
 }
 
 function $144($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $3_1 = 0, $2_1 = 0;
  $2_1 = $1_1 >>> 0 > 4 >>> 0 ? $1_1 : 4;
  $0_1 = $0_1 >>> 0 > 1 >>> 0 ? $0_1 : 1;
  label$1 : {
   label$2 : while (1) {
    $3_1 = $145($2_1 | 0, $0_1 | 0) | 0;
    if ($3_1) {
     break label$1
    }
    $1_1 = $306() | 0;
    if (!$1_1) {
     break label$1
    }
    FUNCTION_TABLE[$1_1 | 0]();
    continue label$2;
   };
  }
  return $3_1 | 0;
 }
 
 function $145($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = (($0_1 + $1_1 | 0) + -1 | 0) & (0 - $0_1 | 0) | 0;
  return $141($0_1 | 0, ($2_1 >>> 0 > $1_1 >>> 0 ? $2_1 : $1_1) | 0) | 0 | 0;
 }
 
 function $146($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $147($0_1 | 0);
 }
 
 function $147($0_1) {
  $0_1 = $0_1 | 0;
  $137($0_1 | 0);
 }
 
 function $148($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  label$1 : {
   if (($0_1 | 0) == ($1_1 | 0)) {
    break label$1
   }
   label$2 : {
    $3_1 = $0_1 + $2_1 | 0;
    if (($1_1 - $3_1 | 0) >>> 0 > (0 - ($2_1 << 1 | 0) | 0) >>> 0) {
     break label$2
    }
    return $108($0_1 | 0, $1_1 | 0, $2_1 | 0) | 0 | 0;
   }
   $4_1 = ($1_1 ^ $0_1 | 0) & 3 | 0;
   label$3 : {
    label$4 : {
     label$5 : {
      if ($0_1 >>> 0 >= $1_1 >>> 0) {
       break label$5
      }
      label$6 : {
       if (!$4_1) {
        break label$6
       }
       $3_1 = $0_1;
       break label$3;
      }
      label$7 : {
       if ($0_1 & 3 | 0) {
        break label$7
       }
       $3_1 = $0_1;
       break label$4;
      }
      $3_1 = $0_1;
      label$8 : while (1) {
       if (!$2_1) {
        break label$1
       }
       HEAP8[$3_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
       $1_1 = $1_1 + 1 | 0;
       $2_1 = $2_1 + -1 | 0;
       $3_1 = $3_1 + 1 | 0;
       if (!($3_1 & 3 | 0)) {
        break label$4
       }
       continue label$8;
      };
     }
     label$9 : {
      if ($4_1) {
       break label$9
      }
      label$10 : {
       if (!($3_1 & 3 | 0)) {
        break label$10
       }
       label$11 : while (1) {
        if (!$2_1) {
         break label$1
        }
        $2_1 = $2_1 + -1 | 0;
        $3_1 = $0_1 + $2_1 | 0;
        HEAP8[$3_1 >> 0] = HEAPU8[($1_1 + $2_1 | 0) >> 0] | 0;
        if ($3_1 & 3 | 0) {
         continue label$11
        }
        break label$11;
       };
      }
      if ($2_1 >>> 0 <= 3 >>> 0) {
       break label$9
      }
      label$12 : while (1) {
       $2_1 = $2_1 + -4 | 0;
       HEAP32[($0_1 + $2_1 | 0) >> 2] = HEAP32[($1_1 + $2_1 | 0) >> 2] | 0;
       if ($2_1 >>> 0 > 3 >>> 0) {
        continue label$12
       }
       break label$12;
      };
     }
     if (!$2_1) {
      break label$1
     }
     label$13 : while (1) {
      $2_1 = $2_1 + -1 | 0;
      HEAP8[($0_1 + $2_1 | 0) >> 0] = HEAPU8[($1_1 + $2_1 | 0) >> 0] | 0;
      if ($2_1) {
       continue label$13
      }
      break label$1;
     };
    }
    if ($2_1 >>> 0 <= 3 >>> 0) {
     break label$3
    }
    label$14 : while (1) {
     HEAP32[$3_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
     $1_1 = $1_1 + 4 | 0;
     $3_1 = $3_1 + 4 | 0;
     $2_1 = $2_1 + -4 | 0;
     if ($2_1 >>> 0 > 3 >>> 0) {
      continue label$14
     }
     break label$14;
    };
   }
   if (!$2_1) {
    break label$1
   }
   label$15 : while (1) {
    HEAP8[$3_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    $3_1 = $3_1 + 1 | 0;
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 + -1 | 0;
    if ($2_1) {
     continue label$15
    }
    break label$15;
   };
  }
  return $0_1 | 0;
 }
 
 function $149($0_1, $1_1, $1$hi, $2_1, $2$hi, $3_1, $3$hi, $4_1, $4$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  $3$hi = $3$hi | 0;
  $4_1 = $4_1 | 0;
  $4$hi = $4$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, i64toi32_i32$5 = 0, i64toi32_i32$4 = 0, i64toi32_i32$3 = 0, $46_1 = 0, $48_1 = 0, $49_1 = 0, $50_1 = 0, $53_1 = 0, $54_1 = 0, $6_1 = 0, $9_1 = 0, $9$hi = 0, $12_1 = 0, $12$hi = 0, $13_1 = 0, $13$hi = 0, $16_1 = 0, $16$hi = 0, $20_1 = 0, $20$hi = 0, $21_1 = 0, $21$hi = 0, $5_1 = 0, $5$hi = 0, $30$hi = 0, $33_1 = 0, $33$hi = 0, $36$hi = 0, $37_1 = 0, $37$hi = 0, $39_1 = 0, $39$hi = 0, $42_1 = 0, $42$hi = 0, $45$hi = 0, $47_1 = 0, $49$hi = 0, $51_1 = 0, $51$hi = 0, $52_1 = 0;
  $6_1 = $0_1;
  i64toi32_i32$0 = $4$hi;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$0 = $4$hi;
  i64toi32_i32$1 = $1$hi;
  i64toi32_i32$1 = __wasm_i64_mul($4_1 | 0, i64toi32_i32$0 | 0, $1_1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $9_1 = i64toi32_i32$1;
  $9$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $2$hi;
  i64toi32_i32$0 = $3$hi;
  i64toi32_i32$0 = $2$hi;
  i64toi32_i32$1 = $3$hi;
  i64toi32_i32$1 = __wasm_i64_mul($2_1 | 0, i64toi32_i32$0 | 0, $3_1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $12_1 = i64toi32_i32$1;
  $12$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $9$hi;
  i64toi32_i32$2 = $9_1;
  i64toi32_i32$1 = $12$hi;
  i64toi32_i32$3 = $12_1;
  i64toi32_i32$4 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
  i64toi32_i32$5 = i64toi32_i32$0 + i64toi32_i32$1 | 0;
  if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
   i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
  }
  $13_1 = i64toi32_i32$4;
  $13$hi = i64toi32_i32$5;
  i64toi32_i32$5 = $3$hi;
  i64toi32_i32$0 = $3_1;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$1 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $46_1 = i64toi32_i32$5 >>> i64toi32_i32$1 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$5 >>> i64toi32_i32$1 | 0;
   $46_1 = (((1 << i64toi32_i32$1 | 0) - 1 | 0) & i64toi32_i32$5 | 0) << (32 - i64toi32_i32$1 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$1 | 0) | 0;
  }
  $2_1 = $46_1;
  $2$hi = i64toi32_i32$2;
  $16_1 = $2_1;
  $16$hi = i64toi32_i32$2;
  i64toi32_i32$2 = $1$hi;
  i64toi32_i32$5 = $1_1;
  i64toi32_i32$0 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$1 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$0 = 0;
   $48_1 = i64toi32_i32$2 >>> i64toi32_i32$1 | 0;
  } else {
   i64toi32_i32$0 = i64toi32_i32$2 >>> i64toi32_i32$1 | 0;
   $48_1 = (((1 << i64toi32_i32$1 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$1 | 0) | 0 | (i64toi32_i32$5 >>> i64toi32_i32$1 | 0) | 0;
  }
  $4_1 = $48_1;
  $4$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $16$hi;
  i64toi32_i32$5 = $4$hi;
  i64toi32_i32$5 = __wasm_i64_mul($16_1 | 0, i64toi32_i32$0 | 0, $4_1 | 0, i64toi32_i32$5 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $20_1 = i64toi32_i32$5;
  $20$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $13$hi;
  i64toi32_i32$2 = $13_1;
  i64toi32_i32$5 = $20$hi;
  i64toi32_i32$3 = $20_1;
  i64toi32_i32$1 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
  i64toi32_i32$4 = i64toi32_i32$0 + i64toi32_i32$5 | 0;
  if (i64toi32_i32$1 >>> 0 < i64toi32_i32$3 >>> 0) {
   i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
  }
  $21_1 = i64toi32_i32$1;
  $21$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $3$hi;
  i64toi32_i32$0 = $3_1;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = -1;
  i64toi32_i32$2 = i64toi32_i32$4 & i64toi32_i32$2 | 0;
  $3_1 = i64toi32_i32$0 & i64toi32_i32$3 | 0;
  $3$hi = i64toi32_i32$2;
  i64toi32_i32$2 = $1$hi;
  i64toi32_i32$4 = $1_1;
  i64toi32_i32$0 = 0;
  i64toi32_i32$3 = -1;
  i64toi32_i32$0 = i64toi32_i32$2 & i64toi32_i32$0 | 0;
  $1_1 = i64toi32_i32$4 & i64toi32_i32$3 | 0;
  $1$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $3$hi;
  i64toi32_i32$4 = $1$hi;
  i64toi32_i32$4 = __wasm_i64_mul($3_1 | 0, i64toi32_i32$0 | 0, $1_1 | 0, i64toi32_i32$4 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $5_1 = i64toi32_i32$4;
  $5$hi = i64toi32_i32$0;
  i64toi32_i32$2 = i64toi32_i32$4;
  i64toi32_i32$4 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$5 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$4 = 0;
   $49_1 = i64toi32_i32$0 >>> i64toi32_i32$5 | 0;
  } else {
   i64toi32_i32$4 = i64toi32_i32$0 >>> i64toi32_i32$5 | 0;
   $49_1 = (((1 << i64toi32_i32$5 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$5 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$5 | 0) | 0;
  }
  $30$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $3$hi;
  i64toi32_i32$4 = $4$hi;
  i64toi32_i32$4 = $3$hi;
  i64toi32_i32$2 = $4$hi;
  i64toi32_i32$2 = __wasm_i64_mul($3_1 | 0, i64toi32_i32$4 | 0, $4_1 | 0, i64toi32_i32$2 | 0) | 0;
  i64toi32_i32$4 = i64toi32_i32$HIGH_BITS;
  $33_1 = i64toi32_i32$2;
  $33$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $30$hi;
  i64toi32_i32$0 = $49_1;
  i64toi32_i32$2 = $33$hi;
  i64toi32_i32$3 = $33_1;
  i64toi32_i32$5 = i64toi32_i32$0 + i64toi32_i32$3 | 0;
  i64toi32_i32$1 = i64toi32_i32$4 + i64toi32_i32$2 | 0;
  if (i64toi32_i32$5 >>> 0 < i64toi32_i32$3 >>> 0) {
   i64toi32_i32$1 = i64toi32_i32$1 + 1 | 0
  }
  $3_1 = i64toi32_i32$5;
  $3$hi = i64toi32_i32$1;
  i64toi32_i32$4 = i64toi32_i32$5;
  i64toi32_i32$0 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$2 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$0 = 0;
   $50_1 = i64toi32_i32$1 >>> i64toi32_i32$2 | 0;
  } else {
   i64toi32_i32$0 = i64toi32_i32$1 >>> i64toi32_i32$2 | 0;
   $50_1 = (((1 << i64toi32_i32$2 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$2 | 0) | 0 | (i64toi32_i32$4 >>> i64toi32_i32$2 | 0) | 0;
  }
  $36$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $21$hi;
  i64toi32_i32$1 = $21_1;
  i64toi32_i32$4 = $36$hi;
  i64toi32_i32$3 = $50_1;
  i64toi32_i32$2 = i64toi32_i32$1 + i64toi32_i32$3 | 0;
  i64toi32_i32$5 = i64toi32_i32$0 + i64toi32_i32$4 | 0;
  if (i64toi32_i32$2 >>> 0 < i64toi32_i32$3 >>> 0) {
   i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
  }
  $37_1 = i64toi32_i32$2;
  $37$hi = i64toi32_i32$5;
  i64toi32_i32$5 = $3$hi;
  i64toi32_i32$0 = $3_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = -1;
  i64toi32_i32$1 = i64toi32_i32$5 & i64toi32_i32$1 | 0;
  $39_1 = i64toi32_i32$0 & i64toi32_i32$3 | 0;
  $39$hi = i64toi32_i32$1;
  i64toi32_i32$1 = $2$hi;
  i64toi32_i32$1 = $1$hi;
  i64toi32_i32$1 = $2$hi;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$0 = __wasm_i64_mul($2_1 | 0, i64toi32_i32$1 | 0, $1_1 | 0, i64toi32_i32$0 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  $42_1 = i64toi32_i32$0;
  $42$hi = i64toi32_i32$1;
  i64toi32_i32$1 = $39$hi;
  i64toi32_i32$5 = $39_1;
  i64toi32_i32$0 = $42$hi;
  i64toi32_i32$3 = $42_1;
  i64toi32_i32$4 = i64toi32_i32$5 + i64toi32_i32$3 | 0;
  i64toi32_i32$2 = i64toi32_i32$1 + i64toi32_i32$0 | 0;
  if (i64toi32_i32$4 >>> 0 < i64toi32_i32$3 >>> 0) {
   i64toi32_i32$2 = i64toi32_i32$2 + 1 | 0
  }
  $1_1 = i64toi32_i32$4;
  $1$hi = i64toi32_i32$2;
  i64toi32_i32$1 = i64toi32_i32$4;
  i64toi32_i32$5 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$0 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$5 = 0;
   $53_1 = i64toi32_i32$2 >>> i64toi32_i32$0 | 0;
  } else {
   i64toi32_i32$5 = i64toi32_i32$2 >>> i64toi32_i32$0 | 0;
   $53_1 = (((1 << i64toi32_i32$0 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$0 | 0) | 0 | (i64toi32_i32$1 >>> i64toi32_i32$0 | 0) | 0;
  }
  $45$hi = i64toi32_i32$5;
  i64toi32_i32$5 = $37$hi;
  i64toi32_i32$2 = $37_1;
  i64toi32_i32$1 = $45$hi;
  i64toi32_i32$3 = $53_1;
  i64toi32_i32$0 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
  i64toi32_i32$4 = i64toi32_i32$5 + i64toi32_i32$1 | 0;
  if (i64toi32_i32$0 >>> 0 < i64toi32_i32$3 >>> 0) {
   i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
  }
  i64toi32_i32$2 = $6_1;
  HEAP32[(i64toi32_i32$2 + 8 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[(i64toi32_i32$2 + 12 | 0) >> 2] = i64toi32_i32$4;
  $47_1 = $0_1;
  i64toi32_i32$4 = $1$hi;
  i64toi32_i32$5 = $1_1;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$1 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = i64toi32_i32$5 << i64toi32_i32$1 | 0;
   $54_1 = 0;
  } else {
   i64toi32_i32$2 = ((1 << i64toi32_i32$1 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$1 | 0) | 0) | 0 | (i64toi32_i32$4 << i64toi32_i32$1 | 0) | 0;
   $54_1 = i64toi32_i32$5 << i64toi32_i32$1 | 0;
  }
  $49$hi = i64toi32_i32$2;
  i64toi32_i32$2 = $5$hi;
  i64toi32_i32$4 = $5_1;
  i64toi32_i32$5 = 0;
  i64toi32_i32$3 = -1;
  i64toi32_i32$5 = i64toi32_i32$2 & i64toi32_i32$5 | 0;
  $51_1 = i64toi32_i32$4 & i64toi32_i32$3 | 0;
  $51$hi = i64toi32_i32$5;
  i64toi32_i32$5 = $49$hi;
  i64toi32_i32$2 = $54_1;
  i64toi32_i32$4 = $51$hi;
  i64toi32_i32$3 = $51_1;
  i64toi32_i32$4 = i64toi32_i32$5 | i64toi32_i32$4 | 0;
  $52_1 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
  i64toi32_i32$2 = $47_1;
  HEAP32[i64toi32_i32$2 >> 2] = $52_1;
  HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] = i64toi32_i32$4;
 }
 
 function $150($0_1, $1_1, $2_1, $3_1, $3$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $3$hi = $3$hi | 0;
  var i64toi32_i32$3 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, i64toi32_i32$5 = 0, $7_1 = 0, $6_1 = 0, $12$hi = 0, $11$hi = 0, $8_1 = 0, $11_1 = 0, $12_1 = 0, $5_1 = 0, $4_1 = 0, $10_1 = 0, $9_1 = 0, $13_1 = 0, $14_1 = 0, $14$hi = 0, $13$hi = 0, $105_1 = 0, $105$hi = 0, $150$hi = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      if (($2_1 | 0) > (36 | 0)) {
       break label$4
      }
      $5_1 = 0;
      $6_1 = HEAPU8[$0_1 >> 0] | 0;
      if ($6_1) {
       break label$3
      }
      $7_1 = $0_1;
      break label$2;
     }
     HEAP32[($106() | 0) >> 2] = 28;
     i64toi32_i32$0 = 0;
     $3_1 = 0;
     $3$hi = i64toi32_i32$0;
     break label$1;
    }
    $7_1 = $0_1;
    label$5 : {
     label$6 : while (1) {
      if (!($151($6_1 << 24 >> 24 | 0) | 0)) {
       break label$5
      }
      $6_1 = HEAPU8[($7_1 + 1 | 0) >> 0] | 0;
      $8_1 = $7_1 + 1 | 0;
      $7_1 = $8_1;
      if ($6_1) {
       continue label$6
      }
      break label$6;
     };
     break label$2;
    }
    label$7 : {
     $6_1 = $6_1 & 255 | 0;
     switch ($6_1 + -43 | 0 | 0) {
     case 0:
     case 2:
      break label$7;
     default:
      break label$2;
     };
    }
    $5_1 = ($6_1 | 0) == (45 | 0) ? -1 : 0;
    $7_1 = $7_1 + 1 | 0;
   }
   label$8 : {
    label$9 : {
     if (($2_1 | 16 | 0 | 0) != (16 | 0)) {
      break label$9
     }
     if ((HEAPU8[$7_1 >> 0] | 0 | 0) != (48 | 0)) {
      break label$9
     }
     $9_1 = 1;
     label$10 : {
      if (((HEAPU8[($7_1 + 1 | 0) >> 0] | 0) & 223 | 0 | 0) != (88 | 0)) {
       break label$10
      }
      $7_1 = $7_1 + 2 | 0;
      $10_1 = 16;
      break label$8;
     }
     $7_1 = $7_1 + 1 | 0;
     $10_1 = $2_1 ? $2_1 : 8;
     break label$8;
    }
    $10_1 = $2_1 ? $2_1 : 10;
    $9_1 = 0;
   }
   i64toi32_i32$0 = 0;
   $11_1 = $10_1;
   $11$hi = i64toi32_i32$0;
   $2_1 = 0;
   i64toi32_i32$0 = 0;
   $12_1 = 0;
   $12$hi = i64toi32_i32$0;
   label$11 : {
    label$12 : while (1) {
     label$13 : {
      $8_1 = HEAPU8[$7_1 >> 0] | 0;
      $6_1 = $8_1 + -48 | 0;
      if (($6_1 & 255 | 0) >>> 0 < 10 >>> 0) {
       break label$13
      }
      label$14 : {
       if ((($8_1 + -97 | 0) & 255 | 0) >>> 0 > 25 >>> 0) {
        break label$14
       }
       $6_1 = $8_1 + -87 | 0;
       break label$13;
      }
      if ((($8_1 + -65 | 0) & 255 | 0) >>> 0 > 25 >>> 0) {
       break label$11
      }
      $6_1 = $8_1 + -55 | 0;
     }
     if (($10_1 | 0) <= ($6_1 & 255 | 0 | 0)) {
      break label$11
     }
     i64toi32_i32$0 = $11$hi;
     i64toi32_i32$0 = $12$hi;
     i64toi32_i32$0 = $11$hi;
     i64toi32_i32$1 = 0;
     i64toi32_i32$2 = $12$hi;
     i64toi32_i32$3 = 0;
     $149($4_1 | 0, $11_1 | 0, i64toi32_i32$0 | 0, 0 | 0, i64toi32_i32$1 | 0, $12_1 | 0, i64toi32_i32$2 | 0, 0 | 0, i64toi32_i32$3 | 0);
     $8_1 = 1;
     label$15 : {
      i64toi32_i32$1 = $4_1;
      i64toi32_i32$3 = HEAP32[(i64toi32_i32$1 + 8 | 0) >> 2] | 0;
      i64toi32_i32$2 = HEAP32[(i64toi32_i32$1 + 12 | 0) >> 2] | 0;
      i64toi32_i32$1 = i64toi32_i32$3;
      i64toi32_i32$3 = 0;
      i64toi32_i32$0 = 0;
      if ((i64toi32_i32$1 | 0) != (i64toi32_i32$0 | 0) | (i64toi32_i32$2 | 0) != (i64toi32_i32$3 | 0) | 0) {
       break label$15
      }
      i64toi32_i32$1 = $12$hi;
      i64toi32_i32$1 = $11$hi;
      i64toi32_i32$1 = $12$hi;
      i64toi32_i32$2 = $11$hi;
      i64toi32_i32$2 = __wasm_i64_mul($12_1 | 0, i64toi32_i32$1 | 0, $11_1 | 0, i64toi32_i32$2 | 0) | 0;
      i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
      $13_1 = i64toi32_i32$2;
      $13$hi = i64toi32_i32$1;
      i64toi32_i32$1 = 0;
      i64toi32_i32$0 = $6_1;
      i64toi32_i32$2 = 0;
      i64toi32_i32$3 = 255;
      i64toi32_i32$2 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
      $14_1 = i64toi32_i32$0 & i64toi32_i32$3 | 0;
      $14$hi = i64toi32_i32$2;
      i64toi32_i32$1 = $14_1;
      i64toi32_i32$0 = -1;
      i64toi32_i32$3 = -1;
      i64toi32_i32$0 = i64toi32_i32$2 ^ i64toi32_i32$0 | 0;
      $105_1 = i64toi32_i32$1 ^ i64toi32_i32$3 | 0;
      $105$hi = i64toi32_i32$0;
      i64toi32_i32$0 = $13$hi;
      i64toi32_i32$2 = $13_1;
      i64toi32_i32$1 = $105$hi;
      i64toi32_i32$3 = $105_1;
      if (i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$3 >>> 0 | 0) | 0) {
       break label$15
      }
      i64toi32_i32$2 = i64toi32_i32$0;
      i64toi32_i32$2 = $14$hi;
      i64toi32_i32$2 = i64toi32_i32$0;
      i64toi32_i32$3 = $13_1;
      i64toi32_i32$0 = $14$hi;
      i64toi32_i32$1 = $14_1;
      i64toi32_i32$4 = i64toi32_i32$3 + i64toi32_i32$1 | 0;
      i64toi32_i32$5 = i64toi32_i32$2 + i64toi32_i32$0 | 0;
      if (i64toi32_i32$4 >>> 0 < i64toi32_i32$1 >>> 0) {
       i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
      }
      $12_1 = i64toi32_i32$4;
      $12$hi = i64toi32_i32$5;
      $9_1 = 1;
      $8_1 = $2_1;
     }
     $7_1 = $7_1 + 1 | 0;
     $2_1 = $8_1;
     continue label$12;
    };
   }
   label$16 : {
    if (!$1_1) {
     break label$16
    }
    HEAP32[$1_1 >> 2] = $9_1 ? $7_1 : $0_1;
   }
   label$17 : {
    label$18 : {
     label$19 : {
      if (!$2_1) {
       break label$19
      }
      HEAP32[($106() | 0) >> 2] = 68;
      i64toi32_i32$5 = $3$hi;
      i64toi32_i32$2 = $3_1;
      i64toi32_i32$3 = 0;
      i64toi32_i32$1 = 1;
      i64toi32_i32$3 = i64toi32_i32$5 & i64toi32_i32$3 | 0;
      $11_1 = i64toi32_i32$2 & i64toi32_i32$1 | 0;
      $11$hi = i64toi32_i32$3;
      $5_1 = !($11_1 | i64toi32_i32$3 | 0) ? $5_1 : 0;
      i64toi32_i32$3 = i64toi32_i32$5;
      $12_1 = i64toi32_i32$2;
      $12$hi = i64toi32_i32$3;
      break label$18;
     }
     i64toi32_i32$3 = $12$hi;
     i64toi32_i32$3 = $3$hi;
     i64toi32_i32$3 = $12$hi;
     i64toi32_i32$5 = $12_1;
     i64toi32_i32$2 = $3$hi;
     i64toi32_i32$1 = $3_1;
     if (i64toi32_i32$3 >>> 0 < i64toi32_i32$2 >>> 0 | ((i64toi32_i32$3 | 0) == (i64toi32_i32$2 | 0) & i64toi32_i32$5 >>> 0 < i64toi32_i32$1 >>> 0 | 0) | 0) {
      break label$17
     }
     i64toi32_i32$5 = i64toi32_i32$2;
     i64toi32_i32$5 = i64toi32_i32$2;
     i64toi32_i32$3 = 0;
     i64toi32_i32$2 = 1;
     i64toi32_i32$3 = i64toi32_i32$5 & i64toi32_i32$3 | 0;
     $11_1 = i64toi32_i32$1 & i64toi32_i32$2 | 0;
     $11$hi = i64toi32_i32$3;
    }
    label$20 : {
     i64toi32_i32$3 = $11$hi;
     if ($11_1) {
      break label$20
     }
     if ($5_1) {
      break label$20
     }
     HEAP32[($106() | 0) >> 2] = 68;
     i64toi32_i32$3 = $3$hi;
     i64toi32_i32$5 = $3_1;
     i64toi32_i32$1 = -1;
     i64toi32_i32$2 = -1;
     i64toi32_i32$0 = i64toi32_i32$5 + i64toi32_i32$2 | 0;
     i64toi32_i32$4 = i64toi32_i32$3 + i64toi32_i32$1 | 0;
     if (i64toi32_i32$0 >>> 0 < i64toi32_i32$2 >>> 0) {
      i64toi32_i32$4 = i64toi32_i32$4 + 1 | 0
     }
     $3_1 = i64toi32_i32$0;
     $3$hi = i64toi32_i32$4;
     break label$1;
    }
    i64toi32_i32$4 = $12$hi;
    i64toi32_i32$4 = $3$hi;
    i64toi32_i32$4 = $12$hi;
    i64toi32_i32$3 = $12_1;
    i64toi32_i32$5 = $3$hi;
    i64toi32_i32$2 = $3_1;
    if (i64toi32_i32$4 >>> 0 < i64toi32_i32$5 >>> 0 | ((i64toi32_i32$4 | 0) == (i64toi32_i32$5 | 0) & i64toi32_i32$3 >>> 0 <= i64toi32_i32$2 >>> 0 | 0) | 0) {
     break label$17
    }
    HEAP32[($106() | 0) >> 2] = 68;
    break label$1;
   }
   i64toi32_i32$3 = $12$hi;
   i64toi32_i32$4 = $5_1;
   i64toi32_i32$3 = i64toi32_i32$4 >> 31 | 0;
   $11_1 = i64toi32_i32$4;
   $11$hi = i64toi32_i32$3;
   i64toi32_i32$3 = $12$hi;
   i64toi32_i32$2 = $12_1;
   i64toi32_i32$4 = $11$hi;
   i64toi32_i32$5 = $11_1;
   i64toi32_i32$4 = i64toi32_i32$3 ^ i64toi32_i32$4 | 0;
   $150$hi = i64toi32_i32$4;
   i64toi32_i32$4 = $11$hi;
   i64toi32_i32$4 = $150$hi;
   i64toi32_i32$3 = i64toi32_i32$2 ^ i64toi32_i32$5 | 0;
   i64toi32_i32$2 = $11$hi;
   i64toi32_i32$1 = i64toi32_i32$3 - i64toi32_i32$5 | 0;
   i64toi32_i32$0 = (i64toi32_i32$3 >>> 0 < i64toi32_i32$5 >>> 0) + i64toi32_i32$2 | 0;
   i64toi32_i32$0 = i64toi32_i32$4 - i64toi32_i32$0 | 0;
   $3_1 = i64toi32_i32$1;
   $3$hi = i64toi32_i32$0;
  }
  global$0 = $4_1 + 16 | 0;
  i64toi32_i32$0 = $3$hi;
  i64toi32_i32$3 = $3_1;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$3 | 0;
 }
 
 function $151($0_1) {
  $0_1 = $0_1 | 0;
  return ($0_1 | 0) == (32 | 0) | ($0_1 + -9 | 0) >>> 0 < 5 >>> 0 | 0 | 0;
 }
 
 function $152($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = -2147483648;
  i64toi32_i32$0 = $150($0_1 | 0, $1_1 | 0, $2_1 | 0, 0 | 0, i64toi32_i32$0 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $153($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if (!($158($0_1 | 0) | 0)) {
    break label$1
   }
   return $159($0_1 | 0) | 0 | 0;
  }
  return $160($0_1 | 0) | 0 | 0;
 }
 
 function $154($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = 10;
  label$1 : {
   if (!($158($0_1 | 0) | 0)) {
    break label$1
   }
   $1_1 = ($162($0_1 | 0) | 0) + -1 | 0;
  }
  return $1_1 | 0;
 }
 
 function $155($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if (!($158($0_1 | 0) | 0)) {
    break label$1
   }
   return $163($0_1 | 0) | 0 | 0;
  }
  return $164($0_1 | 0) | 0 | 0;
 }
 
 function $156($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $157($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1, $7_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  $6_1 = $6_1 | 0;
  $7_1 = $7_1 | 0;
  var $8_1 = 0, $9_1 = 0, $10_1 = 0;
  $8_1 = global$0 - 16 | 0;
  global$0 = $8_1;
  label$1 : {
   $9_1 = $168($0_1 | 0) | 0;
   if (($9_1 + ($1_1 ^ -1 | 0) | 0) >>> 0 < $2_1 >>> 0) {
    break label$1
   }
   $10_1 = $155($0_1 | 0) | 0;
   label$2 : {
    if ((($9_1 >>> 1 | 0) + -16 | 0) >>> 0 <= $1_1 >>> 0) {
     break label$2
    }
    HEAP32[($8_1 + 12 | 0) >> 2] = $1_1 << 1 | 0;
    HEAP32[($8_1 + 4 | 0) >> 2] = $2_1 + $1_1 | 0;
    $9_1 = ($170(HEAP32[($169($8_1 + 4 | 0 | 0, $8_1 + 12 | 0 | 0) | 0) >> 2] | 0 | 0) | 0) + 1 | 0;
   }
   $172($8_1 + 4 | 0 | 0, $171($0_1 | 0) | 0 | 0, $9_1 | 0);
   $9_1 = HEAP32[($8_1 + 4 | 0) >> 2] | 0;
   $173($9_1 | 0, HEAP32[($8_1 + 8 | 0) >> 2] | 0 | 0);
   label$3 : {
    if (!$4_1) {
     break label$3
    }
    $174($156($9_1 | 0) | 0 | 0, $156($10_1 | 0) | 0 | 0, $4_1 | 0) | 0;
   }
   label$4 : {
    if (!$6_1) {
     break label$4
    }
    $174(($156($9_1 | 0) | 0) + $4_1 | 0 | 0, $7_1 | 0, $6_1 | 0) | 0;
   }
   $7_1 = $5_1 + $4_1 | 0;
   $2_1 = $3_1 - $7_1 | 0;
   label$5 : {
    if (($3_1 | 0) == ($7_1 | 0)) {
     break label$5
    }
    $174((($156($9_1 | 0) | 0) + $4_1 | 0) + $6_1 | 0 | 0, (($156($10_1 | 0) | 0) + $4_1 | 0) + $5_1 | 0 | 0, $2_1 | 0) | 0;
   }
   label$6 : {
    $1_1 = $1_1 + 1 | 0;
    if (($1_1 | 0) == (11 | 0)) {
     break label$6
    }
    $175($171($0_1 | 0) | 0 | 0, $10_1 | 0, $1_1 | 0);
   }
   $176($0_1 | 0, $9_1 | 0);
   $177($0_1 | 0, HEAP32[($8_1 + 8 | 0) >> 2] | 0 | 0);
   $4_1 = ($6_1 + $4_1 | 0) + $2_1 | 0;
   $178($0_1 | 0, $4_1 | 0);
   HEAP8[($8_1 + 12 | 0) >> 0] = 0;
   $167($9_1 + $4_1 | 0 | 0, $8_1 + 12 | 0 | 0);
   global$0 = $8_1 + 16 | 0;
   return;
  }
  $179($0_1 | 0);
  wasm2js_trap();
 }
 
 function $158($0_1) {
  $0_1 = $0_1 | 0;
  return (HEAPU8[(($198($0_1 | 0) | 0) + 11 | 0) >> 0] | 0) >>> 7 | 0 | 0;
 }
 
 function $159($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[(($198($0_1 | 0) | 0) + 4 | 0) >> 2] | 0 | 0;
 }
 
 function $160($0_1) {
  $0_1 = $0_1 | 0;
  return (HEAPU8[(($198($0_1 | 0) | 0) + 11 | 0) >> 0] | 0) & 127 | 0 | 0;
 }
 
 function $161($0_1) {
  $0_1 = $0_1 | 0;
  fimport$4();
  wasm2js_trap();
 }
 
 function $162($0_1) {
  $0_1 = $0_1 | 0;
  return (HEAP32[(($198($0_1 | 0) | 0) + 8 | 0) >> 2] | 0) & 2147483647 | 0 | 0;
 }
 
 function $163($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[($189($0_1 | 0) | 0) >> 2] | 0 | 0;
 }
 
 function $164($0_1) {
  $0_1 = $0_1 | 0;
  return $190($189($0_1 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $165($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  label$1 : {
   if (!$2_1) {
    break label$1
   }
   $148($0_1 | 0, $1_1 | 0, $2_1 | 0) | 0;
  }
  return $0_1 | 0;
 }
 
 function $166($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if (!($158($0_1 | 0) | 0)) {
    break label$1
   }
   $178($0_1 | 0, $1_1 | 0);
   return;
  }
  $184($0_1 | 0, $1_1 | 0);
 }
 
 function $167($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  HEAP8[$0_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
 }
 
 function $168($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = $186($185($0_1 | 0) | 0 | 0) | 0;
  return ($0_1 >>> ($0_1 >>> 0 > (($187() | 0) >>> 1 | 0) >>> 0) | 0) + -16 | 0 | 0;
 }
 
 function $169($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $204($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $170($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $7_1 = 0;
  $1_1 = 10;
  label$1 : {
   if ($0_1 >>> 0 < 11 >>> 0) {
    break label$1
   }
   $0_1 = $193($0_1 + 1 | 0 | 0) | 0;
   $7_1 = $0_1;
   $0_1 = $0_1 + -1 | 0;
   $1_1 = ($0_1 | 0) == (11 | 0) ? $7_1 : $0_1;
  }
  return $1_1 | 0;
 }
 
 function $171($0_1) {
  $0_1 = $0_1 | 0;
  return $192($0_1 | 0) | 0 | 0;
 }
 
 function $172($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $1_1 = $191($1_1 | 0, $2_1 | 0) | 0;
  HEAP32[($0_1 + 4 | 0) >> 2] = $2_1;
  HEAP32[$0_1 >> 2] = $1_1;
 }
 
 function $173($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
 }
 
 function $174($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $194($1_1 | 0, $2_1 | 0, $0_1 | 0) | 0;
  return $0_1 | 0;
 }
 
 function $175($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $199($0_1 | 0, $1_1 | 0, $2_1 | 0);
 }
 
 function $176($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  HEAP32[($189($0_1 | 0) | 0) >> 2] = $1_1;
 }
 
 function $177($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = $189($0_1 | 0) | 0;
  HEAP32[($2_1 + 8 | 0) >> 2] = (HEAP32[($2_1 + 8 | 0) >> 2] | 0) & -2147483648 | 0 | ($1_1 & 2147483647 | 0) | 0;
  $0_1 = $189($0_1 | 0) | 0;
  HEAP32[($0_1 + 8 | 0) >> 2] = HEAP32[($0_1 + 8 | 0) >> 2] | 0 | -2147483648 | 0;
 }
 
 function $178($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  HEAP32[(($189($0_1 | 0) | 0) + 4 | 0) >> 2] = $1_1;
 }
 
 function $179($0_1) {
  $0_1 = $0_1 | 0;
  $188(65595 | 0);
  wasm2js_trap();
 }
 
 function $180($0_1) {
  $0_1 = $0_1 | 0;
  return $182($181($0_1 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $181($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if (!($158($0_1 | 0) | 0)) {
    break label$1
   }
   return $224($0_1 | 0) | 0 | 0;
  }
  return $225($0_1 | 0) | 0 | 0;
 }
 
 function $182($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $183($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 >>> 0 < 11 >>> 0 | 0;
 }
 
 function $184($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = $189($0_1 | 0) | 0;
  HEAP8[($2_1 + 11 | 0) >> 0] = (HEAPU8[($2_1 + 11 | 0) >> 0] | 0) & 128 | 0 | ($1_1 & 127 | 0) | 0;
  $0_1 = $189($0_1 | 0) | 0;
  HEAP8[($0_1 + 11 | 0) >> 0] = (HEAPU8[($0_1 + 11 | 0) >> 0] | 0) & 127 | 0;
 }
 
 function $185($0_1) {
  $0_1 = $0_1 | 0;
  return $228($0_1 | 0) | 0 | 0;
 }
 
 function $186($0_1) {
  $0_1 = $0_1 | 0;
  return $187() | 0 | 0;
 }
 
 function $187() {
  return $229() | 0 | 0;
 }
 
 function $188($0_1) {
  $0_1 = $0_1 | 0;
  fimport$4();
  wasm2js_trap();
 }
 
 function $189($0_1) {
  $0_1 = $0_1 | 0;
  return $231($0_1 | 0) | 0 | 0;
 }
 
 function $190($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $191($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if (($186($0_1 | 0) | 0) >>> 0 >= $1_1 >>> 0) {
    break label$1
   }
   $232();
   wasm2js_trap();
  }
  return $233($1_1 | 0, 1 | 0) | 0 | 0;
 }
 
 function $192($0_1) {
  $0_1 = $0_1 | 0;
  return $237($0_1 | 0) | 0 | 0;
 }
 
 function $193($0_1) {
  $0_1 = $0_1 | 0;
  return ($0_1 + 15 | 0) & -16 | 0 | 0;
 }
 
 function $194($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $238($0_1 | 0, $0_1 + $1_1 | 0 | 0, $2_1 | 0) | 0 | 0;
 }
 
 function $195($0_1) {
  $0_1 = $0_1 | 0;
  return $196($0_1 | 0) | 0 | 0;
 }
 
 function $196($0_1) {
  $0_1 = $0_1 | 0;
  return $95($0_1 | 0) | 0 | 0;
 }
 
 function $197($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if (!($158($0_1 | 0) | 0)) {
    break label$1
   }
   $175($171($0_1 | 0) | 0 | 0, $163($0_1 | 0) | 0 | 0, $162($0_1 | 0) | 0 | 0);
  }
  return $0_1 | 0;
 }
 
 function $198($0_1) {
  $0_1 = $0_1 | 0;
  return $227($0_1 | 0) | 0 | 0;
 }
 
 function $199($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $261($1_1 | 0, $2_1 | 0, 1 | 0);
 }
 
 function $200($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP8[($3_1 + 15 | 0) >> 0] = $2_1;
  $201($0_1 | 0, $1_1 | 0, $3_1 + 15 | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $201($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $267($0_1 | 0, $266($1_1 | 0) | 0 | 0, $2_1 | 0) | 0 | 0;
 }
 
 function $202($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  label$1 : {
   if (($168($0_1 | 0) | 0) >>> 0 < $2_1 >>> 0) {
    break label$1
   }
   label$2 : {
    label$3 : {
     if (!($183($2_1 | 0) | 0)) {
      break label$3
     }
     $184($0_1 | 0, $2_1 | 0);
     $4_1 = $164($0_1 | 0) | 0;
     break label$2;
    }
    $172($3_1 + 8 | 0 | 0, $171($0_1 | 0) | 0 | 0, ($170($2_1 | 0) | 0) + 1 | 0 | 0);
    $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
    $173($4_1 | 0, HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
    $176($0_1 | 0, $4_1 | 0);
    $177($0_1 | 0, HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
    $178($0_1 | 0, $2_1 | 0);
   }
   $174($156($4_1 | 0) | 0 | 0, $1_1 | 0, $2_1 | 0) | 0;
   HEAP8[($3_1 + 7 | 0) >> 0] = 0;
   $167($4_1 + $2_1 | 0 | 0, $3_1 + 7 | 0 | 0);
   global$0 = $3_1 + 16 | 0;
   return;
  }
  $179($0_1 | 0);
  wasm2js_trap();
 }
 
 function $203($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  label$1 : {
   label$2 : {
    label$3 : {
     if (!($183($2_1 | 0) | 0)) {
      break label$3
     }
     $4_1 = $164($0_1 | 0) | 0;
     $184($0_1 | 0, $2_1 | 0);
     break label$2;
    }
    if (($168($0_1 | 0) | 0) >>> 0 < $2_1 >>> 0) {
     break label$1
    }
    $172($3_1 + 8 | 0 | 0, $171($0_1 | 0) | 0 | 0, ($170($2_1 | 0) | 0) + 1 | 0 | 0);
    $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
    $173($4_1 | 0, HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
    $176($0_1 | 0, $4_1 | 0);
    $177($0_1 | 0, HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
    $178($0_1 | 0, $2_1 | 0);
   }
   $174($156($4_1 | 0) | 0 | 0, $1_1 | 0, $2_1 + 1 | 0 | 0) | 0;
   global$0 = $3_1 + 16 | 0;
   return;
  }
  $179($0_1 | 0);
  wasm2js_trap();
 }
 
 function $204($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $3_1 = $223($2_1 + 15 | 0 | 0, $0_1 | 0, $1_1 | 0) | 0;
  global$0 = $2_1 + 16 | 0;
  return ($3_1 ? $1_1 : $0_1) | 0;
 }
 
 function $205($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $5_1 = 0, $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  label$1 : {
   label$2 : {
    $4_1 = $154($0_1 | 0) | 0;
    $5_1 = $153($0_1 | 0) | 0;
    if (($4_1 - $5_1 | 0) >>> 0 < $2_1 >>> 0) {
     break label$2
    }
    if (!$2_1) {
     break label$1
    }
    $4_1 = $156($155($0_1 | 0) | 0 | 0) | 0;
    $174($4_1 + $5_1 | 0 | 0, $1_1 | 0, $2_1 | 0) | 0;
    $2_1 = $5_1 + $2_1 | 0;
    $166($0_1 | 0, $2_1 | 0);
    HEAP8[($3_1 + 15 | 0) >> 0] = 0;
    $167($4_1 + $2_1 | 0 | 0, $3_1 + 15 | 0 | 0);
    break label$1;
   }
   $157($0_1 | 0, $4_1 | 0, ($2_1 - $4_1 | 0) + $5_1 | 0 | 0, $5_1 | 0, $5_1 | 0, 0 | 0, $2_1 | 0, $1_1 | 0);
  }
  global$0 = $3_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $206($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $208($207($0_1 | 0) | 0 | 0, $2_1 | 0) | 0 | 0;
 }
 
 function $207($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $208($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $0_1 | 0;
 }
 
 function $209($0_1) {
  $0_1 = $0_1 | 0;
  $185($0_1 | 0) | 0;
 }
 
 function $210($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $211($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  label$1 : {
   $2_1 = $206($0_1 | 0, $3_1 + 15 | 0 | 0, $2_1 | 0) | 0;
   if (($168($2_1 | 0) | 0) >>> 0 < $1_1 >>> 0) {
    break label$1
   }
   label$2 : {
    label$3 : {
     if (!($183($1_1 | 0) | 0)) {
      break label$3
     }
     $0_1 = $189($2_1 | 0) | 0;
     HEAP32[$0_1 >> 2] = 0;
     HEAP32[($0_1 + 4 | 0) >> 2] = 0;
     HEAP32[($0_1 + 8 | 0) >> 2] = 0;
     $184($2_1 | 0, $1_1 | 0);
     break label$2;
    }
    $0_1 = $170($1_1 | 0) | 0;
    $0_1 = $0_1 + 1 | 0;
    $4_1 = $212($171($2_1 | 0) | 0 | 0, $0_1 | 0) | 0;
    $173($4_1 | 0, $0_1 | 0);
    $177($2_1 | 0, $0_1 | 0);
    $176($2_1 | 0, $4_1 | 0);
    $178($2_1 | 0, $1_1 | 0);
   }
   global$0 = $3_1 + 16 | 0;
   return $2_1 | 0;
  }
  $179($2_1 | 0);
  wasm2js_trap();
 }
 
 function $212($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $191($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $213($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = $215($0_1 | 0, $2_1 + 15 | 0 | 0, $2_1 + 14 | 0 | 0) | 0;
  $202($0_1 | 0, $1_1 | 0, $195($1_1 | 0) | 0 | 0);
  global$0 = $2_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $214($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  $271($1_1 + 4 | 0 | 0, $0_1 | 0, 65612 | 0);
  $161($268($1_1 + 4 | 0 | 0) | 0 | 0);
  wasm2js_trap();
 }
 
 function $215($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $273($207($0_1 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $216($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $4_1 = $213($3_1 + 4 | 0 | 0, 65589 | 0) | 0;
  i64toi32_i32$0 = $217($4_1 | 0, $0_1 | 0, $1_1 | 0, $2_1 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  $197($4_1 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $217($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = $218($0_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $218($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0, $5_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $6_1 = 0, $6$hi = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 0;
  $1_1 = $268($1_1 | 0) | 0;
  $5_1 = $106() | 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = HEAP32[$5_1 >> 2] | 0;
  HEAP32[$5_1 >> 2] = 0;
  i64toi32_i32$0 = $152($1_1 | 0, $4_1 + 12 | 0 | 0, $3_1 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  $6_1 = i64toi32_i32$0;
  $6$hi = i64toi32_i32$1;
  $269($5_1 | 0, $4_1 + 8 | 0 | 0);
  label$1 : {
   label$2 : {
    if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) == (68 | 0)) {
     break label$2
    }
    $5_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
    if (($5_1 | 0) == ($1_1 | 0)) {
     break label$1
    }
    label$3 : {
     if (!$2_1) {
      break label$3
     }
     HEAP32[$2_1 >> 2] = $5_1 - $1_1 | 0;
    }
    global$0 = $4_1 + 16 | 0;
    i64toi32_i32$1 = $6$hi;
    i64toi32_i32$0 = $6_1;
    i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
    return i64toi32_i32$0 | 0;
   }
   $214($0_1 | 0);
   wasm2js_trap();
  }
  $270($0_1 | 0);
  wasm2js_trap();
 }
 
 function $219($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $0_1 = $215($0_1 | 0, $3_1 + 15 | 0 | 0, $3_1 + 14 | 0 | 0) | 0;
  $276($0_1 | 0, $1_1 | 0, $2_1 | 0);
  global$0 = $3_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $220($0_1, $1_1, $1$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  var i64toi32_i32$0 = 0;
  i64toi32_i32$0 = $1$hi;
  $221($0_1 | 0, $1_1 | 0, i64toi32_i32$0 | 0);
 }
 
 function $221($0_1, $1_1, $1$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  var $2_1 = 0, i64toi32_i32$0 = 0;
  $2_1 = global$0 - 48 | 0;
  global$0 = $2_1;
  i64toi32_i32$0 = $1$hi;
  $222($2_1 + 8 | 0 | 0, $2_1 + 16 | 0 | 0, $2_1 + 36 | 0 | 0, $1_1 | 0, i64toi32_i32$0 | 0);
  $219($0_1 | 0, $2_1 + 16 | 0 | 0, HEAP32[($2_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $2_1 + 48 | 0;
 }
 
 function $222($0_1, $1_1, $2_1, $3_1, $3$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $3$hi = $3$hi | 0;
  var i64toi32_i32$0 = 0;
  i64toi32_i32$0 = $3$hi;
  $292($0_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0, i64toi32_i32$0 | 0);
 }
 
 function $223($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return (HEAP32[$1_1 >> 2] | 0) >>> 0 < (HEAP32[$2_1 >> 2] | 0) >>> 0 | 0;
 }
 
 function $224($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[($198($0_1 | 0) | 0) >> 2] | 0 | 0;
 }
 
 function $225($0_1) {
  $0_1 = $0_1 | 0;
  return $226($198($0_1 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $226($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $227($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $228($0_1) {
  $0_1 = $0_1 | 0;
  return $230($0_1 | 0) | 0 | 0;
 }
 
 function $229() {
  return -1 | 0;
 }
 
 function $230($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $231($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $232() {
  fimport$4();
  wasm2js_trap();
 }
 
 function $233($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if (!($234($1_1 | 0) | 0)) {
    break label$1
   }
   return $235($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  return $236($0_1 | 0) | 0 | 0;
 }
 
 function $234($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 >>> 0 > 8 >>> 0 | 0;
 }
 
 function $235($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $144($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $236($0_1) {
  $0_1 = $0_1 | 0;
  return $142($0_1 | 0) | 0 | 0;
 }
 
 function $237($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $238($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $239($3_1 + 8 | 0 | 0, $0_1 | 0, $1_1 | 0, $2_1 | 0);
  $2_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $2_1 | 0;
 }
 
 function $239($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $240($0_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0);
 }
 
 function $240($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $241($0_1 | 0, $1_1 | 0, $2_1 | 0, $3_1 | 0);
 }
 
 function $241($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  $242($4_1 + 24 | 0 | 0, $1_1 | 0, $2_1 | 0);
  $244($4_1 + 16 | 0 | 0, $4_1 + 12 | 0 | 0, HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 28 | 0) >> 2] | 0 | 0, $243($3_1 | 0) | 0 | 0);
  HEAP32[($4_1 + 12 | 0) >> 2] = $245($1_1 | 0, HEAP32[($4_1 + 16 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = $246($3_1 | 0, HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0) | 0;
  $247($0_1 | 0, $4_1 + 12 | 0 | 0, $4_1 + 8 | 0 | 0);
  global$0 = $4_1 + 32 | 0;
 }
 
 function $242($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $248($0_1 | 0, $1_1 | 0, $2_1 | 0);
 }
 
 function $243($0_1) {
  $0_1 = $0_1 | 0;
  return $250($0_1 | 0) | 0 | 0;
 }
 
 function $244($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $249($0_1 | 0, $2_1 | 0, $3_1 | 0, $4_1 | 0);
 }
 
 function $245($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $252($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $246($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $253($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $247($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $251($0_1 | 0, $1_1 | 0, $2_1 | 0) | 0;
 }
 
 function $248($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $254($1_1 | 0) | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $254($2_1 | 0) | 0;
  $255($0_1 | 0, $3_1 + 12 | 0 | 0, $3_1 + 8 | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
 }
 
 function $249($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
  $2_1 = $2_1 - $1_1 | 0;
  $165($3_1 | 0, $1_1 | 0, $2_1 | 0) | 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = $3_1 + $2_1 | 0;
  $257($0_1 | 0, $4_1 + 12 | 0 | 0, $4_1 + 8 | 0 | 0);
  global$0 = $4_1 + 16 | 0;
 }
 
 function $250($0_1) {
  $0_1 = $0_1 | 0;
  return $156($0_1 | 0) | 0 | 0;
 }
 
 function $251($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
  HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[$2_1 >> 2] | 0;
  return $0_1 | 0;
 }
 
 function $252($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $259($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $253($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $0_1 + ($1_1 - ($156($0_1 | 0) | 0) | 0) | 0 | 0;
 }
 
 function $254($0_1) {
  $0_1 = $0_1 | 0;
  return $256($0_1 | 0) | 0 | 0;
 }
 
 function $255($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
  HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[$2_1 >> 2] | 0;
  return $0_1 | 0;
 }
 
 function $256($0_1) {
  $0_1 = $0_1 | 0;
  return $182($0_1 | 0) | 0 | 0;
 }
 
 function $257($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $258($0_1 | 0, $1_1 | 0, $2_1 | 0) | 0;
 }
 
 function $258($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
  HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[$2_1 >> 2] | 0;
  return $0_1 | 0;
 }
 
 function $259($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $260($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $260($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $0_1 + ($1_1 - ($182($0_1 | 0) | 0) | 0) | 0 | 0;
 }
 
 function $261($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  label$1 : {
   if (!($234($2_1 | 0) | 0)) {
    break label$1
   }
   $262($0_1 | 0, $1_1 | 0, $2_1 | 0);
   return;
  }
  $263($0_1 | 0, $1_1 | 0);
 }
 
 function $262($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $264($0_1 | 0, $2_1 | 0);
 }
 
 function $263($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $265($0_1 | 0);
 }
 
 function $264($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $146($0_1 | 0, $1_1 | 0);
 }
 
 function $265($0_1) {
  $0_1 = $0_1 | 0;
  $143($0_1 | 0);
 }
 
 function $266($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $267($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  label$1 : {
   label$2 : while (1) {
    if (!$1_1) {
     break label$1
    }
    HEAP8[$0_1 >> 0] = HEAPU8[$2_1 >> 0] | 0;
    $1_1 = $1_1 + -1 | 0;
    $0_1 = $0_1 + 1 | 0;
    continue label$2;
   };
  }
  return $0_1 | 0;
 }
 
 function $268($0_1) {
  $0_1 = $0_1 | 0;
  return $180($0_1 | 0) | 0 | 0;
 }
 
 function $269($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = HEAP32[$0_1 >> 2] | 0;
  HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
  HEAP32[$1_1 >> 2] = $2_1;
 }
 
 function $270($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  $271($1_1 + 4 | 0 | 0, $0_1 | 0, 65569 | 0);
  $272($268($1_1 + 4 | 0 | 0) | 0 | 0);
  wasm2js_trap();
 }
 
 function $271($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $4_1 = $153($1_1 | 0) | 0;
  $5_1 = $195($2_1 | 0) | 0;
  $209($1_1 | 0);
  $210($3_1 + 14 | 0 | 0);
  $0_1 = $156($155($211($0_1 | 0, $5_1 + $4_1 | 0 | 0, $3_1 + 15 | 0 | 0) | 0 | 0) | 0 | 0) | 0;
  $174($0_1 | 0, $180($1_1 | 0) | 0 | 0, $4_1 | 0) | 0;
  $1_1 = $0_1 + $4_1 | 0;
  $174($1_1 | 0, $2_1 | 0, $5_1 | 0) | 0;
  $200($1_1 + $5_1 | 0 | 0, 1 | 0, 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
 }
 
 function $272($0_1) {
  $0_1 = $0_1 | 0;
  fimport$4();
  wasm2js_trap();
 }
 
 function $273($0_1) {
  $0_1 = $0_1 | 0;
  return $274($0_1 | 0) | 0 | 0;
 }
 
 function $274($0_1) {
  $0_1 = $0_1 | 0;
  return $275($0_1 | 0) | 0 | 0;
 }
 
 function $275($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $276($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $290($0_1 | 0, $1_1 | 0, $2_1 | 0, $289($1_1 | 0, $2_1 | 0) | 0 | 0);
 }
 
 function $277($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  label$1 : {
   if ($1_1 >>> 0 > 999999 >>> 0) {
    break label$1
   }
   label$2 : {
    if ($1_1 >>> 0 > 9999 >>> 0) {
     break label$2
    }
    label$3 : {
     if ($1_1 >>> 0 > 99 >>> 0) {
      break label$3
     }
     label$4 : {
      if ($1_1 >>> 0 > 9 >>> 0) {
       break label$4
      }
      return $278($0_1 | 0, $1_1 | 0) | 0 | 0;
     }
     return $279($0_1 | 0, $1_1 | 0) | 0 | 0;
    }
    label$5 : {
     if ($1_1 >>> 0 > 999 >>> 0) {
      break label$5
     }
     return $280($0_1 | 0, $1_1 | 0) | 0 | 0;
    }
    return $281($0_1 | 0, $1_1 | 0) | 0 | 0;
   }
   label$6 : {
    if ($1_1 >>> 0 > 99999 >>> 0) {
     break label$6
    }
    return $282($0_1 | 0, $1_1 | 0) | 0 | 0;
   }
   return $283($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  label$7 : {
   if ($1_1 >>> 0 > 99999999 >>> 0) {
    break label$7
   }
   label$8 : {
    if ($1_1 >>> 0 > 9999999 >>> 0) {
     break label$8
    }
    return $284($0_1 | 0, $1_1 | 0) | 0 | 0;
   }
   return $285($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  label$9 : {
   if ($1_1 >>> 0 > 999999999 >>> 0) {
    break label$9
   }
   return $286($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  return $287($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $278($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  HEAP8[$0_1 >> 0] = $1_1 + 48 | 0;
  return $0_1 + 1 | 0 | 0;
 }
 
 function $279($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $288(66160 + ($1_1 << 1 | 0) | 0 | 0, 2 | 0, $0_1 | 0) | 0 | 0;
 }
 
 function $280($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (100 >>> 0) | 0;
  return $279($278($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 100) | 0 | 0) | 0 | 0;
 }
 
 function $281($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (100 >>> 0) | 0;
  return $279($279($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 100) | 0 | 0) | 0 | 0;
 }
 
 function $282($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (1e4 >>> 0) | 0;
  return $281($278($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 1e4) | 0 | 0) | 0 | 0;
 }
 
 function $283($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (1e4 >>> 0) | 0;
  return $281($279($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 1e4) | 0 | 0) | 0 | 0;
 }
 
 function $284($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (1e6 >>> 0) | 0;
  return $283($278($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 1e6) | 0 | 0) | 0 | 0;
 }
 
 function $285($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (1e6 >>> 0) | 0;
  return $283($279($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 1e6) | 0 | 0) | 0 | 0;
 }
 
 function $286($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (1e8 >>> 0) | 0;
  return $285($278($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 1e8) | 0 | 0) | 0 | 0;
 }
 
 function $287($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = ($1_1 >>> 0) / (1e8 >>> 0) | 0;
  return $285($279($0_1 | 0, $2_1 | 0) | 0 | 0, $1_1 - Math_imul($2_1, 1e8) | 0 | 0) | 0 | 0;
 }
 
 function $288($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  return $238($0_1 | 0, $0_1 + $1_1 | 0 | 0, $2_1 | 0) | 0 | 0;
 }
 
 function $289($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $291($0_1 | 0, $1_1 | 0) | 0 | 0;
 }
 
 function $290($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0, $5_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  label$1 : {
   if (($168($0_1 | 0) | 0) >>> 0 < $3_1 >>> 0) {
    break label$1
   }
   label$2 : {
    label$3 : {
     if (!($183($3_1 | 0) | 0)) {
      break label$3
     }
     $184($0_1 | 0, $3_1 | 0);
     $5_1 = $164($0_1 | 0) | 0;
     break label$2;
    }
    $172($4_1 + 8 | 0 | 0, $171($0_1 | 0) | 0 | 0, ($170($3_1 | 0) | 0) + 1 | 0 | 0);
    $5_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    $173($5_1 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
    $176($0_1 | 0, $5_1 | 0);
    $177($0_1 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
    $178($0_1 | 0, $3_1 | 0);
   }
   label$4 : {
    label$5 : while (1) {
     if (($1_1 | 0) == ($2_1 | 0)) {
      break label$4
     }
     $167($5_1 | 0, $1_1 | 0);
     $5_1 = $5_1 + 1 | 0;
     $1_1 = $1_1 + 1 | 0;
     continue label$5;
    };
   }
   HEAP8[($4_1 + 7 | 0) >> 0] = 0;
   $167($5_1 | 0, $4_1 + 7 | 0 | 0);
   global$0 = $4_1 + 16 | 0;
   return;
  }
  $179($0_1 | 0);
  wasm2js_trap();
 }
 
 function $291($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return $1_1 - $0_1 | 0 | 0;
 }
 
 function $292($0_1, $1_1, $2_1, $3_1, $3$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $3$hi = $3$hi | 0;
  var i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, $4_1 = 0, $4$hi = 0, $11_1 = 0, $12_1 = 0, $13_1 = 0, i64toi32_i32$3 = 0;
  i64toi32_i32$0 = $3$hi;
  i64toi32_i32$0 = $293($3_1 | 0, i64toi32_i32$0 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  $4_1 = i64toi32_i32$0;
  $4$hi = i64toi32_i32$1;
  label$1 : {
   if (($1_1 | 0) == ($2_1 | 0)) {
    break label$1
   }
   i64toi32_i32$1 = $3$hi;
   i64toi32_i32$2 = $3_1;
   i64toi32_i32$0 = -1;
   i64toi32_i32$3 = -1;
   if ((i64toi32_i32$1 | 0) > (i64toi32_i32$0 | 0)) {
    $11_1 = 1
   } else {
    if ((i64toi32_i32$1 | 0) >= (i64toi32_i32$0 | 0)) {
     if (i64toi32_i32$2 >>> 0 <= i64toi32_i32$3 >>> 0) {
      $12_1 = 0
     } else {
      $12_1 = 1
     }
     $13_1 = $12_1;
    } else {
     $13_1 = 0
    }
    $11_1 = $13_1;
   }
   if ($11_1) {
    break label$1
   }
   HEAP8[$1_1 >> 0] = 45;
   $1_1 = $1_1 + 1 | 0;
   i64toi32_i32$2 = $4$hi;
   i64toi32_i32$2 = $294($4_1 | 0, i64toi32_i32$2 | 0) | 0;
   i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
   $4_1 = i64toi32_i32$2;
   $4$hi = i64toi32_i32$1;
  }
  i64toi32_i32$1 = $4$hi;
  $295($0_1 | 0, $1_1 | 0, $2_1 | 0, $4_1 | 0, i64toi32_i32$1 | 0);
 }
 
 function $293($0_1, $0$hi) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  var i64toi32_i32$0 = 0;
  i64toi32_i32$0 = $0$hi;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return $0_1 | 0;
 }
 
 function $294($0_1, $0$hi) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$5 = 0, i64toi32_i32$0 = 0, i64toi32_i32$3 = 0;
  i64toi32_i32$0 = $0$hi;
  i64toi32_i32$0 = 0;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = $0_1;
  i64toi32_i32$5 = (i64toi32_i32$2 >>> 0 < i64toi32_i32$3 >>> 0) + $0$hi | 0;
  i64toi32_i32$5 = i64toi32_i32$0 - i64toi32_i32$5 | 0;
  i64toi32_i32$2 = i64toi32_i32$2 - i64toi32_i32$3 | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$5;
  return i64toi32_i32$2 | 0;
 }
 
 function $295($0_1, $1_1, $2_1, $3_1, $3$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $3$hi = $3$hi | 0;
  var i64toi32_i32$0 = 0, $4_1 = 0, $5_1 = 0;
  label$1 : {
   label$2 : {
    $4_1 = $2_1 - $1_1 | 0;
    if (($4_1 | 0) > (19 | 0)) {
     break label$2
    }
    $5_1 = 61;
    i64toi32_i32$0 = $3$hi;
    if (($296($3_1 | 0, i64toi32_i32$0 | 0) | 0 | 0) > ($4_1 | 0)) {
     break label$1
    }
   }
   $5_1 = 0;
   i64toi32_i32$0 = $3$hi;
   $2_1 = $297($1_1 | 0, $3_1 | 0, i64toi32_i32$0 | 0) | 0;
  }
  HEAP32[($0_1 + 4 | 0) >> 2] = $5_1;
  HEAP32[$0_1 >> 2] = $2_1;
 }
 
 function $296($0_1, $0$hi) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  var i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, $1_1 = 0, $12$hi = 0;
  i64toi32_i32$0 = $0$hi;
  i64toi32_i32$2 = $0_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
  $1_1 = Math_imul(64 - ($298(i64toi32_i32$2 | 1 | 0 | 0, i64toi32_i32$1 | 0) | 0) | 0, 1233) >> 12 | 0;
  i64toi32_i32$0 = 66368 + ($1_1 << 3 | 0) | 0;
  i64toi32_i32$1 = HEAP32[i64toi32_i32$0 >> 2] | 0;
  i64toi32_i32$2 = HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] | 0;
  $12$hi = i64toi32_i32$2;
  i64toi32_i32$2 = $0$hi;
  i64toi32_i32$2 = $12$hi;
  i64toi32_i32$0 = i64toi32_i32$1;
  i64toi32_i32$1 = $0$hi;
  return $1_1 + (i64toi32_i32$2 >>> 0 < i64toi32_i32$1 >>> 0 | ((i64toi32_i32$2 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$0 >>> 0 <= $0_1 >>> 0 | 0) | 0) | 0 | 0;
 }
 
 function $297($0_1, $1_1, $1$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  var i64toi32_i32$0 = 0;
  i64toi32_i32$0 = $1$hi;
  return $299($0_1 | 0, $1_1 | 0, i64toi32_i32$0 | 0) | 0 | 0;
 }
 
 function $298($0_1, $0$hi) {
  $0_1 = $0_1 | 0;
  $0$hi = $0$hi | 0;
  var i64toi32_i32$3 = 0, $5_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$2 = 0;
  i64toi32_i32$0 = $0$hi;
  i64toi32_i32$3 = Math_clz32(i64toi32_i32$0);
  i64toi32_i32$2 = 0;
  if ((i64toi32_i32$3 | 0) == (32 | 0)) {
   $5_1 = Math_clz32($0_1) + 32 | 0
  } else {
   $5_1 = i64toi32_i32$3
  }
  return $5_1 | 0;
 }
 
 function $299($0_1, $1_1, $1$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, i64toi32_i32$0 = 0, i64toi32_i32$5 = 0, i64toi32_i32$1 = 0, $2_1 = 0, $2$hi = 0, $15_1 = 0, $15$hi = 0;
  label$1 : {
   i64toi32_i32$0 = $1$hi;
   i64toi32_i32$2 = $1_1;
   i64toi32_i32$1 = 0;
   i64toi32_i32$3 = -1;
   if (i64toi32_i32$0 >>> 0 > i64toi32_i32$1 >>> 0 | ((i64toi32_i32$0 | 0) == (i64toi32_i32$1 | 0) & i64toi32_i32$2 >>> 0 > i64toi32_i32$3 >>> 0 | 0) | 0) {
    break label$1
   }
   i64toi32_i32$2 = i64toi32_i32$0;
   return $277($0_1 | 0, $1_1 | 0) | 0 | 0;
  }
  label$2 : {
   i64toi32_i32$2 = $1$hi;
   i64toi32_i32$3 = $1_1;
   i64toi32_i32$0 = 2;
   i64toi32_i32$1 = 1410065408;
   if (i64toi32_i32$2 >>> 0 < i64toi32_i32$0 >>> 0 | ((i64toi32_i32$2 | 0) == (i64toi32_i32$0 | 0) & i64toi32_i32$3 >>> 0 < i64toi32_i32$1 >>> 0 | 0) | 0) {
    break label$2
   }
   i64toi32_i32$3 = i64toi32_i32$2;
   i64toi32_i32$3 = i64toi32_i32$2;
   i64toi32_i32$3 = i64toi32_i32$2;
   i64toi32_i32$2 = 2;
   i64toi32_i32$2 = __wasm_i64_udiv($1_1 | 0, i64toi32_i32$3 | 0, 1410065408 | 0, i64toi32_i32$2 | 0) | 0;
   i64toi32_i32$3 = i64toi32_i32$HIGH_BITS;
   $2_1 = i64toi32_i32$2;
   $2$hi = i64toi32_i32$3;
   i64toi32_i32$2 = 2;
   i64toi32_i32$2 = __wasm_i64_mul($2_1 | 0, i64toi32_i32$3 | 0, 1410065408 | 0, i64toi32_i32$2 | 0) | 0;
   i64toi32_i32$3 = i64toi32_i32$HIGH_BITS;
   $15_1 = i64toi32_i32$2;
   $15$hi = i64toi32_i32$3;
   i64toi32_i32$3 = $1$hi;
   i64toi32_i32$1 = $1_1;
   i64toi32_i32$2 = $15$hi;
   i64toi32_i32$0 = $15_1;
   i64toi32_i32$5 = ($1_1 >>> 0 < i64toi32_i32$0 >>> 0) + i64toi32_i32$2 | 0;
   i64toi32_i32$5 = i64toi32_i32$3 - i64toi32_i32$5 | 0;
   $1_1 = $1_1 - i64toi32_i32$0 | 0;
   $1$hi = i64toi32_i32$5;
   i64toi32_i32$5 = $2$hi;
   $0_1 = $277($0_1 | 0, $2_1 | 0) | 0;
  }
  i64toi32_i32$5 = $1$hi;
  return $300($0_1 | 0, $1_1 | 0, i64toi32_i32$5 | 0) | 0 | 0;
 }
 
 function $300($0_1, $1_1, $1$hi) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, i64toi32_i32$5 = 0, $2_1 = 0, $2$hi = 0, $8_1 = 0, $11_1 = 0, $11$hi = 0;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$1 = 0;
  i64toi32_i32$1 = __wasm_i64_udiv($1_1 | 0, i64toi32_i32$0 | 0, 1e8 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $2_1 = i64toi32_i32$1;
  $2$hi = i64toi32_i32$0;
  $8_1 = $279($0_1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$0 = $2$hi;
  i64toi32_i32$1 = 0;
  i64toi32_i32$1 = __wasm_i64_mul($2_1 | 0, i64toi32_i32$0 | 0, 1e8 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $11_1 = i64toi32_i32$1;
  $11$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$1 = $11$hi;
  i64toi32_i32$3 = $11_1;
  i64toi32_i32$5 = ($1_1 >>> 0 < i64toi32_i32$3 >>> 0) + i64toi32_i32$1 | 0;
  i64toi32_i32$5 = i64toi32_i32$0 - i64toi32_i32$5 | 0;
  return $285($8_1 | 0, $1_1 - i64toi32_i32$3 | 0 | 0) | 0 | 0;
 }
 
 function $301($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $302($0_1) {
  $0_1 = $0_1 | 0;
  return fimport$5($301(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0;
 }
 
 function $303($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, $3_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  i64toi32_i32$0 = $1$hi;
  $2_1 = $123($320($0_1 | 0, $1_1 | 0, i64toi32_i32$0 | 0, $2_1 & 255 | 0 | 0, $3_1 + 8 | 0 | 0) | 0 | 0) | 0;
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 8 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 12 | 0) >> 2] | 0;
  $1_1 = i64toi32_i32$0;
  $1$hi = i64toi32_i32$1;
  global$0 = i64toi32_i32$2 + 16 | 0;
  i64toi32_i32$1 = -1;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$3 = $2_1 ? -1 : $1_1;
  i64toi32_i32$2 = $2_1 ? i64toi32_i32$1 : i64toi32_i32$0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$2;
  return i64toi32_i32$3 | 0;
 }
 
 function $304($0_1, $1_1, $1$hi, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = $1$hi;
  i64toi32_i32$0 = $303(HEAP32[($0_1 + 60 | 0) >> 2] | 0 | 0, $1_1 | 0, i64toi32_i32$0 | 0, $2_1 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $305($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[$0_1 >> 2] | 0 | 0;
 }
 
 function $306() {
  return $305(68632 | 0) | 0 | 0;
 }
 
 function $307($0_1) {
  $0_1 = $0_1 | 0;
  global$1 = $0_1;
 }
 
 function $309($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, i64toi32_i32$1 = 0, $2_1 = 0, i64toi32_i32$0 = 0, $3_1 = 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   $1_1 = 0;
   label$2 : {
    if (!(HEAP32[(0 + 66672 | 0) >> 2] | 0)) {
     break label$2
    }
    $1_1 = $309(HEAP32[(0 + 66672 | 0) >> 2] | 0 | 0) | 0;
   }
   label$3 : {
    if (!(HEAP32[(0 + 66824 | 0) >> 2] | 0)) {
     break label$3
    }
    $1_1 = $309(HEAP32[(0 + 66824 | 0) >> 2] | 0 | 0) | 0 | $1_1 | 0;
   }
   label$4 : {
    $0_1 = HEAP32[($101() | 0) >> 2] | 0;
    if (!$0_1) {
     break label$4
    }
    label$5 : while (1) {
     $2_1 = 0;
     label$6 : {
      if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) < (0 | 0)) {
       break label$6
      }
      $2_1 = $97($0_1 | 0) | 0;
     }
     label$7 : {
      if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
       break label$7
      }
      $1_1 = $309($0_1 | 0) | 0 | $1_1 | 0;
     }
     label$8 : {
      if (!$2_1) {
       break label$8
      }
      $98($0_1 | 0);
     }
     $0_1 = HEAP32[($0_1 + 56 | 0) >> 2] | 0;
     if ($0_1) {
      continue label$5
     }
     break label$5;
    };
   }
   $102();
   return $1_1 | 0;
  }
  label$9 : {
   label$10 : {
    if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) >= (0 | 0)) {
     break label$10
    }
    $2_1 = 1;
    break label$9;
   }
   $2_1 = !($97($0_1 | 0) | 0);
  }
  label$11 : {
   label$12 : {
    label$13 : {
     if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
      break label$13
     }
     FUNCTION_TABLE[HEAP32[($0_1 + 36 | 0) >> 2] | 0 | 0]($0_1, 0, 0) | 0;
     if (HEAP32[($0_1 + 20 | 0) >> 2] | 0) {
      break label$13
     }
     $1_1 = -1;
     if (!$2_1) {
      break label$12
     }
     break label$11;
    }
    label$14 : {
     $1_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
     $3_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
     if (($1_1 | 0) == ($3_1 | 0)) {
      break label$14
     }
     i64toi32_i32$1 = $1_1 - $3_1 | 0;
     i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
     i64toi32_i32$0 = FUNCTION_TABLE[HEAP32[($0_1 + 40 | 0) >> 2] | 0 | 0]($0_1, i64toi32_i32$1, i64toi32_i32$0, 1) | 0;
     i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    }
    $1_1 = 0;
    HEAP32[($0_1 + 28 | 0) >> 2] = 0;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 16 | 0) >> 2] = 0;
    HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$1;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 4 | 0) >> 2] = 0;
    HEAP32[($0_1 + 8 | 0) >> 2] = i64toi32_i32$1;
    if ($2_1) {
     break label$11
    }
   }
   $98($0_1 | 0);
  }
  return $1_1 | 0;
 }
 
 function $310() {
  return global$0 | 0;
 }
 
 function $311($0_1) {
  $0_1 = $0_1 | 0;
  global$0 = $0_1;
 }
 
 function $312($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = (global$0 - $0_1 | 0) & -16 | 0;
  global$0 = $1_1;
  return $1_1 | 0;
 }
 
 function $313() {
  return global$0 | 0;
 }
 
 function $314() {
  global$3 = 65536;
  global$2 = (0 + 15 | 0) & -16 | 0;
 }
 
 function $315() {
  return global$0 - global$2 | 0 | 0;
 }
 
 function $316() {
  return global$3 | 0;
 }
 
 function $317() {
  return global$2 | 0;
 }
 
 function $318($0_1, $1_1, $2_1, $2$hi, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $2$hi = $2$hi | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = $2$hi;
  i64toi32_i32$0 = FUNCTION_TABLE[$0_1 | 0]($1_1, $2_1, i64toi32_i32$0, $3_1) | 0;
  i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$0 | 0;
 }
 
 function $319($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $17_1 = 0, $18_1 = 0, $6_1 = 0, $7_1 = 0, $9_1 = 0, $9$hi = 0, $12$hi = 0, $5_1 = 0, $5$hi = 0;
  $6_1 = $0_1;
  $7_1 = $1_1;
  i64toi32_i32$0 = 0;
  $9_1 = $2_1;
  $9$hi = i64toi32_i32$0;
  i64toi32_i32$0 = 0;
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
   $17_1 = 0;
  } else {
   i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$4 | 0) | 0;
   $17_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
  }
  $12$hi = i64toi32_i32$1;
  i64toi32_i32$1 = $9$hi;
  i64toi32_i32$0 = $9_1;
  i64toi32_i32$2 = $12$hi;
  i64toi32_i32$3 = $17_1;
  i64toi32_i32$2 = i64toi32_i32$1 | i64toi32_i32$2 | 0;
  i64toi32_i32$2 = $318($6_1 | 0, $7_1 | 0, i64toi32_i32$0 | i64toi32_i32$3 | 0 | 0, i64toi32_i32$2 | 0, $4_1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  $5_1 = i64toi32_i32$2;
  $5$hi = i64toi32_i32$0;
  i64toi32_i32$1 = i64toi32_i32$2;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $18_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $18_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$1 >>> i64toi32_i32$4 | 0) | 0;
  }
  $307($18_1 | 0);
  i64toi32_i32$2 = $5$hi;
  return $5_1 | 0;
 }
 
 function $320($0_1, $1_1, $1$hi, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1$hi = $1$hi | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$3 = 0, $12_1 = 0, $4_1 = 0, $6_1 = 0, i64toi32_i32$2 = 0;
  $4_1 = $0_1;
  i64toi32_i32$0 = $1$hi;
  $6_1 = $1_1;
  i64toi32_i32$2 = $1_1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = 0;
   $12_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $12_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  return fimport$6($4_1 | 0, $6_1 | 0, $12_1 | 0, $2_1 | 0, $3_1 | 0) | 0 | 0;
 }
 
 function _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$4 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, var$2 = 0, i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, var$3 = 0, var$4 = 0, var$5 = 0, $21_1 = 0, $22_1 = 0, var$6 = 0, $24_1 = 0, $17_1 = 0, $18_1 = 0, $23_1 = 0, $29_1 = 0, $45_1 = 0, $56$hi = 0, $62$hi = 0;
  i64toi32_i32$0 = var$1$hi;
  var$2 = var$1;
  var$4 = var$2 >>> 16 | 0;
  i64toi32_i32$0 = var$0$hi;
  var$3 = var$0;
  var$5 = var$3 >>> 16 | 0;
  $17_1 = Math_imul(var$4, var$5);
  $18_1 = var$2;
  i64toi32_i32$2 = var$3;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = 0;
   $21_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
   $21_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  $23_1 = $17_1 + Math_imul($18_1, $21_1) | 0;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$0 = var$1;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = 0;
   $22_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
   $22_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
  }
  $29_1 = $23_1 + Math_imul($22_1, var$3) | 0;
  var$2 = var$2 & 65535 | 0;
  var$3 = var$3 & 65535 | 0;
  var$6 = Math_imul(var$2, var$3);
  var$2 = (var$6 >>> 16 | 0) + Math_imul(var$2, var$5) | 0;
  $45_1 = $29_1 + (var$2 >>> 16 | 0) | 0;
  var$2 = (var$2 & 65535 | 0) + Math_imul(var$4, var$3) | 0;
  i64toi32_i32$2 = 0;
  i64toi32_i32$1 = $45_1 + (var$2 >>> 16 | 0) | 0;
  i64toi32_i32$0 = 0;
  i64toi32_i32$3 = 32;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$0 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
   $24_1 = 0;
  } else {
   i64toi32_i32$0 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$1 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$2 << i64toi32_i32$4 | 0) | 0;
   $24_1 = i64toi32_i32$1 << i64toi32_i32$4 | 0;
  }
  $56$hi = i64toi32_i32$0;
  i64toi32_i32$0 = 0;
  $62$hi = i64toi32_i32$0;
  i64toi32_i32$0 = $56$hi;
  i64toi32_i32$2 = $24_1;
  i64toi32_i32$1 = $62$hi;
  i64toi32_i32$3 = var$2 << 16 | 0 | (var$6 & 65535 | 0) | 0;
  i64toi32_i32$1 = i64toi32_i32$0 | i64toi32_i32$1 | 0;
  i64toi32_i32$2 = i64toi32_i32$2 | i64toi32_i32$3 | 0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
  return i64toi32_i32$2 | 0;
 }
 
 function _ZN17compiler_builtins3int4sdiv3Div3div17he78fc483e41d7ec7E(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$4 = 0, i64toi32_i32$3 = 0, i64toi32_i32$0 = 0, i64toi32_i32$5 = 0, var$2 = 0, var$2$hi = 0, i64toi32_i32$6 = 0, $21_1 = 0, $22_1 = 0, $23_1 = 0, $7$hi = 0, $9_1 = 0, $9$hi = 0, $14$hi = 0, $16$hi = 0, $17_1 = 0, $17$hi = 0, $23$hi = 0;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$2 = var$0;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 63;
  i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = i64toi32_i32$0 >> 31 | 0;
   $21_1 = i64toi32_i32$0 >> i64toi32_i32$4 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$0 >> i64toi32_i32$4 | 0;
   $21_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
  }
  var$2 = $21_1;
  var$2$hi = i64toi32_i32$1;
  i64toi32_i32$1 = var$0$hi;
  i64toi32_i32$1 = var$2$hi;
  i64toi32_i32$0 = var$2;
  i64toi32_i32$2 = var$0$hi;
  i64toi32_i32$3 = var$0;
  i64toi32_i32$2 = i64toi32_i32$1 ^ i64toi32_i32$2 | 0;
  $7$hi = i64toi32_i32$2;
  i64toi32_i32$2 = i64toi32_i32$1;
  i64toi32_i32$2 = $7$hi;
  i64toi32_i32$1 = i64toi32_i32$0 ^ i64toi32_i32$3 | 0;
  i64toi32_i32$0 = var$2$hi;
  i64toi32_i32$3 = var$2;
  i64toi32_i32$4 = i64toi32_i32$1 - i64toi32_i32$3 | 0;
  i64toi32_i32$6 = i64toi32_i32$1 >>> 0 < i64toi32_i32$3 >>> 0;
  i64toi32_i32$5 = i64toi32_i32$6 + i64toi32_i32$0 | 0;
  i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$5 | 0;
  $9_1 = i64toi32_i32$4;
  $9$hi = i64toi32_i32$5;
  i64toi32_i32$5 = var$1$hi;
  i64toi32_i32$2 = var$1;
  i64toi32_i32$1 = 0;
  i64toi32_i32$3 = 63;
  i64toi32_i32$0 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$1 = i64toi32_i32$5 >> 31 | 0;
   $22_1 = i64toi32_i32$5 >> i64toi32_i32$0 | 0;
  } else {
   i64toi32_i32$1 = i64toi32_i32$5 >> i64toi32_i32$0 | 0;
   $22_1 = (((1 << i64toi32_i32$0 | 0) - 1 | 0) & i64toi32_i32$5 | 0) << (32 - i64toi32_i32$0 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$0 | 0) | 0;
  }
  var$2 = $22_1;
  var$2$hi = i64toi32_i32$1;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$1 = var$2$hi;
  i64toi32_i32$5 = var$2;
  i64toi32_i32$2 = var$1$hi;
  i64toi32_i32$3 = var$1;
  i64toi32_i32$2 = i64toi32_i32$1 ^ i64toi32_i32$2 | 0;
  $14$hi = i64toi32_i32$2;
  i64toi32_i32$2 = i64toi32_i32$1;
  i64toi32_i32$2 = $14$hi;
  i64toi32_i32$1 = i64toi32_i32$5 ^ i64toi32_i32$3 | 0;
  i64toi32_i32$5 = var$2$hi;
  i64toi32_i32$3 = var$2;
  i64toi32_i32$0 = i64toi32_i32$1 - i64toi32_i32$3 | 0;
  i64toi32_i32$6 = i64toi32_i32$1 >>> 0 < i64toi32_i32$3 >>> 0;
  i64toi32_i32$4 = i64toi32_i32$6 + i64toi32_i32$5 | 0;
  i64toi32_i32$4 = i64toi32_i32$2 - i64toi32_i32$4 | 0;
  $16$hi = i64toi32_i32$4;
  i64toi32_i32$4 = $9$hi;
  i64toi32_i32$1 = $16$hi;
  i64toi32_i32$1 = __wasm_i64_udiv($9_1 | 0, i64toi32_i32$4 | 0, i64toi32_i32$0 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$4 = i64toi32_i32$HIGH_BITS;
  $17_1 = i64toi32_i32$1;
  $17$hi = i64toi32_i32$4;
  i64toi32_i32$4 = var$1$hi;
  i64toi32_i32$4 = var$0$hi;
  i64toi32_i32$4 = var$1$hi;
  i64toi32_i32$2 = var$1;
  i64toi32_i32$1 = var$0$hi;
  i64toi32_i32$3 = var$0;
  i64toi32_i32$1 = i64toi32_i32$4 ^ i64toi32_i32$1 | 0;
  i64toi32_i32$4 = i64toi32_i32$2 ^ i64toi32_i32$3 | 0;
  i64toi32_i32$2 = 0;
  i64toi32_i32$3 = 63;
  i64toi32_i32$5 = i64toi32_i32$3 & 31 | 0;
  if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
   i64toi32_i32$2 = i64toi32_i32$1 >> 31 | 0;
   $23_1 = i64toi32_i32$1 >> i64toi32_i32$5 | 0;
  } else {
   i64toi32_i32$2 = i64toi32_i32$1 >> i64toi32_i32$5 | 0;
   $23_1 = (((1 << i64toi32_i32$5 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$5 | 0) | 0 | (i64toi32_i32$4 >>> i64toi32_i32$5 | 0) | 0;
  }
  var$0 = $23_1;
  var$0$hi = i64toi32_i32$2;
  i64toi32_i32$2 = $17$hi;
  i64toi32_i32$1 = $17_1;
  i64toi32_i32$4 = var$0$hi;
  i64toi32_i32$3 = var$0;
  i64toi32_i32$4 = i64toi32_i32$2 ^ i64toi32_i32$4 | 0;
  $23$hi = i64toi32_i32$4;
  i64toi32_i32$4 = var$0$hi;
  i64toi32_i32$4 = $23$hi;
  i64toi32_i32$2 = i64toi32_i32$1 ^ i64toi32_i32$3 | 0;
  i64toi32_i32$1 = var$0$hi;
  i64toi32_i32$5 = i64toi32_i32$2 - i64toi32_i32$3 | 0;
  i64toi32_i32$6 = i64toi32_i32$2 >>> 0 < i64toi32_i32$3 >>> 0;
  i64toi32_i32$0 = i64toi32_i32$6 + i64toi32_i32$1 | 0;
  i64toi32_i32$0 = i64toi32_i32$4 - i64toi32_i32$0 | 0;
  i64toi32_i32$2 = i64toi32_i32$5;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$2 | 0;
 }
 
 function _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$2 = 0, i64toi32_i32$3 = 0, i64toi32_i32$4 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$5 = 0, var$2 = 0, var$3 = 0, var$4 = 0, var$5 = 0, var$5$hi = 0, var$6 = 0, var$6$hi = 0, i64toi32_i32$6 = 0, $37_1 = 0, $38_1 = 0, $39_1 = 0, $40_1 = 0, $41_1 = 0, $42_1 = 0, $43_1 = 0, $44_1 = 0, var$8$hi = 0, $45_1 = 0, $46_1 = 0, $47_1 = 0, $48_1 = 0, var$7$hi = 0, $49_1 = 0, $63$hi = 0, $65_1 = 0, $65$hi = 0, $120$hi = 0, $129$hi = 0, $134$hi = 0, var$8 = 0, $140_1 = 0, $140$hi = 0, $142$hi = 0, $144_1 = 0, $144$hi = 0, $151_1 = 0, $151$hi = 0, $154$hi = 0, var$7 = 0, $165$hi = 0;
  label$1 : {
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
             i64toi32_i32$0 = var$0$hi;
             i64toi32_i32$2 = var$0;
             i64toi32_i32$1 = 0;
             i64toi32_i32$3 = 32;
             i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
             if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
              i64toi32_i32$1 = 0;
              $37_1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
             } else {
              i64toi32_i32$1 = i64toi32_i32$0 >>> i64toi32_i32$4 | 0;
              $37_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$0 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
             }
             var$2 = $37_1;
             if (var$2) {
              i64toi32_i32$1 = var$1$hi;
              var$3 = var$1;
              if (!var$3) {
               break label$11
              }
              i64toi32_i32$0 = var$3;
              i64toi32_i32$2 = 0;
              i64toi32_i32$3 = 32;
              i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
              if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
               i64toi32_i32$2 = 0;
               $38_1 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
              } else {
               i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$4 | 0;
               $38_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$0 >>> i64toi32_i32$4 | 0) | 0;
              }
              var$4 = $38_1;
              if (!var$4) {
               break label$9
              }
              var$2 = Math_clz32(var$4) - Math_clz32(var$2) | 0;
              if (var$2 >>> 0 <= 31 >>> 0) {
               break label$8
              }
              break label$2;
             }
             i64toi32_i32$2 = var$1$hi;
             i64toi32_i32$1 = var$1;
             i64toi32_i32$0 = 1;
             i64toi32_i32$3 = 0;
             if (i64toi32_i32$2 >>> 0 > i64toi32_i32$0 >>> 0 | ((i64toi32_i32$2 | 0) == (i64toi32_i32$0 | 0) & i64toi32_i32$1 >>> 0 >= i64toi32_i32$3 >>> 0 | 0) | 0) {
              break label$2
             }
             i64toi32_i32$1 = var$0$hi;
             var$2 = var$0;
             i64toi32_i32$1 = i64toi32_i32$2;
             i64toi32_i32$1 = i64toi32_i32$2;
             var$3 = var$1;
             var$2 = (var$2 >>> 0) / (var$3 >>> 0) | 0;
             i64toi32_i32$1 = 0;
             __wasm_intrinsics_temp_i64 = var$0 - Math_imul(var$2, var$3) | 0;
             __wasm_intrinsics_temp_i64$hi = i64toi32_i32$1;
             i64toi32_i32$1 = 0;
             i64toi32_i32$2 = var$2;
             i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
             return i64toi32_i32$2 | 0;
            }
            i64toi32_i32$2 = var$1$hi;
            i64toi32_i32$3 = var$1;
            i64toi32_i32$1 = 0;
            i64toi32_i32$0 = 32;
            i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
            if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
             i64toi32_i32$1 = 0;
             $39_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
            } else {
             i64toi32_i32$1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
             $39_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
            }
            var$3 = $39_1;
            i64toi32_i32$1 = var$0$hi;
            if (!var$0) {
             break label$7
            }
            if (!var$3) {
             break label$6
            }
            var$4 = var$3 + -1 | 0;
            if (var$4 & var$3 | 0) {
             break label$6
            }
            i64toi32_i32$1 = 0;
            i64toi32_i32$2 = var$4 & var$2 | 0;
            i64toi32_i32$3 = 0;
            i64toi32_i32$0 = 32;
            i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
            if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
             i64toi32_i32$3 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
             $40_1 = 0;
            } else {
             i64toi32_i32$3 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
             $40_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
            }
            $63$hi = i64toi32_i32$3;
            i64toi32_i32$3 = var$0$hi;
            i64toi32_i32$1 = var$0;
            i64toi32_i32$2 = 0;
            i64toi32_i32$0 = -1;
            i64toi32_i32$2 = i64toi32_i32$3 & i64toi32_i32$2 | 0;
            $65_1 = i64toi32_i32$1 & i64toi32_i32$0 | 0;
            $65$hi = i64toi32_i32$2;
            i64toi32_i32$2 = $63$hi;
            i64toi32_i32$3 = $40_1;
            i64toi32_i32$1 = $65$hi;
            i64toi32_i32$0 = $65_1;
            i64toi32_i32$1 = i64toi32_i32$2 | i64toi32_i32$1 | 0;
            __wasm_intrinsics_temp_i64 = i64toi32_i32$3 | i64toi32_i32$0 | 0;
            __wasm_intrinsics_temp_i64$hi = i64toi32_i32$1;
            i64toi32_i32$1 = 0;
            i64toi32_i32$3 = var$2 >>> ((__wasm_ctz_i32(var$3 | 0) | 0) & 31 | 0) | 0;
            i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
            return i64toi32_i32$3 | 0;
           }
          }
          var$4 = var$3 + -1 | 0;
          if (!(var$4 & var$3 | 0)) {
           break label$5
          }
          var$2 = (Math_clz32(var$3) + 33 | 0) - Math_clz32(var$2) | 0;
          var$3 = 0 - var$2 | 0;
          break label$3;
         }
         var$3 = 63 - var$2 | 0;
         var$2 = var$2 + 1 | 0;
         break label$3;
        }
        var$4 = (var$2 >>> 0) / (var$3 >>> 0) | 0;
        i64toi32_i32$3 = 0;
        i64toi32_i32$2 = var$2 - Math_imul(var$4, var$3) | 0;
        i64toi32_i32$1 = 0;
        i64toi32_i32$0 = 32;
        i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
        if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
         i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
         $41_1 = 0;
        } else {
         i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$3 << i64toi32_i32$4 | 0) | 0;
         $41_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
        }
        __wasm_intrinsics_temp_i64 = $41_1;
        __wasm_intrinsics_temp_i64$hi = i64toi32_i32$1;
        i64toi32_i32$1 = 0;
        i64toi32_i32$2 = var$4;
        i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
        return i64toi32_i32$2 | 0;
       }
       var$2 = Math_clz32(var$3) - Math_clz32(var$2) | 0;
       if (var$2 >>> 0 < 31 >>> 0) {
        break label$4
       }
       break label$2;
      }
      i64toi32_i32$2 = var$0$hi;
      i64toi32_i32$2 = 0;
      __wasm_intrinsics_temp_i64 = var$4 & var$0 | 0;
      __wasm_intrinsics_temp_i64$hi = i64toi32_i32$2;
      if ((var$3 | 0) == (1 | 0)) {
       break label$1
      }
      i64toi32_i32$2 = var$0$hi;
      i64toi32_i32$2 = 0;
      $120$hi = i64toi32_i32$2;
      i64toi32_i32$2 = var$0$hi;
      i64toi32_i32$3 = var$0;
      i64toi32_i32$1 = $120$hi;
      i64toi32_i32$0 = __wasm_ctz_i32(var$3 | 0) | 0;
      i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
      if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
       i64toi32_i32$1 = 0;
       $42_1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
      } else {
       i64toi32_i32$1 = i64toi32_i32$2 >>> i64toi32_i32$4 | 0;
       $42_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$2 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$3 >>> i64toi32_i32$4 | 0) | 0;
      }
      i64toi32_i32$3 = $42_1;
      i64toi32_i32$HIGH_BITS = i64toi32_i32$1;
      return i64toi32_i32$3 | 0;
     }
     var$3 = 63 - var$2 | 0;
     var$2 = var$2 + 1 | 0;
    }
    i64toi32_i32$3 = var$0$hi;
    i64toi32_i32$3 = 0;
    $129$hi = i64toi32_i32$3;
    i64toi32_i32$3 = var$0$hi;
    i64toi32_i32$2 = var$0;
    i64toi32_i32$1 = $129$hi;
    i64toi32_i32$0 = var$2 & 63 | 0;
    i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
     i64toi32_i32$1 = 0;
     $43_1 = i64toi32_i32$3 >>> i64toi32_i32$4 | 0;
    } else {
     i64toi32_i32$1 = i64toi32_i32$3 >>> i64toi32_i32$4 | 0;
     $43_1 = (((1 << i64toi32_i32$4 | 0) - 1 | 0) & i64toi32_i32$3 | 0) << (32 - i64toi32_i32$4 | 0) | 0 | (i64toi32_i32$2 >>> i64toi32_i32$4 | 0) | 0;
    }
    var$5 = $43_1;
    var$5$hi = i64toi32_i32$1;
    i64toi32_i32$1 = var$0$hi;
    i64toi32_i32$1 = 0;
    $134$hi = i64toi32_i32$1;
    i64toi32_i32$1 = var$0$hi;
    i64toi32_i32$3 = var$0;
    i64toi32_i32$2 = $134$hi;
    i64toi32_i32$0 = var$3 & 63 | 0;
    i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
     i64toi32_i32$2 = i64toi32_i32$3 << i64toi32_i32$4 | 0;
     $44_1 = 0;
    } else {
     i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$3 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$1 << i64toi32_i32$4 | 0) | 0;
     $44_1 = i64toi32_i32$3 << i64toi32_i32$4 | 0;
    }
    var$0 = $44_1;
    var$0$hi = i64toi32_i32$2;
    label$13 : {
     if (var$2) {
      i64toi32_i32$2 = var$1$hi;
      i64toi32_i32$1 = var$1;
      i64toi32_i32$3 = -1;
      i64toi32_i32$0 = -1;
      i64toi32_i32$4 = i64toi32_i32$1 + i64toi32_i32$0 | 0;
      i64toi32_i32$5 = i64toi32_i32$2 + i64toi32_i32$3 | 0;
      if (i64toi32_i32$4 >>> 0 < i64toi32_i32$0 >>> 0) {
       i64toi32_i32$5 = i64toi32_i32$5 + 1 | 0
      }
      var$8 = i64toi32_i32$4;
      var$8$hi = i64toi32_i32$5;
      label$15 : while (1) {
       i64toi32_i32$5 = var$5$hi;
       i64toi32_i32$2 = var$5;
       i64toi32_i32$1 = 0;
       i64toi32_i32$0 = 1;
       i64toi32_i32$3 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
        $45_1 = 0;
       } else {
        i64toi32_i32$1 = ((1 << i64toi32_i32$3 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$3 | 0) | 0) | 0 | (i64toi32_i32$5 << i64toi32_i32$3 | 0) | 0;
        $45_1 = i64toi32_i32$2 << i64toi32_i32$3 | 0;
       }
       $140_1 = $45_1;
       $140$hi = i64toi32_i32$1;
       i64toi32_i32$1 = var$0$hi;
       i64toi32_i32$5 = var$0;
       i64toi32_i32$2 = 0;
       i64toi32_i32$0 = 63;
       i64toi32_i32$3 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$2 = 0;
        $46_1 = i64toi32_i32$1 >>> i64toi32_i32$3 | 0;
       } else {
        i64toi32_i32$2 = i64toi32_i32$1 >>> i64toi32_i32$3 | 0;
        $46_1 = (((1 << i64toi32_i32$3 | 0) - 1 | 0) & i64toi32_i32$1 | 0) << (32 - i64toi32_i32$3 | 0) | 0 | (i64toi32_i32$5 >>> i64toi32_i32$3 | 0) | 0;
       }
       $142$hi = i64toi32_i32$2;
       i64toi32_i32$2 = $140$hi;
       i64toi32_i32$1 = $140_1;
       i64toi32_i32$5 = $142$hi;
       i64toi32_i32$0 = $46_1;
       i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
       var$5 = i64toi32_i32$1 | i64toi32_i32$0 | 0;
       var$5$hi = i64toi32_i32$5;
       $144_1 = var$5;
       $144$hi = i64toi32_i32$5;
       i64toi32_i32$5 = var$8$hi;
       i64toi32_i32$5 = var$5$hi;
       i64toi32_i32$5 = var$8$hi;
       i64toi32_i32$2 = var$8;
       i64toi32_i32$1 = var$5$hi;
       i64toi32_i32$0 = var$5;
       i64toi32_i32$3 = i64toi32_i32$2 - i64toi32_i32$0 | 0;
       i64toi32_i32$6 = i64toi32_i32$2 >>> 0 < i64toi32_i32$0 >>> 0;
       i64toi32_i32$4 = i64toi32_i32$6 + i64toi32_i32$1 | 0;
       i64toi32_i32$4 = i64toi32_i32$5 - i64toi32_i32$4 | 0;
       i64toi32_i32$5 = i64toi32_i32$3;
       i64toi32_i32$2 = 0;
       i64toi32_i32$0 = 63;
       i64toi32_i32$1 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$2 = i64toi32_i32$4 >> 31 | 0;
        $47_1 = i64toi32_i32$4 >> i64toi32_i32$1 | 0;
       } else {
        i64toi32_i32$2 = i64toi32_i32$4 >> i64toi32_i32$1 | 0;
        $47_1 = (((1 << i64toi32_i32$1 | 0) - 1 | 0) & i64toi32_i32$4 | 0) << (32 - i64toi32_i32$1 | 0) | 0 | (i64toi32_i32$5 >>> i64toi32_i32$1 | 0) | 0;
       }
       var$6 = $47_1;
       var$6$hi = i64toi32_i32$2;
       i64toi32_i32$2 = var$1$hi;
       i64toi32_i32$2 = var$6$hi;
       i64toi32_i32$4 = var$6;
       i64toi32_i32$5 = var$1$hi;
       i64toi32_i32$0 = var$1;
       i64toi32_i32$5 = i64toi32_i32$2 & i64toi32_i32$5 | 0;
       $151_1 = i64toi32_i32$4 & i64toi32_i32$0 | 0;
       $151$hi = i64toi32_i32$5;
       i64toi32_i32$5 = $144$hi;
       i64toi32_i32$2 = $144_1;
       i64toi32_i32$4 = $151$hi;
       i64toi32_i32$0 = $151_1;
       i64toi32_i32$1 = i64toi32_i32$2 - i64toi32_i32$0 | 0;
       i64toi32_i32$6 = i64toi32_i32$2 >>> 0 < i64toi32_i32$0 >>> 0;
       i64toi32_i32$3 = i64toi32_i32$6 + i64toi32_i32$4 | 0;
       i64toi32_i32$3 = i64toi32_i32$5 - i64toi32_i32$3 | 0;
       var$5 = i64toi32_i32$1;
       var$5$hi = i64toi32_i32$3;
       i64toi32_i32$3 = var$0$hi;
       i64toi32_i32$5 = var$0;
       i64toi32_i32$2 = 0;
       i64toi32_i32$0 = 1;
       i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
       if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
        i64toi32_i32$2 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
        $48_1 = 0;
       } else {
        i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$3 << i64toi32_i32$4 | 0) | 0;
        $48_1 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
       }
       $154$hi = i64toi32_i32$2;
       i64toi32_i32$2 = var$7$hi;
       i64toi32_i32$2 = $154$hi;
       i64toi32_i32$3 = $48_1;
       i64toi32_i32$5 = var$7$hi;
       i64toi32_i32$0 = var$7;
       i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
       var$0 = i64toi32_i32$3 | i64toi32_i32$0 | 0;
       var$0$hi = i64toi32_i32$5;
       i64toi32_i32$5 = var$6$hi;
       i64toi32_i32$2 = var$6;
       i64toi32_i32$3 = 0;
       i64toi32_i32$0 = 1;
       i64toi32_i32$3 = i64toi32_i32$5 & i64toi32_i32$3 | 0;
       var$6 = i64toi32_i32$2 & i64toi32_i32$0 | 0;
       var$6$hi = i64toi32_i32$3;
       var$7 = var$6;
       var$7$hi = i64toi32_i32$3;
       var$2 = var$2 + -1 | 0;
       if (var$2) {
        continue label$15
       }
       break label$15;
      };
      break label$13;
     }
    }
    i64toi32_i32$3 = var$5$hi;
    __wasm_intrinsics_temp_i64 = var$5;
    __wasm_intrinsics_temp_i64$hi = i64toi32_i32$3;
    i64toi32_i32$3 = var$0$hi;
    i64toi32_i32$5 = var$0;
    i64toi32_i32$2 = 0;
    i64toi32_i32$0 = 1;
    i64toi32_i32$4 = i64toi32_i32$0 & 31 | 0;
    if (32 >>> 0 <= (i64toi32_i32$0 & 63 | 0) >>> 0) {
     i64toi32_i32$2 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
     $49_1 = 0;
    } else {
     i64toi32_i32$2 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$5 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$3 << i64toi32_i32$4 | 0) | 0;
     $49_1 = i64toi32_i32$5 << i64toi32_i32$4 | 0;
    }
    $165$hi = i64toi32_i32$2;
    i64toi32_i32$2 = var$6$hi;
    i64toi32_i32$2 = $165$hi;
    i64toi32_i32$3 = $49_1;
    i64toi32_i32$5 = var$6$hi;
    i64toi32_i32$0 = var$6;
    i64toi32_i32$5 = i64toi32_i32$2 | i64toi32_i32$5 | 0;
    i64toi32_i32$3 = i64toi32_i32$3 | i64toi32_i32$0 | 0;
    i64toi32_i32$HIGH_BITS = i64toi32_i32$5;
    return i64toi32_i32$3 | 0;
   }
   i64toi32_i32$3 = var$0$hi;
   __wasm_intrinsics_temp_i64 = var$0;
   __wasm_intrinsics_temp_i64$hi = i64toi32_i32$3;
   i64toi32_i32$3 = 0;
   var$0 = 0;
   var$0$hi = i64toi32_i32$3;
  }
  i64toi32_i32$3 = var$0$hi;
  i64toi32_i32$5 = var$0;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$3;
  return i64toi32_i32$5 | 0;
 }
 
 function __wasm_ctz_i32(var$0) {
  var$0 = var$0 | 0;
  if (var$0) {
   return 31 - Math_clz32((var$0 + -1 | 0) ^ var$0 | 0) | 0 | 0
  }
  return 32 | 0;
 }
 
 function __wasm_i64_mul(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$0 = var$1$hi;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$1 = _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE(var$0 | 0, i64toi32_i32$0 | 0, var$1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function __wasm_i64_sdiv(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$0 = var$1$hi;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$1 = _ZN17compiler_builtins3int4sdiv3Div3div17he78fc483e41d7ec7E(var$0 | 0, i64toi32_i32$0 | 0, var$1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function __wasm_i64_udiv(var$0, var$0$hi, var$1, var$1$hi) {
  var$0 = var$0 | 0;
  var$0$hi = var$0$hi | 0;
  var$1 = var$1 | 0;
  var$1$hi = var$1$hi | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$0 = var$1$hi;
  i64toi32_i32$0 = var$0$hi;
  i64toi32_i32$1 = var$1$hi;
  i64toi32_i32$1 = _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E(var$0 | 0, i64toi32_i32$0 | 0, var$1 | 0, i64toi32_i32$1 | 0) | 0;
  i64toi32_i32$0 = i64toi32_i32$HIGH_BITS;
  i64toi32_i32$HIGH_BITS = i64toi32_i32$0;
  return i64toi32_i32$1 | 0;
 }
 
 function __wasm_rotl_i32(var$0, var$1) {
  var$0 = var$0 | 0;
  var$1 = var$1 | 0;
  var var$2 = 0;
  var$2 = var$1 & 31 | 0;
  var$1 = (0 - var$1 | 0) & 31 | 0;
  return ((-1 >>> var$2 | 0) & var$0 | 0) << var$2 | 0 | (((-1 << var$1 | 0) & var$0 | 0) >>> var$1 | 0) | 0 | 0;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(imports);
 var FUNCTION_TABLE = Table([null, $93, $92, $94, $120, $121, $302, $304]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
 }
 
 return {
  "memory": Object.create(Object.prototype, {
   "grow": {
    
   }, 
   "buffer": {
    "get": function () {
     return buffer;
    }
    
   }
  }), 
  "__wasm_call_ctors": $0, 
  "func1": $1, 
  "GenSolution": $2, 
  "fflush": $309, 
  "__indirect_function_table": FUNCTION_TABLE, 
  "emscripten_stack_init": $314, 
  "emscripten_stack_get_free": $315, 
  "emscripten_stack_get_base": $316, 
  "emscripten_stack_get_end": $317, 
  "stackSave": $310, 
  "stackRestore": $311, 
  "stackAlloc": $312, 
  "emscripten_stack_get_current": $313, 
  "__start_em_asm": {
   get value() {
    return global$4;
   }, 
   set value(_global$4) {
    global$4 = _global$4;
   }
  }, 
  "__stop_em_asm": {
   get value() {
    return global$5;
   }, 
   set value(_global$5) {
    global$5 = _global$5;
   }
  }, 
  "dynCall_jiji": $319
 };
}

  return asmFunc(info);
}

)(info);
  },

  instantiate: /** @suppress{checkTypes} */ function(binary, info) {
    return {
      then: function(ok) {
        var module = new WebAssembly.Module(binary);
        ok({
          'instance': new WebAssembly.Instance(module, info)
        });
        // Emulate a simple WebAssembly.instantiate(..).then(()=>{}).catch(()=>{}) syntax.
        return { catch: function() {} };
      }
    };
  },

  RuntimeError: Error
};

// We don't need to actually download a wasm binary, mark it as present but empty.
wasmBinary = [];
// end include: wasm2js.js
if (typeof WebAssembly != 'object') {
  err('no native wasm support detected');
}

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

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.
function _malloc() {
  abort('malloc() called but not included in the build - add `_malloc` to EXPORTED_FUNCTIONS');
}
function _free() {
  // Show a helpful error since we used to include free by default in the past.
  abort('free() called but not included in the build - add `_free` to EXPORTED_FUNCTIONS');
}

// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

// include: runtime_shared.js
function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}
// end include: runtime_shared.js
assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time')

assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
assert(!Module['INITIAL_MEMORY'], 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x02135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[((0)>>2)] = 1668509029;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[((0)>>2)] != 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}
// end include: runtime_stack_check.js
// include: runtime_assertions.js
// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

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
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
  callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
  checkStackCookie();

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

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
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
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err(`dependency: ${dep}`);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
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

/** @param {string|number=} what */
function abort(what) {
  Module['onAbort']?.(what);

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// show errors on likely calls to FS when it was not included
var FS = {
  error() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
  },
  init() { FS.error() },
  createDataFile() { FS.error() },
  createPreloadedFile() { FS.error() },
  createLazyFile() { FS.error() },
  open() { FS.error() },
  mkdev() { FS.error() },
  registerDevice() { FS.error() },
  analyzePath() { FS.error() },

  ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');
// end include: URIUtils.js
function createExportWrapper(name) {
  return (...args) => {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    return f(...args);
  };
}

// include: runtime_exceptions.js
// end include: runtime_exceptions.js
var wasmBinaryFile;
  wasmBinaryFile = 'a.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw 'both async and sync fetching of the wasm failed';
}

function getBinaryPromise(binaryFile) {
  // If we don't have the binary yet, try to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary
      && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
      && !isFileURI(binaryFile)
    ) {
      return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
        if (!response['ok']) {
          throw `failed to load wasm binary file at '${binaryFile}'`;
        }
        return response['arrayBuffer']();
      }).catch(() => getBinarySync(binaryFile));
    }
    else if (readAsync) {
      // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
      return new Promise((resolve, reject) => {
        readAsync(binaryFile, (response) => resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))), reject)
      });
    }
  }

  // Otherwise, getBinarySync should be able to get it synchronously
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then((binary) => {
    return WebAssembly.instantiate(binary, imports);
  }).then(receiver, (reason) => {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    // Warn on some common problems.
    if (isFileURI(wasmBinaryFile)) {
      err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  if (!binary &&
      typeof WebAssembly.instantiateStreaming == 'function' &&
      !isDataURI(binaryFile) &&
      // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
      !isFileURI(binaryFile) &&
      // Avoid instantiateStreaming() on Node.js environment for now, as while
      // Node.js v18.1.0 implements it, it does not have a full fetch()
      // implementation yet.
      //
      // Reference:
      //   https://github.com/emscripten-core/emscripten/pull/16917
      !ENVIRONMENT_IS_NODE &&
      typeof fetch == 'function') {
    return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
      // Suppress closure warning here since the upstream definition for
      // instantiateStreaming only allows Promise<Repsponse> rather than
      // an actual Response.
      // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
      /** @suppress {checkTypes} */
      var result = WebAssembly.instantiateStreaming(response, imports);

      return result.then(
        callback,
        function(reason) {
          // We expect the most common failure cause to be a bad MIME type for the binary,
          // in which case falling back to ArrayBuffer instantiation should work.
          err(`wasm streaming compile failed: ${reason}`);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(binaryFile, imports, callback);
        });
    });
  }
  return instantiateArrayBuffer(binaryFile, imports, callback);
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    

    wasmMemory = wasmExports['memory'];
    
    assert(wasmMemory, 'memory not found in wasm exports');
    updateMemoryViews();

    addOnInit(wasmExports['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {

    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
function legacyModuleProp(prop, newName, incoming=true) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get() {
        let extra = incoming ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)' : '';
        abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);

      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingGlobal(sym, msg) {
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
        return undefined;
      }
    });
  }
}

missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
missingGlobal('asm', 'Please use wasmExports instead');

function missingLibrarySymbol(sym) {
  if (typeof globalThis !== 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        // Can't `abort()` here because it would break code that does runtime
        // checks.  e.g. `if (typeof SDL === 'undefined')`.
        var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
        // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
        // library.js, which means $name for a JS name with no prefix, or name
        // for a JS name like _name.
        var librarySymbol = sym;
        if (!librarySymbol.startsWith('_')) {
          librarySymbol = '$' + sym;
        }
        msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
  // Any symbol that is not included from the JS library is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(...args) {
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  console.warn(...args);
}
// end include: runtime_debug.js
// === Body ===

var ASM_CONSTS = {
  66828: ($0, $1, $2) => { AddEntry($0, $1, $2); },  
 66854: () => { Clear(); },  
 66867: ($0) => { SetTarget($0); }
};

// end include: preamble.js


  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[ptr];
      case 'i8': return HEAP8[ptr];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': abort('to do getValue(i64) use WASM_BIGINT');
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  var noExitRuntime = Module['noExitRuntime'] || true;

  var ptrToString = (ptr) => {
      assert(typeof ptr === 'number');
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    };

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[ptr] = value; break;
      case 'i8': HEAP8[ptr] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': abort('to do setValue(i64) use WASM_BIGINT');
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
        err(text);
      }
    };

  var _abort = () => {
      abort('native code called abort()');
    };

  var readEmAsmArgsArray = [];
  var readEmAsmArgs = (sigPtr, buf) => {
      // Nobody should have mutated _readEmAsmArgsArray underneath us to be something else than an array.
      assert(Array.isArray(readEmAsmArgsArray));
      // The input buffer is allocated on the stack, so it must be stack-aligned.
      assert(buf % 16 == 0);
      readEmAsmArgsArray.length = 0;
      var ch;
      // Most arguments are i32s, so shift the buffer pointer so it is a plain
      // index into HEAP32.
      while (ch = HEAPU8[sigPtr++]) {
        var chr = String.fromCharCode(ch);
        var validChars = ['d', 'f', 'i', 'p'];
        assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
        // Floats are always passed as doubles, so all types except for 'i'
        // are 8 bytes and require alignment.
        var wide = (ch != 105);
        wide &= (ch != 112);
        buf += wide && (buf % 8) ? 4 : 0;
        readEmAsmArgsArray.push(
          // Special case for pointers under wasm64 or CAN_ADDRESS_2GB mode.
          ch == 112 ? HEAPU32[((buf)>>2)] :
          ch == 105 ?
            HEAP32[((buf)>>2)] :
            HEAPF64[((buf)>>3)]
        );
        buf += wide ? 8 : 4;
      }
      return readEmAsmArgsArray;
    };
  var runEmAsmFunction = (code, sigPtr, argbuf) => {
      var args = readEmAsmArgs(sigPtr, argbuf);
      assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
      return ASM_CONSTS[code](...args);
    };
  var _emscripten_asm_const_int = (code, sigPtr, argbuf) => {
      return runEmAsmFunction(code, sigPtr, argbuf);
    };

  var _emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);

  var getHeapMax = () =>
      HEAPU8.length;
  
  var abortOnCannotGrowMemory = (requestedSize) => {
      abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`);
    };
  var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      abortOnCannotGrowMemory(requestedSize);
    };

  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  var UTF8ToString = (ptr, maxBytesToRead) => {
      assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };
  var SYSCALLS = {
  varargs:undefined,
  get() {
        assert(SYSCALLS.varargs != undefined);
        // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
        var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
        SYSCALLS.varargs += 4;
        return ret;
      },
  getp() { return SYSCALLS.get() },
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  };
  var _fd_close = (fd) => {
      abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
    };

  var convertI32PairToI53Checked = (lo, hi) => {
      assert(lo == (lo >>> 0) || lo == (lo|0)); // lo should either be a i32 or a u32
      assert(hi === (hi|0));                    // hi should be a i32
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    };
  function _fd_seek(fd,offset_low, offset_high,whence,newOffset) {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
  
    
      return 70;
    ;
  }

  var printCharBuffers = [null,[],[]];
  
  var printChar = (stream, curr) => {
      var buffer = printCharBuffers[stream];
      assert(buffer);
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    };
  
  var flush_NO_FILESYSTEM = () => {
      // flush anything remaining in the buffers during shutdown
      _fflush(0);
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    };
  
  
  var _fd_write = (fd, iov, iovcnt, pnum) => {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr+j]);
        }
        num += len;
      }
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    };

  var getCFunc = (ident) => {
      var func = Module['_' + ident]; // closure exported function
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
      return func;
    };
  
  var writeArrayToMemory = (array, buffer) => {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
      HEAP8.set(array, buffer);
    };
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
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
          if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };
  
  
  
  
  
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
  var ccall = (ident, returnType, argTypes, args, opts) => {
      // For fast lookup of conversion functions
      var toC = {
        'string': (str) => {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) { // null string
            // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
            ret = stringToUTF8OnStack(str);
          }
          return ret;
        },
        'array': (arr) => {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        }
      };
  
      function convertReturnValue(ret) {
        if (returnType === 'string') {
          
          return UTF8ToString(ret);
        }
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
  
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
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
      var ret = func(...cArgs);
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
  
      ret = onDone(ret);
      return ret;
    };

  
  
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
  var cwrap = (ident, returnType, argTypes, opts) => {
      return (...args) => ccall(ident, returnType, argTypes, args, opts);
    };
function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var wasmImports = {
  /** @export */
  abort: _abort,
  /** @export */
  emscripten_asm_const_int: _emscripten_asm_const_int,
  /** @export */
  emscripten_memcpy_js: _emscripten_memcpy_js,
  /** @export */
  emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */
  fd_close: _fd_close,
  /** @export */
  fd_seek: _fd_seek,
  /** @export */
  fd_write: _fd_write
};
var wasmExports = createWasm();
var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors');
var _func1 = Module['_func1'] = createExportWrapper('func1');
var _GenSolution = Module['_GenSolution'] = createExportWrapper('GenSolution');
var _fflush = createExportWrapper('fflush');
var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports['emscripten_stack_init'])();
var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'])();
var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'])();
var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'])();
var stackSave = createExportWrapper('stackSave');
var stackRestore = createExportWrapper('stackRestore');
var stackAlloc = createExportWrapper('stackAlloc');
var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'])();
var dynCall_jiji = Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji');


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

Module['ccall'] = ccall;
Module['cwrap'] = cwrap;
var missingLibrarySymbols = [
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertU32PairToI53',
  'zeroMemory',
  'exitJS',
  'growMemory',
  'isLeapYear',
  'ydayFromDate',
  'arraySum',
  'addDays',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'initRandomFill',
  'randomFill',
  'getCallstack',
  'emscriptenLog',
  'convertPCtoSourceLocation',
  'runMainThreadEmAsm',
  'jstoi_q',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'handleException',
  'keepRuntimeAlive',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'HandleAllocator',
  'getNativeTypeSize',
  'STACK_SIZE',
  'STACK_ALIGN',
  'POINTER_SIZE',
  'ASSERTIONS',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'getFunctionAddress',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayFromString',
  'intArrayToString',
  'AsciiToString',
  'stringToAscii',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'stringToNewUTF8',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'jsStackTrace',
  'stackTrace',
  'getEnvStrings',
  'checkWasiClock',
  'wasiRightsToMuslOFlags',
  'wasiOFlagsToMuslOFlags',
  'createDyncallWrapper',
  'safeSetTimeout',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'getPromise',
  'makePromise',
  'idsToPromises',
  'makePromiseCallback',
  'ExceptionInfo',
  'findMatchingCatch',
  'Browser_asyncPrepareDataCounter',
  'setMainLoop',
  'getSocketFromFD',
  'getSocketAddress',
  'FS_createPreloadedFile',
  'FS_modeStringToFlags',
  'FS_getMode',
  'FS_stdin_getChar',
  'FS_createDataFile',
  'FS_unlink',
  'FS_mkdirTree',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'toTypedArrayIndex',
  'webgl_enable_ANGLE_instanced_arrays',
  'webgl_enable_OES_vertex_array_object',
  'webgl_enable_WEBGL_draw_buffers',
  'webgl_enable_WEBGL_multi_draw',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'colorChannelsInGlTextureFormat',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  '__glGetActiveAttribOrUniform',
  'writeGLArray',
  'registerWebGlEventCallback',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'setErrNo',
  'demangle',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)

var unexportedSymbols = [
  'run',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'addRunDependency',
  'removeRunDependency',
  'FS_createFolder',
  'FS_createPath',
  'FS_createLazyFile',
  'FS_createLink',
  'FS_createDevice',
  'FS_readFile',
  'out',
  'err',
  'callMain',
  'abort',
  'wasmMemory',
  'wasmExports',
  'stackAlloc',
  'stackSave',
  'stackRestore',
  'getTempRet0',
  'setTempRet0',
  'writeStackCookie',
  'checkStackCookie',
  'convertI32PairToI53Checked',
  'ptrToString',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'ENV',
  'MONTH_DAYS_REGULAR',
  'MONTH_DAYS_LEAP',
  'MONTH_DAYS_REGULAR_CUMULATIVE',
  'MONTH_DAYS_LEAP_CUMULATIVE',
  'ERRNO_CODES',
  'ERRNO_MESSAGES',
  'DNS',
  'Protocols',
  'Sockets',
  'timers',
  'warnOnce',
  'UNWIND_CACHE',
  'readEmAsmArgsArray',
  'readEmAsmArgs',
  'runEmAsmFunction',
  'jstoi_s',
  'wasmTable',
  'noExitRuntime',
  'getCFunc',
  'freeTableIndexes',
  'functionsInTableMap',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'UTF8Decoder',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'UTF16Decoder',
  'stringToUTF8OnStack',
  'writeArrayToMemory',
  'JSEvents',
  'specialHTMLTargets',
  'findCanvasEventTarget',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'ExitStatus',
  'flush_NO_FILESYSTEM',
  'promiseMap',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'Browser',
  'getPreloadedImageData__data',
  'wget',
  'SYSCALLS',
  'preloadPlugins',
  'FS_stdin_getChar_buffer',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'miniTempWebGLIntBuffers',
  'GL',
  'AL',
  'GLUT',
  'EGL',
  'GLEW',
  'IDBStore',
  'SDL',
  'SDL_gfx',
  'allocateUTF8',
  'allocateUTF8OnStack',
];
unexportedSymbols.forEach(unexportedRuntimeSymbol);



var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run() {

  if (runDependencies > 0) {
    return;
  }

    stackCheckInit();

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

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

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
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    flush_NO_FILESYSTEM();
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();

// end include: postamble.js



  return moduleArg.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], () => Module);
