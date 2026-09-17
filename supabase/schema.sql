-- =========================================================================
-- LE DÉSIR FRAGANCIAS - SCHEMA DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- =========================================================================

-- Habilitar extensión para UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. TABLA: FRAGANCIAS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fragrances (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL CHECK (category IN ('arabe', 'disenador', 'nicho', 'extra')),
    families TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    gallery TEXT[] DEFAULT '{}',
    top_notes TEXT[] NOT NULL DEFAULT '{}',
    heart_notes TEXT[] NOT NULL DEFAULT '{}',
    base_notes TEXT[] NOT NULL DEFAULT '{}',
    longevity TEXT NOT NULL,
    sillage TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Unisex', 'Masculino', 'Femenino')),
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    inspired_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_fragrances_category ON fragrances(category);
CREATE INDEX IF NOT EXISTS idx_fragrances_brand ON fragrances(brand);
CREATE INDEX IF NOT EXISTS idx_fragrances_featured ON fragrances(is_featured);

-- -------------------------------------------------------------------------
-- 2. TABLA: PRECIOS Y PRESENTACIONES (1:N)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decant_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fragrance_id TEXT NOT NULL REFERENCES fragrances(id) ON DELETE CASCADE,
    size TEXT NOT NULL CHECK (size IN ('5ml', '10ml', '100ml', 'unidad')),
    label TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) CHECK (original_price >= 0),
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decant_prices_fragrance ON decant_prices(fragrance_id);

-- -------------------------------------------------------------------------
-- 3. TABLA: BANNERS DEL CARRUSEL DE INICIO
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_accent TEXT,
    subtitle TEXT NOT NULL,
    badge TEXT,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    secondary_cta_text TEXT,
    secondary_cta_link TEXT,
    bg_gradient TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 4. TABLA: ÓRDENES Y PEDIDOS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT,
    customer_city TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('transfer', 'card', 'cash')),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(12, 2) DEFAULT 0 CHECK (discount >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    coupon_code TEXT,
    items JSONB NOT NULL,
    status TEXT DEFAULT 'pending_whatsapp' CHECK (status IN ('pending_whatsapp', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 5. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------------------------
ALTER TABLE fragrances ENABLE ROW LEVEL SECURITY;
ALTER TABLE decant_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Lectura pública para la tienda
CREATE POLICY "Public Read Fragrances" ON fragrances FOR SELECT USING (true);
CREATE POLICY "Public Read Decant Prices" ON decant_prices FOR SELECT USING (true);
CREATE POLICY "Public Read Banners" ON banners FOR SELECT USING (true);

-- Creación pública de órdenes (para que los clientes puedan registrar su pedido)
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);

-- Permisos completos para el rol de servicio / admin
CREATE POLICY "Admin All Fragrances" ON fragrances FOR ALL TO service_role USING (true);
CREATE POLICY "Admin All Decant Prices" ON decant_prices FOR ALL TO service_role USING (true);
CREATE POLICY "Admin All Banners" ON banners FOR ALL TO service_role USING (true);
CREATE POLICY "Admin All Orders" ON orders FOR ALL TO service_role USING (true);

-- -------------------------------------------------------------------------
-- 6. DATOS INICIALES (SEED DATA)
-- -------------------------------------------------------------------------
INSERT INTO fragrances (
    id, name, brand, subtitle, category, families, description, image,
    top_notes, heart_notes, base_notes, longevity, sillage, gender,
    is_featured, is_best_seller, is_new, stock, discount_percentage, inspired_by
) VALUES
(
    'khamrah-lattafa',
    'Khamrah',
    'Lattafa Perfumes',
    'Eau de Parfum • 100ml',
    'arabe',
    ARRAY['Gourmand / Dulce', 'Oriental / Especiado'],
    'La máxima expresión del lujo dulce oriental. Una apertura cálida de canela y nuez moscada que evoluciona hacia un corazón suntuoso de dátiles y praliné.',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    ARRAY['Canela', 'Nuez Moscada', 'Bergamota'],
    ARRAY['Dátiles', 'Praliné', 'Nardos'],
    ARRAY['Vainilla', 'Haba Tonka', 'Benjuí', 'Mirra'],
    'Modo Bestia (+12h)',
    'Pesada / Enorme',
    'Unisex',
    true, true, false, 14, 14,
    'Vibra Angels'' Share de Kilian (Coñac, Dátiles & Canela)'
),
(
    'asad-lattafa',
    'Asad',
    'Lattafa Perfumes',
    'Eau de Parfum • 100ml',
    'arabe',
    ARRAY['Oriental / Especiado', 'Amaderado'],
    'Carácter magnético y seductor. Pimienta negra y piña tostada con corazón de café, tabaco aromático y ámbar dorado.',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    ARRAY['Pimienta Negra', 'Piña Tostada', 'Tabaco Maduro'],
    ARRAY['Café Arábigo', 'Patchouli', 'Iris Florentino'],
    ARRAY['Ámbar Dorado', 'Vainilla', 'Maderas Secas'],
    'Larga Duración (8-12h)',
    'Pesada / Enorme',
    'Masculino',
    true, true, false, 18, 13,
    'Inspirado en la vibra de Sauvage Elixir de Dior'
),
(
    '9pm-afnan',
    '9 PM',
    'Afnan Perfumes',
    'Eau de Parfum • 100ml',
    'arabe',
    ARRAY['Gourmand / Dulce', 'Aromático / Fougère'],
    'El rey indiscutido de la noche. Manzana silvestre, canela y lavanda con una estela arrolladora de vainilla y ámbar.',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    ARRAY['Manzana Silvestre', 'Canela', 'Lavanda Salvaje'],
    ARRAY['Flor de Azahar', 'Lirio del Valle'],
    ARRAY['Vainilla de Madagascar', 'Haba Tonka', 'Ámbar Gris'],
    'Modo Bestia (+12h)',
    'Pesada / Enorme',
    'Masculino',
    true, true, false, 9, NULL,
    'Inspirado en Jean Paul Gaultier Ultra Male (Dulce & Fiesta)'
)
ON CONFLICT (id) DO NOTHING;

-- Precios para Khamrah
INSERT INTO decant_prices (fragrance_id, size, label, price, original_price, in_stock) VALUES
('khamrah-lattafa', '5ml', 'Decant 5ml (80 atomizaciones)', 7500, NULL, true),
('khamrah-lattafa', '10ml', 'Decant 10ml (160 atomizaciones)', 13500, NULL, true),
('khamrah-lattafa', '100ml', 'Frasco Completo Sellado 100ml', 68000, 79000, true)
ON CONFLICT DO NOTHING;

-- Banners iniciales
INSERT INTO banners (id, title, title_accent, subtitle, badge, cta_text, cta_link, image_url, is_active, sort_order) VALUES
('slide-1', 'L''Opulence d''Orient', 'Perfumería Árabe Exclusiva', 'Fragancias legendarias con estela arrolladora y fijación extrema. Notas de Oud real, dátiles caramelizados y ámbar.', '✨ Colección Dubai & Emiratos', 'Explorar Fragancias Árabes', '/catalogo?categoria=arabe', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80', true, 1)
ON CONFLICT (id) DO NOTHING;
