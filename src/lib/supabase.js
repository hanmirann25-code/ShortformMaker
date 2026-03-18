import { createClient } from '@supabase/supabase-js'

// 환경변수 우선 사용, 없으면 실제 값 직접 사용 (Vercel 빌드 환경 대응)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kwjzbzedaaqszhypushu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3anpiemVkYWFxc3poeXB1c2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTc2OTAsImV4cCI6MjA4OTI5MzY5MH0.ZPsvva2MsU3pjZ4lYnve1AjYSmug8ww7XzO3g1trpq0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = true
