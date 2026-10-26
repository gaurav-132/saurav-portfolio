DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'projects'
      AND column_name = 'playback_source'
  ) THEN
    ALTER TABLE projects
      ADD COLUMN playback_source text NOT NULL DEFAULT 'uploaded';

    UPDATE projects
    SET playback_source = 'external'
    WHERE actual_video_url <> '';
  END IF;
END $$;
