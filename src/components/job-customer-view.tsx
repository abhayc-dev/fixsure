import { ArrowLeft, Calendar, Smartphone, User, Receipt, MapPin, Wrench, MessageCircle, Trash2, Edit2, Save, X, ChevronRight, Plus, FileText, Loader2, ChevronDown, CheckCircle2, Circle, Package, Banknote, PlusCircle, ShieldCheck, XCircle, Copy, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteJobSheet, updateJobSheetDetails, updateJobStatus } from "@/lib/actions";
import { JobDetailSkeleton } from "@/components/skeletons/job-detail-skeleton";

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

export default function JobCustomerView({ job, shop, onBack, onInvoice }: { job: JobSheet, shop: any, onBack: () => void, onInvoice: () => void }) {
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
    const [statusUpdating, setStatusUpdating] = useState(false);



    // Helper for Motor Data
    const td = job.technicalDetails || {};
    const motor = td?.motor || td;

    const [coilDetails, setCoilDetails] = useState(motor?.coilDetails || {
        running: [{ swg: '', weight: '', turns: '' }],
        starting: [{ swg: '', weight: '', turns: '' }],
        runningTotalWeight: motor?.coilDetails?.runningTotalWeight || '',
        startingTotalWeight: motor?.coilDetails?.startingTotalWeight || '',
        runningGage: motor?.coilDetails?.runningGage || '',
        startingGage: motor?.coilDetails?.startingGage || '',
        runningConnection: motor?.coilDetails?.runningConnection || [],
        startingConnection: motor?.coilDetails?.startingConnection || []
    });

    const [partsReplaced, setPartsReplaced] = useState(motor?.partsReplaced || []);
    const [remarks, setRemarks] = useState(motor?.remarks || '');
    const [warrantyInfo, setWarrantyInfo] = useState(motor?.warrantyInfo || '');

    // Show Skeleton when saving/deleting
    if (loading) {
        return <JobDetailSkeleton />;
    }

    const updateCoilTotalWeight = (type: 'running' | 'starting', value: string) => {
        setCoilDetails((prev: any) => ({
            ...prev,
            [`${type}TotalWeight`]: value
        }));
    };

    const updateCoilGage = (type: 'running' | 'starting', value: string) => {
        setCoilDetails((prev: any) => ({
            ...prev,
            [`${type}Gage`]: value
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

    const updateCoilConnection = (type: 'running' | 'starting', action: 'add' | 'remove', value: string) => {
        setCoilDetails((prev: any) => {
            const current = prev[`${type}Connection`] || [];
            if (action === 'add') {
                if (current.includes(value)) return prev;
                return { ...prev, [`${type}Connection`]: [...current, value] };
            } else {
                return { ...prev, [`${type}Connection`]: current.filter((v: string) => v !== value) };
            }
        });
    };

    const copyConnectionToStarting = () => {
        setCoilDetails((prev: any) => ({
            ...prev,
            startingConnection: [...(prev.runningConnection || [])]
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
        const isMotor = job.category === 'MOTOR';
        const itemLabel = isMotor ? 'Machine' : 'Device';
        const emoji = isMotor ? String.fromCodePoint(0x2699) : String.fromCodePoint(0x1F4F1); // ⚙️ vs 📱

        // Build Parts List for WhatsApp (Only for Ready/Delivered)
        let partsSection = "";
        if (isMotor && partsReplaced.length > 0 && (job.status === 'READY' || job.status === 'DELIVERED')) {
            partsSection = `\n${String.fromCodePoint(0x1F6E0)} *Parts Replaced:*\n` +
                partsReplaced.map((p: any) => `  • ${p.name} (x${p.qty})`).join('\n') + "\n";
        }

        let statusMsg = "";
        if (isMotor) {
            switch (job.status) {
                case 'RECEIVED':
                    statusMsg = `${String.fromCodePoint(0x1F4E5)} *We have received your machine for service.* Our technicians will start the inspection shortly.`;
                    break;
                case 'IN_PROGRESS':
                    statusMsg = `${String.fromCodePoint(0x2692)} *Technician is working on your machine.* We are ensuring the highest quality in repair.`;
                    break;
                case 'READY':
                    statusMsg = `${String.fromCodePoint(0x2705)} *Repair Successful!* Your machine has been fully serviced and tested. It is now ready for pickup.\n\n${String.fromCodePoint(0x1F4B5)} *Pending Balance:* ₹${balance}`;
                    break;
                case 'DELIVERED':
                    statusMsg = `${String.fromCodePoint(0x1F4E6)} *Job Finalized.* The machine has been delivered and all dues have been cleared. Thank you for choosing us!`;
                    break;
                case 'CANCELLED':
                    statusMsg = `${String.fromCodePoint(0x274C)} *This job has been cancelled.* Please contact us to coordinate the return of your machine.`;
                    break;
            }
        }

        const messageContent = isMotor ? (
            `${String.fromCodePoint(0x1F44B)} Hello *${job.customerName}*,\n\n` +
            `*JOB UPDATE:* ${job.jobId}\n` +
            `--------------------------------\n` +
            `${String.fromCodePoint(0x2699)} *Machine Type:* ${job.deviceType || 'General'}\n` +
            `${String.fromCodePoint(0x231B)} *Serial / Model:* ${job.deviceModel}\n` +
            `${String.fromCodePoint(0x1F4CA)} *Status:* *${job.status.replace('_', ' ')}*\n` +
            partsSection +
            `\n${statusMsg}` +
            `\n\n--------------------------------\n` +
            `*${shop?.shopName || 'Best Service & Repairing'}*\n` +
            `Quality you can trust! ${String.fromCodePoint(0x1F64F)}`
        ) : (
            `${String.fromCodePoint(0x1F44B)} Hello *${job.customerName}*,\n\n` +
            `Update regarding your repair (Job ID: ${job.jobId}):\n\n` +
            `${emoji} *${itemLabel}:* ${job.deviceModel}\n` +
            `${String.fromCodePoint(0x1F4CA)} *Status:* *${job.status.replace('_', ' ')}*\n` +
            (job.status === 'READY' ? `\n${String.fromCodePoint(0x1F4B0)} *Bill Amount:* ₹${total}\n${String.fromCodePoint(0x2705)} *Your ${itemLabel.toLowerCase()} is READY for pickup!*\n` : '') +
            `\n--------------------------------\n` +
            `*${shop?.shopName || 'Best Service & Repairing'}*\n` +
            `Thank you for trusting us! ${String.fromCodePoint(0x1F64F)}`
        );

        window.open(`https://api.whatsapp.com/send?phone=${job.customerPhone.replace(/\D/g, '')}&text=${encodeURIComponent(messageContent)}`, '_blank');
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
        const formData = new FormData(e.currentTarget);
        const estimate = parseFloat(formData.get("estimatedCost") as string) || 0;
        const paid = parseFloat(formData.get("advanceAmount") as string) || 0;

        if (paid > estimate) {
            alert("Bhai, received amount total bill se zyada nahi ho sakta!");
            return;
        }

        setLoading(true);
        try {
            await updateJobSheetDetails(formData);
            router.refresh();
            setIsCoilEditing(false);
            setIsPartsEditing(false);
            setIsTechEditing(false);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("Failed to update job details.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === job.status) return;
        setStatusUpdating(true);
        try {
            await updateJobStatus(job.id, newStatus);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to update status.");
        } finally {
            setStatusUpdating(false);
        }
    };

    // Helper for Motor Data (Already handled above)

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20 px-4 md:px-6">

            {/* --- TOP BAR & NAVIGATION (STICKY) --- */}
            <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200/50 -mx-4 md:-mx-6 px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-bold transition-all group w-fit cursor-pointer"
                >
                    <div className="p-2.5 bg-white border border-slate-100 rounded-2xl group-hover:border-slate-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span className="text-sm tracking-tight opacity-80 group-hover:opacity-100">Back to Dashboard</span>
                </button>

                <div className="flex items-center gap-3">
                    {!(isEditing || isTechEditing || isCoilEditing || isPartsEditing) ? (
                        <div className="flex items-center gap-3 bg-white/50 p-1.5 rounded-[20px] border border-slate-100 shadow-sm ">
                            <button
                                onClick={() => setIsDeleting(true)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 cursor-pointer"
                                title="Delete Job"
                                type="button"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                            <div className="w-px h-6 bg-slate-200" />
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                                type="button"
                            >
                                <Edit2 className="h-4 w-4 text-primary" /> Edit Job
                            </button>
                            <button
                                onClick={onInvoice}
                                className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                                type="button"
                            >
                                <Printer className="h-4 w-4 text-emerald-500" /> Invoice
                            </button>
                            <button
                                onClick={handleNotify}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 duration-200 cursor-pointer"
                                type="button"
                            >
                                <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setIsTechEditing(false);
                                    setIsCoilEditing(false);
                                    setIsPartsEditing(false);
                                }}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="job-edit-form"
                                disabled={loading}
                                className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all active:scale-95 duration-200 cursor-pointer"
                            >
                                <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* --- DELETE CONFIRMATION --- */}
            {isDeleting && (
                <div className="bg-slate-900 text-white rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden relative">
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

            <form id="job-edit-form" onSubmit={handleUpdate} className="flex flex-col lg:flex-row gap-6 items-start">
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="status" value={job.status} />
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
                    {/* Compact SLA Timeline */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Calendar className="h-4 w-4" /></div>
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Job Life-Cycle</span>
                        </div>

                        <div className="relative pl-6 space-y-10">
                            {/* Track Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

                            {/* Intake Node */}
                            <div className="relative">
                                <div className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white bg-indigo-500 shadow-sm" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 leading-none mb-1">IN-DATE (READ ONLY)</span>
                                    <span className="text-[13px] font-mono font-black text-slate-800">
                                        {(() => {
                                            const date = new Date(job.receivedAt);
                                            const day = date.getDate().toString().padStart(2, '0');
                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                            return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
                                        })()}
                                    </span>
                                </div>
                            </div>

                            {/* Current Status Node */}
                            <div className="relative">
                                <div className={cn(
                                    "absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white shadow-sm animate-pulse",
                                    job.status === 'READY' ? "bg-emerald-500" : "bg-indigo-400"
                                )} />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 leading-none mb-1">CURRENT STATUS</span>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit tracking-widest uppercase">{job.status.replace('_', ' ')}</span>
                                </div>
                            </div>

                            {/* Delivery Node */}
                            <div className="relative">
                                <div className={cn(
                                    "absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white shadow-sm",
                                    job.status === 'DELIVERED' ? "bg-emerald-500" : "bg-slate-200"
                                )} />
                                <div className="flex flex-col text-slate-400">
                                    <span className="text-[9px] font-bold text-indigo-500 leading-none mb-1">TARGET RETURN</span>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="expectedAt"
                                            defaultValue={job.expectedAt ? new Date(job.expectedAt).toISOString().split('T')[0] : ''}
                                            className="bg-slate-50 p-2 rounded-lg text-xs font-bold w-full outline-none border border-slate-100 mt-1 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                                        />
                                    ) : (
                                        <span className="text-[13px] font-mono font-black text-slate-800">
                                            {job.expectedAt ? (() => {
                                                const date = new Date(job.expectedAt);
                                                const day = date.getDate().toString().padStart(2, '0');
                                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
                                            })() : 'NOT SCHEDULED'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Specs Chip */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Wrench className="h-4 w-4" /></div>
                            <span className="text-[10px] font-black text-slate-400 tracking-widest">Asset Metadata</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 leading-none mb-1.5">Machine Type</span>
                                {isEditing ? (
                                    <select name="deviceType" defaultValue={job.deviceType || ''} className="bg-slate-50 p-2 rounded-lg text-xs font-bold outline-none border border-slate-200 text-slate-600">
                                        {['MONO_BLOCK', 'SUBMERSIBLE', 'SEWELL', 'ELECTRIC_MOTOR', 'GENERATOR', 'STABILIZER', 'OTHER'].map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                                    </select>
                                ) : (
                                    <span className="text-xs font-black text-slate-800 leading-tight italic">{job.deviceType || 'General'}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 leading-none mb-1.5">Serial / Model</span>
                                {isEditing ? (
                                    <input name="deviceModel" defaultValue={job.deviceModel} className="bg-slate-50 p-2 rounded-lg text-xs font-bold outline-none border border-slate-200 text-slate-600" />
                                ) : (
                                    <span className="text-xs font-black text-slate-800 leading-tight italic">{job.deviceModel}</span>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Problem Description Card */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><FileText className="h-4 w-4" /></div>
                            <span className="text-[10px] font-black text-slate-400 tracking-widest">Reported Issue</span>
                        </div>
                        {isEditing ? (
                            <textarea
                                name="problemDesc"
                                defaultValue={job.problemDesc}
                                className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none border border-slate-100 min-h-[100px] focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                            />
                        ) : (
                            <p className="text-xs font-black text-slate-800 leading-relaxed italic">"{job.problemDesc}"</p>
                        )}
                    </div>


                </div>

                {/* --- MAIN CANVAS (THE BODY) --- */}
                <div className="flex-1 space-y-5">

                    {/* Customer Identity Section (Wide Asymmetric) */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="h-20 w-20 bg-indigo-50 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg group-hover:bg-indigo-100 transition-colors">
                                    <User className="h-8 w-8 text-indigo-500" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                            </div>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <div className="flex flex-col gap-2">
                                        <input name="customerName" defaultValue={job.customerName} className="text-2xl font-black text-slate-900 tracking-tighter outline-none border-b-2 border-slate-100 focus:border-indigo-400 transition-all font-outfit" />
                                        <input name="customerPhone" defaultValue={job.customerPhone} className="text-xl font-bold text-slate-400 outline-none border-b-2 border-slate-100 focus:border-indigo-400 font-mono" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{job.customerName}</h1>
                                            <div className="h-4 w-px bg-slate-200" />
                                            <span className="text-[15px] font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{job.jobId}</span>
                                        </div>
                                        <div className="flex items-center gap-6 mt-2">
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                                <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                                                <span className="text-[15px] font-mono tracking-tight">{job.customerPhone}</span>
                                            </div>

                                            <div className="relative group/status h-7 min-w-[120px]">
                                                {statusUpdating && (
                                                    <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                                                        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                                                    </div>
                                                )}
                                                <select
                                                    disabled={statusUpdating}
                                                    value={job.status}
                                                    onChange={(e) => handleStatusChange(e.target.value)}
                                                    className={cn(
                                                        "appearance-none cursor-pointer h-full px-3 rounded-lg text-[9px] font-black tracking-widest outline-none transition-all w-full text-center border border-transparent shadow-sm",
                                                        job.status === 'READY' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                            job.status === 'DELIVERED' ? "bg-emerald-500 text-white" :
                                                                job.status === 'CANCELLED' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                                    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                                                    )}
                                                >
                                                    {['RECEIVED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'].map(s => (
                                                        <option key={s} value={s} className="bg-white text-slate-900 font-bold">{s.replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <ChevronDown className="h-2.5 w-2.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:block w-[1px] h-16 bg-slate-100" />

                        <div className="flex flex-col items-end gap-2 text-right">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <label className="text-[13px] font-black text-slate-800 tracking-widest text-right block italic">Customer Address</label>
                                    <textarea name="customerAddress" defaultValue={job.customerAddress || ''} className="text-right text-sm font-bold text-slate-500 outline-none border-b-2 border-slate-100 focus:border-indigo-400 bg-transparent min-w-[200px]" rows={2} />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 text-primary font-black text-[12px] tracking-widest">
                                        <MapPin className="h-4 w-4 text-indigo-400" /> Registered Location
                                    </div>
                                    <p className="text-slate-500 font-bold text-sm max-w-[240px] leading-tight">{job.customerAddress || 'Location details pending'}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Technical Parameter Cluster */}
                    {job.category === 'MOTOR' && (
                        <div className="space-y-6">
                            {/* Motor Specification Section */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-1 bg-indigo-500 rounded-full" />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 tracking-tighter leading-none">Motor Details</h3>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1">Motor Specification Details</p>
                                        </div>
                                    </div>
                                    {isTechEditing ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsTechEditing(false)}
                                                className="px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={cn(
                                                    "px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 border shadow-sm cursor-pointer",
                                                    "bg-indigo-500 text-white border-indigo-600",
                                                    loading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Save Metadata</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsTechEditing(true);
                                            }}
                                            disabled={loading}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-bold tracking-widest transition-all flex items-center gap-2 border shadow-sm cursor-pointer",
                                                "bg-white text-indigo-500 border-slate-100 hover:bg-slate-50",
                                                loading && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <Edit2 className="h-4 w-4" /> Edit Data
                                        </button>
                                    )}
                                </div>
                                <div className="p-5 space-y-5">
                                    {/* Electrical Specs */}
                                    <div className="space-y-6">

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6">
                                            {[
                                                { label: 'Power Rating', name: 'motor.power', value: motor?.power, unit: motor?.power_unit || 'HP', isPower: true },
                                                { label: 'Speed Index', name: 'motor.speed', value: motor?.speed, unit: 'RPM' },
                                                { label: 'Capacitance', name: 'motor.capacitor', value: motor?.capacitor, unit: 'MFD' },
                                                { label: 'System Phase', name: 'motor.phase', value: motor?.phase || 'Single (Φ)', options: ['Single (Φ)', 'Double (Φ, Φ)', 'Triple (Φ, Φ, Φ)'] },
                                                { label: 'Current Load', name: 'motor.current', value: motor?.current, unit: 'AMP' },
                                                { label: 'Starter Length', name: 'motor.starter_length', value: motor?.starter_length, unit: 'INCH' },
                                                { label: 'Starter Diameter', name: 'motor.starter_diameter', value: motor?.starter_diameter, unit: 'INCH' }
                                            ].map((field, idx) => (
                                                <div key={idx} className="space-y-2 group/item">
                                                    <label className="text-[10px] font-bold text-slate-400 tracking-wider block">{field.label}</label>
                                                    <div className="flex items-baseline gap-2">
                                                        {isEditing || isTechEditing ? (
                                                            field.isPower ? (
                                                                <div className="flex gap-1 border-b-2 border-slate-100 focus-within:border-indigo-400 transition-all w-full">
                                                                    <input name="motor.power" defaultValue={motor?.power || ''} className="w-full bg-transparent outline-none text-lg font-black text-indigo-500 py-1" />
                                                                    <select name="motor.power_unit" defaultValue={motor?.power_unit || 'HP'} className="bg-transparent text-[10px] font-black text-slate-400 outline-none">
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
                                                            <span className="text-[15px] font-bold text-slate-800 tracking-tighter leading-none">
                                                                {field.value || '---'}
                                                            </span>
                                                        )}
                                                        {field.unit && !field.isPower && <span className="text-[9px] font-bold text-slate-400 italic">{field.unit}</span>}
                                                        {field.isPower && !isEditing && !isTechEditing && <span className="text-[9px] font-bold text-slate-400 italic">{field.unit}</span>}
                                                    </div>

                                                </div>
                                            ))}

                                        </div>

                                    </div>


                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-1 bg-indigo-400 rounded-full" />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 tracking-tighter leading-none">Coil Details</h3>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1">Coil Specification</p>
                                        </div>
                                    </div>
                                    {isCoilEditing ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsCoilEditing(false)}
                                                className="px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={cn(
                                                    "px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 border shadow-sm cursor-pointer",
                                                    "bg-emerald-500 text-white border-emerald-600",
                                                    loading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Save Configuration</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsCoilEditing(true);
                                            }}
                                            disabled={loading}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 border shadow-sm cursor-pointer",
                                                "bg-white text-indigo-500 border-slate-100 hover:bg-slate-50",
                                                loading && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <Edit2 className="h-4 w-4" /> Edit Coil Data
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-slate-100 gap-6 lg:gap-0">
                                    {['running', 'starting'].map((type) => (
                                        <div key={type} className={cn("space-y-4", type === 'starting' ? "lg:pl-5" : "lg:pr-5")}>
                                            <div className="flex items-center justify-center">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("px-3 py-1 rounded-lg text-[12px] font-black capitalize", type === 'running' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600")}>
                                                        {type} Stage
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Coil Details Row Container */}
                                                <div className="space-y-4 ml-12 ">
                                                    {(type === 'running' ? coilDetails.running : coilDetails.starting).map((row: any, i: number) => (
                                                        <div key={i} className="flex flex-row items-center gap-3">
                                                            <div className="flex flex-row items-end gap-3">
                                                                {/* Turns Column */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    {i === 0 && (
                                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider block">Turns (T)</span>
                                                                    )}
                                                                    <input
                                                                        value={row.turns}
                                                                        onChange={(e) => updateCoilRow(type as any, i, 'turns', e.target.value)}
                                                                        disabled={!isEditing && !isCoilEditing}
                                                                        placeholder="0"
                                                                        className="w-20 h-10 bg-gray-50 text-slate-900 rounded-xl text-center font-black text-[15px] outline-none border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm font-bold tracking-wider block"
                                                                    />
                                                                </div>

                                                                {/* Minus Symbol */}
                                                                <div className="pb-3">
                                                                    <span className="text-xl text-slate-400 select-none justify-center items-center">-</span>
                                                                </div>

                                                                {/* Wire Column */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    {i === 0 && (
                                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider block">Wire (SWG)</span>
                                                                    )}
                                                                    <input
                                                                        value={row.swg}
                                                                        onChange={(e) => updateCoilRow(type as any, i, 'swg', e.target.value)}
                                                                        disabled={!isEditing && !isCoilEditing}
                                                                        placeholder="0"
                                                                        className="w-20 h-10 bg-gray-50 text-slate-900 rounded-xl text-center font-black text-[15px] outline-none border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm font-bold tracking-wider block"
                                                                    />
                                                                </div>

                                                                {/* Equals Symbol */}
                                                                <div className="pb-3">
                                                                    <span className="text-xl text-slate-400 select-none justify-center items-center">=</span>
                                                                </div>

                                                                {/* Weight Column */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    {i === 0 && (
                                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider block">Weight (KG)</span>
                                                                    )}
                                                                    <input
                                                                        value={row.weight}
                                                                        onChange={(e) => updateCoilRow(type as any, i, 'weight', e.target.value)}
                                                                        disabled={!isEditing && !isCoilEditing}
                                                                        placeholder="0"
                                                                        className="w-20 h-10 bg-gray-50 text-slate-900 rounded-xl text-center font-black text-[15px] outline-none border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm font-bold tracking-wider block"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Remove Button */}
                                                            {(isEditing || isCoilEditing) && (
                                                                <div className={cn("shrink-0", i === 0 ? "pt-6" : "pt-0")}>
                                                                    <button type="button" onClick={() => removeCoilRow(type as any, i)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                                                                        <X className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {(isEditing || isCoilEditing) && (
                                                    <button type="button" onClick={() => addCoilRow(type as any)} className="w-full py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 transition-all group cursor-pointer">
                                                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                                        <span className="text-[10px] font-black tracking-widest">Add New</span>
                                                    </button>
                                                )}

                                            </div>

                                            <div className="mt-2 pt-2 border-t border-slate-50 space-y-4 flex flex-row justify-start gap-8 mb-[-6px]">
                                                <div className="flex flex-col gap-2 ml-12">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider block pl-6">Gage</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            value={(type === 'running' ? coilDetails.runningGage : coilDetails.startingGage) || ''}
                                                            onChange={(e) => updateCoilGage(type as any, e.target.value)}
                                                            disabled={!isEditing && !isCoilEditing}
                                                            placeholder="0"
                                                            className="w-20 h-10 bg-gray-50 text-slate-900 rounded-xl text-center font-black text-[15px] outline-none border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm font-bold tracking-wider block"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider block">Total Weight</span>

                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            value={(type === 'running' ? coilDetails.runningTotalWeight : coilDetails.startingTotalWeight) || ''}
                                                            onChange={(e) => updateCoilTotalWeight(type as any, e.target.value)}
                                                            disabled={!isEditing && !isCoilEditing}
                                                            placeholder="0.00"
                                                            className="w-20 h-10 bg-gray-50 text-indigo-600 rounded-xl text-center font-black text-[15px] outline-none border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm"
                                                        />
                                                        <span className="text-[10px] font-black text-slate-400">KG</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Connection Type Section */}
                                            <div className="mt-2 pt-2 border-t border-slate-50 space-y-3">
                                                <div className="flex flex-col gap-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 font-black text-slate-700 text-sm">
                                                            <span>Connection Type</span>
                                                        </div>
                                                        {type === 'starting' && (isEditing || isCoilEditing) && (
                                                            <button
                                                                type="button"
                                                                onClick={copyConnectionToStarting}
                                                                className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-500 rounded-md text-[9px] font-black hover:bg-indigo-100 transition-all border border-indigo-100/50"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                                COPY FROM RUNNING
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-slate-50/50 rounded-2xl border border-slate-100 items-center">
                                                        {(coilDetails[`${type}Connection`] || []).map((conn: string, idx: number) => (
                                                            <div key={idx} className={cn(
                                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black shadow-sm border animate-in zoom-in duration-200",
                                                                idx % 3 === 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                    idx % 3 === 1 ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                                        "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                            )}>
                                                                {conn}
                                                                {(isEditing || isCoilEditing) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateCoilConnection(type as any, 'remove', conn)}
                                                                        className="hover:scale-110 transition-transform cursor-pointer"
                                                                    >
                                                                        <XCircle className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {(isEditing || isCoilEditing) && (
                                                            <input
                                                                placeholder="Add connection..."
                                                                className="flex-1 bg-transparent outline-none text-[10px] font-bold text-slate-600 min-w-[100px] ml-1 placeholder:text-slate-300"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        const val = e.currentTarget.value.trim();
                                                                        if (val) {
                                                                            updateCoilConnection(type as any, 'add', val);
                                                                            e.currentTarget.value = '';
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                        {!(isEditing || isCoilEditing) && (coilDetails[`${type}Connection`] || []).length === 0 && (
                                                            <span className="text-[10px] font-medium text-slate-300 italic px-2">Not specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Parts Replacement Section */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mt-6">
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-1 bg-rose-400 rounded-full" />
                                        <div>
                                            <h3 className="text-lg font-[1000] text-slate-800 tracking-tighter leading-none">Parts Replaced</h3>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1">Component Lifecycle Management</p>
                                        </div>
                                    </div>
                                    {isPartsEditing ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsPartsEditing(false)}
                                                className="px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={cn(
                                                    "px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 border shadow-sm cursor-pointer",
                                                    "bg-rose-500 text-white border-rose-600",
                                                    loading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Finalize Inventory</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsPartsEditing(true);
                                            }}
                                            disabled={loading}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 border shadow-sm cursor-pointer",
                                                "bg-white text-rose-500 border-slate-100 hover:bg-slate-50",
                                                loading && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <Edit2 className="h-4 w-4" /> Edit Parts
                                        </button>
                                    )}
                                </div>
                                <div className="p-5 space-y-5">
                                    <div className="grid grid-cols-12 gap-6 px-4 mb-2">
                                        <span className="col-span-6 text-[9px] font-black text-slate-500 tracking-widest">Part Name / Description</span>
                                        <span className="col-span-2 text-[9px] font-black text-slate-500 tracking-widest text-center">Qty</span>
                                        <span className="col-span-3 text-[9px] font-black text-slate-500 tracking-widest text-right">Price (₹)</span>
                                        <span className="col-span-1"></span>
                                    </div>

                                    {partsReplaced.length === 0 && !isPartsEditing && (
                                        <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">No parts replaced yet</p>
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
                                                        <button type="button" onClick={() => removePartRow(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
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
                                            className="w-full py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 transition-all group cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                            <span className="text-[10px] font-black tracking-widest">Add New Component</span>
                                        </button>
                                    )}

                                    {/* Remarks & Warranty Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-100">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><MessageCircle className="h-4 w-4" /></div>
                                                <span className="text-[10px] font-black text-slate-400 tracking-widest">Owner Remarks</span>
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
                                                <span className="text-[10px] font-black text-slate-400 tracking-widest">Service Warranty</span>
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
                                                    <span className="text-sm font-black text-emerald-700">{warrantyInfo || 'No warranty issued'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial/Meta Row (Improved Payment Tracker) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        <div className="lg:col-span-12 bg-slate-900 text-white rounded-3xl p-5 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mt-64" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                        <Banknote className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-black text-indigo-300/50 tracking-[0.4em]">Accounting Ledger</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">Payment Tracking & Settlement</p>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-8 items-start">
                                    {/* Balance Focus */}
                                    <div className="flex-1 space-y-6">
                                        <span className="text-[11px] font-black text-slate-500 tracking-widest block">Collect At Delivery</span>
                                        <div className="flex items-baseline gap-5">
                                            <h2 className="text-4xl font-black tracking-tighter leading-none bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
                                                ₹{(job.status === 'DELIVERED' ? 0 : balance).toLocaleString()}
                                            </h2>
                                            {(job.status === 'DELIVERED' || balance === 0) && (
                                                <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-2 animate-in zoom-in duration-500">
                                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                                    <span className="text-[11px] font-black text-emerald-400 tracking-widest uppercase">Settled</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 pt-6 max-w-md">
                                            <div className="flex justify-between text-[10px] font-black tracking-widest">
                                                <span className="text-emerald-400">Total Paid: ₹{advance.toLocaleString()}</span>
                                                <span className="text-slate-500">Service Fee: ₹{total.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                                    style={{ width: `${Math.min((advance / total) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Breakdown Side */}
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-6 min-w-[280px]">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-500 tracking-widest block">Total Job Bill</span>
                                            {isEditing ? (
                                                <input name="estimatedCost" type="number" defaultValue={job.estimatedCost || 0} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono font-black text-white text-lg outline-none focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20" />
                                            ) : (
                                                <p className="text-2xl font-black tracking-tighter text-white/90">₹{total.toLocaleString()}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-emerald-500 tracking-widest block">Total Received</span>
                                            </div>
                                            {isEditing ? (
                                                <input name="advanceAmount" type="number" defaultValue={job.advanceAmount || 0} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono font-black text-emerald-400 text-lg outline-none focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20" />
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <p className="text-2xl font-black tracking-tighter text-emerald-400">₹{advance.toLocaleString()}</p>
                                                    {balance > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsEditing(true)}
                                                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all cursor-pointer"
                                                        >
                                                            <PlusCircle className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-2 pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-600" />
                                                    <span className="text-[10px] font-bold text-slate-500 tracking-tight">
                                                        Opened: {(() => {
                                                            const date = new Date(job.receivedAt);
                                                            const day = date.getDate().toString().padStart(2, '0');
                                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                            return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                <span className="text-[10px] font-bold text-slate-500 tracking-tight">System Ref: #{job.jobId}</span>
                                            </div>
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
