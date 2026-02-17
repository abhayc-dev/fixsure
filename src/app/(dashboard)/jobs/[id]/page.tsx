
import { getJobSheetById, getShopDetails } from "@/lib/actions";
import JobManager from "@/components/JobManager";
import { notFound } from "next/navigation";

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const [job, shop] = await Promise.all([
        getJobSheetById(id),
        getShopDetails()
    ]);

    if (!job) {
        notFound();
    }

    return <JobManager job={job} shop={shop} />;
}
