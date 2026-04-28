import { useState } from 'react'
import {
    ShoppingCart, Plus, Minus, X, CreditCard, CheckCircle,
    Shirt, BookOpen, ChevronRight, Tag, Package, ArrowLeft,
    ShieldCheck, Trash2, Lock, Shield, AlertCircle, Mail
} from 'lucide-react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { STORE_PRODUCTS } from '../utils/storeData'
import { API_URL, STRIPE_PK } from '../config'

const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

/* ─── Stripe Checkout Form ─────────────────────────── */
function StoreCheckoutForm({ total, items, studentId, onSuccess, onBack }) {
    const stripe = useStripe()
    const elements = useElements()
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(null)
    const [elementReady, setElementReady] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!stripe || !elements || !elementReady) return
        setProcessing(true)
        setError(null)

        // First, validate the Payment Element
        const { error: submitError } = await elements.submit()
        if (submitError) {
            setError(submitError.message)
            setProcessing(false)
            return
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/portal`,
            },
            redirect: 'if_required',
        })

        if (confirmError) {
            setError(confirmError.message)
            setProcessing(false)
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Record the store order in our database
            try {
                await fetch(`${API_URL}/api/store/record-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId,
                        items,
                        totalCents: Math.round(total * 100),
                        stripePaymentId: paymentIntent.id
                    })
                })
            } catch (err) {
                // Not ideal, but the payment is done in Stripe. Webhook can sync it later.
                console.error('Failed to record order:', err)
            }
            onSuccess(paymentIntent.id)
        }
    }

    return (
        <div className="relative">
            {/* Processing overlay — form stays mounted underneath */}
            {processing && (
                <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3166, #166534)' }}>
                        <svg className="w-8 h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Procesando tu pago...</h3>
                    <p className="text-sm text-gray-400">No cierres esta ventana.</p>
                    <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto mt-6 overflow-hidden">
                        <div className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #1e3166, #166534)', width: '70%' }} />
                    </div>
                </div>
            )}

            {/* Form — always mounted so PaymentElement stays in the DOM */}
            <form onSubmit={handleSubmit} className={`space-y-5 ${processing ? 'invisible' : ''}`}>
                <PaymentElement
                    onReady={() => setElementReady(true)}
                    options={{
                        layout: 'tabs',
                    }}
                />

                {error && (
                    <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <button type="submit" disabled={!stripe || !elements || !elementReady || processing}
                    className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}>
                    <Lock className="w-5 h-5" />
                    Pagar ${total.toLocaleString()} MXN
                </button>

                <button type="button" onClick={onBack}
                    className="w-full py-2.5 text-sm text-gray-400 hover:text-[#1e3166] font-medium transition-colors">
                    Volver al resumen
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-300 pt-1">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Pago seguro con Stripe</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Cifrado PCI DSS</span>
                </div>
            </form>
        </div>
    )
}

/* ─── Tienda Escolar ──────────────────────────────────── */
export default function SchoolStore({ nivel, studentName, studentId, cart, setCart }) {
    const [category, setCategory] = useState('uniformes')
    const [checkout, setCheckout] = useState(false)
    const [orderDone, setOrderDone] = useState(false)
    const [clientSecret, setClientSecret] = useState(null)
    const [paymentStep, setPaymentStep] = useState('summary') // 'summary' | 'stripe'
    const [paymentError, setPaymentError] = useState('')
    const [isStartingPayment, setIsStartingPayment] = useState(false)
    const [receiptEmail, setReceiptEmail] = useState('')

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

    /* ── Start Stripe payment ── */
    const startPayment = async () => {
        if (isStartingPayment) return
        setIsStartingPayment(true)
        setPaymentError('')
        try {
            const items = cartItems.map(([, item]) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty,
                selectedSize: item.selectedSize || null,
            }))

            const res = await fetch(`${API_URL}/api/store/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, studentName, studentId: studentId || '', receiptEmail: receiptEmail.trim() || undefined }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Error al crear la sesión de pago')
            }

            const { clientSecret: cs } = await res.json()
            setClientSecret(cs)
            setPaymentStep('stripe')
        } catch (err) {
            setPaymentError(err.message || 'Error al preparar el pago. Intenta de nuevo.')
        } finally {
            setIsStartingPayment(false)
        }
    }

    const handlePaymentSuccess = () => {
        setOrderDone(true)
        setClientSecret(null)
        setPaymentStep('summary')
    }

    /* ── Order done ── */
    if (orderDone) {
        return (
            <div className="text-center py-12">
                <style>{`@keyframes popIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)', animation: 'popIn 0.5s ease-out' }}>
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¡Pago exitoso!</h2>
                <p className="text-gray-500 mb-1 max-w-sm mx-auto">
                    Tu compra de artículos escolares para <strong className="text-gray-700">{studentName}</strong> ha sido pagada correctamente.
                </p>
                <p className="text-sm text-gray-400 mb-8">
                    Te enviaremos un correo con los detalles y coordinaremos la entrega.
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
        // Show Stripe payment form
        if (paymentStep === 'stripe' && clientSecret && stripePromise) {
            return (
                <div className="space-y-6">
                    <button onClick={() => { setPaymentStep('summary'); setClientSecret(null) }}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1e3166] transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Volver al resumen
                    </button>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3166] to-[#166534] flex items-center justify-center shadow-md">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Datos de pago</h2>
                                <p className="text-xs text-gray-400">{cartCount} artículo{cartCount !== 1 ? 's' : ''} — ${cartTotal.toLocaleString()} MXN</p>
                            </div>
                        </div>

                        <Elements stripe={stripePromise} options={{
                            clientSecret,
                            appearance: {
                                theme: 'stripe',
                                variables: { colorPrimary: '#1e3166', borderRadius: '12px', fontFamily: 'Inter, system-ui, sans-serif' },
                            },
                        }}>
                            <StoreCheckoutForm
                                total={cartTotal}
                                items={Object.values(cart)}
                                studentId={studentId}
                                onSuccess={handlePaymentSuccess}
                                onBack={() => setPaymentStep('summary')}
                            />
                        </Elements>
                    </div>
                </div>
            )
        }

        // Show order summary
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

                        {/* Email para recibo */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                📧 Correo para recibo (opcional)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={receiptEmail}
                                    onChange={e => setReceiptEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1e3166] focus:bg-white text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Te enviaremos un recibo de compra a este correo</p>
                        </div>

                        {paymentError && (
                            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {paymentError}
                            </div>
                        )}

                        {/* Actions */}
                        <button
                            onClick={startPayment}
                            disabled={isStartingPayment}
                            className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #166534 0%, #22a84a 100%)' }}
                        >
                            {isStartingPayment ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Pagar con tarjeta — ${cartTotal.toLocaleString()} MXN
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-4 text-xs text-gray-300 pt-1">
                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Pago seguro con Stripe</span>
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
