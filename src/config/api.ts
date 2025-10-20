// Configuration de l'API backend
// Centralise l'URL de base de l'API

export const API_CONFIG = {
  // URL de base de votre API backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.qubextai.tech',
  
  // Endpoints de paiement (adaptés à votre API backend)
  PAYMENT: {
    INITIATE: '/api/vanilla-pay/initiate-payment',
    NOTIFICATION: '/api/vanilla-pay/notification',
    WEBHOOK: '/api/vanilla-pay/notification'
  },
  
  // Endpoints d'abonnement
  SUBSCRIPTION: {
    PLANS: '/subscription/plans',
    USER_SUBSCRIPTION: '/subscription/user',
    CHANGE_PLAN: '/subscription/change-plan'
  }
};

// Fonction utilitaire pour construire les URLs complètes
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction utilitaire pour les headers d'authentification
export const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});
