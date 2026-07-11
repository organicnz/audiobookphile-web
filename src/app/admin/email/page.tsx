'use client'

import { useActionState, useRef, useEffect, useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { Card } from '@/shared/ui/core/card'
import { Input } from '@/shared/ui/core/input'
import { Label } from '@/shared/ui/core/label'
import { Button } from '@/shared/ui/core/button'
import { Textarea } from '@/shared/ui/core/textarea'
import { sendEmailAction, previewEmailAction, type EmailActionState } from './actions'
import {
  Loader2, Send, CheckCircle2, AlertCircle,
  Code, Eye, EyeOff, Sparkles, FileText
} from 'lucide-react'

// ── Email Templates ─────────────────────────────────────────────
const EMAIL_TEMPLATES = {
  blank: { label: 'Blank', subject: '', body: '' },
  welcome: {
    label: 'Welcome',
    subject: 'Welcome to Aficionado 🎉',
    body: `# Welcome aboard! 👋

We're thrilled to have you join the Aficionado community. Your journey to intentional digital wellness starts now.

[Get Started →](https://aficionado.fans)`,
  },
  announcement: {
    label: 'Announcement',
    subject: 'Important Update from Aficionado',
    body: `# 📢 New Feature Alert

We've been working hard on something special, and it's finally here.

[Describe the update here]

[Learn More →](https://aficionado.fans)`,
  },
  plaintext: {
    label: 'Plain Text',
    subject: '',
    body: `Hello,

We wanted to reach out regarding your Aficionado account.

[Your message here]

Best regards,
The Aficionado Team
support@aficionado.fans`,
  },
} as const

type TemplateName = keyof typeof EMAIL_TEMPLATES

// ── Submit Button (useFormStatus) ───────────────────────────────
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="px-8 gap-2 bg-gradient-to-r from-ocean-muted to-primary hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-[0.97]"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
      {pending ? 'Sending...' : 'Send Email'}
    </Button>
  )
}

// ── Main Page ───────────────────────────────────────────────────
const initialState: EmailActionState = { success: false, message: '' }

