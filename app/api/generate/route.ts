import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const MODEL = "gpt-image-2";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The server is not configured with an OpenAI API key." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const image = formData.get("image");

  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const result =
      image instanceof File
        ? await client.images.edit({ model: MODEL, prompt, image })
        : await client.images.generate({ model: MODEL, prompt });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "OpenAI did not return any image data." },
        { status: 502 },
      );
    }

    return NextResponse.json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (error) {
    const { message, status } = describeError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

function describeError(error: unknown): { message: string; status: number } {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 401:
        return { message: "The configured OpenAI API key is invalid.", status: 502 };
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
