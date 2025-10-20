// API endpoints pour la gestion des paiements
// Utilise votre backend existant sur api.qubextai-site.com

import { paymentService, PaymentData } from '@/services/paymentService';

// Initialiser un paiement via votre API backend
export async function initiatePayment(paymentData: PaymentData) {
  try {
    // Utiliser le service de paiement qui appelle votre API backend
    const response = await paymentService.initiatePayment(paymentData);
    return response;
  } catch (error: any) {
    console.error('Erreur API payment:', error);
    throw error;
  }
}

// Vérifier le statut d'un paiement via votre API backend
export async function checkPaymentStatus(paymentId: string) {
  try {
    const response = await paymentService.checkPaymentStatus(paymentId);
    return response;
  } catch (error: any) {
    console.error('Erreur API status:', error);
    throw error;
  }
}

// Confirmer un paiement via votre API backend
export async function confirmPayment(paymentId: string) {
  try {
    const response = await paymentService.handlePaymentCallback(paymentId, 'success');
    return {
      success: response,
      message: response ? 'Paiement confirmé avec succès' : 'Erreur lors de la confirmation'
    };
  } catch (error: any) {
    console.error('Erreur API confirm:', error);
    throw error;
  }
}
