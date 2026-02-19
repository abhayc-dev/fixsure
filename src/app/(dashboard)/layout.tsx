import { getShopDetails, getStats } from "@/lib/actions";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";

export default async function DashboardLayout({
    children,
    shop: initialShop // assuming passed but not used? wait, previous code didn't take shop prop
}: {
    children: React.ReactNode;
    shop?: any;
}) {
    const [shop, stats] = await Promise.all([
        getShopDetails(),
        getStats()
    ]);

    const isPlanActive = stats.subscription === 'ACTIVE' || stats.subscription === 'FREE_TRIAL';

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-[#F8FAFC]">
                <Sidebar shop={shop} stats={stats} isPlanActive={isPlanActive} />

                <main className="flex-1 overflow-auto flex flex-col relative w-full">
                    {/* Header Overlay Gradient (desktop only) */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-0" />

                    <Header isPlanActive={isPlanActive} stats={stats} />

                    <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8 relative z-0">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
