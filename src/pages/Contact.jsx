import { useState } from 'react'
import Layout from '../components/Layout'
import Reveal from '../components/Reveal'
import SeoHead from '../components/SeoHead'
import useDublinClock from '../hooks/useDublinClock'
import {
  CONTACT_EMAIL,
  CONTACT_ENQUIRIES,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  PAGE_SEO,
  SITE_CITY,
  mailSubject,
  pageKicker,
} from '../data/site'

export default function Contact() {
  const time = useDublinClock()
  const [enquiry, setEnquiry] = useState(CONTACT_ENQUIRIES[0].id)
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
      <div className="contact-signal page-shell">
        <Reveal as="p" className="contact-signal__kicker" immediate>
          {pageKicker('/contact')}
        </Reveal>

        <Reveal
          as="a"
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject(enquiry))}`}
          className="contact-signal__email"
          immediate
          delay={80}
        >
          {CONTACT_EMAIL}
        </Reveal>

        <Reveal className="contact-signal__details" immediate delay={140}>
          <a href={CONTACT_PHONE_HREF} className="contact-signal__phone">
            {CONTACT_PHONE}
          </a>
          <p className="contact-signal__time" aria-live="polite">
            {SITE_CITY} · {time}
          </p>
        </Reveal>

        <Reveal
          as="nav"
          className="contact-signal__enquiries"
          aria-label="Enquiry type"
          immediate
          delay={200}
        >
          {CONTACT_ENQUIRIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`contact-signal__enquiry${enquiry === item.id ? ' is-on' : ''}`}
              aria-pressed={enquiry === item.id}
              onClick={() => setEnquiry(item.id)}
            >
              {item.id}
            </button>
          ))}
        </Reveal>

        <Reveal
          as="p"
          key={active.id}
          className="contact-signal__prompt"
          immediate
          delay={260}
        >
          {active.prompt}
        </Reveal>

        <Reveal
          as="form"
          onSubmit={handleSubmit}
          className="contact-signal__form"
          immediate
          delay={320}
        >
          <label className="contact-signal__field">
            <span>Name</span>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="contact-signal__input"
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label className="contact-signal__field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="contact-signal__input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="contact-signal__field">
            <span>Message</span>
            <textarea
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="contact-signal__input contact-signal__textarea"
              placeholder="A short note…"
            />
          </label>
          <button type="submit" className="contact-signal__submit">
            {sent ? 'Opening email…' : 'Send enquiry'}
          </button>
        </Reveal>
      </div>
    </Layout>
  )
}
