import React, { useEffect, useState } from "react";
import { Layout } from "@components/layout";
import { Card, Table } from "@components/common";
import { disciplinaService } from "@/features/disciplines/services/disciplinaService";
import { Disciplina } from "@types";

const DisciplinesPage: React.FC = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDisciplines = async () => {
      try {
        const response = await disciplinaService.obtenerDisciplinas();
        setDisciplinas(response.data);
      } finally {
        setIsLoading(false);
      }
    };

    loadDisciplines();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Disciplinas</h1>
        <Card>
          <Table
            columns={[
              { key: "id", title: "ID" },
              { key: "nombre", title: "Nombre" },
            ]}
            data={disciplinas}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default DisciplinesPage;
