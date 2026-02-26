import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Levels from './pages/Levels'
import Gallery from './pages/Gallery'
import Admissions from './pages/Admissions'
import Payment from './pages/Payment'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import ParentPortal from './pages/ParentPortal'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const location = useLocation()
  const isHiddenNav = location.pathname === '/admin' || location.pathname === '/portal'

  return (
    <>
      <ScrollToTop />
      {!isHiddenNav && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/niveles" element={<Levels />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/admisiones" element={<Admissions />} />
          <Route path="/pago" element={<Payment />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/portal" element={<ParentPortal />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isHiddenNav && <Footer />}
    </>
  )
}
