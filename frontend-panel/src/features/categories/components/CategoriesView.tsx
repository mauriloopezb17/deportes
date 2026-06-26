import React, { useEffect, useState } from "react";
import { Layout } from "@components/layout";
import { Card, Table } from "@components/common";
import {
  Categoria,
  categoryService,
} from "../services/categoryService";

const CategoriesView: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const response = await categoryService.obtenerCategorias();
        setCategorias(response.data);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categorias deportivas
          </h1>
          <p className="text-gray-600">
            Consulta las categorias disponibles para las competencias.
          </p>
        </div>

        <Card>
          <Table
            columns={[
              { key: "id", title: "ID" },
              { key: "nombre", title: "Categoria" },
            ]}
            data={categorias}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default CategoriesView;
