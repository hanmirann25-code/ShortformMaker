import { Link } from 'react-router-dom'

const LEGAL_LINKS = [
  { label: '이용약관', to: '/terms' },
  { label: '개인정보처리방침', to: '/privacy' },
]

/* ── 로고 (Footer 전용 소형) ── */
function FooterLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent shrink-0">
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="9" height="12" rx="1.5" fill="#0F1117" />
          <polygon points="13,5.5 17,9 13,12.5" fill="#0F1117" />
        </svg>
      </span>
      <span className="text-text1 font-semibold text-sm tracking-tight">
        숏폼<span className="text-accent">메이커</span>
      </span>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-bg2 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* 상단: 좌우 2단 (데스크탑) / 세로 중앙 (모바일) */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between">

          {/* 좌측: 로고 + 소개 */}
          <div className="flex flex-col items-center gap-1.5 md:items-start">
            <FooterLogo />
            <p className="text-text2 text-[13px] mt-0.5">
              부업 노하우를 5분 만에 쇼츠 대본으로
            </p>
          </div>

          {/* 우측: 법적 링크 */}
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-text2 hover:text-text1 transition-colors text-[13px]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* 하단 중앙: 저작권 */}
        <p className="mt-8 text-center text-text2 text-[13px]">
          © 2026 숏폼메이커. All rights reserved.
        </p>

      </div>
    </footer>
  )
}
