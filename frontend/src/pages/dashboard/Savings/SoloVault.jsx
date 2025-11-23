import React from "react";
import { DashNav } from "../../../components/shared/Reuse";
import HistoryCard from "../../../components/dashboard/HistoryCard";
import VaultCard from "../../../components/dashboard/VaultCard";
import ProgressPie from "../../../components/dashboard/ProgressPie";
import { RxDotFilled } from "react-icons/rx";
import WithdrawCard from "../../../components/dashboard/WithdrawCard";
import HistoryChart from "../../../components/dashboard/HistoryChart";

const SoloVault = () => {
  const percentage = 0;

  return (
    <div>
      <DashNav>Solo Vault</DashNav>
      <section className="flex justify-between my-8 lg:px-8 md:px-8 px-4 items-center flex-col lg:flex-row md:flex-row">
        <div className="mb-3">
          <h2 className="lg:text-[28px] md:text-[28px] text-[20px] font-[600]">
            Hello
          </h2>
          <p>Here you can manage all Solo Vaults</p>
        </div>
      </section>
      <section className="flex justify-between my-8 lg:px-8 md:px-8 px-4 items-center flex-col lg:flex-row md:flex-row">
        <div className="lg:w-[49%] md:w-[49%] w-[100%] mb-auto">
            <div className="rounded-xl bg-white px-4 py-8 ">
          <p className="font-[600] mb-4 text-[18px]">
            Ongoing 
            <span className="text-[12px] font-[500] text-primary ml-2">
              (Solo Vault)
            </span>
          </p>
          <HistoryCard />
          </div>
          <div className="my-4 bg-white rounded-xl p-4">
          <HistoryChart />
          </div>
        </div>
        <div className="lg:w-[49%] md:w-[49%] w-[100%] mb-auto">
          <div className="flex justify-between flex-col lg:flex-row md:flex-row">
            <VaultCard />
            <div className="bg-white lg:w-[48%] md:w-[48%] w-[100%] rounded-lg p-6 shadow-xl mb-3">
            <ProgressPie percentage={percentage} />
            <p className="font-semibold text-[14px] my-2">Overall Solo Vault</p>
            <p className="flex items-center text-[12px]"><RxDotFilled className="text-primary text-xl mr-3"/> 0% goal met</p>
            <p className="flex items-center text-[12px]"><RxDotFilled className="text-lightgray text-xl mr-3"/> 0% goal left to be met</p>
            </div>
          </div>
          <div className="bg-white rounded-lg py-8 px-4 my-4">
          <p className="font-semibold mb-4 text-[18px]">
          All completed vaults
            <span className="text-[12px] font-medium text-primary">
              (Solo Vault)
            </span>
          </p>
          <WithdrawCard />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SoloVault;

