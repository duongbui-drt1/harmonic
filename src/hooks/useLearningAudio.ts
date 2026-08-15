import { useState, useRef, useCallback, useEffect } from "react";
import * as Tone from "tone";
import { createInstrumentSampler, createFallbackSynth } from "../utils/soundfontLoader";
import { midiToNoteName } from "../utils/noteNames";
import { InstrumentType, TimeSignatureString } from "../types";
import { RhythmRegistry } from "../music/rhythm";

export interface LearningAudioState {
  isPlaying: boolean;
  activeMidiNote: number | null;
  activeChordIndex: number | null;
  activeBeatIndex: number | null;
  activeSubdivisionIndex: number | null;
  isLoading: boolean;
}

export function useLearningAudio(instrument: InstrumentType = "piano") {
  const [state, setState] = useState<LearningAudioState>({
    isPlaying: false,
    activeMidiNote: null,
    activeChordIndex: null,
    activeBeatIndex: null,
    activeSubdivisionIndex: null,
    isLoading: false,
  });

  const samplerRef = useRef<Tone.Sampler | null>(null);
  const fallbackSynthRef = useRef<Tone.PolySynth | null>(null);
  const clickSynthRef = useRef<Tone.PolySynth | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  // Initialize synth & soundfont
  useEffect(() => {
    let isCancelled = false;

    // Create fallback synth right away for zero-latency audio
    const fallback = createFallbackSynth(instrument).toDestination();
    fallbackSynthRef.current = fallback;

    async function init() {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const sampler = await createInstrumentSampler(instrument);
        if (!isCancelled) {
          samplerRef.current = sampler;
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.warn("Learning sampler load fallback:", err);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    const click = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
    }).toDestination();
    click.volume.value = 1;
    clickSynthRef.current = click;

    init();

    return () => {
      isCancelled = true;
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
      if (samplerRef.current) {
        try {
          samplerRef.current.releaseAll();
        } catch (_) {}
      }
      if (fallbackSynthRef.current) {
        try {
          fallbackSynthRef.current.releaseAll();
          fallbackSynthRef.current.dispose();
        } catch (_) {}
      }
      if (clickSynthRef.current) {
        try {
          clickSynthRef.current.dispose();
        } catch (_) {}
      }
    };
  }, [instrument]);

  const clearAllScheduled = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    isPlayingRef.current = false;
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      activeMidiNote: null,
      activeChordIndex: null,
      activeBeatIndex: null,
      activeSubdivisionIndex: null,
    }));
    if (samplerRef.current) {
      try {
        samplerRef.current.releaseAll();
      } catch (_) {}
    }
    if (fallbackSynthRef.current) {
      try {
        fallbackSynthRef.current.releaseAll();
      } catch (_) {}
    }
  }, []);

  const ensureToneStarted = useCallback(async () => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
  }, []);

  const triggerVoice = useCallback(
    (noteName: string, durationSeconds: any, time?: any, velocity: number = 0.85) => {
      const sampler = samplerRef.current;
      if (sampler && sampler.loaded) {
        try {
          sampler.triggerAttackRelease(noteName, durationSeconds, time, velocity);
          return;
        } catch (e) {
          // fallback to synthesis
        }
      }
      if (fallbackSynthRef.current) {
        try {
          fallbackSynthRef.current.triggerAttackRelease(noteName, durationSeconds, time, velocity);
        } catch (_) {}
      }
    },
    []
  );

  // 1. Play single note
  const playNote = useCallback(
    async (midi: number, durationSeconds: number = 1.0, velocity: number = 0.85) => {
      await ensureToneStarted();
      const noteName = midiToNoteName(midi);
      const now = Tone.now();
      triggerVoice(noteName, durationSeconds, now, velocity);

      setState((prev) => ({ ...prev, activeMidiNote: midi }));
      const timer = window.setTimeout(() => {
        setState((prev) => (prev.activeMidiNote === midi ? { ...prev, activeMidiNote: null } : prev));
      }, durationSeconds * 1000);
      timeoutsRef.current.push(timer);
    },
    [ensureToneStarted, triggerVoice]
  );

  // 2. Play simultaneous chord notes (Block chord)
  const playChordBlock = useCallback(
    async (
      midis: number[],
      durationSeconds: number = 1.6,
      velocity: number = 0.8
    ) => {
      await ensureToneStarted();
      clearAllScheduled();
      if (midis.length === 0) return;

      const now = Tone.now();
      midis.forEach((midi) => {
        triggerVoice(midiToNoteName(midi), durationSeconds, now, velocity);
      });

      isPlayingRef.current = true;
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        activeMidiNote: null,
      }));

      const endTimer = window.setTimeout(() => {
        setState((prev) => ({ ...prev, isPlaying: false }));
        isPlayingRef.current = false;
      }, durationSeconds * 1000);
      timeoutsRef.current.push(endTimer);
    },
    [ensureToneStarted, clearAllScheduled, triggerVoice]
  );

  // 3. Play note sequence (Arpeggio, Scale, Interval Melodic) with real-time UI highlight
  const playNoteSequence = useCallback(
    async (
      midis: number[],
      noteIntervalMs: number = 380,
      noteDurationSeconds: number = 0.85,
      loop: boolean = false,
      onComplete?: () => void
    ) => {
      await ensureToneStarted();
      clearAllScheduled();
      if (midis.length === 0) return;

      isPlayingRef.current = true;
      setState((prev) => ({ ...prev, isPlaying: true }));

      const runSequence = () => {
        if (!isPlayingRef.current) return;

        midis.forEach((midi, idx) => {
          const timer = window.setTimeout(() => {
            if (!isPlayingRef.current) return;
            const now = Tone.now();
            triggerVoice(
              midiToNoteName(midi),
              noteDurationSeconds,
              now,
              0.85
            );
            setState((prev) => ({ ...prev, activeMidiNote: midi }));

            // On last note
            if (idx === midis.length - 1) {
              const resetTimer = window.setTimeout(() => {
                if (loop && isPlayingRef.current) {
                  runSequence();
                } else {
                  setState((prev) => ({
                    ...prev,
                    isPlaying: false,
                    activeMidiNote: null,
                  }));
                  isPlayingRef.current = false;
                  onComplete?.();
                }
              }, noteIntervalMs);
              timeoutsRef.current.push(resetTimer);
            }
          }, idx * noteIntervalMs);

          timeoutsRef.current.push(timer);
        });
      };

      runSequence();
    },
    [ensureToneStarted, clearAllScheduled, triggerVoice]
  );

  // 4. Play chord progression
  const playProgression = useCallback(
    async (
      chords: Array<{ name: string; midis: number[]; durationMs?: number }>,
      speedFactor: number = 1.0, // 1.0 normal, 0.5 slow
      loop: boolean = false,
      onComplete?: () => void
    ) => {
      await ensureToneStarted();
      clearAllScheduled();
      if (chords.length === 0) return;

      isPlayingRef.current = true;
      setState((prev) => ({ ...prev, isPlaying: true }));

      const defaultChordDuration = Math.round(1400 / speedFactor);

      const runProg = () => {
        if (!isPlayingRef.current) return;
        let cumulativeTime = 0;

        chords.forEach((chord, idx) => {
          const chordDur = chord.durationMs || defaultChordDuration;
          const timer = window.setTimeout(() => {
            if (!isPlayingRef.current) return;
            const now = Tone.now();
            const noteDurSec = (chordDur / 1000) * 0.95;

            chord.midis.forEach((midi) => {
              triggerVoice(
                midiToNoteName(midi),
                noteDurSec,
                now,
                0.85
              );
            });

            setState((prev) => ({
              ...prev,
              activeChordIndex: idx,
              activeMidiNote: chord.midis[0] || null,
            }));

            if (idx === chords.length - 1) {
              const finishTimer = window.setTimeout(() => {
                if (loop && isPlayingRef.current) {
                  runProg();
                } else {
                  setState((prev) => ({
                    ...prev,
                    isPlaying: false,
                    activeChordIndex: null,
                    activeMidiNote: null,
                  }));
                  isPlayingRef.current = false;
                  onComplete?.();
                }
              }, chordDur);
              timeoutsRef.current.push(finishTimer);
            }
          }, cumulativeTime);

          cumulativeTime += chordDur;
          timeoutsRef.current.push(timer);
        });
      };

      runProg();
    },
    [ensureToneStarted, clearAllScheduled, triggerVoice]
  );

  // 5. Play meter groove / metronome with beat accents (e.g. 2/4, 3/4, 4/4, 6/8 with 3+3)
  const playMeterGroove = useCallback(
    async (
      timeSignature: TimeSignatureString,
      grouping?: number[],
      bpm: number = 100,
      barsToPlay: number = 2
    ) => {
      await ensureToneStarted();
      clearAllScheduled();
      const clickSynth = clickSynthRef.current;
      if (!clickSynth) return;

      const model = RhythmRegistry.getTimeSignature(timeSignature, grouping);
      const subdivisions = model.getSubdivisions(bpm);
      const barDurationMs = model.getBarDuration(bpm) * 1000;

      isPlayingRef.current = true;
      setState((prev) => ({ ...prev, isPlaying: true }));

      for (let bar = 0; bar < barsToPlay; bar++) {
        const barStartOffset = bar * barDurationMs;

        subdivisions.forEach((sub) => {
          const eventTime = barStartOffset + sub.timeOffsetSeconds * 1000;

          const timer = window.setTimeout(() => {
            if (!isPlayingRef.current) return;

            const now = Tone.now();
            clickSynth.triggerAttackRelease(
              sub.clickPitch,
              "32n",
              now,
              sub.accentWeight
            );

            setState((prev) => ({
              ...prev,
              activeBeatIndex: sub.beatIndex,
              activeSubdivisionIndex: sub.index,
            }));
          }, eventTime);

          timeoutsRef.current.push(timer);
        });
      }

      const totalTime = barsToPlay * barDurationMs;
      const endTimer = window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          activeBeatIndex: null,
          activeSubdivisionIndex: null,
        }));
        isPlayingRef.current = false;
      }, totalTime);
      timeoutsRef.current.push(endTimer);
    },
    [ensureToneStarted, clearAllScheduled]
  );

  return {
    ...state,
    playNote,
    playChordBlock,
    playNoteSequence,
    playProgression,
    playMeterGroove,
    stop: clearAllScheduled,
  };
}
