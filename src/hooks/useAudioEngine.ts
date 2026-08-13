import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { ChordItem, InstrumentType } from "../types";
import { createInstrumentSampler } from "../utils/soundfontLoader";
import { getPianoVoicing } from "../utils/chordData";
import { getGuitarFingering, getGuitarMidiNotes } from "../utils/guitarVoicings";
import { midiToNoteName } from "../utils/noteNames";

export interface UseAudioEngineOptions {
  bpm: number;
  timeSignature: "3/4" | "4/4" | "6/8";
  instrument: InstrumentType;
  loop: boolean;
  metronome?: boolean;
  volume?: number;
  chords: ChordItem[];
}

// Helper to convert 0-100% volume into decibels with ultra-boosted gain headroom (up to +24dB boost)
const volumeToDb = (vol: number): number => {
  if (vol <= 0) return -100;
  // vol=100 -> 16.0 gain multiplier (+24.08 dB ultra boost)
  // vol=80 -> 10.0 gain multiplier (+20.00 dB boost)
  // vol=50 -> 4.0 gain multiplier (+12.04 dB boost)
  const gainRatio = Math.max(0.01, (vol / 100) * 16.0);
  return Tone.gainToDb(gainRatio);
};

export function useAudioEngine(options: UseAudioEngineOptions) {
  const { bpm, timeSignature, instrument, loop, metronome = false, volume = 80, chords } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Initializing audio engine...");
  const [loadingPercent, setLoadingPercent] = useState(0);

  const activeSamplerRef = useRef<Tone.Sampler | null>(null);
  const clickSynthRef = useRef<Tone.Synth | null>(null);
  const kickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const snareSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const hihatSynthRef = useRef<Tone.MetalSynth | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const currentInstrumentRef = useRef<InstrumentType>(instrument);
  const chordsRef = useRef<ChordItem[]>(chords);
  const loopRef = useRef<boolean>(loop);
  const metronomeRef = useRef<boolean>(metronome);
  const timeSignatureRef = useRef<"3/4" | "4/4" | "6/8">(timeSignature);
  const instrumentRef = useRef<InstrumentType>(instrument);
  const scheduledSequenceRef = useRef<Tone.Sequence | null>(null);

  // Keep refs in sync
  chordsRef.current = chords;
  loopRef.current = loop;
  metronomeRef.current = metronome;
  timeSignatureRef.current = timeSignature;
  instrumentRef.current = instrument;

  // Initialize Volume, Limiter and Reverb Nodes for natural room ambiance & boosted gain control
  useEffect(() => {
    // High-output limiter (-0.1 dB threshold) preventing clipping while delivering loud output
    const limiter = new Tone.Limiter(-0.1).toDestination();
    limiterRef.current = limiter;

    const initialDb = volumeToDb(volume);
    const volumeNode = new Tone.Volume(initialDb).connect(limiter);
    volumeNodeRef.current = volumeNode;

    const reverb = new Tone.Reverb({
      decay: 2.2,
      preDelay: 0.01,
      wet: 0.28,
    }).connect(volumeNode);

    reverbRef.current = reverb;

    // Connect active sampler if already present
    if (activeSamplerRef.current) {
      activeSamplerRef.current.disconnect();
      activeSamplerRef.current.connect(reverb);
    }

    return () => {
      reverb.dispose();
      reverbRef.current = null;
      volumeNode.dispose();
      volumeNodeRef.current = null;
      limiter.dispose();
      limiterRef.current = null;
    };
  }, []);

  // Smoothly update Volume Node when volume prop changes
  useEffect(() => {
    if (volumeNodeRef.current) {
      const targetDb = volumeToDb(volume);
      volumeNodeRef.current.volume.rampTo(targetDb, 0.05);
    }
  }, [volume]);

  // Dynamically update Transport loop & BPM properties when props change
  useEffect(() => {
    Tone.getTransport().loop = loop;
  }, [loop]);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  // Initialize Metronome Click Synth and Drum Synths
  useEffect(() => {
    const synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.001,
        decay: 0.03,
        sustain: 0,
        release: 0.02,
      },
    }).toDestination();
    synth.volume.value = -12; // Subtle click track level
    clickSynthRef.current = synth;

    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 8,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 },
    }).toDestination();
    kick.volume.value = 4;
    kickSynthRef.current = kick;

    const snare = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination();
    snare.volume.value = -2;
    snareSynthRef.current = snare;

    const hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.06, release: 0.06 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    hihat.volume.value = -12;
    hihatSynthRef.current = hihat;

    return () => {
      synth.dispose();
      clickSynthRef.current = null;
      kick.dispose();
      kickSynthRef.current = null;
      snare.dispose();
      snareSynthRef.current = null;
      hihat.dispose();
      hihatSynthRef.current = null;
    };
  }, []);

  // Initialize & switch instrument sampler
  const loadInstrument = useCallback(async (inst: InstrumentType) => {
    try {
      setIsLoading(true);
      setLoadingStatus(`Loading ${inst.replace("_", " ")} soundfont...`);
      setLoadingPercent(20);

      // Ensure AudioContext is started on user gesture
      if (Tone.getContext().state !== "running") {
        await Tone.start();
      }

      const sampler = await createInstrumentSampler(inst, (status) => {
        setLoadingStatus(status.message);
        setLoadingPercent(status.percent);
      });

      if (reverbRef.current) {
        sampler.disconnect();
        sampler.connect(reverbRef.current);
      }

      activeSamplerRef.current = sampler;
      currentInstrumentRef.current = inst;
      setIsLoading(false);
      setLoadingPercent(100);
    } catch (err) {
      console.error("Audio engine loading error:", err);
      setLoadingStatus("Audio loading failed. Please refresh.");
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadInstrument(instrument);
  }, [instrument, loadInstrument]);

  // Update BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  // Update Time Signature
  useEffect(() => {
    const [num, den] = timeSignature.split("/").map(Number);
    Tone.getTransport().timeSignature = [num, den];
  }, [timeSignature]);

  // Play single chord (preview)
  const playChordPreview = useCallback(async (chord: ChordItem, customInst?: InstrumentType) => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    const sampler = activeSamplerRef.current;
    if (!sampler) return;

    const instToUse = customInst || instrumentRef.current;
    const now = Tone.now();

    if (instToUse === "piano") {
      // Piano full voicing
      const notesToPlay = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];
      const noteNames = notesToPlay.map((m) => midiToNoteName(m));
      sampler.triggerAttackRelease(noteNames, "2n", now, 1.0);
    } else if (instToUse === "strings") {
      // Violin / String Ensemble legato chord
      const notesToPlay = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];
      const noteNames = notesToPlay.map((m) => midiToNoteName(m));
      sampler.triggerAttackRelease(noteNames, "1n", now, 0.9);
    } else if (instToUse === "drums") {
      // Drum preview hit: Kick + Snare + Hihat + Bass note
      if (kickSynthRef.current) kickSynthRef.current.triggerAttackRelease("C1", "8n", now);
      if (snareSynthRef.current) snareSynthRef.current.triggerAttackRelease("16n", now + 0.1);
      if (hihatSynthRef.current) hihatSynthRef.current.triggerAttackRelease("16n", now, 0.7);
      if (sampler) {
        const rootMidi = (chord.midiNotes && chord.midiNotes[0]) ? chord.midiNotes[0] - 12 : 36;
        sampler.triggerAttackRelease(midiToNoteName(rootMidi), "4n", now, 0.8);
      }
    } else {
      // Guitar strumming
      const fingering = getGuitarFingering(chord.name);
      const midis = getGuitarMidiNotes(fingering);
      const noteNames = midis.map((m) => midiToNoteName(m));

      noteNames.forEach((note, index) => {
        const strumDelay = index * 0.035; // 35ms strum gap
        sampler.triggerAttackRelease(note, "2n", now + strumDelay, 1.0);
      });
    }
  }, []);

  // Play single note (piano key press)
  const playNotePreview = useCallback(async (midi: number) => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    const sampler = activeSamplerRef.current;
    if (!sampler) return;

    const noteName = midiToNoteName(midi);
    sampler.triggerAttackRelease(noteName, "1n", Tone.now(), 1.0);
  }, []);

  // Stop playback
  const stop = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    if (scheduledSequenceRef.current) {
      scheduledSequenceRef.current.dispose();
      scheduledSequenceRef.current = null;
    }
    setIsPlaying(false);
    setCurrentChordIndex(null);
  }, []);

  const lastChordSigRef = useRef<string>("");

  // Play progression
  const play = useCallback(async () => {
    if (chordsRef.current.length === 0) return;

    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    stop(); // Clear any existing transport events

    Tone.getTransport().bpm.value = bpm;
    Tone.getTransport().loop = loopRef.current;

    const [num] = timeSignatureRef.current.split("/").map(Number);
    const beatsPerMeasure = num || 4;

    // Calculate duration of progression in beats
    const events: Array<{ time: number; chordIndex: number; chord: ChordItem }> = [];
    let currentBeatOffset = 0;

    chordsRef.current.forEach((chord, index) => {
      events.push({
        time: currentBeatOffset,
        chordIndex: index,
        chord,
      });
      currentBeatOffset += chord.beats;
    });

    const totalBeats = currentBeatOffset;
    const bars = Math.floor(totalBeats / beatsPerMeasure);
    const quarterBeats = totalBeats % beatsPerMeasure;
    const totalTimeStr = `${bars}:${quarterBeats}:0`;

    Tone.getTransport().loopStart = "0:0:0";
    Tone.getTransport().loopEnd = totalTimeStr;

    // Schedule chord events on Transport
    events.forEach(({ time, chordIndex, chord }) => {
      const bar = Math.floor(time / beatsPerMeasure);
      const beat = time % beatsPerMeasure;
      const transportTime = `${bar}:${beat}:0`;

      Tone.getTransport().schedule((now) => {
        // UI highlight callback
        Tone.Draw.schedule(() => {
          setCurrentChordIndex(chordIndex);
        }, now);

        const sampler = activeSamplerRef.current;
        if (!sampler) return;

        const currentInst = instrumentRef.current;
        const durationBeats = chord.beats;
        const durationStr = `${durationBeats}n`;

        if (currentInst === "piano") {
          const notesToPlay = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];
          const noteNames = notesToPlay.map((m) => midiToNoteName(m));
          sampler.triggerAttackRelease(noteNames, durationStr, now, 1.0);
        } else if (currentInst === "strings") {
          const notesToPlay = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];
          const noteNames = notesToPlay.map((m) => midiToNoteName(m));
          sampler.triggerAttackRelease(noteNames, durationStr, now, 0.9);
        } else if (currentInst === "drums") {
          // Play rhythmic drum groove for the duration of this chord
          const secondsPerBeat = 60 / Tone.getTransport().bpm.value;
          for (let b = 0; b < durationBeats; b++) {
            const beatTime = now + b * secondsPerBeat;
            const isKickBeat = b % 2 === 0;
            const isSnareBeat = b % 2 === 1;

            if (isKickBeat && kickSynthRef.current) {
              kickSynthRef.current.triggerAttackRelease("C1", "8n", beatTime);
            }
            if (isSnareBeat && snareSynthRef.current) {
              snareSynthRef.current.triggerAttackRelease("16n", beatTime);
            }
            if (hihatSynthRef.current) {
              hihatSynthRef.current.triggerAttackRelease("16n", beatTime, 0.6);
              hihatSynthRef.current.triggerAttackRelease("16n", beatTime + secondsPerBeat / 2, 0.4);
            }
          }
          // Also play bass note of the chord
          if (sampler) {
            const rootMidi = (chord.midiNotes && chord.midiNotes[0]) ? chord.midiNotes[0] - 12 : 36;
            sampler.triggerAttackRelease(midiToNoteName(rootMidi), durationStr, now, 0.8);
          }
        } else {
          const fingering = getGuitarFingering(chord.name);
          const midis = getGuitarMidiNotes(fingering);
          const noteNames = midis.map((m) => midiToNoteName(m));

          noteNames.forEach((note, idx) => {
            const strumDelay = idx * 0.03; // 30ms strum gap
            sampler.triggerAttackRelease(note, durationStr, now + strumDelay, 1.0);
          });
        }
      }, transportTime);
    });

    // Schedule beat-by-beat metronome clicks synced to BPM
    for (let b = 0; b < totalBeats; b++) {
      const bBar = Math.floor(b / beatsPerMeasure);
      const bBeat = b % beatsPerMeasure;
      const bTransportTime = `${bBar}:${bBeat}:0`;

      Tone.getTransport().schedule((now) => {
        if (metronomeRef.current && clickSynthRef.current) {
          const isDownbeat = b % beatsPerMeasure === 0;
          clickSynthRef.current.triggerAttackRelease(
            isDownbeat ? "C6" : "G5",
            "32n",
            now,
            isDownbeat ? 0.6 : 0.3
          );
        }
      }, bTransportTime);
    }

    // Schedule end of progression callback (if looping is off)
    Tone.getTransport().schedule((now) => {
      if (!loopRef.current) {
        Tone.Draw.schedule(() => {
          stop();
        }, now);
      }
    }, totalTimeStr);

    Tone.getTransport().position = "0:0:0";
    Tone.getTransport().start();
    setIsPlaying(true);
  }, [bpm, stop]);

  // Pause playback
  const pause = useCallback(() => {
    Tone.getTransport().pause();
    setIsPlaying(false);
  }, []);

  // Reschedule live playback ONLY if chord list structure actually changes during playback
  useEffect(() => {
    const currentSig = chords.map((c) => `${c.id}:${c.name}:${c.beats}`).join("|");
    const isDifferent = lastChordSigRef.current !== currentSig;
    lastChordSigRef.current = currentSig;

    chordsRef.current = chords;

    if (isDifferent && isPlaying) {
      play();
    }
  }, [chords, isPlaying, play]);

  return {
    isPlaying,
    currentChordIndex,
    isLoading,
    loadingStatus,
    loadingPercent,
    play,
    pause,
    stop,
    playChordPreview,
    playNotePreview,
    loadInstrument,
  };
}
