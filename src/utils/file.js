export const downloadTextFile = (text, filename = 'translation.txt') => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const readTextFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result?.toString() ?? '')
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsText(file)
  })
