"use client";

import { useState } from "react";
import { updateWarrantyNote } from "@/lib/actions";
import { Loader2, Save, Lock, Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivateNoteEditor({ warrantyId, initialNote }: { warrantyId: string, initialNote: string | null }) {
    const [note, setNote] = useState(initialNote || "");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateWarrantyNote(warrantyId, note);
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to save note");
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        if (note && note.trim().length > 0) {
            return (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 mt-6 group">
                    <div className="flex items-center justify-between mb-3">
                         <h3 className="flex items-center gap-2 font-bold text-yellow-600">
                            <Lock className="w-4 h-4" /> Internal Shop Note
                         </h3>
                         <button 
                            onClick={() => setIsEditing(true)}
                            className="p-2 hover:bg-yellow-500/10 rounded-full text-yellow-600 transition-colors"
                            title="Edit Note"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {note}
                    </p>
                </div>
            );
        }

        return (
             <div className="mt-6">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors border border-dashed border-border px-4 py-3 rounded-xl w-full justify-center hover:bg-muted/50 hover:border-primary/50"
                >
                    <Plus className="w-4 h-4" />
                    Add Private Note
                </button>
             </div>
        );
    }

    return (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 mt-6 animate-fade-in">
            <h3 className="flex items-center gap-2 font-bold text-yellow-600 mb-3">
                <Lock className="w-4 h-4" /> Editing Note
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
                This note is only visible to you. The customer will NOT see this on their certificate.
            </p>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Broken screen was very severe, warned customer about battery health..."
                className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm text-muted-foreground"
                autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
                <button 
                    onClick={() => {
                        setIsEditing(false);
                        setNote(initialNote || ""); // Reset to original if cancelled
                    }}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Note
                </button>
            </div>
        </div>
    );
}
