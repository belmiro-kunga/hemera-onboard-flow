-- Add Cloudflare Stream support to video_lessons table
ALTER TYPE video_type_enum ADD VALUE IF NOT EXISTS 'cloudflare';

-- Add Cloudflare-specific fields to video_lessons table
ALTER TABLE public.video_lessons 
ADD COLUMN IF NOT EXISTS cloudflare_stream_id text,
ADD COLUMN IF NOT EXISTS cloudflare_account_id text;

-- Add constraints for Cloudflare Stream videos
CREATE OR REPLACE FUNCTION validate_video_lesson_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate YouTube videos have video_url
  IF NEW.video_type = 'youtube' AND (NEW.video_url IS NULL OR NEW.video_url = '') THEN
    RAISE EXCEPTION 'YouTube videos must have a video_url';
  END IF;
  
  -- Validate local videos have video_url
  IF NEW.video_type = 'local' AND (NEW.video_url IS NULL OR NEW.video_url = '') THEN
    RAISE EXCEPTION 'Local videos must have a video_url';
  END IF;
  
  -- Validate Cloudflare videos have required fields
  IF NEW.video_type = 'cloudflare' THEN
    IF NEW.cloudflare_stream_id IS NULL OR NEW.cloudflare_stream_id = '' THEN
      RAISE EXCEPTION 'Cloudflare videos must have a cloudflare_stream_id';
    END IF;
    IF NEW.cloudflare_account_id IS NULL OR NEW.cloudflare_account_id = '' THEN
      RAISE EXCEPTION 'Cloudflare videos must have a cloudflare_account_id';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_video_lesson_fields_trigger ON public.video_lessons;
CREATE TRIGGER validate_video_lesson_fields_trigger
  BEFORE INSERT OR UPDATE ON public.video_lessons
  FOR EACH ROW EXECUTE FUNCTION validate_video_lesson_fields();