import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar as RNStatusBar,
  Alert,
  AppState,
} from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import Toast from 'react-native-toast-message';
import ProdutoCard from '../components/ProdutoCard';
import { pasteis } from '../data/produtos';
import { Ionicons } from '@expo/vector-icons';

const LIMITE_QUANTIDADE = 99;

function HomeScreen({ navigation, pedidosSalvos, setPedidosSalvos, gerarIdUnico }) {
  const esconderBarra = async () => {
    try {
      await NavigationBar.setVisibilityAsync('hidden');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      await NavigationBar.setBackgroundColorAsync('#00000000');
    } catch (e) {
      console.warn('NavigationBar error:', e);
    }
  };

  useEffect(() => {
    esconderBarra();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        esconderBarra();
      }
    });
    return () => sub.remove();
  }, []);

  const [quantidades, setQuantidades] = useState({});

  const aumentar = useCallback((id, nome) => {
    setQuantidades((prev) => {
      const qtdAtual = prev[id] || 0;
      if (qtdAtual >= LIMITE_QUANTIDADE) {
        Toast.show({
          type: 'error',
          text1: 'Limite atingido',
          text2: `Máximo de ${LIMITE_QUANTIDADE} unidades por item`,
          position: 'top',
          visibilityTime: 2000,
        });
        return prev;
      }

      Toast.show({
        type: 'success',
        text1: '✅ Item adicionado',
        text2: `${nome} - Qtd: ${qtdAtual + 1}`,
        position: 'top',
        visibilityTime: 1000,
      });

      return { ...prev, [id]: qtdAtual + 1 };
    });
  }, []);

  const diminuir = useCallback((id) => {
    setQuantidades((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  }, []);

  const total = useMemo(() => {
    return pasteis.reduce((acc, item) => {
      const qtd = quantidades[item.id] || 0;
      return acc + qtd * item.preco;
    }, 0);
  }, [quantidades]);

  const totalItens = useMemo(() => {
    return Object.values(quantidades).reduce((acc, qtd) => acc + qtd, 0);
  }, [quantidades]);

  const handleAbrirPedidos = () => {
    const selecionados = pasteis.filter((p) => (quantidades[p.id] || 0) > 0);

    if (selecionados.length === 0) {
      Alert.alert('🛒 Carrinho vazio', 'Adicione pelo menos 1 pastel ao carrinho.');
      return;
    }

    Alert.alert(
      ' Confirmar Pedido',
      `Total de ${totalItens} ${totalItens === 1 ? 'pastel' : 'pastéis'}\nValor: R$ ${total.toFixed(2)}\n\nDeseja confirmar o pedido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            const idPedido = gerarIdUnico();

            const novoPedido = {
              id: idPedido,
              itens: selecionados,
              quantidades: { ...quantidades },
              total,
              data: new Date().toLocaleString('pt-BR'),
            };

            setPedidosSalvos((prev) => [...prev, novoPedido]);
            setQuantidades({});

            Toast.show({
              type: 'success',
              text1: '🎉 Pedido enviado!',
              text2: `Pedido Nº ${idPedido} salvo com sucesso`,
              position: 'top',
              visibilityTime: 2500,
            });

            navigation.navigate('Pedidos');
          },
        },
      ]
    );
  };

  const renderCard = useCallback(
    ({ item }) => (
      <ProdutoCard
        item={item}
        quantidade={quantidades[item.id] || 0}
        onAumentar={() => aumentar(item.id, item.nome)}
        onDiminuir={() => diminuir(item.id)}
      />
    ),
    [quantidades, aumentar, diminuir]
  );

  return (
    <View style={styles.container}>
      <RNStatusBar hidden />
      <Text style={styles.titulo}>App Diegoves - Pastelaria</Text>
      <Text style={styles.total}>
         Total: R$ {total.toFixed(2)}
        {totalItens > 0 && ` (${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`}
      </Text>

      <FlatList
        data={pasteis}
        renderItem={renderCard}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {totalItens > 0 && (
        <TouchableOpacity
          style={styles.enviarBotao}
          onPress={handleAbrirPedidos}
          accessibilityLabel={`Enviar pedido com ${totalItens} itens`}
          accessibilityRole="button"
        >
          <Text style={styles.enviarTexto}>ENVIAR PEDIDO</Text>
          <Text style={styles.enviarSubtexto}>({totalItens})</Text>
        </TouchableOpacity>
      )}

      {/* Botão Flutuante de Estatísticas - NOVO */}
      <TouchableOpacity
        style={styles.botaoFlutuanteEstatisticas}
        onPress={() => navigation.navigate('Estatisticas')}
        accessibilityLabel="Ver estatísticas"
        accessibilityRole="button"
      >
        <Text style={styles.botaoFlutuanteTexto}>📊</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0ff',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#141414ff',
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#131212ff',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  enviarBotao: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: '#49644aff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  enviarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enviarSubtexto: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
botaoFlutuanteEstatisticas: {
  position: 'absolute',
  left: 16,
  bottom: 20,
  backgroundColor: '#9C27B0',
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
},
botaoFlutuanteTexto: {
  fontSize: 28,
},
});

export default HomeScreen;