// Service de cache pour optimiser les tokens Grok
import { AnalysisHistoryItem } from './analysisHistoryService';

export interface CacheEntry {
  id: string;
  content: string;
  hash: string;
  timestamp: number;
  tokenCount?: number;
  type: 'analysis' | 'ohlc' | 'context' | 'conversation' | 'system_prompt';
}

export interface CacheStats {
  totalEntries: number;
  totalTokensSaved: number;
  hitRate: number;
  lastCleanup: number;
}

class GrokCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private maxCacheSize: number = 100; // Nombre maximum d'entrées
  private maxAge: number = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  private stats: CacheStats = {
    totalEntries: 0,
    totalTokensSaved: 0,
    hitRate: 0,
    lastCleanup: Date.now()
  };

  /**
   * Génère un hash MD5 simple pour identifier le contenu
   */
  private generateHash(content: string): string {
    // Hash simple basé sur le contenu
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Estime le nombre de tokens d'un contenu
   */
  private estimateTokens(content: string): number {
    // Estimation approximative : 1 token ≈ 4 caractères
    return Math.ceil(content.length / 4);
  }

  /**
   * Génère une clé de cache basée sur le type et les paramètres
   */
  private generateCacheKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${type}:${sortedParams}`;
  }

  /**
   * Vérifie si une entrée de cache est valide
   */
  private isValidEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < this.maxAge;
  }

  /**
   * Nettoie le cache des entrées expirées
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidEntry(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    this.stats.lastCleanup = now;
    
    console.log(`🧹 Cache nettoyé: ${expiredKeys.length} entrées expirées supprimées`);
  }

  /**
   * Gère la taille du cache en supprimant les entrées les plus anciennes
   */
  private manageCacheSize(): void {
    if (this.cache.size <= this.maxCacheSize) return;

    // Trier par timestamp et supprimer les plus anciens
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
    
    console.log(`📦 Cache redimensionné: ${toRemove.length} entrées supprimées`);
  }

  /**
   * Met en cache le contenu d'une analyse
   */
  cacheAnalysis(analysisId: string, analysis: AnalysisHistoryItem, content: string): string {
    const hash = this.generateHash(content);
    const key = this.generateCacheKey('analysis', { analysisId, hash });
    
    const entry: CacheEntry = {
      id: key,
      content,
      hash,
      timestamp: Date.now(),
      tokenCount: this.estimateTokens(content),
      type: 'analysis'
    };

    this.cache.set(key, entry);
    this.manageCacheSize();
    
    console.log(`💾 Analyse mise en cache: ${analysisId} (${entry.tokenCount} tokens estimés)`);
    return key;
  }

  /**
   * Met en cache les données OHLC
   */
  cacheOHLCData(pair: string, analysisDateTime: string, content: string): string {
    const hash = this.generateHash(content);
    const key = this.generateCacheKey('ohlc', { pair, analysisDateTime, hash });
    
    const entry: CacheEntry = {
      id: key,
      content,
      hash,
      timestamp: Date.now(),
      tokenCount: this.estimateTokens(content),
      type: 'ohlc'
    };

    this.cache.set(key, entry);
    this.manageCacheSize();
    
    console.log(`💾 Données OHLC mises en cache: ${pair} (${entry.tokenCount} tokens estimés)`);
    return key;
  }

  /**
   * Met en cache le contexte complet
   */
  cacheContext(analysisId: string, contextSettings: any, content: string): string {
    const hash = this.generateHash(content);
    const key = this.generateCacheKey('context', { analysisId, settings: JSON.stringify(contextSettings), hash });
    
    const entry: CacheEntry = {
      id: key,
      content,
      hash,
      timestamp: Date.now(),
      tokenCount: this.estimateTokens(content),
      type: 'context'
    };

    this.cache.set(key, entry);
    this.manageCacheSize();
    
    console.log(`💾 Contexte mis en cache: ${analysisId} (${entry.tokenCount} tokens estimés)`);
    return key;
  }

  /**
   * Récupère le contenu depuis le cache
   */
  getCachedContent(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }

    if (!this.isValidEntry(entry)) {
      this.cache.delete(key);
      console.log(`⏰ Cache expiré: ${key}`);
      return null;
    }

    console.log(`✅ Cache hit: ${key} (${entry.tokenCount} tokens économisés)`);
    this.stats.totalTokensSaved += entry.tokenCount || 0;
    return entry.content;
  }

  /**
   * Vérifie si du contenu est en cache
   */
  isCached(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? this.isValidEntry(entry) : false;
  }

  /**
   * Génère une clé de cache pour l'analyse
   */
  getAnalysisCacheKey(analysisId: string, content: string): string {
    const hash = this.generateHash(content);
    return this.generateCacheKey('analysis', { analysisId, hash });
  }

  /**
   * Génère une clé de cache pour les données OHLC
   */
  getOHLCCacheKey(pair: string, analysisDateTime: string, content: string): string {
    const hash = this.generateHash(content);
    return this.generateCacheKey('ohlc', { pair, analysisDateTime, hash });
  }

  /**
   * Génère une clé de cache pour le contexte
   */
  getContextCacheKey(analysisId: string, contextSettings: any, content: string): string {
    const hash = this.generateHash(content);
    return this.generateCacheKey('context', { analysisId, settings: JSON.stringify(contextSettings), hash });
  }

  /**
   * Met en cache le prompt système
   */
  cacheSystemPrompt(prompt: string): string {
    const hash = this.generateHash(prompt);
    const key = this.generateCacheKey('system_prompt', { hash });
    
    const entry: CacheEntry = {
      id: key,
      content: prompt,
      hash,
      timestamp: Date.now(),
      tokenCount: this.estimateTokens(prompt),
      type: 'system_prompt'
    };

    this.cache.set(key, entry);
    this.manageCacheSize();
    
    console.log(`💾 Prompt système mis en cache (${entry.tokenCount} tokens estimés)`);
    return key;
  }

  /**
   * Génère une clé de cache pour le prompt système
   */
  getSystemPromptCacheKey(prompt: string): string {
    const hash = this.generateHash(prompt);
    return this.generateCacheKey('system_prompt', { hash });
  }

  /**
   * Met à jour les données OHLC existantes dans le cache
   */
  updateOHLCData(pair: string, analysisDateTime: string, newContent: string): string {
    // Supprimer l'ancienne entrée si elle existe
    const oldKey = this.getOHLCCacheKey(pair, analysisDateTime, '');
    this.cache.delete(oldKey);
    
    // Créer une nouvelle entrée avec les données mises à jour
    return this.cacheOHLCData(pair, analysisDateTime, newContent);
  }

  /**
   * Vérifie si des données OHLC existent pour une paire et date
   */
  hasOHLCData(pair: string, analysisDateTime: string): boolean {
    const entries = Array.from(this.cache.values());
    return entries.some(entry => 
      entry.type === 'ohlc' && 
      entry.id.includes(pair) && 
      entry.id.includes(analysisDateTime)
    );
  }

  /**
   * Nettoie le cache manuellement
   */
  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalEntries: 0,
      totalTokensSaved: 0,
      hitRate: 0,
      lastCleanup: Date.now()
    };
    console.log('🗑️ Cache vidé');
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): CacheStats {
    this.cleanupCache();
    this.stats.totalEntries = this.cache.size;
    return { ...this.stats };
  }

  /**
   * Obtient toutes les entrées du cache
   */
  getAllEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * Supprime une entrée spécifique du cache
   */
  removeEntry(key: string): boolean {
    return this.cache.delete(key);
  }
}

const grokCacheService = new GrokCacheService();
export default grokCacheService;
