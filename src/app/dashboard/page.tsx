import { getStats, getWarranties, getJobSheets, getShopDetails } from "@/lib/actions";
import DashboardClient from "@/components/RepWarr-dashboard";

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh data

export default async function DashboardPage() {
  const [warranties, jobSheets, stats, shop] = await Promise.all([
    getWarranties(),
    getJobSheets(),
    getStats(),
    getShopDetails()
  ]);
  // console.log("Dashboard Stats:", JSON.stringify(stats, null, 2));

  // Convert Date objects to strings if needed for client component prop serialization 
  // (Server Actions return Date objects fine, but Client Component props need to be serializable. 
  // Next.js automatic serialization works for Date in modern versions, but better safe if we encounter issues. 
  // Let's rely on default behavior first.)
  
  return (
    <DashboardClient 
        initialWarranties={warranties} 
        initialJobSheets={jobSheets}
        stats={stats}
        shop={shop}
    />
  );
}
