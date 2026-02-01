
import { getWarrantyById } from "@/lib/actions";
import { ArrowLeft, MessageSquare, Phone, Smartphone, Wrench, Calendar, FileText, MapPin, IndianRupee } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";


export default async function WarrantyDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const warranty = await getWarrantyById(resolvedParams.id);

    if (!warranty) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{warranty.customerName}</h1>
                                <a href={`tel:+91${warranty.customerPhone}`} className="text-primary hover:underline flex items-center gap-2 mt-1 font-medium">
                                    <Phone className="w-3.5 h-3.5" /> {warranty.customerPhone}
                                </a>
                                {warranty.customerAddress && (
                                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> {warranty.customerAddress}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground font-mono bg-background px-2 py-1 rounded border border-border inline-block">
                                    {warranty.shortCode}
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    Issued: {new Date(warranty.issuedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Device Info */}
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground border-b border-border pb-2 mb-2">Device Details</h2>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Smartphone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Model</div>
                                        <div className="font-medium">{warranty.deviceModel}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Wrench className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Repair Type</div>
                                        <div className="font-medium">{warranty.repairType}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <IndianRupee className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Repair Cost</div>
                                        <div className="font-medium">₹{warranty.repairCost}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Info */}
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground border-b border-border pb-2 mb-2">Warranty Status</h2>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Valid Till</div>
                                        <div className="font-medium">{new Date(warranty.expiresAt).toLocaleDateString()}</div>
                                        <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${warranty.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                            {warranty.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Private Note Section Display Only */}
                        {warranty.privateNote && (
                            <div className="mt-8 pt-6 border-t border-border">
                                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Internal Repair Note
                                </h2>
                                <div className="p-4 bg-muted/30 rounded-lg text-sm text-slate-600 italic">
                                    {warranty.privateNote}
                                </div>
                            </div>
                        )}

                        {/* Public Link */}
                        <div className="mt-8 pt-6 border-t border-border flex justify-center">
                            <Link href={`/verify/${warranty.shortCode}`} target="_blank" className="flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                                <FileText className="w-4 h-4" /> View Public Certificate
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
