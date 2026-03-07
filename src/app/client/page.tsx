import { getShopDetails } from "@/lib/actions";
import SubscriptionPage from "@/components/client-page";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const shop = await getShopDetails();
  
  return <SubscriptionPage shop={shop} />;
}
