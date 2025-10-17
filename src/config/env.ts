// Configuration des variables d'environnement
export const env = {
  GROK_API_KEY: import.meta.env.VITE_GROK_API_KEY || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  NODE_ENV: import.meta.env.MODE || 'development',
};

// Vérification de la configuration
export const checkConfig = () => {
  const missing = [];
  
  if (!env.GROK_API_KEY) {
    missing.push('VITE_GROK_API_KEY');
  }
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables d\'environnement manquantes:', missing.join(', '));
    console.warn('📝 Créez un fichier .env avec ces variables pour utiliser Grok');
  }
  
  return missing.length === 0;
};
