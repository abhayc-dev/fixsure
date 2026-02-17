
import { getWarranties, getStats } from "@/lib/actions";
import WarrantyListView from "@/components/dashboard/WarrantyListView";

export default async function WarrantiesPage() {
    const [warranties, stats] = await Promise.all([
        getWarranties(),
        getStats()
    ]);

    return <WarrantyListView initialWarranties={warranties} stats={stats} />;
}
