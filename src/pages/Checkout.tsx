import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  Star,
  Zap,
  Crown,
  Smartphone
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import subscriptionService, { PricingPlan } from '@/services/subscriptionService';
import { paymentService, PaymentData } from '@/services/paymentService';
import { manualPaymentService, ManualPaymentData } from '@/services/manualPaymentService';
import { convertToLocalCurrency, formatLocalCurrency, USSD_CONFIG } from '@/config/ussd';
import { useToast } from '@/hooks/use-toast';

// Interface pour les détails du plan sélectionné
interface CheckoutPlan extends PricingPlan {
  features: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  // États pour la gestion du checkout
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'automatic' | 'manual'>('manual');
  const [manualPayment, setManualPayment] = useState<ManualPaymentData | null>(null);

  // Récupérer le code du plan depuis l'URL
  const planCode = searchParams.get('plan');

  // Définir les fonctionnalités pour chaque plan
  const getPlanFeatures = (code: string): string[] => {
    switch (code) {
      case 'free':
        return [
          '850,000 tokens par mois',
          'Analyses de base',
          'Support par email',
          'Accès aux signaux RSI'
        ];
      case 'starter':
        return [
          '2,000,000 tokens par mois',
          'Analyses avancées',
          'Signaux en temps réel',
          'Support prioritaire',
          'Historique des analyses',
          'Notifications push'
        ];
      case 'pro':
        return [
          '5,000,000 tokens par mois',
          'Analyses premium',
          'Signaux en temps réel',
          'Support 24/7',
          'Historique illimité',
          'API access',
          'Analyses personnalisées',
          'Webhooks'
        ];
      default:
        return [];
    }
  };

  // Obtenir l'icône et la couleur du plan
  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'free':
        return <Zap className="w-6 h-6" />;
      case 'starter':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (code: string) => {
    switch (code) {
      case 'free':
        return 'text-blue-500';
      case 'starter':
        return 'text-green-500';
      case 'pro':
        return 'text-purple-500';
      default:
        return 'text-blue-500';
    }
  };

  // Charger les plans disponibles
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const availablePlans = await subscriptionService.getPlans();
        setPlans(availablePlans);
        
