
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

export const metadata = {
  title: "Settings | Dashboard",
  description: "Manage your settings | dashboard",
};


export default function SettingsPage() {
  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 text-left relative min-h-screen">
      <DashboardHeader tab="settings" />
      <SettingsTab />
    </div>
  );
}
