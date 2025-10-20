import { useState, useEffect } from "react";
import { AIChat } from "@/components/AIChat";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, TrendingUp, History as HistoryIcon } from "lucide-react";
import { AnalysisConfig } from "@/components/AnalysisConfig";
import { AnalysisResults } from "@/components/AnalysisResults";
import { History } from "@/components/History";
import { WorkflowStatusNotification } from "@/components/WorkflowStatusNotification";
import { AnalysisStatusIndicator } from "@/components/AnalysisStatusIndicator";
import { AnalysisTimer } from "@/components/AnalysisTimer";
import { useToast } from "@/hooks/use-toast";
import subscriptionService from "@/services/subscriptionService";
import { useAnalysisProgress } from "@/hooks/useAnalysisProgress";
import { useMobileState } from "@/hooks/useMobileState";
import maestroService, { AnalysisConfig as MaestroConfig, AnalysisStep, WorkflowJob } from "@/services/maestroService";

const initialSteps: AnalysisStep[] = [
  { id: "security_check", label: "Vérification de sécurité", status: "idle", message: "En attente..." },
  { id: "get_ohlc", label: "Récupération des données OHLC", status: "idle", message: "En attente..." },
  { id: "price_action_analysis", label: "Analyse Price Action", status: "idle", message: "En attente..." },
  { id: "smc_analysis", label: "Analyse SMC (Smart Money Concepts)", status: "idle", message: "En attente..." },
  { id: "indicator_calculation", label: "Calcul des Indicateurs Techniques", status: "idle", message: "En attente..." },
  { id: "fundamental_analysis", label: "Analyse Fondamentale", status: "idle", message: "En attente..." },
  { id: "market_context", label: "Contexte de Marché", status: "idle", message: "En attente..." },
  { id: "confluence_scoring", label: "Calcul du Score de Confluence", status: "idle", message: "En attente..." },
  { id: "signal_generation", label: "Génération du Signal", status: "idle", message: "En attente..." },
  { id: "risk_management", label: "Calcul de la Gestion du Risque", status: "idle", message: "En attente..." },
  { id: "final_processing", label: "Traitement final et Validation", status: "idle", message: "En attente..." },
];

const Chat = () => {
  const { toast } = useToast();
  const { state, updateState, resetAnalysis, isAppVisible } = useMobileState();
  
  // Extraire les valeurs de l'état
  const {
    isAnalyzing,
    analysisResult,
    currentJobId,
    interpretation,
    activeTab,
    jobStatus,
    stepsStatus
  } = state;

  // Handle job status updates with improved polling
  const handleJobStatusUpdate = (job: WorkflowJob) => {
    console.log('Job status update:', job.overall_status);
    updateState({
      jobStatus: job.overall_status,
      stepsStatus: job.steps_status || {}
    });
  };

  const handleJobComplete = async (job: WorkflowJob) => {
    console.log('Analysis complete:', job);
    updateState({
      isAnalyzing: false,
      jobStatus: 'completed',
      analysisResult: job.final_result
    });

    // Get interpretation
    if (job.final_result?.signal_id) {
      try {
        const interp = await maestroService.getSignalInterpretation(job.final_result.signal_id);
        updateState({ interpretation: interp });
      } catch (error) {
        console.error('Error getting interpretation:', error);
      }
    }
  };

  const handleJobError = (error: string) => {
    console.error('Analysis failed:', error);
    updateState({
      isAnalyzing: false,
      jobStatus: 'failed'
    });
  };

  const handleNavigateToHistory = () => {
    updateState({ activeTab: "history" });
  };

  // Use the analysis progress hook (simplified)
  useAnalysisProgress({
    isAnalyzing,
    jobStatus,
    stepsStatus
  });

  // Polling direct pour s'assurer que le statut est mis à jour
  useEffect(() => {
    if (!currentJobId || !isAnalyzing) return;

    const pollInterval = setInterval(async () => {
      try {
        const job = await maestroService.getJobStatus(currentJobId);
        if (job) {
          console.log('🔄 Direct polling result:', job.overall_status);
          handleJobStatusUpdate(job);
          
          if (job.overall_status === 'completed') {
            handleJobComplete(job);
          } else if (job.overall_status === 'failed') {
            handleJobError(job.error_message || 'Analyse échouée');
          }
        }
      } catch (error) {
        console.error('❌ Direct polling error:', error);
      }
    }, 5000); // Polling toutes les 5 secondes

    return () => clearInterval(pollInterval);
  }, [currentJobId, isAnalyzing]);

  const handleStartAnalysis = async (config: MaestroConfig) => {
    console.log('🚀 Starting analysis with config:', config);
    
    try {
      // Vérifier quota d'abonnement avant de démarrer
      const quota = await subscriptionService.hasRemainingTokens();
      if (!quota.ok) {
        toast({
          title: "Quota atteint",
          description: `Votre plan (${quota.sub.plan_name}) a atteint la limite mensuelle (${quota.total.toLocaleString()} tokens). Changez de plan dans Paramètres > Abonnement.`,
          variant: "destructive",
        });
        return;
      }

      updateState({
        isAnalyzing: true,
        analysisResult: null,
        interpretation: "",
        jobStatus: 'pending',
        stepsStatus: {}
      });

      // Call maestroService to start the analysis
      const jobId = await maestroService.startAnalysis(config);
      console.log('🎉 Analysis started with jobId:', jobId);
      
      updateState({ currentJobId: jobId });

      toast({
        title: "Analyse démarrée",
        description: `L'analyse pour ${config.pair} est en cours...`,
      });
    
    } catch (error: any) {
      console.error('💥 Error starting analysis:', error);
      updateState({ isAnalyzing: false });
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer l'analyse",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-4xl mx-auto px-4 pb-24 md:pb-6">
        {/* Workflow Status Notification */}
        <WorkflowStatusNotification 
          jobId={currentJobId}
          jobStatus={jobStatus}
          isPolling={isAnalyzing}
          onNavigateToHistory={handleNavigateToHistory}
          onStatusUpdate={handleJobStatusUpdate}
          onComplete={handleJobComplete}
          onError={handleJobError}
          className="mb-4"
        />
        
        <Tabs value={activeTab} onValueChange={(value) => updateState({ activeTab: value })} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card border border-border/50 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat AI
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analyse
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <AIChat />
          </TabsContent>

          <TabsContent value="analysis" className="mt-0 space-y-6">
            <AnalysisConfig onStartAnalysis={handleStartAnalysis} isLoading={isAnalyzing} />
            
            {/* Status Indicator */}
            <AnalysisStatusIndicator 
              jobId={currentJobId}
              onNavigateToHistory={handleNavigateToHistory}
            />
            
            {isAnalyzing && (
              <AnalysisTimer 
                isAnalyzing={isAnalyzing}
              />
            )}
            
            {analysisResult && !isAnalyzing && (
              <div className="space-y-4">
                {interpretation && (
                  <div className="glass-card p-6 border border-primary/10 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Interprétation du Signal
                    </h3>
                    <div 
                      className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: interpretation.replace(/\n/g, '<br />') }}
                    />
                  </div>
                )}
                <AnalysisResults result={analysisResult} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <History />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Chat;
