/*
  # Reload Schema Cache

  This migration refreshes the Supabase schema cache to ensure all tables are visible to the REST API.
*/

NOTIFY pgrst, 'reload schema';
