
import { getShopDetails } from "@/lib/actions";
import CreateJobSheetForm from "@/components/dashboard/CreateJobSheetForm";

export default async function NewJobPage() {
    const shop = await getShopDetails();

    return (
        <div className="flex justify-center pb-20">
            <CreateJobSheetForm shopCategory={(shop as any).category} />
        </div>
    );
}
