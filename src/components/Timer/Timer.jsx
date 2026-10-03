import React, { useEffect, useRef, useState } from 'react'
import classes from './Timer.module.css'
import { formatTime } from '../../lib/quizModel.js'

function Timer({ startedAt, limit, onExpire }) {
  const [now, setNow] = useState(Date.now())
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const remaining = limit - (now - startedAt) / 1000

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true
      onExpireRef.current()
    }
  }, [remaining])

  const ratio = Math.max(0, remaining / limit)
  const cls = [classes.Timer]
  if (remaining <= Math.min(30, limit * 0.2)) cls.push(classes.danger)

  return (
    <div className={cls.join(' ')} role="timer" aria-label="Залишок часу">
      <span><i className="fa fa-clock-o" /> {formatTime(Math.ceil(remaining))}</span>
      <div className={classes.Track}>
        <div className={classes.Bar} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}

export default Timer
