import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

type StepStatus = "idle" | "pending" | "loading" | "completed" | "failed";

interface AnalysisStep {
  id: string;
  label: string;
  status: StepStatus;
  message: string;
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  isLoading: boolean;
  stepsStatus?: Record<string, { status: string; message: string }>;
}

export function AnalysisProgress({ steps, isLoading, stepsStatus }: AnalysisProgressProps) {
  // Le composant utilise directement les steps du hook useAnalysisProgress

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg">Étapes d'Analyse</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
              step.status === 'loading' 
                ? 'bg-primary/10 border-primary/30' 
                : step.status === 'completed'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-secondary/30 border-border/50'
            }`}
          >
            {getStatusIcon(step.status)}
            <div className="flex-1">
              <p className="font-medium text-sm">{step.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{step.message}</p>
            </div>
            {step.status === 'loading' && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}