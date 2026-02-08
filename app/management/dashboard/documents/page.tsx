import DocumentsClient from './DocumentsClient'
import { getDocumentsStats } from '@/lib/management/getDocumentsStats'
export const dynamic = 'force-dynamic'

type Props = {
  searchParams: { property?: string }
}

export default async function DocumentsPage({ searchParams }: Props) {
  const propertyId = searchParams.property

  if (!propertyId) {
    return (
      <div className="p-4 text-sm text-gray-500">
        表示する物件を選択してください。
      </div>
    )
  }

  const documents = await getDocumentsStats([propertyId])

  if (documents.length === 0) {
    return <p>書類はまだありません。</p>
  }

  return <DocumentsClient documents={documents} />
}
