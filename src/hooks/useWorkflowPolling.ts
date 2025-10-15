import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import maestroService, { WorkflowJob } from '@/services/maestroService';

export interface PollingStatus {
  isPolling: boolean;
  jobStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
  lastUpdate: Date | null;
  error: string | null;
  retryCount: number;
}

export interface UseWorkflowPollingOptions {
  jobId: string | null;
  onStatusUpdate?: (job: WorkflowJob) => void;
  onComplete?: (job: WorkflowJob) => void;
  onError?: (error: string) => void;
  pollingInterval?: number;
  maxRetries?: number;
  enableNotifications?: boolean;
}

export function useWorkflowPolling({
  jobId,
  onStatusUpdate,
  onComplete,
  onError,
  pollingInterval = 3000,
  maxRetries = 5,
  enableNotifications = true
}: UseWorkflowPollingOptions) {
  const [pollingStatus, setPollingStatus] = useState<PollingStatus>({
    isPolling: false,
    jobStatus: null,
    lastUpdate: null,
    error: null,
    retryCount: 0
  });

  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  
  // Use refs to store the latest callback functions
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onStatusUpdate, onComplete, onError]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    isPollingRef.current = false;
    setPollingStatus(prev => ({ ...prev, isPolling: false }));
  };

  const startPolling = () => {
    if (!jobId || isPollingRef.current) return;

    isPollingRef.current = true;
    setPollingStatus(prev => ({ 
      ...prev, 
      isPolling: true, 
      error: null,
      retryCount: 0 
    }));

    const poll = async () => {
      try {
        const job = await maestroService.getJobStatus(jobId);
        
        if (!job) {
          setPollingStatus(prev => ({ 
            ...prev, 
            error: 'Job non trouvé',
            retryCount: prev.retryCount + 1
          }));
          return;
        }

        setPollingStatus(prev => ({ 
          ...prev, 
          jobStatus: job.overall_status,
          lastUpdate: new Date(),
          error: null,
          retryCount: 0
        }));

        // Notify status update
        if (onStatusUpdateRef.current) {
          onStatusUpdateRef.current(job);
        }

        // Handle completion
        if (job.overall_status === 'completed') {
          stopPolling();
          if (onCompleteRef.current) {
            onCompleteRef.current(job);
          }
          if (enableNotifications) {
            toast({
              title: "Analyse terminée",
              description: "Votre analyse est prête. Consultez l'historique pour voir les résultats.",
              duration: 5000,
            });
          }
        } else if (job.overall_status === 'failed') {
          stopPolling();
          const errorMessage = job.error_message || 'Une erreur est survenue pendant l\'analyse';
          if (onErrorRef.current) {
            onErrorRef.current(errorMessage);
          }
          if (enableNotifications) {
            toast({
              title: "Analyse échouée",
              description: errorMessage,
              variant: "destructive",
              duration: 7000,
            });
          }
        }

      } catch (error: any) {
        console.error('Polling error:', error);
        
        setPollingStatus(prev => {
          const newRetryCount = prev.retryCount + 1;
          
          if (newRetryCount >= maxRetries) {
            stopPolling();
            const errorMessage = `Impossible de récupérer le statut de l'analyse après ${maxRetries} tentatives`;
            if (onErrorRef.current) {
              onErrorRef.current(errorMessage);
            }
            if (enableNotifications) {
              toast({
                title: "Erreur de connexion",
                description: "Impossible de suivre l'analyse en temps réel. Vérifiez votre connexion.",
                variant: "destructive",
                duration: 7000,
              });
            }
            return { 
              ...prev, 
              error: errorMessage,
              isPolling: false 
            };
          }

          // Retry with exponential backoff
          const retryDelay = Math.min(1000 * Math.pow(2, newRetryCount), 30000);
          retryTimeoutRef.current = setTimeout(() => {
            if (isPollingRef.current) {
              poll();
            }
          }, retryDelay);

          return { 
            ...prev, 
            error: `Tentative ${newRetryCount}/${maxRetries} échouée`,
            retryCount: newRetryCount
          };
        });
      }
    };

    // Start polling immediately
    poll();
    
    // Set up interval for regular polling
    intervalRef.current = setInterval(poll, pollingInterval);
  };

  // Start/stop polling when jobId changes
  useEffect(() => {
    if (jobId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [jobId]); // Only depend on jobId

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []); // No dependencies

  return {
    pollingStatus,
    startPolling,
    stopPolling,
    isPolling: pollingStatus.isPolling,
    jobStatus: pollingStatus.jobStatus,
    lastUpdate: pollingStatus.lastUpdate,
    error: pollingStatus.error,
    retryCount: pollingStatus.retryCount
  };
}