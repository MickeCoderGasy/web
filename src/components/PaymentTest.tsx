// Composant de test pour les paiements manuels
// Permet de tester la création et la vérification des paiements

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  User,
  DollarSign
} from 'lucide-react';
import { manualPaymentService, ManualPaymentData } from '@/services/manualPaymentService';
import { useToast } from '@/hooks/use-toast';

export function PaymentTest() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testAmount, setTestAmount] = useState('14.99');
  const [testPlan, setTestPlan] = useState('starter');
  const [createdPayment, setCreatedPayment] = useState<ManualPaymentData | null>(null);
  const [loading, setLoading] = useState(false);

  // Créer un paiement de test
  const createTestPayment = async () => {
    try {
      setLoading(true);
      setCreatedPayment(null);

      const paymentData = await manualPaymentService.createManualPayment(
        testEmail,
        testPlan,
        `Plan ${testPlan}`,
        parseFloat(testAmount),
        'USD'
      );

      setCreatedPayment(paymentData);
      toast({
        title: 'Paiement de test créé !',
        description: `ID: ${paymentData.payment_id}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création du paiement',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le paiement de test
  const verifyTestPayment = async () => {
    if (!createdPayment) return;

    try {
      setLoading(true);
      
      const result = await manualPaymentService.verifyPayment(
        createdPayment.payment_id, 
        'test-admin@example.com'
      );

      if (result.success) {
        toast({
          title: 'Paiement vérifié !',
          description: result.message || 'Le plan a été activé avec succès et les tokens ont été réinitialisés.',
        });
        setCreatedPayment(null);
      } else {
        toast({
          title: 'Erreur de vérification',
          description: 'Impossible de vérifier le paiement',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la vérification',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-primary" />
          Test des paiements manuels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulaire de test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Email de test</label>
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Montant</label>
            <Input
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              placeholder="14.99"
              type="number"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Plan</label>
            <Input
              value={testPlan}
              onChange={(e) => setTestPlan(e.target.value)}
              placeholder="starter"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={createTestPayment} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Créer un paiement de test
              </>
            )}
          </Button>
        </div>

        {/* Résultat du paiement créé */}
        {createdPayment && (
          <Card className="border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success text-lg">
                <CheckCircle className="w-5 h-5" />
                Paiement créé avec succès
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informations du paiement :</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span><strong>Email:</strong> {testEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span><strong>Montant:</strong> ${testAmount}</span>
                    </div>
                    <div>
                      <span><strong>Plan:</strong> {testPlan}</span>
                    </div>
                    <div>
                      <span><strong>ID de paiement:</strong> {createdPayment.payment_id}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Code USSD :</h4>
                  <div className="p-3 bg-background border rounded-lg">
                    <code className="text-lg font-mono font-bold text-primary">
                      {createdPayment.mobile_money_code}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={verifyTestPayment}
                  disabled={loading}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Vérifier ce paiement
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(createdPayment.mobile_money_code);
                    toast({
                      title: 'Code copié !',
                      description: 'Le code USSD a été copié.',
                    });
                  }}
                  variant="outline"
                >
                  Copier le code
                </Button>
              </div>

              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                  <div className="text-sm">
                    <strong>Test de vérification :</strong> Cliquez sur "Vérifier ce paiement" pour tester 
                    l'activation automatique du plan. Cela devrait mettre à jour le statut du paiement 
                    et activer le plan de l'utilisateur.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
