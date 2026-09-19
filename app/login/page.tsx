"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/clients";
import { ArrowLeftIcon } from "@/components/ui/icons";

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
        <div className="flex h-screen items-center justify-center bg-tp-paper px-4">
            <div className="w-full max-w-sm bg-tp-surf border border-tp-line rounded-sm p-8">
                <h1 className="font-serif text-xl font-semibold text-tp-ink mb-1">
                    Bejelentkezés
                </h1>
                <p className="text-[13px] text-tp-ink2 mb-6">
                    TechPulse — a watchlist eléréséhez jelentkezz be
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
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? "Bejelentkezés..." : "Bejelentkezés"}
                    </button>
                </form>

                <p className="text-[13px] text-tp-ink2 mt-6 text-center">
                    Nincs még fiókod?{" "}
                    <Link href="/register" className="text-tp-teal hover:underline">
                        Regisztráció
                    </Link>
                </p>

                <p className="text-[13px] text-tp-ink2 mt-3 text-center">
                    <Link href="/" className="inline-flex items-center gap-1.5 hover:text-tp-ink">
                        <ArrowLeftIcon size={12} /> Vissza vendégként
                    </Link>
                </p>
            </div>
        </div>
    );
}
