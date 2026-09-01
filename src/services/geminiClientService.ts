import { GoogleGenAI, Type } from "@google/genai";
import { AIGenerationResult, AIAnalysisResult, ChordItem } from "../types";

const LOCAL_STORAGE_API_KEY = "harmonicx_gemini_api_key";

export const getStoredGeminiApiKey = (): string => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem(LOCAL_STORAGE_API_KEY) ||
    ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) ||
    ""
  );
};

export const setStoredGeminiApiKey = (key: string): void => {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(LOCAL_STORAGE_API_KEY, key.trim());
  } else {
    localStorage.removeItem(LOCAL_STORAGE_API_KEY);
  }
};

/**
 * Safely parse response as JSON, preventing HTML 404 "Unexpected token <" crashes
 */
async function safeParseJson(res: Response): Promise<{ isJson: boolean; data: any }> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  
  if (!contentType.includes("application/json") && text.trim().startsWith("<")) {
    return { isJson: false, data: null };
  }
  
  try {
    const data = JSON.parse(text);
    return { isJson: true, data };
  } catch {
    return { isJson: false, data: null };
  }
}

/**
 * Intelligent client-side musical fallback generator when no backend or Gemini API key is configured
 */
function generateAlgorithmicProgression(prompt: string): AIGenerationResult {
  const lower = prompt.toLowerCase();
  
  if (lower.includes("buồn") || lower.includes("mưa") || lower.includes("sad") || lower.includes("minor") || lower.includes("ballad") || lower.includes("bolero")) {
    if (lower.includes("cải lương") || lower.includes("vọng cổ") || lower.includes("ngũ cung")) {
      return {
        key: "A",
        mode: "minor",
        chords: [
          { name: "Am", beats: 4 },
          { name: "Dm", beats: 4 },
          { name: "Em", beats: 4 },
          { name: "Am", beats: 4 },
        ],
        explanation: "Vòng hòa âm ngũ cung Nam bộ âm hưởng điệu Oan / Hò Nhì man mác buồn, nhấn mạnh bậc I - IV - v - I.",
        mood: "Sâu lắng, hoài niệm, da diết miền sông nước (Điệu Oan Ngũ Cung)",
        suggestedGenres: ["Cải Lương", "Dân Ca Nam Bộ", "Quê Hương", "Acoustic"],
      };
    }
    if (lower.includes("bolero")) {
      return {
        key: "D",
        mode: "minor",
        chords: [
          { name: "Dm", beats: 4 },
          { name: "Gm", beats: 4 },
          { name: "A7", beats: 4 },
          { name: "Dm", beats: 4 },
        ],
        explanation: "Vòng Bolero kinh điển i - iv - V7 - i với âm sắc ấm áp, trữ tình và dẫn dắt cao độ mượt mà về chủ âm.",
        mood: "Trầm tư, tự sự, hoài cổ",
        suggestedGenres: ["Bolero", "Trữ Tình", "Slow Rock", "Acoustic"],
      };
    }
    return {
      key: "A",
      mode: "minor",
      chords: [
        { name: "Am", beats: 4 },
        { name: "F", beats: 4 },
        { name: "C", beats: 4 },
        { name: "G", beats: 4 },
      ],
      explanation: "Vòng hòa âm Ballad kinh điển i - VI - III - VII mang lại cảm xúc sâu lắng, dễ viết giai điệu da diết.",
      mood: "U buồn, sâu lắng, cảm xúc dâng trào",
      suggestedGenres: ["Vietnamese Ballad", "Pop Ballad", "Indie Acoustic", "Lo-Fi"],
    };
  }

  if (lower.includes("vui") || lower.includes("sôi động") || lower.includes("happy") || lower.includes("upbeat") || lower.includes("chachacha") || lower.includes("disco")) {
    return {
      key: "C",
      mode: "major",
      chords: [
        { name: "C", beats: 4 },
        { name: "G", beats: 4 },
        { name: "Am", beats: 4 },
        { name: "F", beats: 4 },
      ],
      explanation: "Vòng hòa âm 4 hợp âm huyền thoại I - V - vi - IV tươi sáng, tràn đầy năng lượng và dễ bắt tai.",
      mood: "Tươi vui, lạc quan, rộn ràng",
      suggestedGenres: ["Pop Dance", "Cha Cha Cha", "Disco", "J-Pop"],
    };
  }

  if (lower.includes("jazz") || lower.includes("bossa") || lower.includes("chill") || lower.includes("lofi") || lower.includes("lo-fi") || lower.includes("r&b")) {
    return {
      key: "F",
      mode: "major",
      chords: [
        { name: "Fmaj7", beats: 4 },
        { name: "Dm7", beats: 4 },
        { name: "Gm7", beats: 4 },
        { name: "C7", beats: 4 },
      ],
      explanation: "Vòng hòa âm tiêu chuẩn Jazz / Bossa Nova Imaj7 - vi7 - ii7 - V7 với âm sắc êm dịu, mượt mà và sang trọng.",
      mood: "Thư giãn, lãng mạn, tinh tế",
      suggestedGenres: ["Bossa Nova", "Lo-Fi Hip Hop", "Neo-Soul", "Jazz Standard"],
    };
  }

  if (lower.includes("jpop") || lower.includes("j-pop") || lower.includes("anime") || lower.includes("royal") || lower.includes("hoàng gia")) {
    return {
      key: "F",
      mode: "major",
      chords: [
        { name: "Fmaj7", beats: 4 },
        { name: "G7", beats: 4 },
        { name: "Em7", beats: 4 },
        { name: "Am7", beats: 4 },
      ],
      explanation: "Vòng hợp âm Hoàng Gia (Royal Road Progression: IVmaj7 - V7 - iiim7 - vim7) biểu tượng của J-Pop và nhạc Anime giàu cảm xúc.",
      mood: "Kịch tính, hào hùng, cảm xúc thăng hoa",
      suggestedGenres: ["J-Pop", "Anime OST", "City Pop", "Power Ballad"],
    };
  }

  // Default rich progression
  return {
    key: "C",
    mode: "major",
    chords: [
      { name: "Cmaj7", beats: 4 },
      { name: "Am7", beats: 4 },
      { name: "Dm7", beats: 4 },
      { name: "G7", beats: 4 },
    ],
    explanation: `Vòng hòa âm hài hòa cho "${prompt}", kết hợp màu sắc hiện đại và giải kết tự nhiên bậc I - vi - ii - V.`,
    mood: "Hài hòa, tươi sáng, truyền cảm hứng",
    suggestedGenres: ["Pop", "Acoustic", "Indie", "R&B"],
  };
}

