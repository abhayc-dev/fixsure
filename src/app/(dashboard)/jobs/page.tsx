
import { getJobSheets, getShopDetails } from "@/lib/actions";
import JobListView from "@/components/dashboard/JobListView";

export default async function JobsPage() {
    const [jobSheets, shop] = await Promise.all([
        getJobSheets(),
        getShopDetails()
    ]);

    return <JobListView initialJobSheets={jobSheets} shop={shop} />;
}
