// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PEDIDOS_KEY = '@pastelaria_pedidos';

export const salvarPedidos = async (pedidos) => {
  try {
    await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
  } catch (error) {
    console.error('Erro ao salvar pedidos:', error);
  }
};

export const carregarPedidos = async () => {
  try {
    const pedidosJSON = await AsyncStorage.getItem(PEDIDOS_KEY);
    return pedidosJSON ? JSON.parse(pedidosJSON) : [];
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    return [];
  }
};

export const limparPedidos = async () => {
  try {
    await AsyncStorage.removeItem(PEDIDOS_KEY);
  } catch (error) {
    console.error('Erro ao limpar pedidos:', error);
  }
};