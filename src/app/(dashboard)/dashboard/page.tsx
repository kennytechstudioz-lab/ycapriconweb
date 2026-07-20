
import DashboardView from "@/components/dashboard/DashboardView";

export const metadata = {
  title: "Portfolio Overview | Dashboard",
  description: "Manage your portfolio overview | dashboard",
};


export default function DashboardPortfolioPage() {
  return <DashboardView tab="portfolio" />;
}
