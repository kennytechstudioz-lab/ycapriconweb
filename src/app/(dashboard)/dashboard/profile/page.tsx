
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileTab } from "@/components/dashboard/ProfileTab";

export const metadata = {
  title: "Profile | Dashboard",
  description: "Manage your profile | dashboard",
};


export default function ProfilePage() {
  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 text-left relative min-h-screen">
      <DashboardHeader tab="profile" />
      <ProfileTab />
    </div>
  );
}