        // Trouver le plan sélectionné
        const plan = availablePlans.find(p => p.code === planCode);
        if (plan) {
          setSelectedPlan({
            ...plan,
            features: getPlanFeatures(plan.code),
            icon: getPlanIcon(plan.code),
            color: getPlanColor(plan.code),
            popular: plan.code === 'starter'
          });
        } else {
          setError('Plan non trouvé');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des plans');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [planCode]);

  // Gérer le processus de paiement
  const handlePayment = async () => {
    if (!selectedPlan || !user || !token) {
      toast({
        title: 'Erreur',
        description: 'Informations manquantes pour le paiement',
        variant: 'destructive'
      });
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Si c'est un plan gratuit, l'activer directement
      if (selectedPlan.monthly_price_dollar === 0) {
        await subscriptionService.changePlan(selectedPlan.code);
        toast({
          title: 'Plan activé !',
          description: `Votre plan ${selectedPlan.name} a été activé.`,
        });
        navigate('/settings');
        return;
      }

      // Paiement manuel
      if (paymentMethod === 'manual') {
        const manualPaymentData = await manualPaymentService.createManualPayment(
          user.email,
          selectedPlan.code,
          selectedPlan.name,
          selectedPlan.monthly_price_dollar,
          'USD'
        );
        
        setManualPayment(manualPaymentData);
        toast({
          title: 'Instructions de paiement générées !',
          description: 'Suivez les instructions ci-dessous pour effectuer le paiement.',
        });
        return;
      }

      // Paiement automatique (Vanilla Pay - désactivé pour l'instant)
      if (paymentMethod === 'automatic') {
        toast({
          title: 'Paiement automatique temporairement indisponible',
          description: 'Veuillez utiliser le paiement manuel pour le moment.',
          variant: 'destructive'
        });
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du traitement du paiement');
      toast({
        title: 'Erreur de paiement',
        description: err.message || 'Une erreur est survenue lors du paiement',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des informations de paiement...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !selectedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erreur</h1>
            <p className="text-muted-foreground mb-6">{error || 'Plan non trouvé'}</p>
            <Button onClick={() => navigate('/settings')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux paramètres
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <Button 
            onClick={() => navigate('/settings')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux paramètres
          </Button>
          <h1 className="text-3xl font-bold mb-2">Finaliser votre abonnement</h1>
          <p className="text-muted-foreground">
            Complétez votre paiement pour activer votre plan {selectedPlan.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Récapitulatif du plan */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-primary/10 ${selectedPlan.color}`}>
                  {selectedPlan.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    Plan {selectedPlan.name}
                    {selectedPlan.popular && (
                      <Badge className="bg-primary text-primary-foreground">
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    {selectedPlan.token_per_month.toLocaleString()} tokens par mois
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fonctionnalités incluses */}
              <div>
                <h3 className="font-semibold mb-3">Fonctionnalités incluses :</h3>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Détails de facturation */}
              <div className="space-y-2">
                <h3 className="font-semibold">Détails de facturation :</h3>
                <div className="flex justify-between text-sm">
                  <span>Abonnement mensuel</span>
                  <span className="font-semibold">
                    {selectedPlan.monthly_price_dollar === 0 
                      ? 'Gratuit' 
                      : `$${selectedPlan.monthly_price_dollar.toFixed(2)}/mois`
                    }
                  </span>
                </div>
                {selectedPlan.monthly_price_dollar > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Montant en {USSD_CONFIG.LOCAL_CURRENCY}</span>
                    <span>{formatLocalCurrency(convertToLocalCurrency(selectedPlan.monthly_price_dollar))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Renouvellement automatique</span>
                  <span>Non</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de paiement */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Paiement Mobile Money
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations utilisateur */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-semibold mb-2">Facturation pour :</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {/* Sélection de la méthode de paiement */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Méthode de paiement</label>
                  <div className="mt-2 space-y-2">
                    {/* Option Mobile Money Manuel */}
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'manual' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentMethod('manual')}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Mobile Money Manuel</span>
                            <Badge variant="default" className="text-xs">Recommandé</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Instructions de paiement par USSD
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === 'manual' 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`} />
                      </div>
                    </div>

                    {/* Option Mobile Money Automatique (désactivée) */}
                    <div 
                      className="p-4 border rounded-lg cursor-not-allowed opacity-50 bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Mobile Money Automatique</span>
                            <Badge variant="secondary" className="text-xs">Bientôt disponible</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Paiement automatique via Vanilla Pay
                          </p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Garanties de sécurité */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé via Mobile Money</span>
                </div>
              </div>

              {/* Bouton de paiement */}
              <Button 
                onClick={handlePayment}
                disabled={processing || selectedPlan.monthly_price_dollar === 0}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : selectedPlan.monthly_price_dollar === 0 ? (
                  'Activer le plan gratuit'
                ) : (
                  `Payer $${selectedPlan.monthly_price_dollar.toFixed(2)}/mois`
                )}
              </Button>

              {/* Informations de sécurité */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Paiement sécurisé via Mobile Money
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aucun renouvellement automatique - Paiement unique
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions de paiement manuel */}
        {manualPayment && (
          <Card className="glass-card border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                Instructions de paiement Mobile Money
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-semibold mb-2">Étapes à suivre :</h3>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Composez le code USSD suivant sur votre téléphone :</li>
                </ol>
              </div>
              
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Code USSD à composer :</p>
                  <code className="text-lg font-mono font-bold text-primary bg-background px-4 py-2 rounded border">
                    {manualPayment.mobile_money_code}
                  </code>
                </div>
              </div>

              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-warning mb-1">Important :</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Votre ID de paiement : <strong>{manualPayment.payment_id}</strong></li>
                      <li>• Montant à payer : <strong>${selectedPlan?.monthly_price_dollar.toFixed(2)} ({formatLocalCurrency(convertToLocalCurrency(selectedPlan?.monthly_price_dollar || 0))})</strong></li>
                      <li>• Vérification : 5 à 15 minutes</li>
                      <li>• Expire le : <strong>{new Date(manualPayment.expires_at).toLocaleString('fr-FR')}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(manualPayment.mobile_money_code);
                    toast({
                      title: 'Code copié !',
                      description: 'Le code USSD a été copié dans le presse-papiers.',
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Copier le code
                </Button>
                <Button 
                  onClick={() => setManualPayment(null)}
                  variant="ghost"
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avertissement d'erreur */}
        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Erreur de paiement</span>
            </div>
            <p className="text-sm text-destructive mt-1">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
