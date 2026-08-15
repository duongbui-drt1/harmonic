import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Tone from "tone";
import { ChordItem, InstrumentType, TimeSignatureString, ArpeggioSettings } from "../types";
import { createInstrumentSampler, createFallbackSynth } from "../utils/soundfontLoader";
import { getGuitarFingering, getGuitarMidiNotes } from "../utils/guitarVoicings";
import { midiToNoteName } from "../utils/noteNames";
import { ArpeggiatorEngine } from "../music/arpeggio";
import {
  TimeSignature,
  RhythmRegistry,
  RhythmScheduler,
  ProgressionSchedule,
  ScheduledMetronomeTick,
} from "../music/rhythm";

export interface UseAudioEngineOptions {
  bpm: number;
  timeSignature: TimeSignatureString;
  timeSignatureGrouping?: number[];
  instrument: InstrumentType;
  loop: boolean;
  metronome?: boolean;
  volume?: number;
  chords: ChordItem[];
  arpeggioSettings?: ArpeggioSettings;
}

// Helper to convert 0-100% volume into decibels with ultra-boosted gain headroom (up to +24dB boost)
const volumeToDb = (vol: number): number => {
  if (vol <= 0) return -100;
  const gainRatio = Math.max(0.01, (vol / 100) * 16.0);
  return Tone.gainToDb(gainRatio);
};

