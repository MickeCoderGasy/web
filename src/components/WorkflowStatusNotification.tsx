import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  History,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

interface WorkflowStatusNotificationProps {
  jobId: string | null;
  jobStatus?: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
  isPolling?: boolean;
  lastUpdate?: Date | null;
  error?: string | null;
  retryCount?: number;
  onNavigateToHistory?: () => void;
  onStatusUpdate?: (job: any) => void;
  onComplete?: (job: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function WorkflowStatusNotification({ 
  jobId, 
  jobStatus = null,
  isPolling = false,
  lastUpdate = null,
  error = null,
  retryCount = 0,
  onNavigateToHistory,
  onStatusUpdate,
  onComplete,
  onError,
  className = "" 
}: WorkflowStatusNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Show notification when there's a status change
  useEffect(() => {
    if (jobStatus && (jobStatus === 'completed' || jobStatus === 'failed')) {
      setIsVisible(true);
    }
  }, [jobStatus]);

  // Auto-hide notification after 10 seconds for completed/failed
  useEffect(() => {
    if (isVisible && (jobStatus === 'completed' || jobStatus === 'failed')) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, jobStatus]);

  if (!isVisible && !isPolling) return null;

  const getStatusInfo = () => {
    if (error) {
      return {
        icon: <WifiOff className="w-5 h-5 text-destructive" />,
        title: "Problème de connexion",
        description: "Impossible de suivre l'analyse en temps réel",
        variant: "destructive" as const,
        showRetry: true
      };
    }

    if (jobStatus === 'completed') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        title: "Analyse terminée",
        description: "Votre analyse est prête. Consultez l'historique pour voir les résultats.",
        variant: "default" as const,
        showHistory: true
      };
    }

    if (jobStatus === 'failed') {
      return {
        icon: <XCircle className="w-5 h-5 text-destructive" />,
        title: "Analyse échouée",
        description: "Une erreur est survenue pendant l'analyse",
        variant: "destructive" as const,
        showRetry: true
      };
    }

    if (jobStatus === 'in_progress' || isPolling) {
      return {
        icon: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
        title: "Analyse en cours",
        description: "Votre analyse est en cours de traitement...",
        variant: "default" as const,
        showDetails: true
      };
    }

    return {
      icon: <Clock className="w-5 h-5 text-muted-foreground" />,
      title: "En attente",
      description: "L'analyse va commencer...",
      variant: "default" as const,
      showDetails: true
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`glass-card border-primary/10 shadow-lg transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    } ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {statusInfo.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{statusInfo.title}</h4>
              <Badge variant={statusInfo.variant} className="text-xs">
                {jobStatus || 'pending'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {statusInfo.description}
            </p>
            
            {/* Additional info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {lastUpdate && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              
              {isPolling && (
                <span className="flex items-center gap-1 text-primary">
                  <Wifi className="w-3 h-3" />
                  Connexion active
                </span>
              )}
              
              {retryCount > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <RefreshCw className="w-3 h-3" />
                  Tentative {retryCount}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              {statusInfo.showHistory && onNavigateToHistory && (
                <Button
                  size="sm"
                  onClick={() => {
                    onNavigateToHistory();
                    setIsVisible(false);
                  }}
                  className="h-7 px-3"
                >
                  <History className="w-3 h-3 mr-1" />
                  Voir l'historique
                </Button>
              )}
              
              {statusInfo.showRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsVisible(false);
                    // Trigger a refresh by updating the component
                    window.location.reload();
                  }}
                  className="h-7 px-3"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Réessayer
                </Button>
              )}
              
              {statusInfo.showDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-7 px-2"
                >
                  {showDetails ? 'Masquer' : 'Détails'}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-7 px-2"
              >
                ✕
              </Button>
            </div>

            {/* Detailed status */}
            {showDetails && (
              <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut:</span>
                    <span className="font-medium">{jobStatus || 'pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Polling:</span>
                    <span className="font-medium">{isPolling ? 'Actif' : 'Inactif'}</span>
                  </div>
                  {lastUpdate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dernière mise à jour:</span>
                      <span className="font-medium">{lastUpdate.toLocaleString()}</span>
                    </div>
                  )}
                  {retryCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tentatives:</span>
                      <span className="font-medium text-yellow-600">{retryCount}</span>
                    </div>
                  )}
                  {error && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Erreur:</span>
                      <span className="font-medium text-destructive">{error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
