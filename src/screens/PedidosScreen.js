// src/screens/PedidosScreen.js
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import PedidoItem from '../components/PedidoItem';

function PedidosScreen({ navigation, pedidosSalvos, setPedidosSalvos }) {
  const excluirPedido = (id) => {
    setPedidosSalvos((prev) => prev.filter((p) => p.id !== id));
    Toast.show({
      type: 'info',
      text1: 'Pedido excluído',
      text2: `Pedido Nº ${id} foi removido`,
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const excluirTodos = () => {
    Alert.alert(
      '⚠️ Excluir Todos os Pedidos',
      `Tem certeza que deseja excluir TODOS os ${pedidosSalvos.length} pedidos?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Tudo',
          onPress: () => {
            setPedidosSalvos([]);
            Toast.show({
              type: 'success',
              text1: '✅ Todos os pedidos excluídos',
              position: 'top',
              visibilityTime: 2000,
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const totalGeral = useMemo(() => {
    return pedidosSalvos.reduce((acc, pedido) => acc + pedido.total, 0);
  }, [pedidosSalvos]);

  return (
    <View style={styles.container}>
      {pedidosSalvos.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={excluirTodos}
            style={styles.botaoExcluirTudo}
            accessibilityLabel="Excluir todos os pedidos"
            accessibilityRole="button"
          >
            <Text style={styles.textoExcluirTudo}>Excluir Tudo</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.titulo}>
        📋 Pedidos Salvos ({pedidosSalvos.length})
      </Text>



      {pedidosSalvos.length > 0 && (
        <View style={styles.totalGeralContainer}>
          <Text style={styles.totalGeralTexto}>
            Total Geral: R$ {totalGeral.toFixed(2)}
          </Text>
        </View>
      )}

      {pedidosSalvos.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📦</Text>
          <Text style={styles.emptySubtext}>Nenhum pedido salvo ainda.</Text>
          <Text style={styles.emptyHint}>
            Adicione itens ao carrinho na tela inicial e envie seu pedido!
          </Text>
        </View>
      )}

      <FlatList
        data={pedidosSalvos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PedidoItem pedido={item} onExcluir={() => excluirPedido(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  headerActions: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  botaoExcluirTudo: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
  },
  textoExcluirTudo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2d5016',
  },
  totalGeralContainer: {
    backgroundColor: '#49644aff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  totalGeralTexto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptySubtext: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  listContent: {
    paddingBottom: 20,
  },
  botaoEstatisticas: {
  backgroundColor: '#9C27B0',
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 8,
  marginBottom: 12,
},
textoEstatisticas: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 14,
  textAlign: 'center',
},
});

export default PedidosScreen;