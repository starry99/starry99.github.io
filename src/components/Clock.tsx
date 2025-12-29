import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'

export default function Clock() {
  const [time, setTime] = useState('')

  let offsetNameShort = DateTime.now().offsetNameShort
  if (offsetNameShort === 'GMT+9') {
    offsetNameShort = 'KST'
  }
    
  useEffect(() => {
    const updateTime = () => {
      const date = DateTime.now().toFormat('a h:mm')
      setTime(date)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <time className="clock flex gap-2 justify-center items-center w-full px-2">
      <span>{offsetNameShort}</span>
      <span>{time}</span>
    </time>
  )
}

