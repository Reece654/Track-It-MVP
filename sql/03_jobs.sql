/*
  03_jobs.sql:

  Jobs file creates the public.jobs table for our Track It app.
  Each job belongs to one signed in account through created_by.
  Location is required so the operator knows where to go.
  Optional fields may be left blank and stored as NULL.
*/

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users (id) on delete no action,
  title public.app_text not null,
  description public.app_text not null,
  location public.app_text not null,
  status public.app_text not null default 'pending',
  due_date date,
  estimated_hours numeric,
  notes public.app_text,
  assigned_to public.app_text,

  /*
    Required text must not be blank or only whitespace.
    We strip spaces, tabs, and line breaks from both ends before checking just like we did with profiles.
  */

  constraint jobs_title_not_blank
    check (length(trim(both E' \t\n\r' from title)) > 0),

  constraint jobs_description_not_blank
    check (length(trim(both E' \t\n\r' from description)) > 0),

  constraint jobs_location_not_blank
    check (length(trim(both E' \t\n\r' from location)) > 0),

  /*
    Status may only be pending, active, or completed.
    Our default for new jobs is pending.
  */

  constraint jobs_status_allowed
    check (status in ('pending', 'active', 'completed')),

  /*
    When estimated hours are supplied they must be greater than zero.
    They may use at most two decimal places.
    We reject extra decimals instead of rounding them.
  */

  constraint jobs_estimated_hours_valid
    check (
      estimated_hours is null
      or (
        estimated_hours > 0
        and estimated_hours = trunc(estimated_hours, 2)
      )
    )
);

/*
  Supports looking up jobs by owner for list queries and RLS checks.
*/

create index jobs_created_by_idx on public.jobs (created_by);

/*
  Turn on row level security.
  Policies and column grants are added in 05_rls_and_grants.sql.
*/

alter table public.jobs enable row level security;
