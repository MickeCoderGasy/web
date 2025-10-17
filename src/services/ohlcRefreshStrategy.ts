// Stratégie de rafraîchissement intelligent pour les données OHLC
export interface OHLCRefreshConfig {
  enabled: boolean;
  refreshInterval: number; // en millisecondes
  maxCacheAge: number; // en millisecondes
  forceRefreshOnNewMinute: boolean;
}

export interface OHLCRefreshState {
  lastRefresh: number;
  lastMinute: number;
  isRefreshing: boolean;
}

class OHLCRefreshStrategy {
  private config: OHLCRefreshConfig;
  private state: Map<string, OHLCRefreshState> = new Map();

  constructor(config: OHLCRefreshConfig) {
    this.config = config;
  }

  /**
   * Détermine si les données OHLC doivent être rafraîchies
   */
  shouldRefresh(pair: string, analysisDateTime: string): boolean {
    const key = `${pair}:${analysisDateTime}`;
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000); // Minute actuelle
    
    // État pour cette paire/date
    let state = this.state.get(key);
    if (!state) {
      state = {
        lastRefresh: 0,
        lastMinute: 0,
        isRefreshing: false
      };
      this.state.set(key, state);
    }

    // Vérifier si on est dans une nouvelle minute
    const isNewMinute = currentMinute > state.lastMinute;
    
    // Vérifier l'âge du cache
    const cacheAge = now - state.lastRefresh;
    const isCacheExpired = cacheAge > this.config.maxCacheAge;
    
    // Vérifier l'intervalle de rafraîchissement
    const isRefreshIntervalPassed = cacheAge > this.config.refreshInterval;
    
    // Conditions de rafraîchissement
    const shouldRefresh = 
      this.config.enabled && (
        state.lastRefresh === 0 || // Première fois
        isCacheExpired || // Cache expiré
        (this.config.forceRefreshOnNewMinute && isNewMinute) || // Nouvelle minute
        isRefreshIntervalPassed // Intervalle passé
      );

    if (shouldRefresh) {
      state.lastRefresh = now;
      state.lastMinute = currentMinute;
      state.isRefreshing = true;
    }

    return shouldRefresh;
  }

  /**
   * Marque le rafraîchissement comme terminé
   */
  markRefreshComplete(pair: string, analysisDateTime: string): void {
    const key = `${pair}:${analysisDateTime}`;
    const state = this.state.get(key);
    if (state) {
      state.isRefreshing = false;
    }
  }

  /**
   * Obtient l'état de rafraîchissement pour une paire
   */
  getRefreshState(pair: string, analysisDateTime: string): OHLCRefreshState | null {
    const key = `${pair}:${analysisDateTime}`;
    return this.state.get(key) || null;
  }

  /**
   * Force le rafraîchissement pour une paire
   */
  forceRefresh(pair: string, analysisDateTime: string): void {
    const key = `${pair}:${analysisDateTime}`;
    const state = this.state.get(key);
    if (state) {
      state.lastRefresh = 0; // Forcer le rafraîchissement
    }
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<OHLCRefreshConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): OHLCRefreshConfig {
    return { ...this.config };
  }
}

// Configuration par défaut
export const defaultOHLCRefreshConfig: OHLCRefreshConfig = {
  enabled: true,
  refreshInterval: 300000, // 5 minute
  maxCacheAge: 900000, // 5 minutes
  forceRefreshOnNewMinute: true
};

export default OHLCRefreshStrategy;
