'use client'

import { useState } from 'react'
import { createProperty, deleteProperty } from './actions'


interface Property {
  id: string
  name: string
  management_company_id: string
}

interface ManagementCompany {
  id: string
  name: string
}

interface Props {
  initialProperties: Property[]
  managementCompanies: ManagementCompany[]
}

export default function PropertiesClient({ initialProperties, managementCompanies }: Props) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)

  // 登録処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const newProperty = await createProperty(formData) // 登録後の物件を取得
      setProperties([...properties, newProperty])       // state に即反映
      e.currentTarget.reset()
      
    } catch (err) {
      console.error(err)
      
    }
  }

  // 削除処理
  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id)
      setProperties(properties.filter((p) => p.id !== id)) // state から即削除
      
    } catch (err) {
      console.error(err)
     
    }
  }

  return (
    <div>
      

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input name="name" placeholder="物件名" required />

        <select name="managementCompanyId" required>
          <option value="">管理会社を選択</option>
          {managementCompanies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button type="submit">登録</button>
      </form>

      <ul>
        {properties.map((p) => (
          <li key={p.id}>
            {p.name}{' '}
            <button onClick={() => handleDelete(p.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
