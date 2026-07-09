"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/clients";


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
            <div className="flex h-screen items-center justify-center bg-tp-bg px-4">
                <div className="w-full max-w-sm bg-tp-card border border-tp-border rounded-2xl p-8 text-center">
                    <div className="text-tp-accent text-2xl mb-3">✓</div>
                    <h1 className="font-mono text-base font-bold text-tp-primary mb-2">
                        Nézd meg az emailjeidet
                    </h1>
                    <p className="text-xs text-tp-muted">
                        Küldtünk egy megerősítő linket a(z) <span className="text-tp-sec">{email}</span> címre.
                        A fiókod aktiválásához kattints a linkre.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block mt-6 text-xs text-tp-accent hover:underline"
                    >
                        ← Vissza a bejelentkezéshez
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-tp-bg px-4">
            <div className="w-full max-w-sm bg-tp-card border border-tp-border rounded-2xl p-8">
                <h1 className="font-mono text-lg font-bold text-tp-primary mb-1">
                    Regisztráció
                </h1>
                <p className="text-xs text-tp-muted mb-6">
                    Hozz létre fiókot a perzisztens watchlisthez és az alertekhez
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-[11px] text-tp-sec mb-1.5 uppercase tracking-wide">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-tp-surf border border-tp-border rounded-lg px-3 py-2 text-sm text-tp-primary placeholder:text-tp-muted focus:outline-none focus:border-tp-accent/50"
                            placeholder="te@pelda.hu"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-[11px] text-tp-sec mb-1.5 uppercase tracking-wide">
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
                            className="w-full bg-tp-surf border border-tp-border rounded-lg px-3 py-2 text-sm text-tp-primary placeholder:text-tp-muted focus:outline-none focus:border-tp-accent/50"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-[11px] text-tp-sec mb-1.5 uppercase tracking-wide">
                            Jelszó megerősítése
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-tp-surf border border-tp-border rounded-lg px-3 py-2 text-sm text-tp-primary placeholder:text-tp-muted focus:outline-none focus:border-tp-accent/50"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-tp-red bg-tp-red/10 border border-tp-red/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-tp-accent text-tp-bg font-mono text-sm font-bold rounded-lg py-2.5 hover:shadow-accent-glow transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Regisztráció..." : "Regisztráció"}
                    </button>
                </form>

                <p className="text-xs text-tp-muted mt-6 text-center">
                    Már van fiókod?{" "}
                    <Link href="/login" className="text-tp-accent hover:underline">
                        Bejelentkezés
                    </Link>
                </p>
            </div>
        </div>
    );
}