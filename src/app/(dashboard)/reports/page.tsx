
import { getStats } from "@/lib/actions";
import ReportsView from "@/components/dashboard/ReportsView";

export default async function ReportsPage() {
    const stats = await getStats();
    return <ReportsView stats={stats} />;
}
