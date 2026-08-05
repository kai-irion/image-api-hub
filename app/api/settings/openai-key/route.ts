import { NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey || apiKey.length < 10) {
    return NextResponse.json({ error: "Enter a valid OpenAI API key." }, { status: 400 });
  }

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      openai_api_key_encrypted: encrypt(apiKey),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: "Failed to save the key." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { error } = await supabase.from("user_settings").delete().eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to remove the key." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
