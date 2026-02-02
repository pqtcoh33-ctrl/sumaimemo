import Link from 'next/link'
import ManagementNoticeList from '@/components/dashboard/ManagementNoticeList'

type Props = {
  propertyIds: string[]
  selectedPropertyId: string | null
}

export default function DashboardNoticeSection({
  propertyIds,
  selectedPropertyId,
}: Props) {
  return (
    <section
      style={{
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        marginBottom: 10,
      }}
    >
      <ManagementNoticeList propertyIds={propertyIds} limit={5} />

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Link
          href={{
            pathname: '/management/dashboard/notices',
            query: selectedPropertyId ? { property: selectedPropertyId } : {},
          }}
        >
          → お知らせ一覧へ
        </Link>
      </div>
    </section>
  )
}
