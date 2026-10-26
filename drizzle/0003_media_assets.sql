CREATE TABLE IF NOT EXISTS media_assets (
  object_key text PRIMARY KEY,
  original_file_name text NOT NULL,
  content_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
