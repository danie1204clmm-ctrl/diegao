// src/screens/EstatisticasScreen.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Cores vibrantes para o gráfico
const CORES_GRAFICO = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
  '#36A2EB', '#FFCE56',
];

function EstatisticasScreen({ pedidosSalvos }) {
  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    if (!pedidosSalvos || pedidosSalvos.length === 0) {
      return {
        totalPedidos: 0,
        totalVendas: 0,
        totalItens: 0,
        vendasPorPastel: [],
        pastelMaisVendido: null,
        ticketMedio: 0,
      };
    }

    try {
      // Total de pedidos e vendas
      const totalPedidos = pedidosSalvos.length;
      const totalVendas = pedidosSalvos.reduce((acc, p) => acc + (p.total || 0), 0);

      // Contar vendas por pastel
      const vendasMap = {};
      let totalItens = 0;

      pedidosSalvos.forEach((pedido) => {
        if (!pedido.itens || !pedido.quantidades) return;

        pedido.itens.forEach((item) => {
          const qtd = pedido.quantidades[item.id] || 0;
          totalItens += qtd;

          if (!vendasMap[item.nome]) {
            vendasMap[item.nome] = {
              nome: item.nome,
              quantidade: 0,
              receita: 0,
            };
          }

          vendasMap[item.nome].quantidade += qtd;
          vendasMap[item.nome].receita += (item.preco || 0) * qtd;
        });
      });

      // Converter para array e ordenar
      const vendasPorPastel = Object.values(vendasMap).sort(
        (a, b) => b.quantidade - a.quantidade
      );

      // Pastel mais vendido
      const pastelMaisVendido = vendasPorPastel[0] || null;

      // Ticket médio
      const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;

      return {
        totalPedidos,
        totalVendas,
        totalItens,
        vendasPorPastel,
        pastelMaisVendido,
        ticketMedio,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        totalPedidos: 0,
        totalVendas: 0,
        totalItens: 0,
        vendasPorPastel: [],
        pastelMaisVendido: null,
        ticketMedio: 0,
      };
    }
  }, [pedidosSalvos]);

  // Se não tem pedidos
  if (!pedidosSalvos || pedidosSalvos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>Nenhum dado ainda</Text>
        <Text style={styles.emptyText}>
          Faça alguns pedidos para ver as estatísticas de vendas!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cards de Resumo */}
      <View style={styles.cardsContainer}>
        <View style={[styles.card, styles.cardVerde]}>
          <Text style={styles.cardLabel}> Total Vendas</Text>
          <Text style={styles.cardValue}>
            R$ {estatisticas.totalVendas.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.card, styles.cardAzul]}>
          <Text style={styles.cardLabel}> Total Pedidos</Text>
          <Text style={styles.cardValue}>{estatisticas.totalPedidos}</Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        <View style={[styles.card, styles.cardLaranja]}>
          <Text style={styles.cardLabel}> Pastéis Vendidos</Text>
          <Text style={styles.cardValue}>{estatisticas.totalItens}</Text>
        </View>

        <View style={[styles.card, styles.cardRoxo]}>
          <Text style={styles.cardLabel}> Ticket Médio</Text>
          <Text style={styles.cardValue}>
            R$ {estatisticas.ticketMedio.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Pastel Mais Vendido */}
      {estatisticas.pastelMaisVendido && (
        <View style={styles.destaque}>
          <Text style={styles.destaqueTitle}>Mais Vendido</Text>
          <Text style={styles.destaqueNome}>
            {estatisticas.pastelMaisVendido.nome}
          </Text>
          <Text style={styles.destaqueInfo}>
            {estatisticas.pastelMaisVendido.quantidade} unidades vendidas
          </Text>
          <Text style={styles.destaqueInfo}>
            Receita: R$ {estatisticas.pastelMaisVendido.receita.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Gráfico de Barras Customizado */}
      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitle}> Vendas por Pastel</Text>

        <View style={styles.barrasContainer}>
          {estatisticas.vendasPorPastel.map((item, index) => {
            const percentual = (item.quantidade / estatisticas.totalItens) * 100;
            const larguraBarra = `${percentual}%`;

            return (
              <View key={index} style={styles.barraWrapper}>
                <View style={styles.barraInfo}>
                  <View
                    style={[
                      styles.barraCor,
                      { backgroundColor: CORES_GRAFICO[index % CORES_GRAFICO.length] },
                    ]}
                  />
                  <Text style={styles.barraNome} numberOfLines={1}>
                    {item.nome}
                  </Text>
                </View>

                <View style={styles.barraGrafico}>
                  <View
                    style={[
                      styles.barraPreenchimento,
                      {
                        width: larguraBarra,
                        backgroundColor: CORES_GRAFICO[index % CORES_GRAFICO.length],
                      },
                    ]}
                  >
                    <Text style={styles.barraTexto}>
                      {item.quantidade} ({percentual.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tabela Detalhada */}
      <View style={styles.tabelaContainer}>
        <Text style={styles.tabelaTitle}>Detalhamento</Text>

        {estatisticas.vendasPorPastel.map((item, index) => (
          <View key={index} style={styles.tabelaRow}>
            <View style={styles.tabelaInfo}>
              <View
                style={[
                  styles.tabelaCor,
                  { backgroundColor: CORES_GRAFICO[index % CORES_GRAFICO.length] },
                ]}
              />
              <View style={styles.tabelaTextos}>
                <Text style={styles.tabelaNome}>{item.nome}</Text>
                <Text style={styles.tabelaDetalhes}>
                  {item.quantidade} unid. • R$ {item.receita.toFixed(2)}
                </Text>
              </View>
            </View>
            <Text style={styles.tabelaPercentual}>
              {((item.quantidade / estatisticas.totalItens) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>

      {/* Ranking TOP 3 */}
      {estatisticas.vendasPorPastel.length >= 3 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>TOP 3 Mais Vendidos</Text>

          {estatisticas.vendasPorPastel.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.rankingItem}>
              <Text style={styles.rankingPosicao}>
                {index === 0 ? '1' : index === 1 ? '2' : '3'}
              </Text>
              <View style={styles.rankingInfo}>
                <Text style={styles.rankingNome}>{item.nome}</Text>
                <Text style={styles.rankingDetalhes}>
                  {item.quantidade} vendidos • R$ {item.receita.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardVerde: {
    backgroundColor: '#4CAF50',
  },
  cardAzul: {
    backgroundColor: '#2196F3',
  },
  cardLaranja: {
    backgroundColor: '#FF9800',
  },
  cardRoxo: {
    backgroundColor: '#9C27B0',
  },
  cardLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  destaque: {
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
  },
  destaqueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  destaqueNome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  destaqueInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  graficoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  graficoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  barrasContainer: {
    gap: 12,
  },
  barraWrapper: {
    marginBottom: 8,
  },
  barraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barraCor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  barraNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  barraGrafico: {
    height: 32,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barraPreenchimento: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 60,
  },
  barraTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabelaContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  tabelaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  tabelaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabelaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabelaCor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  tabelaTextos: {
    flex: 1,
  },
  tabelaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tabelaDetalhes: {
    fontSize: 13,
    color: '#666',
  },
  tabelaPercentual: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 12,
  },
  rankingContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankingPosicao: {
    fontSize: 32,
    marginRight: 16,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  rankingDetalhes: {
    fontSize: 14,
    color: '#666',
  },
});

export default EstatisticasScreen;