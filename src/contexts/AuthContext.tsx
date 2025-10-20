import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  token: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Création non bloquante de la ligne token_usage SI ABSENTE (ne jamais écraser)
  const ensureTokenUsageRowIfMissing = async (userEmail?: string | null) => {
    try {
      const email = (userEmail || '').trim();
      if (!email) return;
      // 1) Vérifier l'existence
      const { data, error } = await supabase
        .from('token_usage' as any)
        .select('user')
        .eq('user', email)
        .maybeSingle();
      if (error) {
        console.warn('[AuthContext] token_usage existence check failed:', error);
        return;
      }
      if (data) {
        // Déjà présent: ne rien faire (ne jamais écraser input/output)
        return;
      }
      // 2) Insérer la ligne initiale (ignorer les erreurs de doublon)
      const { error: insertError } = await supabase
        .from('token_usage' as any)
        .insert({ user: email, input: '0', output: '0' });
      if (insertError) {
        console.warn('[AuthContext] token_usage insert failed:', insertError);
      }
    } catch (e) {
      // Non bloquant: on log seulement
      console.warn('[AuthContext] token_usage upsert failed:', e);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setToken(session?.access_token ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setToken(session?.access_token ?? null);
      setLoading(false);
      // Ne pas initialiser ici pour éviter d'écraser/perturber les anciens comptes
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      // Si la session est déjà créée (cas sans confirmation), tenter l'init uniquement si absente
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        await ensureTokenUsageRowIfMissing(session.user.email);
      }
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        token,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

