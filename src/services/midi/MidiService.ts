import { parseMidiMessage, ParsedMidiEvent, MidiNoteOnEvent, MidiNoteOffEvent, MidiControlChangeEvent } from "./MidiEventParser";
import { detectMidiChord, DetectedMidiChord } from "./MidiChordDetector";

// Web MIDI Type interfaces
export interface WebMidiInput {
  id: string;
  name?: string;
  manufacturer?: string;
  state?: string;
  connection?: string;
  onmidimessage: ((event: any) => void) | null;
}

export interface WebMidiAccess {
  inputs: {
    values: () => IterableIterator<WebMidiInput>;
    get: (id: string) => WebMidiInput | undefined;
  };
  onstatechange: ((event: any) => void) | null;
}

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: "connected" | "disconnected";
  connection: "open" | "closed" | "pending";
}

export type MidiEventCallback<T = any> = (event: T) => void;

class MidiServiceImpl {
  private midiAccess: WebMidiAccess | null = null;
  private isSupported: boolean = false;
  private isInitialized: boolean = false;
  private isConnecting: boolean = false;
  private activeDeviceId: string | null = null; // null means listen to all connected inputs
  private error: string | null = null;

  // Active held notes set (MIDI note numbers 0..127)
  private heldNotes = new Set<number>();
  private noteVelocities = new Map<number, number>();
  private isSustainPedalActive: boolean = false;
  private sustainedNotes = new Set<number>(); // Notes released while pedal is down

  // Cached detected chord with debounce
  private currentDetectedChord: DetectedMidiChord | null = null;
  private chordDetectionDebounceTimer: any = null;

  // Event Listeners
  private noteOnListeners = new Set<MidiEventCallback<MidiNoteOnEvent>>();
  private noteOffListeners = new Set<MidiEventCallback<MidiNoteOffEvent>>();
  private ccListeners = new Set<MidiEventCallback<MidiControlChangeEvent>>();
  private sustainListeners = new Set<MidiEventCallback<boolean>>();
  private stateChangeListeners = new Set<MidiEventCallback<MidiDeviceInfo[]>>();
  private chordChangeListeners = new Set<MidiEventCallback<DetectedMidiChord | null>>();
  private activeNotesChangeListeners = new Set<MidiEventCallback<number[]>>();
  private errorListeners = new Set<MidiEventCallback<string>>();

  constructor() {
    this.isSupported = typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized && this.midiAccess) {
      return true;
    }

    if (!this.isSupported) {
      this.error = "Trình duyệt của bạn chưa hỗ trợ Web MIDI.";
      this.notifyError(this.error);
      return false;
    }

    if (this.isConnecting) return false;

    this.isConnecting = true;
    this.error = null;

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.isInitialized = true;
      this.isConnecting = false;

      // Bind input message listeners
      this.bindInputs();

      // Listen for device connect/disconnect changes
      this.midiAccess.onstatechange = (event: any) => {
        this.bindInputs();
        this.notifyStateChange();
      };

