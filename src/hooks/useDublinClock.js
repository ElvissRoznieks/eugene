import { useEffect, useState } from 'react'
import { SITE_TZ } from '../data/site'

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: SITE_TZ,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export default function useDublinClock() {
  const [time, setTime] = useState(() => formatter.format(new Date()))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatter.format(new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
