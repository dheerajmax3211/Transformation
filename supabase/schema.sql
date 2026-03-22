create table daily_log (
  id uuid primary key default gen_random_uuid(),
  log_date date unique not null,
  breakfast_done boolean default false,
  lunch_done boolean default false,
  dinner_done boolean default false,
  morning_walk_done boolean default false,
  workout_done boolean default false,
  body_weight_kg numeric(4,1),
  photo_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table exercise_weight_log (
  id uuid primary key default gen_random_uuid(),
  log_date date not null,
  exercise_name text not null,
  weight_kg numeric(4,1) not null,
  sets_completed integer,
  created_at timestamptz default now(),
  unique(log_date, exercise_name)
);

create table exercise_baseline (
  exercise_name text primary key,
  starting_weight_kg numeric(4,1) not null,
  created_at timestamptz default now()
);

-- Enable RLS but allow all operations since it's a single-user app
alter table daily_log enable row level security;
alter table exercise_weight_log enable row level security;
alter table exercise_baseline enable row level security;

create policy "Allow all operations for daily_log" on daily_log for all using (true) with check (true);
create policy "Allow all operations for exercise_weight_log" on exercise_weight_log for all using (true) with check (true);
create policy "Allow all operations for exercise_baseline" on exercise_baseline for all using (true) with check (true);

-- Grant privileges to anon and authenticated roles
grant all privileges on table daily_log to anon, authenticated;
grant all privileges on table exercise_weight_log to anon, authenticated;
grant all privileges on table exercise_baseline to anon, authenticated;
