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
                        <h3 className="font-bold text-sm uppercase mb-3">CUSTOMER DETAILS:</h3>
                        <div className="text-sm font-bold text-black mb-1 text-lg">{job.customerName}</div>
                        <div className="text-sm text-slate-800 mb-1">Phone: {job.customerPhone}</div>
                        <div className="text-sm text-slate-800">Addr: {job.customerAddress || 'N/A'}</div>
                    </div>

                    {/* Job Details */}
                    <div>
                        <h3 className="font-bold text-sm uppercase mb-3">JOB DETAILS:</h3>
                        <div className="text-sm text-slate-800 mb-1"><span className="font-bold">Job ID:</span> {job.jobId}</div>
                        <div className="text-sm text-slate-800 mb-1"><span className="font-bold">Date:</span> {new Date(job.receivedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-800"><span className="font-bold">Status:</span> {job.status}</div>
                    </div>
                </div>

                {/* 4. Device Table */}
                <div className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#444] text-white print:bg-[#444] print:text-white">
                                <th className="p-3 text-left border border-slate-300 font-bold text-sm w-1/4">Device</th>
                                <th className="p-3 text-left border border-slate-300 font-bold text-sm w-1/4">Model</th>
                                <th className="p-3 text-left border border-slate-300 font-bold text-sm w-1/4">Issue / Problem</th>
                                <th className="p-3 text-left border border-slate-300 font-bold text-sm w-1/4">Accessories</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 border border-slate-300 text-sm">{job.deviceType || 'Mobile'}</td>
                                <td className="p-3 border border-slate-300 text-sm">{job.deviceModel}</td>
                                <td className="p-3 border border-slate-300 text-sm">{job.problemDesc}</td>
                                <td className="p-3 border border-slate-300 text-sm text-slate-600">{job.accessories || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* technical details for motor if exist */}
                {job.technicalDetails && (
                    <div className="mb-8 p-4 border border-slate-200 bg-slate-50/50 rounded-lg">
                        <h3 className="font-bold text-xs uppercase mb-3 text-slate-500 tracking-wider">Technical Specifications</h3>
                        <div className="grid grid-cols-3 gap-y-4 gap-x-8">
                            {(() => {
                                const td = job.technicalDetails as any;
                                const motor = td?.motor || td;
                                const isNew = !!td?.motor;
                                
                                return (
                                    <>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400">Power / HP</div>
                                            <div className="text-sm font-bold">{motor?.power || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400">Starter Type</div>
                                            <div className="text-sm font-bold">{motor?.starter || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400">Winding Details</div>
                                            <div className="text-[10px] font-medium leading-tight text-slate-600">
                                                {[1,2,3,4].map(n => isNew ? motor.winding?.[n-1] : motor[`winding${n}`]).filter(Boolean).join(', ') || '-'}
                                            </div>
                                        </div>
                                        {motor?.coil && (
                                            <div className="col-span-3 grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                                                {['running', 'starting'].map(type => (
                                                    <div key={type}>
                                                        <div className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">{type} Coil</div>
                                                        <div className="text-[10px] text-slate-600">
                                                            Turns: <span className="font-bold text-black">{motor.coil[type]?.turns}</span> | 
                                                            Gauge: <span className="font-bold text-black">{motor.coil[type]?.gauge}</span> | 
                                                            Weight: <span className="font-bold text-black">{motor.coil[type]?.weight}kg</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* 5. Financials */}
                <div className="flex flex-col items-end gap-2 mt-8">
                    <div className="w-1/2 flex justify-between text-sm">
                        <span className="font-bold text-right w-full mr-8">Estimated Cost:</span>
                        <span className="font-medium">Rs. {total}</span>
                    </div>
                    <div className="w-1/2 flex justify-between text-sm">
                        <span className="font-bold text-right w-full mr-8">Advance Paid:</span>
                        <span className="font-medium">Rs. {advance}</span>
                    </div>
                    <div className="w-1/2 flex justify-between text-lg mt-2 font-bold">
                        <span className="text-right w-full mr-8">TOTAL PAYABLE:</span>
                        <span>Rs. {balance}</span>
                    </div>
                </div>

            </div>

            {/* Print/Download Button */}
            <div className="w-full max-w-[800px] flex justify-end mt-6 print:hidden">
                <button 
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    disabled={downloading}
                >
                    {downloading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Generating PDF...
                        </>
                    ) : (
                        <>
                            <Printer className="h-4 w-4" /> Download / Print
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
