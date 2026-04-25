import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    // 1. Insertar categorías
    await pool.query(`
      INSERT INTO categorias (nombre) VALUES
        ('Café'),
        ('Especiales'),
        ('Promo'),
        ('Comidas'),
        ('Bebidas'),
        ('Dulces y Porciones'),
        ('Desayunos y Meriendas')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 2. Productos individuales
    const productos = [
      // Café
      ['Café Chico', 2700, 'Café'],
      ['Café Jarrito', 3500, 'Café'],
      ['Café Doble', 4500, 'Café'],
      // Especiales
      ['Capuchino Chico', 4000, 'Especiales'],
      ['Capuchino Grande', 5000, 'Especiales'],
      ['Submarino Chico', 4000, 'Especiales'],
      ['Submarino Grande', 4800, 'Especiales'],
      // Promo
      ['2 Licuados + Tostados', 13500, 'Promo'],
      // Comidas
      ['Sándwich de Miga', 2500, 'Comidas'],
      // Bebidas
      ['Agua saborizada Fresh', 1800, 'Bebidas'],
      ['Agua mineral Villavicencio', 1800, 'Bebidas'],
      ['Gaseosa Pepsi', 1300, 'Bebidas'],
      ['Gaseosa Coca-Cola', 1800, 'Bebidas'],
      ['Fanta Naranja', 1800, 'Bebidas'],
      ['Sprite', 1800, 'Bebidas'],
      ['Gatorade', 2400, 'Bebidas'],
      ['Jugo Baggio', 1000, 'Bebidas'],
      ['Yogurt Mamfrey', 1500, 'Bebidas'],
      ['Yogurt Ilolay', 1200, 'Bebidas'],
      ['Yogurt La Serenísima', 1200, 'Bebidas'],
      ['Monster (amarillo)', 3500, 'Bebidas'],
      // Dulces y Porciones
      ['Alfajor de maicena', 500, 'Dulces y Porciones'],
      ['Porción de torta', 6000, 'Dulces y Porciones'],
      ['Porción de tarta', 4500, 'Dulces y Porciones'],
      ['Mini tarta', 6000, 'Dulces y Porciones'],
      ['Budín mini', 2500, 'Dulces y Porciones'],
      ['Budín', 4000, 'Dulces y Porciones'],
    ];

    for (const [nombre, precio, cat] of productos) {
      await pool.query(
        `INSERT INTO productos (nombre, precio, categoria_id)
         SELECT $1, $2, id FROM categorias WHERE nombre = $3`,
        [nombre, precio, cat]
      );
    }
    console.log('✅ Productos insertados');

    // 3. Combos desayunos/meriendas
    const combos = [
      ['Simple', 'Infusión + 2 criollos o medialunas + jugo', 5000],
      ['Light', 'Infusión + tostado (pan blanco o integral) + mermelada + queso crema + manteca + jugo', 9000],
      ['Completo', 'Infusión + 2 criollos o medialunas + mermelada o dulce de leche + manteca + jugo', 7500],
      ['Campestre', 'Infusión + pan de campo + dulce de leche o mermelada + manteca + queso y jamón + jugo', 10000],
      ['Fit', 'Infusión + jamón y queso + huevo revuelto o poché + tostada integral + queso crema + palta + jugo + granola con yogur', 13000],
      ['Fit Plus', 'Infusión + tostón de palta + huevo revuelto o poché + rúcula + queso crema + muffin saludable + jugo', 14000],
      ['Dulcero', 'Infusión + porción de torta + muffin del día', 9500],
    ];

    for (const [nombre, desc, precio] of combos) {
      await pool.query(
        'INSERT INTO combos (nombre, descripcion, precio) VALUES ($1, $2, $3)',
        [nombre, desc, precio]
      );
    }
    console.log('✅ Combos insertados');

    // 4. Mesas (15 mesas)
    for (let i = 1; i <= 15; i++) {
      await pool.query('INSERT INTO mesas (numero, capacidad) VALUES ($1, 4) ON CONFLICT (numero) DO NOTHING', [i]);
    }

    // 5. Mozos (5 mozos)
    const mozos = ['Mozo 1', 'Mozo 2', 'Mozo 3', 'Mozo 4', 'Mozo 5'];
    for (let i = 0; i < mozos.length; i++) {
      await pool.query(
        'INSERT INTO mozos (nombre, codigo) VALUES ($1, $2) ON CONFLICT (codigo) DO NOTHING',
        [mozos[i], i + 1]
      );
    }

    console.log('🎉 Seeding completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await pool.end();
  }
}

seed();