// Composant de debug pour diagnostiquer les problèmes de paiement
// Affiche les informations de debug pour l'API de paiement

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Bug, RefreshCw } from 'lucide-react';
import { paymentService, PaymentData } from '@/services/paymentService';
import { getApiUrl } from '@/config/api';

export function PaymentDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPaymentAPI = async () => {
    setLoading(true);
    setDebugInfo(null);

    try {
      // Test de données de paiement
      const testPaymentData: PaymentData = {
        plan_code: 'starter',
        user_email: 'test@example.com',
        amount: 14.99,
        currency: 'USD',
        description: 'Test de paiement'
      };

      const debugData: any = {
        timestamp: new Date().toISOString(),
        apiUrl: getApiUrl('/api/vanilla-pay/initiate-payment'),
        testData: testPaymentData,
        steps: []
      };

      // Étape 1: Test de connectivité
      debugData.steps.push({
        step: 'Test de connectivité',
        status: 'pending',
        details: 'Vérification de la disponibilité de l\'API...'
      });

      try {
        const response = await fetch(getApiUrl('/api/vanilla-pay/initiate-payment'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            montant: testPaymentData.amount,
            idpanier: `test_${Date.now()}`,
            email: testPaymentData.user_email,
            description: testPaymentData.description,
            plan_code: testPaymentData.plan_code
          })
        });

        debugData.steps.push({
          step: 'Test de connectivité',
          status: response.ok ? 'success' : 'error',
          details: `HTTP ${response.status}: ${response.statusText}`,
          response: response.ok ? await response.json() : await response.text()
        });

        if (!response.ok) {
          debugData.error = `API non disponible: ${response.status} ${response.statusText}`;
        }

      } catch (error: any) {
        debugData.steps.push({
          step: 'Test de connectivité',
          status: 'error',
          details: `Erreur de connexion: ${error.message}`,
          error: error.toString()
        });
        debugData.error = `Erreur de connexion: ${error.message}`;
      }

      // Étape 2: Test du service de paiement
      debugData.steps.push({
        step: 'Test du service de paiement',
        status: 'pending',
        details: 'Test avec le service de paiement...'
      });

      try {
        const result = await paymentService.initiatePaymentWithFallback(testPaymentData);
        debugData.steps.push({
          step: 'Test du service de paiement',
          status: result.success ? 'success' : 'error',
          details: result.success ? 'Service fonctionnel' : result.error,
          result: result
        });
      } catch (error: any) {
        debugData.steps.push({
          step: 'Test du service de paiement',
          status: 'error',
          details: `Erreur du service: ${error.message}`,
          error: error.toString()
        });
      }

      setDebugInfo(debugData);

    } catch (error: any) {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: `Erreur générale: ${error.message}`,
        steps: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 animate-spin text-warning" />;
      default:
        return <Bug className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-destructive';
      case 'pending':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-primary" />
          Debug de l'API de paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testPaymentAPI} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Bug className="w-4 h-4 mr-2" />
              Tester l'API de paiement
            </>
          )}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-semibold mb-2">Informations de debug</h3>
              <div className="text-sm space-y-1">
                <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
                <p><strong>URL de l'API:</strong> {debugInfo.apiUrl}</p>
                {debugInfo.error && (
                  <p className="text-destructive"><strong>Erreur:</strong> {debugInfo.error}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Étapes de test</h3>
              {debugInfo.steps.map((step: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{step.step}</span>
                      <Badge 
                        variant={step.status === 'success' ? 'default' : step.status === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className={`text-sm ${getStatusColor(step.status)}`}>
                      {step.details}
                    </p>
                    {step.response && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Voir la réponse
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(step.response, null, 2)}
                        </pre>
                      </details>
                    )}
                    {step.error && (
                      <details className="mt-2">
                        <summary className="text-xs text-destructive cursor-pointer">
                          Voir l'erreur
                        </summary>
                        <pre className="text-xs bg-destructive/10 p-2 rounded mt-1 overflow-auto text-destructive">
                          {step.error}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
