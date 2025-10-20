import { GROK_SYSTEM_PROMPT } from './grok-prompt.js';
import { GROK_SYSTEM_PROMPT_OPTIMIZED } from './grok-prompt-optimized.js';

// Configuration pour l'intégration Grok LLM
export interface GrokConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

// Configuration par défaut pour Grok
export const defaultGrokConfig: GrokConfig = {
  apiKey: import.meta.env.VITE_GROK_API_KEY || '',
  model: 'grok-4-fast',
  baseUrl: 'https://api.x.ai/v1',
  maxTokens: 1000,
  temperature: 0.7,
  systemPrompt: GROK_SYSTEM_PROMPT_OPTIMIZED // Utiliser la version optimisée par défaut
};

// Prompts spécialisés pour différents contextes
export const tradingPrompts = {
  marketAnalysis: `
    Analyse le marché actuel en te basant sur :
    - Les données techniques fournies
    - L'historique des trades de l'utilisateur
    - Les conditions macro-économiques
    - Les niveaux de support/résistance clés
    
    Fournis une analyse structurée avec :
    1. Vue d'ensemble du marché
    2. Facteurs techniques importants
    3. Facteurs fondamentaux à surveiller
    4. Niveaux clés à surveiller
    5. Recommandations de trading
  `,
  
  tradeHistoryAnalysis: `
    Analyse l'historique des trades de l'utilisateur pour :
    - Identifier les patterns de trading
    - Évaluer la performance
    - Suggérer des améliorations
    - Recommander des ajustements de stratégie
    
    Inclus :
    - Analyse des trades gagnants/perdants
    - Patterns de timing
    - Gestion du risque
    - Suggestions d'amélioration
  `,
  
  riskManagement: `
    Fournis des conseils de gestion du risque basés sur :
    - Le profil de risque de l'utilisateur
    - Les conditions de marché actuelles
    - L'historique de trading
    - Les objectifs financiers
    
    Couvre :
    - Position sizing
    - Stop losses
    - Take profits
    - Diversification
    - Gestion émotionnelle
  `
};

// Types de contexte disponibles
export type ContextType = 'tradeHistory' | 'marketData' | 'news' | 'custom' | 'none';

export interface ContextSettings {
  enabled: boolean;
  selectedAnalysisId: string | null;
  maxHistoryItems: number;
}

export const defaultContextSettings: ContextSettings = {
  enabled: true,
  selectedAnalysisId: null,
  maxHistoryItems: 20
};

// Fonction pour obtenir le prompt système
export const getSystemPrompt = (): string => {
  return GROK_SYSTEM_PROMPT;
};

// Fonction pour obtenir le prompt système optimisé
export const getOptimizedSystemPrompt = (): string => {
  return GROK_SYSTEM_PROMPT_OPTIMIZED;
};

// Fonction pour basculer entre les prompts
export const getSystemPromptByType = (type: 'full' | 'optimized' = 'optimized'): string => {
  return type === 'full' ? GROK_SYSTEM_PROMPT : GROK_SYSTEM_PROMPT_OPTIMIZED;
};