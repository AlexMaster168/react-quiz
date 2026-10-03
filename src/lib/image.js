// Images are stored inline in the Realtime Database, so keep them small
export function fileToDataUrl(file, maxSize = 1000, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Оберіть файл зображення'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не вдалося прочитати файл'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Не вдалося відкрити зображення'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
