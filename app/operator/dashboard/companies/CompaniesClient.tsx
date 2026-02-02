'use client'

import { useState } from 'react'
import { createManagementCompany, deleteManagementCompany } from './actions'

interface Company {
  id: string
  name: string
  is_active: boolean
}

interface Props {
  initialCompanies: Company[]
}

export default function CompaniesClient({ initialCompanies }: Props) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createManagementCompany(formData)
    // 登録後はページ再読み込みで更新
    window.location.reload()
  }

  const handleDelete = async (companyId: string) => {
    if (!confirm('本当に削除しますか？')) return
    await deleteManagementCompany(companyId)
    setCompanies((prev) => prev.filter((c) => c.id !== companyId))
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>管理会社登録</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input type="text" name="name" placeholder="会社名" required />
        <input type="email" name="email" placeholder="メールアドレス" required />
        <input type="password" name="password" placeholder="パスワード" required />
        <button type="submit">登録</button>
      </form>

      <h2>既存管理会社一覧</h2>
      <ul>
        {companies.map((c) => (
          <li key={c.id} style={{ marginBottom: 8 }}>
            {c.name} {c.is_active ? '' : '(無効)'}
            <button style={{ marginLeft: 8 }} onClick={() => handleDelete(c.id)}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
