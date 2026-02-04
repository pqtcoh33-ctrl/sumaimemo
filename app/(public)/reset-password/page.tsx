'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!accessToken || !refreshToken) return

    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }, [accessToken, refreshToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error(error)
      setError('パスワードの更新に失敗しました。')
    } else {
      setMessage('パスワードを更新しました。')
      setTimeout(() => router.push('/login'), 1500)
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h1>新しいパスワード設定</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <input
          type="password"
          placeholder="新しいパスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%' }}
        />

        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          更新
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
