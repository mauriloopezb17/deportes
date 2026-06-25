import React from "react";
import { Layout } from "@components/layout";
import MatchResultsList from "../features/tournaments/components/MatchResults";

const ResultsPage: React.FC = () => {
  return (
    <Layout>
      <MatchResultsList />
    </Layout>
  );
};

export default ResultsPage;
