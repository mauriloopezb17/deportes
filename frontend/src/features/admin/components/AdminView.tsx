import React from "react";
import { Layout } from "@components/layout";
import { Card } from "@components/common";

const AdminPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel Administrativo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hoverable>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Academias</h2>
            <p className="text-gray-600 mb-4">
              Gestiona academias, datos y estados de cuenta
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Ver más →
            </button>
          </Card>

          <Card hoverable>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Usuarios</h2>
            <p className="text-gray-600 mb-4">
              Gestiona usuarios y asignación de roles
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Ver más →
            </button>
          </Card>

          <Card hoverable>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pagos</h2>
            <p className="text-gray-600 mb-4">
              Verifica y registra pagos de academias
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Ver más →
            </button>
          </Card>

          <Card hoverable>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Comunicados
            </h2>
            <p className="text-gray-600 mb-4">
              Crea y publica comunicados importantes
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Ver más →
            </button>
          </Card>

          <Card hoverable>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial</h2>
            <p className="text-gray-600 mb-4">Registra el historial del club</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Ver más →
            </button>
          </Card>

          <Card hoverable>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reportes</h2>
            <p className="text-gray-600 mb-4">Genera reportes y estadísticas</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Ver más →
            </button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
