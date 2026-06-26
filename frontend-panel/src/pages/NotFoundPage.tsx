import React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600 text-xl mt-4">Página no encontrada</p>
        <a
          href="/panel-admin"
          className="inline-block mt-8 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Volver al Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
