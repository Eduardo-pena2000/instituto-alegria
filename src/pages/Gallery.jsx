import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

const categories = ['Todas', 'Aulas', 'Laboratorios', 'Deportes', 'Biblioteca', 'Arte', 'Exterior']

const photos = [
  { id: 1, src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=70',  cat: 'Exterior',     title: 'Edificio principal' },
  { id: 2, src: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=70',  cat: 'Aulas',        title: 'Aula de Primaria' },
  { id: 3, src: 'https://images.unsplash.com/photo-1532094349884-543559196673?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1532094349884-543559196673?w=400&q=70',  cat: 'Laboratorios', title: 'Laboratorio de Ciencias' },
  { id: 4, src: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&q=70',  cat: 'Biblioteca',   title: 'Biblioteca escolar' },
  { id: 5, src: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=70',  cat: 'Deportes',     title: 'Cancha deportiva' },
  { id: 6, src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=70',  cat: 'Laboratorios', title: 'Laboratorio de Cómputo' },
  { id: 7, src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70',  cat: 'Aulas',        title: 'Salón de Preescolar' },
  { id: 8, src: 'https://images.unsplash.com/photo-1544717305-996b815c338c?w=800&q=80',     thumb: 'https://images.unsplash.com/photo-1544717305-996b815c338c?w=400&q=70',     cat: 'Exterior',     title: 'Patio de recreo' },
  { id: 9, src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=70',  cat: 'Aulas',        title: 'Alumnos en clase' },
  { id:10, src: 'https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=800&q=80',     thumb: 'https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=400&q=70',     cat: 'Arte',         title: 'Taller de arte' },
  { id:11, src: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efd?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efd?w=400&q=70',  cat: 'Deportes',     title: 'Clases de educación física' },
  { id:12, src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',  thumb: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=70',  cat: 'Biblioteca',   title: 'Área de lectura' },
]

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [lightbox, setLightbox] = useState(null)

  const filtered = activeCategory === 'Todas'
    ? photos
    : photos.filter(p => p.cat === activeCategory)

  return (
    <div className="pt-16 md:pt-20">

      {/* Hero */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1630 0%, #1e3166 55%, #0b2614 100%)' }}>
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#166534]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#166534] text-white text-xs font-bold px-5 py-2 rounded-full mb-6 uppercase tracking-widest">
            IEA · Espacios educativos
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Nuestras Instalaciones</h1>
          <div className="w-16 h-1 bg-[#166534] rounded-full mx-auto mb-4" />
          <p className="text-xl text-blue-100/80">
            Espacios diseñados para inspirar el aprendizaje y el crecimiento de cada estudiante.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="py-8 bg-white shadow-sm sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(photo => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-video"
              >
                <img
                  src={photo.thumb}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold text-sm">{photo.title}</p>
                  <span className="text-xs text-white/70">{photo.cat}</span>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No hay fotos en esta categoría.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="w-full rounded-xl shadow-2xl max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-center">
              <p className="text-white font-semibold text-lg">{lightbox.title}</p>
              <p className="text-gray-400 text-sm">{lightbox.cat}</p>
            </div>
          </div>
        </div>
      )}

      {/* Features list */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Espacios para el aprendizaje</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { emoji: '🏫', label: 'Aulas modernas' },
              { emoji: '🔬', label: 'Lab. Ciencias' },
              { emoji: '💻', label: 'Lab. Cómputo' },
              { emoji: '📚', label: 'Biblioteca' },
              { emoji: '⚽', label: 'Cancha deportiva' },
              { emoji: '🎨', label: 'Taller de arte' },
            ].map(({ emoji, label }) => (
              <div key={label} className="p-4 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors">
                <div className="text-4xl mb-2">{emoji}</div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
