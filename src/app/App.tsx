import type { SendContactMessage } from '@/features/contact/application/send-contact-message'
import { ContactForm } from '@/features/contact/ui/ContactForm'

interface AppProps {
  sendContactMessage: SendContactMessage
}

export function App({ sendContactMessage }: AppProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-900/5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Get in touch</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Vite · React · TypeScript · Tailwind CSS · React Hook Form
        </p>
        <ContactForm sendContactMessage={sendContactMessage} />
      </section>
    </main>
  )
}
