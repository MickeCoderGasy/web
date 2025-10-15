import { supabase } from '../integrations/supabase/client';

export interface SignalsLogEntry {
  signal_id: string;
  generated_at: string | null;
  pair: string;
  Status: string;
  agent_version: string | null;
  signal_metadata: any;
  market_validation: any;
  signals: any;
  market_alerts: any;
  no_signal_analysis: any;
  user: string | null;
  metadata_info: any;
  job_id: string | null;
  fundamental_context: any;
}

export interface SignalsLogFilters {
  pair?: string;
  status?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class SignalsLogService {
  /**
   * Récupère tous les logs de signaux depuis Supabase
   */
  static async fetchSignalsLogs(filters?: SignalsLogFilters): Promise<SignalsLogEntry[]> {
    try {
      console.log('🔍 [SIGNALS LOG SERVICE] Fetching signals logs from Supabase...');
      
      let query = supabase
        .from('signals_log')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(15);

      // Appliquer les filtres
      if (filters?.pair) {
        query = query.eq('pair', filters.pair);
      }
      
      if (filters?.status) {
        query = query.eq('Status', filters.status);
      }
      
      if (filters?.user) {
        query = query.eq('user', filters.user);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('generated_at', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte('generated_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [SIGNALS LOG SERVICE] Supabase error:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('✅ [SIGNALS LOG SERVICE] Signals logs loaded:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ [SIGNALS LOG SERVICE] Error fetching signals logs:', error);
      throw error;
    }
  }

  /**
   * Récupère un log de signal spécifique par ID
   */
  static async fetchSignalLogById(signalId: string): Promise<SignalsLogEntry | null> {
    try {
      console.log('🔍 [SIGNALS LOG SERVICE] Fetching signal log by ID:', signalId);
      
      const { data, error } = await supabase
        .from('signals_log')
        .select('*')
        .eq('signal_id', signalId)
        .single();

      if (error) {
        console.error('❌ [SIGNALS LOG SERVICE] Supabase error:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('✅ [SIGNALS LOG SERVICE] Signal log loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ [SIGNALS LOG SERVICE] Error fetching signal log:', error);
      throw error;
    }
  }

  /**
   * Récupère les logs de signaux par utilisateur
   */
  static async fetchSignalsLogsByUser(userId: string, filters?: SignalsLogFilters): Promise<SignalsLogEntry[]> {
    try {
      console.log('🔍 [SIGNALS LOG SERVICE] Fetching signals logs for user:', userId);
      
      let query = supabase
        .from('signals_log')
        .select('*')
        .eq('user', userId)
        .order('generated_at', { ascending: false });

      // Appliquer les filtres supplémentaires
      if (filters?.pair) {
        query = query.eq('pair', filters.pair);
      }
      
      if (filters?.status) {
        query = query.eq('Status', filters.status);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('generated_at', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte('generated_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [SIGNALS LOG SERVICE] Supabase error:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('✅ [SIGNALS LOG SERVICE] User signals logs loaded:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ [SIGNALS LOG SERVICE] Error fetching user signals logs:', error);
      throw error;
    }
  }

  /**
   * Récupère les paires disponibles dans les logs
   */
  static async fetchAvailablePairs(): Promise<string[]> {
    try {
      console.log('🔍 [SIGNALS LOG SERVICE] Fetching available pairs...');
      
      const { data, error } = await supabase
        .from('signals_log')
        .select('pair')
        .order('pair');

      if (error) {
        console.error('❌ [SIGNALS LOG SERVICE] Supabase error:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      // Extraire les paires uniques
      const uniquePairs = [...new Set(data?.map(item => item.pair) || [])];
      console.log('✅ [SIGNALS LOG SERVICE] Available pairs:', uniquePairs);
      return uniquePairs;
    } catch (error) {
      console.error('❌ [SIGNALS LOG SERVICE] Error fetching available pairs:', error);
      throw error;
    }
  }

  /**
   * Récupère les statuts disponibles dans les logs
   */
  static async fetchAvailableStatuses(): Promise<string[]> {
    try {
      console.log('🔍 [SIGNALS LOG SERVICE] Fetching available statuses...');
      
      const { data, error } = await supabase
        .from('signals_log')
        .select('Status')
        .order('Status');

      if (error) {
        console.error('❌ [SIGNALS LOG SERVICE] Supabase error:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      // Extraire les statuts uniques
      const uniqueStatuses = [...new Set(data?.map(item => item.Status) || [])];
      console.log('✅ [SIGNALS LOG SERVICE] Available statuses:', uniqueStatuses);
      return uniqueStatuses;
    } catch (error) {
      console.error('❌ [SIGNALS LOG SERVICE] Error fetching available statuses:', error);
      throw error;
    }
  }

  /**
   * Supprime un log de signal
   */
  static async deleteSignalLog(signalId: string): Promise<void> {
    try {
      console.log('🗑️ [SIGNALS LOG SERVICE] Deleting signal log:', signalId);
      
      const { error } = await supabase
        .from('signals_log')
        .delete()
        .eq('signal_id', signalId);

      if (error) {
        console.error('❌ [SIGNALS LOG SERVICE] Supabase error:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('✅ [SIGNALS LOG SERVICE] Signal log deleted');
    } catch (error) {
      console.error('❌ [SIGNALS LOG SERVICE] Error deleting signal log:', error);
      throw error;
    }
  }
}

export default SignalsLogService;
