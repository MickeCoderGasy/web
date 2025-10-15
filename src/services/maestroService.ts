// Service to communicate with n8n Maestro webhook for trading analysis
import { supabase } from '@/integrations/supabase/client';

const MAESTRO_WEBHOOK_URL = "https://n8n.qubextai.tech/webhook/maestro";
const GET_JOB_RESULT_WEBHOOK_URL = "https://n8n.qubextai.tech/webhook/result";

export type TradingStyle = 'intraday' | 'swing';
export type RiskLevel = 'basse' | 'moyenne' | 'Haut';
export type GainLevel = 'min' | 'moyen' | 'Max';
export type ForexPair = 'EUR/USD' | 'GBP/USD' | 'USD/JPY' | 'USD/CHF' | 'USD/CAD' | 'AUD/USD' | 'NZD/USD' | 'EUR/GBP' | 'EUR/JPY' | 'EUR/CHF' | 'EUR/CAD' | 'EUR/AUD' | 'EUR/NZD' | 'GBP/JPY' | 'GBP/CHF' | 'GBP/CAD' | 'GBP/AUD' | 'GBP/NZD' | 'CHF/JPY' | 'CAD/JPY' | 'AUD/JPY' | 'NZD/JPY' | 'AUD/CHF' | 'AUD/CAD' | 'AUD/NZD' | 'NZD/CHF' | 'NZD/CAD' | 'CAD/CHF' | 'XAU/USD';
export type StepStatus = 'idle' | 'pending' | 'loading' | 'completed' | 'failed';

export interface AnalysisConfig {
  pair: ForexPair;
  style: TradingStyle;
  risk: RiskLevel;
  gain: GainLevel;
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: StepStatus;
  message: string;
}

export interface MaestroResponse {
  jobId: string;
}

export interface WorkflowJob {
  job_id: string;
  overall_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps_status: Record<string, { status: StepStatus; message: string }>;
  final_result: any;
  error_message: string | null;
}

class MaestroService {
  async startAnalysis(config: AnalysisConfig): Promise<string> {
    try {
      console.log('🔍 [MAESTRO DEBUG] Starting analysis with config:', config);
      
      // Get user session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('❌ [MAESTRO DEBUG] Authentication error:', sessionError);
        throw new Error('You must be logged in to start an analysis');
      }

      const accessToken = sessionData.session.access_token;
      console.log('✅ [MAESTRO DEBUG] User authenticated, token length:', accessToken?.length);

      // Format time as required by the webhook
      const now = new Date();
      const formattedTime = now.toISOString().slice(0, 16).replace('T', ' ');
      console.log('⏰ [MAESTRO DEBUG] Formatted time:', formattedTime);

      const payload = {
        pair: config.pair,
        style: config.style,
        risk: config.risk,
        gain: config.gain,
        time: formattedTime,
        accessToken: accessToken,
      };

      console.log('📤 [MAESTRO DEBUG] Sending payload to webhook:', JSON.stringify(payload, null, 2));
      console.log('🌐 [MAESTRO DEBUG] Webhook URL:', MAESTRO_WEBHOOK_URL);

      const response = await fetch(MAESTRO_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [MAESTRO DEBUG] Response status:', response.status);
      console.log('📡 [MAESTRO DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [MAESTRO DEBUG] HTTP error response:', errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText || 'Invalid server response'}`);
      }

      const responseText = await response.text();
      console.log('📥 [MAESTRO DEBUG] Raw response:', responseText);

      let data: MaestroResponse;
      try {
        data = JSON.parse(responseText);
        console.log('✅ [MAESTRO DEBUG] Parsed response:', data);
      } catch (parseError) {
        console.error('❌ [MAESTRO DEBUG] JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!data.jobId) {
        console.error('❌ [MAESTRO DEBUG] No jobId in response:', data);
        throw new Error('Server did not return a jobId');
      }

      console.log('🎉 [MAESTRO DEBUG] Analysis started successfully with jobId:', data.jobId);
      return data.jobId;
    } catch (error: any) {
      console.error('💥 [MAESTRO DEBUG] Complete error:', error);
      console.error('💥 [MAESTRO DEBUG] Error stack:', error.stack);
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<WorkflowJob | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_jobs')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job status:', error);
        // If table doesn't exist or CORS error, return a mock status
        if (error.message?.includes('relation "workflow_jobs" does not exist') || 
            error.message?.includes('Failed to fetch')) {
          console.warn('Workflow jobs table not available, using mock status');
          return {
            job_id: jobId,
            overall_status: 'pending',
            steps_status: {},
            final_result: null,
            error_message: null
          } as WorkflowJob;
        }
        return null;
      }

      return data as WorkflowJob;
    } catch (error) {
      console.error('Error in getJobStatus:', error);
      // Return mock status for development
      return {
        job_id: jobId,
        overall_status: 'pending',
        steps_status: {},
        final_result: null,
        error_message: null
      } as WorkflowJob;
    }
  }

  async subscribeToJobUpdates(
    jobId: string,
    onUpdate: (job: WorkflowJob) => void,
    onComplete: (job: WorkflowJob) => void,
    onError: (error: string) => void
  ) {
    const channel = supabase
      .channel(`job_updates_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflow_jobs',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          const newRecord = payload.new as WorkflowJob;
          onUpdate(newRecord);

          if (newRecord.overall_status === 'completed') {
            onComplete(newRecord);
            supabase.removeChannel(channel);
          } else if (newRecord.overall_status === 'failed') {
            onError(newRecord.error_message || 'Analysis failed');
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to job updates for ${jobId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error:', err);
          onError('Failed to subscribe to real-time updates');
        }
      });

    return channel;
  }

