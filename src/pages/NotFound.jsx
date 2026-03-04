import { Link } from 'react-router-dom'
import { Home, ArrowLeft, SearchX } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
            <div className="max-w-lg mx-auto px-6 text-center">
                {/* Icon */}
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}>
                    <SearchX className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-7xl font-black text-[#1e3166] mb-2">404</h1>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Página no encontrada</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[#1e3166] to-[#166534] rounded-full mx-auto mb-6" />

                <p className="text-gray-500 mb-10 leading-relaxed">
                    La página que buscas no existe o ha sido movida.
                    Verifica la URL o regresa al inicio.
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}
                    >
                        <Home className="w-4 h-4" />
                        Ir al inicio
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-600 hover:border-[#1e3166] hover:text-[#1e3166] font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-12 text-xs text-gray-300 font-medium">
                    Instituto Educativo Alegría · Valores para VIVIR
                </p>
            </div>
        </div>
    )
}
