import { useState, useEffect, useRef } from 'react';

interface UseAnalysisProgressOptions {
  isAnalyzing: boolean;
  jobStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
  stepsStatus?: Record<string, { status: string; message: string }>;
}

export function useAnalysisProgress({ 
  isAnalyzing, 
  jobStatus, 
  stepsStatus 
}: UseAnalysisProgressOptions) {
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(240); // 4 minutes en secondes
  const [startTime, setStartTime] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser le timer
  useEffect(() => {
    if (isAnalyzing) {
      setEstimatedTimeRemaining(240);
      setStartTime(Date.now());
    }
  }, [isAnalyzing]);


  // Timer pour le temps d'attente
  useEffect(() => {
    if (isAnalyzing && jobStatus === 'in_progress') {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, 240 - elapsed);
        setEstimatedTimeRemaining(Math.ceil(remaining));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAnalyzing, jobStatus, startTime]);

  // Nettoyer les timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    estimatedTimeRemaining,
    formattedTimeRemaining: formatTime(estimatedTimeRemaining)
  };
}