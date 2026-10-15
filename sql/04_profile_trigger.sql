-- creates a profile row whenever supabase auth adds a new user
-- names and phone come from the sign up metadata
-- runs as the function owner so it can write to profiles
-- empty search path means every table name has to be written in full

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trimmed_first_name text;
  trimmed_last_name text;
  trimmed_phone_number text;
begin
  -- pulls each value from the metadata and then trims spaces, tabs and line breaks off both ends
  trimmed_first_name := trim(both E' \t\n\r' from coalesce(new.raw_user_meta_data ->> 'first_name', ''));
  trimmed_last_name := trim(both E' \t\n\r' from coalesce(new.raw_user_meta_data ->> 'last_name', ''));
  trimmed_phone_number := trim(both E' \t\n\r' from coalesce(new.raw_user_meta_data ->> 'phone_number', ''));

  -- saves the profile with the same id as the auth user
  -- turns a blank phone into null
  -- blank names arnt valid and will fail the profile checks so the whole sign up gets cancelled
  insert into public.profiles (
    id,
    first_name,
    last_name,
    phone_number
  )
  values (
    new.id,
    trimmed_first_name,
    trimmed_last_name,
    nullif(trimmed_phone_number, '')
  );

  return new;
end;
$$;

-- runs the function once for every new auth user
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- stops client roles calling the function directly
-- the trigger still runs it as the owner
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
