import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehvtvmwverkqceapbpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodnR2bXd2ZXJrcWNlYXBicGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTA2NjUsImV4cCI6MjA2NDk4NjY2NX0.wKNcyUz21_gN1Jq49klPcfrNsnDGEDxEhZ_dx2Pp4QE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);