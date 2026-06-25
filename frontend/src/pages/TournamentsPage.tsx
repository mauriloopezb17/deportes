import React from "react";
import { Layout } from "@components/layout";
import TournamentList from "../features/tournaments/components/TournamentList";

const TournamentsPage: React.FC = () => {
  return (
    <Layout>
      <TournamentList />
    </Layout>
  );
};

export default TournamentsPage;
