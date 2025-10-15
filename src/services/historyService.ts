// Service to fetch analysis history from n8n webhook
import { supabase } from '@/integrations/supabase/client';

const N8N_LOGS_WEBHOOK_URL = "https://n8n.qubextai.tech/webhook/base";

export type SignalLogStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'unknown';

export interface SignalLog {
  job_id: string;
  created_at: string; // ISO string
  overall_status: SignalLogStatus;
  final_result: any; // The full analysis object from the backend
}

class HistoryService {
  async fetchSignalLogs(): Promise<SignalLog[]> {
    try {
      console.log('🔍 [HISTORY DEBUG] Fetching signal logs...');
      
      // Get user session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('❌ [HISTORY DEBUG] Authentication error:', sessionError);
        throw new Error('You must be logged in to view analysis history');
      }

      const accessToken = sessionData.session.access_token;
      console.log('✅ [HISTORY DEBUG] User authenticated, token length:', accessToken?.length);

      const payload = { accessToken: accessToken };
      console.log('📤 [HISTORY DEBUG] Sending payload to webhook:', JSON.stringify(payload, null, 2));
      console.log('🌐 [HISTORY DEBUG] Webhook URL:', N8N_LOGS_WEBHOOK_URL);

      const response = await fetch(N8N_LOGS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [HISTORY DEBUG] Response status:', response.status);
      console.log('📡 [HISTORY DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [HISTORY DEBUG] HTTP error response:', errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText || 'Invalid server response'}`);
      }

      const responseText = await response.text();
      console.log('📥 [HISTORY DEBUG] Raw response:', responseText);

      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
        console.log('✅ [HISTORY DEBUG] Parsed response:', responseData);
      } catch (parseError) {
        console.error('❌ [HISTORY DEBUG] JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!Array.isArray(responseData)) {
        console.error('❌ [HISTORY DEBUG] Unexpected response format:', responseData);
        throw new Error('Unexpected response format from webhook');
      }

      if (responseData.length === 0) {
        console.log('📝 [HISTORY DEBUG] No logs found in response');
        return [];
      }

      const mappedLogs: SignalLog[] = responseData.map((logData: any, index: number) => {
        console.log(`🔍 [HISTORY DEBUG] Processing log ${index}:`, logData);
        
        return {
          job_id: logData.job_id || `unknown-${index}`,
          created_at: logData.generated_at || new Date().toISOString(),
          overall_status: (logData.Status || 'unknown')?.toLowerCase() as SignalLog['overall_status'] || 'unknown',
          final_result: logData,
        };
      });

      console.log('🎉 [HISTORY DEBUG] Mapped logs:', mappedLogs);
      return mappedLogs;
    } catch (error: any) {
      console.error('💥 [HISTORY DEBUG] Complete error:', error);
      console.error('💥 [HISTORY DEBUG] Error stack:', error.stack);
      throw error;
    }
  }
}

export default new HistoryService();
