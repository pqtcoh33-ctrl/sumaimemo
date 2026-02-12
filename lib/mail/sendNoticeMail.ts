import { Resend } from 'resend'
import { buildNoticeMail } from './noticeMailTemplate'


const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendNoticeMail(emails: string[]) {

   if (!emails || emails.length === 0) return

  const mail = buildNoticeMail()

  // 1件ずつ送信（1件失敗しても止めない）
  for (const email of emails) {
    try {
      await resend.emails.send({
        from: 'info@sumaimemo.jp', // Resendで認証した独自ドメイン
        to: email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      })
    } catch (error) {
      console.error('[NoticeMail Error]', email, error)
    }
  }
}