      this.notifyStateChange();
      return true;
    } catch (err: any) {
      this.isConnecting = false;
      this.isInitialized = false;
      this.error = err?.message?.includes("denied")
        ? "Bạn chưa cấp quyền truy cập MIDI cho ứng dụng."
        : "Không thể truy cập thiết bị MIDI. Hãy kiểm tra kết nối thiết bị USB.";
      this.notifyError(this.error);
      return false;
    }
  }

  public getDevices(): MidiDeviceInfo[] {
    if (!this.midiAccess) return [];
    const devices: MidiDeviceInfo[] = [];
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      devices.push({
        id: input.id,
        name: input.name || `MIDI Device (${input.id})`,
        manufacturer: input.manufacturer || "Generic",
        state: input.state as any,
        connection: input.connection as any,
      });
    }
    return devices;
  }

  public getActiveDeviceId(): string | null {
    return this.activeDeviceId;
  }

  public setActiveDevice(deviceId: string | null): void {
    this.activeDeviceId = deviceId;
    this.bindInputs();
    this.notifyStateChange();
  }

  public refreshDevices(): MidiDeviceInfo[] {
    if (this.midiAccess) {
      this.bindInputs();
      this.notifyStateChange();
    }
    return this.getDevices();
  }

  private bindInputs(): void {
    if (!this.midiAccess) return;

    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      // Clear previous onmidimessage to prevent duplicate listeners
      input.onmidimessage = null;

      const shouldListen =
        this.activeDeviceId === null || this.activeDeviceId === input.id;

      if (shouldListen && input.state === "connected") {
        input.onmidimessage = (event: { data: Uint8Array; timeStamp: number }) => {
          this.handleMidiMessage(event);
        };
      }
    }
  }

  private handleMidiMessage(event: { data: Uint8Array; timeStamp: number }): void {
    const parsed = parseMidiMessage(event.data, event.timeStamp);
    if (!parsed) return;

    if (parsed.type === "noteon") {
      this.handleNoteOn(parsed as MidiNoteOnEvent);
    } else if (parsed.type === "noteoff") {
      this.handleNoteOff(parsed as MidiNoteOffEvent);
    } else if (parsed.type === "cc") {
      this.handleControlChange(parsed as MidiControlChangeEvent);
    }
  }

  private handleNoteOn(event: MidiNoteOnEvent): void {
    this.heldNotes.add(event.note);
    this.sustainedNotes.delete(event.note);
    this.noteVelocities.set(event.note, event.velocity);

    // Notify listeners immediately (audio trigger)
    this.noteOnListeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error("Error in noteOn listener:", e);
      }
    });

    this.triggerChordUpdate();
  }

  private handleNoteOff(event: MidiNoteOffEvent): void {
    if (this.isSustainPedalActive) {
      // Mark as sustained while pedal is held
      this.sustainedNotes.add(event.note);
    } else {
      this.heldNotes.delete(event.note);
      this.sustainedNotes.delete(event.note);
      this.noteVelocities.delete(event.note);
    }

    // Notify listeners immediately
    this.noteOffListeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error("Error in noteOff listener:", e);
      }
    });

    this.triggerChordUpdate();
  }

  private handleControlChange(event: MidiControlChangeEvent): void {
    if (event.isSustain) {
      const wasActive = this.isSustainPedalActive;
      this.isSustainPedalActive = event.sustainActive;

      // If pedal was released, release all notes that were sustained
      if (wasActive && !this.isSustainPedalActive) {
        this.sustainedNotes.forEach((note) => {
          this.heldNotes.delete(note);
          this.noteVelocities.delete(note);
          // Trigger noteOff notification for sustained note
          const syntheticOff: MidiNoteOffEvent = {
            type: "noteoff",
            channel: event.channel,
            note,
            noteName: "",
            velocity: 0,
            timestamp: event.timestamp,
            raw: new Uint8Array([0x80, note, 0]),
          };
          this.noteOffListeners.forEach((cb) => {
            try {
              cb(syntheticOff);
            } catch (e) {}
          });
        });
        this.sustainedNotes.clear();
        this.triggerChordUpdate();
      }

      this.sustainListeners.forEach((cb) => {
        try {
          cb(this.isSustainPedalActive);
        } catch (e) {}
      });
    }

    this.ccListeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {}
    });
  }

  private triggerChordUpdate(): void {
    const activeList = Array.from(this.heldNotes).sort((a, b) => a - b);
    this.activeNotesChangeListeners.forEach((cb) => {
      try {
        cb(activeList);
      } catch (e) {}
    });

    // Immediate calculation for detection
    if (this.chordDetectionDebounceTimer) {
      clearTimeout(this.chordDetectionDebounceTimer);
    }

    // Small debounce (15ms) for UI stability during simultaneous chord strikes
    this.chordDetectionDebounceTimer = setTimeout(() => {
      const detected = detectMidiChord(activeList);
      this.currentDetectedChord = detected;
      this.chordChangeListeners.forEach((cb) => {
        try {
          cb(detected);
        } catch (e) {}
      });
    }, 15);
  }

  public getHeldNotes(): number[] {
    return Array.from(this.heldNotes).sort((a, b) => a - b);
  }

  public getDetectedChord(): DetectedMidiChord | null {
    return this.currentDetectedChord;
  }

  public isSustainActive(): boolean {
    return this.isSustainPedalActive;
  }

  public releaseAllNotes(): void {
    const notesToRelease = Array.from(this.heldNotes);
    this.heldNotes.clear();
    this.sustainedNotes.clear();
    this.noteVelocities.clear();

    notesToRelease.forEach((note) => {
      const syntheticOff: MidiNoteOffEvent = {
        type: "noteoff",
        channel: 1,
        note,
        noteName: "",
        velocity: 0,
        timestamp: performance.now(),
        raw: new Uint8Array([0x80, note, 0]),
      };
      this.noteOffListeners.forEach((cb) => {
        try {
          cb(syntheticOff);
        } catch (e) {}
      });
    });

    this.triggerChordUpdate();
  }

  // Subscription methods
  public onNoteOn(cb: MidiEventCallback<MidiNoteOnEvent>): () => void {
    this.noteOnListeners.add(cb);
    return () => this.noteOnListeners.delete(cb);
  }

  public onNoteOff(cb: MidiEventCallback<MidiNoteOffEvent>): () => void {
    this.noteOffListeners.add(cb);
    return () => this.noteOffListeners.delete(cb);
  }

  public onCC(cb: MidiEventCallback<MidiControlChangeEvent>): () => void {
    this.ccListeners.add(cb);
    return () => this.ccListeners.delete(cb);
  }

  public onSustain(cb: MidiEventCallback<boolean>): () => void {
    this.sustainListeners.add(cb);
    return () => this.sustainListeners.delete(cb);
  }

  public onStateChange(cb: MidiEventCallback<MidiDeviceInfo[]>): () => void {
    this.stateChangeListeners.add(cb);
    return () => this.stateChangeListeners.delete(cb);
  }

  public onChordChange(cb: MidiEventCallback<DetectedMidiChord | null>): () => void {
    this.chordChangeListeners.add(cb);
    return () => this.chordChangeListeners.delete(cb);
  }

  public onActiveNotesChange(cb: MidiEventCallback<number[]>): () => void {
    this.activeNotesChangeListeners.add(cb);
    return () => this.activeNotesChangeListeners.delete(cb);
  }

  public onError(cb: MidiEventCallback<string>): () => void {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }

  private notifyStateChange(): void {
    const devices = this.getDevices();
    this.stateChangeListeners.forEach((cb) => {
      try {
        cb(devices);
      } catch (e) {}
    });
  }

  private notifyError(msg: string): void {
    this.errorListeners.forEach((cb) => {
      try {
        cb(msg);
      } catch (e) {}
    });
  }
}

export const MidiService = new MidiServiceImpl();
