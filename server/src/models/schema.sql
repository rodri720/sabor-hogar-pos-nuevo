-- Tabla de categorías de productos
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos (menú completo)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id),
    stock_control BOOLEAN DEFAULT false,
    stock_actual INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de combos (desayunos/meriendas)
CREATE TABLE combos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de mesas (15 mesas)
CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE,
    capacidad INTEGER DEFAULT 4,
    ubicacion VARCHAR(50),
    activa BOOLEAN DEFAULT true
);

-- Tabla de mozos (5 mozos)
CREATE TABLE mozos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo INTEGER NOT NULL UNIQUE, -- del 1 al 5
    activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS facturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER,
  numero INTEGER,
  cae TEXT,
  vencimiento_cae TEXT,
  total REAL,
  punto_venta INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
``

-- Tabla de ventas (encabezado de factura)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    mesa_id INTEGER REFERENCES mesas(id),
    mozo_id INTEGER REFERENCES mozos(id),
    fecha TIMESTAMP DEFAULT NOW(),
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20), -- 'efectivo', 'qr', 'transferencia', 'debito'
    estado VARCHAR(20) DEFAULT 'pendiente',
    cae VARCHAR(50), -- Código de Autorización Electrónica de ARCA
    numero_factura INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de detalle de venta
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    combo_id INTEGER REFERENCES combos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);