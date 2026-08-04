import { useState } from 'react'
import Layout from '../components/Layout'
import SeoHead from '../components/SeoHead'
import useDublinClock from '../hooks/useDublinClock'
import {
  CONTACT_EMAIL,
  CONTACT_ENQUIRIES,
  PAGE_SEO,
  SITE_CITY,
  mailSubject,
  pageKicker,
} from '../data/site'

export default function Contact() {
  const time = useDublinClock()
  const [enquiry, setEnquiry] = useState(CONTACT_ENQUIRIES[0].id)
  const [noteOpen, setNoteOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [sent, setSent] = useState(false)

  const active =
    CONTACT_ENQUIRIES.find((e) => e.id === enquiry) || CONTACT_ENQUIRIES[0]

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(
      mailSubject(`${enquiry} — ${form.name}`)
    )
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nEnquiry: ${enquiry}\n\n${form.message}`
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <Layout variant="dark">
      <SeoHead {...PAGE_SEO.contact} />
      <div className="contact-wire page-shell">
        <p className="contact-wire__kicker">{pageKicker('/contact')}</p>

        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject(enquiry))}`}
          className="contact-wire__email"
        >
          {CONTACT_EMAIL}
        </a>

        <p className="contact-wire__time" aria-live="polite">
          {SITE_CITY} {time}
        </p>

        <div
          className="contact-wire__chips"
          role="group"
          aria-label="Enquiry type"
        >
          {CONTACT_ENQUIRIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`contact-wire__chip${enquiry === item.id ? ' is-on' : ''}`}
              aria-pressed={enquiry === item.id}
              onClick={() => setEnquiry(item.id)}
            >
              {item.id}
            </button>
          ))}
        </div>

        <p key={active.id} className="contact-wire__prompt">
          {active.prompt}
        </p>

        <div className="contact-wire__note">
          <button
            type="button"
            className="contact-wire__note-toggle"
            aria-expanded={noteOpen}
            onClick={() => setNoteOpen((v) => !v)}
          >
            <span>{noteOpen ? 'Hide note' : 'Leave a note'}</span>
            <span aria-hidden="true">{noteOpen ? '−' : '+'}</span>
          </button>

          {noteOpen ? (
            <form onSubmit={handleSubmit} className="contact-wire__form">
              <label className="contact-wire__field">
                <span>Name</span>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="contact-wire__input"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
              <label className="contact-wire__field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="contact-wire__input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label className="contact-wire__field">
                <span>Message</span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="contact-wire__input contact-wire__textarea"
                  placeholder="A short note…"
                />
              </label>
              <button type="submit" className="contact-wire__submit">
                {sent ? 'Opening email…' : 'Send enquiry'}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}
