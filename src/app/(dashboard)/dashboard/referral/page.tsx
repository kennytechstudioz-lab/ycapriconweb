
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ReferralTab } from "@/components/dashboard/ReferralTab";

export const metadata = {
  title: "Referral | Dashboard",
  description: "Manage your referral | dashboard",
};


export default function ReferralPage() {
  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 text-left relative min-h-screen">
      <DashboardHeader tab="referral" />
      <ReferralTab />
    </div>
  );
}
