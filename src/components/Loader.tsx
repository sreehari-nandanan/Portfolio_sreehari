import React, { useState, useEffect } from 'react';
import './Loader.css';

interface LoaderProps {
  onComplete: () => void;
}

const FlipCard = ({ label }: { label: string }) => {
  return (
    <div className="flip-unit">
      <div className="flip-card-top">
        <span style={{ transform: 'translateY(50%)' }}>{label}</span>
      </div>
      <div className="flip-card-bottom">
        <span style={{ transform: 'translateY(-50%)' }}>{label}</span>
      </div>
      <div className="flip-divider" />
    </div>
  );
};

const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let currentProgress = 0;

    const update = () => {
      const jump = 1;
      currentProgress += jump;

      if (currentProgress > 100) {
        currentProgress = 100;
        setProgress(100);

        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            document.body.style.overflow = 'auto';
            onComplete();
          }, 1200);
        }, 1000);
        return;
      }

      setProgress(currentProgress);
      // Consistent tick for the mechanical look
      setTimeout(update, 40);
    };

    const timer = setTimeout(update, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Handle digits for 0-100
  const pString = progress.toString().padStart(3, '0');
  const d1 = pString[0]; // 0 or 1
  const d2 = pString[1];
  const d3 = pString[2];

  return (
    <div className={`loader-container ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="calendar-grid" />

      <div className="flip-clock">
        {/* Only show first digit if it reaches 100 */}
        {progress === 100 && <FlipCard key="d1" label={d1} />}
        <FlipCard key={`d2-${d2}`} label={d2} />
        <FlipCard key={`d3-${d3}`} label={d3} />
        <span className="percentage-mark">%</span>
      </div>
    </div>
  );
};

export default Loader;
