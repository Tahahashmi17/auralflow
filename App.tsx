import React, { useState, useCallback, useEffect } from 'react';
import { generateLyrics, generateAudio } from './services/geminiService';
import { processAudio } from './utils/audioUtils';
import PromptInput from './components/PromptInput';
import LyricsDisplay from './components/LyricsDisplay';
import AudioPlayer from './components/AudioPlayer';
import { LogoIcon } from './components/icons';

const availableVoices = [
  { id: 'Zephyr', name: 'Zephyr (Clear & Friendly)' },
  { id: 'Puck', name: 'Puck (Warm & Expressive)' },
  { id: 'Kore', name: 'Kore (Deep & Resonant)' },
  { id: 'Fenrir', name: 'Fenrir (Rich & Storyteller)' },
  { id: 'Charon', name: 'Charon (Calm & Soothing)' },
];

const availableGenres = ['Pop', 'Rock', 'Jazz', 'Electronic', 'Lofi'];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState('');
  const [voice, setVoice] = useState(availableVoices[0].id);
  const [pitch, setPitch] = useState(0);
  const [genre, setGenre] = useState(availableGenres[0]);

  useEffect(() => {
    // Cleanup object URL to prevent memory leaks
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setLyrics('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      setGenerationStep('1/2: Generating lyrics...');
      const generatedLyrics = await generateLyrics(prompt, genre);
      setLyrics(generatedLyrics);

      setGenerationStep('2/2: Generating audio track...');
      const audioBase64 = await generateAudio(generatedLyrics, voice);
      
      setGenerationStep('Finalizing audio...');
      const audioBlob = await processAudio(audioBase64, pitch);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      setGenerationStep('Complete!');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  }, [prompt, isLoading, audioUrl, voice, pitch, genre]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-400/20">
      <main className="w-full max-w-2xl mx-auto space-y-8">
        <header className="text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <LogoIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold tracking-tight text-white">MuseForge</h1>
          </div>
          <p className="text-gray-400">Your AI-powered song creation studio.</p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-cyan-500/10 p-6 space-y-6">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            genre={genre}
            setGenre={setGenre}
            availableGenres={availableGenres}
            voice={voice}
            setVoice={setVoice}
            pitch={pitch}
            setPitch={setPitch}
            availableVoices={availableVoices}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            generationStep={generationStep}
          />

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
              <p className="font-semibold">Generation Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
        
        {lyrics && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-6 animate-fade-in">
             <LyricsDisplay lyrics={lyrics} />
          </div>
        )}

        {audioUrl && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-6 animate-fade-in">
              <AudioPlayer audioUrl={audioUrl} prompt={prompt} />
            </div>
        )}
      </main>
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini. For entertainment purposes only.</p>
      </footer>
    </div>
  );
};

export default App;