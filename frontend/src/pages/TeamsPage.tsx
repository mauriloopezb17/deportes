import React from "react";
import { Layout } from "@components/layout";
import TeamList from "../features/teams/components/TeamList";

const TeamsPage: React.FC = () => {
  return (
    <Layout>
      <TeamList />
    </Layout>
  );
};

export default TeamsPage;
