-- First check if video_type is text and convert to enum if needed
-- Create the enum first
CREATE TYPE video_type_enum AS ENUM ('youtube', 'local', 'cloudflare');

-- Add Cloudflare-specific fields to video_lessons table
ALTER TABLE public.video_lessons 
ADD COLUMN IF NOT EXISTS cloudflare_stream_id text,
ADD COLUMN IF NOT EXISTS cloudflare_account_id text;

-- Update video_type column to use enum if it's currently text
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'video_lessons' 
               AND column_name = 'video_type' 
               AND data_type = 'text') THEN
        -- Temporarily add the new enum column
        ALTER TABLE public.video_lessons ADD COLUMN video_type_new video_type_enum;
        
        -- Copy data from text to enum, default unknown values to 'youtube'
        UPDATE public.video_lessons 
        SET video_type_new = CASE 
            WHEN video_type = 'youtube' THEN 'youtube'::video_type_enum
            WHEN video_type = 'local' THEN 'local'::video_type_enum
            ELSE 'youtube'::video_type_enum
        END;
        
        -- Drop old column and rename new one
        ALTER TABLE public.video_lessons DROP COLUMN video_type;
        ALTER TABLE public.video_lessons RENAME COLUMN video_type_new TO video_type;
        
        -- Set default and not null constraint
        ALTER TABLE public.video_lessons ALTER COLUMN video_type SET DEFAULT 'youtube'::video_type_enum;
        ALTER TABLE public.video_lessons ALTER COLUMN video_type SET NOT NULL;
    END IF;
END
$$;

-- Add constraints for video fields
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