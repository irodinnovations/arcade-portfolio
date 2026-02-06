'use client'

import { useState } from 'react'
import { CONTACT_EMAIL } from '@/lib/professional'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import clsx from 'clsx'

// Formspree form ID - get yours at https://formspree.io
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID || 'YOUR_FORM_ID'

export function Contact() {
  const { ref, isVisible } = useScrollAnimation()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (status === 'error') setStatus('idle')
  }

  return (
    <section
      ref={ref}
      id="contact"
      className={clsx(
        'border-t border-border px-6 py-24 transition-all delay-200 duration-700',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h2
            id="contact-heading"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Let&apos;s build something.
          </h2>
          <p className="text-lg text-text-muted">
            Currently open to operations, analytics, and product roles.
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 text-center">
            <p className="text-lg font-medium text-green-400">Message sent!</p>
            <p className="mt-2 text-text-muted">I&apos;ll get back to you soon.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-sm text-accent hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                placeholder="How can I help?"
              />
            </div>

            {status === 'error' && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
                <p className="text-sm text-red-400">{errorMessage}</p>
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-8 py-3.5 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-cyan-600 focus-visible:outline-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              
              <p className="text-sm text-text-muted">
                or email directly at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
