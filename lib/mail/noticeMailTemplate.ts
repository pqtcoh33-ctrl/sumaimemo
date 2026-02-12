// lib/mail/noticeMailTemplate.ts

type NoticeMail = {
  subject: string
  text: string
  html: string
}

export function buildNoticeMail(): NoticeMail {
  const subject = '【住まいメモ】新しいお知らせのご案内'

  const dashboardUrl = 'https://www.sumaimemo.jp/tenant/dashboard/notices'

  const text = `
住まいメモをご利用いただきありがとうございます。

ご契約中の物件に関する新しいお知らせが公開されました。

以下のURLよりログインのうえ、ご確認ください。
${dashboardUrl}

------------------------------------
住まいメモ
https://www.sumaimemo.jp
本メールは、住まいメモにご登録いただいている方へお送りしています。
お問い合わせはログイン後のフォームよりお願いいたします。
`

  const html = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <p>住まいメモをご利用いただきありがとうございます。</p>

    <p>
      ご契約中の物件に関する
      <strong>新しいお知らせが公開されました。</strong>
    </p>

    <p>
      下記ボタンよりログインのうえ、ご確認ください。
    </p>

    <p style="margin: 20px 0;">
      <a href="${dashboardUrl}"
         style="background-color:#2563eb;
                color:#ffffff;
                padding:10px 16px;
                text-decoration:none;
                border-radius:6px;
                display:inline-block;">
        お知らせを確認する
      </a>
    </p>

    <hr style="margin:30px 0;" />

    <p style="font-size:13px;color:#555;">
      住まいメモ<br />
      <a href="https://www.sumaimemo.jp" style="color:#2563eb;">
        https://www.sumaimemo.jp
      </a>
    </p>

    <p style="font-size:12px;color:#888;">
      本メールは、住まいメモにご登録いただいている入居者様へ
      システムより自動送信しています。<br />
      本メールへ直接返信いただいてもお答えできませんのでご了承ください。
    </p>
  </body>
</html>
`

  return {
    subject,
    text,
    html,
  }
}
