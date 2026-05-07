import { Session } from '@supabase/supabase-js';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/api/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Escuchar cambios en la autenticación (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // Verificar si el usuario está intentando acceder a una ruta de autenticación
    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      // Si está autenticado y está en login/registro, enviarlo a la app principal
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // Si no está autenticado y trata de entrar a la app, enviarlo al login
      router.replace('/(auth)/login');
    }
  }, [session, initialized, segments, router]);

  // Renderiza los componentes hijos. Slot actuará como el punto de montaje.
  return <Slot />;
}
