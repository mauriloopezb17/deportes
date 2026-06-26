import React from "react";
import { Layout } from "@components/layout";
import { Card } from "@components/common";

const SettingsPage: React.FC = () => (
  <Layout>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
      <Card>
        <p className="text-gray-600">
          La aplicación está conectada al backend configurado para este entorno.
        </p>
      </Card>
    </div>
  </Layout>
);

export default SettingsPage;
