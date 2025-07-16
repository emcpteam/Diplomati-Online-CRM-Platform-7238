import { createClient } from '@supabase/supabase-js'

// Project ID will be auto-injected during deployment
const SUPABASE_URL = 'https://kzqzlgbeqrflyzuajjyp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cXpsZ2JlcXJmbHl6dWFqanlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE2OTQxMTMsImV4cCI6MjAxNzI3MDExM30.HEo0KCVkWD2Lc7iX8vMpQIAQ9YADPvhz1Qo1RBfYgxI'

if(SUPABASE_URL == 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY == '<ANON_KEY>' ){ 
  throw new Error('Missing Supabase variables'); 
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})