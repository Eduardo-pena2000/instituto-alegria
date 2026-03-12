import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticateAdmin, authenticateAny } from '../middleware/auth.js'

const router = Router()

const StudentSchema = z.object({
  matricula: z.string().min(1).max(20),
  nombre: z.string().min(1).max(100),
  apellido: z.string().min(1).max(100),
  nivel: z.enum(['preescolar', 'primaria', 'secundaria']),
  grado: z.string().min(1).max(20),
  grupo: z.string().min(1).max(5),
  fechaNacimiento: z.string().min(1),
  curp: z.string().length(18),
  nombrePadre: z.string().max(100).optional().default(''),
  nombreMadre: z.string().max(100).optional().default(''),
  telefono: z.string().min(1).max(30),
  email: z.string().email().max(100),
  direccion: z.string().min(1).max(300),
  fechaInscripcion: z.string().min(1),
  ultimoPago: z.string().optional().nullable(),
})

// GET /api/students — admin only, returns full PII
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { apellido: 'asc' },
    })
    res.json(students)
  } catch (err) {
    console.error('Get students error:', err)
    res.status(500).json({ error: 'Error al obtener alumnos' })
  }
})

// GET /api/students/search?q= — public (limited fields for payment flow)
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q
    if (!q || q.length < 2) return res.json([])

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
          { matricula: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        matricula: true,
        nombre: true,
        apellido: true,
        nivel: true,
        grado: true,
        grupo: true,
        ultimoPago: true,
      },
      take: 6,
    })
    res.json(students)
  } catch (err) {
    console.error('Search students error:', err)
    res.status(500).json({ error: 'Error en la búsqueda' })
  }
})

// GET /api/students/:id — admin or parent (own student only)
router.get('/:id', authenticateAny, async (req, res) => {
  try {
    // Parents can only see their own student
    if (req.user.role === 'parent' && req.user.studentId !== req.params.id) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
    })
    if (!student) return res.status(404).json({ error: 'Alumno no encontrado' })
    res.json(student)
  } catch (err) {
    console.error('Get student error:', err)
    res.status(500).json({ error: 'Error al obtener alumno' })
  }
})

// POST /api/students — admin only
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const parsed = StudentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    }

    const student = await prisma.student.create({ data: parsed.data })
    res.status(201).json(student)
  } catch (err) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.includes('matricula') ? 'matrícula' : 'CURP'
      return res.status(409).json({ error: `Ya existe un alumno con esa ${field}` })
    }
    console.error('Create student error:', err)
    res.status(500).json({ error: 'Error al crear alumno' })
  }
})

// PUT /api/students/:id — admin only
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const parsed = StudentSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    }

    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: parsed.data,
    })
    res.json(student)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Alumno no encontrado' })
    }
    if (err.code === 'P2002') {
      const field = err.meta?.target?.includes('matricula') ? 'matrícula' : 'CURP'
      return res.status(409).json({ error: `Ya existe un alumno con esa ${field}` })
    }
    console.error('Update student error:', err)
    res.status(500).json({ error: 'Error al actualizar alumno' })
  }
})

// DELETE /api/students/:id — admin only
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Alumno no encontrado' })
    }
    console.error('Delete student error:', err)
    res.status(500).json({ error: 'Error al eliminar alumno' })
  }
})

// POST /api/students/verify-curp — for payment flow (returns only boolean)
router.post('/verify-curp', async (req, res) => {
  try {
    const { studentId, curp } = req.body
    if (!studentId || !curp) {
      return res.status(400).json({ error: 'studentId y curp son requeridos' })
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) {
      return res.status(404).json({ error: 'Alumno no encontrado' })
    }

    const verified = student.curp.toUpperCase() === curp.toUpperCase()
    res.json({ verified })
  } catch (err) {
    console.error('Verify CURP error:', err)
    res.status(500).json({ error: 'Error al verificar CURP' })
  }
})

export default router
