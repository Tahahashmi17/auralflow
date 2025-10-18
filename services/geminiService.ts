import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateLyrics(prompt: string, genre: string): Promise<string> {
  const systemInstruction = `You are a world-class songwriter. Your task is to write song lyrics based on a user's prompt and selected genre.
The lyrics should have a clear and conventional song structure, such as:
[Verse 1]
...
[Chorus]
...
[Verse 2]
...
[Chorus]
...
[Bridge]
...
[Chorus]
...
[Outro]
...

The tone and style should match the user's prompt and selected genre. Make the lyrics creative, evocative, and emotionally resonant.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write ${genre} song lyrics for the following theme: "${prompt}"`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating lyrics:", error);
    throw new Error("Failed to generate lyrics. The model may be overloaded or the prompt may be inappropriate.");
  }
}

export async function generateAudio(lyrics: string, voiceName: string): Promise<string> {
  const ttsPrompt = `Please vocalize the following lyrics with a clear, melodic, and song-like tone. Treat it as a song, not just spoken word.

Lyrics:
${lyrics}`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: ttsPrompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName },
                },
            },
        },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
        throw new Error("No audio data returned from the API.");
    }
    return audioData;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw new Error("Failed to generate audio. The model may have had an issue with the provided lyrics.");
  }
}