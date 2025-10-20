// Composant pour gérer les retours de paiement depuis Vanilla Pay
// Affiche le statut du paiement et redirige l'utilisateur

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Récupérer les paramètres de retour de Vanilla Pay
    const paymentId = searchParams.get('payment_id');
    const result = searchParams.get('result');
    const error = searchParams.get('error');

    if (result === 'success') {
      setStatus('success');
      setMessage('Paiement effectué avec succès ! Votre abonnement a été activé.');
      
      toast({
        title: 'Paiement réussi !',
        description: 'Votre abonnement a été activé avec succès.',
      });
    } else if (result === 'pending') {
      setStatus('pending');
      setMessage('Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.');
    } else if (result === 'failed' || error) {
      setStatus('failed');
      setMessage(error || 'Le paiement a échoué. Veuillez réessayer.');
      
      toast({
        title: 'Paiement échoué',
        description: error || 'Une erreur est survenue lors du paiement.',
        variant: 'destructive'
      });
    } else {
      setStatus('failed');
      setMessage('Statut de paiement inconnu.');
    }
  }, [searchParams, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-success" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-destructive" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-warning" />;
      default:
        return <Loader2 className="w-16 h-16 animate-spin text-primary" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-success/20 bg-success/5';
      case 'failed':
        return 'border-destructive/20 bg-destructive/5';
      case 'pending':
        return 'border-warning/20 bg-warning/5';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'success' && 'Paiement réussi !'}
            {status === 'failed' && 'Paiement échoué'}
            {status === 'pending' && 'Paiement en cours'}
            {status === 'loading' && 'Vérification du paiement...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message}
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/settings')} 
              className="w-full"
              variant={status === 'success' ? 'default' : 'outline'}
            >
              Retour aux paramètres
            </Button>
            
            {status === 'failed' && (
              <Button 
                onClick={() => navigate('/checkout')} 
                variant="outline" 
                className="w-full"
              >
                Réessayer le paiement
              </Button>
            )}
            
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="w-full"
            >
              Retour au dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
