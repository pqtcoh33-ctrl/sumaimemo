'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import QRCode from 'react-qr-code'

type BulkToken = {
  unitLabel: string
  token: string
}

export default function InvitePrintTemplatePage() {
  const searchParams = useSearchParams()
  const data = searchParams.get('data')
  const propertyNameParam = searchParams.get('propertyName') ?? '' // 追加：物件名取得

  const tokens: BulkToken[] = useMemo(() => {
    if (!data) return []
    try {
      return JSON.parse(decodeURIComponent(data))
    } catch {
      return []
    }
  }, [data])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://www.sumaimemo.jp'

  // ✅ テンプレート編集状態
  const [companyName, setCompanyName] = useState('〇〇管理 株式会社')
  const [message, setMessage] = useState(
    'この度は〇〇〇〇マンションにご入居頂きありがとうございます。入居者様と管理会社をつなぐ、住まいサポートアプリ「住まいメモ」のご利用登録をお願いしたします。下記QRコードからアクセスし、入居者登録を完了させて下さい。'
  )
  const [footer, setFooter] = useState(
    'ご不明な点等ございましたら、管理会社までお問合せください。'
  )

  // URLパラメータから物件名を反映
  const [propertyName] = useState(propertyNameParam)

  return (
    <>
      <style>{`
        @media print {
          /* アプリ共通ヘッダーを消す */
          header {
            display: none !important;
          }
          /* 編集UIは印刷しない */
          .edit-area {
            display: none !important;
          }
          body {
            margin: 0;
          }
          .print-page {
            page-break-after: always;
          }
        }
      `}</style>

      <div
        style={{
          padding: 24,
          display: 'grid',
          gap: 32,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {/* ===== 編集エリア（画面表示のみ） ===== */}
        <div
          className="edit-area"
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            display: 'grid',
            gap: 16,
          }}
        >
          <h1 style={{ fontSize: 22 }}>印刷用テンプレート編集</h1>

          <label>
            管理会社名
            <textarea
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ width: '100%', padding: 6, marginTop: 4 }}
            />
          </label>

          <label>
            メッセージ本文
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: 6, minHeight: 80, marginTop: 4 }}
            />
          </label>

          <label>
            フッター文
            <textarea
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              style={{ width: '100%', padding: 6, marginTop: 4 }}
            />
          </label>

          <button
            onClick={() => window.print()}
            style={{ padding: '8px 12px', cursor: 'pointer' }}
          >
            印刷プレビュー
          </button>
        </div>

        {/* ===== 印刷プレビュー ===== */}
        <div>
          {tokens.map(({ unitLabel, token }, index) => {
            const inviteUrl = `${appUrl}/invite/${token}`

            return (
              <div
                key={index}
                className="print-page"
                style={{
                  width: '210mm',
                  height: '297mm',
                  padding: '24mm',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid #aaa',
                  background: '#fff',
                  margin: '0 auto',
                }}
              >
                <div>
                  <h2 style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                    {companyName}
                  </h2>

                  

                  <p style={{ whiteSpace: 'pre-wrap', marginBottom: 24 }}>
                    {message}
                  </p>

                  {/* 追加：物件名表示 */}
                  {propertyName && (
                    <p style={{ fontWeight: 500, marginBottom: 16 }}>
                      物件名：{propertyName}
                    </p>
                  )}

                  <p style={{ fontWeight: 500, marginBottom: 16 }}>
                    部屋番号：{unitLabel}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: 40,
                    }}
                  >
                    <QRCode value={inviteUrl} size={200} />
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      marginTop: 12,
                      textAlign: 'center',
                      wordBreak: 'break-all',
                    }}
                  >
                    {inviteUrl}
                  </p>
                </div>

                <div style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>
                  {footer}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
