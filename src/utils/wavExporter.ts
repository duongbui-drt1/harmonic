import * as Tone from "tone";
import { ChordItem, InstrumentType } from "../types";

/**
 * Converts a Web Audio API AudioBuffer into a WAV formatted Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeString = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* RIFF chunk length */
  view.setUint32(4, 36 + dataSize, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = buffer.getChannelData(channel)[i];
      // Clamp values between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit integer range
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Renders the chord progression offline using Tone.js and encodes as a WAV file
 */
export async function renderProgressionToWav(
  chords: ChordItem[],
  bpm: number,
  instrumentType: InstrumentType = "piano"
): Promise<Blob> {
  const secondsPerBeat = 60 / bpm;
  const totalBeats = chords.reduce((sum, c) => sum + c.beats, 0);
  const durationInSeconds = Math.max(1, totalBeats * secondsPerBeat + 1.8); // Include decay tail

  const toneBuffer = await Tone.Offline(async () => {
    // Setup Reverb Node in offline context
    const reverb = new Tone.Reverb({
      decay: 2.2,
      wet: 0.3,
    }).toDestination();
    await reverb.generate();

    // Create polyphonic synth suited to the instrument
    let synth: Tone.PolySynth;
    if (instrumentType.includes("guitar")) {
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.01,
          decay: 0.9,
          sustain: 0.15,
          release: 1.2,
        },
      }).connect(reverb);
    } else {
      // Rich piano-like timbre
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle8" },
        envelope: {
          attack: 0.005,
          decay: 1.5,
          sustain: 0.25,
          release: 1.5,
        },
      }).connect(reverb);
    }

    let currentTime = 0;
    chords.forEach((chord) => {
      const chordDuration = chord.beats * secondsPerBeat;
      const notes =
        chord.notes && chord.notes.length > 0
          ? chord.notes
          : chord.midiNotes
          ? chord.midiNotes.map((m) => Tone.Frequency(m, "midi").toNote())
          : ["C4", "E4", "G4"];

      synth.triggerAttackRelease(notes, chordDuration * 0.92, currentTime);
      currentTime += chordDuration;
    });
  }, durationInSeconds);

  // Extract native AudioBuffer from ToneAudioBuffer
  const nativeBuffer = toneBuffer.get() as AudioBuffer;
  return audioBufferToWav(nativeBuffer);
}
