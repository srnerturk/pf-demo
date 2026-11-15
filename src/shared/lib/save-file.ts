export interface FileToSave {
  name: string
  content: string
  mediaType: string
}

/** Hands a file to the person: in the browser, a download. Injected so features stay testable. */
export type SaveFile = (file: FileToSave) => void

export const saveFileInBrowser: SaveFile = ({ name, content, mediaType }) => {
  const url = URL.createObjectURL(new Blob([content], { type: mediaType }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
