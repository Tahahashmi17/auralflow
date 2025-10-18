
import React from 'react';
import { PlayIcon, DownloadIcon } from './icons';

interface AudioPlayerProps {
  audioUrl: string;
  prompt: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, prompt }) => {
  const fileName = `${prompt.slice(0, 30).replace(/\s+/g, '_') || 'museforge_song'}.wav`;

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-cyan-300">
            <PlayIcon className="w-6 h-6" />
            Audio Track
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <audio controls src={audioUrl} className="w-full flex-grow">
                Your browser does not support the audio element.
            </audio>
            <a
                href={audioUrl}
                download={fileName}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
                <DownloadIcon className="w-5 h-5" />
                Download
            </a>
        </div>
    </div>
  );
};

export default AudioPlayer;