/**
 * Intelligent client-side musical fallback analysis
 */
function analyzeAlgorithmicProgression(chords: { name: string; beats?: number }[], key: string): AIAnalysisResult {
  const chordNames = chords.map((c) => c.name);
  const firstChord = chordNames[0] || "C";
  const isMinor = firstChord.includes("m") && !firstChord.includes("maj");
  
  return {
    key: key || (isMinor ? `${firstChord} Minor` : `${firstChord} Major`),
    romanAnalysis: chordNames.length >= 4 ? "I - vi - IV - V (hoặc tương đương)" : chordNames.join(" -> "),
    emotionalCharacter: isMinor
      ? "Sắc thái trầm tư, nội tâm, mang tính tự sự và chiều sâu cảm xúc."
      : "Sắc thái tươi sáng, cởi mở, giải phóng năng lượng tích cực và ổn định.",
    genreFit: ["Pop", "Ballad", "Acoustic", "Indie", "Soundtrack"],
    suggestedMelodyDirection: "Nên bắt đầu giai điệu từ bậc 3 hoặc bậc 5 của hợp âm đầu tiên, lướt qua các nốt bậc 7 để tạo màu sắc hiện đại.",
    lyricMoodKeywords: isMinor ? ["hoài niệm", "sâu lắng", "tâm tư", "đêm"] : ["hy vọng", "tươi mới", "yêu đời", "nắng"],
    harmonicInsights: "Vòng hòa âm có tính chu kỳ tốt, dẫn dắt giai điệu mượt mà và tạo cảm giác thỏa mãn khi trở về chủ âm.",
  };
}

