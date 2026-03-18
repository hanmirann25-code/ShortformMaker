import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const FREE_LIMIT = 5
const LS_KEY = 'usage_count'
const LS_RESET_KEY = 'usage_reset_at'

/* localStorage 기반 (비로그인) */
function getLocalUsage() {
  try {
    const resetAt = localStorage.getItem(LS_RESET_KEY)
    const now = new Date()
    // 리셋 시각이 없거나 이미 지났으면 초기화
    if (!resetAt || now >= new Date(resetAt)) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      localStorage.setItem(LS_RESET_KEY, nextMonth.toISOString())
      localStorage.setItem(LS_KEY, '0')
      return 0
    }
    return parseInt(localStorage.getItem(LS_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function incrementLocalUsage() {
  try {
    const current = getLocalUsage()
    const next = current + 1
    localStorage.setItem(LS_KEY, String(next))
    return next
  } catch {
    return 0
  }
}

/* Supabase 기반 (로그인) */
async function getRemoteUsage(userId) {
  if (!isSupabaseConfigured) return null

  const now = new Date()
  const { data, error } = await supabase
    .from('usage')
    .select('id, count, reset_at')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('usage fetch error:', error)
    return null
  }

  // 레코드 없음 → 이번 달 생성한 scripts 수로 초기화
  if (!data) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // 이번 달 생성된 scripts 수 조회 (기존 사용 이력 반영)
    const { count: existingCount } = await supabase
      .from('scripts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart)

    const initialCount = existingCount ?? 0

    const { data: created, error: insErr } = await supabase
      .from('usage')
      .upsert({ user_id: userId, count: initialCount, reset_at: nextMonth }, { onConflict: 'user_id', ignoreDuplicates: false })
      .select('id, count, reset_at')
      .single()
    if (insErr) { console.error('usage upsert error:', insErr); return null }
    return created
  }

  // 리셋 시각 지남 → count 초기화
  if (now >= new Date(data.reset_at)) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    const { data: updated, error: updErr } = await supabase
      .from('usage')
      .update({ count: 0, reset_at: nextMonth })
      .eq('id', data.id)
      .select('id, count, reset_at')
      .single()
    if (updErr) { console.error('usage reset error:', updErr); return null }
    return updated
  }

  return data
}

async function incrementRemoteUsage(userId) {
  if (!isSupabaseConfigured) return

  const rec = await getRemoteUsage(userId)
  if (!rec) return

  const { error } = await supabase
    .from('usage')
    .update({ count: rec.count + 1 })
    .eq('id', rec.id)

  if (error) console.error('usage increment error:', error)
}

/* ── Hook ── */
export function useUsage(user) {
  const [usedCount, setUsedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (user) {
        const rec = await getRemoteUsage(user.id)
        setUsedCount(rec ? rec.count : 0)
      } else {
        setUsedCount(getLocalUsage())
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const canGenerate = usedCount < FREE_LIMIT

  const recordUsage = useCallback(async () => {
    if (user) {
      await incrementRemoteUsage(user.id)
    } else {
      incrementLocalUsage()
    }
    setUsedCount(prev => prev + 1)
  }, [user])

  const remaining = Math.max(0, FREE_LIMIT - usedCount)

  return { usedCount, remaining, canGenerate, loading, refresh, recordUsage, FREE_LIMIT }
}
