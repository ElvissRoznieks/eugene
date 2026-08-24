import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import Reveal from '../components/Reveal'
import SeoHead, { contactPageJsonLd } from '../components/SeoHead'
import { CONTACT_EMAIL, PAGE_SEO, SITE_NAME, mailSubject } from '../data/site'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const jsonLd = useMemo(() => contactPageJsonLd(), [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(mailSubject(form.name || 'Enquiry'))
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <Layout variant="dark">
      <SeoHead {...PAGE_SEO.contact} jsonLd={jsonLd} />
      <h1 className="seo-sr">Contact {SITE_NAME}</h1>
      <div className="contact-signal page-shell">
        <Reveal
          as="a"
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject('Enquiry'))}`}
          className="contact-signal__email"
          immediate
          delay={80}
        >
          {CONTACT_EMAIL}
        </Reveal>

        <Reveal
          as="p"
          className="contact-signal__lede"
          immediate
          delay={140}
        >
          For directing, photography and development enquiries, please get in
          touch.
        </Reveal>

        <Reveal
          as="form"
          onSubmit={handleSubmit}
          className="contact-signal__form"
          immediate
          delay={200}
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
