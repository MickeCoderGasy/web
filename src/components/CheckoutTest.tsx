// Composant de test pour la fonctionnalité de checkout
// Permet de tester les différents scénarios de paiement

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CreditCard, TestTube, CheckCircle } from 'lucide-react';

export function CheckoutTest() {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<string[]>([]);

  // Plans de test
  const testPlans = [
    {
      code: 'free',
      name: 'Free',
      price: 0,
      tokens: 850000,
      description: 'Plan gratuit pour les tests'
    },
    {
      code: 'starter',
      name: 'Starter',
      price: 14.99,
      tokens: 2000000,
      description: 'Plan payant de base'
    },
    {
      code: 'pro',
      name: 'Pro',
      price: 49.00,
      tokens: 5000000,
      description: 'Plan payant premium'
    }
  ];

  // Tester la navigation vers checkout
  const testCheckoutNavigation = (planCode: string) => {
    const plan = testPlans.find(p => p.code === planCode);
    if (plan) {
      setTestResults(prev => [...prev, `✅ Navigation vers checkout pour le plan ${plan.name}`]);
      navigate(`/checkout?plan=${planCode}`);
    }
  };

  // Tester la simulation de paiement
  const testPaymentSimulation = async (planCode: string) => {
    const plan = testPlans.find(p => p.code === planCode);
    if (plan) {
      setTestResults(prev => [...prev, `🔄 Simulation du paiement pour ${plan.name}...`]);
      
      // Simuler un délai de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResults(prev => [...prev, `✅ Paiement simulé réussi pour ${plan.name}`]);
    }
  };

  // Effacer les résultats de test
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-primary" />
          Test de la fonctionnalité Checkout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plans de test */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Plans disponibles pour les tests :</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testPlans.map((plan) => (
              <Card key={plan.code} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <Badge variant={plan.price === 0 ? 'secondary' : 'default'}>
                        {plan.price === 0 ? 'Gratuit' : `$${plan.price}`}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.tokens.toLocaleString()} tokens/mois
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => testCheckoutNavigation(plan.code)}
                        className="flex-1"
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Tester Checkout
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testPaymentSimulation(plan.code)}
                        className="flex-1"
                      >
                        Simuler Paiement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Résultats des tests :</h3>
              <Button size="sm" variant="outline" onClick={clearResults}>
                Effacer
              </Button>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  <span className="text-sm">{result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Instructions de test :
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Cliquez sur "Tester Checkout" pour naviguer vers la page de paiement</li>
            <li>• Cliquez sur "Simuler Paiement" pour tester la logique de paiement</li>
            <li>• Testez avec différents plans (gratuit et payants)</li>
            <li>• Vérifiez que la navigation fonctionne correctement</li>
            <li>• Vérifiez que les informations du plan s'affichent correctement</li>
          </ul>
        </div>

        {/* Navigation rapide */}
        <div className="flex gap-2">
          <Button onClick={() => navigate('/settings')} variant="outline">
            Aller aux paramètres
          </Button>
          <Button onClick={() => navigate('/')} variant="outline">
            Retour au dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