  async getSignalInterpretation(signalId: string): Promise<string> {
    try {
      console.log(`Fetching interpretation for signal: ${signalId}`);

      const response = await fetch(GET_JOB_RESULT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signal_id: signalId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      // Check if streaming is supported
      if (!response.body) {
        const text = await response.text();
        
        try {
          const jsonData = JSON.parse(text);
          return this.generateInterpretationFromData(jsonData);
        } catch (e) {
          return text;
        }
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
      }

      return accumulatedText;
    } catch (error: any) {
      console.error('Error getting signal interpretation:', error);
      throw error;
    }
  }

  private generateInterpretationFromData(data: any): string {
    try {
      const signalData = data.pinData?.['Get a row']?.[0] || data;
      
      const {
        pair,
        signal_metadata,
        market_validation,
        signals,
        no_signal_analysis,
        fundamental_context,
        market_alerts
      } = signalData;

      let interpretation = `# 🤖 Analyse de Qubext pour ${pair}\n\n`;
      
      if (signal_metadata) {
        interpretation += `**Session de marché:** ${signal_metadata.market_session}\n`;
        interpretation += `**Fraîcheur des données:** ${signal_metadata.data_freshness}\n\n`;
      }

      if (market_validation) {
        const score = market_validation.overall_confluence_score;
        const threshold = market_validation.minimum_threshold;
        
        interpretation += `## 📊 Score de Confluence: ${score}/100\n`;
        interpretation += `**Seuil minimum:** ${threshold}/100\n\n`;
        
        if (score >= threshold) {
          interpretation += `✅ **Le score dépasse le seuil de sécurité!**\n\n`;
        } else {
          interpretation += `⚠️ **Le score est en dessous du seuil de sécurité de ${threshold}.**\n\n`;
        }

        if (market_validation.score_breakdown) {
          interpretation += `### Détails du Score:\n`;
          interpretation += `- Price Action: ${market_validation.score_breakdown.price_action}/25\n`;
          interpretation += `- SMC: ${market_validation.score_breakdown.smc}/25\n`;
          interpretation += `- Indicateurs: ${market_validation.score_breakdown.indicators}/20\n`;
          interpretation += `- Timing: ${market_validation.score_breakdown.timing}/15\n\n`;
        }
      }

      if (signals && signals.length > 0) {
        interpretation += `## 🎯 Signal Détecté!\n\n`;
        signals.forEach((signal: any) => {
          interpretation += `### ${signal.signal} - Confiance: ${signal.confidence}\n\n`;
          
          if (signal.entry_details) {
            interpretation += `**Point d'Entrée:** ${signal.entry_details.entry_price}\n`;
          }
          
          if (signal.risk_management) {
            interpretation += `**Stop Loss:** ${signal.risk_management.stop_loss}\n`;
            interpretation += `**Take Profit 1:** ${signal.risk_management.take_profit_1}\n`;
            interpretation += `**Ratio R/R:** ${signal.risk_management.risk_reward_ratio}\n\n`;
          }

          if (signal.supporting_analysis?.fundamental_summary) {
            interpretation += `${signal.supporting_analysis.fundamental_summary}\n\n`;
          }
        });
      } else if (no_signal_analysis) {
        interpretation += `## 🛡️ Aucun Signal Recommandé\n\n`;
        interpretation += `**Ma priorité est de protéger ton capital.**\n\n`;
        
        if (no_signal_analysis.reasons_if_no_signal) {
          interpretation += `### Pourquoi je reste prudent:\n\n`;
          no_signal_analysis.reasons_if_no_signal.forEach((reason: string, index: number) => {
            interpretation += `${index + 1}. ${reason}\n\n`;
          });
        }
      }

      if (fundamental_context) {
        interpretation += `## 🌍 Contexte Fondamental\n\n`;
        interpretation += `**Sentiment général:** ${fundamental_context.sentiment_general}\n`;
        interpretation += `**Tendance dominante:** ${fundamental_context.tendance_dominante}\n\n`;
      }

      interpretation += `---\n\n`;
      interpretation += `💡 **Rappel:** Ne pas trader est parfois la meilleure décision.\n`;

      return interpretation;
    } catch (error) {
      console.error('Error generating interpretation:', error);
      return 'Erreur lors de l\'interprétation des données du signal.';
    }
  }
}

export default new MaestroService();

