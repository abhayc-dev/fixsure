
import { getShopDetails } from "@/lib/actions";
import SettingsView from "@/components/dashboard/SettingsView";

export default async function SettingsPage() {
    const shop = await getShopDetails();
    return <SettingsView shop={shop as any} />;
}
