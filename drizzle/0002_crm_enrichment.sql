ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name text NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS year text NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'Editor';

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author text NOT NULL,
  role text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS categories_sort_idx ON categories (sort_order);
CREATE INDEX IF NOT EXISTS projects_published_sort_idx ON projects (published, sort_order);
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category_id);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects (featured);
CREATE INDEX IF NOT EXISTS inquiries_status_created_idx ON inquiries (status, created_at);
CREATE INDEX IF NOT EXISTS inquiries_unread_idx ON inquiries (is_read);
CREATE INDEX IF NOT EXISTS testimonials_published_sort_idx ON testimonials (published, sort_order);
CREATE INDEX IF NOT EXISTS offerings_published_sort_idx ON offerings (published, sort_order);

INSERT INTO offerings (title, description, published, sort_order)
SELECT * FROM (
  VALUES
    ('Short-form & social', 'Reels, shorts, and creator cuts with pacing that holds attention.', true, 1),
    ('Documentary editing', 'Longer stories shaped with patience, structure, and emotional clarity.', true, 2),
    ('Real estate films', 'Spaces that feel lived-in — light, movement, and a sense of place.', true, 3),
    ('Commercial & promo', 'Brand films and promos with a clean finish and a memorable beat.', true, 4),
    ('Cinematic storytelling', 'Narrative edits that treat every look, breath, and cut as part of the story.', true, 5),
    ('YouTube & creator edits', 'Channel-ready videos with rhythm, retention, and a finish that matches your voice.', true, 6)
) AS seed(title, description, published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM offerings);

INSERT INTO testimonials (quote, author, role, published, sort_order)
SELECT * FROM (
  VALUES
    ('Saurav finds the feeling in the footage. The cut was tighter, warmer, and more like us than we expected.', 'Alex Morgan', 'Independent filmmaker', true, 1),
    ('Clear communication, thoughtful pacing, and a final delivery that needed almost nothing back.', 'Priya Shah', 'Brand producer', true, 2),
    ('He treated a simple real-estate walkthrough like a short film. That care shows.', 'James Okonkwo', 'Studio lead', true, 3)
) AS seed(quote, author, role, published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);
