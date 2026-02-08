import DocumentList from './DocumentList'
export const dynamic = 'force-dynamic'

export default function TenantDocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">書類一覧</h1>
      <DocumentList />
    </div>
  )
}
