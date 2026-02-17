"use client";

import { ShieldCheck, Lock } from "lucide-react";
import ProfileForm from "../settings/profile-form";
import SecurityForm from "../settings/security-form";
import WorkerManagement from "../settings/WorkerManagement";

type Shop = {
    id: string;
    shopName: string | null;
    ownerName: string | null;
    address: string | null;
    city: string | null;
    phone: string;
    accessPin: string | null;
    companyLogoUrl: string | null;
    gstNumber?: string | null;
    signatureUrl?: string | null;
}

export default function SettingsView({ shop }: { shop: Shop }) {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Shop Profile - Full Width */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Shop Profile</h2>
                        <p className="text-sm text-slate-400">Visible on customer receipts</p>
                    </div>
                </div>
                <div className="pt-2 text-black">
                    <ProfileForm shop={shop} />
                </div>
            </div>

            {/* Security & Workers - Side by Side on Large Screens */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Security */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 h-fit">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Security Access</h2>
                            <p className="text-sm text-slate-400">Control sensitive data visibility</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <SecurityForm hasPin={!!shop.accessPin} />
                    </div>
                </div>

                {/* Workers Management */}
                <WorkerManagement shopId={shop.id} />
            </div>
        </div>
    );
}
