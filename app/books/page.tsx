'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Author {
  id: string
  name: string
  email: string
  nationality?: string
}

interface Book {
  id: string
  title: string
  description?: string
  isbn?: string
  publishedYear?: number
  genre?: string
  pages?: number
  author: Author
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  
  // Filtros y búsqueda
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  // Formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
    authorId: ''
  })

  useEffect(() => {
    fetchAuthors()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [search, selectedGenre, selectedAuthor, sortBy, order, page])

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors')
      const data = await response.json()
      setAuthors(data)
    } catch (error) {
      console.error('Error al obtener autores:', error)
    }
  }

  const fetchBooks = async () => {
    try {
      setSearching(true)
      const params = new URLSearchParams()
      
      if (search) params.append('search', search)
      if (selectedGenre) params.append('genre', selectedGenre)
      if (selectedAuthor) params.append('authorName', selectedAuthor)
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      params.append('sortBy', sortBy)
      params.append('order', order)

      const response = await fetch(`/api/books/search?${params.toString()}`)
      const data = await response.json()
      
      setBooks(data.data)
      setPagination(data.pagination)
      
      // Extraer géneros únicos
      const uniqueGenres = [...new Set(data.data
        .map((book: Book) => book.genre)
        .filter((genre: string | undefined) => genre)
      )] as string[]
      
      setGenres(prevGenres => {
        const combined = [...new Set([...prevGenres, ...uniqueGenres])]
        return combined.sort()
      })
      
    } catch (error) {
      console.error('Error al buscar libros:', error)
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingBook 
        ? `/api/books/${editingBook.id}/routes`
        : '/api/books'
      
      const method = editingBook ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          isbn: formData.isbn || undefined,
          publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
          genre: formData.genre || undefined,
          pages: formData.pages ? parseInt(formData.pages) : undefined,
          authorId: formData.authorId,
        }),
      })

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          isbn: '',
          publishedYear: '',
          genre: '',
          pages: '',
          authorId: ''
        })
        setShowForm(false)
        setEditingBook(null)
        fetchBooks()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar libro')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar libro')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar el libro "${title}"?`)) return

    try {
      const response = await fetch(`/api/books/${id}/routes`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBooks()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar libro')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar libro')
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      description: book.description || '',
      isbn: book.isbn || '',
      publishedYear: book.publishedYear ? book.publishedYear.toString() : '',
      genre: book.genre || '',
      pages: book.pages ? book.pages.toString() : '',
      authorId: book.author.id,
    })
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingBook(null)
    setFormData({
      title: '',
      description: '',
      isbn: '',
      publishedYear: '',
      genre: '',
      pages: '',
      authorId: ''
    })
    setShowForm(false)
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedGenre('')
    setSelectedAuthor('')
    setSortBy('createdAt')
    setOrder('desc')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Búsqueda de Libros</h1>
            <p className="text-gray-600">Explora y gestiona la colección de libros</p>
          </div>
          <Link
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Dashboard
          </Link>
        </div>

        {/* Botón Nuevo Libro */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (!showForm) {
                setEditingBook(null)
                setFormData({
                  title: '',
                  description: '',
                  isbn: '',
                  publishedYear: '',
                  genre: '',
                  pages: '',
                  authorId: ''
                })
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Libro'}
          </button>
        </div>

        {/* Formulario de Libro */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingBook ? 'Editar Libro' : 'Crear Nuevo Libro'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autor *
                  </label>
                  <select
                    required
                    value={formData.authorId}
                    onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un autor</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año de Publicación
                  </label>
                  <input
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Páginas
                  </label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBook ? 'Actualizar' : 'Crear'} Libro
                </button>
                {editingBook && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por título
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Buscar libros..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por género
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los géneros</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por autor
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => {
                  setSelectedAuthor(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los autores</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.name}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Fecha creación</option>
                  <option value="title">Título</option>
                  <option value="publishedYear">Año publicación</option>
                </select>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="asc">↑ Asc</option>
                  <option value="desc">↓ Desc</option>
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Resultados */}
        {pagination && (
          <div className="mb-4 text-gray-600">
            Mostrando {books.length} de {pagination.total} resultados
          </div>
        )}

        {/* Lista de Libros */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          {loading || searching ? (
            <div className="p-8 text-center text-gray-500">
              {loading ? 'Cargando libros...' : 'Buscando...'}
            </div>
          ) : books.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron libros. Intenta con otros filtros.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {books.map((book) => (
                <div key={book.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-blue-600 mb-2">
                        Por: <Link href={`/authors/${book.author.id}`} className="hover:underline">{book.author.name}</Link>
                      </p>
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
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(book)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className={`px-4 py-2 rounded-lg ${
                pagination.hasPrev
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ← Anterior
            </button>
            <span className="text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className={`px-4 py-2 rounded-lg ${
                pagination.hasNext
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
