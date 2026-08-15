import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { buildLyriaPrompt } from "./src/music/lyria/lyriaPromptBuilder";
import { aceStepRouter } from "./src/server/aceStepRouter";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount ACE-Step (Hugging Face ZeroGPU) router
app.use("/api/acestep", aceStepRouter);

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

// Rate limiter & In-memory cache for Lyria
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const lyriaCache = new Map<string, { audio: string; mimeType: string; prompt: string; createdAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 15;

  const userRecord = ipRequestCounts.get(ip);
  if (!userRecord || now > userRecord.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRecord.count >= maxRequests) {
    return false;
  }

  userRecord.count += 1;
  return true;
}

// AI Lyria Harmonic Preview Endpoint
app.post("/api/lyria/generate", async (req, res) => {
  try {
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded for Lyria Harmonic Preview (15 req/min). Please try again in 1 minute.",
      });
    }

    const { progression, key, mode, bpm, timeSignature, previewMode } = req.body;

    // Strict Input Validation
    if (!progression || !Array.isArray(progression) || progression.length === 0 || progression.length > 32) {
      return res.status(400).json({ success: false, error: "Invalid chord progression length (must be 1-32 chords)." });
    }

    if (bpm && (typeof bpm !== "number" || bpm < 40 || bpm > 240)) {
      return res.status(400).json({ success: false, error: "BPM must be between 40 and 240." });
    }

    const promptText = buildLyriaPrompt(req.body);

    // Cache check
    const cacheKey = JSON.stringify({
      p: progression.map((c: any) => c.name),
      k: key,
      bpm: bpm || 112,
      m: previewMode || "pure_harmony",
      style: req.body.genre || "",
      rev: req.body.isReharmonizedVariant || false,
      instr: req.body.customInstructions || "",
    });

    const cached = lyriaCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        audio: cached.audio,
        mimeType: cached.mimeType,
        prompt: cached.prompt,
        cached: true,
        previewMode: previewMode || "pure_harmony",
      });
    }

    const ai = getAiClient();

    // Generate Audio using Lyria model
    const responseStream = await ai.models.generateContentStream({
      model: "lyria-3-clip-preview",
      contents: promptText,
    });

    let audioBase64 = "";
    let mimeType = "audio/wav";
    let lyrics = "";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({
        success: false,
        error: "Lyria preview generated no audio output. Please check parameters or retry.",
      });
    }

    // Store in cache
    lyriaCache.set(cacheKey, {
      audio: audioBase64,
      mimeType,
      prompt: promptText,
      createdAt: Date.now(),
    });

    return res.json({
      success: true,
      audio: audioBase64,
      mimeType,
      prompt: promptText,
      cached: false,
      previewMode: previewMode || "pure_harmony",
      lyrics,
    });
  } catch (error: any) {
    console.error("Lyria Generation Error:", error);
    let errorMsg = "Lyria preview is unavailable. The harmonic analysis is still fully functional. Check the server AI configuration and try again.";
    let isQuotaError = false;

    if (error) {
      let rawStr = typeof error === "string" ? error : (error.message || String(error));
      
      // Try to unnest stringified JSON error structures
      if (typeof rawStr === "string" && rawStr.includes("RESOURCE_EXHAUSTED")) {
        isQuotaError = true;
      } else if (typeof rawStr === "string" && rawStr.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(rawStr);
          if (parsed?.error?.message) {
            rawStr = parsed.error.message;
            if (typeof rawStr === "string" && rawStr.trim().startsWith("{")) {
              const innerParsed = JSON.parse(rawStr);
              if (innerParsed?.error?.message) {
                rawStr = innerParsed.error.message;
              }
            }
          }
        } catch (e) {
          // Keep rawStr
        }
      }

      if (isQuotaError || (typeof rawStr === "string" && (rawStr.includes("Quota exceeded") || rawStr.includes("limit: 0") || rawStr.includes("RESOURCE_EXHAUSTED")))) {
        errorMsg = "Lyria AI audio generation is currently unavailable (Google AI Studio Free Tier quota limit is 0 for model lyria-3-clip). To use AI audio generation, please enable paid billing or configure an API key with audio generation quota. The deterministic harmonic analysis and offline sound synthesis remain fully functional.";
        isQuotaError = true;
      } else if (typeof rawStr === "string" && rawStr.length > 0 && !rawStr.startsWith("{")) {
        errorMsg = rawStr;
      }
    }

    return res.status(500).json({
      success: false,
      error: errorMsg,
      isQuotaError,
    });
  }
});

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
