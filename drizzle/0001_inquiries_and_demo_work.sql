CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO projects (title, slug, description, category_id, thumbnail, video_url, featured, published, sort_order)
SELECT
  'A Quiet Morning',
  'demo-a-quiet-morning',
  'Demo edit using public sample footage. Replace this clearly marked demo with an original portfolio project.',
  id,
  '/demo/quiet-morning.svg',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  true,
  true,
  1
FROM categories
WHERE slug = 'cinematic-edits'
  AND NOT EXISTS (SELECT 1 FROM projects WHERE title = 'A Quiet Morning')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO projects (title, slug, description, category_id, thumbnail, video_url, featured, published, sort_order)
SELECT
  'Small Moments',
  'demo-small-moments',
  'Demo edit using public sample footage. Replace this clearly marked demo with an original portfolio project.',
  id,
  '/demo/small-moments.svg',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  true,
  true,
  2
FROM categories
WHERE slug = 'reels-shorts'
  AND NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Small Moments')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO projects (title, slug, description, category_id, thumbnail, video_url, featured, published, sort_order)
SELECT
  'Light in Bloom',
  'demo-light-in-bloom',
  'Demo edit using public sample footage. Replace this clearly marked demo with an original portfolio project.',
  id,
  '/demo/light-in-bloom.svg',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  false,
  true,
  3
FROM categories
WHERE slug = 'documentaries'
  AND NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Light in Bloom')
ON CONFLICT (slug) DO NOTHING;
