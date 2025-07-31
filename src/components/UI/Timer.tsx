import React, { useState, useEffect } from 'react';

interface TimerProps {
  duration: number; // in seconds
  onExpire: () => void;
  showWarning?: boolean;
  warningThreshold?: number; // seconds before expiry to show warning
  className?: string;
}

const Timer: React.FC<TimerProps> = ({
  duration,
  onExpire,
  showWarning = true,
  warningThreshold = 120, // 2 minutes
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    if (timeLeft <= warningThreshold && !isWarning) {
      setIsWarning(true);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire, warningThreshold, isWarning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (timeLeft <= 60) return 'text-red-600'; // Last minute
    if (timeLeft <= warningThreshold) return 'text-yellow-600'; // Warning period
    return 'text-green-600'; // Safe time
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`font-mono text-sm font-medium ${getColorClass()}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      {isWarning && showWarning && (
        <div className="text-yellow-600 text-sm">
          Session expires soon!
        </div>
      )}
    </div>
  );
};

export default Timer;
