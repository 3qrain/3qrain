export interface NoteMedia {
  id: number
  url: string
  thumbnailUrl: string | null
  previewUrl: string | null
  placeholder: string | null
  type: string
  mimeType: string
  filename: string
  ext: string
  width: number | null
  height: number | null
  sort: number
}

export interface NoteTag {
  id: number
  name: string
  slug: string
}

export interface Note {
  id: number
  content: string
  isPublished: boolean
  tags: NoteTag[]
  media: NoteMedia[]
  createdAt: number
  updatedAt: number
}
