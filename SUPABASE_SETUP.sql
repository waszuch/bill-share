-- Supabase Auth Setup - Auto Sync Users
-- Run this SQL in Supabase SQL Editor once.
-- This will automatically create users in public.User table when they sign in.

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (
    id,
    email,
    name,
    image,
    "emailVerified",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url',
    new.email_confirmed_at,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- (Optional) Enable Row Level Security on User table
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- (Optional) Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON public."User"
  FOR SELECT
  USING (auth.uid() = id);

-- (Optional) Policy: Service role can do everything
CREATE POLICY "Service role can do everything"
  ON public."User"
  FOR ALL
  USING (auth.role() = 'service_role');
