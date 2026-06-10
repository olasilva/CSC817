-- Products table
CREATE TABLE products (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 0,
    location VARCHAR(255) DEFAULT 'Main Store',
    image_url TEXT,
    description TEXT,
    min_stock INTEGER DEFAULT 2,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkouts table
CREATE TABLE checkouts (
    id VARCHAR(20) PRIMARY KEY,
    product_id VARCHAR(20) REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(50),
    category VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    ref_number VARCHAR(100) NOT NULL,
    assigned_to VARCHAR(255),
    department VARCHAR(100),
    notes TEXT,
    checked_out_by UUID REFERENCES auth.users(id),
    checked_out_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restock log table
CREATE TABLE restock_log (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(20) REFERENCES products(id) ON DELETE CASCADE,
    quantity_added INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    source VARCHAR(255),
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    product_id VARCHAR(20) REFERENCES products(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_checkouts_product_id ON checkouts(product_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_type ON activity_log(type);

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by authenticated users"
ON products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Products can be created by admins and managers"
ON products FOR INSERT
TO authenticated
WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Products can be updated by admins and managers"
ON products FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Products can be deleted by admins only"
ON products FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- Checkouts policies
CREATE POLICY "Checkouts are viewable by authenticated users"
ON checkouts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Checkouts can be created by authenticated users"
ON checkouts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Checkouts can be deleted by authenticated users"
ON checkouts FOR DELETE
TO authenticated
USING (true);

-- Activity log policies
CREATE POLICY "Activity log viewable by authenticated users"
ON activity_log FOR SELECT
TO authenticated
USING (true);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp'))
);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();