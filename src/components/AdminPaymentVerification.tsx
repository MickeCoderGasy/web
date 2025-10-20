// Composant pour que l'admin puisse vérifier les paiements manuels
// Affiche la liste des paiements en attente et permet la vérification

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  Ban,
  MessageSquare
} from 'lucide-react';
import { manualPaymentService, ManualPayment } from '@/services/manualPaymentService';
import { useToast } from '@/hooks/use-toast';

export function AdminPaymentVerification() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'expired' | 'refused'>('all');
  const [refuseModal, setRefuseModal] = useState<{ paymentId: string; isOpen: boolean }>({ paymentId: '', isOpen: false });
  const [refuseReason, setRefuseReason] = useState('');

  // Charger les paiements
  const loadPayments = async () => {
    try {
      setLoading(true);
      const allPayments = await manualPaymentService.getAllPayments();
      setPayments(allPayments);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paiements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_id.includes(searchTerm) ||
                         payment.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Vérifier un paiement
  const verifyPayment = async (paymentId: string) => {
    try {
      console.log('Tentative de vérification du paiement:', paymentId);
      
      const result = await manualPaymentService.verifyPayment(paymentId, 'admin@qubextai.tech');
      
      console.log('Résultat de la vérification:', result);
      
      if (result.success) {
        toast({
          title: 'Paiement vérifié !',
          description: result.message || `Le paiement ${paymentId} a été vérifié avec succès. Le plan a été activé et les tokens ont été réinitialisés.`,
        });
        loadPayments(); // Recharger la liste
      } else {
        toast({
          title: 'Erreur de vérification',
          description: 'Impossible de vérifier ce paiement.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la vérification',
        variant: 'destructive'
      });
    }
  };

  // Refuser un paiement
  const refusePayment = async (paymentId: string, reason?: string) => {
    try {
      console.log('Tentative de refus du paiement:', paymentId);
      
      const success = await manualPaymentService.refusePayment(paymentId, 'admin@qubextai.tech', reason);
      
      if (success) {
        toast({
          title: 'Paiement refusé !',
          description: `Le paiement ${paymentId} a été refusé avec succès.`,
        });
        loadPayments(); // Recharger la liste
        setRefuseModal({ paymentId: '', isOpen: false });
        setRefuseReason('');
      } else {
        toast({
          title: 'Erreur de refus',
          description: 'Impossible de refuser ce paiement.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du refus:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du refus',
        variant: 'destructive'
      });
    }
  };

  // Ouvrir la modal de refus
  const openRefuseModal = (paymentId: string) => {
    setRefuseModal({ paymentId, isOpen: true });
    setRefuseReason('');
  };

  // Fermer la modal de refus
  const closeRefuseModal = () => {
    setRefuseModal({ paymentId: '', isOpen: false });
    setRefuseReason('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      case 'refused':
        return <Ban className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'expired':
        return 'text-destructive';
      case 'cancelled':
        return 'text-muted-foreground';
      case 'refused':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-success text-success-foreground">Vérifié</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expiré</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Annulé</Badge>;
      case 'refused':
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Vérification des paiements manuels
          </CardTitle>
          <Button onClick={loadPayments} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher par email, ID ou plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              Tous
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              En attente
            </Button>
            <Button
              variant={filterStatus === 'verified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('verified')}
            >
              Vérifiés
            </Button>
            <Button
              variant={filterStatus === 'expired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('expired')}
            >
              Expirés
            </Button>
            <Button
              variant={filterStatus === 'refused' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('refused')}
            >
              Refusés
            </Button>
          </div>
        </div>

        {/* Liste des paiements */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
            <span>Chargement des paiements...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Aucun paiement trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold">
                            {payment.payment_id}
                          </span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{payment.user_email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${payment.amount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(payment.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className="text-sm font-medium">{payment.plan_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({payment.plan_code})
                          </span>
                        </div>
                        {payment.status === 'pending' && (
                          <div className="mt-2 p-2 bg-warning/10 rounded text-xs">
                            <strong>Code USSD:</strong> {payment.mobile_money_code}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {payment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => verifyPayment(payment.payment_id)}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Vérifier
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRefuseModal(payment.payment_id)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {payment.status === 'verified' && payment.verified_at && (
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Vérifié le</div>
                          <div>{new Date(payment.verified_at).toLocaleString('fr-FR')}</div>
                          {payment.verified_by && (
                            <div>par {payment.verified_by}</div>
                          )}
                        </div>
                      )}
                      {payment.status === 'refused' && payment.verified_at && (
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Refusé le</div>
                          <div>{new Date(payment.verified_at).toLocaleString('fr-FR')}</div>
                          {payment.verified_by && (
                            <div>par {payment.verified_by}</div>
                          )}
                          {payment.notes && (
                            <div className="mt-1 text-xs text-destructive">
                              Raison: {payment.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de refus de paiement */}
        {refuseModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Ban className="w-5 h-5" />
                  Refuser le paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Êtes-vous sûr de vouloir refuser ce paiement ?
                  </p>
                  <p className="text-sm font-medium">
                    ID de paiement: {refuseModal.paymentId}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Raison du refus (optionnel)
                  </label>
                  <textarea
                    value={refuseReason}
                    onChange={(e) => setRefuseReason(e.target.value)}
                    placeholder="Expliquez pourquoi ce paiement est refusé..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => refusePayment(refuseModal.paymentId, refuseReason)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Confirmer le refus
                  </Button>
                  <Button
                    onClick={closeRefuseModal}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
