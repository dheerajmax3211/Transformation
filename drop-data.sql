-- Run this in your Supabase SQL Editor to delete all data from the tables
-- WARNING: This will permanently delete all your logged data.

TRUNCATE TABLE daily_log, exercise_baseline, exercise_weight_log CASCADE;
