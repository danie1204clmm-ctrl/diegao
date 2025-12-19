// src/screens/ConfigImpressoraScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import PrinterService from '../services/PrinterService';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ConfigImpressoraScreen() {
  const [impressoras, setImpressoras] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [impressoraSalva, setImpressoraSalva] = useState(null);

  useEffect(() => {
    carregarImpressoraSalva();
  }, []);

  const carregarImpressoraSalva = async () => {
    const salva = await AsyncStorage.getItem('@impressora_mac');
    if (salva) setImpressoraSalva(salva);
  };

  const buscarImpressoras = async () => {
    setCarregando(true);
    const lista = await PrinterService.listarImpressoras();
    setImpressoras(lista);
    setCarregando(false);
  };

  const conectarImpressora = async (impressora) => {
    setCarregando(true);
    const sucesso = await PrinterService.conectarImpressora(impressora.address);
    
    if (sucesso) {
      await AsyncStorage.setItem('@impressora_mac', impressora.address);
      setImpressoraSalva(impressora.address);
      Alert.alert('✅ Conectado!', `Impressora ${impressora.name} conectada`);
    } else {
      Alert.alert('❌ Erro', 'Não foi possível conectar à impressora');
    }
    
    setCarregando(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🖨️ Configurar Impressora</Text>
      
      {impressoraSalva && (
        <View style={styles.impressoraAtual}>
          <Text style={styles.impressoraTexto}>
            ✅ Impressora Conectada
          </Text>
          <Text style={styles.macAddress}>{impressoraSalva}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.botaoBuscar}
        onPress={buscarImpressoras}
        disabled={carregando}
      >
        <Text style={styles.botaoTexto}>
          {carregando ? '🔍 Buscando...' : '🔍 Buscar Impressoras'}
        </Text>
      </TouchableOpacity>

      {carregando && <ActivityIndicator size="large" color="#49644aff" />}

      <FlatList
        data={impressoras}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.impressoraItem}
            onPress={() => conectarImpressora(item)}
          >
            <Text style={styles.impressoraNome}>🖨️ {item.name}</Text>
            <Text style={styles.impressoraMac}>{item.address}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  impressoraAtual: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  impressoraTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
  },
  macAddress: {
    fontSize: 14,
    color: '#155724',
    marginTop: 5,
  },
  botaoBuscar: {
    backgroundColor: '#49644aff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  impressoraItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  impressoraNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  impressoraMac: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default ConfigImpressoraScreen;
