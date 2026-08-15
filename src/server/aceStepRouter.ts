import { Router, Request, Response } from "express";
import { Client } from "@gradio/client";
import { buildAceStepPrompt, buildAceStepGradioParams, validateChordProgression } from "../music/providers/aceStepPromptBuilder";
import { explainHarmonicFunction } from "../music/harmony/HarmonicExplainer";

export const aceStepRouter = Router();

// In-memory cache for ACE-Step audio generations
const aceStepCache = new Map<string, { audio: string; mimeType: string; prompt: string; explanation: any; createdAt: number }>();

aceStepRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    const { progression, key, bpm, timeSignature, styleOrGenre } = req.body;

    // Validate progression
    const validation = validateChordProgression(progression);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        providerId: "acestep_hf",
        providerName: "ACE-Step (Hugging Face ZeroGPU)",
        error: validation.message,
      });
    }

    const keyName = key || "C Major";
    const promptText = buildAceStepPrompt(req.body);
    const harmonicExplanation = explainHarmonicFunction(progression, keyName);

    // Cache lookup
    const cacheKey = JSON.stringify({
      p: progression.map((c: any) => c.name),
      k: keyName,
      bpm: bpm || 92,
      style: styleOrGenre || "J-Pop",
      dur: req.body.requestedDurationSeconds || 12,
      instr: req.body.instrumentation || [],
      custom: req.body.customInstructions || "",
    });

    const cached = aceStepCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        providerId: "acestep_hf",
        providerName: "ACE-Step (Hugging Face ZeroGPU)",
        audio: cached.audio,
        mimeType: cached.mimeType,
        promptUsed: cached.prompt,
        harmonicFunctionExplanation: cached.explanation.harmonicAnalysisText,
        explanationDetails: cached.explanation,
        cached: true,
      });
    }

    // Connect to Hugging Face ACE-Step Space
    const hfToken = process.env.HF_TOKEN as `hf_${string}` | undefined;
    console.log(`[ACE-Step] Connecting to Hugging Face Space ACE-Step/Ace-Step-v1.5 (token present: ${!!hfToken})...`);
    
    let client;
    try {
      client = await Client.connect("ACE-Step/Ace-Step-v1.5", hfToken ? { hf_token: hfToken } : {});
    } catch (connectErr: any) {
      console.error("[ACE-Step] Connection error:", connectErr?.message || connectErr);
      return res.status(503).json({
        success: false,
        providerId: "acestep_hf",
        providerName: "ACE-Step (Hugging Face ZeroGPU)",
        error: "ACE-Step Hugging Face Space is currently waking up or unavailable. Tone.js offline synthesizer is ready as fallback.",
        isSleepingOrQueued: true,
        fallbackAvailable: true,
      });
    }

    const gradioParams = buildAceStepGradioParams(req.body, promptText);
    console.log("[ACE-Step] Submitting job to /generation_wrapper with prompt:", promptText);

    const job = client.submit("/generation_wrapper", gradioParams);

    let audioData: any = null;
    let jobError: string | null = null;

    // Timeout safeguard (40 seconds for ZeroGPU queue/sleep detection)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "ACE-Step ZeroGPU Space is currently sleeping or queued on Hugging Face (response wait limit reached). Use HarmonicX Local Synth for instant playback."
            )
          ),
        40000
      )
    );

    const processJobPromise = (async () => {
      try {
        for await (const event of job) {
          if (event.type === "data" && event.data) {
            audioData = event.data;
          } else if (event.type === "status") {
            const statusEvt = event as any;
            console.log(`[ACE-Step] Status: ${statusEvt.stage || "processing"} ${statusEvt.message || ""}`);
          }
        }
      } catch (err: any) {
        jobError = err?.message || String(err);
      }
    })();

    try {
      await Promise.race([processJobPromise, timeoutPromise]);
    } catch (err: any) {
      jobError = err.message || "ACE-Step job failed";
    }

    if (jobError || !audioData || !Array.isArray(audioData) || !audioData[0]) {
      console.warn("[ACE-Step] Audio generation failed or returned empty:", jobError);
      return res.status(503).json({
        success: false,
        providerId: "acestep_hf",
        providerName: "ACE-Step (Hugging Face ZeroGPU)",
        error:
          jobError ||
          "ACE-Step Space did not return audio output. ZeroGPU might be waking up or queue is full. Use HarmonicX Local Synth for instant playback.",
        isSleepingOrQueued: true,
        fallbackAvailable: true,
      });
    }

    // Process output audio object from Gradio
    const audioObj = audioData[0];
    let base64Audio = "";
    let mimeType = "audio/mp3";

    if (typeof audioObj === "string" && audioObj.startsWith("data:")) {
      base64Audio = audioObj.split(",")[1] || audioObj;
    } else if (audioObj?.url) {
      // Fetch audio from Gradio space URL and convert to Base64
      try {
        const audioFetchRes = await fetch(audioObj.url);
        if (audioFetchRes.ok) {
          const arrayBuf = await audioFetchRes.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          base64Audio = buf.toString("base64");
          if (audioObj.orig_name?.endsWith(".wav")) mimeType = "audio/wav";
        }
      } catch (fetchErr) {
        console.error("[ACE-Step] Error fetching audio URL:", fetchErr);
      }
    }

    if (!base64Audio) {
      return res.status(500).json({
        success: false,
        providerId: "acestep_hf",
        providerName: "ACE-Step (Hugging Face ZeroGPU)",
        error: "Failed to download generated audio stream from ACE-Step.",
        fallbackAvailable: true,
      });
    }

    // Save to cache
    aceStepCache.set(cacheKey, {
      audio: base64Audio,
      mimeType,
      prompt: promptText,
      explanation: harmonicExplanation,
      createdAt: Date.now(),
    });

    return res.json({
      success: true,
      providerId: "acestep_hf",
      providerName: "ACE-Step (Hugging Face ZeroGPU)",
      audio: base64Audio,
      mimeType,
      promptUsed: promptText,
      harmonicFunctionExplanation: harmonicExplanation.harmonicAnalysisText,
      explanationDetails: harmonicExplanation,
      cached: false,
    });
  } catch (error: any) {
    console.error("[ACE-Step] Unexpected Server Error:", error);
    return res.status(500).json({
      success: false,
      providerId: "acestep_hf",
      providerName: "ACE-Step (Hugging Face ZeroGPU)",
      error: error.message || "Server error while processing ACE-Step music generation.",
      fallbackAvailable: true,
    });
  }
});
