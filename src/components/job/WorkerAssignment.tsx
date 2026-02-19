"use client";

import { useState, useEffect } from "react";
import { UserPlus, Loader2, X } from "lucide-react";
import { getWorkers, getJobAssignments, updateJobAssignments, removeJobAssignment } from "@/lib/actions";

type Worker = {
    id: string;
    name: string;
};

type Assignment = {
    id: string;
    worker: Worker;
    assignedAt: string;
};

export default function WorkerAssignment({ jobId }: { jobId: string }) {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all workers for the shop
            const workersData = await getWorkers();
            setWorkers(workersData as any);

            // Fetch current assignments
            const assignmentsData = await getJobAssignments(jobId);
            setAssignments(assignmentsData as any);
            setSelectedWorkerIds(new Set(assignmentsData.map((a: any) => a.worker.id)));
        } catch (err) {
            console.error("Failed to fetch worker data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleWorker = (workerId: string) => {
        const newSelected = new Set(selectedWorkerIds);
        if (newSelected.has(workerId)) {
            newSelected.delete(workerId);
        } else {
            newSelected.add(workerId);
        }
        setSelectedWorkerIds(newSelected);
    };

    const handleApply = async () => {
        setSaving(true);
        try {
            const workerIds = Array.from(selectedWorkerIds);
            await updateJobAssignments(jobId, workerIds);
            
            // Refresh assignments
            await fetchData();
            setIsOpen(false);
        } catch (err) {
            console.error("Failed to update assignments:", err);
            alert("Failed to update worker assignments");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveWorker = async (workerId: string) => {
        try {
            await removeJobAssignment(jobId, workerId);
            await fetchData();
        } catch (err) {
            console.error("Failed to remove worker:", err);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Assigned Workers</h3>
                        <p className="text-xs text-slate-400">Team members working on this job</p>
                    </div>
                </div>

                {workers.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {isOpen ? "Cancel" : "Manage Workers"}
                    </button>
                )}
            </div>

            {/* Current Assignments */}
            {!isOpen && (
                <div className="space-y-2">
                    {assignments.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                            <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No workers assigned yet</p>
                            {workers.length === 0 && (
                                <p className="text-xs mt-1">Add workers in Settings first</p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {assignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full transition-all"
                                >
                                    <span className="text-sm font-medium text-blue-900">
                                        {assignment.worker.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWorker(assignment.worker.id)}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-full transition-all"
                                    >
                                        <X className="h-3 w-3 text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Worker Selection Dropdown */}
            {isOpen && (
                <div className="mt-4 space-y-3">
                    {workers.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                            <p className="text-sm">No workers available</p>
                            <p className="text-xs mt-1">Add workers in Settings page first</p>
                        </div>
                    ) : (
                        <>
                            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3">
                                {workers.map((worker) => (
                                    <label
                                        key={worker.id}
                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedWorkerIds.has(worker.id)}
                                            onChange={() => handleToggleWorker(worker.id)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                            {worker.name}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleApply}
                                disabled={saving}
                                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Apply Changes"
                                )}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
