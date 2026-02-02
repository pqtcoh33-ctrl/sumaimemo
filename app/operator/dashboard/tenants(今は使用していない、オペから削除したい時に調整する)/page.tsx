import { createSupabaseServer } from '@/lib/supabase/server'
import { deleteTenant } from './actions'

export default async function OperatorTenantsPage() {
  const supabase = createSupabaseServer()

  const { data: tenants } = await supabase
    .from('profiles')
    .select('user_id, unit_label, property_id')
    .eq('role', 'tenant')
    .order('created_at', { ascending: false })

  return (
    <div style={{ marginTop: 24 }}>
      <h2>入居者（削除のみ）</h2>

      <ul>
        {tenants?.map((tenant) => (
          <li key={tenant.user_id} style={{ marginBottom: 8 }}>
            <span>
              user_id: {tenant.user_id}
              {tenant.unit_label && ` / 部屋: ${tenant.unit_label}`}
            </span>

            <form
              action={async () => {
                'use server'
                await deleteTenant(tenant.user_id)
              }}
              style={{ display: 'inline', marginLeft: 8 }}
            >
              <button type="submit">削除</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
