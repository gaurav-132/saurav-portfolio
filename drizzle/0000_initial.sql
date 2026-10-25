CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  thumbnail text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Reels & Shorts', 'reels-shorts', 1),
  ('Documentaries', 'documentaries', 2),
  ('Real Estate', 'real-estate', 3),
  ('Commercials & Ads', 'commercials-ads', 4),
  ('Cinematic Edits', 'cinematic-edits', 5),
  ('Other', 'other', 6)
ON CONFLICT (slug) DO NOTHING;
