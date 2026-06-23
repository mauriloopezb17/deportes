import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { useScrollReveal } from './useScrollReveal'
import './MainLayout.css'

/* MainLayout view — an empty container "box": global Navbar on top, the active
   feature module in the middle (Outlet), global Footer at the bottom. */
function MainLayout() {
  useScrollReveal()
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-content">
        <Outlet />
      </main>
      <div className="layout-footer">
        <Footer />
      </div>
    </div>
  )
}

export default MainLayout
