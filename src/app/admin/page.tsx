
import { getAdminStats, getAllShops, getCurrentShop, getAdminJobSheets } from "@/lib/actions";
import AdminDashboard from "@/components/admin-dashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Portal | FixSure",
};

export default async function AdminPage() {
  const shop = await getCurrentShop();

  if ((shop as any).role !== "ADMIN") {
    redirect("/jobs");
  }

  const stats = await getAdminStats();
  const shops = await getAllShops();
  const jobs = await getAdminJobSheets();

  return (
    <div className="min-h-screen">
      <AdminDashboard stats={stats} initialShops={shops} initialJobs={jobs} />
    </div>
  );
}
