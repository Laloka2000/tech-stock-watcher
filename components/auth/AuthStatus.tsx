"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/clients";

export function AuthStatus() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    if (loading) {
        return <div className="h-7 w-20 bg-tp-border rounded animate-pulse" />;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="text-xs font-mono text-tp-sec hover:text-tp-accent border border-tp-border hover:border-tp-accent/40 rounded-lg px-3 py-1.5 transition-colors"
            >
                Bejelentkezés
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-tp-muted font-mono hidden sm:inline">
                {user.email}
            </span>
            <button
                onClick={handleSignOut}
                className="text-xs font-mono text-tp-sec hover:text-tp-red border border-tp-border hover:border-tp-red/40 rounded-lg px-3 py-1.5 transition-colors"
            >
                Kijelentkezés
            </button>
        </div>
    );
}