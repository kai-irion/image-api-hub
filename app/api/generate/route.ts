import { NextResponse } from "next/server";
import OpenAI from "openai";
import { decrypt } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MODEL = "gpt-image-2";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const image = formData.get("image");
  const chatId = formData.get("chatId");

  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
  }
  if (typeof chatId !== "string" || !chatId) {
    return NextResponse.json({ error: "A chat ID is required." }, { status: 400 });
  }

  const { data: chat } = await supabase
    .from("chats")
    .select("id, project_id")
    .eq("id", chatId)
    .maybeSingle();
  if (!chat) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  let effectivePrompt = prompt;
  if (chat.project_id) {
    const { data: project } = await supabase
      .from("projects")
      .select("instructions")
      .eq("id", chat.project_id)
      .maybeSingle();
    if (project?.instructions?.trim()) {
      effectivePrompt = `${project.instructions.trim()}\n\n${prompt}`;
    }
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("openai_api_key_encrypted")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.openai_api_key_encrypted) {
    return NextResponse.json(
      { error: "Add your OpenAI API key in Settings before generating images." },
      { status: 400 },
    );
  }

  let apiKey: string;
  try {
    apiKey = decrypt(settings.openai_api_key_encrypted);
  } catch {
    return NextResponse.json(
      { error: "Your stored OpenAI API key could not be read. Re-save it in Settings." },
      { status: 500 },
    );
  }

  const client = new OpenAI({ apiKey });

  try {
    const result =
      image instanceof File
        ? await client.images.edit({ model: MODEL, prompt: effectivePrompt, image })
        : await client.images.generate({ model: MODEL, prompt: effectivePrompt });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "OpenAI did not return any image data." },
        { status: 502 },
      );
    }

    const imagePath = `${user.id}/${chatId}/${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(imagePath, Buffer.from(b64, "base64"), { contentType: "image/png" });

    if (uploadError) {
      return NextResponse.json(
        { error: "Generated the image but failed to save it." },
        { status: 500 },
      );
    }

    const { data: signedUrlData } = await supabase.storage
      .from("generated-images")
      .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);

    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        role: "assistant",
        content: "Here's your image.",
        image_path: imagePath,
      })
      .select("id, content, created_at")
      .single();

    if (insertError || !message) {
      return NextResponse.json(
        { error: "Generated the image but failed to save the message." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: {
        id: message.id,
        role: "assistant",
        content: message.content,
        imageUrl: signedUrlData?.signedUrl ?? null,
      },
    });
  } catch (error) {
    const { message, status } = describeError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

function describeError(error: unknown): { message: string; status: number } {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 401:
        return { message: "Your stored OpenAI API key is invalid.", status: 502 };
      case 403:
        return {
          message:
            "This OpenAI organization isn't verified for image generation. Verify it at platform.openai.com/settings/organization/general.",
          status: 502,
        };
      case 429:
        return { message: "Rate limit reached. Try again in a moment.", status: 502 };
      default:
        return {
          message: error.message || "OpenAI returned an error while generating the image.",
          status: 502,
        };
    }
  }

  return { message: "Something went wrong generating the image.", status: 500 };
}
