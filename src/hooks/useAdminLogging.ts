// Hook pour logger les accès à l'admin panel
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminLogging() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      // Logger l'accès à l'admin panel
      const logData = {
        email: user.email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        action: 'admin_panel_access'
      };

      console.log('🔐 Admin Panel Access:', logData);
      
      // Optionnel: envoyer à un service de logging externe
      // logToExternalService(logData);
    }
  }, [user?.email]);

  return null;
}
