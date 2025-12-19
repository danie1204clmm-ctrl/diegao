// App.js
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import HomeScreen from './src/screens/HomeScreen';
import PedidosScreen from './src/screens/PedidosScreen';
import EstatisticasScreen from './src/screens/EstatisticasScreen';
import { salvarPedidos, carregarPedidos } from './src/utils/storage';

const Stack = createNativeStackNavigator();

function AppWrapper() {
  const [pedidosSalvos, setPedidosSalvos] = useState([]);
  const [idsUsados, setIdsUsados] = useState(new Set());

  // Carregar pedidos salvos ao iniciar
  useEffect(() => {
    const loadPedidos = async () => {
      const pedidos = await carregarPedidos();
      setPedidosSalvos(pedidos);

      // Recuperar IDs usados
      const ids = new Set(pedidos.map((p) => p.id));
      setIdsUsados(ids);
    };
    loadPedidos();
  }, []);

  // Salvar pedidos automaticamente quando mudarem
  useEffect(() => {
    if (pedidosSalvos.length >= 0) {
      salvarPedidos(pedidosSalvos);
    }
  }, [pedidosSalvos]);

  const gerarIdUnico = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const id = `${timestamp}${random}`;

    setIdsUsados((prev) => new Set(prev).add(id));
    return id;
  }, []);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#49644aff' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Home"
            options={{ title: '🥟 Pastelaria Diegoves' }}
          >
            {(props) => (
              <HomeScreen
                {...props}
                pedidosSalvos={pedidosSalvos}
                setPedidosSalvos={setPedidosSalvos}
                gerarIdUnico={gerarIdUnico}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="Pedidos"
            options={{ title: '📋 Meus Pedidos' }}
          >
            {(props) => (
              <PedidosScreen
                {...props}
                pedidosSalvos={pedidosSalvos}
                setPedidosSalvos={setPedidosSalvos}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="Estatisticas"
            options={{ title: '📊 Estatísticas' }}
          >
            {(props) => (
              <EstatisticasScreen
                {...props}
                pedidosSalvos={pedidosSalvos}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>

      {/* Toast deve estar fora do NavigationContainer */}
      <Toast />
    </>
  );
}

export default function App() {
  return <AppWrapper />;
}