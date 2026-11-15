import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { makeSendContactMessage } from '@/features/contact/application/send-contact-message'
import { InMemoryContactMessageSender } from '@/features/contact/infrastructure/in-memory-contact-message-sender'
import './index.css'

// Composition root: the only place that knows which adapters back the ports.
const sendContactMessage = makeSendContactMessage(new InMemoryContactMessageSender({ latencyMs: 600 }))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App sendContactMessage={sendContactMessage} />
  </StrictMode>,
)
