import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  History,
  Wifi,
  WifiOff,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useWorkflowPolling } from '@/hooks/useWorkflowPolling';

interface AnalysisStatusIndicatorProps {
  jobId: string | null;
  onNavigateToHistory?: () => void;
  className?: string;
}

export function AnalysisStatusIndicator({ 
  jobId, 
  onNavigateToHistory,
  className = "" 
}: AnalysisStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    pollingStatus,
    isPolling,
    jobStatus,
    lastUpdate,
    error,
    retryCount
  } = useWorkflowPolling({
    jobId,
    enableNotifications: false, // We handle notifications ourselves
  });

  const getStatusInfo = () => {
    if (error) {
      return {
        icon: <WifiOff className="w-4 h-4 text-destructive" />,
        title: "Connexion perdue",
        description: "Tentative de reconnexion...",
        variant: "destructive" as const,
        showRetry: true
      };
    }

    if (jobStatus === 'completed') {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        title: "Terminé",
        description: "Analyse complétée",
        variant: "default" as const,
        showHistory: true
      };
    }

    if (jobStatus === 'failed') {
      return {
        icon: <XCircle className="w-4 h-4 text-destructive" />,
        title: "Échec",
        description: "Analyse échouée",
        variant: "destructive" as const,
        showRetry: true
      };
    }

    if (jobStatus === 'in_progress' || isPolling) {
      return {
        icon: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
        title: "En cours",
        description: "Analyse en cours...",
        variant: "default" as const,
        showDetails: true
      };
    }

    return {
      icon: <Clock className="w-4 h-4 text-muted-foreground" />,
      title: "En attente",
      description: "Démarrage de l'analyse...",
      variant: "default" as const,
      showDetails: true
    };
  };

  const statusInfo = getStatusInfo();

  // Auto-expand when there's an error or completion
  useEffect(() => {
    if (jobStatus === 'completed' || jobStatus === 'failed' || error) {
      setIsExpanded(true);
    }
  }, [jobStatus, error]);

  if (!jobId) return null;

  return (
    <Card className={`glass-card border-primary/10 transition-all duration-300 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{statusInfo.title}</span>
                <Badge variant={statusInfo.variant} className="text-xs">
                  {jobStatus || 'pending'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {statusInfo.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status */}
            {isPolling && !error && (
              <div className="flex items-center gap-1 text-green-500">
                <Wifi className="w-3 h-3" />
                <span className="text-xs">Connecté</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-1 text-destructive">
                <WifiOff className="w-3 h-3" />
                <span className="text-xs">Déconnecté</span>
              </div>
            )}

            {/* Action buttons */}
            {statusInfo.showHistory && onNavigateToHistory && (
              <Button
                size="sm"
                onClick={onNavigateToHistory}
                className="h-6 px-2 text-xs"
              >
                <History className="w-3 h-3 mr-1" />
                Historique
              </Button>
            )}
            
            {statusInfo.showRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Réessayer
              </Button>
            )}
            
            {statusInfo.showDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-1"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            )}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="grid grid-cols-2 gap-3 text-xs">
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
                  <span className="text-muted-foreground">Dernière MAJ:</span>
                  <span className="font-medium">{lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
              {retryCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tentatives:</span>
                  <span className="font-medium text-yellow-600">{retryCount}</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-destructive">{error}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
