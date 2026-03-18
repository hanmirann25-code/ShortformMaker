import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수가 실제 값인지 확인 (플레이스홀더 제외)
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20

if (!isConfigured) {
  console.warn(
    '[Supabase] 환경변수가 설정되지 않았습니다.\n' +
    '.env 파일에서 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 실제 값으로 교체해주세요.\n' +
    '로그인/회원가입 기능은 비활성화됩니다.'
  )
}

// 미설정 시 더미 값으로 클라이언트 생성 (앱 크래시 방지)
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key-for-dev')

export const isSupabaseConfigured = isConfigured
