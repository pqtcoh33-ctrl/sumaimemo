import Link from 'next/link'
import ManagementInquiryList from '@/components/dashboard/ManagementInquiryList'

type Props = {
  propertyIds: string[]
  selectedPropertyId: string | null
}

export default function DashboardInquirySection({
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
      <ManagementInquiryList propertyIds={propertyIds} limit={3} />

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Link
          href={{
            pathname: '/management/dashboard/inquiry',
            query: selectedPropertyId ? { property: selectedPropertyId } : {},
          }}
        >
          → 問い合わせ一覧へ
        </Link>
      </div>
    </section>
  )
}
