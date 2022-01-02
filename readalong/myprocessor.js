/* 
 * Free FFT and convolution (JavaScript)
 * 
 * Copyright (c) 2020 Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/free-small-fft-in-multiple-languages
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */

/* 
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function.
 */
function transform(real, imag) {
	var n = real.length;
	if (n != imag.length)
		throw "Mismatched lengths";
	if (n == 0)
		return;
	else if ((n & (n - 1)) == 0)  // Is power of 2
		transformRadix2(real, imag);
	else  // More complicated algorithm for arbitrary sizes
		transformBluestein(real, imag);
}


/* 
 * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
 */
function inverseTransform(real, imag) {
	transform(imag, real);
}


/* 
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector's length must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
 */
function transformRadix2(real, imag) {
	// Length variables
	var n = real.length;
	if (n != imag.length)
		throw "Mismatched lengths";
	if (n == 1)  // Trivial transform
		return;
	var levels = -1;
	for (var i = 0; i < 32; i++) {
		if (1 << i == n)
			levels = i;  // Equal to log2(n)
	}
	if (levels == -1)
		throw "Length is not a power of 2";
	
	// Trigonometric tables
	var cosTable = new Array(n / 2);
	var sinTable = new Array(n / 2);
	for (var i = 0; i < n / 2; i++) {
		cosTable[i] = Math.cos(2 * Math.PI * i / n);
		sinTable[i] = Math.sin(2 * Math.PI * i / n);
	}
	
	// Bit-reversed addressing permutation
	for (var i = 0; i < n; i++) {
		var j = reverseBits(i, levels);
		if (j > i) {
			var temp = real[i];
			real[i] = real[j];
			real[j] = temp;
			temp = imag[i];
			imag[i] = imag[j];
			imag[j] = temp;
		}
	}
	
	// Cooley-Tukey decimation-in-time radix-2 FFT
	for (var size = 2; size <= n; size *= 2) {
		var halfsize = size / 2;
		var tablestep = n / size;
		for (var i = 0; i < n; i += size) {
			for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
				var l = j + halfsize;
				var tpre =  real[l] * cosTable[k] + imag[l] * sinTable[k];
				var tpim = -real[l] * sinTable[k] + imag[l] * cosTable[k];
				real[l] = real[j] - tpre;
				imag[l] = imag[j] - tpim;
				real[j] += tpre;
				imag[j] += tpim;
			}
		}
	}
	
	// Returns the integer whose value is the reverse of the lowest 'width' bits of the integer 'val'.
	function reverseBits(val, width) {
		var result = 0;
		for (var i = 0; i < width; i++) {
			result = (result << 1) | (val & 1);
			val >>>= 1;
		}
		return result;
	}
}


/* 
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This requires the convolution function, which in turn requires the radix-2 FFT function.
 * Uses Bluestein's chirp z-transform algorithm.
 */
function transformBluestein(real, imag) {
	// Find a power-of-2 convolution length m such that m >= n * 2 + 1
	var n = real.length;
	if (n != imag.length)
		throw "Mismatched lengths";
	var m = 1;
	while (m < n * 2 + 1)
		m *= 2;
	
	// Trigonometric tables
	var cosTable = new Array(n);
	var sinTable = new Array(n);
	for (var i = 0; i < n; i++) {
		var j = i * i % (n * 2);  // This is more accurate than j = i * i
		cosTable[i] = Math.cos(Math.PI * j / n);
		sinTable[i] = Math.sin(Math.PI * j / n);
	}
	
	// Temporary vectors and preprocessing
	var areal = newArrayOfZeros(m);
	var aimag = newArrayOfZeros(m);
	for (var i = 0; i < n; i++) {
		areal[i] =  real[i] * cosTable[i] + imag[i] * sinTable[i];
		aimag[i] = -real[i] * sinTable[i] + imag[i] * cosTable[i];
	}
	var breal = newArrayOfZeros(m);
	var bimag = newArrayOfZeros(m);
	breal[0] = cosTable[0];
	bimag[0] = sinTable[0];
	for (var i = 1; i < n; i++) {
		breal[i] = breal[m - i] = cosTable[i];
		bimag[i] = bimag[m - i] = sinTable[i];
	}
	
	// Convolution
	var creal = new Array(m);
	var cimag = new Array(m);
	convolveComplex(areal, aimag, breal, bimag, creal, cimag);
	
	// Postprocessing
	for (var i = 0; i < n; i++) {
		real[i] =  creal[i] * cosTable[i] + cimag[i] * sinTable[i];
		imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
	}
}


/* 
 * Computes the circular convolution of the given real vectors. Each vector's length must be the same.
 */
function convolveReal(xvec, yvec, outvec) {
	var n = xvec.length;
	if (n != yvec.length || n != outvec.length)
		throw "Mismatched lengths";
	convolveComplex(xvec, newArrayOfZeros(n), yvec, newArrayOfZeros(n), outvec, newArrayOfZeros(n));
}


/* 
 * Computes the circular convolution of the given complex vectors. Each vector's length must be the same.
 */
function convolveComplex(xreal, ximag, yreal, yimag, outreal, outimag) {
	var n = xreal.length;
	if (n != ximag.length || n != yreal.length || n != yimag.length
			|| n != outreal.length || n != outimag.length)
		throw "Mismatched lengths";
	
	xreal = xreal.slice();
	ximag = ximag.slice();
	yreal = yreal.slice();
	yimag = yimag.slice();
	transform(xreal, ximag);
	transform(yreal, yimag);
	
	for (var i = 0; i < n; i++) {
		var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
		ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
		xreal[i] = temp;
	}
	inverseTransform(xreal, ximag);
	
	for (var i = 0; i < n; i++) {  // Scaling (because this FFT implementation omits it)
		outreal[i] = xreal[i] / n;
		outimag[i] = ximag[i] / n;
	}
}


