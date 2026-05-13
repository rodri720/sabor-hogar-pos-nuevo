import db from '../db/pool.js';

// Estado derivado de pedidos abiertos (evita mesas “atascadas” en ocupada)
export const getMesas = async (req, res) => {
  try {
    const result = db.prepare(`
      SELECT m.id, m.numero,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM pedidos p
            WHERE p.mesa_id = m.id AND p.estado = 'abierto'
          ) THEN 'ocupada'
          ELSE 'libre'
        END AS estado
      FROM mesas m
      ORDER BY m.numero
    `).all();

    res.json(result);
  } catch (error) {
    console.error("🔥 ERROR getMesas:", error);
    res.status(500).json({ error: error.message });
  }
};

/** Vacía pedido abierto de la mesa sin cobrar (anula consumo en curso). */
export const liberarMesa = (req, res) => {
  const mesaId = Number(req.params.id);

  try {
    const mesa = db.prepare('SELECT id FROM mesas WHERE id = ?').get(mesaId);
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const tx = db.transaction(() => {
      const pedido = db
        .prepare(
          `SELECT id FROM pedidos WHERE mesa_id = ? AND estado = 'abierto'`
        )
        .get(mesaId);

      if (pedido) {
        db.prepare('DELETE FROM pedido_detalle WHERE pedido_id = ?').run(
          pedido.id
        );
        db.prepare('DELETE FROM pedidos WHERE id = ?').run(pedido.id);
      }
      db.prepare(`UPDATE mesas SET estado = 'libre' WHERE id = ?`).run(
        mesaId
      );
    });
    tx();

    res.json({ ok: true, message: 'Mesa liberada' });
  } catch (error) {
    console.error('🔥 ERROR liberarMesa:', error);
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE ESTADO =================
export const updateMesaEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  console.log("🔄 updateMesaEstado:", {
    mesaId: id,
    nuevoEstado: estado
  });

  try {
    const info = db
      .prepare('UPDATE mesas SET estado = ? WHERE id = ?')
      .run(estado, id);

    console.log("Resultado UPDATE:", info);

    if (info.changes === 0) {
      console.log("❌ No se actualizó ninguna mesa");
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const result = db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);

    console.log("✅ Estado actualizado:", result);

    res.json(result);

  } catch (error) {
    console.error("🔥 ERROR updateMesaEstado:", error);
    res.status(500).json({ error: error.message });
  }
};