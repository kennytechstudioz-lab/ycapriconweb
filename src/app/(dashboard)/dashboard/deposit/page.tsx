
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DepositTab } from "@/components/dashboard/DepositTab";

export const metadata = {
  title: "Deposit | Dashboard",
  description: "Manage your deposit | dashboard",
};


export default function DepositPage() {
  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 text-left relative min-h-screen">
      <DashboardHeader tab="deposit" />
      <DepositTab />
    </div>
  );
}
