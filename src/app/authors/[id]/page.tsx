'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'

interface Author {
  id: string
  name: string
  email: string
  bio?: string
  nationality?: string
  birthYear?: number
}

interface Book {
  id: string
  title: string
  description?: string
  isbn?: string
  publishedYear?: number
  genre?: string
  pages?: number
}

interface Stats {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: {
    title: string
    year: number
  } | null
  latestBook: {
    title: string
    year: number
  } | null
  averagePages: number
  genres: string[]
  longestBook: {
    title: string
    pages: number
  } | null
  shortestBook: {
    title: string
    pages: number
  } | null
}

export default function AuthorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showBookForm, setShowBookForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: ''
  })

  const [bookFormData, setBookFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: ''
  })

  useEffect(() => {
    fetchAuthorData()
  }, [])

  const fetchAuthorData = async () => {
    try {
      setLoading(true)
      
      // Obtener información del autor
      const authorResponse = await fetch(`/api/authors/${resolvedParams.id}`)
      if (!authorResponse.ok) {
        throw new Error('Autor no encontrado')
      }
      const authorData = await authorResponse.json()
      setAuthor(authorData)
      setFormData({
        name: authorData.name,
        email: authorData.email,
        bio: authorData.bio || '',
        nationality: authorData.nationality || '',
        birthYear: authorData.birthYear ? authorData.birthYear.toString() : '',
      })

      // Obtener libros del autor
      const booksResponse = await fetch(`/api/authors/${resolvedParams.id}/books`)
      const booksData = await booksResponse.json()
      setBooks(booksData)

      // Obtener estadísticas del autor
      const statsResponse = await fetch(`/api/authors/${resolvedParams.id}/stats`)
      const statsData = await statsResponse.json()
      setStats(statsData)

    } catch (error) {
      console.error('Error al obtener datos del autor:', error)
      alert('Error al cargar información del autor')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/authors/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bio: formData.bio || undefined,
          nationality: formData.nationality || undefined,
          birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
        }),
      })

      if (response.ok) {
        setEditMode(false)
        fetchAuthorData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar autor')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar autor')
    }
  }

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookFormData.title,
          description: bookFormData.description || undefined,
          isbn: bookFormData.isbn || undefined,
          publishedYear: bookFormData.publishedYear ? parseInt(bookFormData.publishedYear) : undefined,
          genre: bookFormData.genre || undefined,
          pages: bookFormData.pages ? parseInt(bookFormData.pages) : undefined,
          authorId: resolvedParams.id,
        }),
      })

      if (response.ok) {
        setBookFormData({
          title: '',
          description: '',
          isbn: '',
          publishedYear: '',
          genre: '',
          pages: ''
        })
        setShowBookForm(false)
        fetchAuthorData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear libro')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear libro')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando información del autor...</div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Autor no encontrado</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{author.name}</h1>
            <p className="text-gray-600">{author.email}</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            {editMode ? 'Cancelar Edición' : 'Editar Autor'}
          </button>
        </div>

        {/* Formulario de Edición */}
        {editMode && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Editar Información del Autor</h2>
            <form onSubmit={handleUpdateAuthor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nacionalidad
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año de Nacimiento
                  </label>
                  <input
                    type="number"
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        )}

        {/* Información del Autor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Información del Autor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="text-lg font-medium">{author.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium">{author.email}</p>
            </div>
            {author.nationality && (
              <div>
                <p className="text-sm text-gray-500">Nacionalidad</p>
                <p className="text-lg font-medium">{author.nationality}</p>
              </div>
            )}
            {author.birthYear && (
              <div>
                <p className="text-sm text-gray-500">Año de Nacimiento</p>
                <p className="text-lg font-medium">{author.birthYear}</p>
              </div>
            )}
            {author.bio && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Biografía</p>
                <p className="text-lg">{author.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas del Autor */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Estadísticas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total de Libros</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Promedio de Páginas</p>
                <p className="text-3xl font-bold text-green-600">{stats.averagePages}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Géneros Escritos</p>
                <p className="text-3xl font-bold text-purple-600">{stats.genres.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.firstBook && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Primer Libro</h3>
                  <p className="text-lg">{stats.firstBook.title}</p>
                  <p className="text-gray-500">Año: {stats.firstBook.year}</p>
                </div>
              )}
              {stats.latestBook && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Último Libro</h3>
                  <p className="text-lg">{stats.latestBook.title}</p>
                  <p className="text-gray-500">Año: {stats.latestBook.year}</p>
                </div>
              )}
              {stats.longestBook && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Libro Más Largo</h3>
                  <p className="text-lg">{stats.longestBook.title}</p>
                  <p className="text-gray-500">{stats.longestBook.pages} páginas</p>
                </div>
              )}
              {stats.shortestBook && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Libro Más Corto</h3>
                  <p className="text-lg">{stats.shortestBook.title}</p>
                  <p className="text-gray-500">{stats.shortestBook.pages} páginas</p>
                </div>
              )}
            </div>

            {stats.genres.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Géneros</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Libros del Autor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Libros ({books.length})</h2>
            <button
              onClick={() => setShowBookForm(!showBookForm)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showBookForm ? 'Cancelar' : '+ Agregar Libro'}
            </button>
          </div>

          {/* Formulario para Agregar Libro */}
          {showBookForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Nuevo Libro</h3>
              <form onSubmit={handleCreateBook} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookFormData.title}
                      onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Género
                    </label>
                    <input
                      type="text"
                      value={bookFormData.genre}
                      onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={bookFormData.isbn}
                      onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año de Publicación
                    </label>
                    <input
                      type="number"
                      value={bookFormData.publishedYear}
                      onChange={(e) => setBookFormData({ ...bookFormData, publishedYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Páginas
                    </label>
                    <input
                      type="number"
                      value={bookFormData.pages}
                      onChange={(e) => setBookFormData({ ...bookFormData, pages: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={bookFormData.description}
                    onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Libro
                </button>
              </form>
            </div>
          )}

          {/* Lista de Libros */}
          {books.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Este autor aún no tiene libros registrados.
            </p>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
                  {book.description && (
                    <p className="text-gray-600 mb-2">{book.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {book.genre && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                        {book.genre}
                      </span>
                    )}
                    {book.publishedYear && (
                      <span>📅 {book.publishedYear}</span>
                    )}
                    {book.pages && (
                      <span>📄 {book.pages} páginas</span>
                    )}
                    {book.isbn && (
                      <span>ISBN: {book.isbn}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
