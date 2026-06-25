import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

function SwaggerViewer() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <SwaggerUI url="/swagger.yaml" />
    </div>
  )
}

export default SwaggerViewer