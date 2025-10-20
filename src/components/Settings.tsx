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

      {/* Section Usage - Statistiques des Tokens */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Utilisation des Tokens
            <Badge variant="outline" className="ml-auto">
              {tokenStats.usagePercentage.toFixed(1)}% utilisé
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barre de progression principale */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilisation totale</span>
              <span className="text-sm text-muted-foreground">
                {formatNumber(tokenStats.totalTokens)} / {formatNumber(tokenStats.maxTokens)} tokens
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={tokenStats.usagePercentage} 
                className="h-3"
              />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(tokenStats.usagePercentage)}`}
                style={{ width: `${tokenStats.usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>2.5M</span>
              <span>5M</span>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Tokens d'entrée</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(tokenStats.totalInputTokens)}
              </div>
             
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Tokens de sortie</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(tokenStats.totalOutputTokens)}
              </div>
            
            </div>

          </div>

          {/* Informations supplémentaires */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Informations sur l'utilisation</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dernière mise à jour:</span>
                <span className="ml-2 font-medium">{formatDate(tokenStats.lastUpdated)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Note:</span>
                <span className="ml-2 font-medium">5M tokens ≈ 94 requêtes d'analyse (53K tokens par requête)</span>
              </div>
            </div>
          </div>
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
