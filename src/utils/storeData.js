/* ─── Catálogo de la Tienda Escolar ──────────────────── */

export const STORE_CATEGORIES = [
    { id: 'uniformes', label: 'Uniformes', icon: 'Shirt' },
    { id: 'libros', label: 'Libros y Materiales', icon: 'BookOpen' },
]

/**
 * Catálogo de productos por nivel educativo.
 * Precios estimados en MXN (pueden ajustarse por el administrador).
 */
export const STORE_PRODUCTS = {
    preescolar: {
        uniformes: [
            { id: 'pre-u1', name: 'Playera polo blanca con logo', price: 280, image: '👕', sizes: ['4', '6', '8'] },
            { id: 'pre-u2', name: 'Pantalón azul marino', price: 320, image: '👖', sizes: ['4', '6', '8'] },
            { id: 'pre-u3', name: 'Pants deportivo con logo', price: 350, image: '🩳', sizes: ['4', '6', '8'] },
            { id: 'pre-u4', name: 'Playera deportiva con logo', price: 250, image: '👕', sizes: ['4', '6', '8'] },
            { id: 'pre-u5', name: 'Bata escolar', price: 220, image: '🥼', sizes: ['Unitalla'] },
            { id: 'pre-u6', name: 'Zapatos negros escolares', price: 450, image: '👞', sizes: ['18', '19', '20', '21', '22'] },
            { id: 'pre-u7', name: 'Tenis blancos', price: 420, image: '👟', sizes: ['18', '19', '20', '21', '22'] },
        ],
        libros: [
            { id: 'pre-l1', name: 'Cuaderno de trabajo Alegría', price: 150, image: '📓' },
            { id: 'pre-l2', name: 'Articulo de prueba (Block de hojas)', price: 10, image: '📄' },
            { id: 'pre-l3', name: 'Caja de crayones gruesos (12 pzas)', price: 65, image: '🖍️' },
            { id: 'pre-l4', name: 'Plastilina (paquete 10 barras)', price: 55, image: '🎨' },
            { id: 'pre-l5', name: 'Paquete de materiales básicos', price: 180, image: '✂️', description: 'Tijeras, pegamento, colores, etc.' },
        ],
    },
    primaria: {
        uniformes: [
            { id: 'pri-u1', name: 'Playera polo blanca con logo', price: 290, image: '👕', sizes: ['6', '8', '10', '12', '14'] },
            { id: 'pri-u2', name: 'Pantalón azul marino', price: 340, image: '👖', sizes: ['6', '8', '10', '12', '14'] },
            { id: 'pri-u3', name: 'Pants deportivo con logo', price: 380, image: '🩳', sizes: ['6', '8', '10', '12', '14'] },
            { id: 'pri-u4', name: 'Playera deportiva con logo', price: 260, image: '👕', sizes: ['6', '8', '10', '12', '14'] },
            { id: 'pri-u5', name: 'Suéter azul marino con logo', price: 420, image: '🧥', sizes: ['6', '8', '10', '12', '14'] },
            { id: 'pri-u6', name: 'Zapatos negros escolares', price: 520, image: '👞', sizes: ['21', '22', '23', '24', '25'] },
            { id: 'pri-u7', name: 'Tenis blancos', price: 480, image: '👟', sizes: ['21', '22', '23', '24', '25'] },
        ],
        libros: [
            { id: 'pri-l1', name: 'Cuaderno de trabajo de inglés Alegría', price: 250, image: '📘' },
            { id: 'pri-l2', name: 'Cuaderno profesional cuadrícula chica (×2)', price: 90, image: '📓' },
            { id: 'pri-l3', name: 'Cuaderno profesional raya (×2)', price: 90, image: '📓' },
            { id: 'pri-l4', name: 'Cuaderno profesional cuadrícula grande', price: 45, image: '📓' },
            { id: 'pri-l5', name: 'Diccionario escolar español', price: 120, image: '📖' },
            { id: 'pri-l6', name: 'Atlas de México (4° a 6°)', price: 85, image: '🗺️', note: 'Solo 4°-6°' },
            { id: 'pri-l7', name: 'Paquete de materiales básicos', price: 220, image: '✂️', description: 'Colores, regla, escuadras, etc.' },
        ],
    },
    secundaria: {
        uniformes: [
            { id: 'sec-u1', name: 'Camisa blanca con logo', price: 310, image: '👔', sizes: ['S', 'M', 'L', 'XL'] },
            { id: 'sec-u2', name: 'Pantalón gris', price: 380, image: '👖', sizes: ['28', '30', '32', '34'] },
            { id: 'sec-u3', name: 'Pants deportivo con logo', price: 400, image: '🩳', sizes: ['S', 'M', 'L', 'XL'] },
            { id: 'sec-u4', name: 'Playera deportiva con logo', price: 280, image: '👕', sizes: ['S', 'M', 'L', 'XL'] },
            { id: 'sec-u5', name: 'Suéter gris con logo', price: 450, image: '🧥', sizes: ['S', 'M', 'L', 'XL'] },
            { id: 'sec-u6', name: 'Zapatos negros escolares', price: 580, image: '👞', sizes: ['24', '25', '26', '27', '28'] },
            { id: 'sec-u7', name: 'Tenis blancos', price: 520, image: '👟', sizes: ['24', '25', '26', '27', '28'] },
        ],
        libros: [
            { id: 'sec-l1', name: 'Cuaderno de trabajo de inglés Alegría', price: 300, image: '📘' },
            { id: 'sec-l2', name: 'Cuaderno profesional cuadrícula chica (×2)', price: 90, image: '📓' },
            { id: 'sec-l3', name: 'Cuaderno profesional raya (×3)', price: 135, image: '📓' },
            { id: 'sec-l4', name: 'Cuaderno profesional cuadrícula grande (×2)', price: 90, image: '📓' },
            { id: 'sec-l5', name: 'Calculadora científica', price: 280, image: '🧮' },
            { id: 'sec-l6', name: 'Diccionario español e inglés-español', price: 160, image: '📖' },
            { id: 'sec-l7', name: 'Paquete de materiales básicos', price: 250, image: '✂️', description: 'Regla, escuadras, compás, etc.' },
        ],
    },
}
