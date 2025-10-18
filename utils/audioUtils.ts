export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function createWavBlob(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob {
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // true for little-endian
  writeString(view, 8, 'WAVE');
  
  // "fmt " subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true); // AudioFormat: 1 for PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  // "data" subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write PCM data
  new Uint8Array(buffer).set(pcmData, 44);

  return new Blob([view], { type: 'audio/wav' });
}

export async function processAudio(base64Audio: string, pitchSemitones: number): Promise<Blob> {
  const pcmData = decodeBase64(base64Audio);
  const sampleRate = 24000; // Gemini TTS returns 24kHz audio

  // If no pitch shift is needed, create the WAV directly and return
  if (pitchSemitones === 0) {
    return createWavBlob(pcmData, sampleRate, 1, 16);
  }

  // Convert Uint8 PCM data to Int16, then to Float32 for Web Audio API
  const pcmInt16 = new Int16Array(pcmData.buffer);
  
  // Offline context avoids playing the sound, processes it as fast as possible
  const offlineCtx = new OfflineAudioContext(1, pcmInt16.length, sampleRate);
  
  const buffer = offlineCtx.createBuffer(1, pcmInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  // Normalize Int16 data to Float32 range [-1.0, 1.0]
  for (let i = 0; i < pcmInt16.length; i++) {
    channelData[i] = pcmInt16[i] / 32768.0;
  }
  
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  
  // The playbackRate property changes pitch. The formula converts semitones to a rate multiplier.
  source.playbackRate.value = Math.pow(2, pitchSemitones / 12);
  
  source.connect(offlineCtx.destination);
  source.start(0);
  
  // Render the audio graph to get the pitch-shifted audio
  const renderedBuffer = await offlineCtx.startRendering();
  
  // Convert the processed Float32 AudioBuffer back to Int16 PCM
  const renderedFloatData = renderedBuffer.getChannelData(0);
  const renderedInt16Data = new Int16Array(renderedFloatData.length);
  
  for (let i = 0; i < renderedFloatData.length; i++) {
    // Clamp values to avoid distortion and convert back to 16-bit integer
    renderedInt16Data[i] = Math.max(-1, Math.min(1, renderedFloatData[i])) * 32767;
  }
  
  // Create a WAV blob from the new PCM data
  return createWavBlob(new Uint8Array(renderedInt16Data.buffer), sampleRate, 1, 16);
}