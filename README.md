# 4-Month Transformation Tracker 🚀

## The Mission

This project is a personal mission for myself to get fitter. As a software developer, what better way to find motivation than to build an app? I do what I do best—build—and then find the motivation for other things from it. 

This app serves as my personal accountability partner, designed exactly how I need it to track my daily habits, workouts, and progress over a 120-day fitness journey.

## Features

- **✅ Daily Habit Tracking:** Log meals, morning walks, and workouts.
- **🏋️‍♂️ Live Workout Mode:** Step-by-step workout execution with built-in rest timers and weight logging.
- **📈 Progression Graphs:** Visual tracking for body weight changes and strength gains over time.
- **📸 Transformation Gallery:** A visual timeline of daily progress photos.
- **📅 Calendar History:** Look back at past days to see consistency and streaks.
- **🗺️ Roadmap:** A phased breakdown of the 4-month journey to keep the end goal in sight.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A [Supabase](https://supabase.com/) account and project

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup (Supabase)

You will need to set up the database tables in your Supabase project. Go to the **SQL Editor** in your Supabase dashboard and run the following script:

```sql
-- Create Tables
create table if not exists daily_log (
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

create table if not exists exercise_weight_log (
  id uuid primary key default gen_random_uuid(),
  log_date date not null,
  exercise_name text not null,
  weight_kg numeric(4,1) not null,
  sets_completed integer,
  created_at timestamptz default now(),
  unique(log_date, exercise_name)
);

create table if not exists exercise_baseline (
  exercise_name text primary key,
  starting_weight_kg numeric(4,1) not null,
  created_at timestamptz default now()
);

-- Enable RLS and Policies
alter table daily_log enable row level security;
alter table exercise_weight_log enable row level security;
alter table exercise_baseline enable row level security;

create policy "Allow all operations for daily_log" on daily_log for all using (true) with check (true);
create policy "Allow all operations for exercise_weight_log" on exercise_weight_log for all using (true) with check (true);
create policy "Allow all operations for exercise_baseline" on exercise_baseline for all using (true) with check (true);

-- Storage Bucket for Photos
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'progress-photos' );
create policy "Anon Uploads" on storage.objects for insert with check ( bucket_id = 'progress-photos' );
create policy "Anon Updates" on storage.objects for update using ( bucket_id = 'progress-photos' );
```

### 4. Run the App

```bash
npm run dev
```

### 5. App Initialization

When you first open the app in your browser (usually at `http://localhost:3000`), you will be greeted by a **Setup Screen**. 
1. Enter your **Supabase Project URL** and **Anon Key**.
2. Set your challenge start date, duration, starting weight, and goal weight.
3. The app will save these to your local storage and initialize your baseline strength metrics.

---
*Built with discipline and code.*
