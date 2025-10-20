// Service d'authentification pour changement et réinitialisation de mot de passe
// Tous les commentaires sont ajoutés pour clarifier le code

import { supabase } from '@/integrations/supabase/client';

/**
 * Change le mot de passe pour un utilisateur connecté.
 * Par sécurité, on revalide le mot de passe actuel avant mise à jour.
 */
export async function changePassword(currentEmail: string, currentPassword: string, newPassword: string) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentEmail.trim(),
    password: currentPassword
  });
  if (signInError) throw new Error('Mot de passe actuel invalide');

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw new Error(updateError.message);
  return true;
}

/**
 * Envoie l'email de réinitialisation de mot de passe.
 */
export async function sendPasswordResetEmail(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw new Error(error.message);
  return true;
}

/**
 * Complète la réinitialisation après redirection (session recovery créée par Supabase).
 */
export async function completePasswordReset(newPassword: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Session de récupération absente ou expirée');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return true;
}


