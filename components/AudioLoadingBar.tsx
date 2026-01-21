import React from 'react';

interface AudioLoadingBarProps {
  barCount?: number;
  color?: string;
  height?: number;
  gap?: number;
}

export const AudioLoadingBar: React.FC<AudioLoadingBarProps> = ({
  barCount = 8,
  color = 'bg-cyan-400',
  height = 40,
  gap = 4,
}) => {
  return (
    <div
      className="flex items-end justify-center"
      style={{ gap: `${gap}px`, height: `${height}px` }}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className={`audio-bar ${color}`}
          style={{
            width: '4px',
            borderRadius: '2px',
            animation: `audioWave 1.2s ease-in-out infinite`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes audioWave {
          0%, 100% {
            height: 20%;
          }
          50% {
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioLoadingBar;
