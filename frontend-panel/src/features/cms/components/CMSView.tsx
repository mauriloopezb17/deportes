import React from "react";
import { Layout } from "@components/layout";

const CMSPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          CMS - Gestión de Contenidos
        </h1>
        <p className="text-gray-600">
          Sistema de gestión de contenidos en desarrollo
        </p>
      </div>
    </Layout>
  );
};

export default CMSPage;
