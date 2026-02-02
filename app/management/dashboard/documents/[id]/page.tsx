import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/getProfile'
import DocumentEditClient from './DocumentEditClient'

type Props = {
  params: { id: string }
  searchParams?: {
    property_id?: string
  }
}

export default async function DocumentEditPage({
  params,
  searchParams,
}: Props) {
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    redirect('/login')
  }

  const supabase = await createSupabaseServer()

  let query = supabase
    .from('documents')
    .select('id, title, file_path, created_at, property_id')
    .eq('id', params.id)
    .single()

  const { data: document, error } = await query

  if (error || !document) {
    redirect('/management/dashboard/documents')
  }

  // ★ ヘッダー選択中の物件と一致しない場合は弾く
  if (
    searchParams?.property_id &&
    document.property_id !== searchParams.property_id
  ) {
    redirect('/management/dashboard/documents')
  }

  return (
    <DocumentEditClient
      documentId={document.id}
      initialTitle={document.title}
      filePath={document.file_path}
      createdAt={document.created_at}
    />
  )
}
