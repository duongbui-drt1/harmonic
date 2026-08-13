import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please set GEMINI_API_KEY in your AI Studio project secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// AI Generate Chord Progression
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    const systemInstruction = `You are an expert music theorist and composer assistant.
When asked to generate a chord progression, respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON.
Format:
{
"key": "C",
"mode": "major",
"chords": [
{ "name": "Cmaj7", "beats": 4 },
{ "name": "Am7", "beats": 4 },
{ "name": "Fmaj7", "beats": 4 },
{ "name": "G7", "beats": 4 }
],
"explanation": "A warm, jazzy pop progression...",
"mood": "warm, nostalgic, gentle",
"suggestedGenres": ["J-Pop", "Indie Pop", "Bossa Nova"]
}
Use standard chord notation. Chords must be real, playable, music-theory-correct.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate a chord progression for: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING },
            mode: { type: Type.STRING },
            chords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  beats: { type: Type.NUMBER },
                },
                required: ["name", "beats"],
              },
            },
            explanation: { type: Type.STRING },
            mood: { type: Type.STRING },
            suggestedGenres: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["key", "mode", "chords", "explanation", "mood", "suggestedGenres"],
        },
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate chord progression" });
  }
});

// AI Analyze Chord Progression
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { progression, key, bpm } = req.body;
    if (!progression || !Array.isArray(progression) || progression.length === 0) {
      return res.status(400).json({ error: "Valid chord progression required" });
    }

    const ai = getAiClient();
    const chordListStr = progression.map((c: any) => `${c.name} (${c.beats || 4} beats)`).join(" -> ");

    const systemInstruction = `You are an expert music theorist and song arranger.
Analyze the provided chord progression in depth and return a clean JSON object.
Format:
{
"key": "Detected Key",
"romanAnalysis": "I - vi - IV - V",
"emotionalCharacter": "Description of feeling, movement and tension/release",
"genreFit": ["Genre1", "Genre2"],
"suggestedMelodyDirection": "Tips on melodic notes, scales, and voice leading",
"lyricMoodKeywords": ["keyword1", "keyword2", "keyword3"],
"harmonicInsights": "Music theory breakdown of cadences, modal mixture, or substitutions used"
}`;

    const promptText = `Analyze this chord progression: ${chordListStr}. Specified Key context: ${key || "Auto"}. Tempo: ${bpm || 90} BPM.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING },
            romanAnalysis: { type: Type.STRING },
            emotionalCharacter: { type: Type.STRING },
            genreFit: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedMelodyDirection: { type: Type.STRING },
            lyricMoodKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            harmonicInsights: { type: Type.STRING },
          },
          required: [
            "key",
            "romanAnalysis",
            "emotionalCharacter",
            "genreFit",
            "suggestedMelodyDirection",
            "lyricMoodKeywords",
            "harmonicInsights",
          ],
        },
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze chord progression" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
