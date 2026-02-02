'use client'

type Property = {
  id: string
  name: string
}

type Props = {
  properties: Property[]
  selectedPropertyId: string | null
}

export default function PropertySelector({
  properties,
  selectedPropertyId,
}: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label>
        物件選択：
        <select
          value={selectedPropertyId ?? ''}
          onChange={(e) => {
            const propertyId = e.target.value

            const params = new URLSearchParams(window.location.search)

            if (propertyId) {
              params.set('property', propertyId)
            } else {
              params.delete('property')
            }

            window.location.href = `${window.location.pathname}?${params.toString()}`
          }}
          style={{ marginLeft: 8 }}
        >
          
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
