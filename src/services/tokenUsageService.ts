// Service pour le suivi de l'utilisation des tokens
import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase générique pour contourner les problèmes de typage
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface TokenUsageEntry {
  id: number;
  created_at: string;
  user: string; // email de l'utilisateur
  input: string | null; // Tokens d'entrée cumulés
  output: string | null; // Tokens de sortie cumulés
}

export interface TokenUsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  maxTokens: number; // 5M tokens
  usagePercentage: number;
  lastUpdated: number;
}

class TokenUsageService {
  private readonly MAX_TOKENS = 5000000; // 5M tokens maximum

  /**
   * Récupère les données d'utilisation des tokens pour un utilisateur
   */
  async getTokenUsageEntry(userEmail: string): Promise<TokenUsageEntry | null> {
    try {
      console.log('🔍 Récupération des données pour:', userEmail);
      
      const { data, error } = await supabase
        .from('token_usage' as any)
        .select('*')
        .eq('user', userEmail)
        .single();

      console.log('📊 Données récupérées:', data);
      console.log('❌ Erreur:', error);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Aucune donnée trouvée pour cet utilisateur');
          return null; // Aucune donnée trouvée
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de tokens:', error);
      return null;
    }
  }

  /**
   * Calcule les statistiques d'utilisation des tokens pour un utilisateur
   */
  async getTokenUsageStats(userEmail: string): Promise<TokenUsageStats> {
    console.log('📈 Calcul des statistiques pour:', userEmail);
    
    const entry = await this.getTokenUsageEntry(userEmail);
    
    if (!entry) {
      console.log('⚠️ Aucune entrée trouvée, retour de statistiques par défaut');
      return {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        maxTokens: this.MAX_TOKENS,
        usagePercentage: 0,
        lastUpdated: Date.now()
      };
    }
    
    const totalInputTokens = entry.input ? parseInt(entry.input) : 0;
    const totalOutputTokens = entry.output ? parseInt(entry.output) : 0;
    const totalTokens = totalInputTokens + totalOutputTokens;
    const usagePercentage = (totalTokens / this.MAX_TOKENS) * 100;
    
    console.log('📊 Statistiques calculées:', {
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      usagePercentage
    });
    
    return {
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      maxTokens: this.MAX_TOKENS,
      usagePercentage: Math.min(usagePercentage, 100),
      lastUpdated: Date.now()
    };
  }

}

const tokenUsageService = new TokenUsageService();
export default tokenUsageService;
