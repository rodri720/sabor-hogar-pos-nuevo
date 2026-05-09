import PDFDocument from 'pdfkit'
import fs from 'fs'

export const generarTicket = (pedido, detalles, factura) => {
  const filePath = `./tickets/factura-${factura.numeroFactura}.pdf`

  const doc = new PDFDocument({ margin: 30 })
  doc.pipe(fs.createWriteStream(filePath))

  doc.fontSize(18).text('Sabor Hogar', { align: 'center' })
  doc.moveDown()

  doc.fontSize(12).text(`Factura B`)
  doc.text(`N°: ${factura.numeroFactura}`)
  doc.text(`CAE: ${factura.cae}`)
  doc.text(`Vto CAE: ${factura.vencimientoCAE}`)
  doc.moveDown()

  detalles.forEach(item => {
    doc.text(`${item.nombre} x${item.cantidad} - $${item.subtotal}`)
  })

  doc.moveDown()
  doc.text(`TOTAL: $${pedido.total}`, { align: 'right' })

  doc.end()

  return filePath
}