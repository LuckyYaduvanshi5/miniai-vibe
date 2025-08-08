import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { z } from "zod";

const BodySchema = z
  .object({
    email: z.string().email().optional(),
  })
  .optional();

export async function POST(req: Request) {
  try {
    // Optional: simple header-based auth. If INNGEST_JOB_TOKEN is set, require matching header.
    const requiredToken = process.env.INNGEST_JOB_TOKEN;
    if (requiredToken) {
      const provided = req.headers.get("x-job-token");
      if (!provided || provided !== requiredToken) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    // Validate body (email is optional)
    let email: string | undefined;
    try {
      const parsed = BodySchema.parse(await req.json().catch(() => undefined));
      email = parsed?.email;
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Send an event that triggers the existing `helloWorld` function
    await inngest.send({
      name: "test/hello.world",
      data: { email: email ?? "anon@example.com" },
    });

    // Accepted for background processing
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (err) {
    // Avoid logging PII
    console.error("Failed to queue job");
    return NextResponse.json({ ok: false, error: "Failed to queue job" }, { status: 500 });
  }
}