export default function EmailSenderPage() {
  const [state, formAction, isPending] = useActionState(sendEmailAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>('blank')
  const [showPreview, setShowPreview] = useState(false)
  const [subjectContent, setSubjectContent] = useState('')
  const [bodyContent, setBodyContent] = useState('')
  const [isMarkdown, setIsMarkdown] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isPendingPreview, startTransition] = useTransition()

  // Auto-reset form on success
  useEffect(() => {
    if (state.success && state.timestamp && formRef.current) {
      formRef.current.reset()
      setBodyContent('')
      setShowPreview(false)
      setActiveTemplate('blank')
    }
  }, [state.timestamp])

  // Apply template
  function applyTemplate(name: TemplateName) {
    setActiveTemplate(name)
    const template = EMAIL_TEMPLATES[name]
    setBodyContent(template.body)
    setIsMarkdown(name !== 'blank' && name !== 'plaintext')

    if (formRef.current) {
      if (template.subject !== undefined) {
        setSubjectContent(template.subject)
      }
    }
  }

  // Generate preview HTML using Server Action
  useEffect(() => {
    if (!showPreview) return
    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        const html = await previewEmailAction(subjectContent || 'No Subject', bodyContent)
        setPreviewHtml(html)
      })
    }, 400)
    return () => clearTimeout(timeoutId)
  }, [subjectContent, bodyContent, showPreview])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Email Operations
          </h1>
          <p className="text-foreground/50 mt-2 text-sm">
            Send transactional emails or announcements via Resend.
          </p>
        </div>
      </div>

      {/* Template Picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-foreground/40 uppercase tracking-wider font-medium mr-1">
          Template:
        </span>
        {(Object.entries(EMAIL_TEMPLATES) as [TemplateName, typeof EMAIL_TEMPLATES[TemplateName]][]).map(
          ([key, tmpl]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyTemplate(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                activeTemplate === key
                  ? 'bg-muted-gold/20 text-muted-gold border border-muted-gold/30'
                  : 'bg-white/5 text-foreground/60 border border-white/[0.06] hover:bg-white/10 hover:text-foreground/80'
              }`}
            >
              {key === 'blank' && <FileText className="w-3 h-3" />}
              {key === 'welcome' && <Sparkles className="w-3 h-3" />}
              {key === 'announcement' && '📢'}
              {key === 'plaintext' && '✉️'}
              {tmpl.label}
            </button>
          )
        )}
      </div>

      {/* Form */}
      <Card className="p-6 liquid-glass relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted-gold/30 to-transparent opacity-50" />

        <form ref={formRef} action={formAction} className="space-y-6">
          {/* Hidden HTML/Markdown flag */}
          {isMarkdown && <input type="hidden" name="html" value="on" />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="to" className="text-foreground/80 text-xs uppercase tracking-wider font-medium">
                Recipient
              </Label>
              <Input
                id="to"
                name="to"
                type="email"
                required
                disabled={isPending}
                placeholder="user@example.com"
                className="glass-panel border-white/[0.08] focus:border-muted-gold/60 focus:ring-1 focus:ring-muted-gold/40 transition-all text-foreground placeholder:text-foreground/30 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-foreground/80 text-xs uppercase tracking-wider font-medium">
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                disabled={isPending}
                value={subjectContent}
                onChange={(e) => setSubjectContent(e.target.value)}
                placeholder="Important update regarding your account"
                className="glass-panel border-white/[0.08] focus:border-muted-gold/60 focus:ring-1 focus:ring-muted-gold/40 transition-all text-foreground placeholder:text-foreground/30 h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body" className="text-foreground/80 text-xs uppercase tracking-wider font-medium">
                Message Body
              </Label>
              <div className="flex items-center gap-3">
                {/* Markdown toggle */}
                <button
                  type="button"
                  onClick={() => setIsMarkdown(!isMarkdown)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                    isMarkdown
                      ? 'bg-muted-gold/15 text-muted-gold'
                      : 'bg-white/5 text-foreground/40 hover:text-foreground/60'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  Markdown
                </button>

                {/* Preview toggle */}
                {isMarkdown && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                      showPreview
                        ? 'bg-muted-gold/15 text-muted-gold'
                        : 'bg-white/5 text-foreground/40 hover:text-foreground/60'
                    }`}
                  >
                    {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    Preview
                  </button>
                )}
              </div>
            </div>

            {/* Editor / Preview split */}
            <div className={`grid gap-4 ${showPreview && isMarkdown ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              <Textarea
                id="body"
                name="body"
                required
                disabled={isPending}
                rows={14}
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                placeholder={"Hello,\n\nWe wanted to let you know..."}
                className="glass-panel border-white/[0.08] focus:border-muted-gold/60 focus:ring-1 focus:ring-muted-gold/40 transition-all resize-y font-mono text-xs leading-relaxed text-foreground placeholder:text-foreground/30"
              />

              {showPreview && isMarkdown && (
                <div className="rounded-xl border border-white/[0.08] bg-black/40 overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/5">
                  <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between backdrop-blur-md">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                    </div>
                    <span className="text-[10px] text-foreground/40 font-mono tracking-wider flex items-center gap-2">
                      server_render_preview
                      {isPendingPreview && <Loader2 className="w-3 h-3 animate-spin text-muted-gold" />}
                    </span>
                  </div>
                  <iframe
                    srcDoc={previewHtml}
                    title="Email Preview"
                    className="w-full h-[350px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Status feedback */}
          {state.message && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl text-sm animate-fade-in-up ${
                state.success
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {state.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span>{state.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <SubmitButton />
            <span className="text-xs text-foreground/30">
              via support@aficionado.fans
            </span>
          </div>
        </form>
      </Card>
    </div>
  )
}
