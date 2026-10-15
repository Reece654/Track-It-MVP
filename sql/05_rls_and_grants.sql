-- removes the default table rights so only the policies and grants below apply
-- signed out users never get anything back
revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.jobs from public, anon, authenticated;

-- lets signed in users read profiles but they cant add, change or delete them
-- profiles only get created by the sign up trigger
grant select on table public.profiles to authenticated;

-- only lets users read their own profile, not anyone elses
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- lets signed in users read and delete jobs
grant select, delete on table public.jobs to authenticated;

-- allows inserts on these columns only
-- id and created_by are left out because the database fills them in
grant insert (
  title,
  description,
  location,
  status,
  due_date,
  estimated_hours,
  notes,
  assigned_to
) on table public.jobs to authenticated;

-- allows updates on the same columns so owners cant be changed
grant update (
  title,
  description,
  location,
  status,
  due_date,
  estimated_hours,
  notes,
  assigned_to
) on table public.jobs to authenticated;

-- limits reads to the users own jobs
create policy jobs_select_own
  on public.jobs
  for select
  to authenticated
  using (created_by = (select auth.uid()));

-- checks new jobs belong to the user creating them
create policy jobs_insert_own
  on public.jobs
  for insert
  to authenticated
  with check (created_by = (select auth.uid()));

-- checks the job before and after the change
-- stops users editing someone elses job or handing a job to another owner
create policy jobs_update_own
  on public.jobs
  for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

-- limits deletes to the users own jobs
create policy jobs_delete_own
  on public.jobs
  for delete
  to authenticated
  using (created_by = (select auth.uid()));
