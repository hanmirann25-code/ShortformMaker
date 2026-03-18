import { useState, useEffect, useCallback } from 'react'

/* ── 토스트 타입별 색상 ── */
const TYPE_STYLES = {
  success: {
    background: '#14532d',
    border: '1px solid #22c55e',
    iconColor: '#4ade80',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    background: '#450a0a',
    border: '1px solid #ef4444',
    iconColor: '#f87171',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  info: {
    background: '#172554',
    border: '1px solid #3b82f6',
    iconColor: '#60a5fa',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
}

/* ── 단일 Toast 아이템 ── */
function ToastItem({ id, type = 'success', message, onRemove }) {
  const [visible, setVisible] = useState(false)
  const styles = TYPE_STYLES[type] || TYPE_STYLES.success

  useEffect(() => {
    // mount 후 에니메이션 시작
    const showTimer = requestAnimationFrame(() => setVisible(true))
    // 1800ms 후 fade-out 시작
    const fadeTimer = setTimeout(() => setVisible(false), 1800)
    // 2100ms 후 완전 제거
    const removeTimer = setTimeout(() => onRemove(id), 2100)

    return () => {
      cancelAnimationFrame(showTimer)
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [id, onRemove])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 10,
        background: styles.background,
        border: styles.border,
        color: '#f0f4ff',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        minWidth: 220,
        maxWidth: 320,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => onRemove(id)}
    >
      <span style={{ color: styles.iconColor, flexShrink: 0, display: 'flex' }}>
        {styles.icon}
      </span>
      <span style={{ lineHeight: 1.5 }}>{message}</span>
    </div>
  )
}

/* ── Toast 컨테이너 (우하단 고정) ── */
export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 9999,
      }}
    >
      {toasts.map(t => (
        <ToastItem
          key={t.id}
          id={t.id}
          type={t.type}
          message={t.message}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

/* ── useToast 훅 ── */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
