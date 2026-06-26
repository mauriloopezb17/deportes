import React from "react";
import { Layout } from "@components/layout";
import { FixtureList } from "../features/tournaments/components/MatchResults";

const FixturePage: React.FC = () => {
  return (
    <Layout>
      <FixtureList />
    </Layout>
  );
};

export default FixturePage;
