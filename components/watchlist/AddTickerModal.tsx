"use client";

import { useState, useRef, useEffect } from "react";

interface AddTickerModalProps {
    onAdd: (ticker: string) => void;
    onClose: () => void;
    hasTicker: (ticker: string) => boolean;
}

export function AddTickerModal({ onAdd, onClose, hasTicker}: AddTickerModalProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const ticker = value.toUpperCase().trim();
        if (!ticker) return;
        if (!/^[A-Z]{1,5}$/.test(ticker)) {
            setError("Enter a valid US ticker (1-5 letter)");
            return;
        }
        if (hasTicker(ticker)){
            setError(`${ticker} is already in your watchlist`);
            return;
        }
        onAdd(ticker);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/** Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/** Modal */}
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-tp-surf border border-top-border rounded-2xl p-6 w-full max-w-sm animate-slide-in"
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-mono text-sm font-bold text-tp-primary tracking-wide">
                        Add to Watchlist
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-tp-muted hover:text-tp-primary transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-[10px] text-tp-muted uppercase tracking-widest mb-2">
                        Ticker Symbol
                    </label>
                    <input 
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => {setValue(e.target.value.toUpperCase()); setError("");}}
                        placeholder="e.g NVDA"
                        maxLength={5}
                        className="w-full bg-tp-card border border-tp-border rounded-lg px-4 py-3 font-mono text-sm text-tp-primary placeholder-tp-muted focus:outline-none focus:border-tp-accent/60 transition-colors uppercase"
                    />
                    {error && (
                        <p className="text-tp-red text-xs mt-1.5 font-mono">{error}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-tp-border text-tp-muted text-sm font-medium hover:bg-white/[0.04] transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 px-4 py-2.5 rounded-lg bg-tp-accent/15 border border-tp-accent/40 text-tp-accent text-sm font-bold font-mono hover:bg-tp-accent/20 transition-colors"
                    >
                        Add {value || "Ticker"}
                    </button>
                </div>
            </form> 
        </div>
    );
}