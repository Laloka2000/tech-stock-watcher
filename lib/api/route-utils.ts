import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const NO_STORE = { "Cache-Control": "private, no-store" };

export function json(body: unknown, status = 200)
{
    return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function getAuthedClient()
{
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user };
}