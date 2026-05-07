//Importa los hooks de tanstack query
//-useQuery: para consultas GET
//-useMutation: para consultas POST, PUT, DELETE
//-useQueryClient: para invalidar o actualizar la cache de las consultas

import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
//importar el servicio carrosService que contiene las funciones de API
import { carrosService } from '../api/carros.service';
//Definimos una constante key que me va a servir como identificador unico para las querys relacionadas con el recurso "carros"
const KEY = ['carros'];

//Hook personalizado useCarros
//Para encapsular la logica de obtener carros desde la API
//Utilizar useQuery que reemplaza al useEffect y el useState con queryKey 'carros'
//-queryFn: ejecuta carrosService.getAll() y muestre un console log
//-staleTime: definir que los datos se mantengan cacheados por n minutos
export function useCarros() {
    return useQuery({
        queryKey: ['carros'],
        queryFn: () => {
            console.log('🌎 Get ejecutado - se fue a la red')
            return carrosService.getAll()
        },
        staleTime:1000*60*5 //5 minutos
    
    })
}
//Hook personalizado
//Encapsular la logica de agregar un carro nuevo
//Usar useMutation para llamar a carrosService.add()
//onSuccess: invalida la query de carros para que se vuelva a ejecutar y traiga la lista actualizada
export function useAgregarCarro() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (marca:string) => carrosService.add(marca),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey:KEY });
        }
    });
}