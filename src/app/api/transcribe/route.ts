import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Self-contained YouTube Caption Scraper
async function getYouTubeTranscript(videoId: string): Promise<string> {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!response.ok) throw new Error("Failed to load YouTube video page.");
  const html = await response.text();
  
  let jsonStr = "";
  const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
  if (match) {
    jsonStr = match[1];
  } else {
    const match2 = html.match(/ytInitialPlayerResponse\s*=\s*({.+?})\s*<\/script>/);
    if (match2) {
      jsonStr = match2[1];
    }
  }

  if (!jsonStr) {
    throw new Error("Could not extract captions metadata. The video might be restricted or private.");
  }

  const data = JSON.parse(jsonStr);
  const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  
  if (!captionTracks || captionTracks.length === 0) {
    throw new Error("This video does not have any captions or transcripts available.");
  }
  
  const englishTrack = captionTracks.find((track: { languageCode: string; baseUrl: string }) => track.languageCode === "en") || captionTracks[0];
  const captionUrl = englishTrack.baseUrl;
  
  const capResponse = await fetch(captionUrl);
  if (!capResponse.ok) throw new Error("Failed to load subtitle file from YouTube.");
  const xml = await capResponse.text();
  
  const matches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g) || [];
  const text = matches
    .map((m) => {
      return m
        .replace(/<text[^>]*>/, "")
        .replace(/<\/text>/, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n/g, " ");
    })
    .join(" ");

  return text;
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, text, apiKey: clientApiKey } = body;
    
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please add it in Settings or set GEMINI_API_KEY in .env.local." },
        { status: 400 }
      );
    }

    let rawRecipeText = text || "";

    // Auto-detect platform from URL
    if (url) {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = getYouTubeId(url);
        if (!videoId) {
          return NextResponse.json({ error: "Invalid YouTube URL format." }, { status: 400 });
        }
        try {
          rawRecipeText = await getYouTubeTranscript(videoId);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          return NextResponse.json({ 
            error: `YouTube transcript error: ${errMsg}. Try pasting the recipe text directly.` 
          }, { status: 400 });
        }
      } else if (url.includes("instagram.com")) {
        return NextResponse.json({ 
          error: "Instagram scraping is blocked by Meta authentication. Please copy-paste the recipe caption into the Paste Text tab." 
        }, { status: 400 });
      } else {
        // Generic URL — try fetching page text
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; TastyBot/1.0)" }
          });
          rawRecipeText = await res.text();
          // Strip HTML tags for a rough text extraction
          rawRecipeText = rawRecipeText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 10000);
        } catch {
          return NextResponse.json({ error: "Could not fetch content from this URL." }, { status: 400 });
        }
      }
    }

    if (!rawRecipeText.trim()) {
      return NextResponse.json({ error: "No recipe content found to transcribe." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const prompt = `
    You are an expert culinary AI. Extract and structure a recipe from this text into clean JSON.
    
    Text: "${rawRecipeText.substring(0, 8000)}"
    
    Return JSON matching this schema exactly:
    {
      "title": "Clear, appealing recipe title",
      "description": "Brief 1-2 sentence description",
      "cookTime": "e.g. '35 min' or '1h 10m'",
      "difficulty": "Easy" or "Medium" or "Hard",
      "servings": 2,
      "ingredients": [
        {
          "name": "Ingredient name",
          "amount": 200,
          "unit": "g" or "ml" or "pcs" or "tbsp",
          "caloriesPerUnit": 1.65,
          "proteinPerUnit": 0.20,
          "carbsPerUnit": 0.01,
          "fatPerUnit": 0.05,
          "category": "Protein" or "Produce" or "Dairy" or "Pantry" or "Spices"
        }
      ],
      "steps": [
        "Step 1 description...",
        "Step 2 description..."
      ]
    }

    Rules:
    1. Standardize to grams (g) or milliliters (ml) wherever possible. Use 'pcs' for discrete items.
    2. caloriesPerUnit/proteinPerUnit/carbsPerUnit/fatPerUnit are PER 1 unit (1g, 1ml, or 1 piece).
    3. Return ONLY the JSON object, no markdown fences.
    `;

    const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        });
        responseText = result.response.text();
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${modelName} failed, trying next fallback...`, err);
      }
    }

    if (!responseText) {
      const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
      return NextResponse.json({ error: `Gemini AI Error: ${errMsg}` }, { status: 400 });
    }

    const recipe = JSON.parse(responseText.trim());

    // Enrich with video thumbnail if YouTube
    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      const videoId = getYouTubeId(url);
      if (videoId) {
        recipe.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
      }
    }

    // Generate image prompt and set imageUrl
    const title = recipe.title || "Delicious food";
    const description = recipe.description || "Freshly cooked recipe";
    const promptText = `minimalist hand-drawn cartoon food illustration of ${title}, ${description}, Forka cooking style, cozy warm cream background (#FAF0DC), vibrant food colors, culinary art, delicious look, high quality, vector style`;
    const cleanPrompt = encodeURIComponent(promptText.substring(0, 180));
    const randomSeed = Math.floor(Math.random() * 1000000);
    recipe.imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=600&height=400&nologo=true&seed=${randomSeed}`;

    return NextResponse.json(recipe);

  } catch (error: unknown) {
    console.error("API Error in transcribe:", error);
    const errMsg = error instanceof Error ? error.message : "An unexpected error occurred during transcription.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
