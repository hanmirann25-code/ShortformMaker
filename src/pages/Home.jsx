import { useNavigate } from 'react-router-dom'

/* ── 아이콘 ── */
function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconTable() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

/* ── 기능 카드 데이터 ── */
const FEATURES = [
  {
    icon: <IconBolt />,
    title: '5분 만에 완성',
    desc: '팁 하나 입력하면 훅·본문·마무리까지 자동 완성',
  },
  {
    icon: <IconTable />,
    title: '썸네일 문구 추천',
    desc: '클릭률 높은 썸네일 문구 3가지를 함께 제안',
  },
  {
    icon: <IconTag />,
    title: '해시태그 자동 생성',
    desc: '주제에 딱 맞는 해시태그 10개 바로 복사',
  },
]

/* ── 좌측 accent 바 ── */
function AccentBar() {
  return (
    <div
      style={{
        width: 3,
        borderRadius: 2,
        background: '#4ADE80',
        alignSelf: 'stretch',
        flexShrink: 0,
      }}
    />
  )
}

/* ── 예시 블록 ── */
function SampleBlock({ label, content }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#8B93B0',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: 'flex',
          gap: 10,
          background: '#1E2336',
          borderRadius: 8,
          padding: '12px 14px',
        }}
      >
        <AccentBar />
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: '#F0F4FF',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
          }}
        >
          {content}
        </p>
      </div>
    </div>
  )
}

/* ── 태그 칩 ── */
function Chip({ label }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        background: '#1A3028',
        color: '#86EFAC',
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  )
}

/* ════════════════════════════════════════
   Home Page
════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @media (max-width: 639px) {
          .hm-hero-btns { flex-direction: column !important; }
          .hm-hero-btns > button { width: 100% !important; }
        }
      `}</style>
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '48px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
      {/* ───────────── 섹션 1: 히어로 ───────────── */}
      <section
        style={{
          background: '#232840',
          border: '1px solid #2E3450',
          borderRadius: 20,
          padding: 'clamp(32px, 6vw, 56px) clamp(20px, 5vw, 56px)',
          textAlign: 'center',
        }}
      >
        {/* 배지 */}
        <span
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 999,
            background: '#1A3028',
            color: '#86EFAC',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          AI 쇼츠 대본 생성기
        </span>

        {/* 제목 */}
        <h1
          style={{
            margin: '0 0 16px',
            fontWeight: 500,
            lineHeight: 1.38,
            fontSize: 'clamp(21px, 4vw, 32px)',
            color: '#F0F4FF',
          }}
        >
          부업 노하우를{' '}
          <span style={{ color: '#4ADE80' }}>5분 만에</span>{' '}
          영상 대본으로
        </h1>

        {/* 부제 */}
        <p
          style={{
            margin: '0 auto 32px',
            maxWidth: 480,
            fontSize: 15,
            color: '#8B93B0',
            lineHeight: 1.7,
          }}
        >
          부업 종류와 오늘의 팁만 입력하면 AI가 훅 문장부터 마무리까지 완성해드려요
        </p>

        {/* 버튼 그룹 */}
        <div
          className="hm-hero-btns"
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate('/generate')}
            style={{
              padding: '12px 28px',
              minHeight: 44,
              borderRadius: 10,
              border: 'none',
              background: '#4ADE80',
              color: '#0F1117',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity .15s, transform .1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            무료로 대본 만들기
          </button>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              padding: '12px 28px',
              minHeight: 44,
              borderRadius: 10,
              border: '1px solid #2E3450',
              background: 'transparent',
              color: '#F0F4FF',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color .15s, background .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#4ADE80'
              e.currentTarget.style.background = '#1A3028'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2E3450'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            요금제 보기
          </button>
        </div>
      </section>

      {/* ───────────── 섹션 2: 기능 카드 ───────────── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {FEATURES.map(({ icon, title, desc }) => (
          <div
            key={title}
            style={{
              background: '#232840',
              border: '1px solid #2E3450',
              borderRadius: 16,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* 아이콘 박스 */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#1A3028',
                color: '#4ADE80',
                flexShrink: 0,
              }}
            >
              {icon}
            </span>

            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#F0F4FF',
                }}
              >
                {title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: '#8B93B0',
                  lineHeight: 1.65,
                }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ───────────── 섹션 3: 생성 예시 ───────────── */}
      <section
        style={{
          background: '#232840',
          border: '1px solid #2E3450',
          borderRadius: 16,
          padding: '24px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* 상단: 레이블 + 태그 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#8B93B0',
              marginRight: 2,
            }}
          >
            생성 예시
          </span>
          <Chip label="스마트스토어" />
          <Chip label="친근하게" />
          <Chip label="60초" />
        </div>

        {/* 훅 문장 */}
        <SampleBlock
          label="훅 문장"
          content="스마트스토어로 월 100만 원 버는 거, 생각보다 어렵지 않아요. 오늘 딱 하나만 알려드릴게요."
        />

        {/* 본문 대본 */}
        <SampleBlock
          label="본문 대본"
          content={`처음엔 저도 뭘 팔아야 할지 몰랐어요.\n그런데 주변에서 흔히 볼 수 있는 물건, 직접 쓰던 물건부터 시작했더니 첫 달에 주문이 들어오기 시작했어요.\n핵심은 "상세 페이지"예요. 고객이 궁금해할 내용을 사진 한 장에 담아야 해요.`}
        />

        {/* 썸네일 문구 */}
        <SampleBlock
          label="썸네일 문구"
          content={`① 스마트스토어 첫 달 수익 공개\n② 아무것도 없이 시작한 부업 이야기\n③ 이것만 알면 스토어 매출 2배`}
        />
      </section>
    </div>
    </>
  )
}
