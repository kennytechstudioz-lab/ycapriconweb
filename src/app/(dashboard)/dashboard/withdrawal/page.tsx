
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WithdrawalTab } from "@/components/dashboard/WithdrawalTab";

export const metadata = {
  title: "Withdrawal | Dashboard",
  description: "Manage your withdrawal | dashboard",
};


export default function WithdrawalPage() {
  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 text-left relative min-h-screen">
      <DashboardHeader tab="withdrawal" />
      <WithdrawalTab />
    </div>
  );
}
