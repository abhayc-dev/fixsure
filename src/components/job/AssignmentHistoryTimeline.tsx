"use client";

import { useState, useEffect } from "react";
import { History, Loader2, UserPlus, UserMinus } from "lucide-react";

type Worker = {
    id: string;
    name: string;
};

type HistoryEntry = {
    id: string;
    actionType: "ASSIGNED" | "REMOVED";
    createdAt: string;
    worker: Worker;
};

export default function AssignmentHistoryTimeline({ jobId }: { jobId: string }) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [jobId]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/jobs/${jobId}/workers/history`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch assignment history:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <History className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Assignment History</h3>
                    <p className="text-xs text-slate-400">Track of all worker changes</p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No assignment history yet</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-transparent"></div>

                    {/* History Entries */}
                    <div className="space-y-4">
                        {history.map((entry, index) => (
                            <div key={entry.id} className="relative pl-12 pb-4">
                                {/* Timeline Dot */}
                                <div
                                    className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${entry.actionType === "ASSIGNED"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                        }`}
                                >
                                    {entry.actionType === "ASSIGNED" ? (
                                        <UserPlus className="h-4 w-4" />
                                    ) : (
                                        <UserMinus className="h-4 w-4" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {entry.actionType === "ASSIGNED" ? (
                                                    <span className="text-green-700">
                                                        Assigned to{" "}
                                                        <span className="text-slate-900">{entry.worker.name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-red-700">
                                                        Removed{" "}
                                                        <span className="text-slate-900">{entry.worker.name}</span>
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatDate(entry.createdAt)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${entry.actionType === "ASSIGNED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {entry.actionType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
