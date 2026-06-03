import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ticketsDir = path.join(__dirname, '../../tickets');

export const limpiarTicketsViejos = (diasAMantener = 7) => {
  if (!fs.existsSync(ticketsDir)) return;
  const ahora = Date.now();
  const limite = ahora - (diasAMantener * 24 * 60 * 60 * 1000);

  fs.readdir(ticketsDir, (err, archivos) => {
    if (err) return;
    archivos.forEach(archivo => {
      const ruta = path.join(ticketsDir, archivo);
      fs.stat(ruta, (err, stats) => {
        if (err) return;
        if (stats.isFile() && stats.mtimeMs < limite) {
          fs.unlink(ruta, (err) => {
            if (err) console.error(`Error borrando ${archivo}:`, err);
            else console.log(`🗑️ Ticket viejo eliminado: ${archivo}`);
          });
        }
      });
    });
  });
};