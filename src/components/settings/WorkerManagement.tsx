"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Users, X, Loader2, Edit2, Check } from "lucide-react";
import { getWorkers, createWorker, updateWorker, deleteWorker } from "@/lib/actions";

type Worker = {
    id: string;
    name: string;
    createdAt: string; // The action returns Date object actually, prisma dates are Date objects. But JSON serialization might make them strings if passed from server component to client component via props. Here we call action directly so we get Date objects.
    updatedAt: string;
};

// We don't need shopId prop necessarily if action uses session, but helpful for validation context if needed.
export default function WorkerManagement({ shopId }: { shopId: string }) {
    const [workers, setWorkers] = useState<any[]>([]); // Relax type for now as Date vs string is tricky with actions
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    // Fetch workers on mount
    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const data = await getWorkers();
            setWorkers(data);
        } catch (err) {
            console.error("Failed to fetch workers:", err);
        }
    };

    const handleAddWorker = async () => {
        const trimmedName = inputValue.trim();
        if (!trimmedName) return;

        setLoading(true);
        setError("");

        try {
            const newWorker = await createWorker(trimmedName);
            setWorkers([...workers, newWorker]);
            setInputValue("");
        } catch (err: any) {
            setError(err.message || "Failed to add worker");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAddWorker();
        }
    };

    const handleDeleteWorker = async (id: string) => {
        if (!confirm("Are you sure you want to delete this worker?")) return;

        try {
            await deleteWorker(id);
            setWorkers(workers.filter((w) => w.id !== id));
        } catch (err) {
            alert("Failed to delete worker");
        }
    };

    const startEditing = (worker: Worker) => {
        setEditingId(worker.id);
        setEditValue(worker.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveEdit = async (id: string) => {
        const trimmedName = editValue.trim();
        if (!trimmedName) {
            cancelEditing();
            return;
        }

        try {
            await updateWorker(id, trimmedName);
            setWorkers(workers.map((w) => (w.id === id ? { ...w, name: trimmedName } : w)));
            cancelEditing();
        } catch (err: any) {
            alert(err.message || "Failed to rename worker");
        }
    };

    const handleEditKeyPress = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === "Enter") {
            saveEdit(id);
        } else if (e.key === "Escape") {
            cancelEditing();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    <Users className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Workers Management</h2>
                    <p className="text-sm text-slate-400">Manage your team members</p>
                </div>
            </div>

            {/* Add Worker Input */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter worker name and press Enter"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-slate-900"
                        disabled={loading}
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
            </div>

            {/* Workers List */}
            <div className="space-y-3">
                {workers.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No workers added yet</p>
                        <p className="text-xs mt-1">Add your first worker above</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {workers.map((worker) => (
                            <div
                                key={worker.id}
                                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full transition-all hover:shadow-md hover:scale-105"
                            >
                                {editingId === worker.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => handleEditKeyPress(e, worker.id)}
                                            className="bg-white px-2 py-1 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-w-[120px]"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => saveEdit(worker.id)}
                                            className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                        >
                                            <Check className="h-3 w-3 text-green-600" />
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                        >
                                            <X className="h-3 w-3 text-red-600" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm font-medium text-purple-900">
                                            {worker.name}
                                        </span>
                                        <button
                                            onClick={() => startEditing(worker)}
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-blue-100 rounded-full transition-all"
                                        >
                                            <Edit2 className="h-3 w-3 text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWorker(worker.id)}
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-full transition-all"
                                        >
                                            <X className="h-3 w-3 text-red-600" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                    💡 <span className="font-semibold">Tip:</span> Click worker name to rename, or hover to delete
                </p>
            </div>
        </div>
    );
}
