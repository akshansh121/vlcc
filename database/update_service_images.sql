-- Fix service images on an EXISTING (live) database.
-- init.sql only seeds a fresh DB, so run this once against the running DB to
-- correct the makeup image (was a nails photo) and give each nail service a
-- distinct image instead of the same one repeated.
--
-- Run on the server:
--   docker compose exec -T postgres psql -U beauty_admin -d beauty_world < database/update_service_images.sql

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400' WHERE name = 'Bridal Makeup';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400' WHERE name = 'Party Makeup';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400' WHERE name = 'Nail Art';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=400' WHERE name = 'Nail Extension';

-- Verify
SELECT name, image_url FROM services WHERE name IN ('Bridal Makeup','Party Makeup','Manicure','Nail Art','Nail Extension') ORDER BY name;
