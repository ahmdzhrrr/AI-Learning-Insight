create table users (
  id bigint primary key,
  name text not null,
  email text unique not null,
  password text not null,
);

create table metrics (
  student_id bigint primary key not null references users(id) on delete,
  total_materi_selesai integer default 0,
  avg_durasi_materi_detik double precision default 0,
  total_review integer default 0,
  total_hari_aktif integer default 0,
  std_dev_materi_harian double precision default 0,
  avg_skor_kuis double precision default 0,
  pass_rate_kuis double precision default 0,
  total_kuis_diambil integer default 0,
  avg_rating_submission double precision default 0,
  total_submissions integer default 0,
  last_calculated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table insights (
  student_id bigint primary key not null references users(id) on delete cascade,
  learning_style text,
  confidence_score double precision default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table insight_histories (
  id bigserial primary key,
  student_id bigint not null references users(id) on delete cascade,
  learning_style text,
  confidence_score double precision default 0,
  created_at timestamp with time zone default now()
);