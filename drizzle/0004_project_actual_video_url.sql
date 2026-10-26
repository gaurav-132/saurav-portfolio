ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS actual_video_url text NOT NULL DEFAULT '';
