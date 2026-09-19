"use client";

import { useState, useRef, useEffect } from "react";
import { CloseIcon, AlertIcon } from "../ui/icons";

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
            setError("Enter a valid US ticker (1–5 letters)");
            return;
        }

        if (hasTicker(ticker)) {
            setError(`${ticker} is already on your watchlist`);
            return;
        }

        // Check if the ticker actually exists
        setStatus("validating");
        setError("");

        try {
            const res = await fetch(`/api/profile/${ticker}`);

            if (!res.ok) {
                setStatus("error");
                setError(`"${ticker}" not found — check the ticker symbol`);
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
            setError("Network error — try again");
        }
    }

    const isValidating = status === "validating";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-tp-ink/40 backdrop-blur-sm" />

            {/* Modal */}
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-tp-surf border border-tp-line rounded-sm p-6 w-full max-w-sm animate-slide-in shadow-lg"
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-serif text-lg font-semibold text-tp-ink">
                        Add to watchlist
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-tp-ink2 hover:text-tp-ink transition-colors"
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-[11px] text-tp-ink2 mb-2">
                        Ticker symbol
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
                        className="w-full bg-tp-paper border border-tp-line rounded-sm px-4 py-3 font-mono text-sm text-tp-ink placeholder:text-tp-ink3 focus:outline-none focus:border-tp-teal/60 focus:ring-1 focus:ring-tp-teal/20 transition-all disabled:opacity-50"
                    />
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 px-3 py-2.5 bg-tp-rust/[0.08] border border-tp-rust/30 rounded-sm flex items-start gap-2">
                        <AlertIcon size={14} className="text-tp-rust mt-0.5 flex-shrink-0" />
                        <p className="text-tp-rust text-xs leading-relaxed">{error}</p>
                    </div>
                )}

                {/* Validation in progress */}
                {isValidating && (
                    <div className="mb-4 px-3 py-2.5 bg-tp-teal/[0.05] border border-tp-teal/20 rounded-sm flex items-center gap-2">
                        <div className="w-3 h-3 border border-tp-teal border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <p className="text-tp-teal text-xs">Checking {value}…</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isValidating || !value}
                    className="w-full py-2.5 rounded-sm bg-tp-teal/10 border border-tp-teal/40 text-tp-teal text-sm font-mono font-semibold hover:bg-tp-teal/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isValidating ? "Checking…" : "Add ticker"}
                </button>

                <p className="mt-3 text-center text-[11px] text-tp-ink2">
                    US market ticker symbols, e.g. AAPL, TSLA, MSFT
                </p>
            </form>
        </div>
    );
}