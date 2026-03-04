import { useState } from 'react'
import {
    ShoppingCart, Plus, Minus, X, CreditCard, CheckCircle,
    Shirt, BookOpen, ChevronRight, Tag, Package, ArrowLeft,
    ShieldCheck, Trash2
} from 'lucide-react'
import { STORE_PRODUCTS } from '../utils/storeData'

/* ─── Tienda Escolar ──────────────────────────────────── */
export default function SchoolStore({ nivel, studentName }) {
    const [cart, setCart] = useState({})        // { productId: { ...product, qty, size? } }
    const [category, setCategory] = useState('uniformes')
    const [checkout, setCheckout] = useState(false)
    const [orderDone, setOrderDone] = useState(false)

    const products = STORE_PRODUCTS[nivel] || STORE_PRODUCTS.primaria
    const currentProducts = products[category] || []

    /* ── Cart helpers ── */
    const addToCart = (product, size) => {
        const key = size ? `${product.id}-${size}` : product.id
        setCart(prev => {
            const existing = prev[key]
            if (existing) {
                return { ...prev, [key]: { ...existing, qty: existing.qty + 1 } }
            }
            return { ...prev, [key]: { ...product, qty: 1, selectedSize: size } }
        })
    }

    const updateQty = (key, delta) => {
        setCart(prev => {
            const item = prev[key]
            if (!item) return prev
            const newQty = item.qty + delta
            if (newQty <= 0) {
                const next = { ...prev }
                delete next[key]
                return next
            }
            return { ...prev, [key]: { ...item, qty: newQty } }
        })
    }

    const removeItem = (key) => {
        setCart(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const clearCart = () => setCart({})

    const cartItems = Object.entries(cart)
    const cartCount = cartItems.reduce((sum, [, item]) => sum + item.qty, 0)
    const cartTotal = cartItems.reduce((sum, [, item]) => sum + item.price * item.qty, 0)

    /* ── Order done ── */
    if (orderDone) {
        return (
            <div className="text-center py-12">
                <style>{`@keyframes popIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)', animation: 'popIn 0.5s ease-out' }}>
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¡Pedido registrado!</h2>
                <p className="text-gray-500 mb-1 max-w-sm mx-auto">
                    Tu pedido de artículos escolares para <strong className="text-gray-700">{studentName}</strong> ha sido registrado.
                </p>
                <p className="text-sm text-gray-400 mb-8">
                    Nos pondremos en contacto contigo para coordinar la entrega y el pago.
                </p>
                <button
                    onClick={() => { setOrderDone(false); clearCart(); setCheckout(false) }}
                    className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}
                >
                    <ShoppingCart className="w-4 h-4" />
                    Seguir comprando
                </button>
            </div>
        )
    }

    /* ── Checkout view ── */
    if (checkout) {
        return (
            <div className="space-y-6">
                <button onClick={() => setCheckout(false)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1e3166] transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Volver a la tienda
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6" style={{ background: 'linear-gradient(135deg, #1e3166 0%, #243d80 60%, #1a5a2f 100%)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white">Resumen del pedido</h2>
                                <p className="text-blue-200/70 text-sm">{cartCount} artículo{cartCount !== 1 ? 's' : ''} para {studentName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Items */}
                        <div className="divide-y divide-gray-50">
                            {cartItems.map(([key, item]) => (
                                <div key={key} className="flex items-center gap-4 py-3">
                                    <span className="text-2xl shrink-0">{item.image}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                        {item.selectedSize && (
                                            <span className="text-xs text-gray-400">Talla: {item.selectedSize}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">×{item.qty}</span>
                                    <span className="font-bold text-[#1e3166] text-sm whitespace-nowrap">${(item.price * item.qty).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Subtotal ({cartCount} artículos)</span>
                                <span className="font-medium text-gray-800">${cartTotal.toLocaleString()}</span>
                            </div>
                            <hr className="border-gray-200" />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total a pagar</span>
                                <span className="text-2xl font-extrabold text-[#166534]">${cartTotal.toLocaleString()} MXN</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={() => setOrderDone(true)}
                            className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}
                        >
                            <CreditCard className="w-5 h-5" />
                            Confirmar pedido — ${cartTotal.toLocaleString()} MXN
                        </button>

                        <div className="flex items-center justify-center gap-4 text-xs text-gray-300 pt-1">
                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Compra segura</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Entrega en la escuela</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    /* ── Store view ── */
    return (
        <div className="space-y-6">

            {/* Category tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                {[
                    { id: 'uniformes', label: 'Uniformes', icon: Shirt },
                    { id: 'libros', label: 'Libros y Materiales', icon: BookOpen },
                ].map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setCategory(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${category === id
                            ? 'bg-[#1e3166] text-white shadow-md'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}>
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentProducts.map(product => (
                    <ProductCard key={product.id} product={product} cart={cart} onAdd={addToCart} />
                ))}
            </div>

            {/* Floating cart bar */}
            {cartCount > 0 && (
                <div className="sticky bottom-4 z-30">
                    <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-4 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3166] to-[#166534] flex items-center justify-center shadow-md">
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{cartCount}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{cartCount} artículo{cartCount !== 1 ? 's' : ''}</p>
                            <p className="text-xs text-gray-400">{Object.keys(cart).length} producto{Object.keys(cart).length !== 1 ? 's' : ''} diferentes</p>
                        </div>
                        <div className="text-right mr-2">
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="font-extrabold text-[#166534] text-lg">${cartTotal.toLocaleString()}</p>
                        </div>
                        <button onClick={clearCart} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Vaciar carrito">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCheckout(true)}
                            className="py-3 px-5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap"
                            style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}
                        >
                            Pagar
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ─── Product Card ────────────────────────────────────── */
function ProductCard({ product, cart, onAdd }) {
    const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null)
    const cartKey = selectedSize ? `${product.id}-${selectedSize}` : product.id
    const inCart = cart[cartKey]

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
            {/* Product header */}
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {product.image}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.name}</h3>
                        {product.description && <p className="text-xs text-gray-400 mt-0.5">{product.description}</p>}
                        {product.note && (
                            <span className="inline-block text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full mt-1">{product.note}</span>
                        )}
                    </div>
                </div>

                {/* Size selector */}
                {product.sizes && (
                    <div className="mt-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Talla</p>
                        <div className="flex flex-wrap gap-1.5">
                            {product.sizes.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selectedSize === size
                                        ? 'bg-[#1e3166] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Price + action bar */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#166534]" />
                        <span className="font-extrabold text-[#166534] text-lg">${product.price.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">MXN</span>
                </div>

                {inCart ? (
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> ×{inCart.qty}
                        </span>
                        <button
                            onClick={() => onAdd(product, selectedSize)}
                            className="p-2 bg-[#166534] hover:bg-[#15742f] text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onAdd(product, selectedSize)}
                        className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-[1.03] active:scale-[0.97] transition-all"
                        style={{ background: 'linear-gradient(135deg, #1e3166 0%, #166534 100%)' }}
                    >
                        <Plus className="w-4 h-4" />
                        Agregar
                    </button>
                )}
            </div>
        </div>
    )
}
