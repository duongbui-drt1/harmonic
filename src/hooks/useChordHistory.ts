import { useState, useCallback } from "react";
import { ChordItem } from "../types";

const MAX_HISTORY_LENGTH = 50;

export function useChordHistory(initialChords: ChordItem[] = []) {
  const [history, setHistory] = useState<{
    past: ChordItem[][];
    present: ChordItem[];
    future: ChordItem[][];
  }>({
    past: [],
    present: initialChords,
    future: [],
  });

  const chords = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Set new chord list state, pushing current state to past stack
  const setChords = useCallback((newChords: ChordItem[] | ((prev: ChordItem[]) => ChordItem[])) => {
    setHistory((prevHistory) => {
      const nextPresent = typeof newChords === "function" ? newChords(prevHistory.present) : newChords;
      // Skip history update if state didn't actually change
      if (JSON.stringify(prevHistory.present) === JSON.stringify(nextPresent)) {
        return prevHistory;
      }

      const updatedPast = [...prevHistory.past, prevHistory.present];
      if (updatedPast.length > MAX_HISTORY_LENGTH) {
        updatedPast.shift();
      }

      return {
        past: updatedPast,
        present: nextPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.past.length === 0) return prevHistory;
      const previous = prevHistory.past[prevHistory.past.length - 1];
      const newPast = prevHistory.past.slice(0, prevHistory.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prevHistory.present, ...prevHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.future.length === 0) return prevHistory;
      const next = prevHistory.future[0];
      const newFuture = prevHistory.future.slice(1);
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const resetChords = useCallback((newChords: ChordItem[]) => {
    setHistory({
      past: [],
      present: newChords,
      future: [],
    });
  }, []);

  return {
    chords,
    setChords,
    undo,
    redo,
    canUndo,
    canRedo,
    resetChords,
    pastCount: history.past.length,
    futureCount: history.future.length,
  };
}
