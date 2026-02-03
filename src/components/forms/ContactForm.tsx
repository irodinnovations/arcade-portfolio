'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui';

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string;
}

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    message: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({ status: 'submitting', message: '' });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      website: formData.get('website') as string, // Honeypot
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setFormState({
        status: 'success',
        message: 'Message sent! I\'ll get back to you soon.',
      });
      e.currentTarget.reset();
    } catch (error) {
      setFormState({
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div>
        <label
          htmlFor="name"
          className="mb-1 block font-rajdhani text-sm font-medium text-[#5080b0]"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={100}
          className="w-full rounded border border-[#1a2545] bg-[#0d1428] px-4 py-2 font-rajdhani text-white placeholder-[#5080b0]/50 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          placeholder="Your name"
          disabled={formState.status === 'submitting'}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block font-rajdhani text-sm font-medium text-[#5080b0]"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          maxLength={254}
          className="w-full rounded border border-[#1a2545] bg-[#0d1428] px-4 py-2 font-rajdhani text-white placeholder-[#5080b0]/50 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          placeholder="your@email.com"
          disabled={formState.status === 'submitting'}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1 block font-rajdhani text-sm font-medium text-[#5080b0]"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          className="w-full resize-none rounded border border-[#1a2545] bg-[#0d1428] px-4 py-2 font-rajdhani text-white placeholder-[#5080b0]/50 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          placeholder="What's on your mind?"
          disabled={formState.status === 'submitting'}
        />
      </div>

      {formState.message && (
        <div
          className={`rounded border px-4 py-2 text-sm ${
            formState.status === 'success'
              ? 'border-green-500/50 bg-green-500/10 text-green-400'
              : 'border-red-500/50 bg-red-500/10 text-red-400'
          }`}
          role="alert"
        >
          {formState.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={formState.status === 'submitting'}
        className="w-full"
      >
        {formState.status === 'submitting' ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
