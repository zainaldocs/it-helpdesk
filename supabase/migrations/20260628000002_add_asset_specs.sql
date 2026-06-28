-- Add specifications column to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS specifications TEXT;