export function useAudioEngine(options: UseAudioEngineOptions) {
  const {
    bpm,
    timeSignature,
    timeSignatureGrouping,
    instrument,
    loop,
    metronome = false,
    volume = 80,
    chords,
    arpeggioSettings,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);
  const [activeSubdivisionIndex, setActiveSubdivisionIndex] = useState<number | null>(null);
  const [activeAccent, setActiveAccent] = useState<"strong" | "secondary" | "weak" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Initializing audio engine...");
  const [loadingPercent, setLoadingPercent] = useState(0);

  const activeSamplerRef = useRef<Tone.Sampler | null>(null);
  const fallbackSynthRef = useRef<Tone.PolySynth | null>(null);
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
  const timeSignatureRef = useRef<TimeSignatureString>(timeSignature);
  const groupingRef = useRef<number[] | undefined>(timeSignatureGrouping);
  const instrumentRef = useRef<InstrumentType>(instrument);
  const arpeggioSettingsRef = useRef<ArpeggioSettings | undefined>(arpeggioSettings);
  const scheduledEventIdsRef = useRef<number[]>([]);

  // TimeSignature Model resolution
  const timeSignatureModel = useMemo(() => {
    return RhythmRegistry.getTimeSignature(timeSignature, timeSignatureGrouping);
  }, [timeSignature, timeSignatureGrouping]);

  const timeSignatureModelRef = useRef<TimeSignature>(timeSignatureModel);
  timeSignatureModelRef.current = timeSignatureModel;

  // Keep refs in sync
  chordsRef.current = chords;
  loopRef.current = loop;
  metronomeRef.current = metronome;
  timeSignatureRef.current = timeSignature;
  groupingRef.current = timeSignatureGrouping;
  instrumentRef.current = instrument;
  arpeggioSettingsRef.current = arpeggioSettings;

  // Safe voice trigger helper that seamlessly falls back to synthesized audio if sampler buffers are not ready
  const triggerVoice = useCallback(
    (noteName: string, duration: any, time?: any, velocity: number = 0.8) => {
      const sampler = activeSamplerRef.current;
      if (sampler && sampler.loaded) {
        try {
          sampler.triggerAttackRelease(noteName, duration, time, velocity);
          return;
        } catch (e) {
          // Fallback if sampler has missing buffer
        }
      }
      if (fallbackSynthRef.current) {
        try {
          fallbackSynthRef.current.triggerAttackRelease(noteName, duration, time, velocity);
        } catch (_) {}
      }
    },
    []
  );

  // Initialize Volume, Limiter, Reverb Nodes and Fallback Synth
  useEffect(() => {
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

    const initialSynth = createFallbackSynth(instrumentRef.current).connect(reverb);
    fallbackSynthRef.current = initialSynth;

    if (activeSamplerRef.current) {
      activeSamplerRef.current.disconnect();
      activeSamplerRef.current.connect(reverb);
    }

    return () => {
      if (fallbackSynthRef.current) {
        try {
          fallbackSynthRef.current.dispose();
        } catch (_) {}
        fallbackSynthRef.current = null;
      }
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
      try {
        if (Tone.getContext().state === "running") {
          volumeNodeRef.current.volume.rampTo(targetDb, 0.05);
        } else {
          volumeNodeRef.current.volume.value = targetDb;
        }
      } catch (e) {
        try {
          volumeNodeRef.current.volume.value = targetDb;
        } catch (_) {}
      }
    }
  }, [volume]);

  // Dynamically update Transport loop & BPM properties
  useEffect(() => {
    Tone.getTransport().loop = loop;
  }, [loop]);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  // Update Transport Time Signature
  useEffect(() => {
    try {
      const [num, den] = timeSignatureModel.getToneTimeSignature();
      Tone.getTransport().timeSignature = [num, den];
    } catch (e) {
      // safe fallback
    }
  }, [timeSignatureModel]);

  // Initialize Metronome Click Synth with dynamic timbre & Drum Synths
  useEffect(() => {
    // Use PolySynth for metronome clicks to prevent overlapping envelope conflicts
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.03,
        sustain: 0,
        release: 0.01,
      },
    }).toDestination();
    synth.volume.value = -4; // Clear click track level
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

      if (activeSamplerRef.current) {
        try {
          activeSamplerRef.current.releaseAll();
        } catch (e) {}
      }

      // Recreate fallback synth for target instrument
      if (fallbackSynthRef.current) {
        try {
          fallbackSynthRef.current.dispose();
        } catch (_) {}
      }
      if (reverbRef.current) {
        fallbackSynthRef.current = createFallbackSynth(inst).connect(reverbRef.current);
      }

      if (Tone.getContext().state !== "running") {
        await Tone.start();
      }

      const sampler = await createInstrumentSampler(inst, (status) => {
        setLoadingStatus(status.message);
        setLoadingPercent(status.percent);
      });

      if (sampler && reverbRef.current) {
        sampler.disconnect();
        sampler.connect(reverbRef.current);
      }

      activeSamplerRef.current = sampler;
      currentInstrumentRef.current = inst;
      setIsLoading(false);
      setLoadingPercent(100);
    } catch (err) {
      console.error("Audio engine loading error:", err);
      setLoadingStatus("Audio synthesis active.");
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadInstrument(instrument);
  }, [instrument, loadInstrument]);

  // Play single chord (preview)
  const playChordPreview = useCallback(
    async (chord: ChordItem, customInst?: InstrumentType, forceArp?: boolean) => {
      if (Tone.getContext().state !== "running") {
        await Tone.start();
      }

      if (activeSamplerRef.current) {
        try {
          activeSamplerRef.current.releaseAll();
        } catch (e) {}
      }
      if (fallbackSynthRef.current) {
        try {
          fallbackSynthRef.current.releaseAll();
        } catch (e) {}
      }

      const instToUse = customInst || instrumentRef.current;
      const now = Tone.now();
      const model = timeSignatureModelRef.current;
      const bpmVal = Tone.getTransport().bpm.value || 90;
      const chordDuration = model.getChordDurationInSeconds(chord.beats, bpmVal);

      const baseVel = chord.velocity !== undefined ? chord.velocity / 100 : 0.8;
      const baseSustain = chord.sustain !== undefined ? chord.sustain / 100 : 1.0;

      const arpActive =
        forceArp !== undefined
          ? forceArp
          : arpeggioSettingsRef.current?.enabled &&
            arpeggioSettingsRef.current.pattern !== "off";

      if (arpActive && arpeggioSettingsRef.current && instToUse !== "drums") {
        const arpEvents = ArpeggiatorEngine.generateArpeggioEvents(
          chord,
          chordDuration,
          bpmVal,
          arpeggioSettingsRef.current
        );

        arpEvents.forEach((ev) => {
          triggerVoice(
            ev.noteName,
            ev.durationSeconds,
            now + ev.timeOffsetSeconds,
            ev.velocity
          );
        });
        return;
      }

      if (instToUse === "piano" || instToUse === "strings") {
        const notesToPlay = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];

        notesToPlay.forEach((midi) => {
          const noteName = midiToNoteName(midi);
          const noteVel = chord.noteVelocities?.[midi] !== undefined ? chord.noteVelocities[midi] / 100 : baseVel;
          const noteSusFactor = chord.noteSustains?.[midi] !== undefined ? chord.noteSustains[midi] / 100 : baseSustain;
          const durSec = Math.max(0.08, chordDuration * noteSusFactor);

          triggerVoice(noteName, durSec, now, noteVel);
        });
      } else if (instToUse === "drums") {
        if (kickSynthRef.current) kickSynthRef.current.triggerAttackRelease("C1", "8n", now);
        if (snareSynthRef.current) snareSynthRef.current.triggerAttackRelease("16n", now + 0.1);
        if (hihatSynthRef.current) hihatSynthRef.current.triggerAttackRelease("16n", now, 0.7);
        const rootMidi = chord.midiNotes && chord.midiNotes[0] ? chord.midiNotes[0] - 12 : 36;
        const durSec = Math.max(0.08, chordDuration * baseSustain);
        triggerVoice(midiToNoteName(rootMidi), durSec, now, baseVel);
      } else {
        const fingering = getGuitarFingering(chord.name);
        const midis = getGuitarMidiNotes(fingering);

        midis.forEach((midi, index) => {
          const noteName = midiToNoteName(midi);
          const strumDelay = index * 0.035;
          const noteVel = chord.noteVelocities?.[midi] !== undefined ? chord.noteVelocities[midi] / 100 : baseVel;
          const noteSusFactor = chord.noteSustains?.[midi] !== undefined ? chord.noteSustains[midi] / 100 : baseSustain;
          const durSec = Math.max(0.08, chordDuration * noteSusFactor);

          triggerVoice(noteName, durSec, now + strumDelay, noteVel);
        });
      }
    },
    [triggerVoice]
  );

  // Play single note (piano key press)
  const playNotePreview = useCallback(async (midi: number) => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    const noteName = midiToNoteName(midi);
    triggerVoice(noteName, "1n", Tone.now(), 0.9);
  }, [triggerVoice]);

  // Stop playback and release all active voices
  const stop = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    scheduledEventIdsRef.current = [];

    if (activeSamplerRef.current) {
      try {
        activeSamplerRef.current.releaseAll();
      } catch (e) {}
    }
    if (fallbackSynthRef.current) {
      try {
        fallbackSynthRef.current.releaseAll();
      } catch (e) {}
    }

    setIsPlaying(false);
    setCurrentChordIndex(null);
    setActiveBeatIndex(null);
    setActiveSubdivisionIndex(null);
    setActiveAccent(null);
  }, []);

  // Panic / Kill all notes safeguard
  const panic = useCallback(() => {
    stop();
    if (activeSamplerRef.current) {
      try {
        activeSamplerRef.current.releaseAll();
      } catch (e) {}
    }
    if (fallbackSynthRef.current) {
      try {
        fallbackSynthRef.current.releaseAll();
      } catch (e) {}
    }
  }, [stop]);

  const lastChordSigRef = useRef<string>("");

  // Play progression using generic RhythmScheduler
  const play = useCallback(async () => {
    if (!chordsRef.current || chordsRef.current.length === 0) return;

    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    stop(); // Clear any existing transport events

    Tone.getTransport().bpm.value = bpm;
    Tone.getTransport().loop = loopRef.current;

    const model = timeSignatureModelRef.current;
    const schedule: ProgressionSchedule = RhythmScheduler.scheduleProgression(
      chordsRef.current,
      model,
      bpm,
      true
    );

    Tone.getTransport().loopStart = 0;
    Tone.getTransport().loopEnd = schedule.loopEndSeconds;

    // Schedule Chords or Arpeggios on Transport at exact timestamps
    schedule.chordEvents.forEach((event) => {
      const { chord, startTimeSeconds, durationSeconds, chordIndex } = event;

      Tone.getTransport().schedule((now) => {
        // UI highlight callback
        Tone.Draw.schedule(() => {
          setCurrentChordIndex(chordIndex);
        }, now);

        const currentInst = instrumentRef.current;
        const baseVel = chord.velocity !== undefined ? chord.velocity / 100 : 0.8;
        const baseSustain = chord.sustain !== undefined ? chord.sustain / 100 : 1.0;

        const isArpActive =
          arpeggioSettingsRef.current?.enabled &&
          arpeggioSettingsRef.current.pattern !== "off" &&
          currentInst !== "drums";

        if (isArpActive && arpeggioSettingsRef.current) {
          const arpEvents = ArpeggiatorEngine.generateArpeggioEvents(
            chord,
            durationSeconds,
            bpm,
            arpeggioSettingsRef.current
          );

          arpEvents.forEach((ev) => {
            triggerVoice(
              ev.noteName,
              ev.durationSeconds,
              now + ev.timeOffsetSeconds,
              ev.velocity
            );
          });
          return;
        }

        if (currentInst === "piano" || currentInst === "strings") {
          const notesToPlay = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];

          notesToPlay.forEach((midi) => {
            const noteName = midiToNoteName(midi);
            const noteVel = chord.noteVelocities?.[midi] !== undefined ? chord.noteVelocities[midi] / 100 : baseVel;
            const noteSusFactor = chord.noteSustains?.[midi] !== undefined ? chord.noteSustains[midi] / 100 : baseSustain;
            const durSec = Math.max(0.08, durationSeconds * noteSusFactor);

            triggerVoice(noteName, durSec, now, noteVel);
          });
        } else if (currentInst === "drums") {
          // Play rhythmic drum groove suited to the meter
          const subDuration = model.getSubdivisionDuration(bpm);
          const totalSubsForChord = Math.max(1, Math.round(durationSeconds / subDuration));

          for (let s = 0; s < totalSubsForChord; s++) {
            const subTime = now + s * subDuration;
            const isKick = s % 2 === 0;
            const isSnare = s % 2 === 1;

            if (isKick && kickSynthRef.current) {
              kickSynthRef.current.triggerAttackRelease("C1", "8n", subTime);
            }
            if (isSnare && snareSynthRef.current) {
              snareSynthRef.current.triggerAttackRelease("16n", subTime);
            }
            if (hihatSynthRef.current) {
              hihatSynthRef.current.triggerAttackRelease("16n", subTime, 0.5);
            }
          }

          const rootMidi = chord.midiNotes && chord.midiNotes[0] ? chord.midiNotes[0] - 12 : 36;
          const durSec = Math.max(0.08, durationSeconds * baseSustain);
          triggerVoice(midiToNoteName(rootMidi), durSec, now, baseVel);
        } else {
          const fingering = getGuitarFingering(chord.name);
          const midis = getGuitarMidiNotes(fingering);

          midis.forEach((midi, idx) => {
            const noteName = midiToNoteName(midi);
            const strumDelay = idx * 0.03;
            const noteVel = chord.noteVelocities?.[midi] !== undefined ? chord.noteVelocities[midi] / 100 : baseVel;
            const noteSusFactor = chord.noteSustains?.[midi] !== undefined ? chord.noteSustains[midi] / 100 : baseSustain;
            const durSec = Math.max(0.08, durationSeconds * noteSusFactor);

            triggerVoice(noteName, durSec, now + strumDelay, noteVel);
          });
        }
      }, startTimeSeconds);
    });

    // Schedule Metronome Ticks & Beat Indicator updates
    schedule.metronomeTicks.forEach((tick: ScheduledMetronomeTick) => {
      Tone.getTransport().schedule((now) => {
        // Visual Beat & Subdivision Indicator sync
        Tone.Draw.schedule(() => {
          setActiveSubdivisionIndex(tick.subdivisionIndex);
          setActiveBeatIndex(tick.displayNumber - 1);
          setActiveAccent(tick.accent);
        }, now);

        // Audible click track
        if (metronomeRef.current && clickSynthRef.current) {
          clickSynthRef.current.triggerAttackRelease(
            tick.pitch,
            "32n",
            now,
            tick.velocity
          );
        }
      }, tick.timeSeconds);
    });

    // Schedule loop termination if looping is disabled
    Tone.getTransport().schedule((now) => {
      if (!loopRef.current) {
        Tone.Draw.schedule(() => {
          stop();
        }, now);
      }
    }, schedule.totalDurationSeconds);

    Tone.getTransport().position = 0;
    Tone.getTransport().start();
    setIsPlaying(true);
  }, [bpm, stop]);

  // Pause playback
  const pause = useCallback(() => {
    Tone.getTransport().pause();
    if (activeSamplerRef.current) {
      try {
        activeSamplerRef.current.releaseAll();
      } catch (e) {}
    }
    setIsPlaying(false);
  }, []);

  // Reschedule live playback if chord list, time signature, or arpeggiator structure changes during active playback
  useEffect(() => {
    const arpSig = arpeggioSettings
      ? `${arpeggioSettings.enabled}:${arpeggioSettings.pattern}:${arpeggioSettings.rate}:${arpeggioSettings.octaves}:${arpeggioSettings.gate}:${arpeggioSettings.swing}:${arpeggioSettings.accentFirstBeat}:${arpeggioSettings.rootBassNote}`
      : "no_arp";
    const currentSig = `${timeSignature}:${groupingRef.current?.join("+") || ""}:${chords.map((c) => `${c.id}:${c.name}:${c.beats}:${c.velocity}:${c.sustain}`).join("|")}:${arpSig}`;
    const isDifferent = lastChordSigRef.current !== currentSig;
    lastChordSigRef.current = currentSig;

    chordsRef.current = chords;
    arpeggioSettingsRef.current = arpeggioSettings;

    if (isDifferent && isPlaying) {
      play();
    }
  }, [chords, timeSignature, timeSignatureGrouping, arpeggioSettings, isPlaying, play]);

  return {
    isPlaying,
    currentChordIndex,
    activeBeatIndex,
    activeSubdivisionIndex,
    activeAccent,
    timeSignatureModel,
    isLoading,
    loadingStatus,
    loadingPercent,
    play,
    pause,
    stop,
    panic,
    playChordPreview,
    playNotePreview,
    loadInstrument,
  };
}
