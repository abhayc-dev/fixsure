import { ArrowLeft, Calendar, Smartphone, User, Receipt, MapPin, Wrench, MessageCircle, Trash2, Edit2, Save, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJobSheet, updateJobSheetDetails } from "@/lib/actions";

type JobSheet = {
    id: string;
    jobId: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    deviceType?: string | null;
    deviceModel: string;
    category?: string;
    problemDesc: string;
    accessories?: string | null;
    status: string;
    receivedAt: Date;
    expectedAt: Date | null;
    estimatedCost: number | null;
    advanceAmount?: number | null;
    technicalDetails?: any | null;
};

export default function JobCustomerView({ job, onBack }: { job: JobSheet, onBack: () => void }) {
    const router = useRouter();
    
    // Calculate Balance
    const total = job.estimatedCost || 0;
    const advance = job.advanceAmount || 0;
    const balance = total - advance;

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleNotify = () => {
         const message = encodeURIComponent(
            `${String.fromCodePoint(0x1F44B)} Hello *${job.customerName}*,\n\n` +
            `Update regarding your repair (Job ID: ${job.jobId}):\n\n` +
            `${String.fromCodePoint(0x1F4F1)} *Device:* ${job.deviceModel}\n` +
            `${String.fromCodePoint(0x1F4CA)} *Status:* *${job.status}*\n` +
            (job.status === 'READY' ? `\n${String.fromCodePoint(0x1F4B0)} *Bill Amount:* ₹${total}\n${String.fromCodePoint(0x2705)} *Your device is READY for pickup!*\n` : '') +
            `\n--------------------------------\n` +
            `Thank you for trusting us! ${String.fromCodePoint(0x1F64F)}`
        );
        window.open(`https://api.whatsapp.com/send?phone=${job.customerPhone.replace(/\D/g, '')}&text=${message}`, '_blank');
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteJobSheet(job.id);
            router.refresh();
            onBack();
        } catch (error) {
            console.error(error);
            alert("Failed to delete job.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            await updateJobSheetDetails(formData);
            router.refresh();
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("Failed to update job details.");
        } finally {
            setLoading(false);
        }
    };

    // Helper for Motor Data
    const td = job.technicalDetails || {};
    const motor = td?.motor || td; // Support both structures

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Top Navigation & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
                >
                    <div className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-slate-300 shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Jobs
                </button>
                
                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <>
                             <button 
                                onClick={() => setIsDeleting(true)}
                                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-all shadow-sm"
                            >
                                <Trash2 className="h-4 w-4" /> 
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Edit2 className="h-4 w-4" /> Edit Details
                            </button>
                            <button 
                                onClick={handleNotify}
                                className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                            >
                                <MessageCircle className="h-4 w-4" /> Notify Customer
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                             <button type="button" onClick={() => setIsEditing(false)} className="bg-white border border-slate-200 text-slate-500 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50">Cancel</button>
                        </div>
                    )}
                </div>
            </div>
            
            {isDeleting && (
                <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between animate-in zoom-in-95">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500 rounded-xl">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Permanently delete this record?</p>
                            <p className="text-slate-400 text-sm">All data for Job ID {job.jobId} will be lost forever.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={() => setIsDeleting(false)} className="px-6 py-2.5 border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-all">Cancel</button>
                         <button onClick={handleDelete} className="px-6 py-2.5 bg-red-500 rounded-xl font-bold hover:bg-red-600 transition-all">Yes, Delete</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-8">
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="category" value={job.category} />

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN (8 Units) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Summary Header */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 opacity-50" />
                             
                             <div className="relative z-10 flex items-center gap-5">
                                 <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary shadow-sm">
                                     <Wrench className="h-8 w-8" />
                                 </div>
                                 <div className="space-y-1">
                                     <div className="flex items-center gap-3">
                                         <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Sheet <span className="text-primary">{job.jobId}</span></h1>
                                         <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                            job.status === 'RECEIVED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            job.status === 'READY' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                            job.status === 'DELIVERED' ? "bg-slate-100 text-slate-600 border-slate-200" :
                                            "bg-orange-50 text-orange-700 border-orange-200"
                                         )}>
                                             {job.status}
                                         </span>
                                     </div>
                                     <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                         <Calendar className="h-4 w-4" /> Received: {new Date(job.receivedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                     </p>
                                 </div>
                             </div>

                             {isEditing && (
                                <button type="submit" disabled={loading} className="relative z-10 bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center gap-3 active:scale-95">
                                    <Save className="h-5 w-5" /> {loading ? 'Saving...' : 'Save All Changes'}
                                </button>
                             )}
                        </div>

                        {/* Customer Section */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                             <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                 <User className="h-4 w-4 text-slate-400" />
                                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Information</h2>
                             </div>
                             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-1.5">
                                     <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                     {isEditing ? (
                                         <input name="customerName" defaultValue={job.customerName} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" required />
                                     ) : (
                                         <div className="text-xl font-bold text-slate-800 px-1">{job.customerName}</div>
                                     )}
                                 </div>
                                 <div className="space-y-1.5">
                                     <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                                     {isEditing ? (
                                         <input name="customerPhone" defaultValue={job.customerPhone} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" required />
                                     ) : (
                                         <div className="text-xl font-bold text-slate-800 px-1">{job.customerPhone}</div>
                                     )}
                                 </div>
                                 <div className="md:col-span-2 space-y-1.5 pt-2">
                                     <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Address</label>
                                     {isEditing ? (
                                         <textarea name="customerAddress" defaultValue={job.customerAddress || ''} className="w-full p-4 rounded-xl border border-slate-200 font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none" rows={2} />
                                     ) : (
                                         <div className="text-base font-medium text-slate-600 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                             {job.customerAddress || "No address provided"}
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>

                        {/* Motor Section (ONLY FOR MOTOR) */}
                        {job.category === 'MOTOR' && (
                             <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                                 
                                 {/* Motor Specs */}
                                 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                     <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                         <Wrench className="h-4 w-4 text-slate-400" />
                                         <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Motor Details</h2>
                                     </div>
                                     <div className="p-8 grid grid-cols-2 lg:grid-cols-2 gap-8">
                                         <div className="space-y-1.5">
                                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Equipment / Motor Type</label>
                                             {isEditing ? (
                                                 <select name="deviceType" defaultValue={job.deviceType || ''} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none">
                                                     <option value="MONO_BLOCK">Mono Block Pump</option>
                                                     <option value="SUBMERSIBLE">Submersible Motor</option>
                                                     <option value="SEWELL">Sewell / Open Well</option>
                                                     <option value="ELECTRIC_MOTOR">Electric Motor</option>
                                                     <option value="GENERATOR">Generator</option>
                                                     <option value="STABILIZER">Stabilizer</option>
                                                     <option value="OTHER">Other</option>
                                                 </select>
                                             ) : (
                                                 <div className="text-base font-bold text-slate-800 px-1">{job.deviceType || '-'}</div>
                                             )}
                                         </div>
                                         <div className="space-y-1.5">
                                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Phase</label>
                                             {isEditing ? (
                                                 <select name="motor.phase" defaultValue={motor?.phase || 'Single'} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none">
                                                     <option value="Single">Single phase</option>
                                                     <option value="Double">Double phase</option>
                                                     <option value="Triple">Triple phase</option>
                                                 </select>
                                             ) : (
                                                 <div className="text-base font-bold text-slate-800 px-1">{motor?.phase || '-'}</div>
                                             )}
                                         </div>
                                         <div className="space-y-1.5">
                                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Model / Serial No.</label>
                                             {isEditing ? (
                                                 <input name="deviceModel" defaultValue={job.deviceModel || ''} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" />
                                             ) : (
                                                 <div className="text-base font-bold text-slate-800 px-1">{job.deviceModel || '-'}</div>
                                             )}
                                         </div>
                                         <div className="space-y-1.5">
                                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Motor Power</label>
                                             {isEditing ? (
                                                 <div className="flex gap-2">
                                                     <input name="motor.power" defaultValue={motor?.power || ''} className="w-2/3 h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" />
                                                     <select name="motor.power_unit" defaultValue={motor?.power_unit || 'HP'} className="w-1/3 h-12 px-2 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none">
                                                         <option value="HP">HP</option>
                                                         <option value="kW">kW</option>
                                                     </select>
                                                 </div>
                                             ) : (
                                                 <div className="text-base font-bold text-slate-800 px-1">{motor?.power ? `${motor.power} ${motor.power_unit || 'HP'}` : '-'}</div>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        )}

                        {/* General Device Info (If Not Motor) */}
                        {job.category !== 'MOTOR' && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-slate-400" />
                                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Device Details</h2>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Device Model</label>
                                        {isEditing ? (
                                            <input name="deviceModel" defaultValue={job.deviceModel} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" required />
                                        ) : (
                                            <div className="text-xl font-bold text-slate-800 px-1">{job.deviceModel}</div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Type/Category</label>
                                        {isEditing ? (
                                            <input name="deviceType" defaultValue={job.deviceType || ''} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none" />
                                        ) : (
                                            <div className="text-xl font-bold text-slate-800 px-1">{job.deviceType || 'Mobile'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Issue Description */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                             <div className="p-8">
                                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Issue Description</h3>
                                 {isEditing ? (
                                     <textarea name="problemDesc" defaultValue={job.problemDesc} className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20" rows={4} required />
                                 ) : (
                                     <p className="text-base font-semibold text-slate-800 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                         {job.problemDesc}
                                     </p>
                                 )}
                             </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (4 Units) */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Financial Card */}
                        <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden group">
                             <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                             
                             <div className="flex items-center justify-between mb-8">
                                  <div className="p-3 bg-white/10 rounded-2xl">
                                      <Receipt className="h-6 w-6 text-slate-300" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financials</span>
                             </div>
                             
                             <div className="space-y-6">
                                 <div className="flex justify-between items-center">
                                     <span className="text-slate-400 font-bold text-sm">Estimated Net</span>
                                     {isEditing ? (
                                          <input name="estimatedCost" type="number" defaultValue={job.estimatedCost || 0} className="w-24 px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-xl text-right font-bold outline-none" />
                                     ) : (
                                         <span className="text-xl font-bold">₹{total.toLocaleString()}</span>
                                     )}
                                 </div>
                                 <div className="flex justify-between items-center border-b border-white/10 pb-6">
                                     <span className="text-slate-400 font-bold text-sm">Advance Paid</span>
                                      {isEditing ? (
                                          <input name="advanceAmount" type="number" defaultValue={job.advanceAmount || 0} className="w-24 px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-xl text-right font-bold outline-none" />
                                     ) : (
                                         <span className="text-lg font-bold text-emerald-400">- ₹{advance.toLocaleString()}</span>
                                     )}
                                 </div>
                                 <div className="pt-2 flex flex-col gap-1">
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Balance to Collect</span>
                                     <div className="text-4xl font-black text-right tracking-tighter">₹{balance.toLocaleString()}</div>
                                 </div>
                             </div>
                        </div>

                        {/* Timelines Card */}
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Timelines</h3>
                                <Calendar className="h-4 w-4 text-slate-300" />
                            </div>
                            
                            <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
                                <div className="relative pl-10">
                                    <div className="absolute left-[5px] top-1.5 w-[14px] h-[14px] rounded-full bg-white border-[3px] border-slate-200 z-10 shadow-sm" />
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Received on</label>
                                    <div className="text-lg font-bold text-slate-800">{new Date(job.receivedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                </div>

                                <div className="relative pl-10">
                                    <div className="absolute left-[5px] top-1.5 w-[14px] h-[14px] rounded-full bg-white border-[3px] border-primary z-10 shadow-sm animate-pulse" />
                                    {isEditing ? (
                                        <div className="space-y-1">
                                             <label className="text-[10px] font-black text-primary uppercase tracking-tighter">Adjust Delivery Date</label>
                                             <input type="date" name="expectedAt" defaultValue={job.expectedAt ? new Date(job.expectedAt).toISOString().split('T')[0] : ''} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none" />
                                        </div>
                                    ) : (
                                        <>
                                            <label className="text-[10px] font-black text-primary uppercase tracking-tighter">Delivery Date</label>
                                            <div className="text-lg font-bold text-slate-900">
                                                {job.expectedAt ? new Date(job.expectedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-slate-300">Not Set</span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                
                {/* Pad for scrolling */}
                <div className="h-10" />
            </form>
        </div>
    );
}
