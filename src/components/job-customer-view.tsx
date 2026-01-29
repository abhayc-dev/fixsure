import { ArrowLeft, Calendar, Smartphone, User, Receipt, MapPin, Wrench, MessageCircle, AlertCircle, Trash2, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
    technicalDetails?: any;
    problemDesc: string;
    accessories?: string | null;
    status: string;
    receivedAt: Date;
    expectedAt: Date | null;
    estimatedCost: number | null;
    advanceAmount?: number | null;
};

export default function JobCustomerView({ job, onBack }: { job: JobSheet, onBack: () => void }) {
    
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
        if (!confirm("Are you sure you want to DELETE this job sheet? This cannot be undone.")) return;
        
        setLoading(true);
        try {
            await deleteJobSheet(job.id);
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
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("Failed to update job details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            
            {/* Top Action Bar */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
                    Back to Jobs
                </button>
                
                <div className="flex items-center gap-2">
                    {!isEditing && (
                        <>
                             <button 
                                onClick={() => setIsDeleting(true)}
                                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full px-4 py-2 text-sm font-bold hover:bg-red-100 transition-all active:scale-[0.98]"
                            >
                                <Trash2 className="h-4 w-4" /> 
                                Delete
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                            >
                                <Edit2 className="h-4 w-4" /> 
                                Edit
                            </button>
                            <button 
                                onClick={handleNotify}
                                className="flex items-center gap-2 bg-emerald-500 text-white shadow-lg rounded-full px-5 py-2.5 text-sm font-bold hover:bg-emerald-600 hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                <MessageCircle className="h-4 w-4" /> 
                                Notify Customer
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {isDeleting && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-bold">Confirm Deletion? This action is permanent.</span>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => setIsDeleting(false)} className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-white rounded-lg">Cancel</button>
                         <button onClick={handleDelete} className="px-3 py-1.5 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg">Yes, Delete</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleUpdate}>
                <input type="hidden" name="id" value={job.id} />

                {/* Main Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                    
                    {isEditing && (
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-slate-500 hover:bg-slate-100 p-2 rounded-full shadow-md border"><X className="h-5 w-5"/></button>
                            <button type="submit" disabled={loading} className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-full shadow-md font-bold flex items-center gap-2">
                                <Save className="h-4 w-4"/> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {/* Header Banner */}
                    <div className="bg-slate-50 border-b border-slate-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-primary">
                                <Wrench className="h-8 w-8" />
                            </div>
                            <div>
                                 <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-800">Job Sheet {job.jobId}</h1>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                                        job.status === 'RECEIVED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                        job.status === 'READY' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                        job.status === 'DELIVERED' ? "bg-slate-100 text-slate-600 border-slate-200" :
                                        "bg-orange-50 text-orange-700 border-orange-200"
                                    )}>
                                        {job.status}
                                    </span>
                                 </div>
                                 <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                                    <Calendar className="h-3.5 w-3.5" /> 
                                    Received on {new Date(job.receivedAt).toLocaleDateString()} at {new Date(job.receivedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                        
                        {/* Left Column: Customer & Device (Span 2) */}
                        <div className="lg:col-span-2 space-y-10">
                            
                            {/* Customer Section */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Customer Information
                                </h3>
                                <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</label>
                                        {isEditing ? (
                                            <input name="customerName" defaultValue={job.customerName} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" required />
                                        ) : (
                                            <div className="text-lg font-bold text-slate-800 mt-1">{job.customerName}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mobile</label>
                                        {isEditing ? (
                                            <input name="customerPhone" defaultValue={job.customerPhone} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" required />
                                        ) : (
                                            <div className="text-lg font-bold text-slate-800 mt-1">{job.customerPhone}</div>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Address
                                        </label>
                                        {isEditing ? (
                                            <textarea name="customerAddress" defaultValue={job.customerAddress || ''} className="w-full mt-1 p-2 border rounded-md text-slate-700" rows={2} />
                                        ) : (
                                            <div className="text-base font-medium text-slate-700 mt-1">
                                                {job.customerAddress || <span className="text-slate-400 italic">No address provided</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Technical Details Section (For Motors) */}
                            {((isEditing && job.category === 'MOTOR') || (!isEditing && job.technicalDetails)) && (
                                <section className="animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Wrench className="h-4 w-4" /> Technical Specifications
                                    </h3>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 grid grid-cols-2 lg:grid-cols-3 gap-6">
                                        
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Starter Phase</label>
                                            {isEditing && job.category === 'MOTOR' ? (
                                                <input name="tech_starter" defaultValue={job.technicalDetails?.starter || ''} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" />
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">{job.technicalDetails?.starter || '-'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Power / HP</label>
                                            {isEditing && job.category === 'MOTOR' ? (
                                                <input name="tech_power" defaultValue={job.technicalDetails?.power || ''} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" />
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">{job.technicalDetails?.power || '-'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Winding 1</label>
                                             {isEditing && job.category === 'MOTOR' ? (
                                                <input name="tech_winding1" defaultValue={job.technicalDetails?.winding1 || ''} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" />
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">{job.technicalDetails?.winding1 || '-'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Winding 2</label>
                                             {isEditing && job.category === 'MOTOR' ? (
                                                <input name="tech_winding2" defaultValue={job.technicalDetails?.winding2 || ''} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" />
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">{job.technicalDetails?.winding2 || '-'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Winding 3</label>
                                             {isEditing && job.category === 'MOTOR' ? (
                                                <input name="tech_winding3" defaultValue={job.technicalDetails?.winding3 || ''} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" />
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">{job.technicalDetails?.winding3 || '-'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Winding 4</label>
                                             {isEditing && job.category === 'MOTOR' ? (
                                                <input name="tech_winding4" defaultValue={job.technicalDetails?.winding4 || ''} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" />
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">{job.technicalDetails?.winding4 || '-'}</div>
                                            )}
                                        </div>

                                    </div>
                                </section>
                            )}

                            {/* Device Section */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" /> Device Details
                                </h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                                        <div className="p-5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Device Type</label>
                                            {isEditing ? (
                                                <div className="flex flex-col gap-2">
                                                    <select name="category" defaultValue={job.category || 'GENERAL'} className="w-full mt-1 p-2 border rounded-md text-slate-700 text-sm">
                                                        <option value="GENERAL">General</option>
                                                        <option value="MOBILE">Mobile</option>
                                                        <option value="MOTOR">Motor</option>
                                                    </select>
                                                    <input name="deviceType" defaultValue={job.deviceType || ''} className="w-full p-2 border rounded-md font-bold text-slate-800" placeholder="e.g. Mobile" />
                                                </div>
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">
                                                    {job.deviceType || "Device"}
                                                </div>
                                            )}
                                        </div>
                                         <div className="p-5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Device Model</label>
                                            {isEditing ? (
                                                <input name="deviceModel" defaultValue={job.deviceModel} className="w-full mt-1 p-2 border rounded-md font-bold text-slate-800" required />
                                            ) : (
                                                <div className="text-base font-bold text-slate-800 mt-1">
                                                    {job.deviceModel}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-5 md:col-span-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Accessories</label>
                                             {isEditing ? (
                                                <input name="accessories" defaultValue={job.accessories || ''} className="w-full mt-1 p-2 border rounded-md text-slate-800" placeholder="e.g. Charger" />
                                            ) : (
                                                <div className="text-base font-medium text-slate-800 mt-1">
                                                    {job.accessories || <span className="text-slate-400 italic">None</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 p-5 bg-orange-50/30">
                                        <label className="text-xs font-bold text-orange-800/70 uppercase tracking-wide">Reported Problem</label>
                                        {isEditing ? (
                                            <textarea name="problemDesc" defaultValue={job.problemDesc} className="w-full mt-2 p-2 border rounded-md text-slate-800" rows={3} required />
                                        ) : (
                                            <p className="text-base font-medium text-slate-800 mt-2 leading-relaxed">
                                                {job.problemDesc}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Payment & Dates (Span 1) */}
                        <div className="space-y-8">
                            
                            {/* Financial Card */}
                            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
                                 <div className="flex items-center gap-2 mb-6 opacity-80">
                                     <Receipt className="h-5 w-5" />
                                     <span className="text-sm font-bold uppercase tracking-wider">Financials</span>
                                 </div>
                                 
                                 <div className="space-y-4">
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-400">Total Estimate</span>
                                         {isEditing ? (
                                              <input name="estimatedCost" type="number" defaultValue={job.estimatedCost || 0} className="w-24 text-right p-1 text-black rounded" />
                                         ) : (
                                             <span className="font-medium">₹{total.toLocaleString()}</span>
                                         )}
                                     </div>
                                     <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                                         <span className="text-slate-400">Advance Paid</span>
                                          {isEditing ? (
                                              <input name="advanceAmount" type="number" defaultValue={job.advanceAmount || 0} className="w-24 text-right p-1 text-black rounded" />
                                         ) : (
                                             <span className="font-medium text-green-400">- ₹{advance.toLocaleString()}</span>
                                         )}
                                     </div>
                                     <div className="flex justify-between items-end pt-2">
                                         <span className="text-sm font-bold text-slate-300">Balance Due</span>
                                         <span className="text-3xl font-bold">₹{balance.toLocaleString()}</span>
                                     </div>
                                 </div>
                            </div>

                            {/* Dates Card */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Timelines</h3>
                                
                                <div className="space-y-6">
                                    <div className="relative pl-6 border-l-2 border-slate-100">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                        <label className="text-xs font-semibold text-slate-500">Received On</label>
                                        <div className="text-sm font-bold text-slate-800">
                                            {new Date(job.receivedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="relative pl-6 border-l-2 border-primary/30">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                                        <label className="text-xs font-semibold text-primary">Est. Delivery</label>
                                        <div className="text-sm font-bold text-slate-800">
                                            {job.expectedAt ? new Date(job.expectedAt).toLocaleDateString() : 'Not Set'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
