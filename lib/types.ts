export interface User {
  _id: string
  name: string
  email: string
}

export interface Tag {
  _id: string
  name: string
  userId: string
}

export interface Category {
  _id: string
  name: string
  userId: string
}

export interface Note {
  _id: string
  title: string
  content: string
  isPublic: boolean
  userId: string
  user?: User
  tags?: Tag[]
  category?: Category
  createdAt: string
  updatedAt: string
}
