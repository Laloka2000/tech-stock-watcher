"use client";

import { useState, useRef, useEffect } from "react";

interface AddTickerModalProps {
    onAdd: (ticker: string) => void;
    onClose: () => void;
    hasTicker: (ticker: string) => boolean;
}

type Status = "idle" | "validating" | "error" | "ok";

export function AddTickerModal({ onAdd, onClose, hasTicker }: AddTickerModalProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const ticker = value.toUpperCase().trim();

        if (!ticker) return;

        if (!/^[A-Z]{1,5}$/.test(ticker)) {
            setError("Érvényes US ticker szükséges (1–5 betű)");
            return;
        }

        if (hasTicker(ticker)) {
            setError(`${ticker} már szerepel a watchlisteden`);
            return;
        }

        // Check if the ticker actually exists
        setStatus("validating");
        setError("");

        try {
            const res = await fetch(`/api/profile/${ticker}`);

            if (!res.ok) {
                setStatus("error");
                setError(`„${ticker}" not found — check ticker symbol`);
                return;
            }

            const data = await res.json();

            // Finnhub returns empty profile for non-existent tickers
            // name AND exchange are both empty/missing — we check both
            const validProfile = !!(data?.profile?.name && data?.profile?.exchange);
            if (!validProfile) {
                setStatus("error");
                setError(`"${ticker}" unknown stock symbol`);
                return;
            }

            // All reasons — add
            setStatus("ok");
            onAdd(ticker);
            onClose();
        } catch {
            setStatus("error");
            setError("Hálózati hiba — próbáld újra");
        }
    }

    const isValidating = status === "validating";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-tp-surf border border-tp-border rounded-2xl p-6 w-full max-w-sm animate-slide-in"
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
                        onChange={(e) => {
                            setValue(e.target.value.toUpperCase());
                            setError("");
                            setStatus("idle");
                        }}
                        placeholder="e.g. NVDA"
                        maxLength={5}
                        disabled={isValidating}
                        className="w-full bg-tp-card border border-tp-border rounded-xl px-4 py-3 font-mono text-sm text-tp-primary placeholder:text-tp-muted focus:outline-none focus:border-tp-accent/50 focus:ring-1 focus:ring-tp-accent/20 transition-all disabled:opacity-50"
                    />
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 px-3 py-2.5 bg-tp-red/10 border border-tp-red/30 rounded-xl flex items-start gap-2">
                        <span className="text-tp-red text-xs mt-0.5">⚠</span>
                        <p className="text-tp-red text-xs leading-relaxed">{error}</p>
                    </div>
                )}

                {/* Validation in progress */}
                {isValidating && (
                    <div className="mb-4 px-3 py-2.5 bg-tp-accent/5 border border-tp-accent/20 rounded-xl flex items-center gap-2">
                        <div className="w-3 h-3 border border-tp-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <p className="text-tp-accent text-xs">Checking: {value}...</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isValidating || !value}
                    className="w-full py-2.5 rounded-xl bg-tp-accent/10 border border-tp-accent/40 text-tp-accent text-xs font-mono font-bold tracking-wide hover:bg-tp-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isValidating ? "Checking..." : "Adding"}
                </button>

                <p className="mt-3 text-center text-[10px] text-tp-muted">
                    US market ticker symbols (pl. AAPL, TSLA, MSFT)
                </p>
            </form>
        </div>
    );
}