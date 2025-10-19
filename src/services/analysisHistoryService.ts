import { SignalsLogService, SignalsLogEntry } from './signalsLogService';
import { formatForGrok } from '@/utils/dateUtils';

// Service pour gérer l'historique des analyses
export interface AnalysisHistoryItem {
  id: string;
  pair: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'pending';
  signal?: 'BUY' | 'SELL';
  confidence?: number;
  confluenceScore?: number;
  summary?: string;
  result?: any;
}

class AnalysisHistoryService {
  private currentUserId: string | null = null;

  // Définir l'utilisateur actuel
  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
  }

  // Vérifier que l'utilisateur est connecté
  private ensureUserAuthenticated(): string {
    if (!this.currentUserId) {
      throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
    }
    return this.currentUserId;
  }

  // Convertir SignalsLogEntry vers AnalysisHistoryItem
  private convertToAnalysisHistoryItem(entry: SignalsLogEntry): AnalysisHistoryItem {
    console.log('🔍 Conversion des données d\'analyse:', {
      signal_id: entry.signal_id,
      pair: entry.pair,
      status: entry.Status,
      signal_metadata: entry.signal_metadata
    });

    // Extraire le signal depuis les différentes sources possibles
    let signal: 'BUY' | 'SELL' | undefined = undefined;
    let confidence = 0;
    
    // 1. Vérifier d'abord dans signals array (structure principale)
    if (entry.signals && Array.isArray(entry.signals) && entry.signals.length > 0) {
      const firstSignal = entry.signals[0];
      if (firstSignal.signal === 'BUY' || firstSignal.signal === 'SELL') {
        signal = firstSignal.signal;
        confidence = firstSignal.confidence || 0;
        console.log('✅ Signal trouvé dans signals array:', signal);
      }
    }
    
    // 2. Vérifier dans signal_metadata
    if (!signal && entry.signal_metadata?.signal) {
      if (entry.signal_metadata.signal === 'BUY' || entry.signal_metadata.signal === 'SELL') {
        signal = entry.signal_metadata.signal;
        confidence = entry.signal_metadata.confidence || 0;
        console.log('✅ Signal trouvé dans signal_metadata:', signal);
      }
    }
    
    // 3. Vérifier dans signal_metadata.signals
    if (!signal && entry.signal_metadata?.signals && Array.isArray(entry.signal_metadata.signals)) {
      const signalData = entry.signal_metadata.signals[0];
      if (signalData?.signal === 'BUY' || signalData?.signal === 'SELL') {
        signal = signalData.signal;
        confidence = signalData.confidence || 0;
        console.log('✅ Signal trouvé dans signal_metadata.signals:', signal);
      }
    }
    
    const confluenceScore = entry.signal_metadata?.confluence_score || 0;
    
    // Créer un résumé basé sur les données disponibles
    const summary = this.generateSummary(entry, signal, confidence);
    
    console.log('🎯 Signal final:', { signal, confidence, confluenceScore });

    return {
      id: entry.signal_id,
      pair: entry.pair,
      timestamp: entry.generated_at || new Date().toISOString(),
      status: this.mapStatus(entry.Status),
      signal: signal, // Peut être undefined si pas de signal
      confidence,
      confluenceScore,
      summary,
      result: entry
    };
  }

  // Mapper le statut Supabase vers notre format
  private mapStatus(status: string): 'completed' | 'failed' | 'pending' {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminée':
        return 'completed';
      case 'failed':
      case 'échouée':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // Générer un résumé basé sur les données
  private generateSummary(entry: SignalsLogEntry, signal: 'BUY' | 'SELL' | undefined, confidence: number): string {
    if (!signal) {
      return `Pas de signal clair sur ${entry.pair}. Marché en consolidation.`;
    }
    
    const action = signal === 'BUY' ? 'achat' : 'vente';
    const confidenceText = confidence > 70 ? 'fort' : confidence > 50 ? 'modéré' : 'faible';
    
    return `Signal d'${action} ${confidenceText} sur ${entry.pair} (confiance: ${confidence}%).`;
  }

  // Récupérer l'historique des analyses depuis Supabase
  async getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
    try {
      const userId = this.ensureUserAuthenticated();
      const signalsLogs = await SignalsLogService.fetchSignalsLogsByUser(userId);
      return signalsLogs.map(entry => this.convertToAnalysisHistoryItem(entry));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  // Récupérer une analyse spécifique par ID
  async getAnalysisById(id: string): Promise<AnalysisHistoryItem | null> {
    try {
      const userId = this.ensureUserAuthenticated();
      const signalsLogs = await SignalsLogService.fetchSignalsLogsByUser(userId);
      const entry = signalsLogs.find(log => log.signal_id === id);
      return entry ? this.convertToAnalysisHistoryItem(entry) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'analyse:', error);
      return null;
    }
  }

  // Récupérer les analyses par paire
  async getAnalysesByPair(pair: string): Promise<AnalysisHistoryItem[]> {
    try {
      const userId = this.ensureUserAuthenticated();
      const signalsLogs = await SignalsLogService.fetchSignalsLogsByUser(userId, { pair });
      return signalsLogs.map(entry => this.convertToAnalysisHistoryItem(entry));
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses par paire:', error);
      return [];
    }
  }

  // Récupérer les analyses récentes (dernières N)
  async getRecentAnalyses(limit: number = 20): Promise<AnalysisHistoryItem[]> {
    try {
      const userId = this.ensureUserAuthenticated();
      const signalsLogs = await SignalsLogService.fetchSignalsLogsByUser(userId);
      return signalsLogs
        .slice(0, limit)
        .map(entry => this.convertToAnalysisHistoryItem(entry));
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses récentes:', error);
      return [];
    }
  }

  // Formater une analyse pour le contexte Grok
  formatAnalysisForContext(analysis: AnalysisHistoryItem): string {
    // Toujours utiliser UTC pour Grok
    const date = formatForGrok(analysis.timestamp);
    let context = `=== ANALYSE ${analysis.pair} (${date}) ===\n`;
    context += `Statut: ${analysis.status}\n`;
    
    if (analysis.signal) {
      context += `Signal: ${analysis.signal}\n`;
      context += `Confiance: ${analysis.confidence}%\n`;
      context += `Score de confluence: ${analysis.confluenceScore}/100\n`;
    }
    
    if (analysis.summary) {
      context += `Résumé: ${analysis.summary}\n`;
    }
    
    // 🚀 ENVOI DES DONNÉES BRUTES COMPLÈTES
    if (analysis.result) {
      context += `\n\n=== DONNÉES BRUTES COMPLÈTES DU SIGNAL LOG ===\n`;
      context += `Signal ID: ${analysis.result.signal_id}\n`;
      context += `Pair: ${analysis.result.pair}\n`;
      context += `Status: ${analysis.result.Status}\n`;
      context += `Generated at: ${analysis.result.generated_at}\n`;
      
      // Envoyer TOUTES les données sans filtrage
      context += `\n--- DONNÉES COMPLÈTES ---\n`;
      context += JSON.stringify(analysis.result, null, 2);
      context += `\n--- FIN DES DONNÉES ---\n`;
    }
    
    return context;
  }

  // Formater plusieurs analyses pour le contexte
  formatMultipleAnalysesForContext(analyses: AnalysisHistoryItem[]): string {
    if (analyses.length === 0) return '';
    
    let context = '\n\n=== HISTORIQUE DES ANALYSES ===\n';
    analyses.forEach(analysis => {
      context += this.formatAnalysisForContext(analysis) + '\n';
    });
    
    return context;
  }

  // Compter le nombre total d'analyses
  async getTotalAnalysesCount(): Promise<number> {
    try {
      const userId = this.ensureUserAuthenticated();
      const signalsLogs = await SignalsLogService.fetchSignalsLogsByUser(userId);
      return signalsLogs.length;
    } catch (error) {
      console.error('Erreur lors du comptage des analyses:', error);
      return 0;
    }
  }

  // Compter le nombre de signaux trouvés (BUY ou SELL)
  async getSignalsFoundCount(): Promise<number> {
    try {
      const userId = this.ensureUserAuthenticated();
      const signalsLogs = await SignalsLogService.fetchSignalsLogsByUser(userId);
      let count = 0;
      
      signalsLogs.forEach(entry => {
        // Vérifier dans signals array
        if (entry.signals && Array.isArray(entry.signals) && entry.signals.length > 0) {
          const hasSignal = entry.signals.some(signal => 
            signal.signal === 'BUY' || signal.signal === 'SELL'
          );
          if (hasSignal) count++;
        }
        // Vérifier dans signal_metadata
        else if (entry.signal_metadata?.signal === 'BUY' || entry.signal_metadata?.signal === 'SELL') {
          count++;
        }
        // Vérifier dans signal_metadata.signals
        else if (entry.signal_metadata?.signals && Array.isArray(entry.signal_metadata.signals)) {
          const hasSignal = entry.signal_metadata.signals.some((signal: any) => 
            signal.signal === 'BUY' || signal.signal === 'SELL'
          );
          if (hasSignal) count++;
        }
      });
      
      return count;
    } catch (error) {
      console.error('Erreur lors du comptage des signaux trouvés:', error);
      return 0;
    }
  }

  // Compter le nombre de signaux non trouvés
  async getSignalsNotFoundCount(): Promise<number> {
    try {
      const totalCount = await this.getTotalAnalysesCount();
      const signalsFoundCount = await this.getSignalsFoundCount();
      return totalCount - signalsFoundCount;
    } catch (error) {
      console.error('Erreur lors du comptage des signaux non trouvés:', error);
      return 0;
    }
  }

  // Obtenir les paires les plus analysées
  async getMostAnalyzedPairs(limit: number = 5): Promise<{ pair: string; count: number }[]> {
    try {
      const userId = this.ensureUserAuthenticated();
      const signalsLogs = await SignalsLogService.fetchSignalsLogsByUser(userId);
      const pairCounts: { [key: string]: number } = {};
      
      // Compter les analyses par paire
      signalsLogs.forEach(entry => {
        if (entry.pair) {
          pairCounts[entry.pair] = (pairCounts[entry.pair] || 0) + 1;
        }
      });
      
      // Convertir en array et trier par nombre d'analyses
      const sortedPairs = Object.entries(pairCounts)
        .map(([pair, count]) => ({ pair, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      
      return sortedPairs;
    } catch (error) {
      console.error('Erreur lors de la récupération des paires les plus analysées:', error);
      return [];
    }
  }
}

export default new AnalysisHistoryService();
