-- Run this in Supabase SQL editor.
-- It creates RBAC roles and profile mapping for university-scale setup.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('college_admin', 'school_coordinator', 'teacher', 'student');
  end if;
end$$;

create table if not exists public.schools (
  id bigint generated always as identity primary key,
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'student',
  school_id bigint references public.schools(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, school_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'student'),
    nullif(new.raw_user_meta_data ->> 'school_id', '')::bigint
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

create or replace function public.current_user_role()
returns public.app_role
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role public.app_role;
begin
  select p.role
    into user_role
  from public.profiles p
  where p.id = auth.uid()
  limit 1;

  return user_role;
end;
$$;

create or replace function public.current_user_school_id()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  user_school_id bigint;
begin
  select p.school_id
    into user_school_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;

  return user_school_id;
end;
$$;

create or replace function public.is_college_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.current_user_role() = 'college_admin';
end;
$$;

create or replace function public.is_same_school(target_school_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.is_college_admin()
    or public.current_user_school_id() = target_school_id;
end;
$$;

create table if not exists public.departments (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (school_id, code)
);

create table if not exists public.programs (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  department_id bigint references public.departments(id) on delete set null,
  code text not null,
  name text not null,
  level text not null default 'UG',
  duration_years numeric(3,1),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (school_id, code)
);

create table if not exists public.subjects (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  department_id bigint references public.departments(id) on delete set null,
  program_id bigint references public.programs(id) on delete set null,
  code text not null,
  name text not null,
  credits numeric(4,1) not null default 0,
  semester_no integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (school_id, code)
);

create table if not exists public.sections (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  department_id bigint references public.departments(id) on delete set null,
  program_id bigint references public.programs(id) on delete set null,
  code text not null,
  name text not null,
  academic_year text not null,
  semester_no integer,
  class_teacher_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (school_id, code)
);

create table if not exists public.subject_offerings (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  section_id bigint not null references public.sections(id) on delete cascade,
  subject_id bigint not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  room text,
  meeting_pattern text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (section_id, subject_id, teacher_id, meeting_pattern)
);

create table if not exists public.learning_materials (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  subject_offering_id bigint references public.subject_offerings(id) on delete set null,
  subject_id bigint references public.subjects(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  material_type text not null default 'PDF',
  description text,
  file_url text,
  size_label text,
  duration_label text,
  downloads integer not null default 0,
  views integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.learning_materials
  add column if not exists subject_id bigint references public.subjects(id) on delete set null;

create table if not exists public.student_enrollments (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  section_id bigint not null references public.sections(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  status text not null default 'active',
  unique (section_id, student_id)
);

create table if not exists public.attendance_sessions (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  section_id bigint not null references public.sections(id) on delete cascade,
  subject_offering_id bigint references public.subject_offerings(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  class_date date not null,
  start_time time,
  end_time time,
  remarks text,
  created_at timestamptz not null default now(),
  unique (section_id, class_date, start_time, subject_offering_id)
);

create table if not exists public.attendance_records (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  session_id bigint not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  marked_at timestamptz not null default now(),
  marked_by uuid references public.profiles(id) on delete set null,
  unique (session_id, student_id)
);

create table if not exists public.student_grades (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  section_id bigint not null references public.sections(id) on delete cascade,
  subject_id bigint not null references public.subjects(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(6,2) not null default 0,
  max_score numeric(6,2) not null default 100,
  grade_letter text,
  evaluation_type text,
  evaluated_at timestamptz not null default now(),
  unique (section_id, subject_id, student_id, evaluation_type)
);

create table if not exists public.student_badges (
  id bigint generated always as identity primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  badge_title text not null,
  badge_icon text,
  awarded_at timestamptz not null default now(),
  unique (school_id, student_id, badge_title)
);

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.subjects enable row level security;
alter table public.sections enable row level security;
alter table public.subject_offerings enable row level security;
alter table public.learning_materials enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.student_grades enable row level security;
alter table public.student_badges enable row level security;

-- Schools policies
drop policy if exists "Schools are viewable by staff" on public.schools;
create policy "Schools are viewable by staff"
  on public.schools
  for select
  using (
    public.current_user_role() = 'college_admin'
    or public.current_user_role() = 'school_coordinator'
    or public.current_user_role() = 'teacher'
  );

drop policy if exists "College admin manage schools" on public.schools;
create policy "College admin manage schools"
  on public.schools
  for all
  using (public.current_user_role() = 'college_admin')
  with check (public.current_user_role() = 'college_admin');

-- Profiles policies
-- Users can read their own profile.
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

-- College admin can read all profiles.
drop policy if exists "College admin read all profiles" on public.profiles;
create policy "College admin read all profiles"
  on public.profiles
  for select
  using (public.current_user_role() = 'college_admin');

-- School coordinators can read profiles from own school.
drop policy if exists "School coordinator read own school" on public.profiles;
create policy "School coordinator read own school"
  on public.profiles
  for select
  using (
    public.current_user_role() = 'school_coordinator'
    and public.is_same_school(school_id)
  );

-- College admin and school coordinator can update profile allocations.
drop policy if exists "Admin and coordinator update profiles" on public.profiles;
create policy "Admin and coordinator update profiles"
  on public.profiles
  for update
  using (
    public.current_user_role() = 'college_admin'
    or (
      public.current_user_role() = 'school_coordinator'
      and public.is_same_school(school_id)
    )
  );

-- School-scoped academic structure policies
drop policy if exists "School staff read departments" on public.departments;
create policy "School staff read departments"
  on public.departments
  for select
  using (public.is_same_school(school_id));

drop policy if exists "School staff manage departments" on public.departments;
create policy "School staff manage departments"
  on public.departments
  for all
  using (public.is_same_school(school_id))
  with check (public.is_same_school(school_id));

drop policy if exists "School staff read programs" on public.programs;
create policy "School staff read programs"
  on public.programs
  for select
  using (public.is_same_school(school_id));

drop policy if exists "School staff manage programs" on public.programs;
create policy "School staff manage programs"
  on public.programs
  for all
  using (public.is_same_school(school_id))
  with check (public.is_same_school(school_id));

drop policy if exists "School staff read subjects" on public.subjects;
create policy "School staff read subjects"
  on public.subjects
  for select
  using (public.is_same_school(school_id));

drop policy if exists "School staff manage subjects" on public.subjects;
create policy "School staff manage subjects"
  on public.subjects
  for all
  using (public.is_same_school(school_id))
  with check (public.is_same_school(school_id));

drop policy if exists "School staff read sections" on public.sections;
create policy "School staff read sections"
  on public.sections
  for select
  using (public.is_same_school(school_id) or class_teacher_id = auth.uid());

drop policy if exists "School staff manage sections" on public.sections;
create policy "School staff manage sections"
  on public.sections
  for all
  using (public.is_same_school(school_id))
  with check (public.is_same_school(school_id));

drop policy if exists "School staff read offerings" on public.subject_offerings;
create policy "School staff read offerings"
  on public.subject_offerings
  for select
  using (public.is_same_school(school_id) or teacher_id = auth.uid());

drop policy if exists "School staff manage offerings" on public.subject_offerings;
create policy "School staff manage offerings"
  on public.subject_offerings
  for all
  using (public.is_same_school(school_id) or teacher_id = auth.uid())
  with check (public.is_same_school(school_id));

drop policy if exists "School staff read learning materials" on public.learning_materials;
create policy "School staff read learning materials"
  on public.learning_materials
  for select
  using (public.is_same_school(school_id) or teacher_id = auth.uid());

drop policy if exists "School staff manage learning materials" on public.learning_materials;
create policy "School staff manage learning materials"
  on public.learning_materials
  for all
  using (
    public.current_user_role() = 'college_admin'
    or public.current_user_role() = 'school_coordinator'
    or (teacher_id = auth.uid() and public.is_same_school(school_id))
  )
  with check (
    public.current_user_role() = 'college_admin'
    or public.current_user_role() = 'school_coordinator'
    or (teacher_id = auth.uid() and public.is_same_school(school_id))
  );

drop policy if exists "School staff read enrollments" on public.student_enrollments;
create policy "School staff read enrollments"
  on public.student_enrollments
  for select
  using (public.is_same_school(school_id) or student_id = auth.uid());

drop policy if exists "School staff manage enrollments" on public.student_enrollments;
create policy "School staff manage enrollments"
  on public.student_enrollments
  for all
  using (public.is_same_school(school_id))
  with check (public.is_same_school(school_id));

drop policy if exists "School staff read attendance sessions" on public.attendance_sessions;
create policy "School staff read attendance sessions"
  on public.attendance_sessions
  for select
  using (public.is_same_school(school_id) or teacher_id = auth.uid());

drop policy if exists "School staff manage attendance sessions" on public.attendance_sessions;
create policy "School staff manage attendance sessions"
  on public.attendance_sessions
  for all
  using (public.is_same_school(school_id) or teacher_id = auth.uid())
  with check (public.is_same_school(school_id) or teacher_id = auth.uid());

drop policy if exists "School staff read attendance records" on public.attendance_records;
create policy "School staff read attendance records"
  on public.attendance_records
  for select
  using (
    public.is_same_school(school_id)
    or student_id = auth.uid()
    or exists (
      select 1 from public.attendance_sessions s
      where s.id = attendance_records.session_id
        and s.teacher_id = auth.uid()
    )
  );

drop policy if exists "School staff manage attendance records" on public.attendance_records;
create policy "School staff manage attendance records"
  on public.attendance_records
  for all
  using (
    public.is_same_school(school_id)
    or exists (
      select 1 from public.attendance_sessions s
      where s.id = attendance_records.session_id
        and s.teacher_id = auth.uid()
    )
  )
  with check (
    public.is_same_school(school_id)
    or exists (
      select 1 from public.attendance_sessions s
      where s.id = attendance_records.session_id
        and s.teacher_id = auth.uid()
    )
  );

drop policy if exists "School staff read grades" on public.student_grades;
create policy "School staff read grades"
  on public.student_grades
  for select
  using (public.is_same_school(school_id) or student_id = auth.uid());

drop policy if exists "School staff manage grades" on public.student_grades;
create policy "School staff manage grades"
  on public.student_grades
  for all
  using (public.is_same_school(school_id))
  with check (public.is_same_school(school_id));

-- Student Badges policies
drop policy if exists "School staff read badges" on public.student_badges;
create policy "School staff read badges"
  on public.student_badges
  for select
  using (public.is_same_school(school_id) or student_id = auth.uid());

drop policy if exists "School staff award badges" on public.student_badges;
create policy "School staff award badges"
  on public.student_badges
  for all
  using (public.is_same_school(school_id))
  with check (public.is_same_school(school_id));

-- Optional seed for 12 schools.
insert into public.schools (code, name)
values
  ('SCH01', 'School of Engineering & Technology'),
  ('SCH02', 'School of Management & Commerce'),
  ('SCH03', 'School of Legal Studies'),
  ('SCH04', 'School of Medical & Allied Sciences'),
  ('SCH05', 'School of Physiotherapy and Rehabilitation Sciences'),
  ('SCH06', 'School of Liberal Arts'),
  ('SCH07', 'School of Architecture & Design'),
  ('SCH08', 'School of Basic & Applied Sciences'),
  ('SCH09', 'School of Emerging Media & Creator Economy'),
  ('SCH10', 'School of Hotel Management & Catering Technology'),
  ('SCH11', 'School of Education'),
  ('SCH12', 'School of Agricultural Sciences')
on conflict (code) do nothing;
