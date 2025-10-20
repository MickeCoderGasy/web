// Configuration des administrateurs
// Centralise la liste des emails autorisés pour l'administration

export const ADMIN_EMAILS = [
  'micka.ram22@gmail.com' // Remplacez par votre email d'admin
];

// Fonction utilitaire pour vérifier si un email est admin
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

// Fonction pour logger les tentatives d'accès admin
export function logAdminAccess(email: string, action: string) {
  const logData = {
    email,
    action,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.log('🔐 Admin Access:', logData);
  
  // Optionnel: envoyer à un service de logging externe
  // sendToLoggingService(logData);
}
