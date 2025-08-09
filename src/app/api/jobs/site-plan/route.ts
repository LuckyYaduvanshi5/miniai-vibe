import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { z } from "zod";

const BodySchema = z.object({
  idea: z.string().min(3, "idea is too short"),
});

export async function POST(req: Request) {
  try {
    const requiredToken = process.env.INNGEST_JOB_TOKEN;
    if (requiredToken) {
      const provided = req.headers.get("x-job-token");
      if (!provided || provided !== requiredToken) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    await inngest.send({
      name: "ai/site.plan",
      data: { idea: parsed.data.idea },
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    console.error("Failed to queue site plan job");
    return NextResponse.json({ ok: false, error: "Failed to queue job" }, { status: 500 });
  }
}
