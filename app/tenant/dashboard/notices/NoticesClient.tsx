'use client'

import Link from 'next/link'

type Notice = {
  id: string
  title: string
  body: string
  created_at: string
  isUnread: boolean
}

function excerpt(text: string, length = 80) {
  if (text.length <= length) return text
  return text.slice(0, length) + '…'
}

export default function NoticesClient({
  notices,
}: {
  notices: Notice[]
}) {
  if (!notices || notices.length === 0) {
    return <p className="text-sm text-gray-500">現在、お知らせはありません。</p>
  }

  return (
    <div className="space-y-3">
      {notices.map((n) => (
        <article
          key={n.id}
          className="
            rounded-xl border border-gray-200 bg-white
            p-4
            shadow-sm
          "
        >
          <div className="flex items-center gap-2">
            <Link
              href={`/tenant/dashboard/notices/${n.id}`}
              className="font-semibold text-sm"
            >
              {n.title}
            </Link>

            {n.isUnread && (
              <span
    style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '12px',
    }}
  >
    未読
  </span>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {excerpt(n.body)}
          </p>

          <div className="mt-2 text-xs text-gray-400">
            {new Date(n.created_at).toLocaleDateString()}
          </div>
        </article>
      ))}
    </div>
  )
}
