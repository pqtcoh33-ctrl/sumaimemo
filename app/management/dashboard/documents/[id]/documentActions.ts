'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateDocument(
  documentId: string,
  title: string,
  ) {
  const supabase = await createSupabaseServer()

  const { error } = await supabase
    .from('documents')
    .update({
      title,
          })
    .eq('id', documentId)

  if (error) {
    throw new Error('書類の更新に失敗しました')
  }

  
}

export async function deleteDocument(
  documentId: string,
  filePath: string
) {
  const supabase = await createSupabaseServer()

  // ① Storage のファイル削除
  const { error: storageError } = await supabase
    .storage
    .from('documents')
    .remove([filePath])

  if (storageError) {
    console.error('Storage delete error:', storageError)
    throw new Error('ファイルの削除に失敗しました')
  }

  // ② documents テーブル削除
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    console.error('DB delete error:', dbError)
    throw new Error('書類データの削除に失敗しました')
  }
}

  


