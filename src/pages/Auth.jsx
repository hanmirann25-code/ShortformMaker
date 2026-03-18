import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/* ── 구글 아이콘 SVG ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}

/* ── 입력 필드 공통 컴포넌트 ── */
function InputField({ label, type, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg bg-bg3 border border-border text-text1 placeholder:text-text3 text-sm outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan')

  // Supabase 미설정 시 안내 화면
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
        <div
          className="w-full text-center"
          style={{
            maxWidth: '400px',
            background: '#232840',
            border: '1px solid #2E3450',
            borderRadius: '16px',
            padding: '32px',
          }}
        >
          <div className="text-3xl mb-4">⚙️</div>
          <h2 className="text-text1 font-semibold text-lg mb-2">Supabase 설정이 필요해요</h2>
          <p className="text-text2 text-sm leading-relaxed mb-4">
            <code className="bg-bg3 px-1.5 py-0.5 rounded text-accent text-xs">.env</code> 파일에서
            Supabase URL과 Anon Key를 실제 값으로 교체한 뒤<br />
            개발 서버를 재시작해주세요.
          </p>
          <div className="bg-bg3 rounded-lg p-3 text-left text-xs text-text2 font-mono">
            <div>VITE_SUPABASE_URL=https://xxx.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=eyJ...</div>
          </div>
        </div>
      </div>
    )
  }
  const [tab, setTab] = useState('login') // 'login' | 'signup'

  // 로그인 폼 상태
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // 회원가입 폼 상태
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('')

  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /* ── 구글 소셜 로그인 ── */
  const handleGoogleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: plan ? `${window.location.origin}/pricing?plan=${plan}` : `${window.location.origin}/generate`,
      },
    })
    if (error) setError('구글 로그인에 실패했습니다. 다시 시도해주세요.')
  }

  /* ── 이메일 로그인 ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    setIsLoading(false)

    if (error) {
      setError('이메일 또는 비밀번호를 확인해주세요.')
      return
    }

    if (plan) {
      navigate(`/pricing?plan=${plan}`)
    } else {
      navigate('/generate')
    }
  }

  /* ── 이메일 회원가입 ── */
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (signupPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.')
      return
    }
    if (signupPassword !== signupPasswordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    })

    setIsLoading(false)

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        setError('이미 사용 중인 이메일이에요.')
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.')
      }
      return
    }

    setSuccessMsg('인증 이메일을 확인해주세요! 이메일의 링크를 클릭하면 로그인할 수 있어요.')
  }

  /* ── 탭 전환 시 초기화 ── */
  const switchTab = (newTab) => {
    setTab(newTab)
    setError('')
    setSuccessMsg('')
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div
        className="w-full"
        style={{
          maxWidth: '400px',
          background: '#232840',
          border: '1px solid #2E3450',
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        {/* 탭 */}
        <div className="flex rounded-lg bg-bg3 p-1 mb-8">
          {[
            { key: 'login', label: '로그인' },
            { key: 'signup', label: '회원가입' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-card text-text1 shadow-sm'
                  : 'text-text2 hover:text-text1'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-border bg-bg3 text-text1 text-sm font-medium hover:bg-bg2 transition-colors mb-6"
        >
          <GoogleIcon />
          구글로 계속하기
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text3 text-xs">또는</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* 성공 메시지 */}
        {successMsg && (
          <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-accent-dim border border-accent/20 text-accent-text text-sm">
            {successMsg}
          </div>
        )}

        {/* 로그인 폼 */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <InputField
              label="이메일"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="example@email.com"
            />
            <InputField
              label="비밀번호"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-85 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4ADE80', color: '#0F1117' }}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        )}

        {/* 회원가입 폼 */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <InputField
              label="이메일"
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="example@email.com"
            />
            <InputField
              label="비밀번호"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="8자 이상 입력"
            />
            <InputField
              label="비밀번호 확인"
              type="password"
              value={signupPasswordConfirm}
              onChange={(e) => setSignupPasswordConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-85 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4ADE80', color: '#0F1117' }}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
