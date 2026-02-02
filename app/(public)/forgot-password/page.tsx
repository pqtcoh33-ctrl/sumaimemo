'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('メール送信に失敗しました。')
    } else {
      setMessage('パスワード再設定用のメールを送信しました。')
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h1>パスワード再設定</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <label>
          登録済みメールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginTop: 4 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          メールを送信
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: 'green' }}>{message}</p>
      )}
      {error && (
        <p style={{ marginTop: 16, color: 'red' }}>{error}</p>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/login">ログイン画面に戻る</Link>
      </div>
    </div>
  )
}
