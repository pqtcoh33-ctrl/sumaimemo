import Link from 'next/link'
import ManagementDocumentList from '@/components/dashboard/ManagementDocumentList'

type Props = {
  propertyIds: string[]
  selectedPropertyId: string | null
}

export default function DashboardDocumentSection({
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
      <ManagementDocumentList propertyIds={propertyIds} limit={5} />

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Link
          href={{
            pathname: '/management/dashboard/documents',
            query: selectedPropertyId ? { property: selectedPropertyId } : {},
          }}
        >
          → 書類一覧へ
        </Link>
      </div>
    </section>
  )
}
