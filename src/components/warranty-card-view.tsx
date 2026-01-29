import { ArrowLeft, CheckCircle, Calendar, Smartphone, User, ShieldCheck, Printer, AlertCircle, Loader2, MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";


// Define Warranty Type matching the DashboardClient one
type Warranty = {
    id: string;
    shortCode: string;
    customerName: string;
    customerPhone: string;
    deviceModel: string;
    repairType: string;
    repairCost: number | null;
    durationDays: number;
    issuedAt: Date;
    expiresAt: Date;
    status: string;
};

type Shop = {
    shopName: string;
    address: string | null;
    phone: string;
}

export default function WarrantyCardView({ warranty, shop, onBack }: { warranty: Warranty, shop: Shop, onBack: () => void }) {

    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        if (!cardRef.current) return;
        setDownloading(true);

        try {
            // High-quality capture (Scale 3 for sharp text)
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');

            // Standard A4 Landscape Certificate
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate scale to fit width exactly
            const ratio = pdfWidth / imgProps.width;
            const scaledHeight = imgProps.height * ratio;

            // If height exceeds page (rare in landscape A4 for this design), fit by height instead
            let finalWidth = pdfWidth;
            let finalHeight = scaledHeight;

            if (scaledHeight > pdfHeight) {
                const hRatio = pdfHeight / imgProps.height;
                finalWidth = imgProps.width * hRatio;
                finalHeight = pdfHeight;
            }

            // Center content
            const xOffset = (pdfWidth - finalWidth) / 2;
            const yOffset = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

            pdf.save(`Warranty_${warranty.shortCode}.pdf`);

        } catch (error) {
            console.error("PDF Failed:", error);
            alert("Switching to system print...");
            window.print();
        } finally {
            setDownloading(false);
        }
    };

    const isActive = warranty.status === 'ACTIVE';
    // Verification URL (Example structure)
    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify/${warranty.shortCode}`
        : `https://fixsure.app/verify/${warranty.shortCode}`;

    return (
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    body * { visibility: hidden; }
                    .printable-card, .printable-card * { visibility: visible; }
                    .printable-card {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white;
                        z-index: 9999;
                    }
                    .print-content-wrapper {
                         transform: scale(0.9); /* Slight scale down to ensure margins safe zone */
                         width: 100%;
                         max-width: 297mm;
                    }
                }
            `}</style>

            <div className="w-full max-w-6xl mx-auto space-y-6 mt-4">
                {/* Header Actions */}
                <div className="flex items-center justify-between print:hidden mb-1">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Warranties
                    </button>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                        className={cn(
                            "flex items-center gap-2 bg-slate-900 text-white shadow-lg rounded-full px-5 py-2.5 text-sm font-bold hover:bg-slate-800 hover:shadow-xl transition-all active:scale-[0.98]",
                            downloading && "opacity-75 cursor-wait"
                        )}
                    >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        {downloading ? "Generating Certificate..." : "Download Certificate"}
                    </button>
                </div>

                {/* THE CERTIFICATE */}
                <div ref={cardRef} className="printable-card bg-white p-2 md:p-4 text-slate-900 mx-auto">
                    <div className="print-content-wrapper relative bg-white border-[12px] border-double border-slate-200 p-8 md:p-12 shadow-2xl max-w-[1100px] mx-auto aspect-[1.414/1] flex flex-col justify-between">

                        {/* Watermark Background */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                            <ShieldCheck className="h-96 w-96 text-slate-900" style={{ opacity: 0.1 }} />
                        </div>

                        {/* Header */}
                        <div className="relative z-10 flex justify-between items-start border-b-2 border-slate-900 pb-6">
                            <div className="flex items-center gap-4">
                                {/* Shop Logo Placeholder - Force Background for PDF */}
                                <div
                                    className="h-20 w-20 rounded-lg flex items-center justify-center shadow-lg"
                                    style={{
                                        backgroundColor: '#0f172a',
                                        color: 'white',
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    }}
                                >
                                    <ShieldCheck className="h-10 w-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tight leading-none mb-1">
                                        {shop.shopName || "Repair Center"}
                                    </h1>
                                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-4">
                                        {shop.phone && <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> {shop.phone}</span>}
                                        {shop.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {shop.address}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Document Type</div>
                                <h2 className="text-2xl font-serif font-bold text-slate-800">Warranty Certificate</h2>
                            </div>
                        </div>

                        {/* Main Content Body */}
                        <div className="relative z-10 flex-1 py-10 grid grid-cols-12 gap-8">

                            {/* Left: Verification & Status */}
                            <div className="col-span-3 border-r border-slate-200 pr-8 flex flex-col justify-between h-full">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Verification</div>
                                    <div className="bg-white p-2 border border-slate-200 rounded-lg w-fit mx-auto shadow-sm">
                                        <QRCodeSVG value={verificationUrl} size={100} fgColor="#0f172a" />
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 mt-2 leading-tight">
                                        Scan to verify validity & details
                                    </p>
                                </div>

                                <div className="mt-8 text-center">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</div>
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                                        isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                                    )}>
                                        {warranty.status}
                                    </span>
                                </div>
                            </div>

                            {/* Center: Details */}
                            <div className="col-span-9 pl-4">
                                <div className="grid grid-cols-2 gap-x-12 gap-y-10">

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</label>
                                        <div className="flex items-baseline justify-between border-b border-slate-300 pb-2">
                                            <span className="text-xl font-bold text-slate-900">{warranty.customerName}</span>
                                            <span className="text-sm font-medium text-slate-600">{warranty.customerPhone}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Device Model</label>
                                        <div className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                                            {warranty.deviceModel}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Service Type</label>
                                        <div className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                                            {warranty.repairType} Repair
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Certificate ID</label>
                                        <div className="font-mono text-lg font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded inline-block">
                                            {warranty.shortCode}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Validity Period</label>
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                            <span className="text-slate-500 font-normal">{new Date(warranty.issuedAt).toLocaleDateString()}</span>
                                            <span className="text-slate-300">to</span>
                                            <span className="text-emerald-700">{new Date(warranty.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                            ({warranty.durationDays} Days Warranty)
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-500 leading-relaxed text-justify">
                                            This certificate warrants that the device specified above has been repaired using quality parts.
                                            Warranty covers manufacturing defects in replaced parts only.
                                            <span className="font-bold text-slate-700"> Physical damage, water damage, or unauthorized tampering voids this warranty.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 border-t-2 border-slate-900 pt-6 flex justify-between items-end">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Authorized Signature</div>
                                <div className="font-serif text-2xl text-slate-800 font-bold select-none italic">
                                    {shop.shopName || "FixSure"}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Powered by FixSure</div>
                                <div className="text-[9px] text-slate-300 mt-1">{new Date().getFullYear()} © Digital Warranty Record</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
