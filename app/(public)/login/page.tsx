// app/(public)/login/page.tsx
import LoginForm from './LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div>
      <h1>ログイン</h1>

      <LoginForm />

      {/* ▼ パスワード再設定リンク */}
      <div style={{ marginTop: 16 }}>
        <Link
          href="/forgot-password"
          style={{ fontSize: 14, color: '#555' }}
        >
          パスワードを忘れた方はこちら
        </Link>
      </div>
    </div>
  )
}
