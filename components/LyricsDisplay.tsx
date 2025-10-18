
import React from 'react';
import { MusicNoteIcon } from './icons';

interface LyricsDisplayProps {
  lyrics: string;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lyrics }) => {
  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-cyan-300">
            <MusicNoteIcon className="w-6 h-6" />
            Generated Lyrics
        </h2>
        <pre className="whitespace-pre-wrap bg-gray-900/50 p-4 rounded-md text-gray-300 text-sm sm:text-base leading-relaxed font-sans overflow-x-auto">
            {lyrics}
        </pre>
    </div>
  );
};

export default LyricsDisplay;
