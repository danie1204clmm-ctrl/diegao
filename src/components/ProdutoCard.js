// src/components/ProdutoCard.js
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Contador from './Contador';

const ProdutoCard = memo(({ item, quantidade, onAumentar, onDiminuir }) => {
  const subtotal = quantidade * item.preco;
  const hasTwoColors = !!(item.cor1 && item.cor2);

  const Conteudo = (
    <>
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>

      <Contador
        quantidade={quantidade}
        onAumentar={onAumentar}
        onDiminuir={onDiminuir}
      />

      <Text style={styles.subtotal}>Subtotal: R$ {subtotal.toFixed(2)}</Text>
    </>
  );

  return (
    <TouchableOpacity
      onPress={onAumentar}
      activeOpacity={0.8}
      style={styles.cardWrapper}
      accessibilityLabel={`${item.nome}, ${item.preco} reais`}
      accessibilityRole="button"
      accessibilityHint="Toque para adicionar ao carrinho"
    >
      {hasTwoColors ? (
        <LinearGradient
          colors={[item.cor1, item.cor1, item.cor2, item.cor2]}
          locations={[0, 0.5, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          {Conteudo}
        </LinearGradient>
      ) : (
        <View style={[styles.card, { backgroundColor: item.cor }]}>
          {Conteudo}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    width: '48%',
    marginBottom: 8,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    elevation: 3,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  preco: {
    fontSize: 14,
    marginTop: 6,
    color: '#111',
  },
  subtotal: {
    marginTop: 8,
    fontWeight: '700',
    color: '#111',
    fontSize: 13,
  },
});

export default ProdutoCard;