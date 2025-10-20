// Service d'abonnement: lecture des plans et gestion du plan utilisateur
// Les commentaires expliquent les interactions avec Supabase

import { supabase } from '@/integrations/supabase/client';

export interface PricingPlan {
  code: string;
  name: string;
  monthly_price_dollar: number; // prix mensuel en dollars
  token_per_month: number; // quota de tokens par mois
  is_active: boolean;
}

export interface UserSubscriptionView {
  user_email: string;
  plan_code: string;
  plan_name: string;
  token_per_month: number;
  monthly_price_dollar: number;
  current_month_analyses: number;
  month_cycle_start: string;
  started_at?: string;
}

class SubscriptionService {
  // Plan par défaut si l'utilisateur n'a pas encore d'abonnement
  getAssumedFreePlan(): UserSubscriptionView {
    return {
      user_email: '',
      plan_code: 'free',
      plan_name: 'Free',
      token_per_month: 850000,
      monthly_price_dollar: 0,
      current_month_analyses: 0,
      month_cycle_start: new Date().toISOString().slice(0, 10)
    };
  }

  // Récupère la liste des plans actifs
  async getPlans(): Promise<PricingPlan[]> {
    const { data, error } = await supabase
      .from('pricing_plans' as any)
      .select('code,name,monthly_price_dollar,token_per_month,is_active')
      .eq('is_active', true)
      .order('monthly_price_dollar', { ascending: true });
    if (error) throw error;
    return (data as PricingPlan[]) || [];
  }

  // Récupère l'abonnement actuel de l'utilisateur
  async getMySubscription(): Promise<UserSubscriptionView | null> {
    // Tenter d'inclure started_at via user_subscriptions join pricing_plans
    const { data, error } = await supabase
      .from('user_subscriptions' as any)
      .select(`
        user_email,
        plan_code,
        started_at,
        current_month_analyses,
        month_cycle_start,
        pricing_plans:pricing_plans!inner (
          code,
          name,
          token_per_month,
          monthly_price_dollar
        )
      `)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const mapped: UserSubscriptionView = {
      user_email: data.user_email,
      plan_code: data.plan_code,
      plan_name: data.pricing_plans?.name,
      token_per_month: data.pricing_plans?.token_per_month,
      monthly_price_dollar: data.pricing_plans?.monthly_price_dollar,
      current_month_analyses: data.current_month_analyses,
      month_cycle_start: data.month_cycle_start,
      started_at: data.started_at
    };
    return mapped;
  }

  // Récupère le plan utilisateur ou un FREE par défaut si absent
  async getMySubscriptionOrFree(): Promise<UserSubscriptionView> {
    const sub = await this.getMySubscription();
    return sub ?? this.getAssumedFreePlan();
  }

  // Vérifie le quota restant (true si OK pour consommer)
  async hasRemainingTokens(): Promise<{ ok: boolean; remaining: number; total: number; sub: UserSubscriptionView }>{
    const sub = await this.getMySubscriptionOrFree();
    const total = sub.token_per_month;
    const used = sub.current_month_analyses || 0;
    const remaining = Math.max(total - used, 0);
    return { ok: remaining > 0, remaining, total, sub };
  }

  // Change de plan via la fonction RPC sécurisée
  async changePlan(planCode: string): Promise<void> {
    const { error } = await supabase.rpc('fn_change_user_plan', {
      new_plan_code: planCode
    });
    if (error) throw error;
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;


