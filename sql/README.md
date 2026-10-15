We ran the command from each page in the Supabase SQL Editor then pushed to branches, merged into main. We ran each file in order and checked it finished without any errors before moving on to the next one.

What each file does

app_text.sql:
creates a shared text type so profile and job text cant go over 1,000 characters

profiles.sql: 
creates the profiles table for first name, last name and an optional phone number, then turns on RLS

jobs.sql: 
creates the jobs table with checks on required text, status and estimated hours, adds an owner index, then turns on RLS

profile_trigger.sql: 
adds a trigger that creates a profile whenever someone signs up

rls_and_grants.sql: 
only lets signed in users see and change their own profile and jobs, signed out users dont get anything