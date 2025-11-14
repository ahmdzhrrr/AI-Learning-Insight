create table if not exists public.users (
  id bigint not null default nextval('users_id_seq'::regclass),
  name text,
  email text unique,
  username text,
  gender text,
  born_at date,
  created_at timestamptz,
  updated_at timestamptz,
  verified_at timestamptz,
  tz text,
  raw jsonb default '{}'::jsonb,
  password_hash text,
  constraint users_pkey primary key (id)
);

create table if not exists public.exams (
  id bigint not null default nextval('exams_id_seq'::regclass),
  code text unique,
  title text,
  created_at timestamptz default now(),
  constraint exams_pkey primary key (id)
);

create table if not exists public.exam_registrations (
  id bigint not null,
  user_id bigint not null,
  status text,
  submission_status text,
  registration_at timestamptz,
  registration_type text,
  is_scheduled boolean,
  scheduled_at timestamptz,
  exam_id bigint,
  raw jsonb default '{}'::jsonb,
  constraint exam_registrations_pkey primary key (id),
  constraint exam_registrations_user_id_fkey
    foreign key (user_id) references public.users(id)
);

create table if not exists public.exam_results (
  id bigint not null,
  user_id bigint not null,
  final_score numeric,
  status text,
  duration_in_minutes numeric,
  started_at timestamptz,
  finished_at timestamptz,
  submission_id bigint,
  exam_id bigint,
  raw jsonb default '{}'::jsonb,
  constraint exam_results_pkey primary key (id),
  constraint exam_results_user_id_fkey
    foreign key (user_id) references public.users(id)
);

create table if not exists public.dev_journey_submissions (
  id bigint not null,
  journey_id bigint,
  quiz_id bigint,
  submitter_id bigint,
  version_id bigint,
  app_link text,
  app_comment text,
  status text,
  reviewer_id bigint,
  score numeric,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  raw jsonb default '{}'::jsonb,
  constraint dev_journey_submissions_pkey primary key (id),
  constraint dev_journey_submissions_submitter_id_fkey
    foreign key (submitter_id) references public.users(id)
);

create table if not exists public.dev_journey_trackings (
  id bigint not null,
  journey_id bigint,
  user_id bigint,
  duration_in_minutes numeric,
  created_at timestamptz,
  raw jsonb default '{}'::jsonb,
  constraint dev_journey_trackings_pkey primary key (id),
  constraint dev_journey_trackings_user_id_fkey
    foreign key (user_id) references public.users(id)
);

create table if not exists public.dev_journey_tutorials (
  id bigint not null,
  tutorial_id bigint,
  journey_id bigint,
  user_id bigint,
  duration_in_minutes numeric,
  created_at timestamptz,
  raw jsonb default '{}'::jsonb,
  constraint dev_journey_tutorials_pkey primary key (id),
  constraint dev_journey_tutorials_user_id_fkey
    foreign key (user_id) references public.users(id)
);

create table if not exists public.metrics (
  student_id bigint not null,
  total_materi_selesai integer,
  avg_durasi_materi_detik numeric,
  total_review integer,
  total_hari_aktif integer,
  std_dev_materi_harian numeric,
  avg_skor_kuis numeric,
  pass_rate_kuis numeric,
  total_kuis_diambil integer,
  avg_rating_submission numeric,
  total_submissions integer,
  avg_durasi_article numeric,
  avg_durasi_exam numeric,
  avg_durasi_interactivecode numeric,
  avg_durasi_quiz numeric,
  count_article integer,
  count_exam integer,
  count_interactivecode integer,
  count_quiz integer,
  last_calculated_at timestamptz default now(),
  constraint metrics_pkey primary key (student_id),
  constraint metrics_student_id_fkey
    foreign key (student_id) references public.users(id)
);

create table if not exists public.insights (
  student_id bigint not null,
  label text not null,
  confidence numeric not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  cluster_id integer not null default -1,
  constraint insights_pkey primary key (student_id),
  constraint insights_student_id_fkey
    foreign key (student_id) references public.users(id)
);

create table if not exists public.insight_histories (
  id uuid not null default gen_random_uuid(),
  student_id bigint not null,
  label text not null,
  confidence numeric not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  raw_features jsonb not null,
  created_at timestamptz not null default now(),
  cluster_id integer not null default -1,
  constraint insight_histories_pkey primary key (id),
  constraint insight_histories_student_id_fkey
    foreign key (student_id) references public.users(id)
);
