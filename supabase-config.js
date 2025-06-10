import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sfgjkagltcoqtevgswna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ2prYWdsdGNvcXRldmdzd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODM1NzYsImV4cCI6MjA2NTE1OTU3Nn0.Y4Qg5KOI5FBZFMTS9U_p3tfeJjK4Ijg1Z-2SD367VLE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schemas you might want:
// 1. profiles (user info, about me text)
// 2. projects (portfolio projects)
// 3. blog_posts (if you want a blog)
// 4. contact_submissions (contact form data)
