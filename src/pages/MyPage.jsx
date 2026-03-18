import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

/* ══════════════════════════════════════════
   색상 토큰
══════════════════════════════════════════ */
const C = {
  bg:        '#0F1117',
  bg2:       '#161929',
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

/* ── 사이드바 메뉴 아이템 ── */
const TABS = [
  { id: 'history',  label: '대본 히스토리', icon: '📄' },
  { id: 'usage',    label: '사용량 현황',   icon: '📊' },
  { id: 'settings', label: '계정 설정',     icon: '⚙️'  },
]

/* ── 날짜 포맷 ── */
function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/* ── 이번 달 시작 ISO ── */
function monthStart() {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString()
}

/* ──────────────────────────────────────────
   아이콘
────────────────────────────────────────── */
function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IconCopy({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function IconClose({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconChevron({ size = 16, up }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: up ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/* ──────────────────────────────────────────
   대본 모달
────────────────────────────────────────── */
function ScriptModal({ script, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = [
      `[훅 문장]\n${script.hook}`,
      `[본문 대본]\n${script.body}`,
      `[마무리 멘트]\n${script.closing}`,
      script.thumbnails?.length
        ? `[썸네일 문구]\n${script.thumbnails.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
        : '',
      script.hashtags?.length
        ? `[해시태그]\n${script.hashtags.join(' ')}`
        : '',
    ].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.70)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px 16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mp-modal-scroll"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          width: '100%',
          maxWidth: 560,
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 모달 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: `1px solid ${C.border}`,
          position: 'sticky', top: 0, background: C.card, zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 6,
              background: C.accentDim, color: C.accentTxt,
              fontSize: 12, fontWeight: 700,
            }}>
              {script.job_type}
            </span>
            <span style={{ fontSize: 12, color: C.text3 }}>{formatDate(script.created_at)}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: C.text2,
              cursor: 'pointer', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconClose />
          </button>
        </div>

        {/* 모달 바디 */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* 태그 */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 9px', borderRadius: 5, background: C.bg3, color: C.text2, fontSize: 12 }}>
              {script.tone}
            </span>
            <span style={{ padding: '3px 9px', borderRadius: 5, background: C.bg3, color: C.text2, fontSize: 12 }}>
              {script.duration}
            </span>
          </div>

          {/* 섹션 헬퍼 */}
          {[
            { label: '훅 문장', value: script.hook },
            { label: '본문 대본', value: script.body },
            { label: '마무리 멘트', value: script.closing },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {label}
              </p>
              <div style={{
                background: C.bg3, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: '12px 16px',
                fontSize: 14, color: C.text1, lineHeight: 1.75, whiteSpace: 'pre-line',
              }}>
                {value}
              </div>
            </div>
          ))}

          {/* 썸네일 */}
          {script.thumbnails?.length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                썸네일 문구
              </p>
              <div style={{
                background: C.bg3, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {script.thumbnails.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      flexShrink: 0, width: 22, height: 22,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 6, background: C.accentDim, color: C.accentTxt,
                      fontSize: 12, fontWeight: 700,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: C.text1, lineHeight: 1.6 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 해시태그 */}
          {script.hashtags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {script.hashtags.map((tag, i) => (
                <span key={i} style={{
                  padding: '3px 9px', borderRadius: 5,
                  background: C.bg3, border: `1px solid ${C.border}`,
                  color: C.text2, fontSize: 12,
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 복사 버튼 */}
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', borderRadius: 10,
              border: `1px solid ${C.border2}`,
              background: 'transparent', color: C.text1,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.bg3}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <IconCopy />
            {copied ? '복사됐어요!' : '전체 복사'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   대본 히스토리 카드 (아코디언 없음 → 클릭 시 모달)
────────────────────────────────────────── */
function ScriptRow({ script, onDelete, onOpen }) {
  return (
    <div
      onClick={() => onOpen(script)}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '14px 18px',
        cursor: 'pointer',
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = C.border2
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.border
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* 메타 정보 줄 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{
          padding: '2px 9px', borderRadius: 5,
          background: C.accentDim, color: C.accentTxt,
          fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {script.job_type}
        </span>
        <span style={{ fontSize: 11, color: C.text3 }}>{formatDate(script.created_at)}</span>
        <span style={{
          padding: '2px 7px', borderRadius: 4,
          background: C.bg3, color: C.text2,
          fontSize: 11,
        }}>
          {script.duration}
        </span>
        {/* 말투 태그 */}
        {script.tone && (
          <span style={{
            padding: '2px 7px', borderRadius: 4,
            background: C.accentDim, color: C.accentTxt,
            fontSize: 11,
          }}>
            {script.tone}
          </span>
        )}
      </div>

      {/* 훅 미리보기 */}
      <p style={{
        margin: 0, fontSize: 14, color: C.text1,
        fontWeight: 500, lineHeight: 1.5,
        overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {script.hook}
      </p>

      {/* 하단 액션 */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', marginTop: 10,
      }}>
        <button
          onClick={e => { e.stopPropagation(); onDelete(script.id) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7,
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'transparent', color: '#EF4444',
            fontSize: 12, cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <IconTrash /> 삭제
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   통계 카드
────────────────────────────────────────── */
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: '1 1 140px',
      width: '100%', boxSizing: 'border-box',
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '18px 20px',
    }}>
      <p style={{
        margin: '0 0 6px', fontSize: 12.5,
        color: C.text2, fontWeight: 500,
      }}>{label}</p>
      <p style={{
        margin: '0 0 2px', fontSize: 28, fontWeight: 800,
        color: accent ? C.accent : C.text1,
        lineHeight: 1,
      }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 12, color: C.text3 }}>{sub}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════
   대본 히스토리 탭
══════════════════════════════════════════ */
function HistoryTab({ user }) {
  const navigate = useNavigate()
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState(null)
  const [usedCount, setUsedCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)

      // 전체 스크립트
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setScripts(data || [])

      // 이번 달 usage
      const { data: usageData } = await supabase
        .from('usage')
        .select('count')
        .eq('user_id', user.id)
        .single()
      setUsedCount(usageData?.count ?? 0)

      setLoading(false)
    }

    fetchData()
  }, [user])

  const handleDelete = async (id) => {
    const { error } = await supabase.from('scripts').delete().eq('id', id)
    if (!error) setScripts(prev => prev.filter(s => s.id !== id))
  }

  // 이번달 생성 수
  const thisMonth = scripts.filter(s => s.created_at >= monthStart()).length
  const FREE_LIMIT = 5
  const remaining = Math.max(0, FREE_LIMIT - usedCount)

  return (
    <>
      {/* 모달 */}
      {selectedScript && (
        <ScriptModal script={selectedScript} onClose={() => setSelectedScript(null)} />
      )}

      {/* 통계 카드 3개 */}
      <div className="mp-stat-cards" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28, width: '100%', boxSizing: 'border-box' }}>
        <StatCard label="이번달 생성 수" value={thisMonth} sub="건" />
        <StatCard label="저장된 대본 수" value={scripts.length} sub="개" />
        <StatCard label="잔여 횟수" value={remaining} sub={`/ ${FREE_LIMIT}회`} accent={remaining > 0} />
      </div>

      {/* 섹션 제목 + 새 대본 버튼 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
      }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text1 }}>
          저장된 대본
          {!loading && (
            <span style={{ marginLeft: 8, fontSize: 13, color: C.text3, fontWeight: 400 }}>
              {scripts.length}개
            </span>
          )}
        </h2>
        <button
          onClick={() => navigate('/generate')}
          style={{
            padding: '7px 14px', borderRadius: 8,
            border: 'none', background: C.accent, color: '#0F1117',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          + 새 대본 생성
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: 32, height: 32,
            border: `2px solid ${C.border}`,
            borderTopColor: C.accent,
            borderRadius: '50%',
            animation: 'mp-spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && scripts.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16,
          width: '100%', boxSizing: 'border-box'
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 40 }}>📄</p>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: C.text1 }}>
            저장된 대본이 없어요
          </p>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: C.text2 }}>
            대본을 생성하고 저장하면 여기서 확인할 수 있어요
          </p>
          <button
            onClick={() => navigate('/generate')}
            style={{
              padding: '10px 22px', borderRadius: 10,
              border: 'none', background: C.accent, color: '#0F1117',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            AI 대본 생성하러 가기
          </button>
        </div>
      )}

      {/* 대본 목록 */}
      {!loading && scripts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', boxSizing: 'border-box' }}>
          {scripts.map(script => (
            <ScriptRow
              key={script.id}
              script={script}
              onDelete={handleDelete}
              onOpen={setSelectedScript}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════════════════
   사용량 현황 탭
══════════════════════════════════════════ */
function UsageTab({ user }) {
  const navigate = useNavigate()
  const [usedCount, setUsedCount] = useState(0)
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const FREE_LIMIT = 5

  useEffect(() => {
    if (!user) return

    const fetchUsage = async () => {
      setLoading(true)

      // 사용량
      const { data: usageData } = await supabase
        .from('usage')
        .select('count')
        .eq('user_id', user.id)
        .single()
      setUsedCount(usageData?.count ?? 0)

      // 유료 여부
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_paid')
        .eq('id', user.id)
        .single()
      setIsPaid(profile?.is_paid === true)

      setLoading(false)
    }

    fetchUsage()
  }, [user])

  const percent = isPaid ? 100 : Math.min((usedCount / FREE_LIMIT) * 100, 100)
  const planLabel = isPaid ? '유료 플랜' : '무료 플랜'
  const planDetail = isPaid
    ? '무제한으로 대본을 생성하고 저장할 수 있어요.'
    : `이번 달 ${usedCount} / ${FREE_LIMIT}회 사용했어요.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', boxSizing: 'border-box' }}>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: 32, height: 32,
            border: `2px solid ${C.border}`,
            borderTopColor: C.accent,
            borderRadius: '50%',
            animation: 'mp-spin 0.8s linear infinite',
          }} />
        </div>
      ) : (
        <>
          {/* 사용량 카드 */}
          <div style={{
            width: '100%', boxSizing: 'border-box',
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: '22px 24px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 14,
            }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text1 }}>
                이번 달 사용량
              </p>
              {isPaid ? (
                <span style={{
                  padding: '3px 10px', borderRadius: 20,
                  background: C.accentDim, color: C.accentTxt,
                  fontSize: 12, fontWeight: 700,
                }}>무제한</span>
              ) : (
                <span style={{ fontSize: 13, color: C.text2 }}>
                  <strong style={{ color: C.text1 }}>{usedCount}</strong> / {FREE_LIMIT}회
                </span>
              )}
            </div>

            {/* 프로그레스바 */}
            <div style={{
              height: 10, borderRadius: 8,
              background: C.bg3,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${percent}%`,
                borderRadius: 8,
                background: isPaid
                  ? `linear-gradient(90deg, ${C.accent}, #22D3EE)`
                  : percent >= 100
                    ? '#EF4444'
                    : `linear-gradient(90deg, ${C.accent}, #A3E635)`,
                transition: 'width 0.6s ease',
              }} />
            </div>

            <p style={{ margin: '10px 0 0', fontSize: 12.5, color: C.text2 }}>
              {planDetail}
            </p>
          </div>

          {/* 현재 플랜 카드 */}
          <div style={{
            width: '100%', boxSizing: 'border-box',
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: '22px 24px',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: C.text2, fontWeight: 500 }}>
              현재 플랜
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 8,
                background: isPaid ? C.accentDim : C.bg3,
                color: isPaid ? C.accentTxt : C.text2,
                fontSize: 13, fontWeight: 700,
              }}>
                {planLabel}
              </span>
              {isPaid && (
                <span style={{ fontSize: 18 }}>✨</span>
              )}
            </div>

            {!isPaid && (
              <button
                onClick={() => navigate('/pricing')}
                style={{
                  width: '100%', padding: '11px 0',
                  borderRadius: 10,
                  border: 'none',
                  background: C.accent, color: '#0F1117',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'opacity .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                업그레이드 하기 →
              </button>
            )}
          </div>

          {/* 플랜 비교 표 */}
          {!isPaid && (
            <div style={{
              width: '100%', boxSizing: 'border-box',
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '22px 24px',
            }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.text1 }}>
                플랜 비교
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 0' }}>
                {[
                  ['', '무료', '유료'],
                  ['월 생성 횟수', '5회', '무제한'],
                  ['대본 저장', '5개/월', '무제한'],
                  ['AI 모델', 'Claude Haiku', 'Claude Haiku'],
                ].map((row, ri) => (
                  row.map((cell, ci) => (
                    <div key={`${ri}-${ci}`} style={{
                      padding: '8px 10px',
                      borderBottom: ri < 3 ? `1px solid ${C.border}` : 'none',
                      fontSize: ri === 0 ? 11 : 13,
                      fontWeight: ri === 0 || ci === 0 ? 600 : 400,
                      color: ri === 0 ? C.text3 : ci === 2 ? C.accentTxt : C.text1,
                      background: ri === 0 ? C.bg3 : 'transparent',
                      borderRadius: ri === 0 ? 6 : 0,
                    }}>
                      {cell}
                    </div>
                  ))
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   계정 설정 탭
══════════════════════════════════════════ */
function SettingsTab({ user }) {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    navigate('/')
  }

  const joined = user?.created_at ? formatDate(user.created_at) : '-'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', boxSizing: 'border-box' }}>

      {/* 계정 정보 */}
      <div style={{
        width: '100%', boxSizing: 'border-box',
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '22px 24px',
      }}>
        <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.text1 }}>
          계정 정보
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: C.text3, fontWeight: 500 }}>이메일</p>
            <p style={{
              margin: 0, fontSize: 14, color: C.text1,
              padding: '10px 14px',
              background: C.bg3, border: `1px solid ${C.border}`,
              borderRadius: 9,
              userSelect: 'all',
              width: '100%', boxSizing: 'border-box', wordBreak: 'break-all'
            }}>
              {user?.email}
            </p>
          </div>
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: C.text3, fontWeight: 500 }}>가입일</p>
            <p style={{
              margin: 0, fontSize: 14, color: C.text2,
              padding: '10px 14px',
              background: C.bg3, border: `1px solid ${C.border}`,
              borderRadius: 9,
              width: '100%', boxSizing: 'border-box'
            }}>
              {joined}
            </p>
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <div style={{
        width: '100%', boxSizing: 'border-box',
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '22px 24px',
      }}>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: C.text1 }}>
          로그아웃
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: C.text2 }}>
          현재 계정에서 로그아웃합니다.
        </p>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            padding: '10px 22px', borderRadius: 9,
            border: `1px solid ${C.border2}`,
            background: 'transparent', color: C.text1,
            fontSize: 13, fontWeight: 600, cursor: loggingOut ? 'not-allowed' : 'pointer',
            transition: 'background .15s, border-color .15s',
            opacity: loggingOut ? 0.6 : 1,
          }}
          onMouseEnter={e => {
            if (!loggingOut) {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
              e.currentTarget.style.color = '#EF4444'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = C.border2
            e.currentTarget.style.color = C.text1
          }}
        >
          {loggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MyPage (메인)
══════════════════════════════════════════ */
export default function MyPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('history')

  /* 비로그인 리다이렉트 */
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth')
  }, [user, authLoading, navigate])

  if (authLoading) return null

  return (
    <>
      <style>{`
        @keyframes mp-spin { to { transform: rotate(360deg); } }
        /* 모달 스크롤바 */
        .mp-modal-scroll::-webkit-scrollbar { width: 4px; }
        .mp-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .mp-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 99px; }
        .mp-modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }
        .mp-modal-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.10) transparent; }
        /* 사이드바 active 인디케이터 (데스크탑) */
        .mp-sidebar-item { border-left: 3px solid transparent; }
        .mp-sidebar-item-active { border-left: 3px solid #4ADE80 !important; }
        @media (max-width: 640px) {
          .mp-layout { flex-direction: column !important; gap: 0 !important; }
          .mp-sidebar {
            flex-direction: row !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            min-width: unset !important;
            width: 100% !important;
            padding: 0 !important;
            gap: 0 !important;
            border-radius: 12px 12px 0 0 !important;
            border-bottom: 1px solid #2E3450 !important;
          }
          .mp-sidebar-item {
            flex: 1 !important;
            flex-shrink: 0 !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-bottom: 3px solid transparent !important;
            padding: 14px 12px !important;
            justify-content: center !important;
            font-size: 12px !important;
            min-width: 80px !important;
            width: auto !important;
          }
          .mp-sidebar-item-active {
            border-left: none !important;
            border-bottom: 3px solid #4ADE80 !important;
          }
          .mp-content { margin-top: 16px !important; }
          .mp-stat-cards { flex-direction: column !important; }
          .mp-stat-cards > div { flex: unset !important; width: 100% !important; }
        }
      `}</style>

      <div style={{
        maxWidth: 1000,
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: 'clamp(24px, 4vw, 48px) 20px 80px',
      }}>

        {/* 페이지 제목 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: C.text1 }}>
            마이페이지
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: C.text2 }}>
            {user?.email}
          </p>
        </div>

        {/* 레이아웃: 사이드바 + 콘텐츠 */}
        <div
          className="mp-layout"
          style={{ display: 'flex', gap: 24, alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}
        >

          {/* ── 사이드바 ── */}
          <nav
            className="mp-sidebar"
            style={{
              minWidth: 180,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: '10px 8px',
            }}
          >
            {TABS.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className={active ? 'mp-sidebar-item mp-sidebar-item-active' : 'mp-sidebar-item'}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '10px 13px',
                    borderRadius: 9,
                    border: 'none',
                    background: active ? C.bg3 : 'transparent',
                    color: active ? C.text1 : C.text2,
                    fontSize: 13.5,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background .15s, color .15s',
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = C.bg3
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: 16 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* ── 콘텐츠 영역 ── */}
          <div className="mp-content" style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            {activeTab === 'history'  && <HistoryTab  user={user} />}
            {activeTab === 'usage'    && <UsageTab    user={user} />}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>

        </div>
      </div>
    </>
  )
}
