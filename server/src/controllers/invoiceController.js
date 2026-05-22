import { crearFacturaAFIP } from '../services/arcaService.js';
import pool from '../db/pool.js';

export const crearFactura = async (req, res) => {
  try {
    const { total, neto, iva, puntoDeVenta = 1, pedidoId } = req.body;

    // 1. Facturar en AFIP
    const factura = await crearFacturaAFIP({
      total,
      neto,
      iva,
      puntoDeVenta,
    });

    // 2. Guardar en DB (PostgreSQL)
    const { rows } = await pool.query(
      `INSERT INTO facturas 
       (pedido_id, numero, cae, vencimiento_cae, total, punto_venta)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        pedidoId,
        factura.numeroFactura,
        factura.cae,
        factura.vencimientoCAE,
        total,
        puntoDeVenta,
      ]
    );

    res.status(201).json({
      success: true,
      data: factura,
      facturaId: rows[0]?.id,
    });
  } catch (error) {
    console.error('Error AFIP:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};