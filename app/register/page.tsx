"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/clients";
import { CheckIcon, ArrowLeftIcon } from "@/components/ui/icons";


const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`A jelszónak legalább ${MIN_PASSWORD_LENGTH} karakter hosszúnak kell lennie.`);
            return;
        }
        if (password !== confirmPassword) {
            setError("A két jelszó nem egyezik.");
            return;
        }

        setLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="flex h-screen items-center justify-center bg-tp-paper px-4">
                <div className="w-full max-w-sm bg-tp-surf border border-tp-line rounded-sm p-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-tp-teal/10 border border-tp-teal/30 flex items-center justify-center text-tp-teal mx-auto mb-4">
                        <CheckIcon size={18} />
                    </div>
                    <h1 className="font-serif text-lg font-semibold text-tp-ink mb-2">
                        Nézd meg az emailjeidet
                    </h1>
                    <p className="text-[13px] text-tp-ink2">
                        Küldtünk egy megerősítő linket a(z) <span className="text-tp-ink">{email}</span> címre.
                        A fiókod aktiválásához kattints a linkre.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 mt-6 text-[13px] text-tp-teal hover:underline"
                    >
                        <ArrowLeftIcon size={12} /> Vissza a bejelentkezéshez
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-tp-paper px-4">
            <div className="w-full max-w-sm bg-tp-surf border border-tp-line rounded-sm p-8">
                <h1 className="font-serif text-xl font-semibold text-tp-ink mb-1">
                    Regisztráció
                </h1>
                <p className="text-[13px] text-tp-ink2 mb-6">
                    Hozz létre fiókot a perzisztens watchlisthez és az alertekhez
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-[11px] text-tp-ink2 mb-1.5">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-tp-paper border border-tp-line rounded-sm px-3 py-2 text-sm text-tp-ink placeholder:text-tp-ink3 focus:outline-none focus:border-tp-teal/60 focus:ring-1 focus:ring-tp-teal/20"
                            placeholder="te@pelda.hu"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-[11px] text-tp-ink2 mb-1.5">
                            Jelszó
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            minLength={MIN_PASSWORD_LENGTH}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-tp-paper border border-tp-line rounded-sm px-3 py-2 text-sm text-tp-ink placeholder:text-tp-ink3 focus:outline-none focus:border-tp-teal/60 focus:ring-1 focus:ring-tp-teal/20"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-[11px] text-tp-ink2 mb-1.5">
                            Jelszó megerősítése
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-tp-paper border border-tp-line rounded-sm px-3 py-2 text-sm text-tp-ink placeholder:text-tp-ink3 focus:outline-none focus:border-tp-teal/60 focus:ring-1 focus:ring-tp-teal/20"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-tp-rust bg-tp-rust/[0.08] border border-tp-rust/20 rounded-sm px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-tp-teal text-tp-surf font-mono text-sm font-semibold rounded-sm py-2.5 hover:bg-tp-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Regisztráció..." : "Regisztráció"}
                    </button>
                </form>

                <p className="text-[13px] text-tp-ink2 mt-6 text-center">
                    Már van fiókod?{" "}
                    <Link href="/login" className="text-tp-teal hover:underline">
                        Bejelentkezés
                    </Link>
                </p>
            </div>
        </div>
    );
}
