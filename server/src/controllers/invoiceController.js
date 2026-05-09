import { crearFacturaAFIP } from '../services/arcaService.js'
import db from '../db/pool.js'

export const crearFactura = async (req, res) => {
  try {
    const { total, neto, iva, puntoDeVenta = 1, pedidoId } = req.body

    // 1. Facturar en AFIP
    const factura = await crearFacturaAFIP({
      total,
      neto,
      iva,
      puntoDeVenta,
    })

    // 2. Guardar en DB ✅ (CLAVE)
    await db.run(
      `
      INSERT INTO facturas 
      (pedido_id, numero, cae, vencimiento_cae, total, punto_venta)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        pedidoId,
        factura.numeroFactura,
        factura.cae,
        factura.vencimientoCAE,
        total,
        puntoDeVenta,
      ]
    )

    res.status(201).json({
      success: true,
      data: factura,
    })
  } catch (error) {
    console.error('Error AFIP:', error)

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}