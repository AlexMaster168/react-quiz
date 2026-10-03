import React, { useRef, useState } from 'react'
import classes from './ImagePicker.module.css'
import { fileToDataUrl } from '../../../lib/image.js'

function ImagePicker({ value, onChange }) {
  const fileRef = useRef(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async event => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      onChange(await fileToDataUrl(file))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const applyUrl = () => {
    const trimmed = url.trim()
    if (!/^https?:\/\/\S+$/i.test(trimmed)) {
      setError('Вкажіть посилання, що починається з http(s)://')
      return
    }
    setError(null)
    setUrl('')
    onChange(trimmed)
  }

  if (value) {
    return (
      <div className={classes.Preview}>
        <img src={value} alt="Зображення питання" onError={() => setError('Не вдалося завантажити зображення')} />
        <button type="button" onClick={() => { onChange(''); setError(null) }}>
          <i className="fa fa-trash" /> Прибрати картинку
        </button>
        {error ? <span className={classes.Error}>{error}</span> : null}
      </div>
    )
  }

  return (
    <div className={classes.ImagePicker}>
      <button type="button" onClick={() => fileRef.current.click()} disabled={busy}>
        <i className="fa fa-upload" /> {busy ? 'Обробка…' : 'Завантажити картинку'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <span className={classes.Or}>або</span>
      <input
        type="url"
        placeholder="https://…/image.jpg"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyUrl() } }}
      />
      <button type="button" onClick={applyUrl} disabled={!url.trim()}>OK</button>
      {error ? <span className={classes.Error}>{error}</span> : null}
    </div>
  )
}

export default ImagePicker
