/*
  02_profiles.sql:

  Our profiles file creates the public.profiles table.
  Each signed up Auth account gets one profile row, linked by the same UUID as auth.users.id.
  Email and password stay in Supabase Auth.
  We only store first name, last name, and an optional phone number here.
*/

create table public.profiles (
  id uuid primary key references auth.users (id) on delete no action,
  first_name public.app_text not null,
  last_name public.app_text not null,
  phone_number public.app_text,

  /*
    Required names must contain real characters after trimming edge whitespace.
    We strip spaces, tabs, and line breaks from both ends.
    Values made only of those characters are rejected.
  */

  constraint profiles_first_name_not_blank
    check (length(trim(both E' \t\n\r' from first_name)) > 0),

  constraint profiles_last_name_not_blank
    check (length(trim(both E' \t\n\r' from last_name)) > 0)
);

/*
  Turn on row level security so signed out callers and other accounts cannot read profiles by default.
  Detailed policies and grants are added in 05_rls_and_grants.sql.
*/

alter table public.profiles enable row level security;
