import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, LoaderCircle, Mail } from 'lucide-react'
import { profile } from './data'

const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined
const hasEndpoint = Boolean(endpoint && /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint))

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'draft' | 'error'>('idle')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (data.get('website')) return
    if (!hasEndpoint) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${data.get('name')}`)
      const body = encodeURIComponent(`${data.get('message')}\n\nFrom: ${data.get('name')}\nEmail: ${data.get('email')}`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      setState('draft')
      return
    }
    setState('sending')
    try {
      const response = await fetch(endpoint!, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error('Submission failed')
      setState('sent')
      form.reset()
    } catch { setState('error') }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="Alex Morgan" /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="alex@company.com" /></label>
      </div>
      <label>What do you have in mind?<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="A role, a collaboration, or something worth building..." /></label>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="form-bottom"><p>For roles, collaborations & good conversations.</p><button className="button button-primary" type="submit" disabled={state === 'sending'}>{state === 'sending' ? <LoaderCircle className="spin" size={17} /> : state === 'sent' ? <Check size={17} /> : hasEndpoint ? <ArrowUpRight size={17} /> : <Mail size={17} />}{state === 'sending' ? 'Sending...' : state === 'sent' ? 'Message sent' : hasEndpoint ? 'Send message' : 'Open email draft'}</button></div>
      <p className={`form-status ${state === 'error' ? 'error' : ''}`} role="status" aria-live="polite">{state === 'sent' && 'Thanks for reaching out. Your message has been received.'}{state === 'draft' && `Email draft requested. You can also write directly to ${profile.email}.`}{state === 'error' && `Could not send your message. Please try again or email ${profile.email}.`}</p>
    </form>
  )
}