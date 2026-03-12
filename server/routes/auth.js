import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

const router = Router()

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
    }

    const admin = await prisma.adminUser.findUnique({ where: { username } })
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '8h'
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn }
    )

    res.json({ token, expiresIn })
  } catch (err) {
    console.error('Admin login error:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/auth/parent/login
router.post('/parent/login', async (req, res) => {
  try {
    const { curp } = req.body
    if (!curp || curp.length !== 18) {
      return res.status(400).json({ error: 'CURP inválido (debe ser de 18 caracteres)' })
    }

    const student = await prisma.student.findUnique({
      where: { curp: curp.toUpperCase() },
    })

    if (!student) {
      return res.status(404).json({ error: 'CURP no encontrado en el sistema' })
    }

    const token = jwt.sign(
      { studentId: student.id, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      expiresIn: '24h',
      student: {
        id: student.id,
        nombre: student.nombre,
        apellido: student.apellido,
      },
    })
  } catch (err) {
    console.error('Parent login error:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
