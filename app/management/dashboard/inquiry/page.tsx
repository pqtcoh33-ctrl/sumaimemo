// app/management/dashboard/inquiry/page.tsx
import { getInquiryList } from '@/lib/management/getInquiryList'
import InquiryClient from './InquiryClient'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: {
    property?: string
    status?: string
    range?: string
    category?: string
  }
}

export default async function InquiryPage({ searchParams }: Props) {
  const propertyId = searchParams?.property

  if (!propertyId) {
    return <p>表示する物件を選択してください。</p>
  }

  const today = new Date()
  let fromDate: string | undefined

  // ===== クイック期間 =====
  switch (searchParams?.range) {
    case 'today': {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      fromDate = start.toISOString()
      break
    }

    case '7days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      fromDate = start.toISOString()
      break
    }

    case '30days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      fromDate = start.toISOString()
      break
    }

    case 'all':
    default:
      fromDate = undefined
  }

  const inquiries = await getInquiryList({
    propertyIds: [propertyId],
    status: searchParams?.status,
    category: searchParams?.category,
    from: fromDate,
  })

  if (!inquiries || inquiries.length === 0) {
    return <p>お問い合わせはまだありません。</p>
  }

  return <InquiryClient inquiries={inquiries} />
}
