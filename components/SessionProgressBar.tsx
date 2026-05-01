'use client';

interface SessionProgressBarProps {
  total: number;
  mastered: number;
  deferred: number;
}

export function SessionProgressBar({ total, mastered, deferred }: SessionProgressBarProps) {
  const remaining = Math.max(0, total - mastered - deferred);

  const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
  const remainingPct = total > 0 ? (remaining / total) * 100 : 0;
  const deferredPct = total > 0 ? (deferred / total) * 100 : 0;

  return (
    <div className="flex w-full h-2 overflow-hidden rounded-full">
      {masteredPct > 0 && (
        <div
          style={{ width: `${masteredPct}%`, backgroundColor: '#16a34a' }}
          className="h-full transition-all duration-300"
        />
      )}
      {remainingPct > 0 && (
        <div
          style={{ width: `${remainingPct}%`, backgroundColor: '#9ca3af' }}
          className="h-full transition-all duration-300"
        />
      )}
      {deferredPct > 0 && (
        <div
          style={{ width: `${deferredPct}%`, backgroundColor: '#dc2626' }}
          className="h-full transition-all duration-300"
        />
      )}
    </div>
  );
}
