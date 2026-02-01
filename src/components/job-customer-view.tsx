import { ArrowLeft, Calendar, Smartphone, User, Receipt, MapPin, Wrench, MessageCircle, Trash2, Edit2, Save, X, ChevronRight, Plus, FileText } from "lucide-react";
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
    const [isTechEditing, setIsTechEditing] = useState(false);
    const [isCoilEditing, setIsCoilEditing] = useState(false);
    const [isPartsEditing, setIsPartsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper for Motor Data
    const td = job.technicalDetails || {};
    const motor = td?.motor || td;

    const [coilDetails, setCoilDetails] = useState(motor?.coilDetails || {
        running: [{ swg: '', weight: '', turns: '' }],
        starting: [{ swg: '', weight: '', turns: '' }],
        runningTotalWeight: motor?.coilDetails?.runningTotalWeight || '',
        startingTotalWeight: motor?.coilDetails?.startingTotalWeight || ''
    });

    const [partsReplaced, setPartsReplaced] = useState(motor?.partsReplaced || []);
    const [remarks, setRemarks] = useState(motor?.remarks || '');
    const [warrantyInfo, setWarrantyInfo] = useState(motor?.warrantyInfo || '');

    const updateCoilTotalWeight = (type: 'running' | 'starting', value: string) => {
        setCoilDetails((prev: any) => ({
            ...prev,
            [`${type}TotalWeight`]: value
        }));
    };

    const addCoilRow = (type: 'running' | 'starting') => {
        setCoilDetails((prev: any) => ({
            ...prev,
            [type]: [...prev[type], { swg: '', weight: '', turns: '' }]
        }));
    };

    const updateCoilRow = (type: 'running' | 'starting', index: number, field: string, value: string) => {
        setCoilDetails((prev: any) => {
            const next = { ...prev };
            next[type] = [...next[type]];
            next[type][index] = { ...next[type][index], [field]: value };
            return next;
        });
    };

    const removeCoilRow = (type: 'running' | 'starting', index: number) => {
        if (coilDetails[type].length <= 1) return;
        setCoilDetails((prev: any) => ({
            ...prev,
            [type]: prev[type].filter((_: any, i: number) => i !== index)
        }));
    };

    const addPartRow = () => {
        setPartsReplaced((prev: any) => [...prev, { name: '', qty: '', price: '' }]);
    };

    const updatePartRow = (index: number, field: string, value: string) => {
        setPartsReplaced((prev: any) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removePartRow = (index: number) => {
        setPartsReplaced((prev: any) => prev.filter((_: any, i: number) => i !== index));
    };

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
            setIsCoilEditing(false);
            setIsPartsEditing(false);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("Failed to update job details.");
        } finally {
            setLoading(false);
        }
    };

    // Helper for Motor Data (Already handled above)

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            
            {/* --- TOP BAR & NAVIGATION (STICKY) --- */}
            <div className="sticky top-0 z-50 bg-slate-200/40 backdrop-blur-md py-4 -mx-12 px-4 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 mt-[-20px] rounded-t-2xl">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-bold transition-all group w-fit"
                >
                    <div className="p-2.5 bg-white border border-slate-100 rounded-2xl group-hover:border-slate-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span className="text-sm tracking-tight opacity-80 group-hover:opacity-100">Back to Dashboard</span>
                </button>
                
                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <div className="flex items-center gap-3 bg-white/50 p-1.5 rounded-[20px] border border-slate-100 shadow-sm ">
                             <button 
                                onClick={() => setIsDeleting(true)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                                title="Delete Job"
                            >
                                <Trash2 className="h-5 w-5" /> 
                            </button>
                            <div className="w-px h-6 bg-slate-200" />
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all duration-200"
                            >
                                <Edit2 className="h-4 w-4 text-primary" /> Edit Job
                            </button>
                            <button 
                                onClick={handleNotify}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 duration-200"
                            >
                                <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                             <button 
                                type="button" 
                                onClick={() => setIsEditing(false)} 
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-red-500 hover:bg-red-600 transition-all text-white cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* --- DELETE CONFIRMATION --- */}
            {isDeleting && (
                <div className="bg-slate-900 text-white rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="flex items-center gap-5 relative z-10 text-center md:text-left">
                        <div className="p-4 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                            <Trash2 className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="font-extrabold text-xl tracking-tight">Are you absolutely sure?</p>
                            <p className="text-slate-400 text-sm mt-1">This will permanently delete Job ID <span className="text-rose-400 font-mono font-bold">{job.jobId}</span> and all associated records.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 relative z-10 w-full md:w-auto">
                         <button onClick={() => setIsDeleting(false)} className="flex-1 md:flex-none px-8 py-3.5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm">Cancel</button>
                         <button onClick={handleDelete} className="flex-1 md:flex-none px-8 py-3.5 bg-rose-600 rounded-2xl font-bold hover:bg-rose-700 transition-all text-sm shadow-xl shadow-rose-900/20">Delete Forever</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleUpdate} className="flex flex-col lg:flex-row gap-10 items-start">
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="category" value={job.category} />
                <input type="hidden" name="accessories" value={job.accessories || ''} />
                <input type="hidden" name="motor.coilDetails" value={JSON.stringify(coilDetails)} />
                <input type="hidden" name="motor.partsReplaced" value={JSON.stringify(partsReplaced)} />
                <input type="hidden" name="motor.remarks" value={remarks} />
                <input type="hidden" name="motor.warrantyInfo" value={warrantyInfo} />
                
                {/* Hidden fields to preserve data when not in full edit mode */}
                {!isEditing && (
                    <>
                        <input type="hidden" name="customerName" value={job.customerName} />
                        <input type="hidden" name="customerPhone" value={job.customerPhone} />
                        <input type="hidden" name="customerAddress" value={job.customerAddress || ''} />
                        <input type="hidden" name="deviceType" value={job.deviceType || ''} />
                        <input type="hidden" name="deviceModel" value={job.deviceModel} />
                        <input type="hidden" name="problemDesc" value={job.problemDesc} />
                        <input type="hidden" name="estimatedCost" value={job.estimatedCost || 0} />
                        <input type="hidden" name="advanceAmount" value={job.advanceAmount || 0} />
                        <input type="hidden" name="expectedAt" value={job.expectedAt ? new Date(job.expectedAt).toISOString() : ''} />
                        <input type="hidden" name="status" value={job.status} />
                    </>
                )}
                
                {/* Technical hidden fields when override is not active */}
                {job.category === 'MOTOR' && !isEditing && !isTechEditing && (
                    <>
                        <input type="hidden" name="motor.power" value={motor?.power || ''} />
                        <input type="hidden" name="motor.power_unit" value={motor?.power_unit || 'HP'} />
                        <input type="hidden" name="motor.phase" value={motor?.phase || 'Single'} />
                        <input type="hidden" name="motor.starter_length" value={motor?.starter_length || ''} />
                        <input type="hidden" name="motor.starter_diameter" value={motor?.starter_diameter || ''} />
                        <input type="hidden" name="motor.speed" value={motor?.speed || ''} />
                        <input type="hidden" name="motor.capacitor" value={motor?.capacitor || ''} />
                        <input type="hidden" name="motor.current" value={motor?.current || ''} />
                    </>
                )}

                {/* --- LEFT SIDEBAR (THE RAIL) --- */}
                <div className="lg:w-80 w-full space-y-6 sticky top-30">
                    {/* Status & ID Rail */}
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        
                        <div className="space-y-6 relative z-10">
                            <div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Job Reference</span>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-[1000] tracking-tighter mt-1">{job.jobId}</h1>
                                    {isEditing && (
                                        <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 rounded-md">
                                            <span className="text-[8px] font-black uppercase text-indigo-300">Editing Mode</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    {isEditing ? (
                                        <select 
                                            name="status" 
                                            defaultValue={job.status} 
                                            className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest outline-none"
                                        >
                                            {['PENDING', 'READY', 'DELIVERED', 'CANCELLED'].map(s => (
                                                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            job.status === 'READY' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                                            job.status === 'DELIVERED' ? "bg-emerald-500 text-white" :
                                            "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                        )}>
                                            {job.status}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Date</span>
                                    <span className="text-[10px] font-black text-white uppercase italic">{new Date(job.receivedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {!(isEditing || isTechEditing || isCoilEditing || isPartsEditing) ? (
                                <button type="button" onClick={handleNotify} className="w-full bg-indigo-500 hover:bg-indigo-600 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl shadow-indigo-900/40">
                                    <MessageCircle className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Share on WhatsApp</span>
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 py-4 rounded-xl flex items-center justify-center gap-[-5] transition-all active:scale-95 group shadow-xl shadow-emerald-900/40">
                                    <Save className="h-4 text-white" />
                                    <span className="text-[9px] font-black  uppercase tracking-widest">{loading ? 'Saving...' : 'Commit Changes'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Problem Description Card */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><FileText className="h-4 w-4" /></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported Issue</span>
                        </div>
                        {isEditing ? (
                            <textarea 
                                name="problemDesc" 
                                defaultValue={job.problemDesc} 
                                className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none border border-slate-100 min-h-[100px] focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                            />
                        ) : (
                            <p className="text-xs font-black text-slate-800 uppercase leading-relaxed italic">"{job.problemDesc}"</p>
                        )}
                    </div>

                    {/* Quick Specs Chip */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Wrench className="h-4 w-4" /></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Metadata</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1.5">Machine Type</span>
                                {isEditing ? (
                                    <select name="deviceType" defaultValue={job.deviceType || ''} className="bg-slate-50 p-2 rounded-lg text-xs font-bold outline-none border border-slate-200 text-slate-600">
                                        {['MONO_BLOCK', 'SUBMERSIBLE', 'SEWELL', 'ELECTRIC_MOTOR', 'GENERATOR', 'STABILIZER', 'OTHER'].map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                                    </select>
                                ) : (
                                    <span className="text-xs font-black text-slate-800 uppercase leading-tight italic">{job.deviceType || 'GENERAL'}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1.5">Serial / Model</span>
                                {isEditing ? (
                                    <input name="deviceModel" defaultValue={job.deviceModel} className="bg-slate-50 p-2 rounded-lg text-xs font-bold outline-none border border-slate-200 text-slate-600" />
                                ) : (
                                    <span className="text-xs font-black text-slate-800 uppercase leading-tight italic">{job.deviceModel}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CANVAS (THE BODY) --- */}
                <div className="flex-1 space-y-10">
                    
                    {/* Customer Identity Section (Wide Asymmetric) */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 items-center justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
                         <div className="flex items-center gap-8">
                             <div className="relative">
                                 <div className="h-24 w-24 bg-indigo-50 rounded-[32px] flex items-center justify-center border-2 border-white shadow-lg group-hover:bg-indigo-100 transition-colors">
                                     <User className="h-10 w-10 text-indigo-500" />
                                 </div>
                                 <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                             </div>
                             <div className="space-y-1">
                                 {isEditing ? (
                                     <div className="flex flex-col gap-2">
                                         <input name="customerName" defaultValue={job.customerName} className="text-4xl font-[1000] text-slate-900 tracking-tighter outline-none border-b-2 border-slate-100 focus:border-indigo-400 transition-all font-outfit" />
                                         <input name="customerPhone" defaultValue={job.customerPhone} className="text-lg font-bold text-slate-400 outline-none border-b-2 border-slate-100 focus:border-indigo-400 font-mono" />
                                     </div>
                                 ) : (
                                     <>
                                         <h1 className="text-4xl font-[1000] text-slate-900 tracking-tighter leading-none">{job.customerName}</h1>
                                         <div className="flex items-center gap-3 text-slate-400 font-bold text-base mt-2">
                                             <Smartphone className="h-4 w-4 text-indigo-400" />
                                             <span className="font-mono tracking-tight">{job.customerPhone}</span>
                                         </div>
                                     </>
                                 )}
                             </div>
                         </div>
                         
                         <div className="hidden lg:block w-[1px] h-16 bg-slate-100" />

                         <div className="flex flex-col items-end gap-2 text-right">
                             {isEditing ? (
                                 <div className="space-y-2">
                                     <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right block italic">Customer Address</label>
                                     <textarea name="customerAddress" defaultValue={job.customerAddress || ''} className="text-right text-sm font-bold text-slate-500 outline-none border-b-2 border-slate-100 focus:border-indigo-400 bg-transparent min-w-[200px]" rows={2} />
                                 </div>
                             ) : (
                                 <>
                                     <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                         <MapPin className="h-3 w-3 text-indigo-400" /> Registered Location
                                     </div>
                                     <p className="text-slate-500 font-bold text-sm max-w-[240px] leading-tight">{job.customerAddress || 'Location details pending'}</p>
                                 </>
                             )}
                         </div>
                    </div>

                    {/* Technical Parameter Cluster */}
                    {job.category === 'MOTOR' && (
                        <div className="space-y-10">
                             {/* Asymmetric Technical Grid */}
                             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40">
                                 <div className="flex flex-col lg:flex-row">
                                     <div className="lg:w-1/3 p-10 bg-slate-50/50 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden">
                                         <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-50/0" />
                                         <div className="space-y-4 relative z-10">
                                             <h2 className="text-xl font-[1000] text-slate-900 uppercase tracking-tighter leading-none">Motor<br/>Details</h2>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Motor Specification Details</p>
                                         </div>
                                         {isTechEditing ? (
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                className={cn(
                                                    "mt-10 self-start px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border",
                                                    "bg-amber-500 text-white border-amber-600",
                                                    loading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {loading ? 'Saving...' : 'Apply Changes'}
                                            </button>
                                         ) : (
                                            <button 
                                                type="button" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsTechEditing(true);
                                                }} 
                                                className={cn(
                                                    "mt-10 self-start px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border",
                                                    "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                                                    loading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                Override Data
                                            </button>
                                         )}
                                     </div>
                                     <div className="lg:w-2/3 p-10 grid grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12]">
                                        {[
                                            { label: 'Power Rating', name: 'motor.power', value: motor?.power, unit: motor?.power_unit || 'HP', isPower: true },
                                            { label: 'Starter Length', name: 'motor.starter_length', value: motor?.starter_length, unit: 'INCH' },
                                            { label: 'Starter Diameter', name: 'motor.starter_diameter', value: motor?.starter_diameter, unit: 'INCH' },
                                            { label: 'Speed Index', name: 'motor.speed', value: motor?.speed, unit: 'RPM' },
                                            { label: 'Capacitance', name: 'motor.capacitor', value: motor?.capacitor, unit: 'MFD' },
                                            { label: 'System Phase', name: 'motor.phase', value: motor?.phase || 'Single (Φ)', options: ['Single (Φ)', 'Double (Φ, Φ)', 'Triple (Φ, Φ, Φ)'] },
                                            { label: 'Current Load', name: 'motor.current', value: motor?.current, unit: 'AMP' }
                                        ].map((field, idx) => (
                                            <div key={idx} className="space-y-3 relative group/item ">
                                                <div className="absolute -left-4 top-1 w-[2px] h-0 bg-indigo-500 transition-all group-hover/item:h-4 " />
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ">{field.label}</label>
                                                <div className="flex items-baseline gap-2 ">
                                                    {isEditing || isTechEditing ? (
                                                        field.isPower ? (
                                                            <div className="flex gap-1 border-b-2 border-slate-100 focus-within:border-indigo-400 transition-all ">
                                                                <input name="motor.power" defaultValue={motor?.power || ''} className="w-full bg-transparent outline-none text-xl font-black text-indigo-400 py-1 " />
                                                                <select name="motor.power_unit" defaultValue={motor?.power_unit || 'HP'} className="bg-transparent text-[10px] font-black text-slate-400 outline-none ">
                                                                    <option value="HP">HP</option>
                                                                    <option value="kW">kW</option>
                                                                </select>
                                                            </div>
                                                        ) : field.options ? (
                                                            <select name={field.name} defaultValue={field.value || ''} className="w-full bg-slate-50 border-b-2 border-slate-100 focus:border-indigo-400 outline-none text-sm font-black text-indigo-600 py-1">
                                                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input name={field.name} defaultValue={field.value || ''} className="w-full bg-slate-50 border-b-2 border-slate-100 focus:border-indigo-400 outline-none text-sm font-black text-indigo-600 py-1" />
                                                        )
                                                    ) : (
                                                        <span className="text-l font-semibold text-slate-700 tracking-tighter leading-none">
                                                            {field.value || '---'}
                                                        </span>
                                                    )} 
                                                    {field.unit && !field.isPower && <span className="text-[9px] font-black text-slate-400 italic">{field.unit}</span>}
                                                    {field.isPower && !isEditing && !isTechEditing && <span className="text-[9px] font-black text-slate-400 italic">{field.unit}</span>}
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                 </div>
                             </div>

                             {/* Coil Matrix Bento Box */}
                             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                 <div className="px-10 py-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/10">
                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-1 bg-indigo-400 rounded-full" />
                                         <div>
                                            <h3 className="text-lg font-[1000] text-slate-800 uppercase tracking-tighter leading-none">Coil Details</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Coil Specification</p>
                                         </div>
                                     </div>
                                     {isCoilEditing ? (
                                         <button 
                                            type="submit" 
                                            disabled={loading}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm",
                                                "bg-emerald-500 text-white border-emerald-600",
                                                loading && "opacity-50 cursor-not-allowed"
                                            )}
                                         >
                                             {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Save Configuration</>}
                                         </button>
                                     ) : (
                                         <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsCoilEditing(true);
                                            }} 
                                            disabled={loading}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm",
                                                "bg-white text-indigo-500 border-slate-100 hover:bg-slate-50",
                                                loading && "opacity-50 cursor-not-allowed"
                                            )}
                                         >
                                             <Edit2 className="h-4 w-4" /> Configure Matrix
                                         </button>
                                     )}
                                 </div>
                                 <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                     {['running', 'starting'].map((type) => (
                                         <div key={type} className="space-y-8">
                                             <div className="flex items-center justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase", type === 'running' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600")}>
                                                         {type} Stage
                                                     </div>
                                                 </div>
                                                 {(isEditing || isCoilEditing) && (
                                                     <button type="button" onClick={() => addCoilRow(type as any)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                                         <Plus className="h-4 w-4 text-slate-400" />
                                                     </button>
                                                 )}
                                             </div>
                                             
                                             <div className="space-y-4">
                                                 {/* Header labels */}
                                                 <div className="grid grid-cols-3 gap-6 px-4">
                                                     {['Turns (T)', 'Wire (SWG)', 'Weight (KG)'].map(h => (
                                                         <span key={h} className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center text-slate-500">{h}</span>
                                                     ))}
                                                 </div>

                                                 {(type === 'running' ? coilDetails.running : coilDetails.starting).map((row: any, i: number) => (
                                                     <div key={i} className="flex items-center gap-3">
                                                         <div className="grid grid-cols-3 gap-4 flex-1 text-slate-600">
                                                             <input value={row.swg} onChange={(e) => updateCoilRow(type as any, i, 'swg', e.target.value)} disabled={!isEditing && !isCoilEditing} placeholder="---" className="w-full bg-slate-50 border border-slate-100 rounded-xl h-12 text-center font-mono font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all" />
                                                             <input value={row.weight} onChange={(e) => updateCoilRow(type as any, i, 'weight', e.target.value)} disabled={!isEditing && !isCoilEditing} placeholder="---" className="w-full bg-slate-50 border border-slate-100 rounded-xl h-12 text-center font-mono font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all" />
                                                             <input value={row.turns} onChange={(e) => updateCoilRow(type as any, i, 'turns', e.target.value)} disabled={!isEditing && !isCoilEditing} placeholder="---" className="w-full bg-slate-50 border border-slate-100 rounded-xl h-12 text-center font-mono font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all" />
                                                         </div>
                                                         {(isEditing || isCoilEditing) && (
                                                             <button type="button" onClick={() => removeCoilRow(type as any, i)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                                                                 <X className="h-4 w-4" />
                                                             </button>
                                                         )}
                                                     </div>
                                                 ))}
                                             </div>

                                             <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                                 <div className="flex flex-row gap-6">
                                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Weight</span>
                                                     <span className="text-xs font-bold text-slate-300">---</span>
                                                 </div>
                                                 <div className="flex items-center gap-3">
                                                     <input 
                                                          value={(type === 'running' ? coilDetails.runningTotalWeight : coilDetails.startingTotalWeight) || ''}
                                                          onChange={(e) => updateCoilTotalWeight(type as any, e.target.value)}
                                                          disabled={!isEditing && !isCoilEditing}
                                                          placeholder="0.00"
                                                          className="w-24 h-12 bg-gray-100 text-black/80 rounded-xl text-center font-mono font-black text-lg outline-none  disabled:opacity-80"
                                                     />
                                                     <span className="text-[10px] font-black text-slate-400 uppercase">KG</span>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Parts Replacement Section */}
                             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col mt-10">
                                 <div className="px-10 py-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/10">
                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-1 bg-rose-400 rounded-full" />
                                         <div>
                                            <h3 className="text-lg font-[1000] text-slate-800 uppercase tracking-tighter leading-none">Parts Replaced</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Component Lifecycle Management</p>
                                         </div>
                                     </div>
                                     {isPartsEditing ? (
                                         <button 
                                            type="submit" 
                                            disabled={loading}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm",
                                                "bg-rose-500 text-white border-rose-600",
                                                loading && "opacity-50 cursor-not-allowed"
                                            )}
                                         >
                                             {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Finalize Inventory</>}
                                         </button>
                                     ) : (
                                         <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsPartsEditing(true);
                                            }} 
                                            disabled={loading}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm",
                                                "bg-white text-rose-500 border-slate-100 hover:bg-slate-50",
                                                loading && "opacity-50 cursor-not-allowed"
                                            )}
                                         >
                                             <Edit2 className="h-4 w-4" /> Edit Parts
                                         </button>
                                     )}
                                 </div>
                                 <div className="p-10 space-y-6">
                                     <div className="grid grid-cols-12 gap-6 px-4 mb-2">
                                         <span className="col-span-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Part Name / Description</span>
                                         <span className="col-span-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Qty</span>
                                         <span className="col-span-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Price (₹)</span>
                                         <span className="col-span-1"></span>
                                     </div>

                                     {partsReplaced.length === 0 && !isPartsEditing && (
                                         <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No parts replaced yet</p>
                                         </div>
                                     )}

                                     <div className="space-y-4">
                                         {partsReplaced.map((part: any, i: number) => (
                                             <div key={i} className="grid grid-cols-12 gap-4 items-center group/item transition-all">
                                                 <div className="col-span-6">
                                                     <input 
                                                        value={part.name} 
                                                        onChange={(e) => updatePartRow(i, 'name', e.target.value)} 
                                                        disabled={!isEditing && !isPartsEditing}
                                                        placeholder="Enter part name..."
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl h-12 px-4 font-bold text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all" 
                                                     />
                                                 </div>
                                                 <div className="col-span-2">
                                                     <input 
                                                        value={part.qty} 
                                                        onChange={(e) => updatePartRow(i, 'qty', e.target.value)} 
                                                        disabled={!isEditing && !isPartsEditing}
                                                        placeholder="1"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl h-12 text-center font-bold text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all" 
                                                     />
                                                 </div>
                                                 <div className="col-span-3">
                                                     <input 
                                                        value={part.price} 
                                                        onChange={(e) => updatePartRow(i, 'price', e.target.value)} 
                                                        disabled={!isEditing && !isPartsEditing}
                                                        placeholder="0"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl h-12 text-right px-4 font-mono font-black text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all" 
                                                     />
                                                 </div>
                                                 <div className="col-span-1 flex justify-end">
                                                     {(isEditing || isPartsEditing) && (
                                                         <button type="button" onClick={() => removePartRow(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                             <X className="h-4 w-4" />
                                                         </button>
                                                     )}
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                     {(isEditing || isPartsEditing) && (
                                         <button 
                                            type="button" 
                                            onClick={addPartRow}
                                            className="w-full py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 transition-all group"
                                         >
                                             <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                             <span className="text-[10px] font-black uppercase tracking-widest">Add New Component</span>
                                         </button>
                                     )}

                                     {/* Remarks & Warranty Grid */}
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-100">
                                         <div className="space-y-4">
                                             <div className="flex items-center gap-3">
                                                 <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><MessageCircle className="h-4 w-4" /></div>
                                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Remarks</span>
                                             </div>
                                             {isPartsEditing || isEditing ? (
                                                 <textarea 
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    placeholder="Add special notes or instructions..."
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-amber-50/50 transition-all min-h-[100px]"
                                                 />
                                             ) : (
                                                 <p className="text-sm font-bold text-slate-600 italic px-2">{remarks || 'No special remarks added.'}</p>
                                             )}
                                         </div>

                                         <div className="space-y-4">
                                             <div className="flex items-center gap-3">
                                                 <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500"><Receipt className="h-4 w-4" /></div>
                                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Warranty</span>
                                             </div>
                                             {isPartsEditing || isEditing ? (
                                                 <input 
                                                    value={warrantyInfo}
                                                    onChange={(e) => setWarrantyInfo(e.target.value)}
                                                    placeholder="e.g., 3 Months Parts Warranty"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-12 px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-50/50 transition-all"
                                                 />
                                             ) : (
                                                 <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl inline-block">
                                                     <span className="text-sm font-black text-emerald-700 uppercase">{warrantyInfo || 'No warranty issued'}</span>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* Financial/Meta Row (Asymmetric Bento) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                        <div className="lg:col-span-12 bg-slate-900 text-white rounded-[48px] p-12 relative overflow-hidden shadow-2xl">
                             <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -ml-48 -mt-48" />
                             <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-12">
                                 <div className="space-y-8 flex-1">
                                     <div className="flex items-center gap-4">
                                         <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                                             <Receipt className="h-8 w-8 text-indigo-400" />
                                         </div>
                                         <h4 className="text-[10px] font-black text-indigo-300/50 uppercase tracking-[0.4em]">Financial Settlement</h4>
                                     </div>
                                     <div className="space-y-2 relative">
                                         <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Net Balance Payable</p>
                                         <div className="flex items-center gap-4 relative">
                                            <h2 className="text-7xl font-[1000] tracking-tighter leading-none bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                                                ₹{(job.status === 'DELIVERED' ? 0 : balance).toLocaleString()}
                                            </h2>
                                            {(job.status === 'DELIVERED' || balance === 0) && (
                                                <div className="transform rotate-[-12deg] border-[3px] border-emerald-500 px-3 py-0.5 rounded-lg bg-emerald-500/10 backdrop-blur-sm animate-in zoom-in duration-500">
                                                    <span className="text-xl font-black text-emerald-500 uppercase tracking-tighter">PAID</span>
                                                </div>
                                            )}
                                         </div>
                                     </div>
                                 </div>

                                 <div className="flex flex-col justify-end gap-6 text-right">
                                     <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                         <div className="space-y-2">
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Job Quote</span>
                                             {isEditing ? (
                                                 <input name="estimatedCost" type="number" defaultValue={job.estimatedCost || 0} className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono font-black text-right outline-none focus:bg-white/10" />
                                             ) : (
                                                 <p className="text-2xl font-black tracking-tight">₹{total.toLocaleString()}</p>
                                             )}
                                         </div>
                                         <div className="space-y-2">
                                             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">Paid Advance</span>
                                             {isEditing ? (
                                                 <input name="advanceAmount" type="number" defaultValue={job.advanceAmount || 0} className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono font-black text-right text-emerald-400 outline-none focus:bg-white/10" />
                                             ) : (
                                                 <p className="text-2xl font-black tracking-tight text-emerald-400">₹{advance.toLocaleString()}</p>
                                             )}
                                         </div>
                                     </div>
                                     <div className="h-[1px] bg-white/10 w-full" />
                                     <div className="flex items-center justify-end gap-4">
                                         <Calendar className="h-4 w-4 text-slate-600" />
                                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Registration: {new Date(job.receivedAt).toDateString()}</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Delivery Timeline Block */}
                    <div className="bg-white rounded-[48px] border border-slate-100 p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
                         <div className="flex items-center gap-6">
                             <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                 <Calendar className="h-8 w-8 text-slate-300" />
                             </div>
                             <div>
                                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Expected Delivery</h4>
                                 {isEditing ? (
                                     <input type="date" name="expectedAt" defaultValue={job.expectedAt ? new Date(job.expectedAt).toISOString().split('T')[0] : ''} className="bg-slate-50 p-3 rounded-2xl text-base font-black w-full outline-none focus:ring-4 focus:ring-indigo-50 mt-1" />
                                 ) : (
                                     <p className="text-3xl font-[600] text-slate-900 tracking-tighter uppercase">{job.expectedAt ? new Date(job.expectedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : "-- --- ----"}</p>
                                 )}
                             </div>
                         </div>
                         <div className="hidden md:block w-px h-12 bg-slate-50" />
                         <div className="text-center md:text-right">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Machine Availability</p>
                             <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-xs">Workshop Priority Alpha</span>
                             </div>
                         </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
