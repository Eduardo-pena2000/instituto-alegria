/* ─── Requisitos del Ciclo Escolar por nivel ──────────────── */

export const REQUISITOS = {
    preescolar: {
        uniformes: [
            { item: 'Uniforme diario (playera polo blanca con logo, pantalón azul marino)', cantidad: 2 },
            { item: 'Uniforme de educación física (pants y playera deportiva con logo)', cantidad: 1 },
            { item: 'Bata escolar (para actividades artísticas)', cantidad: 1 },
            { item: 'Zapatos negros escolares', cantidad: 1 },
            { item: 'Tenis blancos (para educación física)', cantidad: 1 },
        ],
        libros: [
            { item: 'Libro de trabajo "Mis primeras letras" (proporcionado por la SEP)', nota: 'Gratuito' },
            { item: 'Libro de trabajo "Pensamiento matemático"', nota: 'Gratuito' },
            { item: 'Cuaderno de trabajo Alegría (se adquiere en la escuela)', nota: '$150 MXN' },
            { item: 'Block de hojas blancas tamaño carta', cantidad: 2 },
            { item: 'Caja de crayones gruesos (12 piezas)', cantidad: 2 },
            { item: 'Plastilina (paquete de 10 barras)', cantidad: 1 },
        ],
    },
    primaria: {
        uniformes: [
            { item: 'Uniforme diario (playera polo blanca con logo, pantalón azul marino)', cantidad: 2 },
            { item: 'Uniforme de educación física (pants y playera deportiva con logo)', cantidad: 1 },
            { item: 'Suéter azul marino con logo', cantidad: 1 },
            { item: 'Zapatos negros escolares', cantidad: 1 },
            { item: 'Tenis blancos (para educación física)', cantidad: 1 },
        ],
        libros: [
            { item: 'Libros de texto gratuitos de la SEP (se entregan en la escuela)', nota: 'Gratuito' },
            { item: 'Cuaderno profesional cuadrícula chica (Matemáticas)', cantidad: 2 },
            { item: 'Cuaderno profesional raya (Español)', cantidad: 2 },
            { item: 'Cuaderno profesional cuadrícula grande (Ciencias)', cantidad: 1 },
            { item: 'Atlas de México (4° a 6°)', cantidad: 1, nota: 'Solo 4°-6°' },
            { item: 'Diccionario escolar español', cantidad: 1 },
            { item: 'Cuaderno de trabajo de inglés Alegría (se adquiere en la escuela)', nota: '$250 MXN' },
        ],
    },
    secundaria: {
        uniformes: [
            { item: 'Uniforme diario (camisa blanca con logo, pantalón gris)', cantidad: 2 },
            { item: 'Uniforme de educación física (pants y playera deportiva con logo)', cantidad: 1 },
            { item: 'Suéter gris con logo', cantidad: 1 },
            { item: 'Zapatos negros escolares', cantidad: 1 },
            { item: 'Tenis blancos (para educación física)', cantidad: 1 },
        ],
        libros: [
            { item: 'Libros de texto gratuitos de la SEP (se entregan en la escuela)', nota: 'Gratuito' },
            { item: 'Cuaderno profesional cuadrícula chica (Matemáticas)', cantidad: 2 },
            { item: 'Cuaderno profesional raya (Español, Historia, FCyE)', cantidad: 3 },
            { item: 'Cuaderno profesional cuadrícula grande (Ciencias / Física / Química)', cantidad: 2 },
            { item: 'Calculadora científica', cantidad: 1 },
            { item: 'Diccionario español e inglés-español', cantidad: 1 },
            { item: 'Cuaderno de trabajo de inglés Alegría (se adquiere en la escuela)', nota: '$300 MXN' },
        ],
    },
}
