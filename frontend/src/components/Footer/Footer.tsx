import './Footer.css'

function Footer() {
  return (
    <footer className="ucb-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img
            src="/ucb-assets/UCB%20logo%20horizontal%20blanco.png"
            alt="UCB Logo"
          />
          <div>
            <h3>UCB Deportes</h3>
            <p>Excelencia y Valores.</p>
          </div>
        </div>
        <div className="footer-copy">
          <p>&copy; {new Date().getFullYear()} Universidad Católica Boliviana "San Pablo"</p>
          <p className="muted">Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
