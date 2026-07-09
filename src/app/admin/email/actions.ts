'use server'

import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'
import { render } from '@react-email/render'
import MarkdownEmail from './MarkdownEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAILS = [
  'devastatingdebater@gmail.com',
  'tamerlanium@gmail.com',
  'support@aficionado.fans',
  'contact@aficionado.fans'
]

// ── Live Preview Server Action ─────────────────────────────────────────────
export async function previewEmailAction(subject: string, body: string): Promise<string> {
  try {
    const html = await render(MarkdownEmail({ subject, markdownContent: body }))
    return html
  } catch (error) {
    console.error('Error rendering email preview:', error)
    return '<p>Error rendering preview</p>'
  }
}

export type EmailActionState = {
  success: boolean
  message: string
  timestamp?: number
}

export async function sendEmailAction(
  prevState: EmailActionState,
  formData: FormData
): Promise<EmailActionState> {
  // 1. Re-verify admin scope server-side — defense in depth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return { success: false, message: 'Unauthorized. Admin access only.' }
  }

  // 2. Extract and validate form data
  const to = formData.get('to') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string
  const sendAsHtml = formData.get('html') === 'on'

  if (!to || !subject || !body) {
    return { success: false, message: 'Please fill in all fields (To, Subject, Body).' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(to)) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  try {
    // 3. Send email via Resend with conditional HTML/Markdown or plaintext
    let emailPayload: Parameters<typeof resend.emails.send>[0]

    if (sendAsHtml) {
      // If HTML is checked, treat the body as Markdown and render it via our React Email component
      emailPayload = {
        from: 'Aficionado <support@aficionado.fans>',
        to: [to],
        subject,
        react: MarkdownEmail({ subject, markdownContent: body }),
      }
    } else {
      emailPayload = {
        from: 'Aficionado <support@aficionado.fans>',
        to: [to],
        subject,
        text: body,
      }
    }

    const { data, error } = await resend.emails.send(emailPayload)

    if (error) {
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: `Email delivered to ${to} (ID: ${data?.id})`,
      timestamp: Date.now(),
    }
  } catch (error: any) {
    console.error('[Admin Email] Send failed:', error)
    return { success: false, message: error.message || 'Failed to send email.' }
  }
}
