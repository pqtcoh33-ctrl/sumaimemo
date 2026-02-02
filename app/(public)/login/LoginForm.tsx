'use client'

import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/tenant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        // API が返すユーザー向けメッセージを表示
        throw new Error(result.message || 'ログインに失敗しました')
      }

      // cookie が反映されたあと、Server Component で role 判定
      window.location.href = '/login-redirect'
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={onSubmit} disabled={loading}>
        {loading ? '処理中...' : 'ログイン'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
