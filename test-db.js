import { prisma } from './lib/prisma'

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexión exitosa:', result)
    
    console.log('📊 Contando autores...')
    const authorCount = await prisma.author.count()
    console.log(`✅ Total de autores: ${authorCount}`)
    
  } catch (error) {
    console.error('❌ Error de conexión:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
