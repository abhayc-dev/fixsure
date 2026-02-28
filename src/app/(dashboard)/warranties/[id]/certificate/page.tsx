
import { getWarrantyById, getShopDetails } from "@/lib/actions";
import WarrantyCardView from "@/components/warranty-card-view";
import { notFound } from "next/navigation";

export default async function WarrantyCertificatePage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const [warranty, shop] = await Promise.all([
        getWarrantyById(id),
        getShopDetails()
    ]);

    if (!warranty) {
        notFound();
    }

    return <WarrantyCardView warranty={warranty} shop={shop} />;
}
