// src/services/PrinterService.js
import {
  BluetoothEscposPrinter,
  BluetoothManager,
} from 'react-native-bluetooth-escpos-printer';

class PrinterService {
  constructor() {
    this.impressoraConectada = null;
  }

  // Inicializar Bluetooth
  async inicializarBluetooth() {
    try {
      await BluetoothManager.enableBluetooth();
      return { success: true };
    } catch (error) {
      console.error('Erro ao inicializar Bluetooth:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se impressora está conectada
  async isConnected() {
    try {
      const connected = await BluetoothManager.isBluetoothEnabled();
      return connected;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  }

  // Listar dispositivos Bluetooth pareados
  async listarDispositivosPareados() {
    try {
      const pareados = await BluetoothManager.pairedDevices();
      const dispositivos = JSON.parse(pareados);
      console.log('Dispositivos pareados:', dispositivos);
      return dispositivos;
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error);
      return [];
    }
  }

  // Buscar impressoras (procurar novos dispositivos)
  async buscarImpressoras() {
    try {
      await BluetoothManager.enableBluetooth();
      const dispositivos = await BluetoothManager.scanDevices();
      const parsed = JSON.parse(dispositivos);
      
      // Filtrar apenas impressoras
      const impressoras = parsed.paired || [];
      console.log('Impressoras encontradas:', impressoras);
      return impressoras;
    } catch (error) {
      console.error('Erro ao buscar impressoras:', error);
      return [];
    }
  }

  // Conectar à impressora
  async conectarImpressora(macAddress) {
    try {
      console.log('Tentando conectar:', macAddress);
      await BluetoothManager.connect(macAddress);
      this.impressoraConectada = macAddress;
      console.log('✅ Conectado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      return { success: false, error: error.message };
    }
  }

  // Conectar automaticamente com impressora já pareada
  async conectarAutomaticamente() {
    try {
      const pareados = await this.listarDispositivosPareados();
      
      // Procurar impressora térmica
      const impressora = pareados.find(
        (d) =>
          d.name &&
          (d.name.toLowerCase().includes('printer') ||
            d.name.toLowerCase().includes('thermal') ||
            d.name.toLowerCase().includes('rpp') ||
            d.name.toLowerCase().includes('bluetooth'))
      );

      if (impressora) {
        console.log('Impressora encontrada:', impressora.name);
        const resultado = await this.conectarImpressora(impressora.address);
        return resultado;
      } else {
        return {
          success: false,
          error: 'Nenhuma impressora pareada encontrada',
        };
      }
    } catch (error) {
      console.error('Erro ao conectar automaticamente:', error);
      return { success: false, error: error.message };
    }
  }

  // Imprimir pedido
  async imprimirPedido(pedido) {
    try {
      console.log('📄 Iniciando impressão do pedido:', pedido.id);

      // Tentar conectar automaticamente se não estiver conectado
      const conectado = await this.isConnected();
      if (!conectado) {
        console.log('Tentando conectar automaticamente...');
        const resultado = await this.conectarAutomaticamente();
        if (!resultado.success) {
          return resultado;
        }
      }

      // Cabeçalho
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText(
        '================================\n',
        {}
      );
      await BluetoothEscposPrinter.printText('PASTELARIA DIEGOVES\n', {
        fonttype: 1,
        widthtimes: 2,
        heigthtimes: 2,
      });
      await BluetoothEscposPrinter.printText(
        '================================\n\n',
        {}
      );

      // Número do pedido
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText(`PEDIDO No ${pedido.id}\n`, {
        fonttype: 1,
        widthtimes: 1,
        heigthtimes: 1,
      });
      await BluetoothEscposPrinter.printText(`${pedido.data}\n\n`, {});

      // Alinhamento para itens
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
      );

      // Cabeçalho dos itens
      await BluetoothEscposPrinter.printText(
        '--------------------------------\n',
        {}
      );
      await BluetoothEscposPrinter.printText('ITEM             QTD    VALOR\n', {});
      await BluetoothEscposPrinter.printText(
        '--------------------------------\n',
        {}
      );

      // Itens do pedido
      for (const item of pedido.itens) {
        const qtd = pedido.quantidades[item.id];
        const subtotal = (item.preco * qtd).toFixed(2);

        // Formatar nome (max 17 caracteres para papel 58mm)
        let nome = item.nome;
        if (nome.length > 17) {
          nome = nome.substring(0, 14) + '...';
        }
        nome = nome.padEnd(17, ' ');

        const qtdStr = `${qtd}`.padStart(3, ' ');
        const valorStr = `${subtotal}`.padStart(8, ' ');

        await BluetoothEscposPrinter.printText(
          `${nome}${qtdStr}  R$${valorStr}\n`,
          {}
        );
      }

      // Total
      await BluetoothEscposPrinter.printText(
        '--------------------------------\n',
        {}
      );
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.RIGHT
      );
      await BluetoothEscposPrinter.printText(
        `TOTAL: R$ ${pedido.total.toFixed(2)}\n\n`,
        {
          fonttype: 1,
          widthtimes: 1,
          heigthtimes: 1,
        }
      );

      // Rodapé
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText(
        '================================\n',
        {}
      );
      await BluetoothEscposPrinter.printText(
        'Obrigado pela preferencia!\n',
        {}
      );
      await BluetoothEscposPrinter.printText(
        '================================\n\n\n',
        {}
      );

      // Tentar cortar papel (se impressora suportar)
      try {
        await BluetoothEscposPrinter.cutPaper();
      } catch (e) {
        console.log('Impressora não suporta corte automático');
      }

      console.log('✅ Impressão concluída!');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao imprimir:', error);
      return { success: false, error: error.message };
    }
  }

  // Imprimir teste
  async imprimirTeste() {
    try {
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText('TESTE DE IMPRESSAO\n\n', {
        fonttype: 1,
        widthtimes: 2,
        heigthtimes: 2,
      });
      await BluetoothEscposPrinter.printText('Impressora conectada!\n', {});
      await BluetoothEscposPrinter.printText('Sistema funcionando.\n\n\n', {});

      return { success: true };
    } catch (error) {
      console.error('Erro ao imprimir teste:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PrinterService();