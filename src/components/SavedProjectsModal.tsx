import React, { useState, useEffect } from "react";
import { Progression } from "../types";
import { Folder, Save, Trash2, X, Play } from "lucide-react";

interface SavedProjectsModalProps {
  isOpen: boolean;
  currentProgression?: {
    chords: any[];
    key: string;
    bpm: number;
    timeSignature: string;
  };
  currentChords?: any[];
  bpm?: number;
  timeSignature?: string;
  keyName?: string;
  onClose: () => void;
  onLoadProject: (prog: Progression) => void;
  onShowToast?: (msg: string) => void;
}

const STORAGE_KEY = "chord_analyzer_saved_projects_v1";

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  currentProgression,
  currentChords,
  bpm: propBpm,
  timeSignature: propTimeSignature,
  keyName: propKeyName,
  onClose,
  onLoadProject,
  onShowToast,
}) => {
  const [projects, setProjects] = useState<Progression[]>([]);
  const [projectName, setProjectName] = useState("");

  const activeProgression = currentProgression || {
    chords: currentChords || [],
    key: propKeyName || "C Major",
    bpm: propBpm || 120,
    timeSignature: propTimeSignature || "4/4",
  };

  useEffect(() => {
    if (isOpen) {
      loadProjectsFromStorage();
    }
  }, [isOpen]);

  const loadProjectsFromStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setProjects(JSON.parse(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    if (!activeProgression.chords || activeProgression.chords.length === 0) {
      onShowToast?.("Cannot save an empty progression!");
      return;
    }

    if (projects.length >= 20) {
      onShowToast?.("Maximum limit of 20 projects reached. Delete an old project first.");
      return;
    }

    const newProject: Progression = {
      id: `proj-${Date.now()}`,
      name: projectName.trim(),
      key: activeProgression.key,
      mode: "major",
      bpm: activeProgression.bpm,
      timeSignature: activeProgression.timeSignature as any,
      chords: activeProgression.chords,
      createdAt: Date.now(),
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProjectName("");
    onShowToast?.(`Saved project "${newProject.name}"!`);
  };

  const handleDelete = (id: string, name: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    onShowToast?.(`Deleted project "${name}".`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2d3d]">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              Local Storage
            </label>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Saved Projects ({projects.length}/20)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Project Input */}
        <form onSubmit={handleSaveCurrent} className="flex gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name..."
            className="flex-1 px-3.5 py-2 bg-[#0f0f13] border border-[#3d3d52] rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7c5cbf]"
          />
          <button
            type="submit"
            disabled={!projectName.trim() || !activeProgression.chords || activeProgression.chords.length === 0}
            className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md disabled:opacity-40 transition"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </form>

        {/* Saved List */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {projects.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">
              No saved projects found. Type a name above to save your active progression.
            </p>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-[#0f0f13] border border-[#2d2d3d] p-3 rounded-lg flex items-center justify-between gap-3 hover:border-[#7c5cbf] transition"
              >
                <div>
                  <div className="text-xs font-bold text-white">{proj.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {proj.chords.map((c) => c.name).join(" - ")} · {proj.bpm} BPM
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onLoadProject(proj);
                      onClose();
                    }}
                    className="p-1.5 bg-[#252533] border border-[#3d3d52] hover:bg-[#7c5cbf] text-[#a88beb] hover:text-white rounded transition"
                    title="Load Project"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id, proj.name)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
