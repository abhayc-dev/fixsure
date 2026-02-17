"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { verifyAccessPin, setAccessPin } from "@/lib/actions";

export default function PinModal({
    onClose,
    onSuccess,
    mode
}: {
    onClose: () => void,
    onSuccess: () => void,
    mode: 'SET' | 'VERIFY'
}) {
    const [pin, setPin] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInput = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto focus next
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullPin = pin.join("");
        if (fullPin.length !== 4) {
            setError("Please enter a 4-digit PIN");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (mode === 'SET') {
                const res = await setAccessPin(fullPin);
                if (!res.success) throw new Error(res.error);
            } else {
                const res = await verifyAccessPin(fullPin);
                if (!res.success) throw new Error(res.error);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed");
            setPin(["", "", "", ""]);
            document.getElementById('pin-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 animate-scale-in p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-primary">
                        {mode === 'SET' ? "Set Security PIN" : "Enter Security PIN"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full hover:text-red-500 cursor-pointer transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center text-sm text-slate-500">
                        {mode === 'SET'
                            ? "Create a 4-digit PIN to hide your revenue from others."
                            : "Enter your PIN to view hidden revenue details."
                        }
                    </div>

                    <div className="flex justify-center gap-4">
                        {pin.map((digit, i) => (
                            <input
                                key={i}
                                id={`pin-${i}`}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInput(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none focus:bg-white transition-all text-slate-900"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-xs text-red-500 text-center font-bold animate-shake p-2 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || pin.some(p => !p)}
                        className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {mode === 'SET' ? "Set PIN" : "Verify PIN"}
                    </button>
                </form>
            </div>
        </div>
    );
}
