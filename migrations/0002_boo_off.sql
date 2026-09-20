-- 2026 instance: Boo-Off branding from the fall invite
UPDATE competitions
SET
  name = 'Boo-Off',
  tagline = 'Fall Brew Off & Halloween Party',
  theme_id = '2026',
  updated_at = datetime('now')
WHERE id = '2026';
