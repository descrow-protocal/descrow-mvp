-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  account_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(18,8) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'sold')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(18,8) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('created', 'funded', 'shipped', 'delivered', 'completed', 'disputed')) DEFAULT 'created',
  contract_address VARCHAR(42),
  tracking_number VARCHAR(255),
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_seller_id ON products(seller_id);
