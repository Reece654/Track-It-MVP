/*
  01_app_text.sql:

  App text will create our shared text type for Track It.
  We use one domain so profile and job text columns share the same 1,000 character limit we set.
  We set a limit of 1,000 characters so we don't waste storage space on unnecessary characters.
  Reece and I (Ben) will review the limit and likely reduce it later once we get user data post MVP.
  The React app will use a matching maxTextLength constant so the form and database stay in step.
*/

/*
  app_text is based on PostgreSQL text.
  The check rejects any value longer than 1,000 characters.
*/

create domain public.app_text as text
check (
  value is null
  or char_length(value) <= 1000
);
