'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Author {
  id: string
  name: string
  email: string
  bio?: string
  nationality?: string
  birthYear?: number
  _count: {
    books: number
  }
}

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: ''
  })

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/authors')
      const data = await response.json()
      setAuthors(data)
    } catch (error) {
      console.error('Error al obtener autores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAuthor 
        ? `/api/authors/${editingAuthor.id}`
        : '/api/authors'
      
      const method = editingAuthor ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
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
        setFormData({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
        setShowForm(false)
        setEditingAuthor(null)
        fetchAuthors()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar autor')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar autor')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar al autor ${name}?`)) return

    try {
      const response = await fetch(`/api/authors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAuthors()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar autor')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar autor')
    }
  }

  const handleEdit = (author: Author) => {
    setEditingAuthor(author)
    setFormData({
      name: author.name,
      email: author.email,
      bio: author.bio || '',
      nationality: author.nationality || '',
      birthYear: author.birthYear ? author.birthYear.toString() : '',
    })
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingAuthor(null)
    setFormData({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
    setShowForm(false)
  }

  const totalBooks = authors.reduce((sum, author) => sum + author._count.books, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard - Sistema de Biblioteca</h1>
          <p className="text-gray-600">Gestiona autores y libros</p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Autores</h3>
            <p className="text-3xl font-bold text-blue-600">{authors.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Libros</h3>
            <p className="text-3xl font-bold text-green-600">{totalBooks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Promedio Libros/Autor</h3>
            <p className="text-3xl font-bold text-purple-600">
              {authors.length > 0 ? (totalBooks / authors.length).toFixed(1) : 0}
            </p>
          </div>
        </div>

        {/* Navegación */}
        <div className="mb-6 flex gap-4">
          <Link 
            href="/books"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver Libros
          </Link>
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (!showForm) {
                setEditingAuthor(null)
                setFormData({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Autor'}
          </button>
        </div>

        {/* Formulario de Autor */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingAuthor ? 'Editar Autor' : 'Crear Nuevo Autor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAuthor ? 'Actualizar' : 'Crear'} Autor
                </button>
                {editingAuthor && (
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

        {/* Lista de Autores */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Autores</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando autores...</div>
          ) : authors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay autores registrados. Crea uno nuevo.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {authors.map((author) => (
                <div key={author.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {author.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{author.email}</p>
                      {author.nationality && (
                        <p className="text-sm text-gray-500 mb-1">
                          📍 {author.nationality}
                        </p>
                      )}
                      {author.birthYear && (
                        <p className="text-sm text-gray-500 mb-1">
                          🎂 Nacido en {author.birthYear}
                        </p>
                      )}
                      {author.bio && (
                        <p className="text-gray-600 mt-2">{author.bio}</p>
                      )}
                      <p className="text-sm text-blue-600 mt-2 font-medium">
                        📚 {author._count.books} {author._count.books === 1 ? 'libro' : 'libros'}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/authors/${author.id}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Ver Detalle
                      </Link>
                      <button
                        onClick={() => handleEdit(author)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(author.id, author.name)}
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
      </div>
    </div>
  )
}
