// src/components/Contador.js
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Contador = memo(({ quantidade, onAumentar, onDiminuir }) => {
  return (
    <View style={styles.contadorArea}>
      {quantidade > 0 && (
        <TouchableOpacity
          style={styles.contadorBotao}
          onPress={onDiminuir}
          accessibilityLabel="Diminuir quantidade"
          accessibilityRole="button"
        >
          <Text style={styles.contadorTexto}>-</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.quantidade}>{quantidade}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  contadorArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    minHeight: 40,
  },
  contadorBotao: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f8f8aa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  contadorTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  quantidade: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
});

export default Contador;