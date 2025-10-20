import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Info,
  Clock,
  BarChart3,
  Zap,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import tokenUsageService from '@/services/tokenUsageService';
import { changePassword, sendPasswordResetEmail } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import subscriptionService from '@/services/subscriptionService';

// Interface pour les statistiques de tokens
interface TokenUsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  maxTokens: number; // 5M tokens
  usagePercentage: number;
  lastUpdated: number;
}



export function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokenStats, setTokenStats] = useState<TokenUsageStats>({
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    maxTokens: 5000000, // 5M tokens
    usagePercentage: 0,
    lastUpdated: Date.now()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Abonnement
  const [plans, setPlans] = useState<any[]>([]);
  const [mySub, setMySub] = useState<any | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Charger les statistiques
  useEffect(() => {
    if (user?.email) {
      loadStats();
    }
  }, [user?.email]);


  const loadStats = async () => {
    try {
      console.log('🔄 Chargement des statistiques...');
      setLoading(true);
      setError(null);
      
      if (!user?.email) {
        console.log('❌ Email utilisateur non disponible');
        setError('Email utilisateur non disponible');
        return;
      }

      console.log('👤 Utilisateur:', user.email);

      // Récupérer les statistiques de tokens depuis Supabase
      const realTokenStats = await tokenUsageService.getTokenUsageStats(user.email);
      console.log('📊 Statistiques récupérées:', realTokenStats);
      setTokenStats(realTokenStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des statistiques. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les plans et l'abonnement utilisateur
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlanLoading(true);
        setPlanError(null);
        const p = await subscriptionService.getPlans();
        const s = await subscriptionService.getMySubscription();
        setPlans(p);
        setMySub(s);
      } catch (e: any) {
        setPlanError(e.message || 'Erreur lors du chargement des plans');
      } finally {
        setPlanLoading(false);
      }
    };
    if (user?.email) loadPlans();
  }, [user?.email]);

  // Formater les nombres
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };


  // Formater la date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  // Obtenir la couleur de la barre selon l'utilisation
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };


  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement des paramètres...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadStats} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos préférences et consultez l'utilisation des ressources
          </p>
        </div>
      </div>

      {/* Section Plan et Quota */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Plan et Quota
            {mySub?.plan_name && (
              <Badge variant="outline" className="ml-2">{mySub.plan_name}</Badge>
            )}
            {mySub && (
              <Badge variant="outline" className="ml-auto">
                {Math.min(
                  mySub.token_per_month > 0 
                    ? (tokenStats.totalTokens / mySub.token_per_month) * 100 
                    : 0,
                  100
                ).toFixed(1)}% utilisé
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barre de progression principale (quota mensuel) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quota mensuel</span>
              {mySub ? (
                <span className="text-sm text-muted-foreground">
                  {tokenStats.totalTokens.toLocaleString()} / {mySub.token_per_month.toLocaleString()} tokens
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <div className="relative">
              <Progress
                value={mySub && mySub.token_per_month > 0 
                  ? (tokenStats.totalTokens / mySub.token_per_month) * 100 
                  : 0}
                className="h-3"
              />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(
                  mySub && mySub.token_per_month > 0 
                    ? (tokenStats.totalTokens / mySub.token_per_month) * 100 
                    : 0
                )}`}
                style={{ width: `${mySub && mySub.token_per_month > 0 
                  ? (tokenStats.totalTokens / mySub.token_per_month) * 100 
                  : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{mySub ? Math.round(mySub.token_per_month / 2).toLocaleString() : '—'}</span>
              <span>{mySub ? mySub.token_per_month.toLocaleString() : '—'}</span>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Plan actuel</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {mySub?.plan_name || '—'}
              </div>
             
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Restant ce mois-ci</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {mySub ? Math.max(mySub.token_per_month - tokenStats.totalTokens, 0).toLocaleString() : '—'}
              </div>
            
            </div>

          </div>

          {/* Informations supplémentaires */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Informations sur l'abonnement</span>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cycle courant:</span>
                  <span className="ml-2 font-medium">
                    {(() => {
                      if (!mySub) return '—';
                      const start = new Date(mySub.started_at || mySub.month_cycle_start);
                      const end = new Date(start);
                      end.setDate(end.getDate() + 30);
                      return `${start.toLocaleDateString('fr-FR')} → ${end.toLocaleDateString('fr-FR')} (début d'abonnement + 30 jours)`;
                    })()}
                  </span>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>


      {/* Section Abonnement */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Abonnement
            {mySub?.plan_code && (
              <Badge variant="outline" className="ml-2">{mySub.plan_name}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {planLoading ? (
            <div className="text-sm text-muted-foreground">Chargement des plans…</div>
          ) : planError ? (
            <div className="text-sm text-destructive">{planError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isCurrent = mySub?.plan_code === p.code;
                return (
                  <div key={p.code} className={`p-4 rounded-lg border ${isCurrent ? 'border-primary' : 'border-border/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{p.name}</div>
                      <Badge variant={isCurrent ? 'default' : 'outline'}>
                        {p.token_per_month.toLocaleString()} tokens / mois
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {p.code === 'free'
                        ? '0 $ / mois — Découverte / test'
                        : p.code === 'starter'
                        ? '14,99 $ / mois — Traders occasionnels'
                        : '49 $ / mois — Traders actifs / réguliers'}
                    </div>
                    <Button
                      className="mt-3 w-full"
                      variant={isCurrent ? 'outline' : 'default'}
                      disabled={isCurrent}
                      onClick={async () => {
                        try {
                          await subscriptionService.changePlan(p.code);
                          const s = await subscriptionService.getMySubscription();
                          setMySub(s);
                          toast({ title: 'Abonnement mis à jour', description: `Plan ${p.name} activé.` });
                        } catch (e: any) {
                          setPlanError(e.message || 'Impossible de changer de plan');
                        }
                      }}
                    >
                      {isCurrent ? 'Plan actuel' : 'Choisir ce plan'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {mySub && (
            <div className="text-xs text-muted-foreground">
              Usage: {mySub.current_month_analyses} / {mySub.token_per_month.toLocaleString()} tokens ce mois-ci
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Utilisateur */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Informations du Compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="font-medium">{user?.email || 'Utilisateur'}</div>
                <div className="text-sm text-muted-foreground">
                  Membre depuis {new Date().getFullYear()}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-medium">{user?.email || 'Non disponible'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Statut:</span>
                <Badge variant="outline" className="ml-2">Actif</Badge>
              </div>
            </div>

            {/* Changement de mot de passe */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Changer le mot de passe</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Mot de passe actuel</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Confirmer le mot de passe</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  disabled={isChangingPassword}
                  onClick={async () => {
                    try {
                      if (!user?.email) throw new Error('Utilisateur non connecté');
                      if (!currentPassword || !newPassword) throw new Error('Champs requis manquants');
                      if (newPassword !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas');
                      setIsChangingPassword(true);
                      await changePassword(user.email, currentPassword, newPassword);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      toast({ title: 'Mot de passe modifié', description: 'Votre mot de passe a été mis à jour.' });
                    } catch (err: any) {
                      toast({ title: 'Erreur', description: err.message || 'Impossible de changer le mot de passe', variant: 'destructive' });
                    } finally {
                      setIsChangingPassword(false);
                    }
                  }}
                  size="sm"
                >
                  {isChangingPassword ? 'Modification…' : 'Modifier le mot de passe'}
                </Button>
                <Button
                  variant="outline"
                  disabled={isSendingReset}
                  onClick={async () => {
                    try {
                      if (!user?.email) throw new Error('Utilisateur non connecté');
                      setIsSendingReset(true);
                      const redirectTo = `${window.location.origin}/reset-password`;
                      await sendPasswordResetEmail(user.email, redirectTo);
                      toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
                    } catch (err: any) {
                      toast({ title: 'Erreur', description: err.message || 'Impossible d\'envoyer l\'email', variant: 'destructive' });
                    } finally {
                      setIsSendingReset(false);
                    }
                  }}
                  size="sm"
                >
                  {isSendingReset ? 'Envoi…' : 'Mot de passe oublié ?'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
