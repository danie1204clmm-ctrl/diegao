// src/components/PedidoItem.js
import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import PrinterService from '../services/PrinterService';

const PedidoItem = memo(({ pedido, onExcluir }) => {
  const [imprimindo, setImprimindo] = useState(false);

  const handleExcluir = () => {
    Alert.alert(
      '⚠️ Confirmar Exclusão',
      `Tem certeza que deseja excluir o Pedido Nº ${pedido.id}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: onExcluir,
          style: 'destructive',
        },
      ]
    );
  };

  const handleImprimir = async () => {
    setImprimindo(true);

    try {
      // Tentar imprimir
      const resultado = await PrinterService.imprimirPedido(pedido);

      setImprimindo(false);

      if (resultado.success) {
        Alert.alert('✅ Impresso!', 'Pedido enviado para impressora com sucesso!');
      } else {
        Alert.alert(
          '❌ Erro ao Imprimir',
          resultado.error || 'Não foi possível imprimir.\n\nVerifique se:\n1. Impressora está ligada\n2. Bluetooth está ativado\n3. Impressora está pareada',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Ver Como Parear',
              onPress: () => {
                Alert.alert(
                  '📱 Como Parear Impressora',
                  '1. Ligue a impressora\n' +
                  '2. Abra Configurações do Android\n' +
                  '3. Bluetooth\n' +
                  '4. Procurar dispositivos\n' +
                  '5. Toque no nome da impressora\n' +
                  '6. Se pedir senha: 0000 ou 1234\n' +
                  '7. Volte ao app e tente novamente'
                );
              },
            },
            {
              text: 'Tentar Novamente',
              onPress: handleImprimir,
            },
          ]
        );
      }
    } catch (error) {
      setImprimindo(false);
      console.error('Erro geral ao imprimir:', error);
      Alert.alert('❌ Erro', 'Ocorreu um erro inesperado ao tentar imprimir.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🧾 Pedido Nº {pedido.id}</Text>
        
        <View style={styles.botoesContainer}>
          {/* Botão Imprimir */}
          <TouchableOpacity
            onPress={handleImprimir}
            style={styles.botaoImprimir}
            disabled={imprimindo}
            accessibilityLabel="Imprimir pedido"
            accessibilityRole="button"
          >
            {imprimindo ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.textoImprimir}>🖨️</Text>
            )}
          </TouchableOpacity>

          {/* Botão Excluir */}
          <TouchableOpacity
            onPress={handleExcluir}
            style={styles.botaoExcluir}
            accessibilityLabel="Excluir pedido"
            accessibilityRole="button"
          >
            <Text style={styles.textoExcluir}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.data}>📅 {pedido.data}</Text>

      {pedido.itens.map((p) => {
        const temDuasCores = p.cor1 && p.cor2;
        const qtd = pedido.quantidades[p.id];

        return (
          <View key={p.id} style={styles.itemRow}>
            {temDuasCores ? (
              <View style={styles.coresDivididas}>
                <View style={[styles.metadeCor, { backgroundColor: p.cor1 }]} />
                <View style={[styles.metadeCor, { backgroundColor: p.cor2 }]} />
              </View>
            ) : (
              <View
                style={[
                  styles.corUnica,
                  { backgroundColor: p.cor || '#ccc' },
                ]}
              />
            )}

            <Text style={styles.itemTexto}>
              {p.nome} — x{qtd} → R$ {(p.preco * qtd).toFixed(2)}
            </Text>
          </View>
        );
      })}

      <Text style={styles.total}>💰 Total: R$ {pedido.total.toFixed(2)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoImprimir: {
    backgroundColor: '#2196F3',
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoImprimir: {
    fontSize: 22,
  },
  botaoExcluir: {
    backgroundColor: '#ff4444',
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoExcluir: {
    fontSize: 22,
  },
  data: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  coresDivididas: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    marginRight: 10,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#999',
  },
  metadeCor: {
    flex: 1,
  },
  corUnica: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
  },
  itemTexto: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  total: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5016',
    textAlign: 'right',
  },
});

export default PedidoItem;