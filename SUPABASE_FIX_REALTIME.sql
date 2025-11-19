-- Fix Realtime for BillShare - Run this to fix DELETE events
-- Only run the parts that are missing

-- ==========================================
-- 1. SET REPLICA IDENTITY FULL (Critical for DELETE events!)
-- ==========================================

ALTER TABLE public."Room" REPLICA IDENTITY FULL;
ALTER TABLE public."Participant" REPLICA IDENTITY FULL;
ALTER TABLE public."Expense" REPLICA IDENTITY FULL;
ALTER TABLE public."ExpenseSplit" REPLICA IDENTITY FULL;

-- ==========================================
-- 2. ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Participant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExpenseSplit" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own data" ON public."User";
DROP POLICY IF EXISTS "Service role can do everything on User" ON public."User";
DROP POLICY IF EXISTS "Users can access their rooms" ON public."Room";
DROP POLICY IF EXISTS "Users can access their participants" ON public."Participant";
DROP POLICY IF EXISTS "Users can access their expenses" ON public."Expense";
DROP POLICY IF EXISTS "Users can access their expense splits" ON public."ExpenseSplit";

-- User policies
CREATE POLICY "Users can read own data"
  ON public."User"
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Service role can do everything on User"
  ON public."User"
  FOR ALL
  USING (auth.role() = 'service_role');

-- Room policies - users can see rooms they're participants in
CREATE POLICY "Users can access their rooms"
  ON public."Room"
  FOR ALL
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM public."Participant" WHERE "roomId" = public."Room".id
    )
  );

-- Participant policies
CREATE POLICY "Users can access their participants"
  ON public."Participant"
  FOR ALL
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM public."Participant" WHERE "roomId" = public."Participant"."roomId"
    )
  );

-- Expense policies - users can access expenses in rooms they're in
CREATE POLICY "Users can access their expenses"
  ON public."Expense"
  FOR ALL
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM public."Participant" WHERE "roomId" = public."Expense"."roomId"
    )
  );

-- ExpenseSplit policies
CREATE POLICY "Users can access their expense splits"
  ON public."ExpenseSplit"
  FOR ALL
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM public."Participant" 
      WHERE "roomId" = (
        SELECT "roomId" FROM public."Expense" WHERE id = public."ExpenseSplit"."expenseId"
      )
    )
  );

-- ==========================================
-- 3. VERIFY SETUP
-- ==========================================

-- Check Realtime is enabled
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'Room', 'Participant', 'Expense', 'ExpenseSplit');

