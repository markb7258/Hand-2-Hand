-- Import profiles
INSERT INTO profiles (id, "userId", "displayName", "isAdmin", "createdAt", "updatedAt")
VALUES
  ('17d59a13-81a7-4d50-b0a9-fd0fe955138b', '17d59a13-81a7-4d50-b0a9-fd0fe955138b', NULL, false, NOW(), NOW()),
  ('3a4b4600-1d6c-403e-a8b5-c445d570edb0', '3a4b4600-1d6c-403e-a8b5-c445d570edb0', NULL, true, NOW(), NOW()),
  ('8b3047d8-54cb-4949-b4b8-b995b7209cfa', '18753726-f758-41c8-820b-6192c3bc90c8', 'ericreiss', true, NOW(), NOW()),
  ('0a5a53d2-1b7c-4461-8929-ac1fa70d808d', '600ba861-1e99-40f1-9c21-df297c74f65a', 'wifobeb199', false, NOW(), NOW()),
  ('5b8a0234-6710-4ec8-a797-e8047c30cecc', '7c0d3bf1-8a0d-40c2-a65c-175f438ec663', 'yibol88621', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Import countries
INSERT INTO countries (id, name, slug, population, groups, flag, "photoUrl", "countryDetails", "primaryContacts", "adminNotes", "createdAt", "updatedAt")
VALUES
  ('d9aa7fbb-298d-4a50-a2cd-578dfd1a826b', 'Argentina', 'argentina', '46,234,830', 12, '🇦🇷', NULL, NULL, NULL, NULL, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Import notes
INSERT INTO notes (id, "userId", "countrySlug", content, "updatedAt")
VALUES
  ('fda9cf71-b7e1-4c77-82d2-169a4e8afb03', '18753726-f758-41c8-820b-6192c3bc90c8', 'argentina', 'Test', to_timestamp(1764696620498 / 1000.0))
ON CONFLICT ("userId", "countrySlug") DO NOTHING;

-- Import gallery images
INSERT INTO gallery_images (id, "countrySlug", "imageUrl", "order", "createdAt", "updatedAt")
VALUES
  ('e4967e9d-371c-450d-ba13-19adbde49b2e', 'argentina', '/demo-images/placeholder-1.jpg', 1, NOW(), NOW()),
  ('f5f2ff82-1ad7-428f-8258-21a9bb1480f0', 'argentina', '/demo-images/placeholder-2.jpg', 2, NOW(), NOW()),
  ('fefacf02-c02e-48fc-a888-23c30a654831', 'argentina', '/demo-images/placeholder-3.jpg', 3, NOW(), NOW()),
  ('859bb022-011f-4344-8228-cc4ea579a9af', 'argentina', '/demo-images/placeholder-4.jpg', 4, NOW(), NOW()),
  ('72445579-711c-4dfe-9831-e6b62e697dfd', 'argentina', '/demo-images/placeholder-5.jpg', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify import
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'countries', COUNT(*) FROM countries
UNION ALL
SELECT 'notes', COUNT(*) FROM notes
UNION ALL
SELECT 'gallery_images', COUNT(*) FROM gallery_images;
