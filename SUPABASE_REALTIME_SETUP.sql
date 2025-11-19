-- Enable Supabase Realtime for bill-sharing tables
-- Run this in Supabase SQL Editor after running SUPABASE_SETUP.sql

-- Enable Realtime for Room table
ALTER PUBLICATION supabase_realtime ADD TABLE "Room";

-- Enable Realtime for Participant table
ALTER PUBLICATION supabase_realtime ADD TABLE "Participant";

-- Enable Realtime for Expense table
ALTER PUBLICATION supabase_realtime ADD TABLE "Expense";

-- Enable Realtime for ExpenseSplit table
ALTER PUBLICATION supabase_realtime ADD TABLE "ExpenseSplit";

-- Verify that tables are added to the publication
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

