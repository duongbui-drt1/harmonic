import React from "react";
import { ChordItem } from "../types";
import { AiHarmonyPreview } from "./AiHarmonyPreview";

interface LyriaPreviewProps {
  chords: ChordItem[];
  keyName: string;
  bpm: number;
  timeSignature: string;
  onExactPlayback?: () => void;
  isPlayingExact?: boolean;
}

export const LyriaPreview: React.FC<LyriaPreviewProps> = (props) => {
  return <AiHarmonyPreview {...props} />;
};
