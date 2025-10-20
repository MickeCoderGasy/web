// Page d'administration pour vérifier les paiements manuels
// Accessible via /admin-payments - SÉCURISÉE

import { AdminPaymentVerification } from '@/components/AdminPaymentVerification';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Shield } from 'lucide-react';
import { useAdminLogging } from '@/hooks/useAdminLogging';
import { ADMIN_EMAILS, isAdminEmail, logAdminAccess } from '@/config/admin';

export default function AdminPayments() {
  const { user, loading: userLoading } = useAuth();
  
  // Logger les accès à l'admin panel
  useAdminLogging();

  // Afficher un loader pendant la vérification de l'utilisateur
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 animate-pulse" />
          <span>Vérification des permissions...</span>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérifier si l'utilisateur est autorisé
  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions pour accéder à cette page.
            </p>
            <div className="text-xs text-muted-foreground">
              <p>Email actuel: {user.email}</p>
              <p>Contactez l'administrateur pour obtenir l'accès.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // L'utilisateur est autorisé, afficher l'interface d'administration
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center gap-2 text-success">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Mode Administration</span>
          </div>
          <p className="text-sm text-success/80 mt-1">
            Connecté en tant qu'administrateur: {user.email}
          </p>
        </div>
        <AdminPaymentVerification />
      </main>
    </div>
  );
}
