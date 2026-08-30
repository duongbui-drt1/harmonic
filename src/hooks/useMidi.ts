import { useState, useEffect, useCallback, useRef } from "react";
import * as Tone from "tone";
import { MidiService, MidiDeviceInfo } from "../services/midi/MidiService";
import { DetectedMidiChord } from "../services/midi/MidiChordDetector";
import { MidiNoteOnEvent, MidiNoteOffEvent } from "../services/midi/MidiEventParser";
import { midiToNoteName } from "../utils/noteNames";

export interface UseMidiOptions {
  enableAudioSynth?: boolean;
  onNoteOn?: (event: MidiNoteOnEvent) => void;
  onNoteOff?: (event: MidiNoteOffEvent) => void;
  onChordDetected?: (chord: DetectedMidiChord | null) => void;
}

export function useMidi(options: UseMidiOptions = {}) {
  const { enableAudioSynth = true, onNoteOn, onNoteOff, onChordDetected } = options;

  const [isSupported, setIsSupported] = useState(MidiService.checkSupport());
  const [isInitialized, setIsInitialized] = useState(false);
  const [devices, setDevices] = useState<MidiDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [activeMidiNotes, setActiveMidiNotes] = useState<number[]>([]);
  const [detectedChord, setDetectedChord] = useState<DetectedMidiChord | null>(null);
  const [isSustainActive, setIsSustainActive] = useState(false);
  const [lastVelocity, setLastVelocity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Local synth fallback for MIDI live auditioning if needed
  const midiSynthRef = useRef<Tone.PolySynth | null>(null);

  // Initialize MIDI PolySynth for low-latency offline auditioning
  useEffect(() => {
    if (!enableAudioSynth) return;

    try {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle8" },
        envelope: {
          attack: 0.005,
          decay: 0.3,
          sustain: 0.6,
          release: 0.8,
        },
        volume: -2,
      }).toDestination();

      midiSynthRef.current = synth;
    } catch (e) {
      console.warn("Could not create local MIDI PolySynth:", e);
    }

    return () => {
      if (midiSynthRef.current) {
        try {
          midiSynthRef.current.dispose();
        } catch (_) {}
        midiSynthRef.current = null;
      }
    };
  }, [enableAudioSynth]);

  // Handle Note On with Web Audio / Tone.js
  const handleNoteOnEvent = useCallback(
    async (event: MidiNoteOnEvent) => {
      setLastVelocity(event.velocity);
      onNoteOn?.(event);

      if (enableAudioSynth) {
        try {
          if (Tone.getContext().state !== "running") {
            await Tone.start();
          }

          if (midiSynthRef.current) {
            const noteName = midiToNoteName(event.note);
            const vel = Math.max(0.1, Math.min(1.0, event.velocity / 127));
            midiSynthRef.current.triggerAttack(noteName, Tone.now(), vel);
          }
        } catch (e) {
          console.warn("Audio trigger error on MIDI Note On:", e);
        }
      }
    },
    [enableAudioSynth, onNoteOn]
  );

  // Handle Note Off
  const handleNoteOffEvent = useCallback(
    (event: MidiNoteOffEvent) => {
      onNoteOff?.(event);

      if (enableAudioSynth && midiSynthRef.current) {
        try {
          const noteName = midiToNoteName(event.note);
          midiSynthRef.current.triggerRelease(noteName, Tone.now());
        } catch (e) {}
      }
    },
    [enableAudioSynth, onNoteOff]
  );

  // Initialize and subscribe to MidiService
  const initializeMidi = useCallback(async () => {
    setError(null);
    const success = await MidiService.initialize();
    setIsInitialized(success);
    if (success) {
      setDevices(MidiService.getDevices());
      setActiveDeviceId(MidiService.getActiveDeviceId());
    }
    return success;
  }, []);

  useEffect(() => {
    setIsSupported(MidiService.checkSupport());

    // Auto-initialize if supported
    if (MidiService.checkSupport()) {
      initializeMidi();
    }

    const unsubNoteOn = MidiService.onNoteOn(handleNoteOnEvent);
    const unsubNoteOff = MidiService.onNoteOff(handleNoteOffEvent);
    const unsubActiveNotes = MidiService.onActiveNotesChange((notes) => {
      setActiveMidiNotes([...notes]);
    });
    const unsubChord = MidiService.onChordChange((chord) => {
      setDetectedChord(chord);
      onChordDetected?.(chord);
    });
    const unsubSustain = MidiService.onSustain((sustain) => {
      setIsSustainActive(sustain);
    });
    const unsubState = MidiService.onStateChange((devs) => {
      setDevices([...devs]);
      setActiveDeviceId(MidiService.getActiveDeviceId());
    });
    const unsubError = MidiService.onError((err) => {
      setError(err);
    });

    return () => {
      unsubNoteOn();
      unsubNoteOff();
      unsubActiveNotes();
      unsubChord();
      unsubSustain();
      unsubState();
      unsubError();
    };
  }, [handleNoteOnEvent, handleNoteOffEvent, initializeMidi, onChordDetected]);

  const selectDevice = useCallback((deviceId: string | null) => {
    MidiService.setActiveDevice(deviceId);
    setActiveDeviceId(deviceId);
  }, []);

  const refreshDevices = useCallback(() => {
    const devs = MidiService.refreshDevices();
    setDevices([...devs]);
  }, []);

  const releaseAll = useCallback(() => {
    MidiService.releaseAllNotes();
    if (midiSynthRef.current) {
      try {
        midiSynthRef.current.releaseAll();
      } catch (_) {}
    }
  }, []);

  const isConnected = devices.some((d) => d.state === "connected");

  return {
    isSupported,
    isInitialized,
    isConnected,
    devices,
    activeDeviceId,
    activeMidiNotes,
    detectedChord,
    isSustainActive,
    lastVelocity,
    error,
    initializeMidi,
    selectDevice,
    refreshDevices,
    releaseAll,
  };
}
