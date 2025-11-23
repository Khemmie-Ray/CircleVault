import React, { useState } from "react";
import { DashNav, MobileDashNav } from "../../components/shared/Reuse";
import Saver from "../../components/dashboard/Saver";

const Dashboard = () => {
  return (
    <main className="">
      <MobileDashNav>Overview</MobileDashNav>
      <DashNav>Overview</DashNav>
      <section className="flex justify-between my-8 lg:px-8 md:px-8 px-4 items-center flex-col lg:flex-row md:flex-row">
        <div className="mb-3">
          <h2 className="lg:text-[28px] md:text-[28px] text-[20px] font-semibold">
            Hello
          </h2>
          <p className="text-grey">
            Here you can manage all your vaults and contributions
          </p>
        </div>
      </section>
      <Saver />
    </main>
  );
};

export default Dashboard;
