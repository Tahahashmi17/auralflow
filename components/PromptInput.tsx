import React from 'react';
import { GenerateIcon, LoadingIcon } from './icons';

interface VoiceOption {
  id: string;
  name: string;
}

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
  availableGenres: string[];
  voice: string;
  setVoice: (voice: string) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  availableVoices: VoiceOption[];
  onGenerate: () => void;
  isLoading: boolean;
  generationStep: string;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, setPrompt, 
  genre, setGenre, availableGenres,
  voice, setVoice, 
  pitch, setPitch, 
  availableVoices, 
  onGenerate, isLoading, generationStep 
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-lg font-medium text-gray-300 mb-2">
          1. Describe your song idea
        </label>
        <textarea
          id="prompt"
          rows={3}
          className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 placeholder:text-gray-500"
          placeholder="e.g., lofi love song about a long-distance connection"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-lg font-medium text-gray-300 mb-2">
          2. Select a genre
        </label>
        <select
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          disabled={isLoading}
          className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200"
        >
          {availableGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="voice" className="block text-lg font-medium text-gray-300 mb-2">
          3. Choose a voice
        </label>
        <select
          id="voice"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          disabled={isLoading}
          className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200"
        >
          {availableVoices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pitch" className="block text-lg font-medium text-gray-300 mb-2">
          4. Adjust vocal pitch (optional)
        </label>
        <div className="flex items-center gap-4">
            <input
            id="pitch"
            type="range"
            min="-12"
            max="12"
            step="1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            disabled={isLoading}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-gray-400 font-mono w-28 text-center bg-gray-900/70 p-2 rounded-md border border-gray-600">{pitch > 0 ? `+${pitch}` : pitch} semi</span>
            <button 
                onClick={() => setPitch(0)} 
                disabled={isLoading || pitch === 0}
                className="text-xs bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500 rounded px-3 py-2 transition-colors">
                Reset
            </button>
        </div>
      </div>


      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className={`text-sm text-cyan-400 transition-opacity duration-300 h-5 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          {generationStep}
        </p>
        <button
          onClick={onGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <LoadingIcon className="animate-spin h-5 w-5" />
              Generating...
            </>
          ) : (
            <>
              <GenerateIcon className="h-5 w-5" />
              Generate Music
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;