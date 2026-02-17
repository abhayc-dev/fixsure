
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Store, MapPin, User, Building2, Smartphone, ShieldCheck, FileText } from "lucide-react";
import { updateShopDetails } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Shop = {
    shopName: string | null;
    ownerName: string | null;
    address: string | null;
    city: string | null;
    phone: string;
    companyLogoUrl: string | null;
    gstNumber?: string | null;
    signatureUrl?: string | null;
}

export default function ProfileForm({ shop }: { shop: Shop }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        shopName: shop.shopName || "",
        ownerName: shop.ownerName || "",
        address: shop.address || "",
        city: shop.city || "",
        phone: shop.phone || "",
        companyLogoUrl: shop.companyLogoUrl || "",
        gstNumber: shop.gstNumber || "",
        signatureUrl: shop.signatureUrl || ""
    });

    const hasChanges =
        formData.shopName !== (shop.shopName || "") ||
        formData.ownerName !== (shop.ownerName || "") ||
        formData.address !== (shop.address || "") ||
        formData.city !== (shop.city || "") ||
        formData.phone !== (shop.phone || "") ||
        formData.companyLogoUrl !== (shop.companyLogoUrl || "") ||
        formData.gstNumber !== (shop.gstNumber || "") ||
        formData.signatureUrl !== (shop.signatureUrl || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        // Clear error when user types
        if (e.target.name === 'gstNumber' || e.target.name === 'signatureUrl') setError(null);
    };

    // Derived Avatar Initials
    const initials = (formData.ownerName || formData.shopName || "??").substring(0, 2).toUpperCase();

    const validateGST = (gst: string) => {
        if (!gst) return true; // Optional
        // Regex for GST (15 chars, specific pattern)
        // 22AAAAA0000A1Z5
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst);
    };

    const validateSignatureUrl = (url: string) => {
        if (!url) return true; // Optional
        // Check if it's a valid URL format
        try {
            new URL(url);
        } catch {
            return false;
        }
        // Check if it has a valid image extension
        const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
        const lowerUrl = url.toLowerCase();
        return validExtensions.some(ext => lowerUrl.includes(ext));
    };

    const handleSubmit = async (submitData: FormData) => {
        setLoading(true);
        setError(null);

        const gst = submitData.get('gstNumber') as string;
        if (gst && !validateGST(gst)) {
            setError("Invalid GST Number format. Example: 22AAAAA0000A1Z5");
            setLoading(false);
            return;
        }

        const signatureUrl = submitData.get('signatureUrl') as string;
        if (signatureUrl && !validateSignatureUrl(signatureUrl)) {
            setError("Invalid Signature URL. Please provide a valid image URL (PNG, JPG, JPEG, or WEBP)");
            setLoading(false);
            return;
        }

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
                        placeholder="e.g. A-1 Mobile Repair"
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                    />
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
                        </div>
                        <input type="hidden" name="phone" value={formData.phone} />
                    </div>
                </div>

                {/* GST Number */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <Building2 className="w-4 h-4 text-primary" />
                        GST Number
                    </label>
                    <input
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        maxLength={15}
                        className={cn(
                            "flex h-12 w-full rounded-xl border bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
                            error ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : "border-slate-200"
                        )}
                    />
                    {error && <p className="text-xs text-red-500 pl-1 font-bold">{error}</p>}
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

                {/* Company Logo Section - Improved UI */}
                <div className="pt-8">
                    <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 mb-4">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Company Logo
                    </label>
                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row gap-6 items-start hover:border-slate-200 transition-colors">

                        {/* Logo Preview Area */}
                        <div className="shrink-0 relative group">
                            <div className={cn(
                                "h-24 w-24 rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-white shadow-sm transition-all",
                                formData.companyLogoUrl ? "border-slate-100" : "border-dashed border-slate-200"
                            )}>
                                {formData.companyLogoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={formData.companyLogoUrl}
                                        alt="Logo Preview"
                                        className="h-full w-full object-contain p-2"
                                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-slate-300">
                                        <Store className="h-8 w-8" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">No Logo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo Image URL</label>
                            <div className="relative">
                                <input
                                    name="companyLogoUrl"
                                    value={formData.companyLogoUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://example.com/branding/logo.png"
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signature Section - Improved UI */}
                <div className="pt-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 mb-4">
                        <FileText className="w-4 h-4 text-primary" />
                        Signature
                    </label>
                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row gap-6 items-start hover:border-slate-200 transition-colors">

                        {/* Signature Preview Area */}
                        <div className="shrink-0 relative group">
                            <div className={cn(
                                "h-24 w-32 rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-white shadow-sm transition-all",
                                formData.signatureUrl ? "border-slate-100" : "border-dashed border-slate-200"
                            )}>
                                {formData.signatureUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={formData.signatureUrl}
                                        alt="Signature Preview"
                                        className="h-full w-full object-contain p-2"
                                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-slate-300">
                                        <FileText className="h-8 w-8" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">No Sign</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Signature Image URL</label>
                            <div className="relative">
                                <input
                                    name="signatureUrl"
                                    value={formData.signatureUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://example.com/signature.png"
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                />
                            </div>
                        </div>
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
        </form >
    );
}
