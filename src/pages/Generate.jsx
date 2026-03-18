import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateScript } from '../lib/claude'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useUsage } from '../hooks/useUsage'
import { useToast, ToastContainer } from '../components/Toast'

/* ══════════════════════════════════════════
   색상 토큰
══════════════════════════════════════════ */
const C = {
  bg:        '#0F1117',
  bg3:       '#1E2336',
  card:      '#232840',
  border:    '#2E3450',
  border2:   '#3A4060',
  accent:    '#4ADE80',
  accentDim: '#1A3028',
  accentTxt: '#86EFAC',
  text1:     '#F0F4FF',
  text2:     '#8B93B0',
  text3:     '#555E7A',
}

/* ══════════════════════════════════════════
   아이콘
══════════════════════════════════════════ */
function IconBolt({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
function IconFile({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  )
}
function IconCopy({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}
function IconRefresh({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}
function IconSave({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

/* ══════════════════════════════════════════
   공통 UI 컴포넌트
══════════════════════════════════════════ */

/* 입력 요소 기본 스타일 */
const inputBase = {
  width: '100%',
  background: C.bg3,
  border: `1px solid ${C.border2}`,
  borderRadius: 8,
  color: C.text1,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .15s, box-shadow .15s',
}

/* focus 이벤트 핸들러 */
function makeFocusHandlers() {
  return {
    onFocus: e => {
      e.currentTarget.style.borderColor = C.accent
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.12)'
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = C.border2
      e.currentTarget.style.boxShadow = 'none'
    },
  }
}

/* ── 필드 레이블 ── */
function FieldLabel({ children }) {
  return (
    <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: C.text2 }}>
      {children}
    </p>
  )
}

/* ── 라디오 그룹 (버튼 형태) ── */
function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {options.map(opt => {
        const active = value === opt
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '10px 4px',
              minHeight: 44,
              borderRadius: 8,
              border: `1px solid ${active ? C.accent : C.border2}`,
              background: active ? C.accentDim : 'transparent',
              color: active ? C.accentTxt : C.text2,
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ── 결과 텍스트 블록 ── */
function ResultBlock({ label, children }) {
  return (
    <div>
      <p style={{
        margin: '0 0 8px',
        fontSize: 11,
        fontWeight: 700,
        color: C.text2,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}>
        {label}
      </p>
      <div style={{
        background: C.bg3,
        border: `1px solid ${C.border2}`,
        borderRadius: 10,
        padding: '12px 16px',
        fontSize: 14,
        color: C.text1,
        lineHeight: 1.75,
        whiteSpace: 'pre-line',
      }}>
        {children}
      </div>
    </div>
  )
}

/* ── 하단 액션 버튼 ── */
function ActionBtn({ icon, label, onClick, primary }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '9px 0',
        borderRadius: 8,
        border: primary ? 'none' : `1px solid ${C.border2}`,
        background: primary ? (hov ? '#22C55E' : C.accent) : (hov ? C.bg3 : 'transparent'),
        color: primary ? '#0F1117' : C.text1,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .15s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/* ── 로딩 스피너 ── */
function Spinner() {
  return (
    <div style={{
      width: 40,
      height: 40,
      border: `3px solid ${C.border2}`,
      borderTopColor: C.accent,
      borderRadius: '50%',
      animation: 'gen-spin 0.8s linear infinite',
    }} />
  )
}

/* ── 업그레이드 모달 ── */
function UpgradeModal({ onClose, onGoToPricing }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: 32,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* 아이콘 */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: C.accentDim,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
            stroke={C.accentTxt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: C.text1 }}>
          무료 횟수를 모두 사용했어요
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: C.text2, lineHeight: 1.7 }}>
          이번 달 무료 생성 횟수(5회)를 모두 사용했어요.<br />
          유료로 업그레이드하면 <strong style={{ color: C.accentTxt }}>무제한</strong>으로 사용할 수 있어요.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              border: `1px solid ${C.border2}`,
              background: 'transparent', color: C.text2,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            닫기
          </button>
          <button
            onClick={onGoToPricing}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              border: 'none',
              background: C.accent, color: '#0F1117',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            요금제 보기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   더미 결과 데이터
══════════════════════════════════════════ */
const DUMMY_RESULT = {
  hook: '스마트스토어로 월 100만 원, 생각보다 어렵지 않아요. 오늘 딱 하나만 알려드릴게요.',
  body: `처음엔 저도 뭘 팔아야 할지 몰랐어요.\n그런데 주변에서 흔히 볼 수 있는 물건, 직접 쓰던 물건부터 시작했더니 첫 달에 주문이 들어오기 시작했어요.\n핵심은 '상세 페이지'예요. 고객이 궁금해할 내용을 사진 한 장에 담아야 해요.`,
  closing: '오늘 알려드린 방법으로 꼭 시작해보세요. 팔로우하면 매주 부업 노하우 공유해드려요!',
  thumbnails: [
    '스마트스토어 첫 달 수익 공개',
    '아무것도 없이 시작한 부업 이야기',
    '이것만 알면 스토어 매출 2배',
  ],
}

/* ══════════════════════════════════════════
   Generate Page
══════════════════════════════════════════ */
export default function Generate() {
  const navigate = useNavigate()
  const { user } = useAuth()

  /* ── 입력 상태 ── */
  const [sideJob,   setSideJob]   = useState('스마트스토어/쿠팡 판매')
  const [tip,       setTip]       = useState('')
  const [tone,      setTone]      = useState('친근하게')
  const [duration,  setDuration]  = useState('60초')

  /* ── 결과 상태 ── */
  const [isLoading, setIsLoading] = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)

  /* ── 토스트 ── */
  const { toasts, addToast, removeToast } = useToast()

  /* ── 저장 로딩 ── */
  const [isSaving, setIsSaving] = useState(false)

  /* ── 사용 횟수 ── */
  const { remaining, canGenerate, recordUsage, FREE_LIMIT, usedCount } = useUsage(user)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const focusHandlers = makeFocusHandlers()

  /* ── 생성 버튼 핸들러 ── */
  const handleGenerate = async () => {
    if (isLoading) return

    // 사용 횟수 초과 체크
    if (!canGenerate) {
      setShowLimitModal(true)
      return
    }

    setResult(null)
    setError(null)
    setIsLoading(true)
    
    try {
      const generated = await generateScript({
        jobType: sideJob,
        tip,
        tone,
        duration,
      })
      setResult(generated)
      // 성공 시에만 횟수 차감
      await recordUsage()
    } catch (err) {
      console.error(err)
      setError('대본 생성에 실패했어요. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  /* ── 저장 핸들러 ── */
  const handleSave = async () => {
    if (!result || isSaving) return

    // 비로그인 → 토스트 안내 후 /auth 이동
    if (!user) {
      addToast('로그인이 필요해요', 'info')
      setTimeout(() => navigate('/auth'), 1500)
      return
    }

    setIsSaving(true)

    try {
      // 유료 유저 여부 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_paid')
        .eq('id', user.id)
        .single()

      const isPaid = profile?.is_paid === true

      // 무료 유저: 이번 달 저장 개수 조회 (최대 5개)
      if (!isPaid) {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const { count: savedCount } = await supabase
          .from('scripts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', monthStart)

        if ((savedCount ?? 0) >= 5) {
          addToast('무료 저장은 월 5개까지만 가능해요. 업그레이드하면 무제한으로 저장할 수 있어요!', 'info')
          return
        }
      }

      // 저장 실행
      const { error } = await supabase.from('scripts').insert({
        user_id:    user.id,
        job_type:   sideJob,
        tip,
        tone,
        duration,
        hook:       result.hook,
        body:       result.body,
        closing:    result.closing,
        thumbnails: result.thumbnails,
        hashtags:   result.hashtags,
      })

      if (error) {
        console.error('저장 실패:', error)
        addToast('저장에 실패했어요. 다시 시도해주세요.', 'error')
      } else {
        addToast('저장됐어요!', 'success')
      }
    } catch (err) {
      console.error('저장 오류:', err)
      addToast('저장에 실패했어요. 다시 시도해주세요.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  /* ── 복사 핸들러 ── */
  const handleCopy = () => {
    if (!result) return
    const text = [
      `[훅 문장]\n${result.hook}`,
      `[본문 대본]\n${result.body}`,
      `[마무리 멘트]\n${result.closing}`,
      `[썸네일 문구]\n${result.thumbnails.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
    ].join('\n\n')
    navigator.clipboard.writeText(text).catch(() => {})
  }

  /* ━━━━━━ 렌더 ━━━━━━ */
  return (
    <>
      {/* 스피너 키프레임 및 레이아웃 CSS */}
      <style>{`
        @keyframes gen-spin { to { transform: rotate(360deg); } }
        @media (max-width: 639px) {
          .gn-layout { flex-direction: column !important; }
          .gn-panel-left, .gn-panel-right { flex: none !important; width: 100% !important; min-width: 0 !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .gn-layout { flex-wrap: wrap !important; }
          .gn-panel-left, .gn-panel-right { flex: 1 1 340px !important; min-width: 0 !important; }
        }
        @media (min-width: 1024px) {
          .gn-layout { flex-wrap: nowrap !important; }
          .gn-panel-left { flex: 0 0 380px !important; min-width: 380px !important; }
          .gn-panel-right { flex: 1 1 0 !important; min-width: 0 !important; }
        }
      `}</style>

      {/* 토스트 컨테이너 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* 업그레이드 모달 */}
      {showLimitModal && (
        <UpgradeModal
          onClose={() => setShowLimitModal(false)}
          onGoToPricing={() => { setShowLimitModal(false); navigate('/pricing') }}
        />
      )}

      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: 'clamp(24px, 4vw, 48px) 20px 80px',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: C.text1 }}>
            AI 대본 생성
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: C.text2 }}>
            부업 종류와 오늘의 팁을 입력하면 AI가 완성된 대본을 만들어드려요
          </p>
        </div>

        {/* ── 2단 레이아웃 (데스크탑) / 1단 (모바일) ── */}
        <div
          className="gn-layout"
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >

          {/* ════════════ 좌측 입력 패널 ════════════ */}
          <div
            className="gn-panel-left"
            style={{
              flex: '1 1 380px',
              minWidth: 280,
              width: '100%',
              boxSizing: 'border-box',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* 헤더 */}
            <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text1 }}>입력 정보</p>
            </div>

            {/* 폼 */}
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* 1. 부업 종류 */}
              <div>
                <FieldLabel>부업 종류</FieldLabel>
                <select
                  value={sideJob}
                  onChange={e => setSideJob(e.target.value)}
                  {...focusHandlers}
                  style={{ ...inputBase, padding: '10px 14px', appearance: 'none', cursor: 'pointer' }}
                >
                  {[
                    '스마트스토어/쿠팡 판매',
                    '블로그/애드센스',
                    '프리랜서(디자인·번역 등)',
                    '주식/ETF 투자',
                    '유튜브/콘텐츠 제작',
                    '기타 부업',
                  ].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* 2. 오늘 공유할 팁 */}
              <div>
                <FieldLabel>오늘 공유할 팁</FieldLabel>
                <textarea
                  value={tip}
                  onChange={e => setTip(e.target.value)}
                  {...focusHandlers}
                  placeholder="예: 상품 선정할 때 쓰는 방법, 경쟁률 낮고 수요 있는 상품 찾는 법..."
                  style={{
                    ...inputBase,
                    height: 90,
                    padding: '10px 14px',
                    resize: 'none',
                    lineHeight: 1.65,
                  }}
                />
              </div>

              {/* 3. 말투 */}
              <div>
                <FieldLabel>말투</FieldLabel>
                <RadioGroup
                  options={['친근하게', '전문적으로', '유머있게']}
                  value={tone}
                  onChange={setTone}
                />
              </div>

              {/* 4. 영상 길이 */}
              <div>
                <FieldLabel>영상 길이</FieldLabel>
                <RadioGroup
                  options={['30초', '60초', '90초']}
                  value={duration}
                  onChange={setDuration}
                />
              </div>

              {/* 생성 버튼 + 잔여 횟수 */}
              <div style={{ marginTop: 4 }}>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 0',
                    borderRadius: 10,
                    border: 'none',
                    background: isLoading ? C.bg3 : C.accent,
                    color: isLoading ? C.text2 : '#0F1117',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background .15s',
                  }}
                >
                  <IconBolt size={18} />
                  {isLoading ? '생성 중...' : 'AI 대본 생성하기'}
                </button>

                {/* 잔여 횟수 + pip */}
                <div style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 12, color: remaining === 0 ? '#EF4444' : C.text2 }}>
                    무료 잔여 횟수:&nbsp;
                    <strong style={{ color: remaining === 0 ? '#EF4444' : C.text1 }}>
                      {remaining} / {FREE_LIMIT}회
                    </strong>
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                      <div key={i} style={{
                        width: 22,
                        height: 5,
                        borderRadius: 3,
                        background: i < remaining ? C.accent : C.border2,
                        transition: 'background .3s',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ 우측 결과 패널 ════════════ */}
          <div
            className="gn-panel-right"
            style={{
              flex: '1 1 340px',
              minWidth: 280,
              width: '100%',
              boxSizing: 'border-box',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* 헤더 */}
            <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text1 }}>생성된 대본</p>
            </div>

            {/* ① 초기 상태 및 에러 상태 */}
            {!isLoading && !result && (
              <div style={{
                padding: '72px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                textAlign: 'center',
              }}>
                <div style={{ color: error ? '#EF4444' : C.text3 }}>
                  <IconFile size={48} />
                </div>
                {error ? (
                  <p style={{ margin: 0, fontSize: 14, color: '#EF4444', lineHeight: 1.7 }}>
                    {error}
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: C.text2, lineHeight: 1.7, maxWidth: 260 }}>
                    왼쪽에 정보를 입력하고<br />생성 버튼을 눌러주세요
                  </p>
                )}
              </div>
            )}

            {/* ② 로딩 상태 */}
            {isLoading && (
              <div style={{
                padding: '72px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
              }}>
                <Spinner />
                <p style={{ margin: 0, fontSize: 14, color: C.text2 }}>
                  AI가 대본을 작성하고 있어요...
                </p>
              </div>
            )}

            {/* ③ 결과 상태 */}
            {!isLoading && result && (
              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <ResultBlock label="훅 문장">{result.hook}</ResultBlock>
                <ResultBlock label="본문 대본">{result.body}</ResultBlock>
                <ResultBlock label="마무리 멘트">{result.closing}</ResultBlock>

                {/* 썸네일 문구 */}
                <div>
                  <p style={{
                    margin: '0 0 8px',
                    fontSize: 11, fontWeight: 700, color: C.text2,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                  }}>
                    썸네일 문구
                  </p>
                  <div style={{
                    background: C.bg3,
                    border: `1px solid ${C.border2}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}>
                    {result.thumbnails.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{
                          flexShrink: 0,
                          width: 22, height: 22,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6,
                          background: C.accentDim,
                          color: C.accentTxt,
                          fontSize: 12,
                          fontWeight: 700,
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 14, color: C.text1, lineHeight: 1.6 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 3개 */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <ActionBtn icon={<IconCopy />}    label="복사"   onClick={handleCopy} />
                  <ActionBtn icon={<IconRefresh />} label="재생성" onClick={handleGenerate} />
                  <ActionBtn
                    icon={<IconSave />}
                    label={isSaving ? '저장 중...' : '저장'}
                    onClick={handleSave}
                    primary
                  />
                </div>
              </div>
            )}
          </div>

        </div>{/* /2단 래퍼 */}
      </div>
    </>
  )
}
