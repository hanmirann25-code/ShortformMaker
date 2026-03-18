import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { label: '홈', to: '/', end: true },
  { label: '대본 생성', to: '/generate' },
  { label: '요금제', to: '/pricing' },
  { label: '마이페이지', to: '/mypage' },
]

/* ── 로고 ── */
function Logo() {
  return (
    <NavLink to="/" className="flex items-center gap-2 select-none">
      {/* 초록 아이콘 */}
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="9" height="12" rx="1.5" fill="#0F1117" />
          <polygon points="13,5.5 17,9 13,12.5" fill="#0F1117" />
        </svg>
      </span>
      <span className="text-text1 font-semibold text-[15px] tracking-tight whitespace-nowrap">
        숏폼<span className="text-accent">메이커</span>
      </span>
    </NavLink>
  )
}

/* ── nav 링크 목록 ── */
function NavItems({ onClose }) {
  const base = 'rounded-md px-3 py-3 md:py-1.5 text-sm font-medium transition-colors whitespace-nowrap'
  const active = `${base} bg-accent-dim text-accent-text`
  const inactive = `${base} text-text2 hover:text-text1`

  return (
    <>
      {NAV_ITEMS.map(({ label, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClose}
          className={({ isActive }) => (isActive ? active : inactive)}
        >
          {label}
        </NavLink>
      ))}
    </>
  )
}

/* ── 햄버거 아이콘 ── */
function Hamburger({ open, onClick }) {
  const bar = 'block h-0.5 w-5 bg-text1 transition-all duration-250 origin-center'
  return (
    <button
      onClick={onClick}
      aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
      className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-[5px] rounded-lg hover:bg-bg3 transition-colors"
    >
      <span className={`${bar} ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
      <span className={`${bar} ${open ? 'opacity-0 scale-x-0' : ''}`} />
      <span className={`${bar} ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
    </button>
  )
}

/* ── Header ── */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleCtaClick = () => {
    setMenuOpen(false)
    navigate(user ? '/mypage' : '/auth')
  }

  const ctaLabel = user ? '마이페이지' : '무료 시작'

  return (
    <header className="sticky top-0 z-[100] bg-bg2 border-b border-border">
      {/* 56px 메인 바 */}
      <div className="h-14 flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <Logo />

        {/* 데스크탑: 네비 + CTA */}
        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1 mr-3">
            <NavItems />
          </nav>
          <button
            onClick={handleCtaClick}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-85 active:scale-95 transition-all"
            style={{ background: '#4ADE80', color: '#0F1117' }}
          >
            {ctaLabel}
          </button>
        </div>

        {/* 모바일: 햄버거 */}
        <Hamburger open={menuOpen} onClick={() => setMenuOpen((p) => !p)} />
      </div>

      {/* 모바일 드롭다운 */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-0.5 px-4 pt-2 pb-3 border-t border-border">
          <NavItems onClose={() => setMenuOpen(false)} />
        </nav>
        <div className="px-4 pb-4">
          <button
            onClick={handleCtaClick}
            className="w-full py-2.5 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
            style={{ background: '#4ADE80', color: '#0F1117' }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </header>
  )
}
