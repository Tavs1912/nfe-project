import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: no rows found
          console.error('Erro ao buscar perfil:', profileError);
        }
        setUser(profile ? { ...session.user, ...profile } : session.user);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Erro ao buscar perfil no auth state change:', profileError);
          }
          setUser(profile ? { ...session.user, ...profile } : session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil após login:', profileError);
      }
      setUser(profile ? { ...data.user, ...profile } : data.user);
    }
    setLoading(false);
    return { success: true };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLoading(false);
      console.error('Erro ao fazer logout:', error);
      return;
    }
    setUser(null);
    setLoading(false);
  };

  const signUp = async (email, password, userData) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: userData.nome,
          papel: userData.papel || 'user', // 'user' como papel padrão
          // Adicione company_id, department_id se forem parte de userData e do seu schema de profiles
        },
      },
    });

    if (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }

    // O trigger handle_new_user no Supabase deve criar a entrada em 'profiles'.
    // Se o usuário foi criado (data.user existe), tentamos buscar o perfil
    if (data.user) {
        // A sessão pode não estar imediatamente disponível após o signUp se a confirmação de email estiver habilitada.
        // O onAuthStateChange cuidará de definir o usuário quando a sessão for estabelecida.
        // Se a confirmação não for necessária, o perfil pode ser buscado aqui.
        // Por simplicidade, vamos assumir que onAuthStateChange vai lidar com isso.
    }
    
    setLoading(false);
    return { success: true, user: data.user };
  };

  const value = {
    user,
    login,
    logout,
    signUp,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};