"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/clients";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        setLoading(false);

        if (error) {
            setError("Hibás email cím vagy jelszó.");
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <div className="flex h-screen items-center justify-center bg-tp-bg px-4">
            <div className="w-full max-w-sm bg-tp-card border border-tp-border rounded-2xl p-8">
                <h1 className="font-mono text-lg font-bold text-tp-primary mb-1">
                    Bejelentkezés
                </h1>
                <p className="text-xs text-tp-muted mb-6">
                    TechPulse — a watchlist eléréséhez jelentkezz be
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
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? "Bejelentkezés..." : "Bejelentkezés"}
                    </button>
                </form>

                <p className="text-xs text-tp-muted mt-6 text-center">
                    Nincs még fiókod?{" "}
                    <Link href="/register" className="text-tp-accent hover:underline">
                        Regisztráció
                    </Link>
                </p>

                <p className="text-xs text-tp-muted mt-3 text-center">
                    <Link href="/" className="hover:text-tp-sec">
                        ← Vissza vendégként
                    </Link>
                </p>
            </div>
        </div>
    );
}