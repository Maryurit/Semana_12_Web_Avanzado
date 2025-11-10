# Sistema de Biblioteca - Next.js API Routes

## 📚 Descripción

Sistema completo de gestión de biblioteca implementado con Next.js 16, Prisma ORM y PostgreSQL. Incluye funcionalidades avanzadas de búsqueda, filtrado, paginación y estadísticas.

## ✨ Funcionalidades Implementadas

### 1. Endpoints de API

#### Búsqueda de Libros con Paginación (`/api/books/search`)
- **Método**: GET
- **Query Parameters**:
  - `search`: Búsqueda por título (case-insensitive)
  - `genre`: Filtro por género exacto
  - `authorName`: Búsqueda por nombre de autor
  - `page`: Número de página (default: 1)
  - `limit`: Resultados por página (default: 10, máx: 50)
  - `sortBy`: Campo de ordenamiento (title, publishedYear, createdAt)
  - `order`: Orden (asc, desc)

**Ejemplo de uso**:
```
GET http://localhost:3000/api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc
```

**Respuesta**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Estadísticas de Autor (`/api/authors/[id]/stats`)
- **Método**: GET
- **Respuesta**: Estadísticas completas del autor incluyendo:
  - Total de libros publicados
  - Primer y último libro
  - Promedio de páginas
  - Géneros únicos
  - Libro más largo y más corto

**Ejemplo de respuesta**:
```json
{
  "authorId": "...",
  "authorName": "Gabriel García Márquez",
  "totalBooks": 15,
  "firstBook": {
    "title": "La hojarasca",
    "year": 1955
  },
  "latestBook": {
    "title": "Memoria de mis putas tristes",
    "year": 2004
  },
  "averagePages": 285,
  "genres": ["Novela", "Cuento", "Periodismo"],
  "longestBook": {
    "title": "Cien años de soledad",
    "pages": 417
  },
  "shortestBook": {
    "title": "Relato de un náufrago",
    "pages": 110
  }
}
```

#### Otros Endpoints
- `GET /api/authors` - Listar todos los autores
- `POST /api/authors` - Crear un autor
- `GET /api/authors/[id]` - Obtener un autor específico
- `PUT /api/authors/[id]` - Actualizar un autor
- `DELETE /api/authors/[id]` - Eliminar un autor
- `GET /api/authors/[id]/books` - Obtener libros de un autor
- `GET /api/books` - Listar todos los libros
- `POST /api/books` - Crear un libro
- `GET /api/books/[id]` - Obtener un libro específico
- `PUT /api/books/[id]` - Actualizar un libro
- `DELETE /api/books/[id]` - Eliminar un libro

### 2. Páginas de la Aplicación

#### Dashboard Principal (`/`)
- Estadísticas generales del sistema
- CRUD completo de autores
- Formulario para crear/editar autores
- Lista de autores con información detallada
- Navegación a páginas de detalle y libros

#### Página de Búsqueda de Libros (`/books`)
- Formulario para crear libros con selector de autor
- Barra de búsqueda en tiempo real
- Filtros por género (dropdown)
- Filtro por autor (búsqueda)
- Selector de ordenamiento (título, año, fecha)
- Paginación funcional
- Loading states
- Botones para editar y eliminar libros
- Diseño responsive

#### Página de Detalle de Autor (`/authors/[id]`)
- Información completa del autor
- Estadísticas detalladas (usando endpoint de stats)
- Lista de todos los libros del autor
- Formulario para editar información del autor
- Formulario para agregar nuevos libros
- Diseño responsive

## 🚀 Instalación y Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar la base de datos en `.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/biblioteca"
```

3. Ejecutar migraciones de Prisma:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

5. Abrir en el navegador:
```
http://localhost:3000
```

## 🛠️ Tecnologías Utilizadas

- **Next.js 16** - Framework de React
- **React 19** - Biblioteca de UI
- **TypeScript** - Lenguaje de programación
- **Prisma ORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **Tailwind CSS** - Framework de CSS
- **ESLint** - Linter de código

## 📁 Estructura del Proyecto

```
next-api-routes/
├── app/
│   └── api/
│       ├── authors/
│       │   ├── route.ts                    # GET, POST /api/authors
│       │   └── [id]/
│       │       ├── route.ts                # GET, PUT, DELETE /api/authors/[id]
│       │       ├── books/
│       │       │   └── route.ts            # GET /api/authors/[id]/books
│       │       └── stats/
│       │           └── route.ts            # GET /api/authors/[id]/stats
│       └── books/
│           ├── route.ts                    # GET, POST /api/books
│           ├── search/
│           │   └── route.ts                # GET /api/books/search
│           └── [id]/
│               └── routes.ts               # GET, PUT, DELETE /api/books/[id]
├── src/
│   └── app/
│       ├── page.tsx                        # Dashboard principal
│       ├── books/
│       │   └── page.tsx                    # Página de búsqueda de libros
│       └── authors/
│           └── [id]/
│               └── page.tsx                # Página de detalle de autor
├── lib/
│   └── prisma.ts                           # Cliente de Prisma
├── prisma/
│   └── schema.prisma                       # Esquema de base de datos
└── package.json
```

## 🎨 Características de UX/UI

- Diseño responsive para todos los tamaños de pantalla
- Loading states durante las operaciones
- Mensajes de confirmación para acciones destructivas
- Validación de formularios
- Estados de error claros
- Navegación intuitiva entre páginas
- Tarjetas visuales para estadísticas
- Badges de colores para géneros
- Paginación con controles de navegación

## 🔑 Características Técnicas

- **Server Components y Client Components** apropiadamente separados
- **API Routes** siguiendo las mejores prácticas de Next.js
- **Validación de datos** en backend y frontend
- **Manejo de errores** robusto
- **Prisma Client** optimizado con singleton pattern
- **TypeScript** con tipado estricto
- **Búsquedas case-insensitive** para mejor UX
- **Paginación eficiente** con límites configurables
- **Estadísticas calculadas** del lado del servidor

## 📝 Notas de Implementación

- Todos los parámetros de rutas dinámicas usan `Promise` (Next.js 16)
- Las importaciones de Prisma usan rutas relativas por compatibilidad
- Los formularios incluyen validación tanto en cliente como servidor
- Las búsquedas son parciales y case-insensitive para mejor experiencia
- La paginación incluye información completa de navegación
- Las estadísticas se calculan dinámicamente basadas en datos reales

## 🐛 Resolución de Problemas

Si encuentras errores:

1. Verifica que la base de datos esté corriendo
2. Asegúrate de que las migraciones estén aplicadas
3. Revisa que las variables de entorno estén configuradas
4. Limpia la caché de Next.js: `rm -rf .next`
5. Regenera el cliente de Prisma: `npx prisma generate`

## 📄 Licencia

Este proyecto es parte de un ejercicio académico.
