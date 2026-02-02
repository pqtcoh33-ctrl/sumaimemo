import Link from 'next/link'

export default function OperatorDashboardPage() {
  return (
    <div style={{ marginTop: 24 }}>
        <ul style={{ display: 'grid', gap: 12 }}>
        
        <li>
          <Link href="/operator/dashboard/companies">
            管理会社の登録・削除
          </Link>
        </li>

        <li>
          <Link href="/operator/dashboard/properties">
            物件の登録・削除
          </Link>
        </li>

        
      </ul>
    </div>
  )
}
