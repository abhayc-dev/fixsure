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
    technicalDetails?: Record<string, any> | null;
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
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight();

            let renderWidth = pdfWidth;
            let renderHeight = pdfHeight;
            
            if (pdfHeight > pageHeight) {
                renderHeight = pageHeight;
                renderWidth = (imgProps.width * pageHeight) / imgProps.height;
            }

            const xOffset = (pdfWidth - renderWidth) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, 0, renderWidth, renderHeight);
            pdf.save(`JobSheet_${job.jobId || 'Draft'}.pdf`);

        } catch (error) {
            console.error("PDF Generation Failed:", error);
            alert("Switching to system print...");
            window.print();
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="w-full h-full bg-white flex flex-col items-center p-8 overflow-y-auto">
             {/* Back Actions */}
             <div className="w-full max-w-[800px] flex justify-start mb-6 print:hidden">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Jobs
                </button>
            </div>

            {/* THE INVOICE SHEET */}
            <div ref={ticketRef} className="w-full max-w-[800px] bg-white p-8 border border-slate-200 shadow-sm print:shadow-none print:border-none text-black">
                
                {/* 1. Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-normal text-slate-800 mb-2">Best Service & Repairing</h1>
                    <div className="text-slate-600 text-sm mb-1">Agra</div>
                    <div className="text-slate-600 text-sm">Phone: 8876798779</div>
                </div>

                <div className="border-t border-slate-200 my-6"></div>

                {/* 2. Title */}
                <h2 className="text-2xl font-bold text-center uppercase mb-8 tracking-wide">REPAIR INVOICE / JOB SHEET</h2>

                {/* 3. Details Columns */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Customer Details */}
                    <div>
                        <h3 className="font-bold text-sm uppercase mb-3 text-slate-500">CUSTOMER DETAILS:</h3>
                        <div className="text-sm font-bold text-black mb-1 text-lg">{job.customerName}</div>
                        <div className="text-sm text-slate-800 mb-1 font-medium italic">Phone: {job.customerPhone}</div>
                        <div className="text-sm text-slate-600">Addr: {job.customerAddress || 'N/A'}</div>
                    </div>

                    {/* Job Details */}
                    <div>
                        <h3 className="font-bold text-sm uppercase mb-3 text-slate-500">JOB DETAILS:</h3>
                        <div className="text-sm text-slate-800 mb-1"><span className="font-bold">Job ID:</span> # {job.jobId}</div>
                        <div className="text-sm text-slate-800 mb-1"><span className="font-bold">Received:</span> {new Date(job.receivedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-800"><span className="font-bold">Delivery:</span> {job.expectedAt ? new Date(job.expectedAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>

                {/* 4. Device Details / Motor Specs */}
                <div className="mb-0 border border-slate-900 overflow-hidden rounded-sm">
                    <div className="bg-slate-900 text-white p-2 font-bold text-xs uppercase text-center tracking-widest">
                        Device Specification
                    </div>
                    <div className="p-0">
                         <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-b border-slate-200">
                             <div className="p-3 bg-slate-50">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Equipment / Motor Type</label>
                                 <div className="text-sm font-bold">{job.deviceType || '-'}</div>
                             </div>
                             <div className="p-3 bg-white">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Model / Serial No.</label>
                                 <div className="text-sm font-bold">{job.deviceModel || '-'}</div>
                             </div>
                         </div>
                         
                         {job.technicalDetails?.motor && (
                             <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                                <div className="p-3 bg-white">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Motor Power</label>
                                    <div className="text-sm font-bold">{job.technicalDetails.motor.power} {job.technicalDetails.motor.power_unit}</div>
                                </div>
                                <div className="p-3 bg-slate-50">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phase</label>
                                    <div className="text-sm font-bold">{job.technicalDetails.motor.phase} phase</div>
                                </div>
                             </div>
                         )}

                         <div className="p-4">
                             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Issue / Problem Reported</label>
                             <div className="text-sm text-slate-800 leading-relaxed font-medium">
                                 {job.problemDesc}
                             </div>
                         </div>
                    </div>
                </div>

                {/* 5. Financials */}
                <div className="flex flex-col items-end gap-3 mt-10">
                    <div className="w-1/2 flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Estimated Price</span>
                        <span className="font-bold">Rs. {total}</span>
                    </div>
                    <div className="w-1/2 flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                        <span className="font-bold text-emerald-600 uppercase text-[10px]">Advance Paid</span>
                        <span className="font-bold text-emerald-600">Rs. {advance}</span>
                    </div>
                    <div className="w-1/2 flex justify-between text-xl mt-2 p-3 bg-slate-900 text-white rounded-lg">
                        <span className="font-bold uppercase text-xs flex items-center">Balance Due</span>
                        <span className="font-black">Rs. {balance}</span>
                    </div>
                </div>

                {/* 6. Footer Signature */}
                <div className="mt-20 flex justify-between items-end">
                    <div className="text-[10px] text-slate-400 font-medium">
                        * This is a computer generated document.<br/>
                        * Please bring this sheet at the time of delivery.
                    </div>
                    <div className="text-center">
                         <div className="w-40 border-b border-slate-900 mb-2"></div>
                         <div className="text-[10px] font-bold uppercase tracking-widest">Authorized Signatory</div>
                    </div>
                </div>

            </div>

            {/* Print/Download Button */}
            <div className="w-full max-w-[800px] flex justify-end mt-6 print:hidden">
                <button 
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                    disabled={downloading}
                >
                    {downloading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                        </>
                    ) : (
                        <>
                            <Printer className="h-5 w-5" /> Download / Print Invoice
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
