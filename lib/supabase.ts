import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anbmuzuftmkpzjrsebdj.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYm11enVmdG1rcHpqcnNlYmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NjU0NjEsImV4cCI6MjA5NjI0MTQ2MX0.MYdP5FqMrKB882wSI88fY1S5dDu2qtchXJC1SFOBwCA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
  };
};
