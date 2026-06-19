-- Beauty World Database Schema
-- Auto-generated initialization script

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60,
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('silver','gold','platinum')),
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  benefits JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS package_services (
  id SERIAL PRIMARY KEY,
  package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(package_id, service_id)
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  experience_years INTEGER DEFAULT 0,
  description TEXT,
  specialization VARCHAR(200),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  payment_method VARCHAR(30) DEFAULT 'pay_after_service' CHECK (payment_method IN ('pay_after_service','online')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_reference VARCHAR(100),
  booking_date DATE NOT NULL,
  booking_time VARCHAR(10) NOT NULL,
  notes TEXT,
  offer_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_items (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  coupon_code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage','flat')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offer_services (
  id SERIAL PRIMARY KEY,
  offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_image VARCHAR(500),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_queries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mobile VARCHAR(15),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  slot_time VARCHAR(10) NOT NULL UNIQUE,
  max_bookings INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_code ON offers(coupon_code);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);

-- ============================================================
-- TRIGGER FUNCTION FOR updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Idempotent upgrades for existing databases
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'pay_after_service';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_method_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_method_check CHECK (payment_method IN ('pay_after_service','online'));
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('unpaid','paid','failed','refunded'));

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin (password: 123456789)
INSERT INTO admins (name, email, password, role) VALUES
('Beauty World Admin', 'abc@gmail.com', '$2b$12$LcWCqqiQW0IPfr12TM/8kuVU4hmaO7hr9N3Da17z6nznjvQMGOxni', 'super_admin')
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Categories
INSERT INTO categories (name, description) VALUES
('Hair Services', 'Professional hair treatments and styling'),
('Skin & Face', 'Facial treatments and skin care'),
('Makeup', 'Professional makeup services'),
('Nail Care', 'Manicure, pedicure and nail art'),
('Body Care', 'Waxing, threading and body treatments')
ON CONFLICT DO NOTHING;

-- Services
INSERT INTO services (category_id, name, description, duration, original_price, discounted_price, image_url) VALUES
(1, 'Hair Spa', 'Deep conditioning treatment that repairs and nourishes hair from roots to tips, restoring natural shine and softness.', 90, 1200.00, 999.00, 'https://images.unsplash.com/photo-1560066984-138daaa0a1b0?w=400'),
(1, 'Hair Cut', 'Precision haircut by expert stylists tailored to your face shape and lifestyle for a perfect look.', 45, 500.00, 399.00, 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=400'),
(1, 'Hair Coloring', 'Professional hair coloring using premium brands for vibrant, long-lasting color with minimal damage.', 120, 2500.00, 1999.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'),
(1, 'Hair Smoothening', 'Advanced smoothening treatment that eliminates frizz and adds incredible shine for up to 6 months.', 180, 4500.00, 3599.00, 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400'),
(1, 'Hair Straightening', 'Permanent hair straightening treatment for silky smooth, manageable hair that lasts for months.', 180, 5000.00, 3999.00, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400'),
(2, 'Facial', 'Customized facial treatment to cleanse, exfoliate and nourish skin for a radiant, healthy glow.', 75, 1500.00, 1199.00, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'),
(2, 'Cleanup', 'Deep pore cleansing treatment to remove impurities, blackheads and dead skin cells for fresh skin.', 45, 800.00, 649.00, 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400'),
(2, 'D-Tan', 'Effective de-tanning treatment to remove sun tan and restore your natural skin complexion.', 60, 1000.00, 799.00, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400'),
(3, 'Bridal Makeup', 'Complete bridal makeover with long-lasting professional makeup for your most special day.', 180, 8000.00, 6999.00, 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400'),
(3, 'Party Makeup', 'Glamorous party makeup for any occasion - from subtle elegance to bold statement looks.', 90, 2500.00, 1999.00, 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400'),
(4, 'Manicure', 'Classic manicure including nail shaping, cuticle care, hand massage, and polish application.', 45, 600.00, 499.00, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'),
(4, 'Pedicure', 'Relaxing pedicure with foot soak, scrub, nail care, and moisturizing treatment for beautiful feet.', 60, 800.00, 649.00, 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400'),
(4, 'Nail Extension', 'Professional nail extensions using premium acrylic or gel for strong, beautiful long nails.', 90, 2000.00, 1599.00, 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=400'),
(4, 'Nail Art', 'Creative and intricate nail art designs by expert nail artists for stunning, unique nails.', 60, 1200.00, 999.00, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400'),
(5, 'Waxing', 'Smooth, long-lasting hair removal using premium quality wax for silky skin that lasts 3-4 weeks.', 60, 800.00, 649.00, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'),
(5, 'Threading', 'Precise eyebrow and facial threading for clean, defined shape using natural cotton thread.', 20, 200.00, 149.00, 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400')
ON CONFLICT DO NOTHING;

-- Packages
INSERT INTO packages (name, description, type, original_price, discounted_price, benefits) VALUES
('Silver Package', 'Perfect starter package for everyday grooming and basic beauty care needs.', 'silver', 3500.00, 2999.00, '["Haircut", "Basic Facial", "Threading (Eyebrows)", "Classic Manicure", "10% off on additional services", "Valid for 1 visit"]'),
('Gold Package', 'Comprehensive beauty package for a complete head-to-toe transformation experience.', 'gold', 6000.00, 4999.00, '["Hair Spa Treatment", "Advanced Facial", "Full Waxing", "Classic Manicure & Pedicure", "Hair Coloring (Basic)", "Threading", "15% off on additional services", "Valid for 2 visits"]'),
('Platinum Package', 'Ultimate luxury experience with premium services for the most discerning beauty enthusiast.', 'platinum', 10000.00, 7999.00, '["Bridal/Party Makeup", "Hair Smoothening", "Premium Facial", "Full Body Waxing", "Nail Extension + Art", "Pedicure Spa", "D-Tan Treatment", "20% off on additional services", "Priority Booking", "Valid for 3 visits"]')
ON CONFLICT DO NOTHING;

-- Package Services (Silver: services 2,6,16,11 | Gold: services 1,6,14,11,12,3,16 | Platinum: services 9,4,6,14,13,12,8)
INSERT INTO package_services (package_id, service_id) VALUES
(1, 2), (1, 6), (1, 16), (1, 11),
(2, 1), (2, 6), (2, 15), (2, 11), (2, 12), (2, 3), (2, 16),
(3, 9), (3, 4), (3, 6), (3, 15), (3, 13), (3, 12), (3, 8)
ON CONFLICT DO NOTHING;

-- Staff
INSERT INTO staff (name, designation, experience_years, description, specialization, image_url) VALUES
('Priya Sharma', 'Senior Hair Stylist', 8, 'Expert in modern and traditional hair styling with expertise in all hair types and textures.', 'Hair Coloring, Hair Spa, Smoothening', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300'),
('Rahul Verma', 'Hair Master', 6, 'Specialized in precision cuts and international hair styling techniques for men and women.', 'Haircut, Straightening, Keratin Treatment', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'),
('Kavya Nair', 'Lead Makeup Artist', 10, 'Award-winning makeup artist with expertise in bridal, editorial and film makeup.', 'Bridal Makeup, Airbrush, HD Makeup', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300'),
('Ananya Patel', 'Makeup Artist', 5, 'Creative makeup artist specializing in glamour and party looks with a modern aesthetic.', 'Party Makeup, Eye Makeup, Contouring', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300'),
('Deepa Krishnan', 'Nail Art Specialist', 7, 'Certified nail technician with expertise in 3D nail art and gel extensions.', 'Nail Art, Gel Extensions, Nail Design', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'),
('Meera Joshi', 'Nail Technician', 4, 'Passionate nail artist creating beautiful and long-lasting nail designs for every occasion.', 'Acrylic Extensions, Classic Manicure, Nail Stamping', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300'),
('Dr. Sunita Reddy', 'Senior Skin Expert', 12, 'Certified esthetician with expertise in advanced skin treatments and anti-aging therapies.', 'Anti-aging Facials, Skin Analysis, Chemical Peels', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'),
('Ritu Malhotra', 'Facial Therapist', 5, 'Skin care specialist trained in European and Ayurvedic facial techniques.', 'Hydrafacials, D-Tan, Cleanup', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300')
ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO testimonials (customer_name, customer_image, rating, review) VALUES
('Shreya Kapoor', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100', 5, 'Absolutely amazing experience at Beauty World! The bridal makeup done by Kavya was beyond my expectations. I felt like a princess on my wedding day. The staff is incredibly professional and skilled.'),
('Aisha Khan', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 5, 'I have been coming to Beauty World for 2 years now. The hair spa treatment transformed my damaged hair completely. Priya knows exactly what your hair needs. Highly recommend the Gold Package!'),
('Preethi Rao', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 5, 'Best nail art salon in the city! Deepa created the most intricate nail designs for my anniversary. The salon atmosphere is so luxurious. Worth every penny!'),
('Divya Mehta', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100', 4, 'Dr. Sunita did my advanced facial and the results were visible from the very first session. My skin is now glowing and so much more even-toned. The Platinum package is absolutely worth it!'),
('Kritika Singh', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100', 5, 'The hair smoothening treatment by Rahul was perfect. No more frizzy hair for 6 months! The pricing is very reasonable compared to other salons. Beauty World is my go-to place for all beauty needs.')
ON CONFLICT DO NOTHING;

-- Time Slots
INSERT INTO time_slots (slot_time, max_bookings) VALUES
('09:00 AM', 3), ('10:00 AM', 3), ('11:00 AM', 3), ('12:00 PM', 3),
('01:00 PM', 3), ('02:00 PM', 3), ('03:00 PM', 3), ('04:00 PM', 3),
('05:00 PM', 3), ('06:00 PM', 3), ('07:00 PM', 3)
ON CONFLICT DO NOTHING;

-- Offers
INSERT INTO offers (title, description, coupon_code, discount_type, discount_value, min_amount, max_discount, start_date, end_date) VALUES
('Welcome Offer', 'Get 10% off on your first booking at Beauty World!', 'WELCOME10', 'percentage', 10.00, 500.00, 500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days'),
('Weekend Special', 'Flat 15% off on all services every weekend!', 'WEEKEND15', 'percentage', 15.00, 1000.00, 800.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Grand Sale', 'Flat Rs.500 off on orders above Rs.3000!', 'SAVE500', 'flat', 500.00, 3000.00, 500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days'),
('Festive Offer', 'Celebrate with 20% off on all packages!', 'FESTIVE20', 'percentage', 20.00, 2000.00, 1500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days')
ON CONFLICT DO NOTHING;
