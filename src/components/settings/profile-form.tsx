
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Store, MapPin, User, Building2, Smartphone, ShieldCheck } from "lucide-react";
import { updateShopDetails } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Shop = {
    shopName: string;
    ownerName: string | null;
    address: string | null;
    city: string | null;
    phone: string;
}

export default function ProfileForm({ shop }: { shop: Shop }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        shopName: shop.shopName || "",
        ownerName: shop.ownerName || "",
        address: shop.address || "",
        city: shop.city || "",
        phone: shop.phone || ""
    });

    const hasChanges = 
        formData.shopName !== (shop.shopName || "") ||
        formData.ownerName !== (shop.ownerName || "") ||
        formData.address !== (shop.address || "") ||
        formData.city !== (shop.city || "") ||
        formData.phone !== (shop.phone || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    
    // Derived Avatar Initials
    const initials = (formData.ownerName || formData.shopName || "??").substring(0, 2).toUpperCase();

    const handleSubmit = async (submitData: FormData) => {
        setLoading(true);
        try {
            await updateShopDetails(submitData);
            alert("Profile updated successfully!");
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Something went wrong";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-8 max-w-4xl">
            
            {/* Header / Info */}
            <div className="bg-blue-50/50 p-4 rounded-lg flex items-start gap-4 border border-blue-100 mb-6">
                <div className="p-2 bg-white rounded-full shadow-sm">
                   <ShieldCheck className="w-5 h-5 text-blue-600" /> 
                </div>
                <div>
                    <h3 className="text-sm font-bold text-blue-900">Your Shop Profile</h3>
                    <p className="text-xs text-blue-700 mt-1">
                        These details are visible on every warranty and job sheet you create. Keep them up to date to build trust with your customers.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <Store className="w-4 h-4 text-primary" /> 
                        Shop Name
                    </label>
                    <input 
                        name="shopName" 
                        value={formData.shopName}
                        onChange={handleChange}
                        required 
                        minLength={3}
                        placeholder="e.g. A-1 Mobile Repair"
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                    />
                    <p className="text-xs text-slate-500 pl-1">This name will appear on the warranty certificate header.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Owner Name with Logo */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <User className="w-4 h-4 text-primary" /> 
                            Owner Name
                        </label>
                        <div className="flex gap-4">
                            {/* Owner Logo/Avatar */}
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg border border-orange-200 shadow-sm">
                                {initials}
                            </div>
                            <input 
                                name="ownerName" 
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="Your Name"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Owner Mobile */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Smartphone className="w-4 h-4 text-primary" /> 
                            Mobile Number
                        </label>
                        <div>
                            <input 
                                disabled
                                name="phone_display" 
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Owner's Mobile Number"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none cursor-not-allowed text-slate-500 shadow-inner"
                            />
                            <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                                This number is linked to your subscription and cannot be changed here.
                            </p>
                        </div>
                        <input type="hidden" name="phone" value={formData.phone} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-[-10px]">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <MapPin className="w-4 h-4 text-primary" /> 
                            Shop Address
                        </label>
                        <input 
                            name="address" 
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Shop No, Market, Area"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Building2 className="w-4 h-4 text-primary" /> 
                            City
                        </label>
                        <input 
                            name="city" 
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-start mb-[-6px]">
                <button 
                    type="submit" 
                    disabled={!hasChanges || loading}
                    className={cn(
                        "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all h-12 px-8 gap-2 shadow-sm",
                        !hasChanges || loading 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md"
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
