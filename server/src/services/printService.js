// Servicio de impresión térmica para tickets (con conexión diferida)
// No falla al arrancar si la impresora no está conectada

import escpos from 'escpos';
import escposUSB from 'escpos-usb';

let dispositivo = null;
let impresora = null;
let inicializado = false;

// Función que conecta la impresora solo cuando se necesita
async function conectarImpresora() {
    if (inicializado && dispositivo && impresora) {
        return { dispositivo, impresora };
    }

    return new Promise((resolve, reject) => {
        try {
            dispositivo = new escposUSB();
            const opciones = { encoding: "GB18030" }; // soporte para caracteres especiales
            impresora = new escpos.Printer(dispositivo, opciones);

            dispositivo.open((error) => {
                if (error) {
                    console.error("❌ No se pudo abrir la impresora:", error.message);
                    inicializado = false;
                    reject(error);
                } else {
                    console.log("✅ Impresora térmica conectada correctamente");
                    inicializado = true;
                    resolve({ dispositivo, impresora });
                }
            });
        } catch (err) {
            console.error("❌ Error al inicializar la impresora:", err.message);
            reject(err);
        }
    });
}

// Función principal que imprime el ticket (se exporta)
export const printTicket = async (ticketData) => {
    try {
        // Conectar la impresora (solo si no se había conectado antes)
        await conectarImpresora();
        
        // Si después de conectar sigue sin estar lista, lanzamos un aviso
        if (!inicializado || !impresora) {
            console.warn("⚠️ Impresora no disponible, el ticket no se imprimirá físicamente");
            return { mensaje: "Impresora no conectada, ticket solo en PDF" };
        }

        // Ahora sí, enviamos el ticket a la impresora
        return new Promise((resolve, reject) => {
            try {
                impresora
                    .font('a')
                    .align('ct')
                    .size(1, 1)
                    .text('SABOR HOGAR POS')
                    .text(`CUIT: ${process.env.AFIP_CUIT || '20367740842'}`)
                    .text('--------------------------------')
                    .align('lt')
                    .text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`)
                    .text(`Ticket #: ${ticketData.numeroTicket}`)
                    .text('--------------------------------')
                    .table(["Cant", "Producto", "Precio"]);

                // Itera sobre los productos del pedido
                ticketData.detalles.forEach(item => {
                    const subtotal = Number(item.subtotal).toFixed(2);
                    const nombreCorto = item.nombre.length > 20 ? item.nombre.substring(0, 17) + '...' : item.nombre;
                    impresora.table([item.cantidad, nombreCorto, `$${subtotal}`]);
                });

                impresora
                    .text('--------------------------------')
                    .align('rt')
                    .text(`TOTAL: $${Number(ticketData.total).toFixed(2)}`)
                    .align('ct')
                    .text('--------------------------------')
                    .text(`CAE: ${ticketData.cae}`)
                    .text('QR de Factura:')
                    .qrimage(ticketData.qrUrl, (err) => {
                        if (err) {
                            console.error('❌ Error imprimiendo el QR:', err);
                            reject(err);
                        } else {
                            impresora.cut();
                            impresora.close();
                            console.log("✅ Ticket impreso correctamente");
                            resolve({ mensaje: "Ticket impreso correctamente" });
                        }
                    });
            } catch (err) {
                reject(err);
            }
        });
    } catch (error) {
        console.error("❌ Error al intentar imprimir:", error.message);
        // No lanzamos la excepción, solo devolvemos un aviso
        return { mensaje: "No se pudo imprimir el ticket físico", error: error.message };
    }
};