import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerViewer: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE;

  return (
    <SwaggerUI
      urls={[
        { 
          name: "Identidad y Usuarios", 
          url: `${baseUrl}api/auth/docs-json` 
        },
        {
            name: "Deportistas e Inscripciones",
            url: `${baseUrl}api/deportistas/docs-json`
        },
        // Estructura para agregar los demas Swaggers de los otros microservicios
          // { 
          //   name: "Torneos", 
          //   url: `${baseUrl}api/torneos/docs-json` 
          // }
      ]}
      primaryName="Identidad y Usuarios" 
    />
  );
};

export default SwaggerViewer;