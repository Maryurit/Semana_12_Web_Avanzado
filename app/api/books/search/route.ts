import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        
        // Obtener query parameters
        const search = searchParams.get('search') || ''
        const genre = searchParams.get('genre') || ''
        const authorName = searchParams.get('authorName') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const order = searchParams.get('order') || 'desc'

        // Validar parámetros
        if (page < 1) {
            return NextResponse.json(
                { error: 'El número de página debe ser mayor a 0' },
                { status: 400 }
            )
        }

        if (limit < 1) {
            return NextResponse.json(
                { error: 'El límite debe ser mayor a 0' },
                { status: 400 }
            )
        }

        // Validar sortBy
        const validSortFields = ['title', 'publishedYear', 'createdAt']
        if (!validSortFields.includes(sortBy)) {
            return NextResponse.json(
                { error: 'Campo de ordenamiento inválido' },
                { status: 400 }
            )
        }

        // Validar order
        if (order !== 'asc' && order !== 'desc') {
            return NextResponse.json(
                { error: 'El orden debe ser asc o desc' },
                { status: 400 }
            )
        }

        // Construir filtros
        const where: any = {}

        if (search) {
            where.title = {
                contains: search,
                mode: 'insensitive'
            }
        }

        if (genre) {
            where.genre = genre
        }

        if (authorName) {
            where.author = {
                name: {
                    contains: authorName,
                    mode: 'insensitive'
                }
            }
        }

        // Calcular skip para paginación
        const skip = (page - 1) * limit

        // Obtener total de registros
        const total = await prisma.book.count({ where })

        // Obtener libros con paginación
        const books = await prisma.book.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        nationality: true
                    }
                }
            },
            orderBy: {
                [sortBy]: order
            },
            skip,
            take: limit
        })

        // Calcular información de paginación
        const totalPages = Math.ceil(total / limit)
        const hasNext = page < totalPages
        const hasPrev = page > 1

        return NextResponse.json({
            data: books,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev
            }
        })

    } catch (error) {
        console.error('Error en búsqueda de libros:', error)
        return NextResponse.json(
            { error: 'Error al buscar libros' },
            { status: 500 }
        )
    }
}
