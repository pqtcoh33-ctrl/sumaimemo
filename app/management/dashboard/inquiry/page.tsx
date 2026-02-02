// app/management/dashboard/inquiry/page.tsx
import { getInquiryList } from '@/lib/management/getInquiryList'
import InquiryClient from './InquiryClient'

type Props = {
  searchParams?: {
    property?: string
    status?: string
    date?: string
  }
}

export default async function InquiryPage({ searchParams }: Props) {
  const propertyId = searchParams?.property

  if (!propertyId) {
    return <p>表示する物件を選択してください。</p>
  }

  // Server側で問い合わせ一覧を取得
  const inquiries = await getInquiryList({
    propertyIds: [propertyId],
    status: searchParams?.status,
    date: searchParams?.date,
  })

  if (!inquiries || inquiries.length === 0) {
    return <p>お問い合わせはまだありません。</p>
  }

  // Client Component に渡す
  return <InquiryClient inquiries={inquiries} />
}
