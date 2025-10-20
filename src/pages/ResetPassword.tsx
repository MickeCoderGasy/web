import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { completePasswordReset } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

// Page de réinitialisation du mot de passe après redirection depuis l'email
// Tous les commentaires sont ajoutés pour clarifier le code

export default function ResetPassword() {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Optionnel: on pourrait vérifier ici la présence d'une session de récupération
  }, []);

  const handleSubmit = async () => {
    try {
      if (!newPassword || !confirmPassword) throw new Error('Veuillez remplir tous les champs');
      if (newPassword !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas');
      setIsSubmitting(true);
      await completePasswordReset(newPassword);
      toast({ title: 'Mot de passe réinitialisé', description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Impossible de réinitialiser le mot de passe', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Réinitialiser le mot de passe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs">Nouveau mot de passe</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs">Confirmer le mot de passe</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button className="w-full" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Validation…' : 'Valider'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


