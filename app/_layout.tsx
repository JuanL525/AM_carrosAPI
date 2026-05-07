//Importar Stack desde expo-router que defina la navegacion entre pantallas
//Importar el QueryClient y QueryClientProvider desde TanStack
//Con esto se puede configurar el cliente de querys y hooks dentro de toda la app

import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
//Creamos una instancia de QueryClient para configurar la cache y ciclo de vida de las querys

const qc = new QueryClient();

//Componente layout, envolver la navegacion dentro del QueryClientProvider para que toda la app tenga acceso a los hooks de querys
//Con esto los componentes hijos pueden usar useQuery y useMutation para interactuar con la API y manejar el estado de los datos de forma eficiente, es el punto de integración entre tanStack y navegacion de Expo

export default function Layout() {
  return (
    <QueryClientProvider client = {qc}>
      <Stack/>
    </QueryClientProvider>
  )
}
