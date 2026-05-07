# Implementación de Autenticación con Supabase (Login y Registro)

Este documento detalla los pasos y el código necesario para integrar Supabase Auth en la aplicación React Native (Expo Router). El objetivo es crear un flujo que permita a los usuarios registrarse, iniciar sesión y proteger las rutas principales de la aplicación.

## 1. Instalación de Dependencias
Primero, necesitamos instalar el cliente de Supabase y las librerías para manejar la persistencia de la sesión en el almacenamiento local del dispositivo.

\`\`\`bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
\`\`\`

## 2. Configuración del Cliente de Supabase
Crear el archivo de configuración para inicializar el cliente de Supabase asegurando que la sesión persista usando `AsyncStorage`.

**Archivo:** `src/api/supabase.ts`

\`\`\`typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Reemplazar con las variables de entorno de tu proyecto Supabase
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
\`\`\`

## 3. Crear el Flujo de Autenticación (UI)
Vamos a crear un grupo de rutas `(auth)` para separar las pantallas de Login y Registro de la navegación por pestañas `(tabs)`.

### Pantalla de Registro (Crear Usuarios)
**Archivo:** `app/(auth)/register.tsx`

\`\`\`typescript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../src/api/supabase';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error al registrar', error.message);
    } else {
      Alert.alert('Éxito', 'Revisa tu correo para verificar tu cuenta');
      router.replace('/(auth)/login');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Registrarse" onPress={signUpWithEmail} disabled={loading} />
      <Button title="Ya tengo cuenta" onPress={() => router.replace('/(auth)/login')} type="clear" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});
\`\`\`

### Pantalla de Login
**Archivo:** `app/(auth)/login.tsx`

\`\`\`typescript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../src/api/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    }
    // No necesitamos redirigir manualmente si el layout principal está escuchando el estado de la sesión
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Entrar" onPress={signInWithEmail} disabled={loading} />
      <Button title="Crear cuenta nueva" onPress={() => router.replace('/(auth)/register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});
\`\`\`

## 4. Proteger las Rutas (Root Layout)
Para asegurar que los usuarios no autenticados no puedan ver la app principal `(tabs)`, interceptaremos el estado de la sesión de Supabase en el enrutador principal de Expo Router.

**Archivo a modificar:** `app/_layout.tsx`

\`\`\`typescript
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/api/supabase';
import { Session } from '@supabase/supabase-js';

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
  }, [session, initialized, segments]);

  // Renderiza los componentes hijos. Slot actuará como el punto de montaje.
  return <Slot />;
}
\`\`\`