/**
 * Call Gemini direct in-browser using user API Key
 */
async function callGeminiDirect(
  apiKey: string,
  systemInstruction: string,
  promptText: string,
  schema: any
): Promise<any> {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: promptText,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const text = response.text || "";
  return JSON.parse(text);
}

/**
 * Generate Chord Progression with multi-tiered support:
 * 1. Backend Server (/api/ai/generate) if running in full-stack
 * 2. Client-side Gemini SDK if user has API Key configured
 * 3. Intelligent Music Theory Algorithmic Engine fallback (no crashes on GitHub Pages)
 */
export async function generateChordProgressionAI(
  prompt: string
): Promise<{ result: AIGenerationResult; source: "server" | "gemini_client" | "algorithmic" }> {
  // 1. Try Backend API
  try {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    const parsed = await safeParseJson(res);
    if (res.ok && parsed.isJson && parsed.data?.chords) {
      return { result: parsed.data, source: "server" };
    }
  } catch (e) {
    // Backend unavailable (e.g. running on GitHub Pages static)
    console.info("Backend /api/ai/generate not reachable, switching to client Gemini/algorithmic engine.");
  }

  // 2. Try Client-side Gemini with user's API Key
  const userKey = getStoredGeminiApiKey();
  if (userKey) {
    try {
      const systemInstruction = `You are an expert music theorist and composer assistant.
When asked to generate a chord progression, respond ONLY with a valid JSON object.
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

      const schema = {
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
      };

      const data = await callGeminiDirect(
        userKey,
        systemInstruction,
        `Generate a chord progression for: "${prompt}"`,
        schema
      );

      if (data && data.chords) {
        return { result: data, source: "gemini_client" };
      }
    } catch (err: any) {
      console.warn("Client Gemini direct call failed, falling back to algorithmic engine:", err);
    }
  }

  // 3. Robust Algorithmic Music Engine Fallback
  return {
    result: generateAlgorithmicProgression(prompt),
    source: "algorithmic",
  };
}

/**
 * Analyze Chord Progression with multi-tiered support
 */
export async function analyzeChordProgressionAI(
  chords: ChordItem[],
  key: string,
  bpm: number
): Promise<{ result: AIAnalysisResult; source: "server" | "gemini_client" | "algorithmic" }> {
  // 1. Try Backend API
  try {
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progression: chords.map((c) => ({ name: c.name, beats: c.beats })),
        key,
        bpm,
      }),
    });

    const parsed = await safeParseJson(res);
    if (res.ok && parsed.isJson && parsed.data?.romanAnalysis) {
      return { result: parsed.data, source: "server" };
    }
  } catch (e) {
    console.info("Backend /api/ai/analyze not reachable, switching to client Gemini/algorithmic engine.");
  }

  // 2. Try Client-side Gemini with user's API Key
  const userKey = getStoredGeminiApiKey();
  if (userKey) {
    try {
      const chordListStr = chords.map((c) => `${c.name} (${c.beats || 4} beats)`).join(" -> ");
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

      const schema = {
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
      };

      const data = await callGeminiDirect(
        userKey,
        systemInstruction,
        `Analyze this chord progression: ${chordListStr}. Specified Key context: ${key || "Auto"}. Tempo: ${bpm || 90} BPM.`,
        schema
      );

      if (data && data.romanAnalysis) {
        return { result: data, source: "gemini_client" };
      }
    } catch (err: any) {
      console.warn("Client Gemini direct analyze failed, using algorithmic fallback:", err);
    }
  }

  // 3. Algorithmic Fallback
  return {
    result: analyzeAlgorithmicProgression(chords, key),
    source: "algorithmic",
  };
}
