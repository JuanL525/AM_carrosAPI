import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

//Creamos una instancia de QueryClient para configurar la cache y ciclo de vida de las querys
const qc = new QueryClient();

//Componente layout, envolver la navegacion dentro del QueryClientProvider para que toda la app tenga acceso a los hooks de querys
export default function TabLayout() {
  return (
    <QueryClientProvider client = {qc}>
      <Stack/>
    </QueryClientProvider>
  )
}