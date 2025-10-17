import { GrokConfig, defaultGrokConfig, ContextSettings, defaultContextSettings } from '@/config/grok-config';
import { env, checkConfig } from '@/config/env';
import analysisHistoryService, { AnalysisHistoryItem } from '@/services/analysisHistoryService';
import ohlcService from '@/services/ohlcService';
import grokCacheService from '@/services/grokCacheService';
import OHLCRefreshStrategy, { defaultOHLCRefreshConfig } from '@/services/ohlcRefreshStrategy';
import { supabase } from '@/integrations/supabase/client';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  pnl?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

class GrokService {
  private config: GrokConfig;
  private contextSettings: ContextSettings;
  private ohlcRefreshStrategy: OHLCRefreshStrategy;

  constructor() {
    this.config = { 
      ...defaultGrokConfig,
      apiKey: env.GROK_API_KEY 
    };
    this.contextSettings = { ...defaultContextSettings };
    this.ohlcRefreshStrategy = new OHLCRefreshStrategy(defaultOHLCRefreshConfig);
    
    // Vérifier la configuration au démarrage
    if (!checkConfig()) {
      console.warn('⚠️ Configuration Grok incomplète. Certaines fonctionnalités peuvent ne pas fonctionner.');
    }
    
  }

  // Configuration des paramètres Grok
  updateConfig(newConfig: Partial<GrokConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Récupérer le token d'accès Supabase
  private async getSupabaseAccessToken(): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        console.log('✅ Token Supabase récupéré');
        return session.access_token;
      } else {
        console.warn('⚠️ Aucune session Supabase active');
        // Fallback vers un token par défaut ou erreur
        throw new Error('Aucune session d\'authentification Supabase active');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token Supabase:', error);
      throw new Error('Impossible de récupérer le token d\'authentification');
    }
  }

  // Configuration du contexte
  updateContextSettings(settings: Partial<ContextSettings>) {
    this.contextSettings = { ...this.contextSettings, ...settings };
  }

  // Construire le contexte à partir de l'analyse sélectionnée
  private async buildContext(
    conversationHistory?: Array<{role: string, content: string}>,
    isFirstMessage: boolean = false
  ) {
    let context = '';
    console.log('🔧 === CONSTRUCTION DU CONTEXTE GROK ===');
    console.log('🎯 Premier message?', isFirstMessage);
    console.log('📚 Historique fourni:', conversationHistory?.length || 0, 'messages');

    // Ajouter l'historique de la conversation si disponible
    if (conversationHistory && conversationHistory.length > 0) {
      // Limiter l'historique aux 10 derniers messages pour éviter de dépasser les limites de tokens
      const recentHistory = conversationHistory.slice(-10);
      
      context += '=== HISTORIQUE DE LA CONVERSATION ===\n';
      recentHistory.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'Utilisateur' : 'Assistant';
        context += `${role}: ${msg.content}\n`;
      });
      context += '=== FIN DE L\'HISTORIQUE ===\n\n';
      
      console.log('📚 Historique envoyé à Grok:', recentHistory.length, 'messages');
      console.log('📚 Contenu historique:', context.substring(0, 200) + '...');
    } else if (!isFirstMessage) {
      console.log('💬 Message suivant - Seulement l\'historique envoyé à Grok');
    }

    // Ajouter le contexte complet SEULEMENT au premier message
    if (isFirstMessage && this.contextSettings.enabled && this.contextSettings.selectedAnalysisId) {
      console.log('🎯 Premier message - Envoi du contexte complet à Grok');
      try {
        const selectedAnalysis = await analysisHistoryService.getAnalysisById(this.contextSettings.selectedAnalysisId);
        if (selectedAnalysis) {
          // Vérifier le cache pour le contexte d'analyse
          const analysisContent = analysisHistoryService.formatAnalysisForContext(selectedAnalysis);
          const analysisCacheKey = grokCacheService.getAnalysisCacheKey(
            this.contextSettings.selectedAnalysisId, 
            analysisContent
          );
          
          let analysisContext: string;
          if (grokCacheService.isCached(analysisCacheKey)) {
            console.log('💾 Utilisation du cache pour l\'analyse');
            analysisContext = grokCacheService.getCachedContent(analysisCacheKey) || analysisContent;
          } else {
            console.log('🔄 Génération et mise en cache de l\'analyse');
            analysisContext = analysisContent;
            grokCacheService.cacheAnalysis(this.contextSettings.selectedAnalysisId, selectedAnalysis, analysisContext);
          }
          
          context += analysisContext;
          console.log('📊 Contexte analyse ajouté:', analysisContext.substring(0, 200) + '...');
          
          // Ajouter les données complètes de l'analyse pour plus de contexte
          if (selectedAnalysis.result) {
            context += `\n\n=== DONNÉES COMPLÈTES DE L'ANALYSE ===\n`;
            context += `Signal ID: ${selectedAnalysis.result.signal_id}\n`;
            context += `Status: ${selectedAnalysis.result.Status}\n`;
            context += `Pair: ${selectedAnalysis.result.pair}\n`;
            context += `Generated at: ${selectedAnalysis.result.generated_at} UTC\n`;
            
            // 🚀 ENVOI DE TOUTES LES DONNÉES BRUTES SANS FILTRAGE
            context += `\n\n=== DONNÉES BRUTES COMPLÈTES (SIGNAL LOG ENTIER) ===\n`;
            context += JSON.stringify(selectedAnalysis.result, null, 2);
            context += `\n=== FIN DES DONNÉES BRUTES ===\n`;

            // Ajouter les métadonnées du signal si disponibles
            if (selectedAnalysis.result.signal_metadata) {
              context += `\n\n=== SIGNAL METADATA DÉTAILLÉ ===\n`;
              context += JSON.stringify(selectedAnalysis.result.signal_metadata, null, 2);
            }
            
            // Ajouter la validation du marché si disponible
            if (selectedAnalysis.result.market_validation) {
              context += `\n\n=== MARKET VALIDATION DÉTAILLÉ ===\n`;
              context += JSON.stringify(selectedAnalysis.result.market_validation, null, 2);
            }
            
            // Ajouter le contexte fondamental si disponible
            if (selectedAnalysis.result.fundamental_context) {
              context += `\n\n=== FUNDAMENTAL CONTEXT DÉTAILLÉ ===\n`;
              context += JSON.stringify(selectedAnalysis.result.fundamental_context, null, 2);
            }

            // 🚀 ENRICHISSEMENT AUTOMATIQUE AVEC DONNÉES OHLC
            try {
              console.log('🔄 Enrichissement du contexte avec les données OHLC...');
              const pair = selectedAnalysis.result.pair;
              const analysisDateTime = selectedAnalysis.result.generated_at || selectedAnalysis.timestamp;
              
              console.log('📊 Paramètres OHLC:', {
                pair,
                analysisDateTime
              });
              
              // Vérifier si les données OHLC doivent être rafraîchies
              const shouldRefresh = this.ohlcRefreshStrategy.shouldRefresh(pair, analysisDateTime);
              
              let ohlcContext: string;
              
              if (shouldRefresh) {
                console.log('🔄 Rafraîchissement des données OHLC (stratégie intelligente)');
                // Récupérer le token d'accès Supabase depuis le contexte d'authentification
                const accessToken = await this.getSupabaseAccessToken();
                console.log('🔑 Token Supabase récupéré:', accessToken ? 'Oui' : 'Non');
                
                // Récupérer les données OHLC fraîches
                ohlcContext = await ohlcService.getOHLCContext(
                  accessToken,
                  pair,
                  analysisDateTime
                );
                
                // Mettre à jour le cache avec les nouvelles données
                grokCacheService.cacheOHLCData(pair, analysisDateTime, ohlcContext);
                console.log('💾 Données OHLC mises à jour dans le cache');
                
                // Marquer le rafraîchissement comme terminé
                this.ohlcRefreshStrategy.markRefreshComplete(pair, analysisDateTime);
              } else {
                console.log('💾 Utilisation du cache OHLC (pas de rafraîchissement nécessaire)');
                // Vérifier le cache pour les données OHLC
                const ohlcCacheKey = grokCacheService.getOHLCCacheKey(pair, analysisDateTime, '');
                ohlcContext = grokCacheService.getCachedContent(ohlcCacheKey) || '';
                
                if (!ohlcContext) {
                  console.log('⚠️ Aucune donnée OHLC en cache, rafraîchissement forcé');
                  const accessToken = await this.getSupabaseAccessToken();
                  ohlcContext = await ohlcService.getOHLCContext(
                    accessToken,
                    pair,
                    analysisDateTime
                  );
                  grokCacheService.cacheOHLCData(pair, analysisDateTime, ohlcContext);
                }
              }
              
              console.log('📈 Contexte OHLC généré:', ohlcContext);
              console.log('📏 Taille du contexte OHLC:', ohlcContext.length, 'caractères');
              console.log('📈 Contenu OHLC:', ohlcContext.substring(0, 200) + '...');
              
              context += ohlcContext;
              console.log('✅ Contexte enrichi avec les données OHLC');
              console.log('📊 Taille totale du contexte:', context.length, 'caractères');
            } catch (ohlcError) {
              console.warn('⚠️ Impossible d\'enrichir avec les données OHLC:', ohlcError);
              context += `\n\n=== DONNÉES OHLC ===\nEnrichissement OHLC non disponible\n====================`;
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'analyse sélectionnée:', error);
      }
    }

    console.log('🔧 === FIN CONSTRUCTION CONTEXTE ===');
    console.log('📏 Taille finale du contexte:', context.length, 'caractères');
    console.log('📄 Contenu final du contexte:', context.substring(0, 500) + (context.length > 500 ? '...' : ''));
    console.log('🔧 === FIN CONSTRUCTION CONTEXTE ===');
    
    return context;
  }

  // Envoyer un message à Grok avec contexte
  async sendMessage(
    userMessage: string, 
    conversationHistory?: Array<{role: string, content: string}>,
    isFirstMessage: boolean = false
  ): Promise<GrokResponse> {
    try {
      // Vérifier la configuration
      if (!this.config.apiKey) {
        throw new Error('Clé API Grok manquante. Veuillez configurer VITE_GROK_API_KEY dans votre fichier .env');
      }

      // Vérifier qu'une analyse est sélectionnée
      if (!this.contextSettings.selectedAnalysisId) {
        throw new Error('Aucune analyse sélectionnée. Veuillez sélectionner une analyse dans les paramètres de contexte.');
      }

      const context = await this.buildContext(conversationHistory, isFirstMessage);
      const fullUserMessage = userMessage + context;

      console.log('🚀 === DONNÉES ENVOYÉES À GROK (sendMessage) ===');
      console.log('📝 Message utilisateur original:', userMessage);
      console.log('📊 Contexte généré:', context);
      console.log('📏 Taille du contexte:', context.length, 'caractères');
      console.log('🔗 Message complet envoyé:', fullUserMessage);
      console.log('📏 Taille totale du message:', fullUserMessage.length, 'caractères');
      console.log('🎯 Premier message?', isFirstMessage);
      console.log('📚 Historique de conversation:', conversationHistory?.length || 0, 'messages');
      console.log('🚀 === FIN DES DONNÉES GROK ===');

      const messages: GrokMessage[] = [
        {
          role: 'system',
          content: this.getCachedSystemPrompt()
        },
        {
          role: 'user',
          content: fullUserMessage
        }
      ];

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Grok API (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.',
        usage: data.usage
      };

    } catch (error) {
      console.error('Erreur Grok Service:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Impossible de communiquer avec Grok. Vérifiez votre configuration API.');
    }
  }

  // Chat en streaming (pour une expérience plus fluide)
  async sendMessageStream(
    userMessage: string,
    onChunk?: (chunk: string) => void,
    conversationHistory?: Array<{role: string, content: string}>,
    isFirstMessage: boolean = false
  ): Promise<string> {
    try {
      // Vérifier la configuration
      if (!this.config.apiKey) {
        throw new Error('Clé API Grok manquante. Veuillez configurer VITE_GROK_API_KEY dans votre fichier .env');
      }

      // Vérifier qu'une analyse est sélectionnée
      if (!this.contextSettings.selectedAnalysisId) {
        throw new Error('Aucune analyse sélectionnée. Veuillez sélectionner une analyse dans les paramètres de contexte.');
      }

      const context = await this.buildContext(conversationHistory, isFirstMessage);
      const fullUserMessage = userMessage + context;

      console.log('🚀 === DONNÉES ENVOYÉES À GROK (sendMessage) ===');
      console.log('📝 Message utilisateur original:', userMessage);
      console.log('📊 Contexte généré:', context);
      console.log('📏 Taille du contexte:', context.length, 'caractères');
      console.log('🔗 Message complet envoyé:', fullUserMessage);
      console.log('📏 Taille totale du message:', fullUserMessage.length, 'caractères');
      console.log('🎯 Premier message?', isFirstMessage);
      console.log('📚 Historique de conversation:', conversationHistory?.length || 0, 'messages');
      console.log('🚀 === FIN DES DONNÉES GROK ===');

      const messages: GrokMessage[] = [
        {
          role: 'system',
          content: this.getCachedSystemPrompt()
        },
        {
          role: 'user',
          content: fullUserMessage
        }
      ];

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Grok API: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Impossible de lire la réponse streamée');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                onChunk?.(content);
              }
            } catch (e) {
              // Ignorer les lignes malformées
            }
          }
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('Erreur Grok Stream:', error);
      throw new Error('Impossible de communiquer avec Grok en streaming.');
    }
  }

  // Analyser un symbole spécifique avec contexte
  async analyzeSymbol(symbol: string): Promise<string> {
    const analysisPrompt = `
    Analyse en détail le symbole ${symbol} en tenant compte de l'analyse sélectionnée.
    
    Fournis une analyse structurée avec recommandations de trading.
    `;

    const response = await this.sendMessage(analysisPrompt);
    return response.content;
  }

  // Obtenir la configuration actuelle
  getConfig(): GrokConfig {
    return { ...this.config };
  }

  // Obtenir les statistiques du cache
  getCacheStats() {
    return grokCacheService.getStats();
  }

  // Nettoyer le cache
  clearCache() {
    grokCacheService.clearCache();
    console.log('🗑️ Cache Grok vidé');
  }

  // Obtenir toutes les entrées du cache
  getAllCacheEntries() {
    return grokCacheService.getAllEntries();
  }

  // Forcer le rafraîchissement des données OHLC
  async refreshOHLCData(pair: string, analysisDateTime: string): Promise<string> {
    console.log('🔄 Rafraîchissement forcé des données OHLC pour', pair);
    
    try {
      // Récupérer le token d'accès Supabase
      const accessToken = await this.getSupabaseAccessToken();
      
      // Récupérer les données OHLC fraîches
      const ohlcContext = await ohlcService.getOHLCContext(
        accessToken,
        pair,
        analysisDateTime
      );
      
      // Mettre à jour le cache avec les nouvelles données
      grokCacheService.cacheOHLCData(pair, analysisDateTime, ohlcContext);
      
      console.log('✅ Données OHLC rafraîchies et mises en cache');
      return ohlcContext;
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des données OHLC:', error);
      throw error;
    }
  }

  // Invalider le cache OHLC pour une paire spécifique
  invalidateOHLCCache(pair: string, analysisDateTime?: string) {
    const entries = grokCacheService.getAllEntries();
    let removedCount = 0;
    
    entries.forEach(entry => {
      if (entry.type === 'ohlc') {
        // Vérifier si c'est la paire concernée
        const keyParts = entry.id.split(':');
        if (keyParts.length >= 2 && keyParts[1].includes(pair)) {
          if (!analysisDateTime || keyParts[1].includes(analysisDateTime)) {
            grokCacheService.removeEntry(entry.id);
            removedCount++;
          }
        }
      }
    });
    
    console.log(`🗑️ ${removedCount} entrées OHLC supprimées du cache pour ${pair}`);
    return removedCount;
  }

  // Obtenir les paramètres de contexte
  getContextSettings(): ContextSettings {
    return { ...this.contextSettings };
  }

  // Vérifier si le contexte est correctement configuré
  isContextConfigured(): boolean {
    return !!(this.contextSettings.enabled && this.contextSettings.selectedAnalysisId);
  }

  // Obtenir des informations de debug sur le contexte
  getContextDebugInfo(): any {
    return {
      contextSettings: this.contextSettings,
      isConfigured: this.isContextConfigured(),
      selectedAnalysisId: this.contextSettings.selectedAnalysisId,
      enabled: this.contextSettings.enabled
    };
  }

  // Configuration de la stratégie de rafraîchissement OHLC
  updateOHLCRefreshConfig(config: Partial<import('@/services/ohlcRefreshStrategy').OHLCRefreshConfig>) {
    this.ohlcRefreshStrategy.updateConfig(config);
    console.log('⚙️ Configuration de rafraîchissement OHLC mise à jour:', config);
  }

  // Obtenir la configuration de rafraîchissement OHLC
  getOHLCRefreshConfig() {
    return this.ohlcRefreshStrategy.getConfig();
  }

  // Forcer le rafraîchissement OHLC pour une paire
  forceOHLCRefresh(pair: string, analysisDateTime: string) {
    this.ohlcRefreshStrategy.forceRefresh(pair, analysisDateTime);
    console.log(`🔄 Rafraîchissement forcé pour ${pair}`);
  }

  /**
   * Obtient le prompt système avec cache
   */
  private getCachedSystemPrompt(): string {
    const systemPrompt = this.config.systemPrompt;
    const cacheKey = grokCacheService.getSystemPromptCacheKey(systemPrompt);
    
    // Vérifier si le prompt est en cache
    if (grokCacheService.isCached(cacheKey)) {
      console.log('💾 Utilisation du cache pour le prompt système');
      return grokCacheService.getCachedContent(cacheKey) || systemPrompt;
    } else {
      console.log('🔄 Mise en cache du prompt système');
      grokCacheService.cacheSystemPrompt(systemPrompt);
      return systemPrompt;
    }
  }
}

export default new GrokService();
