// lib/auth/handleLoginError.ts
export function handleLoginError(error: { message: string }) {
  // Supabase など外部エラー → ユーザー向けに変換
  if (!error) return 'ログインに失敗しました。'

  // ここでは全て「メールアドレスまたはパスワードが違います」と統一
  return 'メールアドレスまたはパスワードが違います。'
}
