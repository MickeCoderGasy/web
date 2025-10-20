// Service pour les paiements manuels Mobile Money
// Gère la création et la vérification des paiements manuels

import { supabase } from '@/integrations/supabase/client';

export interface ManualPaymentData {
  payment_id: string;
  mobile_money_code: string;
  expires_at: string;
}

export interface ManualPayment {
  id: string;
  payment_id: string;
  user_email: string;
  plan_code: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'expired' | 'cancelled' | 'refused';
  mobile_money_code: string;
  created_at: string;
  expires_at: string;
  verified_at?: string;
  verified_by?: string;
  notes?: string;
}

class ManualPaymentService {
  // Créer un paiement manuel
  async createManualPayment(
    userEmail: string,
    planCode: string,
    planName: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<ManualPaymentData> {
    try {
      const { data, error } = await supabase.rpc('create_manual_payment', {
        p_user_email: userEmail,
        p_plan_code: planCode,
        p_plan_name: planName,
        p_amount: amount,
        p_currency: currency
      });

      if (error) {
        console.error('Erreur lors de la création du paiement manuel:', error);
        throw new Error(error.message || 'Erreur lors de la création du paiement');
      }

      if (!data || data.length === 0) {
        throw new Error('Aucune donnée retournée par la fonction create_manual_payment');
      }

      return {
        payment_id: data[0].payment_id,
        mobile_money_code: data[0].mobile_money_code,
        expires_at: data[0].expires_at
      };
    } catch (error: any) {
      console.error('Erreur dans createManualPayment:', error);
      throw error;
    }
  }

  // Récupérer les paiements manuels de l'utilisateur
  async getUserManualPayments(userEmail: string): Promise<ManualPayment[]> {
    try {
      const { data, error } = await supabase
        .from('manual_payments')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des paiements:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des paiements');
      }

      return data || [];
    } catch (error: any) {
      console.error('Erreur dans getUserManualPayments:', error);
      throw error;
    }
  }

  // Récupérer un paiement manuel par son ID
  async getManualPayment(paymentId: string): Promise<ManualPayment | null> {
    try {
      const { data, error } = await supabase
        .from('manual_payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Paiement non trouvé
        }
        console.error('Erreur lors de la récupération du paiement:', error);
        throw new Error(error.message || 'Erreur lors de la récupération du paiement');
      }

      return data;
    } catch (error: any) {
      console.error('Erreur dans getManualPayment:', error);
      throw error;
    }
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(paymentId: string): Promise<ManualPayment | null> {
    return await this.getManualPayment(paymentId);
  }

  // Annuler un paiement (pour l'utilisateur)
  async cancelPayment(paymentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('manual_payments')
        .update({ status: 'cancelled' })
        .eq('payment_id', paymentId)
        .eq('status', 'pending'); // Seuls les paiements en attente peuvent être annulés

      if (error) {
        console.error('Erreur lors de l\'annulation du paiement:', error);
        throw new Error(error.message || 'Erreur lors de l\'annulation du paiement');
      }

      return true;
    } catch (error: any) {
      console.error('Erreur dans cancelPayment:', error);
      throw error;
    }
  }

  // Refuser un paiement (pour l'admin)
  async refusePayment(paymentId: string, refusedBy: string, reason?: string): Promise<boolean> {
    try {
      console.log('Tentative de refus du paiement:', paymentId);
      
      const { data, error } = await supabase.rpc('refuse_manual_payment', {
        p_payment_id: paymentId,
        p_refused_by: refusedBy,
        p_reason: reason || null
      });

      if (error) {
        console.error('Erreur lors du refus du paiement:', error);
        throw new Error(error.message || 'Erreur lors du refus du paiement');
      }

      console.log('Paiement refusé avec succès:', data);
      return data;
    } catch (error: any) {
      console.error('Erreur dans refusePayment:', error);
      throw error;
    }
  }

  // Vérifier un paiement (pour l'admin)
  async verifyPayment(paymentId: string, verifiedBy: string): Promise<{ success: boolean; paymentInfo?: any; message?: string }> {
    try {
      console.log('Tentative de vérification du paiement:', paymentId);
      
      // Utiliser la fonction complète qui gère tout
      const { data, error } = await supabase.rpc('complete_payment_verification', {
        p_payment_id: paymentId,
        p_verified_by: verifiedBy
      });

      if (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        throw new Error(error.message || 'Erreur lors de la vérification du paiement');
      }

      console.log('Résultat de la vérification complète:', data);

      if (data && data.length > 0) {
        const result = data[0];
        return {
          success: result.success,
          message: result.message,
          paymentInfo: {
            user_email: result.user_email,
            plan_code: result.plan_code
          }
        };
      } else {
        return { success: false, message: 'Aucune donnée retournée' };
      }
    } catch (error: any) {
      console.error('Erreur dans verifyPayment:', error);
      throw error;
    }
  }

  // Récupérer tous les paiements (pour l'admin)
  async getAllPayments(): Promise<ManualPayment[]> {
    try {
      const { data, error } = await supabase
        .from('manual_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération de tous les paiements:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des paiements');
      }

      return data || [];
    } catch (error: any) {
      console.error('Erreur dans getAllPayments:', error);
      throw error;
    }
  }

  // Récupérer les paiements en attente (pour l'admin)
  async getPendingPayments(): Promise<ManualPayment[]> {
    try {
      const { data, error } = await supabase
        .from('manual_payments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des paiements en attente:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des paiements');
      }

      return data || [];
    } catch (error: any) {
      console.error('Erreur dans getPendingPayments:', error);
      throw error;
    }
  }
}

// Instance singleton du service
export const manualPaymentService = new ManualPaymentService();
export default manualPaymentService;
