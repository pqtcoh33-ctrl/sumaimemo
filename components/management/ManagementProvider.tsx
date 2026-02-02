// components/management/ManagementProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type ManagementContextType = {
  selectedPropertyId: string | null
  setSelectedPropertyId: (id: string | null) => void
}

const ManagementContext = createContext<ManagementContextType | null>(null)

type Props = {
  children: React.ReactNode
  managementCompanyId: string // ← ★追加（使わないが必須にする）
}

export function ManagementProvider({
  children,
}: Props) {
  const searchParams = useSearchParams()
  const propertyFromUrl = searchParams.get('property')

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    propertyFromUrl
  )

  // URL 変更に追従
  useEffect(() => {
    if (propertyFromUrl !== selectedPropertyId) {
      setSelectedPropertyId(propertyFromUrl)
    }
  }, [propertyFromUrl])

  return (
    <ManagementContext.Provider
      value={{ selectedPropertyId, setSelectedPropertyId }}
    >
      {children}
    </ManagementContext.Provider>
  )
}

export function useManagement() {
  const ctx = useContext(ManagementContext)
  if (!ctx) {
    throw new Error('useManagement must be used within ManagementProvider')
  }
  return ctx
}
