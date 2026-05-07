import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, FlatList, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/api/supabase';
import { useAgregarCarro, useCarros } from '../../src/hooks/useCarros';

//Componente principal de la app, donde se muestra la lista de carros y un formulario para agregar nuevos carros
//Manejar el input de la marca con el estado local
//Obtener la lista de carros usando el hook de useCarros
//Definida la funcion de agregar carros que usa el hook useAgregarCarro para llamar a la API y agregar un nuevo carro, luego limpiar el input
export default function App() {
  //Estado local para controlar la lista de carros desde la API
  const [marca, setMarca] = useState('');
  const router = useRouter();
  //Hook useCarros: ontiene la lista de carros desde la API
  const {data:carros} = useCarros();
  //Hook usarAgregarCarro: para agregar un nuevo carro a la API
  const agregarMutation = useAgregarCarro();

  //Funcion para agregar un nuevo carro, llama a la mutacion de agregar y luego limpia el input
  const agregar = () => {
    agregarMutation.mutate(marca, {onSuccess: ()=> setMarca('')});
  }

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error al cerrar sesión', error.message);
      return;
    }
    router.replace('/(auth)/login');
  };




  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
      <Button title="Cerrar sesión" onPress={cerrarSesion} />
      <TextInput
        value={marca}
        onChangeText={setMarca}
        style={{ borderWidth: 3, marginVertical: 16 }}
      />
      <Button title="Agregar" onPress={agregar} />
      <FlatList 
        // Fuente de Datos
        data = {carros}
        // Clave única por cada carro
        keyExtractor = {item => item.id.toString()}
        renderItem = {({item}) =>
          <Text>{item.id} - {item.marca}</Text>
        }
      />
    </SafeAreaView>
  )
}