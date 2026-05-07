import {client} from './client';
import {Carro} from '../types/carro';

export const carrosService = {
    getAll: async (): Promise<Carro[]> => {
        const res = await client.get('/carros');
        return res.data;
    },

    add: async (marca: string): Promise<Carro> => {
        const res = await client.post('/carros', { marca });
        return res.data;
    }
}