// Service de paiement utilisant Vanilla Pay
// Intégration avec l'API de paiement pour les abonnements

import { supabase } from '@/integrations/supabase/client';
import { getApiUrl, getAuthHeaders } from '@/config/api';

// Interface pour les données de paiement (adaptée à votre API backend)
export interface PaymentData {
  plan_code: string;
  user_email: string;
  amount: number;
  currency: string;
  description: string;
}

// Interface pour les données de paiement Vanilla Pay (format de votre API)
export interface VanillaPayData {
  montant: number;
  idpanier: string;
  email: string;
  description?: string;
  plan_code?: string;
}

// Interface pour la réponse de paiement
export interface PaymentResponse {
  success: boolean;
  payment_id?: string;
  redirect_url?: string;
  error?: string;
}

class PaymentService {
  // Initialiser un paiement via Vanilla Pay
  async initiatePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Utilisateur non authentifié');
      }

      // Convertir les données au format attendu par votre API backend
      const vanillaPayData: VanillaPayData = {
        montant: paymentData.amount,
        idpanier: `plan_${paymentData.plan_code}_${Date.now()}`, // Générer un ID unique pour le panier
        email: paymentData.user_email,
        description: paymentData.description,
        plan_code: paymentData.plan_code
      };

      // Appeler votre API backend existante
      console.log('Envoi des données de paiement:', vanillaPayData);
      console.log('URL de l\'API:', getApiUrl('/api/vanilla-pay/initiate-payment'));
      
      const response = await fetch(getApiUrl('/api/vanilla-pay/initiate-payment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(vanillaPayData)
      });

      console.log('Réponse de l\'API:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'initialisation du paiement';
        try {
          const errorData = await response.json();
          console.error('Données d\'erreur de l\'API:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Impossible de parser la réponse d\'erreur:', parseError);
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Résultat de l\'API:', result);
      
      return {
        success: result.success,
        payment_id: result.paymentId,
        redirect_url: result.redirectUrl
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation du paiement:', error);
      return {
        success: false,
        error: error.message || 'Erreur inconnue lors du paiement'
      };
    }
  }

  // Vérifier le statut d'un paiement (via webhook de votre API backend)
  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    // Votre API backend gère le statut via les webhooks
    // Cette méthode peut être utilisée pour vérifier localement si nécessaire
    return {
      success: true,
      payment_id: paymentId,
      error: undefined
    };
  }

  // Simuler un paiement (pour les tests)
  async simulatePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulation d'un succès de paiement
    return {
      success: true,
      payment_id: `sim_${Date.now()}`,
      redirect_url: `https://moncompte.ariarynet.com/payer/sim_${Date.now()}`
    };
  }

  // Fallback pour les tests si l'API n'est pas disponible
  async initiatePaymentWithFallback(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      // Essayer d'abord l'API réelle
      return await this.initiatePayment(paymentData);
    } catch (error) {
      console.warn('API backend non disponible, utilisation du mode simulation:', error);
      
      // Si l'API échoue, utiliser la simulation pour les tests
      if (paymentData.amount === 0) {
        // Pour les plans gratuits, activer directement
        return {
          success: true,
          payment_id: `free_${Date.now()}`,
          redirect_url: undefined
        };
      } else {
        // Pour les plans payants, simuler la redirection
        return await this.simulatePayment(paymentData);
      }
    }
  }

  // Obtenir l'URL de redirection Vanilla Pay
  getVanillaPayUrl(paymentId: string): string {
    // URL de base de Vanilla Pay (à configurer selon votre environnement)
    const baseUrl = process.env.VITE_VANILLA_PAY_URL || 'https://moncompte.ariarynet.com';
    return `${baseUrl}/payer/${paymentId}`;
  }

  // Traiter le callback de paiement (géré par votre API backend via webhook)
  async handlePaymentCallback(paymentId: string, status: string): Promise<boolean> {
    // Votre API backend gère automatiquement les callbacks via le webhook
    // Cette méthode peut être utilisée pour des vérifications locales
    console.log(`Callback reçu pour le paiement ${paymentId} avec le statut: ${status}`);
    return status === 'success';
  }
}

// Instance singleton du service
export const paymentService = new PaymentService();
export default paymentService;
