import { useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

const microservicios = [
  { url: "/api/auth/swagger.yaml", name: "1. Autenticación" },
  { url: "/api/noticias/swagger.yaml", name: "2. Portal Web" },
  { url: "/api/torneos/swagger.yaml", name: "3. Torneos" },
  { url: "/api/deportistas/swagger.yaml", name: "4. Deportistas e Inscripciones" },
  { url: "/api/pagos/swagger.yaml", name: "5. Finanzas" },
  { url: "/api/reservas/swagger.yaml", name: "6. Infraestructura" }
];

function SwaggerViewer() {
  const [currentUrl, setCurrentUrl] = useState(microservicios[0].url);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", padding: "20px" }}>
      
      {}
      <div style={{ 
        marginBottom: "20px", 
        padding: "15px", 
        backgroundColor: "#f4f4f4", 
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "15px"
      }}>
        <label style={{ fontWeight: "bold", color: "#002b5c" }}> {}
          Selecciona el Microservicio:
        </label>
        <select 
          value={currentUrl} 
          onChange={(e) => setCurrentUrl(e.target.value)}
          style={{ 
            padding: "8px 12px", 
            borderRadius: "4px", 
            border: "1px solid #ccc",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          {microservicios.map(doc => (
            <option key={doc.url} value={doc.url}>
              {doc.name}
            </option>
          ))}
        </select>
      </div>

      {}
      <SwaggerUI url={currentUrl} />
    </div>
  )
}

export default SwaggerViewer