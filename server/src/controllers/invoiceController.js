import { Arca } from '@arcasdk/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para usar __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const crearFactura = async (req, res) => {
  try {
    // 1. Carga los archivos de tu certificado y clave
    // Reemplaza 'homologacion' por 'produccion' cuando corresponda
    const certPath = path.join(__dirname, '../certs/homologacion.crt');
    const keyPath = path.join(__dirname, '../certs/homologacion.key');
    
    const cert = fs.readFileSync(certPath, 'utf8');
    const key = fs.readFileSync(keyPath, 'utf8');

    // 2. Instancia la clase Arca con tus credenciales
    // En este ejemplo se usa un CUIT de pruebas (20409378472)
    // Cuando pases a producción, reemplázalo por tu CUIT real (27-21983808-0)
    const arca = new Arca({
      cuit: 20409378472, // CUIT del negocio
      cert: cert,
      key: key,
    });

    // Aquí `req.body` debería contener la información de la venta que viene del frontend
    const { total, iva, neto, puntoDeVenta = 1 } = req.body; 

    // Punto de venta configurado en ARCA para este local. Por defecto es 1.

    // 3. Obtén el último número de comprobante para no repetirlo
    const tipoComprobante = 6; // 6 = Factura B (Consumidor Final)[reference:3]
    const ultimoComprobante = await arca.electronicBillingService.getLastVoucher(
      puntoDeVenta,
      tipoComprobante
    );
    const numeroComprobante = ultimoComprobante + 1;

    // 4. Prepara los datos de la factura según lo que viene del frontend
    const fecha = new Date();
    // Formato YYYYMMDD requerido por ARCA
    const fechaFormateada = parseInt(
      fecha.toISOString().slice(0, 10).replace(/-/g, '')
    );

    const data = {
      CantReg: 1, // Cantidad de comprobantes a registrar
      PtoVta: puntoDeVenta, // Punto de venta
      CbteTipo: tipoComprobante, // Tipo de comprobante: 6 = Factura B
      Concepto: 1, // Concepto: 1 = Productos
      DocTipo: 99, // Tipo de documento del comprador: 99 = Consumidor Final
      DocNro: 0, // Documento del comprador: 0 para Consumidor Final
      CbteDesde: numeroComprobante, // Número del comprobante
      CbteHasta: numeroComprobante, // Número del comprobante
      CbteFch: fechaFormateada, // Fecha del comprobante (formato YYYYMMDD)
      ImpTotal: total, // Importe total del comprobante (debe coincidir en los cálculos)
      ImpTotConc: 0, // Importe neto no gravado
      ImpNeto: neto, // Importe neto gravado calculado (monto neto)
      ImpOpEx: 0, // Importe exento de IVA
      ImpIVA: iva, // Importe total de IVA (debe coincidir con la suma de los ítems de IVA)
      ImpTrib: 0, // Importe de tributos
      MonId: 'PES', // Moneda: PES = Peso Argentino
      MonCotiz: 1, // Cotización (1 si es en pesos)
      Iva: [ // Detalle de los ítems de IVA (si corresponde, en este caso 21%)
        {
          Id: 5, // 5 = IVA 21%
          BaseImp: neto, // Base imponible para este ítem de IVA
          Importe: iva, // Importe del IVA para este ítem
        },
      ],
    };

    // 5. Ejecuta la creación del comprobante
    const result = await arca.electronicBillingService.createVoucher(data);
    
    // 6. Maneja la respuesta de ARCA. Si todo está bien, result contiene el CAE.
    console.log(`✅ Factura creada. CAE: ${result.CAE}`);
    // Aquí guardarías el número de factura y el CAE resultante en tu base de datos
    // junto con los datos de la venta.

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: {
        numeroFactura: numeroComprobante, // o el número que devuelva ARCA
        cae: result.CAE,
        vencimientoCAE: result.CAEFchVto,
      },
    });

  } catch (error) {
    console.error('Error al facturar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};