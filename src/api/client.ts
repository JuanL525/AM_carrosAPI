import axios from 'axios';
//Creamos un cliente de axios configurado con la URL base de la API, tomada de la variable de entorno de Expo

//-headers: indicar que el contenido sera JSON

export const client = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' }
})

