
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ActiveDepositsTab } from "@/components/dashboard/ActiveDepositsTab";

export const metadata = {
  title: "Active deposit | Dashboard",
  description: "Manage your active deposit | dashboard",
};


export default function ActiveDepositPage() {
  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 text-left relative min-h-screen">
      <DashboardHeader tab="active-deposit" />
      <ActiveDepositsTab />
    </div>
  );
}
