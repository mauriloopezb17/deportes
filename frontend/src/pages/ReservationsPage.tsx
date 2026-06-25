import React from "react";
import { Layout } from "@components/layout";
import ReservationCalendar from "../features/reservations/components/ReservationCalendar";

const ReservationsPage: React.FC = () => {
  return (
    <Layout>
      <ReservationCalendar />
    </Layout>
  );
};

export default ReservationsPage;
