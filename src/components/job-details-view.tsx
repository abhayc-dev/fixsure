import { ArrowLeft, Calendar, Smartphone, User, Receipt, Printer, MapPin, Wrench, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type JobSheet = {
    id: string;
    jobId: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    deviceType?: string | null;
    deviceModel: string;
    problemDesc: string;
    accessories?: string | null;
    status: string;
    receivedAt: Date;
    expectedAt: Date | null;
    estimatedCost: number | null;
    advanceAmount?: number | null;
};

export default function JobDetailsView({ job, onBack }: { job: JobSheet, onBack: () => void }) {
    
    // Calculate Balance
    const total = job.estimatedCost || 0;
    const advance = job.advanceAmount || 0;
    const balance = total - advance;

    const ticketRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        if (!ticketRef.current) return;
        setDownloading(true);

        try {
            // Use html2canvas for better compatibility
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2, // Higher resolution
                useCORS: true, // Handle cross-origin images if any
                backgroundColor: '#ffffff', // Ensure white background
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            
            // PDF Setup
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Fit to Single Page Logic
            let renderWidth = pdfWidth;
            let renderHeight = pdfHeight;
            
            // If image is taller than page, scale to fit height
            if (pdfHeight > pageHeight) {
                renderHeight = pageHeight;
                renderWidth = (imgProps.width * pageHeight) / imgProps.height;
            }

            // Center horizontally if scaled
            const xOffset = (pdfWidth - renderWidth) / 2;
            
            // Add image to PDF (Fit to Page)
            pdf.addImage(imgData, 'PNG', xOffset, 0, renderWidth, renderHeight);
            
            // Save
            pdf.save(`JobSheet_${job.jobId || 'Draft'}.pdf`);

        } catch (error) {
            console.error("PDF Generation Failed:", error);
            // Fallback to system print if JS generation fails
            alert("Switching to system print...");
            window.print();
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-ticket, .printable-ticket * {
                        visibility: visible;
                    }
                    .printable-ticket {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                    }
                    /* Force single page check */
                    .break-inside-avoid {
                        page-break-inside: avoid;
                    }
                    @page {
                        margin: 5mm;
                        size: A4 portrait;
                    }
                }
            `}</style>

            <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-6">
                
                {/* Top Action Bar - Hidden in Print */}
                <div className="flex items-center justify-between print:hidden">
                    <button 
                        onClick={onBack}
                        className="group flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
                        Back to Job Sheets
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
                        {downloading ? "Generating PDF..." : "Download / Print"}
                    </button>
                </div>

                {/* Main Ticket Card - Printable Target */}
                <div ref={ticketRef} className="printable-ticket bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:rounded-none print:shadow-none print:border-none">
                    
                    {/* Header Banner */}
                    <div className="bg-slate-50 border-b border-slate-100 p-8 print:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 print:gap-4 print:bg-white print:border-b-2 print:border-black">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-primary print:border-black print:text-black">
                                <Wrench className="h-8 w-8" />
                            </div>
                            <div>
                                 <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-800 print:text-black">Job Sheet {job.jobId}</h1>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border print:border-black print:text-black print:bg-transparent",
                                        job.status === 'RECEIVED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                        job.status === 'READY' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                        job.status === 'DELIVERED' ? "bg-slate-100 text-slate-600 border-slate-200" :
                                        "bg-orange-50 text-orange-700 border-orange-200"
                                    )}>
                                        {job.status}
                                    </span>
                                 </div>
                                 <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm print:text-gray-600">
                                    <Calendar className="h-3.5 w-3.5" /> 
                                    Received on {new Date(job.receivedAt).toLocaleDateString()} at {new Date(job.receivedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 print:p-5 grid grid-cols-1 lg:grid-cols-3 gap-10 print:gap-6 print:grid-cols-2">
                        
                        {/* Left Column: Customer & Device (Span 2) */}
                        <div className="lg:col-span-2 space-y-10 print:space-y-6 print:col-span-2">
                            
                            {/* Customer Section */}
                            <section className="break-inside-avoid">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black print:font-extrabold print:border-b print:border-black print:pb-1 print:mb-2">
                                    <User className="h-4 w-4" /> Customer Information
                                </h3>
                                <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 print:bg-white print:border-slate-300 print:p-4 print:gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide print:text-black">Name</label>
                                        <div className="text-lg font-bold text-slate-800 mt-1 print:text-black">{job.customerName}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide print:text-black">Mobile</label>
                                        <div className="text-lg font-bold text-slate-800 mt-1 print:text-black">{job.customerPhone}</div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1 print:text-black">
                                            <MapPin className="h-3 w-3" /> Address
                                        </label>
                                        <div className="text-base font-medium text-slate-700 mt-1 print:text-black">
                                            {job.customerAddress || <span className="text-slate-400 italic">No address provided</span>}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Device Section */}
                            <section className="break-inside-avoid">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black print:font-extrabold print:border-b print:border-black print:pb-1 print:mb-2">
                                    <Smartphone className="h-4 w-4" /> Device Details
                                </h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 print:divide-slate-300">
                                        <div className="p-5 print:p-4">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide print:text-black">Device</label>
                                            <div className="text-base font-bold text-slate-800 mt-1 print:text-black">
                                                {job.deviceType || "Device"} - {job.deviceModel}
                                            </div>
                                        </div>
                                        <div className="p-5 print:p-4">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide print:text-black">Accessories</label>
                                            <div className="text-base font-medium text-slate-800 mt-1 print:text-black">
                                                {job.accessories || <span className="text-slate-400 italic">None</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 p-5 bg-orange-50/30 print:bg-transparent print:border-slate-300 print:p-4">
                                        <label className="text-xs font-bold text-orange-800/70 uppercase tracking-wide print:text-black">Reported Problem</label>
                                        <p className="text-base font-medium text-slate-800 mt-2 leading-relaxed print:text-black">
                                            {job.problemDesc}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Payment & Dates (Span 1) */}
                        <div className="space-y-8 print:space-y-6 print:col-span-2 print:grid print:grid-cols-2 print:gap-6 break-inside-avoid">
                            
                            {/* Financial Card */}
                            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200 print:bg-white print:text-black print:border print:border-black print:shadow-none print:rounded-xl">
                                 <div className="flex items-center gap-2 mb-6 opacity-80 print:opacity-100 print:border-b print:border-black print:pb-2 print:mb-4">
                                     <Receipt className="h-5 w-5" />
                                     <span className="text-sm font-bold uppercase tracking-wider">Estimated Cost</span>
                                 </div>
                                 
                                 <div className="space-y-4">
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-400 print:text-gray-600">Total Estimate</span>
                                         <span className="font-medium">₹{total.toLocaleString()}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4 print:border-gray-200">
                                         <span className="text-slate-400 print:text-gray-600">Advance Paid</span>
                                         <span className="font-medium text-green-400 print:text-black">- ₹{advance.toLocaleString()}</span>
                                     </div>
                                     <div className="flex justify-between items-end pt-2">
                                         <span className="text-sm font-bold text-slate-300 print:text-black">Balance Due</span>
                                         <span className="text-3xl font-bold print:text-2xl">₹{balance.toLocaleString()}</span>
                                     </div>
                                 </div>
                            </div>

                            {/* Dates Card */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 print:border-slate-300 print:rounded-xl">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 print:text-black print:font-extrabold print:border-b print:border-black print:pb-1">Timelines</h3>
                                
                                <div className="space-y-6 print:space-y-4">
                                    <div className="relative pl-6 border-l-2 border-slate-100 print:border-slate-300">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 print:bg-black"></div>
                                        <label className="text-xs font-semibold text-slate-500 print:text-black">Received On</label>
                                        <div className="text-sm font-bold text-slate-800 print:text-black">
                                            {new Date(job.receivedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="relative pl-6 border-l-2 border-primary/30 print:border-black">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse print:bg-black print:animate-none"></div>
                                        <label className="text-xs font-semibold text-primary print:text-black">Est. Delivery</label>
                                        <div className="text-sm font-bold text-slate-800 print:text-black">
                                            {job.expectedAt ? new Date(job.expectedAt).toLocaleDateString() : 'Not Set'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
