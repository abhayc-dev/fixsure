
import { getWarrantyById } from "@/lib/actions";
import WarrantyDetailsView from "@/components/warranty-details-view";
import { notFound } from "next/navigation";

export default async function WarrantyDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const warranty = await getWarrantyById(id);

    if (!warranty) {
        notFound();
    }

    return <WarrantyDetailsView warranty={warranty} />;
}