function newArrayOfZeros(n) {
	var result = [];
	for (var i = 0; i < n; i++)
		result.push(0);
	return result;
}


// =======================================================================================

// Note: must bake the RingBuffer into the MyProcessor class perhaps due to how modules work.
class MyProcessor extends AudioWorkletProcessor {
  SetSourceSampleRate(sr) {
    // 坑：在手机上是48KHz，但是PC上是44100Hz
    this.original_sample_rate = sr;
    this.output_sample_rate   = 8000;  // 8kHz output

    this.orig_step_size = 160;
    this.out_step_size = sr/100;
  }
  constructor(options) {
    super();
    this.soundDataCallback = undefined;
    
    // Ring buffer
    const N = 80000;
    this.N = N;
    this.entries = new Float32Array(N);  // Save
    this.idx = 0; // curr idx
    this.endidx = N-1; // End Idx
    this.tot_entries = 0
    // End ring buffer

    let sampleRate = 44100;
    console.log("options: ");
    console.log(options)

    // processorOptions 是 AudioWorkletProcessor的构建函数的参数中的一个域
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor
    if (options.processorOptions.sampleRate != undefined) {
      sampleRate = options.processorOptions.sampleRate;
    }
    console.log("[MyProcessor]  sample rate: " + sampleRate);
    this.SetSourceSampleRate(sampleRate);

    this.orig_step = 0;
    this.out_step  = 0;
    this.downsamp_sum = 0;
    this.downsamp_count = 0;
    
    this.fft_window_size = 400;
    this.fft_window_increment = 160;
    this.next_fft_sampsize = 400;

    this.hanning_window = [];
    const w = this.fft_window_size;
    for (let i=0; i<w; i++) {
      const y = 0.54 - 0.46 * Math.cos(2*3.1415926*i / (w-1));
      this.hanning_window.push(y);
    }
  }

  // Ring buffer stuff
  AddEntry(ety) {
    this.tot_entries ++;
    this.entries[this.idx] = ety;
    this.idx = (this.idx + 1) % (this.N);
    if (this.idx == this.endidx) {
      this.endidx = (this.idx + 1) % this.N;
    }
  }
  ResetRingBuffer() {
    this.tot_entries = 0;
    this.idx = 0;
  }
  GetNEntries(tot_idx, n) {
    const delta = this.tot_entries - tot_idx;
    let idx = (this.idx - delta + this.N) % this.N;
    let ret = [];
    for (let i=0; i<n; i++) {
      ret.push(this.entries[idx]);
      idx = (idx + 1) % this.N;
    }
    return ret;
  }
  RingBufferSize() {
    return this.tot_entries;
  }

  process (inputs, outputs, parameters) {
    if (this.tot_entries == 0) {
      console.log("Parameters:")
      console.log(parameters)
    }  
    
    const input = inputs[0][0]
    if (input == undefined) return false;

    let downsampled = [];  // Downsampled samples for this CB

    input.forEach((sp) => {
      this.orig_step += this.orig_step_size;
      this.downsamp_sum += sp;
      this.downsamp_count += 1;
      if (this.orig_step > this.out_step_size) {
        this.orig_step = (this.orig_step % this.out_step_size);
        const sp = this.downsamp_sum / this.downsamp_count;
        this.downsamp_count = 0;
        this.downsamp_sum = 0;
        this.AddEntry(sp);
        downsampled.push(sp);
      }
    });

    let fft_frames = [];
    let fft_spectrums = [];
    let energy_frames = [];
    {
      const q = this.downsampled_q;
      const w = this.fft_window_size;

      while (this.RingBufferSize() > this.next_fft_sampsize) {
        const windowed = this.GetNEntries(this.next_fft_sampsize - w, w);
        let energy_sum = 0;
        for (let i=0; i<w; i++) {
          let s = windowed[i];
          s *= this.hanning_window[i];
          // Also convert to int16
          if (s > 1) s = 1;
          if (s < -1) s = -1;
          energy_sum += s * s;
          s = parseInt(32767 * s);
          windowed[i] = s;
        }
        energy_sum /= w;
        fft_frames.push(windowed);
        energy_frames.push(energy_sum);

        // Calculate FFT here, don't do it in the main thd?
        const real = new Float32Array(w);
        const imag = new Float32Array(w);
        for (let i=0; i<w; i++) {
          real[i] = windowed[i];
        }

        transform(real, imag);
        let spec = [];
        for (let i=0; i<w; i++) {
          const re = real[i], im = imag[i];
          const mag = Math.sqrt(re*re + im*im);
          spec.push(mag);
        }
        fft_spectrums.push(spec)
        
        this.next_fft_sampsize += this.fft_window_increment;
      }
    }

    let msg = {
      "buffer": input,
      "downsampled": downsampled,
    };
    if (fft_frames.length > 0) {
      msg["fft_frames"]    = fft_frames;
      msg["fft_spectrums"] = fft_spectrums;
      msg["energy_frames"] = energy_frames;
    }
    this.port.postMessage(msg);
    return true;
  }
}

registerProcessor('myprocessor', MyProcessor)