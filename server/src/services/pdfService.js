import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ticketsDir = path.join(__dirname, '../../tickets')

const ETIQUETA_METODO = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  qr: 'QR / Mercado Pago',
}

export const generarTicket = (pedido, detalles, factura) => {
  const filePath = path.join(ticketsDir, `factura-${factura.numeroFactura}.pdf`)

  const doc = new PDFDocument({ margin: 30 })
  doc.pipe(fs.createWriteStream(filePath))

  doc.fontSize(18).text('Sabor Hogar', { align: 'center' })
  doc.moveDown()

  doc.fontSize(12).text(`Factura B`)
  doc.text(`N°: ${factura.numeroFactura}`)
  doc.text(`CAE: ${factura.cae}`)
  doc.text(`Vto CAE: ${factura.vencimientoCAE}`)
  if (pedido.metodo_pago) {
    const lbl = ETIQUETA_METODO[pedido.metodo_pago] || pedido.metodo_pago
    doc.text(`Forma de pago: ${lbl}`)
  }
  doc.moveDown()

  detalles.forEach(item => {
    doc.text(`${item.nombre} x${item.cantidad} - $${item.subtotal}`)
  })

  doc.moveDown()
  doc.text(`TOTAL: $${pedido.total}`, { align: 'right' })

  doc.end()

  return filePath
}