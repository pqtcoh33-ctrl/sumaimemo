import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

type Props = {
  params: {
    token: string
  }
}

type InviteRow = {
  id: string
  unit_label: string
  property_id: string
  used_at: string | null
  properties: {
    id: string
    name: string
    management_company_id: string
  } | null
}

export default async function InviteTokenPage({ params }: Props) {
  const supabase = await createSupabaseServer()

  /* =========================
     招待情報取得
     ========================= */
  const { data, error } = await supabase
    .from('tenant_invites')
    .select(
      `
        id,
        unit_label,
        property_id,
        used_at,
        properties (
          id,
          name,
          management_company_id
        )
      `
    )
    .eq('token', params.token)
    .single<InviteRow>()

  if (error || !data) {
    return <div>招待リンクが無効です</div>
  }

  if (data.used_at) {
    return <div>この招待リンクはすでに使用されています</div>
  }

  if (!data.properties) {
    return <div>物件情報が取得できません</div>
  }

  const invite = data
  const property = data.properties

  /* =========================
     Server Action
     ========================= */
  async function registerTenant(formData: FormData) {
    'use server'

    const supabase = await createSupabaseServer()

    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()

    if (!email || !password) {
      throw new Error('入力内容が不足しています')
    }

    /* 1) ユーザー作成 */
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      })

    if (signUpError || !signUpData.user) {
      throw new Error(signUpError?.message ?? '登録に失敗しました')
    }

    const userId = signUpData.user.id

    /* =========================
       Service Role Client
       ========================= */
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    /* 2) profiles 作成 */
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        user_id: userId,
        role: 'tenant',
        property_id: invite.property_id,
        unit_label: invite.unit_label,
        management_company_id: property.management_company_id,
      })

    if (profileError) {
      throw new Error(profileError.message)
    }

    /* 3) 招待を使用済みに */
    const { error: inviteError } = await admin
      .from('tenant_invites')
      .update({
        tenant_user_id: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    if (inviteError) {
      throw new Error(inviteError.message)
    }

    /* 4) ログイン */
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (signInError) {
      throw new Error(signInError.message)
    }

    redirect('/tenant/dashboard')
  }

  /* =========================
     表示
     ========================= */
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1>入居者 初回登録</h1>

      <p>
        物件：<strong>{property.name}</strong>
        <br />
        部屋番号：<strong>{invite.unit_label}</strong>
      </p>

      <form action={registerTenant} style={{ display: 'grid', gap: 12 }}>
        <label>
          メールアドレス
          <input name="email" type="email" required />
        </label>

        <label>
          パスワード
          <input name="password" type="password" required />
        </label>

        <button type="submit">登録して利用開始</button>
      </form>
    </div>
  )
}
